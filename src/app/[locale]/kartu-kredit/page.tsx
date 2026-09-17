import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import NewsSection from "@/components/home/NewsSection";
import PromoSection from "@/components/home/PromoSection";
import QuickActionRail from "@/components/home/QuickActionRail";
import SectionAnchor from "@/components/home/SectionAnchor";
import ScrollReveal from "@/components/ScrollReveal";
import CreditCardBenefitsFeatures from "@/components/kartu-kredit/CreditCardBenefitsFeatures";
import CreditCardHelpSection from "@/components/kartu-kredit/CreditCardHelpSection";
import CreditCardTutorialSection from "@/components/kartu-kredit/CreditCardTutorialSection";
import KartuKreditCardList from "@/components/kartu-kredit/KartuKreditCardList";
import KartuKreditHero from "@/components/kartu-kredit/KartuKreditHero";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getNewsCategories } from "@/lib/news";
import { getProductCategories } from "@/lib/products";
import { getPromos } from "@/lib/promos";

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

  const now = new Date();
  const [produk, megamenu, hero, promos, news] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getTranslations({ locale, namespace: "creditCardDetail.hero" }),
    getPromos(now, locale as AppLocale),
    getNewsCategories(locale as AppLocale),
  ]);
  const creditCardImage =
    produk.categories.find((category) => category.key === "Kartu Kredit")?.image ??
    "/assets/category/kartu-kredit.webp";
  const sectionAnchors = [
    ["cards", "#pilihan-kartu"],
    ["benefits", "#manfaat"],
    ["features", "#fitur"],
    ["promos", "#promo"],
    ["tutorials", "#tutorial"],
    ["news", "#berita"],
    ["help", "#bantuan"],
  ].map(([key, target]) => ({ key, label: hero(`sectionNav.${key}`), target }));

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
              supportingText: hero("supportingText"),
              imageAlt: hero("imageAlt"),
            }}
            imageSrc={creditCardImage}
          />
        </div>
        <SectionAnchor label={hero("sectionNav.label")} items={sectionAnchors} />
        <KartuKreditCardList />
        <CreditCardBenefitsFeatures />
        <PromoSection promos={promos} now={now} />
        <CreditCardTutorialSection />
        <div id="berita">
          <NewsSection categories={news} />
        </div>
        <CreditCardHelpSection />
      </div>

      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer />
      </div>

      <BackToTop />
      <QuickActionRail productCategories={produk.categories} megamenuContent={megamenu} />
      <CookieBanner />
      <ScrollReveal />
    </main>
  );
}
