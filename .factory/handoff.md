# Repair 6 handoff

## Outcome

Repair 6 passes locally and at
<https://package-cost-explorer.sociobot.in>. All six Review 5 findings and both
untested public claims are resolved.

- Product implementation: `8486a159d26cf62bd69ddf320a25cf4473430d14`
- Claim and copy documentation after implementation:
  `8b2fddd96d06635cc7ca5f4002ecdfecf6039e98`
- Live build id: `8486a159d26cf62bd69ddf320a25cf4473430d14`
- Review repaired: `.factory/review-5.md`

This handoff is a later report-only change. The implementation SHA above is
the deployed product candidate.

## Findings resolved

1. The demo banner remains sticky at phone width. Its label, Reset demo, and
   Start for real controls remain inside the viewport while the report is
   scrolled.
2. A replacement measurement leaves the completed report visible. Cancelling
   it keeps that report and URL unchanged. A first cancellation instead says
   that no report was created.
3. Completed privacy flows now enforce a full product-origin/npm-origin request
   allowlist. The manifest no longer makes the broad “private” claim.
4. Every rendered phone interaction has a target of at least 44 × 44 CSS px,
   including examples, wordmark, legal links, footer links, and static 404
   links.
5. Each history entry records its scroll position. Back and Forward restore
   that position while the new route heading receives focus and is announced.
6. Legal, 404, and install labels use direct words. The copy audit now covers
   those surfaces as well as shared states and recovery text.

Outcome-based browser regressions cover each behavior. The npm fixture is
shared by the claim and cancellation suites instead of duplicating test data.

## Clean-checkout verification

A new checkout at `8b2fddd` was installed in
`/tmp/pce-repair6-clean-2m3xna/repo` with Node 22.23.2 and Playwright 1.58.2.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 0 vulnerabilities. |
| `npm test` | Pass; 24 Vitest tests and 2 badge-worker tests. |
| `npm run build` | Pass; `dist/index.html` produced. Initial app JS is 80.03 kB / 28.82 kB gzip. CSS is 17.25 kB / 4.55 kB gzip. |
| Six exact claim commands | Pass individually. |
| `npm run test:claims` | Pass; 6 claim outcomes. |
| `npm run test:e2e` | Pass; 28 browser tests and 6 expected device-specific skips. |
| `npm run test:pwa-update` | Pass; install, update, and updated offline shell. |
| `npm run test:accessibility` | Pass; 4 Axe-backed checks. |
| `npm run test:privacy` | Pass; 3 completed-flow checks with the request allowlist. |
| `npm run test:offline` | Pass. |
| `npm run test:export-scale` | Pass; 741 `date-fns@4.1.0` runtime entries. |
| `npm run test:badge` | Pass; 2 badge tests. |
| Root and API production audits | Pass; 0 vulnerabilities. |
| Factory URL verifier | Pass locally and live; no console error. |

Local mobile Lighthouse scored 100 Performance, 100 Accessibility, 100 Best
Practices, and 100 SEO. FCP was 1.1 s, LCP 1.6 s, TBT 30 ms, and CLS 0.

## Deployment and live verification

The implementation was pushed before deployment. The production build used
the implementation SHA as `BUILD_REVISION` and deployed `dist/` with the
adjacent stateless `api/` badge function to the existing production
`sf-package-cost-explorer` Static Web App. No DNS, billing, shared service,
staging slot, or unrelated resource changed. A deployment wrapper stalled
before upload while resolving settings; the same target was then deployed
successfully through its direct Static Web Apps deployment path. Temporary
local deployment credentials were removed without being read.

Live JavaScript and CSS exactly match the deployment build:

- `index-DZLiw5Gs.js` SHA-256:
  `3a84105644b7255cdc92d6f904272556aba6e799936f4d9860eef67dec52a51d`
- `index-OWC34uUI.css` SHA-256:
  `938495f881283cfe2e552a708805df7437efc24bf55730c90cdc13da1067a434`

Fresh 1440 × 900 and 390 × 844 profiles show the job, audience, sample action,
and three product facts before scrolling. Phone horizontal overflow is zero,
and neither profile logged a console or page error.

- The one-click sample shows `date-fns 4.1.0`, 21.73 MB installed size, zero
  production dependencies, and three populated entry rows.
- After scrolling to the entry report, the phone demo banner remains at
  `top: 0` and all three required banner elements remain in the viewport.
- Reset announces “Sample reset.”, preserves real local/session sentinels, and
  leaves no `demo:` key. Exit opens an empty real form. Demo traffic is
  same-origin only.
- Empty, malformed, missing-version, and missing-package errors are specific.
  Recovery reaches `nanoid@5.1.5` and its report-specific SVG badge.
- `fast-glob@3.3.3` identifies `stream`, `fs`, `os`, `path`, `events`, and
  `util` as outside the browser bundle.
- Both cancellation paths pass live. A replacement cancellation preserves the
  visible `nanoid 5.1.5` report, heading focus, and URL.
- The full live `date-fns@4.1.0` boundary completed in 148 seconds with 741
  entry rows, 250 named imports, 14 history rows, and no console, page, or
  request failure.
- Back restores `scrollY = 676` and heading focus. Forward restores the demo's
  prior zero position and heading focus.
- Offline demo reload keeps the sample and disables real measurement after
  exit. Reduced motion uses `scroll-behavior: auto` and 0.00001 s transitions.
- Live Axe scans found zero serious or critical findings on Home, Demo,
  Privacy, Terms, SPA 404, and static 404. Every visible phone interaction
  passed the 44 px target audit.
- Home, Demo, Privacy, Terms, static 404, robots, sitemap, and manifest return
  200. The designed unknown route deliberately returns HTTP 404. All discovered
  destinations work; its own skip link correctly keeps that expected 404.
- Security headers include HSTS, CSP with `frame-ancestors 'none'`,
  `X-Frame-Options: DENY`, nosniff, strict-origin referrer policy, and denied
  camera, microphone, and geolocation.
- Live mobile Lighthouse scored 100 in all four categories. FCP was 1.1 s, LCP
  1.2 s, TBT 40 ms, and CLS 0.

Evidence is in `/work/.evidence/repair-6-local/` and
`/work/.evidence/repair-6-live/`. The verb-first catalog description is 92
bytes and was copied to `/work/.evidence/catalog-description.txt`.

## Run and verify

Use Node.js 20 or newer:

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run test:pwa-update
npm run test:accessibility
npm run test:privacy
npm run test:offline
npm run test:live
npm audit --omit=dev
npm audit --prefix api --omit=dev
```

## Earlier findings and remaining limits

Review 1’s first-screen, demo, claims, 404, metadata, copy, and offline issues;
Review 2’s dependency/privacy, persistence, phone-fold, terminology, and
example issues; Verification 1’s scale, badge, PWA, optional-dependency, error,
and frame issues; Verifications 2–4’s deployed badge and manifest issues; and
Review 4’s skip-link issue all remain fixed and were rechecked here.

No repair finding or untested public claim remains. Measurements still depend
on public npm availability and remain estimates. The disclosed v1 exclusions
for stylesheets, static assets, optional native modules, and external package
contracts remain. The badge function is stateless and has no tenant,
persistence, health, or rate-limit surface, so backend tenant, restart, health,
and 429 checks do not apply. The product is free and has no billing offer. The
brief does not benefit from an AI step.
