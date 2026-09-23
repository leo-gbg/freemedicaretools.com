import Link from "next/link";
import { ConsultCta } from "@/components/consult-cta";
import { DeadlineCard } from "@/components/deadline-card";
import { getTool } from "@/lib/medicare/tools";
import { btnInk, btnOutline, ENROLLED_SLUGS, TURNING_SLUGS } from "@/lib/visual";

const TURNING = TURNING_SLUGS.map((slug) => getTool(slug)!);
const ENROLLED = ENROLLED_SLUGS.map((slug) => getTool(slug)!);
const WORKSHEET = getTool("client-worksheet")!;

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-[var(--brand-teal-deep)] uppercase">
              Free · No account · Plain English
            </p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[2.625rem] leading-[1.05] tracking-tight text-balance text-[var(--brand-ink)] sm:text-[4.25rem]">
              Know your Medicare deadlines before they cost you.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--brand-ink-soft)]">
              Deadlines, penalties, and coverage tradeoffs in plain English. The tools stay on
              this site. Talk to a licensed agent only if you want to.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#turning-65" className={btnInk}>
                I&apos;m turning 65
              </a>
              <a href="#already-on-medicare" className={btnOutline}>
                I&apos;m already on Medicare
              </a>
            </div>
          </div>
          <DeadlineCard />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-3xl text-balance text-[var(--brand-ink)] sm:text-4xl">
          Nine tools. Each one answers a single question.
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ToolColumn id="turning-65" title="Turning 65" tools={TURNING} tone="teal" />
          <ToolColumn
            id="already-on-medicare"
            title="Already on Medicare"
            tools={ENROLLED}
            tone="amber"
          />
        </div>

        <Link
          href={`/tools/${WORKSHEET.slug}`}
          className="mt-6 flex items-center justify-between gap-4 rounded-[20px] border border-[var(--brand-line)] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(12,36,48,0.4)] transition-colors hover:border-[var(--brand-teal)]"
        >
          <span>
            <span className="block text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
              Before a consult
            </span>
            <span className="mt-1 block font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              {WORKSHEET.title}
            </span>
            <span className="mt-1 block text-base text-[var(--brand-ink-soft)]">
              You get: {WORKSHEET.blurb}
            </span>
          </span>
          <Chevron />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid items-center gap-8 rounded-[24px] border border-[var(--brand-line)] bg-white p-6 sm:p-8 lg:grid-cols-[262px_minmax(0,1fr)]">
          <div className="relative mx-auto h-[322px] w-[262px] shrink-0">
            <div
              aria-hidden
              className="absolute top-3 left-3 h-full w-full rounded-t-[131px] bg-[var(--brand-amber)]"
            />
            <div className="relative flex h-full w-full items-center justify-center rounded-t-[131px] bg-[var(--brand-teal-tint)] px-6 text-center text-base font-medium text-[var(--brand-teal-deep)]">
              [PHOTO: Leopoldo]
            </div>
          </div>
          <div>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
              Who built this
            </p>
            <blockquote className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-snug text-balance text-[var(--brand-ink)] sm:text-3xl">
              Medicare shouldn&apos;t take a meeting to understand. Start with the tools, and call
              me if you want help with the next step.
            </blockquote>
            <p className="mt-4 text-lg font-medium text-[var(--brand-ink)]">Leopoldo Adaoag</p>
            <p className="text-base text-[var(--brand-ink-soft)]">
              Licensed insurance agent · Guardian Benefits Group
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              <li className="rounded-full bg-[var(--brand-teal-tint)] px-3 py-2 text-sm text-[var(--brand-teal-deep)]">
                Educational only, no plan sign-ups on this site
              </li>
              <li className="rounded-full bg-[var(--brand-amber-tint)] px-3 py-2 text-sm text-[var(--brand-amber-text)]">
                No account, no email needed.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ConsultCta />
      </section>
    </div>
  );
}

function ToolColumn({
  id,
  title,
  tools,
  tone,
}: {
  id: string;
  title: string;
  tools: { slug: string; shortTitle: string; blurb: string }[];
  tone: "teal" | "amber";
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/tools/${tool.slug}`}
              className="flex items-center gap-4 rounded-[20px] border border-[var(--brand-line)] bg-white p-4 shadow-[0_16px_40px_-28px_rgba(12,36,48,0.35)] transition-colors hover:border-[var(--brand-teal)]"
            >
              <IconTile tone={tone} slug={tool.slug} />
              <span className="min-w-0 flex-1">
                <span className="block font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
                  {tool.shortTitle}
                </span>
                <span className="mt-1 block text-base text-[var(--brand-ink-soft)]">
                  You get: {tool.blurb}
                </span>
              </span>
              <Chevron />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconTile({ tone, slug }: { tone: "teal" | "amber"; slug: string }) {
  const bg = tone === "teal" ? "bg-[var(--brand-teal-tint)] text-[var(--brand-teal-deep)]" : "bg-[var(--brand-amber-tint)] text-[var(--brand-amber-text)]";
  return (
    <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ${bg}`} aria-hidden>
      <ToolGlyph slug={slug} />
    </span>
  );
}

function ToolGlyph({ slug }: { slug: string }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (slug === "iep-timeline") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (slug === "working-past-65") {
    return (
      <svg {...common}>
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </svg>
    );
  }
  if (slug === "path-quiz") {
    return (
      <svg {...common}>
        <path d="M4 16h6M14 16h6M7 16V8M17 16V6" />
      </svg>
    );
  }
  if (slug === "penalty-estimator") {
    return (
      <svg {...common}>
        <path d="M5 19V9M12 19V5M19 19v-7" />
      </svg>
    );
  }
  if (slug === "period-finder") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </svg>
    );
  }
  if (slug === "aep-checklist") {
    return (
      <svg {...common}>
        <path d="M8 7h11M8 12h11M8 17h11M4 7h.01M4 12h.01M4 17h.01" />
      </svg>
    );
  }
  if (slug === "irmaa-checker") {
    return (
      <svg {...common}>
        <path d="M4 18h16M6 18V10M12 18V6M18 18v-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0 text-[var(--brand-text-3)]">
      <path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
