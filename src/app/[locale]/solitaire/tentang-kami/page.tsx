import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import Footer from "@/components/home/Footer";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasAbout" });
  return { title: `${t("title")} | BCA Solitaire`, description: t("intro") };
}

export default async function SolitaireAboutPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasAbout");
  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const solitaireT = await getTranslations("solitaireHero");
  const riplayT = await getTranslations("prioritasRiplay");

  return <>
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-neutral-200">
      <PrioritasDetailExperience
        publicBasePath="/solitaire"
        kind="about"
        promos={[]}
        now={new Date().toISOString()}
        showHero={false}
        showRecommendations={false}
        relatedPage={{ title: t("relatedTitle"), href: "/solitaire/riplay", label: riplayT("title") }}
        copy={{
          subNav: {
            label: detailT("subNavLabel"),
            privilege: detailT("subNav.privilege"),
            banking: detailT("subNav.banking"),
            magazine: detailT("subNav.magazine"),
          },
          breadcrumb: { home: solitaireT("breadcrumbLabel"), category: "", current: t("title") },
          title: t("title"),
          detail: { title: t("introTitle"), content: `${t("intro")}\n\n${t("effectiveDate")}` },
          terms: { title: t("solitaireHeading"), items: [t("invitation"), t("solitairePortfolio")] },
          contact: {
            title: t("prioritasHeading"),
            content: "",
            items: [t("invitation")],
            groups: {
              intro: t("prioritasPortfolioIntro"),
              items: [t("prioritasPortfolioOptionOne"), t("prioritasPortfolioOptionTwo")],
            },
          },
          location: { title: "", content: "" },
          recommendations: { title: "", viewMore: "" },
        }}
      />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
    <Footer variant="prioritas" tone="solitaire" hideMagazineLink />
  </>;
}
