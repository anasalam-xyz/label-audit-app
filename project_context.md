# LabelAudit — Project Context

**SIH26034** — Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011, by scanning products, images, and labels.

This document exists so anyone (or any AI tool) picking up this repo mid-build has full context without re-deriving decisions from scratch.

---

## 1. What this is

A B2G tool for Legal Metrology enforcement officials. An inspector photographs a product label; AI extracts the mandatory declarations (manufacturer info, net quantity, MRP, mfg date, consumer care) and checks them against the Legal Metrology (Packaged Commodities) Rules, 2011 — replacing manual, one-at-a-time label reading with fast, consistent, documented checks.

Two roles:
- **Inspector** — scans labels in the field, reviews results, builds a personal history
- **Supervisor** — oversees inspectors within their assigned region, views regional dashboard, manages inspector accounts (region-scoped — each supervisor only sees their own region's data)

## 2. Current build scope (hackathon MVP)

This is a **prototype for a 15-minute internal presentation**, not the full production system. Scope was deliberately cut to what's demoable and real where it matters:

| Feature | Status |
|---|---|
| Auth | Real JWT, but **hardcoded user list** (no real DB, no signup) |
| Label extraction | **Real** — live Gemini call |
| Rule compliance check | **Real** — live Gemini call, rules hardcoded in the prompt |
| History (inspector) | **Fake** — static list from backend |
| Dashboard (supervisor) | **Fake** — static stats from backend |
| Manage Inspectors | **Fake** — static list from backend |
| Barcode lookup, save/sync to DB, voice notes, chatbot, PDF export | **Not built** — deliberately out of scope for this round |

The two Gemini calls are the actual differentiator being demoed — everything else is UI-complete but backed by static data, by design, not as an oversight.

## 3. Tech stack

**Frontend**: Next.js (App Router) + TypeScript, Tailwind CSS v4, PWA-oriented but no offline/service-worker work done yet.

**Backend**: FastAPI (Python), `uv` for package management, SQLAlchemy + Alembic scaffolded (models/session wired, but nothing queries a real DB yet — see §6), JWT auth via `pyjwt` + `passlib[bcrypt]`.

**AI**: `google-genai` SDK, model `gemini-3.6-flash` (Google's Flash line was refreshed July 2026 — `gemini-2.0-flash` is deprecated/404s now, this was discovered and fixed mid-build). Structured JSON output via `response_mime_type="application/json"`, not free-text parsing.

**Fonts**: Playfair Display (`font-display`, headings) + DM Sans (`font-body`, everything else) — swapped in after initial build, so older components may still be missing explicit `font-body` classes if not revisited.

## 4. Design tokens (`globals.css`)

Palette has changed twice over the course of this build — **current** version is a warm cream/orange scheme (not the earlier navy/amber or lime-green versions from early iterations):

```
--color-bg:        #F1EBDE   (page background, warm cream)
--color-surface:   #FFFFFF
--color-ink:       #1A1A1A
--color-dark:      #141414   (cards, nav, primary fills)
--color-muted:      #8C8577
--color-border:     #E6DFD0

--color-accent:      #F5A94E   (orange — CTAs, active states, wipe animation)
--color-accent-ink:  #1A1A1A

--color-pass:         #16A34A
--color-violation:    #DC2626
--color-review:       #A16207   (kept distinct from --color-accent on purpose)
```

Type scale is intentionally locked to 5 sizes (`xs`/`sm`/`base`/`lg`/`2xl`) via `--text-*: initial` in the `@theme` block — this was a deliberate constraint to stop scope-creep on font sizes, not an oversight if a size "seems missing."

**Status colors are functional, not decorative** — pass/violation/review map 1:1 to compliance meaning everywhere in the app (chips, ring segments, borders). Don't reuse them for unrelated UI accents.

## 5. Frontend structure

```
app/
├── page.tsx                    → redirects to /login
├── login/page.tsx              → role-toggle login, mobile wipe-animation + desktop side-image layout
├── inspector/
│   ├── layout.tsx              → auth guard (redirects to /login if no token)
│   ├── page.tsx                → home: compliance ring, quick actions, recent scans preview
│   ├── scan/page.tsx           → the multi-step scan workflow (see below)
│   └── history/page.tsx        → full scan log, grouped by hour, date-strip UI
└── supervisor/
    ├── layout.tsx              → auth guard + role guard (bounces inspectors back to /inspector)
    ├── page.tsx                 → regional dashboard (stat cards + weekly bar chart)
    └── inspectors/page.tsx      → manage inspectors list

components/
├── ui/                          → shared, role-agnostic (StatusChip, IconPlaceholder, RingProgress, SegmentedScoreRing)
├── auth/                        → RoleToggle, RoleImage (mobile wipe), DesktopRoleImages
├── inspector/                   → Topbar (shared w/ supervisor too), Navbar, history/DateStrip, scan/*
└── supervisor/                  → Navbar (2-button, no elevated center — different from inspector's 3-button nav)

lib/
├── scan-types.ts                → ExtractedField, Violation, ScanStep types
├── mock-scans.ts                → Scan type + fake seed data (still used by history fallback)
├── mock-extraction.ts           → used ONLY for batch-mode scans (no batch endpoint exists yet — see §7)
├── rule-aspects.ts              → frontend's copy of the 5 rule checks, must be kept in sync with backend's RULES_TEXT by hand
├── auth-storage.ts              → localStorage token/user helpers
└── api/                         → client.ts (generic JSON fetch), auth.ts, scans.ts (multipart!), history.ts, dashboard.ts, inspectors.ts
```

**Note on `Topbar.tsx`**: lives under `components/inspector/` but is imported by both inspector and supervisor layouts. Works fine, but the folder name is now a slight misnomer — a future cleanup would move it to `components/shared/`.

## 6. Backend structure

```
app/
├── main.py                     → FastAPI app, CORS, router registration
├── core/
│   ├── config.py                → pydantic-settings, reads .env
│   ├── security.py              → JWT create/decode, password hashing
│   └── gemini.py                → the two real AI calls (extract_fields_from_image, check_compliance)
├── api/
│   ├── deps.py                   → get_current_user, require_role(*roles)
│   └── routes/                    → auth.py, scans.py, history.py, dashboard.py, inspectors.py
├── crud/                          → one function per fake data source; every fn takes `db` and ignores it
│                                     (deliberate — swapping fake→real later means editing crud/*.py internals only,
│                                      routes/schemas/frontend stay untouched)
├── models/user.py                → SQLAlchemy User model — defined but NOT queried anywhere yet
├── db/                            → session.py (engine, get_db), base.py (declarative Base)
└── schemas/                       → Pydantic request/response shapes, one file per feature area
```

**Important**: `models/user.py` and the SQLAlchemy engine exist but are currently decorative — `crud/user.py` authenticates against a hardcoded Python list, not the `User` table. Alembic is scaffolded but no migrations have been run against a real schema yet.

## 7. Known gaps / deliberate deferrals

These are tracked decisions, not bugs to "discover":

- **Batch mode scan** uses `lib/mock-extraction.ts` (fake), because the backend only has a single-image `/scans/extract` endpoint — batch was never in the locked 6-endpoint scope.
- **History date-strip** — week navigation (prev/next arrows) works; tapping a specific day does **not** filter the list, because the backend's `Scan` type has no `date` field to filter by yet, only a `time` string.
- **Result step rule checklist** (`lib/rule-aspects.ts`) is a frontend-side duplicate of the 5 rules baked into the backend's Gemini prompt (`RULES_TEXT` in `app/core/gemini.py`). These two lists must be updated together by hand if a rule is added/changed — there's no single source of truth yet.
- **PDF / Print Report** — not yet built. Decision pending between client-side (jsPDF, no backend change) vs. backend-generated (reportlab endpoint, more "real" but more work). Was asked, not yet answered as of this doc.
- **Save/sync-to-DB** step in the scan workflow is cosmetic (`setTimeout` delays) — no backend endpoint exists for it in current scope.
- **No error boundary / retry UI** beyond the inline red banner pattern used in `scan/page.tsx`, `history/page.tsx`, etc. — consistent, but minimal.
- **PWA features** (manifest, service worker, offline queue) — mentioned in the original problem statement's "designed for the field" pitch angle, but not implemented. Lower priority than functional flow for a live demo.

## 8. Design decisions worth knowing the "why" on

- **One `users` table, not separate inspector/supervisor tables** — role is just a column; the two roles share nearly every field, and splitting would mean duplicate schema + UNION queries for cross-role listing.
- **`rules` are NOT a database table** in current scope, despite that being flagged as the more future-proof approach (rules get amended over time, versioning matters) — hardcoded prompt text was chosen for hackathon speed. Revisit if this goes past prototype.
- **Photos are never stored as DB blobs** — the intended pattern (not yet wired, since save/sync isn't implemented) is object storage (Supabase Storage) returning a URL, with only the URL string living in the `scans` table.
- **`crud/*.py` functions all accept `db` and ignore it** — this is the specific mechanism that makes "swap fake data for real" a contained change. Don't remove the `db` parameter from a fake crud function even though it's unused now.
- **Status colors vs. brand accent are kept deliberately distinct** — `--color-review` was shifted to gold specifically to not collide with `--color-accent` (orange), so a compliance warning never gets visually confused with a brand highlight.

## 9. Demo-day notes

- Real Gemini calls need `GEMINI_API_KEY` set in `.env` — `/health` will pass without it, `/scans/extract` and `/scans/check` will not.
- Use real, legible product photos when testing/demoing extraction — a 7KB test image previously returned 0 fields correctly (not a bug) because there was nothing legible to read.
- Demo accounts (hardcoded, see `app/crud/user.py`):
  - `rakesh@labelaudit.gov.in` / `inspector123` — Inspector, Ranchi
  - `anjali@labelaudit.gov.in` / `inspector123` — Inspector, Jamshedpur
  - `suresh@labelaudit.gov.in` / `supervisor123` — Supervisor, Ranchi
- Have both a compliant-looking label and a clearly non-compliant one (template placeholder text works well) ready to photograph live, so the demo shows both branches of the result, not just one.

---

*Last updated: reflects state after the ResultStep segmented-ring rebuild. Update this file when scope, stack, or major structural decisions change — don't let it silently go stale.*
