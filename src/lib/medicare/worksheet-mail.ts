/**
 * SMTP send for the worksheet email.
 *
 * Set these on the Hostinger Node.js app (never in git):
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465
 *   SMTP_SECURE=true
 *   SMTP_USER=agent@freemedicaretools.com
 *   SMTP_PASSWORD=<mailbox password>
 *   WORKSHEET_EMAIL_FROM=agent@freemedicaretools.com
 *   WORKSHEET_AGENT_EMAIL=agent@freemedicaretools.com
 * WORKSHEET_EMAIL_TO must stay unset in production. Never point it at a
 * personal inbox for real worksheet information. A preview inbox is allowed
 * only when NODE_ENV is not production, or WORKSHEET_EMAIL_PREVIEW=true.
 *
 * Port 587 needs SMTP_SECURE=false. TLS 1.2 is required either way.
 * Do not set tls.rejectUnauthorized to false. Do not log mail objects.
 */

import { createTransport } from "nodemailer";
import type { ClientWorksheet } from "./client-worksheet";
import { renderWorksheetPdf } from "./worksheet-pdf";
import {
  agentFrom,
  agentRecipient,
  isEmail,
  MailConfigError,
  smtpConfigured,
  worksheetEmailText,
  WORKSHEET_EMAIL_SUBJECT,
  WORKSHEET_PDF_FILENAME,
  type MailEnv,
} from "./worksheet-email";

export type WorksheetMail = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  pdf: Buffer;
  filename: string;
  contentType: "application/pdf";
};

export function smtpTransportOptions(env: MailEnv) {
  const port = Number(env.SMTP_PORT);
  return {
    host: env.SMTP_HOST?.trim(),
    port: Number.isInteger(port) && port > 0 ? port : 465,
    secure: env.SMTP_SECURE !== "false",
    requireTLS: true,
    tls: { minVersion: "TLSv1.2" as const },
    auth: {
      user: env.SMTP_USER?.trim() ?? "",
      pass: env.SMTP_PASSWORD ?? "",
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 20_000,
  };
}

export async function buildWorksheetMail(
  data: ClientWorksheet,
  env: MailEnv,
  consentAt: string,
): Promise<WorksheetMail> {
  const to = agentRecipient(env);
  const from = agentFrom(env);
  const replyTo = isEmail(data.email) ? data.email : undefined;
  return {
    to,
    from,
    replyTo,
    subject: WORKSHEET_EMAIL_SUBJECT,
    text: worksheetEmailText(data, env, consentAt),
    pdf: await renderWorksheetPdf(data),
    filename: WORKSHEET_PDF_FILENAME,
    contentType: "application/pdf",
  };
}

export async function sendWorksheetMail(mail: WorksheetMail, env: MailEnv = process.env): Promise<void> {
  if (!smtpConfigured(env)) throw new MailConfigError();
  const transporter = createTransport(smtpTransportOptions(env));
  try {
    await transporter.sendMail({
      from: mail.from,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      attachments: [
        {
          filename: mail.filename,
          content: mail.pdf,
          contentType: mail.contentType,
        },
      ],
    });
  } finally {
    transporter.close();
  }
}
