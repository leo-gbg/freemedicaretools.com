import {
  PART_B_LEP_RATE_PER_YEAR,
  PART_B_STANDARD_PREMIUM,
  PART_D_BASE_BENEFICIARY_PREMIUM,
} from "./constants";

export type PenaltyInput = {
  partBUncoveredMonths: number;
  partDUncoveredMonths: number;
};

export type PenaltyLine = {
  label: string;
  detail?: string;
  amount: number | null;
  emphasize?: "subtotal" | "total" | "muted";
};

export type PenaltyResult = {
  partBMonths: number;
  partDMonths: number;
  partBFullYears: number;
  partBRatePercent: number;
  partBMonthlyPenalty: number;
  partBAnnualPenalty: number;
  partBTotalWithPremium: number;
  partDMonthlyPenalty: number;
  partDAnnualPenalty: number;
  combinedMonthlyExtra: number;
  combinedOneYearCost: number;
  lines: PenaltyLine[];
  notes: string[];
};

function roundNearestTenth(n: number): number {
  return Math.round(n * 10) / 10;
}

export function estimateLatePenalties(input: PenaltyInput): PenaltyResult {
  const partBMonths = Math.max(0, Math.floor(input.partBUncoveredMonths));
  const partDMonths = Math.max(0, Math.floor(input.partDUncoveredMonths));

  const partBFullYears = Math.floor(partBMonths / 12);
  const partBRate = partBFullYears * PART_B_LEP_RATE_PER_YEAR;
  const partBRatePercent = Math.round(partBRate * 100);
  const partBMonthlyPenalty = roundNearestTenth(PART_B_STANDARD_PREMIUM * partBRate);
  const partBAnnualPenalty = roundNearestTenth(partBMonthlyPenalty * 12);
  const partBTotalWithPremium = roundNearestTenth(
    PART_B_STANDARD_PREMIUM + partBMonthlyPenalty
  );

  const partDMonthlyPenalty = roundNearestTenth(
    0.01 * PART_D_BASE_BENEFICIARY_PREMIUM * partDMonths
  );
  const partDAnnualPenalty = roundNearestTenth(partDMonthlyPenalty * 12);

  const combinedMonthlyExtra = roundNearestTenth(
    partBMonthlyPenalty + partDMonthlyPenalty
  );
  const combinedOneYearCost = roundNearestTenth(combinedMonthlyExtra * 12);

  const lines: PenaltyLine[] = [
    {
      label: "Part B late penalty (1 year)",
      detail:
        partBFullYears === 0
          ? `${partBMonths} uncovered month(s) → ${partBFullYears} full year(s) × 10% = $0.00/mo × 12`
          : `${partBFullYears} full year(s) × 10% = ${partBRatePercent}% × $${PART_B_STANDARD_PREMIUM.toFixed(2)} = $${partBMonthlyPenalty.toFixed(2)}/mo × 12`,
      amount: partBAnnualPenalty,
    },
    {
      label: "Part D late penalty (1 year)",
      detail: `${partDMonths} uncovered month(s) × 1% × $${PART_D_BASE_BENEFICIARY_PREMIUM.toFixed(2)} = $${partDMonthlyPenalty.toFixed(2)}/mo × 12 (rounded to nearest $0.10)`,
      amount: partDAnnualPenalty,
    },
    {
      label: "1-year estimated extra",
      detail: "Part B annual LEP + Part D annual LEP (on top of regular premiums)",
      amount: combinedOneYearCost,
      emphasize: "total",
    },
  ];

  const notes: string[] = [
    `Part B LEP uses 10% of the standard premium ($${PART_B_STANDARD_PREMIUM.toFixed(2)} in 2026) for each full 12-month period you could have had Part B but didn’t.`,
    `Part D LEP uses 1% of the national base beneficiary premium ($${PART_D_BASE_BENEFICIARY_PREMIUM.toFixed(2)} in 2026) for each full uncovered month, rounded to the nearest $0.10.`,
    "Both penalties are typically lifelong and can change as national premium figures change. This box shows one year of the extra cost only.",
    "This estimate does not include a Part A premium penalty. People who pay a Part A premium can owe one if they delay Part A.",
    "Months with Extra Help or qualifying creditable coverage may not count—confirm with Medicare or your agent.",
  ];

  if (partBMonths > 0 && partBMonths < 12) {
    notes.unshift(
      "Fewer than 12 uncovered Part B months usually means $0 Part B late penalty (partial years don’t count)."
    );
  }

  return {
    partBMonths,
    partDMonths,
    partBFullYears,
    partBRatePercent,
    partBMonthlyPenalty,
    partBAnnualPenalty,
    partBTotalWithPremium,
    partDMonthlyPenalty,
    partDAnnualPenalty,
    combinedMonthlyExtra,
    combinedOneYearCost,
    lines,
    notes,
  };
}
