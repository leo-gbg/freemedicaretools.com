import { buildWorksheetMail, sendWorksheetMail } from "@/lib/medicare/worksheet-mail";
import { clientAddress, handleWorksheetEmail } from "@/lib/medicare/worksheet-email-handler";
import { WorksheetEmailMessage } from "@/lib/medicare/worksheet-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 100_000;

export async function POST(request: Request) {
  const advertised = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(advertised) && advertised > MAX_BODY) {
    return Response.json({ ok: false, message: WorksheetEmailMessage.tooLong }, { status: 413 });
  }

  const text = await readLimited(request, MAX_BODY);
  if (text == null) {
    return Response.json({ ok: false, message: WorksheetEmailMessage.tooLong }, { status: 413 });
  }

  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  const result = await handleWorksheetEmail({
    payload,
    contentType: request.headers.get("content-type"),
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    ip: clientAddress(request.headers),
    env: process.env,
    build: buildWorksheetMail,
    send: (mail) => sendWorksheetMail(mail, process.env),
  });

  return Response.json(result.body, { status: result.status });
}

/** Stops reading once the body exceeds the cap so a large POST is not buffered. */
async function readLimited(request: Request, max: number): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  let total = 0;
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}
