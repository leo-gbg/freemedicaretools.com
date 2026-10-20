import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findEnrollmentWindows, scoreCoveragePath, type PathAnswers } from "./decisions.ts";
import { getPlan } from "./medigap.ts";
import { OFFICIAL_SOURCE_SENTENCE } from "./official.ts";

const PITCH =
  /dental|vision|hearing|premium budget|premium-budget|lower premium|lowers my monthly|\$0 premium|star rating/i;

describe("employer-coverage Special Enrollment Period", () => {
  const sep = findEnrollmentWindows(
    {
      turning65Soon: false,
      alreadyOnMedicare: false,
      onAdvantage: false,
      missedIep: false,
      losingEmployerCoverage: true,
    },
    new Date(2026, 9, 20)
  ).find((window) => window.id === "sep");

  it("keeps Part B at 8 months and Part D at 2 full months", () => {
    assert.ok(sep);
    const text = `${sep.windowLabel} ${sep.description} ${sep.calendarNote}`;
    assert.match(text, /8 months/);
    assert.match(text, /2 full months/);
    assert.doesNotMatch(text, /63 days for Part D/);
  });

  it("uses 63 days only as the creditable-coverage late-penalty gap", () => {
    assert.ok(sep);
    const text = `${sep.windowLabel} ${sep.calendarNote}`;
    assert.match(text, /63 days or more/);
    assert.match(text, /late penalty/);
    assert.match(text, /not the Part D enrollment window/);
  });
});

describe("coverage path quiz", () => {
  const advantage: PathAnswers = {
    travelOften: false,
    needsSpecificDoctors: false,
    wantsNoReferral: false,
    okWithNetwork: true,
    prefersPlanSetCosts: true,
    wantsSeparateDrugPlan: false,
  };
  const original: PathAnswers = {
    travelOften: true,
    needsSpecificDoctors: true,
    wantsNoReferral: true,
    okWithNetwork: false,
    prefersPlanSetCosts: false,
    wantsSeparateDrugPlan: true,
  };
  const mixed: PathAnswers = {
    travelOften: false,
    needsSpecificDoctors: false,
    wantsNoReferral: false,
    okWithNetwork: true,
    prefersPlanSetCosts: false,
    wantsSeparateDrugPlan: true,
  };

  it("lines answers up with structure and skips benefit or premium pitches", () => {
    const results = [scoreCoveragePath(advantage), scoreCoveragePath(original), scoreCoveragePath(mixed)];
    assert.equal(results[0].lean, "advantage");
    assert.equal(results[1].lean, "original-medigap");
    assert.equal(results[2].lean, "mixed");
    for (const result of results) {
      const text = `${result.title} ${result.summary} ${result.nextSteps.join(" ")}`;
      assert.doesNotMatch(text, PITCH);
      assert.match(text, /Plan Finder/);
      assert.doesNotMatch(text, /enrollment window closes/i);
    }
  });
});

describe("Plan N copays", () => {
  it("uses the federal up-to amounts", () => {
    const plan = getPlan("N");
    assert.match(plan.summary, /up to \$20/);
    assert.match(plan.summary, /up to \$50/);
    assert.doesNotMatch(plan.summary, /\$20 office \/ \$50/);
    assert.equal("premiumTendency" in plan, false);
  });
});

describe("official source sentence", () => {
  it("matches the required Medicare.gov line", () => {
    assert.equal(
      OFFICIAL_SOURCE_SENTENCE,
      "For official information and to compare all plans in your area, visit Medicare.gov or call 1-800-MEDICARE (TTY 1-877-486-2048)."
    );
  });
});
