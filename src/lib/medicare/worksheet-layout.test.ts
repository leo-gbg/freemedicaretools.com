import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { worksheetLayout, worksheetTier } from "./worksheet-layout.ts";

const list = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("worksheetTier", () => {
  it("is roomy up to 6 rows, compact to 10, tight above", () => {
    assert.equal(worksheetTier(0).density, "roomy");
    assert.equal(worksheetTier(6).density, "roomy");
    assert.equal(worksheetTier(7).density, "compact");
    assert.equal(worksheetTier(10).density, "compact");
    assert.equal(worksheetTier(11).density, "tight");
    assert.equal(worksheetTier(15).density, "tight");
  });

  it("never drops entries below 14px", () => {
    for (let n = 0; n <= 15; n += 1) assert.ok(worksheetTier(n).entryPx >= 14);
  });
});

describe("worksheetLayout", () => {
  it("keeps 10 prescriptions and 5 providers on two pages", () => {
    const layout = worksheetLayout(list(10), list(5));
    assert.equal(layout.pageCount, 2);
    assert.equal(layout.tier.density, "tight");
    assert.equal(layout.overflowRx.length, 0);
  });

  it("moves prescriptions past 10 to page 3", () => {
    const layout = worksheetLayout(list(12), list(5));
    assert.equal(layout.pageCount, 3);
    assert.deepEqual(layout.overflowRx, [10, 11]);
    assert.equal(layout.pageTwoRx.length, 10);
    assert.equal(layout.overflowDocs.length, 0);
  });

  it("moves providers past 5 to page 3", () => {
    const layout = worksheetLayout(list(2), list(7));
    assert.equal(layout.pageCount, 3);
    assert.deepEqual(layout.overflowDocs, [5, 6]);
    assert.equal(layout.tier.density, "compact");
  });
});
