"use client";

import { useEffect, useMemo, useState } from "react";
import { aepCountdown, checkClass, downloadIcs, nextAepEnd } from "@/lib/visual";

const STORAGE_KEY = "fmt-aep-checklist-v1";

const ITEMS = [
  "Confirm AEP dates: October 15 – December 7 (coverage usually Jan 1).",
  "List every doctor, hospital, and specialist you actually use.",
  "List all prescriptions with dosage—check formulary + pharmacy tiers.",
  "Compare this fall’s Annual Notice of Change (ANOC). It describes your plan’s 2027 changes.",
  "Check premium, deductible, max out-of-pocket, and referral rules.",
  "If on Advantage: verify network changes didn’t drop your doctors.",
  "If on Original + Medigap + Part D: re-shop Part D for drug costs.",
  "Ask whether Extra Help / state programs could lower costs.",
  "Note OEP (Jan 1–Mar 31) only helps if you stay in Advantage on Jan 1.",
  "Schedule a free consult before Dec 7 if anything looks uncertain.",
];

const GROUPS = [
  { title: "Gather", indexes: [0, 1, 2] },
  { title: "Compare", indexes: [3, 4, 5, 6] },
  { title: "Decide", indexes: [7, 8, 9] },
];

export function AepChecklistTool() {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Record<number, boolean>;
          if (parsed && typeof parsed === "object") setDone(parsed);
        }
      } catch {
        /* private mode or unreadable storage */
      }
      setReady(true);
      setNow(new Date());
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      /* ignore quota / private mode */
    }
  }, [done, ready]);

  const completed = Object.values(done).filter(Boolean).length;
  const pct = Math.round((completed / ITEMS.length) * 100);
  const phase = now ? aepCountdown(now) : null;

  const ring = useMemo(() => {
    const radius = 42;
    const circ = 2 * Math.PI * radius;
    return { radius, circ, dash: (pct / 100) * circ };
  }, [pct]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="space-y-6">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              {group.title}
            </h2>
            <ul className="mt-3 space-y-3">
              {group.indexes.map((index) => {
                const on = Boolean(done[index]);
                return (
                  <li
                    key={ITEMS[index]}
                    className={`rounded-[20px] border px-4 py-3 ${
                      on
                        ? "border-[var(--brand-teal)]/40 bg-[var(--brand-teal-tint)]"
                        : "border-[var(--brand-line)] bg-white"
                    }`}
                  >
                    <label className="flex min-h-12 cursor-pointer items-start gap-3 text-base leading-snug text-[var(--brand-ink)]">
                      <input
                        type="checkbox"
                        className={`${checkClass} mt-0.5`}
                        checked={on}
                        onChange={(event) =>
                          setDone((prev) => ({ ...prev, [index]: event.target.checked }))
                        }
                      />
                      <span className={on ? "text-[var(--brand-text-3)] line-through" : ""}>
                        {ITEMS[index]}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <aside className="h-fit rounded-[24px] border border-[var(--brand-line)] bg-white p-5 lg:sticky lg:top-6">
        <div className="flex items-center gap-4">
          <svg width="108" height="108" viewBox="0 0 108 108" role="img" aria-label={`${pct}% complete`}>
            <circle cx="54" cy="54" r={ring.radius} fill="none" stroke="#dce6e2" strokeWidth="8" />
            <circle
              cx="54"
              cy="54"
              r={ring.radius}
              fill="none"
              stroke="#1f6f63"
              strokeWidth="8"
              strokeDasharray={`${ring.dash} ${ring.circ}`}
              strokeLinecap="round"
              transform="rotate(-90 54 54)"
            />
            <text x="54" y="58" textAnchor="middle" fontSize="16" fill="#0c2430">
              {pct}%
            </text>
          </svg>
          <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
            {completed} / {ITEMS.length}
          </p>
        </div>
        <p className="mt-4 text-base text-[var(--brand-ink-soft)]">
          {phase ? phase.headline : "Checking the AEP dates…"}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand-ink)] px-4 text-base text-white"
            onClick={() => {
              const end = nextAepEnd(now ?? new Date());
              downloadIcs({
                filename: "aep-december-7.ics",
                title: "Medicare AEP ends December 7",
                start: end,
                end,
              });
            }}
          >
            Add Dec 7 to my calendar
          </button>
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--brand-input)] bg-white px-4 text-base text-[var(--brand-ink)]"
            onClick={() => window.print()}
          >
            Print checklist
          </button>
        </div>
      </aside>
    </div>
  );
}
