"use client";

import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { TabLink } from "@/components/ui/Tab";
import { usePathname } from "@/i18n/navigation";

type PrivilegeSection = "signature" | "lifestyle" | "event" | "promo";
const sections: PrivilegeSection[] = ["signature", "lifestyle", "event", "promo"];

export default function PrivilegeSectionTabs({ activeSection }: { activeSection: PrivilegeSection }) {
  const t = useTranslations("signaturePrivilege");
  const memberBase = usePathname().startsWith("/solitaire/member") ? "/solitaire/member" : "/prioritas/member";
  const solitaire = memberBase === "/solitaire/member";
  const tabsRef = useRef<Partial<Record<PrivilegeSection, HTMLAnchorElement | null>>>({});

  const centerTab = useCallback((section: PrivilegeSection) => {
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
    <nav aria-label={t("tabLabel")} className={`-mx-4 mt-auto flex w-[calc(100%+2rem)] overflow-x-auto border-b px-4 [scrollbar-width:none] xl:mx-0 xl:w-full xl:px-0 ${solitaire ? "border-neutral-300" : "border-pbrown-100"}`}>
      {sections.map((section) => (
        <TabLink
          key={section}
          ref={(node) => { tabsRef.current[section] = node; }}
          href={`${memberBase}/privilege?section=${section}`}
          variant="underline"
          size="large"
          tone={solitaire ? "solitaireMember" : "prioritasMember"}
          active={section === activeSection}
          role="tab"
          aria-selected={section === activeSection}
          onNavigate={() => centerTab(section)}
        >
          {t(`tabs.${section}`)}
        </TabLink>
      ))}
    </nav>
  );
}
