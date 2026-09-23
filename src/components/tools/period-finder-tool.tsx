"use client";

import { useEffect, useMemo, useState } from "react";
import { withAcronymTips } from "@/components/acronym-tip";
import { findEnrollmentWindows, type PeriodMatch } from "@/lib/medicare/decisions";
import { cardClass, yearProgress } from "@/lib/visual";

const DISPLAY_ORDER = ["aep", "oep", "sep", "iep", "gep"];

const SITUATIONS = [
  { key: "turning65Soon", label: "Approaching 65" },
  { key: "alreadyOnMedicare", label: "Already have Medicare" },
  { key: "onAdvantage", label: "On Medicare Advantage" },
  { key: "missedIep", label: "Missed my IEP" },
  { key: "losingEmployerCoverage", label: "Leaving employer coverage" },
] as const;

type SituationKey = (typeof SITUATIONS)[number]["key"];

export function PeriodFinderTool() {
  const [answers, setAnswers] = useState<Record<SituationKey, boolean>>({
    turning65Soon: false,
    alreadyOnMedicare: true,
    onAdvantage: false,
    missedIep: false,
    losingEmployerCoverage: false,
  });
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    queueMicrotask(() => setNow(new Date()));
  }, []);

  const results = useMemo(
    () => (now ? findEnrollmentWindows(answers, now) : null),
    [answers, now]
  );

  const ordered = useMemo(() => {
    if (!results) return [];
    return DISPLAY_ORDER.map((id) => results.find((period) => period.id === id)).filter(
      (period): period is PeriodMatch => Boolean(period)
    );
  }, [results]);

  const headline = useMemo(() => {
    const fits = ordered.filter((period) => period.fitsSituation);
    return (
      fits.find((period) => period.openNow) ??
      fits.find((period) => period.calendarStatus === "upcoming") ??
      fits[0] ??
      null
    );
  }, [ordered]);

  const todayLabel = now
    ? now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Checking today’s date…";

  function toggle(key: SituationKey) {
    setAnswers((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "onAdvantage" && next.onAdvantage) next.alreadyOnMedicare = true;
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-[var(--brand-teal)]/30 bg-[var(--brand-teal-tint)] px-5 py-4">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
          Today’s date
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--brand-ink)]">
          {todayLabel}
        </p>
      </div>

      <div className={`${cardClass} p-5`}>
        <p className="text-base text-[var(--brand-ink-soft)]">
          Choose what fits. Fixed windows show on the year. IEP and SEP depend on your own dates,
          so they are marked as personal timing.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Your situation">
          {SITUATIONS.map((item) => {
            const on = answers[item.key];
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(item.key)}
                className={`inline-flex min-h-12 items-center rounded-full px-4 text-base ${
                  on
                    ? "bg-[var(--brand-ink)] text-white"
                    : "border border-[var(--brand-input)] bg-white text-[var(--brand-ink)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {headline ? (
        <div className={`${cardClass} p-5`}>
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
            Next window that fits
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-balance text-[var(--brand-ink)]">
            {withAcronymTips(headline.label)}
          </h2>
          <p className="mt-2 text-base text-[var(--brand-ink-soft)]">{headline.windowLabel}</p>
        </div>
      ) : (
        <p className="text-base text-[var(--brand-ink-soft)]">
          Select the situation that fits to see the next window.
        </p>
      )}

      {now && ordered.length > 0 && <YearChart periods={ordered} progress={yearProgress(now)} />}

      {headline && (
        <div className="grid gap-3 md:grid-cols-2">
          <article className={`${cardClass} p-5`}>
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              What you can do
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[var(--brand-ink-soft)]">
              {withAcronymTips(headline.description)}
            </p>
          </article>
          <article className={`${cardClass} p-5`}>
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              Who it fits
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[var(--brand-ink-soft)]">
              {withAcronymTips(headline.whoItFits)}
            </p>
          </article>
        </div>
      )}
    </div>
  );
}

function YearChart({ periods, progress }: { periods: PeriodMatch[]; progress: number }) {
  return (
    <div className={`${cardClass} overflow-hidden p-4 sm:p-5`}>
      <div className="relative space-y-3">
        {periods.map((period) => (
          <WindowRow key={period.id} period={period} />
        ))}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-[var(--brand-ink)]"
          style={{ left: `calc(4.5rem + (100% - 4.5rem) * ${progress})` }}
          aria-hidden
        />
      </div>
      <p className="mt-3 text-sm text-[var(--brand-text-3)]">
        The dark line is today. IEP and SEP are personal timing, not a fixed month on this bar.
      </p>
    </div>
  );
}

function WindowRow({ period }: { period: PeriodMatch }) {
  const personal = period.id === "iep" || period.id === "sep";
  const dim = !period.fitsSituation;
  return (
    <div className={`grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 ${dim ? "opacity-45" : ""}`}>
      <p className="text-sm font-medium tracking-wide text-[var(--brand-ink)] uppercase">
        {period.id}
      </p>
      <div>
        <div className="relative h-10 overflow-hidden rounded-lg bg-[var(--brand-surface)]">
          {personal ? (
            <span className="flex h-full items-center px-3 text-sm text-[var(--brand-ink-soft)]">
              Personal timing — not a fixed month
            </span>
          ) : (
            <MonthBlocks id={period.id} />
          )}
        </div>
        {dim && (
          <p className="mt-1 text-sm text-[var(--brand-text-3)]">Not your situation</p>
        )}
      </div>
    </div>
  );
}

function MonthBlocks({ id }: { id: string }) {
  const fills = Array.from({ length: 12 }, (_, month) => fillFor(id, month));
  return (
    <div className="grid h-full grid-cols-12">
      {fills.map((fill, month) => (
        <div key={month} className="relative h-full border-r border-white/70 last:border-r-0">
          {fill === "full" && <div className="absolute inset-0 bg-[var(--brand-amber)]/80" />}
          {fill === "oep" && <div className="absolute inset-0 bg-[var(--brand-teal-tint)]" />}
          {fill === "aep-start" && (
            <div
              className="absolute inset-y-0 right-0 bg-[var(--brand-amber)]/80"
              style={{ width: `${((31 - 14) / 31) * 100}%` }}
            />
          )}
          {fill === "aep-end" && (
            <div
              className="absolute inset-y-0 left-0 bg-[var(--brand-amber)]/80"
              style={{ width: `${(7 / 31) * 100}%` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function fillFor(id: string, month: number): "full" | "oep" | "aep-start" | "aep-end" | "none" {
  if ((id === "oep" || id === "gep") && month <= 2) return "oep";
  if (id === "aep" && month === 9) return "aep-start";
  if (id === "aep" && month === 10) return "full";
  if (id === "aep" && month === 11) return "aep-end";
  return "none";
}
