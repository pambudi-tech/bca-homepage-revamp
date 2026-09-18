import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import CreditCardDetailHero from "@/components/kartu-kredit/CreditCardDetailHero";
import CreditCardDetailSections from "@/components/kartu-kredit/CreditCardDetailSections";
import KrisflyerMileageSection from "@/components/kartu-kredit/KrisflyerMileageSection";
import CreditCardBenefitsFeatures from "@/components/kartu-kredit/CreditCardBenefitsFeatures";
import CreditCardHelpSection from "@/components/kartu-kredit/CreditCardHelpSection";
import CreditCardTutorialSection from "@/components/kartu-kredit/CreditCardTutorialSection";
import type { ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";
import { splitComparisonSections } from "@/components/kartu-kredit/comparison-utils";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getNewsCategories } from "@/lib/news";
import { getProductCategories } from "@/lib/products";
import { getPromos } from "@/lib/promos";

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
  const now = new Date();
  const [produk, megamenu, cardsT, detailT, heroT, promos, news] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getTranslations({ locale, namespace: "creditCardDetail.cardList" }),
    getTranslations({ locale, namespace: "creditCardDetail.detailPage" }),
    getTranslations({ locale, namespace: "creditCardDetail.hero" }),
    getPromos(now),
    getNewsCategories(locale as AppLocale),
  ]);
  const card = (cardsT.raw("cards") as ComparisonCard[]).find((item) => item.id === cardId);
  if (!card) notFound();
  const sections = splitComparisonSections(card.comparison ?? (cardsT.raw("comparisonView.sections") as NonNullable<ComparisonCard["comparison"]>));
  const navItems = [
    { key: "benefits", target: "#manfaat", label: heroT("sectionNav.benefits") },
    { key: "features", target: "#fitur", label: heroT("sectionNav.features") },
    { key: "information", target: "#informasi-lainnya", label: detailT("informationTitle") },
    ...(card.id === "krisflyer-signature" ? [{ key: "mileage", target: "#simulasi-mileage", label: detailT("mileageTitle") }] : []),
    { key: "promos", target: "#promo", label: heroT("sectionNav.promos") },
    { key: "tutorials", target: "#tutorial", label: heroT("sectionNav.tutorials") },
    { key: "news", target: "#berita", label: heroT("sectionNav.news") },
    { key: "help", target: "#bantuan", label: heroT("sectionNav.help") },
  ];
  const sectionLabels = Object.fromEntries(sections.map((section) => [section.key, detailT(`tabs.${section.key}`)]));
  const mileageCards = (cardsT.raw("cards") as ComparisonCard[])
    .filter((mileageCard) => ["krisflyer-signature", "krisflyer-infinite", "pps-club-infinite"].includes(mileageCard.id))
    .map((mileageCard) => ({
      id: mileageCard.id,
      title: mileageCard.title,
      image: mileageCard.image,
      imageAlt: mileageCard.imageAlt,
      rate: mileageCard.id === "krisflyer-infinite" ? 10_800 : mileageCard.id === "pps-club-infinite" ? 5_000 : 13_500,
    }));
  const creditCardImage = produk.categories.find((category) => category.key === "Kartu Kredit")?.image ?? "/assets/category/kartu-kredit.webp";
  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col bg-neutral-100">
      <Navbar productCategories={produk.categories} megamenuContent={megamenu} />
      <CreditCardDetailHero card={card} imageSrc={creditCardImage} subtitle={detailT(`subtitles.${card.id}`)} applyLabel={detailT("apply")} backLabel={detailT("back")} backHref="/kartu-kredit" />
      <SectionAnchor label={detailT("navigationLabel")} items={navItems} />
      <CreditCardBenefitsFeatures card={card} />
      <CreditCardDetailSections sections={sections} labels={sectionLabels} cardId={card.id} />
      {card.id === "krisflyer-signature" ? <KrisflyerMileageSection cards={mileageCards} initialCardId={card.id} /> : null}
      <PromoSection promos={promos} now={now} />
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
