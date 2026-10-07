import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberOverviewPage from "@/app/[locale]/prioritas/member/overview/page";
import MemberPrivilegePage from "@/app/[locale]/prioritas/member/privilege/page";
import MemberPrivilegeDetailPage, { generateMetadata as privilegeMetadata } from "@/app/[locale]/prioritas/member/privilege/[benefitId]/page";
import MemberBankingPage from "@/app/[locale]/prioritas/member/banking-solution/page";
import MemberKursPage from "@/app/[locale]/prioritas/member/banking-solution/kurs/page";
import MemberBankingDetailPage, { generateMetadata as bankingMetadata } from "@/app/[locale]/prioritas/member/banking-solution/privilege/[benefitId]/page";
import MemberMagazinePage from "@/app/[locale]/prioritas/member/e-magazine/page";
import MemberFinancialReportPage from "@/app/[locale]/prioritas/member/financial-report/page";
import MemberLifestyleDetailPage, { generateMetadata as lifestyleMetadata } from "@/app/[locale]/prioritas/member/lifestyle-privilege/[benefitId]/page";
import MemberEventDetailPage from "@/app/[locale]/prioritas/member/event/[eventId]/page";
import MemberPromoDetailPage from "@/app/[locale]/prioritas/member/promo/[promoId]/page";

type Params = { locale: string; slug: string[] };
type Search = Record<string, string | string[] | undefined>;
type Props = { params: Promise<Params>; searchParams: Promise<Search> };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function solitaireMetadata(metadata: Metadata): Metadata {
  return {
    ...metadata,
    title: typeof metadata.title === "string"
      ? metadata.title.replace("BCA Prioritas", "BCA Solitaire")
      : metadata.title,
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const benefitId = slug[slug.length - 1];
  const detailParams = { params: Promise.resolve({ locale, benefitId }) };

  if (slug.length === 2 && slug[0] === "privilege") {
    return solitaireMetadata(await privilegeMetadata(detailParams));
  }
  if (slug.length === 3 && slug[0] === "banking-solution" && slug[1] === "privilege") {
    return solitaireMetadata(await bankingMetadata(detailParams));
  }
  if (slug.length === 2 && slug[0] === "lifestyle-privilege") {
    return solitaireMetadata(await lifestyleMetadata(detailParams));
  }
  return {};
}

export default async function SolitaireMemberPage({ params, searchParams }: Props) {
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
  if (slug.length === 1 && slug[0] === "e-magazine") {
    return <MemberMagazinePage params={localeParams} />;
  }
  if (slug.length === 1 && slug[0] === "financial-report") {
    return <MemberFinancialReportPage params={localeParams} searchParams={Promise.resolve({ report: first(query.report) })} />;
  }
  if (slug.length === 2 && slug[0] === "lifestyle-privilege") {
    return <MemberLifestyleDetailPage params={detailParams} />;
  }
  if (slug.length === 2 && slug[0] === "event") {
    return <MemberEventDetailPage params={Promise.resolve({ locale, eventId: slug[1] })} />;
  }
  if (slug.length === 2 && slug[0] === "promo") {
    return <MemberPromoDetailPage params={Promise.resolve({ locale, promoId: slug[1] })} />;
  }
  notFound();
}
