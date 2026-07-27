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
