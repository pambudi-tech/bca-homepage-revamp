import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberOverviewPage from "@/components/prioritas/member-pages/overview/page";
import MemberPrivilegePage from "@/components/prioritas/member-pages/privilege/page";
import MemberPrivilegeDetailPage, { generateMetadata as privilegeMetadata } from "@/components/prioritas/member-pages/privilege/[benefitId]/page";
import MemberBankingPage from "@/components/prioritas/member-pages/banking-solution/page";
import MemberKursPage from "@/components/prioritas/member-pages/banking-solution/kurs/page";
import MemberBankingDetailPage, { generateMetadata as bankingMetadata } from "@/components/prioritas/member-pages/banking-solution/privilege/[benefitId]/page";
import MemberMagazinePage from "@/components/prioritas/member-pages/e-magazine/page";
import MemberFinancialReportPage from "@/components/prioritas/member-pages/financial-report/page";
import MemberLifestyleDetailPage, { generateMetadata as lifestyleMetadata } from "@/components/prioritas/member-pages/lifestyle-privilege/[benefitId]/page";
import MemberEventDetailPage from "@/components/prioritas/member-pages/event/[eventId]/page";
import MemberPromoDetailPage from "@/components/prioritas/member-pages/promo/[promoId]/page";

type Params = { locale: string; slug: string[] };
type Search = Record<string, string | string[] | undefined>;
type Props = { params: Promise<Params>; searchParams: Promise<Search> };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const benefitId = slug[slug.length - 1];
  const detailParams = { params: Promise.resolve({ locale, benefitId }) };
  if (slug.length === 2 && slug[0] === "privilege") return privilegeMetadata(detailParams);
  if (slug.length === 3 && slug[0] === "banking-solution" && slug[1] === "privilege") return bankingMetadata(detailParams);
  if (slug.length === 2 && slug[0] === "lifestyle-privilege") return lifestyleMetadata(detailParams);
  return {};
}

export default async function PrioritasMemberPage({ params, searchParams }: Props) {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  const localeParams = Promise.resolve({ locale });
  const benefitId = slug[slug.length - 1];
  const detailParams = Promise.resolve({ locale, benefitId });

  if (slug.length === 1 && slug[0] === "overview") {
    return <MemberOverviewPage params={localeParams} searchParams={Promise.resolve({ voucherStatus: query.voucherStatus })} />;
  }
  if (slug.length === 1 && slug[0] === "privilege") {
    return <MemberPrivilegePage params={localeParams} searchParams={Promise.resolve({ section: first(query.section) })} />;
  }
  if (slug.length === 2 && slug[0] === "privilege") {
    return <MemberPrivilegeDetailPage params={detailParams} searchParams={Promise.resolve({ voucherStatus: query.voucherStatus })} />;
  }
  if (slug.length === 1 && slug[0] === "banking-solution") {
    return <MemberBankingPage params={localeParams} searchParams={Promise.resolve({ section: first(query.section) })} />;
  }
  if (slug.length === 2 && slug[0] === "banking-solution" && slug[1] === "kurs") {
    return <MemberKursPage params={localeParams} />;
  }
  if (slug.length === 3 && slug[0] === "banking-solution" && slug[1] === "privilege") {
    return <MemberBankingDetailPage params={detailParams} />;
  }
  if (slug.length === 1 && slug[0] === "e-magazine") return <MemberMagazinePage params={localeParams} />;
  if (slug.length === 1 && slug[0] === "financial-report") {
    return <MemberFinancialReportPage params={localeParams} searchParams={Promise.resolve({ report: first(query.report) })} />;
  }
  if (slug.length === 2 && slug[0] === "lifestyle-privilege") return <MemberLifestyleDetailPage params={detailParams} />;
  if (slug.length === 2 && slug[0] === "event") {
    return <MemberEventDetailPage params={Promise.resolve({ locale, eventId: slug[1] })} />;
  }
  if (slug.length === 2 && slug[0] === "promo") {
    return <MemberPromoDetailPage params={Promise.resolve({ locale, promoId: slug[1] })} />;
  }
  notFound();
}
