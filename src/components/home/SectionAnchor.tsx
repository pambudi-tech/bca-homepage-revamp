"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "@/components/SmoothScroll";
import { TabButton } from "@/components/ui/Tab";
import { NAVBAR_ANCHOR_LOCK_EVENT, NAVBAR_VISIBILITY_EVENT } from "./Navbar";

export type SectionAnchorItem = {
  key: string;
  target: string;
  label?: string;
};

const HOMEPAGE_ANCHORS = [
  { key: "products", target: "#products" },
  { key: "promo", target: "#promo" },
  { key: "soliprio", target: "#soliprio" },
  { key: "news", target: "#news-section" },
  { key: "faq", target: "#faq-section" },
] satisfies SectionAnchorItem[];

export default function SectionAnchor({
  items = HOMEPAGE_ANCHORS,
  label,
  variant = "default",
  sticky = true,
}: {
  items?: SectionAnchorItem[];
  label?: string;
  variant?: "default" | "prioritas" | "solitaire";
  sticky?: boolean;
} = {}) {
  const t = useTranslations("hero.sectionAnchor");
  const lenis = useLenis();
  const [activeKey, setActiveKey] = useState(items[0]?.key ?? "");
  const [navbarHidden, setNavbarHidden] = useState(false);
  const tabListRef = useRef<HTMLElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeKeyRef = useRef(items[0]?.key ?? "");

  const centerTab = useCallback((key: string) => {
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
    const sections = items.map((anchor) => ({
      ...anchor,
      element: document.querySelector<HTMLElement>(anchor.target),
    })).filter((item): item is SectionAnchorItem & { element: HTMLElement } => Boolean(item.element));
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
  }, [centerTab, items]);

  const navigate = (target: string) => {
    const element = document.querySelector<HTMLElement>(target);
    if (!element) return;

    window.dispatchEvent(new CustomEvent<boolean>(NAVBAR_ANCHOR_LOCK_EVENT, { detail: true }));
    const anchor = items.find((item) => item.target === target);
    if (anchor) {
      activeKeyRef.current = anchor.key;
      setActiveKey(anchor.key);
      centerTab(anchor.key);
    }
    const navigationHeight = 56;
    if (lenis) lenis.scrollTo(element, { offset: -navigationHeight, duration: 1 });
    else {
      window.scrollTo({
        top: window.scrollY + element.getBoundingClientRect().top - navigationHeight,
        behavior: "smooth",
      });
    }
  };

  const prioritas = variant === "prioritas";
  const solitaire = variant === "solitaire";
  const stickyPosition = !sticky
    ? "relative"
    : navbarHidden
      ? "top-0"
      : "top-16 xl:top-[72px]";

  return (
    <nav
      ref={tabListRef}
      aria-label={label ?? t("label")}
      className={`hide-scrollbar ${sticky ? "sticky" : "relative"} ${stickyPosition} z-30 h-14 overflow-x-auto px-4 [scrollbar-width:none] backdrop-blur-md transition-[top] duration-300 ${prioritas ? "bg-pbrown-800/95" : solitaire ? "bg-neutral-900/95" : "bg-blue-200/90"}`}
    >
      <div className="flex h-full w-max xl:mx-auto xl:w-full xl:min-w-[720px] xl:max-w-[1280px]">
        {items.map((anchor) => (
          <TabButton
            key={anchor.key}
            variant="underline"
            size="large"
            tone={variant}
            active={activeKey === anchor.key}
            ref={(element) => {
              if (element) tabRefs.current.set(anchor.key, element);
              else tabRefs.current.delete(anchor.key);
            }}
            onClick={() => navigate(anchor.target)}
            className="xl:flex-1"
          >
            {anchor.label ?? t(anchor.key)}
          </TabButton>
        ))}
      </div>
    </nav>
  );
}
