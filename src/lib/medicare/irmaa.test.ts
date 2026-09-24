import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lookupIrmaa } from "./decisions.ts";

describe("lookupIrmaa top cliff", () => {
  it("puts exactly $500,000 single in the top tier", () => {
    assert.equal(lookupIrmaa(499999, "single").partBTotal, 649.2);
    assert.equal(lookupIrmaa(500000, "single").partBTotal, 689.9);
    assert.equal(lookupIrmaa(500000, "single").partDSurcharge, 91);
    assert.equal(lookupIrmaa(500001, "single").partBTotal, 689.9);
  });

  it("puts exactly $750,000 joint in the top tier", () => {
    assert.equal(lookupIrmaa(749999, "joint").partBTotal, 649.2);
    assert.equal(lookupIrmaa(750000, "joint").partBTotal, 689.9);
    assert.equal(lookupIrmaa(750001, "joint").partDSurcharge, 91);
  });

  it("keeps the lower inclusive cutoffs", () => {
    assert.equal(lookupIrmaa(109000, "single").partBTotal, 202.9);
    assert.equal(lookupIrmaa(109001, "single").partBTotal, 284.1);
    assert.equal(lookupIrmaa(205000, "single").partBTotal, 527.5);
    assert.equal(lookupIrmaa(205001, "single").partBTotal, 649.2);
  });

  it("keeps married filing separately at $391,000 in the top tier", () => {
    assert.equal(lookupIrmaa(390999, "separate").partBTotal, 649.2);
    assert.equal(lookupIrmaa(391000, "separate").partBTotal, 689.9);
  });
});
