# Package Cost Explorer — verification handoff

## Outcome: PASS

Independent QA passed for commit
`0c7113dc0a3f05fbd1e58478578d7f97fd6f092d` at
<https://package-cost-explorer.sociobot.in> on 2026-08-28. Production JS and
CSS SHA-256 values exactly match a clean build of this commit.

## Verified

- Clean installs at root and `api/`, root/API production dependency audits
  (0 vulnerabilities), all unit/contract tests, export-scale regression,
  TypeScript production build, Playwright E2E, PWA update/offline test, and
  clean-profile live test passed.
- Live `nanoid@5.1.5`, Node-only `fast-glob@3.3.3`, invalid-name, unavailable
  version, missing-package recovery, and large `date-fns@4.1.0` exports-map
  paths were exercised. The report includes per-entry and named-export costs,
  install/dependency facts, history, share URL, and safe per-report badge.
- Desktop and 390 px mobile visual/overflow checks, keyboard focus, reduced
  motion, axe serious/critical, console/page errors, privacy storage/request
  boundaries, security headers, caching, bundle budgets, Lighthouse, and PWA
  update/offline behavior passed.
- Lighthouse mobile production: Performance 100, Accessibility 100; FCP 1.2
  s, LCP 1.3 s, TBT 0 ms, CLS 0. Initial compressed JS/CSS are 26,883 B / 3,728
  B.

## How to reproduce

```sh
npm ci
npm ci --prefix api
npm test
npm run test:export-scale
npm run build
npm run test:e2e
npm run test:pwa-update
npm run test:live
npm audit --omit=dev
npm audit --prefix api --omit=dev
```

Install Playwright Chromium first if it is not already available:

```sh
npx playwright install chromium
```

Detailed exact evidence is in `.factory/verification-5.md`.

## Known limits

The product correctly labels the v1 measurement boundaries: figures are
browser-side estimates; CSS/assets, native/optional behavior, side effects,
shared app dependencies, and Node-only imports can change an application's
final result. No release defects were found.
