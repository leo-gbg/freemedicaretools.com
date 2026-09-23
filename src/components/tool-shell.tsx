"use client";

import Link from "next/link";
import { withAcronymTips } from "@/components/acronym-tip";
import { Badge } from "@/components/ui/badge";
import { ConsultCta } from "@/components/consult-cta";
import { DISCLAIMER } from "@/lib/medicare/constants";
import type { ToolMeta } from "@/lib/medicare/tools";

export function ToolShell({
  tool,
  children,
}: {
  tool: ToolMeta;
  children: React.ReactNode;
}) {
  const audienceLabel =
    tool.audience === "turning-65"
      ? "Turning 65"
      : tool.audience === "enrolled"
        ? "Already enrolled"
        : "Turning 65 & enrolled";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/tools"
        className="text-sm text-[var(--brand-teal)] transition-colors hover:text-[var(--brand-teal-deep)]"
      >
        ← All tools
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-[var(--brand-sea)]/25 text-[var(--brand-ink)]"
        >
          {audienceLabel}
        </Badge>
        <Badge variant="outline" className="border-[var(--brand-line)] text-[var(--brand-ink-soft)]">
          Free · no account
        </Badge>
      </div>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">
        {tool.title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-[var(--brand-ink-soft)]">
        {withAcronymTips(tool.blurb)}
      </p>
      <p className="mt-2 text-sm text-[var(--brand-teal-deep)]">
        {withAcronymTips(tool.hormoziHook)}
      </p>

      <div className="mt-8">{children}</div>

      <p className="mt-8 text-xs leading-relaxed text-[var(--brand-ink-soft)]/90">
        {DISCLAIMER}
      </p>

      <div className="mt-10">
        <ConsultCta context={tool.shortTitle} />
      </div>
    </div>
  );
}
