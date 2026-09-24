export type ToolMeta = {
  slug: string;
  title: string;
  shortTitle: string;
  audience: "turning-65" | "enrolled" | "both";
  blurb: string;
  problem: string;
  hormoziHook: string;
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "iep-timeline",
    title: "IEP Timeline Calculator",
    shortTitle: "IEP Timeline",
    audience: "turning-65",
    blurb: "Pin your 7-month Initial Enrollment Period to your birthday.",
    problem: "People miss the IEP and trigger delayed coverage or lifelong penalties.",
    hormoziHook: "Know your exact enrollment window in under a minute.",
  },
  {
    slug: "penalty-estimator",
    title: "Late Enrollment Penalty Estimator",
    shortTitle: "Penalty Estimator",
    audience: "both",
    blurb:
      "See one year of the Part B and Part D late penalty, in dollars. The extra usually continues for life.",
    problem: "Penalties feel abstract until someone sees the monthly extra for one year.",
    hormoziHook: "Turn “I’ll deal with it later” into a concrete monthly number.",
  },
  {
    slug: "period-finder",
    title: "Which Enrollment Window Am I In Today?",
    shortTitle: "Enrollment Window Today",
    audience: "both",
    blurb: "Untangle IEP, AEP, OEP, GEP, and SEPs for your situation.",
    problem: "Mixing up AEP and OEP (or OEP and GEP) locks people out of the change they need.",
    hormoziHook: "Stop guessing which calendar rules apply to you right now.",
  },
  {
    slug: "path-quiz",
    title: "Coverage Path Quiz",
    shortTitle: "Path Quiz",
    audience: "both",
    blurb: "See whether your priorities lean Advantage or Original + Medigap.",
    problem: "Parts A/B/C/D and “supplement vs Advantage” overwhelm first-time shoppers.",
    hormoziHook: "Get a directional lean before you drown in 40 plan options.",
  },
  {
    slug: "med-supp-compare",
    title: "Medigap (Med-Supp) Plan Letter Guide",
    shortTitle: "Med-Supp Compare",
    audience: "both",
    blurb:
      "Learn which Medigap letter fits your priorities and compare standardized Plan G, N, F, and more.",
    problem:
      "People confuse Medigap letters, miss that benefits are standardized, and cannot tell G vs N vs legacy F apart.",
    hormoziHook: "Pick a letter with eyes open—then get local premium quotes from an agent.",
  },
  {
    slug: "client-worksheet",
    title: "Medicare Client Consult Worksheet",
    shortTitle: "Client Worksheet",
    audience: "both",
    blurb:
      "List your doctors, prescriptions, and contact details—then print a PDF to bring to your agent.",
    problem:
      "Consults stall when clients forget drug lists, must-keep doctors, or ZIP details that drive plan options.",
    hormoziHook: "Walk into the consult prepared—and email the PDF ahead if you prefer.",
  },
  {
    slug: "irmaa-checker",
    title: "IRMAA Bracket Checker",
    shortTitle: "IRMAA Checker",
    audience: "enrolled",
    blurb: "Estimate 2026 Part B and Part D income-related surcharges.",
    problem: "Higher-income retirees are surprised by IRMAA two years after a big earnings year.",
    hormoziHook: "Preview the surcharge before Social Security withholds it.",
  },
  {
    slug: "working-past-65",
    title: "Still Working Past 65?",
    shortTitle: "Working Past 65",
    audience: "turning-65",
    blurb: "Check whether delaying Part B looks safe given employer coverage.",
    problem: "People assume any other coverage lets them wait—COBRA and small-employer plans often don’t.",
    hormoziHook: "Pressure-test the “I’ll stay on my job plan” decision.",
  },
  {
    slug: "aep-checklist",
    title: "AEP Annual Review Checklist",
    shortTitle: "AEP Checklist",
    audience: "enrolled",
    blurb: "A practical Oct 15–Dec 7 review so you don’t sleepwalk into next year.",
    problem: "Most enrollees never re-shop even when formularies, networks, and premiums change.",
    hormoziHook: "A 10-minute checklist that makes re-enrollment feel manageable.",
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
