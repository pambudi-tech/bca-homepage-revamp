import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrioritasSourcePromos } from "@/lib/prioritas-source-data";

export default async function PrioritasPromoPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const now = new Date();
  const promos = getPrioritasSourcePromos();
  const initialCategories = Array.isArray(category) ? category : category ? [category] : [];

  return (
    <SignaturePrivilegeExperience
      promos={promos}
      now={now}
      directoryOnly
      activeTab="promo"
      cardVariant="prioritas"
      cardDetail
      initialCategories={initialCategories}
    />
  );
}
