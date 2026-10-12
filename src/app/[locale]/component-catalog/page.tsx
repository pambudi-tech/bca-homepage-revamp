import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getImageBackdropColor } from "@/lib/image-color";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";
import { getKursHariIni } from "@/lib/kurs";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";
import { SOLITAIRE_EVENT_SLIDES } from "@/components/solitaire/event-slides";
import ComponentCatalog from "@/components/catalog/ComponentCatalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "componentCatalog" });
  return { title: t("title"), description: t("subtitle"), robots: { index: false, follow: false } };
}

export default async function ComponentCatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const wealthBackdrops = Object.fromEntries(await Promise.all(
    [insightAssets.house[0], insightAssets.market[0]].map(async asset => [asset.key, await getImageBackdropColor(asset.image)])
  ));
  const [rates, eventBackdrops] = await Promise.all([getKursHariIni(), getFeaturedBannerBackdrops([...PRIORITAS_EVENT_FEATURED_BANNER_SLIDES, ...SOLITAIRE_EVENT_SLIDES.map((slide,index)=>({id:`solitaire-event-${index}`,image:slide.image.split("?")[0],alt:slide.alt}))])]);
  return <ComponentCatalog wealthBackdrops={wealthBackdrops} rates={rates} eventBackdrops={eventBackdrops} />;
}
