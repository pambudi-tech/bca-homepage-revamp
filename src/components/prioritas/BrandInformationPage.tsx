import type { Metadata } from "next";
import { getInformationPageLinks } from "./information-page-links";
import { getTranslations } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import Footer from "@/components/home/Footer";
import PrioritasDetailExperience from "./PrioritasDetailExperience";
import ExistingInformationContent from "./ExistingInformationContent";
import BrandContactPage from "./BrandContactPage";

type Brand = "prioritas" | "solitaire";
type InformationPage = "terms" | "privacy" | "contact";
const pages = {
  terms: { slug: "ketentuan" },
  privacy: { slug: "kebijakan-privasi" },
  contact: { slug: "hubungi-kami" },
} as const;

export async function informationMetadata(locale: string, brand: Brand, page: InformationPage): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "brandInformation" });
  return {
    title: `${t(`pages.${page}.title`)} | BCA ${brand === "solitaire" ? "Solitaire" : "Prioritas"}`,
    description: t(`pages.${page}.description`),
  };
}

export default async function BrandInformationPage({ brand, page, preview = false }: { brand: Brand; page: InformationPage; preview?: boolean }) {
  if (page === "contact") return <BrandContactPage brand={brand} />;
  const t = await getTranslations("brandInformation");
  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const solitaireT = await getTranslations("solitaireHero");
  const relatedLinks = await getInformationPageLinks(brand, pages[page].slug);
  const base = `/${brand}` as "/prioritas" | "/solitaire";
  const title = t(`pages.${page}.title`);
  const existingSections = t.raw(`pages.${page}.sections`) as Record<string, { title: string; contentHtml: string }>;
  const sections = Object.entries(existingSections).filter(([id]) => id !== "introduction").map(([id, section]) => ({
    id,
    title: section.title,
    content: "",
    contentNode: <ExistingInformationContent html={section.contentHtml} brand={brand} />,
  }));

  return <>
    <main id="main-content" className={`flex min-h-screen flex-1 flex-col overflow-x-clip ${brand === "solitaire" ? "bg-neutral-200" : "bg-pgold-200"}`}>
      <PrioritasDetailExperience
        preview={preview ? { brand } : undefined}
        publicBasePath={base}
        kind="about"
        promos={[]}
        now={new Date().toISOString()}
        showHero={false}
        showRecommendations={false}
        alignMobileContentToIndexTitle
        customSections={sections}
        relatedPages={{ title: t("relatedTitle"), links: relatedLinks }}
        copy={{
          subNav: { label: detailT("subNavLabel"), privilege: detailT("subNav.privilege"), banking: detailT("subNav.banking"), magazine: detailT("subNav.magazine") },
          breadcrumb: { home: brand === "solitaire" ? solitaireT("breadcrumbLabel") : detailT("breadcrumb.home"), category: "", current: title },
          title,
          subtitle: t(`pages.${page}.description`),
          detail: { title: "", content: "" },
          terms: { title: "", items: [] },
          contact: { title: "", content: "" },
          location: { title: "", content: "" },
          recommendations: { title: "", viewMore: "" },
        }}
      />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
    {brand === "solitaire" && <Footer variant="prioritas" tone="solitaire" hideMagazineLink />}
  </>;
}
