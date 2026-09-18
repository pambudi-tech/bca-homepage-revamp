import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import NewsSection from "@/components/home/NewsSection";
import QuickActionRail from "@/components/home/QuickActionRail";
import ScrollReveal from "@/components/ScrollReveal";
import CreditCardComparison, { type ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";
import CreditCardHelpSection from "@/components/kartu-kredit/CreditCardHelpSection";
import CreditCardTutorialSection from "@/components/kartu-kredit/CreditCardTutorialSection";
import KartuKreditHero from "@/components/kartu-kredit/KartuKreditHero";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getNewsCategories } from "@/lib/news";
import { getProductCategories } from "@/lib/products";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "creditCardDetail.cardList.comparisonView" });
  return { title: t("heading") };
}

export default async function CreditCardComparisonPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cards?: string | string[] }>;
}) {
  const [{ locale }, queryParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const [produk, megamenu, t, hero, news] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getTranslations({ locale, namespace: "creditCardDetail.cardList" }),
    getTranslations({ locale, namespace: "creditCardDetail.comparisonPage" }),
    getNewsCategories(locale as AppLocale),
  ]);
  const allCards = t.raw("cards") as ComparisonCard[];
  const rawIds = Array.isArray(queryParams.cards) ? queryParams.cards[0] : queryParams.cards;
  const selectedIds = new Set((rawIds ?? "").split(",").filter(Boolean));
  const selectedCards = allCards.filter((card) => selectedIds.has(card.id)).slice(0, 3);
  const cards = selectedCards.length >= 2 ? selectedCards : allCards.slice(0, 2);
  const creditCardImage = produk.categories.find((category) => category.key === "Kartu Kredit")?.image ?? "/assets/category/kartu-kredit.webp";
  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col bg-blue-100">
      <Navbar productCategories={produk.categories} megamenuContent={megamenu} />
      <div className="pre-stage">
        <KartuKreditHero
          copy={{
            title: hero("title"),
            applyCta: hero("applyCta"),
            cardsCta: hero("cardsCta"),
            supportingText: hero("supportingText"),
            imageAlt: hero("imageAlt"),
            cardsHref: "#comparison-cards",
            backAction: { label: hero("backCta"), href: "/kartu-kredit" },
          }}
          imageSrc={creditCardImage}
        />
      </div>
      <CreditCardComparison cards={cards} availableCards={allCards} />
      <div className="bg-neutral-100 pt-12">
        <CreditCardTutorialSection />
      </div>
      <div id="berita">
        <NewsSection categories={news} />
      </div>
      <CreditCardHelpSection />
      <Footer />
      <BackToTop />
      <QuickActionRail productCategories={produk.categories} megamenuContent={megamenu} />
      <CookieBanner />
      <ScrollReveal />
    </main>
  );
}
