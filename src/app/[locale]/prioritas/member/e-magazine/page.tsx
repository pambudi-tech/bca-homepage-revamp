import { setRequestLocale, getTranslations } from "next-intl/server";
import MagazineIndexExperience from "@/components/prioritas/MagazineIndexExperience";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";

export default async function PrioritasMemberMagazinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("magazineIndex");

  return <>
    <PrioritasMemberHeader activeTab="magazine" title={t("breadcrumb")} compactTitleTabGap />
    <MagazineIndexExperience memberLayout />
  </>;
}
