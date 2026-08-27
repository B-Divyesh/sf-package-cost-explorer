# Package Cost Explorer — repair handoff

## Outcome: PASS

This repair addresses every release-blocking finding from independent
verification-4 for candidate `2ae39606aa2f39b73907808e9da0b3a2a36f8ac5`.
Production is https://package-cost-explorer.sociobot.in and is deployed from
repair commits `f41e835d148744297f1e30ac8a6aa98f39b0825c` and
`06be4769de680ea3188e0fd17488a6a36b5f5e9f`.

## What changed

- Restored the small Azure Static Web Apps Node v4 badge worker and routed the
  public `/badge.svg` URL to it. It returns an accessible, query-aware SVG
  containing the requested package, version, and gzip value. XML-invalid
  characters are removed, all XML text is escaped, event-attribute-shaped
  input is defanged, malformed sizes are labelled unavailable, and the output
  is length-bounded.
- Removed the query-blind static compatibility SVG. Local Vite dev/preview
  uses the same worker renderer, so browser tests exercise the actual response
  contract instead of a stand-in.
- Set `.webmanifest` to `application/manifest+json` in the SWA configuration.
- Added a strict badge response policy (`default-src 'none'; sandbox`,
  `no-referrer`, `nosniff`), a five-minute public response cache, and excluded
  dynamic badge URLs from service-worker cache writes.
- Added exact regressions: worker tests compare two materially different
  reports, assert the package/version/gzip content and headers, and send hostile
  query text; the browser flow validates the rendered report badge and hostile
  route; the live check validates two distinct production badges and manifest
  MIME.

The package-analysis job remains entirely browser-side. The managed worker only
renders an already-supplied badge label; it receives no registry credentials,
does not query npm, store reports, or set cookies.

## Verification evidence

Completed from clean installs on 2026-08-27 (Node 22.23.2):

```sh
npm ci
npm ci --prefix api
npm test
npm run build
npm run test:pwa-update
npm run test:e2e
npm run test:live
npm audit --omit=dev
```

- `npm test`: 7 Vitest files / 23 tests plus 2 Node worker-contract tests,
  all passed.
- `npm run build`: TypeScript check and Vite production build passed; `dist/`
  has `index.html` at its root. Initial app JS is 72.94 kB (27.05 kB gzip) and
  CSS is 12.98 kB (3.71 kB gzip), within the static budgets. esbuild/Brotli
  WASM remain analysis-time assets.
- `npm run test:e2e`: 4 passed, 2 intentional project skips. It covers desktop
  and 390×844 mobile, keyboard skip-link focus, axe serious/critical findings,
  report generation, per-report/hardened badges, mobile overflow, and legal
  routes.
- `npm run test:pwa-update`: passed first install, replacement update, and
  offline reload; dynamic badge reports are not written into the SW cache.
- `npm run test:live`: passed in a clean profile against production, covering
  missing-package recovery, real `nanoid@5.1.5` analysis, exact report badge,
  distinct `date-fns@4.1.0` badge, and manifest MIME.
- `npm audit --omit=dev`: 0 vulnerabilities. There is no lint script or lint
  configuration in this repository; `tsc --noEmit` is part of `npm run build`.
- Production policy checks: `/badge.svg?package=nanoid&version=5.1.5&gzip=473`
  returns `200 image/svg+xml; charset=utf-8` and visibly contains
  `nanoid@5.1.5: 473 B gzip`; the materially different date-fns response has a
  different SHA-256. Hostile text returns escaped inert text with no script or
  event-handler markup. `/manifest.webmanifest` returns
  `application/manifest+json`.
- Fresh 390px production browser check: no cookies, localStorage, or
  sessionStorage; initial requests stayed on the product origin; 0px horizontal
  overflow; `lang=en`, one `<main>`, and one `<h1>`.
- Lighthouse mobile production run: **100 Performance**, **100 Accessibility**;
  FCP 1.3 s, LCP 1.4 s, CLS 0, TBT 40 ms.

## Deployment

Deployed to the existing Standard Azure Static Web App without changing the
artifact/deployment class:

```sh
BUILD_REVISION=06be4769de680ea3188e0fd17488a6a36b5f5e9f npm run build
swa deploy dist --api-location api --api-language node --api-version 22 \
  --app-name sf-package-cost-explorer --resource-group sociobot \
  --env production --swa-config-location dist --no-use-keychain
```

The live HTML reports build identifier `06be4769de680ea3188e0fd17488a6a36b5f5e9f`.

## Known limits

- Bundle and install figures remain browser-side estimates; native/optional
  dependencies, CSS/assets, shared app dependencies, and Node-only imports are
  disclosed by the product rather than silently counted.
- Azure managed API activation briefly returns 404 while a new SWA API revision
  propagates; the final deployed route was rechecked after activation and is
  healthy.
