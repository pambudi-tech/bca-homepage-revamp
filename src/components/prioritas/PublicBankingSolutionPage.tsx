import { getTranslations } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BrandPageSurface from "./BrandPageSurface";
import PrioritasDetailSubnav from "./PrioritasDetailSubnav";
import PrioritasPageHeader from "./PrioritasPageHeader";
import BankingSolutionIndexTabs from "./BankingSolutionIndexTabs";
import BankingSolutionIndexExperience from "./BankingSolutionIndexExperience";
import { insightAssets } from "./wealth-insight-assets";
import { getImageBackdropColor } from "@/lib/image-color";

export default async function PublicBankingSolutionPage({ brand, section }: { brand: "prioritas" | "solitaire"; section?: string | string[] }) {
  const t = await getTranslations("bankingSolutionIndex");
  const navT = await getTranslations("signaturePrivilege");
  const brandT = await getTranslations("nav.segments");
  const activeSection = section === "wealth" ? "wealth" : "privilege";
  const basePath = `/${brand}`;
  const cards = activeSection === "wealth" ? [...insightAssets.house, ...insightAssets.market] : [];
  const backdrops = Object.fromEntries(await Promise.all(cards.map(async ({ key, image }) => [key, await getImageBackdropColor(image)] as const)));

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
