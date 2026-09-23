import { BRAND } from "@/lib/brand";
import { AEP } from "@/lib/medicare/constants";
import { getTool, type ToolMeta } from "@/lib/medicare/tools";

/** Visible stand-in. Not a real number and not a tel: link. */
export const PHONE_PLACEHOLDER = "[YOUR PHONE]";

export const TURNING_SLUGS = [
  "iep-timeline",
  "working-past-65",
  "path-quiz",
  "penalty-estimator",
] as const;

export const ENROLLED_SLUGS = [
  "period-finder",
  "aep-checklist",
  "irmaa-checker",
  "med-supp-compare",
] as const;

export function consultMailto(context?: string): string {
  const subject = encodeURIComponent(
    context ? `Free Medicare consult — ${context}` : "Book a free Medicare consult"
  );
  return `mailto:${BRAND.email}?subject=${subject}`;
}

export type AepPhase = {
  phase: "open" | "upcoming";
  days: number;
  headline: string;
  detail: string;
};

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000
  );
}

/** Days until AEP opens, or days left while it is open, from published AEP dates. */
export function aepCountdown(asOf = new Date()): AepPhase {
  const year = asOf.getFullYear();
  const start = new Date(year, AEP.startMonth, AEP.startDay);
  const end = new Date(year, AEP.endMonth, AEP.endDay);
  const today = startOfDay(asOf);

  if (today >= startOfDay(start) && today <= startOfDay(end)) {
    const days = daysBetween(asOf, end);
    return {
      phase: "open",
      days,
      headline: days === 1 ? "1 day left in AEP" : `${days} days left in AEP`,
      detail: "Open through December 7. Coverage changes usually start January 1.",
    };
  }

  const next =
    today < startOfDay(start) ? start : new Date(year + 1, AEP.startMonth, AEP.startDay);
  const days = daysBetween(asOf, next);
  return {
    phase: "upcoming",
    days,
    headline: days === 1 ? "AEP opens tomorrow" : `${days} days until AEP opens`,
    detail: "Annual Enrollment Period opens October 15 and runs through December 7.",
  };
}

/** December 7 for the AEP that is still ahead, or this year’s if it has not passed. */
export function nextAepEnd(asOf = new Date()): Date {
  const year = asOf.getFullYear();
  const end = new Date(year, AEP.endMonth, AEP.endDay);
  if (startOfDay(asOf) <= startOfDay(end)) return end;
  return new Date(year + 1, AEP.endMonth, AEP.endDay);
}

export function yearProgress(asOf = new Date()): number {
  const start = new Date(asOf.getFullYear(), 0, 1).getTime();
  const end = new Date(asOf.getFullYear() + 1, 0, 1).getTime();
  return Math.min(1, Math.max(0, (asOf.getTime() - start) / (end - start)));
}

export function downloadIcs(opts: { filename: string; title: string; start: Date; end: Date }) {
  const stamp = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  };
  const endExclusive = new Date(opts.end.getFullYear(), opts.end.getMonth(), opts.end.getDate() + 1);
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FreeMedicareTools//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${stamp(opts.start)}`,
    `DTEND;VALUE=DATE:${stamp(endExclusive)}`,
    `SUMMARY:${opts.title.replace(/[,;\\]/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = opts.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export type ToolPlacement = {
  groupLabel: string;
  index: number;
  total: number;
  next: ToolMeta | undefined;
};

export function toolPlacement(slug: string): ToolPlacement {
  const worksheet = getTool("client-worksheet");
  const turningIndex = TURNING_SLUGS.indexOf(slug as (typeof TURNING_SLUGS)[number]);
  if (turningIndex >= 0) {
    const nextSlug = TURNING_SLUGS[turningIndex + 1];
    return {
      groupLabel: "Turning 65",
      index: turningIndex + 1,
      total: TURNING_SLUGS.length,
      next: nextSlug ? getTool(nextSlug) : worksheet,
    };
  }
  const enrolledIndex = ENROLLED_SLUGS.indexOf(slug as (typeof ENROLLED_SLUGS)[number]);
  if (enrolledIndex >= 0) {
    const nextSlug = ENROLLED_SLUGS[enrolledIndex + 1];
    return {
      groupLabel: "Already on Medicare",
      index: enrolledIndex + 1,
      total: ENROLLED_SLUGS.length,
      next: nextSlug ? getTool(nextSlug) : worksheet,
    };
  }
  return {
    groupLabel: "Before a consult",
    index: 0,
    total: 0,
    next: getTool(TURNING_SLUGS[0]),
  };
}

export const fieldClass =
  "flex min-h-12 w-full rounded-xl border border-[var(--brand-input)] bg-white px-3 text-base text-[var(--brand-ink)] outline-none focus-visible:border-[var(--brand-teal)] focus-visible:ring-3 focus-visible:ring-[var(--brand-teal)]/30";

export const areaClass =
  "w-full rounded-xl border border-[var(--brand-input)] bg-white px-3 py-3 text-base text-[var(--brand-ink)] outline-none focus-visible:border-[var(--brand-teal)] focus-visible:ring-3 focus-visible:ring-[var(--brand-teal)]/30";

export const cardClass =
  "rounded-[20px] border border-[var(--brand-line)] bg-white shadow-[0_16px_40px_-28px_rgba(12,36,48,0.4)]";

export const btnInk =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand-ink)] px-5 text-base font-medium text-white transition-colors hover:bg-[#163544] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-teal)]/40";

export const btnOutline =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--brand-input)] bg-white px-5 text-base font-medium text-[var(--brand-ink)] transition-colors hover:border-[var(--brand-teal)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-teal)]/40";

export const btnAmber =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand-amber)] px-5 text-base font-semibold text-[var(--brand-ink)] transition-colors hover:bg-[#c98428] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50";

export const checkClass =
  "size-7 shrink-0 rounded-md border border-[var(--brand-input)] accent-[var(--brand-teal)]";
