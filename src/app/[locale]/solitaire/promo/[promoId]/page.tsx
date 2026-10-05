import PrioritasPromoDetailPage from "@/components/prioritas/PrioritasPromoDetailPage";

type PromoParams = { locale: string; promoId: string };

export default async function SolitairePromoDetailPage({ params }: { params: Promise<PromoParams> }) {
  return <PrioritasPromoDetailPage params={params} publicBasePath="/solitaire" />;
}
