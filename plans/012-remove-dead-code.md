# Plan 012: Remove the Lokasi BCA residue and the dead border-glow module

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat be4de7d..HEAD -- package.json src/app/globals.css next.config.ts src/components/ui`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: **plan 008** (both edit `package.json`) and **plan 011**
  (both edit `src/app/globals.css`). Run this after both, branched from the
  later one, or the diffs conflict.
- **Category**: tech-debt
- **Planned at**: commit `be4de7d`, 2026-07-27

## The rule that governs every plan in this directory

The repository owner's standing constraint, verbatim from `plans/README.md`:

> **The site must look pixel-identical after the change. No layout shifts, no
> timing changes, no restyling.** If a change cannot be made without altering
> what the user sees, it does not belong in these plans — stop and report
> instead.

Everything deleted here is provably unreferenced. If removing something changes
what renders, then it was **not** dead and you have deleted the wrong thing —
that is a STOP condition, not something to patch around.

## Why this matters

The Lokasi BCA (branch/ATM locator) feature was removed from `src/`, but its
supporting weight was left behind:

- **`maplibre-gl` is still a dependency** — 44 MB installed, with **zero**
  imports anywhere in `src/`. Every `npm install` on every machine and every CI
  run pays for it.
- **~200 lines of dead CSS** in `src/app/globals.css`, roughly 16% of the
  stylesheet. Verified exhaustively: of the 51 classes defined in that file,
  **every single unused one** is a Lokasi BCA leftover.
- **The Content-Security-Policy still grants a third-party origin** the site no
  longer contacts (`https://tiles.openfreemap.org`) and still permits
  `worker-src blob:`, which existed solely so MapLibre could spawn its tile
  worker. A CSP should grant exactly what the app needs and nothing more.
- **A 133 KB data file** (`src/data/bca-locations.json`) with no importers.
- **Three icon assets** in `public/assets/lokasi/`, referenced only by the dead
  CSS.

Separately, `src/components/ui/border-glow.tsx` (231 lines) and its
`border-glow.css` are **entirely unreferenced** — nothing in `src/` imports
either file.

The feature's source is already safely preserved. `archive/README.md` records
it, and `archive/lokasi-bca/` holds `LocationFinder.tsx`, `LocationMap.tsx`,
`LocationSection.tsx`, `bca-map-style.ts`, `location-data.ts`, `locations.ts`
and the `api-locations/` routes. **This plan does not touch `archive/` and
must not.** The archive is exactly what makes deleting the residue safe.

This also follows a precedent the repo already set. From `archive/README.md`,
describing the earlier removal of a three.js effect:

> Moved out during the July 2026 performance pass, along with `npm uninstall
> three @types/three`.

Archive the source, then uninstall the dependency. This plan does the same for
`maplibre-gl`.

## Current state

### 1. `package.json:14` — the dead dependency

```json
    "maplibre-gl": "^5.24.0",
```

Verified dead: `grep -rn "maplibre-gl" src/ scripts/` returns **no** JS/TS
import. The only matches anywhere are `.maplibregl-*` CSS class names in
`globals.css`, which this plan also deletes.

### 2. `src/app/globals.css` — three dead regions

They are **not contiguous**. Live CSS sits between them, so you cannot delete
one large range.

| Region | Lines (at commit `be4de7d`) | Content | Anchor to find it |
|--------|------------------------------|---------|-------------------|
| A | 980–1001 (+ blank 1002) | `.geo-primer-panel` / `.geo-primer-scrim` and their reduced-motion block | comment starts `/* Lokasi BCA — the geolocation priming popover` |
| B | 1059–1225 (+ blank 1226) | The whole Lokasi BCA block: `.bca-locate-icon` … `.maplibregl-ctrl-attrib a` | comment starts `/* ---------- Lokasi BCA (LocationSection / LocationFinder / LocationMap) ----------` |
| C | 1250–1261 (end of file) | `.maplibregl-cooperative-gesture-screen` | comment reads `/* The panel MapLibre raises when a wheel or one-finger drag is refused. */` |

**What must survive, between and after those regions:**

- Lines 1003–1057 — the `html.lenis` / `.lenis.*` rules and the
  `@keyframes product-photo-*` / `product-copy-swap-*` pairs. **Live.**
- Lines 1227–1249 — the `::view-transition-group(...)` rules for
  `nav-tentang-bca`, `nav-segment-pill`, `nav-tab-row`, `nav-top-row`, plus
  their `prefers-reduced-motion` block. **Live** — these drive the navbar
  morph between routes.

Region B ends here:

```css
.maplibregl-ctrl-attrib a {
  color: var(--color-blue-500);
}
```

and the very next non-blank line, which **must be kept**, is:

```css
/* Cross-page navbar continuity (experimental.viewTransition in
```

### 3. `next.config.ts:25-29` — the CSP entries

```ts
  "connect-src 'self' https://tiles.openfreemap.org",
  // MapLibre GL parses tiles in a Worker it spawns from a blob: URL; with no
  // worker-src, that request falls back to script-src, which doesn't carry
  // blob: — so the worker (and the whole map) silently never starts.
  "worker-src 'self' blob:",
```

`connect-src` must **stay** (it is a real directive the app needs) but drop the
now-unused origin, becoming `"connect-src 'self'"`. The `worker-src` line and
its three-line comment go entirely.

### 4. Orphaned files

- `src/data/bca-locations.json` — 133 KB, zero importers in `src/`
- `public/assets/lokasi/icon-locate.svg`, `icon-located.svg`, `icon-search.svg`
  — referenced only by region B
- `src/components/ui/border-glow.tsx` and `src/components/ui/border-glow.css` —
  zero importers anywhere in `src/`; `src/components/ui/` becomes empty

### 5. `scripts/` — tooling for the removed feature

`scripts/fetch-bca-locations.mjs` builds `src/data/bca-locations.json`, and
`scripts/README.md` documents it. Both are developer tooling, not app code, and
are **not** deleted by this plan — see "Out of scope" for why.

## Commands you will need

| Purpose   | Command             | Expected on success                |
|-----------|---------------------|------------------------------------|
| Install   | `npm install`       | exit 0                             |
| Typecheck | `npm run typecheck` | exit 0, no errors                  |
| Lint      | `npm run lint`      | exit 0; 78 warnings, 0 errors      |
| Build     | `npm run build`     | exit 0                             |
| Dev server| `npm run dev`       | serves on http://localhost:3000    |

There is **no test suite in this repo**. Do not add a test framework.

## Scope

**In scope**:
- `package.json` (remove one dependency line)
- `package-lock.json` (regenerated by `npm install` — do not hand-edit)
- `src/app/globals.css` (delete regions A, B, C)
- `next.config.ts` (CSP directives)
- Delete: `src/data/bca-locations.json`
- Delete: `public/assets/lokasi/` (all three SVGs and the directory)
- Delete: `src/components/ui/border-glow.tsx`, `src/components/ui/border-glow.css`
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):
- **`archive/**` — never modify, move or delete anything under this
  directory.** It is the preserved copy of everything being removed here, it is
  excluded from `tsconfig.json` (`"exclude": ["node_modules", "archive"]`) and
  from ESLint (`eslint.config.mjs:16`), and it is the entire safety net for
  this plan. If a deletion here later needs reverting, `archive/lokasi-bca/`
  is where it comes from.
- `scripts/fetch-bca-locations.mjs` and `scripts/README.md` — developer
  tooling, never imported by the app, and the documented way to regenerate the
  dataset if the feature returns. Deleting them destroys that path for no
  runtime gain. Leave both.
- `.cache/` — gitignored scratch state for the script above.
- `src/proxy.ts:42-44` — the `if (pathname.startsWith("/api/"))` branch is
  currently dead (the three `/api/locations/*` routes were deleted), but it is
  harmless, defensive, and correct for any future route handler. Removing it is
  a behaviour change to the preview gate for zero benefit. Leave it.
- Every other CSP directive in `next.config.ts`. In particular `img-src`'s
  `blob:` and `frame-src`/`script-src`'s Google origins serve reCAPTCHA and
  other live features. Only the two items named in "Current state" change.
- Any live CSS. Regions A, B and C are the complete list.

## Git workflow

- Branch: `advisor/012-remove-dead-code`, branched from whichever of
  `advisor/008-*` / `advisor/011-*` landed last (see "Depends on").
- Commit style follows `git log` — short imperative sentence, no prefix.
  Example from history: `Remove unused LinkIcon/VideoIcon/DocIcon and InfoCategory import`
- Consider one commit per numbered step; the CSS deletion is much easier to
  review on its own.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

Delete the CSS regions **bottom-up (C, then B, then A)**. Each deletion shifts
every line number below it, so working upwards keeps the line numbers in this
plan valid for the regions you have not yet reached. Always confirm you are at
the right place using the **anchor comment**, not the line number alone.

### Step 1: Prove everything is dead before deleting anything

Run each of these and confirm the expected result. Do not proceed past any that
disagrees.

```bash
grep -rn "maplibre-gl" src/ scripts/ --include='*.ts' --include='*.tsx' --include='*.mjs'
```
→ **no output** (no JS/TS import of the library).

```bash
grep -rn "bca-locations" src/ --include='*.ts' --include='*.tsx'
```
→ **no output**.

```bash
grep -rn "border-glow\|BorderGlow" src/ --include='*.ts' --include='*.tsx' --include='*.css' | grep -v "^src/components/ui/border-glow"
```
→ **no output** (nothing outside the module references it).

```bash
grep -rn "assets/lokasi" src/ | grep -v globals.css
```
→ **no output** (only the dead CSS references those icons).

**Verify**: all four commands are silent. If any returns a match, STOP — the
thing is not dead.

### Step 2: Delete CSS region C (bottom of file)

In `src/app/globals.css`, delete from the comment

```css
/* The panel MapLibre raises when a wheel or one-finger drag is refused. */
```

through the closing `}` of `.maplibregl-cooperative-gesture-screen` — i.e. to
the **end of the file** — along with the blank line preceding the comment.

The file must now end with the `prefers-reduced-motion` block that contains
`::view-transition-group(*)`.

**Verify**: `tail -12 src/app/globals.css` → shows the view-transition
reduced-motion block and no `maplibregl` text.

### Step 3: Delete CSS region B

Delete from

```css
/* ---------- Lokasi BCA (LocationSection / LocationFinder / LocationMap) ----------
```

through

```css
.maplibregl-ctrl-attrib a {
  color: var(--color-blue-500);
}
```

inclusive, plus the blank line after it.

The line immediately following the deletion must be the comment beginning
`/* Cross-page navbar continuity (experimental.viewTransition in`. **Confirm
that before saving** — over-deleting here removes the navbar's cross-page
morph.

**Verify**: `grep -c "view-transition-group" src/app/globals.css` → `5`
(4 named groups + the `(*)` wildcard). If it is `0`, you deleted too far —
revert and redo.

### Step 4: Delete CSS region A

Delete from

```css
/* Lokasi BCA — the geolocation priming popover (LocationFinder.tsx), asked
```

through the closing `}` of the `@media (prefers-reduced-motion: reduce)` block
that contains `.geo-primer-panel, .geo-primer-scrim`, plus the blank line
after it.

The line immediately following must be `html.lenis, html.lenis body {`.
**Confirm that before saving** — the `.lenis` rules drive the smooth-scroll
container and are live.

**Verify**: `grep -c "lenis" src/app/globals.css` → at least `5`.

### Step 5: Confirm all dead CSS is gone and nothing live was lost

```bash
grep -n "geo-primer\|maplibregl\|bca-locate\|bca-located\|bca-search-icon\|bca-origin" src/app/globals.css
```
→ **no output**.

```bash
grep -c "product-photo-in-a\|product-copy-swap-a\|html.lenis" src/app/globals.css
```
→ at least `3` (the live rules that sat between the deleted regions).

**Verify**: `wc -l src/app/globals.css` → roughly **1060** lines, down from
1261. A number far from that means you deleted too much or too little.

### Step 6: Tighten the CSP

In `next.config.ts`:

1. Change `"connect-src 'self' https://tiles.openfreemap.org",` to
   `"connect-src 'self'",`
2. Delete the `"worker-src 'self' blob:",` line **and** the three-line comment
   directly above it that begins `// MapLibre GL parses tiles in a Worker`.

Leave every other directive untouched.

**Verify**: `grep -n "openfreemap\|worker-src" next.config.ts` → **no output**.
`grep -n "connect-src" next.config.ts` → shows `"connect-src 'self'",`.

### Step 7: Delete the orphaned files

```bash
git rm src/data/bca-locations.json
git rm -r public/assets/lokasi
git rm src/components/ui/border-glow.tsx src/components/ui/border-glow.css
```

`src/data/` and `src/components/ui/` will both be left empty; git does not
track empty directories, so nothing more is needed. Remove the now-empty
directories from your working tree if they linger.

**Verify**: `ls src/components/ui src/data public/assets/lokasi 2>&1` → all
three report "No such file or directory".

### Step 8: Uninstall the dependency

```bash
npm uninstall maplibre-gl
```

This edits `package.json` and regenerates `package-lock.json`.

**Verify**: `grep -n "maplibre" package.json` → **no output**.
`ls node_modules/maplibre-gl 2>&1` → "No such file or directory".

### Step 9: Confirm the static gates still pass

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0.
3. `npm run build` → exit 0.

**Expected lint baseline**: previously `78 problems (0 errors, 78 warnings)`.
The count **may legitimately drop** here, because `border-glow.tsx` is being
deleted — check whether it contributed any `no-img-element` warnings. A lower
count is fine and expected. **0 errors is required.**

Record the new warning count in your report.

### Step 10: Verify the site is visually unchanged and CSP-clean

Start `npm run dev` and open `http://localhost:3000/id`. (If
`PREVIEW_PASSWORD` is set in `.env.local` you will be redirected to `/login` —
sign in first, or run without that variable.)

**10a — no CSP violations.** Open the devtools console and scroll the whole
page top to bottom.

**Verify**: zero `Content Security Policy` violation messages. Pay attention
around the HaloBCA chat (it loads reCAPTCHA from Google) — if tightening
`connect-src` broke it, a violation naming `google.com` or `gstatic.com`
appears here. That would mean reCAPTCHA needs a `connect-src` origin that the
old `openfreemap` entry was accidentally covering; go to STOP conditions.

**10b — the page is unchanged.** Scroll the full homepage.

**Verify**: hero, product section, promo section (including the confetti),
Soliprio band, news section and footer all render exactly as before. Then open
the mega menu, the mobile menu and the search dropdown, and navigate to
`/tentang-bca` and back.

**Verify**: the navbar's segment pill and tab row still **morph** smoothly
across that navigation rather than hard-swapping. This is what confirms Step 3
did not over-delete the `::view-transition-group` rules.

## Test plan

No test suite exists and this plan does not add one. Verification is:

- Step 1's four greps are silent **before** any deletion
- Step 5's greps confirm dead CSS gone and live CSS retained
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0, 0 errors
- `npm run build` → exit 0
- Step 10a: zero CSP violations across the whole page including HaloBCA chat
- Step 10b: page visually unchanged; navbar morph on `/tentang-bca` still works

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "maplibre" package.json src/` → no output
- [ ] `grep -n "geo-primer\|maplibregl\|bca-origin\|bca-locate" src/app/globals.css` → no output
- [ ] `grep -c "view-transition-group" src/app/globals.css` → `5`
- [ ] `grep -c "html.lenis" src/app/globals.css` → at least `1`
- [ ] `grep -n "openfreemap\|worker-src" next.config.ts` → no output
- [ ] `ls src/components/ui src/data public/assets/lokasi` → all absent
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with **0 errors**
- [ ] `npm run build` exits 0
- [ ] Step 10a: zero CSP violations
- [ ] Step 10b: navbar morph still works on `/tentang-bca`
- [ ] `git status --porcelain` shows **nothing** under `archive/` or `scripts/`
- [ ] `plans/README.md` status row for 012 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any grep in Step 1 returns a match — the thing is not dead, and this plan's
  central assumption ("all of this is unreferenced") is false.
- After Step 3, `grep -c "view-transition-group"` is not `5`. You have deleted
  live CSS. Revert the file and redo from Step 2.
- `npm run build` fails, or typecheck reports a missing module.
- Step 10a shows a CSP violation. Do **not** widen the CSP to make it go away —
  report the exact violation text. Narrowing `connect-src` should be safe, and
  if it is not, that is a genuine finding about what the site actually contacts.
- Anything on the page renders differently, including the navbar morph.
- You find yourself about to touch anything under `archive/` or `scripts/`.

## Maintenance notes

- **If Lokasi BCA ever comes back**: `archive/lokasi-bca/` has the components,
  the map style, the data layer and the API routes.
  `scripts/fetch-bca-locations.mjs` (kept deliberately) regenerates
  `src/data/bca-locations.json`. You would need to `npm install maplibre-gl`,
  restore `public/assets/lokasi/`, restore CSS regions A/B/C from this commit's
  parent, and re-add `connect-src https://tiles.openfreemap.org` plus
  `worker-src 'self' blob:` to the CSP. The `worker-src` line matters — without
  it the map silently never starts, which is what commit `d70d9c5` fixed.
- **What a reviewer should scrutinise**: the `globals.css` diff, specifically
  its boundaries. Three separate regions were removed with live CSS between
  them; the risk in this change is entirely "deleted one line too many". The
  `view-transition-group` count and the navbar-morph check are the two guards.
- **The CSP is now minimal** with respect to network origins: `connect-src
  'self'` only. Any future third-party integration will need its origin added
  explicitly, and will fail loudly in the console if it is not — which is the
  intended behaviour.
- **Deliberately deferred**: `src/proxy.ts:42-44`'s now-dead `/api/` branch was
  left in place as harmless forward-looking defence.
