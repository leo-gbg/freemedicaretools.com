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
    popularityNote: "Covers Part B excess charges. Does not cover the Part B deductible.",
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
    popularityNote:
      "Part B coinsurance uses copays of up to $20 for some office visits and up to $50 for emergency room visits that do not lead to admission. Does not cover Part B excess charges.",
    summary:
      "Similar to Plan G on many hospital benefits. Part B coinsurance uses copays of up to $20 for some office visits and up to $50 for emergency room visits that do not lead to admission. Plan N does not cover Part B excess charges.",
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
    popularityNote: "Does not cover Part B excess charges.",
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
    popularityNote:
      "Covers core coinsurance. Does not cover the Part A deductible, skilled nursing coinsurance, or Part B excess charges.",
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
    popularityNote: "Adds the Part A deductible to the core coinsurance benefits.",
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
    popularityNote: "Pays a share of several benefits and includes a yearly out-of-pocket limit.",
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
    popularityNote: "Pays 50% of the Part A deductible.",
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
  okWithCopays: boolean;
  worriesExcessCharges: boolean;
  wantsOopCap: boolean;
  travelsAbroad: boolean;
};

/** Equal side-by-side of standardized letters. Does not name a letter to buy. */
export type MedSuppComparison = {
  letters: MedigapPlanLetter[];
  title: string;
  summary: string;
  details: string[];
};

const LETTER_ORDER = "ABCDEFGKLMN";

function sortLetters(letters: MedigapPlanLetter[]): MedigapPlanLetter[] {
  return [...letters].sort((a, b) => LETTER_ORDER.indexOf(a) - LETTER_ORDER.indexOf(b));
}

function titleFor(letters: MedigapPlanLetter[]): string {
  const names = letters.map((letter) => `Plan ${letter}`);
  if (names.length === 1) return `What ${names[0]} covers`;
  return `What ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} cover`;
}

/**
 * Picks a 3-letter slice so the chart stays readable, then describes what those
 * letters cover. The slice is not a recommendation and has no primary letter.
 */
export function describeMedigapComparison(a: MedSuppAnswers): MedSuppComparison {
  let chosen: MedigapPlanLetter[];
  if (!a.newlyEligible && a.wantsLowestGaps) chosen = ["F", "G", "N"];
  else if (a.wantsOopCap) chosen = ["K", "L", "G"];
  else if (a.wantsLowestGaps && a.worriesExcessCharges && !a.okWithCopays) chosen = ["G", "N", "D"];
  else if (a.okWithCopays) chosen = ["N", "G", "D"];
  else if (a.travelsAbroad && a.wantsLowestGaps) chosen = ["G", "N", "M"];
  else chosen = ["G", "N", "D"];

  const letters = sortLetters(chosen);
  const details = [
    "The chart lines these letters up. It does not choose one for you.",
    "The same letter has the same standardized benefits from company to company. Premiums can differ.",
  ];
  if (letters.includes("F") || letters.includes("C")) {
    details.push(
      "Plans C and F are generally available only if you were first eligible before January 1, 2020."
    );
  }
  if (a.travelsAbroad && a.wantsLowestGaps) {
    details.push(
      "Foreign travel emergency on these letters is limited care abroad after a deductible. Caps apply. It is not a travel insurance replacement."
    );
  }

  return {
    letters,
    title: titleFor(letters),
    summary: letters.map((letter) => `Plan ${letter}: ${getPlan(letter).summary}`).join(" "),
    details,
  };
}

export function getPlan(letter: MedigapPlanLetter): MedigapPlan {
  const plan = MEDIGAP_PLANS.find((p) => p.letter === letter);
  if (!plan) throw new Error(`Unknown Medigap plan ${letter}`);
  return plan;
}
