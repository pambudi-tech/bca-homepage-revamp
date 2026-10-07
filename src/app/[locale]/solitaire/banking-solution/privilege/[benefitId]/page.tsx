import { setRequestLocale } from "next-intl/server";
import BankingPrivilegeDetailPage from "@/components/prioritas/BankingPrivilegeDetailPage";
import { bankingPrivilegeItems } from "@/components/prioritas/banking-privilege-data";
import { routing } from "@/i18n/routing";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => bankingPrivilegeItems.map(({ id: benefitId }) => ({ locale, benefitId })));
}

export default async function SolitaireBankingPrivilegeDetailPage({ params }: { params: Promise<{ locale: string; benefitId: string }> }) {
  const { locale, benefitId } = await params;
  setRequestLocale(locale);
  return <BankingPrivilegeDetailPage locale={locale} benefitId={benefitId} publicBasePath="/solitaire" />;
}
