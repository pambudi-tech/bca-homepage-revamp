"use client";

import { useState } from "react";
import type { KursEntry } from "@/lib/kurs";
import HeroSection from "./HeroSection";
import HeroWidget from "./HeroWidget";
import MobileHero from "./MobileHero";
import MobileHeroWidget from "./MobileHeroWidget";

/**
 * Wraps the hero slider + hero widget and owns the "search mode" state so the
 * page-dimming overlay can live at the same stacking level as the widget.
 *
 * Two layouts share this file, toggled at the `xl` breakpoint:
 *   - < xl : mobile/tablet — MobileHero + MobileHeroWidget (natural flow, the
 *            widget is pulled up so its glass search panel overlaps the banner).
 *   - ≥ xl : desktop — the original absolutely-positioned 1280px layout.
 */
export default function HeroArea({ kurs }: { kurs: KursEntry[] }) {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <>
      {/* Mobile / tablet */}
      <div className="relative z-10 xl:hidden">
        <MobileHero />
        {/* -mt pulls the widget up so the 140px glass search panel overlaps the
            banner's lower 140px (matching the Figma placement). */}
        <div className="relative z-40 mx-auto -mt-[140px] max-w-[560px] px-2 pb-8">
          <MobileHeroWidget kurs={kurs} />
        </div>
      </div>

      {/* Desktop */}
      <div className="relative z-10 hidden xl:block">
        <HeroSection />

        {/* Focus overlay — same spec as the navbar mega-menu overlay. */}
        <div
          aria-hidden
          className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            searchActive ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <div className="absolute left-1/2 top-[484px] z-40 w-[1280px] -translate-x-1/2">
          <HeroWidget kurs={kurs} onSearchActiveChange={setSearchActive} />
        </div>
      </div>
    </>
  );
}
