import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import assetRedirects from "./src/components/asset-bank/asset-redirects.json";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Verified report-only first (zero violations across all locales, mega menu,
// search dropdown, mobile menu, cookie banner, HaloBCA chat + reCAPTCHA,
// /login — see plans/005-harden-preview-gate-and-headers.md Step 3) before
// enforcing. Next.js emits inline bootstrap scripts and next/font + Tailwind
// emit inline styles, hence 'unsafe-inline' on both; reCAPTCHA is the only
// third-party embed today.
// `next dev`'s React DevTools integration reconstructs component stacks via
// eval(), which the production CSP correctly forbids — so dev needs its own
// looser copy. This never ships: `npm run build`/`next start` always get the
// strict policy above.
const DEV_SCRIPT_SRC = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV_SCRIPT_SRC} https://www.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "frame-src https://www.google.com",
  "connect-src 'self' https://tile.openstreetmap.org",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Lets the navbar's own elements (segment pill, active tab fill, tab
    // row) morph smoothly between routes instead of hard-swapping — see
    // the `viewTransitionName`s in Navbar.tsx / globals.css.
    viewTransition: true,
  },
  async redirects() {
    // Old listing URLs open the corresponding hub tab; asset aliases stay valid.
    return [
      ...["", "/:locale(id|en|zh)"].flatMap(prefix => [
        { path: "lifestyle-privilege", section: "lifestyle" },
        { path: "event", section: "event" },
        { path: "promo", section: "promo" },
      ].map(({ path, section }) => ({
        source: `${prefix}/:brand(prioritas|solitaire)/${path}`,
        destination: `${prefix ? "/:locale" : ""}/:brand/privilege?section=${section}`,
        permanent: false,
      }))),
      ...["", "/:locale(id|en|zh)"].map(prefix => ({
        source: `${prefix}/:brand(prioritas|solitaire)/banking-solution/wealth-insight`,
        destination: `${prefix ? "/:locale" : ""}/:brand/banking-solution?section=wealth`,
        permanent: false,
      })),
      ...Object.entries(assetRedirects).map(([source, destination]) => ({ source, destination: encodeURI(destination), permanent: true })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
      // The catalog embeds only its own specimen route to preserve real
      // responsive breakpoints and contain fixed navigation/overlay components.
      ...["/component-catalog", "/:locale(id|en|zh)/component-catalog"].flatMap((source) => [
        {
          source,
          headers: [{ key: "Content-Security-Policy", value: CSP.replace("frame-src https://www.google.com", "frame-src 'self' https://www.google.com") }],
        },
        {
          source: `${source}/stage`,
          headers: [
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Content-Security-Policy", value: CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'") },
          ],
        },
      ]),
      // Only the documentation example documents can be framed by this origin.
      ...["/design-tokens", "/:locale(id|en|zh)/design-tokens"].flatMap((source) => [
        {
          source,
          headers: [{ key: "Content-Security-Policy", value: CSP.replace("frame-src https://www.google.com", "frame-src 'self' https://www.google.com") }],
        },
        {
          source: `${source}/preview/:example(homepage|index|detail)`,
          headers: [
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Content-Security-Policy", value: CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'") },
          ],
        },
      ]),
    ];
  },
};

export default withNextIntl(nextConfig);
