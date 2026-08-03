# Plan 016: Add a semantic color layer so interaction states stop being raw hex

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> ```bash
> git diff --stat 28729d0..HEAD -- src/app/globals.css src/components/home/MyBcaSection.tsx src/components/home/ProductSection.tsx src/components/home/PromoSection.tsx src/components/home/HaloBcaChat.tsx src/components/home/Navbar.tsx src/components/home/HeroWidget.tsx src/components/home/MobileHeroWidget.tsx
> ```
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt (design system)
- **Planned at**: commit `28729d0`, 2026-08-03

## Why this matters

`src/app/globals.css` already defines BCA's core color ramps as Tailwind theme
tokens, and its own comment states the gap this plan closes, verbatim:

> `Semantic/state colors still live inline at call sites and are not tokenized yet.`

The concrete cost: every primary button on the site re-declares its own hover
and active colors as raw hex — `hover:bg-[#0068c0] active:bg-[#00457f]` —
copy-pasted across five files. Neither hex exists anywhere in `@theme`. They are
off-ramp shades that no token defines, no designer can find, and nobody can
change in one place. One call site (`MyBcaSection.tsx:42`) has already drifted:
it renders the same button with **no** hover or active state at all.

After this plan, the primary blue and its two interaction states are named
tokens. Changing BCA's primary blue becomes a one-line edit instead of a
grep-and-pray across five files. This plan is also the foundation for plan 020
(the shared button utility) — that plan cannot be written cleanly until the
states have names.

## Current state

### The token file — `src/app/globals.css:8-51`

```css
/* Core foundation colors — mirrors the Figma "Foundation / Colors" page
   (BCA.co.id Design Exploration, node 1578-27737). Only the core ramps are
   defined here: neutral, primary (blue), secondary (cyan). Semantic/state
   colors still live inline at call sites and are not tokenized yet.
   Keep these in sync with Figma; do not introduce off-ramp hexes. */
@theme {
  /* Clear Tailwind's stock ramps first. These share our token names, so
     without this an undefined shade (blue-900, cyan-200, neutral-50, …)
     would silently render Tailwind's blue instead of BCA's. Cleared, it
     produces no utility at all — off-palette usage breaks visibly. */
  --color-neutral-*: initial;
  --color-blue-*: initial;
  --color-cyan-*: initial;

  --color-neutral-100: #ffffff;
  --color-neutral-200: #f6f7f9;
  --color-neutral-300: #e9ecef;
  --color-neutral-400: #dfe0e2;
  --color-neutral-500: #cfcfcf;
  --color-neutral-600: #868e96;
  --color-neutral-700: #495057;
  --color-neutral-800: #26292c;
  --color-neutral-900: #121417;

  --color-blue-100: #f4f8fc;
  --color-blue-200: #dbefff;
  --color-blue-300: #d1eaff;
  --color-blue-400: #1179d1;
  --color-blue-500: #005caa;
  --color-blue-600: #144e83;
  --color-blue-700: #00335e;
  --color-blue-800: #00213d;

  /* Error ramp — only the one shade the Figma text-input states use
     (Foundation / Colors, "color/error/red-500"). Tailwind's stock red-*
     stays intact; this shade overrides it so red-500 is BCA's red. */
  --color-red-500: #cd1923;

  --color-cyan-100: #e6f3ff;
  --color-cyan-300: #d1f4ff;
  --color-cyan-400: #47d1ff;
  --color-cyan-500: #00b5f0;
  --color-cyan-700: #0094d5;
}
```

Note the instruction in that comment: **"do not introduce off-ramp hexes."**
The `#0068c0` / `#00457f` pair violates it today. This plan resolves the
violation by naming them, not by changing them.

### Where the two undefined hexes appear

`#0068c0` (hover) — 6 occurrences:

| File | Line | Context |
|---|---|---|
| `src/components/home/Navbar.tsx` | 80 | active nav pill, hover fill |
| `src/components/home/MyBcaSection.tsx` | 118 | mobile download CTA |
| `src/components/home/ProductSection.tsx` | 1602 | GoodPlan CTA link |
| `src/components/home/ProductSection.tsx` | 1636 | curved-layout CTA button |
| `src/components/home/PromoSection.tsx` | 384 | "view more" CTA link |
| `src/components/home/HaloBcaChat.tsx` | 476 | chat submit button |
| `src/components/home/HaloBcaChat.tsx` | 495 | `--beam` custom property (see Step 3) |

`#00457f` (active) — 5 occurrences: the same list minus `Navbar.tsx:80` and
minus `HaloBcaChat.tsx:495`.

### Exact excerpts to change

`src/components/home/MyBcaSection.tsx:118`:

```tsx
              <button className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]">
```

`src/components/home/ProductSection.tsx:1602`:

```tsx
            className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]"
```

`src/components/home/ProductSection.tsx:1636`:

```tsx
          <button
            className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]"
          >
```

`src/components/home/PromoSection.tsx:384`:

```tsx
            className="mx-auto mt-9 flex h-12 w-fit items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f] xl:hidden"
```

`src/components/home/HaloBcaChat.tsx:473-476`:

```tsx
                // Matches the product section's CTA button (ProductSection.tsx)
                // — same height, radius, and hover/active blue steps.
                className="flex h-12 w-full items-center justify-center rounded-full bg-blue-500 text-base font-semibold text-neutral-100 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]"
```

`src/components/home/Navbar.tsx:79-84`:

```tsx
    className: `flex h-10 cursor-pointer items-center justify-center gap-0.5 rounded-full border px-4 transition-colors duration-300 ${active
        ? `border-blue-500 ${hover ? "bg-[#0068c0]" : "bg-blue-500"}`
        : hover
          ? "border-white/20 bg-[rgba(18,20,23,0.5)]"
          : "border-white/25 bg-[rgba(5,13,25,0.1)]"
      }`,
```

`src/components/home/MyBcaSection.tsx:42` — **the drifted one**, same button,
missing both states:

```tsx
            <button className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 text-white">
```

### Where these two shades sit relative to the existing ramp

Verified numerically, so you understand why they are **not** simply new rungs:

- `#0068c0` is lighter than `blue-500` (`#005caa`) and darker than `blue-400`
  (`#1179d1`). It falls **between** two defined rungs.
- `#00457f` is darker than `blue-500` and marginally darker than `blue-600`
  (`#144e83`), which it nearly duplicates without matching.

Adding them as `blue-450` / `blue-550` would wedge unnamed steps into a ramp
that mirrors Figma. Instead this plan adds a **second tier**: semantic tokens
that alias the ramp. This is the standard two-tier token architecture — core
primitives (what the color *is*) and semantic tokens (what the color is *for*).

### Repo conventions to match

- **Tailwind CSS 4.3.2** (verified: `node_modules/tailwindcss/package.json`).
  Theme tokens are declared in `@theme` in `src/app/globals.css`; any
  `--color-<name>` key there automatically generates `bg-<name>`,
  `text-<name>`, `border-<name>`, `ring-<name>`, etc.
- Comments in `globals.css` are prose explaining *why*, often several lines,
  and frequently cite the Figma node. Match that voice — see lines 8-12 and
  14-17 above for the house style.
- There is **no test suite**. The verification gates are `npm run lint` and
  `npm run typecheck`, plus live checks in the dev server.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run typecheck` | exit 0, no output |
| Lint | `npm run lint` | exit 0, **87 warnings, 0 errors** (baseline below) |
| Dev server | `npm run dev` | starts on :3000 |
| Build | `npm run build` | exit 0 |

### Lint baseline — verified at `28729d0`, 2026-08-03

`npm run lint` exits 0 with **87 warnings, 0 errors**:

| count | rule |
|---|---|
| 84 | `@next/next/no-img-element` (deliberate — the owner declined `next/image`) |
| 2 | `@typescript-eslint/no-unused-vars` (`FaqSection.tsx:100`, `ProductSection.tsx:18`) |
| 1 | `react-hooks/exhaustive-deps` (`src/lib/useLayoutVariant.ts:29`) |

Your change must not add to this. It should not reduce it either — if the count
moves in either direction, work out why before continuing.

## Scope

**In scope** (the only files you should modify):

- `src/app/globals.css` — add the semantic tier to `@theme`
- `src/components/home/MyBcaSection.tsx`
- `src/components/home/ProductSection.tsx`
- `src/components/home/PromoSection.tsx`
- `src/components/home/HaloBcaChat.tsx`
- `src/components/home/Navbar.tsx`

**Out of scope** (do NOT touch, even though they look related):

- **The existing core ramps.** Do not add, remove, renumber or re-value any
  `--color-neutral-*`, `--color-blue-*`, `--color-cyan-*` or `--color-red-*`
  entry. They mirror Figma; changing one desynchronises the design source.
- **Every other raw hex and `rgba()` in the codebase.** There are ~101 hex and
  ~139 `rgba()` literals in `src/`. Most are legitimate: seasonal decor artwork
  (`cny-art.ts`, `christmas-art.ts`, `decor-kit.ts`), confetti palettes, and
  one-off gradient stops. This plan converts **only** the `#0068c0` / `#00457f`
  interaction pair. Resist the urge to sweep the rest.
- **`archive/`** — reference snapshots, excluded from `tsconfig.json` and
  ESLint, imported by nothing.
- **The `<img>` elements.** The 84 `@next/next/no-img-element` warnings are
  deliberate; the owner declined `next/image` because the layered
  subject/background compositions use hand-tuned CSS.
- The button markup itself — deduplicating the repeated class string is
  **plan 020's** job. Here you change colors only; the duplication stays.

## Git workflow

- Branch: `advisor/016-semantic-color-state-tokens`
- Commit style: short imperative subject, matching `git log` (e.g. "Add
  semantic primary color tokens for interaction states").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the semantic tier to `@theme`

In `src/app/globals.css`, **after** the `--color-cyan-700` line and still
inside the same `@theme` block, add:

```css

  /* ---- Semantic tier ----
     The ramps above say what a color *is*; these say what it is *for*. Call
     sites should reach for these, so a change to BCA's primary blue is one
     edit here rather than a grep across every button.

     --color-primary-hover and --color-primary-active are the two shades the
     Figma button states use. They deliberately are NOT rungs on the blue ramp:
     #0068c0 falls between blue-400 and blue-500, and #00457f sits just below
     blue-600 without matching it. Wedging them in as blue-450/550 would break
     the 1:1 correspondence with the Figma "Foundation / Colors" page, so they
     live here as named states instead. */
  --color-primary: var(--color-blue-500);
  --color-primary-hover: #0068c0;
  --color-primary-active: #00457f;
  --color-on-primary: var(--color-neutral-100);
```

`--color-on-primary` names the foreground that sits on a primary fill. It
matters because the call sites currently disagree — `MyBcaSection.tsx:42` uses
`text-white` while `MyBcaSection.tsx:118` uses `text-neutral-100` for the same
button. Both resolve to `#ffffff`; only one is a token.

**Verify**: after Step 2 the generated utilities are exercised. For now:

```bash
npm run build
```
→ exit 0. (A malformed `@theme` entry fails the CSS build, so this is a real
gate even before any call site uses the tokens.)

### Step 2: Convert the five primary-button call sites

Replace `hover:bg-[#0068c0]` with `hover:bg-primary-hover` and
`active:bg-[#00457f]` with `active:bg-primary-active` at:

- `src/components/home/MyBcaSection.tsx:118`
- `src/components/home/ProductSection.tsx:1602`
- `src/components/home/ProductSection.tsx:1636`
- `src/components/home/PromoSection.tsx:384`
- `src/components/home/HaloBcaChat.tsx:476`

Leave `bg-blue-500` as-is in these five for now — plan 020 folds the whole
class string into one utility, and changing the base fill here as well would
make that plan's diff harder to review. Change **only** the two bracket values.

Example — `MyBcaSection.tsx:118` before and after:

```tsx
// before
<button className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]">
// after
<button className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active">
```

**Verify**:
```bash
grep -rn "0068c0\|00457f" src/components/
```
→ exactly **one** remaining match: `HaloBcaChat.tsx:495` (handled in Step 3).

### Step 3: Convert the HaloBCA beam color

`src/components/home/HaloBcaChat.tsx:495` passes the same hex as a CSS custom
property to the floating button's comet beam:

```tsx
        style={{ "--beam": "#0068c0", "--beam-radius": "9999px" } as React.CSSProperties}
```

Change the value to `"var(--color-primary-hover)"`.

This works because `--beam` is consumed inside `.halobca-beam`'s
`conic-gradient()` and `drop-shadow()` in `globals.css:452-476`, and Tailwind 4
emits every `@theme` key as a real CSS custom property on `:root` — so
`var(--color-primary-hover)` resolves there exactly as the literal did.

**Verify**:
```bash
grep -rn "0068c0\|00457f" src/
```
→ **zero** matches.

### Step 4: Fix the drifted button in `MyBcaSection.tsx:42`

This is the desktop twin of the mobile CTA at line 118 and is missing both
interaction states plus the transition. Bring it in line:

```tsx
// before
<button className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 text-white">
// after
<button className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 text-on-primary transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active">
```

**This is a deliberate visual change**: a button that had no hover feedback now
has it, matching its mobile counterpart and the other four CTAs. The operator
has approved visual adjustment in service of consistency for this batch. Note
it in your report.

Also note the child `<span>` on line 44 uses `text-base font-semibold` with no
color, inheriting `text-white` from the parent — inheritance still works with
`text-on-primary`, so leave the span alone.

**Verify**:
```bash
grep -n "text-white" src/components/home/MyBcaSection.tsx
```
→ no match on line 42. (Other `text-white` uses elsewhere in the file are out
of scope; only line 42's button changes.)

### Step 5: Verify the gates and the rendered result

```bash
npm run typecheck && npm run lint && npm run build
```
→ typecheck exit 0; lint exit 0 with 87 warnings / 0 errors; build exit 0.

Then start the dev server and check the buttons actually respond:

```bash
npm run dev
```

With the browser open at `http://localhost:3000`, confirm by inspecting
computed styles (not by eye — these blues differ by a few percent):

1. The MyBCA section's download button — hover it, read the computed
   `background-color`. Expected `rgb(0, 104, 192)` (= `#0068c0`).
2. Hold the mouse down on it — expected `rgb(0, 69, 127)` (= `#00457f`).
3. The HaloBCA floating button (bottom-right) — its beam should still glow
   the same blue. Read `getComputedStyle(el).getPropertyValue('--beam')` on
   the element carrying `.halobca-fab`; expected a non-empty value resolving
   to `#0068c0`.

If `PREVIEW_PASSWORD` is set in `.env.local` the site is behind a login gate.
Use the second launch configuration, which disables it:
`.claude/launch.json` → `nextjs-dev-nogate` (port 3100).

## Test plan

There is **no test framework in this repository** — do not add one as part of
this plan. Verification is:

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0, warning count unchanged at 87.
3. `npm run build` → exit 0 (this is the gate that catches a malformed
   `@theme` entry).
4. `grep -rn "0068c0\|00457f" src/` → zero matches.
5. The three live computed-style checks in Step 5.
6. Visual spot check of all six touched call sites: the MyBCA buttons (desktop
   and mobile), both ProductSection CTAs, the PromoSection "view more" link,
   the HaloBCA submit button, and the Navbar's active pill on hover. Only
   `MyBcaSection.tsx:42` should look different from before (it gains a hover
   state); everything else must be identical.

## Done criteria

ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with exactly 87 warnings and 0 errors
- [ ] `npm run build` exits 0
- [ ] `grep -rn "0068c0\|00457f" src/` returns no matches
- [ ] `grep -c "color-primary" src/app/globals.css` → at least 4
- [ ] `git diff --name-only` lists only the six files in the In-scope list
- [ ] The computed-style checks in Step 5 all pass
- [ ] `plans/README.md` status row for 016 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `globals.css`'s `@theme` block differs from the
  excerpt above — particularly if `--color-primary*` keys already exist, which
  would mean this plan (or something like it) has already partly landed.
- The lint warning count changes from 87 in either direction.
- `npm run build` fails after the `@theme` edit. A CSS build failure here means
  the token syntax is wrong; report the exact error rather than guessing at
  alternative syntax.
- You find `#0068c0` or `#00457f` somewhere outside the eight locations listed
  in "Current state" — the plan's inventory is then incomplete and the extra
  site may not be a button at all.
- You are tempted to convert other hex literals. **Don't.** Most are artwork.
  Record what you noticed in your report instead.
- A hover state you expected to change does not, and the reason appears to be
  CSS cascade or specificity rather than a typo. `globals.css` contains
  unlayered rules that deliberately outrank Tailwind utilities (see the
  comments at lines 493-495 and 529-544); report rather than adding
  `!important`.

## Maintenance notes

- **The semantic tier is the extension point.** Future state colors — a danger
  button, a success toast, a disabled fill — belong next to `--color-primary`,
  not as new rungs on the blue ramp. The ramp mirrors Figma's Foundation page
  and should only change when Figma does.
- `--color-primary` is currently an alias of `blue-500`. If BCA's primary blue
  ever changes, the correct edit is to repoint that alias, not to re-value
  `--color-blue-500` (which is a Figma-synced primitive).
- A reviewer should scrutinise: that no core ramp value changed, that
  `MyBcaSection.tsx:42` is the only intentional visual difference, and that the
  `--beam` change in `HaloBcaChat.tsx:495` still renders the beam (a typo there
  fails silently — the gradient just draws transparent).
- Deferred out of this plan: the ~101 other hex literals in `src/`, and the
  duplicated button markup (**plan 020**). Both are known and deliberate.
- Plans 017, 018 and 019 also edit the `@theme` block in `globals.css`. They
  must run sequentially with this one, or their diffs conflict.
