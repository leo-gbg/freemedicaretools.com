"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PoweredBy } from "@/components/powered-by";
import { buttonVariants } from "@/components/ui/button";
import {
  MedigapComparisonTable,
  orderedMedigapPlans,
} from "@/components/tools/medigap-comparison-table";
import { OfficialSourceNote } from "@/components/official-source";
import { BRAND } from "@/lib/brand";
import { MEDICARE_MEDIGAP, MEDICARE_MEDIGAP_BENEFITS } from "@/lib/medicare/official";
import { cn } from "@/lib/utils";

export function MedigapPrintDocument() {
  const plans = orderedMedigapPlans();
  const printedOn = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    document.body.classList.add("medigap-print-page");
    return () => document.body.classList.remove("medigap-print-page");
  }, []);

  return (
    <div className="medigap-print-root mx-auto max-w-[11in] bg-white px-4 py-8 text-[var(--brand-ink)] sm:px-6">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/tools/med-supp-compare"
          className="text-sm text-[var(--brand-teal)] hover:text-[var(--brand-teal-deep)]"
        >
          ← Back to Med-Supp tool
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          )}
        >
          Print / Save as PDF
        </button>
      </div>

      <header className="border-b border-[var(--brand-line)] pb-4">
        <p className="text-xs tracking-[0.16em] text-[var(--brand-teal)] uppercase">
          {BRAND.domain}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Medigap (Medicare Supplement) plan letter comparison
        </h1>
        <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
          Standardized benefit chart for Plans {plans.map((p) => p.letter).join(", ")}. Benefits are
          the same by letter across companies; premiums vary. Printed {printedOn}.
        </p>
        <p className="mt-1 text-xs text-[var(--brand-ink-soft)]">
          <PoweredBy />
        </p>
      </header>

      <section className="mt-4">
        <MedigapComparisonTable plans={plans} printFriendly compact />
        <p className="mt-2 text-[8pt] text-[var(--brand-ink-soft)]">
          * Plans C and F are generally only available if you were first eligible for Medicare before
          January 1, 2020.
        </p>
      </section>

      <section className="mt-5 grid gap-3 text-[9pt] leading-snug text-[var(--brand-ink-soft)] sm:grid-cols-2">
        <div>
          <p className="font-medium text-[var(--brand-ink)]">How to read this chart</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>
              <strong>Yes</strong> — plan covers that benefit
            </li>
            <li>
              <strong>No</strong> — you pay that cost yourself (or Medicare only)
            </li>
            <li>
              <strong>50% / 75%</strong> — plan pays that share (K / L style)
            </li>
            <li>
              <strong>Copays</strong> — Plan N Part B coinsurance: up to $20 for some office visits and
              up to $50 for emergency room visits that do not lead to admission
            </li>
            <li>
              <strong>Limited</strong> — foreign travel emergency with caps/deductible
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-[var(--brand-ink)]">Important notes</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>Medigap works with Original Medicare (Parts A &amp; B).</li>
            <li>Medigap does not include Part D prescription drug coverage.</li>
            <li>Same letter means the same standardized benefits. Premiums can differ by carrier, ZIP, and age.</li>
            <li>Confirm current Outline of Coverage before you enroll.</li>
          </ul>
        </div>
      </section>

      <footer className="mt-6 border-t border-[var(--brand-line)] pt-3 text-[8pt] text-[var(--brand-ink-soft)]">
        Educational comparison only—not Medicare, CMS, or Social Security advice. Not affiliated with
        or endorsed by the U.S. government or the federal Medicare program. {BRAND.domain} · <PoweredBy className="inline" linkClassName="text-[var(--brand-ink-soft)]" />.
        Compare letters side by side. If you&apos;d like help later, a licensed agent can walk you
        through your options.
        <OfficialSourceNote
          className="mt-2"
          links={[
            { href: MEDICARE_MEDIGAP, label: "Medigap basics" },
            { href: MEDICARE_MEDIGAP_BENEFITS, label: "Medigap benefits by letter" },
          ]}
        />
      </footer>
    </div>
  );
}
