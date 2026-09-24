import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyWorksheet, isWorksheetBlank, restoreWorksheet } from "./client-worksheet.ts";

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
  });
});
