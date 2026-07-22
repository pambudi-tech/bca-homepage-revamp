"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/SmoothScroll";

/**
 * The Soliprio band's backdrop: the Prioritas photo, with the Solitaire one
 * stacked over it and cross-fading in when that card is the one in focus.
 *
 * Which photo wins is decided in CSS, not here, because the two bands answer
 * to different signals — desktop keys off `:has()` on the hovered card, mobile
 * off `data-swap-shown` from its carousel. Both end up driving the same
 * `.soliprio-photo-swap` rule (see globals.css).
 *
 * The whole stack drifts against the page as the band crosses the viewport.
 * Readers on reduced motion get no Lenis instance at all, so the effect never
 * arms and the photos stay exactly where the design puts them.
 */
export default function SoliprioPhoto({
  className,
  imgClassName,
  drift,
  swapShown,
}: {
  /** Positions the stack inside the band. */
  className: string;
  /** Applied to each layer — object-fit/position live here. */
  imgClassName: string;
  /** Vertical travel in px each way. Must stay inside the slack the band
   *  already crops away, or the drift will uncover an edge. */
  drift: number;
  /** Controlled swap (mobile carousel). Leave undefined to let CSS decide
   *  from hover (desktop). */
  swapShown?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const el = ref.current;
    if (!lenis || !el) return;

    // Cached, like NewsSection's parallax: reading layout on every scroll tick
    // starves the rAF loop that Lenis itself runs on. A rect read here is
    // cheap because it only happens on resize.
    let bandTop = 0;
    let bandHeight = 0;
    const measure = () => {
      const rect = el.parentElement?.getBoundingClientRect();
      // All zeroes while this band is `display: none` — the desktop and mobile
      // instances take turns, and the hidden one parks itself here.
      bandTop = (rect?.top ?? 0) + window.scrollY;
      bandHeight = rect?.height ?? 0;
    };

    const handleScroll = () => {
      if (!bandHeight) return;
      // 0 as the band's top enters from the bottom of the viewport, 1 once its
      // bottom has left past the top.
      const travel = window.innerHeight + bandHeight;
      const raw = (window.innerHeight - (bandTop - window.scrollY)) / travel;
      const progress = Math.min(1, Math.max(0, raw));
      const y = (0.5 - progress) * 2 * drift;
      // `transform`, not `translate` — the element's own `-translate-y-1/2`
      // utility uses the native `translate` property, so the two compose
      // instead of one wiping out the other.
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const onResize = () => {
      measure();
      handleScroll();
    };

    measure();
    handleScroll();
    lenis.on("scroll", handleScroll);
    window.addEventListener("resize", onResize);

    return () => {
      lenis.off("scroll", handleScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [lenis, drift]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none ${className}`}
      {...(swapShown === undefined
        ? {}
        : { "data-swap-shown": swapShown ? "true" : "false" })}
    >
      <img
        loading="lazy"
        decoding="async"
        src="/assets/soliprio/prioritas-image.webp"
        alt=""
        className={imgClassName}
      />
      <img
        loading="lazy"
        decoding="async"
        src="/assets/soliprio/solitaire-image.webp"
        alt=""
        className={`soliprio-photo-swap ${imgClassName}`}
      />
    </div>
  );
}
