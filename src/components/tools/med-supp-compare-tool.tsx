"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { withAcronymTips } from "@/components/acronym-tip";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  coverageLabel,
  getPlan,
  MEDIGAP_BENEFITS,
  MEDIGAP_PLANS,
  recommendMedSupp,
  type CoverageValue,
  type MedigapPlanLetter,
  type MedSuppAnswers,
} from "@/lib/medicare/medigap";

const QUESTIONS: {
  key: keyof MedSuppAnswers;
  prompt: string;
}[] = [
  {
    key: "newlyEligible",
    prompt: "I became (or will become) eligible for Medicare on or after January 1, 2020.",
  },
  {
    key: "wantsLowestGaps",
    prompt: "I want as few leftover medical bills as possible after Original Medicare pays.",
  },
  {
    key: "wantsLowerPremium",
    prompt: "A lower Medigap premium matters more than covering every possible gap.",
  },
  {
    key: "okWithCopays",
    prompt: "I’m okay with small doctor / ER copays if it lowers my monthly premium.",
  },
  {
    key: "worriesExcessCharges",
    prompt: "I worry about Part B excess charges (doctors who don’t accept assignment).",
  },
  {
    key: "wantsOopCap",
    prompt: "I want a Medigap plan with a yearly out-of-pocket maximum (Plan K or L style).",
  },
  {
    key: "travelsAbroad",
    prompt: "Limited foreign travel emergency coverage matters to me.",
  },
];

export function MedSuppCompareTool() {
  const [answers, setAnswers] = useState<Partial<MedSuppAnswers>>({
    newlyEligible: true,
  });
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof recommendMedSupp> | null>(null);
  const [selected, setSelected] = useState<MedigapPlanLetter[]>(["G", "N", "D"]);

  const selectedPlans = useMemo(
    () =>
      [...selected]
        .sort((a, b) => a.localeCompare(b))
        .map((letter) => getPlan(letter)),
    [selected]
  );

  function togglePlan(letter: MedigapPlanLetter) {
    setSelected((prev) => {
      if (prev.includes(letter)) {
        if (prev.length <= 2) return prev;
        return prev.filter((l) => l !== letter);
      }
      if (prev.length >= 4) return [...prev.slice(1), letter];
      return [...prev, letter];
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
        <p>
          {withAcronymTips(
            "Medigap (Medicare Supplement) plans are standardized by letter. Plan G from Company A covers the same benefits as Plan G from Company B—premiums, discounts, and household rules differ. This tool compares letters, not carrier prices."
          )}
        </p>
        <p className="mt-2">
          Medigap works with Original Medicare and does <strong>not</strong> include Part D drug
          coverage. Plans C and F are generally unavailable if you first became eligible in 2020 or
          later.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
          1 · What matters to you?
        </h2>
        {QUESTIONS.map((q) => (
          <fieldset key={q.key} className="space-y-2">
            <legend className="text-sm font-medium text-[var(--brand-ink)]">{q.prompt}</legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.key}
                  checked={answers[q.key] === true}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.key]: true }))}
                />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.key}
                  checked={answers[q.key] === false}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.key]: false }))}
                />
                No
              </label>
            </div>
          </fieldset>
        ))}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button
          type="button"
          className="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          onClick={() => {
            const complete = QUESTIONS.every((q) => typeof answers[q.key] === "boolean");
            if (!complete) {
              setError("Answer every question to see a letter lean.");
              setResult(null);
              return;
            }
            setError("");
            const rec = recommendMedSupp(answers as MedSuppAnswers);
            setResult(rec);
            setSelected(rec.compareDefault);
          }}
        >
          See my Medigap letter lean
        </Button>
      </section>

      {result && (
        <section className="rounded-2xl border border-[var(--brand-teal)] bg-[var(--brand-sea)]/15 p-5">
          <p className="text-xs tracking-[0.14em] text-[var(--brand-teal)] uppercase">
            Directional result · not a carrier recommendation
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
            {result.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
            {result.summary}
          </p>
          <p className="mt-3 text-sm text-[var(--brand-ink)]">
            <span className="font-medium">Letters to study: </span>
            {result.primary.map((l) => `Plan ${l}`).join(", ")}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--brand-ink)]">
            {result.why.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                <span>{withAcronymTips(w)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
              2 · Compare plan letters
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-ink-soft)]">
              Select 2–4 letters. Highlighted cells show where plans differ from Plan G (a common
              reference).
            </p>
          </div>
          <Link
            href="/tools/med-supp-compare/print"
            className={cn(
              buttonVariants({ size: "default" }),
              "shrink-0 bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
            )}
          >
            Print full chart (PDF)
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {[...MEDIGAP_PLANS]
            .sort((a, b) => a.letter.localeCompare(b.letter))
            .map((plan) => {
              const on = selected.includes(plan.letter);
              return (
                <button
                  key={plan.letter}
                  type="button"
                  onClick={() => togglePlan(plan.letter)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    on
                      ? "bg-[var(--brand-teal)] text-white"
                      : "bg-white text-[var(--brand-ink-soft)] ring-1 ring-[var(--brand-line)] hover:text-[var(--brand-ink)]"
                  }`}
                >
                  Plan {plan.letter}
                  {!plan.newlyEligible ? " *" : ""}
                </button>
              );
            })}
        </div>
        <p className="text-xs text-[var(--brand-ink-soft)]">
          * Plans C and F: generally only if first eligible before Jan 1, 2020.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-[var(--brand-line)] bg-white/90">
          <table className="min-w-[40rem] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--brand-line)] bg-[var(--brand-mist)]/80">
                <th className="sticky left-0 z-10 bg-[var(--brand-mist)] px-3 py-3 font-medium text-[var(--brand-ink)]">
                  Benefit
                </th>
                {selectedPlans.map((plan) => (
                  <th
                    key={plan.letter}
                    className="px-3 py-3 text-center font-[family-name:var(--font-display)] text-base text-[var(--brand-ink)]"
                  >
                    Plan {plan.letter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEDIGAP_BENEFITS.map((benefit) => (
                <tr key={benefit.id} className="border-b border-[var(--brand-line)]/70">
                  <th className="sticky left-0 z-10 bg-white/95 px-3 py-3 text-left font-medium text-[var(--brand-ink)]">
                    <span>{withAcronymTips(benefit.label)}</span>
                    <span className="mt-0.5 block text-xs font-normal text-[var(--brand-ink-soft)]">
                      {benefit.plain}
                    </span>
                  </th>
                  {selectedPlans.map((plan) => {
                    const value = plan.coverage[benefit.id];
                    const gValue = getPlan("G").coverage[benefit.id];
                    const differs = value !== gValue;
                    return (
                      <td
                        key={`${plan.letter}-${benefit.id}`}
                        className={`px-3 py-3 text-center tabular-nums ${
                          differs ? "bg-[var(--brand-sea)]/20 font-medium" : "text-[var(--brand-ink)]"
                        }`}
                      >
                        <CoverageCell value={value} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {selectedPlans.map((plan) => (
            <li
              key={plan.letter}
              className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-4"
            >
              <p className="font-[family-name:var(--font-display)] text-lg text-[var(--brand-ink)]">
                Plan {plan.letter}
              </p>
              <p className="mt-1 text-xs tracking-[0.08em] text-[var(--brand-teal)] uppercase">
                Typical premium: {plan.premiumTendency}
                {!plan.newlyEligible ? " · legacy eligibility" : ""}
              </p>
              <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">{plan.summary}</p>
              <p className="mt-2 text-xs text-[var(--brand-ink-soft)]">{plan.popularityNote}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-2xl border border-[var(--brand-line)] bg-[var(--brand-mist)]/60 p-5 text-sm text-[var(--brand-ink-soft)]">
        <p className="font-medium text-[var(--brand-ink)]">Before you enroll</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Compare premiums for the same letter across carriers in your state and ZIP.</li>
          <li>Ask how the company rates age (attained-age, issue-age, or community-rated).</li>
          <li>Medigap open enrollment around Part B start is usually the easiest time to buy.</li>
          <li>Shop a Part D plan separately for your prescriptions.</li>
        </ul>
      </div>
    </div>
  );
}

function CoverageCell({ value }: { value: CoverageValue }) {
  const label = coverageLabel(value);
  const title =
    value === "copay"
      ? "Part B coinsurance covered except for set office/ER copays"
      : value === "partial"
        ? "Limited foreign travel emergency benefits after a deductible; caps apply"
        : undefined;
  return <span title={title}>{label}</span>;
}
