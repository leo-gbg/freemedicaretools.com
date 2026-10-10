/**
 * Print layout for page 2 of the consult worksheet. Page 2 always fits one
 * Letter page: spacing tightens as rows are added, and anything past 14
 * prescriptions or 7 providers continues on page 3 instead of shrinking further.
 *
 * Tables list entered rows only. A numbered blank used to follow short lists
 * so someone could write another drug in; it read as a stray extra row.
 */

export const PAGE_TWO_MAX_RX = 14;
export const PAGE_TWO_MAX_DOCS = 7;

export type WorksheetDensity = "roomy" | "compact" | "tight";

export type WorksheetTier = {
  density: WorksheetDensity;
  /** Entry text size in px. Never below 14. */
  entryPx: number;
  /** Vertical padding above and below each row, in px. */
  rowPadPx: number;
  /** One ruled line under the notes for handwriting. */
  noteLine: boolean;
  /** "Bring to your consult" as a checklist, or squeezed onto one line. */
  bringOneLine: boolean;
};

export type PrintTableRow<T> = { kind: "entry"; index: number; row: T } | { kind: "empty" };

/** Entered rows, numbered from 1. An empty list is one unnumbered "none listed" line. */
export function printTableRows<T>(rows: T[], startAt = 0): PrintTableRow<T>[] {
  if (rows.length === 0) return [{ kind: "empty" }];
  return rows.map((row, index) => ({ kind: "entry", index: startAt + index + 1, row }));
}

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
      noteLine: true,
      bringOneLine: false,
    };
  }
  if (totalRows <= 10) {
    return {
      density: "compact",
      entryPx: 14,
      rowPadPx: 7,
      noteLine: false,
      bringOneLine: false,
    };
  }
  return {
    density: "tight",
    entryPx: 14,
    rowPadPx: 3,
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
