# Design tokens

Every token in this document is defined in the `@theme` block of
[`src/app/globals.css`](../src/app/globals.css). If this doc and that file
ever disagree, the CSS is right — file an update here.

## Color

Color consumers use the canonical palette directly. The catalogue is organized into:

- **Main Color:** Neutral, Blue, Cyan, Prioritas Gold (`pgold-*`), Prioritas Brown (`pbrown-*`).
- **Semantic Color:** Green, Yellow, Red for success/availability, warnings, and errors/exhaustion.
- **Accent Color:** Bermuda, Brown, Muddy, Orange, Purple, Tosca, Teal.
- **Asset composition:** existing `asset-*` colors, unchanged.

All 67 colors in the owner-supplied Figma JSON retain their approved values.
The owner approved merging voucher, documentation, action and legacy alias colors into these palettes on 2026-10-11.
Use `bg-blue-500`, `text-neutral-800`, etc., or `var(--color-blue-500)` in CSS.
The pill CTA still uses `btn-base btn-primary` / `btn-base btn-secondary`.
Primary buttons use Blue 500 at rest, Blue 400 on hover, and Blue 600 when pressed, with Neutral 100 text.
Solitaire card fill and image fades use `--color-neutral-900` (#121417); the former pure black (#000000) was merged into Neutral 900 at the owner’s request.

| Token family | Values |
|---|---|
| `pgold-100` … `pgold-900` | `#FBF8F1`, `#F5EEDF`, `#E9D9B8`, `#D5BD91`, `#B29050`, `#98783F`, `#785D2F`, `#59451F`, `#3B2D16` |
| `pbrown-100` … `pbrown-900` | `#F2E8E0`, `#DDC8B8`, `#AE9079`, `#885E3F`, `#67442A`, `#46290B`, `#351E08`, `#281706`, `#1C1004` |
| `asset-savings`, `asset-deposit`, `asset-current`, `asset-securities` | `#665019`, `#F6C960`, `#E9AF35`, `#9D7A28` |

See [the color migration report](color-token-migration.md) for exact matches, changed values, including the Solitaire card fill.

## Type

The full Figma scale is now available through `text-display-{4xl,3xl,2xl,xl,l,m,s}`,
`text-heading-{xl,l,m,s,xs}`, `text-eyebrow-{l,m,s}`,
`text-body-{xl,l,m,s}-{bold,semibold,regular}`,
`text-body-article-regular`, and `text-label-{xl,l,m,s}-{bold,semibold,regular}`.
Display and Eyebrow are semibold 600; Heading is bold 700.
Label utilities include vertical trim (`trim-both`, `cap alphabetic`);
Body retains its line box. Label/Semibold/S is 12/14 per the supplied screenshot.

The eight names below remain available as aliases. Their values follow the
approved reference: `text-subtitle` has normal tracking, `text-heading` is
Heading/M at weight 700, and `text-hero-title-mobile` is Display/L at 28/32.
These three changes were explicitly approved by the owner on 2026-10-11.
`text-eyebrow-xl` remains available at 16/16. The credit-card hero introduction
uses `text-body-l-semibold` (16/24) and `xl:text-body-xl-semibold` (18/26),
with normal tracking and weight 600.
See [the gallery documentation](design-token-gallery.md) for the Figma source,
reference comparisons and the rules for preserving project additions.

Each approved Figma recipe bundles size, line height, letter spacing and weight.
Size-only consumers can use the helpers below while preserving component inheritance.

| Token | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| `--text-eyebrow` | 12px | 12px | +1.8px (0.15em) | 600 |
| `--text-eyebrow-lg` | 14px | 14px | +2.1px (0.15em) | 600 |
| `--text-eyebrow-xl` | 16px | 16px | +2.4px (0.15em) | 600 |
| `--text-subtitle` | 18px | 26px | normal | 600 |
| `--text-title` | 20px | 28px | −0.4px (−0.02em) | 600 |
| `--text-heading` | 24px | 32px | −0.48px (−0.02em) | 700 |
| `--text-hero-title-mobile` | 28px | 32px | −0.56px (−0.02em) | 600 |
| `--text-display` | 32px | 40px | −0.64px (−0.02em) | 600 |

**The derivation rule** — this is the part worth remembering, because it's
what a new size should follow rather than reinvent: tracking is **+0.15em**
for uppercase eyebrows, **−0.02em** for Display/Heading, and **normal** for
Body/Label. A new
28px heading is `--text-…: 1.75rem` at `-0.02em`, not a hand-measured pixel
value.

**Overriding one property doesn't require a different token.** Tailwind
resolves each bundled property (line-height, letter-spacing, font-weight)
through a `--tw-*` variable, so `text-heading font-bold` or
`text-title leading-tight` wins on that one property regardless of class
order — confirmed by compiling against the installed Tailwind (4.3.2), not
assumed from docs.

The owner requested retiring the stock typography scale on 2026-10-11.
All stock text-size usages now read project tokens. The stock `--text-xs` through
`--text-9xl` sizes are set to `initial`, preventing new scale utilities from
being generated.

`text-size-body-m`, `text-size-body-l`, `text-size-display-s`, and
`text-size-display-m` share the size/leading from the corresponding approved
recipe without changing inherited component weight/tracking. Full Figma
recipes remain preferred for new UI. This distinction preserves existing
visuals during the migration; using a Body regular recipe as a size utility
would reset a semibold parent to 400.

The owner approved merging three former size variants on 2026-10-11:
`text-body-s-compact` aliases Body/Regular/S at 12/18;
`text-body-xl-relaxed` aliases Body/Regular/XL at 18/26;
`text-display-3xl-tight` aliases Display/4XL at 48/56. Their complete metrics
follow the canonical recipe, and their gallery cards are merged into it.
Size-only consumers now use `text-size-body-s`, `text-size-body-xl`, and
`text-size-display-4xl`, retaining component weight/tracking and explicit leading
while sharing the approved default size/leading. The credit-card hero introduction
also follows Body/Semibold/XL: its former desktop leading of 28px is now 26px.

The owner aligned the remaining Display sizes on 2026-10-11:
`text-display-compact` aliases Display/L (28/32), and `text-display-intermediate`
aliases the new Display/2XL (36/40). Both include tracking −0.02em and weight 600.
Former Display/2XL (40/48) is now Display/3XL; former Display/3XL (48/56)
is now Display/4XL. Existing 48px consumers use the renamed 4XL helper.
There are no remaining typography additions in the gallery.
See [the migration report](typography-migration.md) for differences, component
leading/weight overrides, and affected locations.

Custom size classes are registered with `tailwind-merge` in
`src/components/catalog/ui/utils.ts`; otherwise `text-*` names can be mistaken
for colors and be dropped while merging component classes.

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
| `--ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Anything arriving — scroll reveals, hero entrance, mega-menu unfurl, HaloBCA panel, Soliprio card settle |
| `--ease-emphasis` | `cubic-bezier(0.65, 0, 0.35, 1)` | Travelling a fixed distance and stopping — product photo swap |

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
@utility btn-primary { /* Blue 500 fill, Blue 400 hover, Blue 600 pressed */ }
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

## Button state alignment

The former CookieBanner / pill CTA hover difference was resolved on 2026-10-11: both use Blue 400 (#1179d1), following the supplied palette. Pressed pill CTAs use Blue 600 (#144e83).
