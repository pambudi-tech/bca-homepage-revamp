"use client";

import { useEffect, useRef, useState } from "react";
import SlideDots, { DOT_CIRCUMFERENCE } from "./SlideDots";

type EventSlide = {
  id: string;
  image: string;
  alt: string;
};

const EVENT_SLIDES: EventSlide[] = [
  { id: "java-jazz", image: "/assets/promo/event-banner-1.png", alt: "International Java Jazz Festival, 29-31 May 2026" },
  { id: "weeknd", image: "/assets/promo/event-banner-2.png", alt: 'BCA Presale: The Weeknd "After Hours Til Dawn Tour"' },
  { id: "brightspot", image: "/assets/promo/event-banner-3.png", alt: "myBCA x Brightspot City" },
];

const COUNT = EVENT_SLIDES.length;
const SLIDE_DURATION_MS = 6000;
const TICK_MS = 50;

export default function PromoSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringDot, setHoveringDot] = useState(false);
  const [hoveringSlider, setHoveringSlider] = useState(false);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const progressRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    pausedRef.current = paused || hoveringDot || hoveringSlider;
  }, [paused, hoveringDot, hoveringSlider]);

  // Progress ring is written straight to the SVG circle via a ref (like
  // HeroSection) so the timer doesn't re-render the whole slider 20x/second.
  useEffect(() => {
    elapsedRef.current = 0;
    if (progressRef.current) {
      progressRef.current.style.strokeDashoffset = String(DOT_CIRCUMFERENCE);
    }
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      elapsedRef.current += TICK_MS;
      const pct = Math.min(1, elapsedRef.current / SLIDE_DURATION_MS);
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(DOT_CIRCUMFERENCE * (1 - pct));
      }
      if (pct >= 1) {
        setActiveIndex((i) => (i + 1) % COUNT);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const goPrev = () => {
    setPaused(false);
    setActiveIndex((i) => (i - 1 + COUNT) % COUNT);
  };
  const goNext = () => {
    setPaused(false);
    setActiveIndex((i) => (i + 1) % COUNT);
  };
  const goTo = (i: number) => {
    setPaused(false);
    setActiveIndex(i);
  };

  return (
    <div className="mt-16 flex flex-col items-center">
      <div
        className="relative h-[400px] w-[1280px] shrink-0 overflow-clip rounded-3xl"
        onMouseEnter={() => setHoveringSlider(true)}
        onMouseLeave={() => setHoveringSlider(false)}
      >
        {EVENT_SLIDES.map((slide, i) => (
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.alt}
            className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          />
        ))}

        <button
          onClick={goPrev}
          aria-label="Sebelumnya"
          className="absolute left-6 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/40"
        >
          <img src="/assets/promo/chevron-left-white.svg" alt="" className="size-6" />
        </button>
        <button
          onClick={goNext}
          aria-label="Berikutnya"
          className="absolute right-6 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/40"
        >
          <img src="/assets/promo/chevron-right-white.svg" alt="" className="size-6" />
        </button>
      </div>

      <div className="mt-4">
        <SlideDots
          count={COUNT}
          activeIndex={activeIndex}
          paused={paused}
          onSelect={goTo}
          onTogglePause={() => setPaused((p) => !p)}
          onActiveHoverChange={setHoveringDot}
          progressRef={progressRef}
          activeColor="#00b5f0"
          inactiveColor="rgba(0,33,61,0.25)"
          iconColor="#00213d"
          showPill={false}
        />
      </div>
    </div>
  );
}