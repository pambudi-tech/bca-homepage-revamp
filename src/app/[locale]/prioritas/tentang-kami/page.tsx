import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasAbout" });
  return { title: `${t("title")} | BCA Prioritas`, description: t("intro") };
}

export default async function PrioritasAboutPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasAbout");
  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const riplayT = await getTranslations("prioritasRiplay");
  const branchT = await getTranslations("prioritasFindBranch");
  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-pgold-200">
      <PrioritasDetailExperience
        kind="about"
        promos={[]}
        now={new Date().toISOString()}
        showHero={false}
        showRecommendations={false}
        alignMobileContentToIndexTitle
        relatedPages={{ title: t("relatedTitle"), links: [
          { href: "/prioritas/temukan-kami", label: branchT("title") },
          { href: "/prioritas/riplay", label: riplayT("title") },
        ] }}
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
          detail: {
            title: t("introTitle"),
            content: `${t("intro")}\n\n${t("effectiveDate")}`,
          },
          terms: {
            title: t("solitaireHeading"),
            items: [t("invitation"), t("solitairePortfolio")],
          },
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
  );
}
