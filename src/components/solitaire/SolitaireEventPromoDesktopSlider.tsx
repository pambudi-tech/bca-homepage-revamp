"use client";

import { useEffect, useRef, useState } from "react";
import { useIsLive } from "@/lib/useIsLive";

type EventSlide = {
  image: string;
  title: string;
  action: string;
  alt: string;
};

const AUTO_ADVANCE_MS = 6000;

export default function SolitaireEventPromoDesktopSlider({ slides }: { slides: [EventSlide, EventSlide, EventSlide, EventSlide, EventSlide] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [timerEpoch, setTimerEpoch] = useState(0);
  const remainingMsRef = useRef(AUTO_ADVANCE_MS);
  const timerStartedAtRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useIsLive(rootRef);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (paused || !live) return;

    const duration = remainingMsRef.current;
    timerStartedAtRef.current = window.performance.now();
    const timer = window.setTimeout(() => {
      timerStartedAtRef.current = null;
      remainingMsRef.current = AUTO_ADVANCE_MS;
      setActiveIndex((index) => (index + 1) % slides.length);
    }, duration);

    return () => {
      window.clearTimeout(timer);
      if (timerStartedAtRef.current !== null) {
        remainingMsRef.current = Math.max(0, remainingMsRef.current - (window.performance.now() - timerStartedAtRef.current));
        timerStartedAtRef.current = null;
      }
    };
  }, [activeIndex, live, paused, slides.length, timerEpoch]);

  const selectSlide = (index: number) => {
    remainingMsRef.current = AUTO_ADVANCE_MS;
    timerStartedAtRef.current = null;
    setActiveIndex((index + slides.length) % slides.length);
    setTimerEpoch((epoch) => epoch + 1);
  };

  return (
    <div
      ref={rootRef}
      className="relative h-[400px] overflow-visible rounded-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      <div className="glass-panel absolute -bottom-[72px] left-6 z-10 flex h-[200px] w-[400px] max-w-[calc(100%-2rem)] flex-col items-start overflow-clip rounded-2xl bg-neutral-800/50 p-6 text-white backdrop-blur-xl backdrop-brightness-50">
        <p className="max-w-[336px] text-heading">{activeSlide.title}</p>
        <button type="button" className="mt-auto flex items-center gap-0.5 text-base font-semibold text-neutral-100">
          <span>{activeSlide.action}</span>
          <img src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5 brightness-0 invert" />
        </button>
      </div>

      <div className="absolute bottom-6 right-8 z-10 flex gap-4">
        <button
          type="button"
          aria-label="Sebelumnya"
          onClick={() => selectSlide(activeIndex - 1)}
          className="flex size-16 items-center justify-center rounded-full bg-neutral-800/50 transition-colors hover:bg-neutral-800/70"
        >
          <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-8 brightness-0 invert" />
        </button>
        <button
          type="button"
          aria-label="Berikutnya"
          onClick={() => selectSlide(activeIndex + 1)}
          className="flex size-16 items-center justify-center rounded-full bg-neutral-800/50 transition-colors hover:bg-neutral-800/70"
        >
          <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-8 brightness-0 invert" />
        </button>
      </div>

      <div className="absolute -bottom-10 left-[calc(50%-176px)] flex w-[784px] max-w-[calc(100%-2rem)] gap-3" role="tablist" aria-label="Event dan promo">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Event ${index + 1}`}
            onClick={() => selectSlide(index)}
            className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-xl bg-neutral-900/25"
          >
            {index === activeIndex && (
              <span
                key={`${activeIndex}-${timerEpoch}`}
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-full origin-left rounded-xl bg-neutral-800"
                style={{
                  animation: `solitaire-carousel-progress ${AUTO_ADVANCE_MS}ms linear forwards`,
                  animationPlayState: paused || !live ? "paused" : "running",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
