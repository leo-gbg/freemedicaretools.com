import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyWorksheet,
  formatWorksheetDate,
  isWorksheetBlank,
  nextStepLine,
  PART_AB_STEPS,
  restoreWorksheet,
  worksheetToPlainText,
} from "./client-worksheet.ts";

describe("restoreWorksheet", () => {
  it("returns a fresh worksheet when nothing was saved", () => {
    const data = restoreWorksheet(null);
    assert.equal(data.fullName, "");
    assert.equal(data.prescriptions.length, 1);
    assert.equal(data.providers.length, 1);
  });

  it("keeps saved answers and fills in missing fields", () => {
    const data = restoreWorksheet({ fullName: "Jordan Sample", zip: "95814" });
    assert.equal(data.fullName, "Jordan Sample");
    assert.equal(data.zip, "95814");
    assert.equal(data.phone, "");
    assert.equal(data.travelsOutOfState, null);
  });

  it("keeps at least one prescription and one provider row", () => {
    const data = restoreWorksheet({ prescriptions: [], providers: [] });
    assert.equal(data.prescriptions.length, 1);
    assert.equal(data.providers.length, 1);
  });

  it("keeps saved next steps and fills in ones from older saves", () => {
    const data = restoreWorksheet({
      nextSteps: { iepDates: true, partDOnTime: false },
    });
    assert.equal(data.nextSteps.iepDates, true);
    assert.equal(data.nextSteps.partDOnTime, false);
    assert.equal(data.nextSteps.medicareCard, false);
    assert.equal(data.nextSteps.annualReview, false);
  });

  it("starts next steps unchecked when an older save has none", () => {
    const data = restoreWorksheet({ fullName: "Jordan Sample" });
    assert.equal(data.nextSteps.iepDates, false);
    assert.equal(data.nextSteps.listedDoctors, false);
  });

  it("keeps saved rows", () => {
    const data = restoreWorksheet({
      prescriptions: [
        { id: "rx-1", name: "Atorvastatin", dosage: "20 mg", frequency: "Daily", genericsOk: false },
      ],
    });
    assert.equal(data.prescriptions[0].name, "Atorvastatin");
    assert.equal(data.prescriptions[0].genericsOk, false);
  });
});

describe("isWorksheetBlank", () => {
  it("is true for a fresh worksheet", () => {
    assert.equal(isWorksheetBlank(emptyWorksheet()), true);
  });

  it("ignores the print timestamp", () => {
    assert.equal(isWorksheetBlank({ ...emptyWorksheet(), completedAt: "Sep 24, 2026" }), true);
  });

  it("is false once a field, answer, or row has content", () => {
    assert.equal(isWorksheetBlank({ ...emptyWorksheet(), zip: "95814" }), false);
    assert.equal(isWorksheetBlank({ ...emptyWorksheet(), tobaccoUse: false }), false);
    const withRx = emptyWorksheet();
    withRx.prescriptions[0].name = "Metformin";
    assert.equal(isWorksheetBlank(withRx), false);
    const withStep = emptyWorksheet();
    withStep.nextSteps.iepDates = true;
    assert.equal(isWorksheetBlank(withStep), false);
  });
});

describe("formatWorksheetDate", () => {
  it("prints date-input values as MM/DD/YYYY", () => {
    assert.equal(formatWorksheetDate("1961-01-15"), "01/15/1961");
    assert.equal(formatWorksheetDate("2026-10-01"), "10/01/2026");
  });

  it("leaves blanks and non-dates alone", () => {
    assert.equal(formatWorksheetDate(""), "");
    assert.equal(formatWorksheetDate("January 15, 1961"), "January 15, 1961");
  });
});

describe("next step copy", () => {
  it("keeps each prompt to one line and names the tool path", () => {
    for (const prompt of PART_AB_STEPS) {
      const line = nextStepLine(prompt);
      assert.equal(line.includes("\n"), false);
      assert.ok(line.length < 140);
    }
    assert.match(nextStepLine(PART_AB_STEPS[0]), /\/tools\/iep-timeline/);
    assert.match(worksheetToPlainText(emptyWorksheet()), /DOB: —/);
    const dated = emptyWorksheet();
    dated.dateOfBirth = "1961-01-15";
    dated.partBEffective = "2026-02-01";
    dated.nextSteps.medicareCard = true;
    const text = worksheetToPlainText(dated);
    assert.match(text, /DOB: 01\/15\/1961/);
    assert.match(text, /Part B effective: 02\/01\/2026/);
    assert.match(text, /\[x\] Have my Medicare card/);
  });
});
