export type OfficialLink = {
  href: string;
  label: string;
};

/**
 * Visible sentence on every tool and in the site footer.
 * "Medicare.gov" is rendered as a link; the words stay in this order.
 */
export const OFFICIAL_SOURCE_SENTENCE =
  "For official information and to compare all plans in your area, visit Medicare.gov or call 1-800-MEDICARE (TTY 1-877-486-2048).";

export const MEDICARE_PLAN_FINDER = "https://www.medicare.gov/plan-compare/";
export const MEDICARE_ENROLLMENT_PERIODS =
  "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan";
export const MEDICARE_SPECIAL_ENROLLMENT =
  "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan/special-enrollment-periods";
export const MEDICARE_PENALTIES =
  "https://www.medicare.gov/basics/costs/medicare-costs/avoid-penalties";
export const MEDICARE_COSTS = "https://www.medicare.gov/basics/costs/medicare-costs";
export const MEDICARE_MEDIGAP = "https://www.medicare.gov/health-drug-plans/medigap";
export const MEDICARE_MEDIGAP_BENEFITS =
  "https://www.medicare.gov/health-drug-plans/medigap/basics/compare-plan-benefits";
export const MEDICARE_WORKING_PAST_65 =
  "https://www.medicare.gov/basics/get-started-with-medicare/medicare-basics/working-past-65";
export const MEDICARE_CREDITABLE =
  "https://www.medicare.gov/health-drug-plans/part-d/basics/creditable-coverage";

/** Deep links that fit each tool. Labels name the official page, not a plan. */
export const TOOL_OFFICIAL_LINKS: Record<string, OfficialLink[]> = {
  "iep-timeline": [{ href: MEDICARE_ENROLLMENT_PERIODS, label: "Enrollment periods" }],
  "penalty-estimator": [
    { href: MEDICARE_PENALTIES, label: "Part B and Part D late penalties" },
  ],
  "period-finder": [
    { href: MEDICARE_ENROLLMENT_PERIODS, label: "Enrollment periods" },
    { href: MEDICARE_SPECIAL_ENROLLMENT, label: "Special Enrollment Periods" },
  ],
  "path-quiz": [
    { href: MEDICARE_PLAN_FINDER, label: "Medicare Plan Finder" },
    { href: MEDICARE_MEDIGAP, label: "Medigap basics" },
  ],
  "med-supp-compare": [
    { href: MEDICARE_MEDIGAP, label: "Medigap basics" },
    { href: MEDICARE_MEDIGAP_BENEFITS, label: "Medigap benefits by letter" },
  ],
  "client-worksheet": [{ href: MEDICARE_PLAN_FINDER, label: "Medicare Plan Finder" }],
  "irmaa-checker": [{ href: MEDICARE_COSTS, label: "Medicare costs" }],
  "working-past-65": [
    { href: MEDICARE_WORKING_PAST_65, label: "Working past 65" },
    { href: MEDICARE_PENALTIES, label: "Part B late penalty" },
    { href: MEDICARE_CREDITABLE, label: "Creditable drug coverage" },
  ],
  "aep-checklist": [
    { href: MEDICARE_PLAN_FINDER, label: "Medicare Plan Finder" },
    { href: MEDICARE_ENROLLMENT_PERIODS, label: "Enrollment periods" },
  ],
};
