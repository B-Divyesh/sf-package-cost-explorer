# Package Cost Explorer — build handoff

> ## Independent verification status — FAIL (2026-08-27)
>
> Candidate `5641b64df16e3f25e241aa321682e8dcdb50eb61` and
> `https://package-cost-explorer.sociobot.in` were independently tested. The
> production application assets match that candidate, and build/unit/e2e/basic
> accessibility checks pass. This is nevertheless **not accepted**: the
> product cannot report all public/named exports for a package such as
> `date-fns@4.1.0` (741 entries, 4 automatic and 8 selectable results), lacks
> the specified worker-served embeddable SVG badge, and retains a stale PWA
> shell across ordinary app-only deployments. See
> [`.factory/verification.md`](verification.md) for exact commands, evidence,
> security/privacy observations, and severity-ranked defects.

## Deployment repair — 2026-08-27

The accepted static build could not deploy because this Azure subscription had
reached its Static Web Apps Free SKU site quota (ARM `51021`). The product was
not rebuilt or functionally changed. It is now deployed through the factory
Container Apps path at [https://package-cost-explorer.sociobot.in](https://package-cost-explorer.sociobot.in).

- Added a minimal multi-stage `Dockerfile`: Node 22 builds the existing Vite
  project, then `nginxinc/nginx-unprivileged` serves only `dist/` on port 8080
  as the `nginx` user.
- Added an Nginx SPA fallback for client routes while static paths return true
  404s; `/privacy` and `/terms` continue to work directly.
- HTML responses use `Cache-Control: no-store`; Vite content-hashed JS/CSS/WASM
  use one-year immutable caching; un-hashed static assets use a one-day cache;
  `sw.js` is always revalidated so PWA updates remain reliable.
- Reapplied the static host's CSP and security policy in the container, adding
  frame, opener, and resource isolation headers without loosening npm registry
  access required for browser-side analysis.
- Azure Container App: `sf-package-cost-explorer`, image
  `sociobotregistry.azurecr.io/sf-package-cost-explorer:c5a5b38e548d`
  (digest `sha256:6b5e29f9593a490420256409e542e48c29dff162598f6f8b23f9ca8fd82d61ad`).
  A managed certificate is issued and bound for the production hostname.

## What shipped

- A Vite + vanilla TypeScript static application implementing real, browser-only npm analysis.
- Package input supports unscoped/scoped names, exact versions, dist-tags, and semver ranges; canonical URLs auto-run the exact resolved version.
- Compact npm metadata resolution, 50 MB-capped tarball download, safe in-memory tar extraction, and authoritative `package.json` reading from the archive.
- Exports-aware browser/import/module/default resolution for explicit public subpaths, with legacy `module`/`browser`/`main` fallback.
- Lazy esbuild-wasm bundle analysis with ES2020 browser output, minification, gzip, Brotli, selectable entry points, and up to ten isolated named-export measurements.
- Aggregate production install footprint, unique transitive count, direct dependency versions, and a 400-package safety cap.
- Recent published unpacked-size chart with an accessible table alternative.
- Node built-in and peer dependency detection, plus visible limitations/warnings rather than false standalone totals.
- Shareable result URLs and downloadable, self-contained SVG snapshot badges.
- Offline shell/service worker, loading/cancel/error/offline/empty states, keyboard paths, reduced-motion handling, and 390px responsive layout.
- `/privacy` and `/terms` routes, PWA manifest, favicon, robots/sitemap, CSP/security/cache rules for Azure Static Web Apps.
- Original generated hero artwork with AVIF/WebP responsive derivatives. Prompt and provenance are in `.factory/design.md` and `assets/src/`.
- A container deployment path with non-root Nginx, production cache policy,
  security headers, and SPA routing for the factory Container Apps fallback.

## Run and verify

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Build output is exactly `dist/`, with `dist/index.html` at its root.

Build and run the production container where Docker is available:

```sh
docker build -t package-cost-explorer .
docker run --rm -p 8080:8080 package-cost-explorer
```

Verification completed 2026-08-27:

- `npm test`: 5 files, 14 tests passed.
- `npm run test:e2e`: 4 passed, 2 intentional cross-project skips; includes a real `nanoid@5.1.5` registry/tarball/esbuild run, desktop/mobile checks, and axe serious/critical audit.
- `npm audit`: 0 vulnerabilities.
- Factory `verify-url.sh`: HTTP 200, 611 ms load, no page/console errors, title/lang/main present, one H1, 0 images missing alt, 0 unlabeled buttons.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 0 ms, initial transfer 57 KiB.
- Initial app JS: 69.08 kB uncompressed / 25.99 kB gzip; CSS: 12.54 kB / 3.60 kB gzip. The 12.3 MB esbuild and 1.06 MB Brotli WASM assets are lazy-loaded only after analysis begins.
- Mobile hero: 28 kB AVIF / 48 kB WebP; large hero: 108 kB AVIF / 180 kB WebP.

Deployment-repair verification completed 2026-08-27:

- `npm test`: 5 files / 14 tests passed; `npm run build`: passed and wrote
  `dist/`; `npm run test:e2e`: 4 passed with 2 intentional cross-project
  skips; `npm audit --omit=dev`: 0 vulnerabilities.
- The worker image has no Docker/Podman runtime, so a local container could not
  be started. The exact ACR-built image instead passed `nginx -t`, then served
  `GET /` successfully from inside its healthy Azure Container App replica.
- Factory `verify-url.sh https://package-cost-explorer.sociobot.in`: HTTPS 200,
  618 ms page load, no page or console errors, title/lang/main present, one
  H1, and no missing image alt text or unlabeled buttons.
- Production header checks confirm `no-store` on `/` and `/privacy`,
  no-cache/no-store service-worker updates, one-year immutable caching on a
  content-hashed Vite JS asset, security headers on all responses, and a true
  404 for a missing static asset.
- Production Playwright checks at 1366px and 390px found no console errors,
  exactly one H1 and a main landmark on the home and mobile privacy routes, a
  skip link, and zero horizontal overflow on mobile.

## Known gaps and honest deviations

- CSS/static asset cost, optional/native modules, wildcard exports, local uploads, Deno/JSR, and side-effect analysis are intentionally outside v1 per the brief.
- Peer dependencies and Node built-ins remain external; the report names them and flags likely Node-only paths. A consumer's aliases, target, and already-shared dependencies can change actual app cost.
- Registry manifests with non-semver/git dependency references fall back to the package's latest dist-tag when npm semver resolution is impossible.
- The static deployment cannot serve a query-dependent SVG from a server worker without adding infrastructure. V1 therefore generates a downloadable, self-contained SVG badge locally (no tracking or runtime dependency). A future factory-managed edge worker can add stable remote badge URLs.
- The service worker caches the shell and visited static assets, not registry data or tarballs. Opening the interface offline works; new analysis correctly asks the user to reconnect.

## Next steps

- Add the accuracy corpus for the 50 most-downloaded packages and compare against pinned local Vite builds to quantify the stated ±5% target.
- Add npm alias/workspace-protocol resolution and pattern-export selection.
- If factory infrastructure authorizes it, deploy a minimal badge edge worker using the same measurement schema.
