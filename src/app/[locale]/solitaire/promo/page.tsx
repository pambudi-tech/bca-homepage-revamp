import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrioritasSourcePromos } from "@/lib/prioritas-source-data";
import { getPromos } from "@/lib/promos";

export default async function SolitairePromoPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const now = new Date();
  const promos = [...getPrioritasSourcePromos(), ...await getPromos(now)];
  const initialCategories = Array.isArray(category) ? category : category ? [category] : [];

  return <SignaturePrivilegeExperience
    promos={promos}
    now={now}
    directoryOnly
    activeTab="promo"
    initialCategories={initialCategories}
    publicBasePath="/solitaire"
  />;
}
