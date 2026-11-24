import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { OFFICIAL_SOURCE_SENTENCE } from "./official.ts";
import { TPMO_DISCLAIMER } from "./tpmo.ts";
import { emptyWorksheet, type ClientWorksheet } from "./client-worksheet.ts";
import { renderWorksheetPdf } from "./worksheet-pdf.ts";
import { worksheetSummaryLines } from "./worksheet-email.ts";

function sampleWorksheet(): ClientWorksheet {
  const data = emptyWorksheet();
  data.fullName = "Jordan Q Sample";
  data.preferredName = "Jordan";
  data.phone = "(555) 010-0199";
  data.email = "jordan.sample@example.com";
  data.addressLine1 = "123 Example Ave";
  data.addressLine2 = "Apt 4";
  data.city = "Las Vegas";
  data.state = "NV";
  data.zip = "89101";
  data.county = "Clark";
  data.dateOfBirth = "1955-06-15";
  data.partBEffective = "2024-07-01";
  data.currentCoverage = "Original Medicare only";
  data.otherCoverageNotes = "Spouse plan ended last year";
  data.preferredPharmacy = "Example Pharmacy";
  data.preferredHospital = "Example Hospital";
  data.travelsOutOfState = true;
  data.travelMonths = "March, Arizona";
  data.tobaccoUse = false;
  data.comfortableWithNetwork = true;
  data.providerAccess = "A network of doctors and hospitals is fine";
  data.dualEligibleMedicaid = false;
  data.hasVaBenefits = false;
  data.caregiverName = "Casey Sample";
  data.caregiverPhone = "(555) 010-0177";
  data.notesForAgent = "Fake test worksheet. No real client.";
  data.completedAt = "November 24, 2026 at 1:00 AM";
  data.prescriptions = [
    { id: "rx-1", name: "Examplevastatin", dosage: "10 mg", frequency: "once daily", genericsOk: true },
    { id: "rx-2", name: "Pretendpril", dosage: "5 mg", frequency: "twice daily", genericsOk: false },
  ];
  data.providers = [
    {
      id: "dr-1",
      name: "Dr. Pat Example",
      practice: "Example Clinic",
      specialistType: "PCP",
      address: "Las Vegas",
      mustKeep: true,
    },
    {
      id: "dr-2",
      name: "Dr. Sam Placeholder",
      practice: "Sample Heart",
      specialistType: "Cardiology",
      address: "Henderson",
      mustKeep: false,
    },
  ];
  return data;
}

/** pdfkit writes WinAnsi text as hex strings split by kerning adjustments. */
function pdfText(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  let text = "";
  for (const match of raw.matchAll(/<([0-9A-Fa-f]+)>/g)) {
    const hex = match[1];
    if (hex.length % 2 !== 0) continue;
    for (let index = 0; index < hex.length; index += 2) {
      text += String.fromCharCode(Number.parseInt(hex.slice(index, index + 2), 16));
    }
  }
  return text;
}

describe("renderWorksheetPdf", () => {
  it("builds an in-memory PDF that contains every entered field", async () => {
    const data = sampleWorksheet();
    const pdf = await renderWorksheetPdf(data);
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    const text = pdfText(pdf);
    for (const line of worksheetSummaryLines(data)) {
      if (!line) continue;
      assert.ok(text.includes(line), `missing PDF line: ${line}`);
    }
    assert.ok(text.includes(OFFICIAL_SOURCE_SENTENCE));
    assert.ok(text.includes("TTY 1-877-486-2048"));
    assert.equal(text.includes(TPMO_DISCLAIMER), false);
    assert.equal(text.includes("8 organizations"), false);
    assert.equal(text.includes("Nothing you typed was sent to or stored by the site."), false);
    assert.ok(text.includes("Generic OK"));
    assert.ok(text.includes("Brand only"));
    assert.ok(text.includes("Must keep"));
    assert.ok(text.includes("Flexible"));
  });

  it("keeps the print-page privacy note and does not add the TPMO disclaimer there", () => {
    const source = readFileSync(new URL("../../components/tools/client-worksheet-print.tsx", import.meta.url), "utf8");
    const retention =
      "This page doesn't save what you type. If you choose Email to agent, your worksheet is emailed to Leo Adaoag; the site keeps no copy.";
    assert.ok(source.includes(retention));
    assert.equal(source.includes("Nothing you typed was sent to or stored by the site."), false);
    assert.ok(source.includes('name="fmt_hp"'));
    assert.equal(source.includes(TPMO_DISCLAIMER), false);
    assert.equal(source.includes("mailto:"), false);
  });
});
