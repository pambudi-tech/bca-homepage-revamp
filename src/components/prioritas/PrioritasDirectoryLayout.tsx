"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useLenis } from "@/components/SmoothScroll";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import PrioritasIndexTabs, { type PrioritasIndexTab } from "@/components/prioritas/PrioritasIndexTabs";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import BankingSolutionIndexTabs from "@/components/prioritas/BankingSolutionIndexTabs";
import { usePathname } from "@/i18n/navigation";

const directoryRoutes: Array<{ path: string; tab: PrioritasIndexTab }> = [
  { path: "/prioritas/privilege", tab: "signature" },
  { path: "/prioritas/lifestyle-privilege", tab: "lifestyle" },
  { path: "/prioritas/event", tab: "event" },
  { path: "/prioritas/promo", tab: "promo" },
];

export default function PrioritasDirectoryLayout({ children, memberPreviewName }: { children: ReactNode; memberPreviewName?: string }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const t = useTranslations("signaturePrivilege");
  const banking = useTranslations("bankingSolutionIndex");
  const magazine = useTranslations("magazineIndex");
  const route = directoryRoutes.find((item) => item.path === pathname);
  const bankingTab = pathname === "/prioritas/banking-solution" ? "privilege" : pathname === "/prioritas/banking-solution/wealth-insight" ? "wealth" : pathname === "/prioritas/banking-solution/kurs" ? "kurs" : null;
  const magazineIndex = pathname === "/prioritas/e-magazine";
  const suppressFooter = pathname === "/prioritas" || pathname === "/prioritas/temukan-kami" || pathname.startsWith("/prioritas/member");
  // Footer measures document height on mount, so refresh it after route changes.
  const footer = suppressFooter ? null : <Footer key={pathname} variant="prioritas" />;

  useLayoutEffect(() => {
    if (!route && !bankingTab && !magazineIndex) return;
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis, route, bankingTab, magazineIndex]);

  if (!route && !bankingTab && !magazineIndex) return <>
    {children}
    {footer}
  </>;

  const breadcrumb = magazineIndex ? magazine("breadcrumb") : bankingTab ? banking("breadcrumb") : route!.tab === "signature" ? t("breadcrumb") : t(`tabs.${route!.tab}`);
  const title = magazineIndex ? magazine("title") : bankingTab ? banking("title") : route!.tab === "event" || route!.tab === "promo" ? t("eventPromoTitle") : t("title");

  return (
    <>
      <div className="relative">
        <Navbar variant="prioritas" disableHideShow keepTransparentOnScroll={route?.tab === "lifestyle"} memberPreviewName={memberPreviewName} />
        <PrioritasDetailSubnav
          label={t("subNavLabel")}
          privilege={t("subNav.privilege")}
          banking={t("subNav.banking")}
          magazine={t("subNav.magazine")}
          active={magazineIndex ? "magazine" : bankingTab ? "banking" : "privilege"}
        />
        <PrioritasPageHeader breadcrumbs={[{ label: "Prioritas", href: "/prioritas" }, { label: breadcrumb }]} title={title} />
      </div>
      {bankingTab ? <BankingSolutionIndexTabs activeTab={bankingTab} /> : route ? <PrioritasIndexTabs activeTab={route.tab} /> : null}
      {children}
      {footer}
    </>
  );
}
