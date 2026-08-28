# Adversarial first-read review 1

**Product:** Package Cost Explorer  
**Reviewed:** 2026-08-28  
**Verdict:** **FAIL**

This is a first-visit review of the deployed site in fresh Chromium contexts at
390 × 844 and 1440 × 900. It is not a product-code change.

## First screen result

I can infer that the page measures some kind of JavaScript import cost, and I
can see that I should type a package then press **“Run the numbers”**. I cannot
tell from the first mobile screen who the tool is for. Neither the headline nor
the supporting sentence says “npm”, “developer”, “frontend”, or “Node”. The
first screen instead says:

> “Count what your import really costs.”
>
> “Install weight, transitive bloat, and a tree-shaken bill for every public
> export—computed on this page, never queued on a server.”

This assumes that the visitor already knows *import*, *transitive bloat*,
*tree-shaken*, and *public export*. It does not meet the cold-visitor
what/for-whom/first-action check. The visual system is distinct and rendered
without horizontal overflow at 390 px; that does not resolve the copy failure.

## Findings, ordered by severity

### BLOCKING — there is no sample-data demo or sandbox

**Evidence.** The landing page has no **“Try it with sample data”** action.
`/demo` returns HTTP 200 but renders the ordinary landing page with the ordinary
empty package input; it neither starts an analysis nor displays a demo banner.
There is no `?demo=1` flow, **“Demo — sample data, nothing is saved”** banner,
**Reset demo**, or **Start for real** control. `.factory/demo.md` is also absent.

**Why this fails a first visit.** A visitor must know a package name and must
initiate a real registry lookup before seeing a report. They cannot see the
product working in one click, cannot assess the result format quickly, and
cannot verify that a trial stays out of real storage.

**Concrete fix.** Put a primary **“Try it with sample data”** button beside the
real package form. It must open `/demo` (and `?demo=1`) directly into a
realistic completed package report, with a persistent **“Demo — sample data,
nothing is saved”** banner, **Reset demo**, and **Start for real**. Keep demo
data under a `demo:` storage namespace, document it in `.factory/demo.md`, and
add Playwright coverage that proves demo mode neither reads nor writes the real
namespace.

### BLOCKING — claims have no contract or runnable claim tests

**Evidence.** `.factory/claims.json` does not exist. Consequently there are no
`@claim:<id>` tests to run from a clean clone. `npm ci`, `npm test`, `npm run
build`, `npm run test:e2e`, and `npm run test:live` passed, but none establish
the visitor-facing promises below. A fresh live `nanoid@5.1.5` run made direct
requests to `registry.npmjs.org` (search, packument, and tarball); the page had
no `localStorage` or `sessionStorage` entries after the run.

**Unlisted claim-like copy (landing, legal pages, and README).** With no claims
file, every row is unlisted:

| Exact claim-like copy | Where | Required observable test |
| --- | --- | --- |
| “No lookup limits” | masthead | a documented, repeatable limit test or remove it |
| “computed on this page, never queued on a server” | hero | intercept the complete demo flow and assert permitted requests only |
| “Reads the exports map” | hero | sample report asserts resolved public entries from its exports map |
| “Bundles inside your browser” | hero | demo report proves the bundling outcome without an analysis API |
| “Sends us nothing” | hero | clarify npm disclosure, then intercept and assert no operator endpoint or remove |
| “The interface is cached” | offline banner | first visit, offline reload, and visible offline-state test |
| “Measurements stay in your browser.” | footer | storage and network interception across a demo analysis |
| “No accounts, analytics, or lookup logs.” | footer and README | network/storage test plus a narrow, accurate wording of what the operator does not receive |
| “All analysis runs in the browser.” | README | demo analysis with no analysis API request |
| “The app talks directly to the public npm registry” | README | intercept and assert the expected npm origins |
| “loads esbuild-wasm only when an analysis begins” | README | assert no wasm request before, and one after, demo analysis |
| “Total tarball downloads during one bundle run are capped at 50 MB” | README | fixture exceeding the cap asserts the displayed limit |
| “dependency counting is capped at 400 unique packages” | README | fixture exceeding the cap asserts the displayed limit |
| “the worker only renders a supplied badge label” | README | request/interception contract test for the badge route |
| “Package Cost Explorer performs analysis on your device.” | Privacy | demo analysis with no analysis API request |
| “We do not operate an analysis API, create user accounts, or collect package lookups.” | Privacy | full demo network/storage interception with an explicitly allowed npm request list |
| “The app fetches public metadata and tarballs directly from the npm registry.” | Privacy | intercepted demo flow asserts the expected npm origins |
| “A service worker caches the versioned application shell on your device for faster and offline shell loading.” | Privacy | first-visit service-worker registration followed by offline reload |
| “Analysis results and package contents are kept in memory and disappear when the page is closed or refreshed.” | Privacy | demo run, reload/new context, and storage inspection |
| “We set no tracking cookies and use no analytics.” | Privacy | inspect cookies and all network requests during the demo |
| “This free tool provides reproducible estimates for dependency decisions.” | Terms | fixture report and repeatability assertion |
| “Peer dependencies, Node built-ins, native modules, stylesheets, and non-JavaScript assets can be excluded and are called out in the report.” | Terms | fixture covering each stated boundary |
| “The source code is available under the MIT License.” | Terms | repository/license presence test |

**Why this fails a first visit.** The reader is asked to rely on privacy,
local-computation, caching, and limit claims without a reproducible way to
confirm them. “Sends us nothing” is particularly ambiguous because the entered
package name is sent to npm during the real flow.

**Concrete fix.** Add `.factory/claims.json` with one sandboxed,
`@claim:<id>`-tagged test per retained claim. Use the demo entry point for every
test. Remove a claim if that test cannot observe its promised result. Rewrite
the ambiguous hero fact as: **“Fetches public package files directly from npm;
we receive no package lookup.”** Only retain it after the interception test
defines and proves “we”.

### BLOCKING — the mobile hero does not say who the tool is for

**Evidence.** On the fresh 390 px screen, the only audience/context copy is
“The independent package ledger” and the two quoted sentences in the first
screen result. The input examples are `date-fns` and `lodash-es`; no visitor
audience is named.

**Why this fails a first visit.** A person who does not already recognise those
package names cannot tell whether this is for npm developers, package authors,
security review, or billing. The noun “ledger” and metaphor “bill” add another
interpretation step.

**Concrete fix.** Replace the hero with, for example: **“Compare npm package
costs before you install.”** Supporting sentence: **“For frontend and Node
developers choosing a dependency, see install size and each import’s bundle
size.”** Rename the submit button **“Measure this package”**; add adjacent text
“See its install and import sizes.”

### BLOCKING — unknown URLs do not get a designed 404

**Evidence.** Both `/demo` and `/not-a-real-route` returned HTTP 200 with the
home title and home `<h1>`, **“Count what your import really costs.”** There is
no 404 state, explanation, or return link.

**Why this fails a first visit.** A copied or mistyped URL silently becomes a
different page. In particular, a verifier following the promised demo URL sees
an empty real-data form rather than a demo.

**Concrete fix.** Add a real 404 route/state with a `404` title, one plain
heading such as **“This package page does not exist.”**, and a home link. Make
`/demo` an explicit route before the fallback; return a real 404 status where
the static host permits it.

### Major — per-route metadata and navigation are incomplete

**Evidence.** `/privacy` and `/terms` each retain the home meta description and
canonical (`https://package-cost-explorer.sociobot.in/`). The inspected markup
has no Open Graph tags, Twitter card tags, or `apple-touch-icon`. The header
contains only the wordmark and edition text, not the required visible Demo /
Privacy navigation. The link crawl itself passed for the five current anchors:
skip link, home, Privacy, Terms, and Source all returned 200.

**Why this fails a first visit.** Shared legal URLs describe the product home,
not the policy; search and share previews have no product image or route-aware
description. Visitors cannot navigate to a demo from the persistent header.

**Concrete fix.** Give each route its own title, description, and canonical;
add self-hosted Open Graph/Twitter image metadata and a 180 px apple touch icon.
Add a consistent header nav with Home, Demo, Privacy, and Terms, then test
deep-link/back-button focus movement to the new `<h1>` and its live
announcement.

### Major — copy uses unexplained package-tool jargon and an unnamed action

**Evidence.** The first screen contains “transitive bloat”, “tree-shaken”, and
“public export”; the action is **“Run the numbers”**. The method section uses
“esbuild-wasm”, “browser/import conditions”, and “decision-grade estimates”.

**Why this fails a first visit.** These terms make the main promise less clear
than the product it describes. “Run the numbers” does not name the result the
visitor will receive.

**Concrete fix.** Use “dependencies of dependencies”, “bundle size after unused
code is removed”, and “package entry point” on first mention. Use **“Measure
this package”** for the action. Keep implementation terms in a details section
after the result.

### Minor — offline state is not visibly confirmed after an offline reload

**Evidence.** After a successful fresh visit, an intercepted offline reload
rendered the home `<h1>`. The offline banner text exists, but its `hidden`
property was still `true` in that reload check.

**Why this matters.** The UI does not reliably tell the visitor that a fresh
package lookup will fail while offline.

**Concrete fix.** Test `context.setOffline(true)` after first visit and require
the visible banner plus a clear disabled/error outcome for a new analysis.

## Copy audit

Word counts treat hyphenated terms as one word. Labels and headings without a
sentence are included where they are a visitor-facing copy decision. `J` means
unexplained jargon; `C` means claim-like/unlisted; `A` means an action that does
not name its result; `H` means a heading that lacks context. Every flagged row
has a proposed rewrite.

### Landing page

| Copy | Words | Flag / proposed rewrite |
| --- | ---: | --- |
| Browser edition. | 2 | J/H — “Package measurement in your browser” |
| No lookup limits. | 3 | C — remove until tested, or state and test an exact limit |
| The independent package ledger. | 4 | J/H — “npm package size checker” |
| Count what your import really costs. | 6 | J/H — “Compare npm package costs before you install.” |
| Install weight, transitive bloat, and a tree-shaken bill for every public export—computed on this page, never queued on a server. | 21 | J/C — “For frontend and Node developers, measure install size and each import’s bundle size in this browser.” |
| Package and version | 3 | — |
| Run the numbers | 3 | A — “Measure this package” |
| Try date-fns, lodash-es, or a scoped package. | 6 | — |
| Reads the exports map. | 4 | J/C — “Checks each package entry point.” |
| Bundles inside your browser. | 4 | J/C — “Measures bundle size in this browser.” |
| Sends us nothing. | 3 | C/ambiguous — “We do not receive your package lookup.” |
| One archive. | 2 | H — remove |
| Many public doors. | 3 | J/H — “Several public entry points.” |
| Each carries a different bill. | 5 | H — “Each can add a different bundle size.” |
| Offline edition. | 2 | H — “You are offline.” |
| The interface is cached, but a fresh package needs the npm registry. | 11 | C — “This page is available offline. Connect to npm to measure a new package.” |
| Reconnect to analyze. | 3 | — |
| A new edition is ready. | 5 | H — “An update is ready.” |
| Live dispatch | 2 | J/H — “Package measurement progress” |
| Opening the registry record… | 4 | J — “Looking up the package on npm…” |
| This work happens locally and may take a moment on large dependency trees. | 13 | C/J — “Your browser is measuring this package. Large dependency lists can take longer.” |
| How the edition is made | 5 | H — “How package measurement works” |
| The registry is the source. | 5 | H — “Package details come from npm.” |
| Your browser is the press. | 5 | H — “Your browser measures the package.” |
| We resolve the chosen npm version and its public exports, download the published tarball, then run esbuild-wasm with browser/import conditions. | 17 | J — “We download the selected public package and measure its entry points in your browser.” |
| Production dependency metadata is walked separately to expose install-tree bloat. | 10 | J — “We count the production dependencies that add to its installed size.” |
| These are decision-grade estimates, not claims about your exact app. | 9 | J — “These are estimates. Your own app can produce a different size.” |
| Your bundler, target, aliases, and existing shared dependencies can change the final number. | 12 | J — “Your build settings and shared code can change the final size.” |
| Measurements stay in your browser. | 5 | C — “We do not store package reports.” (only after a storage test) |
| No accounts, analytics, or lookup logs. | 6 | C — “No account or analytics is used.” (only after a network test) |
| Hero artwork was generated for this project with Azure OpenAI. | 10 | — provenance disclosure; retain |

No landing-page sentence exceeds 22 words under the stated counting rule.

### README

| Copy | Words | Flag / proposed rewrite |
| --- | ---: | --- |
| Package Cost Explorer is an exports-aware npm package cost ledger for frontend and Node developers. | 13 | J — “Package Cost Explorer measures npm install and import size for frontend and Node developers.” |
| Give it a package, dist-tag, exact version, or semver range and it reports: | 14 | J — “Enter a package and version to see:” |
| aggregate unpacked install footprint and root-package size | 6 | J — “installed size and package-only size” |
| unique production dependencies, with direct-version resolution | 6 | J — “production dependencies and their resolved versions” |
| every concrete public subpath in the package’s exports map (including archive-expanded pattern exports) | 13 | J — “each import path the package publishes” |
| minified, gzip, and Brotli JavaScript cost for every public entry | 10 | J — “minified and compressed JavaScript size for each entry point” |
| isolated tree-shaken cost for every statically discoverable named export | 9 | J — “size of each named export after unused code is removed” |
| recent version-over-version unpacked-size history | 5 | J — “recent installed-size history” |
| a canonical share URL and an embeddable per-report SVG badge carrying the selected package, resolved version, and measured gzip value | 18 | J — “a link and SVG badge for the measured package version and gzip size” |
| All analysis runs in the browser. | 6 | C — retain only with a claim test |
| The app talks directly to the public npm registry, opens tarballs in memory, and loads esbuild-wasm only when an analysis begins. | 20 | J/C — “The browser fetches public package files from npm when you measure a package.” |
| There is no lookup API, account, analytics, or package-query storage. | 10 | C/J — “We do not provide accounts or analytics, and we do not store package queries.” |
| Use it when choosing dependencies, checking whether a subpath is cheaper than a package’s root entry, or spotting install-tree bloat before adding a dependency. | 24 | >22/J — “Use it before adding a dependency. Compare its root import with a smaller import path.” |
| It is a decision aid: always confirm critical numbers in the target application and bundler. | 14 | J — “Confirm important numbers in your own application build.” |
| Requires Node.js 20 or newer. | 6 | — |
| Create the exact deploy artifact with: | 6 | — |
| The static site is written to `dist/`, with `dist/index.html` at its root. | 12 | — |
| Playwright needs its browser once per machine: `npx playwright install chromium`. | 10 | — |
| Regenerate the optimized AVIF/WebP hero derivatives from the committed source with `npm run assets`. | 13 | J — “Run `npm run assets` to regenerate the hero image files.” |
| `npm run test:live` runs a clean-profile check against production: it verifies that first install has no false update toast, a missing package has no expected 404 console error, the exact badge URL generated by the UI contains the report values, and the manifest has its interoperable MIME type. | 43 | >22/J — “`npm run test:live` checks the deployed site in a clean browser profile. It checks the update notice, missing-package error, badge values, and manifest type.” |
| The app requests compact package metadata from npm, resolves the requested tag/range, and downloads the chosen package tarball. | 19 | J — “The browser asks npm for the chosen package version, then downloads that package.” |
| Its complete `package.json` is read from the archive so `exports`, `browser`, `module`, and `main` stay authoritative. | 17 | J — “The published package file decides which import paths are measured.” |
| esbuild-wasm bundles selected entry points for an ES2020 browser target with tree-shaking and minification. | 14 | J — “The browser estimates a compressed JavaScript bundle for each entry point.” |
| Compression runs locally with fflate (gzip) and Brotli WASM. | 8 | J — “The browser calculates gzip and Brotli sizes.” |
| Production dependency counts are resolved recursively from registry metadata and deduplicated by name and version. | 13 | J — “The browser counts production dependencies without double-counting a package version.” |
| Peer dependencies and Node built-ins remain external and are named in the report. | 12 | J — “The report identifies dependencies that are not included in the browser-size estimate.” |
| CSS, static assets, optional/native modules, and side-effect analysis are outside v1. | 10 | J — “The estimate does not include CSS, assets, optional/native modules, or side-effect analysis.” |
| Pattern exports are expanded from the downloaded archive. | 7 | J — “The report includes published wildcard import paths.” |
| Total tarball downloads during one bundle run are capped at 50 MB. | 11 | C — retain only with a cap test |
| dependency counting is capped at 400 unique packages. | 7 | C — retain only with a cap test |
| These limits are surfaced in the interface. | 7 | C — test an over-limit report |
| Production is the Standard-tier Azure Static Web App `sf-package-cost-explorer`. | 8 | J — deployment detail; move to an operator document |
| Deploy `dist/` with the adjacent `api/` Azure Functions Node v4 worker as a Standard Azure Static Web App. | 16 | J — “Deploy `dist/` and the `api/` badge function as one Static Web App.” |
| The checked-in Static Web Apps configuration rewrites `/badge.svg` to that tiny worker, which strictly escapes query text and returns the package, version, and gzip value in SVG. | 28 | >22/J/C — “`/badge.svg` renders an SVG badge from the supplied package, version, and gzip value. Its contract test rejects unsafe query text.” |
| The product analysis remains fully client-side; the worker only renders a supplied badge label. | 14 | C — retain only with an interception test |
| The `/privacy` and `/terms` routes explain the local-first data model and measurement limitations. | 12 | J — “Privacy and Terms explain what the browser stores and what the estimate excludes.” |
| Package registry requests are subject to npm’s policies. | 8 | — |
| Source code is MIT licensed; the generated hero artwork is original to this project and its prompt/provenance are recorded in `.factory/design.md` and `assets/src/`. | 23 | >22/J — “The source code uses the MIT license. The hero image prompt and provenance are in `.factory/design.md` and `assets/src/`.” |

README headings needing contextual wording: **“Who it is for”** is clear;
**“How measurement works”** is clear; **“Privacy and license”** is clear.
There are no generic button labels in the README.

## Structure, privacy, and behavior checks

| Check | Result |
| --- | --- |
| Fresh phone and desktop load | Rendered without console errors or horizontal overflow. |
| Title, language, one h1, main | Present on home; legal pages have one h1. |
| Description/canonical | Home is present. Legal routes incorrectly keep the home description and canonical. |
| OG/Twitter/apple touch | Missing. |
| Favicon, robots, sitemap, CSP/security headers | Present on the home response. Sitemap lists home, Privacy, and Terms only. |
| 404 and `/demo` | Failed: both fall through to the normal home page with 200. |
| Header/footer | Footer contains Privacy and Terms; header has no visible route navigation. |
| Link crawl | Passed for all five current anchors; each returned 200. |
| Back/deep-link focus and route announcement | Not implemented/testable: rendering chooses the route only at initial load and does not move focus to the new h1 or announce route changes. |
| Visual identity | Pass: the monochrome print-ledger treatment is product-specific, not a generic SaaS card/gradient template. |
| Demo storage isolation/reset | Cannot verify: no demo mode exists. |
| Offline/privacy claim sandbox | Cannot verify against demo: no demo mode or claims tests exist. A live real-data run contacts npm directly. |

## Commands and evidence

From this clean dependency install:

```text
npm ci                 PASS
npm test               PASS (23 Vitest tests + 2 badge-worker tests)
npm run build          PASS (dist/ produced)
npm run test:e2e       PASS (4 passed, 2 intentionally skipped)
npm run test:live      PASS
```

There were no claim commands to run because `.factory/claims.json` is absent.
The passing tests do not change the blocking demo, claims, first-read, or 404
findings above.

## Acceptance condition

This review can pass only after the demo sandbox and claims contract are added,
the first screen names npm developers and the result of its action, unknown
routes render a real 404, and the metadata/navigation findings are corrected.
Re-run the copy audit, every claim command, fresh mobile/desktop demo flows,
offline interception, and route/link checks after those changes.
