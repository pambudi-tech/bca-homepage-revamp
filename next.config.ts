import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    // Lets the navbar's own elements (segment pill, active tab fill, tab
    // row) morph smoothly between routes instead of hard-swapping — see
    // the `viewTransitionName`s in Navbar.tsx / globals.css.
    viewTransition: true,
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
    ];
  },
};

export default withNextIntl(nextConfig);
