import PrioritasPromoDetailPage from "@/components/prioritas/PrioritasPromoDetailPage";

type PromoParams = { locale: string; promoId: string };

export default function PrioritasPromoDetailRoute({ params }: { params: Promise<PromoParams> }) {
  return <PrioritasPromoDetailPage params={params} />;
}
