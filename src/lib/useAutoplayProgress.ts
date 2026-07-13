import { useEffect, useRef, type RefObject } from "react";

// Shared autoplay + progress-ring driver for the homepage carousels
// (HeroSection, ProductSection, …). Each of these ran an identical
// setInterval loop that ticked an elapsed counter, wrote strokeDashoffset
// straight to the active slide's <circle> (no per-tick re-render), and
// advanced the slide once a full cycle completed. This centralizes that logic.
//
// Behaviour is intentionally 1:1 with the old inline effects: the timer resets
// whenever `activeIndex`/`count`/`durationMs` change, freezes while
// `pausedRef.current` is true, and calls `onAdvance` on completion.

type Options = {
  /** Current active slide index — the timer resets whenever this changes. */
  activeIndex: number;
  /** Total slides; advancing wraps modulo this (also re-keys the timer). */
  count: number;
  /** Full-cycle duration in ms. */
  durationMs: number;
  /** Circumference (2πr) of the progress ring, for strokeDashoffset. */
  circumference: number;
  /** Ref to the active slide's progress <circle>. */
  progressRef: RefObject<SVGCircleElement | null>;
  /** Ref that freezes the timer while true (hover / manual pause). */
  pausedRef: RefObject<boolean>;
  /** Called when a cycle completes — typically advances the slide. */
  onAdvance: () => void;
  /** Tick granularity in ms (default 50). */
  tickMs?: number;
};

export function useAutoplayProgress({
  activeIndex,
  count,
  durationMs,
  circumference,
  progressRef,
  pausedRef,
  onAdvance,
  tickMs = 50,
}: Options) {
  const elapsedRef = useRef(0);
  // Keep the latest callback without re-subscribing the interval each render.
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    elapsedRef.current = 0;
    if (progressRef.current) {
      progressRef.current.style.strokeDashoffset = String(circumference);
    }
    const id = setInterval(() => {
      if (pausedRef.current) return;
      elapsedRef.current += tickMs;
      const pct = Math.min(1, elapsedRef.current / durationMs);
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(circumference * (1 - pct));
      }
      if (pct >= 1) onAdvanceRef.current();
    }, tickMs);
    return () => clearInterval(id);
  }, [activeIndex, count, durationMs, circumference, tickMs, progressRef, pausedRef]);
}
