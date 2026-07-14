"use client";

import { useEffect, useRef, useState } from "react";
import SlideDots, { DOT_CIRCUMFERENCE } from "./SlideDots";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { SLIDES, SLIDES_COUNT, SLIDE_DURATION_MS, type SlideCta } from "./hero-slides";

function MobileHeroCta({ label, icon, variant }: SlideCta) {
  const isSecondary = variant === "secondary";
  return (
    <button
      className={`flex h-10 items-center justify-center gap-0.5 rounded-full bg-white px-5 transition-transform duration-200 active:scale-95 ${
        isSecondary ? "border-2 border-[#005caa]" : ""
      }`}
    >
      <span className="px-0.5 text-sm font-semibold text-[#005caa]">{label}</span>
      <img src={icon} alt="" className="size-5" />
    </button>
  );
}

export default function MobileHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringActive, setHoveringActive] = useState(false);
  const pausedRef = useRef(false);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused || hoveringActive;
  }, [paused, hoveringActive]);

  useAutoplayProgress({
    activeIndex: activeSlide,
    count: SLIDES_COUNT,
    durationMs: SLIDE_DURATION_MS,
    circumference: DOT_CIRCUMFERENCE,
    progressRef: progressCircleRef,
    pausedRef,
    onAdvance: () => setActiveSlide((s) => (s + 1) % SLIDES_COUNT),
  });

  const goTo = (i: number) => {
    setPaused(false);
    setActiveSlide(((i % SLIDES_COUNT) + SLIDES_COUNT) % SLIDES_COUNT);
  };

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
      className="relative h-[560px] overflow-clip bg-[#005caa]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Banner slides */}
      {SLIDES.map((slide, i) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === activeSlide ? 1 : 0 }}
        />
      ))}

      {/* Full-hero overlay — darker at the top (nav) and bottom (title + widget),
          clear through the middle so the banner subject stays visible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(18,20,23,0.72) 0%, rgba(18,20,23,0.18) 26%, rgba(18,20,23,0.04) 44%, rgba(18,20,23,0.32) 72%, rgba(18,20,23,0.72) 100%)",
        }}
      />

      {/* Content + carousel dots, anchored above the hero widget overlap.
          Centered at a shared max-width so it lines up with the widget on wide
          (tablet) screens while staying edge-aligned on phones. */}
      <div className="absolute inset-x-0 bottom-[168px] px-4">
        <div className="mx-auto flex max-w-[544px] flex-col items-start gap-5">
        <div key={activeSlide} className="flex w-[240px] max-w-full flex-col items-start gap-5">
          <h1 className="animate-hero-title text-[20px] font-semibold leading-[28px] tracking-[-0.4px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
            {SLIDES[activeSlide].title}
          </h1>
          <div className="animate-hero-cta">
            <MobileHeroCta {...SLIDES[activeSlide].cta} />
          </div>
        </div>

        <SlideDots
          count={SLIDES_COUNT}
          activeIndex={activeSlide}
          paused={paused}
          onSelect={goTo}
          onTogglePause={() => setPaused((p) => !p)}
          onActiveHoverChange={setHoveringActive}
          progressRef={progressCircleRef}
          inactiveColor="rgba(255,255,255,0.5)"
          inactiveHoverColor="rgba(255,255,255,0.8)"
          showPill={false}
        />
        </div>
      </div>
    </div>
  );
}
