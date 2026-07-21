"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import SlideDots, { DOT_CIRCUMFERENCE } from "./SlideDots";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useLenis } from "@/components/SmoothScroll";
import { useIsLive } from "@/lib/useIsLive";
import { SLIDES, SLIDE_DURATION_MS, type Slide, type SlideCta } from "./hero-slides";

const PARALLAX_SPEED = 0.45;

/** Hero CTA — one button sized responsively. The desktop-only hover treatment
 *  (blue fill + glow + inverted icon) is gated behind `xl:`, so on touch the
 *  button stays the plain white pill with an `active:scale` press. */
function HeroCta({ label, icon }: SlideCta) {
  return (
    <div className="group/cta relative inline-flex items-start gap-3">
      <button
        className="relative flex h-10 items-center justify-center gap-0.5 rounded-full border border-transparent bg-white px-5 transition-[background-color,box-shadow,transform] duration-200 active:scale-95 xl:h-12 xl:gap-1 xl:px-6 xl:duration-300 xl:active:scale-100 xl:hover:bg-blue-500 xl:hover:shadow-[0_0_22px_-6px_rgba(125,211,252,0.75)]"
      >
        <span className="px-0.5 text-sm font-semibold text-blue-500 transition-colors duration-300 xl:text-base xl:group-hover/cta:text-white">
          {label}
        </span>
        <img
          src={icon}
          alt=""
          className="size-5 transition-[filter] duration-300 xl:group-hover/cta:brightness-0 xl:group-hover/cta:invert"
        />
      </button>
    </div>
  );
}

export default function HeroSection({ slides = SLIDES }: { slides?: Slide[] }) {
  const t = useTranslations("hero");
  const count = slides.length;
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringActive, setHoveringActive] = useState(false);
  const pausedRef = useRef(false);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Parks the autoplay timer + parallax once the hero scrolls away.
  const live = useIsLive(rootRef);
  const touchStartX = useRef<number | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    pausedRef.current = paused || hoveringActive;
  }, [paused, hoveringActive]);

  useAutoplayProgress({
    activeIndex: activeSlide,
    count: count,
    durationMs: SLIDE_DURATION_MS,
    circumference: DOT_CIRCUMFERENCE,
    progressRef: progressCircleRef,
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

  return (
    <div
      ref={rootRef}
      className="relative h-[520px] overflow-clip bg-blue-500 xl:h-[620px]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Banner is a fixed 620px anchored to the section bottom, so on the
          shorter (520px) mobile section its top spills out above and is clipped
          — the desktop 620px section shows it in full. */}
      <div
        ref={parallaxRef}
        className="absolute inset-x-0 bottom-0 h-[620px] origin-top will-change-transform"
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
            className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out"
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

      {/* Content — column on mobile (title, then dots), row on desktop (title
          left, dots + arrows right). */}
      <div className="absolute inset-x-0 bottom-[168px] px-4 xl:inset-x-auto xl:left-1/2 xl:right-auto xl:bottom-[192px] xl:w-[1280px] xl:-translate-x-1/2 xl:px-0">
        <div className="mx-auto flex max-w-[544px] flex-col items-start gap-6 xl:mx-0 xl:max-w-none xl:flex-row xl:items-end xl:justify-between xl:gap-0">
          <div
            key={activeSlide}
            className="flex w-[240px] flex-col items-start gap-5 xl:w-[420px] xl:gap-8"
          >
            <h1 className="animate-hero-title text-[24px] font-semibold leading-[32px] tracking-[-0.4px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)] xl:text-[36px] xl:leading-[48px] xl:tracking-[-0.8px] xl:[text-shadow:none]">
              {slides[activeSlide].title}
            </h1>
            <div className="animate-hero-cta">
              <HeroCta {...slides[activeSlide].cta} />
            </div>
          </div>

          {/* Dots — bare on mobile; the pill background + prev/next arrows are
              desktop-only decorations around the same SlideDots. */}
          <div className="flex items-center gap-1 rounded-[40px] xl:bg-[rgba(0,0,0,0.5)] xl:p-1 xl:backdrop-blur-[4px]">
            <button
              onClick={goPrev}
              aria-label={t("prevSlide")}
              className="hidden size-10 items-center justify-center rounded-full transition-colors hover:bg-white/20 xl:flex"
            >
              <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-6" />
            </button>
            <SlideDots
              count={count}
              activeIndex={activeSlide}
              paused={paused}
              onSelect={goTo}
              onTogglePause={() => setPaused((p) => !p)}
              onActiveHoverChange={setHoveringActive}
              progressRef={progressCircleRef}
              inactiveColor="rgba(255,255,255,0.4)"
              inactiveHoverColor="rgba(255,255,255,0.7)"
              showPill={false}
            />
            <button
              onClick={goNext}
              aria-label={t("nextSlide")}
              className="hidden size-10 items-center justify-center rounded-full transition-colors hover:bg-white/20 xl:flex"
            >
              <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
