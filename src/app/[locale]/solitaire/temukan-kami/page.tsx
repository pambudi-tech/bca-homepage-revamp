import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import LocationSection from "../../../../../archive/lokasi-bca/LocationSection";
import RelatedInformationSection from "@/components/general/RelatedInformationSection";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasFindBranch" });
  return { title: `${t("title")} | BCA Solitaire`, description: t("solitaireDescription") };
}

export default async function SolitaireFindBranchPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasFindBranch");
  const navigation = await getTranslations("signaturePrivilege");
  const solitaire = await getTranslations("solitaireHero");
  const about = await getTranslations("prioritasAbout");
  const riplay = await getTranslations("prioritasRiplay");

  return <>
    <main id="main-content" className="overflow-x-clip bg-neutral-200 xl:min-h-screen">
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
          subtitle={t("solitaireDescription")}
          subtitleFontWeight="normal"
          layout="detail"
          alignMobileContentToIndexTitle
          tone="solitaire"
        />
      </div>
      <LocationSection tone="solitaire" />
      <div className="mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <RelatedInformationSection title={about("relatedTitle")} tone="solitaire" links={[
          { href: "/solitaire/tentang-kami", label: about("title") },
          { href: "/solitaire/riplay", label: riplay("title") },
        ]} />
      </div>
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
    <Footer variant="prioritas" tone="solitaire" hideMagazineLink />
  </>;
}
