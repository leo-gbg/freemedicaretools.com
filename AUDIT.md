# FreeMedicareTools audit

> **Status:** This is the 23 September 2026 record. Current status is in [AUDIT-2026-09-24.md](./AUDIT-2026-09-24.md) (live re-check the evening of 24 September 2026, `main` at `c8fbba8`). Privacy and terms have since shipped. Do not treat the open-item list below as the current queue.

**Date:** 23 September 2026  
**Repo:** https://github.com/leo-gbg/freemedicaretools.com (commit `303efc3` on `main`)  
**Live:** https://freemedicaretools.com  
**Scope:** Read-only audit of every page and tool. No product code was changed.  
**Decision this report asks for:** Approve the Must list as the pre-AEP patch. Should and Nice can wait.

## Implementation status (23 September 2026)

Leo approved the Must list. Must items 1–6 are implemented in product code on this branch. Must item 7 is deferred on purpose.

| Item | Status |
| --- | --- |
| 1. IEP last day and birthday on the 1st | Implemented in `src/lib/medicare/iep.ts`. The window stays open through the last calendar day, a birthday on the 1st is centered on the prior month, and month math no longer spills a 31st birthday into the next month. Covered by `src/lib/medicare/iep.test.ts` (`npm test`). |
| 2. Part B start-date tip (post-2023 rule) | Implemented in the same file. The “delayed by 1–3 months” sentence is gone. |
| 3. AEP checklist ANOC year | Implemented. The checklist now points at this fall’s notice for **2027** plan changes. |
| 4. Working-past-65 defaults | Implemented. Employer coverage and “20 or more employees” start unchecked. |
| 5. Worksheet PHI out of email | Implemented. Mailto subject and body do not include the worksheet. MBI/SSN are still not collected. Data stays in this browser tab (`sessionStorage`) only so the print page can open; it is not posted to a server. On-form and print-page notices say so, and say not to put drugs, date of birth, Medicaid, or VA details in email. |
| 6. Public copy on `/` and `/research` | Implemented. Home, research, the shared consult card, and the footer no longer use “lead magnet,” “hire you,” or “helps you enroll.” The button label is now “Request a free consult”; the site does not book consults, visitors request one by email. The footer non-affiliation line is unchanged. |
| 7. License, phone, calendar | Deferred. Leo: this site is a general educational tool, not a licensed enrollment product. License identity, NPN, and state boundaries stay blank. Phone stays hidden. Consult stays the existing mailto. Identity and consult can be built later. |

Compliance follow-up: the three bare `$0` premium strings are removed (path quiz prompt, mixed path-quiz result, glossary premium entry). Also softened: “Before you choose,” the shared disclaimer (“choose or change coverage”), and the worksheet “plan options” line. Penalty math may still show `$0.00` when a late penalty is zero; that is a calculated result, not a premium claim.

Still open from the original Should / Nice lists: IRMAA exact $500,000 / $750,000 edge, Medigap high-deductible F/G and MA/MN/WI, robots/sitemap, privacy page, and the other SEO notes above.

AEP opens **15 October 2026** (about three weeks from this audit). The 2026 dollar tables are in good shape. Three calculator behaviors and the client-worksheet email path are the items that can mislead a person before that window.

---

## How this was checked

- Source of truth: application code under `src/`.
- Dollar figures compared with the CMS fact sheet *2026 Medicare Parts A & B Premiums and Deductibles* (14 November 2025), including the Part B and Part D IRMAA tables: https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
- Part D national base beneficiary premium **$38.99** for 2026, from Medicare.gov *2026 Medicare Costs* (publication 11579).
- IEP coverage-start rule compared with Medicare.gov *When does Medicare coverage start?* and the SSA advocate notice on the 1 January 2023 effective-date change.
- Live fetch from this audit environment on 23 September 2026 succeeded over HTTP/2. Apex and `www` both returned **200** with the same ETag. `/robots.txt`, `/sitemap.xml`, `/privacy`, and `/terms` returned **404**.
- Some networks still see `ERR_CONNECTION_CLOSED` to this host. This run did not reproduce that. Hosting is **Hostinger** (`platform: hostinger`, `panel: hpanel`, `server: hcdn`). Treat intermittent connection failures as a hosting/TLS edge risk, separate from the app code.

---

## 1. Inventory

Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind. No API routes. No database. No analytics snippet in the layout. Consult links are `mailto:hello@freemedicaretools.com`.

| Route | What it does | Logic home |
| --- | --- | --- |
| `/` | Home. Lists all nine tools. Footer non-affiliation line. Public “Hormozi-style lead magnets” framing. | `src/app/page.tsx` |
| `/tools` | Tool kit, split into turning-65 and already-enrolled. Tools tagged `both` appear in both groups. | `src/app/tools/page.tsx`, `src/lib/medicare/tools.ts` |
| `/tools/iep-timeline` | Month/day/year birth date → 7-month Initial Enrollment Period, status (upcoming / open / ended), next-tool links. | `src/lib/medicare/iep.ts`, `src/components/tools/iep-timeline-tool.tsx` |
| `/tools/penalty-estimator` | Part B and Part D late-enrollment penalty as a **1-year** extra at 2026 rates. | `src/lib/medicare/penalties.ts`, `src/lib/medicare/constants.ts` |
| `/tools/period-finder` | Checkboxes for situation → IEP, AEP, OEP, GEP, SEP, with today’s date and an “Upcoming” tag 3 months before fixed windows. | `src/lib/medicare/decisions.ts` (`findEnrollmentWindows`) |
| `/tools/path-quiz` | Six yes/no questions → directional lean: Advantage, Original + Medigap, or mixed. Labeled “not a plan recommendation.” | `scoreCoveragePath` in `decisions.ts` |
| `/tools/med-supp-compare` | Preference questions plus a standardized letter chart (A, B, C, D, F, G, K, L, M, N). | `src/lib/medicare/medigap.ts` |
| `/tools/med-supp-compare/print` | Browser print / Save as PDF of the full letter chart. No personal data. | `src/components/tools/medigap-print-document.tsx` |
| `/tools/client-worksheet` | Contact, coverage context, drugs, doctors, notes. Required to continue: name and phone. | `src/lib/medicare/client-worksheet.ts` |
| `/tools/client-worksheet/print` | Print view, “Email to agent” mailto, “Download CRM JSON.” Data comes from `sessionStorage`. | `src/components/tools/client-worksheet-print.tsx` |
| `/tools/irmaa-checker` | 2024 MAGI + filing status → 2026 Part B total, Part D IRMAA, combined surcharge. | `lookupIrmaa` in `decisions.ts`, brackets in `constants.ts` |
| `/tools/working-past-65` | Employer / spouse / 20+ employees / HSA → “may delay Part B” or “delay looks risky.” | `assessWorkingPast65` in `decisions.ts` |
| `/tools/aep-checklist` | 10-item Oct 15–Dec 7 checklist with a progress bar. State is in memory only. | `src/components/tools/aep-checklist-tool.tsx` |
| `/glossary` | Searchable plain-language glossary (enrollment, parts, costs, coverage, programs). | `src/lib/medicare/glossary.ts` |
| `/research` | Public “why these tools” page. Names Alex Hormozi and frames the site as a lead magnet. | `src/app/research/page.tsx` |

Shared chrome: header (Tool kit, Glossary, Why these tools, Book a free consult), footer non-affiliation line, and on each tool a short educational disclaimer plus the consult card. Brand constants: `src/lib/brand.ts`.

There is no phone number, privacy page, terms page, license/NPN line, `robots.txt`, or `sitemap.xml`.

---

## 2. Logic correctness

### What matches published 2026 figures

These constants in `src/lib/medicare/constants.ts` match the CMS 14 November 2025 fact sheet and the Medicare.gov 2026 costs booklet:

| Constant | Code | Published 2026 |
| --- | --- | --- |
| `YEAR` | 2026 | Calendar year 2026 |
| `PART_B_STANDARD_PREMIUM` | 202.90 | $202.90 |
| `PART_B_DEDUCTIBLE` | 283 | $283 (defined, never shown in the UI) |
| `PART_D_BASE_BENEFICIARY_PREMIUM` | 38.99 | $38.99 national base beneficiary premium |
| IRMAA individual/joint bands and Part B totals | $202.90 / $284.10 / $405.80 / $527.50 / $649.20 / $689.90 | Same |
| Part B surcharges | $0, $81.20, $202.90, $324.60, $446.30, $487.00 | Same |
| Part D IRMAA | $0, $14.50, $37.50, $60.40, $83.30, $91.00 | Same |
| AEP | Oct 15–Dec 7 | Correct |
| MA-OEP | Jan 1–Mar 31, one change, Advantage members | Correct in `OEP.description` |
| GEP | Jan 1–Mar 31; coverage the month after signup | Matches the post-2023 GEP rule |

Part B late penalty math in `src/lib/medicare/penalties.ts` is the standard rule: 10% of the current standard premium for each **full** 12-month period, partial years ignored, result rounded to the nearest $0.10. Part D is 1% of the national base beneficiary premium times uncovered months, then rounded to the nearest $0.10. Notes correctly say both amounts are typically lifelong and move when national figures move, and that the box is **one year** of extra cost. Months with Extra Help or creditable coverage are called out as possibly excluded.

Married filing separately, for someone who **lived with their spouse at any time** in the tax year, is handled in `lookupIrmaa` (`src/lib/medicare/decisions.ts`): at or under $109,000 → standard; above $109,000 and under $391,000 → the $649.20 / $83.30 tier; $391,000 and above → $689.90 / $91.00. That matches CMS. The per-tier `separateMin` / `separateMax` fields on tiers 1–4 in `constants.ts` are unused duplicates (all stuffed with 109000–391000). The special-case branch is what actually runs. Leave those fields unused or they will mislead the next edit.

Individual and joint cutoffs at $109,000, $137,000, $171,000, and $205,000 use “less than or equal,” which matches CMS. The **top** cliff does not (see below).

Medigap letters A–N in `src/lib/medicare/medigap.ts` match the standard federal chart for the core benefits (Part A coinsurance, Part B coinsurance, blood, hospice, SNF, Part A deductible, Part B deductible, Part B excess, foreign travel as limited, K at 50%, L at 75%, M Part A deductible at 50%, N as copays, C/F closed to people first eligible on or after 1 January 2020). The tool says benefits are standardized by letter and that Medigap does not include Part D. That framing is right.

### Must-fix logic

**1. IEP closes a day early.**  
`endOfMonth` in `src/lib/medicare/iep.ts` builds the last calendar day at **midnight** (`new Date(year, month + 1, 0)`). Status becomes `ended` when `asOf > iepEnd`. On the final day of the window, any time after 12:00:00 a.m. is treated as closed.

Worked example: birthday 15 April 1961 → turns 65 on 15 April 2026 → IEP should run 1 January 2026 through the end of 31 July 2026. On the afternoon of 31 July 2026 the tool reports the IEP as ended.

AEP/OEP/GEP in `decisions.ts` set the end to 23:59:59, so those windows do not have this bug. IEP should use the same end-of-day comparison.

**2. Birthday on the 1st uses the wrong month.**  
`calculateIep` centers the 7 months on the calendar birthday month. Medicare treats a birthday on the 1st as reaching 65 in the **prior** month, and the IEP is centered on that earlier month. The hint in `earliestCoverageHint` says rules “can vary if your birthday is on the 1st,” and then still prints the unshifted dates.

Worked example: birthday 1 June 1961. The tool returns March 2026–September 2026. The entitlement month is May 2026, so the IEP is February 2026–August 2026.

**3. Part B start-date tip is the pre-2023 rule.**  
Open and upcoming IEP tips say: “If you wait until your birth month or later, Part B coverage can be delayed by 1–3 months” (`iep.ts`). Since 1 January 2023, signing up in the birthday month or in the last three months of the IEP starts coverage on the **first day of the next month**. The old 2-to-3-month delay is the rule this sentence still teaches. GEP copy in `constants.ts` already says coverage starts the month after enrollment, which is the current rule. The IEP tip should say the same thing, and keep the birthday-on-the-1st caveat once the dates themselves are fixed.

**4. AEP checklist names the wrong notice for this fall.**  
`src/components/tools/aep-checklist-tool.tsx` says “Compare your current plan’s **2026** Annual Notice of Change (ANOC).” The ANOC in hand in September 2026 describes **2027** plan-year changes. Pointing at “the 2026 ANOC” sends people to last year’s notice during the shopping season that starts 15 October.

**5. “Still working past 65” defaults to a green light.**  
`src/components/tools/working-past-65-tool.tsx` initializes “current employer coverage” and “20 or more employees” to **checked**. One click on “Check delay risk,” without reading, returns “You may be able to delay Part B without a penalty.” Uncheck those boxes to see the warning. For a penalty-risk question, the safe default is unchecked.

### Should-fix logic (real, narrower)

**IRMAA top cliff is inclusive on the wrong side.**  
CMS: individual MAGI **greater than or equal to $500,000** (joint **$750,000**) is the top tier, $689.90 Part B and $91.00 Part D. `lookupIrmaa` treats `income <= singleMax` with `singleMax: 500000` (and joint `750000`) as the **$649.20 / $83.30** tier. Exactly $500,000 or $750,000 is one bracket low. Amounts one dollar on either side are fine. Same pattern is already handled correctly for married-filing-separately at $391,000 (`>=` goes to the top tier).

**Married filing separately who lived apart all year.**  
CMS uses the **individual** table when the person lived apart from their spouse for the entire tax year. The checker always applies the compressed three-tier table. A $150,000 MAGI in that situation is shown as $649.20 Part B instead of the individual tier ($405.80). The label should state the “lived with spouse at any time during the year” condition, or ask it.

**“Single” omits other individual filers.**  
Head of household and qualifying surviving spouse use the individual IRMAA column. The control only says “Single.”

**Penalty marketing used to imply a multi-year dollar total; the math shows 1 year.**  
Public sentences in `src/lib/medicare/tools.ts` and `src/app/research/page.tsx` now match the estimator: one year of extra cost, and the notes that penalties are typically lifelong. No cumulative multi-year total is shown.

**Part A late penalty is absent.**  
People who pay a Part A premium can owe 10% for twice the number of years they delayed. The estimator is Part B and Part D only. Say that on the tool so a buy-in Part A case is not read as “$0 penalty.”

**Part B uncovered-month helper is thinner than Part D.**  
The Part D field says “each month after IEP without creditable Rx coverage.” The Part B field only cites the 2026 premium. The clock generally starts after the IEP, and months with coverage based on current employment do not count. The result notes mention creditable coverage; the input label should too.

**Working-past-65 rule is the age-65, 20-employee rule only.**  
That is the right rule for someone aging into Medicare. Missing caveats, in `assessWorkingPast65` and the tool copy:

- Medicare because of disability uses the **100-employee** large-group threshold, not 20.
- The spouse checkbox and the size checkbox share one “employer providing coverage.” If both boxes are on, it is unclear whose employer must have 20 or more employees.
- COBRA, retiree, and marketplace coverage are named in the watch-outs. The first checkbox still reads “or I am actively employed,” which a person can check without having coverage **based on current employment**.
- HSA: the tool correctly says Part A generally stops new HSA contributions when that box is on. It does not mention that premium-free Part A can be retroactive up to six months and can make earlier HSA contributions excess.

**SEP line is a fair shorthand with one gap.**  
Period finder: “Usually 8 months after employer coverage ends (Part B) / 63 days for Part D.” Part B’s 8 months runs from the earlier of the end of employment or the end of group coverage. Part D’s window is two full months after the month creditable drug coverage ends (often described as up to 63 days). Worth one precise sentence. IEP in the period finder is marked `openNow` whenever “approaching 65” is checked, so the teal “open” style can show before the 7-month window exists. The badge text still says “Personal timing.”

**Medigap chart gaps (the letters that are present look right).**

- High-deductible Plan F and high-deductible Plan G are not in the matrix.
- Plans K and L show an out-of-pocket limit as “Yes” with no dollar cap. Those caps change yearly; add them only with the year in the label.
- Plan N copy states $20 office / $50 ER copays and omits that the ER copay is waived if the person is admitted.
- Massachusetts, Minnesota, and Wisconsin do not use this letter chart. No caveat.
- “Most common” / “popular” notes are editorial, not CMS facts.
- Quiz order in `recommendMedSupp` is first-match. “Wants an OOP cap and a lower premium” returns K/L even when other answers point at G. The page should keep saying this is a lean, which it mostly does.

**2027 refresh.**  
2026 premiums, IRMAA, and the Part D base premium are the right figures **through 31 December 2026**. CMS usually publishes the next year’s amounts in November. Anything that still says “2026” on 1 January 2027 will be stale. `PART_B_DEDUCTIBLE` ($283) is already correct and unused; either show it with the year or drop it so it cannot drift unnoticed.

---

## 3. PHI / PII

The worksheet is the only form that collects personal data. No tool posts to an application server. There is no `app/api` route and no `localStorage` use.

### Collected (client worksheet)

Contact: full legal name, preferred name, phone, email, street, apt, city, state, ZIP, county, date of birth, Part B effective date.  
Health and coverage: current coverage, free-text coverage notes, pharmacy, hospital, out-of-state travel, tobacco, dental/vision/hearing priority, premium budget, Medicaid dual status, VA benefits, caregiver name and phone, prescriptions (name, dosage, frequency, generics OK), providers (name, practice, specialty, address, must-keep), free-text notes.

The form states it does **not** ask for a Medicare number (MBI) or Social Security number. The data model comment says the same (`src/lib/medicare/client-worksheet.ts`). The print footer says not to write an MBI or SSN on copies that will be emailed. **Keep it that way.** Do not add MBI or SSN to this public form. Free-text notes can still contain them if a person types them; the warning should sit on the form itself, not only the print footer.

ZIP is labeled `ZIP *` but `goToPrint` only requires name and phone (`client-worksheet-tool.tsx`).

### Where it goes

| Store or send | What happens |
| --- | --- |
| React state | While the form tab is open. |
| `sessionStorage` key `fmt-client-worksheet-v1` | Written on “Create printable PDF worksheet.” Survives refresh in that tab. Cleared when the tab session ends. Any script on this origin can read it. |
| `localStorage` | Not used. |
| Next.js / Hostinger server | Not sent by app code. |
| Print / Save as PDF | Stays on the person’s machine unless they attach it to an email themselves. |
| “Email to agent” | Builds `mailto:hello@freemedicaretools.com` with the **full plain-text worksheet in the query string** (`worksheetToPlainText`: name, DOB, address, drugs, Medicaid, VA, tobacco, notes). That URL can land in browser history. Long drug lists often exceed mailto length limits and truncate with no warning. The message then sits in whatever inbox `hello@` delivers to. |
| “Download CRM JSON” | A local `.json` file via a blob URL. Includes the same fields plus `source: FreeMedicareTools.com`. Nothing is uploaded. Filename contains the person’s name. |

`README.md` says “Tools do not store PHI; results stay in the browser.” Session storage **is** storing a health worksheet in the browser. The print page is more accurate: “nothing is uploaded from this browser session.”

Other tools (IEP birth date, IRMAA income, penalty months, quiz answers) stay in component state only. They are not written to storage. The IEP birth date and IRMAA income are still sensitive; they are not transmitted.

### Recommendation (do not expand collection)

- Leave MBI and SSN off the form.
- Stop putting the worksheet body in the mailto URL. Subject line plus “attach the PDF you just saved” is enough. PHI stays in Kizen when an agent is ready to record it, not in a public mailto.
- Add a short notice on the form: what is typed, that it sits in this browser tab until the tab closes, that Email sends it through the person’s own email app, and that this site is not the system of record.
- A privacy page should exist before this form is used with clients. `/privacy` is 404 today.
- The future Kizen mapping keys in the JSON are fine as a local export. Do not POST that JSON to the marketing site.

---

## 4. Marketing and compliance flags

Footer on every page (`src/components/site-chrome.tsx`): “Not affiliated with the U.S. government, CMS, or Medicare. Not legal, tax, or official benefits advice.” That line is present on the live home page.

Tool pages also show `DISCLAIMER` from `constants.ts`: educational estimates, 2026 reference amounts can change, a licensed agent can review the situation. Home, `/tools`, `/glossary`, and `/research` rely on the shorter footer line only.

No “guaranteed” claim turned up. No carrier is named or endorsed. The consult **button** says “Book a free consult,” which is the compliance-safe CTA.

Flags to clean:

| Location | Copy | Why it matters |
| --- | --- | --- |
| `src/components/consult-cta.tsx` | “A licensed agent helps you **enroll** with confidence.” | The button is fine. This sentence tells the public the agent will enroll them. Soften to a consult / review of options. |
| `src/components/tools/path-quiz-tool.tsx` | “A low (or **$0**) monthly plan premium matters most.” | Public $0 premium language. Rephrase to “a lower monthly premium.” |
| `src/lib/medicare/decisions.ts` mixed-path summary | “dental/vision, **$0 premiums**” | Same. |
| `src/lib/medicare/glossary.ts` premium entry | “sometimes **$0** before IRMAA” | Educational, still a $0 claim on `/glossary` (confirmed live). |
| `src/components/tools/med-supp-compare-tool.tsx` | Heading “Before you **enroll**.” | Use “before you choose” or “before you meet.” |
| Worksheet and Medigap print | “**quotes**” | Prefer “plan options” / “book a free consult.” Print footer already has the consult line. |
| `src/app/page.tsx` | “Hormozi-style **lead magnets**.” “Keep the **enrollment representation** for when it counts.” | Internal sales framing on the public home page. |
| `src/app/research/page.tsx` | Names Hormozi, “invite the prospect to **hire you**,” “prime time for **agent representation**.” | Linked in the header as “Why these tools.” Fine as an internal note. Weak as a public trust page. |
| `DISCLAIMER` | “before you enroll or re-enroll” | Milder than the CTA. Still the verb “enroll” on every tool. Optional soften. |
| Glossary and tool blurbs | Ordinary uses of “enroll” to define IEP/AEP | Leave these. They describe Medicare rules, not an offer to enroll. |

No state appointment, NPN, or “we are licensed in …” line exists. `README.md` already says to add state licensing disclosures and to point the CTA at a calendar or Kizen form. The code still uses mailto only.

---

## 5. Branding and trust

| Item | Status |
| --- | --- |
| Site name | FreeMedicareTools / FreeMedicareTools.com. Consistent. |
| Operator | “Powered by Guardian Benefits Group” in the header and footer, linking to https://guardianbg.com. Confirmed on the live home page. |
| Person | Leo Adaoag is not named on the site. No NPN, license states, business address, or phone. |
| Consult | `mailto:hello@freemedicaretools.com` with subject “Book a free Medicare consult” or “Free Medicare consult — {tool}”. No calendar URL. No phone in `src/lib/brand.ts`. |
| Non-affiliation | Footer, yes. |
| Educational disclaimer | Tool shell, yes. Rest of the site, footer sentence only. |
| Privacy / terms | Not in the repo. Live `/privacy` and `/terms` are 404. |
| Email shown to the public | `hello@freemedicaretools.com` via the mailto (confirmed in live HTML). |

Trust gap: a person can print a worksheet full of drugs and Medicaid status and email it to a hello@ inbox, without a privacy notice or a named licensed agent. Add the license identity Leo wants to stand behind (name or agency, states, NPN if he uses it publicly) and one consult destination he actually monitors.

---

## 6. SEO and ops

Live responses on 23 September 2026:

| Check | Result |
| --- | --- |
| `https://freemedicaretools.com/` | 200. Title `FreeMedicareTools — Free Medicare navigation tools`. Description matches `src/app/layout.tsx`. |
| `https://www.freemedicaretools.com/` | 200, **same ETag as apex**. No redirect. No `<link rel="canonical">` on either host. |
| `/robots.txt` | 404 |
| `/sitemap.xml` | 404 |
| `/privacy`, `/terms` | 404 |
| Tool titles | Unique and accurate (`IEP Timeline Calculator · FreeMedicareTools`, and the same pattern for the other tools). |
| `/tools` and `/research` descriptions | Reuse the **homepage** description, because those pages set `title` only. |
| Print routes | 200, indexable, no `noindex`. Worksheet print HTML does not contain visitor PHI (that data is added in the browser). |
| `metadataBase` | Set to `https://freemedicaretools.com` in `layout.tsx`. |
| Open Graph | Only the two print pages set `openGraph`. No share image. No `public/` assets and no app icon in the repo. |
| Hosting headers | Hostinger. `x-powered-by: Next.js`. CSP is only `upgrade-insecure-requests`. HTML `cache-control: s-maxage=31536000` (about one year at the CDN). |
| Config | Both `next.config.ts` and `next.config.mjs` exist and are empty. Production is up, so one of them is winning. Two config files will confuse the next deploy. |
| Tests | No unit tests around `calculateIep`, `lookupIrmaa`, or `estimateLatePenalties`. |

`www` and apex both ranking, a year-long HTML cache, and no sitemap are the ops items. A year-long cache also means a copy fix (the ANOC year, the IEP bug once it is fixed) can stay stale at the edge until Hostinger is purged.

Security headers are thin for a site that holds a health worksheet in the browser. A real Content-Security-Policy and HSTS belong at the host or in `next.config`, after the duplicate config file is removed.

---

## 7. UX, accessibility, and print

What is in good shape:

- IEP uses month / day / year selects, with an explicit note that this is easier than a browser date picker for birth years like 1951. Invalid dates such as 31 February are rejected.
- Tool inputs that matter use `<label>` or `aria-label`.
- AEP progress bar exposes `aria-valuenow`.
- Acronym tips are real `<button>` elements with `aria-label`, so they work on keyboard, not only hover.
- Medigap comparison is a table with row headers. The on-screen table scrolls horizontally (`min-w-[40rem]`), which is the right fallback for ten letters on a phone.
- Print CSS (`src/app/globals.css`) hides site header, footer, and the on-screen action bar, and sets the Medigap sheet to landscape. Worksheet print hides the same chrome.
- Period finder shows today’s date in the page, so “open now” is explainable.
- Path quiz and Medigap quiz use radio `name`s and require answers before a result.
- Empty worksheet print state tells the person to go back and fill the form.

Gaps:

- “Why these tools” (`/research`) is `hidden` below the `sm` breakpoint in `SiteHeader`. A phone user has no nav path to that page.
- No skip link.
- Worksheet Yes/No groups are a `<fieldset>` and `<legend>` without a shared radio `name` (`client-worksheet-tool.tsx`). They are React-controlled, so the screen looks right. Assistive tech gets a weaker group than the Medigap and path-quiz radios.
- Validation text is not `role="alert"`.
- AEP checklist progress resets on refresh.
- “Email to agent” can silently truncate (see PHI).
- Named `@page medigap-landscape` is not honored by every browser; the on-screen “Print / Save as PDF” button is still the right path.
- Header is crowded on a narrow phone: wordmark, two links, and the consult button.

---

## 8. Prioritized changes

### Must — before relying on the site for AEP clients

1. **IEP dates.** Include the whole last day. If the birthday is on the 1st, shift the entitlement month back one month and center the 7-month window there. Files: `src/lib/medicare/iep.ts`.
2. **IEP coverage tip.** Replace “delayed by 1–3 months” with the current rule: birthday month or the last three months of the IEP → Part B starts the first of the next month. Keep a one-line birthday-on-the-1st note that matches the dates.
3. **AEP checklist.** Point at the ANOC for the **upcoming** plan year (the notice for 2027 changes, during fall 2026). File: `src/components/tools/aep-checklist-tool.tsx`.
4. **Working-past-65 defaults.** Start every box unchecked so “Check delay risk” cannot return a green light by accident. File: `src/components/tools/working-past-65-tool.tsx`.
5. **Worksheet data path.** Remove the full worksheet from the mailto body. Keep print-and-bring, and a local PDF the person attaches themselves. Add an on-form line: no MBI, no SSN, data stays in this browser tab, email is the person’s own mail app. Do not add new fields.
6. **Public copy pass.** Remove `$0` from the path quiz, the mixed-path summary, and the glossary premium line. Change “helps you enroll with confidence” to consult language. Retire “lead magnet,” “hire you,” and “enrollment representation” from `/` and `/research`, or move that page off the public nav.
7. **Trust minimum Leo must supply (do not invent).** Licensed identity (agency and/or agent), states, and the real consult destination (calendar or Kizen) to replace a bare mailto. A one-page privacy notice that matches the sessionStorage behavior.

### Should — next, still this season if time allows

8. IRMAA: exact $500,000 / $750,000 belongs in the top tier. Say that married-filing-separately compression applies when the person lived with their spouse at any time that tax year. Mention head of household uses the individual column. Files: `constants.ts`, `decisions.ts`, `irmaa-checker-tool.tsx`.
9. Penalty page: one sentence that Part A premium penalties are not estimated. Public blurbs now match the 1-year result.
10. Medigap: caveat for MA / MN / WI; note high-deductible F and G exist and are omitted; Plan N ER copay waived if admitted.
11. Working-past-65 caveats: disability uses 100 employees; whose employer the “20+” box refers to; Part A retroactivity and HSA.
12. SEO: 301 `www` → apex (or the reverse, then match `BRAND.url`), canonical link, `robots.txt`, sitemap of the public tools, `noindex` on both print routes, unique meta descriptions for `/tools` and `/research`.
13. Keep a single Next config file (`next.config.ts` or `next.config.mjs`, not both). Add a yearly reminder to swap 2026 figures when CMS publishes 2027 (usually November).
14. After a deploy, purge the Hostinger HTML cache. `s-maxage=31536000` will keep old copy in front of the fix.
15. Tests for IEP (including the 1st and the last day), IRMAA boundaries (including $500,000 and married filing separately), and penalty rounding.

### Nice

16. Show Plan K/L out-of-pocket caps only with the year printed next to them.
17. Skip link; show “Why these tools” on small screens or drop it from the public nav once the Hormozi copy is gone.
18. Persist the AEP checklist in `sessionStorage` (no health narrative in that list).
19. Favicon / share image.
20. Security headers (HSTS, a real CSP) and turn off `x-powered-by` at the host.
21. Use or remove unused `PART_B_DEDUCTIBLE`.

---

## What Leo can ignore

- Rebuilding the visual design. The tool kit is readable and the print styles are intentional.
- Adding MBI, SSN, or a server-side “save my worksheet” feature.
- Rewriting glossary definitions that use “enroll” to describe Medicare’s own windows.
- Treating the 2026 Part B premium, deductible, IRMAA table, or Part D base premium as stale. They match CMS as of the 14 November 2025 fact sheet. They go stale on the 2027 announcement, not today.
- The Medigap letters that **are** on the chart. The benefit yes/no/50%/75%/copay pattern matches the standard federal chart. The gap is what is missing (high-deductible plans, three states, K/L dollar caps), not a scrambled G vs N row.

---

## CURSOR SYNC

```
CURSOR SYNC — FreeMedicareTools audit (23 Sep 2026)
Owner: Leo (approve). Implementation later = Cloud Agent, not a Bot deep-dive.
Outcome: Leo approves or edits the Must list before any product change. AEP is 15 Oct 2026.
Sources: repo src/ at main 303efc3; CMS fact sheet 14 Nov 2025 (Part B $202.90, deductible $283, IRMAA table); Medicare.gov 2026 costs booklet (Part D base premium $38.99); Medicare.gov / SSA on IEP effective dates after 1 Jan 2023; live fetch 23 Sep 2026 (Hostinger, apex and www both 200, robots/sitemap/privacy/terms 404).
Constraints: Audit only this round. No MBI/SSN on public forms. PHI stays in Kizen, not in a mailto body. CTA stays “Book a free consult.” No $0, no “we enroll you,” no carrier endorsement. Do not invent NPN, phone, states, or calendar URL — Leo supplies those.
Deliverable: AUDIT.md on branch cursor/freemedicaretools-audit-0876 and the PR that carries this report.
Stop: Do not implement the Must list until Leo replies with approval (and the license/consult facts for item 7).
Failure: If Leo’s license states, NPN, phone, or calendar/Kizen URL are not in this repo, they are blank on purpose. Live TLS failures on other networks were not reproduced here; Hostinger edge is the place to check if ERR_CONNECTION_CLOSED continues.
Must (short): (1) IEP last day + birthday on the 1st, (2) drop the 1–3 month delay tip, (3) ANOC year = upcoming plan year, (4) working-past-65 boxes start unchecked, (5) worksheet PHI out of mailto + on-form notice, (6) strip $0 / enroll-you / Hormozi lead-magnet copy from public pages, (7) Leo adds who is licensed and where the consult actually goes.
```
