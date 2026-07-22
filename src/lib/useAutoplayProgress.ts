import { useEffect, useRef, type RefObject } from "react";

// Shared autoplay + progress-ring driver for the homepage carousels
// (HeroSection, ProductSection, …). Each of these ran an identical
// setInterval loop that ticked an elapsed counter, wrote strokeDashoffset
// straight to the active slide's <circle> (no per-tick re-render), and
// advanced the slide once a full cycle completed. This centralizes that logic.
//
// The timer resets whenever `activeIndex`/`count`/`durationMs` change, freezes
// while `pausedRef.current` is true, and calls `onAdvance` on completion.
//
// Driven by requestAnimationFrame rather than setInterval. Two reasons: the ring
// now advances once per painted frame instead of in 50ms steps (so it no longer
// needs a CSS transition to hide the stepping), and rAF is throttled by the
// browser in background tabs, where a setInterval would happily keep ticking and
// firing slide changes nobody is watching. `live` additionally parks it while
// the carousel is off-screen.

type Options = {
  /** Current active slide index — the timer resets whenever this changes. */
  activeIndex: number;
  /** Total slides; advancing wraps modulo this (also re-keys the timer). */
  count: number;
  /** Full-cycle duration in ms. */
  durationMs: number;
  /** Circumference (2πr) of the progress ring, for strokeDashoffset. */
  circumference: number;
  /**
   * Ref to the active slide's progress <circle>. Accepts an array when the same
   * cycle drives more than one ring (e.g. the desktop and mobile cards, only one
   * of which is visible at a given breakpoint).
   */
  progressRef: RefObject<SVGCircleElement | null> | RefObject<SVGCircleElement | null>[];
  /** Ref that freezes the timer while true (hover / manual pause). */
  pausedRef: RefObject<boolean>;
  /** Called when a cycle completes — typically advances the slide. */
  onAdvance: () => void;
  /** False parks the loop entirely (off-screen / hidden tab). Default true. */
  live?: boolean;
};

export function useAutoplayProgress({
  activeIndex,
  count,
  durationMs,
  circumference,
  progressRef,
  pausedRef,
  onAdvance,
  live = true,
}: Options) {
  const elapsedRef = useRef(0);
  // Keep the latest callback without re-subscribing the loop each render.
  const onAdvanceRef = useRef(onAdvance);

  const write = (offset: number) => {
    const refs = Array.isArray(progressRef) ? progressRef : [progressRef];
    for (const ref of refs) {
      if (ref.current) ref.current.style.strokeDashoffset = String(offset);
    }
  };
  // Kept in a ref so the loop below doesn't re-subscribe on every render.
  const writeRef = useRef(write);

  // Refreshed after each commit rather than during render: assigning a ref
  // mid-render is not safe if React discards and replays the render, and the
  // rAF loop below only ever reads these between frames.
  useEffect(() => {
    onAdvanceRef.current = onAdvance;
    writeRef.current = write;
  });

  useEffect(() => {
    elapsedRef.current = 0;
    writeRef.current(circumference);
    if (!live) return;

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      // Clamped so returning to a parked tab doesn't apply one enormous delta
      // and skip a slide the moment the page comes back.
      const dt = Math.min(now - last, 100);
      last = now;

      if (!pausedRef.current) {
        elapsedRef.current += dt;
        const pct = Math.min(1, elapsedRef.current / durationMs);
        writeRef.current(circumference * (1 - pct));
        if (pct >= 1) {
          // Reset here as well as on re-entry: with a single slide `onAdvance`
          // leaves activeIndex alone, so this effect never re-runs to do it.
          elapsedRef.current = 0;
          onAdvanceRef.current();
        }
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex, count, durationMs, circumference, progressRef, pausedRef, live]);
}
