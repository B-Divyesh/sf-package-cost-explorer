# Copy audit — repair 6

Count method: whitespace-delimited words; hyphenated terms count as one. This
audit covers the landing page, shared and recovery states, demo, legal pages,
both 404 forms, install metadata, and README. No sentence exceeds 22 words or
uses a banned marketing word. Public claims map to `.factory/claims.json`.

## Home and shared states

| Copy | Words | Result |
| --- | ---: | --- |
| Compare npm package costs before you install. | 7 | Job title |
| For frontend and Node developers choosing a dependency, see installed size and each entry point’s bundle size. | 17 | Audience and result |
| Try it with sample data | 5 | Action |
| Open a completed package report. | 5 | Action outcome |
| No payment or account. | 4 | `no-account-analytics` |
| Reloads offline after the first visit. | 6 | `offline-reload` |
| Real measurements contact npm directly. | 5 | `npm-direct` |
| Measure this package | 3 | Action |
| See its installed size and bundle sizes. | 7 | Result |
| Use date-fns / Use lodash-es | 5 | Example actions |
| One package can expose several entry points. | 7 | `sample-report` |
| Each can add a different bundle size. | 7 | `sample-report` |
| You are offline. | 3 | `offline-reload` |
| This page still works, but npm must be reachable to measure a new package. | 14 | `offline-reload` |
| An update is ready. | 4 | Update state |
| Your browser is measuring this package. | 6 | `npm-direct` |
| Measurement cancelled. No report was created. | 6 | Recovery state |
| Measurement cancelled. The previous report remains available. | 7 | Recovery state |
| From npm package to size report. | 6 | Process heading |
| Enter a package name and version. | 6 | Step |
| Your browser downloads public package files from npm. | 8 | `npm-direct` |
| Review installed size and bundle size. | 6 | `sample-report` |
| Your app settings and shared code can change the final size. | 11 | Scope |
| Confirm important numbers in your own build. | 7 | Instruction |
| Compare installed size and bundle size before adding a dependency. | 10 | Footer description |
| Hero artwork was generated for this project with Azure OpenAI. | 10 | Provenance |

## Demo and report

| Copy | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | `demo-isolation` |
| See a completed npm package report. | 6 | Demo title |
| This fixed sample shows installed size, package entry points, and bundle sizes. | 12 | `sample-report` |
| It makes no npm request. | 5 | `demo-isolation` |
| Sample reset. | 2 | Reset outcome |
| These fixed values demonstrate the report and are not a current measurement. | 12 | Sample qualification |
| Each published entry point can include a different amount of JavaScript. | 11 | Entry explanation |
| Production dependencies add to the installed size. | 7 | Dependency explanation |
| Recent installed-size figures reported in npm package details. | 8 | Chart explanation |
| The sample link opens this isolated report. | 7 | `report-sharing` |
| The badge contains the sample package, version, and gzip size. | 10 | `report-sharing` |
| The link measures this public package version again. | 8 | `report-sharing` |
| The badge contains its package, version, and gzip size. | 9 | `report-sharing` |

## Privacy and terms

| Copy | Words | Result |
| --- | ---: | --- |
| Effective 28 August 2026 | 4 | Direct date label |
| Package Cost Explorer uses no account, payment, analytics, tracking cookies, or saved reports. | 13 | `no-account-analytics` |
| When you measure a real package, your browser requests public package details and files directly from npm. | 17 | `npm-direct` |
| npm may record those requests under its own privacy terms. | 10 | Disclosure |
| The demo uses fixed sample data. | 6 | `demo-isolation` |
| It does not contact npm or read or write browser storage. | 11 | `demo-isolation` |
| After one visit, a service worker caches the interface so it can reload offline. | 14 | `offline-reload` |
| A new real measurement still needs npm. | 7 | `offline-reload` |
| Clear this site’s storage to remove the cached interface. | 9 | Instruction |
| Shared result URLs include a public package name and version. | 10 | `report-sharing` |
| Package Cost Explorer provides estimates for dependency choices. | 8 | Scope |
| Confirm important figures in your own application build. | 8 | Instruction |
| The report measures published JavaScript for a browser target. | 9 | Scope |
| Build settings, shared code, package changes, and network failures can change a result. | 13 | Scope |
| Review package licenses, security, and suitability yourself. | 7 | Instruction |
| Do not use this site to overload npm or inspect private packages. | 12 | Restriction |
| The software is provided “as is,” without warranty. | 8 | Legal term |
| The repository license governs reuse of the source code. | 9 | Legal term |

## Not-found and install surfaces

| Copy | Words | Result |
| --- | ---: | --- |
| Page not found | 3 | Direct label on both 404 forms |
| This package page does not exist. | 6 | 404 title |
| The address may be incomplete or out of date. | 9 | Recovery explanation |
| Return home | 2 | Action |
| Open the sample report | 4 | Action |
| Package Cost Explorer | 3 | Manifest name and short name |
| Compare installed size and bundle size for npm package entry points. | 11 | Manifest description; `sample-report` |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| Package Cost Explorer measures installed size and bundle size for each npm package entry point. | 15 | `sample-report` |
| It is for frontend and Node developers choosing a dependency. | 10 | Audience |
| The demo uses fixed date-fns@4.1.0 data, makes no npm request, and saves no report. | 14 | `demo-isolation` |
| Resetting the demo removes only browser-storage keys that start with demo:. | 11 | `demo-isolation` |
| Real measurements download public package files from npm and complete in this browser. | 13 | `npm-direct` |
| The site uses no account, payment, analytics, tracking cookies, or saved reports. | 12 | `no-account-analytics` |
| Its interface reloads offline after the first visit. | 8 | `offline-reload` |
| New package measurements still require npm. | 6 | `offline-reload` |
| A completed report includes installed size, production dependency count, and bundle size for each package entry point. | 17 | `sample-report` |
| It can copy a report link and an SVG badge for the measured package. | 14 | `report-sharing` |
| Figures are estimates, so confirm important decisions in your own application build. | 12 | Scope |

## Terminology

| Concept | One term used |
| --- | --- |
| npm artifact | package |
| public import path | package entry point |
| browser JavaScript result | bundle size |
| installed disk estimate | installed size |
| sample experience | demo |
| produced output | package report |
