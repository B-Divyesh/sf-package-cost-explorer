# Package Cost Explorer

Package Cost Explorer measures npm install size and bundle size for each
package entry point. It is for frontend and Node developers choosing a
dependency.

Open the one-click sample at `/demo` or `/?demo=1`. The demo uses fixed
`date-fns@4.1.0` data, makes no npm request, and saves no report. Resetting the
demo clears only the reserved `demo:` storage namespace.

Real measurements contact npm directly. The site is free and uses no account,
analytics, tracking cookies, or saved reports. Its interface reloads offline
after the first visit. New package measurements still require npm.

A completed report includes installed size, production dependency count, and
compressed JavaScript size for each package entry point. It can copy a report
link and an SVG badge for the measured package. Figures are estimates, so
confirm important decisions in your own application build.

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/demo` for the sample report.

## Test and build

```sh
npm test
npm run test:claims
npm run test:e2e
npm run test:accessibility
npm run test:privacy
npm run test:offline
npm run build
npm audit --omit=dev
```

Playwright 1.58.2 uses the Chromium browser from
`$PLAYWRIGHT_BROWSERS_PATH`. Run `npx playwright install chromium` when that
browser is unavailable.

Every public promise is listed in `.factory/claims.json`. Each entry provides
one command that verifies the outcome from the demo entry point.

## Deploy

`npm run build` writes the static site to `dist/`. Deploy `dist/` and the
adjacent `api/` badge function as one Azure Static Web App. Do not deploy from
this repository by changing DNS or billing settings.

## Privacy, terms, and license

The product pages at `/privacy` and `/terms` explain data handling and estimate
limits. The project source uses the MIT license in `LICENSE`. Artwork provenance
is recorded in `.factory/design.md` and `assets/src/`.
