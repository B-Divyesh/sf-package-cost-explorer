# Verification 7 handoff

## Result

**PASS — zero findings of every severity and zero untested public claims.**

- Live URL: <https://package-cost-explorer.sociobot.in>
- Implementation reviewed: `8486a159d26cf62bd69ddf320a25cf4473430d14`
- Documentation baseline: `2004c8d96d6814a6ff59ea0df3110faadabf916c`
- Full report: `.factory/verification-7.md`

No product code changed. This handoff and the verification report are the only
repository changes.

## What was verified

- Fresh 1440 × 900 desktop and 390 × 844 phone first screens state the job,
  audience, sample action, result, and three facts before scrolling.
- The one-click `date-fns@4.1.0` sample is populated, persistently labelled,
  resettable, isolated from real storage, and leaves to an empty real form.
- Empty, malformed, unavailable-version, missing-package recovery, normal,
  Node-import, cancellation, and full export-boundary paths pass.
- The live `date-fns@4.1.0` boundary completed in 137 seconds with 741 entry
  rows, 250 named imports, 14 history rows, and no error.
- All six exact declared claim commands pass individually. No unlisted or
  untested public claim remains.
- Keyboard, focus, scroll restoration, reduced motion, 200% zoom, 44 px phone
  targets, Axe, offline/update, legal pages, links, route titles, the deliberate
  404, badges, privacy requests, storage, and security headers pass.
- Live mobile Lighthouse scored 100 in Performance, Accessibility, Best
  Practices, and SEO. FCP was 1.1 s, LCP 1.2 s, TBT 60 ms, and CLS 0.
- Every earlier review and verification finding, including minor findings, is
  proved fixed in `.factory/verification-7.md`.

## Candidate match

The live build id is `mtpg9m3r`. A clean build from the documentation baseline
with that id matches live `index.html` and `sw.js` byte for byte. Live JS and
CSS also exactly match the implementation candidate:

- JS: `3a84105644b7255cdc92d6f904272556aba6e799936f4d9860eef67dec52a51d`
- CSS: `938495f881283cfe2e552a708805df7437efc24bf55730c90cdc13da1067a434`

## Clean-checkout commands

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run test:pwa-update
npm run test:accessibility
npm run test:privacy
npm run test:offline
npm run test:export-scale
npm run test:badge
npm run test:live
npm audit --omit=dev
npm audit --prefix api --omit=dev
```

All passed. `npm run build` produced `dist/index.html`; initial app JS is 80.03
kB / 28.82 kB gzip and CSS is 17.25 kB / 4.55 kB gzip.

## Evidence and remaining limits

Evidence is under `/work/.evidence/verification-7-live/` and
`/work/.evidence/verification-7-url/`.

Measurements remain estimates and require public npm availability. The stated
v1 exclusions for stylesheets, static assets, optional native modules, and
external package contracts remain. These are disclosed limits, not findings.
The stateless badge function has no tenant, database, health, restart-state, or
rate-limit surface. The product is free and has no billing or useful AI step.
