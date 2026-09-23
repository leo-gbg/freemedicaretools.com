"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { scoreCoveragePath, type PathAnswers } from "@/lib/medicare/decisions";

const QUESTIONS: {
  key: keyof PathAnswers;
  prompt: string;
}[] = [
  { key: "travelOften", prompt: "I travel or split time across states often." },
  { key: "wantsLowPremium", prompt: "A lower monthly plan premium matters most." },
  { key: "needsSpecificDoctors", prompt: "I need to keep specific doctors or specialists." },
  { key: "takesManyRx", prompt: "I take several ongoing prescriptions." },
  { key: "wantsDentalVision", prompt: "Dental / vision extras would meaningfully help." },
  { key: "okWithReferrals", prompt: "I’m okay with networks, referrals, or prior auth if the price is right." },
];

export function PathQuizTool() {
  const [answers, setAnswers] = useState<Partial<PathAnswers>>({});
  const [result, setResult] = useState<ReturnType<typeof scoreCoveragePath> | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
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
              setError("Answer every question to see your lean.");
              setResult(null);
              return;
            }
            setError("");
            setResult(scoreCoveragePath(answers as PathAnswers));
          }}
        >
          See my coverage lean
        </Button>
      </div>

      {result && (
        <div className="animate-in fade-in rounded-2xl border border-[var(--brand-line)] bg-white/90 p-5 duration-500">
          <p className="text-xs tracking-[0.14em] text-[var(--brand-teal)] uppercase">
            Directional result · not a plan recommendation
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
            {result.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
            {result.summary}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--brand-ink)]">
            {result.nextSteps.map((step) => (
              <li key={step} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
