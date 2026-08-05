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

    // Parks the loop once Lenis has settled rather than ticking it 60x/sec
    // for the entire time the tab is open (this was the one animation loop
    // on the page with no visibility gate at all — see conversation with
    // the site owner about mobile battery/heat). `isScrolling` goes false
    // the instant Lenis's internal animation completes, so a couple of idle
    // frames after that is a safe point to stop calling raf — touch
    // scrolling itself is tracked via Lenis's native `scroll` listener, not
    // this loop, so parking it doesn't affect touch at all. Only wheel
    // input and scrollTo() calls need the loop running again.
    const IDLE_FRAMES_BEFORE_SLEEP = 3;
    let frameId = 0;
    let idleFrames = 0;

    function raf(time: number) {
      lenis.raf(time);
      if (lenis.isScrolling) {
        idleFrames = 0;
      } else {
        idleFrames += 1;
        if (idleFrames >= IDLE_FRAMES_BEFORE_SLEEP) {
          frameId = 0;
          return;
        }
      }
      frameId = requestAnimationFrame(raf);
    }

    const wake = () => {
      if (frameId || document.hidden) return;
      idleFrames = 0;
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    // Only wheel/touch can start a *new* smooth-wheel animation from rest;
    // native touch scroll, drag, and keyboard scrolling all go through
    // Lenis's own scroll listener and don't need this loop at all.
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });

    // scrollTo() (back-to-top, anchor nav, mega-menu close, …) starts an
    // animation programmatically, so it needs the same wake-up.
    const scrollTo = lenis.scrollTo.bind(lenis);
    lenis.scrollTo = (...args: Parameters<typeof scrollTo>) => {
      wake();
      return scrollTo(...args);
    };

    // A backgrounded tab can't be scrolled, so stop driving Lenis entirely
    // instead of leaving a throttled loop ticking for the whole page.
    const onVisibility = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      if (!document.hidden) wake();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchstart", wake);
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
