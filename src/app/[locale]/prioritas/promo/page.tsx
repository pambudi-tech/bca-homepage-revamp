import { getTranslations, setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { buildPrioritasPromoSamples } from "@/components/prioritas/prioritas-promo-data";
import { getPromos } from "@/lib/promos";

export default async function PrioritasPromoPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasContentDetail");
  const now = new Date();
  const promos = await getPromos(now);
  const samples = buildPrioritasPromoSamples({
    porsche: { title: t("promo.samples.porsche.title"), brand: t("promo.samples.porsche.brand") },
    mercedes: { title: t("promo.samples.mercedes.title"), brand: t("promo.samples.mercedes.brand") },
    landRover: { title: t("promo.samples.landRover.title"), brand: t("promo.samples.landRover.brand") },
    audi: { title: t("promo.samples.audi.title"), brand: t("promo.samples.audi.brand") },
  });
  const initialCategories = Array.isArray(category) ? category : category ? [category] : [];

  return (
    <SignaturePrivilegeExperience
      promos={[...samples, ...promos]}
      now={now}
      directoryOnly
      activeTab="promo"
      cardVariant="prioritas"
      cardDetail
      initialCategories={initialCategories}
    />
  );
}
