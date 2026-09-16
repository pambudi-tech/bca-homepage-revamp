"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "@/components/SmoothScroll";
import { NAVBAR_ANCHOR_LOCK_EVENT, NAVBAR_VISIBILITY_EVENT } from "./Navbar";

const ANCHORS = [
  { key: "products", target: "#products" },
  { key: "promo", target: "#promo" },
  { key: "soliprio", target: "#soliprio" },
  { key: "news", target: "#news-section" },
  { key: "faq", target: "#faq-section" },
] as const;

export default function SectionAnchor() {
  const t = useTranslations("hero.sectionAnchor");
  const lenis = useLenis();
  const [activeKey, setActiveKey] = useState<(typeof ANCHORS)[number]["key"]>("products");
  const [navbarHidden, setNavbarHidden] = useState(false);
  const tabListRef = useRef<HTMLElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeKeyRef = useRef<(typeof ANCHORS)[number]["key"]>("products");

  const centerTab = useCallback((key: (typeof ANCHORS)[number]["key"]) => {
    const list = tabListRef.current;
    const tab = tabRefs.current.get(key);
    if (!list || !tab) return;
    const targetLeft = tab.offsetLeft + tab.offsetWidth / 2 - list.clientWidth / 2;
    list.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const syncNavbar = (event: Event) => {
      setNavbarHidden((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener(NAVBAR_VISIBILITY_EVENT, syncNavbar);
    return () => window.removeEventListener(NAVBAR_VISIBILITY_EVENT, syncNavbar);
  }, []);

  useEffect(() => {
    const sections = ANCHORS.map((anchor) => ({
      ...anchor,
      element: document.querySelector<HTMLElement>(anchor.target),
    })).filter((item): item is (typeof ANCHORS)[number] & { element: HTMLElement } => Boolean(item.element));
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      if (!sections.length) return;

      // A fixed reading line makes the result deterministic when two sections
      // are visible together. The last section whose top has crossed 40% of
      // the viewport owns the navigation state until the next one crosses it.
      const readingLine = window.innerHeight * 0.4;
      let next = sections[0];
      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= readingLine) next = section;
        else break;
      }

      // At the document end the final section may be too short to ever cross
      // the reading line, so reaching the bottom explicitly activates it.
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        next = sections[sections.length - 1];
      }

      if (next.key === activeKeyRef.current) return;
      activeKeyRef.current = next.key;
      setActiveKey(next.key);
      centerTab(next.key);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [centerTab]);

  const navigate = (target: string) => {
    window.dispatchEvent(new CustomEvent<boolean>(NAVBAR_ANCHOR_LOCK_EVENT, { detail: true }));
    const anchor = ANCHORS.find((item) => item.target === target);
    if (anchor) {
      activeKeyRef.current = anchor.key;
      setActiveKey(anchor.key);
      centerTab(anchor.key);
    }
    const element = document.querySelector<HTMLElement>(target);
    if (!element) return;
    const navigationHeight = window.matchMedia("(min-width: 80rem)").matches ? 60 : 48;
    if (lenis) lenis.scrollTo(element, { offset: -navigationHeight, duration: 1 });
    else {
      window.scrollTo({
        top: window.scrollY + element.getBoundingClientRect().top - navigationHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      ref={tabListRef}
      aria-label={t("label")}
      className={`hide-scrollbar sticky z-30 h-12 overflow-x-auto bg-blue-200/90 px-4 [scrollbar-width:none] backdrop-blur-md transition-[top] duration-300 xl:h-[60px] xl:px-20 ${navbarHidden ? "top-0" : "top-16 xl:top-[72px]"}`}
    >
      <div className="flex h-full w-max xl:mx-auto xl:w-full xl:min-w-[720px] xl:max-w-[1280px]">
        {ANCHORS.map((anchor) => (
          <button
            key={anchor.key}
            ref={(element) => {
              if (element) tabRefs.current.set(anchor.key, element);
              else tabRefs.current.delete(anchor.key);
            }}
            onClick={() => navigate(anchor.target)}
            className={`group relative flex shrink-0 items-center justify-center whitespace-nowrap px-3 text-sm leading-[14px] text-blue-500 xl:flex-1 xl:px-5 xl:text-base xl:leading-normal ${activeKey === anchor.key ? "font-bold" : "font-semibold"}`}
          >
            {t(anchor.key)}
            <span className={`absolute inset-x-0 bottom-0 h-1 rounded-t-xl bg-blue-500 transition-opacity ${activeKey === anchor.key ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
          </button>
        ))}
      </div>
    </nav>
  );
}
