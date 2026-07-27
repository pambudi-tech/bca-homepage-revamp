import { setRequestLocale } from "next-intl/server";
import HeroArea from "@/components/home/HeroArea";
import Navbar from "@/components/home/Navbar";
import ScrollCue from "@/components/home/ScrollCue";
import ProductSection from "@/components/home/ProductSection";

import MyBcaSection from "@/components/home/MyBcaSection";
import PromoSection from "@/components/home/PromoSection";
import SoliprioSection from "@/components/home/SoliprioSection";
import NewsSection from "@/components/home/NewsSection";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import HaloBcaChat from "@/components/home/HaloBcaChat";
import ScrollReveal from "@/components/ScrollReveal";
import { getKursHariIni } from "@/lib/kurs";
import { getBanners } from "@/lib/banners";
import { getProductCategories } from "@/lib/products";
import { getPromos } from "@/lib/promos";
import { getNewsCategories } from "@/lib/news";
import type { AppLocale } from "@/i18n/routing";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // One `now` for the whole render so promo badges and their countdown text
  // can't disagree by a few milliseconds.
  const now = new Date();
  const [kurs, banners, produk, promos, news] = await Promise.all([
    getKursHariIni(),
    getBanners(locale as AppLocale),
    getProductCategories(locale as AppLocale),
    getPromos(now),
    getNewsCategories(),
  ]);

  return (
    <main className="flex flex-1 flex-col overflow-x-clip bg-blue-100">
      {/* 1. KONTEN UTAMA: z-10 dan background solid untuk "menutupi" footer saat di atas */}
      <div className="relative z-10 bg-blue-100">
        <Navbar productCategories={produk.categories} />
        {/* .pre-stage — held invisible by the intro preloader, fades up as
            its curtain lifts (see the preloader rules in globals.css). */}
        <div className="pre-stage">
          <HeroArea kurs={kurs} banners={banners} />
        </div>
        {/* spacer for the desktop hero widget that overflows the hero section
            (496 + 288 - 640). Mobile lays the widget out in normal flow. */}
        <div className="h-0 xl:h-[136px]" />
        <ScrollCue />
        <ProductSection categories={produk.categories} defaultKey={produk.defaultKey} />

        <MyBcaSection />
        <PromoSection promos={promos} now={now} />
        <SoliprioSection />
        <NewsSection categories={news} />
      </div>

      {/* 2. FOOTER: desktop pakai sticky reveal (z-0 di layer belakang);
          mobile tampil normal di alur scroll biasa (relative). */}
      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer />
      </div>

      <BackToTop />
      <CookieBanner />
      <HaloBcaChat />
      {/* Orchestrates every [data-reveal] entrance below the hero — one
          observer pair for the whole page, sections stay server components. */}
      <ScrollReveal />
    </main>
  );
}