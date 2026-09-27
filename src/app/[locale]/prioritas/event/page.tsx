import { getTranslations, setRequestLocale } from "next-intl/server";
import EventPrivilegeExperience from "@/components/prioritas/EventPrivilegeExperience";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import { buildEventDetailRecommendations, EVENT_PROMO_SAMPLES, type EventCategory } from "@/components/prioritas/event-data";

export default async function EventPrivilegePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasContentDetail");
  const recommendations = buildEventDetailRecommendations({
    christies: { title: t("event.recommendationCards.christies.title"), brand: t("event.recommendationCards.christies.brand") },
    symphony: { title: t("event.recommendationCards.symphony.title"), brand: t("event.recommendationCards.symphony.brand") },
  });
  const activeCategory = ["lifestyle", "networking", "arts", "culinary"].includes(category ?? "") ? category as EventCategory : "all";

  const events = EVENT_PROMO_SAMPLES.map((event) => event.id === "sothebys-art-auction" ? { ...event, title: t("event.sothebys.title") } : event);
  const bannerBackdrops = await getFeaturedBannerBackdrops();

  return <EventPrivilegeExperience promos={[...events, ...recommendations]} initialCategory={activeCategory} bannerBackdrops={bannerBackdrops} />;
}
