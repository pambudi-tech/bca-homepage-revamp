'use client';

import { useTranslations } from 'next-intl';
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BrandPageSurface from "./BrandPageSurface";
import PrioritasDetailSubnav from "./PrioritasDetailSubnav";
import PrioritasPageHeader from "./PrioritasPageHeader";
import BankingSolutionIndexTabs from "./BankingSolutionIndexTabs";
import BankingSolutionIndexExperience from "./BankingSolutionIndexExperience";

export type PublicBankingSolutionProps = { brand: 'prioritas' | 'solitaire'; activeSection: 'privilege' | 'wealth'; backdrops: Record<string, string> };

export default function PublicBankingSolutionView({ brand, activeSection, backdrops }: PublicBankingSolutionProps) {
  const t = useTranslations('bankingSolutionIndex');
  const navT = useTranslations('signaturePrivilege');
  const brandT = useTranslations('nav.segments');
  const basePath = `/${brand}`;
  return <>
    <div className="relative">
      <Navbar variant={brand} disableHideShow />
      <PrioritasDetailSubnav label={navT("subNavLabel")} privilege={navT("subNav.privilege")} banking={navT("subNav.banking")} magazine={navT("subNav.magazine")} active="banking" basePath={basePath} tone={brand} />
      <PrioritasPageHeader breadcrumbs={[
        { label: brandT(brand === "solitaire" ? "Solitaire" : "Prioritas"), href: basePath },
        { label: t("breadcrumb"), href: `${basePath}/banking-solution` },
        { label: t(`tabs.${activeSection}`) },
      ]} title={t("title")} tone={brand} />
    </div>
    <BrandPageSurface tone={brand}>
      <BankingSolutionIndexTabs activeTab={activeSection} basePath={basePath} tone={brand} />
      <div id="main-content"><BankingSolutionIndexExperience key={activeSection} activeTab={activeSection} backdrops={backdrops} publicBasePath={basePath} /></div>
    </BrandPageSurface>
    <Footer key={activeSection} variant="prioritas" tone={brand} hideMagazineLink={brand === "solitaire"} />
  </>;
}
