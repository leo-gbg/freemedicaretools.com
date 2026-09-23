export type IepResult = {
  birthDate: Date;
  iepStart: Date;
  iepEnd: Date;
  birthMonthStart: Date;
  birthMonthEnd: Date;
  turned65On: Date;
  ageYears: number;
  monthsUntilStart: number;
  monthsUntilEnd: number;
  status: "upcoming" | "open" | "ended";
  earliestCoverageHint: string;
  tips: string[];
  nextTools: { href: string; label: string }[];
};

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Last instant of the calendar month, so the IEP stays open through that whole day. */
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Move by calendar months (day 1). Avoids Date overflow when the source day is 29–31. */
function shiftMonth(d: Date, deltaMonths: number): Date {
  const total = d.getFullYear() * 12 + d.getMonth() + deltaMonths;
  const year = Math.floor(total / 12);
  const month = total - year * 12;
  return new Date(year, month, 1);
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

function wholeYearsBetween(from: Date, to: Date): number {
  let years = to.getFullYear() - from.getFullYear();
  const beforeBirthday =
    to.getMonth() < from.getMonth() ||
    (to.getMonth() === from.getMonth() && to.getDate() < from.getDate());
  if (beforeBirthday) years -= 1;
  return years;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Build ISO yyyy-mm-dd from parts; returns null if invalid (e.g. Feb 31). */
export function toIsoDate(year: number, month: number, day: number): string | null {
  if (!year || !month || !day) return null;
  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function partBStartTip(birthdayOnFirst: boolean): string {
  const when = birthdayOnFirst
    ? "the month Medicare treats you as eligible (the month before a birthday on the 1st)"
    : "your birthday month";
  return `If you sign up during ${when} or in the last 3 months of your IEP, Part B starts on the first day of the next month.`;
}

function coverageHint(birthdayOnFirst: boolean): string {
  if (birthdayOnFirst) {
    return "Your birthday is on the 1st, so Medicare eligibility — and this 7-month window — starts the month before that birthday. Signing up in the first 3 months starts Part B in the eligibility month. Signing up during the eligibility month or the last 3 months starts Part B on the first day of the next month.";
  }
  return "Signing up in the first 3 months of your IEP starts Part B the month you turn 65. Signing up during your birthday month or the last 3 months starts Part B on the first day of the next month.";
}

export function calculateIep(birthDateIso: string, asOf = new Date()): IepResult {
  const birthDate = new Date(birthDateIso + "T12:00:00");
  if (Number.isNaN(birthDate.getTime())) {
    throw new Error("Enter a valid birth date.");
  }

  // Calendar 65th birthday. The 7-month IEP is centered on the Medicare eligibility
  // month: the birthday month, or the prior month when the birthday is the 1st
  // (SSA treats age as attained the day before the birthday).
  // Part B start, for signups on or after Jan 1, 2023: first 3 months of the IEP
  // → eligibility month; eligibility month or the last 3 months → the 1st of the
  // next month. Medicare.gov “When does Medicare coverage start?”; SSA 2023 IEP notice.
  const sixtyFifth = new Date(
    birthDate.getFullYear() + 65,
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const birthdayOnFirst = birthDate.getDate() === 1;
  const eligibilityMonth = birthdayOnFirst ? shiftMonth(sixtyFifth, -1) : startOfMonth(sixtyFifth);
  const birthMonthStart = eligibilityMonth;
  const birthMonthEnd = endOfMonth(eligibilityMonth);
  const iepStart = shiftMonth(eligibilityMonth, -3);
  const iepEnd = endOfMonth(shiftMonth(eligibilityMonth, 3));
  const ageYears = wholeYearsBetween(birthDate, asOf);

  let status: IepResult["status"] = "upcoming";
  if (asOf > iepEnd) status = "ended";
  else if (asOf >= iepStart) status = "open";

  const tips: string[] = [];
  const nextTools: IepResult["nextTools"] = [];

  if (status === "ended") {
    tips.push(
      `You turned 65 on ${formatLongDate(sixtyFifth)}. Your Initial Enrollment Period closed on ${formatLongDate(iepEnd)}.`
    );
    tips.push(
      "If you already have Medicare, use AEP (Oct 15–Dec 7) each year to review or change Advantage and Part D plans."
    );
    tips.push(
      "If you are in a Medicare Advantage plan, OEP (Jan 1–Mar 31) may allow one change."
    );
    tips.push(
      "If you never enrolled in Part B/D and delayed because of employer coverage, ask whether a Special Enrollment Period still applies—otherwise GEP (Jan 1–Mar 31) may be the path, often with late penalties."
    );
    nextTools.push(
      { href: "/tools/period-finder", label: "Which enrollment window am I in today?" },
      { href: "/tools/aep-checklist", label: "AEP annual review checklist" },
      { href: "/tools/penalty-estimator", label: "Late enrollment penalty estimator" }
    );
  } else if (status === "open") {
    tips.push("Your IEP is open now—this is the highest-leverage window for first-time Medicare decisions.");
    tips.push("Enrolling in the first 3 months of your IEP usually gives the earliest Part B start date.");
    tips.push(partBStartTip(birthdayOnFirst));
    tips.push(
      "Still working with qualifying employer coverage? You may be able to delay Part B without a penalty—confirm creditable coverage first."
    );
    nextTools.push(
      { href: "/tools/working-past-65", label: "Still working past 65?" },
      { href: "/tools/path-quiz", label: "Coverage path quiz" }
    );
  } else {
    tips.push("Enrolling in the first 3 months of your IEP usually gives the earliest Part B start date.");
    tips.push(partBStartTip(birthdayOnFirst));
    tips.push(
      "Still working with qualifying employer coverage? You may be able to delay Part B without a penalty—confirm creditable coverage first."
    );
    nextTools.push(
      { href: "/tools/working-past-65", label: "Still working past 65?" },
      { href: "/tools/path-quiz", label: "Coverage path quiz" }
    );
  }

  return {
    birthDate,
    iepStart,
    iepEnd,
    birthMonthStart,
    birthMonthEnd,
    turned65On: sixtyFifth,
    ageYears,
    monthsUntilStart: monthsBetween(asOf, iepStart),
    monthsUntilEnd: monthsBetween(asOf, iepEnd),
    status,
    earliestCoverageHint:
      status === "ended"
        ? "Your IEP is historical. The tools below help with current Medicare navigation (AEP, OEP, penalties)."
        : coverageHint(birthdayOnFirst),
    tips,
    nextTools,
  };
}
