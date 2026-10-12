# Vercel Hobby function budget

The deployment allows at most 12 functions. Next.js route markers are not the
function count: Vercel bundles several routes, adds ISR/Server Action handlers,
and creates the Node proxy function.

`npm run build` uses Webpack, then runs `check:vercel-functions` against the
production output with the pinned official `@vercel/next` builder. The check
counts unique Lambda objects (HTML and RSC aliases share a function), saves
`.next/vercel-functions-report.json`, and exits nonzero above 12. It skips
dependency installation and compilation inside the check. On Vercel, it reuses
the adapter settings supplied by the platform.

Run `npm run check:vercel-functions` to recheck an existing production build.
Do not use this command while another build is writing `.next`.

The 2026-10-12 failure produced 13 bundled functions. Moving the public
Privilege/Banking Solution query tabs to client routers behind Suspense and
redirecting the legacy Prioritas overview URLs reduced the measured output to
8. Static pages still supply all tab data through the existing fetchers and
bundled fallbacks. The client router preserves the URL, links, localized
content, active tab, and invalid-section defaults.

Legacy `/prioritas/overview` and `/prioritas/overview/privilege` paths redirect
to the canonical member routes in every locale, retaining query parameters.
Member rendering remains in the authenticated catch-all route. The member
cookie and preview gate are unchanged.

When adding pages, keep public routes static where possible. Reading server
`searchParams` or `cookies()` can create additional runtime functions. A
successful Next compilation alone does not confirm the deployment budget or
the remote deployment status.
