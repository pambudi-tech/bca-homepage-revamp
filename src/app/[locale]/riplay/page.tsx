import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { PRIORITAS_RIPLAY_SECTIONS } from "@/components/prioritas/prioritas-riplay-data";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasRiplay" });
  return { title: `${t("title")} | BCA` };
}

export default async function GeneralRiplayPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasRiplay");
  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const aboutT = await getTranslations("prioritasAbout");
  const generalT = await getTranslations("generalPrivateBanking");

  const titles: Record<(typeof PRIORITAS_RIPLAY_SECTIONS)[number]["id"], string> = {
    solitaire: t("solitaireTitle"),
    prioritas: t("prioritasTitle"),
    safeDepositBox: t("safeDepositBoxTitle"),
  };

  return <>
    <PrioritasDetailExperience
      publicBasePath="/"
      generalPage
      kind="about"
      promos={[]}
      now={new Date().toISOString()}
      showHero={false}
      showRecommendations={false}
      alignMobileContentToIndexTitle
      generalEntryPoints={{
        title: generalT("entryPointsTitle"),
        entries: [
          { href: "/solitaire", title: generalT("solitaireEntryTitle"), action: generalT("entryAction"), image: "/assets/soliprio/solitaire-image.webp" },
          { href: "/prioritas", title: generalT("prioritasEntryTitle"), action: generalT("entryAction"), image: "/assets/soliprio/prioritas-image.webp" },
        ],
      }}
      relatedPages={{ title: t("relatedTitle"), links: [
        { href: "/tentang-kami", label: aboutT("title") },
        { href: "/temukan-kami", label: generalT("findUsTitle") },
      ] }}
      customSections={PRIORITAS_RIPLAY_SECTIONS.map((section) => ({ ...section, title: titles[section.id] }))}
      copy={{
        subNav: {
          label: detailT("subNavLabel"),
          privilege: detailT("subNav.privilege"),
          banking: detailT("subNav.banking"),
          magazine: detailT("subNav.magazine"),
        },
        breadcrumb: { home: "BCA", category: "", current: t("title") },
        title: t("title"),
        detail: { title: "", content: "" },
        terms: { title: "", items: [] },
        contact: { title: "", content: "" },
        location: { title: "", content: "" },
        recommendations: { title: "", viewMore: "" },
      }}
    />
    <BackToTop bottomInset="24px" revealAtBottom />
  </>;
}
