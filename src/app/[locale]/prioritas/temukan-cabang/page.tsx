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
  return { title: `${t("title")} | BCA Prioritas`, description: t("description") };
}

export default async function PrioritasFindBranchPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasFindBranch");
  const navigation = await getTranslations("signaturePrivilege");
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
        <PrioritasPageHeader breadcrumbs={[{ label: t("breadcrumb"), href: "/prioritas" }, { label: t("title") }]} title={t("title")} subtitle={t("description")} subtitleFontWeight="normal" />
      </div>
      <LocationSection />
      <Footer variant="prioritas" />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
  );
}
