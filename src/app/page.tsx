import Link from "next/link";
import { ConsultCta } from "@/components/consult-cta";
import { PoweredBy } from "@/components/powered-by";
import { buttonVariants } from "@/components/ui/button";
import { TOOLS } from "@/lib/medicare/tools";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-y-0 right-0 w-full bg-[radial-gradient(ellipse_at_70%_40%,rgba(31,111,102,0.18),transparent_55%)] md:w-3/5" />
          <div className="animate-drift absolute top-24 right-[8%] hidden h-72 w-56 rounded-[2rem] border border-[var(--brand-line)] bg-white/50 shadow-[0_30px_80px_-40px_rgba(12,36,48,0.45)] backdrop-blur-sm md:block">
            <div className="border-b border-[var(--brand-line)] px-5 py-4">
              <p className="text-xs tracking-[0.2em] text-[var(--brand-teal)] uppercase">
                October
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--brand-ink)]">
                15
              </p>
              <p className="text-sm text-[var(--brand-ink-soft)]">AEP opens</p>
            </div>
            <div className="space-y-3 px-5 py-5 text-sm text-[var(--brand-ink-soft)]">
              <p className="rounded-lg bg-[var(--brand-sea)]/25 px-3 py-2 text-[var(--brand-ink)]">
                Dec 7 · last day to change for Jan 1
              </p>
              <p>IEP · OEP · GEP · SEP</p>
              <p>Part B · Part D · IRMAA</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
          <p className="animate-rise font-[family-name:var(--font-display)] text-5xl tracking-tight text-[var(--brand-ink)] sm:text-6xl md:text-7xl">
            FreeMedicareTools
            <span className="text-[var(--brand-teal)]">.com</span>
          </p>
          <p className="animate-rise-delay-1 mt-3 text-sm tracking-[0.06em] text-[var(--brand-ink-soft)] sm:text-base">
            <PoweredBy />
          </p>
          <h1 className="animate-rise-delay-1 mt-5 max-w-2xl font-[family-name:var(--font-display)] text-2xl leading-snug text-[var(--brand-ink)] sm:text-3xl md:text-4xl">
            Free tools that make enrollment deadlines—and costly mistakes—impossible to ignore.
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-xl text-base leading-relaxed text-[var(--brand-ink-soft)] sm:text-lg">
            Built for people turning 65 and for members navigating AEP and OEP every year. Diagnose your window, penalties, and coverage lean—then book a free consult when you want an agent in your corner.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
              )}
            >
              Open the free tool kit
            </Link>
            <Link
              href="/glossary"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-[var(--brand-line)] bg-white/60"
              )}
            >
              Acronyms & glossary
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--brand-line)]/80 bg-white/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--brand-ink)]">
            One job per tool
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--brand-ink-soft)]">
            Hormozi-style lead magnets: give away the diagnosis for free. Keep the enrollment representation for when it counts.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {TOOLS.map((tool, i) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-2xl border border-[var(--brand-line)] bg-[var(--brand-mist)]/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--brand-teal)]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="text-xs tracking-[0.16em] text-[var(--brand-teal)] uppercase">
                  {tool.audience === "turning-65"
                    ? "Turning 65"
                    : tool.audience === "enrolled"
                      ? "Already enrolled"
                      : "Both"}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)] group-hover:text-[var(--brand-teal-deep)]">
                  {tool.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
                  {tool.problem}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ConsultCta />
      </section>
    </div>
  );
}
