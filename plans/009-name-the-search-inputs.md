# Plan 009: Give both site search inputs an accessible name

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat be4de7d..HEAD -- src/components/home/HeroWidget.tsx src/components/home/MobileHeroWidget.tsx`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (accessibility)
- **Planned at**: commit `be4de7d`, 2026-07-27

## The rule that governs every plan in this directory

The repository owner's standing constraint, verbatim from `plans/README.md`:

> **The site must look pixel-identical after the change. No layout shifts, no
> timing changes, no restyling.** If a change cannot be made without altering
> what the user sees, it does not belong in these plans — stop and report
> instead.

This plan adds only `aria-label` attributes. `aria-label` has **no rendered
effect whatsoever** — it changes nothing visual, no layout, no timing. That is
precisely why this fix is safe.

## Why this matters

The site's primary search box — the single most important interactive control
on the homepage — has **no accessible name at all** in either the desktop or
the mobile hero widget. A screen reader announces it as an unlabeled edit
field, so a blind visitor cannot tell what it searches or that it is the search
box.

There is no `<label>`, no `aria-label`, no `aria-labelledby`, and deliberately
no `placeholder` attribute. The visible placeholder text is a **separate
animated sibling component**, purely decorative, carrying no accessible name.
`MobileHeroWidget.tsx:513-518` documents why the real `placeholder` attribute
was avoided (iOS Safari zoom behaviour) — that reasoning is sound and this plan
does not disturb it. It just means the accessible name has to come from
`aria-label`.

For context on how isolated this is: the entire application contains exactly
**one** `<label>` element (in `HaloBcaChat.tsx:142`).

## Current state

Two files, one identical defect in each.

- `src/components/home/HeroWidget.tsx` — desktop hero widget; the search input
  is at lines 409–423
- `src/components/home/MobileHeroWidget.tsx` — mobile hero widget; the search
  input is at lines 519–535

### `src/components/home/HeroWidget.tsx:409-423`, as it exists today

```tsx
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={focusSearch}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") e.currentTarget.blur();
                    if (e.key === "Enter") {
                      submitSearch(searchValue);
                      e.currentTarget.blur();
                    }
                  }}
                  className="relative z-10 h-7 w-full bg-transparent px-6 text-base font-semibold text-white focus:outline-none"
                />
```

### `src/components/home/MobileHeroWidget.tsx:519-535`, as it exists today

```tsx
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={focusSearch}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchFocused(false);
                  e.currentTarget.blur();
                }
                if (e.key === "Enter") {
                  submitSearch(searchValue);
                  e.currentTarget.blur();
                }
              }}
              className="relative z-10 h-full w-full bg-transparent pl-6 pr-14 text-base font-semibold text-white focus:outline-none"
            />
```

### The translation helper is already in scope in both files

You do **not** need to add any i18n key. Both components already bind the
`nav` namespace:

- `src/components/home/HeroWidget.tsx:192` — `const tNav = useTranslations("nav");`
- `src/components/home/MobileHeroWidget.tsx:267` — `const tNav = useTranslations("nav");`

And both already use `tNav("search")` for the adjacent submit button's
`aria-label` (`HeroWidget.tsx:427`, `MobileHeroWidget.tsx:538`).

`nav.search` is already translated in all three locales:

| file | value |
|------|-------|
| `messages/id.json` | `"Cari"` |
| `messages/en.json` | `"Search"` |
| `messages/zh.json` | `"搜索"` |

Reusing this key is what keeps this plan a two-line change with **zero risk to
translation-key parity**, which currently sits at a clean 271/271/271 across
the three files.

### Repo conventions to match

- `aria-label` is the established way this repo names icon-only and
  unlabeled controls — see `HeroWidget.tsx:427`, `MobileMenu.tsx:180`,
  `SearchRecommendation.tsx:271`. Follow that pattern; do not introduce
  `<label>` elements or visually-hidden text, which would risk layout.
- Translated strings always come through `next-intl` (`t(...)` / `tNav(...)`).
  **Never hardcode a user-facing string.**

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
- `src/components/home/HeroWidget.tsx`
- `src/components/home/MobileHeroWidget.tsx`
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):
- `messages/*.json` — this plan deliberately reuses the existing `nav.search`
  key. Adding a new key means editing three files and risking parity drift for
  no gain.
- `src/components/home/SearchRecommendation.tsx` — the results dropdown. Its
  items are real `<a>` elements inside `<ul>/<li>`, already keyboard
  reachable. Turning it into a full ARIA combobox is a much larger change with
  real interaction risk, and is explicitly **not** part of this plan.
- The `SearchPlaceholderCarousel` / `SearchPlaceholder` components and the
  `text-base` sizing on the inputs — `MobileHeroWidget.tsx:513-518` documents
  that this sizing prevents iOS Safari zoom. Leave both alone.
- `src/app/[locale]/login/page.tsx` — its password field has a `placeholder`,
  and it is a preview-only gate. Out of scope.
- `archive/**` — reference-only snapshots, excluded from `tsconfig.json` and
  ESLint. Never modify or delete anything under this directory.

## Git workflow

- Branch: `advisor/009-name-the-search-inputs`
- Commit style follows `git log` — short imperative sentence, no prefix.
  Example from history: `Translate search-dropdown category labels and popular chips`
- Suggested commit message: `Give both hero search inputs an accessible name`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Name the desktop search input

In `src/components/home/HeroWidget.tsx`, add an `aria-label` to the `<input>`
at line 409. Place it directly after `type="text"` so the two files stay
visually parallel:

```tsx
                <input
                  type="text"
                  aria-label={tNav("search")}
                  value={searchValue}
```

Change nothing else about the element — not the `className`, not the handlers.

**Verify**: `grep -n 'aria-label={tNav("search")}' src/components/home/HeroWidget.tsx`
→ returns **2** lines (the new input one at ~410, and the pre-existing submit
button one at ~428).

### Step 2: Name the mobile search input

In `src/components/home/MobileHeroWidget.tsx`, make the same addition to the
`<input>` at line 519:

```tsx
            <input
              type="text"
              aria-label={tNav("search")}
              value={searchValue}
```

**Verify**: `grep -n 'aria-label={tNav("search")}' src/components/home/MobileHeroWidget.tsx`
→ returns **2** lines.

### Step 3: Confirm the static gates still pass

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0.

**Expected lint baseline**: `78 problems (0 errors, 78 warnings)`. Those
warnings are deliberate — 76 `@next/next/no-img-element` (deliberate; the owner
declined `next/image`), 1 `react-hooks/exhaustive-deps` in
`src/lib/useLayoutVariant.ts:29`, and 1 `@typescript-eslint/no-unused-vars`
for `PRODUCT_VARIANTS` at `src/components/home/ProductSection.tsx:16`. The count must not change: this plan adds no
`<img>` and no hook.

### Step 4: Confirm the accessible name is actually exposed

Start `npm run dev` and open `http://localhost:3000/id`.

If `PREVIEW_PASSWORD` is set in `.env.local`, the gate will redirect you to
`/login`; sign in with that value first, or temporarily run the dev server
without that variable.

In the browser devtools console, run:

```js
document.querySelectorAll('input[type="text"]').forEach(el =>
  console.log(el.getAttribute('aria-label'), el.className.slice(0, 40))
);
```

**Verify**: every text input reports `Cari` (on `/id`). Repeat on
`http://localhost:3000/en` and confirm it reports `Search`.

Note that only one hero widget is mounted per breakpoint — the desktop one at
≥1280px, the mobile one below. Resize the window, or check both viewports, so
you exercise both files.

### Step 5: Confirm nothing moved

With the dev server still running, confirm the search bar renders identically:
same size, same position, same animated placeholder text cycling as before.
`aria-label` cannot cause a visual change, so this is a sanity check — if
anything *did* move, you changed more than the plan asked for. Go to STOP
conditions.

## Test plan

No test suite exists and this plan does not add one. Verification is:

- `npm run typecheck` → exit 0
- `npm run lint` → exit 0, 78 warnings, 0 errors
- The devtools query in Step 4 reports the locale-correct name on `/id` and `/en`
- The search bar is visually unchanged (Step 5)

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c 'aria-label={tNav("search")}' src/components/home/HeroWidget.tsx` → `2`
- [ ] `grep -c 'aria-label={tNav("search")}' src/components/home/MobileHeroWidget.tsx` → `2`
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with 0 errors and 78 warnings
- [ ] `npm run build` exits 0
- [ ] Step 4's console query reports `Cari` on `/id` and `Search` on `/en`
- [ ] `git status --porcelain` lists only the two component files and
      `plans/README.md` — **`messages/*.json` must be untouched**
- [ ] `plans/README.md` status row for 009 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Either `<input>` does not match the excerpt in "Current state" (drift).
- `tNav` is not already defined in one of the components — it should be, at
  `HeroWidget.tsx:192` and `MobileHeroWidget.tsx:267`. If it is missing, the
  file has drifted; do not add a new `useTranslations` call to work around it.
- The lint warning count changes, or any error appears.
- You find yourself needing to edit `messages/*.json`. You should not — the
  `nav.search` key already exists in all three locales.
- Anything about the search bar's appearance, size, position or placeholder
  animation changes.

## Maintenance notes

- **Why `aria-label` and not `<label>`**: a real `<label>` would need to render
  somewhere, and every pixel of this hero is hand-tuned. `aria-label` is
  invisible by definition, which is what makes it compatible with the
  owner's pixel-identical constraint.
- **Why not a `placeholder` attribute**: `MobileHeroWidget.tsx:513-518`
  explains that the input is `text-base` (16px) specifically because iOS
  Safari zooms the page when a focused input is smaller, while the *visible*
  placeholder needs to be 14px. That is why the placeholder is a sibling
  overlay. Do not "simplify" this later by adding a real `placeholder` — it
  would reintroduce the zoom bug or break the design's type scale.
- **What a reviewer should scrutinise**: that `messages/*.json` is untouched
  and the diff is exactly two added lines.
- **Deliberately deferred**: full ARIA combobox semantics for the results
  dropdown (`role="combobox"` / `listbox` / `option`, arrow-key navigation,
  `aria-activedescendant`). The results are already reachable by Tab, so this
  is an enhancement rather than a fix, and it carries real interaction risk on
  a surface the owner has tuned.
