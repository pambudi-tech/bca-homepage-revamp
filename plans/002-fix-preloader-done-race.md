# Plan 002: Fix the preloader done-event race that can leave the page invisible

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat cf1b0f5..HEAD -- src/components/Preloader.tsx src/components/ScrollReveal.tsx src/components/home/Navbar.tsx src/components/home/CookieBanner.tsx src/components/home/HaloBcaChat.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-green-the-lint-gate.md` (so `npm run lint` can
  actually verify this change)
- **Category**: bug
- **Planned at**: commit `cf1b0f5`, 2026-07-22

## Why this matters

The intro preloader announces that it has finished by dispatching a **one-shot**
`window` event, `bca:preloader-done`. Four components listen for it to decide
when to start doing their thing.

The trap: the event fires at the *start* of the preloader's exit animation, but
the preloader's DOM node (`.pre-root`) stays mounted for roughly **1.35 seconds
after that**. All four listeners gate on "is `.pre-root` in the DOM?" as their
proxy for "has the preloader finished yet?" — and during that 1.35 s window the
answer is misleading: `.pre-root` is present, but the event has already fired
and will never fire again. A component that mounts inside that window
subscribes to an event that is already in the past and waits forever.

For `ScrollReveal` this is severe. It is the single controller that stamps
`data-inview` onto every `[data-reveal]` element on the page, and
`src/app/globals.css:364` sets `[data-reveal] { opacity: 0 }` as the default.
If `ScrollReveal` never arms, **all 49 `data-reveal` elements on the homepage —
promo cards, news articles, section headings, the footer — stay permanently
invisible.** The page renders as a blank blue expanse below the hero.

This is not hypothetical. The codebase already contains the fix, the reason it
exists, and evidence it was hit in production-like use: `hasPreloaderFinished()`
was added specifically for this race, and the comment at
`src/components/home/HaloBcaChat.tsx:249-253` records that without it "the button
was stuck permanently invisible/unclickable whenever that timing lined up."
That fix was applied to **one of the four** call sites. This plan applies it to
the other three and removes the footgun so a fifth listener cannot get it wrong.

## Current state

### The event and its escape hatch — `src/components/Preloader.tsx:30-38`

```ts
export const PRELOADER_DONE_EVENT = "bca:preloader-done";

// The event above fires exactly once and is gone — a listener attached after
// that (e.g. a client component that mounts during the ~1.35s exit window,
// while `.pre-root` is still in the DOM) would wait for an event that already
// happened and never comes again. This flag lets latecomers check "did it
// already fire?" instead of only being able to subscribe to "will it fire?".
let preloaderHasFinished = false;
export const hasPreloaderFinished = () => preloaderHasFinished;
```

The flag is set alongside each dispatch, at `Preloader.tsx:170` and
`Preloader.tsx:260`.

### The one call site that gets it right — `src/components/home/HaloBcaChat.tsx:249-258`

```tsx
    // `hasPreloaderFinished()` covers the race where the done event already
    // fired (and won't fire again) before this component mounted — e.g.
    // mounting during the ~1.35s exit transition, while `.pre-root` is still
    // in the DOM. Without this check the button was stuck permanently
    // invisible/unclickable whenever that timing lined up.
    if (document.querySelector(".pre-root") && !hasPreloaderFinished()) {
      window.addEventListener(PRELOADER_DONE_EVENT, reveal, { once: true });
      return () => {
        window.removeEventListener(PRELOADER_DONE_EVENT, reveal);
        clearTimeout(id);
```

### The three that get it wrong

`src/components/ScrollReveal.tsx:135-143` — **the severe one**:

```tsx
    // Reduced motion already returned above, so a mounted .pre-root here means
    // the loading page really is running and will fire the done event.
    if (document.querySelector(".pre-root")) {
      window.addEventListener(PRELOADER_DONE_EVENT, arm, { once: true });
      return () => {
        window.removeEventListener(PRELOADER_DONE_EVENT, arm);
        teardown?.();
      };
    }
    arm();
    return () => teardown?.();
```

Note that the comment states the exact assumption that is false: a mounted
`.pre-root` does **not** mean the event is still coming.

`src/components/home/Navbar.tsx:245-256`:

```tsx
    // Preloader hasn't fired its done event yet if `.pre-root` is still
    // mounted — wait for that so this never competes with the critical-path
    // load. Otherwise (reduced motion, or mounted after the fact) just warm
    // immediately.
    if (document.querySelector(".pre-root")) {
      window.addEventListener(PRELOADER_DONE_EVENT, warm, { once: true });
      return () => {
        window.removeEventListener(PRELOADER_DONE_EVENT, warm);
        cancelWarm();
      };
    }
    warm();
    return cancelWarm;
```

`src/components/home/CookieBanner.tsx:53-66`:

```tsx
    const reveal = () => setTimeout(() => setShown(true), 400);
    let id: ReturnType<typeof setTimeout>;
    if (document.querySelector(".pre-root")) {
      const onDone = () => {
        id = reveal();
      };
      window.addEventListener(PRELOADER_DONE_EVENT, onDone, { once: true });
      return () => {
        window.removeEventListener(PRELOADER_DONE_EVENT, onDone);
        clearTimeout(id);
      };
    }
    id = reveal();
    return () => clearTimeout(id);
```

### Why the window gets hit in practice

`Preloader` is rendered in `src/app/[locale]/layout.tsx:79`, while `ScrollReveal`
and `CookieBanner` are rendered in `src/app/[locale]/page.tsx:69,73`. A locale
switch (`Navbar.tsx` calls `router.replace`) re-renders the page subtree while
the layout — and therefore the `Preloader` module state — persists. Any remount
of the page subtree inside the 1.35 s exit window reproduces this.

### Repo conventions to match

- Comments explain *why*, in full sentences. See `Preloader.tsx:32-36` and
  `useIsLive.ts:3-18` for the house style. Match it.
- Exported helpers in `Preloader.tsx` are plain named exports with a leading
  doc comment.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |

There is **no test suite** in this repository. Do not try to run one.

## Scope

**In scope** (the only files you should modify):
- `src/components/Preloader.tsx` — add one exported helper
- `src/components/ScrollReveal.tsx` — use it
- `src/components/home/Navbar.tsx` — use it
- `src/components/home/CookieBanner.tsx` — use it
- `src/components/home/HaloBcaChat.tsx` — use it (replacing its hand-rolled
  version of the same logic)

**Out of scope** (do NOT touch, even though they look related):
- The preloader's own animation, timings, phases or the `EXIT_MS` /
  `REVEALING_MS` / `MIN_VISIBLE_MS` constants. The bug is in the *listeners*,
  not the preloader. Changing its timing would change what the user sees, which
  is explicitly forbidden.
- `src/app/globals.css` — the `[data-reveal]` rules are correct.
- The `IntersectionObserver` logic inside `ScrollReveal.setup()`.
- Any `<img>` tag anywhere.

## Git workflow

- Branch: `advisor/002-fix-preloader-done-race`
- Commit style: short imperative subject, matching `git log` (e.g.
  `Fix HaloBCA chat close/captcha handling, preloader race on late mounts`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a single correct subscription helper to `Preloader.tsx`

The root cause is that every consumer hand-rolls the same three-part dance
(check the DOM, check the flag, subscribe, unsubscribe) and one of them got it
wrong. Replace it with one helper that cannot be got wrong.

Add to `src/components/Preloader.tsx`, immediately after the
`hasPreloaderFinished` export on line 38:

```ts
/**
 * Runs `callback` once the intro preloader has finished — immediately if it
 * already has. Returns an unsubscribe function suitable for returning straight
 * from a `useEffect`.
 *
 * Prefer this over subscribing to PRELOADER_DONE_EVENT by hand. The event is
 * one-shot and fires at the *start* of the exit animation, while `.pre-root`
 * stays mounted for another ~1.35s, so "is .pre-root in the DOM?" is not a
 * usable test for "will the event still fire?" — a component mounting inside
 * that window would wait forever.
 */
export function onPreloaderDone(callback: () => void): () => void {
  if (!document.querySelector(".pre-root") || preloaderHasFinished) {
    callback();
    return () => {};
  }
  window.addEventListener(PRELOADER_DONE_EVENT, callback, { once: true });
  return () => window.removeEventListener(PRELOADER_DONE_EVENT, callback);
}
```

Note the ordering: it calls back **synchronously** when the preloader is absent
or already done, which preserves the existing `arm()` / `warm()` / `reveal()`
immediate-path behaviour exactly.

**Verify**: `npm run typecheck` → exit 0

### Step 2: Fix `ScrollReveal` — the severe case

In `src/components/ScrollReveal.tsx`, replace the block at lines 135-143 (shown
in "Current state") with:

```tsx
    const stop = onPreloaderDone(arm);
    return () => {
      stop();
      teardown?.();
    };
```

Update the import on the file's existing `PRELOADER_DONE_EVENT` import line to
bring in `onPreloaderDone` instead (drop `PRELOADER_DONE_EVENT` if it becomes
unused — `npm run lint` will tell you).

Delete the now-false comment on lines 135-136 ("a mounted .pre-root here means
the loading page really is running and will fire the done event"). Replace it
with a short accurate one, e.g.:

```tsx
    // Armed once the preloader is out of the way — or immediately if it already
    // finished or never ran (reduced motion).
```

**Verify**:
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0
- Manual (this is the important one): see Step 5.

### Step 3: Fix `Navbar` and `CookieBanner`

`src/components/home/Navbar.tsx`, replacing lines 245-256:

```tsx
    const stop = onPreloaderDone(warm);
    return () => {
      stop();
      cancelWarm();
    };
```

`src/components/home/CookieBanner.tsx`, replacing lines 53-66:

```tsx
    let id: ReturnType<typeof setTimeout>;
    const stop = onPreloaderDone(() => {
      id = setTimeout(() => setShown(true), 400);
    });
    return () => {
      stop();
      clearTimeout(id);
    };
```

Keep the existing explanatory comments about *why* each one waits for the
preloader (Navbar: "so this never competes with the critical-path load";
CookieBanner: "otherwise it flashes in underneath the curtain"). Only remove the
parts that describe the now-deleted `.pre-root` check.

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → exit 0

### Step 4: Migrate `HaloBcaChat` to the shared helper

`src/components/home/HaloBcaChat.tsx:254` is already correct, but leaving it
hand-rolled means the next person copies whichever version they find first.
Replace its block with the same `onPreloaderDone(...)` shape, and fold its
excellent explanatory comment (lines 249-253) into the helper's doc comment if
it adds anything not already there — do not simply delete that knowledge.

**Verify**:
- `npm run typecheck` → exit 0
- `grep -rn 'querySelector(".pre-root")' src/` → returns **only** the line inside
  `onPreloaderDone` in `src/components/Preloader.tsx`
- `grep -rn "PRELOADER_DONE_EVENT" src/` → returns only lines inside
  `src/components/Preloader.tsx`

### Step 5: Verify the fix against the actual race

This is the step that matters. The bug only appears when a consumer mounts
during the ~1.35 s exit window, so a plain page load will *not* exercise it.

With `npm run dev` running and http://localhost:3000 open (supply the preview
password if `PREVIEW_PASSWORD` is set in `.env.local`):

1. **Baseline — confirm nothing regressed on a normal load.** Hard-reload the
   page. The preloader should play, lift, and the sections below the hero should
   fade/slide in as you scroll. The cookie banner should appear (clear
   `localStorage` first). The HaloBCA chat button should appear bottom-right.

2. **Exercise the race.** Reload the page and, while the preloader is still
   animating its exit, switch locale using the language control in the navbar
   (this triggers `router.replace` and remounts the page subtree). Then scroll
   down.
   - **Before this fix**: sections below the hero stay blank/invisible.
   - **After this fix**: every section reveals normally.

3. If the locale switch is awkward to time, verify from the console instead —
   with the page loaded and the preloader finished, run:
   ```js
   document.querySelectorAll('[data-reveal]').length
   ```
   then scroll to the bottom and run it again. The count should **drop toward 0**
   as the controller strips `data-reveal` from settled elements. A count that
   stays flat at ~49 while elements remain invisible means `ScrollReveal` never
   armed.

**Verify**: sections below the hero are visible in both scenarios.

## Test plan

No test framework exists in this repository and this plan does not add one.
Verification is the manual protocol in Step 5, plus:

- `npm run lint` → exit 0
- `npm run typecheck` → exit 0
- `grep -rn 'querySelector(".pre-root")' src/` → exactly one match, inside
  `Preloader.tsx`

A future plan may add a characterisation test for `onPreloaderDone` (it is a
pure-ish function over module state and is easy to test once a runner exists).
That is deliberately deferred — this repo has no runner, and adding one is not
this plan's job.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `onPreloaderDone` is exported from `src/components/Preloader.tsx`
- [ ] `grep -rn 'querySelector(".pre-root")' src/` returns exactly 1 match,
      inside `src/components/Preloader.tsx`
- [ ] `grep -rn "PRELOADER_DONE_EVENT" src/` returns matches only inside
      `src/components/Preloader.tsx`
- [ ] Step 5 scenario 1 (normal load) behaves identically to before
- [ ] Step 5 scenario 2 (locale switch during preloader exit) reveals sections
      correctly
- [ ] `git diff` contains no changes to preloader timing constants, CSS, or
      any `<img>` tag
- [ ] `git diff --name-only` lists only the five in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed since `cf1b0f5` and no longer
  matches the excerpts above.
- After the change, sections below the hero fail to reveal on a *normal* load —
  that means `onPreloaderDone`'s immediate path is firing too early, before
  `setup()` can observe elements. Report rather than adding a `setTimeout`.
- You conclude the fix requires changing `Preloader.tsx`'s phases or timing
  constants. It does not; the bug is entirely in the listeners.
- The reduced-motion path behaves differently after the change (test with the OS
  "reduce motion" setting on — `ScrollReveal` returns early in that case and the
  preloader is skipped).

## Maintenance notes

- **Any future component that needs to wait for the preloader must use
  `onPreloaderDone`.** That is the whole point of this plan. If you see a new
  `querySelector(".pre-root")` or a raw `PRELOADER_DONE_EVENT` listener appear in
  a review, reject it.
- The `preloaderHasFinished` flag is module-level state. It resets on a full page
  load but survives client-side navigation — which is exactly what makes it the
  correct signal here, and also means it must never be reset manually.
- `Preloader.tsx` dispatches the event from two places (lines 170 and 260 — the
  stall-timeout path and the normal path). Both correctly set the flag first. If
  a third dispatch site is ever added, it must do the same; consider extracting
  a small `finish()` function if that happens.
- A reviewer should scrutinise: that the immediate-callback path preserves the
  old synchronous `arm()`/`warm()`/`reveal()` behaviour, and that no consumer
  still checks `.pre-root` by hand.
- This plan fixes the race. It does not address the deeper design smell that
  four unrelated components all depend on the preloader's lifecycle at all —
  worth revisiting if a fifth appears.
