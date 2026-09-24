import {
  AEP,
  GEP,
  IRMAA_BRACKETS_2026,
  OEP,
  type FilingStatus,
  type IrmaaBracket,
} from "./constants";

export type CalendarStatus =
  | "open-now"
  | "upcoming"
  | "later"
  | "closed-until-next"
  | "personal";

export type PeriodMatch = {
  id: string;
  label: string;
  /** True when the user's answers match who this window is for. */
  fitsSituation: boolean;
  /** Whether the calendar window is open today (for fixed-date periods). */
  openNow: boolean;
  calendarStatus: CalendarStatus;
  calendarNote: string;
  /** Short badge text for the calendar chip (e.g. Upcoming · 2 mo, 14 days). */
  calendarBadge: string;
  windowLabel: string;
  description: string;
  whoItFits: string;
};

/** Show “Upcoming” starting this many months before the next open date. */
export const UPCOMING_LEAD_MONTHS = 3;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
}

/** Whole months + leftover days from `from` to `to` (both treated as dates). */
export function monthsAndDaysUntil(
  from: Date,
  to: Date
): { months: number; days: number; totalDays: number } {
  const start = startOfDay(from);
  const end = startOfDay(to);
  const totalDays = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 86_400_000)
  );

  if (end <= start) return { months: 0, days: 0, totalDays: 0 };

  let months = 0;
  let cursor = new Date(start);
  while (true) {
    const next = addMonths(cursor, 1);
    if (next <= end) {
      months += 1;
      cursor = next;
    } else {
      break;
    }
  }
  const days = Math.round((end.getTime() - cursor.getTime()) / 86_400_000);
  return { months, days, totalDays };
}

export function formatCountdown(months: number, days: number): string {
  const parts: string[] = [];
  if (months > 0) parts.push(`${months} mo`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  return parts.join(", ");
}

function nextWindowStart(
  asOf: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): { start: Date; end: Date; openNow: boolean } {
  const y = asOf.getFullYear();
  const startThisYear = new Date(y, startMonth, startDay);
  const endThisYear = new Date(y, endMonth, endDay, 23, 59, 59);
  const openNow = asOf >= startThisYear && asOf <= endThisYear;

  if (openNow || asOf < startThisYear) {
    return { start: startThisYear, end: endThisYear, openNow };
  }

  return {
    start: new Date(y + 1, startMonth, startDay),
    end: new Date(y + 1, endMonth, endDay, 23, 59, 59),
    openNow: false,
  };
}

function fixedWindowStatus(
  asOf: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
  windowLabel: string
): Pick<PeriodMatch, "openNow" | "calendarStatus" | "calendarNote" | "calendarBadge"> {
  const { start, end, openNow } = nextWindowStart(
    asOf,
    startMonth,
    startDay,
    endMonth,
    endDay
  );

  const openLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const openLong = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (openNow) {
    return {
      openNow: true,
      calendarStatus: "open-now",
      calendarBadge: "Open now",
      calendarNote: `Open now through ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
    };
  }

  const leadStarts = addMonths(start, -UPCOMING_LEAD_MONTHS);
  const { months, days } = monthsAndDaysUntil(asOf, start);
  const countdown = formatCountdown(months, days);

  if (asOf >= leadStarts && asOf < start) {
    return {
      openNow: false,
      calendarStatus: "upcoming",
      calendarBadge: `Upcoming · ${openLabel} · ${countdown}`,
      calendarNote: `Upcoming — opens ${openLong} (in ${countdown}). Window: ${windowLabel}. The Upcoming tag appears starting ${leadStarts.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (${UPCOMING_LEAD_MONTHS} months before).`,
    };
  }

  if (asOf < start) {
    return {
      openNow: false,
      calendarStatus: "later",
      calendarBadge: `Opens ${openLabel}`,
      calendarNote: `Next window opens ${openLong} (${windowLabel}). “Upcoming” highlighting begins ${leadStarts.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} — ${UPCOMING_LEAD_MONTHS} months before.`,
    };
  }

  // Past this year's window and not yet in the lead for next year
  return {
    openNow: false,
    calendarStatus: "closed-until-next",
    calendarBadge: "Closed for now",
    calendarNote: `This year’s window has closed. Next opens ${openLong}. “Upcoming” highlighting begins ${leadStarts.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
  };
}

export function findEnrollmentWindows(
  answers: {
    turning65Soon: boolean;
    alreadyOnMedicare: boolean;
    onAdvantage: boolean;
    missedIep: boolean;
    losingEmployerCoverage: boolean;
  },
  asOf = new Date()
): PeriodMatch[] {
  // On Advantage implies already enrolled in Medicare — AEP still applies.
  const hasMedicare = answers.alreadyOnMedicare || answers.onAdvantage;

  const aepCal = fixedWindowStatus(
    asOf,
    AEP.startMonth,
    AEP.startDay,
    AEP.endMonth,
    AEP.endDay,
    "October 15 – December 7"
  );
  const oepCal = fixedWindowStatus(
    asOf,
    OEP.startMonth,
    OEP.startDay,
    OEP.endMonth,
    OEP.endDay,
    "January 1 – March 31"
  );
  const gepCal = fixedWindowStatus(
    asOf,
    GEP.startMonth,
    GEP.startDay,
    GEP.endMonth,
    GEP.endDay,
    "January 1 – March 31"
  );

  const results: PeriodMatch[] = [
    {
      id: "iep",
      label: "Initial Enrollment Period (IEP)",
      fitsSituation: answers.turning65Soon,
      openNow: answers.turning65Soon,
      calendarStatus: "personal",
      calendarBadge: "Personal timing",
      calendarNote: answers.turning65Soon
        ? "Your IEP is personal—7 months around the month you turn 65. Use the IEP Timeline tool for exact dates."
        : "Tied to your 65th birthday month, not the calendar year.",
      windowLabel: "7 months around your 65th birthday month",
      description:
        "First chance to enroll in Part A, Part B, and usually Part D / Advantage / Medigap.",
      whoItFits: "People aging into Medicare for the first time.",
    },
    {
      id: "aep",
      label: AEP.label,
      fitsSituation: hasMedicare,
      ...aepCal,
      windowLabel: "October 15 – December 7 each year",
      description: AEP.description,
      whoItFits: "Anyone already with Medicare who wants to review or change coverage for next year.",
    },
    {
      id: "oep",
      label: OEP.label,
      fitsSituation: answers.onAdvantage,
      ...oepCal,
      windowLabel: "January 1 – March 31",
      description: OEP.description,
      whoItFits: "Current Medicare Advantage members only (one change).",
    },
    {
      id: "gep",
      label: GEP.label,
      fitsSituation: answers.missedIep,
      ...gepCal,
      windowLabel: "January 1 – March 31",
      description: GEP.description,
      whoItFits: "People who missed IEP and lack an SEP—often with late penalties.",
    },
    {
      id: "sep",
      label: "Special Enrollment Period (SEP)",
      fitsSituation: answers.losingEmployerCoverage,
      openNow: answers.losingEmployerCoverage,
      calendarStatus: "personal",
      calendarBadge: "Personal timing",
      calendarNote: answers.losingEmployerCoverage
        ? "SEP timing is based on your coverage end date—mark your calendar as soon as group coverage ends."
        : "Triggered by qualifying life events, not a fixed national shopping season.",
      windowLabel: "Usually 8 months after employer coverage ends (Part B) / 63 days for Part D",
      description:
        "Life events—leaving a job with group coverage, moving, Medicaid changes, Extra Help—can unlock enrollment outside AEP.",
      whoItFits: "People delaying Part B/D because of qualifying current employer coverage.",
    },
  ];

  return results;
}

export function lookupIrmaa(
  magi: number,
  filing: FilingStatus
): IrmaaBracket {
  const income = Math.max(0, magi);

  // Married filing separately: CMS compresses middle tiers.
  if (filing === "separate") {
    if (income >= 391000) return IRMAA_BRACKETS_2026[5];
    if (income > 109000) return IRMAA_BRACKETS_2026[4];
    return IRMAA_BRACKETS_2026[0];
  }

  for (const bracket of IRMAA_BRACKETS_2026) {
    const min = filing === "joint" ? bracket.jointMin : bracket.singleMin;
    const max = filing === "joint" ? bracket.jointMax : bracket.singleMax;
    if (bracket.id === "base") {
      if (income <= (max as number)) return bracket;
      continue;
    }
    if (max === null) {
      // CMS top tier starts at $500,000 / $750,000 inclusive.
      if (income >= min) return bracket;
      continue;
    }
    // The band under the top tier is "less than" that dollar, not "less than or equal."
    const underTopCliff = bracket.id === "tier4";
    if (income > min && (underTopCliff ? income < max : income <= max)) return bracket;
  }

  return IRMAA_BRACKETS_2026[IRMAA_BRACKETS_2026.length - 1];
}

export type PathAnswers = {
  travelOften: boolean;
  wantsLowPremium: boolean;
  needsSpecificDoctors: boolean;
  takesManyRx: boolean;
  wantsDentalVision: boolean;
  okWithReferrals: boolean;
};

export type PathResult = {
  lean: "advantage" | "original-medigap" | "mixed";
  title: string;
  summary: string;
  nextSteps: string[];
  /** Point totals already used to choose `lean`. Display only. */
  advantage: number;
  original: number;
};

export function scoreCoveragePath(a: PathAnswers): PathResult {
  let advantage = 0;
  let original = 0;

  if (a.wantsLowPremium) advantage += 2;
  if (a.wantsDentalVision) advantage += 2;
  if (a.okWithReferrals) advantage += 1;
  if (!a.travelOften) advantage += 1;

  if (a.travelOften) original += 2;
  if (a.needsSpecificDoctors) original += 2;
  if (a.takesManyRx) original += 1;
  if (!a.okWithReferrals) original += 1;
  if (!a.wantsLowPremium) original += 1;

  const scores = { advantage, original };
  const diff = advantage - original;
  if (Math.abs(diff) <= 1) {
    return {
      lean: "mixed",
      title: "Your answers point both ways",
      summary:
        "Budget extras (dental, vision, or a lower monthly premium) tug toward Medicare Advantage. Provider freedom and travel tug toward Original Medicare + Medigap + Part D. The right call usually needs a side-by-side of your doctors, drugs, and ZIP code.",
      nextSteps: [
        "List your doctors, hospitals, and top 5 prescriptions.",
        "Compare network fit vs. Medigap premium for your state.",
        "Request a free consult before your enrollment window closes.",
      ],
      ...scores,
    };
  }

  if (advantage > original) {
    return {
      lean: "advantage",
      title: "Your answers lean Medicare Advantage",
      summary:
        "You value extras and a lower monthly premium and are more open to plan networks and utilization rules. Advantage plans still vary widely by county—formulary and network checks matter.",
      nextSteps: [
        "Confirm each doctor and drug is in-network / on formulary.",
        "Compare max out-of-pocket and prior-authorization rules.",
        "Review again every AEP—benefits change yearly.",
      ],
      ...scores,
    };
  }

  return {
    lean: "original-medigap",
    title: "Your answers lean Original Medicare + Medigap",
    summary:
      "You prioritize seeing preferred providers, traveling, or avoiding referral friction. That path usually means Part A/B, a Medigap (supplement) plan, and separate Part D—higher premiums, more predictability.",
    nextSteps: [
      "Open the Medigap (Med-Supp) Plan Letter Guide to compare G vs N (and other letters).",
      "Shop Part D for your exact medications.",
      "Medigap is easiest at first eligibility—timing matters.",
    ],
    ...scores,
  };
}

const EMPLOYER_SIZE_WATCHOUTS = [
  "The “20 or more employees” box means the employer that provides the coverage. On a spouse’s plan, count that employer, not a different job.",
  "Medicare because of a disability usually uses a 100-employee rule, not 20. This check is the age-65 rule.",
  "Premium-free Part A can start up to six months retroactively. Contributions to an HSA in those months can become excess.",
];

export type WorkAnswers = {
  coveredByEmployer: boolean;
  employerHas20Plus: boolean;
  wantsHsa: boolean;
  spouseCovering: boolean;
};

export type WorkResult = {
  canLikelyDelayPartB: boolean;
  title: string;
  guidance: string[];
  watchouts: string[];
};

export function assessWorkingPast65(a: WorkAnswers): WorkResult {
  const canLikelyDelayPartB =
    (a.coveredByEmployer || a.spouseCovering) && a.employerHas20Plus;

  if (canLikelyDelayPartB) {
    return {
      canLikelyDelayPartB: true,
      title: "You may be able to delay Part B without a penalty",
      guidance: [
        "Many people with current employer coverage from a workplace with 20+ employees can delay Part B and enroll later using a Special Enrollment Period.",
        "Ask your benefits team for a creditable coverage letter—especially for prescription drugs.",
        a.wantsHsa
          ? "If you enroll in Part A, you generally cannot keep contributing to an HSA. Talk with payroll/benefits before filing for Part A."
          : "You can often take premium-free Part A while delaying Part B—confirm how that interacts with your group plan.",
      ],
      watchouts: [
        "COBRA, retiree coverage, and individual marketplace plans usually do not protect you from Part B late penalties the same way active employer coverage does.",
        "When employment (or group coverage) ends, mark your SEP calendar immediately.",
        ...EMPLOYER_SIZE_WATCHOUTS,
      ],
    };
  }

  return {
    canLikelyDelayPartB: false,
    title: "Delaying Part B may be risky in your situation",
    guidance: [
      "If you lack qualifying current employer coverage (or the employer has fewer than 20 employees), delaying Part B can trigger lifelong late enrollment penalties and coverage gaps.",
      "Your Initial Enrollment Period around age 65 is often the safest window to get Part B in force.",
      "If you already passed your IEP, look at GEP (Jan–Mar) or whether any SEP still applies.",
    ],
    watchouts: [
      "Assumptions about “I have other insurance” are one of the costliest turning-65 mistakes.",
      "Get a written benefits determination before you intentionally skip Part B.",
      ...EMPLOYER_SIZE_WATCHOUTS,
    ],
  };
}
