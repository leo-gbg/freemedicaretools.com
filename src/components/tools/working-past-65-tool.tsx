"use client";

import { useMemo } from "react";
import { assessWorkingPast65, findEnrollmentWindows } from "@/lib/medicare/decisions";
import { formatLongDate } from "@/lib/medicare/iep";
import { retirementTimeline, type CoverageEndChoice } from "@/lib/medicare/retirement";
import { useSessionState } from "@/lib/use-session-state";
import { cardClass, checkClass, fieldClass } from "@/lib/visual";

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

const COVERAGE_END: { id: CoverageEndChoice; label: string }[] = [
  { id: "same-day", label: "The day I stop working" },
  { id: "end-of-month", label: "The last day of that month" },
  { id: "end-of-next-month", label: "The last day of the following month" },
  { id: "unsure", label: "I’m not sure yet" },
];

type Key = (typeof QUESTIONS)[number]["key"];

function showDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return formatLongDate(new Date(year, month - 1, day));
}

export function WorkingPast65Tool() {
  const [draft, setDraft] = useSessionState("fmt-working-past-65-v1", {
    answers: {
      coveredByEmployer: false,
      employerHas20Plus: false,
      wantsHsa: false,
      spouseCovering: false,
    } as Record<Key, boolean>,
    planning: false,
    lastDay: "",
    coverageEnd: "unsure" as CoverageEndChoice,
  });
  const answers = draft.answers;

  const result = useMemo(() => assessWorkingPast65(answers), [answers]);
  const timeline = useMemo(
    () => (draft.planning ? retirementTimeline(draft.lastDay, draft.coverageEnd) : null),
    [draft.coverageEnd, draft.lastDay, draft.planning]
  );
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
                  setDraft((prev) => ({
                    ...prev,
                    answers: { ...prev.answers, [question.key]: event.target.checked },
                  }))
                }
              />
              <span className="text-base leading-snug text-[var(--brand-ink)]">{question.label}</span>
            </label>
          );
        })}
      </div>

      <section className={`${cardClass} space-y-4 p-5`}>
        <label className="flex min-h-12 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className={`${checkClass} mt-0.5`}
            checked={draft.planning}
            onChange={(event) => setDraft((prev) => ({ ...prev, planning: event.target.checked }))}
          />
          <span className="text-base leading-snug text-[var(--brand-ink)]">
            I have a planned last day of work and want a timeline
          </span>
        </label>
        {draft.planning && (
          <div className="space-y-4 border-t border-[var(--brand-line)] pt-4">
            <div>
              <label htmlFor="last-day" className="text-base font-medium text-[var(--brand-ink)]">
                Anticipated last day of work
              </label>
              <input
                id="last-day"
                type="date"
                value={draft.lastDay}
                onChange={(event) => setDraft((prev) => ({ ...prev, lastDay: event.target.value }))}
                className={`${fieldClass} mt-2 max-w-xs`}
              />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-base font-medium text-[var(--brand-ink)]">
                When does that employer health plan end?
              </legend>
              {COVERAGE_END.map((choice) => (
                <label key={choice.id} className="flex min-h-12 cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="coverage-end"
                    className="size-6 accent-[var(--brand-teal)]"
                    checked={draft.coverageEnd === choice.id}
                    onChange={() => setDraft((prev) => ({ ...prev, coverageEnd: choice.id }))}
                  />
                  <span className="text-base text-[var(--brand-ink)]">{choice.label}</span>
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </section>

      {timeline && (
        <aside className="rounded-[24px] bg-[var(--brand-ink)] p-5 text-white sm:p-6">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-amber)] uppercase">
            Estimated windows after that date
          </p>
          <p className="mt-3 text-base leading-relaxed text-white/85">
            Part B’s Special Enrollment Period runs {showDate(timeline.partBStart)} through{" "}
            {showDate(timeline.partBEnd)}. The 8 months start the month after the earlier of your
            last day of work and the day employer coverage ends.
            {timeline.coverageEnd
              ? ` Coverage end used here: ${showDate(timeline.coverageEnd)}.`
              : " Coverage end is still unknown, so this Part B window uses your last day of work. If the plan ends sooner, the window can start earlier."}
          </p>
          <p className="mt-3 text-base leading-relaxed text-white/85">
            {timeline.partDStart && timeline.partDEnd
              ? `Part D is generally the two months after the month drug coverage ends: ${showDate(timeline.partDStart)} through ${showDate(timeline.partDEnd)}. That applies when the drug coverage was creditable.`
              : "Part D cannot be dated until you know when creditable drug coverage ends. It is generally the two months after that month."}
          </p>
          {!result.canLikelyDelayPartB && (
            <p className="mt-3 text-base leading-relaxed text-[var(--brand-amber)]">
              These dates do not by themselves mean you can delay Part B. The boxes above still have
              to describe current employer coverage from an employer large enough for your situation.
            </p>
          )}
        </aside>
      )}

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
