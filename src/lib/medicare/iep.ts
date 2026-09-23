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

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
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

export function calculateIep(birthDateIso: string, asOf = new Date()): IepResult {
  const birthDate = new Date(birthDateIso + "T12:00:00");
  if (Number.isNaN(birthDate.getTime())) {
    throw new Error("Enter a valid birth date.");
  }

  // Medicare age 65: IEP is 3 months before birth month, birth month, 3 months after.
  const sixtyFifth = new Date(
    birthDate.getFullYear() + 65,
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const birthMonthStart = startOfMonth(sixtyFifth);
  const birthMonthEnd = endOfMonth(sixtyFifth);
  const iepStart = startOfMonth(addMonths(sixtyFifth, -3));
  const iepEnd = endOfMonth(addMonths(sixtyFifth, 3));
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
    tips.push("If you wait until your birth month or later, Part B coverage can be delayed by 1–3 months.");
    tips.push(
      "Still working with qualifying employer coverage? You may be able to delay Part B without a penalty—confirm creditable coverage first."
    );
    nextTools.push(
      { href: "/tools/working-past-65", label: "Still working past 65?" },
      { href: "/tools/path-quiz", label: "Coverage path quiz" }
    );
  } else {
    tips.push("Enrolling in the first 3 months of your IEP usually gives the earliest Part B start date.");
    tips.push("If you wait until your birth month or later, Part B coverage can be delayed by 1–3 months.");
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
        : "Signing up in the first three months of the IEP typically starts Part B the month you turn 65 (rules can vary if your birthday is on the 1st).",
    tips,
    nextTools,
  };
}
