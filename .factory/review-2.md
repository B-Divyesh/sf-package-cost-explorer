# Adversarial first-read review 2

**Product:** Package Cost Explorer  
**Reviewed:** 2026-08-28  
**Live URL:** <https://package-cost-explorer.sociobot.in>  
**Revision tested:** `54884a13b2b5152fcbfa785d07a794f3f3a4705d`  
**Verdict:** **FAIL**

There are no blocking findings. The live product is clear, tryable, and
operational, but it has two major claim-contract gaps and six minor findings.
The acceptance rule allows a pass only with no blocking findings and at most
three minor findings.

## First screen: pass

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 without prior
site data. Before scrolling, I understood the page as follows:

- **What it does:** compares an npm package's installed size and per-import
  bundle size before installation.
- **For whom:** frontend and Node developers choosing a dependency.
- **What to click first:** **“Try it with sample data”**, which says it opens a
  completed package report.

The exact copy supporting those answers is:

> “Compare npm package costs before you install.”
>
> “For frontend and Node developers choosing a dependency, see install size
> and each import’s bundle size.”
>
> “Try it with sample data” / “Open a completed package report.”

The action, explanation, package field, and **“Measure this package”** button
were visible without scrolling at both sizes. There were no console errors or
horizontal overflow.

## Findings, ordered by severity

### Major — the production-dependency capability is an unlisted claim

**Quote:** README: “A completed report includes installed size, production
dependency count, and compressed JavaScript size for each package entry
point.”

**Why this matters:** `.factory/claims.json` does not promise or test the
production dependency count. The `sample-report` test checks installed size,
three table rows, and one bundle value, but not the dependency label or count.
A visitor can rely on this core report field while the claim suite remains
green if it disappears or becomes wrong.

**Concrete fix:** extend `sample-report.claim` to include production dependency
count and assert the visible **“Production dependencies”** value from the fixed
sample. Add a non-zero dependency fixture if the product intends to prove the
counting path rather than only the zero state.

### Major — the npm-file privacy claim is stronger than its test

**Quotes:** landing: “Your browser downloads public package files from npm.”
The progress state also says, “Your browser is measuring this package.”

**Why this matters:** the nearest entry, `npm-direct`, says real measurements
contact npm directly. Its test stubs the npm search endpoint with no results
and stops at **“npm has no published package”**. It never reaches a packument,
tarball download, or completed measurement, so it does not verify either quoted
sentence. A visitor is asked to trust where package files and computation go.

**Concrete fix:** list the complete claim, then use deterministic npm fixtures
for search, package metadata, and tarball responses. Complete a measurement and
assert that all package requests go only to npm and no analysis endpoint is
called.

### Minor — “no saved reports” is not asserted by its assigned test

**Quote:** claim `no-account-analytics`: “Free to use with no account,
analytics, tracking cookies, or saved reports.”

**Why this matters:** its tagged test checks cookies, account inputs, and
tracker/payment request names, but does not inspect localStorage,
sessionStorage, IndexedDB, or Cache Storage for a report. The separate demo
isolation test checks some storage for demo mode, not a completed real report.

**Concrete fix:** after a completed fixture-backed real measurement, inspect
all browser stores and reload in a new page. Assert that no report or package
contents survive, or split **“no saved reports”** into its own tagged claim.

### Minor — a performance statement is not listed or measurable

**Quote:** landing progress state: “Large dependency lists can take longer.”

**Why this matters:** “large” and “longer” have no threshold, so a visitor
cannot use the statement to judge whether the process is stuck. It has no
entry in `.factory/claims.json`.

**Concrete fix:** remove the comparison, or replace it with a tested bound such
as “A 400-package fixture completes within X seconds on the test device.”

### Minor — two of the three first-screen facts fall below the phone fold

**Quote:** at 390 × 844, only the start of **“01 Free to use. No account.”** is
visible at the bottom edge. **“02 Reloads offline after the first visit.”** and
**“03 Real measurements contact npm directly.”** require scrolling.

**Why this matters:** the mandatory first-screen shape calls for three short
privacy/offline/price facts. A phone visitor sees the action and form, but can
miss two facts that explain the network and offline behavior.

**Concrete fix:** place the three compact facts immediately after the sample
action and before the real-package form, or reduce the mobile hero spacing so
all three fit in the initial viewport.

### Minor — one metric has three names

**Quotes:** “install size” / “installed size”; “each import’s bundle size” /
“import sizes” / “compressed JavaScript size.”

**Why this matters:** a first-time visitor may read these as different
measurements. The repository's own terminology table says the preferred terms
are **“installed size”** and **“bundle size.”**

**Concrete fix:** use **“installed size”** and **“bundle size”** everywhere.
For example: “See its installed size and bundle sizes.”

### Minor — the package example buttons do not name their action

**Quotes:** buttons **“date-fns”** and **“lodash-es.”**

**Why this matters:** the controls only fill the package field. In a screen
reader button list, the package names do not say what activation will do.

**Concrete fix:** label them **“Use date-fns”** and **“Use lodash-es”**, visibly
or with matching accessible names.

### Minor — the README uses storage implementation jargon

**Quote:** “Resetting the demo clears only the reserved `demo:` storage
namespace.”

**Why this matters:** “reserved storage namespace” requires implementation
knowledge and does not tell the reader which browser data is affected.

**Concrete fix:** “Resetting the demo removes only browser-storage keys that
start with `demo:`.”

## Copy audit

Counts are whitespace-delimited; hyphenated terms and code paths count as one
word. No audited sentence exceeds 22 words and no banned marketing adjective
appears. Headings, controls, navigation, alt text, and initially rendered
status copy are included because they are part of the first-use language.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Package Cost Explorer | 3 | Pass |
| Home | 1 | Pass; link |
| Demo | 1 | Pass; link |
| Privacy | 1 | Pass; link |
| Terms | 1 | Pass; link |
| npm package size checker | 4 | Pass |
| Compare npm package costs before you install. | 7 | Pass |
| For frontend and Node developers choosing a dependency, see install size and each import’s bundle size. | 16 | Finding: inconsistent “install” term; use “installed size” |
| Try it with sample data | 5 | Pass; result explained beside action |
| Open a completed package report. | 5 | Pass |
| Package and version | 3 | Pass |
| Measure this package | 3 | Pass; result-naming verb |
| See its install and import sizes. | 6 | Finding: use “installed size and bundle sizes” |
| Try date-fns or lodash-es. | 4 | Pass as surrounding instruction |
| date-fns | 1 | Finding: button should say “Use date-fns” |
| lodash-es | 1 | Finding: button should say “Use lodash-es” |
| Free to use. | 3 | Pass; listed claim |
| No account. | 2 | Pass; listed claim |
| Reloads offline after the first visit. | 6 | Pass; listed claim |
| Real measurements contact npm directly. | 5 | Pass; listed claim |
| An opened paper package branches into differently sized dependency paths | 10 | Pass; image alt text |
| One package can expose several entry points. | 7 | Pass; covered by sample report |
| Each can add a different bundle size. | 7 | Pass; covered by sample report |
| How package measurement works | 4 | Pass; contextual heading |
| From npm package to size report. | 6 | Pass; contextual heading |
| Choose a package. | 3 | Pass |
| Enter a package name and version. | 6 | Pass |
| Measure its files. | 3 | Pass |
| Your browser downloads public package files from npm. | 8 | Finding: stronger than `npm-direct` test |
| Compare entry points. | 3 | Pass |
| Review installed size and compressed JavaScript size. | 7 | Finding: use “bundle size” consistently |
| What the estimate does not decide | 6 | Pass; contextual heading |
| Your app settings and shared code can change the final size. | 11 | Pass; scope warning |
| Confirm important numbers in your own build. | 7 | Pass; concrete instruction |
| Compare npm install and import sizes before adding a dependency. | 10 | Finding: use the preferred metric terms |
| Source repository (opens in a new tab) | 7 | Pass; destination and behavior named |
| Built by Param Factory · Build `mtcs45sn` | 7 | Pass |
| Hero artwork was generated for this project with Azure OpenAI. | 10 | Pass; provenance disclosure |
| You are offline. | 3 | Pass |
| This page still works, but npm must be reachable to measure a new package. | 14 | Pass; listed offline claim |
| An update is ready. | 4 | Pass |
| Reload page | 2 | Pass; result-naming verb |
| Package measurement progress | 3 | Pass; contextual heading |
| Looking up the package on npm… | 6 | Pass |
| Your browser is measuring this package. | 6 | Finding: stronger than the completed-flow test |
| Large dependency lists can take longer. | 6 | Finding: unlisted and undefined comparison |
| Cancel measurement | 2 | Pass; result-naming verb |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Package Cost Explorer | 3 | Pass; title |
| Package Cost Explorer measures npm install size and bundle size for each package entry point. | 15 | Finding: use “installed size” consistently |
| It is for frontend and Node developers choosing a dependency. | 10 | Pass |
| Open the one-click sample at `/demo` or `/?demo=1`. | 8 | Pass |
| The demo uses fixed `date-fns@4.1.0` data, makes no npm request, and saves no report. | 14 | Pass; listed demo claim |
| Resetting the demo clears only the reserved `demo:` storage namespace. | 10 | Finding: storage jargon; rewrite above |
| Real measurements contact npm directly. | 5 | Pass; listed claim |
| The site is free and uses no account, analytics, tracking cookies, or saved reports. | 14 | Finding: saved-report assertion is incomplete |
| Its interface reloads offline after the first visit. | 8 | Pass; listed claim |
| New package measurements still require npm. | 6 | Pass; exercised offline |
| A completed report includes installed size, production dependency count, and compressed JavaScript size for each package entry point. | 18 | Finding: production dependency count is unlisted |
| It can copy a report link and an SVG badge for the measured package. | 14 | Pass; listed claim |
| Figures are estimates, so confirm important decisions in your own application build. | 12 | Pass; scope warning and instruction |
| Run locally | 2 | Pass; contextual heading |
| Use Node.js 20 or newer. | 5 | Pass |
| Open `http://localhost:5173/demo` for the sample report. | 6 | Pass |
| Test and build | 3 | Pass; contextual heading |
| Playwright 1.58.2 uses the Chromium browser from `$PLAYWRIGHT_BROWSERS_PATH`. | 8 | Pass |
| Run `npx playwright install chromium` when that browser is unavailable. | 10 | Pass |
| Every public promise is listed in `.factory/claims.json`. | 7 | Finding: contradicted by the unlisted dependency/performance statements |
| Each entry provides one command that verifies the outcome from the demo entry point. | 14 | Finding: two assigned tests do not cover the complete quoted outcomes |
| Deploy | 1 | Pass; contextual heading |
| `npm run build` writes the static site to `dist/`. | 9 | Pass; verified |
| Deploy `dist/` and the adjacent `api/` badge function as one Azure Static Web App. | 14 | Pass; deployment instruction |
| Do not deploy from this repository by changing DNS or billing settings. | 12 | Pass; concrete restriction |
| Privacy, terms, and license | 4 | Pass; contextual heading |
| The product pages at `/privacy` and `/terms` explain data handling and estimate limits. | 13 | Pass; verified |
| The project source uses the MIT license in `LICENSE`. | 9 | Pass; verified |
| Artwork provenance is recorded in `.factory/design.md` and `assets/src/`. | 8 | Pass; verified |

## Demo and sandbox result

**Pass.** The landing action opens `/demo` in one click. The first mobile
viewport already contains the persistent banner, sample headline,
`date-fns 4.1.0`, and the start of populated installed-size facts. The report
contains three realistic entry-point rows.

- Banner: **“Demo — sample data, nothing is saved.”**
- Controls: **Reset demo** reports **“Sample reset.”**; **Start for real**
  returns to an empty package field and removes the banner.
- Isolation: `real:sentinel` in localStorage, `real:session` in sessionStorage,
  and an IndexedDB database named `real-db` all survived entry, reset, and
  exit. The demo created no storage entry.
- Network: the complete demo flow made no cross-origin request.
- Offline: after one online visit and service-worker control, an intercepted
  offline reload kept the banner, all three report rows, and the visible
  **“You are offline. The sample report remains available.”** state.

## Claims results

Each command was run separately after `npm ci` in clean clone
`/tmp/pce-review2-clean-qQ3BCM/repo` at the reviewed revision.

| Claim | Command result | Observable evidence |
| --- | --- | --- |
| `sample-report` | PASS | `date-fns 4.1.0`, 21.73 MB, three rows, and 608 B subpath assertion |
| `demo-isolation` | PASS | real sentinel preserved; no demo storage/database or cross-origin request; reset and exit asserted |
| `offline-reload` | PASS | service-worker control, offline reload, sample report, and disabled real measurement asserted |
| `npm-direct` | PASS | npm search request observed and no `/api/analysis` or `/api/lookup` request observed |
| `no-account-analytics` | PASS | no cookies/account fields or known analytics/payment request observed |
| `report-sharing` | PASS | demo URL, copied date-fns badge, and SVG response asserted |

No listed command failed, so there is no blocking claim-test finding. The
major/minor findings above concern unlisted wording and insufficient assertions
inside passing tests.

## Structure, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | Pass: Home, Demo, Privacy, Terms, and not-found each use distinct plain titles under 60 characters |
| Semantics | Pass: `lang=en`, one h1, one main, ordered headings, header, footer, and skip link on every checked route |
| Metadata | Pass: route-aware description/canonical/OG/Twitter metadata; 1200 × 630 social image; SVG favicon; 180 × 180 apple icon |
| 404 | Pass: unknown URL renders the designed ledger-style not-found page with home and sample links |
| Deep links/history | Pass: direct routes load correctly; client navigation focuses and announces h1; Back restored URL, h1 focus, and the tested 700 px home scroll position |
| Links | Pass: every unique internal page/asset/badge link and the source repository returned 200 |
| Mobile | Pass except the first-screen-facts finding: no horizontal overflow at 390 px and primary controls meet the tested target size |
| Accessibility | Pass: live Axe checks reported no serious or critical issue on Home, Demo, Privacy, Terms, or not-found; no console errors |
| Motion | Pass: the stylesheet includes a reduced-motion override |
| Identity | Pass: the newsprint, ledger rules, cyan proof marks, typography, generated package-tree art, and folio 404 are distinct from a generic SaaS template |
| Security/privacy shell | Pass: CSP, `X-Content-Type-Options`, `Referrer-Policy`, Permissions Policy, and same-origin runtime assets were present |

## Other verification

From the clean clone:

```text
npm test          PASS (24 unit tests + 2 badge-worker tests)
npm run build     PASS (dist/ produced; initial app JS 78.63 kB / 28.45 kB gzip)
npm run test:live PASS (clean profile, missing package, real nanoid report, badge, manifest MIME)
```

## Acceptance condition

List and test the production-dependency and completed npm-file claims, make the
saved-report assertion complete, remove or quantify the vague duration claim,
then resolve the three copy/phone issues. Re-run every claim command from a
clean clone and repeat the live 390 px first-screen check.
