# Review 4 handoff

## Outcome

No product code was changed. Review 4 is **FAIL** with one P3 accessibility
finding at the live URL: activating “Skip to main content” changes the hash but
does not move keyboard focus into main. The detailed evidence is in
`.factory/review-4.md`.

The reviewed implementation is `1f80fe8`; the report/documentation revision is
`ef9756724e59270007f16e601d40679eb4173585`. Production JS and CSS exactly
match the clean candidate build.

## What passed

- Fresh desktop and phone first-read checks clearly established job, audience,
  and the sample action; phone overflow was zero.
- Demo, reset, exit, storage/network isolation, offline reload, real normal,
  invalid, missing-package recovery, large exports-map boundary, sharing, and
  legal/404 routes passed.
- All six declared claim commands, `npm test`, `npm run build`, full E2E,
  PWA-update, live, and production-audit checks passed from a clean clone.
- Live Axe scans found no serious or critical issues on Home, Demo, Privacy,
  Terms, or 404. The remaining keyboard focus defect is outside that severity
  threshold and must still be repaired.

## How to verify

From a clean clone:

    npm ci
    npm test
    npm run build
    npm run test:e2e
    npm run test:pwa-update
    npm run test:live
    npx playwright test e2e/claims.e2e.ts --project=desktop --grep @claim:sample-report
    npx playwright test e2e/claims.e2e.ts --project=desktop --grep @claim:demo-isolation
    npx playwright test e2e/claims.e2e.ts --project=desktop --grep @claim:offline-reload
    npx playwright test e2e/claims.e2e.ts --project=desktop --grep @claim:npm-direct
    npx playwright test e2e/claims.e2e.ts --project=desktop --grep @claim:no-account-analytics
    npx playwright test e2e/claims.e2e.ts --project=desktop --grep @claim:report-sharing

Also activate the first Tab-focused skip link with Enter and assert focus moves
to `#main` or its heading. Do this on the static 404 as well.

## Remaining work

Make the main target focusable and focus it after skip-link activation across
the app and static 404, then add and run a keyboard regression test. This was a
review-only change; no deployment, DNS, billing, or product behavior was
modified.
