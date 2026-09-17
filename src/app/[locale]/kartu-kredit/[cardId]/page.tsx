import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import NewsSection from "@/components/home/NewsSection";
import QuickActionRail from "@/components/home/QuickActionRail";
import SectionAnchor from "@/components/home/SectionAnchor";
import ScrollReveal from "@/components/ScrollReveal";
import CreditCardDetailHero from "@/components/kartu-kredit/CreditCardDetailHero";
import CreditCardDetailSections from "@/components/kartu-kredit/CreditCardDetailSections";
import CreditCardHelpSection from "@/components/kartu-kredit/CreditCardHelpSection";
import CreditCardTutorialSection from "@/components/kartu-kredit/CreditCardTutorialSection";
import type { ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";
import { splitComparisonSections } from "@/components/kartu-kredit/comparison-utils";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getNewsCategories } from "@/lib/news";
import { getProductCategories } from "@/lib/products";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; cardId: string }> }): Promise<Metadata> {
  const { locale, cardId } = await params;
  const t = await getTranslations({ locale, namespace: "creditCardDetail.cardList" });
  const card = (t.raw("cards") as ComparisonCard[]).find((item) => item.id === cardId);
  if (!card) return { title: t("heading") };
  return { title: card.title, description: card.benefits.map((benefit) => benefit.label).join(" • ") };
}

export default async function CreditCardDetailPage({ params }: { params: Promise<{ locale: string; cardId: string }> }) {
  const { locale, cardId } = await params;
  setRequestLocale(locale);
  const [produk, megamenu, cardsT, detailT, news] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getTranslations({ locale, namespace: "creditCardDetail.cardList" }),
    getTranslations({ locale, namespace: "creditCardDetail.detailPage" }),
    getNewsCategories(locale as AppLocale),
  ]);
  const card = (cardsT.raw("cards") as ComparisonCard[]).find((item) => item.id === cardId);
  if (!card) notFound();
  const sections = splitComparisonSections(card.comparison ?? (cardsT.raw("comparisonView.sections") as NonNullable<ComparisonCard["comparison"]>));
  const navItems = sections.map((section) => ({ key: section.key, target: `#detail-${section.key === "features" ? "fitur-utama" : section.key === "requirements" ? "syarat-pengajuan" : section.key === "payments" ? "suku-bunga-pembayaran" : section.key}`, label: detailT(`tabs.${section.key}`) }));
  const sectionLabels = Object.fromEntries(navItems.map((item) => [item.key, item.label]));
  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col bg-neutral-100">
      <Navbar productCategories={produk.categories} megamenuContent={megamenu} />
      <CreditCardDetailHero card={card} applyLabel={detailT("apply")} backLabel={detailT("back")} backHref={`/${locale}/kartu-kredit`} />
      <SectionAnchor label={detailT("navigationLabel")} items={navItems} />
      <CreditCardDetailSections sections={sections} labels={sectionLabels} />
      <div className="mt-12"><CreditCardTutorialSection /></div>
      <div id="berita"><NewsSection categories={news} /></div>
      <CreditCardHelpSection />
      <Footer />
      <BackToTop />
      <QuickActionRail productCategories={produk.categories} megamenuContent={megamenu} />
      <CookieBanner />
      <ScrollReveal />
    </main>
  );
}
