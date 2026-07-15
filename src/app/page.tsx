import HeroArea from "@/components/home/HeroArea";
import Navbar from "@/components/home/Navbar";
import ScrollCue from "@/components/home/ScrollCue";
import ProductSection from "@/components/home/ProductSection";
import MyBcaSection from "@/components/home/MyBcaSection";
import PromoSection from "@/components/home/PromoSection";
import NewsSection from "@/components/home/NewsSection";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import { getKursHariIni } from "@/lib/kurs";
import { getBanners } from "@/lib/banners";

export default async function Home() {
  const [kurs, banners] = await Promise.all([getKursHariIni(), getBanners()]);

  return (
    <main className="flex flex-1 flex-col overflow-x-clip bg-[#f4f8fc]">
      {/* 1. KONTEN UTAMA: z-10 dan background solid untuk "menutupi" footer saat di atas */}
      <div className="relative z-10 bg-[#f4f8fc]">
        <Navbar />
        <HeroArea kurs={kurs} banners={banners} />
        {/* spacer for the desktop hero widget that overflows the hero section
            (496 + 288 - 640). Mobile lays the widget out in normal flow. */}
        <div className="h-0 xl:h-[136px]" />
        <ScrollCue />
        <ProductSection />
        <MyBcaSection />
        <PromoSection />
        <NewsSection />
      </div>

      {/* 2. FOOTER: desktop pakai sticky reveal (z-0 di layer belakang);
          mobile tampil normal di alur scroll biasa (relative). */}
      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer />
      </div>

      <BackToTop />
    </main>
  );
}