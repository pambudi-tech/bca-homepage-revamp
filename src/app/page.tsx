import HeroSection from "@/components/home/HeroSection";
import HeroWidget from "@/components/home/HeroWidget";
import Navbar from "@/components/home/Navbar";
import ScrollCue from "@/components/home/ScrollCue";
import ProductSection from "@/components/home/ProductSection";
import MyBcaSection from "@/components/home/MyBcaSection";
import PromoSection from "@/components/home/PromoSection";
import NewsSection from "@/components/home/NewsSection";
import Footer from "@/components/home/Footer";
import { getKursHariIni } from "@/lib/kurs";

export default async function Home() {
  const kurs = await getKursHariIni();

  return (
    <main className="flex flex-1 flex-col overflow-x-clip bg-[#f4f8fc]">
      {/* 1. KONTEN UTAMA: z-10 dan background solid untuk "menutupi" footer saat di atas */}
      <div className="relative z-10 bg-[#f4f8fc]">
        <Navbar />
        <div className="relative z-10">
          <HeroSection />
          <div className="absolute left-1/2 top-[484px] w-[1280px] -translate-x-1/2">
            <HeroWidget kurs={kurs} />
          </div>
        </div>
        {/* spacer for the hero widget that overflows the hero section (496 + 288 - 640) */}
        <div className="h-[136px]" />
        <ScrollCue />
        <ProductSection />
        <MyBcaSection />
        <PromoSection />
        <NewsSection />
      </div>

      {/* 2. FOOTER: sticky bottom-0 dan z-0 (di layer belakang) */}
      <div className="sticky bottom-0 z-0 w-full">
        <Footer />
      </div>
    </main>
  );
}