"use client";

import { useEffect, useState } from "react";

type EventSlide = {
  image: string;
  title: string;
  action: string;
  alt: string;
};

const AUTO_ADVANCE_MS = 6000;

export default function SolitaireEventPromoSection({
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const activeSlide = slides[activeIndex];
  const selectSlide = (index: number) => setActiveIndex((index + slides.length) % slides.length);

  return (
    <section id="event-promo" className="relative isolate min-h-[720px] overflow-hidden bg-neutral-400 py-20 text-neutral-900 xl:min-h-[800px]">
      <img
        src="/assets/solitaire/event-promo/background.jpeg?v=1"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <header className="mb-10 flex flex-col gap-6 xl:mb-8 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow uppercase text-neutral-900 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">
            {eyebrow}
          </p>
          <div className="flex flex-1 items-start justify-between gap-10">
            <h2 className="text-heading max-w-[560px] text-neutral-900 xl:text-display">{heading}</h2>
            <button type="button" className="btn-base shrink-0 border border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-white">
              <span className="font-semibold">{viewMore}</span>
              <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5 brightness-0" />
            </button>
          </div>
        </header>

        <div
          className="relative h-[480px] overflow-visible rounded-xl"
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

          <div className="absolute left-8 top-[252px] z-10 flex h-[312px] w-[400px] max-w-[calc(100%-4rem)] flex-col items-start overflow-clip rounded-xl border border-white/40 bg-[linear-gradient(235deg,rgba(18,20,23,0.75),rgba(26,26,26,0.75),rgba(18,20,23,0.75))] px-[30px] pb-[30px] pt-5 text-white backdrop-blur-xl">
            <p className="max-w-[336px] text-[32px] font-semibold leading-10 tracking-[-0.64px]">{activeSlide.title}</p>
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
              className="flex size-[72px] items-center justify-center rounded-full bg-black/75 transition-colors hover:bg-black/90"
            >
              <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-8 brightness-0 invert" />
            </button>
            <button
              type="button"
              aria-label="Berikutnya"
              onClick={() => selectSlide(activeIndex + 1)}
              className="flex size-[72px] items-center justify-center rounded-full bg-black/75 transition-colors hover:bg-black/90"
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
                className={`h-1.5 min-w-0 flex-1 rounded-xl transition-colors ${index === activeIndex ? "bg-neutral-800" : "bg-neutral-300/75"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
