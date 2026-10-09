import { setRequestLocale } from "next-intl/server";
import { SOLITAIRE_EVENT_SLIDES } from "@/components/solitaire/event-slides";
import CatalogStage from "@/components/catalog/CatalogStage";
import { getKursHariIni } from "@/lib/kurs";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";

export default async function CatalogStagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [rates, backdrops] = await Promise.all([getKursHariIni(), getFeaturedBannerBackdrops([...PRIORITAS_EVENT_FEATURED_BANNER_SLIDES, ...SOLITAIRE_EVENT_SLIDES.map((slide,index)=>({id:`solitaire-event-${index}`,image:slide.image.split("?")[0],alt:slide.alt}))])]);
  return <CatalogStage rates={rates} backdrops={backdrops} />;
}
