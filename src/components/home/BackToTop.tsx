"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/SmoothScroll";

// Custom shape from Figma (node 1470:6337) — a 218×52 trapezoid with rounded
// top corners, sitting flush against the bottom edge (y=52 spans the full width).
const SHAPE_PATH =
  "M24.9713 11.4217C29.3392 4.32372 37.0768 0 45.4111 0H172.589C180.923 0 188.661 4.32372 193.029 11.4217L218 52H0L24.9713 11.4217Z";

export default function BackToTop() {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const rafRef = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const update = () => {
      rafRef.current = 0;
      const y = window.scrollY;
      setVisible(y > window.innerHeight * 0.6);

      // When the footer bottom is reached, dim the trapezoid so it recedes,
      // and force the button visible regardless of scroll direction.
      const distanceToBottom =
        document.documentElement.scrollHeight - (y + window.innerHeight);
      const bottom = distanceToBottom <= 4;
      setAtBottom(bottom);

      // Navbar-like behavior: hide on scroll down, reveal on scroll up a bit.
      if (bottom) {
        setHidden(false);
      } else if (y > lastScrollY.current + 4) {
        setHidden(true);
      } else if (y < lastScrollY.current - 4) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const shown = visible && (!hidden || atBottom);

  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className={`group fixed bottom-0 left-1/2 z-50 h-[52px] w-[218px] -translate-x-1/2 transition-all duration-300 ease-out ${
        shown
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      {/* Custom SVG-shaped background: #000000 60% + backdrop blur md, clipped
          to the trapezoid path (no plain fill on the wrapper). Fades to 10%
          once the footer bottom is reached. */}
      <span
        aria-hidden
        className="absolute inset-0 backdrop-blur-md transition-colors duration-300 ease-out"
        style={{
          clipPath: "url(#back-to-top-shape)",
          backgroundColor: atBottom ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.6)",
        }}
      />

      {/* Label + arrow-up icon */}
      <span className="relative flex h-full items-center justify-center gap-2 pb-0.5">
        <span className="text-sm font-semibold leading-5 text-white">Kembali ke atas</span>
        <img loading="lazy" decoding="async"
          src="/assets/navbar/arrow-right.svg"
          alt=""
          className="size-5 -rotate-90 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
        />
      </span>

      {/* clip-path definition — path is in the same 218×52 user space as the layer */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id="back-to-top-shape" clipPathUnits="userSpaceOnUse">
            <path d={SHAPE_PATH} />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}
