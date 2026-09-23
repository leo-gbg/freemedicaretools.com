import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryExplorer } from "@/components/glossary-explorer";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Medicare acronyms & glossary",
  description:
    "Plain-language Medicare and health insurance glossary: IEP, AEP, OEP, GEP, SEP, IRMAA, Medigap, formularies, and more — FreeMedicareTools.com.",
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-[0.16em] text-[var(--brand-teal)] uppercase">
        {BRAND.domain}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-ink)] sm:text-5xl">
        Acronyms & glossary
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--brand-ink-soft)]">
        Medicare conversations are full of shorthand. This glossary explains the enrollment
        windows, plan types, cost terms, and coverage words you will see across{" "}
        {BRAND.name}—so the free tools make more sense before you request a consult.
      </p>
      <p className="mt-3 text-sm text-[var(--brand-ink-soft)]">
        Prefer to start with a calculator?{" "}
        <Link href="/tools" className="text-[var(--brand-teal)] hover:text-[var(--brand-teal-deep)]">
          Open the free tool kit →
        </Link>
      </p>

      <div className="mt-10">
        <GlossaryExplorer />
      </div>
    </div>
  );
}
