# Package Cost Explorer — perfection-loop round 1 handoff

## Outcome

All BLOCKING findings in `.factory/review-1.md` are resolved in repair commit
`621ff8e36df124208cc8da6fcb1c0d48acab5b18`. The product remains a Vite and
TypeScript static web artifact with its existing Azure badge function and
monochrome broadsheet visual system.

## What changed

- Rewrote the first screen to name npm, frontend and Node developers, installed
  size, bundle size, and the result of each action.
- Added one-click `/demo` and `/?demo=1` routes with a completed
  `date-fns@4.1.0` report, a persistent sandbox banner, **Reset demo**, and
  **Start for real**. Demo state is memory-only; reset touches only `demo:`
  keys.
- Added `.factory/claims.json` with six claims and exactly one tagged browser
  test per claim. Added `.factory/demo.md` and `.factory/copy-audit.md`.
- Added History API navigation, back-button restoration, route announcements,
  heading focus, route-specific titles/descriptions/canonicals, header and
  footer navigation, a designed SPA 404, a host-level `404.html`, and an Azure
  404 response override.
- Added Open Graph and Twitter metadata, a 1200×630 product-art social card, an
  apple-touch icon, and `/demo` in the sitemap.
- Reworked phone navigation, demo controls, report tables, action stacking, and
  404 layout for 390 px. Fixed all serious and critical axe findings.
- Changed the service worker to cache every application chunk and serve the
  versioned shell cache-first on navigation. Offline reload now renders the
  full interface, shows the offline state, and disables new measurements.
- Rewrote the README and legal pages in plain words, pinned Playwright 1.58.2,
  and updated `.factory/catalog-description.txt` to a 74-character verb-first
  sentence.

## Verification evidence

Verified on 28 August 2026 with Node 22.23.2.

- Clean clone `/tmp/package-cost-clean-ivLTih`: `npm ci` passed. Every command
  listed in `.factory/claims.json` was run separately; all six passed. `npm
  test` passed 24 Vitest tests plus two badge-worker tests. `npm run build`
  passed and produced `dist/index.html`.
- `npm run test:e2e`: 20 passed across desktop Chromium and 390×844 mobile;
  two expected skips avoid repeating the same live npm measurement on mobile.
- `npm run test:accessibility`: four passed. Axe found no serious or critical
  issue on home, demo, Privacy, Terms, or the designed 404.
- `npm run test:privacy`: three passed for demo storage isolation, direct npm
  routing, and the absence of accounts, trackers, cookies, or payment calls.
- `npm run test:offline`: passed. `npm run test:pwa-update`: passed first
  install, version replacement, and offline shell reload.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo /tmp/pce-verify`:
  HTTP 200, title `Demo — Package Cost Explorer`, `lang=en`, one h1, one main,
  no missing alt text, no unlabeled buttons, and no console errors.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, FCP 1.2 s,
  LCP 1.6 s, CLS 0, and TBT 60 ms.
- Production build: initial application JS 78.63 kB / 28.45 kB gzip; CSS
  16.52 kB / 4.38 kB gzip. The large analysis WASM files remain lazy-loaded.
- `npm audit --omit=dev` and `npm audit --omit=dev --prefix api`: zero
  vulnerabilities.

## Run and verify

```sh
npm ci
npm test
npm run test:claims
npm run test:e2e
npm run test:accessibility
npm run test:privacy
npm run test:offline
npm run test:pwa-update
npm run build
```

## Deployment

Factory static deployment `6896384f-75ca-453b-9d1a-ab584c6de207` succeeded at
`https://package-cost-explorer.sociobot.in` with build revision
`9e80821f3fc652ad57125750549041c4d0cf53cd`.

Post-deploy checks found:

- HTTP 200 for `/`, `/demo`, `/privacy`, `/terms`, the social card, and the
  apple-touch icon; HTTP 404 for `/not-a-real-route`.
- CSP, `X-Content-Type-Options`, and `Referrer-Policy` headers on production.
- The factory URL verifier passed `/demo` with no console errors, one h1, one
  main, `lang=en`, complete image alt text, and labelled buttons.
- `npm run test:live` passed a clean service-worker install, missing-package
  handling, a real `nanoid@5.1.5` measurement, its 473 B gzip badge, and the
  manifest MIME check.

## Known gaps

No blocking review finding remains. Package figures are estimates and can differ
from an application build; the product and Terms page state this boundary.
