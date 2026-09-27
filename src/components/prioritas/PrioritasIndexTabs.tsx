"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type PrioritasIndexTab = "signature" | "lifestyle" | "event" | "promo";

const tabs: Array<{ key: PrioritasIndexTab; href: string }> = [
  { key: "signature", href: "/prioritas/privilege" },
  { key: "lifestyle", href: "/prioritas/lifestyle-privilege" },
  { key: "event", href: "/prioritas/event" },
  { key: "promo", href: "/prioritas/promo" },
];

export default function PrioritasIndexTabs({ activeTab }: { activeTab: PrioritasIndexTab }) {
  const t = useTranslations("signaturePrivilege");
  const viewportRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<PrioritasIndexTab, HTMLAnchorElement | null>>>({});
  const requestedTabRef = useRef<PrioritasIndexTab | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const centerTab = useCallback((key: PrioritasIndexTab, behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;
    const tab = tabRefs.current[key];
    if (!viewport || !tab || viewport.scrollWidth <= viewport.clientWidth) return false;

    const viewportRect = viewport.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const target = viewport.scrollLeft
      + tabRect.left + tabRect.width / 2
      - (viewportRect.left + viewportRect.width / 2);

    viewport.scrollTo({ left: target, behavior });
    return true;
  }, []);

  useEffect(() => {
    if (requestedTabRef.current === activeTab) {
      requestedTabRef.current = null;
      return;
    }

    const frame = requestAnimationFrame(() => centerTab(activeTab, "auto"));
    return () => cancelAnimationFrame(frame);
  }, [activeTab, centerTab]);

  return (
    <div data-prioritas-index-tabs className={`relative sticky top-4 z-30 -mt-12 mx-auto w-full max-w-[1280px] before:pointer-events-none before:absolute before:-top-6 before:left-1/2 before:z-0 before:h-[calc(100%+1.5rem)] before:w-screen before:-translate-x-1/2 before:transition-[background-color,backdrop-filter] before:duration-200 xl:-mt-14 xl:w-full ${scrolled ? "before:bg-pbrown-600/95 before:backdrop-blur-md" : "before:bg-transparent"}`}>
      <div ref={viewportRef} className="hide-scrollbar relative w-full overflow-x-auto bg-transparent px-4 [scrollbar-width:none] xl:overflow-visible xl:px-0">
        <div
          role="tablist"
          aria-label={t("tabLabel")}
          className="prioritas-index-tab-list relative flex w-max overflow-visible rounded-t-xl bg-pbrown-700"
        >
        {tabs.map(({ key, href }) => {
          const active = key === activeTab;
          return (
            <Link
              ref={(node) => { tabRefs.current[key] = node; }}
              key={key}
              href={href}
              scroll={false}
              onNavigate={() => {
                if (key === activeTab) return;
                requestedTabRef.current = key;
                if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) centerTab(key);
              }}
              role="tab"
              aria-selected={active}
              className={`prioritas-index-tab relative flex h-12 shrink-0 items-center px-6 text-base font-semibold xl:h-14 xl:px-8 xl:text-base ${active ? "prioritas-index-tab-active text-pbrown-600" : "text-pbrown-200"}`}
            >
              {t(`tabs.${key}`)}
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
