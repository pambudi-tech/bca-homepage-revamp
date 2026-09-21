"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useIsLive } from "@/lib/useIsLive";

type Slide = { id: string; image: string; alt: string; backdrop: string };

const SLIDES: Slide[] = [
  { id: "java-jazz", image: "/assets/promo/event-banner-1.webp", alt: "myBCA International Java Jazz Festival", backdrop: "#080808" },
  { id: "the-weeknd", image: "/assets/promo/event-banner-2.webp", alt: "After Hours Til Dawn Tour - The Weeknd", backdrop: "#bd2118" },
  { id: "brightspot", image: "/assets/promo/event-banner-3.webp", alt: "Brightspot Market", backdrop: "#3b9ca5" },
];

const AUTOPLAY_MS = 6000;
const INDICATOR_LENGTH = 40;

export default function PrioritasFeaturedBanner({ titles, cta }: { titles: string[]; cta: string }) {
  const t = useTranslations("promo");
  const [activeIndex, setActiveIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hoveringIndicator, setHoveringIndicator] = useState(false);
  const pausedRef = useRef(false);
  const progressLineRef = useRef<SVGLineElement>(null);
  const touchStartX = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useIsLive(rootRef);
  const activeSlide = SLIDES[activeIndex];

  useEffect(() => {
    pausedRef.current = paused || hoveringIndicator;
  }, [paused, hoveringIndicator]);

  useAutoplayProgress({
    activeIndex,
    count: SLIDES.length,
    durationMs: AUTOPLAY_MS,
    circumference: INDICATOR_LENGTH,
    progressRef: progressLineRef,
    pausedRef,
    live,
    onAdvance: () => setActiveIndex((current) => (current + 1) % SLIDES.length),
  });

  const goTo = (index: number) => {
    setActiveIndex(index);
    setPaused(false);
  };

  const goBy = (delta: number) => goTo((activeIndex + delta + SLIDES.length) % SLIDES.length);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    const distance = endX === undefined ? 0 : endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) >= 40) goBy(distance < 0 ? 1 : -1);
  };

  return (
    <div
      ref={rootRef}
      className="relative h-[400px] w-full overflow-hidden rounded-xl border border-neutral-100/10 bg-pbrown-900 xl:h-[400px]"
      style={{ backgroundColor: activeSlide.backdrop }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {SLIDES.map((slide, index) => (
        <img key={slide.id} src={slide.image} alt={slide.alt} className="absolute inset-x-0 top-0 h-[200px] w-full object-cover transition-opacity duration-700 ease-in-out [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] xl:inset-0 xl:size-full xl:[mask-image:none] xl:[-webkit-mask-image:none]" style={{ opacity: index === activeIndex ? 1 : 0 }} />
      ))}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-pbrown-900/75 via-pbrown-900/15 to-transparent xl:block" />
      <div className="absolute inset-x-0 top-[150px] h-[100px] xl:hidden" style={{ backgroundImage: `linear-gradient(to bottom, transparent 0%, ${activeSlide.backdrop} 100%)` }} />
      <div className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-pbrown-900/60 to-transparent xl:block" />

      <div
        className="glass-panel glass-panel-prioritas absolute inset-x-2 bottom-[72px] z-10 flex h-[160px] w-auto flex-col items-start justify-start gap-6 overflow-hidden rounded-2xl px-4 pb-5 pt-4 xl:inset-x-auto xl:bottom-auto xl:left-4 xl:top-4 xl:h-[180px] xl:w-[360px] xl:max-w-[calc(100%-2rem)] xl:justify-between"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        <h3 className="h-20 max-w-full overflow-hidden text-subtitle text-white line-clamp-3 xl:h-[72px]">{titles[activeIndex]}</h3>
        <button type="button" className="flex items-center gap-0.5 text-left text-sm font-semibold leading-5 text-pgold-300 transition-colors hover:text-pgold-100">
          <span className="px-0.5">{cta}</span>
          <img src="/assets/prioritas/privilege/arrow-small.svg" alt="" className="size-5" />
        </button>
      </div>

      <div className="absolute inset-x-2 bottom-2 z-20 flex h-14 items-center justify-between p-2 text-white xl:inset-x-auto xl:bottom-6 xl:left-8 xl:h-auto xl:justify-start xl:gap-6 xl:p-0">
        <div className="flex items-center gap-3" aria-label="Carousel pagination" onMouseEnter={() => setHoveringIndicator(true)} onMouseLeave={() => setHoveringIndicator(false)}>
          {SLIDES.map((slide, index) =>
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
          <button type="button" onClick={() => goBy(-1)} aria-label={t("prevSlide")} className="flex size-10 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50">
            <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-5" />
          </button>
          <button type="button" onClick={() => goBy(1)} aria-label={t("nextSlide")} className="flex size-10 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50">
            <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
