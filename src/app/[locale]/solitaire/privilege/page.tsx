import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import PrioritasIndexTabs from "@/components/prioritas/PrioritasIndexTabs";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrivilegePromos } from "@/lib/partner-privileges";

export default async function SolitairePrivilegePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("signaturePrivilege");
  const solitaire = await getTranslations("solitaireHero");
  const now = new Date();

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-neutral-200">
      <div className="relative">
        <Navbar variant="solitaire" disableHideShow />
        <PrioritasDetailSubnav
          label={t("subNavLabel")}
          privilege={t("subNav.privilege")}
          banking={t("subNav.banking")}
          magazine={t("subNav.magazine")}
          basePath="/solitaire"
          tone="solitaire"
        />
        <PrioritasPageHeader
          breadcrumbs={[{ label: solitaire("breadcrumbLabel"), href: "/solitaire" }, { label: t("tabs.signature") }]}
          title={t("title")}
          tone="solitaire"
        />
      </div>
      <PrioritasIndexTabs activeTab="signature" basePath="/solitaire" tone="solitaire" />
      <SignaturePrivilegeExperience
        promos={getPrivilegePromos("complimentary")}
        signaturePromos={getPrivilegePromos("signature")}
        now={now}
        publicBasePath="/solitaire"
      />
      <Footer variant="prioritas" tone="solitaire" hideMagazineLink />
      <BackToTop bottomInset="24px" />
    </main>
  );
}
