import { resolveFallbackPromos, type Promo } from "@/components/home/promo-data";
import type { AppLocale } from "@/i18n/routing";

// The columns we select from the Supabase `promos` table. `title_en`/`title_zh`
// are optional translations — null until a row has been translated, same
// convention as `products.ts`/`faq.ts`.
type PromoRow = {
  id: string;
  title: string;
  title_en?: string | null;
  title_zh?: string | null;
  cover: string;
  start_at: string;
  end_at: string;
  redeem_count: number;
  // Embedded parent row. Nullable in the response type only because PostgREST
  // returns null if the join ever fails; the FK makes that unreachable.
  brands: { name: string; logo: string } | null;
};

/**
 * Reads the promo cards from Supabase — same approach as `products.ts`:
 * Supabase's auto-generated REST API over plain `fetch`, no extra dependency.
 *
 * Falls back to the bundled seeds whenever Supabase isn't configured, the
 * request fails, or the data is unusable, so the section never renders empty.
 *
 * `now` is passed in (rather than read here) so the badge/timestamp maths on
 * the page and the fallback periods are anchored to the exact same instant.
 */
export async function getPromos(now: Date, locale: AppLocale): Promise<Promo[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return resolveFallbackPromos(now);

  const query = (fields: string) =>
    [
      `select=${fields},cover,start_at,end_at,redeem_count,brands(name,logo)`,
      "is_active=eq.true",
      "order=sort_order.asc",
    ].join("&");

  const request = (fields: string) =>
    fetch(`${url}/rest/v1/promos?${query(fields)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
      next: { revalidate: 300 },
    });

  try {
    // Ask for the i18n columns first and step down if the migration adding
    // them hasn't been run yet, same staged-degrade approach as products.ts —
    // otherwise a missing column 400s the whole request back to bundled data.
    let res = await request("id,title,title_en,title_zh");
    if (!res.ok) res = await request("id,title");
    if (!res.ok) {
      console.error(`[promos] Supabase returned ${res.status} on every fallback query, using bundled fallback`);
      return resolveFallbackPromos(now);
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      console.error("[promos] unexpected response shape, using bundled fallback");
      return resolveFallbackPromos(now);
    }
    const rows = data as PromoRow[];
    // A promo without its brand would render a card with no logo and no brand
    // line, so drop it here rather than letting it reach the carousel.
    const promos = rows
      .filter((r) => r.brands)
      .map((r) => ({
        id: r.id,
        title: (locale === "en" ? r.title_en : locale === "zh" ? r.title_zh : null) ?? r.title,
        brand: r.brands!.name,
        cover: r.cover,
        logo: r.brands!.logo,
        startAt: new Date(r.start_at),
        endAt: new Date(r.end_at),
        redeemCount: r.redeem_count,
      }));
    if (!promos.length) {
      console.error("[promos] no usable rows after filtering, using bundled fallback");
      return resolveFallbackPromos(now);
    }

    return promos;
  } catch (err) {
    console.error("[promos] Supabase fetch failed, using bundled fallback:", err);
    return resolveFallbackPromos(now);
  }
}
