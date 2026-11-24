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
| Consult Worksheet | `/tools/client-worksheet` | Doctors, drugs, and contact details for a consult; print, or email the worksheet and PDF to the agent |
| IRMAA Bracket Checker | `/tools/irmaa-checker` | Estimates 2026 Part B and Part D income-related amounts from 2024 income |
| Still Working Past 65? | `/tools/working-past-65` | Checks whether delaying Part B may be OK, so confirm with your HR or benefits office |
| AEP Annual Review Checklist | `/tools/aep-checklist` | October 15–December 7 review list |

Also: `/glossary`, `/research`, `/privacy`, `/terms`.

## How data is kept

Tool answers stay in the browser tab (`sessionStorage`) until the tab closes. The site has no database and no accounts. On the consult worksheet, Email to agent sends that worksheet and a PDF by regular email after the visitor checks the consent box. The website does not keep a copy. The message stays in the agent mailbox until it is deleted. Other consult buttons are a `mailto` to `hello@freemedicaretools.com`. Dollar figures are educational estimates, not an official Medicare determination.

`WORKSHEET_EMAIL_TO` must be unset in production. It must never point at a personal inbox, including a personal Gmail address, when the message could contain real worksheet information. The production recipient is the agent mailbox (`WORKSHEET_AGENT_EMAIL`, default `agent@freemedicaretools.com`). The server refuses to send if `WORKSHEET_EMAIL_TO` is set while `NODE_ENV=production`, unless `WORKSHEET_EMAIL_PREVIEW=true` is also set on a preview host. Set `WORKSHEET_TRUST_PROXY=true` only where the host proxy replaces `X-Forwarded-For` (the Hostinger app). Otherwise that header is ignored. Deleting worksheet mail from the agent mailbox, and how long client records are kept, is Leo's procedure. The site does not do it.

## Run locally

Requires Node.js 24 (see `.nvmrc`).

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
