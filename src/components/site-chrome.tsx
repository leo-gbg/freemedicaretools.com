"use client";

import Link from "next/link";
import { useState } from "react";
import { PoweredBy } from "@/components/powered-by";
import { BRAND } from "@/lib/brand";
import { btnAmber, consultMailto } from "@/lib/visual";

const LINKS = [
  { href: "/tools", label: "Tool kit" },
  { href: "/glossary", label: "Glossary" },
  { href: "/research", label: "Why these tools" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const mailto = consultMailto();

  return (
    <header className="relative z-20 border-b border-[var(--brand-line)] bg-[var(--brand-paper)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0" onClick={() => setOpen(false)}>
          <span className="flex min-w-0 items-baseline gap-1.5">
            <span className="truncate font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--brand-ink)] sm:text-2xl">
              FreeMedicareTools
            </span>
            <span className="hidden text-base text-[var(--brand-teal-deep)] sm:inline">.com</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base text-[var(--brand-ink-soft)] transition-colors hover:text-[var(--brand-ink)]"
            >
              {link.label}
            </Link>
          ))}
          <a href={mailto} className={btnAmber}>
            Book a free consult
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex size-12 items-center justify-center rounded-xl border border-[var(--brand-input)] bg-white text-[var(--brand-ink)] md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            {open ? (
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="site-menu"
          className="border-t border-[var(--brand-line)] bg-white px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-12 items-center text-base text-[var(--brand-ink)]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <a href={mailto} className={`${btnAmber} w-full`}>
                Book a free consult
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--brand-line)] bg-[var(--brand-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-base text-[var(--brand-ink-soft)] sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p>
            © {new Date().getFullYear()} {BRAND.domain}
          </p>
          <p className="font-medium text-[var(--brand-ink)]">
            <PoweredBy linkClassName="font-medium text-[var(--brand-ink)] hover:text-[var(--brand-teal-deep)]" />
          </p>
          <p>This site is educational and does not sign you up for a plan.</p>
        </div>
        <p className="max-w-md md:text-right">
          Not affiliated with the U.S. government, CMS, or Medicare. Not legal, tax, or official
          benefits advice.
        </p>
      </div>
    </footer>
  );
}
