import HeroSection from "@/components/home/HeroSection";
import HeroWidget from "@/components/home/HeroWidget";
import { getKursHariIni } from "@/lib/kurs";

export default async function Home() {
  const kurs = await getKursHariIni();

  return (
    <main className="flex flex-1 flex-col bg-[#f4f8fc]">
      <div className="relative">
        <HeroSection />
        <div className="absolute left-1/2 top-[496px] w-[1280px] -translate-x-1/2">
          <HeroWidget kurs={kurs} />
        </div>
      </div>
      <div className="h-1200" />
    </main>
  );
}
