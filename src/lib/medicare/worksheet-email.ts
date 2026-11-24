/**
 * Worksheet email payload: validation, plain-text body, and recipient.
 * The production recipient is the agent mailbox. WORKSHEET_EMAIL_TO is a
 * non-production override and must stay unset on the live site.
 * Do not log return values from this module; they contain the worksheet.
 */

import { BRAND } from "../brand";
import { OFFICIAL_SOURCE_SENTENCE } from "./official";
import {
  emptyPrescription,
  emptyProvider,
  emptyWorksheet,
  type ClientWorksheet,
  type WorksheetPrescription,
  type WorksheetProvider,
} from "./client-worksheet";

export const DEFAULT_AGENT_EMAIL = "agent@freemedicaretools.com";
export const WORKSHEET_EMAIL_SUBJECT = "Medicare consult worksheet";
export const WORKSHEET_PDF_FILENAME = "medicare-worksheet.pdf";

export const WORKSHEET_CONSENT_VERSION = "fmt-worksheet-consent-v1";
export const WORKSHEET_CONSENT_TEXT =
  "I agree that Leo Adaoag, a licensed insurance agent with Guardian Benefits Group, may use what I share to compare Medicare plans for me, and may contact me about that by the email or phone number I gave. This is not an enrollment, and I don't have to buy anything.";

export const WorksheetEmailMessage = {
  sent: "Sent to Leo Adaoag at Guardian Benefits Group. The site did not keep a copy. Leo may contact you by the phone or email you gave.",
  consent: "Please check the box to agree before sending, or use Print / Save as PDF instead.",
  invalid: "Add your full name and a phone number, then try again.",
  tooLong: "Please shorten the worksheet and try again.",
  sensitive:
    "Remove any Medicare number or Social Security number, then try again. We don't collect those.",
  rate: "Too many send attempts. Please wait a few minutes and try again.",
  unavailable: "Email is not available right now. You can still use Print / Save as PDF.",
  failed: "We couldn't send the email. Please try again, or use Print / Save as PDF.",
  rejected: "We couldn't send that request. Refresh the page and try again.",
} as const;

export type MailEnv = Record<string, string | undefined>;

const LINE_LIMIT = {
  fullName: 120,
  preferredName: 80,
  phone: 40,
  email: 200,
  addressLine1: 160,
  addressLine2: 160,
  city: 80,
  state: 40,
  zip: 12,
  dateOfBirth: 40,
  county: 80,
  partBEffective: 40,
  currentCoverage: 80,
  preferredPharmacy: 160,
  preferredHospital: 160,
  travelMonths: 160,
  providerAccess: 160,
  caregiverName: 120,
  caregiverPhone: 40,
  completedAt: 160,
};

const NOTE_LIMIT = {
  otherCoverageNotes: 2000,
  notesForAgent: 4000,
};

const BOOLEAN_KEYS = [
  "travelsOutOfState",
  "tobaccoUse",
  "comfortableWithNetwork",
  "dualEligibleMedicaid",
  "hasVaBenefits",
] as const;

const MAX_PRESCRIPTIONS = 25;
const MAX_PROVIDERS = 25;

const SSN = /\b\d{3}-\d{2}-\d{4}\b|\b\d{3}\s+\d{2}\s+\d{4}\b/;
const MBI =
  /(?:^|[^A-Z0-9])[1-9][AC-HJKMNP-RT-Y][AC-HJKMNP-RT-Y0-9]\d-?[AC-HJKMNP-RT-Y][AC-HJKMNP-RT-Y0-9]\d-?[AC-HJKMNP-RT-Y]{2}\d{2}(?=$|[^A-Z0-9])/i;

export type WorksheetParseError = "invalid" | "tooLong" | "sensitive";

export type WorksheetParseResult =
  | { ok: true; data: ClientWorksheet }
  | { ok: false; error: WorksheetParseError };

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

/** Medicare numbers and SSNs are not collected. Phone numbers and dates do not match. */
export function hasSensitiveNumber(value: string): boolean {
  return SSN.test(value) || MBI.test(value.toUpperCase());
}

export function isHoneypot(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const value = (payload as { fmt_hp?: unknown }).fmt_hp;
  if (typeof value === "string") return value.trim() !== "";
  return value != null;
}

export function parseWorksheet(input: unknown): WorksheetParseResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "invalid" };
  }
  const raw = input as Record<string, unknown>;
  const data = emptyWorksheet();

  for (const key of Object.keys(LINE_LIMIT) as (keyof typeof LINE_LIMIT)[]) {
    const parsed = readText(raw[key], LINE_LIMIT[key], true);
    if (!parsed.ok) return parsed;
    data[key] = parsed.value;
  }
  for (const key of Object.keys(NOTE_LIMIT) as (keyof typeof NOTE_LIMIT)[]) {
    const parsed = readText(raw[key], NOTE_LIMIT[key], false);
    if (!parsed.ok) return parsed;
    data[key] = parsed.value;
  }
  for (const key of BOOLEAN_KEYS) {
    const parsed = readBoolean(raw[key]);
    if (!parsed.ok) return { ok: false, error: "invalid" };
    data[key] = parsed.value;
  }

  if (data.email && !isEmail(data.email)) return { ok: false, error: "invalid" };
  if (!data.fullName || phoneDigits(data.phone).length < 10) {
    return { ok: false, error: "invalid" };
  }

  const prescriptions = readPrescriptions(raw.prescriptions);
  if (!prescriptions.ok) return prescriptions;
  const providers = readProviders(raw.providers);
  if (!providers.ok) return providers;
  data.prescriptions = prescriptions.rows.length > 0 ? prescriptions.rows : [emptyPrescription()];
  data.providers = providers.rows.length > 0 ? providers.rows : [emptyProvider()];
  return { ok: true, data };
}

export function worksheetSummaryLines(data: ClientWorksheet): string[] {
  const rxs = data.prescriptions.filter(rxHasContent);
  const docs = data.providers.filter(providerHasContent);
  const lines = [
    `Prepared: ${show(data.completedAt)}`,
    "",
    "CONTACT",
    `Full legal name: ${show(data.fullName)}`,
    `Preferred name: ${show(data.preferredName)}`,
    `Phone: ${show(data.phone)}`,
    `Email: ${show(data.email)}`,
    `Street address: ${show(data.addressLine1)}`,
    `Apt / suite: ${show(data.addressLine2)}`,
    `City: ${show(data.city)}`,
    `State: ${show(data.state)}`,
    `ZIP: ${show(data.zip)}`,
    `County: ${show(data.county)}`,
    `Date of birth: ${show(data.dateOfBirth)}`,
    `Part B effective date: ${show(data.partBEffective)}`,
    "",
    "HOW YOU USE CARE",
    `Current coverage: ${show(data.currentCoverage)}`,
    `Other coverage notes: ${show(data.otherCoverageNotes)}`,
    `Preferred pharmacy: ${show(data.preferredPharmacy)}`,
    `Preferred hospital: ${show(data.preferredHospital)}`,
    `How you want to see doctors: ${show(data.providerAccess)}`,
    `Out of state 1+ months a year: ${yesNo(data.travelsOutOfState)}${travelDetail(data)}`,
    `Tobacco use in the last 12 months: ${yesNo(data.tobaccoUse)}`,
    `Comfortable using a doctor and hospital network: ${yesNo(data.comfortableWithNetwork)}`,
    `Also has Medicaid: ${yesNo(data.dualEligibleMedicaid)}`,
    `Has VA benefits: ${yesNo(data.hasVaBenefits)}`,
    `Caregiver / helper: ${show(data.caregiverName)}`,
    `Caregiver phone: ${show(data.caregiverPhone)}`,
    "",
    "PRESCRIPTIONS",
  ];
  if (rxs.length === 0) lines.push("Not provided");
  rxs.forEach((row, index) => {
    lines.push(
      `${index + 1}. ${show(row.name)} | ${show(row.dosage)} | ${show(row.frequency)} | ${row.genericsOk ? "Generic OK" : "Brand only"}`,
    );
  });
  lines.push("", "DOCTORS AND SPECIALISTS");
  if (docs.length === 0) lines.push("Not provided");
  for (const row of docs) {
    lines.push(
      `${show(row.name)} | ${show(row.practice)} | ${show(row.specialistType)} | ${show(row.address)} | ${keepLabel(row.mustKeep)}`,
    );
  }
  lines.push("", "NOTES", show(data.notesForAgent));
  return lines;
}

export function hasWorksheetConsent(payload: object): boolean {
  const record = payload as { consent?: unknown; consentVersion?: unknown };
  return record.consent === true && record.consentVersion === WORKSHEET_CONSENT_VERSION;
}

/** ISO-8601 UTC instant, the only consent timestamp the email records. */
export function consentRecordLines(consentAt: string): string[] {
  return [
    `Consent: ${WORKSHEET_CONSENT_VERSION} checked by the visitor at ${consentAt}. Consent text: "${WORKSHEET_CONSENT_TEXT}" Email and phone are not verified.`,
    "This worksheet is not a Scope of Appointment. Complete an SOA before discussing specific Medicare Advantage or Part D plans.",
  ];
}

export function worksheetEmailText(data: ClientWorksheet, env: MailEnv, consentAt: string): string {
  const lines = [
    ...consentRecordLines(consentAt),
    "",
    "MEDICARE CLIENT WORKSHEET",
    "",
    "The worksheet is included below and in the attached PDF.",
    `${BRAND.domain} does not store the worksheet or the PDF.`,
    "Do not include a Medicare number (MBI) or Social Security number.",
    "",
    ...worksheetSummaryLines(data),
    "",
    "Educational use only, not affiliated with or endorsed by the U.S. government or the federal Medicare program.",
    OFFICIAL_SOURCE_SENTENCE,
  ];
  if ((env.WORKSHEET_EMAIL_TO ?? "").trim() && previewOverrideAllowed(env)) {
    lines.splice(
      2,
      0,
      "",
      "Test delivery. This message was sent to the test inbox configured for this environment, not the production agent address.",
    );
  }
  return lines.join("\n");
}

export class MailConfigError extends Error {
  constructor() {
    super("mail_config");
    this.name = "MailConfigError";
  }
}

/** WORKSHEET_EMAIL_TO is set on a production process without the preview flag. */
export class RecipientOverrideError extends Error {
  constructor() {
    super("recipient_override_blocked");
    this.name = "RecipientOverrideError";
  }
}

/**
 * A personal or preview inbox is allowed only outside production, or when
 * WORKSHEET_EMAIL_PREVIEW=true is set on purpose. Production with
 * WORKSHEET_EMAIL_TO and no flag is refused, not silently redirected.
 */
export function previewOverrideAllowed(env: MailEnv): boolean {
  const override = (env.WORKSHEET_EMAIL_TO ?? "").trim();
  if (!override) return true;
  if (env.NODE_ENV !== "production") return true;
  return env.WORKSHEET_EMAIL_PREVIEW === "true";
}

export function smtpConfigured(env: MailEnv): boolean {
  return Boolean(env.SMTP_HOST?.trim() && env.SMTP_USER?.trim() && env.SMTP_PASSWORD);
}

/** Production default is the agent mailbox. WORKSHEET_EMAIL_TO is refused in production unless the preview flag is set. */
export function agentRecipient(env: MailEnv): string {
  const override = (env.WORKSHEET_EMAIL_TO ?? "").trim();
  if (override && !previewOverrideAllowed(env)) throw new RecipientOverrideError();
  const chosen = override || (env.WORKSHEET_AGENT_EMAIL ?? "").trim() || DEFAULT_AGENT_EMAIL;
  if (!isEmail(chosen)) throw new MailConfigError();
  return chosen;
}

export function agentFrom(env: MailEnv): string {
  const chosen = (env.WORKSHEET_EMAIL_FROM ?? "").trim() || (env.SMTP_USER ?? "").trim() || DEFAULT_AGENT_EMAIL;
  if (!isEmail(chosen)) throw new MailConfigError();
  return chosen;
}

function show(value: string): string {
  return value.trim() || "Not provided";
}

function yesNo(value: boolean | null): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not answered";
}

function travelDetail(data: ClientWorksheet): string {
  if (data.travelsOutOfState !== true || !data.travelMonths.trim()) return "";
  return ` (${data.travelMonths.trim()})`;
}

function keepLabel(value: boolean | null): string {
  if (value === true) return "Must keep";
  if (value === false) return "Flexible";
  return "Not answered";
}

function rxHasContent(row: WorksheetPrescription): boolean {
  return Boolean(row.name.trim() || row.dosage.trim() || row.frequency.trim());
}

function providerHasContent(row: WorksheetProvider): boolean {
  return Boolean(
    row.name.trim() || row.practice.trim() || row.specialistType.trim() || row.address.trim() || row.mustKeep !== null,
  );
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function cleanText(value: string, singleLine: boolean): string {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  const collapsed = singleLine ? normalized.replace(/\s+/g, " ") : normalized;
  return collapsed.trim();
}

function readText(
  value: unknown,
  max: number,
  singleLine: boolean,
): { ok: true; value: string } | { ok: false; error: WorksheetParseError } {
  if (value == null || value === "") return { ok: true, value: "" };
  if (typeof value !== "string") return { ok: false, error: "invalid" };
  const cleaned = cleanText(value, singleLine);
  if (cleaned.length > max) return { ok: false, error: "tooLong" };
  if (hasSensitiveNumber(cleaned)) return { ok: false, error: "sensitive" };
  return { ok: true, value: cleaned };
}

function readBoolean(value: unknown): { ok: true; value: boolean | null } | { ok: false } {
  if (value == null || value === "") return { ok: true, value: null };
  if (value === true || value === false) return { ok: true, value };
  return { ok: false };
}

function readPrescriptions(
  value: unknown,
): { ok: true; rows: WorksheetPrescription[] } | { ok: false; error: WorksheetParseError } {
  if (value == null) return { ok: true, rows: [] };
  if (!Array.isArray(value)) return { ok: false, error: "invalid" };
  if (value.length > MAX_PRESCRIPTIONS) return { ok: false, error: "tooLong" };
  const rows: WorksheetPrescription[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { ok: false, error: "invalid" };
    const row = item as Record<string, unknown>;
    const name = readText(row.name, 160, true);
    const dosage = readText(row.dosage, 80, true);
    const frequency = readText(row.frequency, 80, true);
    if (!name.ok) return name;
    if (!dosage.ok) return dosage;
    if (!frequency.ok) return frequency;
    rows.push({
      id: typeof row.id === "string" ? cleanText(row.id, true).slice(0, 40) : "rx",
      name: name.value,
      dosage: dosage.value,
      frequency: frequency.value,
      genericsOk: row.genericsOk === true,
    });
  }
  return { ok: true, rows };
}

function readProviders(
  value: unknown,
): { ok: true; rows: WorksheetProvider[] } | { ok: false; error: WorksheetParseError } {
  if (value == null) return { ok: true, rows: [] };
  if (!Array.isArray(value)) return { ok: false, error: "invalid" };
  if (value.length > MAX_PROVIDERS) return { ok: false, error: "tooLong" };
  const rows: WorksheetProvider[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { ok: false, error: "invalid" };
    const row = item as Record<string, unknown>;
    const name = readText(row.name, 160, true);
    const practice = readText(row.practice, 160, true);
    const specialistType = readText(row.specialistType, 80, true);
    const address = readText(row.address, 160, true);
    if (!name.ok) return name;
    if (!practice.ok) return practice;
    if (!specialistType.ok) return specialistType;
    if (!address.ok) return address;
    const mustKeep = readBoolean(row.mustKeep);
    if (!mustKeep.ok) return { ok: false, error: "invalid" };
    rows.push({
      id: typeof row.id === "string" ? cleanText(row.id, true).slice(0, 40) : "dr",
      name: name.value,
      practice: practice.value,
      specialistType: specialistType.value,
      address: address.value,
      mustKeep: mustKeep.value,
    });
  }
  return { ok: true, rows };
}
