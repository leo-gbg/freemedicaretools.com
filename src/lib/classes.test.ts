import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLASS_PAGE, CLASSES, formatClassWhen, pacificDateString, upcomingClasses } from "./classes.ts";

describe("upcomingClasses", () => {
  it("lists every scheduled class before the first date", () => {
    const listed = upcomingClasses(new Date("2026-10-12T18:00:00Z"));
    assert.deepEqual(
      listed.map((session) => session.date),
      ["2026-10-17", "2026-10-31", "2026-11-07", "2026-11-21", "2026-12-05"],
    );
  });

  it("keeps a class on its Pacific date, including late that evening", () => {
    // 2026-10-18 06:30 UTC is still 2026-10-17 11:30 PM PDT.
    const listed = upcomingClasses(new Date("2026-10-18T06:30:00Z"));
    assert.equal(pacificDateString(new Date("2026-10-18T06:30:00Z")), "2026-10-17");
    assert.equal(listed[0]?.date, "2026-10-17");
    assert.equal(listed.length, 5);
  });

  it("hides a class once the Pacific date has passed", () => {
    // 2026-10-18 07:00 UTC is 2026-10-18 12:00 AM PDT.
    const listed = upcomingClasses(new Date("2026-10-18T07:00:00Z"));
    assert.equal(pacificDateString(new Date("2026-10-18T07:00:00Z")), "2026-10-18");
    assert.equal(listed.some((session) => session.date === "2026-10-17"), false);
    assert.equal(listed[0]?.date, "2026-10-31");
  });

  it("uses Pacific standard time after the November clock change", () => {
    // 2026-11-08 07:30 UTC is still 2026-11-07 11:30 PM PST.
    assert.equal(pacificDateString(new Date("2026-11-08T07:30:00Z")), "2026-11-07");
    assert.equal(upcomingClasses(new Date("2026-11-08T07:30:00Z"))[0]?.date, "2026-11-07");
    // 2026-11-08 08:00 UTC is 2026-11-08 12:00 AM PST.
    assert.equal(pacificDateString(new Date("2026-11-08T08:00:00Z")), "2026-11-08");
    assert.equal(
      upcomingClasses(new Date("2026-11-08T08:00:00Z")).some((session) => session.date === "2026-11-07"),
      false,
    );
  });

  it("returns nothing after the last date", () => {
    assert.deepEqual(upcomingClasses(new Date("2026-12-06T08:00:00Z")), []);
  });

  it("sorts added dates even if the array is out of order", () => {
    const listed = upcomingClasses(new Date("2026-01-01T12:00:00Z"), [
      CLASSES[2],
      CLASSES[0],
    ]);
    assert.deepEqual(
      listed.map((session) => session.date),
      ["2026-10-17", "2026-11-07"],
    );
  });
});

describe("formatClassWhen", () => {
  it("formats afternoon and morning Pacific times", () => {
    assert.deepEqual(formatClassWhen(CLASSES[0]), {
      id: "2026-10-17-1500",
      dateLabel: "Saturday, October 17, 2026",
      timeLabel: "3:00–4:00 PM PT",
    });
    assert.equal(formatClassWhen(CLASSES[1]).dateLabel, "Saturday, October 31, 2026");
    assert.equal(formatClassWhen(CLASSES[1]).timeLabel, "9:00–10:00 AM PT");
    assert.equal(formatClassWhen(CLASSES[4]).dateLabel, "Saturday, December 5, 2026");
  });
});

describe("class page copy", () => {
  it("keeps the required notice, TPMO disclaimer, and affiliation line verbatim", () => {
    assert.equal(
      CLASS_PAGE.notice,
      "This is an educational class only. No plans will be discussed or sold, and no one will be enrolled during the class. Attending does not require booking a consult.",
    );
    assert.equal(
      CLASS_PAGE.tpmo,
      "We do not offer every plan available in your area. Currently we represent 11 organizations which offer 50 products in your area. Please contact Medicare.gov, 1-800-MEDICARE (TTY 1-877-486-2048), or your local State Health Insurance Program (SHIP) to get information on all of your options.",
    );
    assert.equal(
      CLASS_PAGE.affiliation,
      "Not affiliated with or endorsed by the U.S. government or the federal Medicare program. Licensed in NV, CA, TX, HI, UT.",
    );
    assert.equal(CLASS_PAGE.headline, "Free Medicare 101 Classes");
    assert.match(CLASS_PAGE.intro, /Leo Adaoag, MBA, RSSA®/);
    assert.equal(CLASS_PAGE.phoneDisplay, "702-627-2605");
    assert.doesNotMatch(JSON.stringify(CLASS_PAGE), /\$0|free plan/i);
  });
});
