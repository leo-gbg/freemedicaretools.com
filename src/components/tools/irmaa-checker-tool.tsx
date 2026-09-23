"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { lookupIrmaa } from "@/lib/medicare/decisions";
import type { FilingStatus } from "@/lib/medicare/constants";

const fieldClass =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function IrmaaCheckerTool() {
  const [magi, setMagi] = useState("120000");
  const [filing, setFiling] = useState<FilingStatus>("single");
  const [show, setShow] = useState(false);

  const bracket = useMemo(() => {
    if (!show) return null;
    return lookupIrmaa(Number(magi) || 0, filing);
  }, [magi, filing, show]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <div className="space-y-2">
          <Label htmlFor="magi">2024 MAGI (modified adjusted gross income)</Label>
          <input
            id="magi"
            type="number"
            min={0}
            step={1000}
            value={magi}
            onChange={(e) => {
              setMagi(e.target.value);
              setShow(false);
            }}
            className={fieldClass}
          />
          <p className="text-xs text-[var(--brand-ink-soft)]">
            2026 IRMAA uses your 2024 tax return. Enter the MAGI amount Social Security would use.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filing">Filing status</Label>
          <select
            id="filing"
            className={fieldClass}
            value={filing}
            onChange={(e) => {
              setFiling(e.target.value as FilingStatus);
              setShow(false);
            }}
          >
            <option value="single">Single</option>
            <option value="joint">Married filing jointly</option>
            <option value="separate">Married filing separately</option>
          </select>
        </div>
        <Button
          type="button"
          className="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          onClick={() => setShow(true)}
        >
          Check IRMAA bracket
        </Button>
      </div>

      {bracket && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-4">
              <p className="text-xs tracking-[0.12em] text-[var(--brand-teal)] uppercase">
                Part B total / mo
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
                ${bracket.partBTotal.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-[var(--brand-ink-soft)]">
                Includes ${bracket.partBSurcharge.toFixed(2)} IRMAA
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-4">
              <p className="text-xs tracking-[0.12em] text-[var(--brand-teal)] uppercase">
                Part D IRMAA / mo
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
                ${bracket.partDSurcharge.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-[var(--brand-ink-soft)]">
                Added to your plan premium
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-4">
              <p className="text-xs tracking-[0.12em] text-[var(--brand-teal)] uppercase">
                Combined surcharge
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
                ${(bracket.partBSurcharge + bracket.partDSurcharge).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-[var(--brand-ink-soft)]">B + D IRMAA only</p>
            </div>
          </div>
          <p className="text-sm text-[var(--brand-ink-soft)]">
            Life events (marriage, work stoppage, income drop) can sometimes support an IRMAA reconsideration. An agent can help you gather the right paperwork—not promise an outcome.
          </p>
        </div>
      )}
    </div>
  );
}
