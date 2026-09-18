import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import QuickActionRail from "@/components/home/QuickActionRail";
import ScrollReveal from "@/components/ScrollReveal";
import PromoMobileExperience from "@/components/promo/PromoMobileExperience";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getProductCategories } from "@/lib/products";
import { getPromos } from "@/lib/promos";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "promoPage.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function PromoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const now = new Date();
  const [produk, megamenu, promos] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getPromos(now),
  ]);

  return (
    <main id="main-content" className="flex flex-1 flex-col overflow-x-clip bg-neutral-100">
      <div className="page-stack relative z-10">
        <Navbar productCategories={produk.categories} megamenuContent={megamenu} promoSearchItems={promos} variant="promo" />
        <PromoMobileExperience promos={promos} now={now} />
      </div>
      <div className="relative z-0 w-full xl:sticky xl:bottom-0"><Footer /></div>
      <BackToTop />
      <QuickActionRail productCategories={produk.categories} megamenuContent={megamenu} />
      <CookieBanner />
      <ScrollReveal />
    </main>
  );
}
