# Plan 010: Take invisible panels out of the keyboard tab order with `inert`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat be4de7d..HEAD -- src/components/home/HeroWidget.tsx src/components/home/MobileHeroWidget.tsx src/components/home/HaloBcaChat.tsx`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: **plan 009** — 009 edits `HeroWidget.tsx` and
  `MobileHeroWidget.tsx`, the same two files this plan edits. Run 009 first
  and branch this work from it, or the two diffs conflict.
- **Category**: bug (accessibility)
- **Planned at**: commit `be4de7d`, 2026-07-27

## The rule that governs every plan in this directory

The repository owner's standing constraint, verbatim from `plans/README.md`:

> **The site must look pixel-identical after the change. No layout shifts, no
> timing changes, no restyling.** If a change cannot be made without altering
> what the user sees, it does not belong in these plans — stop and report
> instead.

This plan adds only the `inert` attribute, always bound to a condition the
component **already** computes to apply `opacity-0 pointer-events-none`.
`inert` has no rendered appearance. It must not be paired with any CSS change.

## Why this matters

Four regions of the UI are hidden with `opacity-0 pointer-events-none`. That
combination hides content from the **eye and the mouse**, but not from the
**keyboard or a screen reader**: `opacity: 0` elements remain focusable and
remain in the accessibility tree.

The practical consequence: a keyboard user tabbing through the mobile hero
lands on a collapsed tile's button and on **two to four invisible external
links** to login destinations, with no visible focus ring anywhere on screen,
because the thing holding focus is fully transparent. Focus appears to vanish.

This repo already solves the same problem correctly elsewhere. The
`.fade-overlay` helper in `src/app/globals.css:101-106` adds
`visibility: hidden` precisely so hidden overlays leave the tab order:

```css
.fade-overlay[data-shown="false"] {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity var(--fade-ms) ease-in-out, visibility 0s var(--fade-ms);
}
```

The four sites in this plan simply never got that treatment. `inert` is the
right tool for them rather than `visibility: hidden`, because `visibility`
is animatable and interacts with the running opacity transitions, whereas
`inert` is a pure behaviour flag that cannot affect rendering or timing.

`inert` also removes the subtree from the accessibility tree, so it fixes the
screen-reader exposure at the same time.

**React 19.2.4 is installed**, and React 19 supports `inert` as a native
boolean prop (`inert={true}` / `inert={false}`). Confirm with
`node -p "require('./node_modules/react/package.json').version"` → `19.2.4`.
The attribute appears nowhere in `src/` today — the three grep hits for
"inert" are all prose inside comments.

## Current state

Four sites, in three files. Each one already has a boolean in scope that says
"this thing is hidden right now" — reuse it, never invent a new one.

| # | File | Line | Region | Condition when **hidden** |
|---|------|------|--------|---------------------------|
| 1 | `MobileHeroWidget.tsx` | 615 | Collapsed login tile trigger | `loginOpen` is **true** |
| 2 | `MobileHeroWidget.tsx` | 635 | Expanded login panel (2–4 external links) | `loginOpen` is **false** |
| 3 | `HeroWidget.tsx` | 595 | Desktop login destinations | `loginOpen` is **false** |
| 4 | `HaloBcaChat.tsx` | 368 | Whole chat launcher | `ready && !hidden` is **false** |

Note site 1 is inverted relative to sites 2 and 3 — the collapsed trigger is
hidden while the panel is *open*. Read each condition carefully.

### Site 1 — `src/components/home/MobileHeroWidget.tsx:612-617`

```tsx
                <button
                  onClick={toggleLogin}
                  aria-expanded={loginOpen}
                  className={`absolute inset-y-0 left-0 flex w-full flex-col items-start justify-center gap-2 p-[14px] text-left transition-opacity duration-200 ${loginOpen ? "pointer-events-none opacity-0" : "opacity-100 delay-100"
                    }`}
                >
```

### Site 2 — `src/components/home/MobileHeroWidget.tsx:629-637`

```tsx
                <div
                  ref={loginPanelRef}
                  /* `top-0` rather than `inset-y-0`: the panel sizes to
                     its own content so its height can be measured, and
                     the rail follows that instead of the other way
                     round. */
                  className={`absolute left-0 top-0 flex flex-col gap-3 p-[14px] transition-opacity duration-200 ${loginOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
                    }`}
                  style={{ width: loginCardWidth }}
                >
```

### Site 3 — `src/components/home/HeroWidget.tsx:594-602`

```tsx
            <div
              className={`flex h-20 min-w-0 items-center gap-3 overflow-hidden px-3 transition-[clip-path,opacity] duration-300 ease-in-out ${loginOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
                }`}
              style={{
                gridColumn: 2,
                gridRow: 1,
                clipPath: loginOpen ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              }}
            >
```

### Site 4 — `src/components/home/HaloBcaChat.tsx:368`

```tsx
    <div className={`fixed right-4 bottom-4 z-[70] transition-opacity duration-500 ease-out xl:right-8 xl:bottom-8 ${ready && !hidden ? "opacity-100" : "pointer-events-none opacity-0"}`}>
```

### Repo conventions to match

- Comments in this codebase explain **why**, not what, and are written in full
  sentences. Several of the excerpts above show the house style. Add a brief
  comment at the first site you touch explaining why `inert` is paired with
  the opacity class; do not repeat it four times.
- Conditional class strings use template literals with the ternary inline, as
  shown. Keep that shape — do not refactor to `clsx` or a helper.

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
- `src/components/home/MobileHeroWidget.tsx`
- `src/components/home/HeroWidget.tsx`
- `src/components/home/HaloBcaChat.tsx`
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):
- `src/app/globals.css` — in particular do **not** add `visibility: hidden` to
  these sites or extend `.fade-overlay` to cover them. `visibility` is
  animatable and would interfere with the opacity transitions these elements
  run. `inert` is the correct tool precisely because it cannot.
- Every existing `.fade-overlay` consumer (`Navbar.tsx:440`,
  `HeroArea.tsx:34`, `HeroWidget.tsx:736`, `MobileHeroWidget.tsx:726`,
  `EventSlider.tsx:203`, `ProductSection.tsx:311` and `:820`,
  `MobileMenu.tsx`). These are **already correct** — they get
  `visibility: hidden` from the shared class. Adding `inert` there would be
  redundant. Leave them.
- `src/components/home/MobileMenu.tsx` — its modal semantics (focus trap,
  Escape, `role="dialog"`) are a separate, larger change handled in
  **plan 014**. Its closed state is already safe via `.fade-overlay`.
- Any `className` string, `style` object, transition, duration or delay. The
  only thing you add is an `inert` prop.
- `archive/**` — reference-only snapshots, excluded from `tsconfig.json` and
  ESLint. Never modify or delete anything under this directory.

## Git workflow

- Branch: `advisor/010-inert-hidden-panels`, **branched from
  `advisor/009-name-the-search-inputs`** (see "Depends on").
- Commit style follows `git log` — short imperative sentence, no prefix.
  Example from history: `Cancel HeroWidget's inner timer chain on cleanup`
- Suggested commit message: `Take invisible login panels out of the tab order with inert`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the collapsed mobile trigger inert while the panel is open

`src/components/home/MobileHeroWidget.tsx`, site 1 (line ~612). Add `inert`
bound to the same `loginOpen` value that already drives the hidden styling,
plus the explanatory comment:

```tsx
                {/* `inert` tracks the same condition as the opacity class:
                    `opacity-0 pointer-events-none` hides this from the eye and
                    the mouse, but not from the keyboard — without this, Tab
                    still lands on a fully transparent button. */}
                <button
                  onClick={toggleLogin}
                  aria-expanded={loginOpen}
                  inert={loginOpen}
                  className={`absolute inset-y-0 left-0 flex w-full flex-col items-start justify-center gap-2 p-[14px] text-left transition-opacity duration-200 ${loginOpen ? "pointer-events-none opacity-0" : "opacity-100 delay-100"
                    }`}
                >
```

Note the polarity: this element is hidden when `loginOpen` is **true**.

**Verify**: `npm run typecheck` → exit 0. (This also proves React's types
accept the `inert` boolean prop on this React version.)

### Step 2: Make the expanded mobile panel inert while collapsed

Same file, site 2 (line ~629). Here the polarity is inverted — the panel is
hidden when `loginOpen` is **false**:

```tsx
                <div
                  ref={loginPanelRef}
                  inert={!loginOpen}
                  /* `top-0` rather than `inset-y-0`: the panel sizes to
                     ... (leave the existing comment exactly as it is)
```

Keep the existing comment block untouched.

**Verify**: `grep -n "inert=" src/components/home/MobileHeroWidget.tsx`
→ returns exactly **2** lines: `inert={loginOpen}` and `inert={!loginOpen}`.

### Step 3: Make the desktop login destinations inert while collapsed

`src/components/home/HeroWidget.tsx`, site 3 (line ~594):

```tsx
            <div
              inert={!loginOpen}
              className={`flex h-20 min-w-0 items-center gap-3 overflow-hidden px-3 transition-[clip-path,opacity] duration-300 ease-in-out ${loginOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
                }`}
```

Leave the `style` object — including the `clipPath` — exactly as it is.

**Verify**: `grep -c "inert=" src/components/home/HeroWidget.tsx` → `1`

### Step 4: Make the chat launcher inert until it is revealed

`src/components/home/HaloBcaChat.tsx`, site 4 (line 368). The launcher is
hidden until `ready && !hidden`:

```tsx
    <div inert={!(ready && !hidden)} className={`fixed right-4 bottom-4 z-[70] transition-opacity duration-500 ease-out xl:right-8 xl:bottom-8 ${ready && !hidden ? "opacity-100" : "pointer-events-none opacity-0"}`}>
```

Do not restructure the line or extract the condition into a variable — keep
the diff minimal and obviously parallel to the existing ternary.

**Verify**: `grep -c "inert=" src/components/home/HaloBcaChat.tsx` → `1`

### Step 5: Confirm the static gates still pass

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0.

**Expected lint baseline**: `78 problems (0 errors, 78 warnings)` — 76 `@next/next/no-img-element` (deliberate; the owner
declined `next/image`), 1 `react-hooks/exhaustive-deps` in
`src/lib/useLayoutVariant.ts:29`, and 1 `@typescript-eslint/no-unused-vars`
for `PRODUCT_VARIANTS` at `src/components/home/ProductSection.tsx:16`. The
count must not change.

### Step 6: Verify invisible controls really left the tab order

Start `npm run dev` and open `http://localhost:3000/id`. (If
`PREVIEW_PASSWORD` is set in `.env.local` you will be redirected to `/login` —
sign in first, or run the dev server without that variable.)

Resize the browser to a mobile width (below 1280px) so `MobileHeroWidget`
mounts. In the devtools console run:

```js
const focusables = [...document.querySelectorAll('a[href], button, input, [tabindex]')]
  .filter(el => el.offsetParent !== null && getComputedStyle(el).opacity !== '0');
console.log('focusable & visible:', focusables.length);
console.log('inert subtrees:', document.querySelectorAll('[inert]').length);
```

**Verify**:
- `inert subtrees` is at least **2** on mobile (the collapsed trigger's
  counterpart panel, plus the chat launcher before it is ready).
- Then tab through the hero from the top with the login panel **closed** and
  confirm focus never lands on anything you cannot see. Every focus stop must
  have a visible element.
- Open the login tile, tab again, and confirm you can now reach the login
  destination links, and that the collapsed trigger no longer takes focus.

Repeat at desktop width (≥1280px) for `HeroWidget`.

### Step 7: Confirm nothing moved or changed timing

With the dev server running, open and close the login tile several times on
both breakpoints.

**Verify**: the expand/collapse animation looks and feels exactly as before —
same duration, same easing, same clip-path wipe on desktop. `inert` cannot
affect rendering, so any observed difference means something else changed. Go
to STOP conditions.

## Test plan

No test suite exists and this plan does not add one. Verification is:

- `npm run typecheck` → exit 0 (also proves the `inert` prop typechecks)
- `npm run lint` → exit 0, 78 warnings, 0 errors
- `npm run build` → exit 0
- The tab-order walkthrough in Step 6 finds no focus stop on an invisible element
- The animations in Step 7 are unchanged

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "inert=" src/components/home/MobileHeroWidget.tsx` → `2`
- [ ] `grep -c "inert=" src/components/home/HeroWidget.tsx` → `1`
- [ ] `grep -c "inert=" src/components/home/HaloBcaChat.tsx` → `1`
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with 0 errors and 78 warnings
- [ ] `npm run build` exits 0
- [ ] `git diff` shows **no** change to any `className`, `style`, transition
      duration or delay
- [ ] `git status --porcelain` lists only the three component files and
      `plans/README.md`
- [ ] Step 6 tab walkthrough passes on both breakpoints
- [ ] `plans/README.md` status row for 010 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any of the four sites does not match its excerpt in "Current state" (drift).
- `npm run typecheck` rejects the `inert` prop. That would mean the React
  version or its types are not what this plan assumes — report the version
  from `node -p "require('./node_modules/react/package.json').version"`
  instead of casting with `as any` or adding `// @ts-ignore`.
- You conclude a site needs `visibility: hidden` or a CSS change to work.
  It does not; report instead.
- Making an element inert visibly breaks its open/close animation.
- Tabbing still reaches an invisible control after the change — report which
  element, with its selector.

## Maintenance notes

- **The rule to carry forward**: in this codebase, `opacity-0
  pointer-events-none` alone is never sufficient to hide interactive content.
  Either use the `.fade-overlay` class (which brings `visibility: hidden`) or
  pair the opacity with `inert`. A reviewer seeing a new
  `opacity-0 pointer-events-none` on a container holding buttons or links
  should ask which of the two it uses.
- **What a reviewer should scrutinise**: the polarity of each condition.
  Site 1 is inverted relative to sites 2–4, and getting it backwards would
  make the *visible* control unfocusable — a worse bug than the one being
  fixed. Step 6's walkthrough is what catches that.
- **Interaction with plan 014**: that plan adds real dialog semantics to
  `MobileMenu`. It will likely introduce a focus trap; `inert` on background
  content is a common way to implement one. Whoever writes it should reuse the
  pattern established here rather than inventing a second approach.
- **Deliberately deferred**: `HaloBcaChat`'s own open panel and scrim were not
  audited for focus trapping in this plan — only the launcher's hidden state
  was fixed. Worth a look if the chat becomes a real feature.
