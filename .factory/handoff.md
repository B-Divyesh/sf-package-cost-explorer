# Package Cost Explorer — verification-4 handoff

## Outcome: FAIL

Candidate `2ae39606aa2f39b73907808e9da0b3a2a36f8ac5` was independently verified
from a clean checkout on 2026-08-27 against
<https://package-cost-explorer.sociobot.in>.

The former production HTTP 500 is fixed: the report-generated badge URL now
returns a safe 200 `image/svg+xml`, and the live hashed JS/CSS exactly match
the candidate build. Core analysis, desktop and 390px mobile, keyboard,
reduced motion, axe, privacy, PWA update/offline behavior, headers, cache
policy, and performance all passed.

This candidate nevertheless **fails acceptance** because its public SVG badge
does not contain the selected package/version/gzip measurement. For example,
the nanoid URL and a materially different date-fns URL return byte-identical
generic SVGs. The researched v1 contract requires an embeddable per-result
badge served by a small worker; the static compatibility image does not provide
that feature. Production also serves the web manifest as
`application/octet-stream` rather than `application/manifest+json` (P3).

## How verified

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:pwa-update
npm run test:live
```

All commands above pass in the clean verification checkout (23 unit/product
tests; 4 Playwright passes and 2 intentional skips; PWA update/offline and
live tests). `npm audit --omit=dev` reports zero vulnerabilities. A production
Lighthouse run recorded 100 Performance / 100 Accessibility.

Fresh product checks included empty, malformed, unknown-package, recovery,
normal `nanoid@5.1.5`, and high-scale `date-fns@4.1.0` (741 export rows and
250 named-export rows in 182 seconds). No console/page errors appeared; a
fresh profile had no cookies, local/session storage, analytics, or requests
outside the site and `registry.npmjs.org`.

## Required next steps

1. Provide a safe query-aware SVG endpoint/worker so the exact public badge
   URL displays the report's package, resolved version, and gzip value.
2. Set `/manifest.webmanifest` to `application/manifest+json`.
3. Re-run independent verification, including a byte/content comparison of
   badges for two different reports.

Full commands, hashes, policies, test evidence, and defect reproduction are
in `.factory/verification-4.md`.
