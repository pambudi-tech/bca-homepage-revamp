"use client";

import { useState } from "react";
import MobileMenu from "./MobileMenu";

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block size-6">
      <span
        className={`absolute left-1/2 top-1/2 h-0.5 w-[18px] -translate-x-1/2 rounded-full bg-white transition-transform duration-300 ${
          open ? "rotate-45" : "-translate-y-[5px]"
        }`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-0.5 w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-0.5 w-[18px] -translate-x-1/2 rounded-full bg-white transition-transform duration-300 ${
          open ? "-rotate-45" : "translate-y-[5px]"
        }`}
      />
    </span>
  );
}

/**
 * Mobile navigation bar: logo + search + burger, shown below the `xl` breakpoint.
 * The dark translucent circles are the "visual treatment" from the mobile design;
 * the row sits over the hero's top overlay gradient at rest and turns solid once
 * the page is scrolled.
 */
export default function MobileNav({
  scrolled,
  hidden,
}: {
  scrolled: boolean;
  hidden: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
    <div
      className={`fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between px-4 transition-[transform,background-color,backdrop-filter] duration-300 will-change-transform xl:hidden ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      } ${scrolled || menuOpen ? "bg-[rgba(18,20,23,0.95)] backdrop-blur-md" : ""}`}
    >
      <img
        src="/assets/cycle1/bca-logo.svg"
        alt="BCA"
        className="h-8 w-[102px] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]"
      />

      <div className="flex items-center gap-3">
        <button
          aria-label="Cari"
          className="flex size-10 items-center justify-center rounded-full bg-[rgba(18,20,23,0.5)] backdrop-blur-[4px] transition-transform active:scale-95"
        >
          <img src="/assets/cycle1/outline-search.svg" alt="" className="size-6" />
        </button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          className="flex size-10 items-center justify-center rounded-full bg-[rgba(18,20,23,0.5)] backdrop-blur-[4px] transition-transform active:scale-95"
        >
          <BurgerIcon open={menuOpen} />
        </button>
      </div>
    </div>

    <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
