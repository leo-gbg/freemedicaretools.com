import { TPMO_COUNTS, TPMO_DISCLAIMER } from "./medicare/tpmo";

/**
 * Free Medicare 101 classes.
 *
 * Add a row to CLASSES when a date is set. Dates and times are Pacific Time.
 * A class leaves the page once its Pacific calendar date has passed.
 * Times below are Pacific. They were read from each Fantastical page (shown
 * there in UTC) and converted. An invite with no clock time is left out.
 */

export type ClassSession = {
  /** Pacific calendar date, YYYY-MM-DD. */
  date: string;
  /** Start time in Pacific Time, 24-hour HH:MM. */
  start: string;
  /** End time in Pacific Time, 24-hour HH:MM. */
  end: string;
  /** Fantastical RSVP page. */
  rsvpUrl: string;
};

export const CLASSES: ClassSession[] = [
  {
    date: "2026-11-07",
    start: "15:00",
    end: "16:00",
    rsvpUrl: "https://fantastical.app/i/CZaMCz66MUHoFoe",
  },
  {
    date: "2026-11-21",
    start: "15:00",
    end: "16:00",
    rsvpUrl: "https://fantastical.app/i/2v015P6xMnHfFEK",
  },
  {
    date: "2026-12-05",
    start: "15:00",
    end: "16:00",
    rsvpUrl: "https://fantastical.app/i/NrlzqH7xMqHwFyb",
  },
  {
    date: "2027-01-09",
    start: "14:00",
    end: "15:00",
    rsvpUrl: "https://fantastical.app/i/VWNm2XcRNQHdFvt",
  },
  {
    date: "2027-03-06",
    start: "14:00",
    end: "15:00",
    rsvpUrl: "https://fantastical.app/i/sUmoQqGN1sHBFZ6",
  },
  {
    date: "2027-05-01",
    start: "15:30",
    end: "16:30",
    rsvpUrl: "https://fantastical.app/i/VAFV6WH51xHiFMY",
  },
  {
    date: "2027-07-03",
    start: "15:00",
    end: "16:00",
    rsvpUrl: "https://fantastical.app/i/ECK9K7K21AHGF2q",
  },
  {
    date: "2027-09-04",
    start: "14:00",
    end: "15:00",
    rsvpUrl: "https://fantastical.app/i/NRZR5GKh1hHJFz7",
  },
];

export const CLASS_PAGE = {
  headline: "Free Medicare 101 Classes",
  intro:
    "This is a free, educational class on Google Meet, presented by Leo Adaoag, MBA, RSSA®, licensed insurance agent with Guardian Benefits Group. Each class is about one hour. All times below are Pacific Time.",
  learnHeading: "What you'll learn",
  learn: [
    "Parts A, B, C and D",
    "Medigap",
    "Enrollment periods and late penalties",
    "How to use the free tools on this site",
  ],
  notice:
    "This is an educational class only. No plans will be discussed or sold, and no one will be enrolled during the class. Attending does not require booking a consult.",
  upcomingHeading: "Upcoming classes",
  signupNote:
    "Your name and email are used only to send the class link and reminders. If you add a phone number, it's used only if the class link changes. We won't call, text, or send sales follow-ups from your sign-up. Please don't share health or plan details in the comment box.",
  privacyLabel: "Privacy Policy",
  empty: "There are no upcoming classes right now.",
  reserve: "Reserve my seat",
  meet: "Google Meet",
  duration: "about 1 hour",
  tpmo: TPMO_DISCLAIMER,
  tpmoCounts: TPMO_COUNTS,
  affiliation:
    "Not affiliated with or endorsed by the U.S. government or the federal Medicare program. Licensed in NV, CA, TX, HI, UT, ID. · NPN 21173691",
  questionsLabel: "Questions:",
  phoneDisplay: "702-627-2605",
  phoneHref: "tel:+17026272605",
  tty: "(TTY 711).",
} as const;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const PACIFIC = "America/Los_Angeles";

/** YYYY-MM-DD for an instant, using the Pacific calendar. */
export function pacificDateString(asOf: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(asOf);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

/** Classes whose Pacific date is today or still ahead, soonest first. */
export function upcomingClasses(asOf = new Date(), classes: readonly ClassSession[] = CLASSES): ClassSession[] {
  const today = pacificDateString(asOf);
  return classes
    .filter((session) => session.date >= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
}

export type ClassWhen = {
  id: string;
  dateLabel: string;
  timeLabel: string;
};

function clock(hhmm: string): { hour: number; minute: string; suffix: "AM" | "PM" } {
  const [rawHour, rawMinute] = hhmm.split(":");
  const hour24 = Number(rawHour);
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour, minute: rawMinute.padStart(2, "0"), suffix };
}

/** "Saturday, November 7, 2026" and "3:00–4:00 PM PT". */
export function formatClassWhen(session: ClassSession): ClassWhen {
  const [year, month, day] = session.date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  const start = clock(session.start);
  const end = clock(session.end);
  const timeLabel =
    start.suffix === end.suffix
      ? `${start.hour}:${start.minute}–${end.hour}:${end.minute} ${start.suffix} PT`
      : `${start.hour}:${start.minute} ${start.suffix}–${end.hour}:${end.minute} ${end.suffix} PT`;

  return {
    id: `${session.date}-${session.start.replace(":", "")}`,
    dateLabel: `${weekday}, ${MONTHS[month - 1]} ${day}, ${year}`,
    timeLabel,
  };
}
