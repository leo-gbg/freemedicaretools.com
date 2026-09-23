"use client";

import { useMemo, useState } from "react";
import { assessWorkingPast65, findEnrollmentWindows } from "@/lib/medicare/decisions";
import { cardClass, checkClass } from "@/lib/visual";

const QUESTIONS = [
  {
    key: "coveredByEmployer",
    label: "I have health coverage from my current employer (or I am actively employed)",
  },
  {
    key: "spouseCovering",
    label: "I am covered as a spouse/dependent on a current employer plan",
  },
  {
    key: "employerHas20Plus",
    label: "The employer providing coverage has 20 or more employees",
  },
  {
    key: "wantsHsa",
    label: "I contribute to (or want to keep) an HSA",
  },
] as const;

type Key = (typeof QUESTIONS)[number]["key"];

export function WorkingPast65Tool() {
  const [answers, setAnswers] = useState<Record<Key, boolean>>({
    coveredByEmployer: false,
    employerHas20Plus: false,
    wantsHsa: false,
    spouseCovering: false,
  });

  const result = useMemo(() => assessWorkingPast65(answers), [answers]);
  const sepLabel = useMemo(() => {
    const windows = findEnrollmentWindows({
      turning65Soon: false,
      alreadyOnMedicare: false,
      onAdvantage: false,
      missedIep: false,
      losingEmployerCoverage: true,
    });
    return windows.find((window) => window.id === "sep")?.windowLabel;
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {QUESTIONS.map((question) => {
          const on = answers[question.key];
          return (
            <label
              key={question.key}
              className={`${cardClass} flex min-h-20 cursor-pointer items-start gap-3 p-4 ${
                on ? "border-[var(--brand-teal)]" : ""
              }`}
            >
              <input
                type="checkbox"
                className={`${checkClass} mt-0.5`}
                checked={on}
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, [question.key]: event.target.checked }))
                }
              />
              <span className="text-base leading-snug text-[var(--brand-ink)]">{question.label}</span>
            </label>
          );
        })}
      </div>

      <div
        className={`rounded-[24px] p-5 sm:p-6 ${
          result.canLikelyDelayPartB
            ? "bg-[var(--brand-teal-tint)] text-[var(--brand-ink)]"
            : "bg-[var(--brand-amber-tint)] text-[var(--brand-ink)]"
        }`}
      >
        <p className="text-sm font-medium tracking-[0.14em] uppercase">
          {result.canLikelyDelayPartB ? "Check" : "Risk"}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-balance">
          {result.title}
        </h2>
      </div>

      {sepLabel && (
        <aside className="rounded-[20px] border border-[var(--brand-teal)]/30 bg-white p-4">
          <p className="text-sm font-medium tracking-[0.12em] text-[var(--brand-teal-deep)] uppercase">
            Part B and Part D timing
          </p>
          <p className="mt-2 text-lg text-[var(--brand-ink)]">{sepLabel}</p>
        </aside>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${cardClass} p-5`}>
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
            Do this next
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-base text-[var(--brand-ink)]">
            {result.guidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
        <section className={`${cardClass} p-5`}>
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
            Watch out for
          </h3>
          <ul className="mt-3 space-y-2 text-base text-[var(--brand-ink-soft)]">
            {result.watchouts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
