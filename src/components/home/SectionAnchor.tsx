"use client";

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const syncNavbar = (event: Event) => {
      setNavbarHidden((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener(NAVBAR_VISIBILITY_EVENT, syncNavbar);
    return () => window.removeEventListener(NAVBAR_VISIBILITY_EVENT, syncNavbar);
  }, []);

  useEffect(() => {
    const sections = ANCHORS.map((anchor) => document.querySelector(anchor.target)).filter(
      (section): section is Element => Boolean(section)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const match = ANCHORS.find((anchor) => anchor.target === `#${visible?.target.id}`);
        if (match) setActiveKey(match.key);
      },
      { rootMargin: "-60px 0px -55%", threshold: [0, 0.15, 0.35] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navigate = (target: string) => {
    window.dispatchEvent(new CustomEvent<boolean>(NAVBAR_ANCHOR_LOCK_EVENT, { detail: true }));
    const anchor = ANCHORS.find((item) => item.target === target);
    if (anchor) {
      setActiveKey(anchor.key);

      const list = tabListRef.current;
      const tab = tabRefs.current.get(anchor.key);
      if (list && tab) {
        const targetLeft = tab.offsetLeft + tab.offsetWidth / 2 - list.clientWidth / 2;
        list.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    }
    const element = document.querySelector<HTMLElement>(target);
    if (!element) return;
    if (lenis) lenis.scrollTo(element, { offset: -60, duration: 1 });
    else element.scrollIntoView({ behavior: "smooth" });
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
            className="group relative flex shrink-0 items-center justify-center whitespace-nowrap px-3 text-sm font-semibold leading-[14px] text-blue-500 xl:flex-1 xl:px-5 xl:text-base xl:leading-normal"
          >
            {t(anchor.key)}
            <span className={`absolute inset-x-0 bottom-0 h-1 rounded-t-xl bg-blue-500 transition-opacity ${activeKey === anchor.key ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
          </button>
        ))}
      </div>
    </nav>
  );
}
