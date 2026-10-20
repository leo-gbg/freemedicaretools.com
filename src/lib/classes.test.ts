import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLASS_PAGE, CLASSES, formatClassWhen, pacificDateString, upcomingClasses } from "./classes.ts";

describe("upcomingClasses", () => {
  it("lists every scheduled class before the first date", () => {
    const listed = upcomingClasses(new Date("2026-10-12T18:00:00Z"));
    assert.deepEqual(
      listed.map((session) => session.date),
      [
        "2026-10-31",
        "2026-11-07",
        "2026-11-21",
        "2026-12-05",
        "2027-01-09",
        "2027-03-06",
        "2027-05-01",
        "2027-07-03",
        "2027-09-04",
      ],
    );
  });

  it("keeps a class on its Pacific date, including late that evening", () => {
    // 2026-11-01 06:30 UTC is still 2026-10-31 11:30 PM PDT.
    const listed = upcomingClasses(new Date("2026-11-01T06:30:00Z"));
    assert.equal(pacificDateString(new Date("2026-11-01T06:30:00Z")), "2026-10-31");
    assert.equal(listed[0]?.date, "2026-10-31");
    assert.equal(listed.length, 9);
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
    // 2027-09-05 07:00 UTC is 2027-09-05 12:00 AM PDT, the day after the last class.
    assert.deepEqual(upcomingClasses(new Date("2027-09-05T07:00:00Z")), []);
  });

  it("sorts added dates even if the array is out of order", () => {
    const listed = upcomingClasses(new Date("2026-01-01T12:00:00Z"), [
      CLASSES[1],
      CLASSES[0],
    ]);
    assert.deepEqual(
      listed.map((session) => session.date),
      ["2026-10-31", "2026-11-07"],
    );
  });
});

describe("formatClassWhen", () => {
  it("formats afternoon and morning Pacific times", () => {
    assert.deepEqual(formatClassWhen(CLASSES[1]), {
      id: "2026-11-07-1500",
      dateLabel: "Saturday, November 7, 2026",
      timeLabel: "3:00–4:00 PM PT",
    });
    assert.equal(formatClassWhen(CLASSES[0]).dateLabel, "Saturday, October 31, 2026");
    assert.equal(formatClassWhen(CLASSES[0]).timeLabel, "9:00–10:00 AM PT");
    assert.equal(formatClassWhen(CLASSES[3]).dateLabel, "Saturday, December 5, 2026");
    const byDate = Object.fromEntries(CLASSES.map((session) => [session.date, session]));
    assert.equal(formatClassWhen(byDate["2027-01-09"]).timeLabel, "2:00–3:00 PM PT");
    assert.equal(formatClassWhen(byDate["2027-03-06"]).dateLabel, "Saturday, March 6, 2027");
    assert.equal(formatClassWhen(byDate["2027-03-06"]).timeLabel, "2:00–3:00 PM PT");
    assert.equal(formatClassWhen(byDate["2027-05-01"]).timeLabel, "3:30–4:30 PM PT");
    assert.equal(formatClassWhen(byDate["2027-07-03"]).dateLabel, "Saturday, July 3, 2027");
    assert.equal(formatClassWhen(byDate["2027-07-03"]).timeLabel, "3:00–4:00 PM PT");
    assert.equal(formatClassWhen(byDate["2027-09-04"]).dateLabel, "Saturday, September 4, 2027");
    assert.equal(formatClassWhen(byDate["2027-09-04"]).timeLabel, "2:00–3:00 PM PT");
    assert.equal(byDate["2027-09-04"].rsvpUrl, "https://fantastical.app/i/NRZR5GKh1hHJFz7");
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
      "We do not offer every plan available in your area. Currently we represent 8 organizations which offer 50 products in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all of your options.",
    );
    assert.equal(
      CLASS_PAGE.tpmoCounts,
      "Counts are for Clark County, NV, 2027 plan year. 1-800-MEDICARE is available 24 hours a day, 7 days a week (TTY 1-877-486-2048).",
    );
    assert.doesNotMatch(CLASS_PAGE.tpmo, /SHIP/);
    assert.equal(
      CLASS_PAGE.affiliation,
      "Not affiliated with or endorsed by the U.S. government or the federal Medicare program. Licensed in NV, CA, TX, HI, UT. · NPN 21173691",
    );
    assert.equal(
      CLASS_PAGE.signupNote,
      "Your name and email are used only to send the class link and reminders. If you add a phone number, it's used only if the class link changes. We won't call, text, or send sales follow-ups from your sign-up. Please don't share health or plan details in the comment box.",
    );
    assert.equal(CLASS_PAGE.privacyLabel, "Privacy Policy");
    assert.equal(CLASS_PAGE.headline, "Free Medicare 101 Classes");
    assert.match(CLASS_PAGE.intro, /Leo Adaoag, MBA, RSSA®/);
    assert.equal(CLASS_PAGE.phoneDisplay, "702-627-2605");
    assert.doesNotMatch(JSON.stringify(CLASS_PAGE), /\$0|free plan/i);
  });
});
