# Review 6 — Compare npm package costs before installing

**Date:** 6 September 2026  
**Live URL:** <https://package-cost-explorer.sociobot.in>  
**Implementation reviewed:** `8486a159d26cf62bd69ddf320a25cf4473430d14`  
**Documentation baseline:** `d8d5d4085b90218472ff74c3d3812d41d78bae6e`  
**Verdict:** **PASS**  
**Findings:** **0**  
**Untested public claims:** **0**

The job is to compare installed size and bundle size for each npm package entry
point before installing a dependency. The audience is frontend and Node
developers choosing dependencies. The first action is **Try it with sample
data**, followed by **Open a completed package report**.

## First screen before scrolling

Fresh 1440 × 900 desktop and 390 × 844 phone browsers opened at the top of the
live page. Both showed:

- **Compare npm package costs before you install.**
- **For frontend and Node developers choosing a dependency, see installed size
  and each entry point’s bundle size.**
- **Try it with sample data**, followed by what it opens.
- The three facts about payment/accounts, offline reload, and direct npm
  requests.

On the phone, the last fact ended at 592.69 px in the 844 px viewport. On the
desktop it ended at 786.52 px in the 900 px viewport. Neither layout had
horizontal overflow. Screenshots are
`/work/.evidence/review-6-phone-home.png` and
`/work/.evidence/review-6-desktop-home.png`.

## Candidate and live build

`8486a159` is the last implementation commit. Changes through `d8d5d408` affect
only `.factory` documentation. The live page reports build id `mtpg9m3r`.
A clean build with that id matched the live application exactly:

| File | SHA-256 |
| --- | --- |
| `assets/index-DZLiw5Gs.js` | `3a84105644b7255cdc92d6f904272556aba6e799936f4d9860eef67dec52a51d` |
| `assets/index-OWC34uUI.css` | `938495f881283cfe2e552a708805df7437efc24bf55730c90cdc13da1067a434` |
| `index.html` | `0a29604dff8cec52dbfd7d53c9357db6263250bb3de0e71edc8f6e3a812510be` |
| `sw.js` | `1eaab9e926984b1cde888874da4efc055562f8a56774afa617d71d00b0733d32` |

The repository QA report `.factory/verification-7.md` was read in full. The
separately cited `factory-evidence/package-cost-explorer-verify-7/qa-report.md`
was not present in this disposable workspace, so this review did not treat that
external path as new evidence.

## Clean-checkout commands

A fresh clone at `d8d5d408` used Node 22.23.2, npm 10.9.8, and Playwright
1.58.2. `npm ci` completed with zero vulnerabilities.

| Command | Result |
| --- | --- |
| `npm test` | Pass: 24 Vitest tests and 2 badge-worker tests. |
| `npm run build` | Pass: `dist/index.html` produced. Initial app JS is 80.03 kB / 28.82 kB gzip; CSS is 17.25 kB / 4.55 kB gzip. |
| `npm run test:export-scale` | Pass: all 741 `date-fns@4.1.0` runtime entries. |
| `npm run test:badge` | Pass: 2 badge tests. |
| Six exact claim commands | Pass individually. |
| `npm run test:e2e` | Pass: 28 browser tests and 6 intended device skips. |
| `npm run test:pwa-update` | Pass: clean install, update, and updated offline shell. |
| `npm run test:accessibility` | Pass: 4 Axe-backed checks. |
| `npm run test:privacy` | Pass: 3 completed-flow privacy checks. |
| `npm run test:offline` | Pass. |
| `npm run test:live` | Pass: clean profile, missing-package recovery, real `nanoid`, badge, and manifest. |
| `npm audit --omit=dev` | Pass: 0 vulnerabilities. |
| `npm audit --prefix api --omit=dev` | Pass: 0 vulnerabilities. |

The initial app JavaScript is below both the 200 kB product budget and the
150 kB site-structure budget. The 12.33 MB esbuild and 1.06 MB Brotli WASM
files load only when a real measurement starts.

## Public claims

Every exact command from `.factory/claims.json` passed separately. Each of the
six ids occurs once in the browser suite.

| Claim | Observed test outcome |
| --- | --- |
| `sample-report` | The fixed `date-fns@4.1.0` sample shows 21.73 MB installed size, zero production dependencies, three entry rows, and bundle sizes. |
| `demo-isolation` | The sample makes no cross-origin request, reads no real sentinel, leaves no `demo:` storage, and exits to an empty real form. |
| `offline-reload` | A controlled sample reloads offline, shows the offline state, and disables a new real measurement. |
| `npm-direct` | Deterministic npm search, metadata, dependency, tarball, and browser bundling complete using only product and npm origins. |
| `no-account-analytics` | A completed flow has no account or payment UI, cookie, tracker, local/session report, IndexedDB database, or report cache. |
| `report-sharing` | The copied report link, copied SVG embed, and fetched SVG identify the measured package. |

The live home, demo, report, Privacy, Terms, manifest, README, catalog
description, and copy audit were checked against this list. No public claim is
unlisted or untested. The banned-word scan returned no result.

## Demo and live package paths

One click opened the completed sample on both screen sizes. It contained
`date-fns 4.1.0`, 21.73 MB installed size, zero production dependencies, three
entry rows, two named imports, and three history rows. The persistent **Demo —
sample data, nothing is saved** label, **Reset demo**, and **Start for real**
remained visible at the bottom of the phone report. Reset announced **Sample
reset.**, preserved real local/session sentinels, and left no `demo:` key. Start
for real removed the banner and opened an empty package field. The sample made
no cross-origin request.

| Path | Live outcome |
| --- | --- |
| Empty input | Explains that a package name is required and returns focus to the field. |
| `not valid!` | Explains valid npm names and scoped-package syntax. |
| `nanoid@9999` | Says no published version matches and suggests a version or dist-tag. |
| Missing package then `nanoid@5.1.5` | Recovers to a three-entry report and a report-specific SVG badge. |
| `fast-glob@3.3.3` | Completes and identifies `stream`, `fs`, `os`, `path`, `events`, and `util` outside the browser bundle. |
| `date-fns@4.1.0` | Completes in 136 seconds with 741 entry rows, 250 named imports, and 14 history rows. |
| First cancellation | Local browser test keeps output empty, explains cancellation, and restores input focus. |
| Replacement cancellation | Local browser test preserves the previous report, URL, and report focus. |

The live boundary had no console error, page error, failed request, HTTP error,
or npm 429. A completed live `nanoid` run contacted only the product and npm
origins and left cookies, local storage, session storage, IndexedDB, and report
cache empty.

## Accessibility, routes, offline, and performance

- Home, Demo, Privacy, Terms, the client not-found state, and static `404.html`
  have `lang="en"`, one `h1`, one `main`, route-specific titles, and no serious
  or critical Axe finding.
- A settled-state Axe CLI scan of Home, Demo, Privacy, and Terms found zero
  violations. Its zero-delay Demo scan initially sampled the 220 ms reveal at
  partial opacity; the required 500 ms settled scan and Playwright Axe scans
  found zero violations. Reduced motion removes that reveal entirely.
- Tab reaches the skip link first. It has a 3 px cyan outline; Enter focuses
  `main`, and the next Tab stays within main content.
- Programmatic navigation preserved a 647 px phone scroll position on Back,
  restored Demo to the top on Forward, and focused the new heading both ways.
- Every visible phone control on all routes and the report is at least 44 × 44
  CSS px. A 720 px layout representing 200% zoom had no overflow; the demo
  label and controls remained visible and reachable.
- The chart has an image role, a text description, and a readable data table.
- Reduced motion uses automatic scrolling, 0.00001-second transitions, and no
  running animation.
- A fresh live service-worker-controlled sample reloaded offline, kept the
  report, showed **You are offline**, and disabled a new real measurement.
- The factory URL verifier found one title, `lang="en"`, one heading, one main,
  complete image alt text, labelled buttons, and no console error.
- Live mobile Lighthouse scored 100 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO. FCP and LCP were 1.3 s, TBT was 0 ms, and CLS was 0.

All crawled internal and external links returned their expected status. A
fresh direct unknown URL returned HTTP 404 with the designed page and return
actions. After service-worker installation, the offline shell can render the
same not-found state with an intercepted 200; this does not turn a broken URL
into content and is not a defect. `/404.html` itself returned 200 as expected.

## Security, privacy, and product scope

The live site sends HSTS, matching CSP and `frame-ancestors 'none'`,
`X-Frame-Options: DENY`, nosniff, strict-origin referrer policy, and denied
camera, microphone, and geolocation. Hash-named assets use one-year immutable
caching; the service worker uses no-cache/no-store. The manifest has
`application/manifest+json` type. The 1200 × 630 share image and 180 × 180
apple-touch icon are present.

A hostile badge query remained escaped and returned accessible SVG with a
self-denying sandbox CSP, no-referrer, nosniff, and a five-minute public cache.
The product is a static app with one stateless badge-rendering function. It has
no tenant, account, database, restart-persistent state, health endpoint, or
rate-limited product API. Tenant isolation, restart persistence, health, and
429/`Retry-After` checks therefore do not apply. The product is free, has no
billing path, and does not benefit from an AI step.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Review 1: no sample sandbox | Fixed: one-click populated demo, persistent banner, reset, exit, isolation, and deep link pass live and in the claim test. |
| Review 1: no claims contract | Fixed: six unique claims and six exact outcome tests pass; copy cross-check found no unlisted claim. |
| Review 1: unclear audience and action | Fixed: fresh phone and desktop first screens state job, audience, result, and action before scrolling. |
| Review 1: missing 404 | Fixed: a fresh direct unknown URL returns the designed HTTP 404 with return actions. |
| Review 1: metadata and navigation | Fixed: route titles, descriptions, canonicals, share metadata, icons, header/footer links, focus, and announcements pass. |
| Review 1: jargon and unnamed action | Fixed: action labels name outcomes; current copy audit and banned-word scan pass. |
| Review 1: hidden offline state | Fixed: live offline sample reload shows the state and disables real measurement. |
| Review 2: production-dependency claim gap | Fixed: the sample asserts zero and the deterministic npm fixture asserts one. |
| Review 2: npm-file privacy test stopped early | Fixed: the claim completes search, metadata, dependency, tarball, and bundling with a full origin allowlist. |
| Review 2: saved-report claim incomplete | Fixed: completed flows check cookies, local/session storage, IndexedDB, Cache Storage, and a fresh page. |
| Review 2: vague duration statement | Fixed: absent from current public copy. |
| Review 2: phone facts below fold | Fixed: the last fact ends at 592.69 px. |
| Review 2: three names for one metric | Fixed: public copy consistently uses **installed size** and **bundle size**. |
| Review 2: example buttons did not name actions | Fixed: **Use date-fns** and **Use lodash-es** are visible and accessible. |
| Review 2: README storage jargon | Fixed: README explains exactly which `demo:` keys reset removes. |
| Verification 1: incomplete export and named-import report | Fixed: the live boundary renders all 741 entries and 250 named imports. |
| Verification 1: no embeddable badge | Fixed: report-specific accessible SVG works live and in contract tests. |
| Verification 1: stale PWA updates | Fixed: clean install/update/offline regression passes; live shell matches the candidate. |
| Verification 1: optional dependencies and silent cap | Fixed: unit coverage includes optional packages; capped totals use **Installed size (minimum)** and disclose remaining packages. |
| Verification 1: missing-package console error | Fixed: live missing-package recovery has no console error. |
| Verification 1: missing frame protection | Fixed: live CSP and `X-Frame-Options` deny framing. |
| Verification 2: deployed badge unavailable | Fixed: exact live UI badge returns 200 SVG. |
| Verification 2: false first-install update | Fixed: fresh live and PWA tests show no false update. |
| Verification 2: missing-package console error | Fixed as above. |
| Verification 3: badge returned 500 | Fixed: live badge returns 200. |
| Verification 4: badge discarded report values | Fixed: package, version, and gzip change the SVG; hostile values stay inert. |
| Verification 4: wrong manifest MIME | Fixed: live type is `application/manifest+json`. |
| Review 4: skip link did not move focus | Fixed: all route forms focus `main`; the next Tab stays in main content. |
| Review 5: phone sample label was not persistent | Fixed: live scrolled phone banner keeps the label and both actions in view. |
| Review 5: cancellation hid the previous report | Fixed: first and replacement cancellation outcome tests pass. |
| Review 5: incomplete privacy claims | Fixed: completed sample and npm flows enforce the full request/storage contract. |
| Review 5: short phone touch targets | Fixed: the live whole-route audit found none below 44 px. |
| Review 5: Back lost scroll position | Fixed: live Back restored 647 px and Forward restored Demo to the top. |
| Review 5: metaphorical public labels | Fixed: legal, 404, and install labels use direct words and are included in the copy audit. |
| Reviews 3, Verification 5, and Verification 6 | Their PASS outcomes were reproduced against the current live runtime. |

## Evidence classification

- **Observed live:** fresh phone and desktop first screens, sample/reset/exit,
  normal/error/boundary/recovery paths, Node warning, storage and request
  origins, routes, links, direct HTTP 404, keyboard/focus/scroll, offline,
  headers, badge hardening, Lighthouse, Axe, touch targets, zoom, and
  screenshots.
- **Automated from a clean checkout:** unit and worker tests, production build,
  all six exact claim commands, full browser suite, PWA update, privacy,
  accessibility, offline, scale, badge, live smoke, and audits.
- **Inspected:** brief, design thesis, claims, copy, demo contract, README,
  license, manifest, service worker and host configuration, badge worker, and
  every earlier review and verification finding.
- **Not applicable:** tenant isolation, persistence restart, health, API rate
  limits, CLI/library installation, billing, and AI gateway behavior.

## Result

**PASS — zero findings of every severity and zero untested public claims.**
