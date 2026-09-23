/** 2026 Medicare reference figures (CMS). Educational estimates only. */

export const YEAR = 2026;

export const PART_B_STANDARD_PREMIUM = 202.9;
export const PART_B_DEDUCTIBLE = 283;
export const PART_D_BASE_BENEFICIARY_PREMIUM = 38.99;

/** Part B late enrollment: 10% of standard premium per full 12-month period delayed. */
export const PART_B_LEP_RATE_PER_YEAR = 0.1;

export const AEP = {
  label: "Annual Enrollment Period (AEP)",
  startMonth: 9, // October (0-indexed)
  startDay: 15,
  endMonth: 11, // December
  endDay: 7,
  description:
    "Change Medicare Advantage and Part D plans, or switch between Original Medicare and Advantage. Coverage usually starts January 1.",
};

export const OEP = {
  label: "Medicare Advantage Open Enrollment Period (OEP)",
  startMonth: 0, // January
  startDay: 1,
  endMonth: 2, // March
  endDay: 31,
  description:
    "If you are already in a Medicare Advantage plan on January 1, you may make one change: switch to a different Advantage plan or return to Original Medicare (and join a Part D plan).",
};

export const GEP = {
  label: "General Enrollment Period (GEP)",
  startMonth: 0,
  startDay: 1,
  endMonth: 2,
  endDay: 31,
  description:
    "Sign up for Part A and/or Part B if you missed your Initial Enrollment Period and do not qualify for a Special Enrollment Period. Coverage typically starts the month after you enroll. Late penalties may apply.",
};

export type FilingStatus = "single" | "joint" | "separate";

export type IrmaaBracket = {
  id: string;
  singleMin: number;
  singleMax: number | null;
  jointMin: number;
  jointMax: number | null;
  separateMin: number;
  separateMax: number | null;
  partBTotal: number;
  partBSurcharge: number;
  partDSurcharge: number;
};

/** 2026 IRMAA based on 2024 MAGI (CMS). */
export const IRMAA_BRACKETS_2026: IrmaaBracket[] = [
  {
    id: "base",
    singleMin: 0,
    singleMax: 109000,
    jointMin: 0,
    jointMax: 218000,
    separateMin: 0,
    separateMax: 109000,
    partBTotal: 202.9,
    partBSurcharge: 0,
    partDSurcharge: 0,
  },
  {
    id: "tier1",
    singleMin: 109000,
    singleMax: 137000,
    jointMin: 218000,
    jointMax: 274000,
    separateMin: 109000,
    separateMax: 391000,
    partBTotal: 284.1,
    partBSurcharge: 81.2,
    partDSurcharge: 14.5,
  },
  {
    id: "tier2",
    singleMin: 137000,
    singleMax: 171000,
    jointMin: 274000,
    jointMax: 342000,
    separateMin: 109000,
    separateMax: 391000,
    partBTotal: 405.8,
    partBSurcharge: 202.9,
    partDSurcharge: 37.5,
  },
  {
    id: "tier3",
    singleMin: 171000,
    singleMax: 205000,
    jointMin: 342000,
    jointMax: 410000,
    separateMin: 109000,
    separateMax: 391000,
    partBTotal: 527.5,
    partBSurcharge: 324.6,
    partDSurcharge: 60.4,
  },
  {
    id: "tier4",
    singleMin: 205000,
    singleMax: 500000,
    jointMin: 410000,
    jointMax: 750000,
    separateMin: 109000,
    separateMax: 391000,
    partBTotal: 649.2,
    partBSurcharge: 446.3,
    partDSurcharge: 83.3,
  },
  {
    id: "tier5",
    singleMin: 500000,
    singleMax: null,
    jointMin: 750000,
    jointMax: null,
    separateMin: 391000,
    separateMax: null,
    partBTotal: 689.9,
    partBSurcharge: 487.0,
    partDSurcharge: 91.0,
  },
];

export const DISCLAIMER =
  "Educational estimates only—not Medicare, CMS, or Social Security advice. Figures use published 2026 reference amounts and can change. A licensed agent can review your situation before you choose or change coverage.";
