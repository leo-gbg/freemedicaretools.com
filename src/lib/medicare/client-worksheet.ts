/**
 * Client Medicare consult worksheet.
 * Field keys stay stable for the print view and the JSON download.
 * Do not collect MBI / SSN.
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

/** Saved answers laid over a fresh worksheet, with at least one prescription and one provider row. */
export function restoreWorksheet(saved: Partial<ClientWorksheet> | null): ClientWorksheet {
  const base = emptyWorksheet();
  if (!saved) return base;
  const merged = { ...base, ...saved };
  return {
    ...merged,
    prescriptions:
      Array.isArray(saved.prescriptions) && saved.prescriptions.length > 0
        ? saved.prescriptions.map((row) => ({ ...emptyPrescription(), ...row }))
        : base.prescriptions,
    providers:
      Array.isArray(saved.providers) && saved.providers.length > 0
        ? saved.providers.map((row) => ({ ...emptyProvider(), ...row }))
        : base.providers,
  };
}

/** True when nothing has been typed or chosen yet. The print timestamp does not count. */
export function isWorksheetBlank(data: ClientWorksheet): boolean {
  const { prescriptions, providers, completedAt: _completedAt, ...fields } = data;
  void _completedAt;
  const fieldsBlank = Object.values(fields).every((value) =>
    typeof value === "string" ? value.trim() === "" : value === null
  );
  const rxBlank = prescriptions.every(
    (row) => !row.name.trim() && !row.dosage.trim() && !row.frequency.trim()
  );
  const providersBlank = providers.every(
    (row) =>
      !row.name.trim() &&
      !row.practice.trim() &&
      !row.specialistType.trim() &&
      !row.address.trim() &&
      row.mustKeep === null
  );
  return fieldsBlank && rxBlank && providersBlank;
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

/**
 * Local plain-text summary for a printout the person keeps.
 * Do not place this string in a mailto URL or email body.
 */
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
    "Local print summary only. Do not paste this into email.",
    "Do not include a Medicare number (MBI) or SSN."
  );

  return lines.join("\n");
}

/** This tab only (sessionStorage). Storage can be blocked, so failures are ignored. */
export function saveWorksheet(data: ClientWorksheet): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CLIENT_WORKSHEET_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage blocked or full. The form still works; it just won't survive a reload.
  }
}

export function clearWorksheet(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CLIENT_WORKSHEET_STORAGE_KEY);
  } catch {
    // Storage blocked. Nothing was saved, so there is nothing to clear.
  }
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
