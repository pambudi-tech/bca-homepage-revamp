"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** How far down the subject starts, before scrolling rises it into place — kept small so it reads as a subtle drift, not an entrance. */
const RISE_PX = 32;

/** Smooths the raw scroll fraction into an ease-in-out curve. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Scroll-linked parallax for the myBCA mobile subject: a small downward
 * offset that eases out as the section scrolls deep into view, giving the
 * subject a subtle rise rather than a static pose — unlike `[data-reveal]`,
 * this tracks scroll position continuously rather than firing once on
 * intersection.
 */
export default function MyBcaParallax({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Stays put until the stage has scrolled well past the bottom of the
      // viewport (into the top 20%), then ramps to 1 over the next viewport
      // height — the rise only kicks in once you're deep into the section.
      const raw = 1 - Math.min(Math.max((rect.top - vh * 0.2) / vh, 0), 1);
      const progress = easeInOutCubic(raw);
      el.style.setProperty("--mb-rise", `${(1 - progress) * RISE_PX}px`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: "translateY(var(--mb-rise, 0px))",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
