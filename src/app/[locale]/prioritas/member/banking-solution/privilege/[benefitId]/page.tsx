import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BankingPrivilegeDetailPage from "@/components/prioritas/BankingPrivilegeDetailPage";
import { getBankingPrivilegeItem } from "@/components/prioritas/banking-privilege-data";
import { getTranslations } from "next-intl/server";

type Params = { locale: string; benefitId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { benefitId } = await params;
  const item = getBankingPrivilegeItem(benefitId);
  if (!item) return {};
  const t = await getTranslations("bankingSolutionIndex");
  return { title: `${t(`privilege.${item.key}`)} | BCA Prioritas` };
}

export default async function MemberBankingPrivilegeDetailRoute({ params }: { params: Promise<Params> }) {
  const { locale, benefitId } = await params;
  if (!getBankingPrivilegeItem(benefitId)) notFound();
  return <BankingPrivilegeDetailPage locale={locale} benefitId={benefitId} memberArea />;
}
