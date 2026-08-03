# Plan 021: Replace the boilerplate README, document the real conventions, and write the token reference

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> ```bash
> git diff --stat 28729d0..HEAD -- README.md AGENTS.md .env.example src/app/globals.css
> ```
> `src/app/globals.css` is **expected** to have changed — plans 016–020 rewrite
> it, and this plan documents the result. The other three should be untouched;
> if they are not, compare against the excerpts below before proceeding.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: NONE (documentation only — no file under `src/` is modified)
- **Depends on**: `plans/016`–`plans/020`. This plan documents the token system
  those five build. Landing it earlier would document something that does not
  exist yet.
- **Supersedes**: `plans/007-project-docs-and-config.md` — see "Relationship to
  plan 007" below.
- **Category**: docs
- **Planned at**: commit `28729d0`, 2026-08-03

## Why this matters

`README.md` is the untouched `create-next-app` template. That is worse than
having no README, because it is **actively wrong**: it tells a new developer the
project uses the Geist font (it uses BCA Sans), that pages live at
`app/page.tsx` (they live at `src/app/[locale]/page.tsx`), and says nothing
about Supabase, the three locales, the password gate that blocks the entire
site, or the fact that middleware lives in `src/proxy.ts` rather than
`middleware.ts`.

`AGENTS.md` is four lines and captures none of this repo's real conventions —
several of which are load-bearing. Getting the preloader handshake wrong leaves
the entire page invisible, and that constraint is currently documented only in
a comment inside `src/lib/useLayoutVariant.ts`, a file about something else.

And after plans 016–020 land, this repo will have a real design-token system
that exists **only as CSS**. A token system nobody can find is a token system
nobody uses; the next person will paste a hex.

This plan is the one that makes the other five legible to someone who was not
here.

## Relationship to plan 007

`plans/007-project-docs-and-config.md` covered the same ground and is recorded
as `STILL TODO`. It was **partially executed**: its Step 1 (`.env.example`)
landed via plan 015 and is complete. Its Steps 2–4 (README, `AGENTS.md`) did
not.

This plan replaces 007 and extends it with the token reference. When you
finish, mark **007 as `SUPERSEDED by 021`** in `plans/README.md`, not as DONE.

**Do not re-do 007's Step 1.** `.env.example` already exists at the repo root,
is tracked by git, and documents all five variables correctly. Verify it and
leave it alone:

```bash
git ls-files --error-unmatch .env.example && grep -c "=" .env.example
```
→ prints the path and `5`.

## Current state

### `README.md`

Standard `create-next-app` output, 33 lines. Mentions `npm run dev`, Geist,
`app/page.tsx`, and Vercel deployment. Nothing project-specific.

### `AGENTS.md` in full

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
```

`CLAUDE.md` contains only `@AGENTS.md`, which includes the above.

Those `BEGIN:`/`END:` sentinel comments mark a **machine-managed block**. Add
your content *outside* them and do not edit what is between them.

### Verified project facts — use these rather than re-deriving

Every item below was checked against the code at `28729d0`. Cite it as-is.

**Stack**
- Next.js **16.2.12** (App Router), React **19.2.4**, next-intl **4.13.2**,
  Tailwind CSS **4.3.2**, Lenis **1.3.25**, three.js 0.185.1. npm
  (`package-lock.json`). TypeScript strict, `target: ES2017`, path alias
  `@/*` → `./src/*`.
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`.
- **There is no test framework.** Verification is `npm run lint` +
  `npm run typecheck` + `npm run build`.

**Routing and i18n**
- Middleware is **`src/proxy.ts` exporting `proxy()`** — not `middleware.ts`.
  This differs from older Next.js and from most training data. Worth calling
  out explicitly.
- Locales `id` (default, unprefixed), `en`, `zh`, configured in
  `src/i18n/routing.ts` with `localePrefix: "as-needed"`.
- Messages in `messages/{id,en,zh}.json`, **22 top-level namespaces each**,
  currently at parity.

**Fonts**
- BCA Sans via `next/font/local` in `src/app/[locale]/layout.tsx:16-23`. Three
  weights only — 400 / 600 / 700, WOFF2. The comment at lines 12-15 explains
  that italic, 300 and 800 were dropped deliberately because every listed file
  is preloaded into `<head>`.

**Data**
- Supabase's auto-generated REST API over plain `fetch` (no client library),
  in `src/lib/{banners,faq,kurs,megamenu,news,products,promos}.ts`. Each uses
  `next: { revalidate: N }` and falls back to a bundled dataset in
  `src/components/home/*-data.ts`, so no section ever renders empty.
- Schema and RLS policies in `supabase/*.sql`; RLS is enabled with select-only
  `anon` policies. `supabase/README.md` exists and is written in Indonesian.

**Security posture**
- The whole site is gated behind a shared password when `PREVIEW_PASSWORD` is
  set (`src/proxy.ts:26-34`). **When it is unset the gate disappears entirely.**
- CSP and three security headers are set in `next.config.ts:16-52`, with a
  documented dev-only `'unsafe-eval'` relaxation that never ships.
- `/opengraph-bcacoid.png` is deliberately exempt from the gate so link
  previews work.

**Deliberate decisions that look like bugs**
- **84 `<img>` elements, not `next/image`** — the owner declined the conversion
  because the layered subject/background compositions use hand-tuned CSS. The
  84 `@next/next/no-img-element` lint warnings are expected.
- `experimental.viewTransition` is on, powering the navbar's cross-route morph.
- `archive/` holds reference snapshots, is excluded from `tsconfig.json` and
  ESLint, and is imported by nothing.

### The six conventions worth documenting in `AGENTS.md`

1. **The preloader handshake.** `src/components/Preloader.tsx` dispatches a
   one-shot `bca:preloader-done` event, but `.pre-root` stays mounted ~1.35 s
   afterwards. Consumers must use `onPreloaderDone()` — never subscribe by
   hand, never test for `.pre-root`. Getting this wrong leaves the page
   invisible.
2. **`ScrollReveal` scans the DOM once on mount.** A subtree that mounts later
   must not emit `data-reveal`: nothing will observe it, and `globals.css`
   holds `[data-reveal]` at `opacity: 0` forever. Documented today only in
   `src/lib/useLayoutVariant.ts:14-17`.
3. **Animation loops must be parked with `useIsLive`.** The page mounts both
   the mobile and desktop form of several components and hides one with CSS, so
   a hidden component's timers still run unless gated. See `src/lib/useIsLive.ts`.
4. **Fetch-with-bundled-fallback.** Every `src/lib/*.ts` fetcher falls back to
   a bundled dataset. New fetchers must match.
5. **Dates are formatted in `Asia/Jakarta`, explicitly.** See `src/lib/news.ts`.
6. **User-facing strings go through next-intl**, in all three message files,
   and the key sets must stay identical.

To which this plan adds a seventh:

7. **Design tokens, not literals.** After plans 016–020: colors, type,
   elevation and motion are tokens in `@theme`; the pill CTA is
   `btn-base btn-primary`. New code uses them.

### The token system to document (post 016–020)

Read `src/app/globals.css` as it exists **when you run this plan** and document
what is actually there. The expected shape:

- **Color** — core ramps (`neutral-100..900`, `blue-100..800`, `cyan-*`,
  `red-500`) mirroring the Figma "Foundation / Colors" page, plus a semantic
  tier (`--color-primary`, `--color-primary-hover`, `--color-primary-active`,
  `--color-on-primary`).
- **Type** — `--text-eyebrow`, `--text-eyebrow-lg`, `--text-subtitle`,
  `--text-title`, `--text-heading`, `--text-display`, each bundling size, line
  height, letter spacing and weight.
- **Elevation** — `--shadow-card`, `--shadow-panel`, `--shadow-edge-left`,
  `--shadow-scroll-top`, `--shadow-scroll-bottom`, `--shadow-menu`,
  `--shadow-menu-flat`, `--text-shadow-hero`.
- **Motion** — `--ease-entrance`, `--ease-emphasis` (plus Tailwind's stock
  `--ease-in` / `--ease-out` / `--ease-in-out`).
- **Components** — `@utility btn-base`, `btn-primary`, `btn-secondary`.

**Do not copy this list on faith.** Diff it against the file and document
reality; if a plan was partly executed or a name changed, the file wins.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run typecheck` | exit 0, no output |
| Lint | `npm run lint` | exit 0, 0 errors |
| Build | `npm run build` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |
| List env reads | `grep -rho "process\.env\.[A-Z_]*" src/ \| sort -u` | 5 variables |

## Scope

**In scope** (the only files you should create or modify):

- `README.md` (rewrite)
- `AGENTS.md` (extend, **outside** the sentinel markers)
- `docs/design-tokens.md` (create; create the `docs/` directory)

**Out of scope** (do NOT touch, even though they look related):

- **Any file under `src/`.** This is a documentation plan. If writing the docs
  reveals a bug, record it in your report — do not fix it.
- **`.env.example`** — already complete (see "Relationship to plan 007").
- **`.env.local`** — the operator's real local config, gitignored. Read it only
  to confirm variable *names*. **Never copy a value out of it, never quote one,
  never commit it.**
- **The content between `<!-- BEGIN:nextjs-agent-rules -->` and
  `<!-- END:nextjs-agent-rules -->` in `AGENTS.md`** — machine-managed.
- `CLAUDE.md` — its `@AGENTS.md` include already does the right thing.
- `supabase/README.md` — exists, is in Indonesian, and stays as it is.
- `archive/README.md`, `scripts/README.md` — already accurate.
- `plans/` — except this plan's own status row and 007's `SUPERSEDED` row.

## Git workflow

- Branch: `advisor/021-readme-conventions-and-token-reference`
- Commit style: short imperative subject, matching `git log`.
- Do NOT push or open a PR unless the operator instructed it.

## Language

**Write all three documents in English.** This was the operator's explicit
choice. It matches `AGENTS.md`, the `plans/` directory and most source
comments. `supabase/README.md` stays Indonesian; do not translate it, and do
not add a note apologising for the mix.

## Steps

### Step 1: Rewrite `README.md`

Replace the boilerplate entirely. Cover, in roughly this order:

1. **What this is** — one paragraph: a revamp of the BCA (Bank Central Asia)
   homepage; a Next.js App Router site in three locales, currently behind a
   password gate. Say plainly that it is a design exploration, not the
   production bca.co.id.
2. **Getting started** — clone, `npm install`, `cp .env.example .env.local`,
   fill it in, `npm run dev`. State explicitly that **the site works without
   Supabase configured** (bundled fallback data), so a new contributor is not
   blocked on credentials.
3. **Scripts** — `dev`, `build`, `start`, `lint`, `typecheck`, one line each.
   State plainly that **there is no test suite**, and that lint + typecheck +
   build are the verification gates.
4. **Project structure** — a short annotated tree: `src/app/[locale]/`,
   `src/components/`, `src/components/home/`, `src/lib/`, `src/i18n/`,
   `src/fonts/`, `src/proxy.ts`, `messages/`, `supabase/`, `public/assets/`,
   `plans/`, `archive/`, `docs/`. One line each. **Call out `src/proxy.ts`
   specifically** — a developer looking for `middleware.ts` will not find it.
5. **Design system** — a short section pointing at `docs/design-tokens.md`,
   with the one-sentence rule: colors, type, elevation, motion and the pill CTA
   are tokens; new code uses them rather than literals.
6. **How data works** — the Supabase-REST-with-bundled-fallback pattern, the
   `revalidate` windows, and that the SQL lives in `supabase/`.
7. **Localisation** — three locales, `localePrefix: "as-needed"`, where
   messages live, and that key sets must stay at parity.
8. **The preview gate** — how `PREVIEW_PASSWORD` works and, importantly, that
   **leaving it unset makes the site fully public**.
9. **Conventions** — a short list pointing at `AGENTS.md` for detail.

Keep it scannable. Do not pad it — a bloated README is only marginally better
than a wrong one.

**Verify**:
```bash
grep -ci "geist" README.md          # → 0
grep -c "create-next-app" README.md # → 0
```
Then **execute every command the README contains, verbatim**, and confirm each
works. Then `ls` every path in the structure tree and confirm each exists.

### Step 2: Extend `AGENTS.md`

**Append below the `<!-- END:nextjs-agent-rules -->` marker.** Do not modify
the existing block.

Document the seven conventions from "Current state", each with: the rule, one
sentence on why it exists, and a pointer to the canonical example. Also state:
the verification commands, that there is no test suite, the `next/image`
decision (so no agent "helpfully" converts the `<img>` tags), and that
middleware is `src/proxy.ts`.

**Prefer citing a symbol over a bare line number** — `onPreloaderDone` in
`src/components/Preloader.tsx` survives edits; `Preloader.tsx:182` does not.
Use line numbers only where there is no symbol to name.

Aim for 50–80 lines. Rules and pointers, not prose.

**Verify**:
```bash
grep -c "BEGIN:nextjs-agent-rules" AGENTS.md  # → 1
git diff AGENTS.md                             # → only additions after the END marker
```
Then check **every** pointer you cited resolves to what you claim. A stale
pointer in an agent-facing doc is actively harmful — it sends the next agent to
the wrong place with confidence.

### Step 3: Write `docs/design-tokens.md`

Create the `docs/` directory and this file. It is the reference a designer or a
new developer opens to answer "what do I use for X?".

Structure:

1. **The two tiers** — core primitives (what a value *is*, mirroring Figma) vs
   semantic tokens (what it is *for*). One short paragraph. The rule that
   follows: call sites use semantic tokens; primitives are for defining
   semantic ones.
2. **Color** — a table of every token with its value and what it is for.
   Include the note that the core ramps mirror the Figma "Foundation / Colors"
   page (node 1578-27737) and must not be changed without changing Figma, while
   the semantic tier is where new states belong.
3. **Type** — a table: token, size, line height, letter spacing, weight, and
   where it is used. **Include the derivation rule**, because it is the part
   that prevents future drift: tracking is −0.02em for everything 18px and up,
   +0.15em for uppercase eyebrows. Note that Tailwind's stock `text-xs`…
   `text-2xl` scale still exists and is still correct for genuine one-offs.
4. **Elevation & effects** — the shadow tokens, and the rule that nine
   single-use shadows remain deliberately inline, with the promotion rule: the
   **second** call site promotes a value to a token, not the first.
5. **Motion** — `ease-entrance` for arrivals, `ease-emphasis` for fixed-distance
   travel, stock `ease-in` for exits. Note that durations are deliberately not
   tokenized.
6. **Components** — `btn-base` + `btn-primary` / `btn-secondary`, with a copyable
   example. Document the three deliberate exceptions (`CookieBanner.tsx:174`,
   `:181`, `HeroSection.tsx:20`) and why, so nobody "finishes the job".
7. **How to add a token** — a short procedure: add to `@theme` in
   `src/app/globals.css`, run `npm run build`, use it. Plus the two rules that
   keep the system honest: **a token needs at least two call sites**, and
   **derive from the existing rule rather than inventing a new value**.
8. **Known open questions** — carry forward the one plan 020 raised:
   `CookieBanner.tsx:181` hovers to `blue-400` where every other primary button
   hovers to `primary-hover`. Record it as unresolved; do not resolve it.

Every value in this file must be **read out of `src/app/globals.css`**, not
copied from this plan. If they disagree, the CSS is right and your reading of
it is what goes in the doc.

**Verify**: for each token you document, confirm it exists:
```bash
grep -c "\-\-color-primary" src/app/globals.css
grep -c "\-\-text-heading" src/app/globals.css
grep -c "\-\-ease-entrance" src/app/globals.css
grep -c "btn-primary" src/app/globals.css
```
→ all ≥ 1. Any token you document that does not appear in the file is a
fabrication; remove it.

### Step 4: Final consistency pass

Re-read all three documents together and confirm they do not contradict each
other or the code. Specifically:

```bash
# script list matches package.json
node -p "Object.keys(require('./package.json').scripts).join(' ')"

# env var list matches .env.example
grep -rho "process\.env\.[A-Z_]*" src/ | sort -u

# locale list matches routing
grep -A3 "defineRouting" src/i18n/routing.ts
```

Every script, variable and locale mentioned in the docs must match these
outputs exactly.

**Verify**:
```bash
npm run lint && npm run typecheck && npm run build
```
→ all exit 0. (Nothing under `src/` changed, so this only confirms you did not
accidentally break something.)

### Step 5: Update the plans index

In `plans/README.md`:

- Set plan 021's status to DONE.
- Set plan **007**'s status to `SUPERSEDED by 021` — **not** DONE. Add a
  one-line note that its `.env.example` step landed via plan 015 and its
  README/`AGENTS.md` steps were completed here.

## Test plan

There is nothing executable to test. Verification is:

1. Every command written in `README.md` has been **executed verbatim** and works.
2. Every path in the structure tree exists (`ls` each).
3. Every pointer in `AGENTS.md` resolves to what it claims.
4. Every token in `docs/design-tokens.md` appears in `src/app/globals.css`
   with the value documented.
5. `.env.example` lists exactly the variables the code reads — no more, no less.
6. **No real secret value appears in any of the three files.** Check by eye
   before committing.
7. The Step 4 consistency outputs match the docs.

The most valuable check, if the operator can arrange it: **hand the README to
someone who has never seen this repo and have them set it up from scratch.** If
they get stuck, the README is wrong.

## Done criteria

ALL must hold:

- [ ] `grep -ci "geist" README.md` → `0`
- [ ] `grep -c "create-next-app" README.md` → `0`
- [ ] Every command in `README.md` has been executed and works
- [ ] `grep -c "BEGIN:nextjs-agent-rules" AGENTS.md` → `1`, and `git diff AGENTS.md`
      shows only additions after the END marker
- [ ] `AGENTS.md` documents all seven conventions with pointers that resolve
- [ ] `docs/design-tokens.md` exists and every token in it appears in
      `src/app/globals.css`
- [ ] `docs/design-tokens.md` records the `CookieBanner` `blue-400` open question
- [ ] Every variable from `grep -rho "process\.env\.[A-Z_]*" src/` appears in
      `.env.example`
- [ ] No real credential value appears in any file you wrote
- [ ] `git diff --name-only` lists only `README.md`, `AGENTS.md`,
      `docs/design-tokens.md` and `plans/README.md`
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` all exit 0
- [ ] `plans/README.md`: 021 marked DONE, **007 marked SUPERSEDED by 021**

## STOP conditions

Stop and report back (do not improvise) if:

- **Plans 016–020 have not all landed.** Check with
  `grep -c "color-primary\|text-heading\|ease-entrance\|btn-primary" src/app/globals.css`.
  If the tokens are absent, `docs/design-tokens.md` would document a system
  that does not exist. Report which plans are missing.
- The token names in `globals.css` differ from the list in "Current state".
  Document what is actually there and **note the discrepancy in your report** —
  it means a plan was executed with a deviation that should be visible.
- A pointer you want to cite does not resolve — the code has moved. Find the new
  location and verify it rather than citing the old one.
- You cannot determine what an environment variable does from the code. Ask
  rather than guessing; a confidently wrong `.env.example` is worse than none.
- You are tempted to fix a bug you noticed while documenting. Record it in your
  report instead.
- You find a real credential in `.env.local` and are unsure whether a name you
  want to document would expose it. Document names only, never values — and if
  in doubt, ask.
- You are tempted to translate `supabase/README.md` or to edit anything under
  `src/`. Both are out of scope.

## Maintenance notes

- **`.env.example` must be updated whenever a new `process.env.*` read is
  added.** The `grep` in Done criteria is the check; it is worth running in
  review.
- `AGENTS.md` pointers drift as code moves. Prefer symbols over line numbers —
  this is stated in Step 2 and is the single highest-value habit for keeping an
  agent-facing doc true.
- The `BEGIN:`/`END:` block in `AGENTS.md` looks machine-generated and may be
  rewritten by tooling. Never put hand-written content inside it.
- **`docs/design-tokens.md` is the file most likely to go stale**, because
  `globals.css` will keep growing. The `grep`-based done criteria in this plan
  are reusable as a periodic check — re-running them is how you find drift.
- Three files claim there is no test framework (`README.md`, `AGENTS.md`, and
  every plan in `plans/`). If one is ever added, update all of them.
- A reviewer should scrutinise: that no secret leaked, that the README's
  commands were actually *run* rather than assumed, that every `AGENTS.md`
  pointer resolves, and that `docs/design-tokens.md` was written from the CSS
  rather than copied from this plan.
