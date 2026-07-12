"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";

type SlideCta = { label: string; icon: string; variant: "primary" | "secondary" };
type Slide = { image: string; alt: string; title: string; cta: SlideCta };

const SLIDES: Slide[] = [
  {
    image: "/assets/cycle1/hero-image.jpg",
    alt: "Keluarga BCA",
    title: "Capai Kebebasan Finansial Lebih Dini bersama BCA",
    cta: { label: "Download myBCA", icon: "/assets/cycle1/download-icon.svg", variant: "primary" },
  },
  {
    image: "/assets/cycle1/hero-banner.jpg",
    alt: "BCA Presale The Weeknd",
    title: 'BCA Presale : The Weeknd "After Hour Til Down Tour" - Jakarta',
    cta: { label: "Dapatkan Tiket", icon: "/assets/cycle1/download-icon.svg", variant: "secondary" },
  },
  {
    image: "/assets/cycle1/hero-banner-jrf.jpg",
    alt: "Terus Nabung buat Kejar Tiket myBCA JRF 2026",
    title: "Terus Nabung buat Kejar Tiket myBCA JRF 2026!",
    cta: { label: "Pelajari Lebih Lanjut", icon: "/assets/cycle1/download-icon.svg", variant: "secondary" },
  },
];

const SLIDES_COUNT = SLIDES.length;
const SLIDE_DURATION_MS = 8000;
const TICK_MS = 50;
const DOT_RADIUS = 14;
const DOT_CIRCUMFERENCE = 2 * Math.PI * DOT_RADIUS;

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="white" aria-hidden>
      <path d="M2 1.2v9.6l8-4.8-8-4.8z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="white" aria-hidden>
      <rect x="2" y="1.5" width="2.6" height="9" />
      <rect x="7.4" y="1.5" width="2.6" height="9" />
    </svg>
  );
}

function HeroCta({ label, icon, variant }: SlideCta) {
  const isSecondary = variant === "secondary";
  return (
    <div className="group/cta relative inline-flex items-start gap-3">
      <button
        className={`relative flex h-12 items-center justify-center gap-1 rounded-full bg-white px-6 transition-colors duration-300 hover:bg-[#005caa] ${
          isSecondary ? "border-2 border-[#005caa]" : "border border-transparent"
        }`}
      >
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
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const progressCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    pausedRef.current = paused || hoveringActive;
  }, [paused, hoveringActive]);

  // The progress ring is written straight to the SVG circle via a ref instead of
  // React state, so the timer no longer re-renders the whole hero 20×/second.
  useEffect(() => {
    elapsedRef.current = 0;
    if (progressCircleRef.current) {
      progressCircleRef.current.style.strokeDashoffset = String(DOT_CIRCUMFERENCE);
    }
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      elapsedRef.current += TICK_MS;
      const pct = Math.min(1, elapsedRef.current / SLIDE_DURATION_MS);
      if (progressCircleRef.current) {
        progressCircleRef.current.style.strokeDashoffset = String(DOT_CIRCUMFERENCE * (1 - pct));
      }
      if (pct >= 1) {
        setActiveSlide((s) => (s + 1) % SLIDES_COUNT);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [activeSlide]);

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
    <div className="relative h-[640px] overflow-clip bg-[#005caa]">
      <div className="absolute inset-0 bg-black">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeSlide ? 1 : 0 }}
          />
        ))}
        <div
          className="absolute inset-y-0 left-0 w-1/3"
          style={{
            background: "linear-gradient(to right, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0) 100%)",
          }}
        />
      </div>

      <div className="absolute bottom-[192px] left-[calc(50%-408px)] flex w-[464px] -translate-x-1/2 flex-col items-start justify-end gap-8">
        <div key={activeSlide} className="flex flex-col items-start gap-8 w-full">
          <h1 className="animate-hero-title w-full text-[40px] font-semibold leading-[48px] text-white tracking-[-0.8px]">
            {SLIDES[activeSlide].title}
          </h1>
          <div className="animate-hero-cta">
            <HeroCta {...SLIDES[activeSlide].cta} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[192px] right-[calc(50%-640px)] flex items-center gap-1 rounded-[40px] bg-[rgba(0,0,0,0.5)] p-1 backdrop-blur-[4px]">
        <button
          onClick={goPrev}
          aria-label="Sebelumnya"
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        >
          <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-6" />
        </button>
        <div className="flex items-center gap-0">
          {Array.from({ length: SLIDES_COUNT }).map((_, i) => {
            const isActive = i === activeSlide;
            if (!isActive) {
              return (
                <button
                  key={i}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="flex size-8 items-center justify-center"
                >
                  <span className="size-[10px] rounded-full bg-white/40 transition-colors hover:bg-white/70" />
                </button>
              );
            }
            const showPauseIcon = !paused && hoveringActive;
            const showIcon = showPauseIcon || paused;
            return (
              <button
                key={i}
                aria-label={paused ? "Lanjutkan carousel" : "Jeda carousel"}
                onClick={() => setPaused((p) => !p)}
                onMouseEnter={() => setHoveringActive(true)}
                onMouseLeave={() => setHoveringActive(false)}
                className="relative flex size-8 items-center justify-center"
              >
                <svg viewBox="0 0 32 32" className="absolute inset-0 size-8 -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r={DOT_RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />
                  <circle
                    ref={progressCircleRef}
                    cx="16"
                    cy="16"
                    r={DOT_RADIUS}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={DOT_CIRCUMFERENCE}
                    strokeDashoffset={DOT_CIRCUMFERENCE}
                    style={{ transition: "stroke-dashoffset 50ms linear" }}
                  />
                </svg>
                {showIcon ? (
                  paused ? (
                    <PlayIcon />
                  ) : (
                    <PauseIcon />
                  )
                ) : (
                  <span className="size-[10px] rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={goNext}
          aria-label="Berikutnya"
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        >
          <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-6" />
        </button>
      </div>

      <div
        className="absolute left-0 right-0 top-0 h-[160px]"
        style={{
          background: "linear-gradient(to bottom, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0) 100%)",
        }}
      />

      <Navbar />
    </div>
  );
}