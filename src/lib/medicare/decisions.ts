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
        ? "SEP timing is based on your coverage end date. Part B is usually 8 months. Part D is generally 2 full months after the month coverage ends. A gap of 63 days or more without creditable drug coverage can trigger the Part D late penalty. That 63-day gap is not the Part D enrollment window."
        : "Triggered by qualifying life events, not a fixed national shopping season.",
      // Medicare.gov: Part B SEP is 8 months after work or employer coverage ends, whichever is first.
      // Part D SEP after employer or creditable drug coverage ends is 2 full months after that month.
      // 63 days is the creditable-coverage gap that can trigger the Part D late penalty, not the SEP length.
      windowLabel:
        "Part B: usually 8 months, starting the month after you stop working or employer coverage ends, whichever comes first. Part D: generally 2 full months after the month employer or creditable drug coverage ends. A gap of 63 days or more in a row without creditable drug coverage can trigger the Part D late penalty. That 63-day gap is not the Part D enrollment window.",
      description:
        "Life events—leaving a job with group coverage, moving, Medicaid changes, Extra Help—can unlock enrollment outside AEP. After employer coverage ends, Part B and Part D use different clocks. Medicare.gov’s Special Enrollment Periods page is the official list.",
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
  needsSpecificDoctors: boolean;
  wantsNoReferral: boolean;
  okWithNetwork: boolean;
  prefersPlanSetCosts: boolean;
  wantsSeparateDrugPlan: boolean;
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

/**
 * Structural lean only: networks, referrals, how costs are organized, travel, and
 * whether drug coverage sits in the same plan. No benefit or premium scoring.
 */
export function scoreCoveragePath(a: PathAnswers): PathResult {
  let advantage = 0;
  let original = 0;

  if (a.travelOften) original += 2;
  else advantage += 1;

  if (a.needsSpecificDoctors) original += 2;

  if (a.wantsNoReferral) original += 2;
  else advantage += 1;

  if (a.okWithNetwork) advantage += 2;
  else original += 2;

  if (a.prefersPlanSetCosts) advantage += 2;
  else original += 2;

  if (a.wantsSeparateDrugPlan) original += 1;
  else advantage += 1;

  const scores = { advantage, original };
  const diff = advantage - original;
  if (Math.abs(diff) <= 1) {
    return {
      lean: "mixed",
      title: "Your answers use both structures",
      summary:
        "Original Medicare plus a Medigap policy generally lets you see any provider who accepts Medicare, usually without a referral, with a separate Part D plan for drugs. Medicare Advantage generally uses the plan’s network and referral rules, and the plan sets what you pay for covered services, including a yearly maximum.",
      nextSteps: [
        "List the doctors and prescriptions you want to keep.",
        "Read how networks, referrals, and enrollment timing differ, then look up your ZIP code on Medicare.gov’s Plan Finder.",
      ],
      ...scores,
    };
  }

  if (advantage > original) {
    return {
      lean: "advantage",
      title: "Your answers line up with how Medicare Advantage is structured",
      summary:
        "Medicare Advantage plans are private plans that provide Part A and Part B benefits. They usually use a network, may require a referral or prior authorization, and set what you pay for covered services, including a yearly maximum. Drug coverage is often in the same plan. Whether a doctor is in the network depends on the plan and your county.",
      nextSteps: [
        "Check whether your doctors and prescriptions appear in Medicare.gov’s Plan Finder for your ZIP code.",
        "You can generally join a Medicare Advantage Plan when you first get Medicare (your Initial Enrollment Period), during Open Enrollment from October 15 to December 7, or during a Special Enrollment Period.",
      ],
      ...scores,
    };
  }

  return {
    lean: "original-medigap",
    title: "Your answers line up with Original Medicare plus Medigap",
    summary:
      "Original Medicare (Part A and Part B) generally pays for care from any provider in the U.S. who accepts Medicare, usually without a referral. A Medigap policy helps pay costs Original Medicare leaves behind. Drug coverage is a separate Part D plan. Medigap letters are standardized.",
    nextSteps: [
      "Open the Medigap letter guide to see what each letter covers.",
      "Look up drug coverage for your prescriptions on Medicare.gov’s Plan Finder.",
      "Medigap is usually easiest to buy in the 6-month window that starts when you are 65 or older and enrolled in Part B.",
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
      title: "Delaying Part B may be OK, so confirm with your HR or benefits office",
      guidance: [
        "Many people with current employer coverage from a workplace with 20+ employees can delay Part B and enroll later using a Special Enrollment Period.",
        "Ask your benefits team for a creditable coverage letter—especially for prescription drugs.",
        a.wantsHsa
          ? "If you enroll in Part A, you generally cannot keep contributing to an HSA. Talk with payroll/benefits before filing for Part A."
          : "You can often take premium-free Part A while delaying Part B—confirm how that interacts with your group plan.",
      ],
      watchouts: [
        "COBRA, retiree coverage, and individual marketplace plans usually do not protect you from Part B late penalties the same way active employer coverage does.",
        "When employment or group coverage ends, note the date. Your Special Enrollment Period is based on it.",
        ...EMPLOYER_SIZE_WATCHOUTS,
      ],
    };
  }

  return {
    canLikelyDelayPartB: false,
    title: "Delaying Part B may be risky in your situation",
    guidance: [
      "If you lack qualifying current employer coverage (or the employer has fewer than 20 employees), delaying Part B can trigger coverage gaps and late enrollment penalties that usually last as long as you have Part B or Part D.",
      "Signing up during your Initial Enrollment Period around age 65 generally avoids a Part B late penalty and coverage gaps.",
      "If you already passed your IEP, look at GEP (Jan–Mar) or whether any SEP still applies.",
    ],
    watchouts: [
      "Other insurance does not always let you delay Part B without a penalty. Confirm in writing.",
      "Get a written benefits determination before you intentionally skip Part B.",
      ...EMPLOYER_SIZE_WATCHOUTS,
    ],
  };
}
