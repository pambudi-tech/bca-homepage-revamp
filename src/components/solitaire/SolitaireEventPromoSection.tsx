import PrioritasFeaturedBanner from "@/components/prioritas/PrioritasFeaturedBanner";
import SolitaireEventPromoDesktopSlider from "@/components/solitaire/SolitaireEventPromoDesktopSlider";
import type { FeaturedBannerSlide } from "@/components/prioritas/featured-banner-data";
import { solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";
import { getImageBackdropColor } from "@/lib/image-color";
import { Link } from "@/i18n/navigation";

type EventSlide = {
  image: string;
  title: string;
  action: string;
  alt: string;
};

export default async function SolitaireEventPromoSection({
  eyebrow,
  heading,
  viewMore,
  slides,
}: {
  eyebrow: string;
  heading: string;
  viewMore: string;
  slides: [EventSlide, EventSlide, EventSlide, EventSlide, EventSlide];
}) {
  const bannerSlides: FeaturedBannerSlide[] = slides.map((slide, index) => ({
    id: `solitaire-event-${index}`,
    image: slide.image,
    alt: slide.alt,
  }));
  const backdrops = Object.fromEntries(await Promise.all(
    bannerSlides.map(async (slide) => [
      slide.id,
      await getImageBackdropColor(slide.image.split("?")[0]),
    ] as const)
  ));

  return (
    <section id="event-promo" className="relative isolate min-h-[720px] overflow-hidden py-12 text-neutral-900 xl:min-h-[800px] xl:py-20" style={{ backgroundImage: "linear-gradient(to bottom, var(--color-neutral-400) 0%, var(--color-neutral-600) 50%, var(--color-neutral-400) 100%)" }}>
      <img
        src="/assets/solitaire/event-promo/background.jpeg?v=1"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 block h-auto w-full object-contain object-bottom xl:inset-0 xl:size-full xl:object-cover [mask-image:linear-gradient(to_top,black_0%,black_58%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_0%,black_58%,transparent_100%)]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <header className="mb-12 flex flex-col gap-6 xl:mb-8 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow uppercase text-neutral-900 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">
            {eyebrow}
          </p>
          <div className="flex flex-col gap-6 xl:flex-1 xl:flex-row xl:items-start xl:justify-between xl:gap-10">
            <h2 className="text-heading max-w-[560px] text-neutral-900 xl:text-display">{heading}</h2>
            <div className="hidden shrink-0 xl:block">
              <Link href="/solitaire/event" className={solitaireButtonClassName({ variant: "secondary", size: "large" })}>
                <span className="prio-button__label">{viewMore}</span>
                <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5 brightness-0" />
              </Link>
            </div>
          </div>
        </header>

        <div className="xl:hidden">
          <PrioritasFeaturedBanner
            slides={bannerSlides}
            initialIndex={0}
            titles={slides.map((slide) => slide.title)}
            cta={slides.map((slide) => slide.action)}
            backdrops={backdrops}
            buttonTheme="solitaire"
          />
        </div>

        <div className="hidden xl:block">
          <SolitaireEventPromoDesktopSlider slides={slides} />
        </div>

        <div className="xl:hidden">
          <Link href="/solitaire/event" className={solitaireButtonClassName({ variant: "secondary", size: "large", className: "mt-8 w-full" })}>
            <span className="prio-button__label">{viewMore}</span>
            <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5 brightness-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
