import Link from "next/link";
import { ConsultCta } from "@/components/consult-cta";
import { TOOLS } from "@/lib/medicare/tools";

export const metadata = {
  title: "Free Medicare tool kit",
};

export default function ToolsHubPage() {
  const turning = TOOLS.filter((t) => t.audience === "turning-65" || t.audience === "both");
  const enrolled = TOOLS.filter((t) => t.audience === "enrolled" || t.audience === "both");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-ink)] sm:text-5xl">
        Free Medicare tool kit
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--brand-ink-soft)]">
        Use these before you enroll, and again every AEP/OEP. No account required—results stay in
        your browser. New to the jargon?{" "}
        <Link href="/glossary" className="text-[var(--brand-teal)] hover:text-[var(--brand-teal-deep)]">
          Browse the acronyms & glossary →
        </Link>
      </p>

      <ToolGroup title="Turning 65 / first enrollment" tools={turning} />
      <ToolGroup title="Already enrolled / yearly navigation" tools={enrolled} />

      <div className="mt-14">
        <ConsultCta />
      </div>
    </div>
  );
}

function ToolGroup({
  title,
  tools,
}: {
  title: string;
  tools: typeof TOOLS;
}) {
  const unique = Array.from(new Map(tools.map((t) => [t.slug, t])).values());
  return (
    <section className="mt-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
        {title}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {unique.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="flex flex-col rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5 transition-colors hover:border-[var(--brand-teal)] hover:bg-white"
          >
            <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
              {tool.shortTitle}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
              {tool.blurb}
            </p>
            <span className="mt-4 text-sm text-[var(--brand-teal)]">Open tool →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
