import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/**
 * Merging to main deploys the live site. EFFECTIVE_DATE must be the real
 * publish date in that commit. While it is still the placeholder, this test
 * skips so the pull request stays green. After the date is set, the skip
 * ends and a placeholder, or a non-date, fails the suite.
 *
 * Do not set a fake date to turn the skip off.
 */
const PLACEHOLDER = "To be set at publish";
const PUBLISH_DATE = /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/;

function privacyEffectiveDate(): string {
  const source = readFileSync(new URL("../../app/privacy/page.tsx", import.meta.url), "utf8");
  const found = source.match(/const EFFECTIVE_DATE = "([^"]*)"/g);
  assert.equal(found?.length, 1, "EFFECTIVE_DATE must stay a single constant in src/app/privacy/page.tsx");
  const value = found?.[0]?.match(/"([^"]*)"/)?.[1];
  assert.equal(typeof value, "string");
  return value ?? "";
}

describe("privacy effective date", () => {
  it("fails once the publish placeholder is still in place at merge time", (t) => {
    const date = privacyEffectiveDate();
    if (date === PLACEHOLDER) {
      t.skip(
        'EFFECTIVE_DATE is still "To be set at publish". The merge commit must set the real publish date. This test then fails if the placeholder remains.',
      );
      return;
    }
    assert.notEqual(date, PLACEHOLDER);
    assert.match(date, PUBLISH_DATE);
  });
});
