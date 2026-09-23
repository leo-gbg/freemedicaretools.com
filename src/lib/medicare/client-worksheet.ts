/**
 * Client Medicare consult worksheet — CRM-shaped payload.
 * Field keys are stable for future Kizen / CRM mapping.
 * Do not collect MBI / SSN here; agent gathers those securely later.
 */

export const CLIENT_WORKSHEET_STORAGE_KEY = "fmt-client-worksheet-v1";

export type WorksheetPrescription = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  genericsOk: boolean;
};

export type WorksheetProvider = {
  id: string;
  name: string;
  practice: string;
  specialistType: string;
  address: string;
  mustKeep: boolean | null;
};

export type ClientWorksheet = {
  /** CRM: contact */
  fullName: string;
  preferredName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  /** Plan-affecting context */
  county: string;
  partBEffective: string;
  currentCoverage: string;
  otherCoverageNotes: string;
  preferredPharmacy: string;
  preferredHospital: string;
  travelsOutOfState: boolean | null;
  travelMonths: string;
  tobaccoUse: boolean | null;
  wantsDentalVisionHearing: boolean | null;
  monthlyPremiumBudget: string;
  dualEligibleMedicaid: boolean | null;
  hasVaBenefits: boolean | null;
  caregiverName: string;
  caregiverPhone: string;
  notesForAgent: string;
  prescriptions: WorksheetPrescription[];
  providers: WorksheetProvider[];
  completedAt: string;
};

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyPrescription(): WorksheetPrescription {
  return {
    id: newId("rx"),
    name: "",
    dosage: "",
    frequency: "",
    genericsOk: true,
  };
}

export function emptyProvider(): WorksheetProvider {
  return {
    id: newId("dr"),
    name: "",
    practice: "",
    specialistType: "",
    address: "",
    mustKeep: null,
  };
}

export function emptyWorksheet(): ClientWorksheet {
  return {
    fullName: "",
    preferredName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    dateOfBirth: "",
    county: "",
    partBEffective: "",
    currentCoverage: "",
    otherCoverageNotes: "",
    preferredPharmacy: "",
    preferredHospital: "",
    travelsOutOfState: null,
    travelMonths: "",
    tobaccoUse: null,
    wantsDentalVisionHearing: null,
    monthlyPremiumBudget: "",
    dualEligibleMedicaid: null,
    hasVaBenefits: null,
    caregiverName: "",
    caregiverPhone: "",
    notesForAgent: "",
    prescriptions: [emptyPrescription()],
    providers: [emptyProvider()],
    completedAt: "",
  };
}

export const CURRENT_COVERAGE_OPTIONS = [
  "Not on Medicare yet",
  "Original Medicare only",
  "Original Medicare + Medigap",
  "Medicare Advantage (Part C)",
  "Employer / retiree coverage",
  "COBRA",
  "Medicaid / dual eligible",
  "VA / TriCare",
  "Other / not sure",
] as const;

/** Human-readable summary for mailto / CRM notes. */
export function worksheetToPlainText(data: ClientWorksheet): string {
  const yn = (v: boolean | null) =>
    v === true ? "Yes" : v === false ? "No" : "—";

  const lines: string[] = [
    "MEDICARE CLIENT WORKSHEET",
    `Prepared: ${data.completedAt || "—"}`,
    "",
    "— CONTACT —",
    `Name: ${data.fullName || "—"}`,
    `Preferred name: ${data.preferredName || "—"}`,
    `Phone: ${data.phone || "—"}`,
    `Email: ${data.email || "—"}`,
    `Address: ${[data.addressLine1, data.addressLine2].filter(Boolean).join(", ") || "—"}`,
    `City/State/ZIP: ${[data.city, data.state, data.zip].filter(Boolean).join(", ") || "—"}`,
    `DOB: ${data.dateOfBirth || "—"}`,
    `County: ${data.county || "—"}`,
    "",
    "— PLAN CONTEXT —",
    `Part B effective: ${data.partBEffective || "—"}`,
    `Current coverage: ${data.currentCoverage || "—"}`,
    `Other coverage notes: ${data.otherCoverageNotes || "—"}`,
    `Preferred pharmacy: ${data.preferredPharmacy || "—"}`,
    `Preferred hospital: ${data.preferredHospital || "—"}`,
    `Travels out of state: ${yn(data.travelsOutOfState)} ${data.travelMonths ? `(${data.travelMonths})` : ""}`,
    `Tobacco use: ${yn(data.tobaccoUse)}`,
    `Dental/vision/hearing priority: ${yn(data.wantsDentalVisionHearing)}`,
    `Monthly premium budget: ${data.monthlyPremiumBudget || "—"}`,
    `Medicaid dual eligible: ${yn(data.dualEligibleMedicaid)}`,
    `VA benefits: ${yn(data.hasVaBenefits)}`,
    `Caregiver: ${data.caregiverName || "—"} ${data.caregiverPhone ? `/ ${data.caregiverPhone}` : ""}`,
    "",
    "— PRESCRIPTIONS —",
  ];

  const rxs = data.prescriptions.filter((r) => r.name.trim());
  if (!rxs.length) lines.push("(none listed)");
  for (const rx of rxs) {
    lines.push(
      `• ${rx.name} | ${rx.dosage || "dose?"} | ${rx.frequency || "freq?"} | generics OK: ${rx.genericsOk ? "Yes" : "No"}`
    );
  }

  lines.push("", "— DOCTORS / PROVIDERS —");
  const docs = data.providers.filter((p) => p.name.trim() || p.practice.trim());
  if (!docs.length) lines.push("(none listed)");
  for (const p of docs) {
    lines.push(
      `• ${p.name || "Provider"} | ${p.practice || "—"} | ${p.specialistType || "PCP/general"} | must keep: ${yn(p.mustKeep)}`
    );
    if (p.address) lines.push(`  Address: ${p.address}`);
  }

  if (data.notesForAgent.trim()) {
    lines.push("", "— NOTES FOR AGENT —", data.notesForAgent.trim());
  }

  lines.push(
    "",
    "CRM payload: attach saved PDF + optional JSON export from FreeMedicareTools worksheet.",
    "Do not include MBI/SSN in email."
  );

  return lines.join("\n");
}

export function worksheetToCrmJson(data: ClientWorksheet): string {
  return JSON.stringify(
    {
      source: "FreeMedicareTools.com",
      form: "client_medicare_worksheet",
      version: 1,
      ...data,
    },
    null,
    2
  );
}

export function saveWorksheet(data: ClientWorksheet): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CLIENT_WORKSHEET_STORAGE_KEY, JSON.stringify(data));
}

export function loadWorksheet(): ClientWorksheet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CLIENT_WORKSHEET_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClientWorksheet;
  } catch {
    return null;
  }
}
