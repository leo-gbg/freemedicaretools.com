import type { Metadata } from "next";
import Link from "next/link";
import { EmailLink, LegalPage, LegalSection } from "@/components/legal-page";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${BRAND.domain} handles your information. The tools run in your browser. Email to agent sends the worksheet by regular email to Leo Adaoag. The website keeps no copy. Copies in the agent@ mailbox (Inbox, Sent, and Trash) are deleted within 14 days after they arrive.`,
};

/** Replace with the real publish date right before merge. Not a publish date yet. */
const EFFECTIVE_DATE = "To be set at publish";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          The short version: the tools run in your browser. Worksheet answers stay in this browser
          tab unless you check the consent box and click Email to agent. That sends them by regular
          email to Leo Adaoag, a licensed insurance agent with Guardian Benefits Group. The website
          itself keeps no copy. Copies in the agent@freemedicaretools.com mailbox (Inbox, Sent, and
          Trash) are deleted within 14 days after they arrive. Leo may keep what he needs to
          compare plans for you in our client records (see section 4). If you email us any other
          way, we get what you choose to send.
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
            <strong>Through the tools:</strong> there are no accounts and no sign-up forms.
            Answers stay in this browser tab until you close it. The worksheet email button,
            described below, is the one action that sends what you typed.
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
          back and change an answer. Closing the tab erases that copy. The Client Worksheet email
          button is the exception, and it is described in the next section.
        </p>
      </LegalSection>

      <LegalSection n={4} title="The Client Worksheet">
        <ul>
          <li>
            Until you send it, your answers are kept only in this browser tab (the browser&apos;s
            &ldquo;sessionStorage&rdquo;), so you can print the worksheet and come back to edit it.
          </li>
          <li>
            They are erased when you close the tab, or right away when you choose &ldquo;Clear
            worksheet.&rdquo;
          </li>
          <li>We never ask for your Medicare number (MBI) or Social Security number.</li>
          <li>
            If you check the consent box and click Email to agent, the worksheet you entered
            (contact details, date of birth, coverage answers, prescriptions, doctors, and notes)
            is sent by regular email, with a PDF copy, to Leo Adaoag at agent@freemedicaretools.com.
            The website doesn&apos;t store it. Copies in the agent@freemedicaretools.com mailbox
            (Inbox, Sent, and Trash) are deleted within 14 days after they arrive. Before then, Leo
            may copy what he needs to compare plans for you into our client records. If you become a
            client, we keep those records for as long as the law and our insurance company contracts
            require. If you don&apos;t, we delete them within 1 year of our last contact.
            Please don&apos;t type a Medicare number (MBI), Social Security number, or bank or card
            details anywhere on the worksheet.
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
          We use your email and phone number only to reply to your request and, if you sent the
          worksheet and agreed, to compare Medicare plans for you and contact you about that. We
          don&apos;t sell your information. We share it only with service providers that help us run
          our agency, such as our email host and client management system, and, if you decide to
          apply for a plan, with that insurance company. We don&apos;t add you to marketing lists
          without your permission.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Your choices">
        <p>
          Email <EmailLink /> to ask what we have from you, or to ask us to delete your messages or
          to delete a worksheet you sent.
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
