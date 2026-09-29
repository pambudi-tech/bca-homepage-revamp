"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useIsLive } from "@/lib/useIsLive";
import { FEATURED_BANNER_SLIDES, type FeaturedBannerSlide } from "@/components/prioritas/featured-banner-data";
import { PrioritasButton, PrioritasButtonIcon } from "@/components/prioritas/PrioritasButton";

const AUTOPLAY_MS = 6000;
const INDICATOR_LENGTH = 40;

export default function PrioritasFeaturedBanner({ titles, cta, backdrops, slideHrefs, slides = FEATURED_BANNER_SLIDES, initialIndex = 1 }: { titles: string[]; cta: string | string[]; backdrops: Record<string, string>; slideHrefs?: Record<string, string>; slides?: readonly FeaturedBannerSlide[]; initialIndex?: number }) {
  const t = useTranslations("promo");
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [hoveringIndicator, setHoveringIndicator] = useState(false);
  const pausedRef = useRef(false);
  const progressLineRef = useRef<SVGLineElement>(null);
  const touchStartX = useRef<number | null>(null);
  const bannerWasSwiped = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useIsLive(rootRef);
  const activeSlide = slides[activeIndex];
  const activeBackdrop = backdrops[activeSlide.id];
  const activeCta = typeof cta === "string" ? cta : cta[activeIndex];

  useEffect(() => {
    pausedRef.current = paused || hoveringIndicator;
  }, [paused, hoveringIndicator]);

  useAutoplayProgress({
    activeIndex,
    count: slides.length,
    durationMs: AUTOPLAY_MS,
    circumference: INDICATOR_LENGTH,
    progressRef: progressLineRef,
    pausedRef,
    live,
    onAdvance: () => setActiveIndex((current) => (current + 1) % slides.length),
  });

  const goTo = (index: number) => {
    setActiveIndex(index);
    setPaused(false);
  };

  const goBy = (delta: number) => goTo((activeIndex + delta + slides.length) % slides.length);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    bannerWasSwiped.current = false;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    const distance = endX === undefined ? 0 : endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) >= 40) {
      bannerWasSwiped.current = true;
      goBy(distance < 0 ? 1 : -1);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative h-[400px] w-full overflow-hidden rounded-xl border border-neutral-100/10 bg-pbrown-900 xl:h-[400px]"
      style={{ backgroundColor: activeBackdrop }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => (
        <img key={slide.id} src={slide.image} alt={slide.alt} className="absolute inset-x-0 top-0 h-[200px] w-full object-cover transition-opacity duration-700 ease-in-out [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] xl:inset-0 xl:size-full xl:[mask-image:none] xl:[-webkit-mask-image:none]" style={{ opacity: index === activeIndex ? 1 : 0 }} />
      ))}
      {activeSlide.isAd ? <span className="absolute right-4 top-4 z-30 rounded-xl bg-pbrown-900/50 px-3 py-3 text-eyebrow-lg uppercase text-pgold-100 backdrop-blur-md">ADS</span> : null}
      {slideHrefs ? <Link
        href={slideHrefs[activeSlide.id] ?? "/prioritas/event"}
        aria-label={`${titles[activeIndex]} — ${activeCta}`}
        onClick={(event) => {
          if (!bannerWasSwiped.current) return;
          event.preventDefault();
          bannerWasSwiped.current = false;
        }}
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      /> : null}
      <div className="absolute inset-x-0 top-[150px] h-[100px] xl:hidden" style={{ backgroundImage: `linear-gradient(to bottom, transparent 0%, ${activeBackdrop} 100%)` }} />

      <div
        aria-hidden={Boolean(slideHrefs)}
        className={`glass-panel glass-panel-prioritas absolute inset-x-2 bottom-[72px] z-20 flex w-auto flex-col items-start overflow-hidden rounded-2xl px-4 pb-5 pt-4 xl:inset-x-auto xl:bottom-auto xl:left-4 xl:top-4 xl:w-[360px] xl:max-w-[calc(100%-2rem)] xl:justify-between ${activeSlide.brandLogo ? "h-56 justify-between xl:h-64" : "h-[160px] justify-start gap-6 xl:h-[180px]"} ${slideHrefs ? "pointer-events-none" : ""}`}
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        {activeSlide.brandLogo ? <div className="flex w-full flex-col items-start gap-3">
          <span className="flex h-11 items-center rounded-md bg-white px-3 py-2">
            <img src={activeSlide.brandLogo} alt="" className="h-7 w-28 object-contain" />
          </span>
          <h3 className="h-20 max-w-full overflow-hidden text-subtitle text-white line-clamp-3 xl:h-[96px] xl:text-heading">{titles[activeIndex]}</h3>
        </div> : <h3 className="h-20 max-w-full overflow-hidden text-subtitle text-white line-clamp-3 xl:h-[96px] xl:text-heading">{titles[activeIndex]}</h3>}
        <PrioritasButton kind="text" surface="inverse" size="large" trailingIcon={<PrioritasButtonIcon src="/assets/prioritas/privilege/arrow-small.svg" />}>
          {activeCta}
        </PrioritasButton>
      </div>

      <div className="absolute inset-x-2 bottom-2 z-30 flex h-14 items-center justify-between p-2 text-white xl:inset-x-auto xl:bottom-6 xl:left-8 xl:h-auto xl:justify-start xl:gap-6 xl:p-0">
        <div className="flex items-center gap-3" aria-label="Carousel pagination" onMouseEnter={() => setHoveringIndicator(true)} onMouseLeave={() => setHoveringIndicator(false)}>
          {slides.map((slide, index) =>
            index === activeIndex ? (
              <button key={slide.id} type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? t("playSlide") : t("pauseSlide")} className="relative flex h-2 w-12 items-center after:absolute after:-inset-y-3 after:inset-x-0 after:content-['']">
                <svg viewBox="0 0 48 8" className="h-2 w-12 overflow-visible" aria-hidden>
                  <line x1="4" y1="4" x2="44" y2="4" stroke="rgba(255,255,255,0.25)" strokeWidth="8" strokeLinecap="round" />
                  <line ref={progressLineRef} x1="4" y1="4" x2="44" y2="4" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray={INDICATOR_LENGTH} strokeDashoffset={INDICATOR_LENGTH} />
                </svg>
              </button>
            ) : (
              <button key={slide.id} type="button" onClick={() => goTo(index)} aria-label={`Slide ${index + 1}`} className="group relative flex size-2 items-center justify-center after:absolute after:-inset-y-3 after:-inset-x-1 after:content-['']">
                <span className="size-2 rounded-full bg-white/25 transition-colors group-hover:bg-white/60" />
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goBy(-1)} aria-label={t("prevSlide")} className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-pbrown-900/30 text-white backdrop-blur-md transition-colors hover:bg-pbrown-900/50">
            <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-5" />
          </button>
          <button type="button" onClick={() => goBy(1)} aria-label={t("nextSlide")} className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-pbrown-900/30 text-white backdrop-blur-md transition-colors hover:bg-pbrown-900/50">
            <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
