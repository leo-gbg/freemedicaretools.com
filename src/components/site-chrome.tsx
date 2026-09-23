import Link from "next/link";
import { ConsultCta } from "@/components/consult-cta";
import { PoweredBy } from "@/components/powered-by";
import { BRAND } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[var(--brand-line)]/70 bg-[var(--brand-paper)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group min-w-0">
          <span className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--brand-ink)] sm:text-2xl">
              FreeMedicareTools
            </span>
            <span className="hidden text-sm text-[var(--brand-teal)] sm:inline">.com</span>
          </span>
          <span className="mt-0.5 block text-[0.65rem] tracking-[0.04em] text-[var(--brand-ink-soft)] sm:text-xs">
            <PoweredBy linkClassName="text-[var(--brand-ink-soft)] hover:text-[var(--brand-teal)]" />
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/tools"
            className="text-sm text-[var(--brand-ink-soft)] transition-colors hover:text-[var(--brand-ink)]"
          >
            Tool kit
          </Link>
          <Link
            href="/glossary"
            className="text-sm text-[var(--brand-ink-soft)] transition-colors hover:text-[var(--brand-ink)]"
          >
            Glossary
          </Link>
          <Link
            href="/research"
            className="hidden text-sm text-[var(--brand-ink-soft)] transition-colors hover:text-[var(--brand-ink)] sm:inline"
          >
            Why these tools
          </Link>
          <ConsultCta compact />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--brand-line)] bg-[var(--brand-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[var(--brand-ink-soft)] sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p>
            © {new Date().getFullYear()} {BRAND.domain} · Educational lead-magnet tools for Medicare
            navigation.
          </p>
          <p className="font-medium text-[var(--brand-ink)]">
            <PoweredBy linkClassName="font-medium text-[var(--brand-ink)] hover:text-[var(--brand-teal)]" />
          </p>
        </div>
        <p className="max-w-md md:text-right">
          Not affiliated with the U.S. government, CMS, or Medicare. Not legal, tax, or official
          benefits advice.
        </p>
      </div>
    </footer>
  );
}
