"use client";

import { useState } from "react";
import type { KursEntry } from "@/lib/kurs";
import HeroSection from "./HeroSection";
import HeroWidget from "./HeroWidget";

/**
 * Wraps the hero slider + hero widget and owns the "search mode" state so the
 * page-dimming overlay can live at the same stacking level as the widget.
 *
 * Stacking inside this `z-10` context:
 *   HeroSection ...... z-auto  (dimmed by the overlay)
 *   overlay .......... z-30    (covers the whole page below the navbar)
 *   HeroWidget ....... z-40    (sits above the overlay — the only crisp element)
 */
export default function HeroArea({ kurs }: { kurs: KursEntry[] }) {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className="relative z-10">
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
  );
}
