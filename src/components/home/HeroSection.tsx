"use client";

import { useEffect, useRef, useState } from "react";
import SlideDots, { DOT_CIRCUMFERENCE } from "./SlideDots";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useLenis } from "@/components/SmoothScroll";
import { SLIDES, SLIDES_COUNT, SLIDE_DURATION_MS, type SlideCta } from "./hero-slides";

const PARALLAX_SPEED = 0.45;

function HeroCta({ label, icon, variant }: SlideCta) {
  const isSecondary = variant === "secondary";
  return (
    <div className="group/cta relative inline-flex items-start gap-3">
      <button
        className={`hero-cta relative flex h-12 items-center justify-center gap-1 rounded-full bg-white px-6 transition-[background-color,box-shadow] duration-300 hover:bg-[#005caa] hover:shadow-[0_0_22px_-6px_rgba(125,211,252,0.75)] ${
          isSecondary ? "border-2 border-[#005caa]" : "border border-transparent"
        }`}
      >
        <span aria-hidden className="hero-cta-beam" />
        <span className="px-0.5 text-base font-semibold text-[#005caa] transition-colors duration-300 group-hover/cta:text-white">
          {label}
        </span>
        <img
          src={icon}
          alt=""
          className="size-5 transition-[filter] duration-300 group-hover/cta:brightness-0 group-hover/cta:invert"
        />
      </button>
    </div>
  );
}

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringActive, setHoveringActive] = useState(false);
  const pausedRef = useRef(false);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

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

  useEffect(() => {
    if (!lenis) return;

    const updateParallax = () => {
      if (!parallaxRef.current) return;
      const scrollY = window.scrollY;
      parallaxRef.current.style.transform = `translate3d(0, ${scrollY * PARALLAX_SPEED}px, 0) scale(1.1)`;
    };

    lenis.on("scroll", updateParallax);
    updateParallax();

    return () => {
      lenis.off("scroll", updateParallax);
    };
  }, [lenis]);

  const goPrev = () => {
    setPaused(false);
    setActiveSlide((s) => (s - 1 + SLIDES_COUNT) % SLIDES_COUNT);
  };
  const goNext = () => {
    setPaused(false);
    setActiveSlide((s) => (s + 1) % SLIDES_COUNT);
  };
  const goTo = (i: number) => {
    setPaused(false);
    setActiveSlide(i);
  };

  return (
    <div className="relative h-[620px] overflow-clip bg-[#005caa]">
      <div
        ref={parallaxRef}
        className="absolute inset-0 size-full origin-top will-change-transform"
        style={{ transform: "translate3d(0, 0px, 0) scale(1.1)" }}
      >
        {SLIDES.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeSlide ? 1 : 0 }}
          />
        ))}
      </div>

      <div
        className="absolute inset-y-0 left-0 w-1/3"
        style={{
          background: "linear-gradient(to right, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0) 100%)",
        }}
      />

      <div className="absolute bottom-[192px] left-1/2 flex w-[1280px] -translate-x-1/2 items-end justify-between">
        <div className="flex w-[420px] flex-col items-start gap-8">
          <div key={activeSlide} className="flex flex-col items-start gap-8 w-full">
            <h1 className="animate-hero-title w-full text-[36px] font-semibold leading-[48px] text-white tracking-[-0.8px]">
              {SLIDES[activeSlide].title}
            </h1>
            <div className="animate-hero-cta">
              <HeroCta {...SLIDES[activeSlide].cta} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-[40px] bg-[rgba(0,0,0,0.5)] p-1 backdrop-blur-[4px]">
          <button
            onClick={goPrev}
            aria-label="Sebelumnya"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          >
            <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-6" />
          </button>
          <SlideDots
            count={SLIDES_COUNT}
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
            aria-label="Berikutnya"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          >
            <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-6" />
          </button>
        </div>
      </div>

      <div
        className="absolute left-0 right-0 top-0 h-[160px]"
        style={{
          background: "linear-gradient(to bottom, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0) 100%)",
        }}
      />
    </div>
  );
}