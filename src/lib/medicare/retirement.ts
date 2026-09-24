/**
 * Dated estimate of the Part B and Part D windows after a planned last day of work.
 * Part B's 8-month Special Enrollment Period starts the month after the earlier of
 * the last day of work and the day employer coverage ends.
 * Part D is the two calendar months after the month drug coverage ends.
 */

export type CoverageEndChoice = "same-day" | "end-of-month" | "end-of-next-month" | "unsure";

export type RetirementTimeline = {
  lastDay: string;
  coverageEnd: string | null;
  earlierTrigger: string;
  partBStart: string;
  partBEnd: string;
  partDStart: string | null;
  partDEnd: string | null;
  coverageUncertain: boolean;
};

function parseIso(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function lastDayOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0);
}

export function coverageEndDate(lastDay: Date, choice: CoverageEndChoice): Date | null {
  if (choice === "unsure") return null;
  if (choice === "same-day") return lastDay;
  if (choice === "end-of-month") return lastDayOfMonth(lastDay.getFullYear(), lastDay.getMonth());
  return lastDayOfMonth(lastDay.getFullYear(), lastDay.getMonth() + 1);
}

function earlier(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

/** Eight calendar months beginning the month after `trigger`. */
export function partBWindow(trigger: Date): { start: string; end: string } {
  const start = new Date(trigger.getFullYear(), trigger.getMonth() + 1, 1);
  const end = lastDayOfMonth(start.getFullYear(), start.getMonth() + 7);
  return { start: toIso(start), end: toIso(end) };
}

/** Two full months after the month coverage ends. */
export function partDWindow(coverageEnd: Date): { start: string; end: string } {
  const start = new Date(coverageEnd.getFullYear(), coverageEnd.getMonth() + 1, 1);
  const end = lastDayOfMonth(start.getFullYear(), start.getMonth() + 1);
  return { start: toIso(start), end: toIso(end) };
}

export function retirementTimeline(
  lastDayIso: string,
  choice: CoverageEndChoice
): RetirementTimeline | null {
  const lastDay = parseIso(lastDayIso);
  if (!lastDay) return null;
  const coverageEnd = coverageEndDate(lastDay, choice);
  const trigger = coverageEnd ? earlier(lastDay, coverageEnd) : lastDay;
  const partB = partBWindow(trigger);
  const partD = coverageEnd ? partDWindow(coverageEnd) : null;
  return {
    lastDay: toIso(lastDay),
    coverageEnd: coverageEnd ? toIso(coverageEnd) : null,
    earlierTrigger: toIso(trigger),
    partBStart: partB.start,
    partBEnd: partB.end,
    partDStart: partD?.start ?? null,
    partDEnd: partD?.end ?? null,
    coverageUncertain: choice === "unsure",
  };
}
