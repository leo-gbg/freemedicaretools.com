"use client";

import { useMemo } from "react";
import { scoreCoveragePath, type PathAnswers } from "@/lib/medicare/decisions";
import { MEDICARE_PLAN_FINDER } from "@/lib/medicare/official";
import { useSessionState } from "@/lib/use-session-state";
import { cardClass } from "@/lib/visual";

const QUESTIONS: { key: keyof PathAnswers; prompt: string }[] = [
  { key: "travelOften", prompt: "I travel or split time across states often." },
  { key: "needsSpecificDoctors", prompt: "I need to keep specific doctors or specialists." },
  { key: "wantsNoReferral", prompt: "I want to see specialists without a referral." },
  {
    key: "okWithNetwork",
    prompt: "I am comfortable getting care inside a plan’s network of doctors and hospitals.",
  },
  {
    key: "prefersPlanSetCosts",
    prompt: "I prefer one plan that sets what I pay for covered services, including a yearly maximum.",
  },
  {
    key: "wantsSeparateDrugPlan",
    prompt:
      "I prefer a separate Part D plan for drugs, rather than drug coverage inside the same plan.",
  },
];

export function PathQuizTool() {
  const [answers, setAnswers] = useSessionState<Partial<PathAnswers>>("fmt-path-quiz-v2", {});

  const complete = QUESTIONS.every((question) => typeof answers[question.key] === "boolean");
  const result = useMemo(
    () => (complete ? scoreCoveragePath(answers as PathAnswers) : null),
    [answers, complete]
  );

  const chips = result ? contributingChips(answers as PathAnswers, result.lean) : [];
  const marker = result
    ? result.advantage + result.original === 0
      ? 50
      : (result.original / (result.advantage + result.original)) * 100
    : 50;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className={`${cardClass} space-y-5 p-5`}>
        {QUESTIONS.map((question) => (
          <fieldset key={question.key} className="space-y-2">
            <legend className="text-base font-medium text-[var(--brand-ink)]">{question.prompt}</legend>
            <div className="flex flex-wrap gap-2">
              <Choice
                name={question.key}
                label="Yes"
                checked={answers[question.key] === true}
                onChange={() => setAnswers((prev) => ({ ...prev, [question.key]: true }))}
              />
              <Choice
                name={question.key}
                label="No"
                checked={answers[question.key] === false}
                onChange={() => setAnswers((prev) => ({ ...prev, [question.key]: false }))}
              />
            </div>
          </fieldset>
        ))}
        {!complete && (
          <p className="text-sm text-[var(--brand-text-3)]">
            Answer every question to see which structure lines up.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <div className={`${cardClass} p-5`}>
              <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
                Directional result · not a plan recommendation
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-balance text-[var(--brand-ink)]">
                {result.title}
              </h2>
              <div className="mt-5">
                <div className="flex justify-between text-sm text-[var(--brand-ink-soft)]">
                  <span>Advantage</span>
                  <span>Original + Medigap</span>
                </div>
                <div className="relative mt-2 h-3 rounded-full bg-gradient-to-r from-[var(--brand-teal)] to-[var(--brand-amber)]">
                  <div
                    className="absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--brand-ink)]"
                    style={{ left: `${marker}%` }}
                    role="img"
                    aria-label={`Lean marker. Advantage points ${result.advantage}, Original plus Medigap points ${result.original}.`}
                  />
                </div>
              </div>
              <p className="mt-4 text-base leading-relaxed text-[var(--brand-ink-soft)]">{result.summary}</p>
              <p className="mt-3 text-base leading-relaxed text-[var(--brand-ink-soft)]">
                Plan-specific benefits and costs are on{" "}
                <a
                  href={MEDICARE_PLAN_FINDER}
                  className="font-medium text-[var(--brand-teal-deep)] underline underline-offset-4"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Medicare.gov’s Plan Finder
                </a>
                .
              </p>
              {chips.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-[var(--brand-ink)]">What pushed you this way</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full bg-[var(--brand-teal-tint)] px-3 py-1 text-sm text-[var(--brand-teal-deep)]"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="rounded-[20px] border border-[var(--brand-amber)]/40 bg-[var(--brand-amber-tint)] p-4">
              <p className="text-sm font-medium tracking-[0.12em] text-[var(--brand-amber-text)] uppercase">
                Enrollment timing
              </p>
              <p className="mt-1 text-base leading-relaxed text-[var(--brand-ink)]">
                Medigap is usually easiest to buy in the 6-month window that starts when you are 65
                or older and enrolled in Part B. Medicare Advantage generally uses your Initial
                Enrollment Period, October 15–December 7, or a Special Enrollment Period. A consult
                is optional.
              </p>
            </div>
            <ul className="space-y-2 text-base text-[var(--brand-ink)]">
              {result.nextSteps.map((step) => (
                <li key={step} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className={`${cardClass} p-5 text-base text-[var(--brand-ink-soft)]`}>
            How the two structures line up shows here as you answer. You can change any Yes or No
            and the slider updates.
          </div>
        )}
      </div>
    </div>
  );
}

function Choice({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`inline-flex min-h-12 min-w-24 cursor-pointer items-center gap-2 rounded-xl border px-4 text-base ${
        checked
          ? "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-white"
          : "border-[var(--brand-input)] bg-white text-[var(--brand-ink)]"
      }`}
    >
      <input type="radio" className="size-6 accent-[var(--brand-teal)]" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function contributingChips(answers: PathAnswers, lean: "advantage" | "original-medigap" | "mixed") {
  const advantage: string[] = [];
  const original: string[] = [];
  if (!answers.travelOften) advantage.push("Mostly staying in one place");
  if (!answers.wantsNoReferral) advantage.push("A referral to see a specialist is fine");
  if (answers.okWithNetwork) advantage.push("Comfortable with a network");
  if (answers.prefersPlanSetCosts) advantage.push("Prefer a plan that sets covered-service costs");
  if (!answers.wantsSeparateDrugPlan) advantage.push("Prefer drug coverage in the same plan");
  if (answers.travelOften) original.push("Travel or time in more than one place");
  if (answers.needsSpecificDoctors) original.push("Specific doctors to keep");
  if (answers.wantsNoReferral) original.push("Want to see specialists without a referral");
  if (!answers.okWithNetwork) original.push("Prefer care outside a plan network");
  if (!answers.prefersPlanSetCosts) original.push("Prefer Original Medicare’s deductibles and coinsurance");
  if (answers.wantsSeparateDrugPlan) original.push("Prefer a separate drug plan");
  if (lean === "advantage") return advantage;
  if (lean === "original-medigap") return original;
  return [...advantage, ...original];
}
