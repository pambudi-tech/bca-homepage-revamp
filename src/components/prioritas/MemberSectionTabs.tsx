"use client";

import { useCallback, useRef } from "react";
import { TabLink } from "@/components/ui/Tab";

type MemberSectionTab = { id: string; label: string; href: string };

export default function MemberSectionTabs({
  ariaLabel,
  activeSection,
  tabs,
}: {
  ariaLabel: string;
  activeSection: string;
  tabs: MemberSectionTab[];
}) {
  const tabsRef = useRef<Partial<Record<string, HTMLAnchorElement | null>>>({});

  const centerTab = useCallback((section: string) => {
    const tab = tabsRef.current[section];
    const rail = tab?.parentElement;
    if (!tab || !rail || rail.scrollWidth <= rail.clientWidth) return;

    const railRect = rail.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    rail.scrollTo({
      left: rail.scrollLeft + tabRect.left + tabRect.width / 2 - (railRect.left + railRect.width / 2),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, []);

  return (
    <nav aria-label={ariaLabel} className="-mx-4 mt-auto flex w-[calc(100%+2rem)] overflow-x-auto border-b border-pbrown-100 px-4 [scrollbar-width:none] xl:mx-0 xl:w-full xl:px-0">
      {tabs.map((tab) => (
        <TabLink
          key={tab.id}
          ref={(node) => { tabsRef.current[tab.id] = node; }}
          href={tab.href}
          variant="underline"
          size="large"
          tone="prioritasMember"
          active={tab.id === activeSection}
          role="tab"
          aria-selected={tab.id === activeSection}
          onNavigate={() => centerTab(tab.id)}
        >
          {tab.label}
        </TabLink>
      ))}
    </nav>
  );
}
