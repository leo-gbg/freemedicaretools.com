"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { aepCountdown, yearProgress } from "@/lib/visual";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function DeadlineCard() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    queueMicrotask(() => setNow(new Date()));
  }, []);

  const phase = now ? aepCountdown(now) : null;
  const progress = now ? yearProgress(now) : 0;

  return (
    <aside className="rounded-[24px] border border-[var(--brand-line)] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(12,36,48,0.45)] sm:p-6">
      <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
        This year’s deadline
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[var(--brand-ink)] sm:text-4xl">
        {phase ? phase.headline : "Checking today’s date…"}
      </p>
      <p className="mt-2 text-base leading-relaxed text-[var(--brand-ink-soft)]">
        {phase
          ? phase.detail
          : "Annual Enrollment Period is October 15 through December 7."}
      </p>

      <div className="mt-5">
        <div className="relative">
          <div className="grid grid-cols-12 gap-1">
            {MONTHS.map((month, index) => (
              <div key={month} className="min-w-0">
                <div
                  className="h-8 overflow-hidden rounded-md bg-[var(--brand-surface)]"
                  title={monthFillLabel(index)}
                >
                  <MonthFill index={index} />
                </div>
                <p className="mt-1 text-center text-[14px] leading-none text-[var(--brand-text-3)]">
                  <span className="sm:hidden">{month.slice(0, 1)}</span>
                  <span className="hidden sm:inline">{month}</span>
                </p>
              </div>
            ))}
          </div>
          {now && (
            <div
              className="pointer-events-none absolute top-0 h-8 w-0.5 bg-[var(--brand-ink)]"
              style={{ left: `${progress * 100}%` }}
              aria-hidden
            />
          )}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--brand-ink-soft)]">
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[var(--brand-teal-tint)] ring-1 ring-[var(--brand-teal)]/40" />
            OEP · Jan 1–Mar 31
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[var(--brand-amber)]" />
            AEP · Oct 15–Dec 7
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-0.5 bg-[var(--brand-ink)]" />
            Today
          </li>
        </ul>
      </div>

      <Link
        href="/tools/period-finder"
        className="mt-4 inline-flex min-h-12 items-center text-base font-medium text-[var(--brand-teal-deep)] underline-offset-2 hover:underline"
      >
        Which window am I in today? →
      </Link>
    </aside>
  );
}

function monthFillLabel(index: number): string {
  if (index <= 2) return "Medicare Advantage Open Enrollment Period";
  if (index === 9) return "AEP starts October 15";
  if (index === 10) return "AEP";
  if (index === 11) return "AEP through December 7";
  return "";
}

function MonthFill({ index }: { index: number }) {
  if (index <= 2) {
    return <div className="h-full bg-[var(--brand-teal-tint)]" />;
  }
  if (index === 9) {
    return (
      <div
        className="h-full bg-[var(--brand-amber)]"
        style={{ width: `${((31 - 14) / 31) * 100}%`, marginLeft: `${(14 / 31) * 100}%` }}
      />
    );
  }
  if (index === 10) {
    return <div className="h-full bg-[var(--brand-amber)]" />;
  }
  if (index === 11) {
    return (
      <div className="h-full bg-[var(--brand-amber)]" style={{ width: `${(7 / 31) * 100}%` }} />
    );
  }
  return null;
}
