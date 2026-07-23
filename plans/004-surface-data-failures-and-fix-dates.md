# Plan 004: Make data-layer failures visible, and format promo dates in Jakarta time

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat cf1b0f5..HEAD -- src/lib/ src/components/home/promo-data.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: `plans/001-green-the-lint-gate.md`
- **Category**: bug
- **Planned at**: commit `cf1b0f5`, 2026-07-22

## Why this matters

Two independent problems in the data layer, both invisible until they bite.

**1. Every fetch failure is swallowed silently.** All five Supabase/exchange-rate
fetchers end in a bare `catch {}` that returns bundled demo data. That fallback
is good design — the homepage never renders empty. But there is no log line
anywhere, so "why is production showing 2026 demo promos instead of real ones?"
is currently a question you cannot answer without editing code and redeploying.
The same applies to a malformed-but-successful response: `await res.json()` is
cast straight to a typed array with no shape check, so a PostgREST error object
returned with a 2xx would throw on `.filter(...)` and land in the same silent
catch.

For `kurs.ts` it is worse than invisible: the exchange-rate values get no numeric
validation, so a non-numeric field silently produces `NaN` and the site displays
broken exchange rates **to customers of a bank**.

**2. Promo end-dates are formatted in the server's local timezone.** The date is
parsed correctly — `src/lib/promos.ts` deliberately anchors raw Supabase
timestamps to `+07:00` — and then `formatDateID` throws that away by using
`getDate()` / `getMonth()` / `getFullYear()`, which resolve in whatever timezone
the runtime happens to be in. On a typical host that is UTC on the server and
WIB in the visitor's browser. Since `PromoCard` is a client component, it renders
in both places: any promo ending between 00:00 and 07:00 WIB shows **one date on
the server and a different one after hydration** — a visible React hydration
mismatch plus a wrong end date on a bank's promotional material.

The correct pattern already exists in this repo. `src/lib/news.ts:21-26` formats
dates with an explicit `timeZone: "Asia/Jakarta"`. `promo-data.ts` just does not
use it.

## Current state

### The five silent catches

```
src/lib/promos.ts:63     } catch {
src/lib/news.ts:94       } catch {
src/lib/products.ts:140  } catch {
src/lib/banners.ts:61    } catch {
src/lib/kurs.ts:54       } catch {
```

### Unvalidated JSON — `src/lib/products.ts:111-118`

```ts
    if (!res.ok) return fallback();

    const rows: CategoryRow[] = await res.json();

    // A category with no cards would render an empty row, so drop it here
    // rather than letting it reach the carousel.
    const categories = rows
      .filter((r) => r.products?.length)
```

`const rows: CategoryRow[] = await res.json()` is a bare type assertion over
untrusted input. If the body is an object rather than an array, `.filter` throws.
`src/lib/news.ts:69`, `src/lib/banners.ts:46` and `src/lib/promos.ts:56` share
the pattern.

### Unvalidated numbers — `src/lib/kurs.ts:41-48`

```ts
    const data = await res.json();
```

`data` is implicitly `any`; `data.rates?.IDR` and `data.rates?.[rateCode]` flow
into arithmetic and then into `formatIDR` at lines 63-64 with no
`Number.isFinite` check.

### The timezone bug — `src/components/home/promo-data.ts:145-165`

```ts
const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatDateID(date: Date) {
  return `${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

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

### The exemplar to copy — `src/lib/news.ts:20-26`

```ts
/** "2026-07-15" → "15 Jul 2026" — the format the cards render. */
const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
```

### Where the promo timestamp is rendered

`src/components/home/PromoSection.tsx` — `PromoCard` is inside a `"use client"`
module and renders `getPromoTimestamp(...)` at line 114.

### Repo conventions to match

- The fetch-with-bundled-fallback shape is consistent across all five libs:
  check env vars → build query → `fetch` with `next: { revalidate: N }` →
  validate → map → fall back on any failure. Preserve it exactly; you are adding
  observability and validation, not restructuring.
- Comments explain *why* in full sentences — see `src/lib/products.ts:53-63`.
- Indonesian is used freely in comments in this repo. Either language is fine;
  match the file you are editing.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |

There is **no test suite** in this repository. Do not try to run one.

## Scope

**In scope** (the only files you should modify):
- `src/lib/promos.ts`
- `src/lib/news.ts`
- `src/lib/products.ts`
- `src/lib/banners.ts`
- `src/lib/kurs.ts`
- `src/components/home/promo-data.ts`

**Out of scope** (do NOT touch, even though they look related):
- **Adding a schema-validation dependency** (zod, valibot, …). This repo has
  exactly five runtime dependencies and that is a deliberate posture. Hand-rolled
  guards only.
- **The bundled fallback datasets themselves** (`product-data.ts`,
  `news-data.ts`, `promo-data.ts`'s `PROMO_SEEDS`). Not this plan's job.
- **The `revalidate` values** (300 / 3600). Changing cache behaviour changes how
  fresh the site feels; out of scope.
- **The 4-step fallback query ladder in `products.ts:107-110`.** It looks odd but
  it is load-bearing across partially-migrated Supabase installs. Leave it.
- Translating the Indonesian strings in `getPromoTimestamp` — that is
  `plans/006-complete-the-i18n-gap.md`. Here you only fix the *date formatting*.
- Any `<img>` tag anywhere.

## Git workflow

- Branch: `advisor/004-surface-data-failures-and-fix-dates`
- Commit the logging/validation work and the timezone fix as two separate
  commits — they are unrelated and should be revertable independently.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Log every fallback, in all five libs

For each of the five `catch` blocks, capture the error and log it before falling
back. Use a consistent, greppable prefix naming the module:

```ts
  } catch (err) {
    console.error("[promos] Supabase fetch failed, using bundled fallback:", err);
    return fallback();
  }
```

Also log the **non-error** fallback paths — the ones that return bundled data
because the response was not ok or the data was unusable. Those are the cases
that are currently hardest to diagnose, because nothing throws at all. For
example in `src/lib/products.ts`, the `if (!res.ok) return fallback();` on line
111 should say so:

```ts
    if (!res.ok) {
      console.error(`[products] Supabase returned ${res.status}, using bundled fallback`);
      return fallback();
    }
```

Do **not** log when the fallback is taken because Supabase simply is not
configured (`if (!url || !key) return fallback();`) — that is the expected local
path and would be noise on every dev render. A single `console.info` on that
path is acceptable if you prefer; a `console.error` is not.

**Verify**:
- `npm run typecheck` → exit 0
- `grep -c "} catch {" src/lib/` → `0`
- `npm run dev`, then temporarily set an invalid `NEXT_PUBLIC_SUPABASE_URL` in
  `.env.local`, reload the homepage, and confirm the server console prints one
  `[<module>]` line per failing fetcher and the page still renders with bundled
  content. **Restore `.env.local` afterwards.**

### Step 2: Validate response shape before using it

In `products.ts`, `news.ts`, `banners.ts` and `promos.ts`, add an array check
immediately after each `res.json()`:

```ts
    const rows: unknown = await res.json();
    if (!Array.isArray(rows)) {
      console.error("[products] unexpected response shape, using bundled fallback");
      return fallback();
    }
```

then narrow to the row type. Keep the existing `CategoryRow[]` / equivalent types
— the goal is that the assertion happens *after* a real runtime check, not that
you introduce a new type system.

**Verify**:
- `npm run typecheck` → exit 0
- `grep -rn "= await res.json()" src/lib/` → every remaining match is followed
  within three lines by an `Array.isArray` or `Number.isFinite` guard

### Step 3: Validate the exchange-rate numbers in `kurs.ts`

`src/lib/kurs.ts` feeds numbers users read as money. Guard them:

- After `await res.json()`, confirm the payload is an object with a `rates`
  object.
- Before using `data.rates.IDR` and `data.rates[rateCode]`, check both with
  `Number.isFinite(...)` and that the divisor is non-zero.
- On any failure, log with the `[kurs]` prefix and return the existing fallback.

**No `NaN` may reach `formatIDR`.**

**Verify**:
- `npm run typecheck` → exit 0
- `grep -c "Number.isFinite" src/lib/kurs.ts` → at least `2`
- Manual: the hero widget's exchange-rate rail shows numeric values, never
  `NaN` or blank.

### Step 4: Format promo dates in `Asia/Jakarta`

In `src/components/home/promo-data.ts`, replace the `MONTHS_ID` array and
`formatDateID` with a module-level `Intl.DateTimeFormat`, mirroring
`src/lib/news.ts:21-26`:

```ts
/** "Hingga 15 Jul 2026" — always in WIB, so the server and the browser agree. */
const PROMO_DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
```

and use `PROMO_DATE_FORMAT.format(end)` at the `return \`Hingga ...\`` site.

**Check the output string carefully.** `Intl` with `id-ID` may render months
slightly differently from the hand-rolled `MONTHS_ID` array (e.g. `Agt` vs
`Agu`, or a trailing period). The repository owner requires **no visual change**.
If the rendered text differs from what `MONTHS_ID` produced, keep the
`MONTHS_ID` labels and instead derive the day/month/year parts in Jakarta time
via `PROMO_DATE_FORMAT.formatToParts(end)`, so the timezone is correct *and*
the visible strings are byte-identical to today's.

Delete `MONTHS_ID` only if it ends up genuinely unused — `npm run lint` will
flag it either way.

**Verify**:
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0
- Compare rendered output before/after for a promo with a known end date. The
  string must be identical for any promo not ending in the 00:00–07:00 WIB
  window, and *corrected* for one that does.
- Node cross-check (run from the repo root):
  ```bash
  TZ=UTC node -e 'const d=new Date("2026-07-16T02:00:00+07:00");console.log(new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Jakarta"}).format(d))'
  ```
  → prints the **16 July** date, not 15. Re-run with `TZ=Asia/Jakarta` and
  confirm the output is unchanged. That equality is the whole point of the fix.

### Step 5: Confirm the hydration mismatch is gone

With `npm run dev` running, open the homepage with the browser console visible
and confirm there is **no** React hydration warning mentioning promo text.

If you can, temporarily start the dev server under a non-WIB timezone to force
the old bug to appear before your fix and disappear after:

```bash
TZ=UTC npm run dev
```

**Verify**: no hydration warnings in the console; promo "Hingga …" dates match
between the server-rendered HTML (view-source) and the hydrated DOM.

## Test plan

No test framework exists in this repository and this plan does not add one.
`getPromoTimestamp`, `formatDateID` and the `kurs` numeric guards are pure
functions and would be excellent first unit tests once a runner exists — note
that in your report as a follow-up, but do not add a runner here.

Verification is the per-step checks above, plus:
- `npm run lint` → exit 0
- `npm run typecheck` → exit 0
- `grep -c "} catch {" src/lib/` → `0`
- The `TZ=UTC` / `TZ=Asia/Jakarta` equality check in Step 4.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `grep -c "} catch {" src/lib/` → `0` (every catch binds and logs its error)
- [ ] Every fallback return in the five libs is preceded by a log line, except
      the "Supabase not configured" path
- [ ] Every `res.json()` result is runtime-checked before use
- [ ] `grep -c "Number.isFinite" src/lib/kurs.ts` → ≥ `2`
- [ ] `promo-data.ts` formats dates with an explicit `timeZone: "Asia/Jakarta"`
- [ ] The `TZ=UTC` vs `TZ=Asia/Jakarta` outputs in Step 4 are identical
- [ ] Rendered promo date strings are visually unchanged for promos outside the
      00:00–07:00 WIB window
- [ ] No React hydration warnings on the homepage
- [ ] `git diff --name-only` lists only the six in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows any in-scope file changed since `cf1b0f5` and no longer
  matches the excerpts above.
- `Intl.DateTimeFormat("id-ID", …)` produces month abbreviations that differ
  from `MONTHS_ID` and the `formatToParts` workaround in Step 4 does not fully
  restore the original strings. Report the exact before/after strings — a
  visible text change needs the owner's sign-off.
- Adding validation causes any section to fall back to bundled data on a
  *healthy* Supabase response. That means the guard is too strict; report the
  actual response shape rather than loosening the guard blindly.
- You conclude a schema-validation library is needed. It is not; report why you
  think so instead of adding one.

## Maintenance notes

- The `[module]` log prefixes are the debugging interface for "why is the site
  showing demo data". Keep them consistent if a sixth fetcher is added.
- `console.error` on the server surfaces in the hosting platform's logs. If a
  structured logger is ever adopted, these five call sites are the migration
  list.
- **Any future date rendered on this site must specify `timeZone:
  "Asia/Jakarta"`.** There are now two correct exemplars (`news.ts` and
  `promo-data.ts`); a third formatter without an explicit timezone is a bug.
- `kurs.ts` is the only place numbers reach users as currency. It deserves the
  strictest validation in the repo and the first unit test written.
- A reviewer should scrutinise: that no `revalidate` value changed, that the
  fallback datasets are untouched, and that promo date strings render identically.
