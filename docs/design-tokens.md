# Design tokens

Every token in this document is defined in the `@theme` block of
[`src/app/globals.css`](../src/app/globals.css). If this doc and that file
ever disagree, the CSS is right — file an update here.

## The two tiers

- **Core primitives** — what a value *is*. The color ramps (`neutral-*`,
  `blue-*`, `cyan-*`, `red-500`) mirror Figma's "Foundation / Colors" page
  (node 1578-27737) 1:1. Don't add, remove, or re-value a rung here without
  updating Figma first.
- **Semantic tokens** — what a value is *for* (`--color-primary`,
  `--color-primary-hover`, …). Call sites should reach for these, not the
  primitives directly, except when defining a new semantic token.

Type, elevation and motion tokens don't have a separate primitive tier — they
were introduced as semantic tokens directly, because (unlike color) there was
no pre-existing Figma-synced ramp to preserve underneath them.

## Color

| Token | Value | For |
|---|---|---|
| `--color-primary` | `var(--color-blue-500)` (`#005caa`) | Primary fill — buttons, active states |
| `--color-primary-hover` | `#0068c0` | Hover state on a primary fill |
| `--color-primary-active` | `#00457f` | Active/pressed state on a primary fill |
| `--color-on-primary` | `var(--color-neutral-100)` (`#ffffff`) | Foreground text/icon on a primary fill |

`--color-primary-hover` and `--color-primary-active` are **not** rungs on the
`blue-*` ramp — `#0068c0` sits between `blue-400` and `blue-500`; `#00457f`
sits just below `blue-600` without matching it. They're named states instead
of ramp steps so the Figma correspondence on the primitive ramp stays exact.

The core ramps (`neutral-100..900`, `blue-100..800`, `cyan-100/300/400/500/700`,
`red-500`) are usable directly as `bg-blue-700`, `text-neutral-800`, etc. —
reach for a semantic token first; fall back to a primitive when there's no
semantic meaning to name (e.g. a specific brand-blue background on a card).

## Type

Each token bundles size, line height, letter spacing and weight — because in
this design those four are never chosen independently.

| Token | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| `--text-eyebrow` | 12px | 12px | +1.8px (0.15em) | 600 |
| `--text-eyebrow-lg` | 14px | 14px | +2.1px (0.15em) | 600 |
| `--text-subtitle` | 18px | 26px | −0.36px (−0.02em) | 600 |
| `--text-title` | 20px | 28px | −0.4px (−0.02em) | 600 |
| `--text-heading` | 24px | 32px | −0.48px (−0.02em) | 600 |
| `--text-display` | 32px | 40px | −0.64px (−0.02em) | 600 |

**The derivation rule** — this is the part worth remembering, because it's
what a new size should follow rather than reinvent: tracking is **+0.15em**
for uppercase eyebrows and **−0.02em** for everything else 18px and up. A new
28px heading is `--text-…: 1.75rem` at `-0.02em`, not a hand-measured pixel
value.

**Overriding one property doesn't require a different token.** Tailwind
resolves each bundled property (line-height, letter-spacing, font-weight)
through a `--tw-*` variable, so `text-heading font-bold` or
`text-title leading-tight` wins on that one property regardless of class
order — confirmed by compiling against the installed Tailwind (4.3.2), not
assumed from docs.

Tailwind's stock `text-xs`…`text-2xl` scale is untouched and still used in
~190 places for genuine one-offs. These six tokens exist for **repeated**
recipes only — don't mass-convert a one-off site just because its size
happens to match a token.

## Elevation & effects

| Token | Used for |
|---|---|
| `--shadow-card` | The standard card lift — news cards, FAQ cards, promo cards |
| `--shadow-panel` | Floating chrome over the page — hero widget dropdowns, navbar search panel |
| `--shadow-edge-left` | Cast leftward by the MyBCA phone mock onto the panel behind it |
| `--shadow-scroll-top` / `--shadow-scroll-bottom` | Soft edge on a scrollable container, marking more content past the boundary |
| `--shadow-menu` / `--shadow-menu-flat` | Warm-grey lift on the navbar mega-menu shell / mobile menu (flat = first layer only) |
| `--text-shadow-hero` | Soft drop shadow for white type over photography |

**The promotion rule**: a value earns a token at its **second** call site, not
its first. Nine shadows in this codebase are still arbitrary `shadow-[…]`
values because each is used exactly once — that's correct, not an oversight.
If one of them gains a second user, promote it then.

## Motion

| Token | Curve | Used for |
|---|---|---|
| `--ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Anything arriving — scroll reveals, hero entrance, mega-menu unfurl, HaloBCA panel, Soliprio card settle, preloader handoff |
| `--ease-emphasis` | `cubic-bezier(0.65, 0, 0.35, 1)` | Travelling a fixed distance and stopping — preloader per-word rise, product photo swap |

Tailwind's stock `ease-in` / `ease-out` / `ease-in-out` utilities are used
as-is for everything else (closing/exiting motion mostly uses `ease-in`).
Durations are **not** tokenized — they're already a consistent, small set
(150/200/300/500/700ms) and Tailwind's `duration-*` utilities handle them
fine as-is.

**The rule for new motion**: arriving → `ease-entrance`. Fixed-distance travel
that stops → `ease-emphasis`. Leaving → stock `ease-in`. Only add a new curve
if none of those fits.

## Components

```css
@utility btn-base { /* height, radius, padding, gap, transition — geometry only */ }
@utility btn-primary { /* solid fill using --color-primary* */ }
@utility btn-secondary { /* outline fill using --color-blue-500 / --color-blue-100 */ }
```

Usage:

```tsx
<button className="btn-base btn-primary">Primary CTA</button>
<a className="btn-base btn-secondary" href="…">Secondary CTA</a>
```

Both compose with ordinary utilities for layout (`btn-base btn-primary w-full`,
`btn-base btn-secondary mx-auto mt-9 xl:hidden`) — `@utility` classes are
emitted before Tailwind's built-ins, so a normal utility on the same element
overrides them without `!important`.

**Three CTAs are deliberately not using these utilities**, and shouldn't be
converted to "finish the job":

- `CookieBanner.tsx`'s two buttons — different transition properties
  (`border-color,color,transform` / `background-color,transform`), an
  `active:scale-95` press, and breakpoint-dependent sizing/text.
- `HeroSection.tsx`'s `HeroCta` — starts at `h-10`, grows to `h-12` only at
  `xl:`, and is **white-filled with a blue hover fill** — the inverse of every
  other button — plus a glow shadow and an icon-inversion trick on hover.

Each shares the pill radius and little else; folding them in would need more
overrides than they currently have classes.

## How to add a token

1. Add it to the `@theme` block in `src/app/globals.css`, next to its
   category (color / type / elevation / motion).
2. Run `npm run build` — a malformed `@theme` entry fails the CSS build, so
   this is a real syntax check.
3. Use it.

Two rules keep the system from drifting back into copy-paste:

- **A token needs at least two call sites.** One call site is a rename, not a
  system value — leave it as an arbitrary value until a second site wants it.
- **Derive from the existing rule, don't invent a new value.** A new type size
  follows the tracking formula above; a new easing should be `ease-entrance`,
  `ease-emphasis`, or a stock Tailwind curve before it's anything else.

## Known open question

`CookieBanner.tsx`'s primary button hovers to `blue-400` (`#1179d1`), where
every other primary button in the codebase hovers to `--color-primary-hover`
(`#0068c0`). One of the two is wrong. This needs a design decision — it has
not been resolved by any of the token-conversion work, deliberately.
