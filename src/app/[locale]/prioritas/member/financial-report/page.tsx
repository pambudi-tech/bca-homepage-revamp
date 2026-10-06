import { getTranslations, setRequestLocale } from "next-intl/server";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";
import MemberSectionTabs from "@/components/prioritas/MemberSectionTabs";
import FinancialReportExperience from "@/components/prioritas/FinancialReportExperience";
import { cookies } from "next/headers";
import { getMemberBrandFromSession, getPortfolioViewSessionExpiry, MEMBER_SESSION_COOKIE, memberBasePath, PORTFOLIO_VIEW_SESSION_COOKIE } from "@/lib/member-auth";

export default async function PrioritasMemberFinancialReportPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ report?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("memberFinancialReport");
  const report = query.report === "tax" ? "tax" : "portfolio";
  const memberBase = memberBasePath(getMemberBrandFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value) ?? "prioritas");
  const portfolioSessionExpiresAt = report === "portfolio"
    ? getPortfolioViewSessionExpiry((await cookies()).get(PORTFOLIO_VIEW_SESSION_COOKIE)?.value)
    : null;

  const solitaire = memberBase === "/solitaire/member";
  return <main id="main-content" className={`min-h-screen ${solitaire ? "bg-neutral-200 text-neutral-800" : "bg-pgold-200 text-pbrown-800"}`}>
    <PrioritasMemberHeader activeTab="financial" title={t("title")} compactTitleTabGap>
      <MemberSectionTabs
        ariaLabel={t("tabs.label")}
        activeSection={report}
        tabs={[
          { id: "portfolio", label: t("tabs.portfolio"), href: `${memberBase}/financial-report` },
          { id: "tax", label: t("tabs.tax"), href: `${memberBase}/financial-report?report=tax` },
        ]}
      />
    </PrioritasMemberHeader>
    <FinancialReportExperience report={report} portfolioSessionExpiresAt={portfolioSessionExpiresAt} />
  </main>;
}
