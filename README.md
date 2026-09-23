# LabelAudit — Frontend (label-audit-app)

> Live: https://label-audit.vercel.app/

AI-assisted compliance checking for packaged commodities under the Legal Metrology (Packaged Commodities) Rules, 2011. This is the inspector and supervisor web application, built for Smart India Hackathon problem statement SIH26034.

An inspector photographs a product label; the system extracts the mandatory declarations and checks them against the rules in seconds. Supervisors get a region-scoped view of compliance activity across their inspectors.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion
- jsPDF + jspdf-autotable (client-side compliance report export)

## Getting Started

```bash
npm install
npm run dev
```

Requires the [backend API](https://github.com/anasalam-xyz/label-audit-api) running and reachable at the URL below.

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Point this at your deployed backend URL in production.

## Structure

```
app/
├── login/                → role-toggle login
├── inspector/
│   ├── page.tsx            → home: compliance ring, quick actions, recent scans
│   ├── scan/page.tsx        → capture → review → compliance check → save flow
│   │                           (single-scan and batch mode share this state machine)
│   └── history/page.tsx     → date-filterable scan log
└── supervisor/
    ├── page.tsx              → console: regional stats, calendar, case feed
    └── inspectors/page.tsx    → inspector roster and performance

components/
├── ui/                    → shared components (status chips, progress rings)
├── inspector/scan/         → the scan flow's step components
├── inspector/history/       → date strip, scan detail
└── supervisor/               → console-specific components

lib/
├── api/                   → typed API client functions, one file per resource
├── scan-types.ts           → shared types for extraction/compliance data
├── pdf-report.ts            → client-side PDF generation
└── rule-aspects.ts           → frontend's copy of the five Legal Metrology
                                 checks, mirrored from the backend's rule
                                 engine — keep the two in sync by hand
```

## Core Flow

1. **Capture** — camera or gallery upload of a product label
2. **Extract** — the backend runs the photo through a vision model and returns structured field data
3. **Review** — inspector can correct any low-confidence field before proceeding
4. **Check** — the backend runs a deterministic rule check against the extracted fields
5. **Result** — pass/violation/review verdict, per-rule breakdown
6. **Save** — photo and results persist to the backend; a PDF report can be generated at this point

Batch mode runs the same flow per photo across a captured set, auto-advancing between items and summarizing the whole run at the end.

## Notable Design Decisions

- The inspector-facing app and the supervisor console intentionally use different visual languages — a mobile field tool and a desktop analytics console are different contexts, not an inconsistency to resolve.
- Field identity between extraction and compliance checking is matched on a stable key, not on display label text, since label wording isn't guaranteed to be consistent across extraction calls.
- Extraction and compliance-checking are separate backend calls; the app doesn't assume either always succeeds and handles both failure paths independently.
