import type { KursEntry } from "@/lib/kurs";
import type { Slide } from "./hero-slides";
import HeroSection from "./HeroSection";
import HeroCompactWidget from "./HeroCompactWidget";
import MobileHeroSearch from "./MobileHeroSearch";
import ScrollCue from "./ScrollCue";

/** Composes the database-backed banner, compact login/rate cards, and section navigation. */
export default function HeroArea({ kurs, banners }: { kurs: KursEntry[]; banners: Slide[] }) {
  return (
    <div className="relative z-10">
      <HeroSection
        slides={banners}
        mobileStack={
          <>
            <MobileHeroSearch />
            <HeroCompactWidget kurs={kurs} />
            <ScrollCue />
          </>
        }
      />
      <div className="absolute inset-x-0 bottom-[116px] z-20 hidden overflow-visible xl:left-1/2 xl:right-auto xl:block xl:w-[1280px] xl:-translate-x-1/2">
        <HeroCompactWidget kurs={kurs} />
      </div>
      <div className="absolute inset-x-0 bottom-8 z-20 hidden xl:block">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <ScrollCue />
        </div>
      </div>
    </div>
  );
}
