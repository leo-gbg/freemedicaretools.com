/** Standardized Medigap (Medicare Supplement) plan education — not carrier quotes. */

export type CoverageValue = "yes" | "no" | "50%" | "75%" | "partial" | "copay";

export type MedigapBenefitId =
  | "partACoinsurance"
  | "partBCoinsurance"
  | "blood"
  | "hospice"
  | "snf"
  | "partADeductible"
  | "partBDeductible"
  | "partBExcess"
  | "foreignTravel"
  | "outOfPocketLimit";

export type MedigapPlanLetter = "A" | "B" | "D" | "G" | "K" | "L" | "M" | "N" | "F" | "C";

export type MedigapBenefitMeta = {
  id: MedigapBenefitId;
  label: string;
  plain: string;
};

export const MEDIGAP_BENEFITS: MedigapBenefitMeta[] = [
  {
    id: "partACoinsurance",
    label: "Part A coinsurance & hospital costs",
    plain: "Helps with inpatient hospital coinsurance after Medicare pays its share (up to an additional 365 days).",
  },
  {
    id: "partBCoinsurance",
    label: "Part B coinsurance / copay",
    plain: "Usually the 20% you owe for outpatient / doctor services after the Part B deductible.",
  },
  {
    id: "blood",
    label: "Blood (first 3 pints)",
    plain: "Coverage toward the first three pints of blood each year.",
  },
  {
    id: "hospice",
    label: "Part A hospice coinsurance",
    plain: "Helps with hospice-related coinsurance/copay amounts.",
  },
  {
    id: "snf",
    label: "Skilled nursing facility coinsurance",
    plain: "Helps with SNF coinsurance for days 21–100 when Medicare covers the stay.",
  },
  {
    id: "partADeductible",
    label: "Part A deductible",
    plain: "Pays the inpatient hospital deductible each benefit period.",
  },
  {
    id: "partBDeductible",
    label: "Part B deductible",
    plain: "Pays the annual Part B deductible. Only available on plans sold to people first eligible before 2020 (Plan C/F).",
  },
  {
    id: "partBExcess",
    label: "Part B excess charges",
    plain: "Helps if a provider charges more than the Medicare-approved amount (where excess charges are allowed).",
  },
  {
    id: "foreignTravel",
    label: "Foreign travel emergency",
    plain: "Limited emergency care abroad after a deductible—caps apply; not a travel insurance replacement.",
  },
  {
    id: "outOfPocketLimit",
    label: "Out-of-pocket limit",
    plain: "Plans K and L include a yearly out-of-pocket maximum; after you hit it, the plan pays 100% of covered services for the rest of the year.",
  },
];

export type MedigapPlan = {
  letter: MedigapPlanLetter;
  name: string;
  newlyEligible: boolean;
  popularityNote: string;
  premiumTendency: "higher" | "mid" | "lower";
  summary: string;
  coverage: Record<MedigapBenefitId, CoverageValue>;
};

/**
 * Standardized Medigap benefits (educational). Exact dollar limits for foreign travel /
 * K–L OOP change yearly—confirm with a current Outline of Coverage.
 */
export const MEDIGAP_PLANS: MedigapPlan[] = [
  {
    letter: "G",
    name: "Plan G",
    newlyEligible: true,
    popularityNote: "Most common choice for newly eligible buyers seeking near-full coverage.",
    premiumTendency: "higher",
    summary:
      "Covers almost all standardized gaps except the Part B deductible. Includes Part B excess charges.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "yes",
      blood: "yes",
      hospice: "yes",
      snf: "yes",
      partADeductible: "yes",
      partBDeductible: "no",
      partBExcess: "yes",
      foreignTravel: "partial",
      outOfPocketLimit: "no",
    },
  },
  {
    letter: "N",
    name: "Plan N",
    newlyEligible: true,
    popularityNote: "Popular lower-premium alternative to Plan G if you are okay with office/ER copays.",
    premiumTendency: "mid",
    summary:
      "Similar to Plan G on many hospital benefits, but Part B coinsurance uses copays ($20 office / $50 ER, amounts set by CMS rules). The emergency-room copay is waived if you are admitted. Plan N does not cover Part B excess charges.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "copay",
      blood: "yes",
      hospice: "yes",
      snf: "yes",
      partADeductible: "yes",
      partBDeductible: "no",
      partBExcess: "no",
      foreignTravel: "partial",
      outOfPocketLimit: "no",
    },
  },
  {
    letter: "F",
    name: "Plan F",
    newlyEligible: false,
    popularityNote: "Only if you were first eligible for Medicare before January 1, 2020.",
    premiumTendency: "higher",
    summary:
      "Historically the most comprehensive letter—includes the Part B deductible. Not sold to newly eligible people.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "yes",
      blood: "yes",
      hospice: "yes",
      snf: "yes",
      partADeductible: "yes",
      partBDeductible: "yes",
      partBExcess: "yes",
      foreignTravel: "partial",
      outOfPocketLimit: "no",
    },
  },
  {
    letter: "C",
    name: "Plan C",
    newlyEligible: false,
    popularityNote: "Only if you were first eligible for Medicare before January 1, 2020.",
    premiumTendency: "higher",
    summary: "Comprehensive like older designs; includes Part B deductible. Closed to newly eligible buyers.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "yes",
      blood: "yes",
      hospice: "yes",
      snf: "yes",
      partADeductible: "yes",
      partBDeductible: "yes",
      partBExcess: "no",
      foreignTravel: "partial",
      outOfPocketLimit: "no",
    },
  },
  {
    letter: "D",
    name: "Plan D",
    newlyEligible: true,
    popularityNote: "Less common than G/N; solid core benefits without excess-charge coverage.",
    premiumTendency: "mid",
    summary: "Covers key coinsurance and the Part A deductible, but not Part B excess charges.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "yes",
      blood: "yes",
      hospice: "yes",
      snf: "yes",
      partADeductible: "yes",
      partBDeductible: "no",
      partBExcess: "no",
      foreignTravel: "partial",
      outOfPocketLimit: "no",
    },
  },
  {
    letter: "A",
    name: "Plan A",
    newlyEligible: true,
    popularityNote: "Basic letter—usually not the best value once you compare premiums to G/N.",
    premiumTendency: "lower",
    summary: "Core coinsurance help only; does not cover Part A/B deductibles or SNF coinsurance.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "yes",
      blood: "yes",
      hospice: "yes",
      snf: "no",
      partADeductible: "no",
      partBDeductible: "no",
      partBExcess: "no",
      foreignTravel: "no",
      outOfPocketLimit: "no",
    },
  },
  {
    letter: "B",
    name: "Plan B",
    newlyEligible: true,
    popularityNote: "Adds Part A deductible to the basic package; still thinner than G/N.",
    premiumTendency: "mid",
    summary: "Plan A benefits plus the Part A deductible; no SNF coinsurance or excess charges.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "yes",
      blood: "yes",
      hospice: "yes",
      snf: "no",
      partADeductible: "yes",
      partBDeductible: "no",
      partBExcess: "no",
      foreignTravel: "no",
      outOfPocketLimit: "no",
    },
  },
  {
    letter: "K",
    name: "Plan K",
    newlyEligible: true,
    popularityNote: "Lower premium / higher cost-sharing design with an annual out-of-pocket limit.",
    premiumTendency: "lower",
    summary: "Pays 50% of several benefits until you hit the plan’s yearly out-of-pocket limit.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "50%",
      blood: "50%",
      hospice: "50%",
      snf: "50%",
      partADeductible: "50%",
      partBDeductible: "no",
      partBExcess: "no",
      foreignTravel: "no",
      outOfPocketLimit: "yes",
    },
  },
  {
    letter: "L",
    name: "Plan L",
    newlyEligible: true,
    popularityNote: "Like Plan K but 75% cost-sharing and a lower out-of-pocket limit.",
    premiumTendency: "mid",
    summary: "Pays 75% of several benefits until you hit the plan’s yearly out-of-pocket limit.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "75%",
      blood: "75%",
      hospice: "75%",
      snf: "75%",
      partADeductible: "75%",
      partBDeductible: "no",
      partBExcess: "no",
      foreignTravel: "no",
      outOfPocketLimit: "yes",
    },
  },
  {
    letter: "M",
    name: "Plan M",
    newlyEligible: true,
    popularityNote: "Niche letter—pays half the Part A deductible.",
    premiumTendency: "mid",
    summary: "Covers most coinsurance; pays 50% of the Part A deductible; no excess charges.",
    coverage: {
      partACoinsurance: "yes",
      partBCoinsurance: "yes",
      blood: "yes",
      hospice: "yes",
      snf: "yes",
      partADeductible: "50%",
      partBDeductible: "no",
      partBExcess: "no",
      foreignTravel: "partial",
      outOfPocketLimit: "no",
    },
  },
];

export function coverageLabel(value: CoverageValue): string {
  switch (value) {
    case "yes":
      return "Yes";
    case "no":
      return "No";
    case "50%":
      return "50%";
    case "75%":
      return "75%";
    case "partial":
      return "Limited";
    case "copay":
      return "Copays";
    default:
      return value;
  }
}

export type MedSuppAnswers = {
  newlyEligible: boolean;
  wantsLowestGaps: boolean;
  wantsLowerPremium: boolean;
  okWithCopays: boolean;
  worriesExcessCharges: boolean;
  wantsOopCap: boolean;
  travelsAbroad: boolean;
};

export type MedSuppRecommendation = {
  primary: MedigapPlanLetter[];
  avoid: MedigapPlanLetter[];
  title: string;
  summary: string;
  why: string[];
  compareDefault: MedigapPlanLetter[];
};

export function recommendMedSupp(a: MedSuppAnswers): MedSuppRecommendation {
  if (!a.newlyEligible && a.wantsLowestGaps) {
    return {
      primary: ["F", "G"],
      avoid: ["A", "B"],
      title: "If you are eligible for Plan F, compare F vs G",
      summary:
        "People first eligible before 2020 can still access Plan F (includes the Part B deductible). Many still compare Plan G for premium differences. Get state-specific quotes before deciding.",
      why: [
        "Plan F covers the Part B deductible; Plan G does not.",
        "Premiums vary widely by carrier, age, ZIP, and rating method—benefits do not.",
        "If Plan F is not available to you, Plan G is the usual “near-complete” letter.",
      ],
      compareDefault: ["F", "G", "N"],
    };
  }

  if (a.wantsOopCap && a.wantsLowerPremium) {
    return {
      primary: ["K", "L"],
      avoid: ["A"],
      title: "Your answers lean Plan K or Plan L",
      summary:
        "You want a lower premium and an annual out-of-pocket limit. K pays 50% of several benefits; L pays 75%. Compare premiums and the OOP maximum for your state.",
      why: [
        "K/L trade higher cost-sharing for lower premiums and a hard OOP cap.",
        "They do not cover Part B excess charges or foreign travel the way G/N can.",
        "If you prefer predictable “pay almost nothing after deductible” behavior, look at G/N instead.",
      ],
      compareDefault: ["K", "L", "G"],
    };
  }

  if (a.wantsLowestGaps && a.worriesExcessCharges && !a.okWithCopays) {
    return {
      primary: ["G"],
      avoid: ["N", "A", "B"],
      title: "Your answers lean Plan G",
      summary:
        "You want the gaps filled tightly, including Part B excess charges, and you prefer not to manage office/ER copays. Plan G is the usual match for newly eligible buyers with those priorities.",
      why: [
        "Plan G covers Part B excess charges; Plan N does not.",
        "You still pay the Part B deductible each year (unlike legacy Plan F).",
        "Next step: compare Plan G premiums across carriers in your ZIP—benefits are standardized.",
      ],
      compareDefault: ["G", "N", "D"],
    };
  }

  if (a.wantsLowerPremium && a.okWithCopays) {
    return {
      primary: ["N"],
      avoid: ["A"],
      title: "Your answers lean Plan N",
      summary:
        "You are willing to trade small Part B copays (and no excess-charge coverage) for a typically lower premium than Plan G. Confirm you mostly see providers who accept Medicare assignment.",
      why: [
        "Plan N uses office/ER copays instead of full Part B coinsurance coverage.",
        "No Part B excess-charge coverage—assignment-accepting doctors matter more.",
        "Still compare Plan G quotes; sometimes the premium gap is smaller than people expect.",
      ],
      compareDefault: ["N", "G", "D"],
    };
  }

  if (a.travelsAbroad && a.wantsLowestGaps) {
    return {
      primary: ["G", "N"],
      avoid: ["K", "A"],
      title: "Your answers lean Plan G (or N) with foreign-travel notes",
      summary:
        "Plans G and N include limited foreign travel emergency benefits. That is not full travel insurance—know the deductible and lifetime caps.",
      why: [
        "Foreign travel on Medigap is limited emergency coverage, not a vacation medical policy.",
        "Plan G still tends to win if you want excess-charge protection.",
        "Shop Part D separately either way.",
      ],
      compareDefault: ["G", "N", "M"],
    };
  }

  return {
    primary: ["G", "N"],
    avoid: ["A"],
    title: "Start by comparing Plan G and Plan N",
    summary:
      "For most newly eligible people, the real decision is G vs N (after confirming Medigap is the right path vs Advantage). Use the chart below, then get local premium quotes.",
    why: [
      "Benefits are standardized by letter—price and company service differ.",
      "Plan G ≈ fewer claim surprises; Plan N ≈ often lower premium with copays.",
      "Medigap does not include Part D—budget a drug plan too.",
    ],
    compareDefault: ["G", "N", "D"],
  };
}

export function getPlan(letter: MedigapPlanLetter): MedigapPlan {
  const plan = MEDIGAP_PLANS.find((p) => p.letter === letter);
  if (!plan) throw new Error(`Unknown Medigap plan ${letter}`);
  return plan;
}
