import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasAbout" });
  return { title: `${t("title")} | BCA`, description: t("intro") };
}

export default async function GeneralAboutPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasAbout");
  const generalT = await getTranslations("generalPrivateBanking");
  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const riplayT = await getTranslations("prioritasRiplay");

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
        { href: "/temukan-kami", label: generalT("findUsTitle") },
        { href: "/riplay", label: riplayT("title") },
      ] }}
      copy={{
        subNav: {
          label: detailT("subNavLabel"),
          privilege: detailT("subNav.privilege"),
          banking: detailT("subNav.banking"),
          magazine: detailT("subNav.magazine"),
        },
        breadcrumb: { home: "BCA", category: "", current: t("title") },
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
  </>;
}
