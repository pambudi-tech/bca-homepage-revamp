"use client";

import { useEffect, useState } from "react";

/**
 * True at the `xl` breakpoint (1280px+), where the desktop layouts render.
 * SSR-safe: starts false so server and first client render agree, then matches
 * after mount.
 *
 * For anything CSS can express, use the `xl:` variant instead — this is for the
 * cases where JS has to know which layout is live: a timer that only one of the
 * two variants drives (ProductSection's autoplay), or a prop that switches a
 * component's whole layout (`compact` on SearchRecommendation), neither of
 * which `display: none` can decide.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}
