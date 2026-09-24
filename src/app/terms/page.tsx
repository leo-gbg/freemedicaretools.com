import type { Metadata } from "next";
import { EmailLink, LegalPage, LegalSection } from "@/components/legal-page";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `Terms for using ${BRAND.domain}: educational Medicare tools, estimates only, not official benefits advice.`,
};

const EFFECTIVE_DATE = "September 24, 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          By using {BRAND.domain}, you agree to these terms. They are short, and written in plain
          English.
        </p>
      }
    >
      <LegalSection n={1} title="Educational use only">
        <p>
          The tools and pages on this site are for education. They are not legal, tax, medical, or
          official benefits advice.
        </p>
      </LegalSection>

      <LegalSection n={2} title="No enrollment, no obligation">
        <p>
          This site does not enroll you in any plan. You are never required to request a consult.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Estimates, not guarantees">
        <p>
          The tools use published 2026 figures, which can change. Results are estimates only, and
          we do not guarantee that they are accurate or complete for your situation. Confirm
          anything important with{" "}
          <a
            href="https://www.medicare.gov"
            className="font-medium text-[var(--brand-teal-deep)] underline underline-offset-4"
            rel="noopener noreferrer"
            target="_blank"
          >
            Medicare.gov
          </a>
          , 1-800-MEDICARE, or Social Security.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Not a government website">
        <p>
          We are not affiliated with the U.S. government, the Centers for Medicare &amp; Medicaid
          Services (CMS), or Medicare.
        </p>
      </LegalSection>

      <LegalSection n={5} title="No agent–client relationship">
        <p>
          Using this site, or emailing us, does not create an agent–client relationship.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Provided “as is”">
        <p>
          The site is provided &ldquo;as is,&rdquo; without warranties of any kind. To the fullest
          extent the law allows, we are not liable for any loss or damage that comes from using the
          site or relying on its results.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Changes and contact">
        <p>
          We may update these terms. When we do, we will change the effective date at the top.
          Questions? Email <EmailLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
