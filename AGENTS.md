<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repo-specific conventions

## Stack facts

- Next.js 16.2.12 (App Router), React 19.2.4, next-intl 4.13.2, Tailwind CSS
  4.3.2, Lenis 1.3.25, three.js. TypeScript strict. npm.
- **Middleware is `src/proxy.ts`, exporting `proxy()` — not `middleware.ts`.**
  This differs from most training data; don't go looking for the usual file.
- Verification gates: `npm run lint`, `npm run typecheck`, `npm run build`.
  **There is no test framework.** Don't add one without being asked; don't
  assume test output is part of "done".
- `<img>`, not `next/image`, is used everywhere deliberately (84
  `@next/next/no-img-element` lint warnings, expected). The hero and product
  cards use layered subject/background compositions with hand-tuned CSS that
  the owner has explicitly ruled out migrating. Do not "fix" this.

## The seven load-bearing conventions

1. **The preloader handshake.** `src/components/Preloader.tsx` exports
   `onPreloaderDone()` and fires `PRELOADER_DONE_EVENT`
   (`"bca:preloader-done"`) once, but the `.pre-root` element stays mounted
   for ~1.35s after. Consumers must call `onPreloaderDone()` — never subscribe
   to the event by hand, never test for `.pre-root`'s presence. Getting this
   wrong can leave the page invisible.
2. **`ScrollReveal` scans the DOM once, on mount.** A subtree that mounts
   later must not emit `data-reveal` — nothing will ever observe it, and
   `globals.css` holds `[data-reveal]` at `opacity: 0` permanently. See
   `src/components/ScrollReveal.tsx` and the note in
   `src/lib/useLayoutVariant.ts`.
3. **Animation loops must be parked with `useIsLive`** (`src/lib/useIsLive.ts`)
   when a component may be mounted-but-hidden (this page mounts both mobile
   and desktop forms of several sections and hides one with CSS) — otherwise
   a hidden component's timers keep running.
4. **Fetch-with-bundled-fallback.** Every `src/lib/*.ts` data fetcher
   (`banners`, `faq`, `kurs`, `megamenu`, `news`, `products`, `promos`) falls
   back to a bundled dataset in `src/components/home/*-data.ts` on failure or
   missing env vars, so no section ever renders empty. New fetchers must match
   this shape.
5. **Dates are formatted in `Asia/Jakarta`, explicitly** — see the
   `timeZone: "Asia/Jakarta"` in `src/lib/news.ts`. Don't rely on server
   locale/timezone defaults.
6. **User-facing strings go through next-intl**, present in all three message
   files (`messages/{id,en,zh}.json`), with identical key sets. Don't hardcode
   copy in a component.
7. **Design tokens, not literals.** Color, type, elevation and motion are
   tokens in the `@theme` block of `src/app/globals.css`; the pill CTA is
   `btn-base btn-primary` / `btn-base btn-secondary` (defined via `@utility` in
   the same file). New UI reaches for a token or the button utility rather
   than hand-writing a hex, a `tracking-[…]`, or a `shadow-[…]`. See
   [`docs/design-tokens.md`](docs/design-tokens.md) for the full reference and
   the rule for when a new value earns a token.

## Verification

Before considering any change done: `npm run lint` (0 errors — currently 87
pre-existing warnings, all accounted for above and in `plans/README.md`),
`npm run typecheck` (0 errors), `npm run build` (must succeed). There is no
test suite to run.
