# Plan 005: Close the login open-redirect and add security response headers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat cf1b0f5..HEAD -- src/app/[locale]/login/page.tsx src/proxy.ts next.config.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (Step 1) / MED (Step 3 — a wrong CSP breaks the page)
- **Depends on**: `plans/001-green-the-lint-gate.md`
- **Category**: security
- **Planned at**: commit `cf1b0f5`, 2026-07-22

## Why this matters

This is a bank's homepage. Two defensive gaps, both cheap to close.

**1. Open redirect in the preview-login server action.** The `redirectTo` value
travels from the URL query string, into a hidden form field, and straight into
`redirect()` with no check that it is a same-origin relative path. A crafted
link of the form `/login?redirectTo=<external URL>` sends the visitor to an
arbitrary site immediately after they enter credentials on a BCA-branded page.
That is the classic phishing hand-off, and it is more damaging here than it
would be on an ordinary site precisely because of whose brand is on the page.

Nothing legitimate needs this: `src/proxy.ts:30` only ever writes a same-origin
`pathname` into that parameter.

**2. No security response headers at all.** `next.config.ts` contains no
`headers()` function, so the app ships with no `X-Frame-Options`, no
`Content-Security-Policy`, no `Referrer-Policy` and no `X-Content-Type-Options`.
A bank-branded page that any site can silently embed in an iframe is a
clickjacking surface.

**Hard constraint for this plan:** the repository owner requires that the site
looks and behaves exactly as it does today. Headers are invisible when correct
and catastrophic when wrong — a too-strict CSP will blank the page or break the
reCAPTCHA widget. Step 3 is therefore staged deliberately: report-only first,
enforce only after you have proven the console is clean.

## Current state

### The open redirect — `src/app/[locale]/login/page.tsx:6-26`

```tsx
async function login(formData: FormData) {
  "use server";

  const password = formData.get("password");
  const expected = process.env.PREVIEW_PASSWORD;
  const redirectTo = (formData.get("redirectTo") as string) || "/";   // <-- line 11
  const loginPath = formData.get("loginPath") as string;

  if (typeof password === "string" && password === expected) {
    (await cookies()).set(AUTH_COOKIE_NAME, expected, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect(redirectTo);                                              // <-- line 22
  }

  redirect(`${loginPath}?error=1&redirectTo=${encodeURIComponent(redirectTo)}`);
}
```

The value reaches the form from `searchParams` at line 36 and is rendered into a
hidden input at line 63:

```tsx
  const { error, redirectTo = "/" } = await searchParams;
  ...
  <input type="hidden" name="redirectTo" value={redirectTo} />
```

### The only legitimate writer — `src/proxy.ts:26-32`

```ts
  if (password && !LOGIN_PATHS.has(pathname)) {
    const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (cookie !== password) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
```

`pathname` is always a same-origin path beginning with `/`.

### `next.config.ts` in full

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
```

### What a CSP on this site must not break

- **Google reCAPTCHA v2** — `src/components/home/HaloBcaChat.tsx:59` injects a
  script from `https://www.google.com/recaptcha/api.js`, which in turn loads
  from `https://www.gstatic.com` and renders an iframe from `https://www.google.com`.
- **Next.js runtime** — the framework emits inline bootstrap scripts and
  `next/font` emits inline styles. Tailwind v4 also produces inline style
  attributes in places.
- **Supabase** — server-side `fetch` only, so it does **not** need a
  `connect-src` entry for the browser. Confirm this rather than assuming it.
- **Images** — all assets are same-origin under `public/`, plus whatever `image`
  URLs Supabase rows carry. Check a live row before locking `img-src` down.

### Note on `src/lib/preview-auth.ts`

```ts
export const AUTH_COOKIE_NAME = "preview_auth";
```

The cookie's *value* is currently the shared password itself
(`login/page.tsx:15`), and `proxy.ts:28` compares it with `!==`. This is noted
for completeness but is **out of scope** — see below.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npm run lint` | exit 0 |
| Typecheck | `npm run typecheck` | exit 0 |
| Dev server | `npm run dev` | starts on :3000 |
| Production build | `npm run build` | exit 0 |
| Production server | `npm run start` | serves on :3000 |
| Inspect headers | `curl -sI http://localhost:3000/` | shows response headers |

There is **no test suite** in this repository. Do not try to run one.

**Note:** header configuration in `next.config.ts` does **not** apply in
`npm run dev` in all cases — verify headers against `npm run build && npm run start`.

## Scope

**In scope** (the only files you should modify):
- `src/app/[locale]/login/page.tsx`
- `next.config.ts`

**Out of scope** (do NOT touch, even though they look related):
- **Changing what is stored in the auth cookie.** Storing a derived token
  instead of the password itself is a real improvement, but it changes the
  middleware comparison and would log out every existing preview session.
  Deliberately deferred — recorded in `plans/README.md` as a known follow-up.
- **Constant-time password comparison in `src/proxy.ts`.** A timing attack
  against a shared preview password is not a credible threat here; the noise of
  a network round-trip dwarfs the signal. Recorded and rejected.
- **`src/proxy.ts` generally.** Its `redirectTo` writer is already safe.
- **The reCAPTCHA test-key fallback** (`HaloBcaChat.tsx:11-12`). That is a
  pre-launch checklist item, not a code change — see `plans/README.md`.
- Any `<img>` tag anywhere.

## Git workflow

- Branch: `advisor/005-harden-preview-gate-and-headers`
- Commit the redirect fix and the headers separately — the first is trivially
  safe, the second may need reverting.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Reject non-relative redirect targets

In `src/app/[locale]/login/page.tsx`, add a validator above the `login` action
and apply it to **both** `redirect()` calls:

```ts
/**
 * Only ever redirect within this site. `redirectTo` arrives from the query
 * string, so without this an attacker-supplied absolute URL would turn the
 * preview gate into an open redirect off a BCA-branded domain — the classic
 * phishing hand-off. `proxy.ts` only ever writes a same-origin pathname here,
 * so nothing legitimate is lost.
 */
function safeRedirectTarget(value: unknown): string {
  if (typeof value !== "string") return "/";
  // Must be a single-slash-rooted path. `//evil.example` is protocol-relative
  // and `https://…` is absolute — both are external.
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  // A backslash is normalised to a forward slash by some user agents, so
  // `/\evil.example` can escape the origin too.
  if (value.includes("\\")) return "/";
  return value;
}
```

Then:

```ts
  const redirectTo = safeRedirectTarget(formData.get("redirectTo"));
```

Apply the same normalisation to the value read from `searchParams` at line 36,
so a hostile value never even reaches the hidden input:

```tsx
  const { error, redirectTo: rawRedirectTo } = await searchParams;
  const redirectTo = safeRedirectTarget(rawRedirectTo);
```

**Verify**:
- `npm run typecheck` → exit 0
- `npm run lint` → exit 0
- Manual, with `PREVIEW_PASSWORD` set in `.env.local` and `npm run dev` running:
  1. Visit `/login?redirectTo=/promo`, log in → lands on `/promo`. (Normal path
     still works.)
  2. Visit `/login?redirectTo=https://example.com`, log in → lands on `/`, **not**
     example.com.
  3. Visit `/login?redirectTo=//example.com`, log in → lands on `/`.
  4. Get the password wrong once → the error path still returns you to the login
     page with the error message shown.

### Step 2: Add the three uncontroversial headers

In `next.config.ts`, add a `headers()` function to `nextConfig`:

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
```

These three cannot break rendering. `X-Frame-Options: DENY` blocks *this site*
being framed by others; it does **not** affect the reCAPTCHA iframe, which is
this page framing someone else.

**Verify**:
- `npm run build` → exit 0
- `npm run start`, then `curl -sI http://localhost:3000/ | grep -i "x-frame-options\|x-content-type\|referrer-policy"`
  → all three present
- Load the homepage in a browser: visually identical, console clean, HaloBCA chat
  still opens and its reCAPTCHA checkbox still renders.

### Step 3: Add a CSP — report-only first

**Do not skip the report-only stage.** Add a second header entry:

```ts
{ key: "Content-Security-Policy-Report-Only", value: CSP },
```

with a starting policy along these lines (adjust only as the violations you
actually observe require):

```ts
const CSP = [
  "default-src 'self'",
  // Next.js emits inline bootstrap scripts; reCAPTCHA loads from google/gstatic.
  "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
  // next/font and Tailwind emit inline styles.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "frame-src https://www.google.com",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
```

Then **exercise the whole site** with the console open and collect every CSP
violation report:

- homepage in all three locales (`/`, `/en`, `/zh`)
- the intro preloader
- open the mega menu, the mobile menu, the search dropdown
- open the HaloBCA chat **and confirm the reCAPTCHA checkbox renders and can be
  ticked**
- the cookie banner
- the `/login` page

Widen the policy only for violations you actually see, and write a one-line
comment next to any directive you had to loosen explaining which feature needed
it.

**Verify**: zero CSP violation reports in the console across all of the above.

### Step 4: Enforce the CSP

Only once Step 3 is clean, rename the header key from
`Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

Re-run the entire Step 3 checklist against `npm run build && npm run start`.

**Verify**:
- `curl -sI http://localhost:3000/ | grep -i content-security-policy` → present,
  not report-only
- Every surface in the Step 3 list behaves and looks exactly as it did before
  this plan
- The HaloBCA reCAPTCHA renders and is interactive

If **anything** breaks and you cannot fix it by a narrowly-scoped directive,
revert to `Content-Security-Policy-Report-Only`, leave it that way, and report.
A report-only CSP that ships is a genuine win; a broken page is not.

## Test plan

No test framework exists in this repository and this plan does not add one.
Verification is:

1. The four redirect scenarios in Step 1.
2. The header presence checks in Steps 2 and 4 via `curl -sI`.
3. The full surface walk-through in Step 3, twice (report-only, then enforced).

`safeRedirectTarget` is a pure function and is an ideal first unit test once a
runner exists — note it as a follow-up, do not add a runner here.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` exits 0
- [ ] `/login?redirectTo=https://example.com` lands on `/` after a successful login
- [ ] `/login?redirectTo=//example.com` lands on `/` after a successful login
- [ ] `/login?redirectTo=/promo` still lands on `/promo`
- [ ] `curl -sI` shows `X-Frame-Options`, `X-Content-Type-Options` and
      `Referrer-Policy`
- [ ] A CSP header is present — enforced if clean, report-only if not, and the
      plan report says which
- [ ] The HaloBCA chat's reCAPTCHA checkbox renders and is interactive
- [ ] All three locales render identically to before
- [ ] `git diff --name-only` lists only `src/app/[locale]/login/page.tsx` and
      `next.config.ts`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows either in-scope file changed since `cf1b0f5` and no
  longer matches the excerpts above.
- A CSP directive cannot be made to work without `'unsafe-eval'`. Do not add it;
  report what required it.
- Enforcing the CSP breaks reCAPTCHA and widening `frame-src` / `script-src` to
  the Google origins does not fix it. Ship report-only and report.
- You find yourself needing to modify `src/proxy.ts` — the redirect writer there
  is already safe, and the middleware is load-bearing for the whole preview gate.
- Fixing the redirect appears to require changing the cookie contents. It does
  not; that is a separate deferred item.

## Maintenance notes

- **`safeRedirectTarget` must guard every future redirect that takes a
  user-supplied target.** If a second such flow appears, move the function to
  `src/lib/preview-auth.ts` and share it.
- The CSP will need updating whenever a third-party embed is added. The
  reCAPTCHA entries (`https://www.google.com`, `https://www.gstatic.com`) are the
  only external origins today — anything else appearing in `script-src` deserves
  scrutiny in review.
- Known follow-ups deliberately deferred out of this plan, recorded so they are
  not lost:
  - the auth cookie stores the shared password verbatim rather than a derived
    token (`login/page.tsx:15`);
  - `proxy.ts:28` compares it non-constant-time;
  - `cookies().set(..., { secure: true })` means the gate cannot be exercised
    over plain `http://` — relevant if anyone tests on a LAN address rather than
    `localhost`;
  - the reCAPTCHA falls back to Google's public always-pass test key when
    `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is unset, and no token is verified
    server-side because no chat backend exists yet.
- A reviewer should scrutinise: that the CSP was actually exercised against the
  reCAPTCHA path, and that no directive was loosened without a comment saying why.
