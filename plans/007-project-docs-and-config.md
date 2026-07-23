# Plan 007: Replace the boilerplate README, add `.env.example`, and document the real conventions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat cf1b0f5..HEAD -- README.md AGENTS.md src/app/[locale]/layout.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (but written to describe the repo *after* plans 001–006;
  land it last so it documents reality)
- **Category**: docs
- **Planned at**: commit `cf1b0f5`, 2026-07-22

## Why this matters

Three related gaps, all cheap, all currently costing real time.

**1. `README.md` is the untouched create-next-app boilerplate.** It is not merely
absent — it is *actively wrong*, which is worse. It tells the reader the project
uses the Geist font (it uses BCA Sans), that pages live at `app/page.tsx` (they
live at `src/app/[locale]/page.tsx`), and says nothing about Supabase, the
three-locale routing, or the password gate that blocks the entire site.

**2. There is no `.env.example`.** The app reads **five** environment variables,
and the only place they are written down is `.env.local` — which is gitignored,
so a fresh clone cannot see it. One of the five, `NEXT_PUBLIC_SITE_URL`, is not
documented *anywhere*, and its absence silently defaults `metadataBase` to
`https://www.bca.co.id`. That means preview deployments emit Open Graph and
canonical URLs pointing at the **real BCA production site**.

**3. `AGENTS.md` is four lines and captures none of the repo's real
conventions.** This repository is worked on with AI coding agents (hence
`AGENTS.md` and `CLAUDE.md`), and it has several strong, non-obvious conventions
that are currently documented only inside unrelated source files. The preloader
handshake is the sharpest example: getting it wrong leaves the entire page
invisible (that is what `plans/002-fix-preloader-done-race.md` fixes), and the
constraint is written down in a comment inside `src/lib/useLayoutVariant.ts`, a
file about something else entirely.

## Current state

### `README.md`

Standard create-next-app output. Mentions `npm run dev`, Geist, `app/page.tsx`,
and Vercel deployment. Nothing project-specific.

### `AGENTS.md` in full

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
```

`CLAUDE.md` contains only `@AGENTS.md`.

Note the `BEGIN:`/`END:` sentinel comments — that block appears to be
machine-managed. **Add your content outside those markers, and do not edit
what is between them.**

### The five environment variables

```
process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY   src/components/home/HaloBcaChat.tsx:12
process.env.NEXT_PUBLIC_SITE_URL             src/app/[locale]/layout.tsx:38
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY    src/lib/*.ts
process.env.NEXT_PUBLIC_SUPABASE_URL         src/lib/*.ts
process.env.PREVIEW_PASSWORD                 src/proxy.ts:17, login/page.tsx:10
```

`.env.local` documents four of them. `NEXT_PUBLIC_SITE_URL` is documented
nowhere.

`src/app/[locale]/layout.tsx:38`:

```ts
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bca.co.id"),
```

### Verified project facts to write up

Gathered during the audit — use these rather than re-deriving:

- **Stack**: Next.js 16.2.10 (App Router), React 19.2.4, next-intl 4.13.2,
  Tailwind CSS 4, Lenis 1.3.25. Exactly five runtime dependencies. TypeScript
  strict. npm (there is a `package-lock.json`).
- **Middleware lives at `src/proxy.ts`** and exports `proxy()` — not
  `middleware.ts`. This differs from older Next.js and from most training data.
- **Locales**: `id` (default, unprefixed), `en`, `zh`, configured in
  `src/i18n/routing.ts` with `localePrefix: "as-needed"`. Messages in
  `messages/{id,en,zh}.json`, currently 171 keys each with zero drift.
- **Fonts**: BCA Sans, loaded via `next/font/local` in
  `src/app/[locale]/layout.tsx:16-23`, three weights only (400/600/700), WOFF2.
- **Data fetching**: Supabase's auto-generated REST API over plain `fetch`
  (no client library) in `src/lib/{products,promos,news,banners,kurs}.ts`, each
  with `next: { revalidate: N }` and a bundled fallback dataset in
  `src/components/home/*-data.ts`. Schema and RLS policies in `supabase/*.sql`;
  RLS is enabled with select-only `anon` policies.
- **The whole site is gated** behind a shared password when `PREVIEW_PASSWORD`
  is set. When it is unset the gate disappears entirely.
- **Scripts**: `dev`, `build`, `start`, `lint` — plus `typecheck` once
  `plans/001-green-the-lint-gate.md` lands.
- **There is no test framework.** Verification is `npm run lint` and
  `npm run typecheck`.
- **Images use raw `<img>` deliberately, not `next/image`** — 84 of them. The
  owner has explicitly ruled out converting them because the layered
  subject/background compositions use hand-tuned CSS. The 81
  `@next/next/no-img-element` lint warnings are expected.

### The non-obvious conventions worth documenting

1. **The preloader handshake.** `src/components/Preloader.tsx` dispatches a
   one-shot `bca:preloader-done` event, but `.pre-root` stays mounted ~1.35 s
   afterwards. Consumers must use `onPreloaderDone()` (added by plan 002) —
   never subscribe by hand, never test for `.pre-root`.
2. **`ScrollReveal` scans the DOM once on mount.** A subtree that mounts later
   must not emit `data-reveal`, because nothing will ever observe it and
   `globals.css` holds `[data-reveal]` at `opacity: 0` forever. Documented today
   only in `src/lib/useLayoutVariant.ts:14-17`.
3. **Animation loops must be parked with `useIsLive`.** The page mounts both the
   mobile and desktop form of several components and hides one with CSS, so a
   hidden component's timers still run unless gated. See `src/lib/useIsLive.ts`.
4. **Fetch-with-bundled-fallback.** Every `src/lib/*.ts` fetcher falls back to a
   bundled dataset so no section ever renders empty. New fetchers must match.
5. **Dates are formatted in `Asia/Jakarta`, explicitly.** See `src/lib/news.ts`.
6. **User-facing strings go through next-intl**, in all three message files, and
   the key sets must stay identical.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |

## Scope

**In scope** (the only files you should modify or create):
- `README.md` (rewrite)
- `.env.example` (create)
- `AGENTS.md` (extend, outside the sentinel markers)

**Out of scope** (do NOT touch, even though they look related):
- **Any file under `src/`.** This is a documentation plan. If writing the docs
  reveals a bug, record it in your report — do not fix it here.
- **`.env.local`** — it is the operator's real local config and is gitignored.
  Read it to confirm variable *names*; never copy a value out of it, and never
  commit it.
- **The content between the `BEGIN:nextjs-agent-rules` / `END:` markers in
  `AGENTS.md`** — machine-managed.
- `CLAUDE.md` — its `@AGENTS.md` include already does the right thing.
- `supabase/README.md` — already exists and is out of scope here.

## Git workflow

- Branch: `advisor/007-project-docs-and-config`
- Commit style: short imperative subject, matching `git log`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `.env.example`

Create `.env.example` at the repo root documenting **all five** variables, with
**placeholder values only** — never a real secret, and never a value copied out
of `.env.local`.

Structure it with a comment above each entry covering: what it does, whether it
is required, and what happens if it is omitted. For example:

```bash
# Gates the entire site behind a shared password (see src/proxy.ts).
# Leave unset to disable the gate completely — the site becomes fully public.
PREVIEW_PASSWORD=

# Supabase project REST endpoint and anon key (Project Settings → API).
# Both must be set together. If either is missing, every section falls back to
# its bundled dataset and the site still renders.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Canonical origin used for metadataBase — Open Graph images and canonical URLs.
# IMPORTANT: if unset this defaults to https://www.bca.co.id, so preview
# deployments will advertise the real production site in their link previews.
# Set it to the preview deployment's own origin.
NEXT_PUBLIC_SITE_URL=

# Google reCAPTCHA v2 (checkbox) site key for the HaloBCA chat entry form.
# If unset, the code falls back to Google's published test key, which always
# passes and is never production-safe.
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

**Verify**:
- `.env.example` exists and is **not** gitignored:
  `git check-ignore .env.example` → exits non-zero (not ignored)

  Note: `.gitignore` currently contains `.env*`, which **will** ignore
  `.env.example`. Add a negation line so the example is trackable:
  ```
  !.env.example
  ```
  This is the one permitted edit outside the in-scope list; make it minimal.
- `git status --short` shows `.env.example` as a new untracked/staged file
- `grep -c "=$" .env.example` → `5` (every key present, every value empty)
- **`git diff` contains no real credential values.** Check this by eye before
  committing.

### Step 2: Rewrite `README.md`

Replace the boilerplate entirely. Cover, in roughly this order:

1. **What this is** — one paragraph: a revamp of the BCA (Bank Central Asia)
   homepage; a Next.js App Router site in three locales, currently behind a
   password gate.
2. **Getting started** — clone, `npm install`, `cp .env.example .env.local`,
   fill it in, `npm run dev`. Say explicitly that the site works *without*
   Supabase configured (bundled fallback data) so a new contributor is not
   blocked.
3. **Scripts** — `dev`, `build`, `start`, `lint`, `typecheck`, with one line
   each on what they are for. State plainly that **there is no test suite**, and
   that lint + typecheck are the verification gates.
4. **Project structure** — a short annotated tree covering `src/app/[locale]/`,
   `src/components/home/`, `src/lib/`, `src/i18n/`, `messages/`, `supabase/`,
   `public/assets/`, and `src/proxy.ts`. One line per entry.
5. **How data works** — the Supabase-REST-with-bundled-fallback pattern, the
   `revalidate` windows, and where the SQL lives.
6. **Localisation** — the three locales, `localePrefix: "as-needed"`, where
   messages live, and that key sets must stay in parity.
7. **The preview gate** — how `PREVIEW_PASSWORD` works and, importantly, that
   leaving it unset makes the site fully public.
8. **Conventions** — a short list pointing at `AGENTS.md` for the detail.

Keep it scannable. Do not pad it; a wrong or bloated README is worse than a
short accurate one.

**Verify**:
- `grep -ci "geist" README.md` → `0`
- `grep -c "create-next-app" README.md` → `0`
- Every command in the README actually runs. Execute each one.
- Every path in the structure tree exists. Spot-check with `ls`.

### Step 3: Extend `AGENTS.md` with the real conventions

**Append below the `<!-- END:nextjs-agent-rules -->` marker.** Do not modify the
existing block.

Document the six conventions listed in "Current state", each with: the rule, one
sentence on why it exists, and a `file:line` pointer to the canonical example.
Also state the verification commands (`npm run lint`, `npm run typecheck`), that
there is no test suite, and the `next/image` decision so no agent "helpfully"
converts the `<img>` tags.

Aim for something an agent can act on — rules and pointers, not prose. Roughly
40–70 lines.

**Verify**:
- `grep -c "BEGIN:nextjs-agent-rules" AGENTS.md` → `1` (marker intact)
- The original four-line block is byte-identical:
  `git diff AGENTS.md` shows only additions after the END marker
- Every `file:line` reference you cite resolves to what you claim. Check each
  one — a stale pointer in an agent-facing doc is actively harmful.

### Step 4: Final consistency pass

Re-read all three files together and confirm they do not contradict each other
or the code. In particular: the script list matches `package.json`, the env var
list matches `grep -rho "process\.env\.[A-Z_]*" src/ | sort -u`, and the locale
list matches `src/i18n/routing.ts`.

**Verify**:
```bash
grep -rho "process\.env\.[A-Z_]*" src/ | sort -u
```
→ every variable listed appears in `.env.example`

## Test plan

There is nothing executable to test here. Verification is:

1. Every command in the README runs successfully when executed verbatim.
2. Every file path mentioned exists (`ls` each one).
3. Every `file:line` citation in `AGENTS.md` points at what it claims.
4. `.env.example` lists exactly the variables the code reads — no more, no less.
5. No real secret value appears in any of the three files.

The most valuable check: **hand the README to someone who has never seen this
repo and have them set it up from scratch.** If they get stuck, the README is
wrong.

## Done criteria

ALL must hold:

- [ ] `.env.example` exists, is tracked by git, and documents all five variables
      with empty placeholder values
- [ ] `git check-ignore .env.example` exits non-zero
- [ ] No real credential value appears in `.env.example`, `README.md` or
      `AGENTS.md`
- [ ] `grep -ci "geist" README.md` → `0`
- [ ] `grep -c "create-next-app" README.md` → `0`
- [ ] Every command in `README.md` has been executed and works
- [ ] `AGENTS.md` retains its original sentinel block unmodified and documents
      the six conventions with valid `file:line` pointers
- [ ] Every variable from `grep -rho "process\.env\.[A-Z_]*" src/` appears in
      `.env.example`
- [ ] `git diff --name-only` lists only `README.md`, `AGENTS.md`,
      `.env.example` and `.gitignore`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `AGENTS.md` or `src/app/[locale]/layout.tsx` changed
  since `cf1b0f5` in a way that contradicts the facts above.
- A `file:line` pointer you want to cite does not resolve — the code has moved.
  Find the new location and verify it rather than citing the old one.
- You are tempted to fix a bug you noticed while documenting. Record it in your
  report instead.
- You cannot determine what an environment variable does from the code. Ask
  rather than guessing — a confidently wrong `.env.example` is worse than none.
- Plans 001–006 have not landed and you are unsure whether to document current
  or intended behaviour. **Document what is true right now**, and note the
  discrepancy in your report.

## Maintenance notes

- `.env.example` must be updated whenever a new `process.env.*` read is added.
  The `grep` in "Done criteria" is the check; it is worth running in review.
- `AGENTS.md`'s `file:line` pointers will drift as the code moves. Prefer citing
  a *symbol* (`onPreloaderDone` in `src/components/Preloader.tsx`) over a bare
  line number where you can — symbols survive edits, line numbers do not.
- The `BEGIN:`/`END:` block in `AGENTS.md` looks machine-generated and may be
  rewritten by tooling. Never put hand-written content inside it.
- If a test framework is ever added, three files claim there isn't one
  (`README.md`, `AGENTS.md`, and every plan in `plans/`). Update all of them.
- A reviewer should scrutinise: that no secret leaked into `.env.example`, that
  the README's commands were actually run rather than assumed, and that every
  `AGENTS.md` citation resolves.
