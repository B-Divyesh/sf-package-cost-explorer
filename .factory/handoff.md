# Polish 2 handoff

## Outcome

The release repair is deployed. Product code was committed and pushed as
`e40f70dd23e7bbde28fdb72f9b5091688bcb9f4e` (`fix: close review two claim and
mobile gaps`) and is live at <https://package-cost-explorer.sociobot.in>.
The live HTML references `assets/index-B5uTgNIl.js`, the build produced by that
commit.

## What changed

- Added fixture-backed claim coverage for a completed direct npm measurement:
  search, packument, dependency metadata, tarball download, browser bundling,
  and a visible non-zero production-dependency count.
- Expanded the sample-report and privacy assertions to cover the report’s
  dependency field and prove completed reports are not persisted.
- Made first-screen metric terms consistent, removed the vague duration claim,
  placed all three facts above the 390 × 844 fold, and gave example buttons
  verb names.
- Kept demo mode memory-only with reset/exit controls; clarified storage copy.
- Completed the standalone server 404 shell with metadata, skip link,
  navigation, footer, and legal links.

## Verification

Fresh clone: `/tmp/pce-polish2-clean-kouxUH/repo` at `e40f70d`.

```text
npm ci: PASS (0 vulnerabilities)
npm test: PASS (24 Vitest tests + 2 badge-worker tests)
npm run build: PASS; dist/index.html produced
npm run test:pwa-update: PASS
npm run test:e2e: PASS (22 tests across desktop and 390 × 844 mobile)
```

Every `.factory/claims.json` command was run separately in that clean clone:
`sample-report`, `demo-isolation`, `offline-reload`, `npm-direct`,
`no-account-analytics`, and `report-sharing` all passed.

Additional local suite runs passed: `npm run test:accessibility` (4 Axe-backed
route tests), `npm run test:privacy` (3 completed-flow privacy tests), and
`npm run test:offline`.

Live post-deploy evidence is in `/tmp/pce-polish2-live/`:

- `verify-url.sh` passed: HTTP 200, title, `lang=en`, one h1, main landmark,
  all image alt attributes, no unlabeled buttons, and no console errors.
- Cold browser checks passed at `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`,
  and `/not-a-real-route`; the sample made no cross-origin request, and the
  three home facts ended at 575.7 px in a 390 × 844 viewport.
- Cold `curl` to `/not-a-real-route` returned HTTP 404 and the designed 404
  document. `/demo` and `/privacy` returned HTTP 200.
- Axe serious/critical checks passed on all live SPA routes; screenshots are
  `home-mobile.png`, `demo-mobile.png`, `404-mobile.png`, and the verifier’s
  `screenshot-desktop.png` / `screenshot-mobile.png`.
- Lighthouse mobile report: Performance 100, Accessibility 100, LCP 1,278 ms,
  CLS 0 (`/tmp/pce-polish2-live/lighthouse-mobile.json`).

## Remaining work

None. The product remains a Vite + TypeScript static web app deployed through
Azure Static Web Apps; no deployment, DNS, billing, or product defect is left
open.
