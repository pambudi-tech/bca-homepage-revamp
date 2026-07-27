# Plan 013: Give the navigation a landmark, a current-page marker, and a skip link

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat be4de7d..HEAD -- src/components/home/Navbar.tsx src/components/home/MobileNav.tsx "src/app/[locale]/layout.tsx" "src/app/[locale]/page.tsx" messages/`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
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

Two of the three changes here (`<nav>`, `aria-current`) are invisible by
definition. The third — the skip link — is **visible only while it has
keyboard focus**, and is off-screen at all other times. Step 5 verifies it
never affects the normal rendered page.

## Why this matters

Three gaps, all on the site's main navigation:

1. **No landmark.** `Navbar.tsx` and `MobileNav.tsx` contain **zero** `<nav>`
   or `<header>` elements — the entire navigation is `<div>`s. Screen-reader
   users navigate by landmark ("go to navigation"); on this site that command
   finds nothing. The only `<nav>` in the app is inside the mobile slide-out
   menu (`MobileMenu.tsx:269` and `:387`).

2. **No current-page marker.** `Navbar.tsx:63-64` defines an `active` prop
   documented as *"Filled blue — this link's destination is the page currently
   on screen"*, but it drives **only** a CSS class. `aria-current` appears
   nowhere in `src/`. A sighted user sees which tab is filled blue; a screen
   reader user gets no such signal.

3. **No skip link.** This homepage puts a large navbar, a segment picker, a
   mega menu trigger and several icon buttons ahead of the content. A keyboard
   user must tab through all of it on every page load and every navigation.

## Current state

### `src/components/home/Navbar.tsx:50-99` — the link component

```tsx
  label,
  href,
  internalHref,
  onClick,
  active,
  viewTransitionName,
}: {
  label: string;
  href?: string;
  /** Same-app route (via the i18n-aware `Link`) — normal navigation, no
      new tab, unlike `href` which is always an external target. */
  internalHref?: string;
  onClick?: () => void;
  /** Filled blue — this link's destination is the page currently on screen. */
  active?: boolean;
  /** Same name on every page this link appears on, so the browser morphs
      its fill/position across a navigation instead of hard-swapping it —
      see the "seamless nav" pieces in globals.css. */
  viewTransitionName?: string;
}) {
  const [hover, setHover] = useState(false);
  const sharedProps = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: viewTransitionName ? ({ viewTransitionName } as CSSProperties) : undefined,
    className: `flex h-10 items-center justify-center gap-0.5 rounded-full border px-4 backdrop-blur-[12px] transition-colors duration-300 ${active
        ? `border-blue-500 ${hover ? "bg-[#0068c0]" : "bg-blue-500"}`
        : hover
          ? "border-white/20 bg-[rgba(5,13,25,0.1)]"
          : "border-white/25 bg-[rgba(5,13,25,0.1)]"
      }`,
  };
```

`sharedProps` is spread onto either a `<Link>` (when `internalHref` is set) or
an `<a>`/`<button>`. Adding `aria-current` to `sharedProps` therefore covers
every rendering path at once — that is the clean insertion point.

Today only one link passes `active` (`Navbar.tsx:531-536`):

```tsx
                    <NavbarLink
                      label={tNav("tentangBca")}
                      internalHref="/tentang-bca"
                      active={variant === "about"}
                      viewTransitionName="nav-tentang-bca"
                    />
```

### `src/components/home/Navbar.tsx:428-446` — the desktop root

```tsx
  return (
    <>
      {/* Mobile navigation (logo + search + burger) — below the xl breakpoint. */}
      <MobileNav scrolled={scrolled} hidden={navHidden} />

      {/* Desktop navigation — hidden on mobile/tablet. `xl:contents` keeps the
          two fixed children positioning against the viewport. */}
      <div className="hidden xl:contents">
        {/* Focus overlay — dims the page behind the mega menu so the panel stands out. */}
        <div
          aria-hidden
          data-shown={menuOpen}
          className="fade-overlay fixed inset-0 z-20 bg-black/50 backdrop-blur-[2px]"
        />
        <div
          className={`pre-nav fixed left-0 right-0 top-0 z-30 flex flex-col items-start transition-transform duration-300 ${shouldHide ? "-translate-y-full" : "translate-y-0"
            }`}
          onMouseLeave={scheduleClose}
```

**Critical constraint**: the outer wrapper uses `xl:contents`. `display:
contents` removes the element from the layout box tree entirely — that is what
lets its two `fixed` children position against the viewport rather than
against the wrapper. **You must not convert that `<div>` to a `<nav>` and you
must not add any element that participates in layout around the fixed
children.** See Step 1 for the safe approach.

### `src/components/home/MobileNav.tsx:38-68` — the mobile root

```tsx
  return (
    <>
    <div
      className={`pre-nav fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between px-4 transition-[transform,translate,background-color] duration-300 xl:hidden ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      } ${scrolled || menuOpen ? "bg-[rgba(18,20,23,0.95)]" : ""}`}
    >
```

This one is a plain `fixed` element with no `contents` trickery, so it can be
renamed to `<nav>` directly.

### `src/app/[locale]/layout.tsx:72-85` — where the skip link goes

```tsx
  return (
    <html lang={locale} className={`${bcaSans.variable} h-full antialiased overscroll-none bg-blue-100`}>
      <body className="min-h-full flex flex-col overscroll-none bg-blue-100">
        <NextIntlClientProvider>
          <SmoothScroll>
            {/* Server-rendered, and visible from the first paint by CSS alone —
                see the .pre-* block in globals.css. */}
            <Preloader />
            {children}
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
```

### The `<main>` elements that need an id

- `src/app/[locale]/page.tsx:43` — `<main className="flex flex-1 flex-col overflow-x-clip bg-blue-100">`
- `src/app/[locale]/tentang-bca/page.tsx:16` — `<main className="flex min-h-screen flex-col bg-blue-100">`
- `src/app/[locale]/login/page.tsx:60` — the preview gate. **Out of scope**; it
  has no navigation to skip.

### i18n

Translation keys currently sit at a clean **271 / 271 / 271** across
`messages/id.json`, `messages/en.json`, `messages/zh.json`. This plan adds
exactly **one** key to each, taking all three to 272. Parity must hold.

Existing structure — there is already a top-level `"nav"` object (it holds
`search`, `tentangBca`, `karir`, `pengajuan`, `promo`, `lokasiBca`, `haloBca`,
`segments`, `pilihSegmen`). Add the new key inside it.

### Repo conventions to match

- All user-facing strings come through `next-intl` — **never hardcode one**.
- `Navbar.tsx` binds `const tNav = useTranslations("nav");` around line 220;
  reuse it.
- Tailwind v4 is in use (`@tailwindcss/postcss`, `@import "tailwindcss"` at
  `globals.css:1`), so the `sr-only` and `focus:not-sr-only` utilities are
  available without adding any CSS. The repo currently uses `sr-only` nowhere;
  this plan introduces the first use, via utilities only.

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
- `src/components/home/Navbar.tsx`
- `src/components/home/MobileNav.tsx`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx` (add an `id` only)
- `src/app/[locale]/tentang-bca/page.tsx` (add an `id` only)
- `messages/id.json`, `messages/en.json`, `messages/zh.json` (one key each)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):
- The `xl:contents` wrapper in `Navbar.tsx:435`. Changing its display, or
  wrapping its fixed children in a new layout-participating element, breaks
  the navbar's positioning. Step 1 explains the safe approach.
- Any `viewTransitionName`, or the `::view-transition-group` rules in
  `globals.css`. The navbar morphs between routes; restructuring its DOM can
  break that. Step 6 verifies it still works.
- `src/components/home/MobileMenu.tsx` — it already has `<nav>` elements, and
  its modal semantics are **plan 014**.
- `src/app/[locale]/login/page.tsx` — preview gate, nothing to skip past.
- `src/app/globals.css` — the skip link uses Tailwind utilities only. Do not
  add custom CSS.
- Any `className` on an existing element other than the `<main>` `id`
  additions and the new skip-link element itself.
- `archive/**` — reference-only snapshots, excluded from `tsconfig.json` and
  ESLint. Never modify or delete anything under this directory.

## Git workflow

- Branch: `advisor/013-nav-landmarks-and-skip-link`
- Commit style follows `git log` — short imperative sentence, no prefix.
  Example from history: `Revamp navbar segment/menu row, add Login+Promo hero tile, mega menu spacing`
- Suggested commit message: `Add nav landmarks, aria-current and a skip link`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the desktop navigation landmark

In `src/components/home/Navbar.tsx`, the goal is a `<nav>` that **wraps the
navigation content without disturbing layout**.

The safe change is to rename the **inner** `pre-nav fixed …` `<div>`
(line ~442, the one carrying `flex flex-col items-start`) to `<nav>`, and give
it an accessible name. Do **not** touch the `xl:contents` wrapper and do
**not** touch the sibling focus-overlay div.

```tsx
        <nav
          aria-label={tNav("primary")}
          className={`pre-nav fixed left-0 right-0 top-0 z-30 flex flex-col items-start transition-transform duration-300 ${shouldHide ? "-translate-y-full" : "translate-y-0"
            }`}
          onMouseLeave={scheduleClose}
```

Find its matching closing `</div>` and change it to `</nav>`. A `<nav>` is a
block-level element exactly like a `<div>`, and every layout-relevant class
stays on it, so this is layout-neutral.

**Verify**: `npm run typecheck` → exit 0 (this catches an unbalanced tag).

### Step 2: Add the mobile navigation landmark

In `src/components/home/MobileNav.tsx`, rename the `pre-nav fixed …` `<div>`
at line 40 to `<nav>` and give it the same accessible name. Change its
matching closing `</div>` (line 68) to `</nav>`.

```tsx
    <nav
      aria-label={tNav("primary")}
      className={`pre-nav fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between px-4 transition-[transform,translate,background-color] duration-300 xl:hidden ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      } ${scrolled || menuOpen ? "bg-[rgba(18,20,23,0.95)]" : ""}`}
    >
```

`tNav` is already bound in this file (it is used at line 54 for
`tNav("lokasiBca")`).

Because the desktop nav is `xl:` only and this one is `xl:hidden`, exactly one
of the two is ever rendered at a given breakpoint — so sharing one
`aria-label` creates no duplicate-landmark ambiguity.

**Verify**: `grep -c "<nav" src/components/home/MobileNav.tsx` → `1`

### Step 3: Add the `nav.primary` translation key

Add one key to the existing top-level `"nav"` object in each file. Suggested
values:

| file | key | value |
|------|-----|-------|
| `messages/id.json` | `nav.primary` | `"Navigasi utama"` |
| `messages/en.json` | `nav.primary` | `"Main navigation"` |
| `messages/zh.json` | `nav.primary` | `"主导航"` |

**Verify**: run the key-parity check —

```bash
for f in messages/*.json; do printf "%s: " "$f"; node -e "const o=require('./$f');const c=(x,p='')=>Object.entries(x).flatMap(([k,v])=>typeof v==='object'&&v!==null?c(v,p+k+'.'):[p+k]);console.log(c(o).length)"; done
```

→ all three report **272**. Any mismatch is a STOP condition.

### Step 4: Mark the current page with `aria-current`

In `src/components/home/Navbar.tsx`, add `aria-current` to the `sharedProps`
object inside `NavbarLink` (around line 71). Because `sharedProps` is spread
onto every rendering path, this one addition covers the `<Link>`, `<a>` and
`<button>` branches:

```tsx
  const sharedProps = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    // Pairs the blue fill with a signal assistive tech can read — the fill
    // alone only tells a sighted user which page they are on.
    "aria-current": active ? ("page" as const) : undefined,
    style: viewTransitionName ? ({ viewTransitionName } as CSSProperties) : undefined,
    className: `flex h-10 items-center justify-center gap-0.5 rounded-full border px-4 backdrop-blur-[12px] transition-colors duration-300 ${active
```

Using `undefined` (rather than `false`) means the attribute is omitted
entirely when the link is not current, which is the correct ARIA behaviour.

**Verify**: `npm run typecheck` → exit 0. If TypeScript objects to the spread's
inferred type, add the `as const` exactly as shown rather than casting the
whole object to `any`.

### Step 5: Add the skip link and its target

**5a — the target.** Add `id="main-content"` to two `<main>` elements:

- `src/app/[locale]/page.tsx:43`:
  `<main id="main-content" className="flex flex-1 flex-col overflow-x-clip bg-blue-100">`
- `src/app/[locale]/tentang-bca/page.tsx:16`:
  `<main id="main-content" className="flex min-h-screen flex-col bg-blue-100">`

Change nothing else on those elements.

**5b — the link.** In `src/app/[locale]/layout.tsx`, add the skip link as the
**first child of `<body>`**, before `NextIntlClientProvider`. It must be first
so it is the first thing that receives focus.

It needs a translated label, so it must sit inside the intl provider — but it
must also come first in the DOM. Resolve this by putting it inside the
provider and making the provider the first child, which it already is:

```tsx
      <body className="min-h-full flex flex-col overscroll-none bg-blue-100">
        <NextIntlClientProvider>
          {/* First focusable element on the page: lets keyboard users jump the
              navbar, segment picker and mega-menu triggers straight to the
              content. `sr-only` keeps it out of the visual design until it
              takes focus, at which point `focus:not-sr-only` brings it on
              screen. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-500"
          >
            {t("skipToContent")}
          </a>
          <SmoothScroll>
```

You will need the translation function. `layout.tsx` is an async server
component and already imports `getTranslations` from `next-intl/server`
(line 5). Add, after `setRequestLocale(locale);`:

```tsx
  const t = await getTranslations({ locale, namespace: "nav" });
```

**5c — the label key.** Add `skipToContent` to the `"nav"` object in all three
message files:

| file | value |
|------|-------|
| `messages/id.json` | `"Lompat ke konten utama"` |
| `messages/en.json` | `"Skip to main content"` |
| `messages/zh.json` | `"跳到主要内容"` |

**Verify**: re-run the parity check from Step 3 → all three now report **273**.

### Step 6: Confirm the static gates and the live page

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0.
3. `npm run build` → exit 0.

**Expected lint baseline**: `78 problems (0 errors, 78 warnings)` — 76 `@next/next/no-img-element` (deliberate; the owner
declined `next/image`), 1 `react-hooks/exhaustive-deps` in
`src/lib/useLayoutVariant.ts:29`, and 1 `@typescript-eslint/no-unused-vars`
for `PRODUCT_VARIANTS` at `src/components/home/ProductSection.tsx:16`. The
count must not change.

Then start `npm run dev` and open `http://localhost:3000/id`. (If
`PREVIEW_PASSWORD` is set in `.env.local` you will be redirected to `/login` —
sign in first, or run without that variable.)

**6a — the navbar looks identical.** Compare against `git stash` if helpful.
Check both breakpoints: desktop (≥1280px) and mobile (<1280px). The navbar
must sit in exactly the same place, hide and reveal on scroll exactly as
before, and the mega menu must still open.

**6b — the landmark exists.** In the console:
```js
console.log([...document.querySelectorAll('nav')].map(n => n.getAttribute('aria-label')));
```
→ includes `Navigasi utama` on `/id`.

**6c — the skip link works.** Load the page, click once on the page background
to ensure nothing is focused, then press **Tab** once.

→ The skip link must become **visible** in the top-left corner. Press
**Enter**; focus and the viewport must move to the main content. Press Tab
again from a fresh load without activating it — it must disappear again as
focus moves on.

**6d — `aria-current` appears on the right link.** Navigate to
`http://localhost:3000/id/tentang-bca` and run:
```js
console.log(document.querySelector('[aria-current="page"]')?.textContent);
```
→ prints the "Tentang BCA" label. On the homepage `/id`, the same query must
return `undefined`.

**6e — the navbar morph still works.** Navigate from `/id` to `/id/tentang-bca`
by clicking the "Tentang BCA" tab.

**Verify**: the segment pill and tab row still morph smoothly across the
navigation rather than hard-swapping. This confirms Steps 1–2 did not break
the view-transition setup.

## Test plan

No test suite exists and this plan does not add one. Verification is:

- `npm run typecheck` / `lint` / `build` → all exit 0, lint unchanged at 78 warnings
- Key parity: all three message files report **273**
- Steps 6a–6e all behave as specified

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "<nav" src/components/home/Navbar.tsx` → `1`
- [ ] `grep -c "<nav" src/components/home/MobileNav.tsx` → `1`
- [ ] `grep -n 'aria-current' src/components/home/Navbar.tsx` → 1 match
- [ ] `grep -n 'main-content' "src/app/[locale]/layout.tsx" "src/app/[locale]/page.tsx" "src/app/[locale]/tentang-bca/page.tsx"` → 3 matches
- [ ] Key-parity script reports **273 / 273 / 273**
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with 0 errors and 78 warnings
- [ ] `npm run build` exits 0
- [ ] Steps 6a–6e pass
- [ ] `git status --porcelain` lists only the in-scope files
- [ ] `plans/README.md` status row for 013 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any file does not match its excerpt in "Current state" (drift).
- The navbar shifts position, changes size, or loses its scroll hide/reveal
  after Step 1 or 2. That means the `<nav>` rename disturbed layout — revert
  and report rather than compensating with new CSS.
- The navbar morph (Step 6e) stops working.
- The key-parity script reports anything other than three equal numbers.
- The skip link is visible when it does **not** have focus.
- TypeScript rejects the `aria-current` spread and the `as const` shown in
  Step 4 does not resolve it. Do not reach for `any` or `@ts-ignore`.

## Maintenance notes

- **Why the inner div became the `<nav>`, not the outer one**: the outer
  wrapper is `xl:contents`, which removes it from the box tree so its `fixed`
  children position against the viewport. A landmark on a `display: contents`
  element is also unreliably exposed by assistive tech. The inner `fixed`
  element is both layout-safe and correctly announced.
- **`aria-current` is centralised** in `NavbarLink`'s `sharedProps`, so any
  future nav link that passes `active` gets the attribute automatically. Keep
  it there rather than adding it per call site.
- **What a reviewer should scrutinise**: that no `className` changed anywhere
  except the new skip link, and that both `<nav>` renames have matching
  closing tags. Typecheck catches unbalanced JSX, but a `</div>` closing a
  `<nav>` in a different branch would not necessarily be caught by eye.
- **The skip link's styling** is deliberately all Tailwind `focus:` utilities
  so it adds nothing to `globals.css` and cannot affect the unfocused page.
  If the design ever wants it styled differently, keep the
  `sr-only` / `focus:not-sr-only` pair — that is what makes it invisible until
  focused.
- **Deliberately deferred**: `aria-controls` on the mega-menu and mobile-menu
  triggers (they have `aria-expanded` but no `aria-controls`), and full
  combobox semantics for the search dropdown. Both are enhancements rather
  than fixes.
