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
        desktopStack={
          <>
            <HeroCompactWidget kurs={kurs} />
            <ScrollCue />
          </>
        }
      />
    </div>
  );
}
