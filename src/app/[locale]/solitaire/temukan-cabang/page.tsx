import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import LocationSection from "../../../../../archive/lokasi-bca/LocationSection";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasFindBranch" });
  return { title: `${t("title")} | BCA Solitaire`, description: t("description") };
}

export default async function SolitaireFindBranchPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasFindBranch");
  const navigation = await getTranslations("signaturePrivilege");
  const solitaire = await getTranslations("solitaireHero");

  return <>
    <main id="main-content" className="min-h-screen overflow-x-clip bg-neutral-200">
      <div className="relative">
        <Navbar variant="solitaire" disableHideShow />
        <PrioritasDetailSubnav
          label={navigation("subNavLabel")}
          privilege={navigation("subNav.privilege")}
          banking={navigation("subNav.banking")}
          magazine={navigation("subNav.magazine")}
          active={null}
          basePath="/solitaire"
          tone="solitaire"
        />
        <PrioritasPageHeader
          breadcrumbs={[{ label: solitaire("breadcrumbLabel"), href: "/solitaire" }, { label: t("title") }]}
          title={t("title")}
          subtitle={t("description")}
          subtitleFontWeight="normal"
          tone="solitaire"
        />
      </div>
      <LocationSection tone="solitaire" />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
    <Footer variant="prioritas" tone="solitaire" hideMagazineLink />
  </>;
}
