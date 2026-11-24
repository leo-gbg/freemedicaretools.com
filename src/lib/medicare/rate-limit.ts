const hits = new Map<string, number[]>();

/** Returns true when the call is within the limit and records it. */
export function takeRateLimit(key: string, now: number, limit: number, windowMs: number): boolean {
  const fresh = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (fresh.length >= limit) {
    hits.set(key, fresh);
    return false;
  }
  fresh.push(now);
  hits.set(key, fresh);
  return true;
}

export function resetRateLimits(): void {
  hits.clear();
}
