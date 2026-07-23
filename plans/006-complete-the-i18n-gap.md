# Plan 006: Translate the promo badges and search-dropdown chrome

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat cf1b0f5..HEAD -- src/components/home/promo-data.ts src/components/home/PromoSection.tsx src/components/home/search-data.ts src/components/home/SearchRecommendation.tsx messages/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: `plans/001-green-the-lint-gate.md`;
  **must land after `plans/004-surface-data-failures-and-fix-dates.md`** — both
  edit `getPromoTimestamp`, and 004 changes how the date is produced
- **Category**: bug
- **Planned at**: commit `cf1b0f5`, 2026-07-22

## Why this matters

This site ships in three locales (`id`, `en`, `zh`) via next-intl, and the
translation files are in excellent shape — all three contain **exactly 171 keys,
with zero drift**. The chrome around every section is fully translated.

But a handful of user-facing strings bypass the system entirely and are
hardcoded Indonesian. On `/en` and `/zh` they render in Indonesian inside
otherwise fully-translated sections — and they sit on the two most-used
interactive surfaces on the page: the promo cards and the search dropdown.

This is the *only* remaining i18n gap. Closing it makes the locale switching
actually complete.

## Current state

### 1. Promo badge labels — `src/components/home/promo-data.ts:136-141`

```ts
export function getPromoBadge(promo: Promo, now: Date): PromoBadge {
  const { end } = resolvePeriod(promo);
  const toEnd = end.getTime() - now.getTime();

  if (toEnd > 0 && toEnd < MS_DAY) return { key: "almostEnd", label: "Segera Berakhir!" };

  if ((promo.redeemCount ?? 0) >= POPULAR_REDEEM_THRESHOLD) return { key: "popular", label: "Populer" };
```

### 2. Promo timestamps — `src/components/home/promo-data.ts:153-165`

```ts
export function getPromoTimestamp(promo: Promo, now: Date, badge: PromoBadge) {
  const { end } = resolvePeriod(promo);

  if (now.getTime() > end.getTime()) return "Promo Berakhir";

  if (badge.key === "almostEnd") {
    const hours = Math.min(23, Math.max(1, Math.ceil((end.getTime() - now.getTime()) / MS_HOUR)));
    return `Berakhir dalam ${hours} jam`;
  }

  return `Hingga ${formatDateID(end)}`;
}
```

### 3. Where they render — `src/components/home/PromoSection.tsx`

`timestamp` at line 92, and `badge.label` at line 114:

```tsx
      {badge.key !== "default" && <PromoRibbon badgeKey={badge.key} label={badge.label!} />}
```

`PromoSection.tsx` is a `"use client"` module and already calls
`useTranslations("promo")` elsewhere (see `MorePromoCard`), so the translator is
available in this file.

### 4. Search-dropdown category labels — `src/components/home/search-data.ts:64-72`

```ts
export const INFO_CATEGORY_META: Record<
  InfoCategory,
  { label: string; bg: string; text: string }
> = {
  "produk-layanan": { label: "Produk & Layanan", bg: "#ccfffe", text: "#188b88" },
  artikel: { label: "Artikel", bg: "#f4e5f6", text: "#70257c" },
  promo: { label: "Promo", bg: "#ffead1", text: "#c44d00" },
};
```

Rendered at `src/components/home/SearchRecommendation.tsx:380`.

### 5. Popular searches and topics — `src/components/home/search-data.ts:1294-1312`

```ts
export const POPULAR_SEARCHES: string[] = [
  "Buka Rekening", "Kurs Hari Ini", "Promo Kartu Kredit",
  "KPR BCA", "Aktivasi myBCA", "Lokasi ATM",
];

export const POPULAR_TOPICS: PopularTopic[] = [
  { id: "topic-rekening", label: "Buka rekening & tabungan", keyword: "rekening", icon: "wallet" },
  { id: "topic-kartu", label: "Kartu kredit & Paylater", keyword: "kartu", icon: "card" },
  { id: "topic-kredit", label: "KPR & kredit kendaraan", keyword: "kpr", icon: "house" },
  { id: "topic-investasi", label: "Investasi & reksa dana", keyword: "investasi", icon: "chart" },
];
```

**Important distinction**: the `label` fields are display text and must be
translated. The `keyword` fields are search-engine input, matched against the
Indonesian corpus by `src/components/home/search-engine.ts` — **they must stay
Indonesian in every locale** or search will return nothing.

### Existing message-file structure

Top-level namespaces in `messages/{en,id,zh}.json`:

```
metadata, login, languages, hero, search, scrollCue, backToTop, slideDots,
common, preloader, product, promo, soliprio, nav, mobileMenu, cookieBanner,
footer, mybca, news, megamenu, halobca
```

The `promo` namespace today:

```json
"promo": {
  "eyebrow": "Events & Programs",
  "heading": "The Best Rewards for Every Precious Moment",
  "viewMore": "View 200+ More Promos",
  "prevSlide": "Previous event",
  "nextSlide": "Next event"
}
```

The `search` namespace already holds the dropdown's other strings and already
demonstrates interpolation — `"removeTerm": "Remove {term}"` and
`"noResultsFor": "No results for “{keyword}”"`.

### Repo conventions to match

- Namespaces are grouped by section and consumed with
  `useTranslations("<namespace>")` in client components.
- Interpolation uses next-intl's `{name}` placeholder syntax — follow
  `search.removeTerm` as the exemplar.
- `t.raw(...)` is used where a structured object is needed — see
  `src/components/home/CookieBanner.tsx:36`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |
| Key-parity check | see Step 5 | all three locales equal |

There is **no test suite** in this repository. Do not try to run one.

## Scope

**In scope** (the only files you should modify):
- `messages/en.json`, `messages/id.json`, `messages/zh.json`
- `src/components/home/promo-data.ts`
- `src/components/home/PromoSection.tsx`
- `src/components/home/search-data.ts`
- `src/components/home/SearchRecommendation.tsx`

**Out of scope** (do NOT touch, even though they look related):
- **Translating the 147-record search corpus** (the `PRODUCTS` and `INFORMATION`
  arrays that make up most of `search-data.ts`). That is a large content project
  requiring real translation work, and the file header already flags the corpus
  as a stand-in for a future backend. Only the **chrome** — category labels,
  popular searches, popular topics — is in scope.
- **The `keyword` fields in `POPULAR_TOPICS`** and the search-engine synonym
  graph in `search-synonyms.ts`. These are matching inputs, not display text.
  Translating them breaks search.
- **Product/news/promo content from Supabase**, which already has its own
  `_en`/`_zh` translation columns (see `src/lib/products.ts:41-43`).
- Any restructuring of existing message keys.
- Any `<img>` tag anywhere.

## Git workflow

- Branch: `advisor/006-complete-the-i18n-gap`
- Commit the promo work and the search work separately.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the new message keys to all three locales

Extend the `promo` namespace in each of `messages/id.json`, `messages/en.json`,
`messages/zh.json`:

```json
"badge": {
  "almostEnd": "…",
  "popular": "…"
},
"timestamp": {
  "expired": "…",
  "hoursLeft": "…",     // must contain the {hours} placeholder
  "until": "…"          // must contain the {date} placeholder
}
```

The Indonesian values are the strings already in the code, verbatim:
`"Segera Berakhir!"`, `"Populer"`, `"Promo Berakhir"`,
`"Berakhir dalam {hours} jam"`, `"Hingga {date}"`.

Extend the `search` namespace similarly with `categories` (three entries keyed
`produk-layanan`, `artikel`, `promo`), `popular` (six entries), and `topics`
(four entries keyed by the existing `id` values).

Write real English and Chinese translations. Match the register of the
surrounding entries — the existing `en` copy is title-case marketing English,
not literal translation.

**Verify**: all three files remain valid JSON —
```bash
for f in messages/*.json; do python3 -m json.tool "$f" > /dev/null && echo "$f ok"; done
```

### Step 2: Return keys, not labels, from `promo-data.ts`

Change `getPromoBadge` to stop carrying a `label`, and `getPromoTimestamp` to
return a discriminated descriptor the component can translate:

```ts
export type PromoTimestamp =
  | { kind: "expired" }
  | { kind: "hoursLeft"; hours: number }
  | { kind: "until"; date: string };
```

`getPromoTimestamp` keeps computing `hours` and the formatted `date` string
exactly as it does today (including the `Asia/Jakarta` formatting introduced by
plan 004) — it simply returns the parts instead of a pre-assembled sentence.

Keep these functions pure. Do **not** import `next-intl` into `promo-data.ts`;
it is a data module and is also imported by `src/lib/promos.ts` on the server.

**Verify**: `npm run typecheck` → exit 0 (it will fail in `PromoSection.tsx`
until Step 3 — that is expected mid-step)

### Step 3: Resolve the promo strings in `PromoSection.tsx`

In `PromoSection.tsx`, use the existing `useTranslations("promo")` to render:
- the ribbon label from `badge.key` → `t(\`badge.${badge.key}\`)`
- the timestamp from the descriptor → `t(\`timestamp.${ts.kind}\`, { hours, date })`

`PromoRibbon` currently takes both `badgeKey` and `label`; simplify it to take
the resolved label string. Do not change its styling, its `className`s, or the
`badge.key !== "default"` condition that decides whether it renders at all.

**Verify**:
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0
- Manual: on `/` the promo cards read **exactly** as before — same badge text,
  same "Hingga 15 Jul 2026" / "Berakhir dalam 5 jam" / "Promo Berakhir"
  wording. On `/en` and `/zh` they render in those languages.

### Step 4: Translate the search-dropdown chrome

`INFO_CATEGORY_META` mixes display text with colours. Keep the colours in
`search-data.ts` (they are design tokens, not content) and move only `label` out:

```ts
export const INFO_CATEGORY_STYLE: Record<InfoCategory, { bg: string; text: string }> = {
  "produk-layanan": { bg: "#ccfffe", text: "#188b88" },
  artikel: { bg: "#f4e5f6", text: "#70257c" },
  promo: { bg: "#ffead1", text: "#c44d00" },
};
```

`SearchRecommendation.tsx` then reads the colour from `INFO_CATEGORY_STYLE` and
the label from `t(\`categories.${category}\`)`. **The hex values must not change.**

For `POPULAR_SEARCHES` and `POPULAR_TOPICS`, keep the arrays as the source of
structure (`id`, `keyword`, `icon`) and resolve `label` through `t()` in the
component. Remember: `keyword` stays Indonesian.

**Verify**:
- `npm run typecheck` → exit 0
- Manual on `/`: focus the hero search field. The category badges, popular
  search chips and topic rows read exactly as before, with identical colours.
- Manual on `/en`: same UI, English labels. Click a topic — **search results must
  still appear**, proving the `keyword` fields were left untranslated.

### Step 5: Confirm key parity across all three locales

The three message files currently have exactly 171 keys each with zero drift.
That must remain true.

```bash
python3 - <<'EOF'
import json
def keys(o,p=""):
    s=set()
    for k,v in o.items():
        kp=f"{p}.{k}" if p else k
        s |= keys(v,kp) if isinstance(v,dict) else {kp}
    return s
m={l:keys(json.load(open(f"messages/{l}.json"))) for l in ("id","en","zh")}
for l in m: print(l, len(m[l]))
assert m["id"]==m["en"]==m["zh"], {
    "missing_en": sorted(m["id"]-m["en"]), "missing_zh": sorted(m["id"]-m["zh"]),
    "extra_en": sorted(m["en"]-m["id"]),  "extra_zh": sorted(m["zh"]-m["id"]),
}
print("PARITY OK")
EOF
```

**Verify**: prints `PARITY OK` and three equal counts.

### Step 6: Walk all three locales

With `npm run dev` running, load `/`, `/en` and `/zh` and confirm:
- no raw message keys (`promo.badge.almostEnd`) appear anywhere on screen;
- no console errors from next-intl about missing messages;
- the Indonesian locale is character-for-character identical to before this plan.

## Test plan

No test framework exists in this repository and this plan does not add one. The
key-parity script in Step 5 is the closest thing to an automated test here and
**should be run on every change to `messages/`** — note in your report that it
would make a good CI check.

Verification is Steps 3–6 plus `npm run lint` and `npm run typecheck`.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] The Step 5 parity script prints `PARITY OK`
- [ ] `grep -n "Segera Berakhir\|Populer\"\|Promo Berakhir\|Berakhir dalam\|Hingga \${" src/components/home/promo-data.ts`
      → no matches in *returned* values (matches inside `PROMO_SEEDS` titles are
      seed content and are fine)
- [ ] `INFO_CATEGORY_META`'s labels no longer exist in `search-data.ts`; the hex
      colours are unchanged
- [ ] `POPULAR_TOPICS[].keyword` values are still Indonesian
- [ ] The Indonesian locale renders identically to before
- [ ] `/en` and `/zh` show no Indonesian promo badges or search chrome
- [ ] Clicking a popular topic on `/en` still returns search results
- [ ] `git diff --name-only` lists only the six in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed since `cf1b0f5` and no longer
  matches the excerpts above.
- Plan 004 has not landed yet and `getPromoTimestamp` still uses the old
  `formatDateID`. Land 004 first — otherwise you will both edit the same function
  and one of you will lose the timezone fix.
- Search stops returning results in any locale. That means a `keyword` or a
  synonym-graph entry got translated. Revert that part immediately.
- The Indonesian locale's rendered text changes in any way. It must be
  byte-identical; the whole point is that only `en` and `zh` improve.
- You find yourself translating entries inside the `PRODUCTS` / `INFORMATION`
  corpus. That is explicitly out of scope.

## Maintenance notes

- **The search corpus remains Indonesian-only.** That is a known, deliberate gap
  — `getSearchRecommendations` matches an Indonesian corpus, so an English query
  on `/en` will often miss. Closing it properly means either translating 147
  records or moving search server-side; see the direction notes in
  `plans/README.md`.
- The `keyword`-vs-`label` split in `POPULAR_TOPICS` is now load-bearing and
  subtle. Anyone adding a topic must keep `keyword` Indonesian. Worth a comment
  at the array.
- The parity script in Step 5 is the guard against the drift that this repo has
  so far avoided. Run it in review on any `messages/` change.
- A reviewer should scrutinise: that the Indonesian output is unchanged, that the
  hex colours in `INFO_CATEGORY_STYLE` match the originals exactly, and that no
  search input string was translated.
