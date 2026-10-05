"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { TabLink } from "@/components/ui/Tab";

export type PrioritasIndexTab = "signature" | "lifestyle" | "event" | "promo";
type PrioritasOverviewTab = "overview" | "privilege" | "banking" | "magazine" | "financial";
type PrioritasTabKey = PrioritasIndexTab | PrioritasOverviewTab;

const tabs: Array<{ key: PrioritasIndexTab; href: string }> = [
  { key: "signature", href: "/prioritas/privilege" },
  { key: "lifestyle", href: "/prioritas/lifestyle-privilege" },
  { key: "event", href: "/prioritas/event" },
  { key: "promo", href: "/prioritas/promo" },
];

const overviewTabs: Array<{ key: PrioritasOverviewTab; href: string }> = [
  { key: "overview", href: "/prioritas/member/overview#overview-start" },
  { key: "privilege", href: "/prioritas/member/privilege" },
  { key: "banking", href: "/prioritas/member/banking-solution" },
  { key: "magazine", href: "/prioritas/member/e-magazine" },
  { key: "financial", href: "/prioritas/member/financial-report" },
];

export default function PrioritasIndexTabs({ activeTab, surface = "default", basePath = "/prioritas", visibleTabs, tone = "prioritas" }: { activeTab: PrioritasTabKey; surface?: "default" | "overview" | "member"; basePath?: string; visibleTabs?: PrioritasIndexTab[]; tone?: "prioritas" | "solitaire" }) {
  const t = useTranslations(surface !== "default" ? "memberOverview" : "signaturePrivilege");
  const viewportRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<PrioritasTabKey, HTMLAnchorElement | null>>>({});
  const requestedTabRef = useRef<PrioritasTabKey | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const centerTab = useCallback((key: PrioritasTabKey, behavior: ScrollBehavior = "smooth") => {
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

  const memberUnderline = surface === "member";
  return (
    <div data-prioritas-index-tabs style={{ "--prioritas-index-tab-surface": tone === "solitaire" ? "var(--color-neutral-200)" : surface === "overview" ? "var(--color-pgold-100)" : "var(--color-pgold-200)" } as CSSProperties} className={`relative sticky top-4 z-30 mx-auto -mt-12 w-full max-w-[1280px] before:pointer-events-none before:absolute before:-top-6 before:left-1/2 before:z-0 before:h-[calc(100%+1.5rem)] before:w-screen before:-translate-x-1/2 before:transition-[background-color,backdrop-filter] before:duration-200 xl:w-full ${scrolled ? tone === "solitaire" ? "before:bg-neutral-900/95 before:backdrop-blur-md" : "before:bg-pbrown-600/95 before:backdrop-blur-md" : "before:bg-transparent"}`}>
      <div ref={viewportRef} className="hide-scrollbar relative w-full overflow-x-auto bg-transparent px-4 [scrollbar-width:none] xl:overflow-visible xl:px-0">
        <div
          role="tablist"
          aria-label={surface === "overview" ? t("nav.label") : t("tabLabel")}
          className={memberUnderline ? "relative flex w-max overflow-visible border-b border-pbrown-100 bg-pgold-100 xl:w-full" : `tab-curved-list prioritas-index-tab-list relative flex overflow-visible rounded-t-xl ${tone === "solitaire" ? "bg-neutral-800" : "bg-pbrown-700"} ${surface === "overview" ? "w-max xl:w-full" : "w-max"}`}
        >
        {(surface === "overview" ? overviewTabs : visibleTabs ? tabs.filter(({ key }) => visibleTabs.includes(key)) : tabs).map(({ key, href }) => {
          const active = key === activeTab;
          const tabVisual = memberUnderline
            ? { variant: "underline" as const, size: "medium" as const, tone: "prioritas" as const, active }
            : surface === "overview"
              ? { variant: "curved" as const, size: "medium" as const, active }
              : { variant: "curved" as const, tone, active };
          return (
            <TabLink
              ref={(node) => { tabRefs.current[key] = node; }}
              key={key}
              href={surface === "default" && basePath !== "/prioritas" ? href.replace("/prioritas", basePath) : href}
              scroll={false}
              onNavigate={() => {
                if (key === activeTab) return;
                requestedTabRef.current = key;
                if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) centerTab(key);
              }}
              role="tab"
              aria-selected={active}
              {...tabVisual}
              className={surface === "overview" ? "xl:flex-1 xl:justify-center" : undefined}
            >
              {surface === "overview" ? t(`nav.${key}`) : t(`tabs.${key}`)}
            </TabLink>
          );
        })}
        </div>
      </div>
    </div>
  );
}
