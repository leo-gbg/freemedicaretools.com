# FreeMedicareTools.com

Educational Medicare navigation tools. Each tool answers one question in the browser. Nothing on this site signs a visitor up for a plan.

**Site:** [FreeMedicareTools.com](https://freemedicaretools.com)  
**Powered by:** [Guardian Benefits Group](https://guardianbg.com)

## Tools

| Tool | Route | What it does |
| --- | --- | --- |
| IEP Timeline Calculator | `/tools/iep-timeline` | Pins the 7-month Initial Enrollment Period to a birthday |
| Late Enrollment Penalty Estimator | `/tools/penalty-estimator` | Estimates one year of Part B and Part D late penalties at 2026 rates |
| Enrollment Window Today | `/tools/period-finder` | Names which of IEP, AEP, OEP, GEP, or SEP can apply |
| Coverage Path Quiz | `/tools/path-quiz` | Directional lean: Advantage, or Original Medicare plus Medigap |
| Medigap Plan Letter Guide | `/tools/med-supp-compare` | Compares standardized Medigap letters |
| Consult Worksheet | `/tools/client-worksheet` | Doctors, drugs, and contact details for a consult; print only |
| IRMAA Bracket Checker | `/tools/irmaa-checker` | Estimates 2026 Part B and Part D income-related amounts from 2024 income |
| Still Working Past 65? | `/tools/working-past-65` | Checks whether delaying Part B looks safe with employer coverage |
| AEP Annual Review Checklist | `/tools/aep-checklist` | October 15–December 7 review list |

Also: `/glossary`, `/research`, `/privacy`, `/terms`.

## How data is kept

Tool answers stay in the browser tab (`sessionStorage`). The site has no database and no accounts. The consult action is a `mailto` to `hello@freemedicaretools.com`. Dollar figures are educational estimates, not an official Medicare determination.

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

Brand constants: `src/lib/brand.ts`. Colors: `src/app/globals.css`.
