import Link from "next/link";
import { CLASS_PAGE } from "@/lib/classes";

/** CMS TPMO disclaimer, licensing line, and contact line shared by class pages. */
export function ClassDisclosures() {
  return (
    <section className="mt-12 space-y-4 border-t border-[var(--brand-line)] pt-8 text-base leading-relaxed text-[var(--brand-ink)]">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
        Important information
      </h2>
      <p>{CLASS_PAGE.tpmo}</p>
      <p>{CLASS_PAGE.affiliation}</p>
      <p>
        {CLASS_PAGE.questionsLabel}{" "}
        <a
          href={CLASS_PAGE.phoneHref}
          className="font-medium text-[var(--brand-teal-deep)] underline underline-offset-4"
        >
          {CLASS_PAGE.phoneDisplay}
        </a>{" "}
        {CLASS_PAGE.tty}
      </p>
      <p>
        <Link
          href="/privacy"
          className="inline-flex min-h-12 items-center font-medium text-[var(--brand-teal-deep)] underline underline-offset-4"
        >
          {CLASS_PAGE.privacyLabel}
        </Link>
      </p>
    </section>
  );
}
