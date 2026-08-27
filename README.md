# Package Cost Explorer

Package Cost Explorer is an exports-aware npm package cost ledger for frontend and Node developers. Give it a package, dist-tag, exact version, or semver range and it reports:

- aggregate unpacked install footprint and root-package size;
- unique production dependencies, with direct-version resolution;
- every non-pattern public subpath in the package's `exports` map;
- minified, gzip, and Brotli JavaScript cost for selected entries;
- isolated tree-shaken cost for up to ten named exports;
- recent version-over-version unpacked-size history;
- a canonical share URL and downloadable, self-contained SVG badge.

All analysis runs in the browser. The app talks directly to the public npm registry, opens tarballs in memory, and loads esbuild-wasm only when an analysis begins. There is no lookup API, account, analytics, or package-query storage.

## Who it is for

Use it when choosing dependencies, checking whether a subpath is cheaper than a package's root entry, or spotting install-tree bloat before adding a dependency. It is a decision aid: always confirm critical numbers in the target application and bundler.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Create the exact deploy artifact with:

```sh
npm run build
```

The static site is written to `dist/`, with `dist/index.html` at its root.

## Verify

```sh
npm test          # deterministic unit and product-contract tests
npm run test:e2e # Chromium, axe, 390px layout, and a live nanoid analysis
npm audit
```

Playwright needs its browser once per machine: `npx playwright install chromium`. Regenerate the optimized AVIF/WebP hero derivatives from the committed source with `npm run assets`.

## How measurement works

The app requests compact package metadata from npm, resolves the requested tag/range, and downloads the chosen package tarball. Its complete `package.json` is read from the archive so `exports`, `browser`, `module`, and `main` stay authoritative. esbuild-wasm bundles selected entry points for an ES2020 browser target with tree-shaking and minification. Compression runs locally with fflate (gzip) and Brotli WASM. Production dependency counts are resolved recursively from registry metadata and deduplicated by name and version.

Peer dependencies and Node built-ins remain external and are named in the report. CSS, static assets, optional/native modules, wildcard exports, and side-effect analysis are outside v1. Total tarball downloads during one bundle run are capped at 50 MB; dependency counting is capped at 400 unique packages. These limits are surfaced in the interface.

## Deploy

Deploy `dist/` as an Azure Static Web App. `public/staticwebapp.config.json` supplies SPA fallbacks, security headers, CSP, and immutable asset caching. Infrastructure, DNS, and billing are intentionally outside this repository.

## Privacy and license

The `/privacy` and `/terms` routes explain the local-first data model and measurement limitations. Package registry requests are subject to npm's policies. Source code is MIT licensed; the generated hero artwork is original to this project and its prompt/provenance are recorded in `.factory/design.md` and `assets/src/`.
