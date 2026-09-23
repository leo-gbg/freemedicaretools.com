/**
 * Print layout for page 2 of the consult worksheet. Page 2 always fits one
 * Letter page: spacing tightens as rows are added, and anything past 10
 * prescriptions or 5 providers continues on page 3 instead of shrinking further.
 */

export const PAGE_TWO_MAX_RX = 10;
export const PAGE_TWO_MAX_DOCS = 5;

export type WorksheetDensity = "roomy" | "compact" | "tight";

export type WorksheetTier = {
  density: WorksheetDensity;
  /** Entry text size in px. Never below 14. */
  entryPx: number;
  /** Vertical padding above and below each row, in px. */
  rowPadPx: number;
  blankRxRow: boolean;
  blankDocRow: boolean;
  /** One ruled line under the notes for handwriting. */
  noteLine: boolean;
  /** "Bring to your consult" as a checklist, or squeezed onto one line. */
  bringOneLine: boolean;
};

export type WorksheetLayout<Rx, Doc> = {
  tier: WorksheetTier;
  pageTwoRx: Rx[];
  pageTwoDocs: Doc[];
  overflowRx: Rx[];
  overflowDocs: Doc[];
  pageCount: 2 | 3;
};

export function worksheetTier(totalRows: number): WorksheetTier {
  if (totalRows <= 6) {
    return {
      density: "roomy",
      entryPx: 15,
      rowPadPx: 11,
      blankRxRow: true,
      blankDocRow: true,
      noteLine: true,
      bringOneLine: false,
    };
  }
  if (totalRows <= 10) {
    return {
      density: "compact",
      entryPx: 14,
      rowPadPx: 7,
      blankRxRow: true,
      blankDocRow: false,
      noteLine: false,
      bringOneLine: false,
    };
  }
  return {
    density: "tight",
    entryPx: 14,
    rowPadPx: 4,
    blankRxRow: false,
    blankDocRow: false,
    noteLine: false,
    bringOneLine: true,
  };
}

export function worksheetLayout<Rx, Doc>(rxs: Rx[], docs: Doc[]): WorksheetLayout<Rx, Doc> {
  const pageTwoRx = rxs.slice(0, PAGE_TWO_MAX_RX);
  const pageTwoDocs = docs.slice(0, PAGE_TWO_MAX_DOCS);
  const overflowRx = rxs.slice(PAGE_TWO_MAX_RX);
  const overflowDocs = docs.slice(PAGE_TWO_MAX_DOCS);
  return {
    tier: worksheetTier(pageTwoRx.length + pageTwoDocs.length),
    pageTwoRx,
    pageTwoDocs,
    overflowRx,
    overflowDocs,
    pageCount: overflowRx.length > 0 || overflowDocs.length > 0 ? 3 : 2,
  };
}
