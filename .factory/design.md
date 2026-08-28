# Design thesis — The Package Ledger

## Direction and rationale

Package Cost Explorer is a **monochrome typographic broadsheet**: a technical newspaper page crossed with a print-room proof. Dependency decisions deserve the feel of an audited ledger, not a glossy marketing dashboard. Large serif headlines create editorial conviction; compact grotesque utilities and tabular numbers make measurements scannable. Cyan proof marks are reserved for interactive or newly computed facts, like an editor's correction ink.

This is an explicitly single-mode, light interface. The warm paper field and dark ink are the identity; painting the background prevents system dark mode from changing its meaning.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Paper | `#f1efe8` | Page background, evokes uncoated stock |
| Sheet | `#fbfaf5` | Raised result fields |
| Ink | `#121513` | Primary copy and rules |
| Muted ink | `#565b57` | Explanations, still ≥ 4.5:1 on paper |
| Proof cyan | `#006f7a` | Links, focus, computed-state accents |
| Pale cyan | `#d9e9e8` | Selected and informational surfaces |
| Success | `#23613f` | Completed analysis |
| Warning | `#805b00` | Browser/runtime limitations |
| Danger | `#a12a25` | Fetch and input errors |

Color never carries state alone; all states also use a label or symbol.

## Type

- Display/editorial: Georgia, Cambria, `Times New Roman`, serif. This no-download system serif is deliberate: it looks like a broadsheet masthead and eliminates font payload.
- Utility/data: `Arial Narrow`, `Roboto Condensed`, Arial, sans-serif. Labels are uppercase with tracking; figures use `font-variant-numeric: tabular-nums`.
- Scale: 12, 14, 16, 20, 28, and clamp(44–88) px. Body never falls below 16px. Reading measure is 68 characters.

## Layout and spacing

The page uses an 8px base rhythm, with 4px for optical micro-spacing. A centered 1240px broadsheet is divided by strong horizontal rules and asymmetrical columns. Inputs form the lead story; output becomes the edition below. Independent facts are separated by rules rather than generic rounded cards. At 390px, masthead utilities wrap, the illustration reduces to a narrow banner, tables become labeled stacked rows, and secondary explanatory copy is shortened.

## Interaction grammar

- Buttons and fields are square-edged, physical print controls with 2px ink borders and a 3px cyan offset shadow on hover/focus.
- Links receive an editorial underline. Entry rows are selectable with real checkboxes and ≥44px hit areas.
- Analysis advances as named dispatches (metadata → dependency ledger → bundle desk), with a live text log and determinate progress.
- Results use plain-language confidence notes beside exact numbers. Errors state the failing desk and a next action.

## Motion policy

Only computed results move: new sections reveal upward by 8px over 220ms and the progress bar changes width over 180ms. Hover feedback is 150ms. No ambient or looping motion. Under `prefers-reduced-motion: reduce`, transforms and transitions are removed and results appear instantly.

## Original asset plan and provenance

One hero illustration visualizes an opened npm package archive as layers of black paper, with branching cyan export paths and halftone dependency nodes. It clarifies the product's mental model: one package can have many differently sized public entry points.

**Prompt sheet**

- Subject: abstract opened archive/folder whose paper layers branch into a precise dependency tree
- World: printmaker's workbench / technical newspaper diagram
- Materials: torn uncoated paper, black ink, cyan proof ink, coarse halftone dots
- Light/lens: flat overhead editorial scan, hard paper shadows, wide crop
- Palette words: warm newsprint, carbon black, restrained deep cyan
- Negative list: text, letters, numbers, logos, brands, people, gradients, glossy 3D, neon, watermark

Asset: `public/assets/package-ledger.webp` (responsive AVIF/WebP), generated 2026-08-27 with Azure OpenAI `factory-image` via `/opt/fleet/lib/gen-image.sh`. Original generated work for this product; prompt stored in `assets/src/package-ledger.prompt.json`. Every shipped candidate is visually reviewed for artifacts before use. Generated imagery is disclosed in the footer.

The 1200×630 social card is a direct crop of that original artwork, produced
locally with Sharp. The apple-touch icon is a raster export of the hand-authored
package-mark favicon. Neither introduces a new source asset or license.

The demo keeps the same broadsheet language. Its cyan proof strip behaves like
a press-room annotation: it stays visible, names the sample state, and holds
the reset and exit controls. The 404 uses an oversized cyan folio number behind
the missing-page notice, extending the ledger metaphor without adding generic
illustration.

## Accessibility and performance intent

Ink/paper combinations meet WCAG AA. Cyan is dark enough for body links and is never the only state marker. Focus uses a 3px cyan outline plus offset. The chart includes a data table alternative. The illustration has explicit dimensions and useful alt text; mobile receives a ≤300 KB rendition. No external runtime fonts, scripts, trackers, or analytics.
