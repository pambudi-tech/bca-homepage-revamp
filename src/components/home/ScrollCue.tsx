"use client";

import { useEffect, useRef } from "react";

export default function ScrollCue() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (ref.current) {
        ref.current.style.opacity = window.scrollY > 320 ? "0" : "1";
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none flex items-center justify-center gap-4 py-10 transition-opacity duration-300 ease-out"
    >
      <span className="w-40 text-right text-base font-medium text-[#5f6d7e]">Terus melangkah</span>
      <div className="flex h-9 w-6 shrink-0 items-start justify-center rounded-full border-2 border-[#9cc3e8] pt-1.5">
        <span className="animate-scroll-cue-dot size-2 rounded-full bg-[#00b5f0]" />
      </div>
      <span className="w-40 text-left text-base font-medium text-[#5f6d7e]">jelajahi dunia BCA</span>
    </div>
  );
}
