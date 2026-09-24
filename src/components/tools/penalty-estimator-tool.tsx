"use client";

import { useMemo } from "react";
import {
  PART_B_STANDARD_PREMIUM,
  PART_D_BASE_BENEFICIARY_PREMIUM,
} from "@/lib/medicare/constants";
import { estimateLatePenalties, type PenaltyLine } from "@/lib/medicare/penalties";
import { useSessionState } from "@/lib/use-session-state";
import { cardClass } from "@/lib/visual";

export function PenaltyEstimatorTool() {
  const [months, setMonths] = useSessionState("fmt-penalty-v1", {
    partBMonths: 12,
    partDMonths: 12,
  });
  const { partBMonths, partDMonths } = months;
  function setPartBMonths(value: number) {
    setMonths((prev) => ({ ...prev, partBMonths: value }));
  }
  function setPartDMonths(value: number) {
    setMonths((prev) => ({ ...prev, partDMonths: value }));
  }

  const result = useMemo(
    () =>
      estimateLatePenalties({
        partBUncoveredMonths: partBMonths,
        partDUncoveredMonths: partDMonths,
      }),
    [partBMonths, partDMonths]
  );

  return (
    <div className="space-y-6">
      <div className={`${cardClass} grid gap-4 p-5 sm:grid-cols-2`}>
        <Stepper
          id="part-b-months"
          label="Part B uncovered months"
          value={partBMonths}
          onChange={setPartBMonths}
          hint={`Full 12-month blocks count (2026 standard premium $${PART_B_STANDARD_PREMIUM.toFixed(2)}).`}
        />
        <Stepper
          id="part-d-months"
          label="Part D uncovered months"
          value={partDMonths}
          onChange={setPartDMonths}
          hint={`Each month after IEP without creditable Rx coverage (base $${PART_D_BASE_BENEFICIARY_PREMIUM.toFixed(2)}).`}
        />
      </div>

      <div className={`${cardClass} p-5 sm:p-6`}>
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
          1-year estimated extra
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[var(--brand-ink)]">
          {formatMoney(result.combinedOneYearCost)}
        </p>
        <p className="mt-2 text-base text-[var(--brand-ink-soft)]">
          One year of the Part B and Part D late penalty combined. This is the extra only, on top of
          regular premiums.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Tile
            label="Part B late penalty"
            amount={`${formatMoney(result.partBMonthlyPenalty)}/mo`}
            detail={`${result.partBFullYears} full year(s) · standard premium becomes ${formatMoney(result.partBTotalWithPremium)}/mo`}
          />
          <Tile
            label="Part D late penalty"
            amount={`${formatMoney(result.partDMonthlyPenalty)}/mo`}
            detail="Added on top of your plan’s premium"
          />
        </div>
      </div>

      <AddingBox lines={result.lines} />

      <ul className="space-y-2 text-base text-[var(--brand-ink)]">
        {result.notes.map((note) => (
          <li key={note} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stepper({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-base font-medium text-[var(--brand-ink)]">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex size-12 items-center justify-center rounded-xl border border-[var(--brand-input)] bg-white text-2xl text-[var(--brand-ink)]"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Math.max(0, Math.floor(Number(event.target.value) || 0)))}
          className="h-12 w-full rounded-xl border border-[var(--brand-input)] bg-white px-3 text-center text-lg text-[var(--brand-ink)] outline-none focus-visible:border-[var(--brand-teal)]"
        />
        <button
          type="button"
          className="inline-flex size-12 items-center justify-center rounded-xl border border-[var(--brand-input)] bg-white text-2xl text-[var(--brand-ink)]"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
      <p className="mt-2 text-sm text-[var(--brand-text-3)]">{hint}</p>
    </div>
  );
}

function Tile({ label, amount, detail }: { label: string; amount: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-[var(--brand-surface)] p-4">
      <p className="text-sm text-[var(--brand-text-3)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--brand-ink)]">
        {amount}
      </p>
      <p className="mt-1 text-sm text-[var(--brand-ink-soft)]">{detail}</p>
    </div>
  );
}

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function AddingBox({ lines }: { lines: PenaltyLine[] }) {
  return (
    <div className={cardClass}>
      <div className="border-b border-[var(--brand-line)] px-5 py-3">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
          Penalty add-up · 1-year estimate
        </p>
      </div>
      <div className="divide-y divide-[var(--brand-line)]">
        {lines.map((line, index) => {
          const isTotal = line.emphasize === "total";
          const prefix = isTotal ? "=" : index === 0 ? "" : "+";
          return (
            <div
              key={`${line.label}-${index}`}
              className={`grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-start gap-3 px-5 py-4 ${
                isTotal ? "bg-[var(--brand-teal-tint)]" : ""
              }`}
            >
              <span className="pt-0.5 text-center text-base text-[var(--brand-text-3)]" aria-hidden>
                {prefix}
              </span>
              <div className="min-w-0">
                <p className="text-base font-medium text-[var(--brand-ink)]">{line.label}</p>
                {line.detail && (
                  <p className="mt-1 text-sm leading-snug text-[var(--brand-text-3)]">{line.detail}</p>
                )}
              </div>
              <p className="text-right text-base tabular-nums text-[var(--brand-ink)]">
                {line.amount === null ? "—" : formatMoney(line.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
