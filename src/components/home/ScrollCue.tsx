"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export default function ScrollCue() {
  const t = useTranslations("scrollCue");
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
      className="flex items-center justify-center gap-4 py-8 transition-opacity duration-300 ease-out xl:py-10"
    >
      <span className="w-40 text-right text-sm font-normal text-neutral-700 xl:text-base">{t("keepGoing")}</span>
      <div className="flex h-9 w-6 shrink-0 items-start justify-center rounded-full border-2 border-[#9cc3e8] pt-1.5">
        <span className="animate-scroll-cue-dot size-2 rounded-full bg-cyan-500" />
      </div>
      <span className="w-40 text-left text-sm font-normal text-neutral-700 xl:text-base">{t("exploreBca")}</span>
    </div>
  );
}
