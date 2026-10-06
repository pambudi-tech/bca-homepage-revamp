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
  return { title: `${t("title")} | BCA Prioritas`, description: t("description") };
}

export default async function PrioritasFindBranchPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasFindBranch");
  const navigation = await getTranslations("signaturePrivilege");
  const about = await getTranslations("prioritasAbout");
  const riplay = await getTranslations("prioritasRiplay");
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-pgold-100">
      <div className="relative">
        <Navbar variant="prioritas" disableHideShow />
        <PrioritasDetailSubnav
          label={navigation("subNavLabel")}
          privilege={navigation("subNav.privilege")}
          banking={navigation("subNav.banking")}
          magazine={navigation("subNav.magazine")}
          active={null}
        />
        <PrioritasPageHeader breadcrumbs={[{ label: t("breadcrumb"), href: "/prioritas" }, { label: t("title") }]} title={t("title")} subtitle={t("solitaireDescription")} subtitleFontWeight="normal" layout="detail" alignMobileContentToIndexTitle />
      </div>
      <LocationSection />
      <div className="mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <RelatedInformationSection title={about("relatedTitle")} tone="prioritas" links={[
          { href: "/prioritas/tentang-kami", label: about("title") },
          { href: "/prioritas/riplay", label: riplay("title") },
        ]} />
      </div>
      <Footer variant="prioritas" />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
  );
}
