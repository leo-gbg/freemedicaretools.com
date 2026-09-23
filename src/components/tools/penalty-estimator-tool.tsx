"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PART_B_STANDARD_PREMIUM,
  PART_D_BASE_BENEFICIARY_PREMIUM,
} from "@/lib/medicare/constants";
import {
  estimateLatePenalties,
  type PenaltyLine,
} from "@/lib/medicare/penalties";

export function PenaltyEstimatorTool() {
  const [partBMonths, setPartBMonths] = useState("12");
  const [partDMonths, setPartDMonths] = useState("12");
  const [show, setShow] = useState(false);

  const result = useMemo(() => {
    if (!show) return null;
    return estimateLatePenalties({
      partBUncoveredMonths: Number(partBMonths) || 0,
      partDUncoveredMonths: Number(partDMonths) || 0,
    });
  }, [partBMonths, partDMonths, show]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="partB">Part B uncovered months</Label>
            <input
              id="partB"
              type="number"
              min={0}
              value={partBMonths}
              onChange={(e) => {
                setPartBMonths(e.target.value);
                setShow(false);
              }}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="text-xs text-[var(--brand-ink-soft)]">
              Full 12-month blocks count (2026 standard premium $
              {PART_B_STANDARD_PREMIUM.toFixed(2)}).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="partD">Part D uncovered months</Label>
            <input
              id="partD"
              type="number"
              min={0}
              value={partDMonths}
              onChange={(e) => {
                setPartDMonths(e.target.value);
                setShow(false);
              }}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="text-xs text-[var(--brand-ink-soft)]">
              Each month after IEP without creditable Rx coverage (base $
              {PART_D_BASE_BENEFICIARY_PREMIUM.toFixed(2)}).
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          onClick={() => setShow(true)}
        >
          Estimate penalties
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <AddingBox lines={result.lines} />
          <p className="text-sm text-[var(--brand-ink-soft)]">
            Estimated Part B premium with penalty:{" "}
            <strong className="text-[var(--brand-ink)]">
              ${result.partBTotalWithPremium.toFixed(2)}/mo
            </strong>{" "}
            (standard ${PART_B_STANDARD_PREMIUM.toFixed(2)} + $
            {result.partBMonthlyPenalty.toFixed(2)} LEP). Part D LEP is added on
            top of your plan’s premium.
          </p>
          <ul className="space-y-2 text-sm text-[var(--brand-ink)]">
            {result.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
    <div className="overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white/90 shadow-[0_12px_40px_-28px_rgba(12,36,48,0.45)]">
      <div className="border-b border-[var(--brand-line)] bg-[var(--brand-mist)]/80 px-5 py-3">
        <p className="text-xs tracking-[0.14em] text-[var(--brand-teal)] uppercase">
          Penalty add-up · 1-year estimate
        </p>
      </div>
      <div className="divide-y divide-[var(--brand-line)]/80">
        {lines.map((line, index) => {
          const isTotal = line.emphasize === "total";
          const prefix = isTotal ? "=" : index === 0 ? "" : "+";

          return (
            <div
              key={`${line.label}-${index}`}
              className={`grid grid-cols-[1.25rem_1fr_auto] items-start gap-3 px-5 py-4 sm:gap-4 ${
                isTotal ? "bg-[var(--brand-sea)]/20" : ""
              }`}
            >
              <span
                className={`pt-0.5 text-center text-base font-medium ${
                  isTotal
                    ? "text-[var(--brand-teal-deep)]"
                    : "text-[var(--brand-ink-soft)]"
                }`}
                aria-hidden
              >
                {prefix}
              </span>
              <div className="min-w-0">
                <p
                  className={`${
                    isTotal
                      ? "font-[family-name:var(--font-display)] text-base text-[var(--brand-ink)]"
                      : "text-sm font-medium text-[var(--brand-ink)]"
                  }`}
                >
                  {line.label}
                </p>
                {line.detail && (
                  <p className="mt-1 text-xs leading-snug text-[var(--brand-ink-soft)]">
                    {line.detail}
                  </p>
                )}
              </div>
              <p
                className={`tabular-nums text-right ${
                  isTotal
                    ? "font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]"
                    : "text-base text-[var(--brand-ink)]"
                }`}
              >
                {line.amount === null ? "—" : formatMoney(line.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
