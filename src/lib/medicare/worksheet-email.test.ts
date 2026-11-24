import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { emptyWorksheet, type ClientWorksheet } from "./client-worksheet.ts";
import { buildWorksheetMail, smtpTransportOptions } from "./worksheet-mail.ts";
import {
  DEFAULT_AGENT_EMAIL,
  hasSensitiveNumber,
  parseWorksheet,
  WORKSHEET_CONSENT_TEXT,
  WORKSHEET_CONSENT_VERSION,
  worksheetEmailText,
  worksheetSummaryLines,
  WORKSHEET_EMAIL_SUBJECT,
  WORKSHEET_PDF_FILENAME,
  WorksheetEmailMessage,
} from "./worksheet-email.ts";
import {
  clientAddress,
  handleWorksheetEmail,
  isSecureRequest,
  logWorksheetEvent,
  resetRateLimits,
  WORKSHEET_PHONE_LIMIT,
  WORKSHEET_UNTRUSTED_LIMIT,
} from "./worksheet-email-handler.ts";
import type { WorksheetMail } from "./worksheet-mail.ts";

function sampleWorksheet(): ClientWorksheet {
  const data = emptyWorksheet();
  data.fullName = "Jordan Q Sample";
  data.preferredName = "Jordan";
  data.phone = "(555) 010-0199";
  data.email = "jordan.sample@example.com";
  data.addressLine1 = "123 Example Ave";
  data.addressLine2 = "Apt 4";
  data.city = "Las Vegas";
  data.state = "NV";
  data.zip = "89101";
  data.county = "Clark";
  data.dateOfBirth = "1955-06-15";
  data.partBEffective = "2024-07-01";
  data.currentCoverage = "Original Medicare only";
  data.otherCoverageNotes = "Spouse plan ended last year";
  data.preferredPharmacy = "Example Pharmacy";
  data.preferredHospital = "Example Hospital";
  data.travelsOutOfState = true;
  data.travelMonths = "March, Arizona";
  data.tobaccoUse = false;
  data.comfortableWithNetwork = true;
  data.providerAccess = "A network of doctors and hospitals is fine";
  data.dualEligibleMedicaid = false;
  data.hasVaBenefits = false;
  data.caregiverName = "Casey Sample";
  data.caregiverPhone = "(555) 010-0177";
  data.notesForAgent = "Fake test worksheet. No real client.";
  data.completedAt = "November 24, 2026 at 1:00 AM";
  data.prescriptions = [
    { id: "rx-1", name: "Examplevastatin", dosage: "10 mg", frequency: "once daily", genericsOk: true },
    { id: "rx-2", name: "Pretendpril", dosage: "5 mg", frequency: "twice daily", genericsOk: false },
  ];
  data.providers = [
    {
      id: "dr-1",
      name: "Dr. Pat Example",
      practice: "Example Clinic",
      specialistType: "PCP",
      address: "Las Vegas",
      mustKeep: true,
    },
  ];
  return data;
}

const CONSENT_AT = "2026-11-24T01:00:00.000Z";

const configured = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "465",
  SMTP_SECURE: "true",
  SMTP_USER: "agent@freemedicaretools.com",
  SMTP_PASSWORD: "not-a-real-password",
  WORKSHEET_EMAIL_FROM: "agent@freemedicaretools.com",
};

function request(data: ClientWorksheet, env: Record<string, string | undefined>, ip = "203.0.113.10") {
  const sent: WorksheetMail[] = [];
  const events: string[] = [];
  return {
    sent,
    events,
    run: (overrides?: {
      origin?: string;
      contentType?: string | null;
      honeypot?: string;
      ip?: string;
      consent?: boolean;
      consentVersion?: string;
      omitConsent?: boolean;
      secure?: boolean;
    }) =>
      handleWorksheetEmail({
        payload: {
          worksheet: data,
          fmt_hp: overrides?.honeypot ?? "",
          ...(overrides?.omitConsent
            ? {}
            : {
                consent: overrides?.consent ?? true,
                consentVersion: overrides?.consentVersion ?? WORKSHEET_CONSENT_VERSION,
              }),
        },
        contentType: overrides && "contentType" in overrides ? overrides.contentType ?? null : "application/json",
        host: "127.0.0.1:43127",
        origin: overrides?.origin ?? "http://127.0.0.1:43127",
        forwardedHost: null,
        ip: overrides?.ip ?? ip,
        secure: overrides?.secure ?? true,
        env,
        build: (worksheet, mailEnv, consentAt) => buildWorksheetMail(worksheet, mailEnv, consentAt),
        send: async (mail) => {
          sent.push(mail);
        },
        log: (event, extra) => {
          events.push(JSON.stringify({ event, code: extra?.code }));
        },
      }),
  };
}

describe("worksheet email payload", () => {
  it("does not hardcode a personal test inbox", () => {
    const sources = [
      "worksheet-email.ts",
      "worksheet-mail.ts",
      "worksheet-pdf.ts",
      "worksheet-email-handler.ts",
    ];
    for (const name of sources) {
      const source = readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
      assert.equal(source.includes("gmail.com"), false, name);
      assert.equal(source.includes("leopoldo"), false, name);
    }
  });

  it("puts every field in the body and attaches the PDF for the agent mailbox", async () => {
    const data = sampleWorksheet();
    const mail = await buildWorksheetMail(data, configured, CONSENT_AT);
    assert.equal(mail.to, DEFAULT_AGENT_EMAIL);
    assert.equal(mail.from, "agent@freemedicaretools.com");
    assert.equal(mail.replyTo, "jordan.sample@example.com");
    assert.equal(mail.subject, WORKSHEET_EMAIL_SUBJECT);
    assert.equal(mail.filename, WORKSHEET_PDF_FILENAME);
    assert.equal(mail.contentType, "application/pdf");
    assert.equal(mail.pdf.subarray(0, 5).toString(), "%PDF-");
    for (const line of worksheetSummaryLines(data)) {
      if (!line) continue;
      assert.ok(mail.text.includes(line), `missing email line: ${line}`);
    }
    assert.ok(
      mail.text.startsWith(
        `Consent: ${WORKSHEET_CONSENT_VERSION} checked by the visitor; request received at ${CONSENT_AT}.`,
      ),
    );
    assert.ok(mail.text.includes(`Consent text: "${WORKSHEET_CONSENT_TEXT}"`));
    assert.ok(mail.text.includes("Email and phone are not verified."));
    assert.ok(
      mail.text.includes(
        "This worksheet is not a Scope of Appointment. Complete an SOA before discussing specific Medicare Advantage or Part D plans.",
      ),
    );
    assert.equal(mail.text.includes("Test delivery."), false);
    assert.ok(mail.text.includes("Examplevastatin"));
    assert.ok(mail.text.includes("Pretendpril"));
    assert.ok(mail.text.includes("Brand only"));
    assert.ok(mail.text.includes("Dr. Pat Example"));
    assert.ok(mail.text.includes("Must keep"));
  });

  it("sends the override recipient only when WORKSHEET_EMAIL_TO is set", async () => {
    const data = sampleWorksheet();
    const mail = await buildWorksheetMail(
      data,
      {
        ...configured,
        WORKSHEET_EMAIL_TO: "preview-inbox@example.com",
      },
      CONSENT_AT,
    );
    assert.equal(mail.to, "preview-inbox@example.com");
    assert.ok(mail.text.startsWith("Consent:"));
    assert.ok(mail.text.includes("Test delivery."));
    assert.ok(mail.text.includes("Jordan Q Sample"));
    assert.equal(worksheetEmailText(data, {}, CONSENT_AT).includes("preview-inbox@example.com"), false);
  });
});

describe("worksheet validation", () => {
  it("rejects Medicare numbers and Social Security numbers without flagging a phone or date", () => {
    assert.equal(hasSensitiveNumber("123-45-6789"), true);
    assert.equal(hasSensitiveNumber("123 45 6789"), true);
    assert.equal(hasSensitiveNumber("1EG4-TE5-MK73"), true);
    assert.equal(hasSensitiveNumber("(555) 010-0199"), false);
    assert.equal(hasSensitiveNumber("1955-06-15"), false);
    assert.equal(hasSensitiveNumber("89101"), false);
    const withSsn = parseWorksheet({ ...sampleWorksheet(), notesForAgent: "Please ignore 123-45-6789" });
    assert.equal(withSsn.ok, false);
    if (!withSsn.ok) assert.equal(withSsn.error, "sensitive");
  });

  it("requires a name and a 10-digit phone", () => {
    const missing = parseWorksheet({ ...sampleWorksheet(), fullName: "  ", phone: "555-0100" });
    assert.equal(missing.ok, false);
  });
});

describe("handleWorksheetEmail", { concurrency: false }, () => {
  it("sends the sanitized worksheet and does not log the contents", async () => {
    resetRateLimits();
    const data = sampleWorksheet();
    const call = request(data, configured, "203.0.113.20");
    const result = await call.run();
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(result.body.message, WorksheetEmailMessage.sent);
    assert.equal(call.sent.length, 1);
    assert.equal(call.sent[0].to, DEFAULT_AGENT_EMAIL);
    assert.equal(call.sent[0].subject, WORKSHEET_EMAIL_SUBJECT);
    assert.ok(call.sent[0].text.includes("Jordan Q Sample"));
    assert.ok(call.sent[0].text.includes("Examplevastatin"));
    assert.equal(call.sent[0].pdf.subarray(0, 5).toString(), "%PDF-");
    const logged = call.events.join("\n");
    assert.ok(logged.includes("worksheet_email_sent"));
    assert.equal(logged.includes("Jordan"), false);
    assert.equal(logged.includes("Examplevastatin"), false);
    assert.equal(logged.includes("not-a-real-password"), false);
    assert.equal(logged.includes("jordan.sample@example.com"), false);
  });

  it("refuses to send when SMTP is not configured", async () => {
    resetRateLimits();
    const call = request(sampleWorksheet(), {}, "203.0.113.21");
    const result = await call.run();
    assert.equal(result.status, 503);
    assert.equal(result.body.message, WorksheetEmailMessage.unavailable);
    assert.equal(call.sent.length, 0);
    assert.ok(call.events.join("\n").includes("worksheet_email_unconfigured"));
  });

  it("does not send a worksheet that contains a Social Security number", async () => {
    resetRateLimits();
    const data = sampleWorksheet();
    data.notesForAgent = "SSN 123-45-6789";
    const call = request(data, configured, "203.0.113.22");
    const result = await call.run();
    assert.equal(result.status, 400);
    assert.equal(result.body.message, WorksheetEmailMessage.sensitive);
    assert.equal(call.sent.length, 0);
    assert.equal(call.events.join("\n").includes("123-45-6789"), false);
  });

  it("drops a filled honeypot without sending", async () => {
    resetRateLimits();
    const call = request(sampleWorksheet(), configured, "203.0.113.23");
    const result = await call.run({ honeypot: "https://spam.example" });
    assert.equal(result.status, 200);
    assert.equal(call.sent.length, 0);
    assert.ok(call.events.join("\n").includes("worksheet_email_spam"));
  });

  it("rejects a cross-origin post", async () => {
    resetRateLimits();
    const call = request(sampleWorksheet(), configured, "203.0.113.24");
    const result = await call.run({ origin: "https://evil.example" });
    assert.equal(result.status, 403);
    assert.equal(call.sent.length, 0);
  });

  it("rate limits repeated sends for one phone even when the address changes", async () => {
    resetRateLimits();
    const data = sampleWorksheet();
    for (let count = 0; count < WORKSHEET_PHONE_LIMIT; count += 1) {
      const call = request(data, configured, `203.0.113.${count + 1}`);
      const result = await call.run();
      assert.equal(result.status, 200);
    }
    const blocked = request(data, configured, "198.51.100.40");
    const result = await blocked.run();
    assert.equal(result.status, 429);
    assert.equal(result.body.message, WorksheetEmailMessage.rate);
    assert.equal(blocked.sent.length, 0);
  });

  it("caps sends site-wide when the client IP is not trusted", async () => {
    resetRateLimits();
    for (let count = 0; count < WORKSHEET_UNTRUSTED_LIMIT; count += 1) {
      const call = request(sampleWorksheet(), configured, `198.51.100.${count % 200}`);
      const result = await call.run({ omitConsent: true });
      assert.equal(result.status, 400);
      assert.equal(call.sent.length, 0);
    }
    const blocked = request({ ...sampleWorksheet(), phone: "(555) 010-0101" }, configured, "203.0.113.200");
    const result = await blocked.run({ omitConsent: true });
    assert.equal(result.status, 429);
    assert.equal(result.body.message, WorksheetEmailMessage.rate);
    assert.equal(blocked.sent.length, 0);
  });

  it("rejects a send that does not include consent", async () => {
    resetRateLimits();
    const missing = request(sampleWorksheet(), configured, "203.0.113.50");
    const missingResult = await missing.run({ omitConsent: true });
    assert.equal(missingResult.status, 400);
    assert.equal(missingResult.body.message, WorksheetEmailMessage.consent);
    assert.equal(missing.sent.length, 0);

    const unchecked = request(sampleWorksheet(), configured, "203.0.113.51");
    const uncheckedResult = await unchecked.run({ consent: false });
    assert.equal(uncheckedResult.status, 400);
    assert.equal(uncheckedResult.body.message, WorksheetEmailMessage.consent);
    assert.equal(unchecked.sent.length, 0);
  });

  it("refuses a personal inbox override in production unless the preview flag is set", async () => {
    resetRateLimits();
    const blocked = request(
      sampleWorksheet(),
      { ...configured, NODE_ENV: "production", WORKSHEET_EMAIL_TO: "preview-inbox@example.com" },
      "203.0.113.60",
    );
    const blockedResult = await blocked.run();
    assert.equal(blockedResult.status, 503);
    assert.equal(blocked.sent.length, 0);
    const logged = blocked.events.join("\n");
    assert.ok(logged.includes("worksheet_email_override_blocked"));
    assert.equal(logged.includes("preview-inbox@example.com"), false);

    resetRateLimits();
    const allowed = request(
      sampleWorksheet(),
      {
        ...configured,
        NODE_ENV: "production",
        WORKSHEET_EMAIL_TO: "preview-inbox@example.com",
        WORKSHEET_EMAIL_PREVIEW: "true",
      },
      "203.0.113.61",
    );
    const allowedResult = await allowed.run();
    assert.equal(allowedResult.status, 200);
    assert.equal(allowed.sent[0]?.to, "preview-inbox@example.com");
  });

  it("ignores a spoofed forwarded IP unless the proxy flag is set, and requires HTTPS off localhost", () => {
    const headers = { get: (name: string) => (name === "x-forwarded-for" ? "203.0.113.9, 10.0.0.1" : null) };
    assert.equal(clientAddress(headers, false), "untrusted");
    assert.equal(clientAddress(headers, true), "203.0.113.9");
    assert.equal(isSecureRequest({ protocol: "http:", forwardedProto: null, host: "127.0.0.1:43127" }), true);
    assert.equal(isSecureRequest({ protocol: "http:", forwardedProto: "https", host: "freemedicaretools.com" }), true);
    assert.equal(isSecureRequest({ protocol: "https:", forwardedProto: null, host: "freemedicaretools.com" }), true);
    assert.equal(isSecureRequest({ protocol: "http:", forwardedProto: "http", host: "freemedicaretools.com" }), false);
  });

  it("requires TLS 1.2 and does not disable certificate checks", () => {
    const options = smtpTransportOptions(configured);
    assert.equal(options.requireTLS, true);
    assert.equal(options.tls.minVersion, "TLSv1.2");
    assert.equal(Object.hasOwn(options.tls, "rejectUnauthorized"), false);
    assert.equal(JSON.stringify(options).includes("rejectUnauthorized"), false);
  });

  it("rejects worksheet email that is not HTTPS", async () => {
    resetRateLimits();
    const call = request(sampleWorksheet(), configured, "203.0.113.70");
    const result = await call.run({ secure: false });
    assert.equal(result.status, 403);
    assert.equal(call.sent.length, 0);
  });

  it("logs an SMTP failure code without the error text", async () => {
    resetRateLimits();
    const lines: string[] = [];
    const original = console.info;
    console.info = (line?: unknown) => {
      lines.push(String(line));
    };
    try {
      logWorksheetEvent("worksheet_email_failed", { code: "EENVELOPE <smtp>" });
    } finally {
      console.info = original;
    }
    assert.equal(lines[0], '{"event":"worksheet_email_failed","code":"EENVELOPEsmtp"}');

    resetRateLimits();
    const data = sampleWorksheet();
    const events: string[] = [];
    const result = await handleWorksheetEmail({
      payload: { worksheet: data, fmt_hp: "", consent: true, consentVersion: WORKSHEET_CONSENT_VERSION },
      contentType: "application/json",
      host: "127.0.0.1:43127",
      origin: "http://127.0.0.1:43127",
      forwardedHost: null,
      ip: "203.0.113.40",
      secure: true,
      env: configured,
      build: (worksheet, env, consentAt) => buildWorksheetMail(worksheet, env, consentAt),
      send: async () => {
        const error = new Error("550 Jordan Q Sample rejected") as Error & { code?: string };
        error.code = "EENVELOPE";
        throw error;
      },
      log: (event, extra) => {
        events.push(JSON.stringify({ event, code: extra?.code }));
      },
    });
    assert.equal(result.status, 502);
    assert.equal(result.body.message, WorksheetEmailMessage.failed);
    assert.equal(result.body.message.includes("Jordan"), false);
    assert.ok(events.some((line) => line.includes("EENVELOPE")));
    assert.equal(events.join("\n").includes("Jordan"), false);
  });
});
