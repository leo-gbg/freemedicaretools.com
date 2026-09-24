# Hormozi + design brief — FreeMedicareTools.com

**Date:** 24 September 2026
**Repo:** https://github.com/leo-gbg/freemedicaretools.com (`main` at `10b972f`)
**Live checked this run:** https://freemedicaretools.com/ and the routes below (HTTP 200 unless noted)
**Scope:** Research and recommendations only. No product code was changed.
**Decision this brief asks for:** Which Must items Leo wants turned into a later implementation brief. AEP opens **15 October 2026** (21 days from this check).

This uses an Alex Hormozi *approach* (value equation, a clear offer, a short path from free tool to consult). It does not put that vocabulary on the public site. The September 23 compliance pass already removed bare `$0` premium claims, “helps you enroll,” and public “lead magnet / hire you” language. Those stay off.

---

## 1. Diagnosis

The site is trying to be a plain-English Medicare classroom: two audiences (turning 65, already enrolled), nine single-question tools, and an optional email consult with a named agent at Guardian Benefits Group. A Hormozi-style funnel expects one dream outcome, a stacked offer that makes that outcome feel likely, a result the visitor can see in one sitting, and a single next step that feels smaller than the problem. FreeMedicareTools already has the raw materials — a strong headline, “You get” lines, real calculators, a factual AEP window, and a repeated amber consult button — and then flattens them into a catalog. The visitor is offered nine equal tools and a generic mailto, so the dream stays “learn Medicare” instead of “leave with my dates and my dollar risk, then email one question if I want a person.” Likelihood, speed after the aha, and effort are the leaks. The compliance constraints (educational only, mailto consult, no phone, no NPN, no plan sign-up on this domain) fit this funnel. They rule out fake proof and enrollment promises. They do not rule out a clearer path.

---

## 2. Value equation scorecard

Value goes up when the dream outcome and the chance of reaching it go up, and when delay and effort go down. Scores are qualitative. The dream scored here is the one the site can honestly sell: *know your window and your dollar risk before you choose*, with a free email consult if you want a person. It is not “we enroll you.”

| Lever | Current state | Gap |
| --- | --- | --- |
| **Dream outcome** | Medium, and well started. Live home H1: “Know your Medicare deadlines before they cost you.” (`src/app/page.tsx`). Two doors (“I’m turning 65” / “I’m already on Medicare”) match the two real jobs. “You get” lines name a concrete output per tool. | The dream is split across nine peers. Nothing says which single result this visit should end with, or what “done” looks like before the consult. The consult line (“The tools explain the rules. A free consult applies them to you.” in `src/components/consult-cta.tsx`) is clear and compliant, and it arrives after the catalog, so it reads as a second product. |
| **Perceived likelihood** | Medium-low. The tools do real 2026 math (penalty, IRMAA, IEP dates) and label leans as directional (`src/components/tools/path-quiz-tool.tsx`, disclaimer in `src/lib/medicare/constants.ts`). A named person and agency sit on the home quote (`/#who`). `/research` cites MedPAC, KFF, and CMS in one sentence. | Proof the visitor can check is thin. `/research` is a live page with **no in-site link** (no `href="/research"` anywhere under `src/`). Sources are not linked. The only testimonial is the operator’s own quote. The penalty story disagrees with itself: home says “the penalty in dollars for **one year**” (`YOU_GET` in `src/app/page.tsx`); the tool’s meta description, live at `/tools/penalty-estimator`, says it could cost **for life** (`blurb` in `src/lib/medicare/tools.ts`). The page itself is a 1-year extra. A default dollar figure renders before the visitor has described their months (`src/components/tools/penalty-estimator-tool.tsx`, defaults of 12 and 12). |
| **Time delay** | Tools themselves are immediate, which is the right direction. IEP can download a calendar file (`downloadIcs` in `src/lib/visual.ts`). The home card states AEP as October 15–December 7 even before JavaScript (`src/components/deadline-card.tsx`). | The consult is an empty mailto (`consultMailto` in `src/lib/visual.ts`: subject only, no body, no “what happens after you send”). The AEP countdown headline first paints “Checking today’s date…” and only then becomes “N days until AEP opens,” so the urgency number waits on hydration. Path-quiz next steps mention a consult on the mixed lean only (`src/lib/medicare/decisions.ts`); Advantage and Original leans stop at homework. |
| **Effort and sacrifice** | Low in the right places: no account, no email wall, large type, one question per tool, glossary for jargon (`/glossary`). Header consult is one tap (`src/components/site-chrome.tsx`). | The menu asks the visitor to pick among nine tools with equal visual weight (`/` and `/tools`). The client worksheet (`/tools/client-worksheet`) is framed “Before a consult” and collects a long personal and health list (name and phone required to print). That raises sacrifice *before* an optional email. Uncovered-month and employer-size questions assume knowledge the tool was supposed to supply. |

Internal field `hormoziHook` in `src/lib/medicare/tools.ts` is never rendered. It still ships in the page payload. Live view-source of https://freemedicaretools.com/tools/penalty-estimator contains `hormoziHook`. That is not a public claim. It is leftover sales language in the HTML.

---

## 3. Funnel map

Target path for this domain: **awareness → use one tool → see a personal result → optional mailto consult.** Phone, NPN, and on-site enrollment stay out.

| Stage | What exists today | What is missing |
| --- | --- | --- |
| **Awareness** | Home headline and situation doors. Header: Tools, Glossary, Who we are, “Request a free consult.” Factual AEP card. | No single promise per door (“leave with your 7-month dates” / “leave with this year’s re-shop list”). `/research` cannot be reached from the nav, home, tools, glossary, or footer. `robots.txt` and `sitemap.xml` are still **404** (confirmed 24 Sep 2026). `www` returns **200** with no redirect to the apex. |
| **Tool use** | `/tools` groups Turning 65, Already on Medicare, and Before a consult. Each tool page has a title, a blurb, and a “← All tools” link (`src/components/tool-shell.tsx`). | No recommended first tool. Both audiences see a grid. Glossary (`/glossary`) explains terms and links back to the kit, then ends. It has no consult block. |
| **Aha** | IEP shows a window after a valid birthday. Path quiz holds the result until every question is answered and explains the empty state. Medigap labels the lean “not a carrier recommendation.” Penalty shows a large 1-year dollar figure. AEP checklist persists checks in `localStorage` (`fmt-aep-checklist-v1`). | The aha is not captured. Nothing offers a one-line “here is your result” the visitor can act on. Penalty shows a number that is the default example. Results do not consistently point at the next *small* action. The shell’s consult card is the same paragraph on every tool. |
| **Consult** | Amber “Request a free consult” in the header, on the home, on `/tools`, on `/research`, and in each tool shell. Mailto is `hello@freemedicaretools.com` (`src/lib/brand.ts`). Tool subjects include the tool name. Copy correctly says the site does not sign you up. | The mail opens blank aside from the subject. The card says “Bring your tool results” and gives no way to attach them without the visitor inventing the email. There is no sentence for what happens next (your mail app opens, you send a question, a reply comes to that address). The worksheet can feel like a required application. There is no privacy page for the data that worksheet holds in the browser. |

`/privacy`, `/terms`, `/about`, and `/contact` all returned **404** on 24 Sep 2026. Contact exists only as the mailto button.

---

## 4. Design gaps (top 10)

What already matches current practice, so a later build should keep it: one H1, a display face (Newsreader) plus a body face (Figtree) loaded with `next/font`, an amber primary button with `min-h-12` targets, a two-audience split, “You get” scan lines, a non-affiliation footer, an educational disclaimer on tools, a named person on `/#who`, and a mobile menu. Wordmarks ship with width and height (`src/components/wordmark.tsx`). This is a hierarchy and path problem more than a visual-system problem.

1. **The hero offers a catalog, not a first step.** https://freemedicaretools.com/ — H1 and subcopy are strong (`src/app/page.tsx`). The two buttons only scroll to tool lists. Nine cards then compete with the consult. A modern hero has one primary action per audience and repeats it after the proof.
2. **The consult button is visible and generic.** Header on every page, plus `ConsultCta` on `/`, `/tools`, and `/research`, plus the tool-shell card. Color and repetition are fine. The label never changes with the result (“Email my IEP question” vs “Request a free consult”), and the link body is empty (`src/lib/visual.ts`).
3. **`/research` is an orphan proof page.** https://freemedicaretools.com/research returns 200, H1 “Why these tools,” and reuses the **homepage** meta description (the page sets `title` only in `src/app/research/page.tsx`). Nothing in `src/` links to it. Six problems are listed; IRMAA, Medigap, and the worksheet are absent, and MedPAC/KFF/CMS are named without URLs.
4. **Trust routes 404, and the footer cannot navigate.** https://freemedicaretools.com/privacy, `/terms`, `/about`, `/contact` → 404. Footer (`src/components/site-chrome.tsx`) is the wordmark, a copyright line, “Powered by Guardian Benefits Group,” the educational sentence, and the non-affiliation line. No links to tools, glossary, the who-block, or a privacy notice. The worksheet still holds contact and health details in `sessionStorage` (`AUDIT.md` and `src/components/tools/client-worksheet-tool.tsx`).
5. **The penalty offer says two different things.** Home card: one year (`src/app/page.tsx`). Live title/description on https://freemedicaretools.com/tools/penalty-estimator: “could cost for life.” On-page heading: “1-year estimated extra.” Likelihood drops the moment those three are read together.
6. **Urgency is factual, then hidden on first paint.** https://freemedicaretools.com/ — `DeadlineCard` renders “Checking today’s date…” until `useEffect` (`src/components/deadline-card.tsx`). The static sentence “Annual Enrollment Period is October 15 through December 7” is the accessible fallback and is the right fact. The countdown that replaces it shifts the headline (CLS clue). The month chart’s “today” marker is `aria-hidden`.
7. **Search and sharing basics are still missing.** Live 24 Sep 2026: `/robots.txt` 404, `/sitemap.xml` 404, no `rel=canonical` on home, tools, research, glossary, or tool pages, no Open Graph tags except the print routes. https://www.freemedicaretools.com/ returns **200** with an empty redirect. `/tools` reuses the homepage description. HTML cache header on `/` is still `cache-control: s-maxage=31536000` (Hostinger, `x-powered-by: Next.js`). A copy fix can sit at the edge for a long time.
8. **Social proof is one founder quote.** https://freemedicaretools.com/#who. The quote is honest and on-brand. It does not show a worked example, a cited statistic, or a “here is what the tool prints.” Inventing reviews would fail compliance. The gap is the absence of *checkable* proof.
9. **Glossary and several results are dead ends.** https://freemedicaretools.com/glossary has a strong unique description and related-tool links inside terms, then stops (`src/app/glossary/page.tsx` has no `ConsultCta`). Path-quiz Advantage and Original results list homework and leave the consult to the generic card below the fold. Penalty has no in-result next step.
10. **A few accessibility and empty-state holes sit on high-traffic UI.** No skip link in `src/app/layout.tsx`. Header text links have no `focus-visible` ring (buttons in `src/lib/visual.ts` do). Path quiz and IEP explain the empty state; the penalty tool does not — it shows money immediately. On small screens the home month labels collapse to a single letter (`src/components/deadline-card.tsx`), which is hard to scan. Contrast of the main ink (`#0c2430`) and soft ink (`#34505c`) on the paper background is in a safe range by eye; this run did not run an automated WCAG audit.

Live tool pages checked 200 on 24 Sep 2026: `/tools/iep-timeline`, `/tools/working-past-65`, `/tools/path-quiz`, `/tools/penalty-estimator`, `/tools/period-finder`, `/tools/aep-checklist`, `/tools/irmaa-checker`, `/tools/med-supp-compare`, `/tools/client-worksheet`.

---

## 5. Prioritized recommendations

Each item is copy, UX, or infra. Compliance notes say what must stay true while the change is made.

### Must

1. **Name one finish line per door, and put the other tools behind it.** Copy + UX. On `/`, “I’m turning 65” should end in the IEP timeline (then working-past-65 only if they are still employed). “I’m already on Medicare” should end in the period finder or the AEP checklist while AEP is the live season. The other seven tools stay available as “also answers.” Why: the value equation’s dream and effort levers. A Grand Slam shape here is a stacked *educational* offer (“you leave with dates, a dollar figure, and a one-page question”), not nine competing products. **Compliance:** keep “educational, does not sign you up.” Do not say the path enrolls anyone or picks a carrier.
2. **Bridge the result to the mailto without putting personal data in the link.** Copy + UX. After a result, one sentence and one button whose subject already names the tool (that part exists) and whose body is a blank prompt the visitor fills, such as “I used the IEP timeline and my question is:”. Do not pre-fill birthday, income, drugs, or the worksheet. Why: this is the missing aha → consult step, and it cuts delay without a new backend. **Compliance:** PHI stays out of the mailto query string. MBI and SSN stay off every form. The worksheet remains optional prep, not the gate. Say that on `/tools/client-worksheet`.
3. **Say what the email does.** Copy. Next to every consult button, one calm line: the button opens the visitor’s own mail app, the message goes to `hello@freemedicaretools.com`, and a reply comes back to the address they send from. Why: mailto feels like a dead click until the next step is visible. That is time delay. **Compliance:** do not invent a response-time promise, a calendar, a phone number, or “we will enroll you.” Leo can add a real reply-time later if he wants one published.
4. **Make the penalty sentence the same everywhere.** Copy. Public lines should match the screen: the big number is **one year** of extra premium, and the notes already say the penalty is typically lifelong and changes when national amounts change. Fix the home “You get” line and the tool blurb so they do not contradict (`src/app/page.tsx`, `src/lib/medicare/tools.ts`). Why: likelihood. A visitor who catches the contradiction trusts the next number less. **Compliance:** this is a clarification, not a scare line and not a `$0` premium claim. Keep calculated `$0.00` when the math is actually zero.
5. **Add a privacy notice and put real links in the footer.** Copy + UX. One page that states: tools run in the browser, the worksheet sits in this tab’s `sessionStorage` until the tab closes, email is the visitor’s own mail app, this site is not the system of record, and MBI/SSN are not requested. Footer links: Tools, Glossary, Who we are (`/#who` or a short `/about` that repeats the existing quote and non-affiliation line), Privacy, and the mailto. Why: trust is part of likelihood, and the worksheet already collects health-adjacent detail. **Compliance:** do not add NPN, license states, or a phone number. Do not describe the agency as enrolling people on this domain.

### Should

6. **Turn `/research` into the proof page and link it once.** Copy + UX. Keep the six problems. Add the missing tools only where a real problem statement exists. Link each claim to a public source (CMS enrollment-period pages, the CMS 2026 premium fact sheet, a specific KFF or MedPAC page). Link the page from the footer as “Why these tools.” Give it its own meta description. Why: likelihood without testimonials. **Compliance:** do not name the sales framework on the public page. Do not imply the research guarantees a plan outcome.
7. **Label the penalty’s first number as an example.** UX + copy. Until the visitor changes the month counts, the figure is the 12-month illustration, marked as such. Why: a default dollar amount reads as *their* penalty. **Compliance:** keep the 2026 rate citation next to the example.
8. **Close every result with the same small next step.** UX. Path-quiz Advantage and Original leans, the penalty total, IRMAA, and working-past-65 should each end with one tool to open next and the consult prompt from item 2. The shell card can stay as the repeat. Why: repetition of a *specific* action, which is the design rule the generic card misses. **Compliance:** “directional, not a plan recommendation” stays on the quiz.
9. **Ship `robots.txt`, a sitemap of public URLs, a canonical on the apex, and a single host.** Infra. Include `/`, `/tools`, `/glossary`, `/research`, and the nine tool pages. `noindex` the print routes (`/tools/med-supp-compare/print`, `/tools/client-worksheet/print`). Redirect `www` to `https://freemedicaretools.com` (or the reverse, then match `BRAND.url`). Unique descriptions for `/tools` and `/research`. Why: the site cannot be found or deduped reliably while those 404s and the duplicate host remain. **Compliance:** none beyond keeping educational titles accurate.
10. **Render the AEP countdown on the server.** UX. The first HTML should already say the day count (or keep the static date sentence and not swap the headline). Expose the month chart to assistive tech with a text list that is already partly there (OEP, AEP, today). Why: factual urgency and a smaller layout shift. **Compliance:** only published CMS window dates. No “spots left,” no countdown that continues after December 7 as if the window were still open.
11. **Remove `hormoziHook` from what the browser receives.** Infra. The strings are internal. They are in the live HTML payload for tool pages. Why: the public site should not carry retired sales labels even in hidden data. **Compliance:** do not replace them with public “lead magnet” copy.
12. **Skip link, focus rings on header links, glossary closing card.** UX. A “Skip to content” link in `src/app/layout.tsx`, the same focus ring the buttons already use on the header links, and a `ConsultCta` at the bottom of `/glossary`. Why: keyboard users and glossary readers currently dead-end. **Compliance:** same consult label already in use (“Request a free consult”).
13. **Rewrite `README.md` so the next edit cannot restore retired public lines.** Copy, repo only. The README still says “Hormozi-style lead magnets,” “book a free consult,” and “Tools do not store PHI; results stay in the browser.” The live site and the worksheet’s `sessionStorage` have moved on. Why: internal docs get copied onto the site. **Compliance:** README may describe the funnel to collaborators; it must not be treated as approved public copy.

### Later

14. **A labeled worked example on the home page.** UX + copy. A static sample (a clearly fake birthday and the window it produces, or a clearly fake 12-month penalty) so the dream is visible before any typing. Why: likelihood and effort. **Compliance:** mark it “Example.” Do not use a real client.
15. **Share image and consistent social title.** Infra. One image, Open Graph on the public pages, favicon already present live (`/icon.png` on the home HTML). Why: sharing today falls back to a bare link. **Compliance:** image text stays educational.
16. **Security headers and a cache-purge note.** Infra. CSP beyond `upgrade-insecure-requests`, HSTS, drop `x-powered-by`, and a reminder that `s-maxage=31536000` must be purged after copy deploys. Why: the worksheet lives in the browser on this origin. **Compliance:** none.
17. **Real user proof, only if a real person and Compliance both sign off.** Copy. Why: founder quotes have a ceiling. **Compliance:** no invented stars, no “clients saved $X,” no unnamed “thousands of seniors.”
18. **A visual redesign.** The type, color, cards, and spacing already form a system (`src/app/globals.css`). Change them when the path in the Must list is live and still feels hard to scan. Why: polish will not fix a catalog with no finish line.
19. **Any consult channel beyond mailto.** Infra, blocked on Leo. A calendar or Kizen form is a later decision. This brief does not ask for it. **Compliance:** phone stays hidden; NPN and states stay off this domain until Leo unlocks that on purpose.

---

## 6. Do not do

- Do not put back bare `$0` premium marketing, “helps you enroll,” “lead magnet,” “hire you,” or “enrollment representation” on any public page. Calculated `$0.00` in the penalty math can stay.
- Do not name the sales framework, “Grand Slam,” or internal hook fields on the public site. Removing `hormoziHook` from the payload is the cleanup; publishing it is not.
- Do not invent urgency: no fake deadlines, no “only N spots,” no countdown past the real AEP/OEP/GEP dates, no “prices go up tonight.”
- Do not invent proof: no fake reviews, no stock “client” photos with testimonials, no savings guarantees, no “most people choose Plan X.”
- Do not collect Medicare Beneficiary Identifier (MBI), Social Security number, or a full worksheet inside the mailto link. Do not POST the worksheet to this marketing site.
- Do not add a phone number, NPN, or license-state list on this domain in this round. Leo locked those off. The consult stays mailto.
- Do not gate the tools behind an email capture, an account, or a finished worksheet. The low-effort tools are the offer. The worksheet is optional prep.
- Do not endorse a carrier or describe a quiz lean as a plan recommendation.
- Do not copy `README.md`’s current funnel paragraph onto the website.
- Do not treat a year-long CDN cache as a reason to skip a copy fix. Purge after deploy.

---

## 7. CURSOR SYNC

```
CURSOR SYNC — FreeMedicareTools Hormozi + design brief (24 Sep 2026)
Owner: Leo (approve which Must items become an implementation brief). CoS routes. Next code pass = Cloud Agent, not a Bot deep-dive.
Outcome: Leo has a ranked list of what an educational consult funnel is missing on freemedicaretools.com, plus design gaps, with banned claims left banned. AEP opens 15 Oct 2026.
Sources: repo main 10b972f (src/app/page.tsx, src/app/tools/page.tsx, src/app/research/page.tsx, src/app/glossary/page.tsx, src/app/layout.tsx, src/components/site-chrome.tsx, src/components/consult-cta.tsx, src/components/tool-shell.tsx, src/components/deadline-card.tsx, src/lib/visual.ts, src/lib/medicare/tools.ts, src/lib/brand.ts, src/lib/medicare/decisions.ts, README.md, AUDIT.md). Live fetch 24 Sep 2026: /, /tools, /research, /glossary, and all nine tool routes 200; /privacy /terms /about /contact /robots.txt /sitemap.xml 404; www 200 with no redirect; home cache-control s-maxage=31536000; no canonical; hormoziHook present in tool-page HTML payload; penalty meta says “for life” while the home card says “one year.”
Constraints: Brief only. No product code in this run. Educational site for everyone. Consult = mailto hello@freemedicaretools.com. No NPN, no states, no phone. Do not restore $0 premium claims, “helps you enroll,” or public lead-magnet / hire-you language. No MBI/SSN. No PHI in the mailto body. No fake urgency or fake proof.
Deliverable: HORMOZI-DESIGN-BRIEF.md on branch cursor/hormozi-design-brief-cd8c and the draft PR that carries it.
Stop: Do not implement the Must list until Leo picks the items. Do not add a calendar, phone, or license block unless he unlocks that in a later brief.
Failure: Live fetch succeeded this run. If a later run cannot reach the host, use src/ only and say the live check failed. License states, NPN, and phone are blank on purpose.
Must (short): (1) one finish line per audience, other tools secondary, (2) result-specific mailto prompt with no PHI in the link, (3) one line explaining what the email does, (4) penalty copy aligned to the 1-year figure plus the lifelong note, (5) privacy page + footer links, still no phone/NPN.
```
