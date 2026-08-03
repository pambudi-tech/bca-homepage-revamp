# Plan 018: Name the shadows — one elevation scale instead of 24 hand-written stacks

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> ```bash
> git diff --stat 28729d0..HEAD -- src/app/globals.css src/components/home/
> ```
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (this plan makes deliberate visual changes — see Step 3)
- **Depends on**: `plans/017-typography-tokens.md` (file overlap: both edit
  `@theme` in `src/app/globals.css`, and 017's site list overlaps this one's
  `[text-shadow:…]` elements)
- **Category**: tech-debt (design system)
- **Planned at**: commit `28729d0`, 2026-08-03

## Why this matters

Two effects in this codebase are pure copy-paste, and both have already drifted.

**The text shadow** `[text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]` appears
**17 times** across 8 files. It is one design decision — "white type over
photography gets a soft drop shadow" — written out longhand seventeen times.

**The card shadow** is worse: the same three-layer `rgba(204,204,204,…)` stack
is written **three different ways** in three different files, and one of them
has quietly lost a layer:

| File | Layers | Order | Spread syntax |
|---|---|---|---|
| `NewsSection.tsx:59`, `:102`, `FaqSection.tsx:274` | 3 | 1px → 5px → 10px | `0px …  0px` |
| `SearchRecommendation.tsx:269` | 3 | **10px → 5px → 1px** (reversed) | `0px …` (no spread) |
| `PromoSection.tsx:137` | **2** (the 10px layer is missing) | 1px → 5px | `0 … 0` |

Box-shadow layers paint front-to-back in source order, so the reversed variant
does not composite identically to the canonical one — these are three different
renderings of what was meant to be one card elevation.

After this plan the recurring effects are named tokens. A designer changing the
card elevation edits one line; a developer adding a card gets the right one by
name rather than by copying whichever neighbour they happened to open.

## Current state

### The mechanism — verified, not assumed

Tailwind **4.3.2** (`node_modules/tailwindcss/package.json`) provides both
namespaces this plan needs:

- `--shadow-*` → generates `shadow-<name>` (stock scale at
  `node_modules/tailwindcss/theme.css:~400`)
- `--text-shadow-*` → generates `text-shadow-<name>` (stock scale at
  `node_modules/tailwindcss/theme.css:425-431`)

`--text-shadow-*` is a registered **sub-namespace of `--text-*`** — Tailwind's
internal namespace map lists `["--text", [… "--text-shadow" …]]`. This is worth
knowing because plan 017 adds `--text-heading`, `--text-display` etc. to the
same block; those do not collide with `--text-shadow-hero`, because Tailwind
disambiguates the sub-namespace explicitly.

### Full shadow inventory — all 24 `shadow-[…]` sites

**Group 1 — card elevation** (`rgba(204,204,204,…)`), 5 sites, 3 spellings:

- `src/components/home/NewsSection.tsx:59` — canonical 3-layer
- `src/components/home/NewsSection.tsx:102` — canonical 3-layer
- `src/components/home/FaqSection.tsx:274` — canonical 3-layer
- `src/components/home/SearchRecommendation.tsx:269` — 3 layers, reversed order
- `src/components/home/PromoSection.tsx:137` — **2 layers only**

Canonical form, verbatim from `NewsSection.tsx:59`:

```
shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)]
```

**Group 2 — floating panel**, 3 sites, all byte-identical:

- `src/components/home/HeroWidget.tsx:411`
- `src/components/home/HeroWidget.tsx:464`
- `src/components/home/Navbar.tsx:546`

```
shadow-[0px_8px_16px_0px_rgba(0,0,0,0.10),0px_20px_32px_0px_rgba(0,0,0,0.12)]
```

**Group 3 — left edge**, 2 sites, byte-identical:

- `src/components/home/MyBcaSection.tsx:33`
- `src/components/home/MyBcaSection.tsx:101`

```
shadow-[-8px_0px_16px_0px_rgba(0,0,0,0.25)]
```

**Group 4 — scroll-fade edge**, 3 sites, one shadow in two directions:

- `src/components/home/FaqSection.tsx:238` — `shadow-[0_-4px_8px_-2px_rgba(0,0,0,0.15)]`
- `src/components/home/SearchRecommendation.tsx:383` — same, upward
- `src/components/home/FaqSection.tsx:168` — `shadow-[0_4px_8px_-2px_rgba(0,0,0,0.15)]`, downward

**Group 5 — `rgba(224,224,224,…)`**, 2 related but *not* identical sites:

- `src/components/home/Navbar.tsx:620` — 3 layers
- `src/components/home/MobileMenu.tsx:411` — 1 layer (the first of the three)

**Singletons — 9 sites, each used exactly once. These are NOT tokenized by
this plan** (a token with one call site is a rename, not a system):

`HeroSection.tsx:20`, `LayoutSwitcher.tsx:79`, `LayoutSwitcher.tsx:95`,
`CookieBanner.tsx:98`, `HaloBcaChat.tsx:423`, `HaloBcaChat.tsx:494`,
`MobileNav.tsx:55`, `HeroWidget.tsx:407`, `MobileHeroWidget.tsx:566`.

### Full text-shadow inventory — all 17 sites

Every one carries the identical value `0px_2px_4px_rgba(0,0,0,0.15)`:

| File | Lines |
|---|---|
| `src/components/home/FaqSection.tsx` | 327, 331, 356, 394 |
| `src/components/home/ProductSection.tsx` | 382, 417, 553, 928 |
| `src/components/home/HeroWidget.tsx` | 343, 612 |
| `src/components/home/MyBcaSection.tsx` | 35, 111 |
| `src/components/home/NewsSection.tsx` | 82 |
| `src/components/home/MegaMenuPanel.tsx` | 92 |
| `src/components/home/SearchOverlay.tsx` | 160 |
| `src/components/home/MobileHeroWidget.tsx` | 512 |
| `src/components/home/HeroSection.tsx` | 181 |

`HeroSection.tsx:181` additionally carries `xl:[text-shadow:none]` — the
desktop breakpoint removes it. That must survive (see Step 2).

### Repo conventions to match

- Theme tokens live in `@theme` in `src/app/globals.css`; comments there are
  prose explaining *why* — see lines 8-12 for the house voice.
- There is **no test suite**. Gates are `npm run lint`, `npm run typecheck`,
  `npm run build`, plus live checks.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run typecheck` | exit 0, no output |
| Lint | `npm run lint` | exit 0, **87 warnings, 0 errors** |
| Build | `npm run build` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |

### Lint baseline — verified at `28729d0`, 2026-08-03

87 warnings, 0 errors: 84 × `@next/next/no-img-element` (deliberate), 2 ×
`@typescript-eslint/no-unused-vars`, 1 × `react-hooks/exhaustive-deps`. Your
change must not move this number.

## Scope

**In scope**:

- `src/app/globals.css` — add `--shadow-*` and `--text-shadow-*` to `@theme`
- `src/components/home/NewsSection.tsx`
- `src/components/home/FaqSection.tsx`
- `src/components/home/SearchRecommendation.tsx`
- `src/components/home/PromoSection.tsx`
- `src/components/home/HeroWidget.tsx`
- `src/components/home/Navbar.tsx`
- `src/components/home/MyBcaSection.tsx`
- `src/components/home/MobileMenu.tsx`
- `src/components/home/ProductSection.tsx`
- `src/components/home/MegaMenuPanel.tsx`
- `src/components/home/SearchOverlay.tsx`
- `src/components/home/MobileHeroWidget.tsx`
- `src/components/home/HeroSection.tsx`

**Out of scope** (do NOT touch, even though they look related):

- **The 9 singleton shadows** listed above. One call site is not a pattern.
  Leave them as arbitrary values.
- **`drop-shadow(…)` inside `globals.css`.** `.soliprio-beam` (lines 387-388,
  423-424) and `.halobca-beam` (line 471) stack three `drop-shadow()` passes
  with a load-bearing comment: *"Keep all three in both states — `filter` only
  interpolates between lists of matching length."* Tokenizing those risks
  breaking the hover interpolation. Leave them.
- **Type classes** (`text-heading`, `font-semibold`, `leading-*`, `tracking-*`).
  Plan 017 owns those. On elements where both plans apply, change **only** the
  `[text-shadow:…]` fragment.
- **Colors.** Plan 016 owns those.
- `archive/` — reference snapshots, excluded from tsconfig and ESLint.
- The `<img>` elements and their 84 lint warnings — deliberate.

## Git workflow

- Branch: `advisor/018-elevation-and-effect-tokens`
- Commit style: short imperative subject, matching `git log`.
- **Commit Step 2 and Step 3 separately.** Step 2 is visually neutral; Step 3
  is not. Splitting them means a regression can be reverted without losing the
  safe half.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the elevation tokens to `@theme`

In `src/app/globals.css`, inside the existing `@theme` block, after the type
scale added by plan 017, add:

```css

  /* ---- Elevation & effects ----
     Named for what they lift, not for how far. The stock Tailwind shadow-sm/
     md/lg scale is left intact and still usable; these are the BCA-specific
     stacks that were being copy-pasted.

     --shadow-card was previously written three different ways across five call
     sites — the canonical three-layer form here is the one used by the news
     and FAQ cards. Layer order matters: box-shadow paints front-to-back in
     source order, so the reversed copy in SearchRecommendation and the
     two-layer copy in PromoSection did not composite identically. */
  --shadow-card:
    0px 1px 2px 0px rgba(204, 204, 204, 0.14),
    0px 5px 5px 0px rgba(204, 204, 204, 0.12),
    0px 10px 6px 0px rgba(204, 204, 204, 0.07);

  /* Floating chrome that sits over the page: the hero widget's dropdowns and
     the navbar's search panel. */
  --shadow-panel:
    0px 8px 16px 0px rgba(0, 0, 0, 0.10),
    0px 20px 32px 0px rgba(0, 0, 0, 0.12);

  /* Cast leftward by the MyBCA phone mock onto the panel behind it. */
  --shadow-edge-left: -8px 0px 16px 0px rgba(0, 0, 0, 0.25);

  /* The soft edge on a scroll container, marking content continuing past the
     boundary. Two directions, same shadow. */
  --shadow-scroll-top: 0 -4px 8px -2px rgba(0, 0, 0, 0.15);
  --shadow-scroll-bottom: 0 4px 8px -2px rgba(0, 0, 0, 0.15);

  /* Warm-grey lift used by the navbar's mega-menu shell and the mobile menu.
     The mobile variant uses only the first layer — see --shadow-menu-flat. */
  --shadow-menu:
    0px 11px 11px 0px rgba(224, 224, 224, 0.14),
    0px 24px 15px 0px rgba(224, 224, 224, 0.08),
    0px 3px 6px 0px rgba(224, 224, 224, 0.16);
  --shadow-menu-flat: 0px 11px 11px 0px rgba(224, 224, 224, 0.14);

  /* White type over photography. Seventeen call sites carried this inline. */
  --text-shadow-hero: 0px 2px 4px rgba(0, 0, 0, 0.15);
```

**Verify**:
```bash
npm run build
```
→ exit 0. A malformed `@theme` entry fails the CSS build.

### Step 2: Convert everything that is byte-identical (visually neutral)

These conversions change nothing on screen. Do them all, then commit.

| Replace at | with |
|---|---|
| `NewsSection.tsx:59`, `NewsSection.tsx:102`, `FaqSection.tsx:274` | `shadow-card` |
| `HeroWidget.tsx:411`, `HeroWidget.tsx:464`, `Navbar.tsx:546` | `shadow-panel` |
| `MyBcaSection.tsx:33`, `MyBcaSection.tsx:101` | `shadow-edge-left` |
| `FaqSection.tsx:238`, `SearchRecommendation.tsx:383` | `shadow-scroll-top` |
| `FaqSection.tsx:168` | `shadow-scroll-bottom` |
| `Navbar.tsx:620` | `shadow-menu` |
| `MobileMenu.tsx:411` | `shadow-menu-flat` |

Then replace **all 17** `[text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]` with
`text-shadow-hero`.

`HeroSection.tsx:181` needs its responsive override converted too — replace
`xl:[text-shadow:none]` with `xl:text-shadow-none` (Tailwind 4.3.2 ships
`text-shadow-none` in its stock utilities; no token needed).

**Verify**:
```bash
grep -rn "text-shadow:" src/
```
→ zero matches.

```bash
grep -c "text-shadow-hero" src/components/home/*.tsx | grep -v ":0" | awk -F: '{s+=$2} END {print s}'
```
→ `17`.

```bash
npm run build && npm run typecheck && npm run lint
```
→ all exit 0; lint at 87 warnings.

**Then check visually**: screenshot the hero, navbar mega menu, news cards,
FAQ section and MyBCA section at 375px and 1440px. Compare against the same
shots taken before your change. **They must be pixel-identical.** If any
differ, something is mis-converted — STOP and report.

Commit here, separately, before continuing.

### Step 3: Normalise the two drifted card shadows (deliberate visual change)

The operator has approved visual adjustment in service of consistency for this
batch. These two sites become the canonical `shadow-card`:

1. **`SearchRecommendation.tsx:269`** — currently the three layers in reverse
   paint order. Converting to `shadow-card` reverses them back. The visible
   difference is small (same color, same geometry, different composite order)
   but real.

2. **`PromoSection.tsx:137`** — currently missing the third layer
   (`0px 10px 6px rgba(204,204,204,0.07)`). Converting to `shadow-card` adds
   it, making the promo card's lift very slightly deeper.

For **each** of these two, before and after: screenshot the component at 375px
and 1440px, and include all four images in your report. This is the change the
operator most needs to see.

**Verify**:
```bash
grep -rn "204,204,204\|204, 204, 204" src/components/
```
→ zero matches.

### Step 4: Verify the gates and the full result

```bash
npm run typecheck && npm run lint && npm run build
```
→ typecheck exit 0; lint exit 0 at 87 warnings / 0 errors; build exit 0.

Start the dev server (`npm run dev`, or `.claude/launch.json`'s
`nextjs-dev-nogate` on port 3100 if `PREVIEW_PASSWORD` is set in `.env.local`)
and confirm by computed style:

| Element | Property | Expected |
|---|---|---|
| A news card | `box-shadow` | three layers, `rgb(204, 204, 204)` at 0.14 / 0.12 / 0.07 |
| A promo card | `box-shadow` | **three** layers now, same as the news card |
| Any hero headline over photography | `text-shadow` | `rgba(0, 0, 0, 0.15) 0px 2px 4px` |
| The hero `<h1>` at ≥1280px | `text-shadow` | `none` |

That last row is the responsive-override check; if it still shows a shadow at
desktop width, `xl:text-shadow-none` is not applying.

## Test plan

There is **no test framework in this repository** — do not add one. Verification is:

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0, warning count unchanged at 87.
3. `npm run build` → exit 0.
4. Every `grep` gate in Steps 2 and 3 returns the stated result.
5. The four computed-style rows in Step 4.
6. **Screenshot regression, in two passes.** After Step 2: every touched
   surface pixel-identical. After Step 3: only the promo card and the search
   recommendation panel differ, and both differ in the expected direction.
   Sections to cover: hero (mobile + desktop), navbar mega menu, search
   overlay, news cards, FAQ, MyBCA, promo, product.

## Done criteria

ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with exactly 87 warnings and 0 errors
- [ ] `npm run build` exits 0
- [ ] `grep -rn "text-shadow:" src/` → zero matches
- [ ] `grep -rn "204,204,204\|204, 204, 204" src/components/` → zero matches
- [ ] `grep -rn "shadow-\[" src/ | wc -l` → `9` (exactly the singletons)
- [ ] `text-shadow-hero` appears 17 times across `src/components/home/`
- [ ] `git diff --name-only` lists only the files in the In-scope list
- [ ] Step 2's screenshots are pixel-identical; Step 3's show only the two
      expected differences, and both sets are attached to the report
- [ ] Step 2 and Step 3 are separate commits
- [ ] `plans/README.md` status row for 018 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed, or `@theme` already contains
  `--shadow-` or `--text-shadow-` entries.
- Plan 017 has not landed — this plan's Step 1 places tokens after 017's type
  scale, and several call sites are shared. Running out of order produces
  conflicting diffs in the same lines.
- **Step 2's screenshots are not pixel-identical.** That step is defined as
  visually neutral; any difference means a value was transcribed wrong. Do not
  proceed to Step 3 with an unexplained difference.
- The `xl:text-shadow-none` override does not apply at desktop width. Report
  rather than reverting to `xl:[text-shadow:none]` — if the stock utility is
  missing, the token strategy needs revisiting.
- The lint warning count moves from 87 in either direction.
- You find a `[text-shadow:…]` value that is **not** `0px_2px_4px_rgba(0,0,0,0.15)`.
  The inventory says all 17 are identical; a different one means the inventory
  is stale and blanket replacement would be wrong.
- You are tempted to tokenize a singleton shadow or the `drop-shadow()` stacks
  in `globals.css`. Don't — record them in your report instead.

## Maintenance notes

- **Nine singleton shadows remain as arbitrary values, deliberately.** The rule
  going forward: the second call site is what promotes a value to a token, not
  the first. If a singleton gains a second user, promote it then.
- Two of those singletons (`LayoutSwitcher.tsx:79`, `:95`) belong to
  prototype-only scaffolding that the existing `plans/README.md` already flags
  as "should be stripped before launch". If that scaffolding is removed, those
  two shadows go with it.
- `--shadow-menu` and `--shadow-menu-flat` are deliberately two tokens for what
  is arguably one shadow at two intensities. Collapsing them would change the
  mobile menu's appearance; that was judged not worth it here.
- A reviewer should scrutinise: the two Step 3 before/after screenshot pairs,
  that Step 2 really was pixel-identical, and that no `drop-shadow()` in
  `globals.css` was touched.
- Plans 016, 017 and 019 also edit the `@theme` block. Run them sequentially.
