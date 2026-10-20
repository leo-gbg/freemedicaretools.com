export type ToolMeta = {
  slug: string;
  title: string;
  shortTitle: string;
  audience: "turning-65" | "enrolled" | "both";
  blurb: string;
  problem: string;
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "iep-timeline",
    title: "IEP Timeline Calculator",
    shortTitle: "IEP Timeline",
    audience: "turning-65",
    blurb: "Pin your 7-month Initial Enrollment Period to your birthday.",
    problem:
      "People miss the IEP and trigger delayed coverage or late enrollment penalties that usually last as long as you have Part B or Part D.",
  },
  {
    slug: "penalty-estimator",
    title: "Late Enrollment Penalty Estimator",
    shortTitle: "Penalty Estimator",
    audience: "both",
    blurb:
      "See one year of the Part B and Part D late penalty, in dollars. The extra usually continues for as long as you have Part B or Part D.",
    problem: "Penalties feel abstract until someone sees the monthly extra for one year.",
  },
  {
    slug: "period-finder",
    title: "Which Enrollment Window Am I In Today?",
    shortTitle: "Enrollment Window Today",
    audience: "both",
    blurb: "Untangle IEP, AEP, OEP, GEP, and SEPs for your situation.",
    problem: "Mixing up AEP and OEP (or OEP and GEP) locks people out of the change they need.",
  },
  {
    slug: "path-quiz",
    title: "Coverage Path Quiz",
    shortTitle: "Path Quiz",
    audience: "both",
    blurb:
      "See how your answers line up with Original Medicare plus Medigap or with Medicare Advantage.",
    problem:
      "Original Medicare plus Medigap and Medicare Advantage are structured differently, and that difference is easy to miss.",
  },
  {
    slug: "med-supp-compare",
    title: "Medigap (Med-Supp) Plan Letter Guide",
    shortTitle: "Med-Supp Compare",
    audience: "both",
    blurb:
      "See what each standardized Medigap letter covers.",
    problem:
      "People confuse Medigap letters, miss that benefits are standardized, and cannot tell G vs N vs legacy F apart.",
  },
  {
    slug: "client-worksheet",
    title: "Medicare Client Consult Worksheet",
    shortTitle: "Client Worksheet",
    audience: "both",
    blurb:
      "List your doctors, prescriptions, and contact details for your own records. A consult is optional.",
    problem:
      "People lose track of the doctors, prescriptions, and ZIP details they need when they read Medicare.gov.",
  },
  {
    slug: "irmaa-checker",
    title: "IRMAA Bracket Checker",
    shortTitle: "IRMAA Checker",
    audience: "enrolled",
    blurb: "Estimate 2026 Part B and Part D income-related surcharges.",
    problem: "Higher-income retirees are surprised by IRMAA two years after a big earnings year.",
  },
  {
    slug: "working-past-65",
    title: "Still Working Past 65?",
    shortTitle: "Working Past 65",
    audience: "turning-65",
    blurb: "Check whether delaying Part B may be OK, so confirm with your HR or benefits office.",
    problem: "People assume any other coverage lets them wait—COBRA and small-employer plans often don’t.",
  },
  {
    slug: "aep-checklist",
    title: "AEP Annual Review Checklist",
    shortTitle: "AEP Checklist",
    audience: "enrolled",
    blurb: "A practical Oct 15–Dec 7 review of your coverage for next year.",
    problem: "Most enrollees never re-shop even when formularies, networks, and premiums change.",
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
