import { setRequestLocale } from "next-intl/server";
import PublicBankingSolutionPage from "@/components/prioritas/PublicBankingSolutionPage";

export default async function PublicBankingSolutionRoute({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ section?: string | string[] }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  return <PublicBankingSolutionPage brand="prioritas" section={query.section} />;
}
