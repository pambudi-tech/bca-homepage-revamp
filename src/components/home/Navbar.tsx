"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { ProductCategory } from "./product-data";
import type { MegaMenuContent } from "@/lib/megamenu";
import type { Promo } from "./promo-data";
import MobileNav from "./MobileNav";
import SearchOverlay from "./SearchOverlay";
import SearchPlaceholderCarousel from "./SearchPlaceholderCarousel";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { SEGMENT_EXTERNAL_LINKS, SEGMENT_INTERNAL_LINKS } from "./segment-links";
import type { SearchSegment } from "./search-data";
import { logoutMember } from "@/app/[locale]/member/login/actions";
import LogoutConfirmDialog from "./LogoutConfirmDialog";

export const NAVBAR_VISIBILITY_EVENT = "bca:navbar-hidden";
export const NAVBAR_ANCHOR_LOCK_EVENT = "bca:navbar-anchor-lock";
export const OPEN_SEARCH_EVENT = "bca:open-search";
const PROMO_NAV_REVEAL_OFFSET = 64;

function SearchButton({ label, placeholders, onClick, expanded }: { label: string; placeholders: string[]; onClick: () => void; expanded: boolean }) {
  return (
    <button
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className="relative flex h-10 w-60 cursor-pointer items-center rounded-full border border-white/15 bg-[rgba(5,13,25,0.2)] px-3 text-left backdrop-blur-[40px] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <img src="/assets/cycle1/outline-search.svg" alt="" className="size-6 shrink-0" />
      <SearchPlaceholderCarousel placeholders={placeholders} visible live={!expanded} lineHeight={40} className="inset-y-0 left-11 right-3 text-sm" />
    </button>
  );
}

export function LocationIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 18.893a5.153 5.153 0 1 1 0-10.307 5.153 5.153 0 0 1 0 10.307Zm0-8.307a3.16 3.16 0 1 0 0 6.32 3.16 3.16 0 0 0 0-6.32Z" fill="currentColor" />
      <path d="M16 30.347a7.93 7.93 0 0 1-5.507-2.227C6.56 24.333 2.213 18.293 3.853 11.107 5.333 4.587 11.027 1.667 16 1.667s10.68 2.92 12.16 9.453c1.627 7.187-2.72 13.213-6.653 17A7.93 7.93 0 0 1 16 30.347Zm0-26.68c-3.88 0-8.867 2.066-10.187 7.88-1.44 6.28 2.507 11.693 6.08 15.12a5.9 5.9 0 0 0 8.214 0c3.56-3.427 7.506-8.84 6.093-15.107C24.867 5.733 19.88 3.667 16 3.667Z" fill="currentColor" />
    </svg>
  );
}

function LoginIcon({ className = "size-6 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M11.867 10.08c.413-4.8 2.88-6.76 8.28-6.76h.173c5.96 0 8.347 2.387 8.347 8.347v8.693c0 5.96-2.387 8.347-8.347 8.347h-.173c-5.36 0-7.827-1.934-8.267-6.654" stroke="currentColor" strokeWidth="2.18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.667 16H19.84m-2.973-4.467L21.333 16l-4.466 4.467" stroke="currentColor" strokeWidth="2.18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar({ productCategories, megamenuContent, promoSearchItems, variant = "default", disableHideShow = false, staticOnMobile = false, keepTransparentOnScroll = false, memberPreviewName }: { productCategories?: ProductCategory[]; megamenuContent?: MegaMenuContent; /** Passed only by the Promo page, so its navbar search never falls back to the site-wide index. */ promoSearchItems?: Promo[]; variant?: "default" | "about" | "promo" | "prioritas" | "solitaire"; disableHideShow?: boolean; staticOnMobile?: boolean; keepTransparentOnScroll?: boolean; memberPreviewName?: string }) {
  const tNav = useTranslations("nav");
  const tAccount = useTranslations("accountMenu");
  const tHero = useTranslations("hero");
  const tLogin = useTranslations("login");
  const segments = Object.keys(tNav.raw("segments")) as string[];
  const tPromo = useTranslations("promoPage");
  const searchPlaceholders = variant === "promo"
    ? tPromo.raw("search.placeholders") as string[]
    : tHero.raw("placeholders") as string[];
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [nearPromoSection, setNearPromoSection] = useState(false);
  const [anchorLocked, setAnchorLocked] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const openSearch = () => setSearchOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, openSearch);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, openSearch);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (variant === "promo") {
        const promoSection = document.getElementById("semua-promo");
        const promoTop = promoSection ? promoSection.getBoundingClientRect().top + y : Number.POSITIVE_INFINITY;
        setNearPromoSection(y + PROMO_NAV_REVEAL_OFFSET >= promoTop);
      }
      if (y < 80) setNavHidden(false);
      else if (y > lastScrollY.current + 4) setNavHidden(true);
      else if (disableHideShow || y < lastScrollY.current - 4) setNavHidden(false);
      lastScrollY.current = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [disableHideShow, variant]);

  useEffect(() => {
    const lockForAnchor = (event: Event) => {
      setAnchorLocked((event as CustomEvent<boolean>).detail);
    };
    const releaseAnchorLock = () => setAnchorLocked(false);
    const releaseOnKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        releaseAnchorLock();
      }
    };

    window.addEventListener(NAVBAR_ANCHOR_LOCK_EVENT, lockForAnchor);
    window.addEventListener("wheel", releaseAnchorLock, { passive: true });
    window.addEventListener("touchstart", releaseAnchorLock, { passive: true });
    window.addEventListener("keydown", releaseOnKey);
    return () => {
      window.removeEventListener(NAVBAR_ANCHOR_LOCK_EVENT, lockForAnchor);
      window.removeEventListener("wheel", releaseAnchorLock);
      window.removeEventListener("touchstart", releaseAnchorLock);
      window.removeEventListener("keydown", releaseOnKey);
    };
  }, []);

  const shouldHide = !disableHideShow && (((navHidden && !(variant === "promo" && nearPromoSection)) || anchorLocked) && !langOpen && !searchOpen);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent<boolean>(NAVBAR_VISIBILITY_EVENT, { detail: shouldHide }));
  }, [shouldHide]);

  const activeSegment = variant === "prioritas" ? "Prioritas" : variant === "solitaire" ? "Solitaire" : variant === "default" ? segments[0] : null;
  const prioritas = variant === "prioritas";
  const solitaire = variant === "solitaire";
  const logoHref = prioritas ? "/prioritas" : solitaire ? "/solitaire" : "/";
  const memberLoginHref = prioritas || solitaire ? `/member/login?from=${variant}` : null;
  const staticPrioritas = prioritas && disableHideShow;
  const navScrolled = scrolled && !keepTransparentOnScroll;
  const onPrioritasHome = pathname === "/prioritas";

  useEffect(() => {
    if (!accountMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  const handleMemberLogout = async () => {
    await logoutMember();
    setLogoutConfirmOpen(false);
    setAccountMenuOpen(false);
    router.replace("/prioritas");
    router.refresh();
  };

  return (
    <>
      <MobileNav scrolled={navScrolled} hidden={staticOnMobile ? false : shouldHide} productCategories={productCategories} megamenuContent={megamenuContent} searchOpen={searchOpen} onOpenSearch={() => setSearchOpen(true)} variant={variant} logoHref={logoHref} disableHideShow={disableHideShow || staticOnMobile} memberPreviewName={memberPreviewName} />

      <nav
        aria-label={tNav("primary")}
        data-hidden={shouldHide}
        className={`pre-nav ${staticPrioritas ? "absolute" : "fixed"} inset-x-0 top-0 z-40 hidden h-[72px] transition-transform duration-300 xl:block ${shouldHide ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className={`flex h-full w-full items-center justify-center px-10 transition-[background-color,box-shadow,backdrop-filter] duration-200 ${navScrolled ? (prioritas ? "bg-pbrown-800 shadow-lg" : solitaire ? "bg-neutral-900 shadow-lg" : "bg-blue-500 shadow-lg") : "bg-transparent"}`}>
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href={logoHref} aria-label="BCA" className="inline-flex"><img src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-9 w-[115px]" /></Link>
            <div className="flex h-10 items-center rounded-full border border-white/15 bg-black/20 p-1 backdrop-blur-[40px]">
              {segments.map((segment) => {
                const active = segment === activeSegment;
                const className = `flex h-8 min-w-24 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${active ? (prioritas ? "bg-pgold-500 text-white" : solitaire ? "bg-neutral-500 text-white" : "bg-neutral-100 text-blue-500") : "text-white/80 hover:bg-white/10 hover:text-white"}`;
                const internalHref = SEGMENT_INTERNAL_LINKS[segment];
                if (internalHref) {
                  return <Link key={segment} href={internalHref} className={className} style={active ? ({ viewTransitionName: "nav-segment-pill" } as CSSProperties) : undefined}>{tNav(`segments.${segment}`)}</Link>;
                }
                return <a key={segment} href={SEGMENT_EXTERNAL_LINKS[segment]} target="_blank" rel="noopener noreferrer" className={className}>{tNav(`segments.${segment}`)}</a>;
              })}
              <Link href="/tentang-bca" className={`flex h-8 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${variant === "about" ? "bg-neutral-100 text-blue-500" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>{tNav("tentangBca")}</Link>
              <a href="https://karir.bca.co.id/" target="_blank" rel="noopener noreferrer" className="flex h-8 items-center rounded-full px-4 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">{tNav("karir")}</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SearchButton label={tNav("search")} placeholders={searchPlaceholders} expanded={searchOpen} onClick={() => setSearchOpen(true)} />
            <LocaleSwitcher label={tLogin("languageSwitcher")} onOpenChange={setLangOpen} />
            {memberPreviewName ? (
              <div ref={accountMenuRef} className="relative">
                <button type="button" aria-haspopup="menu" aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((open) => !open)} className="flex h-10 items-center gap-3 rounded-xl px-2 text-sm font-bold leading-5 text-white">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundImage: "linear-gradient(262.59deg, #c2a266 0.18%, #98732c 100.18%)" }}>
                    <img src="/assets/prioritas/member-overview/account-user.svg" alt="" className="shrink-0" />
                  </span>
                  <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{memberPreviewName}</span>
                </button>
                {accountMenuOpen ? (
                  <div role="menu" className="absolute right-0 top-full z-50 mt-1 flex min-w-[144px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-card">
                    <Link role="menuitem" href={onPrioritasHome ? "/prioritas/member/overview" : "/prioritas"} onClick={() => setAccountMenuOpen(false)} className="flex h-10 items-center gap-2 px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-100">
                      <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-4 shrink-0"><path d="M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h5v5h-5z" stroke="currentColor" strokeWidth="1.5" /></svg>
                      {onPrioritasHome ? tAccount("overview") : tAccount("home")}
                    </Link>
                    <button role="menuitem" type="button" onClick={() => { setAccountMenuOpen(false); setLogoutConfirmOpen(true); }} className="flex h-10 items-center gap-2 px-4 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                      <LoginIcon className="size-4 rotate-180 text-red-600" />
                      {tAccount("logout")}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : memberLoginHref ? (
              <Link href={memberLoginHref} className={`group flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 text-sm font-semibold text-white backdrop-blur-[40px] transition-colors duration-300 hover:bg-white ${prioritas ? "hover:border-pbrown-500 hover:text-pbrown-500" : "hover:border-blue-500 hover:text-blue-500"}`}><LoginIcon className={`size-6 text-white/80 transition-colors ${prioritas ? "group-hover:text-pbrown-500" : "group-hover:text-blue-500"}`} />{tNav("login")}</Link>
            ) : (
              <a href="https://mybca.bca.co.id/auth/login" target="_blank" rel="noopener noreferrer" className="group flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 text-sm font-semibold text-white backdrop-blur-[40px] transition-colors duration-300 hover:border-blue-500 hover:bg-white hover:text-blue-500"><LoginIcon className="size-6 text-white/80 transition-colors group-hover:text-blue-500" />{tNav("login")}</a>
            )}
          </div>
        </div>
        </div>
      </nav>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        promoSearchItems={promoSearchItems}
        initialSegment={variant === "prioritas" ? ("Prioritas" satisfies SearchSegment) : variant === "solitaire" ? ("Solitaire" satisfies SearchSegment) : "Semua"}
      />
      <LogoutConfirmDialog open={logoutConfirmOpen} onCancel={() => setLogoutConfirmOpen(false)} onConfirm={() => void handleMemberLogout()} />
    </>
  );
}
