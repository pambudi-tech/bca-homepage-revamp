import type { KursEntry } from "@/lib/kurs";
import type { Slide } from "./hero-slides";
import HeroSection from "./HeroSection";
import HeroCompactWidget from "./HeroCompactWidget";

/** Composes the database-backed banner, compact login/rate cards, and section navigation. */
export default function HeroArea({ kurs, banners }: { kurs: KursEntry[]; banners: Slide[] }) {
  return (
    <div className="relative z-10">
      <HeroSection slides={banners} />
      <div className="absolute inset-x-0 top-[400px] z-20 overflow-hidden xl:left-1/2 xl:right-auto xl:w-[1280px] xl:-translate-x-1/2 xl:overflow-visible">
        <HeroCompactWidget kurs={kurs} />
      </div>
    </div>
  );
}
