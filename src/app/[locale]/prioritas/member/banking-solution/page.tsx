import { setRequestLocale, getTranslations } from "next-intl/server";
import BankingSolutionIndexExperience from "@/components/prioritas/BankingSolutionIndexExperience";
import MemberSectionTabs from "@/components/prioritas/MemberSectionTabs";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";

export default async function PrioritasMemberBankingPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ section?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("bankingSolutionIndex");
  const activeSection = query.section === "wealth" ? "wealth" : "privilege";

  return <>
    <PrioritasMemberHeader activeTab="banking" title={t("breadcrumb")} compactTitleTabGap>
      <MemberSectionTabs
        ariaLabel={t("tabLabel")}
        activeSection={activeSection}
        tabs={(["privilege", "wealth"] as const).map((section) => ({
          id: section,
          label: t(`tabs.${section}`),
          href: `/prioritas/member/banking-solution?section=${section}`,
        }))}
      />
    </PrioritasMemberHeader>
    <BankingSolutionIndexExperience activeTab={activeSection} memberArea />
  </>;
}
