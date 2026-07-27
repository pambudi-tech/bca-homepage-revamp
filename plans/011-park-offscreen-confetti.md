# Plan 011: Park the promo confetti while it is off screen

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat be4de7d..HEAD -- src/components/home/Confetti.tsx src/app/globals.css src/components/home/PromoSection.tsx`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `be4de7d`, 2026-07-27

## The rule that governs every plan in this directory

The repository owner's standing constraint, verbatim from `plans/README.md`:

> **The site must look pixel-identical after the change. No layout shifts, no
> timing changes, no restyling.** If a change cannot be made without altering
> what the user sees, it does not belong in these plans — stop and report
> instead.

This plan is compatible with that rule by construction: it only stops motion
that is **off screen**, where by definition nobody can see it. The moment the
section is anywhere near the viewport, the animation runs exactly as it does
today. Nothing about the confetti's appearance, density, colours, speed or
scatter changes.

## Why this matters

`src/components/home/PromoSection.tsx:425` renders `<Confetti />`
unconditionally. `Confetti.tsx` mounts **66 pieces**, and each piece is three
nested `<span>`s carrying one infinite CSS animation apiece — fall, sway and
spin. That is **198 elements running 198 infinite animations**, every one of
them also flagged `will-change: transform` or `will-change: transform, opacity`
(`src/app/globals.css:765-782`), which pins a compositor layer per element.

All of it starts on the very first frame and never stops, for the entire
session. The promo section sits well below the fold, so on a typical visit this
work runs continuously while the visitor is still reading the hero — and keeps
running after they have scrolled past it.

This is the last unparked continuous animation on the page. Everything
comparable is already gated:

- `EventSlider` and `HeroSection` autoplay park via `useIsLive` (added in
  plan 003)
- The Soliprio border beam parks via an `IntersectionObserver` that toggles
  `data-beam-live` (`SoliprioCard.tsx:64-75`)
- `SoliprioMobile` gates its beam on the active carousel slide
  (`SoliprioMobile.tsx:213`)

The confetti simply never got the same treatment. This plan applies the
existing pattern rather than inventing a new one.

The mechanism is already in the stylesheet, too: reduced-motion support
already parks these exact three animations with `animation-play-state: paused`
(`globals.css:821-827`). This plan reuses that property, keyed on visibility.

## Current state

### `src/components/home/Confetti.tsx` — the component

Header comment (lines 5–10), which constrains how you may change this file:

```tsx
// Pure JS + CSS confetti for the top of the Promo section (replaces the old
// static /assets/promo/confetti.png). Pieces are generated once from a seeded
// PRNG so the server and client produce identical markup — no hydration
// mismatch, and the confetti is painted on the very first frame. All motion is
// CSS: confetti-fall / confetti-sway / confetti-spin (see globals.css). Each
// piece uses a negative animation-delay so the band is already full on load.
```

The rendered root, lines 69–75:

```tsx
export default function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px] overflow-hidden">
      {PIECES.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
```

`PIECES` is a module-level constant built from a seeded PRNG
(`const rand = mulberry32(20260714);`, line 45; `Array.from({ length: 66 }, ...)`,
line 47). **Do not touch `PIECES`, the PRNG, the seed, or the piece count** —
the seeding is what guarantees identical server and client markup.

### `src/app/globals.css:764-782` — the three infinite animations

```css
.confetti-piece {
  position: absolute;
  top: 0;
  will-change: transform, opacity;
  animation: confetti-fall var(--confetti-dur) linear var(--confetti-delay) infinite;
}

.confetti-sway {
  display: block;
  will-change: transform;
  animation: confetti-sway var(--confetti-sway-dur) ease-in-out var(--confetti-delay) infinite alternate;
}

.confetti-spin {
  display: block;
  will-change: transform;
  animation: confetti-spin var(--confetti-spin-dur) linear var(--confetti-delay) infinite;
}
```

### `src/app/globals.css:819-827` — the existing pause mechanism to mirror

```css
/* Reduced motion: freeze the pieces mid-flight (their negative delay leaves a
   static, scattered spread — much like the original still artwork). */
@media (prefers-reduced-motion: reduce) {
  .confetti-piece,
  .confetti-sway,
  .confetti-spin {
    animation-play-state: paused;
  }
}
```

### `src/components/home/SoliprioCard.tsx:55-75` — the pattern to copy

This is the exemplar. Match its structure, its `rootMargin`, and its comment
style:

```tsx
  // Runs the border beam only while the card is on screen.
  //
  // The beam animates a conic gradient's angle — a *paint* property, pushed
  // through three stacked drop-shadow (blur) passes. Left alone it repaints
  // every frame for the whole life of the page, however far off-screen the
  // section is. Flipping `data-beam-live` lets CSS park it instead.
  //
  // The margin starts it slightly before the card scrolls in, so it is already
  // mid-sweep on arrival rather than visibly kicking off from a frozen angle.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => el.toggleAttribute("data-beam-live", entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);
```

### The design decision this plan makes

Park **by default** in CSS, and let the observer switch motion **on**, exactly
as `.soliprio-beam` does (it declares `animation-play-state: paused` and
`[data-beam-live] .soliprio-beam` sets it to `running`).

Defaulting to paused matters: the promo section is below the fold, so on first
paint the correct state is "not running". Defaulting to running and pausing in
an effect would let it animate for a frame or two before the observer fires.

Because each piece carries a **negative** `animation-delay`, a paused piece
still renders at a scattered mid-flight position — that is precisely the
behaviour the reduced-motion block above already relies on. So the very first
frame the visitor sees is the same full, scattered band as today.

`rootMargin: "200px"` starts the motion before the section reaches the
viewport, so it is already in flight on arrival rather than visibly starting
from a frozen frame.

## Commands you will need

| Purpose   | Command             | Expected on success                |
|-----------|---------------------|------------------------------------|
| Typecheck | `npm run typecheck` | exit 0, no errors                  |
| Lint      | `npm run lint`      | exit 0; 78 warnings, 0 errors      |
| Build     | `npm run build`     | exit 0                             |
| Dev server| `npm run dev`       | serves on http://localhost:3000    |

There is **no test suite in this repo**. Do not add a test framework.

## Scope

**In scope** (the only files you should modify):
- `src/components/home/Confetti.tsx`
- `src/app/globals.css` (the confetti block only)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):
- `PIECES`, `mulberry32`, the seed `20260714`, the piece count of 66, the
  colour list, and every per-piece random value in `Confetti.tsx`. Changing any
  of them alters the visible scatter and can break hydration.
- The `will-change` declarations. They look like an easy win — 198 compositor
  layers is real GPU memory — but removing them changes how the browser
  rasterises the pieces and can visibly alter the motion's smoothness. Parking
  the animation is the safe win; leave `will-change` alone.
- The `@keyframes confetti-fall / -sway / -spin` bodies, and the
  `prefers-reduced-motion` block at `globals.css:819-827`.
- `src/components/home/PromoSection.tsx` — no change is needed there. The
  observer lives inside `Confetti` so both call sites benefit automatically.
- `src/components/home/HeroWidget.tsx` — it also renders `<Confetti />`
  (lines 506 and 566) but already gates it on hover, so those instances only
  exist while the user is hovering a visible element. Do not modify it. Your
  change must not regress that behaviour, which Step 5 verifies.
- `src/lib/useIsLive.ts` — a valid alternative mechanism, but the
  `data-*`-attribute-plus-CSS approach is the closer match here because the
  motion is pure CSS. Do not refactor to `useIsLive`.
- `archive/**` — reference-only snapshots, excluded from `tsconfig.json` and
  ESLint. Never modify or delete anything under this directory.

## Git workflow

- Branch: `advisor/011-park-offscreen-confetti`
- Commit style follows `git log` — short imperative sentence, no prefix.
  Example from history: `Park EventSlider autoplay when off-screen via useIsLive`
- Suggested commit message: `Park the promo confetti while it is off screen`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Default the three animations to paused, and run them when live

In `src/app/globals.css`, add `animation-play-state: paused;` to each of the
three rules at lines 764–782, then add one new rule immediately after them.

The three rules become:

```css
.confetti-piece {
  position: absolute;
  top: 0;
  will-change: transform, opacity;
  animation: confetti-fall var(--confetti-dur) linear var(--confetti-delay) infinite;
  animation-play-state: paused;
}

.confetti-sway {
  display: block;
  will-change: transform;
  animation: confetti-sway var(--confetti-sway-dur) ease-in-out var(--confetti-delay) infinite alternate;
  animation-play-state: paused;
}

.confetti-spin {
  display: block;
  will-change: transform;
  animation: confetti-spin var(--confetti-spin-dur) linear var(--confetti-delay) infinite;
  animation-play-state: paused;
}
```

And add, directly after `.confetti-spin`:

```css
/* Parked until the band is actually on screen — Confetti.tsx flips
   `data-confetti-live` from an IntersectionObserver. 66 pieces x 3 nested
   animations is 198 infinite animations, each on its own compositor layer via
   `will-change`; left running they burn frames for the whole session on a
   section that sits well below the fold. The negative per-piece
   `animation-delay` means a parked piece still sits at a scattered mid-flight
   position, so the first frame on arrival looks exactly as it does today.
   Same mechanism as `.soliprio-beam` / `[data-beam-live]` above. */
[data-confetti-live] .confetti-piece,
[data-confetti-live] .confetti-sway,
[data-confetti-live] .confetti-spin {
  animation-play-state: running;
}
```

**Ordering matters**: this rule must come *before* the
`prefers-reduced-motion` block at line ~819 so that reduced-motion still wins.
Since that block is later in the file and has equal specificity on the same
property, source order decides. Verify this in Step 4.

**Verify**: `grep -n "animation-play-state" src/app/globals.css`
→ shows the three new `paused` lines, the new `running` rule, the
reduced-motion `paused` rule, and the pre-existing `.soliprio-beam` ones. The
`[data-confetti-live]` rule's line number must be **lower** than the
reduced-motion block's.

### Step 2: Add the IntersectionObserver to `Confetti.tsx`

Update the imports at the top of `src/components/home/Confetti.tsx`:

```tsx
import { useEffect, useRef, type CSSProperties } from "react";
```

Then, inside the `Confetti` component, add the ref and observer and attach the
ref to the existing root `<div>`:

```tsx
export default function Confetti() {
  const ref = useRef<HTMLDivElement>(null);

  // Runs the pieces only while the band is on screen. 66 pieces x 3 nested
  // infinite animations is 198 of them, each pinned to its own compositor
  // layer by `will-change` — left alone they run for the whole life of the
  // page even though this band sits well below the fold. Flipping
  // `data-confetti-live` lets CSS park them instead (see globals.css).
  //
  // The margin starts them slightly before the band scrolls in, so the pieces
  // are already in flight on arrival rather than visibly unfreezing.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => el.toggleAttribute("data-confetti-live", entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px] overflow-hidden">
```

Leave everything below that line — `PIECES.map(...)` and all of the nested
spans — exactly as it is.

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Confirm the static gates still pass

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0.

**Expected lint baseline**: `78 problems (0 errors, 78 warnings)` — 76 `@next/next/no-img-element` (deliberate; the owner
declined `next/image`), 1 `react-hooks/exhaustive-deps` in
`src/lib/useLayoutVariant.ts:29`, and 1 `@typescript-eslint/no-unused-vars`
for `PRODUCT_VARIANTS` at `src/components/home/ProductSection.tsx:16`.

The count **must not increase**. The new `useEffect` has an empty dependency
array and closes over nothing, so it must not add an `exhaustive-deps`
warning. If it does, you have written it differently from the exemplar — go
back to Step 2.

### Step 4: Verify parking works, and that reduced motion still wins

Start `npm run dev` and open `http://localhost:3000/id`. (If
`PREVIEW_PASSWORD` is set in `.env.local` you will be redirected to `/login` —
sign in first, or run the dev server without that variable.)

**4a — parked at the top of the page.** Without scrolling, run in the console:

```js
const band = document.querySelector('[data-confetti-live], .confetti-piece')?.closest('div');
console.log('live attr present:', !!document.querySelector('[data-confetti-live]'));
console.log('play state:', getComputedStyle(document.querySelector('.confetti-piece')).animationPlayState);
```

→ expect `live attr present: false` and `play state: paused`.

**4b — running once scrolled in.** Scroll to the promo section, then re-run
the same snippet → expect `live attr present: true` and `play state: running`.

**4c — parked again after scrolling past.** Scroll well beyond the promo
section and re-run → expect `paused` again.

**4d — reduced motion still wins.** In devtools, emulate
`prefers-reduced-motion: reduce` (Chrome: Rendering panel → "Emulate CSS media
feature prefers-reduced-motion"). Scroll to the promo section and re-run the
snippet → `play state` must be **`paused`** even though `data-confetti-live`
is present. If it reports `running`, your new rule is in the wrong place in
the file — move it above the reduced-motion block and repeat.

### Step 5: Confirm the confetti looks identical, and the hero hover still works

**5a — the promo band.** Scroll to the promo section and watch the confetti
for several seconds.

**Verify**: same density, same colours, same fall/sway/spin motion, same
scattered spread as before the change. Compare against `git stash` if you want
a direct before/after. There must be no moment where the pieces visibly
"unfreeze" or jump — that is what `rootMargin: "200px"` prevents.

**5b — the hero confetti (regression check).** Go back to the top of the page
and hover the promo quick-action tile in the hero widget, which renders its own
`<Confetti />` (`HeroWidget.tsx:506` and `:566`).

**Verify**: the burst still animates on hover. This instance mounts *while
already on screen*, so its observer should fire immediately. If it renders
frozen, the observer is not firing for already-visible elements — go to STOP
conditions.

## Test plan

No test suite exists and this plan does not add one. Verification is:

- `npm run typecheck` → exit 0
- `npm run lint` → exit 0, 78 warnings, 0 errors (no new `exhaustive-deps`)
- `npm run build` → exit 0
- Steps 4a–4d: paused at top, running when scrolled in, paused after,
  and reduced-motion still forces paused
- Step 5a: the promo confetti is visually unchanged
- Step 5b: the hero's hover confetti still animates

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "animation-play-state: paused" src/app/globals.css` → at least `5`
      (3 new confetti + 3 in the reduced-motion block counts as 1 rule with 3
      selectors, plus `.soliprio-beam`; confirm the three new ones are present)
- [ ] `grep -n "data-confetti-live" src/app/globals.css` → the rule exists, at a
      **lower** line number than the `prefers-reduced-motion` confetti block
- [ ] `grep -n "data-confetti-live" src/components/home/Confetti.tsx` → 1 match
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with 0 errors and 78 warnings
- [ ] `npm run build` exits 0
- [ ] Steps 4a–4d behave as specified
- [ ] Step 5b: hero hover confetti still animates
- [ ] `git diff` shows **no** change to `PIECES`, the PRNG seed, the piece
      count, `will-change`, or any `@keyframes` body
- [ ] `git status --porcelain` lists only `Confetti.tsx`, `globals.css` and
      `plans/README.md`
- [ ] `plans/README.md` status row for 011 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `Confetti.tsx` or the confetti CSS block does not match the excerpts in
  "Current state" (drift).
- The hero's hover confetti (Step 5b) renders frozen. That would mean the
  observer is not reporting `isIntersecting` for an element that mounts
  already visible — report it rather than adding a `setTimeout` or an initial
  `true` default.
- Reduced motion no longer forces `paused` after Step 4d's fix attempt.
- The confetti's appearance changes in any way: density, colour, speed,
  scatter, or a visible unfreeze on scroll-in.
- Lint gains a new warning, particularly `exhaustive-deps` on the new effect.
- You conclude you need to change `PIECES`, the seed, or `will-change`.

## Maintenance notes

- **The pattern**: this repo now has three variants of "park work that is off
  screen" — `useIsLive` (JS timers: `EventSlider`, `HeroSection`,
  `ProductSection`), `data-beam-live` (CSS paint animation: `SoliprioCard`),
  and now `data-confetti-live`. When adding any new continuous animation, pick
  the matching one rather than adding a fourth.
- **Why not remove `will-change`**: 198 compositor layers is the other half of
  this cost and is tempting to cut. It was deliberately left alone because
  dropping `will-change` changes rasterisation and can visibly alter motion
  smoothness, which the owner's constraint forbids. If it is ever revisited, it
  needs side-by-side visual verification on a mid-range Android, not a
  code-only review.
- **What a reviewer should scrutinise**: the source-order dependency between
  the new `[data-confetti-live]` rule and the `prefers-reduced-motion` block.
  It is the one part of this change that a later refactor (e.g. sorting or
  reorganising the stylesheet) could silently break. If the two ever need to be
  order-independent, add `!important` to the reduced-motion rule instead of
  relying on position.
- **Related known follow-up**, not addressed here: `useAutoplayProgress` does
  not check `prefers-reduced-motion`, so carousels still auto-advance for
  reduced-motion users. There are visible pause controls, so this meets
  WCAG 2.2.2; changing it would alter behaviour the owner tuned and needs
  their sign-off.
