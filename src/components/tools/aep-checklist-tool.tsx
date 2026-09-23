"use client";

import { useState } from "react";

const ITEMS = [
  "Confirm AEP dates: October 15 – December 7 (coverage usually Jan 1).",
  "List every doctor, hospital, and specialist you actually use.",
  "List all prescriptions with dosage—check formulary + pharmacy tiers.",
  "Compare your current plan’s 2026 Annual Notice of Change (ANOC).",
  "Check premium, deductible, max out-of-pocket, and referral rules.",
  "If on Advantage: verify network changes didn’t drop your doctors.",
  "If on Original + Medigap + Part D: re-shop Part D for drug costs.",
  "Ask whether Extra Help / state programs could lower costs.",
  "Note OEP (Jan 1–Mar 31) only helps if you stay in Advantage on Jan 1.",
  "Schedule a free consult before Dec 7 if anything looks uncertain.",
];

export function AepChecklistTool() {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const completed = Object.values(done).filter(Boolean).length;
  const pct = Math.round((completed / ITEMS.length) * 100);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.14em] text-[var(--brand-teal)] uppercase">
              Annual Enrollment Period
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              {completed} / {ITEMS.length} complete
            </p>
          </div>
          <p className="text-sm text-[var(--brand-ink-soft)]">{pct}%</p>
        </div>
        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--brand-line)]/60"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[var(--brand-teal)] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {ITEMS.map((item, index) => (
          <li
            key={item}
            className={`rounded-xl border px-4 py-3 transition-colors ${
              done[index]
                ? "border-[var(--brand-sea)] bg-[var(--brand-sea)]/15"
                : "border-[var(--brand-line)] bg-white/70"
            }`}
          >
            <label
              htmlFor={`aep-${index}`}
              className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-[var(--brand-ink)]"
            >
              <input
                id={`aep-${index}`}
                type="checkbox"
                checked={Boolean(done[index])}
                onChange={(e) =>
                  setDone((prev) => ({ ...prev, [index]: e.target.checked }))
                }
                className="mt-0.5 size-4 shrink-0 rounded border border-input accent-[var(--brand-teal)]"
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
