# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**iTest** — Portal page Demo for CXMT's **Intelligent PTE Tool Platform** (测试智能研发平台, `itest.cxmt.com`). It's a static HTML demo, **no build system, no package manager, no tests**. Open the HTML files directly in a browser. The homepage aggregates 7 first-class tools; one of them (EFA Tools) is a "collection" entry that links to a dedicated sub-page hosting 12 sub-tools across 6 categories.

## Commands

```bash
open index.html         # the homepage (final picked combo)
open efa-tools.html     # the EFA Tools sub-page
open variations.html    # frozen design gallery — used during selection, kept for reference
open combos.html        # frozen interactive combo picker — also kept for reference
```

All four `open` paths are pre-allowed in `.claude/settings.local.json`.

## File layout

| File | Status | What it is |
|---|---|---|
| `index.html` | **live** | Final homepage — Header A · Hero A · Tools grid (Modules A) · Footer B |
| `efa-tools.html` | **live** | Final EFA sub-page — Header A · EFA C (sidebar + grid) · Footer B |
| `styles.css` | **live** | Shared design system used by both live pages |
| `variations.html` | reference | Design gallery showing the 14 variations across 5 sections that were used to pick the current combo |
| `combos.html` | reference | Interactive switcher that lets you preview any of the 16 selected combinations |
| `index.v0.html` | backup | Tailwind-era one-page draft; cyan→violet gradient palette, mixed CN/EN — predecessor to the current `index.html`, do not edit |

When the user references "the portal" or design tweaks, **edit `index.html` + `efa-tools.html` (with CSS in `styles.css`)** — the live pair. The variation gallery and combo picker are frozen artifacts of the selection process; reuse them as a source of reference markup when the user wants to swap in a different variation.

## Architecture & navigation

- **Homepage** (`index.html`) = sticky header + Hero + "Tools" grid + Footer. The grid shows 6 products as equal cards plus a 7th full-width "collection" card for EFA Tools that links to `efa-tools.html`.
- **EFA sub-page** (`efa-tools.html`) = same header/footer + breadcrumb "Home / EFA Tools" + sticky category sidebar + per-category tool grids. The breadcrumb's "Home" link goes back to `index.html`. Section anchors `#SA #LP #DDR #PVA #AV #AF` allow footer deep-links from the homepage.
- **Header nav** (left → right): `iTest` brand (logo placeholder, links to homepage) · `Products` link with **hover-triggered dropdown** listing all 7 entries (6 products → `#` placeholders, then a divider, then EFA Tools → `efa-tools.html`) · theme toggle · account icon.

### Terminology — three labels, used deliberately

The same set of 7 entries is referred to with three different words in three different places. This is intentional and should be preserved when editing:

- **`Products`** — used in the header nav dropdown (brand-level label, like apple.com's "Mac").
- **`Tools`** — used as the homepage section heading and the footer column heading (page-level label, emphasizes utility).
- **`grad-7` / "collection"** — visual treatment reserved for EFA Tools, signalling it's an aggregator entry distinct from the 6 product cards.

The HTML anchor `id="modules"` on the section is a leftover identifier; the visible label was changed but the id is kept stable so older links (`#modules`) still scroll correctly. Don't rename the id.

## Design system (`styles.css`)

CSS custom properties drive light/dark theming:
- Toggle: clicking `#theme-toggle` flips `html.dark`. Defaults respect `prefers-color-scheme`. User choice persists in `localStorage` under key `itest-theme`.
- Token names: `--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--border-strong`, `--accent`, `--accent-hover`, `--shadow-{sm,md,lg}`, `--nav-bg`.
- Card icon gradients: `grad-1` through `grad-7`. `grad-7` (graphite/near-black) is reserved for the EFA Tools collection entry — never use it for individual product cards.
- Font stack starts with `-apple-system` → renders real SF Pro on macOS; falls back to Inter / Helvetica Neue elsewhere.

Interactive scripts are inline at the bottom of each HTML file (not in a separate JS file): theme toggle sync, and on `efa-tools.html`, an `IntersectionObserver` that highlights the sidebar's active category as the user scrolls.

## Product data (authoritative source: `index.html` + `efa-tools.html`)

7 first-class tools on the homepage:
1. Condition Table — Condition Table Online Editor
2. Fuse-Control Table — Single source of Fuse information for all products
3. Test Methods — All Patterns you can find here
4. Test Management — Test plans generator
5. TTR — Test Time Reduction
6. DFT — Design for Test
7. **EFA Tools** — collection entry → `efa-tools.html`

EFA Tools sub-page categories (12 tools total):
- **SA** (2): FSA Analysis, Sense Margin
- **EFA LP** (1): Load Fuse table
- **EFA DDR** (4): Bitview, PFA Tool, Mapstudio, Nano Probe Data Analysis
- **PVA** (2): DC Data Analysis, One Click
- **AV** (2): FSA Analysis, Bit-level Leakage Extraction
- **Anti Fuse** (1): Fuse Array FSA

The same name "FSA Analysis" appears under both SA and AV — they are different tools; preserve the category context.

## Style direction (current)

The user has explicitly chosen: **Apple aesthetic**, **pure English** copy, and **EFA Tools as an independent sub-page** with its own URL. Do not reintroduce Chinese copy, Tailwind, AI-gradient styling, or inline EFA sub-tools on the homepage unless the user changes direction. When in doubt about which look to apply, mirror `styles.css` — not `index.v0.html`.
