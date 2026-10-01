"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { TabLink } from "@/components/ui/Tab";

type BankingSolutionTab = "privilege" | "wealth" | "kurs";

export default function BankingSolutionIndexTabs({ activeTab }: { activeTab: BankingSolutionTab }) {
  const t = useTranslations("bankingSolutionIndex");
  const viewportRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<BankingSolutionTab, HTMLAnchorElement | null>>>({});
  const requestedTabRef = useRef<BankingSolutionTab | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const centerTab = useCallback((key: BankingSolutionTab, behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;
    const tab = tabRefs.current[key];
    if (!viewport || !tab || viewport.scrollWidth <= viewport.clientWidth) return;
    const viewportRect = viewport.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    viewport.scrollTo({
      left: viewport.scrollLeft + tabRect.left + tabRect.width / 2 - (viewportRect.left + viewportRect.width / 2),
      behavior,
    });
  }, []);

  useEffect(() => {
    if (requestedTabRef.current === activeTab) {
      requestedTabRef.current = null;
      return;
    }
    const frame = requestAnimationFrame(() => centerTab(activeTab, "auto"));
    return () => cancelAnimationFrame(frame);
  }, [activeTab, centerTab]);

  return <div data-prioritas-index-tabs className={`relative sticky top-4 z-30 -mt-12 mx-auto w-full max-w-[1280px] before:pointer-events-none before:absolute before:-top-6 before:left-1/2 before:z-0 before:h-[calc(100%+1.5rem)] before:w-screen before:-translate-x-1/2 before:transition-[background-color,backdrop-filter] before:duration-200 ${scrolled ? "before:bg-pbrown-600/95 before:backdrop-blur-md" : "before:bg-transparent"}`}>
    <div ref={viewportRef} className="hide-scrollbar relative overflow-x-auto px-4 [scrollbar-width:none] xl:overflow-visible xl:px-0">
      <div role="tablist" aria-label={t("tabLabel")} className="tab-curved-list prioritas-index-tab-list relative flex w-max overflow-visible rounded-t-xl bg-pbrown-700">
        {([
          { key: "privilege", href: "/prioritas/banking-solution" },
          { key: "wealth", href: "/prioritas/banking-solution/wealth-insight" },
          { key: "kurs", href: "/prioritas/banking-solution/kurs" },
        ] as const).map(({ key, href }) => <TabLink
          ref={(node) => { tabRefs.current[key] = node; }}
          key={key}
          href={href}
          role="tab"
          aria-selected={activeTab === key}
          scroll={false}
          onNavigate={() => {
            if (key === activeTab) return;
            requestedTabRef.current = key;
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) centerTab(key);
          }}
          variant="curved"
          active={activeTab === key}
          className="justify-center"
        >{t(`tabs.${key}`)}</TabLink>)}
      </div>
    </div>
  </div>;
}
