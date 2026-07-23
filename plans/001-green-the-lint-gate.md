# Plan 001: Get `npm run lint` to zero errors and add a `typecheck` script

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat cf1b0f5..HEAD -- src/ package.json eslint.config.mjs`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none — this is the foundation every other plan verifies against
- **Category**: dx
- **Planned at**: commit `cf1b0f5`, 2026-07-22

## Why this matters

`npm run lint` is the only automated quality gate in this repository — there is
no test suite and no CI. It currently reports **14 errors and 85 warnings**, so
it always exits non-zero. A gate that is permanently red cannot tell anyone
whether a change broke something: new errors are indistinguishable from the 14
that were already there. Every other plan in `plans/` ends with "lint is clean"
as its safety check, and none of them can mean anything until this one lands.

The goal is a **green gate with zero behaviour change**. You are not refactoring
anything. Where the flagged pattern is genuinely wrong, fix it; where the
pattern is correct and the rule is over-eager, suppress it with a written
justification. Both outcomes are acceptable. Changing what the code *does* is
not.

## Current state

Run `npx eslint .` to see the full list. It breaks down as:

| Count | Rule | Severity |
|-------|------|----------|
| 81 | `@next/next/no-img-element` | warning |
| 10 | `react-hooks/set-state-in-effect` | **error** |
| 4 | `react-hooks/refs` | **error** |
| 3 | `@typescript-eslint/no-unused-vars` | warning |
| 1 | `react-hooks/exhaustive-deps` | warning |
| 1 | unused eslint-disable directive | warning |

### The 14 errors, by file

```
archive/PercentGlass.tsx:34          react-hooks/refs
src/lib/useAutoplayProgress.ts:55    react-hooks/refs
src/lib/useAutoplayProgress.ts:65    react-hooks/refs
src/components/home/ProductSection.tsx:503   react-hooks/refs
src/components/SmoothScroll.tsx:28           react-hooks/set-state-in-effect
src/components/home/CookieBanner.tsx:47      react-hooks/set-state-in-effect
src/components/home/HeroWidget.tsx:229       react-hooks/set-state-in-effect
src/components/home/HeroWidget.tsx:269       react-hooks/set-state-in-effect
src/components/home/MobileHeroWidget.tsx:300 react-hooks/set-state-in-effect
src/components/home/MobileMenu.tsx:83        react-hooks/set-state-in-effect
src/components/home/MobileMenu.tsx:90        react-hooks/set-state-in-effect
src/components/home/ProductSection.tsx:531   react-hooks/set-state-in-effect
src/components/home/ProductSection.tsx:1109  react-hooks/set-state-in-effect
src/lib/useLayoutVariant.ts:27               react-hooks/set-state-in-effect
```

### Excerpt — the `react-hooks/refs` pattern (`src/lib/useAutoplayProgress.ts:52-65`)

```ts
  const elapsedRef = useRef(0);
  // Keep the latest callback without re-subscribing the loop each render.
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;              // <-- line 55, ERROR

  const write = (offset: number) => {
    const refs = Array.isArray(progressRef) ? progressRef : [progressRef];
    for (const ref of refs) {
      if (ref.current) ref.current.style.strokeDashoffset = String(offset);
    }
  };
  // Kept in a ref so the loop below doesn't re-subscribe on every render.
  const writeRef = useRef(write);
  writeRef.current = write;                      // <-- line 65, ERROR
```

This is the "latest ref" pattern. Assigning a ref *during render* is what the
rule objects to: React may discard and replay a render, so the write is not
guaranteed to correspond to the committed output. The fix is to move the
assignment into an effect with no dependency array, which runs after every
commit.

### Excerpt — the `react-hooks/set-state-in-effect` pattern (`src/lib/useLayoutVariant.ts:22-30`)

```ts
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_PREFIX + section) as T | null;
    if (stored && allowed.includes(stored)) setVariant(stored);   // <-- line 27, ERROR
  }, [section]);
```

This one is **correct as written**. Reading `localStorage` during render would
break server rendering and cause a hydration mismatch; deferring it to an effect
is precisely the right call, and the file's own comment (lines 14-17) explains
why. The rule is warning about a real hazard class that does not apply here.
This is a **suppress-with-justification** case, not a fix case.

Nearly all ten `set-state-in-effect` errors are this same shape: a mount-time
read of `localStorage`, a DOM measurement, or an external-system handle being
published into state. Judge each one individually using the decision rule below.

### Repo conventions to match

- Comments in this repo explain **why**, not what, and are written in full
  sentences. Match that register in every justification you write. See
  `src/lib/useAutoplayProgress.ts:12-17` and `src/lib/useIsLive.ts:3-18` for the
  house style.
- Existing justified suppressions use the trailing `--` reason form. Example
  already in the tree at `src/components/home/ProductSection.tsx:534`:
  ```ts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ```
  Improve on that: always include a `-- reason` clause in the ones you add.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npx eslint .` | exit 0, `0 problems` or warnings only |
| Lint (errors only) | `npx eslint . --quiet` | exit 0, no output |
| Typecheck | `npx tsc --noEmit` | exit 0, no output |
| Dev server | `npm run dev` | starts on :3000 |

There is **no test suite** in this repository. Do not try to run one; do not add
one in this plan.

## Scope

**In scope** (the only files you should modify):
- `eslint.config.mjs`
- `package.json` (add one script)
- `src/lib/useAutoplayProgress.ts`
- `src/lib/useLayoutVariant.ts`
- `src/components/SmoothScroll.tsx`
- `src/components/home/CookieBanner.tsx`
- `src/components/home/HeroWidget.tsx`
- `src/components/home/MobileHeroWidget.tsx`
- `src/components/home/MobileMenu.tsx`
- `src/components/home/ProductSection.tsx`

**Out of scope** (do NOT touch, even though they look related):
- **Converting `<img>` to `next/image`.** This produces 81 of the 99 problems
  and it is tempting. The repository owner has explicitly ruled it out: those
  images sit in hand-tuned layered compositions and `next/image` risks shifting
  the layout. Leave every `<img>` exactly as it is. If you want the warning
  count lower, that is not your call to make here.
- `archive/PercentGlass.tsx` — dead code, already excluded from `tsconfig.json`.
  You will exclude it from eslint too (Step 1), but do not edit the file.
- Any change to component behaviour, timing, animation, styling or markup.
- Adding tests, a formatter, a pre-commit hook or CI config.

## Git workflow

- Branch: `advisor/001-green-the-lint-gate`
- Commit style matches this repo's history — short imperative subject, no
  scope prefix required. Examples from `git log`: `Add Soliprio section,
  dominant-color image util`, `Fix HaloBCA chat close/captcha handling`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Exclude `archive/` from linting

`tsconfig.json` already excludes `archive/` (see its `"exclude"` array), but
`eslint.config.mjs` does not, so dead code is producing one of the 14 errors.
Add `"archive/**"` to the `globalIgnores([...])` call in `eslint.config.mjs`.

**Verify**: `npx eslint . 2>&1 | grep -c "archive/"` → `0`

### Step 2: Add a `typecheck` script

In `package.json`, add to `"scripts"`:

```json
"typecheck": "tsc --noEmit"
```

Keep the existing `dev`, `build`, `start` and `lint` entries untouched.

**Verify**: `npm run typecheck` → exit 0, no output

### Step 3: Fix the four `react-hooks/refs` errors properly

These have a clean, correct fix — do **not** suppress them.

In `src/lib/useAutoplayProgress.ts`, replace the two during-render assignments
(lines 55 and 65) with a single post-commit effect placed immediately after the
`writeRef` declaration:

```ts
  // Refreshed after each commit rather than during render: assigning a ref
  // mid-render is not safe if React discards and replays the render, and the
  // rAF loop below only ever reads these between frames.
  useEffect(() => {
    onAdvanceRef.current = onAdvance;
    writeRef.current = write;
  });
```

Note the deliberate absence of a dependency array — this must run after *every*
commit so the refs never go stale.

In `src/components/home/ProductSection.tsx:503`, apply the same treatment to
`onSelectRef.current = onSelect`.

**This must not change behaviour.** The rAF loop in `useAutoplayProgress` reads
`writeRef.current`/`onAdvanceRef.current` only from inside `requestAnimationFrame`
callbacks, which always run after the commit that the effect belongs to. The
carousels must autoplay and their progress rings must animate exactly as before.

**Verify**:
- `npx eslint . 2>&1 | grep -c "react-hooks/refs"` → `0`
- `npm run typecheck` → exit 0
- Manual: `npm run dev`, open http://localhost:3000, confirm the hero carousel
  still auto-advances and its dot progress ring still fills smoothly. If a
  preview password is set you will need it (see `.env.local`).

### Step 4: Triage the ten `react-hooks/set-state-in-effect` errors

Go through them **one at a time**, in the order listed in "Current state". For
each, apply this decision rule:

- **If the effect sets state from a source that genuinely cannot be read during
  render** — `localStorage`, `window.matchMedia`, a DOM measurement
  (`getBoundingClientRect`, `offsetWidth`), or an external instance created in
  the effect — then the code is correct. Suppress it:
  ```ts
  // eslint-disable-next-line react-hooks/set-state-in-effect -- <specific reason>
  ```
  The reason must be specific to that call site. "Reads localStorage, which is
  unavailable during server render" is a good reason. "Needed" is not.

- **If the effect sets state from props or other state already available during
  render**, that is a genuine cascading-render bug. Derive the value during
  render instead of storing it in state. **If you find one of these, do not
  guess** — note the file and line and report it, because changing it can alter
  render timing and this repo has no tests to catch a regression.

Known assessments to save you time (still confirm each yourself):
- `src/lib/useLayoutVariant.ts:27` — suppress. Reads `localStorage`.
- `src/components/SmoothScroll.tsx:28` — suppress. Publishes the Lenis instance,
  which is constructed inside the effect after a `matchMedia` check.
- `src/components/home/CookieBanner.tsx:47` — suppress. Gates on
  `localStorage` via `hasDecided()`.

While you are in `src/lib/useLayoutVariant.ts`, also remove the now-unused
`eslint-disable-next-line react-hooks/exhaustive-deps` on line 28 — eslint
reports it as an unused directive. Removing it will surface a genuine
`exhaustive-deps` **warning** about `allowed`; leave that warning in place
(warnings do not fail the gate) and do not add `allowed` to the dependency
array, because the comment on lines 28-29 correctly explains it is an inline
literal that would re-run forever.

**Verify** after each file: `npx eslint . --quiet` → error count strictly
decreasing. After all ten: `npx eslint . --quiet` → exit 0, no output.

### Step 5: Clear the three unused-variable warnings

Run `npx eslint . 2>&1 | grep "no-unused-vars"` to locate them. Delete the
unused bindings outright — do not rename them to `_foo` and do not disable the
rule. If a "removal" would delete anything other than a plainly dead local
binding or an unused import, stop and report instead.

**Verify**: `npx eslint . 2>&1 | grep -c "no-unused-vars"` → `0`

### Step 6: Confirm the gate is green end to end

**Verify**:
- `npm run lint` → exit 0
- `npm run typecheck` → exit 0
- `npx eslint .` → the only remaining output is the 81
  `@next/next/no-img-element` warnings (expected and deliberately out of scope)
- `git diff --stat` → no file outside the "In scope" list appears

## Test plan

There is no test framework in this repository and this plan does not add one.
Verification is:

1. `npm run lint` exits 0.
2. `npm run typecheck` exits 0.
3. **Manual visual check** — the repository owner's hard requirement is that
   the site looks and behaves identically. With `npm run dev` running, load
   http://localhost:3000 and confirm:
   - the intro preloader plays and lifts as before;
   - the hero banner carousel auto-advances with its progress ring filling;
   - the product carousel auto-advances and the category tabs still switch;
   - the mobile menu opens and closes and locks page scroll while open
     (check at a narrow viewport width);
   - the cookie banner still appears on a fresh profile (clear `localStorage`).

If any of those differ from `main`, revert and report.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npx eslint . --quiet` produces no output
- [ ] `npm run typecheck` is present in `package.json` scripts
- [ ] `npx eslint . 2>&1 | grep -c "archive/"` → `0`
- [ ] `git diff --name-only` lists only files from the "In scope" section
- [ ] `git diff` contains **zero** changes to JSX markup, CSS classes or
      animation timing constants
- [ ] Every `eslint-disable` line you added has a `-- <reason>` clause
- [ ] Manual visual check above passes
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed since `cf1b0f5` and its
  content no longer matches the excerpts above.
- A `set-state-in-effect` error turns out to be the genuine cascading-render
  kind (state derived from props/state available at render time). Report it;
  fixing it belongs in its own plan with its own visual verification.
- Fixing the `react-hooks/refs` errors changes carousel autoplay behaviour in
  any visible way.
- You find yourself wanting to modify an `<img>` tag. That is explicitly out of
  scope; the whole point of this plan is a green gate with no visual change.
- The error count stops decreasing after two attempts on the same file.

## Maintenance notes

- The 81 `@next/next/no-img-element` warnings are deliberate, not neglect. If
  someone later decides to adopt `next/image`, it should be a separate,
  screenshot-verified change — the images sit in layered subject/background
  compositions with hand-tuned CSS.
- The `useEffect` with no dependency array added in Step 3 is intentional and
  must stay that way. Anyone "tidying" it by adding `[]` will silently freeze
  the carousel callbacks at their first-render values.
- Once this is green, consider wiring `npm run lint && npm run typecheck` into
  a pre-commit hook or CI — but that is deliberately deferred out of this plan
  so the gate can be proven green first.
- A reviewer should scrutinise: that no suppression hides a real bug, that every
  suppression carries a specific reason, and that the diff contains no markup or
  styling changes at all.
