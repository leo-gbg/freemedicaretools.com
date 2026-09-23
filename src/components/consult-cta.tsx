import Link from "next/link";
import { PoweredBy } from "@/components/powered-by";
import { BRAND } from "@/lib/brand";
import { btnAmber, btnOutline, consultMailto, PHONE_PLACEHOLDER } from "@/lib/visual";
import { cn } from "@/lib/utils";

type ConsultCtaProps = {
  context?: string;
  compact?: boolean;
};

export function PhonePlaceholder({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      role="note"
      aria-label="Placeholder. A phone number is not published on this site."
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-medium",
        onDark
          ? "border border-white/35 text-white"
          : "border border-[var(--brand-input)] text-[var(--brand-ink-soft)]",
        className
      )}
    >
      Call {PHONE_PLACEHOLDER}
    </span>
  );
}

export function ConsultCta({ context, compact = false }: ConsultCtaProps) {
  const href = consultMailto(context);

  if (compact) {
    return (
      <a href={href} className={cn(btnAmber, "px-4")}>
        Book a free consult
      </a>
    );
  }

  return (
    <aside className="relative overflow-hidden rounded-[24px] bg-[var(--brand-ink)] px-6 py-8 text-white shadow-[0_20px_60px_-30px_rgba(12,36,48,0.55)] sm:px-8">
      <p className="text-sm font-medium tracking-[0.16em] text-[var(--brand-amber)] uppercase">
        Talk it through
      </p>
      <h2 className="mt-2 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-snug text-balance text-white md:text-4xl">
        The tools explain the rules. A free consult applies them to you.
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-white/80">
        This site is educational and does not sign you up for a plan. Email{" "}
        <a className="underline underline-offset-2" href={`mailto:${BRAND.email}`}>
          {BRAND.email}
        </a>{" "}
        if you want to talk.{" "}
        <PoweredBy
          className="text-white/80"
          linkClassName="text-[var(--brand-amber)] hover:text-white"
        />
        .
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a href={href} className={btnAmber}>
          Book a free consult
        </a>
        <PhonePlaceholder onDark />
        <Link href="/tools" className={cn(btnOutline, "border-white/30 bg-transparent text-white hover:bg-white/10")}>
          Browse all tools
        </Link>
      </div>
    </aside>
  );
}
