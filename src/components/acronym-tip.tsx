"use client";

import { Fragment, type ReactNode } from "react";
import { getAcronymTipMap } from "@/lib/medicare/glossary";

const TIP_MAP = getAcronymTipMap();

/** Codes matched in running text (longest first). */
const TIP_CODES = Array.from(
  new Set(
    Object.keys(TIP_MAP)
      .filter((k) => !k.includes(" "))
      .concat(["PARTA", "PARTB", "PARTC", "PARTD"])
  )
).sort((a, b) => b.length - a.length);

const ACRONYM_PATTERN = new RegExp(
  `\\b(?:Part\\s+([ABCD])|(${TIP_CODES.join("|")}))s?\\b`,
  "gi"
);

function tipFor(code: string): string | undefined {
  const compact = code.replace(/\s+/g, "").toUpperCase();
  // "SEPs" → try SEPS, then SEP (plural acronyms)
  const singular =
    compact.length >= 3 && compact.endsWith("S") && !TIP_MAP[compact]
      ? compact.slice(0, -1)
      : compact;

  return (
    TIP_MAP[compact] ||
    TIP_MAP[singular] ||
    TIP_MAP[code.toUpperCase()] ||
    TIP_MAP[code.replace(/\s+/g, " ").toUpperCase()]
  );
}

export function AcronymTip({
  code,
  children,
}: {
  code: string;
  children?: ReactNode;
}) {
  const display = children ?? code;
  const tip = tipFor(code);
  if (!tip) return <>{display}</>;

  const label = code.replace(/\s+/g, " ").toUpperCase().startsWith("PART")
    ? code.replace(/\s+/g, " ")
    : code.replace(/s$/i, "").toUpperCase();

  return (
    <span className="group/tip relative inline-block">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-[var(--brand-teal)] text-inherit"
        aria-label={`${label}: ${tip}`}
        title={tip}
      >
        {display}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-30 w-64 -translate-x-1/2 rounded-lg border border-[var(--brand-line)] bg-[var(--brand-ink)] px-3 py-2 text-left text-xs leading-snug font-normal tracking-normal text-[var(--brand-mist)] opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        <span className="font-medium text-[var(--brand-sea)]">{label}</span>
        <span className="mt-1 block">{tip}</span>
      </span>
    </span>
  );
}

/** Wrap known Medicare acronyms in hover tooltips. */
export function withAcronymTips(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(ACRONYM_PATTERN.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const raw = match[0];
    const partLetter = match[1];
    // Prefer captured base acronym (group 2) so "SEPs" resolves to SEP, not SEPS
    const baseCode = match[2] || raw;
    const code = partLetter ? `Part ${partLetter.toUpperCase()}` : baseCode;
    parts.push(
      <AcronymTip key={`${match.index}-${raw}`} code={code}>
        {raw}
      </AcronymTip>
    );
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}
