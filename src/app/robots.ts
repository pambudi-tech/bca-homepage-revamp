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
