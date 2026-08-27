# Independent verification — FAIL

**Verified 2026-08-27** against candidate commit
`5641b64df16e3f25e241aa321682e8dcdb50eb61` in a detached, clean worktree and
the live site [https://package-cost-explorer.sociobot.in](https://package-cost-explorer.sociobot.in).

## Verdict

**FAIL.** The app is polished and several core flows work, but it does not meet
the researched v1 promise to provide a per-public-export and per-named-export
cost report, does not provide the specified worker-served SVG badge, and its
PWA update path is stale. These are product-contract defects, not the prior
deployment-only issue.

## Exact checks and evidence

### Clean candidate checks

In `/tmp/package-cost-explorer-verify` at the exact detached SHA:

- `npm ci` completed; `npm audit --omit=dev` reported **0 vulnerabilities**.
- `npm test` passed: **5 files, 14 tests**.
- `npm run build` passed and produced `dist/`. It includes TypeScript checking
  (`tsc --noEmit`). No separate lint script/configuration is present.
- After installing the missing Playwright Chromium binary, `npm run test:e2e`
  passed: **4 passed, 2 intentionally skipped**.
- Production build budget: initial JS modules are 69,082 B and 67,230 B
  uncompressed (25,990 B and 18,860 B gzip); CSS is 12,535 B (3,600 B gzip).
  This is within the 200 KB initial-JS and 50 KB CSS budgets. The 12.33 MB
  esbuild and 1.06 MB Brotli WASM files are requested only once analysis starts.

### Independent end-to-end and accessibility checks

- Desktop and 390 x 844 mobile: keyboard-only Tab reached the skip link, Enter
  operated it, and the visible focus ring was `3px rgb(0, 111, 122)`.
- `nanoid@5.1.5` successfully resolved, downloaded, bundled, produced three
  result rows, and changed the shared URL to the exact version on both the
  candidate and live site.
- Scoped normal input `@floating-ui/dom@1.7.4` completed at 390 px with no
  horizontal overflow. With reduced motion enabled, document scrolling was
  `auto`, controls had a 0.01 ms transition, and result animation was `none`.
- `@@bad` displayed the npm-name validation error. A nonexistent package
  displayed the registry 404 recovery message; entering `nanoid@5.1.5`
  afterwards completed successfully. The expected 404 does emit Chrome's
  failed-resource console message, despite being handled in the UI.
- Independent axe scans found **0 serious or critical violations** (indeed no
  violations) on candidate desktop/390px and live desktop/390px. Home has one
  H1, a main landmark, labelled input, alt text, and usable `/privacy` and
  `/terms` routes.

### Live/deployment comparison, privacy, security, and caching

- Live `/` returned HTTP 200; `/privacy` and `/terms` returned HTTP 200.
  The candidate-built `index.html`, `assets/index-CFQszz9z.js`, and
  `assets/index-1Fj1dcuU.css` match the live bytes exactly (the JS SHA-256 is
  `e493635f129dd21aeb34a9004449bf699806d40d28308de1dc98f3df46401303`).
  The deployed product therefore matches candidate application code.
- Request capture for a real analysis saw only the same origin and
  `registry.npmjs.org` (plus browser blob resources); static source inspection
  found no analytics, cookies, local/session storage, remote fonts, or
  third-party scripts. The privacy claim is substantially supported: registry
  and tarball requests are necessarily visible to npm.
- Live responses have HTTPS/HSTS, CSP limiting `connect-src` to npm, nosniff,
  referrer, and permissions policies. Content-hashed JS/WASM use one-year
  immutable caching; HTML and `sw.js` are revalidated after 30 seconds.
  There is no `frame-ancestors` CSP directive or `X-Frame-Options`, so the page
  remains frameable.

## Defects

### P1 — central export-report contract is incomplete

The brief promises cost per public subpath export and per named export after
tree-shaking. Real `date-fns@4.1.0` reports **741 public entries**, but the
initial report renders only **4** measurements. The picker says and enforces
“Select up to eight public entries”; choosing another set replaces the table,
so there is no complete result/report for the package. Named export analysis
is likewise limited to ten names from the first measured entry. This prevents
the core comparison job for packages with many exports.

### P1 — specified embeddable badge endpoint is absent

The researched brief calls for an SVG badge served by a tiny worker. The
candidate has only a `Download SVG badge` button that creates a local Blob;
there is no worker, badge route, or stable embeddable URL. The candidate's own
handoff acknowledges this deviation.

### P1 — PWA update is stale when an ordinary deployment changes only app assets

`public/sw.js` uses the fixed cache name `package-ledger-shell-v1` and answers
documents cache-first. In an isolated localhost production-build test, I
registered the worker, changed the server's `index.html` while leaving
`sw.js` identical, called `registration.update()`, and reloaded. The new
`#deployment-marker` was absent (`0` matches): the old cached document won.
The worker is not revisioned/generated with each build, so a normal new
hashed app deployment can stay stale until `sw.js` is independently changed.
This fails the required service-worker update check.

### P2 — advertised install footprint undercounts optional dependencies and can be a silent lower bound

`countDependencies` walks only `dependencies`; root and transitive
`optionalDependencies` are excluded, although they can be installed. It also
stops at 400 packages. The UI denotes `400+` for the count but still labels the
partial byte sum simply “Installed footprint”, not a lower bound. This can
mislead dependency-bloat decisions.

### P3 — handled missing-package path still creates a browser console error

A nonexistent package is presented clearly in the UI, but its intentional npm
404 appears as “Failed to load resource” in Chromium's console. It is minor,
but means the error/recovery path is not console-clean.

### P3 — frame protection is missing

The CSP has useful restrictions but omits `frame-ancestors`; live headers also
omit `X-Frame-Options`. Add one of these frame protections as part of the
security header set.

## Required resolution before PASS

Implement/export a complete, usable per-entry report (including many explicit
exports and a defined pattern-export policy), remove the ten-name limitation
or make its limitation non-misleading, provide the promised worker-backed
badge URL, and version/precache the PWA shell so a normal deployment reliably
updates. Correct or qualify install-footprint totals, then rerun this audit.
