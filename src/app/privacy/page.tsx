import type { Metadata } from "next";
import Link from "next/link";
import { EmailLink, LegalPage, LegalSection } from "@/components/legal-page";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${BRAND.domain} handles your information: the tools run in your browser and nothing you type is sent to our servers.`,
};

const EFFECTIVE_DATE = "September 24, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          The short version: the tools run in your browser, and nothing you type into them is sent
          to us. If you email us, we get what you choose to send.
        </p>
      }
    >
      <LegalSection n={1} title="Who we are">
        <p>
          {BRAND.domain} is an educational website powered by {BRAND.poweredBy}. We are not
          affiliated with the U.S. government, the Centers for Medicare &amp; Medicaid Services
          (CMS), or Medicare.
        </p>
      </LegalSection>

      <LegalSection n={2} title="What we collect">
        <ul>
          <li>
            <strong>Through the tools:</strong> nothing is sent to us. There are no accounts and
            no sign-up forms. Answers stay in this browser tab until you close it.
          </li>
          <li>
            <strong>If you email us:</strong> we receive what you choose to send, such as your name,
            email address, and message.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="How the tools work">
        <p>
          The calculators, quizzes, and checklists run in your web browser. Your answers are not
          sent to our servers. A copy stays in this browser tab (sessionStorage) so you can go
          back and change an answer. Closing the tab erases that copy.
        </p>
      </LegalSection>

      <LegalSection n={4} title="The Client Worksheet">
        <ul>
          <li>
            Your answers are kept only in this browser tab (the browser&apos;s
            &ldquo;sessionStorage&rdquo;), so you can print the worksheet and come back to edit it.
          </li>
          <li>
            They are erased when you close the tab, or right away when you choose &ldquo;Clear
            worksheet.&rdquo;
          </li>
          <li>We never ask for your Medicare number (MBI) or Social Security number.</li>
          <li>
            The &ldquo;Email to agent&rdquo; button does not include your worksheet. Please
            don&apos;t put medications, date of birth, Medicaid, or VA details in an email.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="The AEP checklist">
        <p>
          The check marks on the{" "}
          <Link
            href="/tools/aep-checklist"
            className="font-medium text-[var(--brand-teal-deep)] underline underline-offset-4"
          >
            AEP checklist
          </Link>{" "}
          stay in this browser tab only, the same way as the other tools. They are not sent to us.
          Closing the tab removes them.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Cookies and analytics">
        <p>
          This site does not set cookies and does not use analytics or tracking tools today. Our
          hosting provider may keep standard server logs, such as IP address and the pages
          requested, for security and to keep the site running.
        </p>
      </LegalSection>

      <LegalSection n={7} title="How we use emails">
        <p>
          We use your email only to reply to your request. We don&apos;t sell or share your
          information, and we don&apos;t add you to marketing lists without your permission.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Your choices">
        <p>
          Email <EmailLink /> to ask what we have from you, or to ask us to delete your messages.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Children">
        <p>This site is not directed to children under 13.</p>
      </LegalSection>

      <LegalSection n={10} title="Changes to this page">
        <p>
          If this page changes, we will update the effective date at the top. Questions? Email{" "}
          <EmailLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
