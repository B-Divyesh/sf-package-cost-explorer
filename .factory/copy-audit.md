# Copy audit — perfection loop 1

Count method: whitespace-delimited words; hyphenated terms count as one. No
landing sentence exceeds 22 words, and no banned marketing word appears.

| Landing copy | Words | Result |
| --- | ---: | --- |
| npm package size checker | 4 | Pass |
| Compare npm package costs before you install. | 7 | Pass |
| For frontend and Node developers choosing a dependency, see install size and each import’s bundle size. | 15 | Pass |
| Try it with sample data | 6 | Pass |
| Open a completed package report. | 5 | Pass |
| Package and version | 3 | Pass |
| Measure this package | 3 | Pass |
| See its install and import sizes. | 7 | Pass |
| Free to use. | 3 | Pass; tested claim |
| No account. | 2 | Pass; tested claim |
| Reloads offline after the first visit. | 6 | Pass; tested claim |
| Real measurements contact npm directly. | 5 | Pass; tested claim |
| One package can expose several entry points. | 7 | Pass |
| Each can add a different bundle size. | 7 | Pass |
| You are offline. | 3 | Pass |
| This page still works, but npm must be reachable to measure a new package. | 13 | Pass; tested claim |
| An update is ready. | 4 | Pass |
| Your browser is measuring this package. | 6 | Pass |
| Large dependency lists can take longer. | 6 | Pass |
| From npm package to size report. | 6 | Pass |
| Choose a package. | 3 | Pass |
| Enter a package name and version. | 6 | Pass |
| Measure its files. | 3 | Pass |
| Your browser downloads public package files from npm. | 8 | Pass; tested claim |
| Compare entry points. | 3 | Pass |
| Review installed size and compressed JavaScript size. | 7 | Pass |
| What the estimate does not decide | 6 | Pass |
| Your app settings and shared code can change the final size. | 10 | Pass |
| Confirm important numbers in your own build. | 7 | Pass |

## Terminology

| Concept | One term used |
| --- | --- |
| npm artifact | package |
| public import path | package entry point |
| browser JavaScript result | bundle size |
| installed disk estimate | installed size |
| sample experience | demo |
| produced output | package report |
