# Review handoff — package-cost-explorer-review-1

Reviewed the deployed product without changing product code. The committed
review is `.factory/review-1.md`.

Verification run from a clean dependency install:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:live
```

All commands passed. Fresh Playwright checks also inspected the deployed site at
390 px and desktop, exercised a real `nanoid@5.1.5` report, checked offline
reload, crawled current anchors, and inspected `/demo`, legal routes, and an
unknown route.

Result: **FAIL**. Blocking gaps are the absent sample-data demo/sandbox, absent
`.factory/claims.json` and claim tests, a first screen that does not name its
audience, and an absent designed 404. The full evidence, copy audit, proposed
rewrites, and metadata/routing findings are in the review.
