# Verification 7 — Compare npm package costs before installing

**Date:** 6 September 2026  
**Live URL:** <https://package-cost-explorer.sociobot.in>  
**Implementation candidate:** `8486a159d26cf62bd69ddf320a25cf4473430d14`  
**Documentation baseline:** `2004c8d96d6814a6ff59ea0df3110faadabf916c`  
**Verdict:** **PASS**  
**Findings:** **0**  
**Untested public claims:** **0**

The job is to compare installed size and bundle size for each npm package
entry point before installing a dependency. The audience is frontend and Node
developers choosing dependencies. The first action is **Try it with sample
data**, followed by **Open a completed package report**. Fresh desktop and
phone browsers show all three facts before scrolling.

## Candidate and live deployment

`8486a159` is the implementation reviewed. `2004c8d` contains later claim,
copy, demo, and handoff documentation. It does not change product source.

The live page reports build id `mtpg9m3r`. A clean candidate build with that
identifier matches the live `index.html` and `sw.js` byte for byte. Its app
assets also match:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-DZLiw5Gs.js` | `3a84105644b7255cdc92d6f904272556aba6e799936f4d9860eef67dec52a51d` |
| `assets/index-OWC34uUI.css` | `938495f881283cfe2e552a708805df7437efc24bf55730c90cdc13da1067a434` |
| `index.html` | `0a29604dff8cec52dbfd7d53c9357db6263250bb3de0e71edc8f6e3a812510be` |
| `sw.js` | `1eaab9e926984b1cde888874da4efc055562f8a56774afa617d71d00b0733d32` |

This proves that the live runtime is the reviewed implementation. The later
documentation changes do not require a different product image.

## Clean checkout

A new local clone at `2004c8d` used Node 22.23.2, npm 10.9.8, and Playwright
1.58.2. `npm ci` completed with zero vulnerabilities.

| Command | Result |
| --- | --- |
| `npm test` | Pass: 24 Vitest tests and 2 badge-worker tests. |
| `npm run build` | Pass: `dist/index.html` produced. Initial app JS is 80.03 kB / 28.82 kB gzip. CSS is 17.25 kB / 4.55 kB gzip. |
| `npm run test:export-scale` | Pass: all 741 `date-fns@4.1.0` runtime entries. |
| `npm run test:badge` | Pass: 2 badge tests. |
| Six exact claim commands | Pass individually. |
| `npm run test:claims` | Pass: 6 claim outcomes. |
| `npm run test:e2e` | Pass: 28 browser tests and 6 intended device skips. |
| `npm run test:pwa-update` | Pass: clean install, update, and updated offline shell. |
| `npm run test:accessibility` | Pass: 4 Axe-backed checks. |
| `npm run test:privacy` | Pass: 3 completed-flow privacy checks. |
| `npm run test:offline` | Pass. |
| `npm run test:live` | Pass: clean profile, missing-package recovery, real `nanoid`, badge, and manifest. |
| `npm audit --omit=dev` | Pass: 0 vulnerabilities. |
| `npm audit --prefix api --omit=dev` | Pass: 0 vulnerabilities. |

The initial app JS is below the 200 kB product limit and the 150 kB
site-structure limit. The 12.33 MB esbuild and 1.06 MB Brotli WASM files are
deferred until a real measurement starts.

## Public claims

Each claim id appears once in the browser suite. Every exact command from
`.factory/claims.json` passed separately from the clean checkout.

| Claim | Verified outcome |
| --- | --- |
| `sample-report` | `/demo` shows `date-fns@4.1.0`, 21.73 MB installed size, zero production dependencies, three entry rows, and bundle sizes. |
| `demo-isolation` | The sample makes no cross-origin request, reads no real sentinel, leaves no `demo:` storage, preserves real local and session sentinels, and exits to an empty form. |
| `offline-reload` | A fresh controlled page reloads the sample offline, shows the offline state, and disables a new real measurement. |
| `npm-direct` | Deterministic npm search, metadata, dependency, and tarball requests finish a browser measurement. Only product and npm origins are allowed. |
| `no-account-analytics` | A completed flow has no account or payment UI, cookies, trackers, saved report, local/session record, IndexedDB database, or report cache. |
| `report-sharing` | The copied report link, copied SVG embed, and fetched SVG all identify the measured package. |

The live landing page, demo, report, Privacy, Terms, manifest, README, catalog
description, and current copy audit were cross-checked against these six
claims. No claim-like sentence is missing from the claim contract. No declared
claim is untested.

## Fresh desktop and phone browsers

Fresh 1440 × 900 desktop and 390 × 844 phone profiles opened at the top. Both
showed the job, audience, sample action, action outcome, and three product facts
before scrolling. The phone's last fact ended at 592.69 px. Horizontal
overflow was zero.

One click opened the completed sample. It showed the persistent **Demo —
sample data, nothing is saved** label, 21.73 MB installed size, zero production
dependencies, and three populated entry rows. At phone width, the banner stayed
at `top: 0` while the entry report was in view; the label, **Reset demo**, and
**Start for real** remained visible.

Reset announced **Sample reset.**, removed no real sentinel, and left no
`demo:` key. Start for real removed the sample banner and opened an empty
package field. The sample made no npm request and saved no report. This product
has no user data store, so the sentinel checks prove that demo actions do not
change real browser data.

Visual inspection confirmed the documented monochrome broadsheet design,
cyan proof marks, editorial type hierarchy, original package illustration,
and responsive stacked phone layout. The design is product-specific and not a
default framework surface.

## Normal, invalid, boundary, and recovery paths

| Path | Live result |
| --- | --- |
| Empty input | Shows a package-name example and returns focus to the input. |
| `not valid!` | Explains valid npm names and scoped-package syntax. |
| `nanoid@9999` | Says no published version matches and suggests a version or dist-tag. |
| Missing package then `nanoid@5.1.5` | Recovers to a complete report and a query-aware SVG badge without a console error. |
| `nanoid@5.1.5` | Produces installed, dependency, entry, named-import, history, share-link, and badge output. |
| `fast-glob@3.3.3` | Completes and identifies `stream`, `fs`, `os`, `path`, `events`, and `util` as outside the browser bundle. |
| `date-fns@4.1.0` | Completes in 137 seconds with 741 entry rows, 250 named imports, and 14 history rows. |
| First cancellation | Says no report was created, hides empty output, and restores input focus. |
| Replacement cancellation | Keeps the previous report visible and focused and leaves its URL unchanged. |

The real boundary run logged no console error, page error, failed request, HTTP
error, or npm 429. The live privacy smoke run contacted only the product origin
and `https://registry.npmjs.org`; it created no cookies, local/session values,
or IndexedDB database. The service-worker shell was the only cache.

## Accessibility, navigation, offline, and performance

- Home, Demo, Privacy, Terms, the designed unknown-route page, and static
  `404.html` each have `lang="en"`, one `h1`, one `main`, route-specific titles,
  and zero serious or critical Axe findings.
- Tab reaches the skip link first. Its focus outline is a solid 3 px cyan ring.
  Enter moves focus to `main`; the next Tab remains in main content.
- Back restored the home scroll position from 675 to 675 and focused its
  heading. Forward restored Demo to 1 px and focused its heading.
- Every rendered phone interaction on Home, Demo, Privacy, Terms, both 404
  forms, report controls, example controls, wordmark, and footer is at least
  44 × 44 CSS px.
- At 200% zoom, the sample label, reset action, and exit action remain rendered
  and reachable. The chart has a text description and a data table.
- Reduced motion uses `scroll-behavior: auto`; transitions and animations are
  reduced to 0.00001 seconds. Nothing loops or flashes.
- A live offline reload retains the sample, shows **You are offline**, and
  disables a new real measurement after leaving the sample.
- The PWA regression proves a clean install does not show a false update,
  detects a changed build, and reloads the updated shell offline.
- The factory URL verifier found one title, `lang="en"`, one heading, one main,
  complete image alt text, labelled buttons, and no console error.
- Live mobile Lighthouse scored 100 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO. FCP was 1.1 s, LCP 1.2 s, TBT 60 ms, and CLS 0.

## Routes, links, security, and privacy

Home, Demo, Privacy, Terms, `404.html`, robots, sitemap, manifest, social card,
apple-touch icon, report badge, and the source repository all return working
responses. The unknown URL deliberately returns HTTP 404 with the designed
page, one heading, navigation, and ways back. This expected 404 is not a
defect.

The manifest uses `application/manifest+json`. Hash-named assets use one-year
immutable caching. `sw.js` uses no-cache/no-store. HTML is revalidated after
30 seconds. The social card is a real 1200 × 630 product asset.

Live headers include HSTS, a matching CSP with `frame-ancestors 'none'`,
`X-Frame-Options: DENY`, nosniff, strict-origin referrer policy, and denied
camera, microphone, and geolocation. The hostile badge request remained inert.
Badge responses use `image/svg+xml`, a sandboxed self-denying CSP, no-referrer,
nosniff, and a five-minute public cache.

The product is a static web app with one stateless badge-rendering function.
It has no tenant, account, database, restart-persistent state, health endpoint,
or rate-limited product API. Backend tenant isolation, restart persistence,
health, and `429`/`Retry-After` checks therefore do not apply. The product is
free and has no billing path. The brief does not gain a useful AI step.

## Earlier findings

| Earlier finding | Current evidence and disposition |
| --- | --- |
| Review 1: no sample sandbox | Fixed. One click opens the completed sample; banner, reset, exit, isolation, and `/demo` deep link pass live and in `demo-isolation`. |
| Review 1: no claims contract | Fixed. Six unique declared claims and six exact outcome tests pass; no unlisted claim remains. |
| Review 1: unclear audience and action | Fixed. Fresh phone and desktop first screens state the job, audience, result, and sample action before scrolling. |
| Review 1: missing 404 | Fixed. A direct unknown URL returns the designed HTTP 404 with clear return actions. |
| Review 1: metadata and navigation | Fixed. Route titles, descriptions, canonicals, share image, icons, header links, footer links, focus, and announcements pass. |
| Review 1: jargon and unnamed action | Fixed. Current action labels name their result; copy audit and banned-word scan pass. |
| Review 1: hidden offline state | Fixed. Live offline sample reload shows the state and disables real measurement. |
| Review 2: production-dependency claim gap | Fixed. `sample-report` asserts the visible zero count; `npm-direct` asserts a non-zero deterministic count. |
| Review 2: npm-file privacy test stopped early | Fixed. The test completes search, metadata, dependency, tarball, and browser bundling with a full origin allowlist. |
| Review 2: saved-report claim was incomplete | Fixed. Cookies, local/session storage, IndexedDB, Cache Storage, and a new page are checked after completion. |
| Review 2: vague duration statement | Fixed. The statement is absent from product copy and the copy audit. |
| Review 2: phone facts below fold | Fixed. All three end at 592.69 px in the 844 px viewport. |
| Review 2: three names for one metric | Fixed. Public copy consistently uses **installed size** and **bundle size**. |
| Review 2: example buttons did not name actions | Fixed. **Use date-fns** and **Use lodash-es** are visible and accessible. |
| Review 2: README storage jargon | Fixed. README directly explains which `demo:` browser keys reset removes. |
| Verification 1: incomplete export and named-import report | Fixed. The live boundary shows all 741 entry rows and all 250 named imports. |
| Verification 1: no embeddable badge | Fixed. Report links return report-specific accessible SVG. |
| Verification 1: stale PWA updates | Fixed. The install/update/offline regression passes, and live HTML/SW match the candidate build. |
| Verification 1: optional dependencies and unqualified cap | Fixed. Unit tests include optional packages; capped totals use **Installed size (minimum)** and disclose remaining packages. |
| Verification 1: missing-package console error | Fixed. Search confirmation avoids the expected registry 404; live recovery has no console error. |
| Verification 1: missing frame protection | Fixed. CSP frame ancestors and `X-Frame-Options` are live. |
| Verification 2: deployed badge unavailable | Fixed. The exact UI badge returns 200 SVG. |
| Verification 2: false first-install update | Fixed. Clean live and PWA tests show no false update. |
| Verification 2: missing-package console error | Fixed as above. |
| Verification 3: badge returned 500 | Fixed. Live badge returns 200 with safe SVG. |
| Verification 4: badge discarded report values | Fixed. Package, version, and gzip affect the body; hostile query text is escaped. |
| Verification 4: wrong manifest MIME | Fixed. Live MIME is `application/manifest+json`. |
| Review 4: skip link did not move focus | Fixed. Every route form focuses `main` and keeps the next Tab inside it. |
| Review 5: phone sample label was not persistent | Fixed. Live scrolled phone banner remains at the viewport top with all controls. |
| Review 5: cancellation hid the previous report | Fixed. Both first and replacement cancellation outcome tests pass. |
| Review 5: incomplete privacy claims | Fixed. Completed flows enforce the full product/npm origin allowlist; the broad manifest claim is gone. |
| Review 5: short phone touch targets | Fixed. The whole-route live audit found none below 44 px. |
| Review 5: Back lost scroll position | Fixed. Live Back and Forward restore scroll and heading focus. |
| Review 5: metaphorical public labels | Fixed. Legal, 404, and manifest labels use direct words and appear in the copy audit. |
| Reviews 3, Verification 5, and Verification 6 | Their PASS outcomes were independently reproduced against the current live runtime. |

## Evidence classification

- **Observed live:** fresh phone and desktop flows, sample reset/exit, real npm
  normal/error/boundary paths, Node warning, storage and request origins,
  scroll/focus, routes, links, 404, offline reload, headers, badges, Lighthouse,
  Axe, touch targets, and screenshots.
- **Automated from a clean checkout:** unit, worker, build, all exact claim
  commands, full browser suite, privacy, accessibility, offline, PWA update,
  scale, badge, audits, and live smoke command.
- **Inspected:** brief, design thesis, claim/copy/demo documents, README,
  license, legal and install metadata, service-worker and host configuration,
  and every earlier review and verification report.
- **Not applicable:** tenant isolation, persistence restart, health, API rate
  limits, CLI/library consumer installation, billing, and AI gateway behavior.

Evidence is under `/work/.evidence/verification-7-live/` and
`/work/.evidence/verification-7-url/`.

## Result

**PASS — zero findings of every severity and zero untested public claims.**
