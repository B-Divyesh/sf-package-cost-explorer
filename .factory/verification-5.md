# Independent verification 5 — PASS

**Verified 2026-08-28** from clean checkout commit
`0c7113dc0a3f05fbd1e58478578d7f97fd6f092d` against
<https://package-cost-explorer.sociobot.in>.

## Verdict

**PASS.** The deployed application asset hashes exactly match this candidate,
and the earlier deployment-only badge failure is no longer present for real
GET requests. The live site provides the brief's exports-aware, local browser
analysis, install/dependency report, history, sharing, and query-aware SVG
badge without console/page errors or tracking storage.

## Clean checkout and quality gates

Environment: Node 22.23.2, npm 10.9.8, Playwright 1.62.1 with its matching
Chromium installed. The checkout was clean before verification.

- `npm ci` passed; root and `api/` production audits both reported **0
  vulnerabilities**.
- `npm test` passed: **7 Vitest files / 23 tests**, plus **2** badge-worker
  Node contract tests.
- `npm run test:export-scale` passed.
- `npm run build` passed (`tsc --noEmit && vite build`) and produced `dist/`.
  There is no lint script or lint configuration in this repository.
- `npm run test:e2e` passed: **4 passed, 2 intentional project skips**. It
  checks desktop and 390 x 844 mobile, keyboard skip-link focus, axe
  serious/critical findings, real registry analysis, mobile overflow, legal
  routes, and badge escaping.
- `npm run test:pwa-update` passed: clean first install, service-worker update,
  and offline reload of the updated shell.
- `npm run test:live` passed from a clean profile: no false update toast,
  missing-package recovery without an expected 404 console error, a real
  `nanoid@5.1.5` report, distinct live report badges, and manifest MIME.

The first-page browser request set was HTML, 72,940 B JS, 12,978 B CSS, and
the 26,075 B mobile AVIF. The compressed JS/CSS are 26,883 B / 3,728 B
respectively, comfortably within the 200 kB JS and 50 kB CSS budgets. The
12.33 MB esbuild and 1.06 MB Brotli WASM are deferred until analysis.
Lighthouse mobile production scored **100 Performance** and **100
Accessibility**: FCP 1.2 s, LCP 1.3 s, Speed Index 1.2 s, TBT 0 ms, and CLS
0.

## Product, accessibility, and responsive evidence

- Normal case: live `nanoid@5.1.5` generated a complete report with 3 public
  entry rows, 5 isolated named-export rows, install/dependency facts, history,
  canonical `?q=nanoid%405.1.5` URL, and the report-specific badge. The
  browser console and page-error listeners remained empty.
- Boundary case: the live `date-fns@4.1.0` full exports-map analysis completed
  in a clean browser tab; the checked-in scale regression also passed and
  asserts expansion of every published runtime subpath rather than `.d.ts`
  declarations.
- Node-only path: `fast-glob@3.3.3` completed and visibly warned that
  `stream, fs, os, path, events, util` were external, rather than presenting a
  misleading complete browser bundle.
- Invalid input `not valid!` gave the specific npm-name guidance; unavailable
  `nanoid@9999` gave the specific no-matching-version guidance; both recovered
  to a successful report. Missing-package recovery is covered by the live
  script.
- Desktop visual inspection and 390 px capture show the product-specific
  broadsheet layout intact; mobile horizontal overflow was 0 px. The hero
  image decoded successfully at both sizes.
- Keyboard Tab reaches the skip link first; it has a computed solid 3 px cyan
  focus outline. There is one `h1`, `main`, `lang="en"`, document title,
  labelled form control, meaningful hero alt text, and `/privacy` and `/terms`
  each render one heading. Axe found no serious or critical violations.
- With reduced motion, transition/animation duration computes to 0.00001 s
  and document scrolling is `auto`.

## Live deployment, privacy, and policy evidence

- Production JavaScript SHA-256 is
  `4e3b0dd723f93ab67dbd56891d17994cb26cf644dd9ac3d76c59992f01f1069d`
  both locally and at `/assets/index-BHeWQPg0.js`; production CSS SHA-256 is
  `afb3072360e4e70cc0d878cd6bc5642129e0138fc76b25f0eb1192a649120d52`
  both locally and at `/assets/index-CuuKIdbr.css`. The timestamped HTML/SW
  build identifier is deployment-specific, while its app asset references are
  the candidate's exact files.
- The UI-generated
  `/badge.svg?package=nanoid&version=5.1.5&gzip=473` returns `200`,
  `image/svg+xml; charset=utf-8`, accessible `nanoid@5.1.5: 473 B gzip` SVG,
  `Cache-Control: public, max-age=300`, `default-src 'none'; sandbox`,
  `no-referrer`, and `nosniff`. A materially different date-fns request has a
  different SHA-256. Hostile XML/event-shaped input was escaped/defanged and
  contained neither a script element nor an event handler.
- `/manifest.webmanifest` returns `application/manifest+json`; hashed assets
  are immutable for one year, `sw.js` is no-cache/no-store, and HTML is
  revalidated after 30 seconds.
- Fresh-browser initial navigation contacted only the product origin. During
  actual analysis the only additional origin was `https://registry.npmjs.org`.
  No cookies, `localStorage`, or `sessionStorage` entries were created; only
  the documented versioned service-worker shell cache exists. No analytics,
  third-party fonts, scripts, or CDN assets were observed.
- HTTPS responses provide HSTS, a self-only CSP with npm-only `connect-src`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict-origin
  referrer policy, and a camera/microphone/geolocation-denying permissions
  policy.

## Defects

No release-blocking, major, or minor defects found. The Azure Function route
does not answer an HTTP `HEAD` badge request, but the required browser/API
contract is `GET`, which is healthy and fully verified; this is not a release
defect.
