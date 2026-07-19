import { resolveFallbackPromos, type Promo } from "@/components/home/promo-data";

// The columns we select from the Supabase `promos` table.
type PromoRow = {
  id: string;
  title: string;
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
export async function getPromos(now: Date): Promise<Promo[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return resolveFallbackPromos(now);

  const query = [
    "select=id,title,cover,start_at,end_at,redeem_count,brands(name,logo)",
    "is_active=eq.true",
    "order=sort_order.asc",
  ].join("&");

  try {
    const res = await fetch(`${url}/rest/v1/promos?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
      next: { revalidate: 300 },
    });
    if (!res.ok) return resolveFallbackPromos(now);

    const rows: PromoRow[] = await res.json();
    // A promo without its brand would render a card with no logo and no brand
    // line, so drop it here rather than letting it reach the carousel.
    const promos = rows
      .filter((r) => r.brands)
      .map((r) => ({
        id: r.id,
        title: r.title,
        brand: r.brands!.name,
        cover: r.cover,
        logo: r.brands!.logo,
        startAt: new Date(r.start_at),
        endAt: new Date(r.end_at),
        redeemCount: r.redeem_count,
      }));
    if (!promos.length) return resolveFallbackPromos(now);

    return promos;
  } catch {
    return resolveFallbackPromos(now);
  }
}
