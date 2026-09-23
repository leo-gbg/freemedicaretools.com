import {
  coverageLabel,
  MEDIGAP_BENEFITS,
  MEDIGAP_PLANS,
  type CoverageValue,
  type MedigapPlan,
  type MedigapPlanLetter,
} from "@/lib/medicare/medigap";

const PLAN_ORDER: MedigapPlanLetter[] = ["A", "B", "C", "D", "F", "G", "K", "L", "M", "N"];

export function orderedMedigapPlans(letters?: MedigapPlanLetter[]): MedigapPlan[] {
  const set = letters ? new Set(letters) : null;
  return PLAN_ORDER.map((letter) => MEDIGAP_PLANS.find((p) => p.letter === letter)!).filter(
    (p) => p && (!set || set.has(p.letter))
  );
}

export function MedigapComparisonTable({
  plans,
  compact = false,
  printFriendly = false,
}: {
  plans: MedigapPlan[];
  compact?: boolean;
  printFriendly?: boolean;
}) {
  return (
    <div
      className={
        printFriendly
          ? "overflow-visible"
          : "overflow-x-auto rounded-2xl border border-[var(--brand-line)] bg-white/90"
      }
    >
      <table
        className={`w-full border-collapse text-left ${
          printFriendly ? "min-w-0 text-[9pt]" : "min-w-[40rem] text-sm"
        }`}
      >
        <thead>
          <tr className="border-b border-[var(--brand-line)] bg-[var(--brand-mist)]/80">
            <th
              className={`sticky left-0 z-10 bg-[var(--brand-mist)] font-medium text-[var(--brand-ink)] ${
                printFriendly ? "px-1.5 py-1.5" : "px-3 py-3"
              }`}
            >
              Benefit
            </th>
            {plans.map((plan) => (
              <th
                key={plan.letter}
                className={`text-center font-[family-name:var(--font-display)] text-[var(--brand-ink)] ${
                  printFriendly ? "px-1 py-1.5 text-[10pt]" : "px-3 py-3 text-base"
                }`}
              >
                {plan.letter}
                {!plan.newlyEligible && (
                  <span className="mt-0.5 block text-[8pt] font-sans font-normal tracking-normal text-[var(--brand-ink-soft)]">
                    *
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MEDIGAP_BENEFITS.map((benefit) => (
            <tr key={benefit.id} className="border-b border-[var(--brand-line)]/70">
              <th
                className={`sticky left-0 z-10 bg-white/95 text-left font-medium text-[var(--brand-ink)] ${
                  printFriendly ? "px-1.5 py-1" : "px-3 py-3"
                }`}
              >
                <span>{benefit.label}</span>
                {!compact && !printFriendly && (
                  <span className="mt-0.5 block text-xs font-normal text-[var(--brand-ink-soft)]">
                    {benefit.plain}
                  </span>
                )}
              </th>
              {plans.map((plan) => {
                const value = plan.coverage[benefit.id];
                const gValue = MEDIGAP_PLANS.find((p) => p.letter === "G")!.coverage[benefit.id];
                const differs = value !== gValue;
                return (
                  <td
                    key={`${plan.letter}-${benefit.id}`}
                    className={`text-center tabular-nums ${
                      printFriendly ? "px-1 py-1" : "px-3 py-3"
                    } ${differs && !printFriendly ? "bg-[var(--brand-sea)]/20 font-medium" : "text-[var(--brand-ink)]"}`}
                  >
                    <CoverageCell value={value} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoverageCell({ value }: { value: CoverageValue }) {
  const label = coverageLabel(value);
  const title =
    value === "copay"
      ? "Part B coinsurance covered except for set office/ER copays"
      : value === "partial"
        ? "Limited foreign travel emergency benefits after a deductible; caps apply"
        : undefined;
  return <span title={title}>{label}</span>;
}
