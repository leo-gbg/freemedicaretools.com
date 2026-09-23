"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  calculateIep,
  formatLongDate,
  toIsoDate,
} from "@/lib/medicare/iep";

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
const YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i);

const fieldClass =
  "flex h-9 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function IepTimelineTool() {
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const yearNum = typeof year === "number" ? year : 0;
  const monthNum = typeof month === "number" ? month : 0;
  const dayNum = typeof day === "number" ? day : 0;

  const iso = useMemo(
    () => toIsoDate(yearNum, monthNum, dayNum),
    [yearNum, monthNum, dayNum]
  );

  const daysInMonth = useMemo(() => {
    if (!yearNum || !monthNum) return 31;
    return new Date(yearNum, monthNum, 0).getDate();
  }, [yearNum, monthNum]);

  const result = useMemo(() => {
    if (!submitted || !iso) return null;
    try {
      return calculateIep(iso);
    } catch {
      return null;
    }
  }, [iso, submitted]);

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

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <div className="space-y-2">
          <Label>Date of birth</Label>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-[var(--brand-ink-soft)]">Month</p>
              <select
                aria-label="Birth month"
                className={fieldClass}
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setSubmitted(false);
                  setError("");
                }}
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--brand-ink-soft)]">Day</p>
              <select
                aria-label="Birth day"
                className={fieldClass}
                value={day}
                onChange={(e) => {
                  setDay(Number(e.target.value));
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
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--brand-ink-soft)]">Year</p>
              <select
                aria-label="Birth year"
                className={fieldClass}
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setSubmitted(false);
                  setError("");
                }}
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-[var(--brand-ink-soft)]">
            Month / day / year selects work for older birth years (like 1951) that browser date pickers often make hard to enter.
          </p>
        </div>
        <Button
          type="button"
          className="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          onClick={onCalculate}
        >
          Calculate my IEP
        </Button>
      </div>

      {(error || (submitted && !result)) && (
        <p className="text-sm text-red-700">
          {error || "Enter a valid birth date to continue."}
        </p>
      )}

      {result && (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border p-5 ${
              result.status === "open"
                ? "border-[var(--brand-sea)] bg-[var(--brand-sea)]/20"
                : result.status === "upcoming"
                  ? "border-[var(--brand-line)] bg-white/80"
                  : "border-amber-300 bg-amber-50"
            }`}
          >
            <p className="text-xs tracking-[0.14em] text-[var(--brand-teal)] uppercase">
              Status: {result.status}
              {result.ageYears >= 0 ? ` · age ${result.ageYears}` : ""}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              {formatLongDate(result.iepStart)} → {formatLongDate(result.iepEnd)}
            </p>
            <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
              Turned / turns 65: {formatLongDate(result.turned65On)}
            </p>
            <p className="mt-1 text-sm text-[var(--brand-ink-soft)]">
              Medicare eligibility month: {formatLongDate(result.birthMonthStart)} –{" "}
              {formatLongDate(result.birthMonthEnd)}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-[var(--brand-ink-soft)]">
            {result.earliestCoverageHint}
          </p>
          <ul className="space-y-2 text-sm text-[var(--brand-ink)]">
            {result.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          {result.nextTools.length > 0 && (
            <div className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-4">
              <p className="text-xs tracking-[0.14em] text-[var(--brand-teal)] uppercase">
                Helpful next tools
              </p>
              <ul className="mt-2 space-y-1">
                {result.nextTools.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="text-sm text-[var(--brand-teal)] hover:text-[var(--brand-teal-deep)]"
                    >
                      {t.label} →
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
