# Repair 5 handoff

## Outcome

Repair 5 is complete and deployed at
<https://package-cost-explorer.sociobot.in>. The review 4 skip-link finding is
fixed, every declared claim passes, and no earlier finding is open.

- Deployed implementation: `850a0275ea87e512d0867fe2b07b956e507ac9d0`
- Verification documentation: `dfed093affdf6576cf9fc1a614177e0e8eb4e354`
- Full evidence report: `.factory/repair-5.md`

This handoff is a later documentation-only change. The live HTML exposes the
implementation SHA above, and its JavaScript and CSS hashes match that build.

## What changed

- Made the `#main` landmark focusable on Home, Demo, Privacy, Terms, the SPA
  not-found state, and the standalone 404.
- Added an outcome-based Playwright regression that activates the skip link
  with Enter, checks that focus reaches main, and checks that the next Tab does
  not return to repeated header navigation.
- Preserved the report, demo sandbox, claims, privacy behavior, visual system,
  worker-backed badge, and service-worker update path.

## Verification

From clean clone `/tmp/pce-repair5-clean-LamUDN/repo`:

```text
npm ci: PASS; 0 vulnerabilities
npm test: PASS; 24 Vitest tests and 2 badge-worker tests
npm run build: PASS; dist/index.html produced
npm run test:e2e: PASS; 22 passed, 2 expected device skips
npm run test:pwa-update: PASS
npm run test:accessibility: PASS; 4 Axe-backed checks
npm run test:privacy: PASS; 3 checks
npm run test:offline: PASS
npm audit --omit=dev: PASS; 0 vulnerabilities
npm audit --prefix api --omit=dev: PASS; 0 vulnerabilities
```

All six `.factory/claims.json` commands were also run separately and passed:
`sample-report`, `demo-isolation`, `offline-reload`, `npm-direct`,
`no-account-analytics`, and `report-sharing`.

Live checks passed for fresh desktop and 390 × 844 phone profiles, the
one-click sample, reset, exit, real-storage isolation, invalid input,
missing-package recovery, `nanoid@5.1.5`, the 741-entry `date-fns@4.1.0`
boundary, route titles, legal pages, deliberate 404, reduced motion, privacy,
badge GET, manifest MIME, and offline/update behavior. Live Axe found zero
serious or critical findings. The factory URL verifier found no console or
structure error.

Lighthouse mobile scored 99 Performance and 100 Accessibility, with FCP and
LCP at 1.71 seconds, CLS 0, and TBT 0 ms. Initial app JS is 78.66 kB / 28.41 kB
gzip; CSS is 16.72 kB / 4.43 kB gzip.

Evidence is under `/work/.evidence/repair-5-live`,
`/work/.evidence/repair-5-local`, and `/work/.evidence/repair-5-url`.
`.factory/catalog-description.txt` is verb-first and under 120 characters; an
identical copy is at `/work/.evidence/catalog-description.txt`.

## Deploy again

```sh
BUILD_REVISION=<implementation-sha> npm run build
swa deploy dist --api-location api --api-language node --api-version 22 \
  --app-name sf-package-cost-explorer --resource-group sociobot \
  --env production --swa-config-location dist --no-use-keychain
```

This uses the existing production Static Web App and adjacent stateless badge
function. Do not change DNS, billing, or unrelated resources.

## Remaining limits

No repair work remains. Measurements still depend on public npm and retain the
plainly disclosed v1 exclusions for stylesheets, static assets, optional native
modules, and external package contracts. The product is free; no billing offer
or billing metadata is required.
