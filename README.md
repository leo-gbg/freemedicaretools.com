# FreeMedicareTools.com

Free Medicare navigation tools designed as **Hormozi-style lead magnets** for a licensed insurance agent: diagnose urgent enrollment problems for free, then invite prospects to **book a free consult** for representation during IEP, AEP, and OEP.

**Site:** [FreeMedicareTools.com](https://freemedicaretools.com)  
**Powered by:** [Guardian Benefits Group](https://guardianbg.com)

## Acronyms & glossary

Plain-language definitions for enrollment windows, plan types, cost terms, and coverage words live at [`/glossary`](http://127.0.0.1:43127/glossary).

## Who it’s for

- People **turning 65** who need IEP timing, working-past-65 guidance, and path clarity
- People **already on Medicare** who need AEP/OEP navigation, IRMAA awareness, and yearly review habits

## Tools included

| Tool | Job |
| --- | --- |
| IEP Timeline Calculator | Pin the 7-month Initial Enrollment Period to a birthday |
| Late Enrollment Penalty Estimator | Show Part B / Part D late penalty dollars as a 1-year add-up (2026 figures) |
| Enrollment Window Today | Untangle IEP / AEP / OEP / GEP / SEP for today’s situation |
| Coverage Path Quiz | Directional lean: Advantage vs Original + Medigap |
| Medigap (Med-Supp) Plan Letter Guide | Preference quiz + letter comparison; printable PDF of all plans (A–N) |
| Medicare Client Consult Worksheet | Doctors, drugs, contact + plan-shaping details → printable PDF / email to agent |
| IRMAA Bracket Checker | Estimate 2026 Part B + Part D income-related surcharges |
| Still Working Past 65? | Pressure-test delaying Part B with employer coverage |
| AEP Annual Review Checklist | Oct 15–Dec 7 review so enrollees don’t sleepwalk |

## Research framing

Common pain points (MedPAC / KFF / CMS enrollment rules): confusing parts and plan types, missed IEP deadlines, lifelong late penalties, mixing up AEP vs OEP vs GEP, IRMAA surprises, and false confidence when delaying Part B while working.

## Run locally

```bash
npm install
npm run dev
```

App runs at [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
npm run build
npm start
```

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.

## Compliance notes

- Educational estimates only—not official Medicare/CMS advice
- CTA copy uses **Book a free consult** (no exaggerated guarantees)
- Tools do not store PHI; results stay in the browser
- Consult mailto defaults to `hello@freemedicaretools.com` (see `src/lib/brand.ts`)

## Customize for your agency

1. Brand constants live in `src/lib/brand.ts`; colors in `src/app/globals.css`
2. Point consult CTAs at your calendar / Kizen form
3. Add state licensing disclosures where required
