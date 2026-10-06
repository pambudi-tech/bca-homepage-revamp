import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import GeneralPrivateBankingHeader from "@/components/general/GeneralPrivateBankingHeader";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import LocationSection from "../../../../archive/lokasi-bca/LocationSection";
import RelatedInformationSection from "@/components/general/RelatedInformationSection";
import GeneralPrivateBankingEntryPoints from "@/components/general/GeneralPrivateBankingEntryPoints";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "generalPrivateBanking" });
  const branchT = await getTranslations({ locale, namespace: "prioritasFindBranch" });
  return { title: `${t("findUsTitle")} | BCA`, description: branchT("solitaireDescription") };
}

export default async function GeneralFindUsPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("generalPrivateBanking");
  const aboutT = await getTranslations("prioritasAbout");
  const riplayT = await getTranslations("prioritasRiplay");
  const branchT = await getTranslations("prioritasFindBranch");
  const generalT = await getTranslations("generalPrivateBanking");

  return <>
    <main id="main-content" className="general-private-banking-background min-h-screen overflow-x-clip bg-neutral-200">
      <GeneralPrivateBankingHeader />
      <PrioritasPageHeader
        breadcrumbs={[{ label: "BCA", href: "/" }, { label: t("findUsTitle") }]}
        title={t("findUsTitle")}
        subtitle={branchT("solitaireDescription")}
        subtitleFontWeight="normal"
        layout="detail"
        hideBreadcrumb
        tallGeneralHeader
        alignMobileContentToIndexTitle
        tone="general"
      />
      <LocationSection tone="solitaire" generalBackground />
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 xl:px-0 xl:pb-28">
        <RelatedInformationSection title={aboutT("relatedTitle")} links={[
          { href: "/tentang-kami", label: aboutT("title") },
          { href: "/riplay", label: riplayT("title") },
        ]} />
        <GeneralPrivateBankingEntryPoints title={generalT("entryPointsTitle")} entries={[
          { href: "/solitaire", title: generalT("solitaireEntryTitle"), action: generalT("entryAction"), image: "/assets/soliprio/solitaire-image.webp" },
          { href: "/prioritas", title: generalT("prioritasEntryTitle"), action: generalT("entryAction"), image: "/assets/soliprio/prioritas-image.webp" },
        ]} />
      </div>
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
  </>;
}
