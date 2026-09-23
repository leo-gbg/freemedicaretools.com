"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { withAcronymTips } from "@/components/acronym-tip";
import { buttonVariants } from "@/components/ui/button";
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
import { btnInk, cardClass } from "@/lib/visual";

const QUESTIONS: { key: keyof MedSuppAnswers; prompt: string }[] = [
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
        return prev.filter((item) => item !== letter);
      }
      if (prev.length >= 4) return [...prev.slice(1), letter];
      return [...prev, letter];
    });
  }

  const letters = [...MEDIGAP_PLANS].sort((a, b) => a.letter.localeCompare(b.letter));
  const lead = result?.primary[0];

  return (
    <div className="space-y-8">
      <div className={`${cardClass} p-5 text-base leading-relaxed text-[var(--brand-ink-soft)]`}>
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

      <section className={`${cardClass} space-y-4 p-5`}>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
          What matters to you?
        </h2>
        {QUESTIONS.map((question) => (
          <fieldset key={question.key} className="space-y-2">
            <legend className="text-base font-medium text-[var(--brand-ink)]">{question.prompt}</legend>
            <div className="flex flex-wrap gap-2">
              {[true, false].map((value) => {
                const on = answers[question.key] === value;
                return (
                  <label
                    key={String(value)}
                    className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-4 text-base ${
                      on
                        ? "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-white"
                        : "border-[var(--brand-input)] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      className="size-6"
                      name={question.key}
                      checked={on}
                      onChange={() => setAnswers((prev) => ({ ...prev, [question.key]: value }))}
                    />
                    {value ? "Yes" : "No"}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        {error && <p className="text-base text-[var(--brand-red-text)]">{error}</p>}
        <button
          type="button"
          className={btnInk}
          onClick={() => {
            const done = QUESTIONS.every((question) => typeof answers[question.key] === "boolean");
            if (!done) {
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
        </button>
      </section>

      {result && lead && (
        <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--brand-ink)] p-5 text-white sm:flex-row sm:items-center sm:p-6">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-amber)] font-[family-name:var(--font-display)] text-4xl text-[var(--brand-ink)]">
            {lead}
          </div>
          <div>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-amber)] uppercase">
              Directional result · not a carrier recommendation
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-balance">{result.title}</h2>
            <p className="mt-2 text-base leading-relaxed text-white/80">{result.summary}</p>
            <p className="mt-2 text-base">
              Letters to study: {result.primary.map((letter) => `Plan ${letter}`).join(", ")}
            </p>
            <ul className="mt-3 space-y-2 text-base text-white/85">
              {result.why.map((reason) => (
                <li key={reason}>{withAcronymTips(reason)}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              Compare plan letters
            </h2>
            <p className="mt-1 text-base text-[var(--brand-ink-soft)]">
              Select 2–4 letters. Plan G is the reference. Amber cells differ from G.
            </p>
          </div>
          <Link
            href="/tools/med-supp-compare/print"
            className={cn(buttonVariants({ size: "default" }), "bg-[var(--brand-ink)] text-white hover:bg-[#163544]")}
          >
            Print full chart (PDF)
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {letters.map((plan) => {
            const on = selected.includes(plan.letter);
            return (
              <button
                key={plan.letter}
                type="button"
                aria-pressed={on}
                onClick={() => togglePlan(plan.letter)}
                className={`inline-flex size-[60px] items-center justify-center rounded-2xl text-lg font-medium ${
                  on
                    ? "bg-[var(--brand-teal)] text-white"
                    : "border border-[var(--brand-input)] bg-white text-[var(--brand-ink)]"
                }`}
              >
                {plan.letter}
                {!plan.newlyEligible ? "*" : ""}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-[var(--brand-text-3)]">
          * Plans C and F: generally only if first eligible before Jan 1, 2020.
        </p>
        <p className="text-sm text-[var(--brand-text-3)]">
          Legend: ✓ covered · — not covered · 50%, 75%, Copays, and Limited stay as words.
        </p>

        <div className="max-w-full overflow-x-auto rounded-[20px] border border-[var(--brand-line)] bg-white">
          <table className="w-full min-w-[36rem] border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-[var(--brand-line)]">
                <th className="sticky left-0 z-10 bg-[var(--brand-mist)] px-3 py-3 font-medium">Benefit</th>
                {selectedPlans.map((plan) => (
                  <th
                    key={plan.letter}
                    className={`px-3 py-3 text-center ${
                      plan.letter === "G" ? "bg-[var(--brand-teal-tint)]" : ""
                    }`}
                  >
                    <span className="block font-[family-name:var(--font-display)] text-xl">
                      {plan.letter}
                    </span>
                    {plan.letter === "G" && (
                      <span className="text-sm font-medium text-[var(--brand-teal-deep)]">Reference</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEDIGAP_BENEFITS.map((benefit) => (
                <tr key={benefit.id} className="border-b border-[var(--brand-line)]">
                  <th className="sticky left-0 z-10 bg-white px-3 py-3 text-left font-medium">
                    <span>{withAcronymTips(benefit.label)}</span>
                    <span className="mt-1 block text-sm font-normal text-[var(--brand-text-3)]">
                      {benefit.plain}
                    </span>
                  </th>
                  {selectedPlans.map((plan) => {
                    const value = plan.coverage[benefit.id];
                    const differs = value !== getPlan("G").coverage[benefit.id];
                    return (
                      <td
                        key={`${plan.letter}-${benefit.id}`}
                        className={`px-3 py-3 text-center ${
                          plan.letter === "G"
                            ? "bg-[var(--brand-teal-tint)]"
                            : differs
                              ? "bg-[var(--brand-amber-tint)] font-medium"
                              : ""
                        }`}
                      >
                        <CoverageMark value={value} />
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
            <li key={plan.letter} className={`${cardClass} p-4`}>
              <p className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
                Plan {plan.letter}
              </p>
              <p className="mt-1 text-sm text-[var(--brand-teal-deep)]">
                Typical premium: {plan.premiumTendency}
                {!plan.newlyEligible ? " · legacy eligibility" : ""}
              </p>
              <p className="mt-2 text-base text-[var(--brand-ink-soft)]">{plan.summary}</p>
              <p className="mt-2 text-sm text-[var(--brand-text-3)]">{plan.popularityNote}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-[20px] bg-[var(--brand-surface)] p-5 text-base text-[var(--brand-ink-soft)]">
        <p className="font-medium text-[var(--brand-ink)]">Before you choose</p>
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

function CoverageMark({ value }: { value: CoverageValue }) {
  if (value === "yes") {
    return (
      <span aria-label="Covered" className="text-xl text-[var(--brand-teal-deep)]">
        ✓
      </span>
    );
  }
  if (value === "no") {
    return (
      <span aria-label="Not covered" className="text-xl text-[var(--brand-text-3)]">
        —
      </span>
    );
  }
  return <span>{coverageLabel(value)}</span>;
}
