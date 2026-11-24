/**
 * Request checks for Email to agent. Logs event names only — never the body,
 * the PDF, or addresses from the worksheet.
 */

import { createHash } from "node:crypto";
import type { ClientWorksheet } from "./client-worksheet";
import { resetRateLimits, takeRateLimit } from "./rate-limit";
import type { WorksheetMail } from "./worksheet-mail";
import {
  hasWorksheetConsent,
  isHoneypot,
  MailConfigError,
  parseWorksheet,
  RecipientOverrideError,
  smtpConfigured,
  WorksheetEmailMessage,
  type MailEnv,
} from "./worksheet-email";

export const WORKSHEET_IP_LIMIT = 5;
export const WORKSHEET_IP_WINDOW_MS = 15 * 60 * 1000;
export const WORKSHEET_PHONE_LIMIT = 5;
export const WORKSHEET_PHONE_WINDOW_MS = 60 * 60 * 1000;

export type WorksheetEmailResult = {
  status: number;
  body: { ok: boolean; message: string };
};

type LogFn = (event: string, extra?: { code?: string }) => void;

export function logWorksheetEvent(event: string, extra?: { code?: string }): void {
  const line: { event: string; code?: string } = { event };
  if (extra?.code) line.code = extra.code.replace(/[^\w.-]/g, "").slice(0, 40);
  console.info(JSON.stringify(line));
}

/**
 * Forwarded IP headers are ignored unless WORKSHEET_TRUST_PROXY=true.
 * Set that only when the host proxy replaces X-Forwarded-For, so a caller
 * cannot pick their own rate-limit bucket.
 */
export function clientAddress(headers: { get(name: string): string | null }, trustProxy: boolean): string {
  if (!trustProxy) return "untrusted";
  const forwarded = headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
  const cleaned = candidate.slice(0, 64).replace(/[^\w.:]/g, "");
  return cleaned || "unknown";
}

/** Localhost may use HTTP. Every other host must be HTTPS, including via the proxy proto. */
export function isSecureRequest(input: {
  protocol: string | null;
  forwardedProto: string | null;
  host: string | null;
}): boolean {
  const host = (input.host ?? "").replace(/:\d+$/, "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") return true;
  const forwarded = input.forwardedProto?.split(",")[0]?.trim().toLowerCase();
  if (forwarded === "https") return true;
  return (input.protocol ?? "").toLowerCase() === "https:";
}

export function isAllowedOrigin(origin: string | null, host: string | null, forwardedHost: string | null): boolean {
  if (!origin) return false;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = [host, forwardedHost?.split(",")[0]?.trim()]
    .filter((value): value is string => Boolean(value));
  return allowed.includes(originHost);
}

export async function handleWorksheetEmail(input: {
  payload: unknown;
  contentType: string | null;
  host: string | null;
  origin: string | null;
  forwardedHost: string | null;
  ip: string;
  secure: boolean;
  env: MailEnv;
  send: (mail: WorksheetMail) => Promise<void>;
  build: (data: ClientWorksheet, env: MailEnv, consentAt: string) => Promise<WorksheetMail>;
  now?: number;
  log?: LogFn;
}): Promise<WorksheetEmailResult> {
  const now = input.now ?? Date.now();
  const log = input.log ?? logWorksheetEvent;
  const trustProxy = input.env.WORKSHEET_TRUST_PROXY === "true";
  const ip = trustProxy ? input.ip.slice(0, 64) || "unknown" : "untrusted";

  if (ip !== "untrusted" && !takeRateLimit(`ip:${ip}`, now, WORKSHEET_IP_LIMIT, WORKSHEET_IP_WINDOW_MS)) {
    log("worksheet_email_rate_limited");
    return json(429, WorksheetEmailMessage.rate);
  }

  if (!isJson(input.contentType)) {
    log("worksheet_email_rejected");
    return json(415, WorksheetEmailMessage.rejected);
  }
  if (!input.secure) {
    log("worksheet_email_rejected");
    return json(403, WorksheetEmailMessage.rejected);
  }
  if (!isAllowedOrigin(input.origin, input.host, input.forwardedHost)) {
    log("worksheet_email_rejected");
    return json(403, WorksheetEmailMessage.rejected);
  }
  if (!input.payload || typeof input.payload !== "object" || Array.isArray(input.payload)) {
    log("worksheet_email_rejected");
    return json(400, WorksheetEmailMessage.rejected);
  }
  if (isHoneypot(input.payload)) {
    log("worksheet_email_spam");
    return json(200, WorksheetEmailMessage.sent);
  }
  if (!hasWorksheetConsent(input.payload)) {
    log("worksheet_email_rejected");
    return json(400, WorksheetEmailMessage.consent);
  }

  const parsed = parseWorksheet(worksheetFromPayload(input.payload));
  if (!parsed.ok) {
    log("worksheet_email_rejected");
    const message =
      parsed.error === "sensitive"
        ? WorksheetEmailMessage.sensitive
        : parsed.error === "tooLong"
          ? WorksheetEmailMessage.tooLong
          : WorksheetEmailMessage.invalid;
    return json(400, message);
  }

  const phoneKey = createHash("sha256").update(parsed.data.phone.replace(/\D/g, "")).digest("hex").slice(0, 16);
  if (!takeRateLimit(`phone:${phoneKey}`, now, WORKSHEET_PHONE_LIMIT, WORKSHEET_PHONE_WINDOW_MS)) {
    log("worksheet_email_rate_limited");
    return json(429, WorksheetEmailMessage.rate);
  }

  if (!smtpConfigured(input.env)) {
    log("worksheet_email_unconfigured");
    return json(503, WorksheetEmailMessage.unavailable);
  }

  try {
    const consentAt = new Date(now).toISOString();
    const mail = await input.build(parsed.data, input.env, consentAt);
    await input.send(mail);
    log("worksheet_email_sent");
    return json(200, WorksheetEmailMessage.sent);
  } catch (error) {
    if (error instanceof RecipientOverrideError) {
      log("worksheet_email_override_blocked");
      return json(503, WorksheetEmailMessage.unavailable);
    }
    if (error instanceof MailConfigError) {
      log("worksheet_email_unconfigured");
      return json(503, WorksheetEmailMessage.unavailable);
    }
    const code =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : "unknown";
    log("worksheet_email_failed", { code });
    return json(502, WorksheetEmailMessage.failed);
  }
}

export { resetRateLimits };

function worksheetFromPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  return (payload as { worksheet?: unknown }).worksheet ?? null;
}

function isJson(contentType: string | null): boolean {
  if (!contentType) return false;
  return contentType.split(";")[0]?.trim().toLowerCase() === "application/json";
}

function json(status: number, message: string, ok = status >= 200 && status < 300): WorksheetEmailResult {
  return { status, body: { ok, message } };
}
