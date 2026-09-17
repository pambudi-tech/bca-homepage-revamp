import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import Footer from "@/components/home/Footer";
import HaloBcaChat from "@/components/home/HaloBcaChat";
import Navbar from "@/components/home/Navbar";
import QuickActionRail from "@/components/home/QuickActionRail";
import KartuKreditCardList from "@/components/kartu-kredit/KartuKreditCardList";
import KartuKreditHero from "@/components/kartu-kredit/KartuKreditHero";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getProductCategories } from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "creditCardDetail.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function KartuKreditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [produk, megamenu, hero] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getTranslations({ locale, namespace: "creditCardDetail.hero" }),
  ]);

  return (
    <main id="main-content" className="flex flex-1 flex-col overflow-x-clip bg-blue-100">
      <div className="page-stack relative z-10 bg-blue-100">
        <Navbar productCategories={produk.categories} megamenuContent={megamenu} />
        <div className="pre-stage">
          <KartuKreditHero
            copy={{
              eyebrow: hero("eyebrow"),
              title: hero("title"),
              applyCta: hero("applyCta"),
              cardsCta: hero("cardsCta"),
              scrollCue: hero("scrollCue"),
              imageAlt: hero("imageAlt"),
            }}
          />
        </div>
        <KartuKreditCardList />
      </div>

      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer />
      </div>

      <BackToTop />
      <QuickActionRail productCategories={produk.categories} megamenuContent={megamenu} />
      <CookieBanner />
      <HaloBcaChat />
    </main>
  );
}
