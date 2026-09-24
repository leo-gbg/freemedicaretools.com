/** Digits and one optional decimal, up to two places. Commas and a dollar sign are display only. */
export function parseMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[$,\s]/g, "");
  const match = cleaned.match(/^\d*\.?\d{0,2}/);
  return match?.[0] ?? "";
}

/** `120000.5` → `120,000.5`. A trailing dot is kept while the person is still typing cents. */
export function formatMoneyInput(stored: string): string {
  if (!stored) return "";
  const [whole, frac] = stored.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (stored.endsWith(".")) return `${withCommas}.`;
  if (frac !== undefined) return `${withCommas}.${frac}`;
  return withCommas;
}

/** `(###) ###-####` as the person types. Extra digits are dropped. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
