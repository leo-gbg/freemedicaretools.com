"use client";

import Link from "next/link";
import { withAcronymTips } from "@/components/acronym-tip";
import { DISCLAIMER } from "@/lib/medicare/constants";
import type { ToolMeta } from "@/lib/medicare/tools";
import { btnAmber, cardClass, consultMailto, toolPlacement } from "@/lib/visual";

export function ToolShell({
  tool,
  children,
}: {
  tool: ToolMeta;
  children: React.ReactNode;
}) {
  const place = toolPlacement(tool.slug);
  const eyebrow =
    place.total > 0
      ? `${place.groupLabel} · Tool ${place.index} of ${place.total}`
      : place.groupLabel;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/tools"
        className="inline-flex min-h-12 items-center text-base font-medium text-[var(--brand-teal-deep)]"
      >
        ← All tools
      </Link>
      <p className="mt-3 text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-2 max-w-3xl font-[family-name:var(--font-display)] text-[2.625rem] leading-[1.05] tracking-tight text-balance text-[var(--brand-ink)] sm:text-[3.25rem]">
        {tool.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--brand-ink-soft)]">
        {withAcronymTips(tool.blurb)}
      </p>

      <div className="mt-8 min-w-0">{children}</div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {place.next && (
          <Link
            href={`/tools/${place.next.slug}`}
            className={`${cardClass} flex flex-col p-5 transition-colors hover:border-[var(--brand-teal)]`}
          >
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
              Next tool
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              {place.next.shortTitle}
            </p>
            <p className="mt-2 flex-1 text-base text-[var(--brand-ink-soft)]">{place.next.blurb}</p>
            <span className="mt-4 text-base font-medium text-[var(--brand-teal-deep)]">Open →</span>
          </Link>
        )}
        <aside className="rounded-[20px] bg-[var(--brand-ink)] p-5 text-white sm:p-6">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-amber)] uppercase">
            Talk it through
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-snug">
            The tools explain the rules. A free consult applies them to you.
          </p>
          <p className="mt-2 text-base text-white/80">
            This site is educational and does not sign you up for a plan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={consultMailto(tool.shortTitle)} className={btnAmber}>
              Request a free consult
            </a>
          </div>
        </aside>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-[var(--brand-text-3)]">{DISCLAIMER}</p>
    </div>
  );
}
