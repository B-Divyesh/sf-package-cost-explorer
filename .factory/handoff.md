# Package Cost Explorer — repair handoff

## Delivered 2026-08-27

Repair commit: `3a6057eb9b14e17d3de1128234a2f4ee84514414`.

The application is now deployed to the **Standard-tier Azure Static Web App**
`sf-package-cost-explorer`:

- Production: <https://package-cost-explorer.sociobot.in>
- Azure hostname: <https://happy-bay-0a03b730f.7.azurestaticapps.net>
- SKU verified with `az staticwebapp show`: `Standard`.

The obsolete Container Apps/ACR fallback has been removed from this repository;
there was no host ACR build.

## Repairs

- The exports resolver follows browser/import/default runtime conditions
  correctly, never selects nested `types` declarations, lists every explicit
  public subpath, and expands pattern exports from the downloaded archive.
  `date-fns@4.1.0` is regression-tested against npm at exactly **741** concrete
  public entries, including `./add → ./add.js`.
- The analysis workflow measures every public entry rather than sampling four;
  it also rebuilds every statically discoverable named export rather than
  limiting the report to ten. Reruns merge into the complete report instead of
  replacing it. Large packages can take noticeably longer, and progress names
  the current entry truthfully.
- `/badge.svg?package=…&version=…&gzip=…` is an anonymous Azure Functions
  worker route behind Static Web Apps. It returns an escaped, self-contained
  `image/svg+xml` badge suitable for `<img>` embedding. The UI copies a stable
  embed snippet and exposes the SVG URL. The URL carries the local measurement;
  it does not send a package lookup to an application server.
- Vite now emits a build-revisioned `sw.js` cache name and a versioned PWA
  start URL. It precaches the complete initial shell, uses network-first
  navigation (offline falls back to the cached shell), runs `skipWaiting` and
  `clientsClaim`, bypasses the HTTP cache for worker update checks, and exposes
  a reload toast when an update takes control.
- Dependency footprint now includes optional dependencies and labels a
  cap-truncated total as a minimum. CSP now disallows framing and the Static
  Web Apps headers include `X-Frame-Options: DENY`.

## Run and verify

```sh
npm ci
npm test
npm run test:export-scale
npm run test:badge
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:pwa-update
```

The app build is `dist/`; the badge worker source is `api/`. Deploy with the
Azure Static Web Apps CLI using the production deployment token and both
locations (the deployment already completed for this handoff):

```sh
swa deploy dist --api-location api --api-language node --api-version 20 --env production
```

## Verification completed

- Clean `npm ci`: passed; `npm audit`: **0 vulnerabilities**.
- `npm test`: **7 files, 22 tests passed**. This includes the real
  `date-fns@4.1.0` 741-export regression, archive pattern expansion,
  no-`types` runtime resolution, optional dependency accounting, generated
  worker badge safety, and product-contract checks.
- `npm run test:export-scale`: passed (published `date-fns@4.1.0`, 741).
- `npm run test:badge`: passed (2 worker SVG/escaping tests).
- `npm run build`: passed and produced `dist/` with generated revisioned
  `sw.js` and versioned manifest. Initial JavaScript is about 138 kB
  uncompressed / 45 kB gzip; CSS is 13.0 kB / 3.7 kB gzip. esbuild/Brotli WASM
  remains lazy after a user starts analysis.
- `npm run test:pwa-update`: passed. It creates two ordinary app-only builds,
  registers the first, serves the second without a special worker edit,
  reloads into the new shell, then confirms the updated shell offline.
- `npm run test:e2e`: **4 passed, 2 mobile/desktop duplicate workflow skips**;
  includes axe serious/critical coverage, keyboard skip link, responsive legal
  page, and a real npm/tarball/esbuild `nanoid@5.1.5` analysis.
- Live production check: HTTP 200 home, generated worker SVG 200 for
  `date-fns@4.1.0&gzip=1536`, `sw.js` is `no-cache, no-store`, frame protection
  is present, and a live Playwright analysis of `nanoid@5.1.5` rendered three
  rows and a 200 SVG badge. Live axe had **0** serious/critical issues, one
  `<h1>`, one `<main>`, and no console errors.

## Known limits

- Bundle totals are browser/esbuild estimates; peer dependencies, Node
  built-ins, CSS, static assets, and native modules are disclosed rather than
  silently included.
- Full reports for packages with hundreds of entry or named exports are
  deliberately complete and may take time or meet the existing 50 MB download
  safety ceiling. The UI reports this rather than sampling a misleading subset.
- Registry and tarball requests still go directly from the visitor to npm, as
  described in `/privacy`; the badge worker only renders the figures supplied
  in its URL and keeps no data.
