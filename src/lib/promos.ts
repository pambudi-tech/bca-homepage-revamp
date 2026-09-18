import { SCRAPED_PROMOS } from "@/components/home/scraped-promos";
import { SCRAPED_PROMOS_BATCH_2 } from "@/components/home/scraped-promos-batch-2";
import type { Promo } from "@/components/home/promo-data";

/** Local BCA promo snapshot used by the prototype before CMS/Supabase wiring. */
export async function getPromos(now: Date): Promise<Promo[]> {
  void now;
  return [...SCRAPED_PROMOS, ...SCRAPED_PROMOS_BATCH_2].map((promo) => ({
    ...promo,
    cover: promo.cover || promo.listingCover,
    startAt: new Date(promo.startAt),
    endAt: new Date(promo.endAt),
    redeemCount: 0,
  }));
}
