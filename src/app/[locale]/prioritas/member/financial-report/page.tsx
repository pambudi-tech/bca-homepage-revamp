import { getTranslations, setRequestLocale } from "next-intl/server";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";
import MemberSectionTabs from "@/components/prioritas/MemberSectionTabs";
import FinancialReportExperience from "@/components/prioritas/FinancialReportExperience";
import { cookies } from "next/headers";
import { getPortfolioViewSessionExpiry, PORTFOLIO_VIEW_SESSION_COOKIE } from "@/lib/member-auth";

export default async function PrioritasMemberFinancialReportPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ report?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("memberFinancialReport");
  const report = query.report === "tax" ? "tax" : "portfolio";
  const portfolioSessionExpiresAt = report === "portfolio"
    ? getPortfolioViewSessionExpiry((await cookies()).get(PORTFOLIO_VIEW_SESSION_COOKIE)?.value)
    : null;

  return <main id="main-content" className="min-h-screen bg-pgold-200 text-pbrown-800">
    <PrioritasMemberHeader activeTab="financial" title={t("title")} compactTitleTabGap>
      <MemberSectionTabs
        ariaLabel={t("tabs.label")}
        activeSection={report}
        tabs={[
          { id: "portfolio", label: t("tabs.portfolio"), href: "/prioritas/member/financial-report" },
          { id: "tax", label: t("tabs.tax"), href: "/prioritas/member/financial-report?report=tax" },
        ]}
      />
    </PrioritasMemberHeader>
    <FinancialReportExperience report={report} portfolioSessionExpiresAt={portfolioSessionExpiresAt} />
  </main>;
}
