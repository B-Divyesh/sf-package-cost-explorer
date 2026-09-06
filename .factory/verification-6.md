# Independent verification 6 — PASS

**Date:** 6 September 2026  
**Live URL:** <https://package-cost-explorer.sociobot.in>  
**Implementation candidate:** `850a0275ea87e512d0867fe2b07b956e507ac9d0`  
**Documentation baseline:** `a754ff4f09446a900111e1dc38ac168fbbe3a7db`  
**Verdict:** **PASS**  
**Findings:** 0  
**Untested declared claims:** 0

The product compares installed size and bundle size for npm package entry
points. It is for frontend and Node developers choosing a dependency. The
first action, **Try it with sample data**, opens a completed, non-persistent
`date-fns@4.1.0` report.

## Candidate and deployment match

The implementation reviewed is `850a027`, the skip-link-focus repair.
`a754ff4` is documentation only. Live serves `assets/index-B0xoVm4O.js`, whose
SHA-256 is `04bb0a6351e2a6c789790e32aa9a4b992581c801961cd5867b76062c05bca548`.
It exactly matches the clean build of `850a027`.

## Clean checkout

A new checkout at `a754ff4` installed with `npm ci` and reported 0
vulnerabilities. These checks passed:

| Check | Result |
| --- | --- |
| `npm test` | 24 Vitest tests and 2 badge-worker contract tests passed. |
| `npm run build` | Passed; `dist/index.html` produced. App JS: 78.66 kB / 28.41 kB gzip. CSS: 16.72 kB / 4.43 kB gzip. |
| `npm run test:e2e` | 22 passed; 2 expected device-specific skips. |
| `npm run test:claims` | All 6 claim tests passed in a fresh desktop context. |
| `npm run test:pwa-update` | Passed. |
| `npm run test:accessibility` | 4 Axe-backed checks passed. |
| `npm run test:privacy` | Passed. |
| `npm run test:offline` | Passed. |
| `npm audit --omit=dev` and `npm audit --prefix api --omit=dev` | Both passed with 0 vulnerabilities. |
| `npm run test:export-scale` and `npm run test:badge` | Both passed. |

Every exact test command in `.factory/claims.json` was also run separately and
passed. The six tested outcomes are: populated sample report, demo isolation,
offline reload, npm-only browser measurement, no account/payment/tracking or
saved reports, and copied report link plus SVG badge. The copy audit links
public claims to those tests; no unlisted public claim was found on the landing
page, Privacy, Terms, or README.

## Fresh live browsers

Fresh 1440 × 900 desktop and 390 × 844 phone contexts opened at scroll position
zero. Both visibly state the job, audience, and first action before scrolling.
Phone horizontal overflow was zero. One click opened `/demo` with three
populated `date-fns` rows and the persistent “Demo — sample data, nothing is
saved” label. Reset announced “Sample reset.”, Start for real opened an empty
form, no `demo:` key remained after reset/exit, and no page console error
occurred.

The full real `date-fns@4.1.0` boundary flow completed with **741** entry rows
and no page or application console error. The live runtime test also passed
missing-package recovery to `nanoid@5.1.5`, a distinct query-aware SVG badge,
and manifest MIME validation.

| Live check | Result |
| --- | --- |
| Home, Demo, Privacy, Terms | HTTP 200, route-specific titles, one `h1`, one `main`, and no unexpected console error. |
| Unknown route | Deliberate HTTP 404 with a designed, usable page. Its navigation-level 404 console notice is expected, not an application defect. |
| Static `/404.html` | HTTP 200 with title, landmarks, and return links. |
| Keyboard/reduced motion | Skip link focuses `#main` on every route and static 404; the local regression proves next Tab stays in main. Reduced mode uses `scroll-behavior: auto`. |
| Live Axe | Home, Demo, Privacy, Terms, unknown-route 404, and static 404 have 0 serious or critical violations. |
| Security/privacy | Claim checks pass. CSP has `frame-ancestors 'none'`; X-Frame-Options, nosniff, referrer, and permissions headers are present. |
| PWA/links | Update and offline tests pass; robots, sitemap, manifest, legal routes, and demo return 200. |
| Lighthouse | Performance **100**, Accessibility **100**, FCP **1.1 s**, LCP **1.3 s**, CLS **0**, TBT **0 ms**. |

The stateless badge function has no tenant, persistence, or rate-limited tenant
surface. Tenant isolation, restart persistence, and 429/`Retry-After` checks do
not apply.

## Earlier findings disposition

| Earlier finding group | Current disposition |
| --- | --- |
| Review 1: first screen, demo, claims, 404, metadata, copy, offline feedback | Fixed; rechecked through fresh phone/desktop, routes, claims, and offline flow. |
| Review 2: real-npm/dependency claims, saved-report privacy, copy, phone fold, terminology, example actions | Fixed; rechecked through all claims, copy audit, and phone first screen. |
| Verification 1: exports scale, optional/native handling, badge, PWA update, errors, frame protection | Fixed; scale, worker, PWA, recovery, and header checks pass. |
| Verifications 2–4: deployed badge and manifest MIME | Fixed; live badge and manifest checks pass. |
| Review 4: skip link did not move focus | Fixed by `850a027`; live and local checks focus `#main`, including static 404. |
| Verification 5 / Repair 5 | PASS remains valid and was independently reproduced. |

## Result

**PASS — zero findings of every severity and zero untested declared claims.**
