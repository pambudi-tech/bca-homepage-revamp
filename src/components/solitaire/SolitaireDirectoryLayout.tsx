"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import PrioritasIndexTabs from "@/components/prioritas/PrioritasIndexTabs";
import BankingSolutionIndexTabs from "@/components/prioritas/BankingSolutionIndexTabs";
import { useLenis } from "@/components/SmoothScroll";

export default function SolitaireDirectoryLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const signature = useTranslations("signaturePrivilege");
  const banking = useTranslations("bankingSolutionIndex");
  const solitaire = useTranslations("solitaireHero");
  const magazine = useTranslations("magazineIndex");
  const bankingTab = pathname === "/solitaire/banking-solution"
    ? "privilege"
    : pathname.endsWith("/wealth-insight")
      ? "wealth"
      : pathname.endsWith("/kurs")
        ? "kurs"
        : null;
  const isEventIndex = pathname === "/solitaire/event";
  const isMagazineIndex = pathname === "/solitaire/e-magazine";
  const privilegeTab = pathname === "/solitaire/lifestyle-privilege" ? "lifestyle" : pathname === "/solitaire/promo" ? "promo" : null;
  const isPrivilegeDirectory = Boolean(privilegeTab);
  const hasDirectoryHeader = Boolean(bankingTab || isEventIndex || isPrivilegeDirectory || isMagazineIndex);

  useLayoutEffect(() => {
    if (!hasDirectoryHeader) return;
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true });
  }, [hasDirectoryHeader, lenis, pathname]);

  if (!hasDirectoryHeader) {
    return <>{children}<Footer variant="prioritas" tone="solitaire" hideMagazineLink /></>;
  }

  const breadcrumb = isMagazineIndex ? magazine("breadcrumb") : isEventIndex ? signature("tabs.event") : isPrivilegeDirectory ? signature(`tabs.${privilegeTab}`) : banking("breadcrumb");
  const title = isMagazineIndex ? magazine("title") : isEventIndex || privilegeTab === "promo" ? signature("eventPromoTitle") : isPrivilegeDirectory ? signature("title") : banking("title");

  return <>
    <div className="relative">
      <Navbar variant="solitaire" disableHideShow />
      <PrioritasDetailSubnav
        label={signature("subNavLabel")}
        privilege={signature("subNav.privilege")}
        banking={signature("subNav.banking")}
        magazine={signature("subNav.magazine")}
        active={isMagazineIndex ? "magazine" : bankingTab ? "banking" : "privilege"}
        basePath="/solitaire"
        tone="solitaire"
      />
      <PrioritasPageHeader
        breadcrumbs={[{ label: solitaire("breadcrumbLabel"), href: "/solitaire" }, { label: breadcrumb }]}
        title={title}
        tone="solitaire"
      />
    </div>
    {bankingTab ? <BankingSolutionIndexTabs activeTab={bankingTab} basePath="/solitaire" tone="solitaire" /> : null}
    {isEventIndex ? <PrioritasIndexTabs activeTab="event" basePath="/solitaire" tone="solitaire" /> : null}
    {isPrivilegeDirectory ? <PrioritasIndexTabs activeTab={privilegeTab!} basePath="/solitaire" tone="solitaire" /> : null}
    {children}
    <Footer variant="prioritas" tone="solitaire" hideMagazineLink />
  </>;
}
