import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import Footer from "@/components/home/Footer";
import HaloBcaChat from "@/components/home/HaloBcaChat";
import Navbar from "@/components/home/Navbar";
import QuickActionRail from "@/components/home/QuickActionRail";
import { PROMO_CATEGORY_KEYS, type PromoCategory } from "@/components/home/promo-data";
import PromoHero from "@/components/promo/PromoHero";
import SeasonalPromoSection from "@/components/promo/SeasonalPromoSection";
import AllPromosSection from "@/components/promo/AllPromosSection";
import PromoDiscoverySections from "@/components/promo/PromoDiscoverySections";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getProductCategories } from "@/lib/products";
import { getPromos } from "@/lib/promos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "promoPage.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PromoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[]; category?: string | string[] }>;
}) {
  const [{ locale }, queryParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const initialQuery = typeof queryParams.q === "string" ? queryParams.q : "";
  const requestedCategory = typeof queryParams.category === "string" ? queryParams.category : "all";
  const initialCategory = PROMO_CATEGORY_KEYS.includes(requestedCategory as PromoCategory)
    ? requestedCategory as PromoCategory
    : "all";

  const now = new Date();
  const [produk, megamenu, promos, t] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getPromos(now, locale as AppLocale),
    getTranslations({ locale, namespace: "promoPage" }),
  ]);

  const categories = Object.fromEntries(
    PROMO_CATEGORY_KEYS.map((category) => [category, t(`categories.${category}`)])
  ) as Record<PromoCategory, string>;

  return (
    <main id="main-content" className="flex flex-1 flex-col overflow-x-clip bg-blue-100">
      <div className="page-stack relative z-10 bg-blue-100">
        <Navbar
          variant="promo"
          productCategories={produk.categories}
          megamenuContent={megamenu}
        />
        <div className="pre-stage">
          <PromoHero
            initialQuery={initialQuery}
            initialCategory={initialCategory}
            copy={{
              eyebrow: t("hero.eyebrow"),
              title: t("hero.title"),
              cta: t("hero.cta"),
              imageAlt: t("hero.imageAlt"),
              searchPrompt: t("search.prompt"),
              searchLabel: t("search.label"),
              allCategories: t("search.allCategories"),
              categories,
              placeholders: t.raw("search.placeholders") as string[],
              popularPromos: t("search.popularPromos"),
              results: t("search.results"),
              noResults: t("search.noResults"),
              noResultsHint: t("search.noResultsHint"),
              categoryLabel: t("search.categoryLabel"),
            }}
            promos={promos.map((promo) => ({
              id: promo.id,
              title: promo.title,
              brand: promo.brand,
              cover: promo.cover,
              category: promo.category,
              redeemCount: promo.redeemCount ?? 0,
            }))}
          />
          <SeasonalPromoSection
            promos={promos}
            now={now}
            copy={{
              badge: t("seasonal.badge"),
              discount: t("seasonal.discount"),
              emphasis: t("seasonal.emphasis"),
              partner: t("seasonal.partner"),
              quota: t("seasonal.quota"),
              quotaHint: t("seasonal.quotaHint"),
              previous: t("common.previous"),
              next: t("common.next"),
            }}
          />
          <AllPromosSection
            promos={promos}
            now={now}
            initialQuery={initialQuery}
            initialCategory={initialCategory}
            copy={{
              title: t("allPromos.title"),
              showCount: t.raw("allPromos.showCount") as string,
              sort: t("allPromos.sort"),
              relevance: t("allPromos.relevance"),
              endingSoon: t("allPromos.endingSoon"),
              popular: t("allPromos.popular"),
              location: t("allPromos.location"),
              product: t("allPromos.product"),
              showMore: t("allPromos.showMore"),
              showLess: t("allPromos.showLess"),
              searchLocation: t("allPromos.searchLocation"),
              searchProduct: t("allPromos.searchProduct"),
              reset: t("allPromos.reset"),
              apply: t("allPromos.apply"),
              closeAdvanced: t("allPromos.closeAdvanced"),
              filter: t("allPromos.filter"),
              noResults: t("allPromos.noResults"),
              clearFilters: t("allPromos.clearFilters"),
              previous: t("common.previous"),
              next: t("common.next"),
              categories,
            }}
          />
          <PromoDiscoverySections
            promos={promos}
            now={now}
            copy={{
              locationEyebrow: t("locationPromo.eyebrow"),
              locationLabel: t("locationPromo.defaultLocation"),
              locationOptions: t.raw("locationPromo.locations") as string[],
              endingSoonTitle: t("endingSoon.title"),
              endingSoonDescription: t("endingSoon.description"),
              previous: t("common.previous"),
              next: t("common.next"),
            }}
          />
        </div>
      </div>

      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer />
      </div>

      <BackToTop />
      <QuickActionRail />
      <CookieBanner />
      <HaloBcaChat />
    </main>
  );
}
