import Link from "next/link";
import { PoweredBy } from "@/components/powered-by";
import { TPMO_COUNTS, TPMO_DISCLAIMER } from "@/lib/medicare/tpmo";
import { btnAmber, btnOutline, consultMailto } from "@/lib/visual";
import { cn } from "@/lib/utils";

type ConsultCtaProps = {
  context?: string;
  compact?: boolean;
  label?: string;
};

export function ConsultCta({
  context,
  compact = false,
  label = "Request a free consult",
}: ConsultCtaProps) {
  const href = consultMailto(context);

  if (compact) {
    return (
      <a href={href} className={cn(btnAmber, "px-4")}>
        Request a free consult
      </a>
    );
  }

  return (
    <aside className="relative overflow-hidden rounded-[24px] bg-[var(--brand-ink)] px-6 py-8 text-white shadow-[0_20px_60px_-30px_rgba(12,36,48,0.55)] sm:px-8">
      <p className="text-sm font-medium tracking-[0.16em] text-[var(--brand-amber)] uppercase">
        Optional
      </p>
      <h2 className="mt-2 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-snug text-balance text-white md:text-4xl">
        Questions about your own situation? A licensed agent can talk them through with you.
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-white/80">
        You can stop here. If you want, a licensed agent can look at your doctors, prescriptions,
        and how you use care. This site is educational and does not sign you up for a plan.{" "}
        <PoweredBy
          className="text-white/80"
          linkClassName="text-[var(--brand-amber)] hover:text-white"
        />
        .
      </p>
      <p className="mt-3 text-base text-white">
        Or call{" "}
        <a href="tel:+17026272605" className="font-medium text-[var(--brand-amber)] underline underline-offset-4">
          702-627-2605
        </a>{" "}
        (TTY 711).
      </p>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-white">{TPMO_DISCLAIMER}</p>
      <p className="mt-2 max-w-3xl text-base leading-relaxed text-white/90">{TPMO_COUNTS}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a href={href} className={btnAmber}>
          {label}
        </a>
        <Link href="/tools" className={cn(btnOutline, "border-white/30 bg-transparent text-white hover:bg-white/10")}>
          Browse all tools
        </Link>
      </div>
    </aside>
  );
}
