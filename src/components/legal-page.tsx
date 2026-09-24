import { BRAND } from "@/lib/brand";

/** Shared layout for /privacy and /terms: narrow column, display-font headings, 18px body. */
export function LegalPage({
  title,
  effectiveDate,
  intro,
  children,
}: {
  title: string;
  effectiveDate: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
        Effective date: {effectiveDate}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-ink)] sm:text-5xl">
        {title}
      </h1>
      <div className="mt-4 text-lg leading-relaxed text-[var(--brand-ink-soft)]">{intro}</div>
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

export function LegalSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--brand-line)] pt-6">
      <h2 className="flex items-baseline gap-3 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)] sm:text-3xl">
        <span className="text-base font-medium text-[var(--brand-teal-deep)]">{n}.</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-lg leading-relaxed text-[var(--brand-ink)] [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

export function EmailLink() {
  return (
    <a
      href={`mailto:${BRAND.email}`}
      className="font-medium text-[var(--brand-teal-deep)] underline underline-offset-4"
    >
      {BRAND.email}
    </a>
  );
}
