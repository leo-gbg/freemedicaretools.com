import type { Metadata } from "next";
import { ClassDisclosures } from "@/components/class-disclosures";
import { btnAmber, btnOutline } from "@/lib/visual";

const SLIDES_PDF = "/classes/medicare101-v6.pdf";
const SLIDES_FILENAME = "medicare101-v6.pdf";

export const metadata: Metadata = {
  title: "Medicare 101 Class Slides",
  description:
    "Educational slides from the Free Medicare 101 class presented by Leo Adaoag, MBA, RSSA®.",
  robots: { index: false, follow: false },
};

export default function ClassSlidesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-teal-deep)] uppercase">
        Free Medicare 101
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-balance text-[var(--brand-ink)] sm:text-5xl">
        Medicare 101 Class Slides
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--brand-ink-soft)]">
        These slides are educational and from the Free Medicare 101 class presented by Leo Adaoag,
        MBA, RSSA®.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href={SLIDES_PDF} download={SLIDES_FILENAME} className={`${btnAmber} w-full sm:w-auto`}>
          Download PDF
        </a>
        <a
          href={SLIDES_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnOutline} w-full sm:w-auto md:hidden`}
        >
          View the slides
          <span className="sr-only">, opens in a new tab</span>
        </a>
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-[20px] border border-[var(--brand-line)] bg-white shadow-[0_16px_40px_-28px_rgba(12,36,48,0.35)] md:block">
        <iframe
          title="Medicare 101 class slides"
          src={SLIDES_PDF}
          className="h-[min(80vh,52rem)] min-h-[28rem] w-full bg-white"
        />
      </div>

      <ClassDisclosures />
    </div>
  );
}
