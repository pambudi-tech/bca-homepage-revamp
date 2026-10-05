"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useLenis } from "@/components/SmoothScroll";
import { useIsLive } from "@/lib/useIsLive";
import { useLayoutVariant } from "@/lib/useLayoutVariant";
import { SLIDES, SLIDE_DURATION_MS, type Slide, type SlideCta } from "./hero-slides";
import ChristmasDecor from "./ChristmasDecor";
import CnyDecor from "./CnyDecor";
import LebaranDecor from "./LebaranDecor";
import { prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";
import LayoutSwitcher from "./LayoutSwitcher";

const PARALLAX_SPEED = 0.45;
const INDICATOR_LENGTH = 40;
const HERO_THEMES = ["none", "christmas", "cny", "lebaran"] as const;
type HeroTheme = (typeof HERO_THEMES)[number];

/** Hero CTA — a text action on mobile; the configured filled treatment remains
 *  on desktop where the hero has more room for a prominent CTA. */
function HeroCta({ label, icon, variant, tone = "default" }: SlideCta) {
  const solitaire = tone === "solitaire";
  const prioritas = tone === "prioritas";
  const brandedHero = solitaire || prioritas;
  const ctaClassName = prioritas
    ? prioritasButtonClassName({ surface: "inverse", size: "large" })
    : solitaire
      ? solitaireButtonClassName({ surface: "inverse", size: "large" })
      : `relative flex items-center justify-center gap-1 font-semibold transition-[color,transform] duration-300 active:scale-95 h-10 px-0 text-sm text-white underline-offset-4 hover:underline xl:h-12 xl:rounded-full xl:px-6 xl:text-base xl:no-underline ${variant === "primary" ? "xl:bg-primary xl:hover:bg-primary-hover" : "xl:bg-black/50 xl:hover:bg-black/70"}`;
  return (
    <div className="group/cta relative inline-flex items-start gap-3">
      <button
        className={ctaClassName}
      >
        <span className={prioritas || solitaire ? "prio-button__label" : `px-0.5 text-base font-semibold ${brandedHero ? "text-pbrown-600" : "text-white"}`}>
          {label}
        </span>
        <img src={icon} alt="" className={`size-5 ${prioritas ? "brightness-0 opacity-80" : solitaire ? "brightness-0" : "brightness-0 invert"}`} />
      </button>
    </div>
  );
}

export default function HeroSection({
  slides = SLIDES,
  mobileStack,
  desktopStack,
}: {
  slides?: Slide[];
  mobileStack?: ReactNode;
  desktopStack?: ReactNode;
}) {
  const t = useTranslations("hero");
  const count = slides.length;
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringActive, setHoveringActive] = useState(false);
  const [theme, setTheme] = useLayoutVariant<HeroTheme>("promo-theme", "none", HERO_THEMES);
  const pausedRef = useRef(false);
  const progressLineRef = useRef<SVGLineElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Parks the autoplay timer + parallax once the hero scrolls away.
  const live = useIsLive(rootRef);
  const touchStartX = useRef<number | null>(null);
  const lenis = useLenis();
  const solitaireHero = slides[activeSlide].cta.tone === "solitaire";
  const brandedHero = slides[activeSlide].cta.tone === "prioritas" || solitaireHero;

  useEffect(() => {
    pausedRef.current = paused || hoveringActive;
  }, [paused, hoveringActive]);

  useAutoplayProgress({
    activeIndex: activeSlide,
    count: count,
    durationMs: SLIDE_DURATION_MS,
    circumference: INDICATOR_LENGTH,
    progressRef: progressLineRef,
    pausedRef,
    live,
    onAdvance: () => setActiveSlide((s) => (s + 1) % count),
  });

  // Parallax on the banner layer — applied on every breakpoint (mobile too).
  //
  // Gated on `live`: once the hero has scrolled away there is nothing to
  // parallax, and the writes were the most frequent thing on the page (Lenis
  // emits `scroll` every frame of a smooth scroll, for the entire document
  // height). Coalescing into rAF also means a burst of events can't produce
  // more than one style write per frame.
  useEffect(() => {
    if (!lenis || !live) return;

    let raf = 0;
    const write = () => {
      raf = 0;
      if (!parallaxRef.current) return;
      parallaxRef.current.style.transform = `translate3d(0, ${
        window.scrollY * PARALLAX_SPEED
      }px, 0) scale(1.1)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };

    lenis.on("scroll", onScroll);
    write();
    return () => {
      lenis.off("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lenis, live]);

  const goPrev = () => {
    setPaused(false);
    setActiveSlide((s) => (s - 1 + count) % count);
  };
  const goNext = () => {
    setPaused(false);
    setActiveSlide((s) => (s + 1) % count);
  };
  const goTo = (i: number) => {
    setPaused(false);
    setActiveSlide(((i % count) + count) % count);
  };

  // Swipe (touch) — advances the slide on mobile; inert with a mouse.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    goTo(activeSlide + (dx < 0 ? 1 : -1)); // swipe left → next, right → prev
  };

  const carouselControlClass = slides[activeSlide].cta.tone === "prioritas"
    ? "flex size-10 items-center justify-center rounded-full border border-white/25 bg-pbrown-900/30 text-white backdrop-blur-md transition-colors hover:bg-pbrown-900/50"
    : "flex size-10 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50";

  return (
    <div
      ref={rootRef}
      className="relative h-[min(640px,calc(90svh-48px))] min-h-[560px] overflow-x-visible overflow-y-clip bg-blue-500 xl:h-[80svh] xl:min-h-0"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <LayoutSwitcher
        label="Tema Hero"
        value={theme}
        onChange={setTheme}
        visibilityClassName="block"
        positionClassName="right-6 top-20 xl:right-[max(2.5rem,calc((100vw-1280px)/2))]"
        menuAlign="right"
        icon={
          <svg viewBox="0 0 20 20" fill="none" className="size-[18px]">
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2.5v15M3.5 6.25l13 7.5M16.5 6.25l-13 7.5" />
              <path d="M8 4.4 10 6.2l2-1.8M8 15.6l2-1.8 2 1.8" />
            </g>
          </svg>
        }
        options={[
          { value: "none", name: "Mati", description: "Tanpa ornamen tematik." },
          { value: "christmas", name: "Natal", description: "Salju, garland cemara berlampu hangat, dan pita merah (WebGL)." },
          { value: "cny", name: "Imlek", description: "Kelopak mei hua, ranting berbunga, lampion, dan petasan (WebGL)." },
          { value: "lebaran", name: "Lebaran", description: "Rumbai janur, ketupat dan lentera, bintang emas, dan bulan sabit (WebGL)." },
        ]}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        {theme === "christmas" ? <ChristmasDecor /> : theme === "cny" ? <CnyDecor /> : theme === "lebaran" ? <LebaranDecor /> : null}
      </div>

      {/* The banner follows the responsive section height. */}
      <div
        ref={parallaxRef}
        className="absolute inset-x-0 bottom-0 h-full origin-top will-change-transform"
        style={{ transform: "translate3d(0, 0, 0) scale(1.1)" }}
      >
        {/* Slide 0 is the LCP element on essentially every visit, so it's flagged
            high-priority. The rest are stacked in the viewport at opacity 0 —
            `loading="lazy"` does nothing for them (they're technically on
            screen), but a low fetch priority keeps them out of the LCP image's
            way instead of racing it for bandwidth. */}
        {slides.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? "sync" : "async"}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out ${slide.cta.tone === "prioritas" ? "object-[calc(50%_-_200px)_center] md:object-center" : "object-center"}`}
            style={{ opacity: i === activeSlide ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Overlay — mobile covers the full hero; desktop uses a left + top wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgba(18,20,23,0.5)] xl:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 hidden w-1/3 xl:block"
        style={{
          background: "linear-gradient(to right, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 hidden h-[160px] xl:block"
        style={{
          background: "linear-gradient(to bottom, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0) 100%)",
        }}
      />

      <div className="absolute inset-x-4 bottom-10 z-20 xl:left-1/2 xl:right-auto xl:top-auto xl:bottom-10 xl:w-[1280px] xl:-translate-x-1/2">
        <div className="flex flex-col items-start gap-6 xl:gap-8">
          <div
            key={activeSlide}
            className="flex w-[280px] flex-col items-start gap-4 xl:w-[560px] xl:gap-6"
          >
            {slides[activeSlide].brandMark ? (
              <img
                src={slides[activeSlide].brandMark.src}
                alt={slides[activeSlide].brandMark.alt}
                className="h-10 w-auto animate-hero-title object-contain xl:h-14"
              />
            ) : null}
            <h1 className={`animate-hero-title ${solitaireHero ? "max-w-[260px]" : "max-w-[240px]"} font-semibold text-white text-shadow-hero ${brandedHero ? (slides[activeSlide].cta.tone === "prioritas" ? "text-hero-title-mobile" : "text-display") : "text-2xl leading-7 tracking-[-0.4px]"} ${brandedHero ? "xl:line-clamp-3" : "xl:line-clamp-2"} xl:max-w-none xl:text-[clamp(36px,5svh,40px)] xl:leading-[clamp(44px,6svh,48px)] xl:tracking-[-0.8px] xl:text-shadow-none`}>
              {slides[activeSlide].title}
            </h1>
            <div className="animate-hero-cta">
              <HeroCta {...slides[activeSlide].cta} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3" onMouseEnter={() => setHoveringActive(true)} onMouseLeave={() => setHoveringActive(false)}>
              {Array.from({ length: count }).map((_, index) =>
                index === activeSlide ? (
                  <button key={index} onClick={() => setPaused((value) => !value)} aria-label={paused ? t("playSlide") : t("pauseSlide")} className="relative flex h-2 w-12 items-center after:absolute after:-inset-y-3 after:inset-x-0 after:content-['']">
                    <svg viewBox="0 0 48 8" className="h-2 w-12 overflow-visible" aria-hidden>
                      <line x1="4" y1="4" x2="44" y2="4" stroke="rgba(255,255,255,0.25)" strokeWidth="8" strokeLinecap="round" />
                      <line ref={progressLineRef} x1="4" y1="4" x2="44" y2="4" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray={INDICATOR_LENGTH} strokeDashoffset={INDICATOR_LENGTH} />
                    </svg>
                  </button>
                ) : (
                  <button key={index} onClick={() => goTo(index)} aria-label={`${t("goToSlide")} ${index + 1}`} className="group relative flex size-2 items-center justify-center after:absolute after:-inset-y-3 after:-inset-x-1 after:content-['']">
                    <span className="size-2 rounded-full bg-white/25 transition-colors group-hover:bg-white/60" />
                  </button>
                )
              )}
            </div>
            <div className="hidden items-center gap-2 xl:flex">
              <button onClick={goPrev} aria-label={t("prevSlide")} className={carouselControlClass}>
                <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-5" />
              </button>
            <button
              onClick={goNext}
              aria-label={t("nextSlide")}
              className={carouselControlClass}
            >
              <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5" />
            </button>
            </div>
          </div>

          {mobileStack ? (
            <div className="flex w-full flex-col gap-5 xl:hidden">
              {mobileStack}
            </div>
          ) : null}

          {desktopStack ? (
            <div className="hidden w-full flex-col gap-8 xl:flex">
              {desktopStack}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
