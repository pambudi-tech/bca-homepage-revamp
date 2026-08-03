# Plan 019: Name the easing curves and stop writing Tailwind's own values longhand

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> ```bash
> git diff --stat 28729d0..HEAD -- src/app/globals.css src/components/home/ProductSection.tsx src/components/home/SoliprioMobile.tsx
> ```
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (every change in this plan is value-identical by construction)
- **Depends on**: `plans/018-elevation-and-effect-tokens.md` (file overlap:
  both edit `@theme` in `src/app/globals.css`)
- **Category**: tech-debt (design system)
- **Planned at**: commit `28729d0`, 2026-08-03

## Why this matters

This site has a motion language. One curve — `cubic-bezier(0.16, 1, 0.3, 1)` —
drives the scroll reveals, the hero entrance, the mega-menu unfurl, the HaloBCA
panel, the Soliprio card settle and the preloader handoff. It is the house
easing, and it appears **14 times as a hand-typed magic number** with no name.

Worse, 18 of the repeated curves are not custom at all. Two of them are
Tailwind's own stock easings, written out longhand:

| written as | is exactly | occurrences |
|---|---|---|
| `cubic-bezier(0.4, 0, 0.2, 1)` | Tailwind's `ease-in-out` | 15 |
| `cubic-bezier(0.4, 0, 1, 1)` | Tailwind's `ease-in` | 3 |

Verified against `node_modules/tailwindcss/theme.css:434-436`. Eighteen call
sites are spelling out a value the framework already names — including twelve
`ease-[cubic-bezier(0.4,0,0.2,1)]` arbitrary-value utilities in
`ProductSection.tsx` that could each just say `ease-in-out`.

After this plan there are two named house curves and zero longhand copies of
stock values. Every change is a **literal substitution of identical values** —
nothing about the motion changes.

## Current state

### Verified stock easing values

`node_modules/tailwindcss/theme.css:434-436` (Tailwind 4.3.2):

```css
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

These generate the `ease-in`, `ease-out`, `ease-in-out` utilities and are also
available as `var(--ease-in)` etc. inside `globals.css`.

### The house curve — `cubic-bezier(0.16, 1, 0.3, 1)`, 14 sites

In `src/app/globals.css` — 13 sites:

| Line | What it animates |
|---|---|
| 224 | `.soliprio-card` tilt settle |
| 552, 553, 554 | `[data-reveal]` — opacity, transform, filter |
| 589 | `.animate-hero-title` |
| 593 | `.animate-hero-cta` |
| 792 | `.pre-logo` fade-up |
| 842 | `html.pre-revealing .pre-stage` |
| 846 | `html.pre-revealing .pre-nav` |
| 987 | `.content-fade-in` |
| 1032 | `.mm-panel[data-mode="open"]` unfurl |
| 1035 | `.mm-panel[data-mode="open"] .mm-item` |
| 1077 | `.halobca-panel[data-state="open"]` |

In `src/components/home/ProductSection.tsx` — 1 site, line 298:

```tsx
        transition: `flex-grow 500ms cubic-bezier(0.4,0,0.2,1), flex-basis 500ms cubic-bezier(0.4,0,0.2,1), clip-path 700ms cubic-bezier(0.16,1,0.3,1) ${enterDelayMs}ms`,
```

### The emphasis curve — `cubic-bezier(0.65, 0, 0.35, 1)`, 3 sites

- `src/app/globals.css:732` — `.pre-word-inner` per-word rise
- `src/components/home/ProductSection.tsx:148` — `product-photo-in-*`
- `src/components/home/ProductSection.tsx:152` — `product-photo-out-*`

### Stock `ease-in-out` written longhand — 15 sites

`src/app/globals.css:615` (`.animate-scroll-cue-dot`), plus 14 in components:

- `src/components/home/SoliprioMobile.tsx:228`, `:257`
- `src/components/home/ProductSection.tsx:298` (**×2** — `flex-grow` and
  `flex-basis` in the excerpt above), `:316`, `:340`, `:369`, `:409`, `:496`,
  `:557`, `:918`, `:932`, `:1185` (**×2** — `transform` and `width`)

Counted as occurrences rather than lines: 8 in `ProductSection` `className`s +
2 in `SoliprioMobile` `className`s + 2 at `:298` + 2 at `:1185` = 14 in TSX,
plus `globals.css:615` = **15**.

Ten of the fourteen are `ease-[cubic-bezier(0.4,0,0.2,1)]` arbitrary-value
utilities in a `className`; the other four are inside inline `style` strings.

### Stock `ease-in` written longhand — 3 sites, all in `globals.css`

- `:1051` — `.mm-panel[data-mode="close"]` furl
- `:1054` — `.mm-panel[data-mode="close"] .mm-item`
- `:1080` — `.halobca-panel[data-state="closing"]`

### Genuine singleton — leave alone

`src/app/globals.css:763` — `cubic-bezier(0.76, 0, 0.24, 1)` on `.pre-shell`,
the preloader's slide-up exit. Used exactly once. **Not tokenized** (see
Maintenance notes).

### Durations are already fine

`duration-150/200/300/500/700` are used consistently and are all stock Tailwind
utilities that emit the millisecond value directly. **This plan does not touch
durations at all.** They need no tokens; churning them would be pure noise.

### Repo conventions to match

- Theme tokens live in `@theme` in `src/app/globals.css`; comments there are
  prose explaining *why* — see lines 8-12 for the house voice.
- `globals.css` carries long explanatory comments above tricky rules. Several
  of the lines you will edit sit directly under such comments — **do not
  reflow or reword them**, only change the curve inside the declaration.
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

- `src/app/globals.css`
- `src/components/home/ProductSection.tsx`
- `src/components/home/SoliprioMobile.tsx`

**Out of scope** (do NOT touch, even though they look related):

- **Durations.** Not one. See "Durations are already fine" above.
- **`cubic-bezier(0.76, 0, 0.24, 1)` at `globals.css:763`** — a genuine
  singleton on the preloader exit, deliberately left as a literal.
- **`ease-out`, `ease-in-out`, `linear` used as plain utility classes.** They
  already reference the theme; nothing to do.
- **Animation names, delays, `animation-play-state`, and the
  `prefers-reduced-motion` blocks.** `globals.css` contains hard-won behaviour
  around parked animations (`[data-beam-live]`, `[data-confetti-live]`) and
  around the `@property`-driven beam. Changing a timing function is safe;
  changing anything else in those rules is not.
- **The `-a`/`-b` duplicated keyframe pairs** in `globals.css:1122-1149`. The
  comment above them explains they exist so consecutive swaps can restart by
  alternating names. They look like copy-paste; they are not.
- `archive/` — reference snapshots, excluded from tsconfig and ESLint.

## Git workflow

- Branch: `advisor/019-motion-tokens`
- Commit style: short imperative subject, matching `git log`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the two house curves to `@theme`

In `src/app/globals.css`, inside the existing `@theme` block, after the
elevation tokens added by plan 018, add:

```css

  /* ---- Motion ----
     Tailwind's stock --ease-in / --ease-out / --ease-in-out are left intact
     and still used. These two are the curves this site adds on top.

     --ease-entrance is the house curve: a fast start settling into a long,
     soft tail. It drives every arrival on the page — scroll reveals, the hero
     entrance, the mega-menu unfurl, the HaloBCA panel, the Soliprio card
     settle, the preloader handoff. If an element enters, it uses this.

     --ease-emphasis is symmetric in-out, used where something travels a fixed
     distance and stops rather than arriving: the preloader's per-word rise and
     the product photo swap. */
  --ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-emphasis: cubic-bezier(0.65, 0, 0.35, 1);
```

**Verify**:
```bash
npm run build
```
→ exit 0.

### Step 2: Replace the house curve inside `globals.css`

At the 13 lines listed under "The house curve" above, replace
`cubic-bezier(0.16, 1, 0.3, 1)` with `var(--ease-entrance)`.

Example — line 589:

```css
/* before */
  animation: hero-content-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
/* after */
  animation: hero-content-in 700ms var(--ease-entrance) both;
```

Line 732 gets `var(--ease-emphasis)` instead:

```css
/* before */
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
/* after */
  animation-timing-function: var(--ease-emphasis);
```

**One comment must be updated, not just the code.** `globals.css:544` reads:

```
   this rule is unlayered and would otherwise beat them for good. Keep the
   700ms duration in sync with REVEAL_DURATION_MS in ScrollReveal.tsx. */
```

That stays accurate — you are not changing the duration. **Do not edit it.**
Mentioned here so you do not "helpfully" rewrite it.

**Verify**:
```bash
grep -c "cubic-bezier(0.16" src/app/globals.css
```
→ `0`.

```bash
grep -c "var(--ease-entrance)" src/app/globals.css
```
→ `13`.

### Step 3: Replace the longhand stock curves inside `globals.css`

- Line 615: `cubic-bezier(0.4, 0, 0.2, 1)` → `var(--ease-in-out)`
- Lines 1051, 1054, 1080: `cubic-bezier(0.4, 0, 1, 1)` → `var(--ease-in)`

**Verify**:
```bash
grep -n "cubic-bezier" src/app/globals.css
```
→ exactly **one** line: 763, the preloader-exit singleton.

### Step 4: Replace the curves in the two components

**`src/components/home/SoliprioMobile.tsx:228` and `:257`** — these are
`className` strings containing `ease-[cubic-bezier(0.4,0,0.2,1)]`. Replace each
with `ease-in-out`.

**`src/components/home/ProductSection.tsx`** — exactly **8** `className` sites:
`:316`, `:340`, `:369`, `:409`, `:496`, `:557`, `:918`, `:932`. Replace
`ease-[cubic-bezier(0.4,0,0.2,1)]` with `ease-in-out` at each.

That accounts for 10 of the 14 `cubic-bezier(0.4,0,0.2,1)` occurrences in TSX
(8 here + 2 in `SoliprioMobile`). The remaining 4 are inside inline `style`
strings, two per site, at `ProductSection.tsx:298` and `:1185`.

**`ProductSection.tsx:298`** — replace all three literals:

```tsx
// before
        transition: `flex-grow 500ms cubic-bezier(0.4,0,0.2,1), flex-basis 500ms cubic-bezier(0.4,0,0.2,1), clip-path 700ms cubic-bezier(0.16,1,0.3,1) ${enterDelayMs}ms`,
// after
        transition: `flex-grow 500ms var(--ease-in-out), flex-basis 500ms var(--ease-in-out), clip-path 700ms var(--ease-entrance) ${enterDelayMs}ms`,
```

**`ProductSection.tsx:1185`** is the other inline `style` string, with two
occurrences on one line:

```tsx
// before
                  : "transform 600ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease, width 600ms cubic-bezier(0.4,0,0.2,1)",
// after
                  : "transform 600ms var(--ease-in-out), opacity 300ms ease, width 600ms var(--ease-in-out)",
```

Leave the bare `ease` on `opacity` alone — it is the CSS keyword, not a
longhand copy of a token.

**`ProductSection.tsx:148` and `:152`** are inline `style` animation strings:

```tsx
// before
      animation: `product-photo-in-${suffix} ${SWAP_MS}ms cubic-bezier(0.65,0,0.35,1) ${stagger}ms both`,
// after
      animation: `product-photo-in-${suffix} ${SWAP_MS}ms var(--ease-emphasis) ${stagger}ms both`,
```

`var()` works in inline styles here because Tailwind emits every `@theme` key
as a real custom property on `:root`, so it resolves through normal inheritance.

**Verify**:
```bash
grep -rn "cubic-bezier" src/components/
```
→ zero matches.

```bash
grep -rn "ease-\[" src/
```
→ zero matches.

### Step 5: Verify the gates and the motion itself

```bash
npm run typecheck && npm run lint && npm run build
```
→ typecheck exit 0; lint exit 0 at 87 warnings / 0 errors; build exit 0.

Start the dev server (`npm run dev`, or `.claude/launch.json`'s
`nextjs-dev-nogate` on port 3100 if `PREVIEW_PASSWORD` is set in `.env.local`)
and **watch each of these animate**. Every one must feel exactly as it did
before — this plan substitutes identical values, so any perceptible change is a
bug:

1. Reload the page — the preloader curtain slides up, the hero fades in, the
   navbar drops down. (`--ease-entrance` on `.pre-stage`, `.pre-nav`,
   `.animate-hero-title`; the exit singleton on `.pre-shell`.)
2. Watch the preloader's tagline words rise one by one. (`--ease-emphasis`.)
3. Scroll down — sections fade and rise into view. (`--ease-entrance` on
   `[data-reveal]`.)
4. Hover a navbar tab to open the mega menu, then move away to close it.
   (`--ease-entrance` opening, `--ease-in` closing.)
5. Switch product categories — the photos swipe. (`--ease-emphasis` +
   `ease-in-out`.)
6. Open and close the HaloBCA panel, bottom right. (`--ease-entrance` opening,
   `--ease-in` closing.)
7. Switch FAQ or news categories — content fades in. (`--ease-entrance`.)

Then confirm the reduced-motion path still short-circuits: set your OS to
"reduce motion" (macOS: System Settings → Accessibility → Display → Reduce
motion) and reload. The preloader must be skipped entirely and reveals must be
instant.

## Test plan

There is **no test framework in this repository** — do not add one. Verification is:

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0, warning count unchanged at 87.
3. `npm run build` → exit 0.
4. Every `grep` gate in Steps 2–4 returns the stated result.
5. All seven motion checks in Step 5 look unchanged.
6. The reduced-motion check in Step 5.
7. **Computed-style spot check**: on a `[data-reveal]` element mid-page, read
   `transition-timing-function`. Expected `cubic-bezier(0.16, 1, 0.3, 1)` —
   the resolved value, proving the `var()` indirection works rather than
   silently falling back to `ease`.

That last check is the one that catches a typo'd token name. A misspelled
`var(--ease-entrence)` does not error; it silently resolves to the CSS initial
value (`ease`), and the difference is subtle enough to pass a casual look.

## Done criteria

ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with exactly 87 warnings and 0 errors
- [ ] `npm run build` exits 0
- [ ] `grep -n "cubic-bezier" src/app/globals.css` → exactly one line (763)
- [ ] `grep -rn "cubic-bezier" src/components/` → zero matches
- [ ] `grep -rn "ease-\[" src/` → zero matches
- [ ] `grep -c "var(--ease-entrance)" src/app/globals.css` → `13`
- [ ] The computed-style spot check resolves to `cubic-bezier(0.16, 1, 0.3, 1)`,
      not `ease`
- [ ] All seven Step 5 motion checks pass, plus the reduced-motion check
- [ ] `git diff --name-only` lists only the three in-scope files
- [ ] `plans/README.md` status row for 019 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed, or `@theme` already contains
  `--ease-` entries.
- Plan 018 has not landed — this plan places its tokens after 018's elevation
  block. Running out of order produces conflicting diffs in `globals.css`.
- The computed-style spot check resolves to `ease` rather than the expected
  curve. That means a `var()` is not resolving; find the typo rather than
  reverting to literals.
- Any of the seven motion checks looks different. Every substitution in this
  plan is value-identical, so a visible change means a wrong value was typed —
  find it, do not accept it.
- The counts do not match: 13 house-curve sites in `globals.css`, 3 emphasis
  sites total, 15 longhand `ease-in-out`, 3 longhand `ease-in`. A different
  count means the inventory is stale and blanket replacement is unsafe.
- You find yourself editing a `prefers-reduced-motion` block, an
  `animation-play-state` line, or a `@keyframes` body. None of those are in
  scope; report what you found instead.
- The lint warning count moves from 87 in either direction.

## Maintenance notes

- **The rule for new motion**: if an element *arrives*, use `ease-entrance`. If
  it travels a set distance and stops, use `ease-emphasis`. If it leaves, use
  `ease-in`. Only reach for a new curve when none of those is right — and if
  you do, add it here rather than inline.
- The preloader-exit curve (`globals.css:763`) is deliberately still a literal.
  It is one bespoke motion used once; naming it would suggest reuse that is not
  intended. If a second surface ever wants it, promote it then.
- Durations were deliberately untouched. They are already consistent
  (150/200/300/500/700) and Tailwind's `duration-*` handles them.
  `ScrollReveal.tsx`'s `REVEAL_DURATION_MS` must stay in sync with the 700ms in
  `globals.css:552-554` — that coupling is documented in the comment at line
  544 and is unaffected by this plan.
- A reviewer should scrutinise: the resolved computed value on a `[data-reveal]`
  element (proving no silent `ease` fallback), and that no
  `prefers-reduced-motion` block was touched.
- This is the last of the four `@theme` plans (016–019). After it lands, the
  block contains color, type, elevation and motion — the full token set.
