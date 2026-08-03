# BCA.co.id — Homepage Revamp

A design exploration of the BCA (Bank Central Asia) public homepage, built as
a Next.js App Router site in three locales (Indonesian, English, Chinese).
This is **not** the production bca.co.id — it is a revamp prototype, currently
gated behind a shared password (see "The preview gate" below).

## Getting started

```bash
git clone <this-repo>
cd BCAcoid-homepage-revamp
npm install
cp .env.example .env.local
```

Fill in `.env.local` as needed, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**The site works without any environment variables set.** Every Supabase-backed
section (products, promos, news, FAQ, banners) falls back to a bundled dataset
when Supabase isn't configured, so a fresh clone isn't blocked on credentials.
The only variable worth setting locally is `PREVIEW_PASSWORD` — leave it empty
to skip the login gate entirely during development.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run a production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

**There is no test suite.** Verification on this project is `lint` +
`typecheck` + `build`, plus manual/visual checks in the browser.

## Project structure

```
src/
  app/[locale]/        App Router pages, one tree shared across all 3 locales
  components/          Preloader, ScrollReveal, SmoothScroll — page-level infra
  components/home/      All homepage sections, nav chrome, and their fallback data
  lib/                  Supabase fetchers (one per section) + a few shared hooks
  i18n/                 next-intl routing/config
  fonts/                BCA Sans, self-hosted WOFF2
  proxy.ts              Middleware — see below, this is NOT middleware.ts
messages/               en.json / id.json / zh.json — next-intl message catalogs
supabase/               SQL schema + RLS policies for every fetched table
public/assets/          Static images, icons, seasonal artwork
docs/                   Design-token reference (see below)
plans/                  Implementation plans from AI-assisted audit passes
archive/                Removed-but-kept-for-reference code; excluded from
                        tsconfig and ESLint, imported by nothing
```

**`src/proxy.ts`, not `middleware.ts`.** This Next.js version renames the
middleware entry point and export — see `AGENTS.md` for what else differs from
what you might expect.

## Design system

Colors, type, elevation, motion and the pill CTA button are all tokens defined
in `src/app/globals.css`'s `@theme` block, with a semantic layer on top of the
raw Figma-derived values. **New UI should reach for a token, not a literal.**
See [`docs/design-tokens.md`](docs/design-tokens.md) for the full reference —
what each token is for, how to pick a value for something new, and the rule
for when a repeated value earns a token at all.

## How data works

Every homepage section that shows dynamic content (`products`, `promos`,
`news`, `faq`, `banners`, `kurs`) fetches from Supabase's auto-generated REST
API via plain `fetch()` — no client library — in `src/lib/*.ts`. Each fetcher:

- Sets `next: { revalidate: N }` for ISR-style caching.
- Falls back to a bundled dataset (`src/components/home/*-data.ts`) if the
  fetch fails or the environment variables are unset, so no section ever
  renders empty.

The SQL that creates and seeds each table, plus its Row Level Security
policies, lives in `supabase/*.sql`.

## Localisation

Three locales — `id` (default, unprefixed), `en`, `zh` — configured in
`src/i18n/routing.ts` with `localePrefix: "as-needed"`. Messages live in
`messages/{id,en,zh}.json` and must stay at key-set parity across all three.

## The preview gate

Setting `PREVIEW_PASSWORD` gates every route behind `/login` (see
`src/proxy.ts`). **Leaving it unset makes the site fully public** — there is
no gate at all in that case. This matters for anyone deploying a preview: an
unset `NEXT_PUBLIC_SITE_URL` also defaults Open Graph/canonical URLs to
`http://localhost:3000` rather than the real bank's domain — see
`.env.example` for details on both.

## Conventions

This repo has several non-obvious conventions — the preloader handshake,
how `ScrollReveal` expects the DOM to behave, the fetch-with-fallback pattern,
and more — documented in [`AGENTS.md`](AGENTS.md) for anyone (human or AI)
working on the code.
