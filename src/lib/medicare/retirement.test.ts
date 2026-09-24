import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { retirementTimeline } from "./retirement.ts";

describe("retirementTimeline", () => {
  it("starts Part B the month after a same-day ending, for eight months", () => {
    const timeline = retirementTimeline("2026-06-15", "same-day");
    assert.ok(timeline);
    assert.equal(timeline.coverageEnd, "2026-06-15");
    assert.equal(timeline.partBStart, "2026-07-01");
    assert.equal(timeline.partBEnd, "2027-02-28");
    assert.equal(timeline.partDStart, "2026-07-01");
    assert.equal(timeline.partDEnd, "2026-08-31");
  });

  it("keeps Part B on the work date when coverage lasts through that month", () => {
    const timeline = retirementTimeline("2026-06-15", "end-of-month");
    assert.ok(timeline);
    assert.equal(timeline.coverageEnd, "2026-06-30");
    assert.equal(timeline.earlierTrigger, "2026-06-15");
    assert.equal(timeline.partBStart, "2026-07-01");
    assert.equal(timeline.partDStart, "2026-07-01");
    assert.equal(timeline.partDEnd, "2026-08-31");
  });

  it("uses the work date for Part B when coverage runs into the next month", () => {
    const timeline = retirementTimeline("2026-06-15", "end-of-next-month");
    assert.ok(timeline);
    assert.equal(timeline.coverageEnd, "2026-07-31");
    assert.equal(timeline.earlierTrigger, "2026-06-15");
    assert.equal(timeline.partBStart, "2026-07-01");
    assert.equal(timeline.partDStart, "2026-08-01");
    assert.equal(timeline.partDEnd, "2026-09-30");
  });

  it("dates Part B from the work day and leaves Part D open when coverage end is unknown", () => {
    const timeline = retirementTimeline("2026-06-15", "unsure");
    assert.ok(timeline);
    assert.equal(timeline.coverageUncertain, true);
    assert.equal(timeline.coverageEnd, null);
    assert.equal(timeline.partBStart, "2026-07-01");
    assert.equal(timeline.partDStart, null);
  });

  it("rejects a date that is not a real calendar day", () => {
    assert.equal(retirementTimeline("2026-02-31", "same-day"), null);
  });
});
