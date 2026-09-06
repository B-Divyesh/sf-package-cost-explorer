# Review 5 handoff

## Outcome

Strict review 5 failed for
<https://package-cost-explorer.sociobot.in>.

- Verdict: **FAIL** — 6 findings and 2 untested public claims.
- Implementation reviewed: `850a0275ea87e512d0867fe2b07b956e507ac9d0`
- Documentation baseline: `254ae1eb6b2fc28033fb425d69053d4c7e60ef7f`
- Full report: `.factory/review-5.md`

No product code was changed. Production JavaScript and CSS hashes exactly
match the clean build of the implementation reviewed.

## Findings to repair

1. Keep the demo label, Reset demo, and Start for real available while a phone
   visitor scrolls through the report.
2. Keep the prior completed report visible after cancelling a replacement
   measurement, and make cancellation text accurate with no prior report.
3. Enforce an explicit request allowlist in the privacy claim test. Remove or
   list and test the manifest's broad “private” claim.
4. Give every phone interaction a 44 × 44 CSS px target, including example,
   wordmark, legal, and footer links.
5. Restore the previous scroll position on Back and Forward while preserving
   heading focus and announcement.
6. Replace “Policy desk,” “Misfiled package page,” and manifest “ledger” copy
   with direct labels, then include those surfaces in the copy audit.

## What passed

- Clean install, unit tests, production build, all six exact claim commands,
  combined claims, desktop/phone E2E, PWA update, accessibility, privacy,
  offline, live checks, root/API audits, badge tests, and the 741-entry scale
  regression passed.
- Fresh desktop and phone first screens clearly state the job, audience, and
  one-click sample action before scrolling.
- Sample population, reset, exit, real-storage isolation, offline reload,
  normal/invalid/version/missing-package recovery, `fast-glob` Node warnings,
  and the real 741-row `date-fns@4.1.0` boundary output were exercised.
- Live Axe found no serious or critical issue. Lighthouse scored 98
  Performance and 100 Accessibility (FCP/LCP 1.9 s, CLS 0, TBT 0 ms).
- Routes, direct HTTP 404 behavior, links, route titles, legal pages, badge
  escaping, manifest MIME, headers, and npm-only real measurement traffic
  passed.

## Run and verify

Use Node.js 20+ from a clean checkout:

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

Recheck the six findings with fresh 1440 × 900 and 390 × 844 contexts after
repair. Evidence from this review is under `/work/.evidence/review-5/`.
