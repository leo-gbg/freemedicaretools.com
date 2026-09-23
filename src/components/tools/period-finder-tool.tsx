"use client";

import { useMemo, useState } from "react";
import { withAcronymTips } from "@/components/acronym-tip";
import { Button } from "@/components/ui/button";
import {
  findEnrollmentWindows,
  type PeriodMatch,
} from "@/lib/medicare/decisions";

export function PeriodFinderTool() {
  const [turning65Soon, setTurning65Soon] = useState(false);
  const [alreadyOnMedicare, setAlreadyOnMedicare] = useState(true);
  const [onAdvantage, setOnAdvantage] = useState(false);
  const [missedIep, setMissedIep] = useState(false);
  const [losingEmployerCoverage, setLosingEmployerCoverage] = useState(false);
  const [results, setResults] = useState<PeriodMatch[] | null>(null);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--brand-teal)] bg-[var(--brand-sea)]/20 px-5 py-4 text-center sm:text-left">
        <p className="text-xs tracking-[0.18em] text-[var(--brand-teal)] uppercase">
          Today&apos;s date
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)] sm:text-3xl">
          {todayLabel}
        </p>
        <p className="mt-1 text-sm text-[var(--brand-ink-soft)]">
          Windows below are judged against this date—what fits you, and what is open{" "}
          <em>today</em>.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <p className="text-sm text-[var(--brand-ink-soft)]">
          Tell us your situation. We&apos;ll highlight windows that fit you—and show whether each
          one is open today. Fixed windows get an <strong>Upcoming</strong> tag in the{" "}
          <strong>3 months</strong> before they open (for example, OEP/GEP starting October 1).
        </p>
        <ToggleRow
          id="t65"
          checked={turning65Soon}
          onChange={setTurning65Soon}
          label="I am approaching 65 / in my first Medicare window"
        />
        <ToggleRow
          id="enrolled"
          checked={alreadyOnMedicare}
          onChange={setAlreadyOnMedicare}
          label="I already have Medicare"
        />
        <ToggleRow
          id="ma"
          checked={onAdvantage}
          onChange={(v) => {
            setOnAdvantage(v);
            if (v) setAlreadyOnMedicare(true);
          }}
          label="I am on a Medicare Advantage plan"
        />
        <ToggleRow
          id="missed"
          checked={missedIep}
          onChange={setMissedIep}
          label="I missed my Initial Enrollment Period and need Part A/B"
        />
        <ToggleRow
          id="job"
          checked={losingEmployerCoverage}
          onChange={setLosingEmployerCoverage}
          label="I am leaving (or recently left) employer / group coverage"
        />
        <Button
          type="button"
          className="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          onClick={() =>
            setResults(
              findEnrollmentWindows({
                turning65Soon,
                alreadyOnMedicare,
                onAdvantage,
                missedIep,
                losingEmployerCoverage,
              })
            )
          }
        >
          Find my windows
        </Button>
      </div>

      {results && (
        <div className="space-y-3">
          {results.map((period) => (
            <PeriodCard key={period.id} period={period} />
          ))}
          <p className="text-xs text-[var(--brand-ink-soft)]">
            Reminder: {withAcronymTips("OEP")} and {withAcronymTips("GEP")} share Jan 1–Mar 31
            dates but serve different people. {withAcronymTips("AEP")} (Oct 15–Dec 7) is the main
            yearly shopping window for people who already have Medicare.
          </p>
        </div>
      )}
    </div>
  );
}

function PeriodCard({ period }: { period: PeriodMatch }) {
  const highlighted = period.fitsSituation;

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        highlighted
          ? "border-[var(--brand-teal)] bg-[var(--brand-sea)]/15"
          : "border-[var(--brand-line)] bg-white/50 opacity-70"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--brand-ink)]">
          {withAcronymTips(period.label)}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span
            className={`text-xs tracking-[0.12em] uppercase ${
              highlighted ? "text-[var(--brand-teal-deep)]" : "text-[var(--brand-ink-soft)]"
            }`}
          >
            {highlighted ? "Fits your situation" : "Not a match"}
          </span>
          {highlighted && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs tracking-[0.04em] ${
                period.openNow
                  ? "bg-[var(--brand-teal)] font-medium text-white uppercase"
                  : period.calendarStatus === "upcoming"
                    ? "bg-[var(--brand-teal)]/15 font-medium text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-teal)]/40"
                    : "bg-white/80 text-[var(--brand-ink-soft)] ring-1 ring-[var(--brand-line)] uppercase"
              }`}
            >
              {period.calendarBadge}
            </span>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--brand-teal)]">{period.windowLabel}</p>
      <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
        {withAcronymTips(period.description)}
      </p>
      <p className="mt-2 text-sm text-[var(--brand-ink)]">
        <span className="font-medium">Fits: </span>
        {withAcronymTips(period.whoItFits)}
      </p>
      {highlighted && (
        <p className="mt-2 text-sm text-[var(--brand-ink)]">
          <span className="font-medium">Calendar: </span>
          {withAcronymTips(period.calendarNote)}
        </p>
      )}
    </div>
  );
}

function ToggleRow({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-[var(--brand-ink)]"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border border-input accent-[var(--brand-teal)]"
      />
      <span>{label}</span>
    </label>
  );
}
