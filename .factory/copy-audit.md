# Copy audit — perfection loop 2

Count method: whitespace-delimited words; hyphenated terms count as one. All
landing and README sentences are at most 22 words and contain no banned
marketing wording. Claims are linked to `.factory/claims.json` by id.

## Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Compare npm package costs before you install. | 7 | Pass |
| For frontend and Node developers choosing a dependency, see installed size and each entry point’s bundle size. | 17 | Pass |
| Open a completed package report. | 5 | Pass |
| No payment or account. | 4 | `no-account-analytics` |
| Reloads offline after the first visit. | 6 | `offline-reload` |
| Real measurements contact npm directly. | 5 | `npm-direct` |
| See its installed size and bundle sizes. | 7 | Pass |
| Your browser is measuring this package. | 6 | `npm-direct` |
| Your browser downloads public package files from npm. | 8 | `npm-direct` |
| Review installed size and bundle size. | 6 | `sample-report` |
| One package can expose several entry points. | 7 | `sample-report` |
| Each can add a different bundle size. | 7 | `sample-report` |
| This page still works, but npm must be reachable to measure a new package. | 14 | `offline-reload` |
| Your app settings and shared code can change the final size. | 11 | Scope statement |
| Confirm important numbers in your own build. | 7 | Instruction |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| Package Cost Explorer measures installed size and bundle size for each npm package entry point. | 14 | `sample-report` |
| It is for frontend and Node developers choosing a dependency. | 10 | Audience |
| The demo uses fixed date-fns@4.1.0 data, makes no npm request, and saves no report. | 14 | `demo-isolation` |
| Resetting the demo removes only browser-storage keys that start with demo:. | 10 | `demo-isolation` |
| Real measurements download public package files from npm and complete in this browser. | 12 | `npm-direct` |
| The site uses no account, payment, analytics, tracking cookies, or saved reports. | 12 | `no-account-analytics` |
| Its interface reloads offline after the first visit. | 8 | `offline-reload` |
| A completed report includes installed size, production dependency count, and bundle size for each package entry point. | 17 | `sample-report` |
| It can copy a report link and an SVG badge for the measured package. | 14 | `report-sharing` |
| Figures are estimates, so confirm important decisions in your own application build. | 12 | Scope statement |

## Terminology

| Concept | One term used |
| --- | --- |
| npm artifact | package |
| public import path | package entry point |
| browser JavaScript result | bundle size |
| installed disk estimate | installed size |
| sample experience | demo |
| produced output | package report |
