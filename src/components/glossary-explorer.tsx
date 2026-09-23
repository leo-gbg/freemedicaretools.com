"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConsultCta } from "@/components/consult-cta";
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  searchGlossary,
  type GlossaryCategory,
  type GlossaryEntry,
} from "@/lib/medicare/glossary";

export function GlossaryExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "all">("all");

  const filtered = useMemo(() => {
    const base = searchGlossary(query);
    if (category === "all") return base;
    return base.filter((e) => e.category === category);
  }, [query, category]);

  const grouped = useMemo(() => {
    return GLOSSARY_CATEGORIES.map((cat) => ({
      ...cat,
      entries: filtered.filter((e) => e.category === cat.id),
    })).filter((g) => g.entries.length > 0);
  }, [filtered]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <label htmlFor="glossary-search" className="text-sm font-medium text-[var(--brand-ink)]">
          Search acronyms & terms
        </label>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try IEP, deductible, formulary, IRMAA…"
          className="mt-2 flex h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label={`All (${searchGlossary(query).length})`}
          />
          {GLOSSARY_CATEGORIES.map((cat) => {
            const count = searchGlossary(query).filter((e) => e.category === cat.id).length;
            return (
              <FilterChip
                key={cat.id}
                active={category === cat.id}
                onClick={() => setCategory(cat.id)}
                label={`${cat.label} (${count})`}
              />
            );
          })}
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-[var(--brand-ink-soft)]">
          No matches for “{query}”. Try another word, or clear the search to browse everything.
        </p>
      ) : (
        grouped.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              {group.label}
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-ink-soft)]">{group.description}</p>
            <ul className="mt-4 space-y-3">
              {group.entries.map((entry) => (
                <GlossaryCard key={entry.id} entry={entry} />
              ))}
            </ul>
          </section>
        ))
      )}

      <p className="text-xs text-[var(--brand-ink-soft)]">
        Showing {filtered.length} of {GLOSSARY.length} terms. Educational definitions only—not
        official CMS guidance.
      </p>

      <ConsultCta context="Glossary" />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs tracking-[0.04em] transition-colors ${
        active
          ? "bg-[var(--brand-teal)] text-white"
          : "bg-white text-[var(--brand-ink-soft)] ring-1 ring-[var(--brand-line)] hover:text-[var(--brand-ink)]"
      }`}
    >
      {label}
    </button>
  );
}

function GlossaryCard({ entry }: { entry: GlossaryEntry }) {
  return (
    <li className="rounded-2xl border border-[var(--brand-line)] bg-white/80 p-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
          {entry.term}
        </h3>
        {entry.acronym && (
          <span className="rounded-full bg-[var(--brand-sea)]/30 px-2 py-0.5 text-xs font-medium tracking-[0.08em] text-[var(--brand-teal-deep)] uppercase">
            {entry.acronym}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-[var(--brand-ink)]">{entry.short}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">{entry.long}</p>
      {entry.alsoCalled && entry.alsoCalled.length > 0 && (
        <p className="mt-2 text-xs text-[var(--brand-ink-soft)]">
          Also called: {entry.alsoCalled.join(" · ")}
        </p>
      )}
      {entry.relatedTool && (
        <p className="mt-3">
          <Link
            href={entry.relatedTool.href}
            className="text-sm text-[var(--brand-teal)] hover:text-[var(--brand-teal-deep)]"
          >
            Related tool: {entry.relatedTool.label} →
          </Link>
        </p>
      )}
    </li>
  );
}
