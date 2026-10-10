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

/** Enrollment prompts folded into the worksheet. Keys stay stable in sessionStorage. */
export const NEXT_STEP_KEYS = [
  "iepDates",
  "partAbSignup",
  "medicareCard",
  "employerCreditable",
  "twoPaths",
  "medigapWindow",
  "listedPrescriptions",
  "partDOnTime",
  "listedDoctors",
  "irmaa",
  "extraHelp",
  "annualReview",
] as const;

export type NextStepKey = (typeof NEXT_STEP_KEYS)[number];

export type WorksheetNextSteps = Record<NextStepKey, boolean>;

export type NextStepLink = {
  href: string;
  /** Words shown on screen. Print uses the path for in-site tools. */
  label: string;
  external?: boolean;
};

/** One educational line. `link` sits in the sentence when `tail` is set, otherwise after a dot. */
export type NextStepPrompt = {
  key: NextStepKey;
  lead: string;
  link?: NextStepLink;
  tail?: string;
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
  nextSteps: WorksheetNextSteps;
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

export function emptyNextSteps(): WorksheetNextSteps {
  return {
    iepDates: false,
    partAbSignup: false,
    medicareCard: false,
    employerCreditable: false,
    twoPaths: false,
    medigapWindow: false,
    listedPrescriptions: false,
    partDOnTime: false,
    listedDoctors: false,
    irmaa: false,
    extraHelp: false,
    annualReview: false,
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
    nextSteps: emptyNextSteps(),
    completedAt: "",
  };
}

function restoreNextSteps(saved: Partial<WorksheetNextSteps> | undefined): WorksheetNextSteps {
  const steps = emptyNextSteps();
  if (!saved || typeof saved !== "object") return steps;
  for (const key of NEXT_STEP_KEYS) {
    steps[key] = saved[key] === true;
  }
  return steps;
}

/** `YYYY-MM-DD` from a date input, printed as `MM/DD/YYYY`. Other text is left as typed. */
export function formatWorksheetDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

/** Saved answers laid over a fresh worksheet, with at least one prescription and one provider row. */
export function restoreWorksheet(saved: Partial<ClientWorksheet> | null): ClientWorksheet {
  const base = emptyWorksheet();
  if (!saved) return base;
  const { prescriptions, providers, nextSteps, ...rest } = saved;
  const merged = { ...base, ...rest };
  return {
    ...merged,
    nextSteps: restoreNextSteps(nextSteps),
    prescriptions:
      Array.isArray(prescriptions) && prescriptions.length > 0
        ? prescriptions.map((row) => ({ ...emptyPrescription(), ...row }))
        : base.prescriptions,
    providers:
      Array.isArray(providers) && providers.length > 0
        ? providers.map((row) => ({ ...emptyProvider(), ...row }))
        : base.providers,
  };
}

/** True when nothing has been typed or chosen yet. The print timestamp does not count. */
export function isWorksheetBlank(data: ClientWorksheet): boolean {
  const { prescriptions, providers, nextSteps, completedAt: _completedAt, ...fields } = data;
  void _completedAt;
  const fieldsBlank = Object.values(fields).every((value) =>
    typeof value === "string" ? value.trim() === "" : value === null
  );
  const stepsBlank = !nextSteps || NEXT_STEP_KEYS.every((key) => nextSteps[key] !== true);
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
  return fieldsBlank && rxBlank && providersBlank && stepsBlank;
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

export const PART_AB_STEPS: NextStepPrompt[] = [
  {
    key: "iepDates",
    lead: "Know my Initial Enrollment Period dates",
    link: { href: "/tools/iep-timeline", label: "IEP timeline" },
  },
  {
    key: "partAbSignup",
    lead: "Signed up for Part A & B through Social Security (",
    link: { href: "https://www.ssa.gov/medicare/sign-up", label: "ssa.gov", external: true },
    tail: ") or confirmed auto-enrollment",
  },
  { key: "medicareCard", lead: "Have my Medicare card / Part B start date" },
];

export const EMPLOYER_STEPS: NextStepPrompt[] = [
  {
    key: "employerCreditable",
    lead: "Asked HR whether my employer coverage is creditable and how many employees it covers",
    link: { href: "/tools/working-past-65", label: "Working past 65" },
  },
];

export const PATH_STEPS: NextStepPrompt[] = [
  {
    key: "twoPaths",
    lead: "Understand the two paths: Original Medicare (+ Part D + optional Medigap) or Medicare Advantage",
  },
  {
    key: "medigapWindow",
    lead: "Know my 6-month Medigap Open Enrollment window",
    link: { href: "/tools/med-supp-compare", label: "Medigap guide" },
  },
];

export const COST_STEPS: NextStepPrompt[] = [
  {
    key: "irmaa",
    lead: "Checked whether income-based IRMAA surcharges may apply",
    link: { href: "/tools/irmaa-checker", label: "IRMAA checker" },
  },
  {
    key: "extraHelp",
    lead: "Checked Extra Help / Medicare Savings Programs if my budget is tight",
  },
];

export const PART_D_STEPS: NextStepPrompt[] = [
  { key: "listedPrescriptions", lead: "Listed all prescriptions with doses" },
  {
    key: "partDOnTime",
    lead: "Have creditable drug coverage or a plan to join Part D on time",
    link: { href: "/tools/penalty-estimator", label: "Late penalty estimator" },
  },
];

export const DOCTOR_STEPS: NextStepPrompt[] = [
  { key: "listedDoctors", lead: "Listed every doctor and pharmacy I want to keep" },
];

export const ANNUAL_STEPS: NextStepPrompt[] = [
  {
    key: "annualReview",
    lead: "Review my Annual Notice of Change between Oct 15 and Dec 7",
    link: { href: "/tools/aep-checklist", label: "AEP checklist" },
  },
];

export const ALL_NEXT_STEPS: NextStepPrompt[] = [
  ...PART_AB_STEPS,
  ...EMPLOYER_STEPS,
  ...PATH_STEPS,
  ...PART_D_STEPS,
  ...DOCTOR_STEPS,
  ...COST_STEPS,
  ...ANNUAL_STEPS,
];

/** One line of prompt copy, without the checkbox. In-site tools append their path. */
export function nextStepLine(prompt: NextStepPrompt): string {
  const link = prompt.link;
  if (!link) return prompt.lead;
  if (link.external) return `${prompt.lead}${link.label}${prompt.tail ?? ""}`;
  const tail = prompt.tail ?? "";
  return tail ? `${prompt.lead}${link.label}${tail}` : `${prompt.lead} · ${link.href}`;
}

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
    `DOB: ${formatWorksheetDate(data.dateOfBirth) || "—"}`,
    `County: ${data.county || "—"}`,
    "",
    "— PLAN CONTEXT —",
    `Part B effective: ${formatWorksheetDate(data.partBEffective) || "—"}`,
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

  lines.push("", "— NEXT STEPS —");
  for (const prompt of ALL_NEXT_STEPS) {
    lines.push(`${data.nextSteps[prompt.key] ? "[x]" : "[ ]"} ${nextStepLine(prompt)}`);
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
