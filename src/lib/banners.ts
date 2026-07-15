import { SLIDES, type Slide } from "@/components/home/hero-slides";

// A shape matching the columns we select from the Supabase `banners` table.
type BannerRow = {
  image: string;
  alt: string;
  title: string;
  cta_label: string;
  cta_icon: string;
  cta_href: string | null;
};

/**
 * Reads the hero banner slides from Supabase. Supabase auto-generates a REST
 * API over the `banners` table, so we just `fetch` it (same approach as
 * `kurs.ts`) — no extra dependency, and Next caches the response.
 *
 * Falls back to the bundled SLIDES whenever Supabase isn't configured or the
 * request fails, so the hero never renders empty.
 */
export async function getBanners(): Promise<Slide[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return SLIDES;

  try {
    const res = await fetch(
      `${url}/rest/v1/banners?select=image,alt,title,cta_label,cta_icon,cta_href&is_active=eq.true&order=sort_order.asc`,
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
      alt: r.alt,
      title: r.title,
      cta: { label: r.cta_label, icon: r.cta_icon, variant: "primary" as const },
    }));
  } catch {
    return SLIDES;
  }
}
