# Plan 020: Make the CTA button one component instead of eight copies

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> ```bash
> git diff --stat 28729d0..HEAD -- src/app/globals.css src/components/home/MyBcaSection.tsx src/components/home/ProductSection.tsx src/components/home/PromoSection.tsx src/components/home/HaloBcaChat.tsx src/components/home/NewsSection.tsx src/components/home/FaqSection.tsx
> ```
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/016-semantic-color-state-tokens.md`,
  `plans/017-typography-tokens.md`, `plans/019-motion-tokens.md` — this plan
  composes tokens all three of them define. **Do not start until 016–019 have
  landed.**
- **Category**: tech-debt (design system)
- **Planned at**: commit `28729d0`, 2026-08-03

## Why this matters

There are 67 `<button>` elements in this codebase and not one shared button.
The main CTA's class string — twelve utilities long — is copy-pasted across
five files, and the codebase already knows it. `HaloBcaChat.tsx:473-474` carries
this comment above its copy:

```tsx
                // Matches the product section's CTA button (ProductSection.tsx)
                // — same height, radius, and hover/active blue steps.
```

That comment is a maintenance instruction that no tool can enforce, and it has
already failed: `MyBcaSection.tsx:42` renders the same button with no hover
state, no active state and no transition, because someone copied an earlier
version of the string. It also says `text-white` where its own twin two
lines away says `text-neutral-100`.

This is the last plan in the token series and the one that makes the rest pay
off. Tokens name values; this names the *thing built from them*. After it lands,
"the primary CTA" is one definition in one file, and a new button is
`btn-primary` rather than an archaeology exercise in which neighbour to copy.

## Current state

### The mechanism — verified, not assumed

Tailwind **4.3.2**'s `@utility` directive registers a custom class that
participates in the utility layer. Compiled against the installed Tailwind, a
custom utility plus two built-ins produces:

```css
@layer utilities {
  .btn-primary { /* … custom utility, emitted FIRST … */ }
  .w-full { width: 100%; }
  .hover\:bg-neutral-100 { &:hover { @media (hover: hover) { … } } }
}
```

Two facts follow, and the plan depends on both:

1. **Custom utilities are emitted before built-in ones.** So
   `className="btn-primary w-full xl:hidden"` works — the built-ins override.
2. **Built-in `hover:` variants are emitted after the custom utility's own
   `&:hover` block, at equal specificity (0,2,0).** So a per-site
   `hover:bg-blue-100` still wins over `btn-secondary`'s built-in hover.

Both were confirmed by compiling against `node_modules/tailwindcss`, not
assumed from documentation.

### The eight sites that share one skeleton

Every one of these is `flex h-12 items-center justify-center gap-1 rounded-full px-6 transition-colors duration-200` plus a fill treatment.

**Primary (solid blue) — 6 sites:**

| File | Line | Element |
|---|---|---|
| `src/components/home/MyBcaSection.tsx` | 42 | `<button>` — **the drifted one** |
| `src/components/home/MyBcaSection.tsx` | 118 | `<button>` |
| `src/components/home/ProductSection.tsx` | 1602 | `<a>` |
| `src/components/home/ProductSection.tsx` | 1636 | `<button>` |
| `src/components/home/PromoSection.tsx` | 384 | `<a>` |
| `src/components/home/HaloBcaChat.tsx` | 476 | `<button type="submit">` |

`ProductSection.tsx:1602`, as it exists today (before plans 016–019):

```tsx
            className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]"
```

**After plan 016 lands** the same line reads:

```tsx
            className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
```

That second form is what you will actually find. If you find the first, plan
016 has not landed — STOP.

**Secondary (outline blue) — 2 sites:**

`src/components/home/NewsSection.tsx:335`:

```tsx
            className="mx-auto mt-9 flex h-12 w-fit items-center justify-center gap-1 rounded-full border border-blue-500 bg-neutral-100 px-6 transition-colors duration-200 xl:hidden"
```

`src/components/home/FaqSection.tsx:251-256` — a conditional, and only its
non-glass branch matches:

```tsx
          className={`flex h-12 shrink-0 items-center justify-center gap-1 rounded-full border px-6 transition-colors duration-200 ${
            glass
              ? "border-white text-white hover:bg-white/10"
              : "border-blue-500 hover:bg-blue-100"
          }`}
```

Note this one has **no** `bg-neutral-100` and **does** have `hover:bg-blue-100`,
where NewsSection has the reverse. They are the same button drifted apart.

### The three sites that only LOOK like the others — do not convert

Read this section carefully; over-converting is the main way this plan goes
wrong.

1. **`src/components/home/CookieBanner.tsx:181`** — solid blue pill, but its
   interaction model is different: `transition-[background-color,transform]`
   with `active:scale-95`, a `sm:` breakpoint that changes padding and text
   size, and — importantly — `sm:hover:bg-blue-400`. That is a **third** hover
   blue, neither `primary-hover` nor the base fill. It is also `flex-1` inside
   a two-button row, not a standalone CTA.

2. **`src/components/home/CookieBanner.tsx:174`** — its outline sibling, on
   the neutral ramp (`border-neutral-400`, `text-neutral-700`) rather than
   blue, with `transition-[border-color,color,transform]`.

3. **`src/components/home/HeroSection.tsx:20`** (`HeroCta`) — starts at `h-10`
   and grows to `h-12` only at `xl:`, is white-filled with a blue *hover* fill
   (inverted from every other button), and carries a glow shadow plus a
   `group-hover/cta` icon-inversion trick. The comment above it at lines 13-15
   explains the desktop/touch split deliberately.

These three are genuinely different components that happen to share a radius.
**Leave all three exactly as they are.** Forcing them into `btn-primary` with
overrides would produce a longer class string than they have now, which is the
opposite of the point.

You **should** flag the `blue-400` hover in CookieBanner in your report as an
inconsistency for the operator to decide on. Do not change it.

### Repo conventions to match

- `globals.css` is organised as: `@import`, `:root`, `@theme`, then component
  and animation rules with long explanatory comments. `@utility` blocks are new
  to this file; put them in their own clearly-commented section (see Step 1).
- Comments explain *why*, in prose, often several lines — see `globals.css`
  lines 8-12, 82-90, 493-495 for the house voice.
- Existing components use `className` string literals or template literals with
  conditionals; there is no `clsx`/`cn` helper and this plan does not add one.
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

- `src/app/globals.css` — add the `@utility` definitions
- `src/components/home/MyBcaSection.tsx`
- `src/components/home/ProductSection.tsx`
- `src/components/home/PromoSection.tsx`
- `src/components/home/HaloBcaChat.tsx`
- `src/components/home/NewsSection.tsx`
- `src/components/home/FaqSection.tsx`

**Out of scope** (do NOT touch, even though they look related):

- **`CookieBanner.tsx:174` and `:181`, and `HeroSection.tsx:20`.** See "The
  three sites that only LOOK like the others" above. Non-negotiable.
- **A React `<Button>` component.** This plan deliberately uses a CSS utility,
  not a component. The eight call sites are a mix of `<button>` and `<a>` with
  different props, targets and `rel` attributes; a component would need
  polymorphic `as`/`asChild` plumbing, which is a much larger change for the
  same benefit. If a component is wanted later, `btn-primary` is what it would
  render anyway.
- **The other 59 `<button>` elements.** Icon buttons, carousel dots, nav pills,
  accordion triggers, close buttons — none of them share this skeleton. Do not
  invent utilities for them.
- **The `@theme` block.** Plans 016–019 own it. This plan only *consumes* the
  tokens; it must not add, remove or change one.
- **The children inside each button** — the `<span>` labels, the masked-icon
  `<span>`s, the `<img>` icons. Their classes stay exactly as they are. Only
  the button/anchor element's own `className` changes.
- `archive/` — reference snapshots, excluded from tsconfig and ESLint.

## Git workflow

- Branch: `advisor/020-button-component-utilities`
- Commit style: short imperative subject, matching `git log`.
- Commit Step 1 (definition) separately from Steps 2–3 (call sites).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Define the button utilities

In `src/app/globals.css`, **after** the closing `}` of the `@theme` block and
before the `html { … }` rule, add:

```css
/* ---------- Buttons ----------
   The pill CTA, defined once. Before this existed the same twelve-utility
   string was pasted into five files, and it had already drifted: one copy had
   lost its hover and active states entirely, and two disagreed about whether
   the label was `text-white` or `text-neutral-100`.

   These are `@utility`, not plain classes, so they participate in the utility
   layer: Tailwind emits custom utilities BEFORE built-in ones, which means a
   call site can still override anything with a normal utility
   (`btn-primary w-full`, `btn-secondary xl:hidden`). Built-in `hover:`
   variants are emitted after these blocks at equal specificity, so a per-site
   hover override wins too.

   Deliberately NOT covered here: the cookie banner's pair and the hero CTA.
   They share the radius and not much else — different transition properties,
   an `active:scale` press, a breakpoint-dependent size, and in the hero's case
   an inverted fill (white at rest, blue on hover). Folding them in would need
   more overrides than they have classes today. */

@utility btn-base {
  display: flex;
  height: calc(var(--spacing) * 12);
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 1);
  border-radius: calc(infinity * 1px);
  padding-inline: calc(var(--spacing) * 6);
  transition-property: color, background-color, border-color;
  transition-duration: 200ms;
}

@utility btn-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);

  &:hover {
    background-color: var(--color-primary-hover);
  }

  &:active {
    background-color: var(--color-primary-active);
  }
}

@utility btn-secondary {
  border: 1px solid var(--color-blue-500);
  background-color: var(--color-neutral-100);
  color: var(--color-blue-500);

  &:hover {
    background-color: var(--color-blue-100);
  }
}
```

Two notes on this shape:

- `btn-primary` and `btn-secondary` carry **only** the fill treatment;
  `btn-base` carries the geometry. Call sites use both:
  `className="btn-base btn-primary"`. Keeping them separate is what lets a
  future variant reuse the geometry without inheriting a fill.
- `calc(infinity * 1px)` is what Tailwind's own `rounded-full` compiles to; use
  it rather than `9999px` so the two stay identical.

**Verify**:
```bash
npm run build
```
→ exit 0. A malformed `@utility` block fails the CSS build.

### Step 2: Convert the six primary sites

At each of the six sites, replace the shared skeleton **and** the fill classes
with `btn-base btn-primary`, keeping every site-specific class.

`ProductSection.tsx:1602`:

```tsx
// before (post-016)
className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
// after
className="btn-base btn-primary"
```

`PromoSection.tsx:384` — keeps its layout and breakpoint classes:

```tsx
// before (post-016)
className="mx-auto mt-9 flex h-12 w-fit items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active xl:hidden"
// after
className="btn-base btn-primary mx-auto mt-9 w-fit xl:hidden"
```

`HaloBcaChat.tsx:476` — keeps `w-full`, and its label typography moves onto the
element as it is today. **Delete the now-stale comment at lines 473-474** ("Matches
the product section's CTA button…") — it described the copy-paste this plan
removes:

```tsx
// before (post-016/017)
className="flex h-12 w-full items-center justify-center rounded-full bg-blue-500 text-base font-semibold text-neutral-100 transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
// after
className="btn-base btn-primary w-full gap-0 text-base font-semibold"
```

Note the `gap-0`: this site has no icon and never had a `gap-1`, so it must
cancel `btn-base`'s gap to stay identical. **Check each of the six for exactly
this kind of difference before converting it** — the skeleton is *almost*
uniform, not uniform.

`MyBcaSection.tsx:42` is the drifted copy. Plan 016 already gave it the missing
states; here it becomes `btn-base btn-primary` like its twin at line 118. Both
should end up with the identical class string.

**Verify**:
```bash
grep -rn "bg-primary-hover\|bg-primary-active" src/components/
```
→ zero matches (all six now go through `btn-primary`).

```bash
grep -c "btn-primary" src/components/home/*.tsx | grep -v ":0" | awk -F: '{s+=$2} END {print s}'
```
→ `6`.

### Step 3: Convert the two secondary sites

`NewsSection.tsx:335`:

```tsx
// before
className="mx-auto mt-9 flex h-12 w-fit items-center justify-center gap-1 rounded-full border border-blue-500 bg-neutral-100 px-6 transition-colors duration-200 xl:hidden"
// after
className="btn-base btn-secondary mx-auto mt-9 w-fit xl:hidden"
```

**This gains a hover state it did not have** (`btn-secondary` supplies
`hover:bg-blue-100`, which NewsSection lacked and FaqSection had). That is the
intended convergence — the operator has approved visual adjustment in service
of consistency for this batch. Screenshot before and after.

`FaqSection.tsx:251-256` — the conditional. The **glass branch must keep
behaving exactly as it does now**, so apply `btn-secondary` only to the
non-glass branch:

```tsx
// after
          className={`btn-base shrink-0 ${
            glass
              ? "rounded-full border border-white text-white transition-colors duration-200 hover:bg-white/10"
              : "btn-secondary"
          }`}
```

Read that carefully: the glass branch now carries its own `border`/`rounded-full`
because those moved out of the shared string. Verify the glass variant renders
identically — though note it is currently **unreachable**, since
`FaqSection.tsx:100`'s `setVariant` is never called (that is one of the two
known `no-unused-vars` lint warnings). Preserve it anyway; do not delete the
branch.

**Verify**:
```bash
npm run build && npm run typecheck && npm run lint
```
→ all exit 0; lint at 87 warnings, 0 errors.

### Step 4: Verify the rendered result

Start the dev server (`npm run dev`, or `.claude/launch.json`'s
`nextjs-dev-nogate` on port 3100 if `PREVIEW_PASSWORD` is set in `.env.local`).

For **each of the eight converted buttons**, check by computed style at rest,
on hover, and on press:

| State | Primary (6 sites) | Secondary (2 sites) |
|---|---|---|
| rest | `background-color: rgb(0, 92, 170)`, `color: rgb(255, 255, 255)` | `background-color: rgb(255, 255, 255)`, `border-color: rgb(0, 92, 170)` |
| hover | `rgb(0, 104, 192)` | `rgb(244, 248, 252)` |
| active | `rgb(0, 69, 127)` | (unchanged) |

Also confirm geometry is unchanged on every one: `height: 48px`,
`border-radius` ≥ 9999px, `padding-left/right: 24px`, `column-gap: 4px` (except
HaloBCA's, which must be `0px`).

Then screenshot at 375px and 1440px: the MyBCA section (both buttons), the
product section CTA, the promo section CTA, the news section "see more", the
FAQ section CTA, and the HaloBCA panel's submit button. Compare against
before-shots. **Only `NewsSection.tsx:335` should differ**, and only by gaining
a hover state.

## Test plan

There is **no test framework in this repository** — do not add one. Verification is:

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0, warning count unchanged at 87.
3. `npm run build` → exit 0.
4. The `grep` gates in Steps 2 and 3.
5. The full computed-style table in Step 4, for all eight buttons in all three
   states — this is the core check and must not be skipped or sampled.
6. Before/after screenshots of all seven surfaces listed in Step 4.
7. **Keyboard check**: tab to each converted button and confirm it still shows
   a visible focus indicator. `btn-base` sets no `outline`, so the browser
   default should be intact — but confirm, because a lost focus ring is an
   accessibility regression that no screenshot of a mouse hover will reveal.

## Done criteria

ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with exactly 87 warnings and 0 errors
- [ ] `npm run build` exits 0
- [ ] `grep -rn "bg-primary-hover\|bg-primary-active" src/components/` → zero matches
- [ ] `btn-primary` appears at exactly 6 call sites, `btn-secondary` at exactly 2
- [ ] `grep -n "Matches the product section's CTA button" src/components/home/HaloBcaChat.tsx` → no match (stale comment removed)
- [ ] `CookieBanner.tsx` and `HeroSection.tsx` appear in **no** diff
      (`git diff --name-only` must not list them)
- [ ] `git diff --name-only` lists only the six files in the In-scope list
- [ ] The Step 4 computed-style table passes for all eight buttons
- [ ] Screenshots show only `NewsSection.tsx:335` differing
- [ ] Every converted button still shows a focus ring on keyboard tab
- [ ] `plans/README.md` status row for 020 updated

## STOP conditions

Stop and report back (do not improvise) if:

- **Plans 016–019 have not all landed.** This plan's `@utility` blocks
  reference `--color-primary`, `--color-primary-hover`, `--color-primary-active`
  and `--color-on-primary`, all defined by plan 016. If those tokens are
  absent the buttons render transparent — a silent failure, not a build error.
  Check with `grep -c "color-primary" src/app/globals.css` → must be ≥ 4.
- You find the pre-016 form (`hover:bg-[#0068c0]`) at any call site — same
  cause, same response.
- A call site's skeleton differs from the eight-site inventory in a way not
  noted above (a different height, a missing `transition`, an extra
  `whitespace-nowrap`). Report the difference rather than absorbing it into
  `btn-base` — `btn-base` must stay the true common denominator.
- The computed geometry changes on any button (height, radius, padding, gap).
  That means `btn-base` is not reproducing the original skeleton exactly.
- A focus ring disappears on any converted button.
- You are tempted to convert `CookieBanner` or `HeroCta`, or to add a third
  variant to cover them. **Don't.** Report the temptation and what you would
  have needed.
- You are tempted to add `clsx`/`cn` or introduce a React `<Button>`. Out of
  scope; report instead.
- The lint warning count moves from 87 in either direction.

## Maintenance notes

- **The rule going forward**: a new pill CTA is `btn-base btn-primary` or
  `btn-base btn-secondary` plus layout classes. If neither fits, the question
  to ask is whether it is a third variant (add it next to these two) or a
  genuinely different component (leave it inline, like the hero CTA).
- **`btn-base` is the common denominator and must stay that way.** If a future
  button needs a different height, that is a new variant or an override at the
  call site — not a change to `btn-base`, which would silently move all eight.
- Three sites are deliberately left inline: `CookieBanner.tsx:174`, `:181` and
  `HeroSection.tsx:20`. The comment in `globals.css` records why. If someone
  later "finishes the job" by converting them, the cookie banner loses its
  `active:scale-95` press and the hero CTA loses its inverted fill.
- **Open question for the operator, raised by this plan, not resolved by it**:
  `CookieBanner.tsx:181` hovers to `blue-400` (`#1179d1`) where every other
  primary button hovers to `primary-hover` (`#0068c0`). One of those is wrong.
  It needs a design decision, not an executor's guess.
- A reviewer should scrutinise: that the HaloBCA button's `gap-0` really was
  needed (compare against the original), that FaqSection's glass branch is
  preserved intact, and that focus rings survived on all eight.
- This completes the token series (016–020). Plan 021 documents the result.
