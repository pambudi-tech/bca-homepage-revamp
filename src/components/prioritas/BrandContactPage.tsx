import { getTranslations } from "next-intl/server";
import { Building2 } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import RelatedInformationSection from "@/components/general/RelatedInformationSection";
import PrioritasPageHeader from "./PrioritasPageHeader";
import PrioritasDetailSubnav from "./PrioritasDetailSubnav";
import BrandPageSurface from "./BrandPageSurface";
import InformationContactChannels from "./InformationContactChannels";
import ExistingInformationContent from "./ExistingInformationContent";
import { getInformationPageLinks } from "./information-page-links";

export default async function BrandContactPage({ brand, previewDisclosure = false }: { brand: "prioritas" | "solitaire"; previewDisclosure?: boolean }) {
  const t = await getTranslations("brandInformation");
  const navigation = await getTranslations("lifestylePrivilegeDetail");
  const solitaire = await getTranslations("solitaireHero");
  const links = await getInformationPageLinks(brand, "hubungi-kami");
  const base = `/${brand}` as "/prioritas" | "/solitaire";
  const title = t("pages.contact.title");
  const office = t.raw("pages.contact.sections.office") as { title: string; contentHtml: string };
  const accent = brand === "solitaire" ? "text-neutral-800" : "text-pbrown-600";

  return <>
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip">
      <div className="relative">
        <Navbar variant={brand} disableHideShow />
        <PrioritasDetailSubnav label={navigation("subNavLabel")} privilege={navigation("subNav.privilege")} banking={navigation("subNav.banking")} magazine={navigation("subNav.magazine")} active={null} basePath={base} tone={brand} />
        <PrioritasPageHeader breadcrumbs={[{ label: brand === "solitaire" ? solitaire("breadcrumbLabel") : navigation("breadcrumb.home"), href: base }, { label: title }]} title={title} subtitle={t("pages.contact.description")} subtitleFontWeight="normal" layout="detail" alignMobileContentToIndexTitle flowTitle tone={brand} />
      </div>
      <BrandPageSurface tone={brand}>
        <div className="relative z-10 mx-auto -mt-12 w-full max-w-[1280px] px-4 pb-16 xl:px-0 xl:pb-24">
          <InformationContactChannels brand={brand} previewDisclosure={previewDisclosure} />
          <section aria-labelledby="contact-office-title" className="mt-5 flex flex-col gap-5 rounded-2xl bg-white p-6 md:flex-row md:gap-8 xl:p-8">
            <div className={`flex items-center gap-4 md:w-1/3 md:items-start ${accent}`}>
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${brand === "solitaire" ? "bg-neutral-200" : "bg-pgold-100"}`}><Building2 aria-hidden="true" className="size-6" /></span>
              <h2 id="contact-office-title" className="text-subtitle md:pt-2">{office.title}</h2>
            </div>
            <div className="min-w-0 flex-1"><ExistingInformationContent html={office.contentHtml} brand={brand} /></div>
          </section>
          <RelatedInformationSection title={t("relatedTitle")} links={links} tone={brand} />
        </div>
      </BrandPageSurface>
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
    {brand === "solitaire" && <Footer variant="prioritas" tone="solitaire" hideMagazineLink />}
  </>;
}
