"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

let lockCount = 0;

/**
 * Ref-counted page-scroll lock. Lenis has no notion of nested locks, so a bare
 * `lenis.start()` from one component silently cancels another component's
 * `stop()` — the preloader's lock used to be undone by the mobile menu's
 * effect on first mount. Acquire while you need scrolling frozen; the last
 * release is the only one that restarts Lenis.
 */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis || !locked) return;
    lockCount += 1;
    lenis.stop();
    return () => {
      lockCount -= 1;
      if (lockCount === 0) lenis.start();
    };
  }, [lenis, locked]);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Readers who ask for reduced motion get the browser's native scrolling —
    // no Lenis instance, and therefore no rAF loop at all. Consumers already
    // handle a null instance by falling back to `window.scrollTo`.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Publishes the Lenis instance, which is only constructed here (after the
    // matchMedia check above), not derivable during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setLenisInstance(lenis);

    let frameId = 0;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    // A backgrounded tab can't be scrolled, so stop driving Lenis entirely
    // instead of leaving a throttled loop ticking for the whole page.
    const onVisibility = () => {
      cancelAnimationFrame(frameId);
      if (!document.hidden) frameId = requestAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", onVisibility);
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
