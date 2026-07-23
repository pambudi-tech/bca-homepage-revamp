# Plan 003: Stop the page doing animation work nobody is looking at

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat cf1b0f5..HEAD -- src/components/home/HeroWidget.tsx src/components/home/MobileHeroWidget.tsx src/components/home/EventSlider.tsx src/components/home/MobileMenu.tsx src/components/Preloader.tsx src/components/SmoothScroll.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-green-the-lint-gate.md`
- **Category**: perf
- **Planned at**: commit `cf1b0f5`, 2026-07-22

## Why this matters

The repository owner's stated priority is: **the site must feel fast and never
lag, with the visuals completely unchanged.** This plan is the purest expression
of that — every change here deletes work the browser is doing for content nobody
can see. None of it alters a single pixel of what renders.

This codebase already takes that seriously. `src/lib/useIsLive.ts` exists
specifically to park animation loops when an element is off-screen or in a
background tab, and `useAutoplayProgress` documents `live` as the mechanism for
it. Three places slipped through that discipline:

1. **Both hero widgets leak a timer chain.** The placeholder rotator's inner
   `setTimeout` and its two nested `requestAnimationFrame` callbacks are never
   cancelled — only the outer `setInterval` is. The effect re-runs every time
   `live` flips (i.e. on every scroll past the hero), so orphaned callbacks from
   previous generations keep firing `setSlots` forever. This actively defeats
   the `live` optimisation the surrounding code was written to provide.
2. **`EventSlider` never parks.** It is the only autoplaying carousel on the
   page that does not wire up `useIsLive`, so it runs a `requestAnimationFrame`
   loop and advances slides for the entire session — including while it sits far
   below the fold.
3. **The Lenis scroll lock has no owner.** `MobileMenu` calls `lenis.start()`
   whenever it is closed, including on first mount, which cancels the
   `lenis.stop()` the preloader just issued. Right now only a CSS
   `overflow: hidden` still holds the page during the intro.

## Current state

### 1. The leaking timer chain — `src/components/home/HeroWidget.tsx:59-93`

```tsx
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const activeIdx = activeSlotRef.current;
      const waitingIdx = activeIdx === 0 ? 1 : 0;

      setSlots((prev) => { /* ...mark exiting/active... */ });
      activeSlotRef.current = waitingIdx;

      setTimeout(() => {                                   // <-- never cancelled
        const text = placeholders[nextIndexRef.current % placeholders.length];
        nextIndexRef.current += 1;
        setSlots((prev) => { /* ...swap text, instant: true... */ });
        requestAnimationFrame(() => {                      // <-- never cancelled
          requestAnimationFrame(() => {                    // <-- never cancelled
            setSlots((prev) => { /* ...instant: false... */ });
          });
        });
      }, 700);
    }, 2500);
    return () => clearInterval(id);                        // <-- only the interval
  }, [live, placeholders]);
```

`src/components/home/MobileHeroWidget.tsx:60-92` is a near-verbatim duplicate
with the same omission (its inner `setTimeout` is at lines 72-89).

Both widgets are mounted simultaneously on every page load — the homepage
renders the mobile and desktop forms together and hides the unused one with
CSS, which is exactly why `useIsLive` exists (see `useIsLive.ts:8-14`).

### 2. `EventSlider` never parks — `src/components/home/EventSlider.tsx:101-109`

```tsx
  useAutoplayProgress({
    activeIndex,
    count,
    durationMs: SLIDE_DURATION_MS,
    circumference: DOT_CIRCUMFERENCE,
    progressRef: progressCircleRef,
    pausedRef,
    onAdvance: () => setStep((s) => s + 1),
  });
```

There is no `live` key. `useAutoplayProgress` defaults it to `true`
(`src/lib/useAutoplayProgress.ts:50`) and `if (!live) return` on line 70 is the
only thing that stops its rAF loop.

`grep -c "useIsLive" src/components/home/EventSlider.tsx` currently returns `0`.

**The convention it should follow** — `src/components/home/HeroSection.tsx:46,61`:

```tsx
  const live = useIsLive(rootRef);
  // ...
  useAutoplayProgress({
    activeIndex: activeSlide,
    count: count,
    durationMs: SLIDE_DURATION_MS,
    circumference: DOT_CIRCUMFERENCE,
    progressRef: progressCircleRef,
    pausedRef,
    live,
    onAdvance: () => setActiveSlide((s) => (s + 1) % count),
  });
```

`src/components/home/ProductSection.tsx:1028,1121` does the same. `EventSlider`
is the odd one out.

`EventSlider`'s outermost rendered element is at line 154:

```tsx
  return (
    <div className="relative">
```

That is where the ref goes.

### 3. The unowned scroll lock

`src/components/Preloader.tsx:149-159` stops Lenis while `phase === "loading"`
and restarts it on cleanup.

`src/components/home/MobileMenu.tsx:88-102`:

```tsx
  useEffect(() => {
    if (open) {
      setView({ type: "main" });
      setEnterDir(null);
      setExiting(null);
      lenis?.stop();
    } else {
      lenis?.start();          // <-- runs on first mount, when open === false
    }
    // Belt and braces: if this ever unmounts while open, scroll must not stay
    // locked for the rest of the session.
    return () => {
      lenis?.start();          // <-- unconditional
    };
  }, [open, lenis]);
```

The Lenis instance arrives via `setState` in an effect
(`src/components/SmoothScroll.tsx:28`), so both consumers' effects re-run
together the moment it becomes non-null. React flushes sibling effects in order,
and `Preloader` is rendered before `{children}` in
`src/app/[locale]/layout.tsx:79-80` — so `Preloader`'s `stop()` runs first and
`MobileMenu`'s `start()` immediately undoes it.

### `useIsLive` signature — `src/lib/useIsLive.ts:20`

```ts
export function useIsLive(ref: RefObject<HTMLElement | null>): boolean
```

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |

There is **no test suite** in this repository. Do not try to run one.

## Scope

**In scope** (the only files you should modify):
- `src/components/home/HeroWidget.tsx`
- `src/components/home/MobileHeroWidget.tsx`
- `src/components/home/EventSlider.tsx`
- `src/components/home/MobileMenu.tsx`
- `src/components/SmoothScroll.tsx` (Step 4 only — adding the lock helper)
- `src/components/Preloader.tsx` (Step 4 only — using it)

**Out of scope** (do NOT touch, even though they look related):
- **Any animation timing, easing, duration or offset constant.** `2500`, `700`,
  `SLIDE_DURATION_MS`, `EXIT_MS`, the `calc()` offset formulas in
  `EventSlider` — all must stay exactly as they are. The requirement is that the
  site looks *identical*; changing timings breaks that.
- **De-duplicating `HeroWidget` and `MobileHeroWidget`.** They share ~35 lines of
  near-identical carousel logic and it is tempting. Do not. That is a real
  refactor with real visual risk and belongs in its own plan.
- `useAutoplayProgress.ts` itself — it already supports everything needed.
- The `EventSlider` cursor-follow rAF loop at lines 83-99. It is already gated on
  `hoveringActive`, which is correct.
- Any `<img>` tag anywhere.

## Git workflow

- Branch: `advisor/003-stop-wasted-background-work`
- Commit style: short imperative subject, matching `git log`.
- Commit each step separately so a regression can be bisected to one change.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Cancel the inner timer chain in `HeroWidget`

In `src/components/home/HeroWidget.tsx`, track the inner `setTimeout` and both
`requestAnimationFrame` handles in the effect scope and clear them in the
existing cleanup. Target shape:

```tsx
  useEffect(() => {
    if (!live) return;
    let swapTimer: ReturnType<typeof setTimeout> | undefined;
    let rafOuter = 0;
    let rafInner = 0;

    const id = setInterval(() => {
      // ...unchanged...
      swapTimer = setTimeout(() => {
        // ...unchanged...
        rafOuter = requestAnimationFrame(() => {
          rafInner = requestAnimationFrame(() => {
            // ...unchanged...
          });
        });
      }, 700);
    }, 2500);

    return () => {
      clearInterval(id);
      clearTimeout(swapTimer);
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
    };
  }, [live, placeholders]);
```

Do not change the `2500` or `700` values, the slot-swapping logic, or the effect
dependencies.

**Verify**:
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0
- Manual: the desktop hero search field's rotating placeholder text still cycles
  at the same rhythm.

### Step 2: Apply the identical fix to `MobileHeroWidget`

Same change in `src/components/home/MobileHeroWidget.tsx` (effect at lines
60-92, inner `setTimeout` at 72-89). Keep the two implementations textually
parallel so the duplication stays obvious to whoever eventually merges them.

**Verify**: same as Step 1, checked at a narrow viewport (< 1280px) where the
mobile widget is the visible one.

### Step 3: Park `EventSlider` when it is off-screen

In `src/components/home/EventSlider.tsx`:

1. Import `useIsLive`:
   ```ts
   import { useIsLive } from "@/lib/useIsLive";
   ```
2. Add a root ref alongside the existing refs (near line 64):
   ```ts
   const rootRef = useRef<HTMLDivElement>(null);
   const live = useIsLive(rootRef);
   ```
3. Attach it to the outermost element at line 154:
   ```tsx
   return (
     <div className="relative" ref={rootRef}>
   ```
   **Do not change the `className`.** Adding a ref is invisible to layout.
4. Pass `live` into the hook call at lines 101-109, matching `HeroSection.tsx:61`:
   ```tsx
     pausedRef,
     live,
     onAdvance: () => setStep((s) => s + 1),
   ```

**Verify**:
- `npm run typecheck` → exit 0
- `grep -c "useIsLive" src/components/home/EventSlider.tsx` → `2` (import + call)
- Manual: scroll to the promo event slider. It must still auto-advance every 6 s
  with its progress ring filling, exactly as before. Scroll far away, wait
  ~15 s, scroll back — it should resume cleanly, not jump several slides at once.

### Step 4: Give the scroll lock a single owner

Add a small reference-counted lock to `src/components/SmoothScroll.tsx`, exported
alongside `useLenis`:

```tsx
/**
 * Ref-counted page-scroll lock. Lenis has no notion of nested locks, so a bare
 * `lenis.start()` from one component silently cancels another component's
 * `stop()` — the preloader's lock used to be undone by the mobile menu's
 * effect on first mount. Acquire while you need scrolling frozen; the last
 * release is the only one that restarts Lenis.
 */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis || !locked) return;
    lockCount += 1;
    lenis.stop();
    return () => {
      lockCount -= 1;
      if (lockCount === 0) lenis.start();
    };
  }, [lenis, locked]);
}
```

with a module-level `let lockCount = 0;` beside it.

Then:
- In `src/components/home/MobileMenu.tsx`, delete the `lenis?.stop()` /
  `lenis?.start()` calls and the unconditional `start()` in the cleanup from the
  effect at lines 88-102, and call `useScrollLock(open)` at the top level of the
  component instead. **Keep** the `setView` / `setEnterDir` / `setExiting` resets
  in that effect — they are unrelated to the lock.
- In `src/components/Preloader.tsx`, replace the manual `stop()`/`start()` pair
  at lines 149-159 with `useScrollLock(phase === "loading")`.

**Verify**:
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0
- `grep -rn "lenis?.start()\|lenis.start()" src/` → matches only inside
  `SmoothScroll.tsx`
- Manual, all three must hold:
  1. During the intro preloader, the page cannot be scrolled.
  2. Opening the mobile menu freezes page scroll; the menu's own inner content
     still scrolls (it uses `data-lenis-prevent`); closing it restores page
     scroll.
  3. Opening and closing the mobile menu **during** the preloader intro does not
     leave the page permanently unscrollable.

### Step 5: Confirm the lag win is real

With `npm run dev` running, open Chrome DevTools → Performance, record ~10 s
while parked at the top of the page (the event slider off-screen), and stop.

Compare against a recording taken from `main` before your changes:
- Idle frame activity should be lower — the `EventSlider` rAF loop should be
  absent from the flame chart while it is off-screen.
- No `setSlots` calls should appear from hero widgets whose section is scrolled
  away.

Record both numbers in your report. If you cannot run DevTools in your
environment, say so explicitly rather than claiming a measurement you did not
take.

## Test plan

No test framework exists in this repository and this plan does not add one.
Verification is the per-step manual checks above, plus:

- `npm run lint` → exit 0
- `npm run typecheck` → exit 0
- `grep -c "useIsLive" src/components/home/EventSlider.tsx` → `2`
- `grep -rn "lenis.start()" src/` → confined to `SmoothScroll.tsx`

The single most important check is **visual equivalence**: every carousel must
advance at the same rhythm, the placeholder rotator must cycle identically, and
no transition may look different. If anything moves differently, revert.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] Both hero widgets clear their inner `setTimeout` and both `rAF` handles on
      cleanup
- [ ] `EventSlider` passes `live` to `useAutoplayProgress` and stops its loop
      off-screen
- [ ] `grep -rn "lenis.start()\|lenis?.start()" src/` → only `SmoothScroll.tsx`
- [ ] Scroll is locked during the preloader and while the mobile menu is open,
      and is restored afterwards in every ordering
- [ ] `git diff` contains **zero** changes to timing constants, `className`
      strings, CSS, or markup structure
- [ ] `git diff --name-only` lists only the six in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed since `cf1b0f5` and no longer
  matches the excerpts above.
- Adding `live` to `EventSlider` makes it visibly skip slides or restart its
  progress ring when scrolled back into view. (`useAutoplayProgress` resets
  `elapsedRef` on re-entry by design — if that reads as a glitch, report it
  rather than working around it.)
- The ref-counted lock leaves the page unscrollable in any ordering you can
  reach by hand. Report the exact sequence.
- You find yourself wanting to merge `HeroWidget` and `MobileHeroWidget`, or to
  adjust any timing constant to "make it smoother". Both are out of scope.

## Maintenance notes

- **Every new autoplaying or rAF-driven component on this page must wire up
  `useIsLive`.** `EventSlider` is proof that the convention is easy to forget;
  it is worth checking for in review.
- `useScrollLock`'s counter is module-level state. It is correct only if every
  consumer goes through the hook — a stray `lenis.stop()` elsewhere will
  desynchronise it. The `grep` in "Done criteria" is the guard; keep running it.
- The duplicated placeholder-rotator logic across `HeroWidget` and
  `MobileHeroWidget` is now duplicated *including its cleanup*. That is a
  deliberate trade for this plan's low risk. If a third copy ever appears,
  extract the hook.
- A reviewer should scrutinise: that no timing constant moved, that the
  `EventSlider` root `className` is untouched, and that the lock's release path
  cannot be skipped.
