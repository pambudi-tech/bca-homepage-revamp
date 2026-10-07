import PrioritasPromoDetailPage from "@/components/prioritas/PrioritasPromoDetailPage";
import { EVENT_PROMO_SAMPLES } from "@/components/prioritas/event-data";
import { PRIORITAS_PROMO_SAMPLE_META } from "@/components/prioritas/prioritas-promo-data";
import { getPromos } from "@/lib/promos";
import { getPrioritasSourceEvents, getPrioritasSourcePromos } from "@/lib/prioritas-source-data";
import { routing } from "@/i18n/routing";

type PromoParams = { locale: string; promoId: string };

export const dynamicParams = false;

export async function generateStaticParams() {
  const promos = await getPromos(new Date());
  const ids = [...new Set([
    ...getPrioritasSourcePromos().map(({ id }) => id),
    ...getPrioritasSourceEvents().map(({ id }) => id),
    ...EVENT_PROMO_SAMPLES.map(({ id }) => id),
    ...Object.values(PRIORITAS_PROMO_SAMPLE_META).map(({ id }) => id),
    ...promos.map(({ id }) => id),
  ])];
  return routing.locales.flatMap((locale) => ids.map((promoId) => ({ locale, promoId })));
}

export default function PrioritasPromoDetailRoute({ params }: { params: Promise<PromoParams> }) {
  return <PrioritasPromoDetailPage params={params} />;
}
