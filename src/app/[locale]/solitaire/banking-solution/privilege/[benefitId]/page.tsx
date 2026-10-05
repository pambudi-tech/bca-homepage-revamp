import { setRequestLocale } from "next-intl/server";
import BankingPrivilegeDetailPage from "@/components/prioritas/BankingPrivilegeDetailPage";

export default async function SolitaireBankingPrivilegeDetailPage({ params }: { params: Promise<{ locale: string; benefitId: string }> }) {
  const { locale, benefitId } = await params;
  setRequestLocale(locale);
  return <BankingPrivilegeDetailPage locale={locale} benefitId={benefitId} publicBasePath="/solitaire" />;
}
