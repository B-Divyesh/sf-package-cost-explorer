# Review 2 handoff

## Outcome

Adversarial first-read review 2 is complete at revision
`54884a13b2b5152fcbfa785d07a794f3f3a4705d`. The verdict is **FAIL** with no
blocking findings, two major claim-contract gaps, and six minor findings. No
product code was changed.

The full evidence and required fixes are in `.factory/review-2.md`.

## What was checked

- Cold live loads at 390 × 844 and 1440 × 900.
- Complete landing and README copy audit with word counts.
- One-click demo, populated sample, banner, reset, exit, real-storage
  sentinels, cross-origin interception, and offline reload.
- All six `.factory/claims.json` commands from a clean clone.
- Home, Demo, Privacy, Terms, and not-found titles, metadata, semantics,
  console, axe, deep links, focus, Back behavior, mobile overflow, and links.
- Product-specific visual identity and reduced-motion support.
- Unit tests, production build, and the live real-package smoke test.

## Verification summary

```text
Clean clone: /tmp/pce-review2-clean-qQ3BCM/repo
All six individual claim commands: PASS
npm test: PASS (24 unit + 2 badge-worker tests)
npm run build: PASS; dist/ produced
npm run test:live: PASS
Live Axe serious/critical findings: 0 on five checked routes
Live link failures: 0
Live console errors: 0
```

Temporary screenshots were captured at:

- `/tmp/review-2-mobile.png`
- `/tmp/review-2-desktop.png`
- `/tmp/review-2-demo-mobile.png`
- `/tmp/review-2-demo-desktop.png`

## Remaining work

The repairer should address the findings in severity order:

1. Add production dependency count to the claim contract and assertion.
2. Complete a fixture-backed npm package-file measurement in the privacy test.
3. Test that a completed real report is not persisted.
4. Remove or quantify the dependency-duration sentence.
5. Keep all three facts in the first 390 px viewport.
6. Standardize installed-size and bundle-size terminology.
7. Rename the package example buttons with verbs.
8. Replace the README's storage-namespace jargon.

After repair, rerun every claim command from a clean clone and repeat the live
mobile first-screen, demo-isolation, offline, route, link, and axe checks.
