"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateIep, formatLongDate, toIsoDate } from "@/lib/medicare/iep";
import { useSessionState } from "@/lib/use-session-state";
import { btnInk, btnOutline, cardClass, daysBetween, downloadIcs, fieldClass } from "@/lib/visual";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const MEDICARE_AGE_YEARS = Array.from(
  { length: 19 },
  (_, i) => CURRENT_YEAR - 62 - i
).filter((year) => year >= 1900);
const OTHER_YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i).filter(
  (year) => !MEDICARE_AGE_YEARS.includes(year)
);

const BEST =
  "Enrolling in the first 3 months of your IEP usually gives the earliest Part B start date.";
const MISSED_LATER =
  "If you never enrolled in Part B/D and delayed because of employer coverage, ask whether a Special Enrollment Period still applies—otherwise GEP (Jan 1–Mar 31) may be the path, often with late penalties.";

export function IepTimelineTool() {
  const [draft, setDraft] = useSessionState("fmt-iep-v1", {
    month: "" as number | "",
    day: "" as number | "",
    year: "" as number | "",
    submitted: false,
  });
  const { month, day, year, submitted } = draft;
  function setMonth(value: number | "") {
    setDraft((prev) => ({ ...prev, month: value }));
  }
  function setDay(value: number | "") {
    setDraft((prev) => ({ ...prev, day: value }));
  }
  function setYear(value: number | "") {
    setDraft((prev) => ({ ...prev, year: value }));
  }
  function setSubmitted(value: boolean) {
    setDraft((prev) => ({ ...prev, submitted: value }));
  }
  const [error, setError] = useState("");

  const yearNum = typeof year === "number" ? year : 0;
  const monthNum = typeof month === "number" ? month : 0;
  const dayNum = typeof day === "number" ? day : 0;

  const daysInMonth = useMemo(() => {
    if (!yearNum || !monthNum) return 31;
    return new Date(yearNum, monthNum, 0).getDate();
  }, [yearNum, monthNum]);

  const result = useMemo(() => {
    if (!submitted || !yearNum || !monthNum || !dayNum) return null;
    const iso = toIsoDate(yearNum, monthNum, Math.min(dayNum, daysInMonth));
    if (!iso) return null;
    try {
      return calculateIep(iso);
    } catch {
      return null;
    }
  }, [submitted, yearNum, monthNum, dayNum, daysInMonth]);

  function onCalculate() {
    if (!yearNum || !monthNum || !dayNum) {
      setError("Select month, day, and year of birth.");
      setSubmitted(false);
      return;
    }
    const clampedDay = Math.min(dayNum, daysInMonth);
    const nextIso = toIsoDate(yearNum, monthNum, clampedDay);
    if (!nextIso) {
      setError("That date is not valid (for example, February 31). Adjust the day and try again.");
      setSubmitted(false);
      return;
    }
    if (clampedDay !== dayNum) setDay(clampedDay);
    setError("");
    setSubmitted(true);
  }

  const stillOk =
    result?.tips.find((tip) => tip.includes("next month")) ?? result?.earliestCoverageHint ?? "";
  const missed =
    result?.status === "ended" ? (result.tips[0] ?? MISSED_LATER) : MISSED_LATER;

  const daysToOpen = result ? daysBetween(new Date(), result.iepStart) : 0;
  const badge =
    result?.status === "open"
      ? "Open now"
      : result?.status === "ended"
        ? "Window closed"
        : daysToOpen === 1
          ? "Opens in 1 day"
          : `Opens in ${daysToOpen} days`;

  return (
    <div className="space-y-6">
      <div className={`${cardClass} space-y-4 p-5`}>
        <div className="space-y-2">
          <p className="text-base font-medium text-[var(--brand-ink)]">Date of birth</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SelectField
              label="Month"
              value={month}
              onChange={(value) => {
                setMonth(value);
                setSubmitted(false);
                setError("");
              }}
            >
              <option value="">Month</option>
              {MONTHS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Day"
              value={day}
              onChange={(value) => {
                setDay(value);
                setSubmitted(false);
                setError("");
              }}
            >
              <option value="">Day</option>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Year"
              value={year}
              onChange={(value) => {
                setYear(value);
                setSubmitted(false);
                setError("");
              }}
            >
              <option value="">Year</option>
              <optgroup label="Common Medicare ages">
                {MEDICARE_AGE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other years">
                {OTHER_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </optgroup>
            </SelectField>
          </div>
          <p className="text-sm text-[var(--brand-text-3)]">
            Month, day, and year stay as separate lists so a birth year like 1951 is easy to pick.
          </p>
        </div>
        <button type="button" className={btnInk} onClick={onCalculate}>
          Calculate my IEP
        </button>
      </div>

      {(error || (submitted && !result)) && (
        <p className="text-base text-[var(--brand-red-text)]">
          {error || "Enter a valid birth date to continue."}
        </p>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`${cardClass} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-surface)] px-4 text-base text-[var(--brand-ink)]">
                {formatLongDate(result.birthDate)}
                <button
                  type="button"
                  className="rounded-full bg-[var(--brand-ink)] px-3 py-1 text-sm text-white"
                  onClick={() => setSubmitted(false)}
                >
                  Update
                </button>
              </span>
              <span className="rounded-full bg-[var(--brand-teal-tint)] px-3 py-1 text-sm font-medium text-[var(--brand-teal-deep)]">
                {badge}
              </span>
              <span className="text-sm text-[var(--brand-text-3)]">
                Status: {result.status}
                {result.ageYears >= 0 ? ` · age ${result.ageYears}` : ""}
              </span>
            </div>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight text-balance text-[var(--brand-ink)] sm:text-4xl">
              {formatLongDate(result.iepStart)} → {formatLongDate(result.iepEnd)}
            </p>
            <p className="mt-2 text-base text-[var(--brand-ink-soft)]">
              Medicare eligibility month: {formatLongDate(result.birthMonthStart)} –{" "}
              {formatLongDate(result.birthMonthEnd)}
            </p>
            <SevenMonthBar
              start={result.iepStart}
              turnLabel={`Turn 65 · ${formatLongDate(result.turned65On)}`}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <InfoCard tone="teal" title="Best" body={BEST} />
            <InfoCard tone="amber" title="Still OK" body={stillOk} />
            <InfoCard tone="red" title="Missed" body={missed} />
          </div>

          <p className="text-base leading-relaxed text-[var(--brand-ink-soft)]">
            {result.earliestCoverageHint}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={btnOutline}
              onClick={() =>
                downloadIcs({
                  filename: "medicare-iep.ics",
                  title: "Medicare Initial Enrollment Period",
                  start: result.iepStart,
                  end: result.iepEnd,
                })
              }
            >
              Add to Calendar
            </button>
            <button type="button" className={btnOutline} onClick={() => window.print()}>
              Print / Save PDF
            </button>
          </div>

          {result.nextTools.length > 0 && (
            <div className={`${cardClass} p-4`}>
              <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
                Helpful next tools
              </p>
              <ul className="mt-2 space-y-1">
                {result.nextTools.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="inline-flex min-h-12 items-center text-base text-[var(--brand-teal-deep)]"
                    >
                      {tool.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SevenMonthBar({ start, turnLabel }: { start: Date; turnLabel: string }) {
  const months = Array.from({ length: 7 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth() + index, 1);
  });
  return (
    <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {months.map((month, index) => {
        const label = month.toLocaleDateString("en-US", { month: "short" });
        const center = index === 3;
        const early = index < 3;
        return (
          <li
            key={`${label}-${index}`}
            className={`rounded-xl px-2 py-3 text-center text-sm ${
              center
                ? "border-2 border-[var(--brand-ink)] bg-white text-[var(--brand-ink)]"
                : early
                  ? "bg-[var(--brand-teal-tint)] text-[var(--brand-teal-deep)]"
                  : "bg-[var(--brand-amber-tint)] text-[var(--brand-amber-text)]"
            }`}
          >
            <span className="block font-medium">{label}</span>
            {center && <span className="mt-1 block text-[14px] leading-snug">{turnLabel}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function InfoCard({
  tone,
  title,
  body,
}: {
  tone: "teal" | "amber" | "red";
  title: string;
  body: string;
}) {
  const styles =
    tone === "teal"
      ? "border-[var(--brand-teal)]/30 bg-[var(--brand-teal-tint)]"
      : tone === "amber"
        ? "border-[var(--brand-amber)]/40 bg-[var(--brand-amber-tint)]"
        : "border-[var(--brand-red)]/30 bg-[var(--brand-red-tint)]";
  const titleColor =
    tone === "teal"
      ? "text-[var(--brand-teal-deep)]"
      : tone === "amber"
        ? "text-[var(--brand-amber-text)]"
        : "text-[var(--brand-red-text)]";
  return (
    <article className={`rounded-[20px] border p-4 ${styles}`}>
      <h2 className={`text-sm font-medium tracking-[0.12em] uppercase ${titleColor}`}>{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-[var(--brand-ink)]">{body}</p>
    </article>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: number | "";
  onChange: (value: number) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-[var(--brand-text-3)]">{label}</span>
      <select
        aria-label={`Birth ${label.toLowerCase()}`}
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {children}
      </select>
    </label>
  );
}
