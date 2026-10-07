import { setRequestLocale, getTranslations } from "next-intl/server";
import BankingSolutionIndexExperience from "@/components/prioritas/BankingSolutionIndexExperience";
import MemberSectionTabs from "@/components/prioritas/MemberSectionTabs";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";
import { cookies } from "next/headers";
import { getMemberBrandFromSession, MEMBER_SESSION_COOKIE, memberBasePath } from "@/lib/member-auth";

export default async function PrioritasMemberBankingPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ section?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("bankingSolutionIndex");
  const activeSection = query.section === "wealth" ? "wealth" : "privilege";
  const memberBase = memberBasePath(getMemberBrandFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value) ?? "prioritas");

  return <>
    <PrioritasMemberHeader activeTab="banking" title={t("breadcrumb")} compactTitleTabGap>
      <MemberSectionTabs
        ariaLabel={t("tabLabel")}
        activeSection={activeSection}
        tabs={[
          ...(["privilege", "wealth"] as const).map((section) => ({
            id: section,
            label: t(`tabs.${section}`),
            href: `${memberBase}/banking-solution?section=${section}`,
          })),
          { id: "kurs", label: t("tabs.kurs"), href: `${memberBase}/banking-solution/kurs` },
        ]}
      />
    </PrioritasMemberHeader>
    <BankingSolutionIndexExperience activeTab={activeSection} memberArea />
  </>;
}
