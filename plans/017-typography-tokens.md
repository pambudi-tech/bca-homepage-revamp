# Plan 017: Give the type scale real tokens instead of repeated class recipes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> ```bash
> git diff --stat 28729d0..HEAD -- src/app/globals.css src/components/home/NewsSection.tsx src/components/home/FaqSection.tsx src/components/home/ProductSection.tsx src/components/home/PromoSection.tsx src/components/home/MyBcaSection.tsx src/components/home/MegaMenuPanel.tsx src/components/home/MobileMenu.tsx src/components/home/SoliprioSection.tsx
> ```
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: `plans/016-semantic-color-state-tokens.md` (file overlap:
  both edit the `@theme` block in `src/app/globals.css`)
- **Category**: tech-debt (design system)
- **Planned at**: commit `28729d0`, 2026-08-03

## Why this matters

Colors are tokenized in this repo; type is not. Every heading, eyebrow and
title re-declares its full recipe as four or seven separate utility classes,
and those recipes are copy-pasted across files. The section heading alone
appears verbatim in three files and near-verbatim in three more.

The hidden cost is that the recipes encode a **rule nobody wrote down**. There
are 32 arbitrary `tracking-[…]` values in `src/`, and they are not 32
decisions — they are two:

| written as | at size | works out to |
|---|---|---|
| `tracking-[-0.4px]` | 20px | −0.02em |
| `tracking-[-0.48px]` | 24px | −0.02em |
| `tracking-[-0.64px]` | 32px | −0.02em |
| `tracking-[1.8px]` | 12px | +0.15em |
| `tracking-[2.1px]` | 14px | +0.15em |

Two rules, spelled five ways, in absolute pixels that silently stop being
correct the moment a font size changes. Someone adding a 28px heading has no
way to know the answer is −0.56px other than by finding this table.

After this plan, `text-heading` carries its size, line height, letter spacing
and weight as one token. The rule lives in one place, new sizes derive from it
automatically, and a call site reads as what it *is* rather than how it is
built.

## Current state

### The mechanism — verified, not assumed

This repo runs **Tailwind CSS 4.3.2** (`node_modules/tailwindcss/package.json`).
Its `--text-*` theme namespace accepts three companion keys —
`--line-height`, `--letter-spacing` and `--font-weight`. Compiling a token with
all four against the installed Tailwind produces exactly this:

```css
.text-heading {
  font-size: var(--text-heading);
  line-height: var(--tw-leading, var(--text-heading--line-height));
  letter-spacing: var(--tw-tracking, var(--text-heading--letter-spacing));
  font-weight: var(--tw-font-weight, var(--text-heading--font-weight));
}
.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
```

**Read that carefully, because the whole plan rests on it.** The token's line
height, tracking and weight are *defaults*. A companion utility (`font-bold`,
`leading-8`, `tracking-tight`) sets the corresponding `--tw-*` variable, which
the token's own declaration then reads. So an override wins **regardless of
class order or stylesheet order** — there is no cascade race to lose.

That is what makes it safe to bundle four properties into one token: call sites
that need a different weight at the same size (there are several, e.g.
`ProductSection.tsx:1498` toggling `font-bold`/`font-semibold`) keep working by
adding one class.

### The existing `@theme` block — `src/app/globals.css:13-51`

Contains the color ramps only. **Note the three `initial` resets at the top:**

```css
@theme {
  --color-neutral-*: initial;
  --color-blue-*: initial;
  --color-cyan-*: initial;
  /* … color ramps … */
}
```

There is **no** `--text-*: initial` reset, and this plan must not add one.
Tailwind's stock size scale (`text-xs` … `text-2xl`) is used in roughly 190
places across `src/` and stays exactly as it is. The new semantic tokens sit
*alongside* it, and migration is incremental — this plan converts only the
repeated recipes listed below.

### The repeated recipes and their full site inventory

**Recipe A — eyebrow, 12px** (`text-xs font-semibold uppercase leading-3 tracking-[1.8px]`),
4 sites, each also carrying the 14px desktop step
`xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]` except `FaqSection.tsx:356`:

- `src/components/home/NewsSection.tsx:230`
- `src/components/home/ProductSection.tsx:1462`
- `src/components/home/PromoSection.tsx:336`
- `src/components/home/FaqSection.tsx:356` (mobile-only, no `xl:` step)

`NewsSection.tsx:230` in full:

```tsx
            <p data-reveal className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-blue-500 xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]">
```

**Recipe B — eyebrow, 14px** (`text-sm font-semibold uppercase leading-[14px] tracking-[2.1px]`),
1 site: `src/components/home/FaqSection.tsx:327`

**Recipe C — section heading, 24px → 32px** (`text-2xl font-semibold leading-8 tracking-[-0.48px]`),
5 sites:

- `src/components/home/NewsSection.tsx:234` — with `xl:` step to 32px
- `src/components/home/PromoSection.tsx:340` — with `xl:` step to 32px
- `src/components/home/ProductSection.tsx:1467` — with `xl:` step to 32px
- `src/components/home/FaqSection.tsx:394` — 24px only
- `src/components/home/MyBcaSection.tsx:111` — 24px only

`PromoSection.tsx:340` in full:

```tsx
          <h2 data-reveal="blur-up" className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-blue-700 xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
```

**Recipe D — display, 32px** (`text-[32px] … leading-10 tracking-[-0.64px]`),
3 standalone sites beyond the `xl:` steps already covered by Recipe C:

- `src/components/home/FaqSection.tsx:331` — uses `leading-9` (36px), **not**
  `leading-10`; see Step 5
- `src/components/home/ProductSection.tsx:1498` — toggles `font-bold`/`font-semibold`
- `src/components/home/SoliprioSection.tsx:90` — no explicit weight

**Recipe E — title, 20px** (`text-xl font-semibold leading-7 tracking-[-0.4px]`),
5 sites:

- `src/components/home/MegaMenuPanel.tsx:50`
- `src/components/home/ProductSection.tsx:382`
- `src/components/home/ProductSection.tsx:417`
- `src/components/home/ProductSection.tsx:928`
- `src/components/home/PromoSection.tsx:161`

**Recipe F — subtitle, 18px** (`text-lg font-semibold leading-[26px]`),
5 sites:

- `src/components/home/MegaMenuPanel.tsx:92`
- `src/components/home/NewsSection.tsx:82` — this one *also* carries
  `tracking-[-0.4px]`, which is −0.022em at 18px, not −0.02em; see Step 5
- `src/components/home/ProductSection.tsx:553`
- `src/components/home/MobileMenu.tsx:454`
- `src/components/home/MobileMenu.tsx:497`

**Total: 23 call sites across 8 files.**

### Repo conventions to match

- Theme tokens live in `@theme` in `src/app/globals.css`. Comments there are
  prose explaining *why*, often citing the Figma node — see lines 8-12 and
  41-43 for the house voice. Match it.
- Tailwind's own `theme.css` writes line heights as self-documenting division,
  e.g. `--text-sm--line-height: calc(1.25 / 0.875);`. **Follow that form** —
  it shows the px pair at a glance. (Verified at
  `node_modules/tailwindcss/theme.css:349-358`.)
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
`@typescript-eslint/no-unused-vars` (`FaqSection.tsx:100`,
`ProductSection.tsx:18`), 1 × `react-hooks/exhaustive-deps`
(`src/lib/useLayoutVariant.ts:29`). Your change must not move this number.

## Scope

**In scope** (the only files you should modify):

- `src/app/globals.css` — add the `--text-*` tokens to `@theme`
- `src/components/home/NewsSection.tsx`
- `src/components/home/FaqSection.tsx`
- `src/components/home/ProductSection.tsx`
- `src/components/home/PromoSection.tsx`
- `src/components/home/MyBcaSection.tsx`
- `src/components/home/MegaMenuPanel.tsx`
- `src/components/home/MobileMenu.tsx`
- `src/components/home/SoliprioSection.tsx`

**Out of scope** (do NOT touch, even though they look related):

- **Tailwind's stock size scale.** Do not add `--text-*: initial`. Roughly 190
  uses of `text-xs`/`text-sm`/`text-base`/`text-lg`/`text-xl`/`text-2xl` across
  `src/` must keep working. Only the 23 listed sites change.
- **One-off type that matches no recipe** — e.g. `HeroSection.tsx:181`'s `<h1>`
  (24px→36px with `-0.8px` tracking) and `MobileHeroWidget.tsx:512`'s
  `text-[16px]`. They are single-use and are covered in "Maintenance notes".
- **`[text-shadow:…]`** on any of these elements. Seventeen elements carry it,
  several of them in this plan's site list. **Leave every one exactly as it is**
  — it is plan 018's job. Touching it here makes two diffs collide.
- **Colors** (`text-blue-700`, `text-white`, …). Plan 016 owns color; leave the
  color class on each element untouched.
- `archive/` — reference snapshots, excluded from tsconfig and ESLint.
- The `<img>` elements and their 84 lint warnings — deliberate.

## Git workflow

- Branch: `advisor/017-typography-tokens`
- Commit style: short imperative subject, matching `git log` (e.g. "Add
  semantic type scale tokens, convert repeated heading recipes").
- Commit per step, so a regression can be bisected to one recipe.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the type scale to `@theme`

In `src/app/globals.css`, inside the existing `@theme` block, **after** the
semantic color tier added by plan 016, add:

```css

  /* ---- Type scale ----
     Each token carries size, line height, letter spacing and weight together,
     because in this design they are never chosen independently — a 24px
     heading is always 32px leading at -0.02em, and writing that as four
     classes at every call site is how the six near-identical copies of the
     section heading happened.

     Tracking is derived, not hand-picked. Every negative value in the old
     markup works out to exactly -0.02em (-0.4px at 20px, -0.48px at 24px,
     -0.64px at 32px) and every eyebrow to +0.15em (1.8px at 12px, 2.1px at
     14px). Expressed in em here so a size change carries its tracking with it
     instead of silently going stale.

     Line heights follow Tailwind's own theme.css convention of writing the
     px pair as a division, so the source values stay readable.

     These do NOT replace Tailwind's stock text-xs..text-2xl scale, which is
     still used in ~190 places. They sit alongside it and say what a piece of
     type IS rather than how it is assembled. Any of the four properties can
     still be overridden per call site with the matching utility (font-bold,
     leading-9, tracking-*) — Tailwind resolves those through --tw-* variables,
     so the override wins regardless of class order. */
  --text-eyebrow: 0.75rem;                                /* 12px */
  --text-eyebrow--line-height: 1;                         /* 12px */
  --text-eyebrow--letter-spacing: 0.15em;                 /* 1.8px */
  --text-eyebrow--font-weight: 600;

  --text-eyebrow-lg: 0.875rem;                            /* 14px */
  --text-eyebrow-lg--line-height: 1;                      /* 14px */
  --text-eyebrow-lg--letter-spacing: 0.15em;              /* 2.1px */
  --text-eyebrow-lg--font-weight: 600;

  --text-subtitle: 1.125rem;                              /* 18px */
  --text-subtitle--line-height: calc(26 / 18);            /* 26px */
  --text-subtitle--letter-spacing: -0.02em;               /* -0.36px */
  --text-subtitle--font-weight: 600;

  --text-title: 1.25rem;                                  /* 20px */
  --text-title--line-height: calc(28 / 20);               /* 28px */
  --text-title--letter-spacing: -0.02em;                  /* -0.4px */
  --text-title--font-weight: 600;

  --text-heading: 1.5rem;                                 /* 24px */
  --text-heading--line-height: calc(32 / 24);             /* 32px */
  --text-heading--letter-spacing: -0.02em;                /* -0.48px */
  --text-heading--font-weight: 600;

  --text-display: 2rem;                                   /* 32px */
  --text-display--line-height: calc(40 / 32);             /* 40px */
  --text-display--letter-spacing: -0.02em;                /* -0.64px */
  --text-display--font-weight: 600;
```

**Verify**:
```bash
npm run build
```
→ exit 0. A malformed `@theme` entry fails the CSS build, so this catches
syntax errors before any call site depends on the tokens.

### Step 2: Convert Recipe A and B (the eyebrows)

At the four Recipe A sites, replace

```
text-xs font-semibold uppercase leading-3 tracking-[1.8px]
```
with
```
text-eyebrow uppercase
```

and, where present, replace the desktop step

```
xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]
```
with
```
xl:text-eyebrow-lg
```

`uppercase` stays — it is a text-transform, not part of the type token.

`NewsSection.tsx:230` before and after:

```tsx
// before
<p data-reveal className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-blue-500 xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]">
// after
<p data-reveal className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">
```

At the single Recipe B site (`FaqSection.tsx:327`), replace
`text-sm font-semibold uppercase leading-[14px] tracking-[2.1px]` with
`text-eyebrow-lg uppercase`. **Leave its `[text-shadow:…]` and `opacity-75`
untouched.**

**Verify**:
```bash
grep -rn "tracking-\[1.8px\]\|tracking-\[2.1px\]" src/
```
→ zero matches.

### Step 3: Convert Recipe C (the section heading)

At the five sites, replace

```
text-2xl font-semibold leading-8 tracking-[-0.48px]
```
with
```
text-heading
```

and, where present, the desktop step

```
xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]
```
with
```
xl:text-display
```

`PromoSection.tsx:340` before and after:

```tsx
// before
<h2 data-reveal="blur-up" className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-blue-700 xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
// after
<h2 data-reveal="blur-up" className="text-heading text-blue-700 xl:w-[560px] xl:text-display">
```

`ProductSection.tsx:1467` is inside a template literal with a conditional —
change only the static class portion, leave the `${variant === "curved" …}`
expression exactly as it is.

`FaqSection.tsx:394` and `MyBcaSection.tsx:111` have no `xl:` step; convert the
24px part only and **leave their `[text-shadow:…]` untouched**.

**Verify**:
```bash
grep -rn "tracking-\[-0.48px\]" src/
```
→ zero matches.

### Step 4: Convert Recipes E and F (titles and subtitles)

**Recipe E**, 5 sites — replace `text-xl font-semibold leading-7 tracking-[-0.4px]`
with `text-title`.

**Recipe F**, 5 sites — replace `text-lg font-semibold leading-[26px]` with
`text-subtitle`.

Two of these need care:

- `NewsSection.tsx:82` also carries `tracking-[-0.4px]` *and* an `xl:` step to
  `text-xl xl:leading-7`. Convert the base to `text-subtitle` and the desktop
  step to `xl:text-title`. Drop the now-redundant `tracking-[-0.4px]` — at 18px
  it was −0.022em, and `text-subtitle` supplies −0.02em (−0.36px). **This is a
  0.04px change at one call site**; note it in your report.
- `MobileMenu.tsx:454` and `:497` are `<span>` elements inside buttons; the
  surrounding classes stay untouched.

**Verify**:
```bash
grep -rn "tracking-\[-0.4px\]" src/
```
→ **one** remaining match: `HeroSection.tsx:181` (the `<h1>`, deliberately out
of scope).

### Step 5: Handle the two outliers explicitly

Two sites nearly match a recipe but not quite. The operator has approved
visual adjustment in service of consistency for this batch, so **normalise
both, and report both**:

1. **`FaqSection.tsx:331`** — 32px type with `leading-9` (36px) where the
   display token specifies 40px. Convert to `text-display`, letting the line
   height change from 36px to 40px. It is a two-line block inside an absolutely
   positioned card, so this shifts its second line down 4px. Screenshot the FAQ
   section before and after and include both in your report. **If the block
   overflows its card, STOP** — do not paper over it by re-adding `leading-9`;
   report instead.

2. **`SoliprioSection.tsx:90`** — `text-[32px] leading-10 tracking-[-0.64px]`
   with no weight class, so it currently renders at the inherited weight.
   `text-display` supplies `font-weight: 600`. Check what it inherits today
   (read the computed `font-weight` in the browser before changing it). If it
   is already 600, convert cleanly. **If it is 400**, convert to
   `text-display font-normal` to preserve it, and note it.

**Verify**:
```bash
grep -rn "text-\[32px\]" src/
```
→ zero matches.

### Step 6: Verify the gates and the rendered result

```bash
npm run typecheck && npm run lint && npm run build
```
→ typecheck exit 0; lint exit 0 at 87 warnings / 0 errors; build exit 0.

Then start the dev server (`npm run dev`, or the `nextjs-dev-nogate`
configuration in `.claude/launch.json` on port 3100 if `PREVIEW_PASSWORD` is
set in `.env.local`) and confirm by **computed style**, not by eye:

| Element | Expected computed values |
|---|---|
| Promo section `<h2>` at ≥1280px wide | `font-size: 32px`, `line-height: 40px`, `letter-spacing: -0.64px`, `font-weight: 600` |
| Same `<h2>` at 375px wide | `font-size: 24px`, `line-height: 32px`, `letter-spacing: -0.48px` |
| Product section eyebrow at 375px | `font-size: 12px`, `line-height: 12px`, `letter-spacing: 1.8px` |
| Product section eyebrow at ≥1280px | `font-size: 14px`, `line-height: 14px`, `letter-spacing: 2.1px` |
| `ProductSection.tsx:1498` active category | `font-weight: 700` when active, `600` when not — this is the override check |

That last row is the important one. If the active category renders 600 when
active, the `--tw-font-weight` override is not working and something about the
token declaration is wrong. **STOP and report** rather than working around it.

## Test plan

There is **no test framework in this repository** — do not add one. Verification is:

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0, warning count unchanged at 87.
3. `npm run build` → exit 0.
4. All four `grep` gates from Steps 2–5 return the stated results.
5. The five computed-style rows in Step 6.
6. Screenshot each of the five sections that changed — Product, Promo, News,
   FAQ, MyBCA — at 375px and 1440px, before and after. Everything should be
   pixel-identical **except** the two outliers from Step 5 and
   `NewsSection.tsx:82`'s 0.04px tracking change. Any other difference is a
   bug; investigate before reporting done.

## Done criteria

ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with exactly 87 warnings and 0 errors
- [ ] `npm run build` exits 0
- [ ] `grep -rn "tracking-\[1.8px\]\|tracking-\[2.1px\]\|tracking-\[-0.48px\]\|tracking-\[-0.64px\]" src/` → zero matches
- [ ] `grep -rn "text-\[32px\]" src/` → zero matches
- [ ] `grep -rn "tracking-\[-0.4px\]" src/` → exactly one match (`HeroSection.tsx:181`)
- [ ] `grep -c "text-shadow" src/components/home/FaqSection.tsx` unchanged from
      before your change (proves plan 018's territory was not touched)
- [ ] `git diff --name-only` lists only the nine files in the In-scope list
- [ ] The Step 6 computed-style table passes, including the `font-bold` override row
- [ ] Before/after screenshots attached for the two Step 5 outliers
- [ ] `plans/README.md` status row for 017 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed, or `@theme` already contains
  `--text-*` entries.
- Plan 016 has not landed. This plan's Step 1 says "after the semantic color
  tier"; if that tier is absent, the two plans will conflict in `globals.css`.
  Report rather than adding 016's tokens yourself.
- The `font-bold` override check in Step 6 fails. That means the `--tw-*`
  mechanism is not behaving as documented above, and every bundled-weight token
  in this plan is unsafe. Do not work around it by removing the `--font-weight`
  keys — report, so the approach can be reconsidered as a whole.
- `FaqSection.tsx:331` overflows its card after the line-height change.
- The lint warning count moves from 87 in either direction.
- A conversion changes more than the intended element — several of these class
  strings live inside template literals with conditionals
  (`ProductSection.tsx:1467`, `:1498`, `FaqSection.tsx:251`). If you cannot
  isolate the static portion cleanly, report that site rather than rewriting
  the expression.
- You are tempted to convert type outside the 23 listed sites. Don't. Record
  candidates in your report.

## Maintenance notes

- **New type sizes derive from the rule, they do not invent one.** Tracking is
  −0.02em for everything 18px and up, +0.15em for uppercase eyebrows. A new
  28px heading is `--text-…: 1.75rem` with `-0.02em`, not a hand-measured px
  value.
- Two one-off sites are deliberately left un-tokenized: `HeroSection.tsx:181`
  (24→36px, `-0.8px` = −0.022em — the one genuine outlier in the whole
  codebase) and `MobileHeroWidget.tsx:512`. If a second site ever wants either,
  that is the moment to promote it to a token, not before.
- The stock `text-xs`…`text-2xl` scale still exists and is still used ~190
  times. That is fine and intentional: semantic tokens are for *repeated
  recipes*, raw sizes for genuine one-offs. Do not mass-convert the remainder.
- A reviewer should scrutinise: the `font-bold` override at
  `ProductSection.tsx:1498`, the two Step 5 outliers' screenshots, and that no
  `[text-shadow:…]` was touched (that belongs to plan 018).
- Plans 016, 018 and 019 also edit the `@theme` block. Run them sequentially.
