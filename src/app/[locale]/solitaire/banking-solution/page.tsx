import { setRequestLocale } from "next-intl/server";
import PublicBankingSolutionPage from "@/components/prioritas/PublicBankingSolutionPage";

export default async function PublicBankingSolutionRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PublicBankingSolutionPage brand="solitaire" />;
}
