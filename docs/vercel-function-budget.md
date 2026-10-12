# Vercel Hobby function budget

The deployment allows at most 12 functions. Next.js route markers are not the
function count: Vercel bundles several routes, adds ISR/Server Action handlers,
and creates the Node proxy function.

`npm run build` uses Webpack with standard Next output, then runs
`check:vercel-functions` against the
production output with the pinned official `@vercel/next` builder. The check
counts unique Lambda objects (HTML and RSC aliases share a function), saves
`.next/vercel-functions-report.json`, and exits nonzero above 12. It skips
dependency installation and compilation inside the check. It reuses deployment
settings supplied by Vercel.

`scripts/build-next.mjs` removes the platform-injected `NEXT_ADAPTER_PATH` only
for the Next compilation child process. This deliberately keeps local and
remote builds on Vercel's supported standard-output bundling path. Next 16's
new adapter instead returns `buildOutputPath`, and its `.func` folders are
bundled later by the platform; counting those folders would overestimate the
budget. Mixing that adapter with the Lambda-object check caused the subsequent
`Object.entries(undefined)` deployment failure. An unexpected builder result
now fails with an explicit diagnostic rather than accepting an unknown count.

To reproduce the platform invocation locally, run the pinned `@vercel/next`
builder with `NEXT_ENABLE_ADAPTER=1` and `buildCommand: 'npm run build'`. The
wrapper must produce standard output even when the parent builder injects an
adapter. Check the resulting bundled Lambda objects, not raw `.func` folders.

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
