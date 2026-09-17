"use client";

import { useTranslations } from "next-intl";
import { OPEN_SEARCH_EVENT } from "./Navbar";
import SearchPlaceholderCarousel from "./SearchPlaceholderCarousel";

export default function MobileHeroSearch() {
  const tNav = useTranslations("nav");
  const tHero = useTranslations("hero");
  const placeholders = tHero.raw("placeholders") as string[];

  return (
    <button
      type="button"
      aria-label={tNav("search")}
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      className="relative flex h-10 w-full items-center rounded-full border border-white/15 bg-black/20 px-3 text-left text-white backdrop-blur-[40px] transition-colors active:bg-white/10 xl:hidden"
    >
      <img src="/assets/cycle1/outline-search.svg" alt="" className="size-6 shrink-0" />
      <SearchPlaceholderCarousel
        placeholders={placeholders}
        visible
        live
        lineHeight={40}
        className="inset-y-0 left-11 right-3 text-sm"
      />
    </button>
  );
}
