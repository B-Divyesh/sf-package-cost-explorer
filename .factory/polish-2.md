# Polish 2 — review finding closure

Repair commits: `e40f70dd23e7bbde28fdb72f9b5091688bcb9f4e`, `1f80fe8482a819103ab3323e74fd4ea7d1ee698a`

Live URL: <https://package-cost-explorer.sociobot.in>
Evidence directory: `/tmp/pce-polish2-live/`

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| R1-B1 demo sandbox | Kept `/demo` and `?demo=1` as a memory-only fixed report with persistent banner, Reset demo, and Start for real. Reset only removes `demo:` keys. | `@claim:demo-isolation`; `demo-mobile.png`; live `/?demo=1` made no cross-origin request. |
| R1-B2 claim contract | Retained only testable promises in `.factory/claims.json`, with exactly one tagged Playwright test for each. | All six clean-clone claim commands passed. |
| R1-B3 first-screen audience | The home screen names frontend and Node developers and says what the metrics mean. | `home is clear, keyboard-ready, and accessible`; `home-mobile.png`. |
| R1-B4 404 | Unknown server URLs return the designed standalone 404, while client routes render their contextual not-found state. | Cold `curl /not-a-real-route` → 404; `404-mobile.png`; live Axe check. |
| R1-M1 metadata and navigation | Route titles, descriptions, canonical/OG/Twitter fields, header nav, footer legal links, and route-focus behavior remain route-aware; static 404 now has matching essentials. | `demo, legal, and not-found routes have distinct metadata and accessible states`; live route check. |
| R1-M2 jargon and unnamed action | Preserved plain wording and result-naming actions; the examples are now “Use date-fns” and “Use lodash-es.” | `home is clear, keyboard-ready, and accessible`; copy audit. |
| R1-m1 offline state | Offline reload keeps the demo report and exposes the visible offline state; real measurement is disabled after exit. | `@claim:offline-reload`; `npm run test:offline`. |
| R2-M1 dependency count claim | `sample-report` now names and asserts the visible production-dependency field; the completed npm fixture additionally proves a count of 1. | `@claim:sample-report`; `@claim:npm-direct`. |
| R2-M2 npm file/privacy claim | Replaced the search-only test with a deterministic public npm search, packument, dependency, and tarball measurement that reaches browser bundling; it asserts npm-only package requests and no analysis endpoint. | `@claim:npm-direct`; `npm run test:privacy`. |
| R2-m1 saved reports | Completed real measurement now inspects cookies, account/payment UI, request list, local/session storage, IndexedDB, Cache Storage, and a fresh page. | `@claim:no-account-analytics`; `npm run test:privacy`. |
| R2-m2 vague duration | Removed “Large dependency lists can take longer.” | Copy audit; live home check. |
| R2-m3 phone facts | Moved and compacted all three facts before the real form; the last ends at 575.7 px in the 844 px mobile viewport. | Mobile browser assertion; `home-mobile.png`. |
| R2-m4 metric names | Standardized visitor copy on “installed size” and “bundle size.” | `.factory/copy-audit.md`; clean-clone browser suite. |
| R2-m5 example buttons | Added visible verb-first labels to both example controls. | `home is clear, keyboard-ready, and accessible`; live home check. |
| R2-m6 README storage jargon | Rewrote the demo reset sentence in plain words. | `.factory/copy-audit.md`; README review. |

Historical badge and manifest defects recorded in the earlier verification
reports remain covered by the clean-clone browser suite and the deployed badge
route. The final deploy additionally installs `api/` dependencies from
`npm run build`; `npm run test:live` passed after deployment. No earlier review
finding remains open.
