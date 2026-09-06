# Package cost explorer review 4 — keyboard access to package reports

**Reviewed:** 2026-09-06  
**Live URL:** https://package-cost-explorer.sociobot.in  
**Implementation candidate:** `1f80fe8482a819103ab3323e74fd4ea7d1ee698a` (last product-code change)  
**Documentation revision:** `ef9756724e59270007f16e601d40679eb4173585`  
**Verdict:** **FAIL**  
**Findings:** 1 minor  
**Untested declared claims:** 0

## Job, audience, and first action

Fresh desktop (1440 × 900) and phone (390 × 844) browser profiles loaded the
live home page without scrolling or prior product storage.

| Check | Observed result |
| --- | --- |
| Job | “Compare npm package costs before you install.” clearly describes comparing installed and entry-point bundle sizes. |
| Audience | The supporting sentence names frontend and Node developers choosing a dependency. |
| First action | The 48 px “Try it with sample data” control says that it opens a completed package report. |

The phone page had zero horizontal overflow. Its three plain facts were visible:
no payment or account; offline reload after the first visit; and real
measurements contact npm directly. Initial navigation made only same-origin
requests and logged no console errors.

## Finding

### P3 — Skip link does not move keyboard focus past the header

On the live home page, Tab correctly reaches “Skip to main content” first.
Activating it with Enter changes the URL to `#main`, but leaves
`document.activeElement` as `<body>`; `<main id="main">` is not focusable.
The next Tab therefore returns to the skip link rather than continuing at the
main content. The same non-focusable `#main` pattern exists in the static 404
page.

This is a keyboard-access defect. The skip link is visible but does not perform
its stated purpose for keyboard users. Give each main target `tabindex="-1"`
and ensure activation moves focus to it (or to the page heading), including the
static 404. Add a browser test that activates the skip link and asserts focus
is within main.

## Demo, normal, error, boundary, and recovery paths

- `/demo` and `/?demo=1` immediately showed the fixed `date-fns@4.1.0`
  package report. The persistent banner read “Demo — sample data, nothing is
  saved”; Reset demo announced “Sample reset.”; Start for real returned to the
  empty real form. The sample report showed installed size, zero production
  dependencies, three entry points, named imports, history, report link, and
  SVG badge.
- A fresh production run handled malformed `not valid!` input and a deliberately
  missing package with actionable messages, then recovered to a completed
  `nanoid@5.1.5` report. That report had 3 entry-point rows, 5 named-export
  rows, a canonical `?q=nanoid%405.1.5` URL, and a report-specific badge.
- The large real boundary case `date-fns@4.1.0` completed without console or
  page errors. It rendered 741 published entry points, 21.55 MB installed
  size, and a populated report; it was not silently sampled.
- The UI-generated `nanoid` badge returned `200 image/svg+xml; charset=utf-8`,
  contained `nanoid@5.1.5: 473 B gzip`, had a `default-src 'none'; sandbox`
  policy, and differed from a date-fns badge. HTTP `HEAD` deliberately returns
  404 on this function route; browser and product use its healthy GET contract.

## Clean-checkout evidence

All commands below ran from a fresh clone at documentation revision `ef97567`
after `npm ci`; its product source is the `1f80fe8` implementation candidate.
The clean setup reported zero root production-audit vulnerabilities.

| Command or check | Result |
| --- | --- |
| `npm test` | Pass — 24 Vitest tests and 2 badge-worker contract tests. |
| `npm run build` | Pass — produced `dist/`. Initial app JS was 78.61 kB (28.41 kB gzip); CSS was 16.72 kB (4.43 kB gzip). Deferred analysis WASM is not an initial shell import. |
| `npm run test:e2e` | Pass — 22 tests across desktop and 390 × 844 mobile. |
| `npm run test:pwa-update` | Pass — clean install, ordinary update, and updated offline shell. |
| `npm run test:live` | Pass — clean profile, missing-package recovery, per-report SVG GET, and manifest MIME. |
| `npm audit --omit=dev` and API production audit | Pass — zero vulnerabilities. |

Every declared claim command was run separately and passed:

| Claim | Result |
| --- | --- |
| `sample-report` | Pass — fixed sample facts, three rows, and entry-point bundle values. |
| `demo-isolation` | Pass — sentinels survive, no demo storage/database or cross-origin request, reset and exit work. |
| `offline-reload` | Pass — sample reloads offline and real measurement is disabled. |
| `npm-direct` | Pass — deterministic npm search, metadata, dependency, tarball, and browser bundle flow without an analysis endpoint. |
| `no-account-analytics` | Pass — no cookies, account/payment UI, tracking, persisted report, database, or report cache. |
| `report-sharing` | Pass — copied sample link/SVG and badge response identify `date-fns@4.1.0`. |

The public claims cross-check found those six claims cover the landing page,
README, demo, and privacy promises. No public claim is unlisted or untested.

## Accessibility, routes, privacy, and deployment

- Live Axe scans at phone width found zero serious or critical violations on
  Home, Demo, Privacy, Terms, and the designed 404. Each had one h1, one main
  landmark, route-specific title, description, and canonical URL; there were
  no console errors. Reduced motion computed to `0.00001s` transitions and
  `scroll-behavior: auto`.
- Keyboard navigation reached the skip link first and navigated to Demo with
  Tab/Enter. The skip-link focus defect above remains the one exception.
- Home, Demo, Privacy, Terms, robots, sitemap, manifest, and the deliberate
  designed 404 returned their expected responses. The unknown route returned
  HTTP 404, which is expected, with a usable return-home page.
- Fresh real analysis contacted only the product origin and
  `registry.npmjs.org`. The demo contacted only the product origin. The live
  app has no account or payment flow, tracking cookies, third-party fonts, or
  third-party scripts. This is a static product; its small badge function holds
  no tenant state, so backend tenant/restart/rate-limit checks do not apply.
- Current live `index-B5uTgNIl.js` and `index-C7zdKBjW.css` SHA-256 values
  exactly matched the clean candidate build:
  `7c5e15df3e481cc2c3da4370aecbccfafb6c7b3b6f9f2affd747507255abefed` and
  `7d53fa67028684e09b53a677615f300cc4afec210c3452784300295fd457f38b`.
  The live runtime therefore matches the implementation candidate, not merely
  the later report-only revisions.

## Earlier findings disposition

| Earlier finding group | Current disposition |
| --- | --- |
| Review 1 demo, claims, first-read, 404, metadata/navigation, copy, and offline findings | Fixed and re-proven by the demo, route, claim, and offline checks above. |
| Review 2 dependency-count, npm-direct/privacy, saved-report, copy, phone-fold, metric naming, example-action, and README wording findings | Fixed and re-proven by the claim suite, fresh phone check, and current copy. |
| Verification 1 incomplete export report, badge endpoint, stale PWA, optional-dependency footprint, missing-package console error, and frame protection | Fixed: date-fns has 741 live entries; query-aware badge GET works; PWA update test passes; optional dependencies are included by the registry test; missing input path is console-clean; live CSP has `frame-ancestors 'none'` and `X-Frame-Options: DENY`. |
| Verification 2–4 production badge availability/500/generic response and manifest MIME | Fixed: live GET returns a safe, report-specific SVG; manifest is `application/manifest+json`. |
| Verification 5 and Review 3 | Their prior PASS evidence remains valid except that this review found the skip-link activation gap not covered by their focusability-only checks. |

## Required next step

Do not declare this release PASS until the skip-link target receives keyboard
focus and the new regression test passes. No product code was changed during
this review.
