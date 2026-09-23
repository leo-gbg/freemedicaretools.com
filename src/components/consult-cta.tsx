import Link from "next/link";
import { PoweredBy } from "@/components/powered-by";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type ConsultCtaProps = {
  context?: string;
  compact?: boolean;
};

export function ConsultCta({ context, compact = false }: ConsultCtaProps) {
  const subject = encodeURIComponent(
    context
      ? `Free Medicare consult — ${context}`
      : "Book a free Medicare consult"
  );
  const href = `mailto:${BRAND.email}?subject=${subject}`;

  if (compact) {
    return (
      <a
        href={href}
        className={cn(
          buttonVariants({ size: "sm" }),
          "bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
        )}
      >
        Book a free consult
      </a>
    );
  }

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-[var(--brand-ink)] px-6 py-8 text-[var(--brand-mist)] shadow-[0_20px_60px_-30px_rgba(12,36,48,0.55)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--brand-teal)]/25 blur-3xl"
      />
      <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.18em] text-[var(--brand-sea)] uppercase">
        Next step
      </p>
      <h3 className="mt-2 max-w-xl font-[family-name:var(--font-display)] text-2xl leading-snug text-white md:text-3xl">
        Free tools diagnose the problem. A licensed agent helps you enroll with confidence.
      </h3>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--brand-mist)]/80">
        During IEP, AEP, or OEP, walk through your doctors, drugs, and deadlines together—no
        pressure, compliance-safe guidance.{" "}
        <PoweredBy
          className="text-[var(--brand-mist)]/80"
          linkClassName="text-[var(--brand-sea)] hover:text-white"
        />
        .
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={href}
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[var(--brand-sea)] text-[var(--brand-ink)] hover:bg-[var(--brand-sea)]/90"
          )}
        >
          Book a free consult
        </a>
        <Link
          href="/tools"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "text-[var(--brand-mist)] hover:bg-white/10 hover:text-white"
          )}
        >
          Browse all tools
        </Link>
      </div>
    </aside>
  );
}
