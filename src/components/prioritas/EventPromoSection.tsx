import PrioritasFeaturedBanner from "@/components/prioritas/PrioritasFeaturedBanner";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import PromoCard from "@/components/promo/PromoCard";
import PromoCarousel from "@/components/promo/PromoCarousel";
import type { Promo } from "@/components/home/promo-data";
import { Link } from "@/i18n/navigation";

export default async function EventPromoSection({ promos, copy, now }: {
  promos: Promo[];
  now: Date;
  copy: {
    eyebrow: string;
    heading: string;
    featuredTitles: string[];
    featuredCta: string;
    viewMore: string;
  };
}) {
  const backdrops = await getFeaturedBannerBackdrops();
  return (
    <section id="event-promo" className="relative overflow-hidden bg-pbrown-600 py-12 text-white xl:py-20">
      <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <header className="mb-12 flex flex-col gap-6 xl:mb-14 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">{copy.eyebrow}</p>
          <h2 className="text-heading max-w-[560px] text-pgold-100 xl:text-display">{copy.heading}</h2>
        </header>

        <PrioritasFeaturedBanner titles={copy.featuredTitles} cta={copy.featuredCta} backdrops={backdrops} />

        <div className="mt-8 xl:hidden">
          <PromoCarousel promos={promos.slice(0, 3)} now={now} loop={false} variant="prioritas" detailHrefBase="/prioritas/event" showEventDate />
        </div>

        <div className="mt-8 hidden gap-8 md:grid md:grid-cols-3 xl:grid">
          {promos.slice(0, 3).map((promo) => (
            <PromoCard key={promo.id} promo={promo} now={now} reveal={false} variant="prioritas" fill detailHref={`/prioritas/event/${promo.id}`} eventDate={"dateTile" in promo ? promo.dateTile as React.ComponentProps<typeof PromoCard>["eventDate"] : undefined} />
          ))}
        </div>

        <Link href="/prioritas/event" className="btn-base mx-auto mt-8 h-12 w-full border border-pbrown-600 bg-pgold-100 text-pbrown-600 transition-colors hover:bg-pgold-300 xl:w-fit">
          <span className="text-base font-semibold text-pbrown-600">{copy.viewMore}</span>
          <span
            aria-hidden
            className="size-5 shrink-0 bg-pbrown-600"
            style={{
              maskImage: "url(/assets/cycle1/pelajari-icon.svg)",
              WebkitMaskImage: "url(/assets/cycle1/pelajari-icon.svg)",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
              maskSize: "contain",
              WebkitMaskSize: "contain",
            }}
          />
        </Link>
      </div>
    </section>
  );
}
