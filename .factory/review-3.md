# Adversarial first-read review 3

**Product:** Package Cost Explorer  
**Reviewed:** 2026-08-28  
**Revision:** 9d67a9ce17a035333fc601528a2a45df107b14f4  
**Verdict:** **PASS**

This was a new cold-browser review, not a diff review. There are zero findings
of any severity and no untested declared claim.

## First screen

Fresh Chromium contexts at 390 × 844 and 1440 × 900, with no prior site data,
made the job, audience, and first action clear before scrolling.

| Question | Answer understood | Exact supporting copy |
| --- | --- | --- |
| What does it do? | Compares npm package installed and entry-point bundle sizes before adding a dependency. | “Compare npm package costs before you install.” |
| For whom? | Frontend and Node developers choosing a dependency. | “For frontend and Node developers choosing a dependency, see installed size and each entry point’s bundle size.” |
| First click? | Open the completed sample report. | “Try it with sample data” / “Open a completed package report.” |

At 390 px, the primary action was 48 px high, the page had no horizontal
overflow, and all three facts ended at 575.7 px, above the 844 px fold. The
initial load had no console errors or cross-origin request.

## Copy audit

Whitespace-delimited word counts are below. This includes the user-facing
status, heading, control, navigation, footer, and image-alt copy. No row exceeds
22 words, contains a banned marketing adjective, uses inconsistent metrics,
has a context-free heading, or exposes a non-result-naming action. Terms are
consistent: installed size, bundle size, package entry point, package report.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Package Cost Explorer | 3 | Pass |
| Home | 1 | Pass — navigation |
| Demo | 1 | Pass — navigation |
| Privacy | 1 | Pass — navigation |
| Terms | 1 | Pass — navigation |
| npm package size checker | 4 | Pass |
| Compare npm package costs before you install. | 7 | Pass |
| For frontend and Node developers choosing a dependency, see installed size and each entry point’s bundle size. | 17 | Pass |
| Try it with sample data | 5 | Pass — explained beside action |
| Open a completed package report. | 5 | Pass |
| No payment or account. | 4 | Pass — no-account-analytics |
| Reloads offline after the first visit. | 6 | Pass — offline-reload |
| Real measurements contact npm directly. | 5 | Pass — npm-direct |
| Package and version | 3 | Pass — label |
| Measure this package | 3 | Pass — result verb |
| See its installed size and bundle sizes. | 7 | Pass |
| Try Use date-fns or Use lodash-es. | 6 | Pass — surrounding instruction |
| Use date-fns | 2 | Pass — result verb |
| Use lodash-es | 2 | Pass — result verb |
| An opened paper package branches into differently sized dependency paths | 10 | Pass — image alt |
| One package can expose several entry points. | 7 | Pass — sample-report |
| Each can add a different bundle size. | 7 | Pass — sample-report |
| You are offline. | 3 | Pass |
| This page still works, but npm must be reachable to measure a new package. | 14 | Pass — offline-reload |
| An update is ready. | 4 | Pass |
| Reload page | 2 | Pass — result verb |
| Package measurement progress | 3 | Pass — heading |
| Looking up the package on npm… | 6 | Pass |
| Your browser is measuring this package. | 6 | Pass — npm-direct |
| Cancel measurement | 2 | Pass — result verb |
| How package measurement works | 4 | Pass — heading |
| From npm package to size report. | 6 | Pass — heading |
| Choose a package. | 3 | Pass |
| Enter a package name and version. | 6 | Pass |
| Measure its files. | 3 | Pass |
| Your browser downloads public package files from npm. | 8 | Pass — npm-direct |
| Compare entry points. | 3 | Pass |
| Review installed size and bundle size. | 6 | Pass |
| What the estimate does not decide | 6 | Pass — heading |
| Your app settings and shared code can change the final size. | 11 | Pass — scope |
| Confirm important numbers in your own build. | 7 | Pass — instruction |
| Compare installed size and bundle size before adding a dependency. | 10 | Pass |
| Source repository (opens in a new tab) | 7 | Pass — destination named |
| Built by Param Factory · Build mtcueilj | 7 | Pass |
| Hero artwork was generated for this project with Azure OpenAI. | 10 | Pass — provenance |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Package Cost Explorer | 3 | Pass — title |
| Package Cost Explorer measures installed size and bundle size for each npm package entry point. | 15 | Pass — sample-report |
| It is for frontend and Node developers choosing a dependency. | 10 | Pass |
| Open the one-click sample at /demo or /?demo=1. | 8 | Pass — instruction |
| The demo uses fixed date-fns@4.1.0 data, makes no npm request, and saves no report. | 14 | Pass — demo-isolation |
| Resetting the demo removes only browser-storage keys that start with demo:. | 11 | Pass — demo-isolation |
| Real measurements download public package files from npm and complete in this browser. | 13 | Pass — npm-direct |
| The site uses no account, payment, analytics, tracking cookies, or saved reports. | 12 | Pass — no-account-analytics |
| Its interface reloads offline after the first visit. | 8 | Pass — offline-reload |
| New package measurements still require npm. | 6 | Pass — offline-reload |
| A completed report includes installed size, production dependency count, and bundle size for each package entry point. | 17 | Pass — sample-report |
| It can copy a report link and an SVG badge for the measured package. | 14 | Pass — report-sharing |
| Figures are estimates, so confirm important decisions in your own application build. | 12 | Pass — scope |
| Run locally | 2 | Pass — heading |
| Use Node.js 20 or newer. | 5 | Pass |
| Open http://localhost:5173/demo for the sample report. | 6 | Pass — instruction |
| Test and build | 3 | Pass — heading |
| Playwright 1.58.2 uses the Chromium browser from $PLAYWRIGHT_BROWSERS_PATH. | 8 | Pass — environment instruction |
| Run npx playwright install chromium when that browser is unavailable. | 10 | Pass — instruction |
| Every public promise is listed in .factory/claims.json. | 7 | Pass — cross-checked |
| Each entry provides one command that verifies the outcome from the demo entry point. | 14 | Pass — cross-checked |
| Deploy | 1 | Pass — heading |
| npm run build writes the static site to dist/. | 9 | Pass — verified |
| Deploy dist/ and the adjacent api/ badge function as one Azure Static Web App. | 14 | Pass — instruction |
| Do not deploy from this repository by changing DNS or billing settings. | 12 | Pass — scope |
| Privacy, terms, and license | 4 | Pass — heading |
| The product pages at /privacy and /terms explain data handling and estimate limits. | 13 | Pass — verified |
| The project source uses the MIT license in LICENSE. | 9 | Pass — verified |
| Artwork provenance is recorded in .factory/design.md and assets/src/. | 8 | Pass — verified |

Every landing/README visitor claim maps to a declared claim. The rest are
instructions, qualifications, navigation, or provenance, not unlisted promises.

## Demo, sandbox, and claims

**Pass.** One click opened /demo with populated date-fns 4.1.0 data: 21.73 MB
installed size, zero production dependencies, three entry-point rows, and bundle
sizes. The persistent “Demo — sample data, nothing is saved” banner provided
Reset demo and Start for real. Reset announced “Sample reset.” Exit returned to
an empty real package field.

With real:review-sentinel local storage and real:review-session session storage
installed before entry, both survived entry, reset, and exit unchanged. Demo
created no IndexedDB database and made no cross-origin request. The clean-clone
offline test reloaded the sample while offline, displayed the offline state, and
disabled real measurement.

Clean clone: /tmp/pce-review3-clean at this revision. npm ci reported zero
vulnerabilities. Every command in .factory/claims.json passed separately:

| Claim | Result | Evidence |
| --- | --- | --- |
| sample-report | Pass | Fixed sample asserts installed size, zero production dependencies, three rows, and 608 B ./addDays. |
| demo-isolation | Pass | Real sentinels survive; no demo database or cross-origin request; reset and exit work. |
| offline-reload | Pass | Service-worker offline reload preserves the sample and prevents real measurement. |
| npm-direct | Pass | Fixture reaches npm search, metadata, dependency, tarball, and browser bundle work with no analysis endpoint. |
| no-account-analytics | Pass | Completed report leaves no cookies, account/payment UI, tracking request, persisted report, database, or cache data. |
| report-sharing | Pass | Copied link/SVG include date-fns@4.1.0; badge endpoint returns 200. |

npm test passed (24 Vitest tests plus two badge-worker contracts). npm run build
passed and produced dist; initial application JavaScript was 78,607 bytes /
28.41 kB gzip. In a separate live run, nanoid@5.1.5 completed without console
errors, produced three rows and ?q=nanoid%405.1.5, contacted only the site plus
registry.npmjs.org, and returned a 200 SVG badge containing nanoid@5.1.5:
473 B gzip.

## Earlier findings rechecked

| Earlier id | Confirmed current behavior |
| --- | --- |
| R1-B1 | /demo and ?demo=1 seed the report, show the banner, isolate storage/network, reset, and exit. |
| R1-B2 | Six documented tagged claim tests exist and pass from a clean clone. |
| R1-B3 | Headline, audience sentence, and sample action answer what, for whom, and first action above the fold. |
| R1-B4 | Direct unknown URL returns the designed ledger 404 with title, navigation, and return actions. |
| R1-M1 | All routes have route-aware metadata, header/footer, and focus/live announcement on client navigation. |
| R1-M2 | Cold-path copy uses plain terms; primary and example controls name their result. |
| R1-m1 | Offline demo reload visibly identifies the state and blocks real measurement. |
| R2-M1 | Claim and tests assert production dependency count, including a non-zero npm fixture. |
| R2-M2 | Fixture and live nanoid run reach npm files and browser measurement. |
| R2-m1 | Completed-report privacy test checks cookies, browser stores, cache, and new page. |
| R2-m2 | Vague duration copy is absent. |
| R2-m3 | All three phone facts finish at 575.7 px. |
| R2-m4 | Visitor copy consistently uses installed size and bundle size. |
| R2-m5 | Example controls visibly read Use date-fns and Use lodash-es. |
| R2-m6 | README says which browser-storage keys reset touches. |

## Structure, accessibility, identity, leverage

| Check | Result |
| --- | --- |
| Routes/metadata | Pass — Home, Demo, Privacy, Terms, and not-found have correct title, h1/main, lang, description, canonical, OG/Twitter data, and icons. |
| Navigation/links | Pass — direct routes, Back, focus, announcement, and all internal/assets/badge/source links work; unknown route correctly returns 404. |
| Accessibility | Pass — live Axe found no serious/critical issue on all five checked routes; no console error. |
| Identity | Pass — the paper broadsheet, type pairing, cyan proof marks, package-tree art, print controls, and folio 404 follow the design record and are distinct. |
| Privacy | Pass — demo used only the site origin; real analysis added only npm. No runtime AI integration or provider key exists. |
| Missed leverage | Pass — report link and query-aware SVG badge meet the implied sharing/export need. Sync conflicts with local no-account use; AI adds no value to this deterministic measurement job. |

## What would make this perfect

No remaining product, copy, claim, demo, privacy, structure, accessibility, or
leverage work was identified. Preserve the claim suite and repeat this cold
mobile review after material copy, storage, or routing changes.
