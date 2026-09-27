"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "@/components/SmoothScroll";
import { MOBILE_QUICK_NAV_VISIBILITY_EVENT } from "./QuickActionRail";

// BackToTop and QuickActionRail use fixed end caps with a flexible center.
// A single masked backdrop keeps the desktop blur continuous across the caps.
const CAP_PATH = "M 0 52 L 24.9713 11.4217 C 29.3392 4.32372 37.0768 0 45.4111 0 H 52 V 52 Z";
function capMask(mirrored: boolean) {
  const transform = mirrored ? ' transform="translate(52 0) scale(-1 1)"' : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><path fill="white" d="${CAP_PATH}"${transform}/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const BACKGROUND_MASK = `linear-gradient(#000 0 0), ${capMask(false)}, ${capMask(true)}`;

type BackToTopActionProps = {
  label: string;
  shown: boolean;
  onClick: () => void;
  atBottom?: boolean;
  mobileQuickNavHidden?: boolean;
  fitContent?: boolean;
  direction?: "up" | "down";
  bottomInset?: "default" | "24px" | "32px";
  progressiveBackdrop?: boolean;
};

export function BackToTopAction({ label, shown, onClick, atBottom = false, mobileQuickNavHidden = false, fitContent = false, direction = "up", bottomInset = "default", progressiveBackdrop = false }: BackToTopActionProps) {
  const backgroundColor = atBottom ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.6)";
  return (
    <>
      {progressiveBackdrop ? <span
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-pbrown-900/15 via-pbrown-900/5 to-transparent backdrop-blur-md transition-opacity duration-300 ease-out md:h-44 ${shown ? "opacity-100" : "opacity-0"}`}
        style={{ maskImage: "linear-gradient(to top, #000 0%, #000 25%, transparent 85%)", WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 25%, transparent 85%)" }}
      /> : null}
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        inert={!shown}
        className={`group fixed left-1/2 z-30 h-11 -translate-x-1/2 px-5 transition-all duration-300 ease-out md:h-[52px] ${fitContent ? "w-max md:px-[52px]" : "w-auto md:w-[218px] md:px-0"} ${bottomInset === "24px" ? "bottom-[calc(24px+env(safe-area-inset-bottom))] md:bottom-0" : bottomInset === "32px" ? "bottom-[calc(32px+env(safe-area-inset-bottom))] md:bottom-0" : `xl:bottom-0 ${mobileQuickNavHidden ? "bottom-[calc(16px+env(safe-area-inset-bottom))]" : "bottom-[calc(86px+env(safe-area-inset-bottom)+12px)]"}`} ${shown ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[150%] opacity-0 md:translate-y-full"}`}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-md transition-colors duration-300 ease-out md:hidden" style={{ backgroundColor }} />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden backdrop-blur-md transition-colors duration-300 ease-out md:block"
          style={{
            backgroundColor,
            maskImage: BACKGROUND_MASK,
            WebkitMaskImage: BACKGROUND_MASK,
            maskSize: "calc(100% - 100px) 100%, 52px 52px, 52px 52px",
            WebkitMaskSize: "calc(100% - 100px) 100%, 52px 52px, 52px 52px",
            maskPosition: "center, left center, right center",
            WebkitMaskPosition: "center, left center, right center",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
        <span className="relative flex h-full items-center justify-center gap-2 whitespace-nowrap md:pb-0.5">
          <span className="text-sm font-semibold leading-5 text-white">{label}</span>
          <img loading="lazy" decoding="async" src="/assets/navbar/arrow-right.svg" alt="" className={`size-5 transition-transform duration-300 ease-out ${direction === "down" ? "rotate-90 group-hover:translate-y-0.5" : "-rotate-90 group-hover:-translate-y-0.5"}`} />
        </span>
      </button>
    </>
  );
}

export default function BackToTop({ bottomInset = "default", revealAtBottom = false }: { bottomInset?: "default" | "24px" | "32px"; revealAtBottom?: boolean }) {
  const t = useTranslations("backToTop");
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [mobileQuickNavHidden, setMobileQuickNavHidden] = useState(false);
  const rafRef = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // `scrollHeight` forces a layout reflow, so it's cached here and only
    // refreshed on resize — reading it on every scroll frame was jamming the
    // main thread the Lenis smooth-scroll rAF loop depends on.
    let docHeight = document.documentElement.scrollHeight;
    const measure = () => {
      docHeight = document.documentElement.scrollHeight;
    };
    measure();
    window.addEventListener("resize", measure);

    const update = () => {
      rafRef.current = 0;
      const y = window.scrollY;

      // When the footer bottom is reached, dim the trapezoid so it recedes,
      // and force the button visible regardless of scroll direction.
      const distanceToBottom = docHeight - (y + window.innerHeight);
      const bottom = distanceToBottom <= 4;
      setAtBottom(bottom);
      setVisible(y > window.innerHeight * 0.6 || (revealAtBottom && bottom && y > 8));

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
      window.removeEventListener("resize", measure);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [revealAtBottom]);

  useEffect(() => {
    const onQuickNavVisibility = (event: Event) => {
      setMobileQuickNavHidden((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener(MOBILE_QUICK_NAV_VISIBILITY_EVENT, onQuickNavVisibility);
    return () => window.removeEventListener(MOBILE_QUICK_NAV_VISIBILITY_EVENT, onQuickNavVisibility);
  }, []);

  const shown = visible && (!hidden || atBottom);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.backToTopShown = shown ? "true" : "false";

    return () => {
      delete root.dataset.backToTopShown;
    };
  }, [shown]);

  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <BackToTopAction label={t("label")} shown={shown} onClick={scrollToTop} atBottom={atBottom} mobileQuickNavHidden={mobileQuickNavHidden} bottomInset={bottomInset} />;
}
