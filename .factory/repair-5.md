# Repair 5 verification report

**Date:** 6 September 2026  
**Live URL:** <https://package-cost-explorer.sociobot.in>  
**Implementation SHA:** `850a0275ea87e512d0867fe2b07b956e507ac9d0`  
**Result:** PASS — no open review finding or untested declared claim

## Repair

Review 4 found that the skip link changed the fragment to `#main` without
moving keyboard focus past the header. Every app route and the standalone 404
now renders a programmatically focusable main landmark. A Playwright regression
activates the skip link with Enter on Home, Demo, Privacy, Terms, the SPA 404,
and the static 404. It asserts that focus reaches `#main` and that the next Tab
stays inside main content.

No product copy, claim, storage behavior, measurement logic, visual asset, paid
offer, or product scope changed.

## Clean-checkout verification

The clean clone was `/tmp/pce-repair5-clean-LamUDN/repo` at the implementation
SHA. `npm ci` completed with zero reported vulnerabilities.

| Check | Result |
| --- | --- |
| `npm test` | Pass — 24 Vitest tests and 2 badge-worker contract tests. |
| `npm run build` | Pass — `dist/index.html` produced. Initial app JS: 78.66 kB / 28.41 kB gzip. CSS: 16.72 kB / 4.43 kB gzip. |
| `npm run test:e2e` | Pass — 22 passed across desktop and 390 × 844 phone; 2 expected device skips. |
| `npm run test:pwa-update` | Pass — install, update, and updated offline shell. |
| `npm run test:accessibility` | Pass — 4 Axe-backed route checks. |
| `npm run test:privacy` | Pass — 3 completed-flow privacy checks. |
| `npm run test:offline` | Pass — offline demo reload and blocked real measurement. |
| `npm audit --omit=dev` | Pass — 0 vulnerabilities. |
| `npm audit --prefix api --omit=dev` | Pass — 0 vulnerabilities. |
| Factory URL verifier | Pass locally and live — title, `lang=en`, one h1, one main, alt text, labelled controls, and no console errors. |

Every command in `.factory/claims.json` was run separately from that clean
checkout and passed:

| Claim | Result |
| --- | --- |
| `sample-report` | Pass — installed size, dependency count, three sample entry points, and bundle values. |
| `demo-isolation` | Pass — no npm request or demo persistence; real storage sentinels survive reset and exit. |
| `offline-reload` | Pass — the sample reloads offline and real measurement is disabled. |
| `npm-direct` | Pass — npm metadata, dependency, tarball, and browser measurement complete without an analysis API. |
| `no-account-analytics` | Pass — no account/payment UI, trackers, cookies, saved report, database, or report cache. |
| `report-sharing` | Pass — copied link and SVG identify the measured sample. |

## Deployment and live checks

The implementation was pushed before deployment. It was built with
`BUILD_REVISION=850a0275ea87e512d0867fe2b07b956e507ac9d0` and deployed through the
existing production `sf-package-cost-explorer` Azure Static Web App with its
adjacent `api/` badge function. DNS, billing, shared services, and unrelated
resources were not changed. The deployment CLI's temporary local credential
cache was removed without being read.

The live HTML reports the implementation SHA and loads
`assets/index-B0xoVm4O.js`. Its SHA-256 is
`04bb0a6351e2a6c789790e32aa9a4b992581c801961cd5867b76062c05bca548`,
which exactly matches the deployed build. The live CSS also matches.

- Fresh 1440 × 900 and 390 × 844 profiles state the job, audience, and sample
  action before scrolling. The last phone fact ends at 575.69 px; horizontal
  overflow is 0 px.
- The keyboard skip action focuses main on the app and the host-level 404. The
  next Tab remains in main content.
- The one-click sample shows `date-fns@4.1.0`, 21.73 MB, three populated entry
  rows, and the persistent “Demo — sample data, nothing is saved” label. Reset
  announces completion. Exit opens an empty real form. A real-storage sentinel
  remains unchanged, and the sample contacts only the product origin.
- Invalid `not valid!` input shows npm-name guidance. The production live check
  also covers a missing package followed by recovery to `nanoid@5.1.5`, its
  completed report, and its query-aware SVG badge.
- The real boundary run for `date-fns@4.1.0` completed with all 741 package
  entry rows and no console or page error.
- Home, Demo, Privacy, Terms, robots, sitemap, and manifest return 200. An
  unknown route deliberately returns 404 with the designed page. The manifest
  MIME is `application/manifest+json`.
- Live Axe scans on Home, Demo, Privacy, Terms, and 404 found zero serious or
  critical findings. Reduced motion uses `scroll-behavior: auto` and a
  0.00001-second transition.
- Lighthouse mobile: Performance 99, Accessibility 100, FCP 1.71 s, LCP
  1.71 s, CLS 0, and TBT 0 ms.
- `npm run test:live` passed against production. The badge GET returns 200
  `image/svg+xml`; its package, version, and gzip value match the report.

Screenshots, the browser audit JSON, Lighthouse JSON, and URL-verifier output
are under `/work/.evidence/repair-5-live`, `/work/.evidence/repair-5-local`, and
`/work/.evidence/repair-5-url`. The verb-first 91-character catalog description
was copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings

| History | Current disposition |
| --- | --- |
| Review 1: first screen, demo, claims, 404, metadata, copy, offline state | Fixed and rechecked through cold phone/desktop, claim, route, and offline tests. |
| Review 2: dependency claim, npm flow, persistence, wording, phone fold | Fixed and rechecked through all six claims and live first-screen checks. |
| Verification 1: complete exports, badge, PWA update, optional dependencies, errors, frame protection | Fixed; scale, worker, PWA, registry, live recovery, CSP, and frame headers pass. |
| Verification 2–4: deployed badge behavior and manifest MIME | Fixed; live report badge and manifest checks pass. |
| Verification 5 and Review 3 | Their PASS results remain valid. |
| Review 4: skip-link focus | Fixed by this implementation and rechecked locally and live on every route form. |

## Remaining limits

No repair finding remains. Measurements are estimates and still depend on
public npm availability. The disclosed v1 exclusions for stylesheets, static
assets, optional native modules, and external package contracts remain. The
stateless badge function has no tenant or persisted product state, so backend
tenant-isolation, restart-persistence, and 429 checks do not apply. The product
is free and has no billing offer to register.
