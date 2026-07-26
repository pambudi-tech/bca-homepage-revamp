"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import SlideDots, { DOT_CIRCUMFERENCE } from "./SlideDots";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useIsLive } from "@/lib/useIsLive";

type EventSlide = { id: string; image: string; alt: string };

const EVENT_SLIDES: EventSlide[] = [
  { id: "java-jazz", image: "/assets/promo/event-banner-1.webp", alt: "myBCA International Java Jazz Festival" },
  { id: "the-weeknd", image: "/assets/promo/event-banner-2.webp", alt: "After Hours Til Dawn Tour - The Weeknd" },
  { id: "brightspot", image: "/assets/promo/event-banner-3.webp", alt: "Brightspot Market" },
];

const SLIDE_DURATION_MS = 6000;
const count = EVENT_SLIDES.length;

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Offsets are expressed with calc() against --gap/--idle-w/--pad custom
// properties (set responsively via Tailwind's arbitrary-property classes on
// the window, see below) so the same formulas hold at both breakpoints
// without any JS viewport math: desktop is 40px/1126px/0px, mobile is
// 12px/324px/24px (the active banner is inset --pad from each edge; idle
// banners chain outward from that inset by --gap + --idle-w per step).
const activeLeft = "var(--pad)";
const activeWidth = "calc(100% - 2 * var(--pad))";
const idleLeft = (delta: number) => {
  const mag = Math.abs(delta);
  return delta < 0
    ? `calc(var(--pad) - ${mag} * (var(--gap) + var(--idle-w)))`
    : `calc(100% - var(--pad) + var(--gap) + ${mag - 1} * (var(--gap) + var(--idle-w)))`;
};

/**
 * Center-mode "peek" carousel (Figma "Promo Slider"). Rather than driving it
 * with native scroll (scroll-snap + scrollIntoView turned out to race its own
 * CSS transitions and settle off-center — see git history), this positions
 * slides with plain absolute `left` offsets inside a non-clipping "window"
 * that represents the 1280px active-banner slot; idle neighbors sit outside
 * the window's own bounds and are simply never clipped, so they read as
 * peeking in from the sides.
 *
 * Looping is a monotonically increasing `step` (never wraps) rather than a
 * wrapped index — each rendered slide is keyed by its absolute step number,
 * so React keeps the same DOM node (and its CSS transition) as a slide moves
 * from "next" to "active" to "prev" across any number of loops, and only
 * pops content in/out at the ±2 slots, which sit off-window and are hidden.
 */
export default function EventSlider() {
  const t = useTranslations("promo");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringActive, setHoveringActive] = useState(false);
  const pausedRef = useRef(false);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const touchStartX = useRef<number | null>(null);
  // Follow-cursor "Pelajari" badge on the active banner — same treatment as
  // the product cards (see ProductSection's ProductCard): native cursor is
  // hidden while hovering the active card and this badge tracks the pointer
  // instead. Idle peeks aren't interactive, so they keep the normal cursor.
  const activeCardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: -1000, y: -1000 });
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useIsLive(rootRef);

  const activeIndex = mod(step, count);

  useEffect(() => {
    pausedRef.current = paused || hoveringActive;
  }, [paused, hoveringActive]);

  const positionCursor = () => {
    if (!activeCardRef.current || !cursorRef.current) return;
    const rect = activeCardRef.current.getBoundingClientRect();
    const { x: clientX, y: clientY } = lastMouseRef.current;
    cursorRef.current.style.transform = `translate3d(${clientX - rect.left - 56}px, ${
      clientY - rect.top - 56
    }px, 0)`;
  };

  useEffect(() => {
    if (!hoveringActive) return;
    let frameId = 0;
    const loop = () => {
      positionCursor();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    const onWindowMouseMove = (e: MouseEvent) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onWindowMouseMove);
    };
  }, [hoveringActive]);

  useAutoplayProgress({
    activeIndex,
    count,
    durationMs: SLIDE_DURATION_MS,
    circumference: DOT_CIRCUMFERENCE,
    progressRef: progressCircleRef,
    pausedRef,
    live,
    onAdvance: () => setStep((s) => s + 1),
  });

  const goTo = (targetIndex: number) => {
    setPaused(false);
    // Shortest signed distance (mod count) from the current step to a step
    // that resolves to targetIndex — with 3 slides this is always ±1, well
    // within the ±2 rendered window.
    let diff = mod(targetIndex - activeIndex, count);
    if (diff > count / 2) diff -= count;
    if (diff !== 0) setStep((s) => s + diff);
  };
  const goPrev = () => {
    setPaused(false);
    setStep((s) => s - 1);
  };
  const goNext = () => {
    setPaused(false);
    setStep((s) => s + 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    // Touch devices fire a synthetic mouseenter (but no matching mouseleave)
    // after a tap/swipe on the active card, which would otherwise leave
    // hoveringActive stuck true and pause the autoplay forever.
    setHoveringActive(false);
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    setPaused(false);
    setStep((s) => s + (dx < 0 ? 1 : -1));
  };

  // Five consecutive steps: the visible active/prev/next trio plus one
  // invisible buffer on each side so the trio's own exit/entry has somewhere
  // to animate to/from instead of popping.
  const slots = [-2, -1, 0, 1, 2].map((delta) => ({
    delta,
    step: step + delta,
    slide: EVENT_SLIDES[mod(step + delta, count)],
  }));

  return (
    <div className="relative" ref={rootRef}>
      {/* Full-bleed to the viewport at xl (not just the 1280px section column)
          so the 1126px idle banners have room to peek beside the 1280px
          active one, matching the Figma canvas. Mobile bleeds only to the
          section's own edges via -mx-4, same as the cards row below. */}
      <div className="relative xl:left-1/2 xl:w-screen xl:-translate-x-1/2">
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative -mx-4 h-[180px] [--gap:12px] [--idle-w:324px] [--pad:24px] xl:mx-auto xl:h-[400px] xl:w-[1280px] xl:[--gap:40px] xl:[--idle-w:1126px] xl:[--pad:0px]"
        >
          {slots.map(({ delta, step: slotStep, slide }) => {
            const isActive = delta === 0;
            const hidden = Math.abs(delta) > 1;
            return (
              <div
                key={slotStep}
                ref={isActive ? activeCardRef : undefined}
                onMouseEnter={isActive ? () => setHoveringActive(true) : undefined}
                onMouseLeave={isActive ? () => setHoveringActive(false) : undefined}
                onMouseMove={
                  isActive
                    ? (e) => {
                        lastMouseRef.current = { x: e.clientX, y: e.clientY };
                      }
                    : undefined
                }
                className={`absolute top-1/2 -translate-y-1/2 overflow-clip rounded-xl transition-[left,width,height,opacity] duration-500 ease-out xl:rounded-3xl ${
                  isActive
                    ? `h-[180px] opacity-100 xl:h-[400px] ${hoveringActive ? "cursor-none" : "cursor-pointer"}`
                    : `h-[140px] w-[324px] border border-white opacity-80 xl:h-[352px] xl:w-[1126px] ${hidden ? "opacity-0" : ""}`
                }`}
                style={isActive ? { left: activeLeft, width: activeWidth } : { left: idleLeft(delta) }}
              >
                <img
                  loading={isActive ? "eager" : "lazy"}
                  decoding="async"
                  src={slide.image}
                  alt={slide.alt}
                  className="absolute inset-0 size-full object-cover"
                />
                {isActive && (
                  <div
                    ref={cursorRef}
                    className="fade-overlay pointer-events-none absolute left-0 top-0 z-30 flex size-28 items-center justify-center rounded-full border border-white/25 bg-white/[0.01] text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                    data-shown={hoveringActive ? "true" : "false"}
                    style={{ "--fade-ms": "200ms", isolation: "isolate" } as React.CSSProperties}
                  >
                    {tCommon("learnMore")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* prev/next — desktop only, pinned to the edges of the 1280px
            active banner rather than the full-bleed wrapper. */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center xl:flex">
          <div className="relative h-full w-[1280px]">
            <button
              onClick={goPrev}
              aria-label={t("prevSlide")}
              className="pointer-events-auto absolute left-6 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/40"
            >
              <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-6" />
            </button>
            <button
              onClick={goNext}
              aria-label={t("nextSlide")}
              className="pointer-events-auto absolute right-6 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/40"
            >
              <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center xl:mt-6">
        <SlideDots
          count={count}
          activeIndex={activeIndex}
          paused={paused}
          onSelect={goTo}
          onTogglePause={() => setPaused((p) => !p)}
          onActiveHoverChange={setHoveringActive}
          progressRef={progressCircleRef}
          activeColor="#00b5f0"
          inactiveColor="rgba(0,92,170,0.3)"
          inactiveHoverColor="rgba(0,92,170,0.6)"
          showPill={false}
        />
      </div>
    </div>
  );
}
