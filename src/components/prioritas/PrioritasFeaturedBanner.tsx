"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useIsLive } from "@/lib/useIsLive";
import { FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";
import { PrioritasButton, PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

const AUTOPLAY_MS = 6000;
const INDICATOR_LENGTH = 40;

export default function PrioritasFeaturedBanner({ titles, cta, backdrops, slideHrefs }: { titles: string[]; cta: string; backdrops: Record<string, string>; slideHrefs?: Record<string, string> }) {
  const t = useTranslations("promo");
  const [activeIndex, setActiveIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hoveringIndicator, setHoveringIndicator] = useState(false);
  const pausedRef = useRef(false);
  const progressLineRef = useRef<SVGLineElement>(null);
  const touchStartX = useRef<number | null>(null);
  const bannerWasSwiped = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useIsLive(rootRef);
  const activeSlide = FEATURED_BANNER_SLIDES[activeIndex];
  const activeBackdrop = backdrops[activeSlide.id];

  useEffect(() => {
    pausedRef.current = paused || hoveringIndicator;
  }, [paused, hoveringIndicator]);

  useAutoplayProgress({
    activeIndex,
    count: FEATURED_BANNER_SLIDES.length,
    durationMs: AUTOPLAY_MS,
    circumference: INDICATOR_LENGTH,
    progressRef: progressLineRef,
    pausedRef,
    live,
    onAdvance: () => setActiveIndex((current) => (current + 1) % FEATURED_BANNER_SLIDES.length),
  });

  const goTo = (index: number) => {
    setActiveIndex(index);
    setPaused(false);
  };

  const goBy = (delta: number) => goTo((activeIndex + delta + FEATURED_BANNER_SLIDES.length) % FEATURED_BANNER_SLIDES.length);

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
      {FEATURED_BANNER_SLIDES.map((slide, index) => (
        <img key={slide.id} src={slide.image} alt={slide.alt} className="absolute inset-x-0 top-0 h-[200px] w-full object-cover transition-opacity duration-700 ease-in-out [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] xl:inset-0 xl:size-full xl:[mask-image:none] xl:[-webkit-mask-image:none]" style={{ opacity: index === activeIndex ? 1 : 0 }} />
      ))}
      {slideHrefs ? <Link
        href={slideHrefs[activeSlide.id] ?? "/prioritas/event"}
        aria-label={`${titles[activeIndex]} — ${cta}`}
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
        className={`glass-panel glass-panel-prioritas absolute inset-x-2 bottom-[72px] z-20 flex h-[160px] w-auto flex-col items-start justify-start gap-6 overflow-hidden rounded-2xl px-4 pb-5 pt-4 xl:inset-x-auto xl:bottom-auto xl:left-4 xl:top-4 xl:h-[180px] xl:w-[360px] xl:max-w-[calc(100%-2rem)] xl:justify-between ${slideHrefs ? "pointer-events-none" : ""}`}
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        <h3 className="h-20 max-w-full overflow-hidden text-subtitle text-white line-clamp-3 xl:h-[96px] xl:text-heading">{titles[activeIndex]}</h3>
        <PrioritasButton kind="text" surface="inverse" size="large" trailingIcon={<PrioritasButtonIcon src="/assets/prioritas/privilege/arrow-small.svg" />}>
          {cta}
        </PrioritasButton>
      </div>

      <div className="absolute inset-x-2 bottom-2 z-30 flex h-14 items-center justify-between p-2 text-white xl:inset-x-auto xl:bottom-6 xl:left-8 xl:h-auto xl:justify-start xl:gap-6 xl:p-0">
        <div className="flex items-center gap-3" aria-label="Carousel pagination" onMouseEnter={() => setHoveringIndicator(true)} onMouseLeave={() => setHoveringIndicator(false)}>
          {FEATURED_BANNER_SLIDES.map((slide, index) =>
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
          <button type="button" onClick={() => goBy(-1)} aria-label={t("prevSlide")} className={prioritasButtonClassName({ kind: "icon", variant: "secondary", surface: "inverse", size: "medium" })}>
            <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-5" />
          </button>
          <button type="button" onClick={() => goBy(1)} aria-label={t("nextSlide")} className={prioritasButtonClassName({ kind: "icon", variant: "secondary", surface: "inverse", size: "medium" })}>
            <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
