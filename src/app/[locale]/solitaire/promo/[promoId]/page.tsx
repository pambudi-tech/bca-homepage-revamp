import PrioritasPromoDetailPage from "@/components/prioritas/PrioritasPromoDetailPage";
import { getPrioritasSourcePromos } from "@/lib/prioritas-source-data";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { getPromos } from "@/lib/promos";
import { PRIORITAS_PROMO_SAMPLE_META } from "@/components/prioritas/prioritas-promo-data";
import { routing } from "@/i18n/routing";

type PromoParams = { locale: string; promoId: string };

export const dynamicParams = false;

export async function generateStaticParams() {
  const promos = await getPromos(new Date());
  const ids = [...new Set([
    ...getPrioritasSourcePromos().map(({ id }) => id),
    ...Object.values(PRIORITAS_PROMO_SAMPLE_META).map(({ id }) => id),
    ...promos.map(({ id }) => id),
    ...getPrivilegePromos("signature").map(({ id }) => id),
  ])];
  return routing.locales.flatMap((locale) => ids.map((promoId) => ({ locale, promoId })));
}

export default async function SolitairePromoDetailPage({ params }: { params: Promise<PromoParams> }) {
  return <PrioritasPromoDetailPage params={params} publicBasePath="/solitaire" />;
}
