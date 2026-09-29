import PrioritasFeaturedBanner from "@/components/prioritas/PrioritasFeaturedBanner";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import PromoCard from "@/components/promo/PromoCard";
import PromoCarousel from "@/components/promo/PromoCarousel";
import type { Promo } from "@/components/home/promo-data";
import { Link } from "@/i18n/navigation";
import { PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";

export default async function EventPromoSection({ promos, copy, now }: {
  promos: Promo[];
  now: Date;
  copy: {
    eyebrow: string;
    heading: string;
    featuredTitles: string[];
    mercedesAdTitle: string;
    mercedesAdCta: string;
    featuredCta: string;
    viewMore: string;
  };
}) {
  const backdrops = await getFeaturedBannerBackdrops(PRIORITAS_EVENT_FEATURED_BANNER_SLIDES);
  return (
    <section id="event-promo" className="relative overflow-hidden bg-pbrown-600 py-12 text-white xl:py-20">
      <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <header className="mb-12 flex flex-col gap-6 xl:mb-14 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">{copy.eyebrow}</p>
          <h2 className="text-heading max-w-[560px] text-pgold-100 xl:text-display">{copy.heading}</h2>
        </header>

        <PrioritasFeaturedBanner
          slides={PRIORITAS_EVENT_FEATURED_BANNER_SLIDES}
          initialIndex={0}
          titles={[
            copy.featuredTitles[0],
            copy.mercedesAdTitle,
            ...copy.featuredTitles.slice(1),
          ]}
          cta={[
            copy.featuredCta,
            copy.mercedesAdCta,
            copy.featuredCta,
            copy.featuredCta,
          ]}
          backdrops={backdrops}
        />

        <div className="mt-4 xl:hidden">
          <PromoCarousel promos={promos.slice(0, 3)} now={now} loop={false} variant="prioritas" detailHrefBase="/prioritas/event" showEventDate usePrioritasButtonLibrary />
        </div>

        <div className="mt-8 hidden gap-8 md:mt-6 md:grid md:grid-cols-3 md:gap-6 xl:grid">
          {promos.slice(0, 3).map((promo) => (
            <PromoCard key={promo.id} promo={promo} now={now} reveal={false} variant="prioritas" fill detailHref={`/prioritas/event/${promo.id}`} eventDate={"dateTile" in promo ? promo.dateTile as React.ComponentProps<typeof PromoCard>["eventDate"] : undefined} usePrioritasButtonLibrary />
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-6">
          <Link href="/prioritas/event" className={prioritasButtonClassName({ surface: "inverse", size: "large", className: "w-full xl:w-fit" })}>
            <span className="prio-button__label">{copy.viewMore}</span>
            <PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" />
          </Link>
        </div>
      </div>
    </section>
  );
}
