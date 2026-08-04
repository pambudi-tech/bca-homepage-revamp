"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import MobileMenu from "./MobileMenu";
import { LocationIcon } from "./Navbar";
import type { ProductCategory } from "./product-data";
import type { MegaMenuContent } from "@/lib/megamenu";

// Broadcast so unrelated fixed-position UI (HaloBcaChat's floating button)
// can hide itself while the mobile menu overlay covers the viewport, without
// wiring a shared store just for this one flag.
export const MOBILE_MENU_EVENT = "bca:mobile-menu-open";

/**
 * Mobile navigation bar: logo + search + burger, shown below the `xl` breakpoint.
 * The dark translucent circles are the "visual treatment" from the mobile design;
 * the row sits over the hero's top overlay gradient at rest and turns solid once
 * the page is scrolled.
 */
export default function MobileNav({
  scrolled,
  hidden,
  productCategories,
  megamenuContent,
  searchOpen,
  onOpenSearch,
}: {
  scrolled: boolean;
  hidden: boolean;
  productCategories?: ProductCategory[];
  megamenuContent?: MegaMenuContent;
  /** Whether Navbar's single shared SearchOverlay is currently up — this bar
   *  only needs to reflect that in `aria-expanded`, not own the overlay
   *  itself. See Navbar for why there is exactly one overlay instance. */
  searchOpen: boolean;
  onOpenSearch: () => void;
}) {
  const t = useTranslations("mobileMenu");
  const tNav = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToLocation = () => {
    window.open("https://www.bca.co.id/id/lokasi-bca", "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent<boolean>(MOBILE_MENU_EVENT, { detail: menuOpen }));
  }, [menuOpen]);

  return (
    <>
    <nav
      aria-label={tNav("primary")}
      className={`pre-nav fixed left-0 right-0 top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] items-center justify-between px-4 pt-[env(safe-area-inset-top)] transition-[transform,translate,background-color] duration-300 xl:hidden ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      } ${scrolled || menuOpen ? "bg-[rgba(18,20,23,0.95)]" : ""}`}
    >
      <img
        src="/assets/cycle1/bca-logo.svg"
        alt="BCA"
        className="h-8 w-[102px] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          aria-label={tNav("search")}
          aria-expanded={searchOpen}
          className="flex size-10 items-center justify-center rounded-full bg-[rgba(18,20,23,0.5)] backdrop-blur-[4px] transition-transform active:scale-95"
        >
          <img src="/assets/cycle1/outline-search.svg" alt="" className="size-6" />
        </button>
        <button
          onClick={scrollToLocation}
          aria-label={tNav("lokasiBca")}
          className="flex size-10 items-center justify-center rounded-full bg-[rgba(18,20,23,0.5)] backdrop-blur-[4px] transition-transform active:scale-95"
        >
          <LocationIcon className="size-6 text-neutral-100" />
        </button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? t("tutupMenu") : t("bukaMenu")}
          aria-expanded={menuOpen}
          className="flex size-10 items-center justify-center rounded-full bg-[rgba(18,20,23,0.5)] backdrop-blur-[4px] transition-transform active:scale-95"
        >
          <img src="/assets/cycle1/outline-menu.svg" alt="" className="size-6" />
        </button>
      </div>
    </nav>

    <MobileMenu
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      productCategories={productCategories}
      megamenuContent={megamenuContent}
    />
    </>
  );
}
