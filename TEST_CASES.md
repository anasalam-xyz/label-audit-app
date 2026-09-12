# LabelAudit – Test Cases

## 1. Test Summary

This is a hackathon-level test report based on execution against
`https://label-audit.vercel.app` and its deployed API
`https://label-audit-api.onrender.com` on 2026-09-12. The checked-out source
and deployed frontend are not identical in every route: the live supervisor
pages include richer static dashboard/roster content than the local source.
Statuses below reflect observed browser/API behavior, not source assumptions.

| Metric | Count |
|---|---:|
| Total Planned Test Cases | 42 |
| Passed | 33 |
| Failed | 1 |
| Blocked | 8 |
| Not Executed | 0 |

### Implementation scope observed

- The frontend is a Next.js application with inspector and supervisor routes.
- The backend is a FastAPI application with JWT login, role dependencies,
  Gemini-backed extraction/compliance routes, and read-only dashboard/history/
  inspector responses.
- Authentication uses a fake in-memory user store containing two inspectors and
  one supervisor. Dashboard, history, and inspector list data are also currently
  fake/static CRUD responses.
- The scan flow calls the extraction and compliance APIs for a normal scan.
  Batch extraction uses the frontend `generateExtraction()` mock instead.
- The save, sync, and “added to history” screens are UI stages only; there is no
  save/sync endpoint in the current backend routes, so a completed scan is not
  persisted by this flow.

## 2. Functional Test Cases

All statuses below are based on live browser or API evidence collected during
this execution session.

| ID | Module | Test Case | Preconditions | Test/Input | Expected Result | Status |
|---|---|---|---|---|---|---|
| TC-001 | Authentication | Open the root route | Application available | Navigate to `/` | The application redirects to `/login`. | PASS |
| TC-002 | Authentication | Log in with a valid inspector account | API and database/configuration available | Demo inspector credentials supplied by the project | Login returned HTTP 200 with user details; browser navigated to `/inspector/dashboard`. | PASS |
| TC-003 | Authentication | Log in with the second valid inspector account | API available | Second demo inspector credentials supplied by the project | API returned HTTP 200 with the second inspector identity and role. | PASS |
| TC-004 | Authentication | Log in with a valid supervisor account | API available | Demo supervisor credentials supplied by the project | Login returned HTTP 200 with supervisor details; browser navigated to `/supervisor`. | PASS |
| TC-005 | Authentication | Show the selected login role copy | Login page open | Toggle Inspector and Supervisor | Live page changed to “Supervisor Login” and the supervisor subtitle/illustration, then back to Inspector during login testing. | PASS |
| TC-006 | Authentication | Display a server login error | Login page open; API reachable | Submit incorrect credentials | Browser remained on login and displayed “Incorrect email or password”; API response was HTTP 401. | PASS |
| TC-007 | Session | Restore a session on a protected inspector route | A valid token exists in local storage | Reload `/inspector/dashboard` | Browser rendered the inspector dashboard and showed the stored name “Rakesh Kumar”. | PASS |
| TC-008 | Session | Restore a session on a protected supervisor route | A valid supervisor token and stored user exist | Load `/supervisor` after supervisor login | Live supervisor dashboard rendered after login. | PASS |
| TC-009 | Session | Log out | Authenticated inspector session | Select the top-bar log-out button | Browser navigated to `/login`; subsequent protected inspector navigation redirected to `/login`. | PASS |
| TC-010 | Authorization | Prevent an unauthenticated inspector page from rendering | No token in local storage | Open `/inspector/dashboard` directly | Browser redirected to `/login`. | PASS |
| TC-011 | Authorization | Prevent an unauthenticated supervisor page from rendering | No token in local storage | Open `/supervisor` directly | Retest: the live supervisor dashboard still rendered directly in a clean unauthenticated browser session instead of redirecting to `/login`. | FAIL |
| TC-012 | Inspector dashboard | Load recent scan history | Authenticated inspector; API available | Open `/inspector/dashboard` | Loading completed and the page displayed 3 scans, 67% compliant, recent cards, and navigation. | PASS |
| TC-013 | Inspector dashboard | Handle history API failure | Authenticated inspector; history API returns an error | Open dashboard with API unavailable or error response | Could not safely force the deployed frontend to use an unavailable history endpoint without changing configuration. | BLOCKED |
| TC-014 | Inspector scan | Start a normal scan | Authenticated inspector | Select Scan Now or Scan | `/inspector/scan` opened at “Scan Label” capture state. | PASS |
| TC-015 | Inspector scan | Capture an image for a normal scan | Scan page open | Select the existing local `testgemini.jpeg` image | Preview/capture occurred; barcode stage and “Reading label… Extracting fields with AI” were observed. | PASS |
| TC-016 | Inspector scan | Extract fields from a captured image | Authenticated inspector; Gemini/API configured | Submit the existing local label image | Final retest after the API-key change: the flow reached “Reading label… Extracting fields with AI”, then displayed `Extraction failed — could not read label`; the deployed request returned HTTP 502 and no fields/review controls appeared. This remains BLOCKED as an external/provider failure, not an application-code failure. | BLOCKED |
| TC-017 | Inspector scan | Edit an extracted field | Extraction succeeded and review is open | Change the mock batch MRP value | The value changed and the low-confidence count decreased, showing the edited field was promoted to high confidence. | PASS |
| TC-018 | Inspector scan | Display low-confidence extraction fields | Gemini returns one or more `confidence: "low"` fields | Process a batch image through the mock path | Review displayed “2 fields need a manual check” and two Low confidence markers. | PASS |
| TC-019 | Inspector scan | Run compliance check with reviewed fields | Review step open; valid extracted fields available | Select Run Compliance Check | Final retest not meaningfully executable: TC-016 still returned HTTP 502 before producing fields, so no compliance request was issued. Remains BLOCKED by the extraction/provider dependency. | BLOCKED |
| TC-020 | Inspector scan | Display a compliant result | Compliance API returns `violations: []` | Complete a scan with no violations | No safe deployed fixture or successful compliance response was available; the tested payload reached HTTP 502 before a result. | BLOCKED |
| TC-021 | Inspector scan | Display a violation result | Compliance API returns one or more violations | Complete a scan with violation data | No safe deployed fixture or successful compliance response was available; the tested payload reached HTTP 502 before a result. | BLOCKED |
| TC-022 | Inspector scan | Complete the save/sync UI sequence | Result step open | Select Save Report | No result step was reached because compliance failed, so the save/sync sequence could not be tested. | BLOCKED |
| TC-023 | Inspector scan | Start another scan after completion | Done screen open | Select Scan Another | No done screen was reached because compliance failed. | BLOCKED |
| TC-024 | Inspector scan | Return home after completion | Done screen open | Select Back to Home | No done screen was reached because compliance failed. | BLOCKED |
| TC-025 | Inspector scan | Use batch capture mode | Authenticated inspector | Open `/inspector/scan?batch=true`; capture one image | Live page showed “Batch Mode — 1 captured” and “Process 1 Photo”. | PASS |
| TC-026 | Inspector scan | Process a batch | Batch mode has at least one captured image | Select Process Photos | Review fields appeared without an extraction request; the result used the frontend mock values and random confidence, confirming prototype/mock behavior. | PASS |
| TC-027 | Inspector history | Load and display history | Authenticated inspector; API available | Open `/inspector/history` | Date strip, 3 scan entries, statuses, and hour grouping rendered; the API response contained the same fixed 3 scans. | PASS |
| TC-028 | Supervisor dashboard | Load regional dashboard | Valid supervisor token; API available | Open `/supervisor` | Live dashboard rendered supervisor metrics and escalated cases; the deployed page content differs from the local API-backed source view. | PASS |
| TC-029 | Supervisor inspectors | Load inspector list | Valid supervisor token; API available | Open `/supervisor/inspectors` | Live roster page rendered inspector names, regions, statuses, cases, and accuracy metrics. | PASS |
| TC-030 | Supervisor authorization | Reject inspector access to supervisor APIs | Valid inspector token | Request `GET /dashboard` or `GET /inspectors` | Inspector token received HTTP 403 “Insufficient permissions” for `/dashboard`; unauthenticated protected endpoints returned HTTP 401. | PASS |

## 3. Negative / Edge Case Tests

| ID | Module | Test Case | Preconditions | Test/Input | Expected Result | Status |
|---|---|---|---|---|---|---|
| TC-031 | Authentication | Reject an invalid email format | Login page open | Submit `not-an-email` and any password | Native email validation kept the browser on login and no request/session was created. | PASS |
| TC-032 | Authentication | Reject missing credentials | Login page open | Submit with email and password empty | Required fields kept the browser on login and no session was created. | PASS |
| TC-033 | Authentication API | Reject malformed login JSON | API available | `POST /auth/login` with missing `email` and `password` | API returned HTTP 422 with both required-field validation errors. | PASS |
| TC-034 | Authentication API | Reject incorrect password | API available | Valid-format unknown email with wrong password | API returned HTTP 401 `Incorrect email or password`. | PASS |
| TC-035 | Authentication API | Reject unknown email | API available | Unknown valid-format email and wrong password | API returned HTTP 401 without exposing account data. | PASS |
| TC-036 | Authorization API | Reject a missing bearer token | API available | Call `/history`, `/dashboard`, `/inspectors`, and `/scans/check` without auth | Each protected endpoint tested returned HTTP 401 `Not authenticated`. | PASS |
| TC-037 | Authorization API | Reject an invalid or expired JWT | API available | Call `/history` with an invalid token | API returned HTTP 401 `Invalid or expired token`. | PASS |
| TC-038 | Scan extraction | Submit without an image | Authenticated inspector; API available | `POST /scans/extract` without multipart `photo` | API returned HTTP 422 identifying the missing `photo` field. | PASS |
| TC-039 | Scan extraction | Submit an unsupported or corrupt file | Authenticated inspector; API available | Send a text file and a corrupt JPEG payload | Both requests returned controlled HTTP 502 `Extraction failed — could not read label`. | PASS |
| TC-040 | Scan extraction | Handle Gemini extraction failure or malformed JSON | Authenticated inspector; Gemini unavailable or returns invalid JSON | Submit the corrupt image payload | API returned HTTP 502 and the normal UI flow did not advance to a field-filled review. | PASS |
| TC-041 | Compliance API | Reject an invalid compliance payload | Authenticated inspector; API available | Send a field with confidence value `bad` | API returned HTTP 422 with a literal-value validation error. | PASS |
| TC-042 | Compliance API | Handle Gemini compliance failure | Authenticated inspector; Gemini unavailable | Send an empty fields payload | API returned HTTP 502 `Compliance check failed`; the UI displayed the same error and stayed on review. | PASS |

### Retest notes

- **TC-011:** Final re-run from a fresh unauthenticated browser session.
  `/supervisor` still rendered the live supervisor dashboard instead of
  redirecting to `/login`; this remains an application authorization failure
  and is independent of the Gemini configuration.
- **TC-016:** After logging in as the inspector, the final retest re-uploaded
  `testgemini.jpeg` through the normal scan flow. The UI reached
  “Reading label… Extracting fields with AI”, then displayed
  `Extraction failed — could not read label`; no fields, confidence values, or
  review/edit controls were returned. The deployed extraction request returned
  HTTP 502. This remains BLOCKED because the external/provider dependency did
  not provide a meaningful extraction result after the API-key change.
- **TC-018:** Not rerun because its prerequisite remains unsatisfied; TC-016
  did not produce extracted fields. The existing PASS evidence is from the
  separate frontend batch mock path and was not changed.
- **TC-019:** Not run because no valid extracted fields were available. It
  remains BLOCKED by the failed external extraction dependency, not as an
  independent compliance failure.

### Failed test notes

- **TC-011:** Opened `/supervisor` after logging out and clearing the
  authenticated inspector session. The live supervisor page rendered instead of
  redirecting to `/login`, contrary to the protected-route expectation.

### Blocked test notes

- **TC-013:** A history API outage could not be safely forced in the deployed
  frontend without changing configuration.
- **TC-020/TC-021:** No safe deployed fixture or successful normal extraction
  response was available to produce compliant and violation result states;
  the final extraction retest still stopped at HTTP 502.
- **TC-022/TC-023/TC-024:** These depend on reaching the result/done screens,
  which remained unreachable because the normal extraction request was blocked
  by an external/provider-related HTTP 502.

## 4. Automated Tests

No automated test suite currently identified.

The backend contains `test_gemini.py`, which is a standalone command-line
Gemini SDK/wrapper smoke test rather than a pytest test suite. It expects a
configured `GEMINI_API_KEY` and a path to an image, then checks the raw SDK
request, extraction wrapper, and compliance wrapper. No recorded output or
test result was found in the repository.

## 5. Live API Verification

The following routes were identified from the deployed API base extracted from
the deployed frontend bundle. The results below are from live requests; no
tokens or passwords are recorded.

| Endpoint | Purpose | Authentication | Expected input/response | Important negative case |
|---|---|---|---|---|
| `GET /health` | Basic service health response | None | Returns `{"status": "ok"}` | Verify behavior when the API process is unavailable. |
| `POST /auth/login` | Authenticate a fake in-memory user and create a JWT | None | JSON `email` and `password`; returns `access_token`, `token_type`, and user details | Invalid email/password, invalid email shape, or missing fields. |
| `POST /scans/extract` | Send a label image to Gemini and return extracted fields | Bearer token required | Multipart `photo`; returns `fields` with `id`, `label`, `value`, and `confidence` (`high`/`low`) | Missing file, invalid token, provider failure, or malformed provider JSON. |
| `POST /scans/check` | Send extracted fields to Gemini for rule checking | Bearer token required | JSON `{"fields": [...]}`; returns `violations` with `rule_code` and `explanation` | Invalid fields, missing token, or provider failure. |
| `GET /history` | Return scan history for the current user | Bearer token required | Returns `{"scans": [...]}` using the current fake history data | Missing/invalid token; verify whether data is actually user-specific. |
| `GET /dashboard` | Return supervisor/admin dashboard statistics | Supervisor or admin bearer token | Returns totals, integer compliance rate, and weekly trend | Missing token, inspector token (403), or malformed/expired token. |
| `GET /inspectors` | Return inspector summaries for supervisor/admin view | Supervisor or admin bearer token | Returns `{"inspectors": [...]}` | Missing token, inspector token (403), and region-scope verification. |

## 6. Browser / End-to-End Verification

### Inspector flow

1. Open the deployed frontend and confirm it redirects to `/login`.
2. Log in with a valid inspector account.
3. Confirm the inspector dashboard loads history data or shows a clear API error.
4. Start a normal scan and select a readable label image.
5. Confirm barcode and extraction processing states appear.
6. Review extracted fields, edit at least one value, and check low-confidence
   highlighting when returned.
7. Run the compliance check and verify both compliant and violation result
   presentations using suitable test images/responses.
8. Select Save Report and observe the saving, syncing, and completed screens.
9. Select Scan Another and verify a clean reset.
10. Open history and verify whether the completed scan is actually present. The
    current source indicates that save is a UI-only stage, so this check is
    especially important.

### Batch flow

1. Open `/inspector/scan?batch=true`.
2. Capture two or more image files.
3. Confirm the captured count and Process Photos control.
4. Process the batch and verify the prototype mock extraction/review behavior.
5. Confirm no claim is made that the batch is persisted unless an API response
   or database evidence is captured.

### Supervisor flow

1. Log in with the supervisor account.
2. Confirm the regional dashboard cards and weekly trend render.
3. Open Inspectors and verify the list and displayed region/statistics.
4. Attempt to access supervisor pages/APIs with an inspector account and
   confirm the intended redirect or HTTP 403 behavior.
5. Compare displayed values with the API response; current CRUD code returns
   fixed demo values and does not apply region filtering.

## 7. Test Result Evidence

Evidence captured during this execution:

- Root navigation resolved to `https://label-audit.vercel.app/login`.
- Valid demo login requests returned HTTP 200; no access token was written to
  this report.
- Invalid login returned HTTP 401; malformed login returned HTTP 422.
- Unauthenticated protected API calls returned HTTP 401; an inspector token
  received HTTP 403 from `/dashboard`.
- `GET /health` returned HTTP 200 with `{"status":"ok"}`.
- Authenticated history returned three fixed scan records.
- Normal image upload showed barcode/extraction processing, then a review with
  no fields.
- Retest of normal image upload reached barcode/extraction processing, then
  showed “Failed to fetch”; direct authenticated extraction returned HTTP 502
  `Extraction failed — could not read label`.
- Final API-key retest reached “Reading label… Extracting fields with AI” and
  displayed the explicit deployed HTTP 502 error `Extraction failed — could
  not read label`; no extracted fields were returned.
- Batch mode showed one captured photo, mock extracted fields, and low-confidence
  markers.
- The compliance and result/save/history retests were not meaningfully
  executable because normal extraction produced no fields.
- Corrupt/unsupported extraction inputs returned controlled HTTP 502 responses.

No screenshots or JWT/password values were stored in this report.

## 8. Build / Validation Checks

The following commands are present or documented by the repositories. They were
not executed as part of this deployed execution session.

| Repository | Command | Purpose | Result |
|---|---|---|---|
| Frontend | `npm run lint` | Run the configured ESLint/Next.js lint checks | Not Executed during static test analysis. |
| Frontend | `npm run build` | Create a production Next.js build and catch build/type integration errors | Not Executed during static test analysis. |
| Frontend | `npm run dev` | Start the local Next.js development server for browser verification | Not Executed during static test analysis. |
| Backend | `uv run python test_gemini.py path/to/label_photo.jpg` | Run the repository's standalone Gemini SDK and wrapper smoke test | Not Executed during static test analysis; requires a configured API key and image. |
| Backend | FastAPI application entrypoint `app.main:app` | Start the API through the configured FastAPI entrypoint for live endpoint checks | Not Executed during static test analysis. |

No backend pytest/unittest command is declared in `pyproject.toml`, and no
backend test directory was identified.

## 9. MVP Limitations / Notes for Evaluation

- User accounts are hard-coded in an in-memory fake store. The SQLModel user
  model and database session exist, but the current CRUD authentication path
  does not query the database.
- History is returned from a fixed fake list and ignores the user ID. The
  frontend scan completion flow does not call a persistence endpoint.
- Supervisor dashboard and inspector list values are fixed demo responses.
  `list_for_region()` currently returns the same list regardless of region, so
  regional isolation needs live verification before being described as
  implemented.
- Normal image extraction and compliance checking depend on the external
  Gemini service and configured credentials. Provider errors are surfaced as
  HTTP 502 responses.
- Batch mode intentionally uses frontend-generated mock extraction data rather
  than sending the captured images to a batch backend endpoint.
- Barcode checking is represented as a timed/cosmetic UI stage; no barcode
  lookup endpoint was identified.
- Saving and syncing are simulated timed UI stages. The “Synced to server” or
  “Queued offline” message is not backed by a save queue or sync API in the
  current backend route set.
- Client-side route guards check local storage tokens and, for the supervisor
  layout, redirect stored inspector users. Backend authorization remains the
  source of truth for protected API access and should be tested independently.
- The login page includes a “Having trouble signing in?” control, but no
  recovery flow is wired to it.
- The deployed supervisor route is not behaviorally identical to the checked-out
  source: the live page contains richer static dashboard/roster content and
  rendered without a session during TC-011.
- No scan created during this session appeared in history; the attempted normal
  flow did not reach save because extraction/compliance failed. Persistence was
  therefore not demonstrated.
- Results above are based on reproducible browser/API observations and include
  explicit failure/block reasons rather than inferred successes.
