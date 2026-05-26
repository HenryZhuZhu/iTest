# Design.md — Apple-style Product Portal Design System

A reusable visual & interaction spec for product portals, landing pages, and tool catalogs. Drop this file into any project and instruct Claude: **"Follow Design.md."**

> Aesthetic: Apple — calm, generous whitespace, soft vibrancy, restrained color, gradient as accent (never as background), pill-shaped CTAs, large display type with tight tracking.

---

## 1. Philosophy

| Principle | What it means in practice |
|---|---|
| **Calm by default** | No more than one gradient per viewport. Color is for accent and meaning, not decoration. |
| **Type is the design** | A display-sized heading (52–100px) does most of the visual heavy lifting. Body text is small and quiet. |
| **Soft surfaces** | Cards never have harsh borders; they rely on 1px translucent borders + ambient shadow on hover. |
| **Vibrancy** | Sticky surfaces (header, traffic-light bar) use `backdrop-filter: blur(20px) saturate(180%)` against translucent backgrounds. |
| **One CTA per band** | Hero and detail pages take a single primary button. Secondary actions live as ghost links. |
| **Light & dark are equals** | Both themes are designed, not generated. Tokens flip; component shapes never change. |

---

## 2. Color tokens

Drive every color through CSS variables. Toggle theme by adding `dark` class to `<html>`.

```css
:root {
  --bg:            #fbfbfd;
  --surface:       #ffffff;
  --surface-2:     #f5f5f7;
  --text:          #1d1d1f;
  --muted:         #86868b;
  --border:        rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.14);
  --accent:        #0071e3;   /* Apple blue */
  --accent-hover:  #0077ed;
  --shadow-sm:     0 1px 2px  rgba(0, 0, 0, 0.04);
  --shadow-md:     0 4px 24px rgba(0, 0, 0, 0.06);
  --shadow-lg:     0 20px 60px rgba(0, 0, 0, 0.08);
  --nav-bg:        rgba(251, 251, 253, 0.72);
}
html.dark {
  --bg:            #000000;
  --surface:       #1d1d1f;
  --surface-2:     #161617;
  --text:          #f5f5f7;
  --muted:         #86868b;          /* muted stays the same — it's the bridge */
  --border:        rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.16);
  --accent:        #2997ff;
  --accent-hover:  #47a7ff;
  --shadow-sm:     0 1px 2px  rgba(0, 0, 0, 0.4);
  --shadow-md:     0 4px 24px rgba(0, 0, 0, 0.3);
  --shadow-lg:     0 20px 60px rgba(0, 0, 0, 0.5);
  --nav-bg:        rgba(0, 0, 0, 0.72);
}
```

### Accent gradients (icon tiles, category chips)

Reserved for **icons inside category tiles** — never for backgrounds or large surfaces.

```css
.grad-1 { background: linear-gradient(140deg, #00b4d8, #0077b6); }  /* teal */
.grad-2 { background: linear-gradient(140deg, #ff9500, #ff6b00); }  /* orange */
.grad-3 { background: linear-gradient(140deg, #af52de, #5e5ce6); }  /* purple */
.grad-4 { background: linear-gradient(140deg, #34c759, #00a86b); }  /* green */
.grad-5 { background: linear-gradient(140deg, #ff3b30, #ff2d55); }  /* red/pink */
.grad-6 { background: linear-gradient(140deg, #5856d6, #007aff); }  /* indigo/blue */
.grad-7 { background: linear-gradient(140deg, #424245, #1d1d1f); }  /* graphite — for "collection" / aggregator entries */
html.dark .grad-7 { background: linear-gradient(140deg, #6e6e73, #2a2a2c); }
```

### Display-text gradient (for `<h1>` highlight word)

```css
.grad-text {
  background: linear-gradient(120deg, #0071e3 0%, #5e5ce6 50%, #af52de 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
html.dark .grad-text {
  background: linear-gradient(120deg, #2997ff 0%, #5e5ce6 50%, #bf5af2 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
```

> **Rule:** the gradient text spans **at most one phrase** per hero. Apply to a `<span class="grad">` inside the `<h1>`, not the whole heading.

---

## 3. Typography

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
             "Inter", "Helvetica Neue", Arial, sans-serif;
font-feature-settings: "cv11", "ss01", "ss03";
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
font-size: 15px; line-height: 1.55;
```

On macOS this resolves to real SF Pro. Fall back stack matches feel on other OSes.

### Scale

| Role | Size (clamp) | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Hero `<h1>` | `clamp(52px, 7.5vw, 100px)` | 600 | `-0.04em` | 1.02 |
| Tool page `<h1>` | `clamp(44px, 6.5vw, 88px)` | 600 | `-0.04em` | 1.02 |
| Statement pull-line | `clamp(34px, 4.6vw, 60px)` | 500 (em → 600) | `-0.035em` | 1.12 |
| Section `<h2>` (page-level) | `clamp(40px, 5vw, 60px)` | 600 | `-0.035em` | 1.04 |
| Section `<h2>` (in-page) | `clamp(22px, 2.6vw, 34px)` | 600 | `-0.022em` | 1.15 |
| Sub-paragraph (hero lead) | `clamp(17px, 1.4vw, 21px)` | 400 | — | 1.4–1.55 |
| Card title `<h3>` | 20–24px | 600 | `-0.015em` | 1.2 |
| Card body | 13–14px | 400 | — | 1.45–1.6 |
| Eyebrow / meta-label | 11–13px UPPERCASE | 600 | `+0.06em` to `+0.08em` | 1 |
| Mono (counts, file paths, traffic-light titles) | 11–12px | 500 | `+0.02em` | 1 |

Mono stack: `ui-monospace, "SF Mono", Menlo, monospace`.

### Hierarchy rules

- **Page `<h1>` is always the biggest thing on the screen.** In-page `<h2>` is roughly half its size; never let an `<h2>` overpower the `<h1>`.
- Negative letter-spacing scales with size: bigger = tighter (`-0.04em` at 100px, `-0.01em` at 14px).
- Body and muted text share `var(--muted)`. Headings use `var(--text)`.

---

## 4. Spacing & layout

```css
.page-shell { max-width: 1200px; margin: 0 auto; }
```

### Section padding (vertical rhythm)

| Section | Desktop | Tablet (≤980px) | Mobile (≤640px) |
|---|---|---|---|
| Hero | `112px 32px 100px` | — | `72px 24px 56px` |
| Tool page hero | `80px 32px 96px` | — | `60px 24px 72px` |
| Catalog band | `88px 32px 96px` | — | `56px 24px` |
| Statement | `104px 32px 88px` | `80px 32px 64px` | `64px 24px 48px` |
| Tool section (features/use-case/related) | `96px 32px` | `72px 32px` | `56px 24px` |
| Footer | `48px 32px 28px` | — | — |

Sections separate from each other with `border-top: 1px solid var(--border)` — not extra whitespace, not background swatches.

### Breakpoints

- `≤ 980px`: collapse 3-col grids → 2-col, collapse sidebar+grid → single column with horizontal sidebar.
- `≤ 640px`: collapse to 1-col, reduce horizontal padding to `24px`.

---

## 5. Components

### 5.1 Sticky header

```
Height: 56px
Background: var(--nav-bg)  (translucent)
Backdrop-filter: blur(20px) saturate(180%)
Border-bottom: 1px solid var(--border)
Layout: flex space-between
  Left: brand (17px / 600 / -0.015em) + nav links (13px / 500, opacity 0.82)
  Right: icon buttons (32×32 / radius 8 / hover: var(--surface-2))
```

**Dropdown menu** (hover-triggered, attaches to a nav link):
- Min-width 296px, `border-radius: 16px`, `padding: 8px`
- Items: `padding: 8px 10px`, `border-radius: 10px`, gap 12px between icon tile and text
- Icon tile: 32×32, radius 9px, one of the accent gradients
- Item text: name (13px / 500), desc (11px / muted)
- Animate: `opacity 0 → 1`, `translateY(-6px → 0)`, 200ms
- Caret on parent link rotates `180deg` on hover
- **Critical:** add an invisible bridge `::before { top: -10px; height: 10px }` so mouse can cross the visual gap without closing the menu.

### 5.2 Hero

```html
<section class="hero">
  <p class="eyebrow">Eyebrow text</p>
  <h1>One Platform. <span class="grad">All Test Tools.</span></h1>
  <p class="sub">Lead paragraph, 18–21px, muted, max-width 640px.</p>
  <div class="actions">
    <a class="btn-primary">Primary action</a>
    <a class="btn-ghost">Learn more →</a>
  </div>
</section>
```

- `text-align: center`, `position: relative; overflow: hidden`
- `::before` radial-gradient glow (covers top 70%, two ellipses blended — one indigo at 50% 35%, one blue at 30% 60%, both at ~6–14% opacity). Hidden in dark mode = same shape, 14% indigo + 10% accent.
- Content sits `position: relative; z-index: 1` above the glow.

### 5.3 Buttons

```css
.btn-primary {
  height: 44px; padding: 0 22px;
  border-radius: 980px;          /* pill */
  background: var(--accent); color: white;
  font: 500 15px ...; letter-spacing: -0.01em;
  transition: background .15s;
}
.btn-primary:hover { background: var(--accent-hover); }

.btn-ghost {
  color: var(--accent);
  font: 500 15px ...;
}
.btn-ghost:hover { text-decoration: underline; text-underline-offset: 4px; }
```

> Default to **one** `.btn-primary` per band. Secondary action is a `.btn-ghost` link with a chevron.

### 5.4 Cards (App-Store featured style)

Used for portal/catalog grids.

```
Border-radius: 28px
Padding: 28px
Min-height: 220px
Background: var(--surface)
Border: 1px solid var(--border)
Layout: flex column, justify-content: space-between
```

Structure inside:
1. `.icon-tile` (52×52, radius 14, one of the gradients, white SVG inside)
2. `<h3>` (22px / 600 / -0.015em, 16px top margin)
3. `<p>` (14px muted, 1.45 line-height)
4. `.open` row at bottom: label + circular arrow button (28×28, surface-2 → accent on parent hover, translate 2px -2px)

**Hover state** (the signature interaction):
```css
.card:hover {
  transform: translateY(-3px);
  border-color: var(--border-strong);
  box-shadow:
    0 24px 48px -16px rgba(15, 23, 42, 0.10),
    0 4px 12px -4px rgba(15, 23, 42, 0.04);
}
.card::before {  /* sheen */
  background: radial-gradient(circle at 0% 0%,
    color-mix(in srgb, var(--accent) 6%, transparent), transparent 55%);
  opacity: 0; transition: opacity .35s;
}
.card:hover::before { opacity: 1; }
```

Grid: `repeat(3, 1fr)` desktop, `repeat(2, 1fr)` ≤980, `1fr` ≤640. Gap `20px`.

**"Collection" / aggregator card** (full-width row at end of grid):
- `grid-column: 1 / -1`, flex-row, `padding: 28px 32px`, `min-height: 0`
- Bigger icon tile (60×60, radius 18), bigger `<h3>` (24px)
- Trailing meta-row with a pill chip (mono 11px count + surface-2 background + border) and a 36×36 arrow

### 5.5 Tool catalog row (sidebar + grid)

For sub-pages with categorized tool lists.

```
Grid: 220px 1fr, gap 28px
Sidebar: position: sticky; top: 80px; align-self: start
Side-link: padding 10px 14px, radius 10, gap 10
  - colored dot 8×8
  - label 14/500
  - mono count pushed right
  - active/hover bg: var(--surface-2)
```

Category headings inside main column:
```css
h3 {
  font-size: 13px; font-weight: 600; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.06em;
  scroll-margin-top: 80px;   /* so anchor jumps land below the sticky header */
}
h3:not(:first-of-type) { margin-top: 32px; }
```

Tool cards inside the grid are smaller than catalog cards:
```
Padding: 20px / radius 18 / surface bg / 1px border
Tag (mono 10px uppercase) → h4 (15/600) → p (13 muted)
Hover: translateY(-2px) + shadow-md
```

Wire a `JS IntersectionObserver` so the sidebar's active link updates as the user scrolls.

### 5.6 macOS-style preview window

The signature "product screenshot" frame.

```html
<div class="tool-preview">
  <div class="preview-chrome">
    <span class="tl-dot tl-r"></span>
    <span class="tl-dot tl-y"></span>
    <span class="tl-dot tl-g"></span>
    <span class="preview-title">app — file.ext</span>
  </div>
  <div class="preview-canvas"></div>
  <div class="preview-cell"></div>    <!-- optional: a highlighted active cell -->
</div>
```

```
Wrapper: max-width 980, aspect-ratio 16/9, radius 20
Border: 1px var(--border)
Shadow: 0 40px 80px -20px rgba(15,23,42,.18),
        0 12px 30px -8px rgba(15,23,42,.08),
        inset 0 0 0 1px rgba(255,255,255,.6)
Background: dual radial tints (accent at 20% 20%, indigo at 80% 90%) over var(--surface)

Chrome bar: 36px tall, rgba(255,255,255,.6) + same blur as header
Traffic lights: 11×11 circles — #ff5f57 / #ffbd2e / #28c840
Title (centered, mono 11px muted)

Canvas: grid pattern via two linear-gradients at 88×44 cell size, 1px lines @ rgba 0.05
Active cell (optional): absolute box with translucent accent bg + accent border +
                       4px outer accent halo via box-shadow
```

### 5.7 Statement section (editorial pull-line)

A whole band given to one sentence. Use sparingly — once per detail page, between the preview and the feature grid.

```html
<section class="statement-section">
  <p class="statement">
    One platform. <em>Every workflow, every team, every release.</em>
  </p>
</section>
```

- 34–60px clamp, weight 500 (the `<em>` swaps to 600 + display-gradient)
- `text-align: center`, max-width 920, padding `104px 32px 88px`

### 5.8 Bento feature grid

For "capabilities" sections on detail pages.

```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(186px, auto);
  gap: 20px;
}
.feature-card.featured { grid-column: span 2; grid-row: span 2; padding: 52px; }
.feature-card.wide     { grid-column: span 2; }
.feature-card          { padding: 40px; border-radius: 24px;
                         background: var(--surface);
                         border: 1px solid var(--border); }
```

Composition: **one** `.featured` (2×2) + **two** standard `.feature-card` + **one** `.wide` (2×1) = balanced bento with 4 cards.

Featured card has a tinted background:
```css
background: linear-gradient(140deg,
  var(--surface) 0%,
  color-mix(in srgb, var(--accent) 5%, var(--surface)) 100%);
```

Inside every card:
```
.feat-ic: 48×48 (featured: 56×56), radius 14 (featured: 16)
  bg: linear-gradient(135deg, var(--surface-2),
                      color-mix(in srgb, var(--accent) 10%, var(--surface-2)))
  border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border))
  color: var(--accent)
  inset white sheen via box-shadow

h3: 20px / 600 / -0.02em (featured: 24–30px clamp)
p:  14px muted, line-height 1.6
```

Hover: same lift + sheen as catalog cards.

### 5.9 Use-case row

Side-by-side meta-label + pull-paragraph.

```
Grid: 280px 1fr, gap 60
Meta-label (left): 11px uppercase muted, letter-spacing .08em
Body (right): clamp(18, 1.5vw, 22), text color, line-height 1.5, max-width 720
```

### 5.10 Related-items row

Three compact link cards in a row.

```
Grid: repeat(3, 1fr), gap 14
Card: padding 20 22, radius 16, surface bg, 1px border
      flex row: 34×34 icon tile (gradient) + (h4 14/600 + p 12 muted)
Hover: bg → surface-2, border → border-strong, translateY(-1px)
```

### 5.11 Footer

```
border-top: 1px var(--border)
background: var(--surface-2)
padding: 48px 32px 28px

.cols (flex-wrap, justify-content: space-between, gap 24/60):
  .col.brand   → flex 0 0 auto, max-width 320  (logo + 8px-tall tagline)
  .col.tools   → flex 1 1 auto, ul flex-row wrap, justify-content: flex-end, gap 10/24

bottom: centered, mono 11px muted copyright, 18px top padding, 1px top border
```

Hide redundant column headings:
```css
.site-footer .col:not(.brand) h5 { display: none; }
```

---

## 6. Motion

| Interaction | Spec |
|---|---|
| Card lift on hover | `transform: translateY(-3px)`, `.3s cubic-bezier(.16,1,.3,1)` |
| Card sheen on hover | radial-gradient `::before` from 0% opacity to 1, `.35s ease` |
| Button hover | `background` swap, `.15s ease` |
| Theme transition | `background-color .3s ease, color .3s ease` on `html, body` |
| Dropdown open | `opacity 0→1` + `translateY(-6px → 0)`, `.2s ease` |
| Caret rotate | `transform: rotate(180deg)`, `.2s ease` |
| Scroll reveal | opacity 0 + `translateY(16px)` → 1 + 0, `.8s cubic-bezier(.16,1,.3,1)`, IntersectionObserver toggles `.in-view` class |
| Card arrow flick | `translate(2px, -2px)` + bg → accent + color → white, `.2s` |

```css
.reveal { opacity: 0; transform: translateY(16px);
  transition: opacity .8s cubic-bezier(.16,1,.3,1),
              transform .8s cubic-bezier(.16,1,.3,1); }
.reveal.in-view { opacity: 1; transform: translateY(0); }
```

Easing curve `cubic-bezier(.16,1,.3,1)` is the project's house easing — use it for any lift/slide animation.

---

## 7. Theme toggle

Inline at the bottom of each page:

```html
<script>
  const root = document.documentElement;
  const stored = localStorage.getItem('app-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) root.classList.add('dark');

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('app-theme', root.classList.contains('dark') ? 'dark' : 'light');
  });
</script>
```

Rename the localStorage key per project (`app-theme` → `<projectslug>-theme`) so multiple Apple-style demos can coexist on the same origin.

---

## 8. Iconography

- 1.5–2px stroke, `currentColor`, no fill.
- Always inside a tinted tile (`.icon-tile`, `.feat-ic`, `.icon-mini`).
- Icon `stroke="white"` when sitting on a colored gradient tile; `stroke="currentColor"` when sitting on a `--surface-2` tile (color inherits from accent).
- Approx sizes: hero tile 24px svg in 52px tile, feature 20px svg in 48px tile, nav-item 16px svg in 32px tile, related 16px svg in 34px tile.

---

## 9. Patterns to reuse across pages

A site built with this system typically has:

1. **Homepage**: sticky header → hero → catalog grid (3 cols + 1 collection card) → footer.
2. **Catalog sub-page**: sticky header → page-head (breadcrumb + h2 + lede) → sidebar+grid → footer.
3. **Detail page**: sticky header → tool-hero (breadcrumb + chip + h1 + lede + single CTA) → preview window → statement → bento feature grid → use-case row → related row → footer.

Every page reuses the same `.site-header` and `.site-footer`. The only variation between pages is the body bands.

### Breadcrumb pattern

```html
<nav class="breadcrumb">
  <a href="../">↩ Parent</a>
  <span class="sep">/</span>
  <span>Current</span>
</nav>
```
- 13px muted, accent on `<a>`, gap 8–10px.
- Sits above the page `<h1>` with ~24–28px margin below.

---

## 10. What to avoid

- ❌ Tailwind utility classes inline — this system uses semantic class names + a single shared stylesheet.
- ❌ Drop shadows on text.
- ❌ More than one display-gradient phrase per page.
- ❌ Borders darker than `rgba(0,0,0,.14)` in light mode.
- ❌ Card hover effects without the lift (`translateY(-3px)`); a shadow change alone feels flat.
- ❌ `prefers-color-scheme` as the only theme signal — always allow user override + persist it.
- ❌ Sharp corners on interactive elements. Minimum radius is `10px` (links), `14px` (small tiles), `18–28px` (cards), `980px` (buttons).
- ❌ Sans-serif body that isn't `-apple-system` / SF / Inter. The font stack is doing real work on macOS.

---

## 11. Quick-start CSS variable cheatsheet for Claude

When generating new components, **only** use these tokens for color:

```
backgrounds:   var(--bg), var(--surface), var(--surface-2)
text:          var(--text), var(--muted)
borders:       var(--border), var(--border-strong)
accent:        var(--accent), var(--accent-hover)
shadows:       var(--shadow-sm), var(--shadow-md), var(--shadow-lg)
nav vibrancy:  var(--nav-bg)
icon tiles:    .grad-1 .. .grad-7
```

If you need a tinted variant of an accent, use `color-mix(in srgb, var(--accent) <N>%, transparent)` or `color-mix(in srgb, var(--accent) <N>%, var(--surface))` — never hardcode a tint, so it tracks the theme.
