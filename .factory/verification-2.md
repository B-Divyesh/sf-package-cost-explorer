# Independent verification 2 — FAIL

**Verified 2026-08-27** against clean candidate commit
`4a7f4bff8cdd2e7d15fddbaf634ace67032d6124` and production
<https://package-cost-explorer.sociobot.in>.

## Verdict

**FAIL.** The static frontend and its core browser analysis now meet the
researched v1 contract, including the former complete-export and PWA-update
issues. However, the required production SVG badge worker is unavailable. A
real UI-generated badge URL returns **HTTP 403** with Azure's `Web App -
Unavailable` HTML rather than `image/svg+xml`. An embeddable badge is a stated
v1 deliverable, so this deployment failure blocks acceptance.

## Clean candidate quality gates

Executed from this clean checkout at the SHA above (Node 22.23.2):

- `npm ci`: passed.
- `npm audit --omit=dev`: **0 vulnerabilities**.
- `npm test`: **7 files / 22 tests passed**.
- `npm run test:export-scale`: passed; the published `date-fns@4.1.0`
  regression enumerated exactly **741** runtime entries.
- `npm run test:badge`: **2 passed**, including SVG escaping.
- `npm run build`: passed (`tsc --noEmit && vite build`) and produced `dist/`.
  There is no lint script/configuration in this repository.
- After installing the missing local Chromium binary, `npm run test:pwa-update`
  passed and `npm run test:e2e` passed (**4 passed, 2 intentional skips**).

The build's initial application JS is 138,011 B uncompressed / 45,290 B gzip
(`index-BxrufyKZ.js` plus `browser-B7awMJ6B.js`); CSS is 12,978 B / 3,710 B
gzip. Both are within the 200 KB JS and 50 KB CSS budgets. esbuild (12.33 MB)
and Brotli (1.06 MB) WASM are lazy analysis-time downloads. The mobile hero
AVIF is 26,075 B. No remote fonts or runtime scripts are loaded.

## Independent product exercise

Fresh Chromium checks covered local production preview and the live site at
desktop and 390 x 844 mobile:

- Home has one `h1`, one `main`, a labelled package input, working privacy and
  terms routes, no horizontal mobile overflow, and 0 serious/critical axe
  findings on all four home-page checks.
- Keyboard Tab reaches the skip link first. Its visible focus style is a
  `3px rgb(0, 111, 122)` outline with a `3px` offset. Enter moves to the
  analysis main content.
- `prefers-reduced-motion` changes smooth scrolling to `auto`, reduces control
  transitions to 0.01 ms, and disables the result animation.
- Invalid `@@bad` input gives the npm-name recovery message. A missing package
  gives `npm has no published package named … Check the spelling.`; a subsequent
  `nanoid@5.1.5` submission recovered and rendered 3 entry rows, the exact
  shared URL, and the measured-local report on live production.
- Scoped/range input `@floating-ui/dom@1.7.4` completed locally with 2 public
  entries, 14 named-export measurements, and a history chart, without console
  errors.
- The representative high-scale job `date-fns@4.1.0` completed locally in
  **184 seconds**, rendering **741** public-entry rows, **250** isolated named
  exports, and a history chart, with no console or page errors. This verifies
  the non-sampled export-report contract in the actual UI.
- Live PWA: registration became active; after shell registration an offline
  reload rendered `Count what your import really costs.`. The repository's
  ordinary-build update/offline test also passed.

## Deployment, privacy, and response policy evidence

- Production HTML references the exact candidate JS/CSS filenames. The live
  `assets/index-BxrufyKZ.js` SHA-256 is
  `8fd526597c14df3931c0b0bec00fe06ad7e3b4db12a94783bf9e54ecefbc5f78`,
  identical to the candidate build. `index.html` and `sw.js` differ only in
  the expected generated build revision. Thus the live frontend matches this
  candidate, but the deployed function component does not work.
- A live `nanoid@5.1.5` report emits
  `/badge.svg?package=nanoid&version=5.1.5&gzip=473`. Fetching that exact URL
  returned **403**, `content-type: text/html`, and body title `Web App -
  Unavailable`; it did not return the worker's expected SVG. Direct badge URL
  checks produced the same result.
- Initial load and real analysis used only the product origin and
  `https://registry.npmjs.org` (plus browser blob resources). Static inspection
  found no analytics, tracking SDKs, external fonts, cookies,
  `localStorage`, or `sessionStorage`; a live fresh context also had zero
  cookies and empty web storage. Registry/tarball traffic is necessarily
  visible to npm, as disclosed.
- Live HTML has HTTPS/HSTS, restrictive CSP (`frame-ancestors 'none'`),
  `X-Frame-Options: DENY`, nosniff, referrer, and permissions policies. HTML
  is revalidated after 30 seconds, hashed JS/WASM are one-year immutable, and
  `sw.js` is `no-cache, no-store, must-revalidate`.

## Defects

### P1 — Required production badge endpoint is unavailable

`/badge.svg` is configured to rewrite to the anonymous Azure Function, and
the candidate's unit tests prove the local function returns safe SVG. In the
actual deployment, the route returns Azure's 403 unavailable page for the
exact link generated by the report. The UI's “badge” link therefore cannot be
embedded or viewed. Deploy/enable the `api/badge` function with the static
site, then prove `GET /badge.svg?...` returns HTTP 200 `image/svg+xml` before
re-verification.

### P3 — First visit falsely announces an update

In a clean live browser context, first service-worker installation immediately
shows `A new edition is ready. Reload`. This is caused by treating the initial
`controllerchange` as an update. It is misleading (Reload has no new edition)
but does not prevent analysis or offline reload. Suppress the toast until a
pre-existing controller has actually been replaced.

### P3 — Expected missing-package 404 appears in the browser console

The UI handles a nonexistent package correctly and recovery succeeds, but
Chrome logs `Failed to load resource: the server responded with a status of
404` for that intentional npm response. Baseline loads and successful normal
analysis had no console/page errors. This is minor but means the negative-path
console is not clean.

## Required resolution

Restore the deployed Azure Function route and independently retest the actual
badge URL returned by the UI. The two P3 findings should also be corrected in
a follow-up, but the badge availability is the sole acceptance blocker.
