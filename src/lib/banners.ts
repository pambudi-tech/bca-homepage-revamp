import { SLIDES, type Slide } from "@/components/home/hero-slides";
import type { AppLocale } from "@/i18n/routing";

// A shape matching the columns we select from the Supabase `banners` table.
// `_en`/`_zh` are optional translations (see `supabase/banner-i18n.sql`) —
// null until a row has been translated.
type BannerRow = {
  image: string;
  alt: string;
  title: string;
  cta_label: string;
  cta_icon: string;
  cta_href: string | null;
  title_en: string | null;
  title_zh: string | null;
  alt_en: string | null;
  alt_zh: string | null;
  cta_label_en: string | null;
  cta_label_zh: string | null;
};

/**
 * Reads the hero banner slides from Supabase. Supabase auto-generates a REST
 * API over the `banners` table, so we just `fetch` it (same approach as
 * `kurs.ts`) — no extra dependency, and Next caches the response.
 *
 * Falls back to the bundled SLIDES whenever Supabase isn't configured or the
 * request fails, so the hero never renders empty.
 */
export async function getBanners(locale: AppLocale): Promise<Slide[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return SLIDES;

  try {
    const res = await fetch(
      `${url}/rest/v1/banners?select=image,alt,title,cta_label,cta_icon,cta_href,title_en,title_zh,alt_en,alt_zh,cta_label_en,cta_label_zh&is_active=eq.true&order=sort_order.asc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return SLIDES;

    const rows: BannerRow[] = await res.json();
    if (!rows.length) return SLIDES;

    return rows.map((r) => ({
      image: r.image,
      alt: (locale === "en" ? r.alt_en : locale === "zh" ? r.alt_zh : null) ?? r.alt,
      title: (locale === "en" ? r.title_en : locale === "zh" ? r.title_zh : null) ?? r.title,
      cta: {
        label:
          (locale === "en" ? r.cta_label_en : locale === "zh" ? r.cta_label_zh : null) ??
          r.cta_label,
        icon: r.cta_icon,
        variant: "primary" as const,
      },
    }));
  } catch {
    return SLIDES;
  }
}
