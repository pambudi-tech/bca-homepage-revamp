"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import BorderGlow from "@/components/ui/border-glow";

const SLIDES_COUNT = 5;
const SLIDE_DURATION_MS = 5000;
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

function DownloadButton() {
  return (
    <div className="group/cta relative inline-flex items-start gap-3">
      <BorderGlow
        autoAnimate
        loopDuration={6}
        edgeSensitivity={30}
        backgroundColor="transparent"
        borderRadius={999}
        glowRadius={20}
        glowIntensity={1}
        coneSpread={25}
        className="!border-none !shadow-none"
      >
        <button className="relative flex h-12 items-center justify-center gap-1 rounded-full border border-transparent bg-white px-6 transition-colors duration-300 hover:bg-[#005caa]">
          <span className="px-0.5 text-base font-semibold text-[#005caa] transition-colors duration-300 group-hover/cta:text-white">
            Download myBCA
          </span>
          <img
            src="/assets/cycle1/download-icon.svg"
            alt=""
            className="size-5 transition-[filter] duration-300 group-hover/cta:brightness-0 group-hover/cta:invert"
          />
        </button>
      </BorderGlow>
    </div>
  );
}

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringActive, setHoveringActive] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused || hoveringActive;
  }, [paused, hoveringActive]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      elapsedRef.current += TICK_MS;
      const pct = Math.min(1, elapsedRef.current / SLIDE_DURATION_MS);
      setProgress(pct);
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
        <img
          src="/assets/cycle1/hero-image.jpg"
          alt="Keluarga BCA"
          className="absolute inset-0 size-full object-cover will-change-transform"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0.1, 1 - scrollY * 0.001),
          }}
        />
        <div className="absolute inset-y-0 left-0 w-[960px]">
          <img
            src="/assets/cycle1/side-fade.png"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>

      <div className="absolute bottom-[192px] left-[calc(50%-408px)] flex w-[464px] -translate-x-1/2 flex-col items-start justify-end gap-8">
        <div className="flex flex-col items-start gap-6 w-full">
          <h1 className="w-full text-[40px] font-semibold leading-[48px] text-white tracking-[-0.8px]">
            Capai Kebebasan Finansial Lebih Dini bersama BCA
          </h1>
        </div>
        <DownloadButton />
      </div>

      <div
        className="absolute bottom-[192px] left-[calc(50%+524px)] flex -translate-x-1/2 items-center gap-1 rounded-[40px] bg-[rgba(0,0,0,0.25)] p-1 backdrop-blur-[4px]"
        style={{
          border: "1px solid transparent",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.5) 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
      >
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
            const dashOffset = DOT_CIRCUMFERENCE * (1 - progress);
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
                    cx="16"
                    cy="16"
                    r={DOT_RADIUS}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={DOT_CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
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

      <div className="absolute left-0 right-0 top-0 h-[200px]">
        <img
          src="/assets/cycle1/top-fade.svg"
          alt=""
          className="absolute inset-0 size-full"
        />
      </div>

      <Navbar />
    </div>
  );
}