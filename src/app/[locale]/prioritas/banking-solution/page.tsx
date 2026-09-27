import { setRequestLocale } from "next-intl/server";
import BankingSolutionIndexExperience from "@/components/prioritas/BankingSolutionIndexExperience";

export default async function BankingSolutionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BankingSolutionIndexExperience activeTab="privilege" />;
}
