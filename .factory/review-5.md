# Review 5 — Compare npm package costs before installing

**Date:** 6 September 2026  
**Live URL:** <https://package-cost-explorer.sociobot.in>  
**Implementation reviewed:** `850a0275ea87e512d0867fe2b07b956e507ac9d0`  
**Documentation baseline:** `254ae1eb6b2fc28033fb425d69053d4c7e60ef7f`  
**Verdict:** **FAIL**  
**Findings:** **6** — 3 major, 3 minor  
**Untested public claims:** **2**

The live product performs its main job. It measures installed size and bundle
size for npm package entry points. It is for frontend and Node developers
choosing a dependency. The first action, **Try it with sample data**, opens a
completed `date-fns@4.1.0` report.

The result is still **FAIL**. A PASS requires zero findings and zero untested
claims.

## Findings

### Major — the phone demo label is not persistent

The demo contract requires the sample-data label and its reset and exit controls
to remain available. At 1440 px the banner is sticky and remains at the top of
the viewport. At 390 px its computed position changes to `static`. After
scrolling into the report, the banner box was at `y = -2190` and was no longer
visible.

This matters because a phone visitor can read sample figures without the
required reminder that they are fixed and unsaved. **Reset demo** and **Start
for real** also disappear until the visitor returns to the top.

Make a compact version of the banner sticky on phone layouts. Add a phone test
that scrolls to the entry table and asserts the label and both controls remain
available.

### Major — cancelling a measurement hides the previous report

I completed `nanoid@5.1.5`, started `date-fns@4.1.0`, and chose **Cancel
measurement**. The page announced:

> Measurement cancelled. Your previous report is unchanged.

The previous `nanoid 5.1.5` report remained in the DOM but `#results` was hidden,
so the visitor could not see or use it. The recovery message is false in the
observable interface. Cancelling a first measurement also refers to a previous
report when none exists.

Keep the existing report visible while a replacement is measured, or restore
its visibility on cancellation. Use different cancellation text when no prior
report exists. Add both cases to the recovery-path test.

### Major — two privacy claims do not have complete claim coverage

The `no-account-analytics` command passes, but it does not enforce the privacy
claim's required request allowlist. It records every request and only searches
URLs for a short vendor-name expression. A new request to an unrelated
collection host would pass unless its URL happened to contain one of those
names. The claims contract requires a complete same-origin and explicitly
allowed-origin assertion for the whole flow.

The public web manifest also describes the product as **“private”**. That broad
privacy claim is absent from `.factory/claims.json` and the copy audit. It is
ambiguous because real measurements necessarily disclose the package request
to npm, which the page explains more accurately.

These are the two untested public claims counted by this review. Replace the
regex check with an explicit request allowlist for the completed real flow.
Remove “private” from the manifest description or replace it with narrow,
listed, tested wording.

### Minor — several phone touch targets are shorter than 44 px

At 390 px, both package-example buttons measure 32 px high. The wordmark is
27 px high, legal return links are 24 px high, and footer links are 18 px high.
The product contract requires 44 × 44 CSS px touch targets.

Increase the clickable boxes without changing the visual text size. Add a
phone assertion over every visible interactive element.

### Minor — Back discards the previous scroll position

On the 390 px home route, I scrolled to `scrollY = 676`, opened Demo, and used
Back. Focus correctly moved to the home `h1`, but the restored home scroll
position was `0`. The site-structure contract requires back and forward
navigation to restore both scroll and focus.

Store route scroll positions and restore the prior route position without
letting focus movement reset it. Add a regression that starts below the fold.

### Minor — public labels still use metaphor instead of plain words

The legal routes show **“Policy desk”** and both 404 forms show **“Misfiled
package page.”** The web manifest uses **“Pkg Ledger”** and describes a
**“package cost ledger.”** These labels do not name a task or section in plain
words. They also do not appear in `.factory/copy-audit.md`.

Use direct labels such as **“Effective 28 August 2026”** and **“Page not
found.”** Use the product name and a plain description in the manifest. Extend
the copy audit to legal, 404, and install metadata.

## First screen and demo evidence

Fresh 1440 × 900 desktop and 390 × 844 phone contexts opened at scroll position
zero. Before scrolling, both showed:

- Job: **“Compare npm package costs before you install.”**
- Audience: **“For frontend and Node developers choosing a dependency…”**
- First action: **“Try it with sample data”**, followed by **“Open a completed
  package report.”**

All three price, offline, and npm facts ended above the phone fold at 575.7 px.
There was no horizontal overflow or console/page error.

One click opened `/demo`. It showed the persistent label on desktop,
`date-fns 4.1.0`, 21.73 MB installed size, zero production dependencies, and
three populated entry rows. **Reset demo** announced **“Sample reset.”** and
preserved real-storage sentinels. **Start for real** removed the banner and
opened an empty package field. The demo made no cross-origin request. The phone
persistence failure is Finding 1.

## Normal, invalid, boundary, and recovery evidence

| Path | Result |
| --- | --- |
| Empty input | Specific example-based package-name guidance appeared. |
| `not valid!` | Specific npm-name and scoped-package guidance appeared. |
| `nanoid@9999` | Reported that no published version matched and suggested a version or dist-tag. |
| Missing package then `nanoid@5.1.5` | Recovered to a complete report with a query-aware SVG badge; `npm run test:live` passed. |
| `fast-glob@3.3.3` | Completed and identified `stream`, `fs`, `os`, `path`, `events`, and `util` as outside the browser bundle. |
| `date-fns@4.1.0` boundary | Completed in 152 seconds with 741 entry rows, 250 named exports, 14 history rows, and no console, page, or request failure. |
| Cancel after a completed report | Failed as described in Finding 2. |

The boundary run contacted only the product origin and
`https://registry.npmjs.org`. It produced the canonical
`?q=date-fns%404.1.0` URL and a report-specific badge.

## Clean-checkout commands

A detached clean worktree at `254ae1e` used Node 22.23.2, npm 10.9.8, and the
repository-pinned Playwright 1.58.2 browser. Every documented command and every
exact claim command was run.

| Command | Result |
| --- | --- |
| `npm ci` | Passed; 0 vulnerabilities reported. |
| `npm test` | Passed: 24 Vitest tests and 2 badge-worker contract tests. |
| `npm run build` | Passed and produced `dist/index.html`. Initial app JS: 78.66 kB / 28.41 kB gzip. CSS: 16.72 kB / 4.43 kB gzip. |
| `npm run test:claims` | Passed: 6 tests. |
| Six individual commands in `.factory/claims.json` | Each passed separately. Finding 3 concerns incomplete coverage, not command failure. |
| `npm run test:e2e` | Passed: 22 tests; 2 expected device-specific skips. |
| `npm run test:pwa-update` | Passed: install, update, and updated offline shell. |
| `npm run test:accessibility` | Passed: 4 Axe-backed checks. |
| `npm run test:privacy` | Passed: 3 tests, with the coverage gap in Finding 3. |
| `npm run test:offline` | Passed. |
| `npm run test:live` | Passed against production. |
| `npm run test:export-scale` and `npm run test:badge` | Passed. |
| `npm audit --omit=dev` and `npm audit --prefix api --omit=dev` | Passed with 0 vulnerabilities. |
| Factory `verify-url.sh` | Passed with title, `lang=en`, one `h1`, one `main`, image alt text, labelled buttons, and no console error. |

## Accessibility, routes, privacy, offline, and performance

- Live Axe scans on Home, Demo, Privacy, Terms, the unknown route, and the
  static 404 found zero serious or critical violations on desktop and phone.
- The skip link is first, has a solid 3 px cyan outline with 3 px offset,
  focuses `#main`, and leaves the next Tab inside main on every route.
- Reduced motion uses `scroll-behavior: auto`, 0.01 ms transitions, and no
  result animation. A 200% desktop zoom check showed no horizontal overflow or
  lost visible text.
- Direct HTTP requests return 200 for Home, Demo, Privacy, Terms, static 404,
  robots, sitemap, and manifest. A fresh direct unknown route returns the
  expected HTTP 404 with the designed page. Its navigation-level console 404
  is expected, not an application error.
- Every discovered link returned 200, including the sample badge and source
  repository. Route titles, descriptions, canonicals, one `h1`, and one `main`
  were present.
- A fresh live `nanoid` flow contacted only this origin and npm. It left no
  cookies, local storage, session storage, IndexedDB, or report entry in Cache
  Storage. Only the versioned application shell was cached.
- The live demo reloaded offline with three rows and disabled real measurement.
  A clean first install showed no false update notice. The replacement-update
  regression passed locally.
- Live security headers include CSP with `frame-ancestors 'none'`, HSTS,
  `X-Frame-Options: DENY`, nosniff, strict-origin referrer policy, and denied
  camera, microphone, and geolocation.
- Lighthouse scored **98 Performance** and **100 Accessibility**: FCP 1.9 s,
  LCP 1.9 s, TBT 0 ms, CLS 0. Initial transfer was 28,687 B JavaScript,
  4,517 B CSS, and a 24,687 B AVIF.
- The live badge GET is report-specific, safe for hostile query text, and
  returns `image/svg+xml` with a five-minute cache. The badge function is
  stateless and has no tenant or persisted product state. Tenant isolation,
  restart persistence, health, and 429/`Retry-After` checks therefore do not
  apply. The GET contract works; unsupported HEAD is not a product defect.
- The brief does not imply a useful AI step. The missed-leverage check produced
  no finding.

Evidence is under `/work/.evidence/review-5/`, including desktop and phone
captures, the boundary result, 404 captures, the URL verifier output, and the
Lighthouse JSON.

## Live candidate match

Only reports changed after implementation commit `850a027`. Production serves
`assets/index-B0xoVm4O.js` with SHA-256
`04bb0a6351e2a6c789790e32aa9a4b992581c801961cd5867b76062c05bca548`
and `assets/index-C7zdKBjW.css` with SHA-256
`7d53fa67028684e09b53a677615f300cc4afec210c3452784300295fd457f38b`.
Both exactly match the clean build. The live runtime is the implementation
reviewed.

## Earlier findings disposition

| Earlier finding group | Current disposition |
| --- | --- |
| Review 1: first screen, demo, claims, 404, metadata, copy, offline state | The main fixes remain live. Demo persistence is incomplete on phone (Finding 1), and metaphorical labels remain outside the copy audit (Finding 6). |
| Review 2: dependency claim, npm flow, saved reports, vague timing, phone fold, terminology, example actions, README wording | User-visible product behavior is fixed. The privacy claim regression test still lacks the required complete request allowlist (Finding 3). |
| Verification 1: complete exports, badge, PWA update, optional dependencies, errors, frame protection | Fixed; the boundary, badge, update, Node-warning, recovery, and header checks pass. |
| Verifications 2–4: deployed badge failures, false update, expected 404 console noise, manifest MIME | Fixed for the supported GET flow; the live badge and manifest MIME pass. |
| Review 4: skip link did not move focus | Fixed by `850a027`; live and clean tests focus `#main` and keep the next Tab in main. |
| Verification 5, Repair 5, Verification 6 | Their tested paths still pass. This review adds phone scroll, cancellation-after-success, all-target sizing, history scroll restoration, manifest claim, and full-copy checks. |

## Result

**FAIL — 6 findings and 2 untested public claims.** Product code was not
modified.
