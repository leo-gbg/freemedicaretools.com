import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateIep } from "./iep.ts";

function at(isoDate: string, hour = 15): Date {
  return new Date(`${isoDate}T${String(hour).padStart(2, "0")}:00:00`);
}

describe("calculateIep", () => {
  it("keeps the window open through the afternoon of the last day", () => {
    const result = calculateIep("1961-04-15", at("2026-07-31"));
    assert.equal(result.status, "open");
    assert.equal(result.iepStart.getFullYear(), 2026);
    assert.equal(result.iepStart.getMonth(), 0);
    assert.equal(result.iepStart.getDate(), 1);
    assert.equal(result.iepEnd.getMonth(), 6);
    assert.equal(result.iepEnd.getDate(), 31);
    assert.equal(calculateIep("1961-04-15", at("2026-08-01", 0)).status, "ended");
  });

  it("centers a birthday on the 1st on the prior month", () => {
    const result = calculateIep("1961-06-01", at("2026-05-15"));
    assert.equal(result.turned65On.getMonth(), 5);
    assert.equal(result.turned65On.getDate(), 1);
    assert.equal(result.birthMonthStart.getFullYear(), 2026);
    assert.equal(result.birthMonthStart.getMonth(), 4);
    assert.equal(result.birthMonthStart.getDate(), 1);
    assert.equal(result.iepStart.getFullYear(), 2026);
    assert.equal(result.iepStart.getMonth(), 1);
    assert.equal(result.iepStart.getDate(), 1);
    assert.equal(result.iepEnd.getMonth(), 7);
    assert.equal(result.iepEnd.getDate(), 31);
    assert.equal(result.status, "open");
    assert.match(result.earliestCoverageHint, /1st/);
    assert.equal(result.tips.some((tip) => /1–3 months/.test(tip)), false);
    assert.match(result.tips.join(" "), /first day of the next month/);
  });

  it("does not spill a 31st birthday into the following month", () => {
    const result = calculateIep("1961-03-31", at("2026-01-15"));
    assert.equal(result.birthMonthStart.getMonth(), 2);
    assert.equal(result.iepStart.getFullYear(), 2025);
    assert.equal(result.iepStart.getMonth(), 11);
    assert.equal(result.iepEnd.getFullYear(), 2026);
    assert.equal(result.iepEnd.getMonth(), 5);
    assert.equal(result.iepEnd.getDate(), 30);
  });
});
