import { setRequestLocale } from "next-intl/server";
import EventPrivilegeExperience from "@/components/prioritas/EventPrivilegeExperience";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";
import { getPrioritasSourceEvents } from "@/lib/prioritas-source-data";

export default async function SolitaireEventPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const events = getPrioritasSourceEvents();
  const bannerBackdrops = await getFeaturedBannerBackdrops(PRIORITAS_EVENT_FEATURED_BANNER_SLIDES);
  return <EventPrivilegeExperience promos={events} bannerBackdrops={bannerBackdrops} publicBasePath="/solitaire" />;
}
