"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import MobileMenu from "./MobileMenu";
import SearchPlaceholderCarousel from "./SearchPlaceholderCarousel";
import type { ProductCategory } from "./product-data";
import type { MegaMenuContent } from "@/lib/megamenu";
import { Link } from "@/i18n/navigation";

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
  variant = "default",
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
  variant?: "default" | "about" | "promo";
}) {
  const t = useTranslations("mobileMenu");
  const tNav = useTranslations("nav");
  const tPromo = useTranslations("promoPage");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent<boolean>(MOBILE_MENU_EVENT, { detail: menuOpen }));
  }, [menuOpen]);

  return (
    <>
    <nav
      aria-label={tNav("primary")}
      className={`pre-nav fixed left-0 right-0 top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] items-center px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] transition-[transform,translate,background-color] duration-300 xl:hidden ${variant === "promo" ? "gap-3" : "justify-between"} ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      } ${menuOpen ? "bg-[rgba(18,20,23,0.95)]" : scrolled ? "bg-blue-500" : "bg-transparent"}`}
    >
      <Link href="/" aria-label="BCA" className="inline-flex">
        <img
          src="/assets/cycle1/bca-logo.svg"
          alt="BCA"
          className="h-8 w-[102px] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]"
        />
      </Link>

      <div className={`flex items-center gap-2 ${variant === "promo" ? "min-w-0 flex-1" : ""}`}>
        <button
          onClick={onOpenSearch}
          aria-label={tNav("search")}
          aria-expanded={searchOpen}
          className={`relative flex items-center justify-center rounded-full bg-[rgba(18,20,23,0.5)] transition-transform active:scale-95 ${variant === "promo" ? "h-10 min-w-0 flex-1 justify-start px-3" : "size-10"}`}
        >
          <img src="/assets/cycle1/outline-search.svg" alt="" className="size-6" />
          {variant === "promo" ? (
            <SearchPlaceholderCarousel
              placeholders={tPromo.raw("search.placeholders") as string[]}
              visible={!searchOpen}
              live={!searchOpen}
              lineHeight={40}
              className="inset-y-0 left-11 right-3 text-sm"
            />
          ) : null}
        </button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? t("tutupMenu") : t("bukaMenu")}
          aria-expanded={menuOpen}
          className={`flex items-center gap-2 rounded-full bg-[rgba(18,20,23,0.5)] transition-transform active:scale-95 ${variant === "promo" ? "size-10 justify-center" : "h-10 py-1 pl-1 pr-3"}`}
        >
          {variant !== "promo" ? <span className="flex h-8 w-24 items-center justify-center rounded-full bg-neutral-100 px-5 text-sm font-semibold text-blue-500">{tNav("segments.Individu")}</span> : null}
          <img src="/assets/cycle1/outline-menu.svg" alt="" className="size-6" />
        </button>
      </div>
    </nav>

    <MobileMenu
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      productCategories={productCategories}
      megamenuContent={megamenuContent}
      variant={variant}
    />
    </>
  );
}
