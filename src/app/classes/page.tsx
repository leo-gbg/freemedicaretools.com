import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CLASS_PAGE, formatClassWhen, upcomingClasses } from "@/lib/classes";
import { btnAmber } from "@/lib/visual";

export const metadata: Metadata = {
  title: CLASS_PAGE.headline,
  description:
    "A free, educational Medicare 101 class on Google Meet with Leo Adaoag, MBA, RSSA®. No plans are discussed or sold, and attending does not require a consult.",
};

export default async function ClassesPage() {
  await connection();
  const sessions = upcomingClasses();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
        {CLASS_PAGE.meet} · Pacific Time
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-balance text-[var(--brand-ink)] sm:text-5xl">
        {CLASS_PAGE.headline}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--brand-ink-soft)]">{CLASS_PAGE.intro}</p>

      <p
        role="note"
        className="mt-8 rounded-[20px] border border-[var(--brand-teal)] bg-[var(--brand-teal-tint)] px-5 py-5 text-lg leading-relaxed font-medium text-[var(--brand-ink)]"
      >
        {CLASS_PAGE.notice}
      </p>

      <section className="mt-10" aria-labelledby="learn-heading">
        <h2
          id="learn-heading"
          className="font-[family-name:var(--font-display)] text-3xl text-[var(--brand-ink)]"
        >
          {CLASS_PAGE.learnHeading}
        </h2>
        <ul className="mt-4 list-none space-y-2 text-lg leading-relaxed text-[var(--brand-ink)]">
          {CLASS_PAGE.learn.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-[var(--brand-teal)]" />
              <span>
                {item === "How to use the free tools on this site" ? (
                  <Link
                    href="/tools"
                    className="font-medium text-[var(--brand-teal-deep)] underline underline-offset-4"
                  >
                    {item}
                  </Link>
                ) : (
                  item
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="upcoming-heading">
        <h2
          id="upcoming-heading"
          className="font-[family-name:var(--font-display)] text-3xl text-[var(--brand-ink)]"
        >
          {CLASS_PAGE.upcomingHeading}
        </h2>
        {sessions.length === 0 ? (
          <p className="mt-4 text-lg text-[var(--brand-ink-soft)]">{CLASS_PAGE.empty}</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {sessions.map((session) => {
              const when = formatClassWhen(session);
              return (
                <li key={when.id}>
                  <article className="rounded-[20px] border border-[var(--brand-line)] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(12,36,48,0.35)] sm:p-6">
                    <h3
                      id={when.id}
                      className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)] sm:text-3xl"
                    >
                      {when.dateLabel}
                    </h3>
                    <p className="mt-2 text-lg text-[var(--brand-ink)]">{when.timeLabel}</p>
                    <p className="mt-1 text-base text-[var(--brand-ink-soft)]">
                      {CLASS_PAGE.meet} · {CLASS_PAGE.duration}
                    </p>
                    <a
                      href={session.rsvpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btnAmber} mt-5 w-full sm:w-auto`}
                      aria-describedby={when.id}
                    >
                      {CLASS_PAGE.reserve}
                      <span className="sr-only">, opens in a new tab</span>
                    </a>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
            Privacy
          </Link>
        </p>
      </section>
    </div>
  );
}
