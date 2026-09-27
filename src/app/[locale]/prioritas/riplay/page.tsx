import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { PRIORITAS_RIPLAY_SECTIONS } from "@/components/prioritas/prioritas-riplay-data";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasRiplay" });
  return { title: `${t("title")} | BCA Prioritas` };
}

export default async function PrioritasRiplayPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasRiplay");
  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const aboutT = await getTranslations("prioritasAbout");

  const titles: Record<(typeof PRIORITAS_RIPLAY_SECTIONS)[number]["id"], string> = {
    solitaire: t("solitaireTitle"),
    prioritas: t("prioritasTitle"),
    safeDepositBox: t("safeDepositBoxTitle"),
  };

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-pgold-200">
      <PrioritasDetailExperience
        kind="about"
        promos={[]}
        now={new Date().toISOString()}
        showHero={false}
        showRecommendations={false}
        relatedPage={{ title: t("relatedTitle"), href: "/prioritas/tentang-kami", label: aboutT("title") }}
        customSections={PRIORITAS_RIPLAY_SECTIONS.map((section) => ({ ...section, title: titles[section.id] }))}
        copy={{
          subNav: {
            label: detailT("subNavLabel"),
            privilege: detailT("subNav.privilege"),
            banking: detailT("subNav.banking"),
            magazine: detailT("subNav.magazine"),
          },
          breadcrumb: {
            home: detailT("breadcrumb.home"),
            category: "",
            current: t("title"),
          },
          title: t("title"),
          detail: { title: "", content: "" },
          terms: { title: "", items: [] },
          contact: { title: "", content: "" },
          location: { title: "", content: "" },
          recommendations: { title: "", viewMore: "" },
        }}
      />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
  );
}
