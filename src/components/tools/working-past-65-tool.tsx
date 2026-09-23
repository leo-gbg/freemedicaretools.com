"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { assessWorkingPast65 } from "@/lib/medicare/decisions";

export function WorkingPast65Tool() {
  const [coveredByEmployer, setCoveredByEmployer] = useState(false);
  const [employerHas20Plus, setEmployerHas20Plus] = useState(false);
  const [wantsHsa, setWantsHsa] = useState(false);
  const [spouseCovering, setSpouseCovering] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof assessWorkingPast65> | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <Toggle
          id="emp"
          checked={coveredByEmployer}
          onChange={setCoveredByEmployer}
          label="I have health coverage from my current employer (or I am actively employed)"
        />
        <Toggle
          id="spouse"
          checked={spouseCovering}
          onChange={setSpouseCovering}
          label="I am covered as a spouse/dependent on a current employer plan"
        />
        <Toggle
          id="size"
          checked={employerHas20Plus}
          onChange={setEmployerHas20Plus}
          label="The employer providing coverage has 20 or more employees"
        />
        <Toggle
          id="hsa"
          checked={wantsHsa}
          onChange={setWantsHsa}
          label="I contribute to (or want to keep) an HSA"
        />
        <Button
          type="button"
          className="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          onClick={() =>
            setResult(
              assessWorkingPast65({
                coveredByEmployer,
                employerHas20Plus,
                wantsHsa,
                spouseCovering,
              })
            )
          }
        >
          Check delay risk
        </Button>
      </div>

      {result && (
        <div
          className={`rounded-2xl border p-5 ${
            result.canLikelyDelayPartB
              ? "border-[var(--brand-sea)] bg-[var(--brand-sea)]/15"
              : "border-amber-300 bg-amber-50"
          }`}
        >
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
            {result.title}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--brand-ink)]">
            {result.guidance.map((g) => (
              <li key={g} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs tracking-[0.12em] text-[var(--brand-teal)] uppercase">
            Watch-outs
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--brand-ink-soft)]">
            {result.watchouts.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-[var(--brand-ink)]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border border-input accent-[var(--brand-teal)]"
      />
      <span>{label}</span>
    </label>
  );
}
