# Plan 015: Stop defaulting to the real bank domain; add hreflang, sitemap and robots

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat be4de7d..HEAD -- "src/app/[locale]/layout.tsx" src/app src/i18n`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (touches files no other plan in this batch modifies)
- **Category**: dx / docs
- **Planned at**: commit `be4de7d`, 2026-07-27

## The rule that governs every plan in this directory

The repository owner's standing constraint, verbatim from `plans/README.md`:

> **The site must look pixel-identical after the change. No layout shifts, no
> timing changes, no restyling.** If a change cannot be made without altering
> what the user sees, it does not belong in these plans — stop and report
> instead.

Everything in this plan lives in `<head>` metadata and two new machine-facing
routes. **Nothing rendered on the page changes.**

## Why this matters

Three related gaps, all about how machines see this site.

1. **The metadata base URL falls back to the real bank's domain.**
   `src/app/[locale]/layout.tsx:38` reads:

   ```tsx
   metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bca.co.id"),
   ```

   With `NEXT_PUBLIC_SITE_URL` unset — which is the default, since there is no
   `.env.example` and nothing documents the variable — every Open Graph and
   Twitter image URL this revamp emits resolves against `https://www.bca.co.id`.
   A preview deployment then advertises the production bank's domain in its
   share cards. That is wrong in a way that is easy to miss, because the
   preview looks fine to a human; only crawlers and link unfurlers see it.

2. **No `hreflang` for a three-locale site.** The app serves `id`, `en` and
   `zh` (`src/i18n/routing.ts`) but emits no `alternates.languages`, so search
   engines cannot learn the three URLs are translations of one another.

3. **No `sitemap.ts` and no `robots.ts`.** Neither file exists anywhere under
   `src/app/`. There is nothing telling a crawler what exists — and, more
   importantly for an unreleased revamp, nothing telling one to stay away.

Point 3 has a safety dimension worth stating plainly: this site is gated behind
a preview password (`src/proxy.ts`), so it is not currently crawlable. But the
gate is a single environment variable away from being off
(`src/proxy.ts:26` — the gate only arms when `PREVIEW_PASSWORD` is set), and
if it is ever disabled before launch there is nothing to stop an unfinished
BCA-branded site being indexed.

## Current state

### `src/app/[locale]/layout.tsx:29-53` — the metadata function

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bca.co.id"),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [{ url: "/opengraph-bcacoid.png", width: 1200, height: 640 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/opengraph-bcacoid.png"],
    },
  };
}
```

### `src/i18n/routing.ts` — the full file

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en", "zh"],
  defaultLocale: "id",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
```

**`localePrefix: "as-needed"` is the critical detail for this plan.** The
default locale `id` is served **without** a prefix, the others **with** one:

| locale | homepage | Tentang BCA |
|--------|----------|-------------|
| `id` (default) | `/` | `/tentang-bca` |
| `en` | `/en` | `/en/tentang-bca` |
| `zh` | `/zh` | `/zh/tentang-bca` |

Get this wrong and both the hreflang set and the sitemap point at 404s.

### Routes that exist today

```
src/app/[locale]/page.tsx            → the homepage
src/app/[locale]/tentang-bca/page.tsx → placeholder shell (navbar + spacer only)
src/app/[locale]/login/page.tsx      → the preview gate
```

`tentang-bca` is a deliberate placeholder. Its own source comment says so:

```tsx
/** Placeholder shell — no real Tentang BCA content yet, just the navbar in
    its "about" variant so the segment-pill/tab-row treatment can be reviewed
    in place before any of the actual page is built. */
```

Because it has no content, this plan **excludes it from the sitemap** and
marks it `noindex`. Listing an empty page for crawlers would be actively
misleading. Revisit when the page is built.

### `src/app/manifest.ts` — the existing convention to follow

This file already exists and shows how this repo writes a Next.js metadata
route (a default-exported function returning a typed object). Read it before
writing `sitemap.ts` and `robots.ts`, and match its style.

### Environment

`.env.local` exists (gitignored via `.env*` in `.gitignore:37`) but there is
**no `.env.example`**, so no committed file documents `NEXT_PUBLIC_SITE_URL` or
`PREVIEW_PASSWORD`. Creating one is part of this plan.

> **Never copy a real value out of `.env.local` into `.env.example`.** Use
> placeholders only. `.env.example` is committed.

Note: `plans/007-project-docs-and-config.md` also proposes a `.env.example`
and is still open. If 007 has landed and the file already exists, **extend it**
rather than replacing it, and say so in your report.

## Commands you will need

| Purpose   | Command             | Expected on success                |
|-----------|---------------------|------------------------------------|
| Typecheck | `npm run typecheck` | exit 0, no errors                  |
| Lint      | `npm run lint`      | exit 0; 78 warnings, 0 errors      |
| Build     | `npm run build`     | exit 0                             |
| Dev server| `npm run dev`       | serves on http://localhost:3000    |

There is **no test suite in this repo**. Do not add a test framework.

Per `AGENTS.md`: this is Next.js 16 and its conventions may differ from your
training data. **Read `node_modules/next/dist/docs/` for the `sitemap` and
`robots` metadata-route conventions before writing those files** rather than
relying on memory.

## Scope

**In scope**:
- `src/app/[locale]/layout.tsx`
- `src/app/sitemap.ts` (create)
- `src/app/robots.ts` (create)
- `src/app/[locale]/tentang-bca/page.tsx` (add a `noindex` metadata export only)
- `.env.example` (create, or extend if plan 007 already made it)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):
- `src/i18n/routing.ts` — the locale configuration is correct. Read it, do not
  change it.
- `src/proxy.ts` — the preview gate. `robots.ts` is defence in depth, not a
  replacement for it.
- `src/app/manifest.ts` — already correct; use it as a style reference only.
- Any translated string or `messages/*.json`. This plan adds no user-facing
  copy, so key parity (currently 271/271/271) must be untouched.
- `.env.local` — never read its values into a committed file, and never
  modify it.
- Anything rendered on the page.
- `archive/**` — reference-only snapshots, excluded from `tsconfig.json` and
  ESLint. Never modify or delete anything under this directory.

## Git workflow

- Branch: `advisor/015-site-url-and-crawler-metadata`
- Commit style follows `git log` — short imperative sentence, no prefix.
  Example from history: `Add Tentang BCA page, revamp navbar/product section, update i18n and CSP`
- Suggested commit message: `Add hreflang, sitemap and robots; stop defaulting to bca.co.id`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the site URL explicit and safe by default

In `src/app/[locale]/layout.tsx`, replace the production-domain fallback with a
localhost default, and hoist it to a module constant so the sitemap-adjacent
logic and the metadata agree:

```tsx
// Falls back to localhost, not to the live bank domain: with this unset, an
// unconfigured preview deployment would otherwise advertise bca.co.id in its
// Open Graph and canonical URLs. Set NEXT_PUBLIC_SITE_URL per environment —
// see .env.example.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
```

and use it:

```tsx
    metadataBase: new URL(SITE_URL),
```

**Verify**: `grep -n "bca.co.id" "src/app/[locale]/layout.tsx"` → **no output**.

### Step 2: Add hreflang alternates

Still in `generateMetadata`, add an `alternates` block. Respect
`localePrefix: "as-needed"` — the default locale `id` has **no** prefix:

```tsx
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: {
        id: "/",
        en: "/en",
        zh: "/zh",
      },
    },
```

`routing` is already imported in this file (line 9). Do not hardcode `"id"` in
the canonical comparison — use `routing.defaultLocale` so the two stay in sync
if the default ever changes.

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Add `sitemap.ts`

Create `src/app/sitemap.ts`. Read the Next.js 16 sitemap conventions in
`node_modules/next/dist/docs/` first.

It must list **only the homepage**, in all three locales, using the
`as-needed` prefixing:

```ts
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Only the homepage. /tentang-bca is still a placeholder shell with no
// content (see its page.tsx), and /login is the preview gate — listing
// either would point crawlers at pages that say nothing. Add tentang-bca
// here once it has real content.
export default function sitemap(): MetadataRoute.Sitemap {
  const path = (locale: string) =>
    locale === routing.defaultLocale ? "" : `/${locale}`;

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}${path(l)}` || `${SITE_URL}/`])
        ),
      },
    },
  ];
}
```

**Verify**: `npm run build` → exit 0, and the build output lists `/sitemap.xml`
as a generated route.

### Step 4: Add `robots.ts`

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// This is an unreleased revamp behind a preview password (src/proxy.ts), but
// that gate only arms when PREVIEW_PASSWORD is set. Disallowing the gate and
// the placeholder page here is defence in depth: if the password is ever
// unset before launch, crawlers still stay off the unfinished surfaces.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/en/login", "/zh/login", "/tentang-bca", "/en/tentang-bca", "/zh/tentang-bca"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

The `/login` paths match the `LOGIN_PATHS` set in `src/proxy.ts:9`.

**Verify**: `npm run build` → exit 0, and `/robots.txt` appears as a generated
route.

### Step 5: Mark the placeholder page `noindex`

In `src/app/[locale]/tentang-bca/page.tsx`, add a metadata export so the empty
shell is never indexed even if a crawler reaches it directly:

```tsx
import type { Metadata } from "next";

// Placeholder shell with no content yet — keep it out of search results until
// the real page is built. Remove this export at that point.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

Change nothing else in the file — in particular leave the `<Navbar variant="about" />`
and the spacer alone, since the navbar's view-transition treatment is being
reviewed on this page.

**Verify**: `npm run typecheck` → exit 0.

### Step 6: Document the environment variables

Create `.env.example` (or extend it if plan 007 already created it):

```bash
# Public base URL for this deployment. Used for Open Graph/Twitter image URLs,
# canonical + hreflang links, sitemap.xml and robots.txt.
# Leave unset locally to default to http://localhost:3000.
# NEVER point this at https://www.bca.co.id from a preview deployment.
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Shared preview password. When set, src/proxy.ts gates every route behind
# /login. Leave EMPTY to disable the gate entirely (local development).
PREVIEW_PASSWORD=

# reCAPTCHA site key for the HaloBCA chat widget. Falls back to Google's
# public always-pass test key when unset.
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

Confirm those three names against the code before committing:

```bash
grep -rn "process.env.NEXT_PUBLIC_\|process.env.PREVIEW_PASSWORD" src/ | sort -u
```

Add any variable this turns up that is missing from the list. **Use
placeholders only — never a real value from `.env.local`.**

**Verify**: `grep -c "=" .env.example` → matches the number of variables
documented, and no line contains a real secret.

### Step 7: Confirm the gates and the output

1. `npm run typecheck` → exit 0.
2. `npm run lint` → exit 0.
3. `npm run build` → exit 0.

**Expected lint baseline**: `78 problems (0 errors, 78 warnings)`. The two new
files contain no JSX and no images, so the count must not change.

Then start `npm run dev` and check the generated output. (If
`PREVIEW_PASSWORD` is set in `.env.local` you will be redirected to `/login` —
sign in first, or run without that variable.)

**7a — robots.** `curl -s http://localhost:3000/robots.txt`
→ contains `Disallow: /login`, `Disallow: /tentang-bca`, and a `Sitemap:` line
pointing at `http://localhost:3000/sitemap.xml`.

**7b — sitemap.** `curl -s http://localhost:3000/sitemap.xml`
→ well-formed XML containing `http://localhost:3000/` and three
`xhtml:link rel="alternate" hreflang="…"` entries for `id`, `en` and `zh`.
**No `/tentang-bca` and no `/login` anywhere in it.**

**7c — hreflang in the page head.** Load `http://localhost:3000/` and run:

```js
console.log([...document.querySelectorAll('link[rel="alternate"]')].map(l => `${l.hreflang} ${l.href}`));
console.log('canonical:', document.querySelector('link[rel="canonical"]')?.href);
console.log('og:image:', document.querySelector('meta[property="og:image"]')?.content);
```

→ three alternates for `id`/`en`/`zh`; canonical is the localhost origin; and
**`og:image` must start with `http://localhost:3000`, not `https://www.bca.co.id`**.
That last one is the whole point of Step 1.

**7d — the alternate URLs actually resolve.** Visit `http://localhost:3000/en`
and `http://localhost:3000/zh` → both load, neither 404s. This is what catches
an `as-needed` prefixing mistake.

**7e — nothing visual changed.** Load the homepage and scroll it.

**Verify**: identical to before. This plan touches only `<head>` and two new
machine-facing routes.

## Test plan

No test suite exists and this plan does not add one. Verification is:

- `npm run typecheck` / `lint` / `build` → all exit 0, lint unchanged at 78 warnings
- Steps 7a–7e all behave as specified
- `messages/*.json` untouched (key parity stays 271/271/271)

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "bca.co.id" "src/app/[locale]/layout.tsx"` → no output
- [ ] `src/app/sitemap.ts` and `src/app/robots.ts` exist
- [ ] `grep -n "alternates" "src/app/[locale]/layout.tsx"` → 1 match
- [ ] `grep -n "index: false" "src/app/[locale]/tentang-bca/page.tsx"` → 1 match
- [ ] `.env.example` exists and contains no real secret value
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 with 0 errors and 78 warnings
- [ ] `npm run build` exits 0 and lists `/sitemap.xml` and `/robots.txt`
- [ ] Steps 7a–7e pass, especially **7c**'s `og:image` origin check
- [ ] `git status --porcelain` shows `messages/` untouched
- [ ] `plans/README.md` status row for 015 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `layout.tsx` or `routing.ts` does not match the excerpts (drift).
- `/en` or `/zh` 404s after Step 3 — the `as-needed` prefix logic is wrong.
  Fix the path helper; do not "fix" it by changing `src/i18n/routing.ts`.
- `og:image` still resolves against `bca.co.id` after Step 1.
- The Next.js 16 sitemap/robots API in `node_modules/next/dist/docs/` differs
  from the shape sketched in Steps 3–4. Follow the docs, and note the
  difference in your report.
- You are about to copy any value out of `.env.local`.
- Anything on the rendered page changes.

## Maintenance notes

- **Set `NEXT_PUBLIC_SITE_URL` in every deployed environment.** The localhost
  default is deliberately useless in production: a wrong-but-plausible URL
  (the real bank's domain) fails silently, whereas `localhost` in a share card
  is obvious immediately. That tradeoff is the point.
- **When `/tentang-bca` gets real content**: remove the `noindex` export from
  its `page.tsx`, drop the three `tentang-bca` paths from `robots.ts`, and add
  it to `sitemap.ts` with its own hreflang alternates. All three must move
  together.
- **If a locale is ever added or removed**, `src/i18n/routing.ts` is the single
  source of truth — `sitemap.ts` reads `routing.locales` and needs no edit, but
  the hard-coded `languages` map in `layout.tsx` Step 2 **does**. Consider
  deriving it from `routing.locales` if a fourth locale ever appears.
- **What a reviewer should scrutinise**: the `as-needed` prefixing. It is the
  one thing here that is easy to get wrong and produces URLs that look right
  but 404. Step 7d is the guard.
- **`robots.ts` is not a security control.** The preview gate in
  `src/proxy.ts` is. If this site needs to stay private, verify
  `PREVIEW_PASSWORD` is set in the deployed environment — a `Disallow` only
  discourages well-behaved crawlers.
