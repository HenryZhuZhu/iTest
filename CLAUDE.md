# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**iTest** — Portal page Demo for CXMT's **Intelligent PTE Tool Platform** (测试智能研发平台, `itest.cxmt.com`). It's a static HTML demo, **no build system, no package manager, no tests**. Open the HTML files directly in a browser. The homepage aggregates 7 first-class tools; one of them (EFA Tools) is a "collection" entry that links to a dedicated sub-page hosting 11 sub-tools across 5 categories.

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
| `index.html` | **live** | Homepage — Header A · Hero A · Tools grid (Modules A) · Footer B |
| `efa-tools.html` | **live** | EFA sub-page — Header A · EFA C (sidebar + grid) · Footer B |
| `styles.css` | **live** | Shared design system used by every live page |
| `analytics.js` | **live** | OpenReplay tracker bootstrap + iTest event bindings; included as `<script type="module">` on every live page. Fill in `PROJECT_KEY` / `INGEST_POINT` once OpenReplay is deployed. See `Monitoring.md`. |
| `Design.md` | docs | Reusable Apple-style design system spec (drop into other projects) |
| `Monitoring.md` | docs | Self-hosted OpenReplay / PostHog setup + integration guide |
| `User.md` | docs | Department / sub-department headcount (137 users across 6 top-level depts) — authoritative source for dashboard rollups |
| `dashboard/condition-table.html` | **live** | Ops dashboard for Condition Table — KPI + team coverage + dormant users + unattended products + daily activity + hot columns + intents + interaction hotspot. Reuses `../styles.css` + own `dashboard.css`. Mock data lives in `mock-data.js`. |
| `dashboard/dashboard.css` | **live** | Dashboard-specific components (KPI tile, coverage card, bar chart, activity table, site chips, heatmap placeholder) |
| `dashboard/dashboard.js` | **live** | Render functions per section; reads `window.MOCK`. Swap mock reads for `fetch()` when APIs land. |
| `dashboard/mock-data.js` | **live** | Mock data (departments from User.md, 131 users, 14 products, 14 columns, 10 intents) + `getUserDetail(id)` helper that synthesizes per-user breakdowns (products, columns, intents, 14-day history, sessions). Replace once OpenReplay + Condition Table backend APIs are wired up. |
| `dashboard/user.html` | **live** | Single-user detail page — opened via `user.html?id=usr-XYZ` from any clickable username on the dashboard. Header card · KPI strip · products maintained · 14-day edit history · per-user hot columns/intents · recent sessions. |
| `dashboard/user.js` | **live** | Renders user detail page from `MOCK.getUserDetail()`. Falls back to a friendly "User not found" panel when the id query param is missing or invalid. |
| `dashboard/tv.html` + `tv.css` + `tv.js` | **live** | **TV wall display** — full-screen single-view dashboard for always-on big-screen viewing. Forces dark mode. Top bar (logo · live clock · LIVE indicator) + 2×2 glass panels: Today's Pulse (hero KPIs) · Team Coverage · Live Activity Feed (auto-cycling, new event every ~4s) · What's Hot (top columns + intents, ranks shuffle every 30s). Zero interaction expected; everything updates on timers. |
| **Tool detail pages (16)** | **live** | One page per tool, all using the same template (see below) |
| `variations.html` | reference | Design gallery showing the 14 variations across 5 sections that were used to pick the current combo |
| `combos.html` | reference | Interactive switcher that lets you preview any of the 16 selected combinations |
| `index.v0.html` | backup | Tailwind-era one-page draft; cyan→violet gradient palette, mixed CN/EN — predecessor to the current `index.html`, do not edit |

**Tool detail pages** (slug = filename minus `.html`):

| Tool | File | Source category | Icon class |
|---|---|---|---|
| Condition Table | `condition-table.html` | Product | `grad-1` |
| Fuse-Control Table | `fuse-control-table.html` | Product | `grad-2` |
| Test Methods | `test-methods.html` | Product | `grad-3` |
| Test Management | `test-management.html` | Product | `grad-4` |
| TTR | `ttr.html` | Product | `grad-5` |
| DFT | `dft.html` | Product | `grad-6` |
| FSA Analysis | `fsa-analysis.html` | EFA → Common | `grad-1` |
| Sense Margin | `sense-margin.html` | EFA → Common | `grad-1` |
| Load Fuse table | `load-fuse-table.html` | EFA → EFA | `grad-3` |
| Bitview | `bitview.html` | EFA → EFA | `grad-3` |
| PFA Tool | `pfa-tool.html` | EFA → EFA | `grad-3` |
| Mapstudio | `mapstudio.html` | EFA → EFA | `grad-3` |
| Nano Probe Data Analysis | `nano-probe-data-analysis.html` | EFA → EFA | `grad-3` |
| DC Data Analysis | `dc-data-analysis.html` | EFA → DC | `grad-4` |
| One Click | `one-click.html` | EFA → DC | `grad-4` |
| Bit-level Leakage Extraction | `bit-level-leakage-extraction.html` | EFA → AV | `grad-5` |
| Fuse Array FSA | `fuse-array-fsa.html` | EFA → Anti Fuse | `grad-6` |

When the user references "the portal" or design tweaks, **edit the live HTML files + `styles.css`**. The variation gallery and combo picker are frozen artifacts of the selection process; reuse them as a source of reference markup if the user wants to swap in a different variation.

## Tool detail page template

Every tool detail page follows the same structure (see `condition-table.html` as the canonical example):

1. **Shared header** — brand · Products dropdown · theme toggle · account icon
2. **Page header** (`.efa-wrap > .efa-head`) — breadcrumb · `<h2>` title · description · single primary CTA
3. **Preview block** (`.tool-preview`) — 16:9 macOS-window mockup with `.preview-chrome` (traffic lights + monospace title), `.preview-canvas` (grid pattern), `.preview-cell` (active-cell highlight). Replace inner with `<img>` / `<video>` later.
4. **Statement section** (`.statement-section`) — single editorial pull-line with gradient highlight on key phrase
5. **Capabilities bento** (`.feature-grid` with one `.featured` 2×2 + two `.feature-card` + one `.wide`)
6. **Use case** (`.use-case-grid` — left meta-label / right pull-paragraph)
7. **Related tools** (`.related-grid` with three `.related-card` links)
8. **Shared footer** — brand + Tools list (7 links, all wired)
9. **Bottom script** — theme toggle sync + `IntersectionObserver` for `.reveal` scroll-fade

Cross-page wiring: homepage card → tool page; nav dropdown items → tool pages; footer Tools list → tool pages. EFA tool cards on `efa-tools.html` → individual EFA tool pages. Breadcrumb on each EFA tool page goes back to `efa-tools.html`; breadcrumb on each Product page goes back to `index.html`.

## Architecture & navigation

- **Homepage** (`index.html`) = sticky header + Hero + "Tools" grid + Footer. The grid shows 6 products as equal cards plus a 7th full-width "collection" card for EFA Tools that links to `efa-tools.html`.
- **EFA sub-page** (`efa-tools.html`) = same header/footer + breadcrumb "Home / EFA Tools" + sticky category sidebar + per-category tool grids. The breadcrumb's "Home" link goes back to `index.html`. Section anchors are `#Common #EFA #DC #AV #AF`.
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

EFA Tools sub-page categories (5 categories, 11 tools total):
- **Common** (2): FSA Analysis, Sense Margin
- **EFA** (5): Load Fuse table, Bitview, PFA Tool, Mapstudio, Nano Probe Data Analysis
- **DC** (2): DC Data Analysis, One Click
- **AV** (1): Bit-level Leakage Extraction
- **Anti Fuse** (1): Fuse Array FSA

## Style direction (current)

The user has explicitly chosen: **Apple aesthetic**, **pure English** copy, and **EFA Tools as an independent sub-page** with its own URL. Do not reintroduce Chinese copy, Tailwind, AI-gradient styling, or inline EFA sub-tools on the homepage unless the user changes direction. When in doubt about which look to apply, mirror `styles.css` — not `index.v0.html`.
