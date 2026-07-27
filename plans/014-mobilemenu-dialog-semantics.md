# Plan 014: Give the mobile menu real dialog semantics

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat be4de7d..HEAD -- src/components/home/MobileMenu.tsx src/components/home/MobileNav.tsx messages/`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: **plan 013** (both edit `MobileNav.tsx`). Run 013 first and
  branch this work from it. Reading **plan 010** first is also recommended —
  it establishes this repo's `inert` pattern, which Step 4 reuses.
- **Category**: bug (accessibility)
- **Planned at**: commit `be4de7d`, 2026-07-27

## The rule that governs every plan in this directory

The repository owner's standing constraint, verbatim from `plans/README.md`:

> **The site must look pixel-identical after the change. No layout shifts, no
> timing changes, no restyling.** If a change cannot be made without altering
> what the user sees, it does not belong in these plans — stop and report
> instead.

**This is the riskiest plan in the set with respect to that rule.** The mobile
menu runs slide/fade animations on open, close and every internal view change
(`menu-enter-fwd`, `menu-exit-back`, and the `.fade-overlay` transition). Focus
management can interact with animation timing — moving focus to an element
mid-transition can cause the browser to scroll it into view, which would be a
visible jump.

Every step below is therefore written to avoid touching animation, and Step 6
exists specifically to catch a timing regression. If you cannot achieve a step
without changing an animation, that is a STOP condition.

## Why this matters

`MobileMenu` is a full-viewport overlay portaled to `document.body`. It is a
modal dialog in every respect except the ones assistive technology can detect:

- No `role="dialog"` and no `aria-modal="true"` — a screen reader does not
  announce it as a dialog.
- **No Escape handler.** `grep -n "Escape" src/components/home/MobileMenu.tsx`
  returns nothing. Escape closes the HaloBCA chat, the hero search and the
  layout switcher, but not this. It is the largest overlay on the site.
- **No focus trap.** When the menu is open the page behind it is still in the
  tab order, so Tab walks focus out of the menu and onto controls that are
  completely covered.
- **No focus restoration.** After closing, focus is lost to the document body
  instead of returning to the hamburger button that opened it, so a keyboard
  user restarts from the top of the page.

One thing is already correct and must not be "fixed": when the menu is
**closed** it is genuinely inert, because `.fade-overlay[data-shown="false"]`
applies `visibility: hidden` (`globals.css:101-106`), which removes its
children from the tab order. The problem is exclusively the **open** state.

## Current state

### `src/components/home/MobileMenu.tsx:151-165` — the portaled root

```tsx
  if (!mounted) return null;
  return createPortal(
    <div
      data-shown={open}
      className="fade-overlay fixed inset-0 z-[60] flex justify-center xl:hidden"
      style={
        {
          "--fade-ms": "500ms",
          background: "linear-gradient(to bottom, rgba(0,92,170,0.5) 0%, #005caa 15%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        } as CSSProperties
      }
      aria-hidden={!open}
    >
      <div className="flex h-full w-full max-w-[440px] flex-col">
```

### `src/components/home/MobileMenu.tsx:180-182` — the close button

```tsx
            <button onClick={onClose} aria-label={tMobile("tutupMenu")} className="flex size-10 items-center justify-center text-white transition-transform active:scale-95">
              <CloseIcon />
            </button>
```

### `src/components/home/MobileMenu.tsx:1-10` — imports and existing hooks

```tsx
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { useMegaMenu } from "./use-megamenu";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import type { MegaMenuCategory } from "./megamenu-data";
import { useScrollLock } from "@/components/SmoothScroll";
```

Translation namespaces already bound (lines 61–63):

```tsx
  const tNav = useTranslations("nav");
  const tMobile = useTranslations("mobileMenu");
  const tLang = useTranslations("languages");
```

The `mobileMenu` namespace currently holds: `tutupMenu`, `bukaMenu`, `bahasa`,
`pilihSegmen`, `kembali`.

### `src/components/home/MobileNav.tsx:59-70` — the trigger and the render site

```tsx
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? t("tutupMenu") : t("bukaMenu")}
          aria-expanded={menuOpen}
          className="flex size-10 items-center justify-center rounded-full bg-[rgba(18,20,23,0.5)] backdrop-blur-[4px] transition-transform active:scale-95"
        >
          <img src="/assets/cycle1/outline-menu.svg" alt="" className="size-6" />
        </button>
```

```tsx
    <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
```

`MobileNav` owns the `menuOpen` state; `MobileMenu` receives `open` and
`onClose`. **Note**: if plan 013 landed first, the surrounding `<div>` is now a
`<nav>` — that is expected and does not affect this plan.

### Repo conventions to match

- Effects that attach a listener always return a cleanup — see
  `SoliprioCard.tsx:64-75` (`observer.disconnect()`) and
  `MobileNav.tsx:34-36`.
- Escape handling exists in `HaloBcaChat.tsx`, `HeroWidget.tsx`,
  `MobileHeroWidget.tsx` and `LayoutSwitcher.tsx` — read one of them and match
  its shape rather than inventing a new one.
- Comments explain **why**, in full sentences.
- The repo uses the `inert` attribute for "hidden but present" content
  (established in plan 010); React 19.2.4 supports it as a boolean prop.

## Commands you will need

| Purpose   | Command             | Expected on success                |
|-----------|---------------------|------------------------------------|
| Typecheck | `npm run typecheck` | exit 0, no errors                  |
| Lint      | `npm run lint`      | exit 0; 78 warnings, 0 errors      |
| Build     | `npm run build`     | exit 0                             |
| Dev server| `npm run dev`       | serves on http://localhost:3000    |

There is **no test suite in this repo**. Do not add a test framework.

## Scope

**In scope**:
- `src/components/home/MobileMenu.tsx`
- `messages/id.json`, `messages/en.json`, `messages/zh.json` (one key each)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):
- **Any animation.** `--fade-ms`, `.fade-overlay`, `menu-enter-fwd`,
  `menu-exit-fwd`, `menu-enter-back`, `menu-exit-back`, the `navigate()`
  function, `enterAnim`, `exiting`, and every `onAnimationEnd` handler. This
  plan adds focus and keyboard behaviour **around** the existing animation, it
  does not modify it.
- `src/app/globals.css` — no CSS change is needed.
- `src/components/home/MobileNav.tsx` — focus restoration is implemented
  **inside** `MobileMenu` (Step 3) precisely so this file needs no change and
  the two components stay decoupled.
- The `aria-hidden={!open}` attribute on the root. It is correct and Step 1
  keeps it.
- `useScrollLock(open)` at line 86 — already correct.
- The internal view state machine (`view`, `segment`, `enterDir`,
  `SegmentView`, `DetailView`, `MainView`) and the `<nav>` elements at
  lines 269 and 387.
- `archive/**` — reference-only snapshots, excluded from `tsconfig.json` and
  ESLint. Never modify or delete anything under this directory.

## Git workflow

- Branch: `advisor/014-mobilemenu-dialog-semantics`, branched from
  `advisor/013-nav-landmarks-and-skip-link`.
- Commit style follows `git log` — short imperative sentence, no prefix.
  Example from history: `Give the Lenis scroll lock a single ref-counted owner`
- Commit each step separately; this plan is the easiest in the set to have to
  partially revert.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Declare the overlay as a modal dialog

In `src/components/home/MobileMenu.tsx`, add three attributes to the portaled
root at line 153. Keep `data-shown`, the `className`, the `style` and
`aria-hidden` exactly as they are:

```tsx
    <div
      data-shown={open}
      role="dialog"
      aria-modal="true"
      aria-label={tMobile("menuLabel")}
      className="fade-overlay fixed inset-0 z-[60] flex justify-center xl:hidden"
      style={
        {
          "--fade-ms": "500ms",
          background: "linear-gradient(to bottom, rgba(0,92,170,0.5) 0%, #005caa 15%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        } as CSSProperties
      }
      aria-hidden={!open}
    >
```

Add the `menuLabel` key to the `mobileMenu` object in all three message files:

| file | value |
|------|-------|
| `messages/id.json` | `"Menu utama"` |
| `messages/en.json` | `"Main menu"` |
| `messages/zh.json` | `"主菜单"` |

**Verify**: the key-parity check —

```bash
for f in messages/*.json; do printf "%s: " "$f"; node -e "const o=require('./$f');const c=(x,p='')=>Object.entries(x).flatMap(([k,v])=>typeof v==='object'&&v!==null?c(v,p+k+'.'):[p+k]);console.log(c(o).length)"; done
```

→ all three report the **same** number. (If plan 013 landed it will be 274;
otherwise 272. What matters is that all three agree.)

### Step 2: Close on Escape

Add an effect that listens for Escape only while the menu is open. Place it
near the existing effects (after `useScrollLock(open)` at line 86):

```tsx
  // Escape closes the menu, matching every other dismissible surface on the
  // site (HaloBcaChat, the hero search, LayoutSwitcher). Bound only while
  // open so a stray Escape elsewhere on the page costs nothing.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
```

**Note on `onClose`**: `MobileNav` passes an inline arrow
(`onClose={() => setMenuOpen(false)}`), so its identity changes every render.
That is fine here — the effect only re-subscribes a listener, it does not
restart an animation. **Do not** "optimise" this by removing `onClose` from
the dependency array; that would trip the `exhaustive-deps` lint rule, and
this repo treats that rule as meaningful.

**Verify**: `npm run lint` → still 0 errors, and **no new**
`react-hooks/exhaustive-deps` warning.

### Step 3: Restore focus to the trigger on close

Keep this self-contained inside `MobileMenu` so `MobileNav` needs no change.
Record whatever had focus when the menu opens, and restore it when it closes:

```tsx
  // Remembers the control that opened the menu (the hamburger in MobileNav)
  // and hands focus back on close — otherwise focus falls to <body> and a
  // keyboard user restarts from the top of the page.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      return;
    }
    // Only steal focus back if it is not already somewhere deliberate —
    // guards against yanking focus during the closing animation if the user
    // has already clicked elsewhere.
    if (restoreFocusRef.current && document.activeElement === document.body) {
      restoreFocusRef.current.focus();
      restoreFocusRef.current = null;
    }
  }, [open]);
```

Add `useRef` to the React import on line 3:

```tsx
import { useEffect, useRef, useState, type CSSProperties } from "react";
```

**Do not** call `.focus()` with `preventScroll` omitted on an element that is
off-screen — the hamburger is `fixed` at the top and always in view, so this
is safe here. If you find yourself needing `preventScroll: true`, something
else is wrong; go to STOP conditions.

**Verify**: `npm run typecheck` → exit 0.

### Step 4: Trap focus inside the menu while it is open

Use the repo's established `inert` pattern rather than a keydown-based
tab-cycling trap: marking the rest of the page inert is simpler, cannot
desynchronise from the DOM, and also removes the background from the
accessibility tree.

The menu is portaled to `document.body`, so its siblings are the page. Add:

```tsx
  // Focus trap. The menu is portaled to <body>, so every *other* body child is
  // the page behind it — marking them inert takes them out of the tab order
  // and the accessibility tree for as long as the menu is open, without
  // touching their styles or their animations. Cleanup is unconditional so a
  // fast open/close can never strand an inert page.
  useEffect(() => {
    if (!open) return;
    const root = portalRef.current;
    if (!root) return;

    const siblings = [...document.body.children].filter(
      (el) => el !== root && !el.hasAttribute("inert")
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));

    return () => siblings.forEach((el) => el.removeAttribute("inert"));
  }, [open]);
```

This needs a ref on the portaled root. Add `ref={portalRef}` to the `<div>`
you edited in Step 1, and declare it alongside the other refs:

```tsx
  const portalRef = useRef<HTMLDivElement>(null);
```

The `!el.hasAttribute("inert")` filter matters: it means the cleanup only
removes `inert` from elements **this effect** added it to, so it cannot clear
an `inert` that plan 010 or another component set for its own reasons.

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → 0 errors.

### Step 5: Confirm the static gates

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0.
3. `npm run build` → exit 0.

**Expected lint baseline**: `78 problems (0 errors, 78 warnings)` — 76 `@next/next/no-img-element` (deliberate; the owner
declined `next/image`), 1 `react-hooks/exhaustive-deps` in
`src/lib/useLayoutVariant.ts:29`, and 1 `@typescript-eslint/no-unused-vars`
for `PRODUCT_VARIANTS` at `src/components/home/ProductSection.tsx:16`. The
count **must not increase**. Three new effects were added; if any of them
raises an `exhaustive-deps` warning, fix the dependency array rather than
suppressing it.

### Step 6: Verify behaviour — and that no animation changed

Start `npm run dev` and open `http://localhost:3000/id` at a **mobile width**
(below 1280px). (If `PREVIEW_PASSWORD` is set in `.env.local` you will be
redirected to `/login` — sign in first, or run without that variable.)

**6a — animation is unchanged.** This is the most important check in the plan.
Open and close the menu several times. Navigate into a category (forward
slide), back out (back slide), and into the segment picker.

**Verify**: every transition has the same duration, easing and direction as
before. The overlay still fades over 500ms. There is **no** jump, scroll or
flicker at the moment the menu opens or closes. If you see any, the focus
work is interfering — go to STOP conditions.

**6b — Escape closes it.** Open the menu, press Escape → it closes with its
normal animation.

**6c — focus is trapped.** Open the menu and press Tab repeatedly through more
stops than the menu contains.

**Verify**: focus cycles only within the menu and never lands on a control
behind it. Confirm in the console while open:

```js
console.log('inert siblings:', [...document.body.children].filter(el => el.hasAttribute('inert')).length);
```
→ at least `1`.

**6d — focus is restored.** From a fresh load, Tab to the hamburger button,
press Enter to open, then press Escape.

**Verify**: focus returns to the hamburger button. Confirm with
`document.activeElement` in the console — it should be the `<button>` carrying
the `bukaMenu` aria-label.

**6e — no inert is stranded.** Close the menu, then run the console snippet
from 6c again → `inert siblings: 0`. Then open and close the menu rapidly
several times and re-check → still `0`. A non-zero count after closing means
the page is permanently unusable by keyboard; that is the worst failure mode
of this plan and Step 4's unconditional cleanup exists to prevent it.

**6f — the closed menu is still inert.** With the menu closed, Tab through the
whole page.

**Verify**: focus never lands inside the menu. (This already worked before via
`visibility: hidden`; the check confirms the change did not regress it.)

## Test plan

No test suite exists and this plan does not add one. Verification is:

- `npm run typecheck` / `lint` / `build` → all exit 0, lint warnings not increased
- Key parity: all three message files report the same count
- Steps 6a–6f all behave as specified, with **6a and 6e** being the two that
  must not be compromised

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n 'role="dialog"' src/components/home/MobileMenu.tsx` → 1 match
- [ ] `grep -n 'aria-modal' src/components/home/MobileMenu.tsx` → 1 match
- [ ] `grep -c "Escape" src/components/home/MobileMenu.tsx` → at least `1`
- [ ] `grep -n "inert" src/components/home/MobileMenu.tsx` → the trap effect exists
- [ ] Key-parity script reports three equal numbers
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0, 0 errors, warning count not increased
- [ ] `npm run build` exits 0
- [ ] Steps 6a–6f pass
- [ ] `git diff` shows **no** change to any animation class, `--fade-ms`,
      `navigate()`, `enterAnim`, `exiting`, or any `onAnimationEnd`
- [ ] `git status --porcelain` lists only `MobileMenu.tsx`, the three message
      files and `plans/README.md` — **`MobileNav.tsx` must be untouched**
- [ ] `plans/README.md` status row for 014 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any excerpt in "Current state" does not match the live code (drift).
- **Any menu animation changes** in duration, easing, direction or smoothness
  (Step 6a). Revert and report — do not compensate by adjusting timings.
- Opening or closing the menu causes the page behind it to scroll or jump.
- `inert siblings` is non-zero after the menu closes (Step 6e), and one
  reasonable fix attempt does not resolve it. A stranded `inert` makes the
  entire page keyboard-inaccessible; report rather than shipping it.
- You conclude you need to modify `MobileNav.tsx` to make focus restoration
  work. Step 3 is designed to avoid that.
- You need `focus({ preventScroll: true })` to stop a visible jump — that means
  focus is being moved at the wrong moment; report instead.
- Lint gains a new `exhaustive-deps` warning you cannot resolve without
  suppressing it.

## Maintenance notes

- **Why `inert` on siblings rather than a keydown tab-cycling trap**: a
  tab-cycling trap has to enumerate focusable descendants and re-enumerate
  them whenever the menu's internal view changes — and this menu swaps its
  whole subtree on every navigation. `inert` on the background is
  state-independent and cannot desynchronise. It also removes the background
  from the accessibility tree, which a tab trap does not.
- **The `!el.hasAttribute("inert")` filter is load-bearing.** Plan 010 sets
  `inert` on hidden panels elsewhere. Without the filter, this effect's
  cleanup would clear those too, silently undoing plan 010 whenever the mobile
  menu closed.
- **What a reviewer should scrutinise**: the cleanup path of the Step 4
  effect, and Step 6e's verification. Everything else in this plan degrades
  gracefully if wrong; a stranded `inert` on `document.body`'s children breaks
  the entire page for keyboard and screen-reader users.
- **Interaction with the portal**: if `MobileMenu` ever stops portaling to
  `document.body`, the Step 4 sibling logic breaks silently — it would mark
  the menu's own ancestors inert. Anyone changing the portal target must
  revisit that effect.
- **Deliberately deferred**: `aria-controls` linking the hamburger button to
  the dialog, and an initial-focus move into the menu on open. The latter was
  left out on purpose — moving focus at open time is exactly what risks the
  scroll-into-view jump this plan is trying to avoid, and Escape plus the trap
  already make the menu operable.
