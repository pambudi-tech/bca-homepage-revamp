"use client";

import { useState } from "react";
import type { KursEntry } from "@/lib/kurs";
import type { Slide } from "./hero-slides";
import HeroSection from "./HeroSection";
import HeroWidget from "./HeroWidget";
import MobileHeroWidget from "./MobileHeroWidget";

/**
 * Wraps the hero slider + hero widget and owns the "search mode" state so the
 * page-dimming overlay can live at the same stacking level as the widget.
 *
 * `HeroSection` is a single responsive component (banner + carousel). The hero
 * widget still has two forms, toggled at the `xl` breakpoint:
 *   - < xl : MobileHeroWidget laid out in normal flow, pulled up so its glass
 *            search panel overlaps the banner.
 *   - ≥ xl : the original absolutely-positioned 1280px HeroWidget.
 */
export default function HeroArea({ kurs, banners }: { kurs: KursEntry[]; banners: Slide[] }) {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className="relative z-10">
      <HeroSection slides={banners} />

      {/* Search-focus page dimming — shared by both widget forms; each sits at
          z-40 so it stays above the wash. */}
      <div
        aria-hidden
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          searchActive ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile / tablet widget — normal flow, pulled up 140px so the glass
          search panel overlaps the banner's lower 140px. */}
      <div className="relative z-40 mx-auto -mt-[140px] max-w-[560px] px-2 xl:hidden">
        <MobileHeroWidget kurs={kurs} onSearchActiveChange={setSearchActive} />
      </div>

      {/* Desktop widget. */}
      <div className="hidden xl:block">
        <div className="absolute left-1/2 top-[484px] z-40 w-[1280px] -translate-x-1/2">
          <HeroWidget kurs={kurs} onSearchActiveChange={setSearchActive} />
        </div>
      </div>
    </div>
  );
}
