"use client";

import { useMemo, useState } from "react";
import { IRMAA_BRACKETS_2026, type FilingStatus, type IrmaaBracket } from "@/lib/medicare/constants";
import { lookupIrmaa } from "@/lib/medicare/decisions";
import { cardClass, fieldClass } from "@/lib/visual";

const FILING: { id: FilingStatus; label: string }[] = [
  { id: "single", label: "Single" },
  { id: "joint", label: "Married filing jointly" },
  { id: "separate", label: "Married filing separately" },
];

export function IrmaaCheckerTool() {
  const [magi, setMagi] = useState("120000");
  const [filing, setFiling] = useState<FilingStatus>("single");
  const income = Math.max(0, Number(magi) || 0);

  const bracket = useMemo(() => lookupIrmaa(income, filing), [income, filing]);
  const rows = useMemo(() => rowsFor(filing), [filing]);
  const over = amountOverLine(income, filing, bracket);
  const monthly = bracket.partBSurcharge + bracket.partDSurcharge;
  const maxB = Math.max(...rows.map((row) => row.bracket.partBTotal));
  const maxD = Math.max(...rows.map((row) => row.bracket.partDSurcharge), 1);

  return (
    <div className="space-y-6">
      <div className={`${cardClass} space-y-4 p-5`}>
        <div>
          <label htmlFor="magi" className="text-base font-medium text-[var(--brand-ink)]">
            2024 MAGI (modified adjusted gross income)
          </label>
          <input
            id="magi"
            type="number"
            min={0}
            step={1000}
            value={magi}
            onChange={(event) => setMagi(event.target.value)}
            className={`${fieldClass} mt-2`}
          />
          <p className="mt-2 text-sm text-[var(--brand-text-3)]">
            2026 IRMAA uses your 2024 tax return. Enter the MAGI amount Social Security would use.
          </p>
        </div>
        <div>
          <p id="filing-label" className="text-base font-medium text-[var(--brand-ink)]">
            Filing status
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row" role="radiogroup" aria-labelledby="filing-label">
            {FILING.map((item) => {
              const on = filing === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFiling(item.id)}
                  className={`inline-flex min-h-12 flex-1 items-center justify-center rounded-xl px-3 text-center text-base ${
                    on
                      ? "bg-[var(--brand-ink)] text-white"
                      : "border border-[var(--brand-input)] bg-white text-[var(--brand-ink)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4 p-5`}>
        {filing === "separate" && (
          <p className="text-sm text-[var(--brand-text-3)]">
            Married filing separately uses the three tiers this checker already returns, not six
            separate ranges.
          </p>
        )}
        <ul className="space-y-4">
          {rows.map((row) => {
            const you = isYou(row, bracket, income, filing);
            return (
              <li
                key={row.key}
                className={`rounded-2xl p-3 ${you ? "bg-[var(--brand-teal-tint)] ring-2 ring-[var(--brand-teal)]" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-medium text-[var(--brand-ink)]">{row.label}</p>
                  {you && (
                    <span className="rounded-full bg-[var(--brand-ink)] px-3 py-1 text-sm text-white">
                      You
                    </span>
                  )}
                </div>
                <Bar
                  label={`Part B total ${money(row.bracket.partBTotal)}`}
                  width={(row.bracket.partBTotal / maxB) * 100}
                  tone="teal"
                />
                <Bar
                  label={`Part D surcharge ${money(row.bracket.partDSurcharge)}`}
                  width={(row.bracket.partDSurcharge / maxD) * 100}
                  tone="amber"
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-[24px] bg-[var(--brand-ink)] p-5 text-white sm:p-6">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-amber)] uppercase">
          Combined monthly surcharge
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-5xl">{money(monthly)}</p>
        <p className="mt-2 text-base text-white/80">About {money(monthly * 12)} over a year.</p>
        <p className="mt-2 text-base text-white/80">
          Part B total {money(bracket.partBTotal)}/mo, including {money(bracket.partBSurcharge)} IRMAA.
          Part D adds {money(bracket.partDSurcharge)}/mo on top of the plan premium.
        </p>
      </div>

      {over > 0 && (
        <p className="rounded-[20px] bg-[var(--brand-amber-tint)] px-4 py-3 text-base text-[var(--brand-amber-text)]">
          {money(over)} over the line for this bracket.
        </p>
      )}

      <p className="text-base text-[var(--brand-ink-soft)]">
        Life events (marriage, work stoppage, income drop) can sometimes support an IRMAA
        reconsideration. An agent can help you gather the right paperwork—not promise an outcome.
      </p>
    </div>
  );
}

function Bar({ label, width, tone }: { label: string; width: number; tone: "teal" | "amber" }) {
  return (
    <div className="mt-2">
      <p className="text-sm text-[var(--brand-text-3)]">{label}</p>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full ${tone === "teal" ? "bg-[var(--brand-teal)]" : "bg-[var(--brand-amber)]"}`}
          style={{ width: `${Math.max(width, 2)}%` }}
        />
      </div>
    </div>
  );
}

type Row = { key: string; label: string; bracket: IrmaaBracket; bucket?: "base" | "middle" | "top" };

function rowsFor(filing: FilingStatus): Row[] {
  if (filing === "separate") {
    return [
      { key: "base", label: "Up to $109,000", bracket: IRMAA_BRACKETS_2026[0], bucket: "base" },
      {
        key: "middle",
        label: "Over $109,000 and under $391,000",
        bracket: IRMAA_BRACKETS_2026[4],
        bucket: "middle",
      },
      {
        key: "top",
        label: "$391,000 and above",
        bracket: IRMAA_BRACKETS_2026[5],
        bucket: "top",
      },
    ];
  }
  return IRMAA_BRACKETS_2026.map((bracket) => {
    const min = filing === "joint" ? bracket.jointMin : bracket.singleMin;
    const max = filing === "joint" ? bracket.jointMax : bracket.singleMax;
    return { key: bracket.id, label: rangeLabel(min, max, bracket.id === "base"), bracket };
  });
}

function rangeLabel(min: number, max: number | null, base: boolean): string {
  if (base && max != null) return `Up to ${money(max)}`;
  if (max == null) return `${money(min)} and above`;
  return `Above ${money(min)} through ${money(max)}`;
}

function isYou(row: Row, bracket: IrmaaBracket, income: number, filing: FilingStatus): boolean {
  if (filing === "separate") {
    if (income >= 391000) return row.bucket === "top";
    if (income > 109000) return row.bucket === "middle";
    return row.bucket === "base";
  }
  return row.bracket.id === bracket.id;
}

function amountOverLine(income: number, filing: FilingStatus, bracket: IrmaaBracket): number {
  if (filing === "separate") {
    if (income >= 391000) return income - 391000;
    if (income > 109000) return income - 109000;
    return 0;
  }
  if (bracket.id === "base") return 0;
  const min = filing === "joint" ? bracket.jointMin : bracket.singleMin;
  return Math.max(0, income - min);
}

function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}
