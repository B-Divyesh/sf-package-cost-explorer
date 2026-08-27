# Package Cost Explorer — repair handoff

## Outcome

The production acceptance failure from `ecb960d372b2a68f7c67847753100f7a48a480b0`
has been repaired and deployed to the existing **Standard Azure Static Web
App**. The static app remains a static app; no container deployment was added.

- Production: <https://package-cost-explorer.sociobot.in>
- Azure Static Web App: `sf-package-cost-explorer` (Standard)
- Live UI-generated badge URL verified:
  <https://package-cost-explorer.sociobot.in/badge.svg?package=nanoid&version=5.1.5&gzip=473>
  returns **HTTP 200** with `content-type: image/svg+xml; charset=utf-8`.

## What changed

- Replaced the unavailable legacy Functions metadata path with the supported
  Azure Functions Node v4 programming model in `api/src/functions/badge.cjs`.
  The anonymous `badge` function stays attached to the Static Web App under
  `/api/badge`; `staticwebapp.config.json` continues to rewrite `/badge.svg`
  to it. `api/package-lock.json` makes the managed API dependency reproducible.
- Kept the existing safe SVG renderer and its escaping/unit tests. The API has
  no package lookup or persistence; it only renders values supplied in the
  badge URL.
- Fixed the service-worker update signal: a first controller acquisition no
  longer displays “A new edition is ready”; a real replacement controller
  still does. The PWA regression uses a new browser context and exercises both
  cases, then checks offline shell availability.
- Avoided Chrome’s expected missing-package 404 console error by confirming
  the exact public package name through npm’s successful search endpoint
  before requesting its packument. A normal, actionable missing-package error
  is still shown in the form. Dependency traversal remains best-effort.
- Added `npm run test:live`, which uses a clean Chromium context against
  production, asserts no first-install toast, tests missing-package recovery
  without a 404 console message, runs a real `nanoid@5.1.5` analysis, extracts
  the page-generated badge URL, and verifies that exact URL is SVG/200.
- Complete exports and named-export analysis were not capped or changed. The
  published `date-fns@4.1.0` regression still proves all 741 runtime entries.

## Verification run

From a clean dependency installation (`npm ci`; no production audit
vulnerabilities):

```sh
npm test                         # 7 files, 23 tests passed
npm run test:badge               # 2 SVG safety tests passed
npm run test:export-scale        # date-fns@4.1.0: 741 entries passed
npm run build                    # dist/ generated
npm run test:pwa-update          # first install, update, and offline passed
npm run test:e2e                 # 4 passed; 2 intentional project skips
npm run test:live                # live clean-profile + generated badge passed
```

The production deployment was made with the Static Web Apps CLI using both
`dist/` and `api/` (`--api-language node --api-version 20 --env production`).
The app bundle remains below the static first-load budget: initial JS is about
145 kB uncompressed (about 48 kB gzip) and CSS is 13.0 kB (3.7 kB gzip); the
large bundler/compression WASM files remain analysis-time loads.

## Known limits / next steps

- Measurements remain browser/esbuild estimates. Peer dependencies, Node
  built-ins, CSS, static assets, native modules, and application-specific
  shared dependencies are disclosed rather than silently included.
- Very large public export maps are deliberately complete and can take time;
  the existing 50 MB download and 400 dependency-traversal safety limits still
  apply and are communicated in the UI.
- The npm search confirmation is intentionally only for the user-entered
  package. It prevents expected typo noise without making dependency walking
  slower or less resilient.
