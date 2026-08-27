# Independent verification 4 — FAIL

**Verified 2026-08-27** from a clean, detached checkout of candidate
`2ae39606aa2f39b73907808e9da0b3a2a36f8ac5` against
<https://package-cost-explorer.sociobot.in>.

## Verdict

**FAIL.** The previous deployment-only HTTP 500 has been fixed: the live
badge URL now returns an accessible, safe `image/svg+xml` response. The core
exports-aware explorer works end to end and the deployed hashed JS/CSS are the
candidate's assets. However, the required embeddable per-result SVG badge is
not implemented by the live route. It ignores its `package`, `version`, and
`gzip` query values and returns the same generic 567-byte SVG for every
report. The brief requires an embeddable badge for the selected package/version
and measurement, served by a tiny worker; a generic compatibility image does
not meet that v1 feature.

## Clean checkout and quality gates

Environment: Node 22.23.2; clean checkout at `/tmp/package-cost-explorer-verify`.
Playwright 1.62's matching Chromium was installed before browser testing.

- `npm ci` passed; `npm audit --omit=dev` reported **0 vulnerabilities**.
- `npm test` passed: **7 files, 23 tests**.
- `npm run build` passed (`tsc --noEmit && vite build`) and produced `dist/`.
  There is no lint script or lint configuration in the repository.
- `npm run test:e2e` passed: **4 passed, 2 intentional project skips**. It
  covers desktop and 390 x 844 mobile, keyboard skip link, axe
  serious/critical violations, live `nanoid@5.1.5` analysis, mobile overflow,
  and legal routes.
- `npm run test:pwa-update` passed: first install, replacement update, and
  offline reload of the updated shell.
- `npm run test:live` passed from a clean browser profile: no false first
  update toast, missing-package recovery without a browser console 404, a real
  `nanoid@5.1.5` report, and a 200 SVG response at the UI-generated URL.

The built initial application shell is 73,020 B JS (27.09 kB gzip) plus
12,978 B CSS (3.71 kB gzip), within the 200 kB/50 kB static budgets. The
12.33 MB esbuild and 1.06 MB Brotli WASM files are analysis-time assets, not
initial imports. Lighthouse against production scored **100 Performance** and
**100 Accessibility** (FCP 1.1 s, LCP 1.2 s, CLS 0, TBT 50 ms).

## Independent product evidence

- At 390 x 844, an empty submission, malformed `@bad`, and a deliberately
  unknown package each produced specific actionable errors. The same page then
  recovered to a complete `nanoid@5.1.5` report, including per-entry table,
  named exports, dependency/install facts, history, share URL, and badge
  control. No horizontal overflow, console errors, or page errors occurred.
- The boundary exports-map case `date-fns@4.1.0` completed in **182 seconds**
  with **741** public-entry rows and **250** isolated named-export rows, and
  no console errors. This demonstrates that the export table is not silently
  sampled or capped for that package.
- Keyboard/visual checks passed: Tab reaches the skip link first in the
  repository E2E test; visible focus is a solid 3px outline; at mobile width
  overflow was 0px. Under `prefers-reduced-motion: reduce`, transition
  duration computes to 0.00001s and result animation is disabled. Axe found
  no serious or critical findings on desktop or mobile.
- `/privacy` and `/terms` each render correctly with one heading and the
  expected main landmark. The generated art has useful alt text. The app has
  one h1, a document title, `lang="en"`, and a skip link.

## Deployment, privacy, and response-policy evidence

- Production HTML references `assets/index-DgDqbw25.js` and
  `assets/index-CuuKIdbr.css`. Their SHA-256 values exactly match the clean
  candidate build: respectively
  `020f4dac60bf5e73737e80981e94896c1685deeff8367969c33817b951ba4c11` and
  `afb3072360e4e70cc0d878cd6bc5642129e0138fc76b25f0eb1192a649120d52`.
  `badge.svg` also matches byte-for-byte. The HTML/service-worker/manifest
  build identifiers naturally differ because production uses a timestamped
  deployment revision; their application asset list and code are otherwise
  candidate-consistent. `origin/main` is this candidate commit.
- A fresh live browser profile made requests only to the product origin and
  `https://registry.npmjs.org` during analysis. It had no cookies,
  `localStorage`, or `sessionStorage`; no analytics, CDN fonts, or third-party
  scripts were observed. This conforms to the local-first privacy claim.
- HTTPS responses include HSTS, CSP (`self` scripts/styles/images and npm-only
  connections), `X-Frame-Options: DENY`, `nosniff`, strict-origin referrer
  policy, and disabled camera/microphone/geolocation. Hashed assets are
  immutable for one year; `sw.js` is no-cache/no-store; HTML is revalidated in
  30 seconds.

## Defects

### P1 — Live SVG badge discards the package measurement

The exact successful-report URL returns HTTP 200 and `image/svg+xml`:

`https://package-cost-explorer.sociobot.in/badge.svg?package=nanoid&version=5.1.5&gzip=473`

But its response SHA-256 is exactly the same as this materially different URL:

`https://package-cost-explorer.sociobot.in/badge.svg?package=date-fns&version=4.1.0&gzip=999999`

Both are
`f653c66247854318a0c9d7110efd788209a0268009dde417aab1a69921e8993e` and
render only “Package Cost Explorer / browser measured”; neither contains the
package, version, nor gzip number. The checked-in static SVG deliberately
cannot interpolate query data. A copied `data:` SVG is useful as a workaround,
but it does not make the report's public, UI-generated badge URL an embeddable
per-result badge. Restore a safe query-aware worker/edge response (with strict
escaping and cache policy), or change the product contract before claiming the
feature.

### P3 — Production manifest has the wrong MIME type

`/manifest.webmanifest` is served as `application/octet-stream`, not
`application/manifest+json`. Chromium still passed the service-worker shell
checks, but this is an avoidable PWA interoperability/response-policy defect.
Configure the static host route with the manifest MIME type.

## Acceptance condition

Re-verify after the exact live badge URL generated by a report visibly and
accessibly contains that report's package, resolved version, and gzip figure
(and remains safe against hostile query text). Correct the manifest MIME while
making that deployment change.
