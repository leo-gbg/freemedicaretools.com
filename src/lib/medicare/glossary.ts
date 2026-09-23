export type GlossaryCategory =
  | "enrollment"
  | "parts-plans"
  | "costs"
  | "coverage"
  | "programs";

export type GlossaryEntry = {
  id: string;
  term: string;
  /** Short form for hover tips; omit for terms that are not acronyms. */
  acronym?: string;
  category: GlossaryCategory;
  short: string;
  long: string;
  alsoCalled?: string[];
  relatedTool?: { href: string; label: string };
};

export const GLOSSARY_CATEGORIES: {
  id: GlossaryCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "enrollment",
    label: "Enrollment windows",
    description: "When you can sign up or change coverage.",
  },
  {
    id: "parts-plans",
    label: "Parts & plan types",
    description: "How Medicare is structured and what you can buy.",
  },
  {
    id: "costs",
    label: "Costs & money",
    description: "Premiums, deductibles, penalties, and income-related charges.",
  },
  {
    id: "coverage",
    label: "How coverage works",
    description: "Networks, drugs, providers, and day-to-day rules.",
  },
  {
    id: "programs",
    label: "Help programs & extras",
    description: "Assistance programs and related benefits language.",
  },
];

export const GLOSSARY: GlossaryEntry[] = [
  // Enrollment
  {
    id: "iep",
    term: "Initial Enrollment Period",
    acronym: "IEP",
    category: "enrollment",
    short:
      "The 7-month window around the month you turn 65 to first enroll in Medicare.",
    long: "Your IEP usually starts 3 months before the month you turn 65, includes your birthday month, and ends 3 months after. Enrolling earlier in the window often means earlier Part B coverage. Missing it without a valid delay reason can lead to late enrollment penalties or a later start date.",
    relatedTool: { href: "/tools/iep-timeline", label: "IEP Timeline Calculator" },
  },
  {
    id: "aep",
    term: "Annual Enrollment Period",
    acronym: "AEP",
    category: "enrollment",
    short:
      "October 15–December 7 each year to change Advantage and Part D plans (or switch between Original Medicare and Advantage).",
    long: "AEP is the main yearly shopping season for people who already have Medicare. Changes made during AEP usually take effect January 1. It is not the same as OEP or GEP, even though those also involve plan or Part A/B decisions.",
    alsoCalled: ["Open Enrollment Period (fall)", "Medicare Open Enrollment"],
    relatedTool: { href: "/tools/aep-checklist", label: "AEP Annual Review Checklist" },
  },
  {
    id: "oep",
    term: "Medicare Advantage Open Enrollment Period",
    acronym: "OEP",
    category: "enrollment",
    short:
      "January 1–March 31. If you are already in an Advantage plan on January 1, you may make one change.",
    long: "OEP is only for people enrolled in a Medicare Advantage plan as of January 1. You can switch to a different Advantage plan or return to Original Medicare (and join a Part D plan). You generally get one OEP change. Do not confuse OEP with GEP—they share the same calendar dates but different rules.",
    relatedTool: {
      href: "/tools/period-finder",
      label: "Which Enrollment Window Am I In Today?",
    },
  },
  {
    id: "gep",
    term: "General Enrollment Period",
    acronym: "GEP",
    category: "enrollment",
    short:
      "January 1–March 31 to sign up for Part A and/or Part B if you missed your IEP and do not qualify for an SEP.",
    long: "GEP is a fallback for people who need Part A or Part B after missing their Initial Enrollment Period and who do not have a Special Enrollment Period. Coverage typically starts the month after enrollment, and late enrollment penalties may apply.",
    relatedTool: {
      href: "/tools/period-finder",
      label: "Which Enrollment Window Am I In Today?",
    },
  },
  {
    id: "sep",
    term: "Special Enrollment Period",
    acronym: "SEP",
    category: "enrollment",
    short:
      "A special window after a qualifying life event (like leaving employer coverage).",
    long: "SEPs unlock enrollment outside AEP when something qualifying happens—ending group coverage from current employment, moving, certain Medicaid or Extra Help changes, and other CMS-defined events. Timing rules differ (for example, Part B after employer coverage often works differently than Part D).",
    relatedTool: { href: "/tools/working-past-65", label: "Still Working Past 65?" },
  },
  // Parts & plans
  {
    id: "part-a",
    term: "Medicare Part A",
    acronym: "Part A",
    category: "parts-plans",
    short: "Hospital insurance—inpatient hospital, skilled nursing (limited), hospice, some home health.",
    long: "Part A is the hospital side of Original Medicare. Most people do not pay a Part A premium if they or a spouse paid Medicare taxes long enough. It does not cover most outpatient doctor visits by itself—that is Part B.",
  },
  {
    id: "part-b",
    term: "Medicare Part B",
    acronym: "Part B",
    category: "parts-plans",
    short: "Medical insurance—doctor visits, outpatient care, preventive services, durable medical equipment.",
    long: "Part B covers outpatient and physician services. Most people pay a monthly premium (standard amount set each year; higher-income people may also pay IRMAA). Delaying Part B without qualifying coverage can trigger a lifelong late enrollment penalty.",
    relatedTool: { href: "/tools/penalty-estimator", label: "Late Enrollment Penalty Estimator" },
  },
  {
    id: "part-c",
    term: "Medicare Part C",
    acronym: "Part C",
    category: "parts-plans",
    short: "Another name for Medicare Advantage—private plans that bundle Part A and Part B (often with extras).",
    long: "Part C is Medicare Advantage. These are private plans approved by Medicare that must cover Part A and Part B benefits, often with networks, copays, and extras like dental or vision. Drug coverage may be included.",
    alsoCalled: ["Medicare Advantage", "MA"],
    relatedTool: { href: "/tools/path-quiz", label: "Coverage Path Quiz" },
  },
  {
    id: "part-d",
    term: "Medicare Part D",
    acronym: "Part D",
    category: "parts-plans",
    short: "Prescription drug coverage, sold as standalone plans or included in many Advantage plans.",
    long: "Part D helps pay for outpatient prescription drugs. Formularies (covered drug lists), tiers, and pharmacies vary by plan. Going without creditable drug coverage after you are eligible can trigger a lifelong Part D late enrollment penalty.",
    relatedTool: { href: "/tools/penalty-estimator", label: "Late Enrollment Penalty Estimator" },
  },
  {
    id: "ma",
    term: "Medicare Advantage",
    acronym: "MA",
    category: "parts-plans",
    short: "Private Medicare plans (Part C) that replace Original Medicare for covered services, usually with a network.",
    long: "Medicare Advantage plans are offered by private insurers. You still have Medicare, but the plan manages your benefits. Expect networks, prior authorization rules, and an annual out-of-pocket maximum. Benefits can change every year—review during AEP.",
    alsoCalled: ["Part C", "MA plan"],
    relatedTool: { href: "/tools/path-quiz", label: "Coverage Path Quiz" },
  },
  {
    id: "medigap",
    term: "Medigap",
    category: "parts-plans",
    short: "Medicare Supplement insurance that helps pay costs Original Medicare leaves behind.",
    long: "Medigap (Medicare Supplement) works with Original Medicare Part A and B. It does not replace Medicare and usually does not include Part D—you buy drug coverage separately. Plan letters (like Plan G or Plan N) standardize benefits; premiums vary by company and state. Underwriting can apply if you enroll outside a protected window.",
    alsoCalled: ["Medicare Supplement", "Supplement"],
    relatedTool: { href: "/tools/med-supp-compare", label: "Medigap (Med-Supp) Plan Letter Guide" },
  },
  {
    id: "original-medicare",
    term: "Original Medicare",
    category: "parts-plans",
    short: "Part A + Part B fee-for-service Medicare administered by the federal government.",
    long: "Original Medicare is traditional Medicare (Parts A and B). You can generally see any provider who accepts Medicare. There is no network like many Advantage plans, but there is also no built-in annual out-of-pocket maximum—people often add Medigap and Part D.",
    alsoCalled: ["Traditional Medicare", "Fee-for-service Medicare"],
  },
  {
    id: "pdp",
    term: "Prescription Drug Plan",
    acronym: "PDP",
    category: "parts-plans",
    short: "A standalone Part D plan for people on Original Medicare (or certain other situations).",
    long: "A PDP is a Part D plan you buy separately from hospital/medical coverage. People on Original Medicare + Medigap typically use a PDP. Many Medicare Advantage plans include drug coverage instead.",
  },
  // Costs
  {
    id: "irmaa",
    term: "Income-Related Monthly Adjustment Amount",
    acronym: "IRMAA",
    category: "costs",
    short: "An extra amount higher-income beneficiaries pay for Part B and Part D.",
    long: "IRMAA is based on your modified adjusted gross income from two years earlier (for example, 2026 uses 2024 tax returns). It adds to your Part B premium and, if you have Part D, to your drug coverage cost. Life events can sometimes support a reconsideration request.",
    relatedTool: { href: "/tools/irmaa-checker", label: "IRMAA Bracket Checker" },
  },
  {
    id: "lep",
    term: "Late Enrollment Penalty",
    acronym: "LEP",
    category: "costs",
    short: "An extra amount added to Part B and/or Part D premiums if you delay enrollment without qualifying coverage.",
    long: "Part B LEP is generally 10% of the standard Part B premium for each full 12-month period you could have had Part B but did not. Part D LEP is generally 1% of the national base beneficiary premium for each full uncovered month without creditable drug coverage. These penalties are typically lifelong.",
    relatedTool: { href: "/tools/penalty-estimator", label: "Late Enrollment Penalty Estimator" },
  },
  {
    id: "premium",
    term: "Premium",
    category: "costs",
    short: "The amount you pay—usually monthly—to keep a plan or Medicare Part in force.",
    long: "Premiums are the “membership fee” for coverage. Examples include the Part B premium, a Medigap premium, a Part D plan premium, or a Medicare Advantage premium (sometimes $0 before IRMAA or plan add-ons).",
  },
  {
    id: "deductible",
    term: "Deductible",
    category: "costs",
    short: "What you pay out of pocket for covered services before the plan starts sharing costs.",
    long: "A deductible is the amount you pay first each benefit period or year before coinsurance or copays kick in for certain services. Part A, Part B, Advantage plans, and Part D plans can each have their own deductible rules.",
  },
  {
    id: "coinsurance",
    term: "Coinsurance",
    category: "costs",
    short: "Your share of costs as a percentage after you meet a deductible (for example, 20%).",
    long: "Coinsurance is a percentage of the Medicare-approved amount (or plan-allowed amount) that you pay. Under Original Medicare Part B, many services use 20% coinsurance after the Part B deductible.",
  },
  {
    id: "copay",
    term: "Copayment (copay)",
    category: "costs",
    short: "A fixed dollar amount you pay for a service or prescription (for example, $25 for a visit).",
    long: "Copays are common in Medicare Advantage and Part D plans. Unlike coinsurance, a copay is usually a set dollar amount rather than a percentage.",
  },
  {
    id: "moop",
    term: "Maximum Out-of-Pocket",
    acronym: "MOOP",
    category: "costs",
    short: "The most you typically pay in a year for covered in-network services under a Medicare Advantage plan.",
    long: "Medicare Advantage plans must include an annual MOOP for Part A and B services. Original Medicare alone does not have a MOOP—Medigap is one way people limit that exposure.",
  },
  {
    id: "magi",
    term: "Modified Adjusted Gross Income",
    acronym: "MAGI",
    category: "costs",
    short: "The income figure Social Security generally uses for IRMAA decisions.",
    long: "MAGI for IRMAA starts from adjusted gross income and adds certain items (such as tax-exempt interest). IRMAA looks back two years. Exact calculations follow Social Security and IRS rules.",
    relatedTool: { href: "/tools/irmaa-checker", label: "IRMAA Bracket Checker" },
  },
  // Coverage mechanics
  {
    id: "formulary",
    term: "Formulary",
    category: "coverage",
    short: "The list of prescription drugs a Part D or Advantage plan covers, usually by tier.",
    long: "Formularies decide which drugs are covered and at what cost tier. Plans can change formularies annually—and sometimes mid-year with notice. Always check your exact drugs and pharmacies before enrolling.",
  },
  {
    id: "network",
    term: "Network",
    category: "coverage",
    short: "The doctors, hospitals, and pharmacies contracted with a Medicare Advantage or other managed plan.",
    long: "Using in-network providers usually costs less (or is required for full coverage) in HMO-style Advantage plans. PPO plans may allow out-of-network care at a higher cost. Original Medicare does not use Advantage-style networks.",
  },
  {
    id: "prior-auth",
    term: "Prior authorization",
    category: "coverage",
    short: "Plan approval required before some services, procedures, or drugs are covered.",
    long: "Prior authorization means the plan reviews medical necessity (or formulary rules) before paying. It is more common in Medicare Advantage and Part D than in Original Medicare + Medigap for many services.",
  },
  {
    id: "referral",
    term: "Referral",
    category: "coverage",
    short: "Permission from a primary care doctor required by some plans before seeing a specialist.",
    long: "HMO Medicare Advantage plans often require referrals. Original Medicare and many PPO designs do not. Confirm rules before you enroll if you see specialists often.",
  },
  {
    id: "creditable-coverage",
    term: "Creditable coverage",
    category: "coverage",
    short: "Drug coverage at least as good as Medicare’s standard Part D benefit—important for avoiding Part D penalties.",
    long: "If you delay Part D, you generally need creditable prescription coverage (often from an employer or union plan) to avoid a late enrollment penalty. Ask your benefits office for a creditable coverage notice in writing.",
    relatedTool: { href: "/tools/working-past-65", label: "Still Working Past 65?" },
  },
  {
    id: "anoc",
    term: "Annual Notice of Change",
    acronym: "ANOC",
    category: "coverage",
    short: "The yearly notice explaining how your plan’s benefits, premiums, and rules will change next year.",
    long: "Plans send an ANOC each fall. Read it during AEP. Premiums, formularies, networks, and cost-sharing can change even if you stay in the same plan name.",
    relatedTool: { href: "/tools/aep-checklist", label: "AEP Annual Review Checklist" },
  },
  {
    id: "eoc",
    term: "Evidence of Coverage",
    acronym: "EOC",
    category: "coverage",
    short: "The detailed document that explains what your plan covers and how to use benefits.",
    long: "The EOC is the plan’s rulebook—benefits, exclusions, appeals, and member responsibilities. Keep it with your enrollment materials.",
  },
  // Programs
  {
    id: "extra-help",
    term: "Extra Help",
    acronym: "LIS",
    category: "programs",
    short: "A federal program that helps people with limited income/resources pay Part D costs (also called Low-Income Subsidy).",
    long: "Extra Help (LIS) can lower or eliminate Part D premiums and reduce drug costs. Qualifying can also affect late enrollment penalty rules. Apply through Social Security; some people are auto-enrolled via Medicaid.",
    alsoCalled: ["Low-Income Subsidy", "LIS"],
  },
  {
    id: "medicaid",
    term: "Medicaid",
    category: "programs",
    short: "A joint federal-state program for people with limited income/resources; can work with Medicare for dual eligibles.",
    long: "If you have both Medicare and Medicaid (dual eligibility), Medicaid may help with premiums and cost-sharing depending on your state and eligibility category. Rules are state-specific.",
  },
  {
    id: "hsa",
    term: "Health Savings Account",
    acronym: "HSA",
    category: "programs",
    short: "A tax-advantaged account paired with a high-deductible health plan; Medicare enrollment usually stops new contributions.",
    long: "Once you enroll in Medicare Part A or B, you generally cannot keep contributing to an HSA. People working past 65 sometimes delay Part A intentionally to preserve HSA contributions—get advice before filing.",
    relatedTool: { href: "/tools/working-past-65", label: "Still Working Past 65?" },
  },
  {
    id: "cobra",
    term: "COBRA",
    category: "programs",
    short: "Continuation of employer group coverage after leaving a job—usually does not protect you from Part B late penalties the same way active employer coverage can.",
    long: "COBRA can extend group health benefits temporarily, but it is often not treated like current employer coverage for Medicare Part B delay rules. Do not assume COBRA lets you safely postpone Part B—confirm before you wait.",
    relatedTool: { href: "/tools/working-past-65", label: "Still Working Past 65?" },
  },
  {
    id: "cms",
    term: "Centers for Medicare & Medicaid Services",
    acronym: "CMS",
    category: "programs",
    short: "The federal agency that runs Medicare and oversees Medicaid and related programs.",
    long: "CMS sets many Medicare rules, publishes yearly costs, and oversees Medicare Advantage and Part D plan standards. FreeMedicareTools.com is not CMS and is not affiliated with the U.S. government.",
  },
];

export function getAcronymTipMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const entry of GLOSSARY) {
    if (!entry.acronym) continue;
    // Normalize keys used by hover tips (Part A → PART A handled separately in tip component)
    const key = entry.acronym.replace(/\s+/g, " ").toUpperCase();
    map[key.replace(/\s/g, "")] = `${entry.acronym} — ${entry.short}`;
    map[key] = `${entry.acronym} — ${entry.short}`;
    // Also index bare letters for IEP-style codes
    if (!entry.acronym.includes(" ")) {
      map[entry.acronym.toUpperCase()] = `${entry.acronym} — ${entry.short}`;
    }
  }
  return map;
}

export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY;
  return GLOSSARY.filter((entry) => {
    const hay = [
      entry.term,
      entry.acronym ?? "",
      entry.short,
      entry.long,
      ...(entry.alsoCalled ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
