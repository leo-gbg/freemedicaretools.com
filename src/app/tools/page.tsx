import Link from "next/link";
import { ConsultCta } from "@/components/consult-cta";
import { getTool } from "@/lib/medicare/tools";
import { ENROLLED_SLUGS, TURNING_SLUGS } from "@/lib/visual";

export const metadata = {
  title: "Free Medicare tool kit",
};

const GROUPS = [
  { title: "Turning 65", tools: TURNING_SLUGS.map((slug) => getTool(slug)!) },
  { title: "Already on Medicare", tools: ENROLLED_SLUGS.map((slug) => getTool(slug)!) },
  { title: "Before a consult", tools: [getTool("client-worksheet")!] },
];

export default function ToolsHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-balance text-[var(--brand-ink)] sm:text-5xl">
        Nine tools. Each one answers a single question.
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--brand-ink-soft)]">
        Use these before you choose coverage, and again every AEP. No account required. New to the
        jargon?{" "}
        <Link href="/glossary" className="text-[var(--brand-teal-deep)] underline-offset-2 hover:underline">
          Browse the acronyms & glossary →
        </Link>
      </p>

      {GROUPS.map((group) => (
        <section key={group.title} className="mt-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
            {group.title}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {group.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex flex-col rounded-[20px] border border-[var(--brand-line)] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(12,36,48,0.35)] transition-colors hover:border-[var(--brand-teal)]"
              >
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
                  {tool.shortTitle}
                </h3>
                <p className="mt-2 flex-1 text-base leading-relaxed text-[var(--brand-ink-soft)]">
                  You get: {tool.blurb}
                </p>
                <span className="mt-4 text-base font-medium text-[var(--brand-teal-deep)]">Open tool →</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-14">
        <ConsultCta />
      </div>
    </div>
  );
}
