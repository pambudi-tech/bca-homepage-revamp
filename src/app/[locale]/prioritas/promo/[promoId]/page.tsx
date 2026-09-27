import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { buildPrioritasPromoSamples } from "@/components/prioritas/prioritas-promo-data";
import type { PromoCategory } from "@/components/home/promo-data";
import { getPromos } from "@/lib/promos";

type PromoParams = { locale: string; promoId: string };

function categoryFilter(category: PromoCategory) {
  if (category === "health-beauty") return "beauty";
  if (category === "fnb") return "culinary";
  if (category === "travel") return "travel";
  if (["hobby", "fashion-shopping", "retail", "entertainment"].includes(category)) return "lifestyle";
  if (["home-electronics", "groceries"].includes(category)) return "home";
  return "business";
}

export default async function PrioritasPromoDetailPage({ params }: { params: Promise<PromoParams> }) {
  const { locale, promoId } = await params;
  setRequestLocale(locale);
  const [t, detailT, signatureT] = await Promise.all([
    getTranslations("prioritasContentDetail"),
    getTranslations("lifestylePrivilegeDetail"),
    getTranslations("signaturePrivilege"),
  ]);
  const now = new Date();
  const samples = buildPrioritasPromoSamples({
    porsche: { title: t("promo.samples.porsche.title"), brand: t("promo.samples.porsche.brand") },
    mercedes: { title: t("promo.samples.mercedes.title"), brand: t("promo.samples.mercedes.brand") },
    landRover: { title: t("promo.samples.landRover.title"), brand: t("promo.samples.landRover.brand") },
    audi: { title: t("promo.samples.audi.title"), brand: t("promo.samples.audi.brand") },
  });
  const promos = [...samples, ...await getPromos(now)];
  const promo = promos.find((item) => item.id === promoId);
  if (!promo) notFound();

  const isPorsche = promoId === "porsche-test-drive";
  const filter = categoryFilter(promo.category);
  const recommendations = isPorsche ? samples.filter((item) => item.id !== promoId) : promos.filter((item) => item.id !== promoId).slice(0, 3);

  return <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-pgold-200">
    <PrioritasDetailExperience
      kind="promo"
      categoryFilter={filter}
      heroImage={promo.cover}
      brandLogo={promo.logo}
      heroPromo={promo}
      promos={recommendations}
      now={now.toISOString()}
      copy={{
        subNav: {
          label: detailT("subNavLabel"),
          privilege: detailT("subNav.privilege"),
          banking: detailT("subNav.banking"),
          magazine: detailT("subNav.magazine"),
        },
        breadcrumb: {
          home: detailT("breadcrumb.home"),
          category: t("promo.breadcrumb"),
          current: signatureT(`categories.${filter}`),
        },
        title: promo.title,
        brand: promo.brand,
        detail: {
          title: detailT("detail.title"),
          content: isPorsche ? t("promo.porsche.detail") : promo.details || t("fallback.description", { title: promo.title }),
        },
        terms: {
          title: detailT("terms.title"),
          items: isPorsche ? t.raw("promo.porsche.terms") as string[] : [t("fallback.terms")],
        },
        contact: {
          title: detailT("contact.title"),
          content: isPorsche ? t("promo.porsche.contact") : t("fallback.contact"),
        },
        location: {
          title: detailT("location.title"),
          content: isPorsche ? t("promo.porsche.location") : t("fallback.location"),
        },
        recommendations: { title: t("promo.recommendations"), viewMore: detailT("recommendations.viewMore") },
      }}
    />
    <BackToTop bottomInset="24px" revealAtBottom />
  </main>;
}
