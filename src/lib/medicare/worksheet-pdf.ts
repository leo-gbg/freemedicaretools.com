/**
 * In-memory worksheet PDF. Nothing is written to disk.
 * pdfkit must stay external to the Next.js bundle so its standard fonts load.
 */

import createPdf from "pdfkit";
import { BRAND } from "../brand";
import { OFFICIAL_SOURCE_SENTENCE } from "./official";
import type { ClientWorksheet } from "./client-worksheet";
import { worksheetSummaryLines } from "./worksheet-email";

const INK = "#0c2430";
const SOFT = "#34505c";
const TEAL = "#1f6f63";

function openPdf(options: PDFKit.PDFDocumentOptions): PDFKit.PDFDocument {
  const PDFDocument = createPdf as unknown as {
    new (options?: PDFKit.PDFDocumentOptions): PDFKit.PDFDocument;
  };
  return new PDFDocument(options);
}

export function renderWorksheetPdf(data: ClientWorksheet): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = openPdf({
      size: "LETTER",
      compress: false,
      bufferPages: true,
      margins: { top: 48, bottom: 72, left: 48, right: 48 },
      info: {
        Title: "Medicare Worksheet",
        Author: BRAND.domain,
        Creator: BRAND.domain,
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(18).fillColor(TEAL).text("Medicare Worksheet");
    doc.moveDown(0.15);
    doc.font("Helvetica").fontSize(10).fillColor(SOFT).text(`${BRAND.domain} · ${BRAND.poweredByLine}`);
    doc.moveDown(0.4);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(INK)
      .text("Generated because the visitor clicked Email to agent. This file is not stored on the site.");
    doc.moveDown(0.6);

    for (const line of worksheetSummaryLines(data)) {
      if (!line) {
        doc.moveDown(0.35);
        continue;
      }
      const heading = line === line.toUpperCase() && /[A-Z]/.test(line);
      doc
        .font(heading ? "Helvetica-Bold" : "Helvetica")
        .fontSize(heading ? 12 : 11)
        .fillColor(heading ? TEAL : INK)
        .text(line, { width: doc.page.width - 96 });
    }

    doc.moveDown(0.8);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(SOFT)
      .text(
        "Educational use only, not affiliated with or endorsed by the U.S. government or the federal Medicare program.",
        { width: doc.page.width - 96 },
      );
    doc.moveDown(0.3);
    doc.text(OFFICIAL_SOURCE_SENTENCE, { width: doc.page.width - 96 });

    const range = doc.bufferedPageRange();
    for (let index = 0; index < range.count; index += 1) {
      doc.switchToPage(range.start + index);
      const bottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(SOFT)
        .text(
          `Never write a Medicare number or Social Security number on this form. Page ${index + 1} of ${range.count}`,
          48,
          doc.page.height - 40,
          { width: doc.page.width - 96, lineBreak: false },
        );
      doc.page.margins.bottom = bottom;
    }
    doc.end();
  });
}
