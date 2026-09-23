import Link from "next/link";
import { ConsultCta } from "@/components/consult-cta";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Research: problems these tools solve",
};

const PAINS = [
  {
    title: "Enrollment windows feel like a secret calendar",
    detail:
      "IEP, AEP, OEP, GEP, and SEPs overlap in confusing ways. OEP and GEP even share Jan 1–Mar 31 dates but serve different people. Missing the right window delays coverage or locks someone into the wrong plan until the next season.",
    tool: "/tools/period-finder",
  },
  {
    title: "Turning 65 without a clear IEP plan",
    detail:
      "People who are not already on Social Security are not always auto-enrolled or notified. The 7-month Initial Enrollment Period is the highest-leverage moment—and the easiest to miss while still working.",
    tool: "/tools/iep-timeline",
  },
  {
    title: "Late penalties are lifelong and abstract",
    detail:
      "Part B and Part D late enrollment penalties can follow someone for life. Until the monthly and 10-year dollars are visible, “I’ll deal with it later” feels safe.",
    tool: "/tools/penalty-estimator",
  },
  {
    title: "Advantage vs Original + Medigap overwhelms",
    detail:
      "Focus groups and KFF research show beneficiaries struggle with Parts A/B/C/D and confuse supplements with Advantage. Marketing noise makes it worse. A directional quiz lowers the cognitive load before plan shopping.",
    tool: "/tools/path-quiz",
  },
  {
    title: "Working past 65 creates false confidence",
    detail:
      "COBRA, retiree coverage, marketplace plans, and small-employer coverage often do not protect against Part B penalties the way active large-employer coverage can. HSA rules add another trap when Part A starts.",
    tool: "/tools/working-past-65",
  },
  {
    title: "Enrollees sleepwalk through AEP",
    detail:
      "Most people do not re-shop even when formularies, networks, and premiums change. An annual checklist is a way to read the notice of change before December 7.",
    tool: "/tools/aep-checklist",
  },
];

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-ink)] sm:text-5xl">
        Why these tools
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--brand-ink-soft)]">
        These pages explain why the tools exist: Medicare timing and plan types are easy to mix up. Nothing here signs you up for coverage. A consult is optional, by email, if you want to talk through a result.
      </p>
      <p className="mt-3 text-sm text-[var(--brand-ink-soft)]">
        Research themes drawn from MedPAC focus groups, KFF beneficiary interviews, and CMS enrollment-period rules (2026 cost figures where tools show dollars).
      </p>

      <ol className="mt-10 space-y-8">
        {PAINS.map((pain, i) => (
          <li key={pain.title} className="border-t border-[var(--brand-line)] pt-6">
            <p className="text-xs tracking-[0.16em] text-[var(--brand-teal)] uppercase">
              Problem {i + 1}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
              {pain.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
              {pain.detail}
            </p>
            <Link
              href={pain.tool}
              className="mt-3 inline-block text-sm text-[var(--brand-teal)] hover:text-[var(--brand-teal-deep)]"
            >
              Open matching tool →
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/tools"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          )}
        >
          Browse the tool kit
        </Link>
      </div>

      <div className="mt-14">
        <ConsultCta />
      </div>
    </div>
  );
}
