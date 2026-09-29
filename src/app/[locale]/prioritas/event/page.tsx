import { setRequestLocale } from "next-intl/server";
import EventPrivilegeExperience from "@/components/prioritas/EventPrivilegeExperience";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";
import type { EventCategory } from "@/components/prioritas/event-data";
import { getPrioritasSourceEvents } from "@/lib/prioritas-source-data";

export default async function EventPrivilegePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const activeCategory = ["lifestyle", "networking", "arts", "culinary"].includes(category ?? "") ? category as EventCategory : "all";
  const events = getPrioritasSourceEvents();
  const bannerBackdrops = await getFeaturedBannerBackdrops(PRIORITAS_EVENT_FEATURED_BANNER_SLIDES);

  return <EventPrivilegeExperience promos={events} initialCategory={activeCategory} bannerBackdrops={bannerBackdrops} />;
}
