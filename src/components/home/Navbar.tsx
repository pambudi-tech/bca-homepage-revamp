"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMegaMenu } from "./use-megamenu";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import MegaMenuPanel, { type MegaMenuMode } from "./MegaMenuPanel";
import MobileNav from "./MobileNav";
import { onPreloaderDone } from "@/components/Preloader";
import { HALO_BCA_OPEN_EVENT, HelpIcon } from "./HaloBcaChat";
import type { ProductCategory } from "./product-data";

/* How long the panel stays mounted after the pointer leaves, and how long the
   outgoing panel lingers when switching tabs. Both mirror globals.css. */
const MEGAMENU_CLOSE_MS = 440;
const MEGAMENU_SWITCH_MS = 160;

const LOCALE_META: Record<AppLocale, { flag: string }> = {
  id: { flag: "/assets/cycle1/flag-id.svg" },
  en: { flag: "/assets/navbar/flag-en.png" },
  zh: { flag: "/assets/navbar/flag-zh.png" },
};

function LinkLabel({ label, hover }: { label: string; hover: boolean }) {
  return (
    <span className="flex items-center justify-center px-1">
      <span className="relative inline-flex">
        <span aria-hidden className="invisible whitespace-nowrap text-sm font-bold">
          {label}
        </span>
        <span
          className={`absolute inset-0 whitespace-nowrap text-sm font-semibold text-white transition-opacity duration-300 ${hover ? "opacity-0" : "opacity-80"
            }`}
        >
          {label}
        </span>
        <span
          className={`absolute inset-0 whitespace-nowrap text-sm font-bold text-white transition-opacity duration-300 ${hover ? "opacity-100" : "opacity-0"
            }`}
        >
          {label}
        </span>
      </span>
    </span>
  );
}

function NavbarLink({
  label,
  href,
  internalHref,
  onClick,
  active,
  viewTransitionName,
}: {
  label: string;
  href?: string;
  /** Same-app route (via the i18n-aware `Link`) — normal navigation, no
      new tab, unlike `href` which is always an external target. */
  internalHref?: string;
  onClick?: () => void;
  /** Filled blue — this link's destination is the page currently on screen. */
  active?: boolean;
  /** Same name on every page this link appears on, so the browser morphs
      its fill/position across a navigation instead of hard-swapping it —
      see the "seamless nav" pieces in globals.css. */
  viewTransitionName?: string;
}) {
  const [hover, setHover] = useState(false);
  const sharedProps = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    // Pairs the blue fill with a signal assistive tech can read — the fill
    // alone only tells a sighted user which page they are on.
    "aria-current": active ? ("page" as const) : undefined,
    style: viewTransitionName ? ({ viewTransitionName } as CSSProperties) : undefined,
    className: `flex h-10 items-center justify-center gap-0.5 rounded-full border px-4 transition-colors duration-300 ${active
        ? `border-blue-500 ${hover ? "bg-[#0068c0]" : "bg-blue-500"}`
        : hover
          ? "border-white/20 bg-[rgba(18,20,23,0.5)]"
          : "border-white/25 bg-[rgba(5,13,25,0.1)]"
      }`,
  };
  const content = (
    <>
      <LinkLabel label={label} hover={hover} />
      <span
        className={`grid overflow-hidden transition-[grid-template-columns] duration-300 ${hover ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
          }`}
      >
        <span className="overflow-hidden">
          <img src="/assets/navbar/arrow-right.svg" alt="" className="size-5" />
        </span>
      </span>
    </>
  );
  if (internalHref) {
    return (
      <Link href={internalHref} {...sharedProps}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...sharedProps}>
        {content}
      </a>
    );
  }
  return (
    <button onClick={onClick} {...sharedProps}>
      {content}
    </button>
  );
}

/** Same up/down expand mark as MobileMenu.tsx's segment picker pill. */
function ExpandIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden>
      <path d="m8 9 4-4 4 4" />
      <path d="m8 15 4 4 4-4" />
    </svg>
  );
}

function SearchButton({ label }: { label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`flex h-10 items-center justify-start gap-0.5 rounded-full border transition-all duration-300 ${hover
          ? "w-auto border-white/20 bg-[rgba(18,20,23,0.5)] px-4"
          : "w-10 border-white/25 bg-[rgba(5,13,25,0.1)] px-2"
        }`}
    >
      <img src="/assets/cycle1/outline-search.svg" alt="" className="size-6 shrink-0" />
      <span
        className={`grid overflow-hidden transition-[grid-template-columns] duration-300 ${hover ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
          }`}
      >
        <span className="overflow-hidden">
          <LinkLabel label={label} hover={hover} />
        </span>
      </span>
    </button>
  );
}

/** Pin glyph shared by the desktop `IconLinkButton` and the mobile navbar's
 *  icon-only equivalent — both scroll to the same `#lokasi` section. */
export function LocationIcon({ className = "size-6 shrink-0 text-neutral-100 opacity-80" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M15.9999 18.8927C13.1598 18.8927 10.8398 16.586 10.8398 13.7327C10.8398 10.8793 13.1598 8.58594 15.9999 8.58594C18.8399 8.58594 21.1599 10.8926 21.1599 13.746C21.1599 16.5993 18.8399 18.8927 15.9999 18.8927ZM15.9999 10.5859C14.2665 10.5859 12.8398 11.9993 12.8398 13.746C12.8398 15.4927 14.2532 16.906 15.9999 16.906C17.7465 16.906 19.1599 15.4927 19.1599 13.746C19.1599 11.9993 17.7332 10.5859 15.9999 10.5859Z"
        fill="currentColor"
      />
      <path
        d="M15.9997 30.3467C14.0264 30.3467 12.0397 29.6001 10.4931 28.1201C6.55975 24.3334 2.21308 18.2934 3.85308 11.1067C5.33308 4.58675 11.0264 1.66675 15.9997 1.66675C15.9997 1.66675 15.9997 1.66675 16.013 1.66675C20.9864 1.66675 26.6797 4.58675 28.1597 11.1201C29.7864 18.3067 25.4397 24.3334 21.5064 28.1201C19.9597 29.6001 17.973 30.3467 15.9997 30.3467ZM15.9997 3.66675C12.1197 3.66675 7.13308 5.73341 5.81308 11.5467C4.37308 17.8267 8.31975 23.2401 11.8931 26.6667C14.1997 28.8934 17.813 28.8934 20.1197 26.6667C23.6797 23.2401 27.6264 17.8267 26.213 11.5467C24.8797 5.73341 19.8797 3.66675 15.9997 3.66675Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLinkButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`flex h-10 items-center rounded-full border transition-all duration-300 ${hover
          ? "w-auto justify-start gap-0.5 border-white/20 bg-[rgba(18,20,23,0.5)] px-4"
          : "w-10 justify-center border-white/25 bg-[rgba(5,13,25,0.1)] px-2"
        }`}
    >
      {icon}
      <span
        className={`grid overflow-hidden transition-[grid-template-columns] duration-300 ${hover ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
          }`}
      >
        <span className="overflow-hidden">
          <LinkLabel label={label} hover={hover} />
        </span>
      </span>
    </button>
  );
}

export default function Navbar({
  productCategories,
  variant = "default",
}: {
  /** Live product lists from Supabase (see `getProductCategories`), keyed the
      same as `MEGAMENU_STRUCTURE` — merged in so the mega menu shows every
      product per category instead of a hardcoded handful. */
  productCategories?: ProductCategory[];
  /** "about" is the segment-agnostic Tentang BCA shell: the segment pill
      goes inert (no dropdown) and the tab row shows the About-section
      links instead of the product mega menu. Panels never mount for those
      tabs since their keys don't exist in `MEGAMENU` — nothing to wire up. */
  variant?: "default" | "about";
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tLang = useTranslations("languages");
  const SEGMENTS = Object.keys(tNav.raw("segments")) as string[];
  const MEGAMENU = useMegaMenu(productCategories);
  const ABOUT_TABS = (Object.keys(tNav.raw("aboutTabs")) as string[]).map((key) => ({
    key,
    label: tNav(`aboutTabs.${key}`),
    width: undefined as number | undefined,
    chevron: false,
  }));
  const NAV_TABS =
    variant === "about"
      ? ABOUT_TABS
      : MEGAMENU.map((menu) => ({
          key: menu.key,
          label: menu.label,
          width: menu.width,
          chevron: menu.chevron ?? true,
        }));
  const otherLocales = routing.locales.filter((l) => l !== locale);

  const switchLocale = (nextLocale: AppLocale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  // The pill reflects whichever page you're actually on, not a persisted
  // preference: the default shell IS the Individu homepage, so it reads
  // "Individu" from the start; the About shell has no inherent segment, so
  // it starts on the "Pilih Segmen" placeholder until you pick one.
  const [activeSegment, setActiveSegment] = useState<string | null>(
    variant === "about" ? null : (SEGMENTS[0] ?? null)
  );
  const chooseSegment = (segment: string) => {
    setActiveSegment(segment);
  };
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  /* What's actually on screen. It lags behind `openMenu` so the panel can play
     its close animation before unmounting, and so the tab we moved away from
     can fade out behind the incoming one. */
  const [panel, setPanel] = useState<{ key: string; mode: MegaMenuMode; seq: number } | null>(null);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const panelKey = useRef<string | null>(null);
  const seq = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [langHover, setLangHover] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [segmentHover, setSegmentHover] = useState(false);
  const segmentRef = useRef<HTMLDivElement>(null);
  const segmentCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);

  const scrollToLocation = () => {
    window.open("https://www.bca.co.id/id/lokasi-bca", "_blank", "noopener,noreferrer");
  };

  const scrollToPromo = () => {
    document.getElementById("promo")?.scrollIntoView({ behavior: "smooth" });
  };

  const openHaloBca = () => {
    window.dispatchEvent(new CustomEvent(HALO_BCA_OPEN_EVENT));
  };

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y < 80) {
        setNavHidden(false);
      } else if (y > lastScrollY.current + 4) {
        setNavHidden(true);
      } else if (y < lastScrollY.current - 4) {
        setNavHidden(false);
      }
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
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (segmentRef.current && !segmentRef.current.contains(e.target as Node)) {
        setSegmentOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // The dropdown's other-locale flags only mount into the DOM once it's
  // opened (see `{langOpen && ...}` below), so the preloader never sees
  // them and they'd otherwise fetch — and visibly flash in — right as the
  // visitor opens the switcher. Warm the browser's cache for them here
  // instead: a background Image() request that's never attached to the
  // page, kicked off once the preloader's critical-path wait is over so it
  // never competes with first paint, and only for the flags that aren't
  // already loaded (the active locale's is already in the trigger button).
  useEffect(() => {
    const fetchOtherFlags = () => {
      for (const code of routing.locales) {
        if (code === locale) continue;
        new Image().src = LOCALE_META[code as AppLocale].flag;
      }
    };
    let idleHandle: number | ReturnType<typeof setTimeout> | undefined;
    const warm = () => {
      idleHandle =
        "requestIdleCallback" in window
          ? requestIdleCallback(fetchOtherFlags)
          : setTimeout(fetchOtherFlags, 200);
    };
    const cancelWarm = () => {
      if (idleHandle === undefined) return;
      if ("cancelIdleCallback" in window && typeof idleHandle === "number") {
        cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle as ReturnType<typeof setTimeout>);
      }
    };

    // Waits for the preloader so this never competes with the critical-path
    // load — or warms immediately if it already finished or never ran.
    const stop = onPreloaderDone(warm);
    return () => {
      stop();
      cancelWarm();
    };
  }, [locale]);

  /* Drive the panel's motion mode off `openMenu`. Opening from nothing unfurls;
     moving between tabs while open only crossfades; leaving plays the close and
     unmounts once it finishes. Keep these in sync with globals.css. */
  useEffect(() => {
    if (openMenu) {
      const prev = panelKey.current;
      panelKey.current = openMenu;
      seq.current += 1;
      if (prev && prev !== openMenu) {
        setOutgoing(prev);
        setPanel({ key: openMenu, mode: "switch", seq: seq.current });
      } else {
        setPanel({ key: openMenu, mode: "open", seq: seq.current });
      }
      return;
    }
    if (!panelKey.current) return;
    panelKey.current = null;
    setOutgoing(null);
    // Same seq, so the panel keeps its DOM node and animates out in place.
    setPanel((p) => (p ? { ...p, mode: "close" } : p));
    const t = setTimeout(() => setPanel(null), MEGAMENU_CLOSE_MS);
    return () => clearTimeout(t);
  }, [openMenu]);

  useEffect(() => {
    if (!outgoing) return;
    const t = setTimeout(() => setOutgoing(null), MEGAMENU_SWITCH_MS);
    return () => clearTimeout(t);
  }, [outgoing]);

  const menuOpen = openMenu !== null;
  // The transparent/white-text idle state is designed to sit over the
  // home hero photo — pages without one (like the About shell) need the
  // solid bar from the very first frame instead of waiting on scroll.
  const solid = variant === "about" || scrolled || menuOpen;
  const panelCategory = panel ? MEGAMENU.find((c) => c.key === panel.key) : undefined;
  const outgoingCategory = outgoing ? MEGAMENU.find((c) => c.key === outgoing) : undefined;
  const shouldHide = navHidden && !menuOpen && !langOpen;

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const closeNow = () => {
    cancelClose();
    setOpenMenu(null);
  };

  // Same debounced pattern as the mega menu tabs — hover opens the segment
  // dropdown immediately, and closing waits a beat so crossing the gap
  // between the pill and the panel doesn't flicker it shut.
  const scheduleSegmentClose = () => {
    if (segmentCloseTimer.current) clearTimeout(segmentCloseTimer.current);
    segmentCloseTimer.current = setTimeout(() => setSegmentOpen(false), 120);
  };
  const cancelSegmentClose = () => {
    if (segmentCloseTimer.current) clearTimeout(segmentCloseTimer.current);
  };

  return (
    <>
      {/* Mobile navigation (logo + search + burger) — below the xl breakpoint. */}
      <MobileNav scrolled={scrolled} hidden={navHidden} />

      {/* Desktop navigation — hidden on mobile/tablet. `xl:contents` keeps the
          two fixed children positioning against the viewport. */}
      <div className="hidden xl:contents">
        {/* Focus overlay — dims the page behind the mega menu so the panel stands out. */}
        <div
          aria-hidden
          data-shown={menuOpen}
          className="fade-overlay fixed inset-0 z-20 bg-black/50 backdrop-blur-[2px]"
        />
        <nav
          aria-label={tNav("primary")}
          className={`pre-nav fixed left-0 right-0 top-0 z-30 flex flex-col items-start transition-transform duration-300 ${shouldHide ? "-translate-y-full" : "translate-y-0"
            }`}
          onMouseLeave={scheduleClose}
        >
          <div
            className={`relative flex w-full flex-col items-start transition-shadow duration-200 ${solid ? "shadow-lg" : ""
              }`}
          >
            <div
              style={{ viewTransitionName: "nav-top-row" } as CSSProperties}
              className={`relative z-10 flex w-full items-center justify-center px-10 py-4 transition-colors duration-200 ${solid ? "bg-[rgba(18,20,23,0.95)]" : ""
                }`}
              onMouseEnter={closeNow}
            >
              <div className="flex w-full max-w-[1280px] items-center justify-between">
                <div className="flex items-center gap-5">
                  <img src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-9 w-[114.75px]" />
                  <div className="flex items-center gap-2">
                    <div
                      ref={segmentRef}
                      className="relative"
                      onMouseEnter={() => {
                        cancelSegmentClose();
                        setSegmentOpen(true);
                      }}
                      onMouseLeave={scheduleSegmentClose}
                    >
                      {/* Hover-only trigger — opening this is not a click
                          action, only picking an option in the dropdown is. */}
                      <div
                        onMouseEnter={() => setSegmentHover(true)}
                        onMouseLeave={() => setSegmentHover(false)}
                        style={{ viewTransitionName: "nav-segment-pill" } as CSSProperties}
                        className={`flex h-10 items-center gap-2 rounded-full border pl-4 pr-1 transition-colors ${segmentHover || segmentOpen
                            ? "border-neutral-300 bg-white"
                            : "border-white/25 bg-[rgba(5,13,25,0.1)]"
                          }`}
                      >
                        <span
                          className={`whitespace-nowrap text-sm font-semibold ${segmentHover || segmentOpen ? "text-neutral-900" : "text-white"
                            }`}
                        >
                          {/* On the segment-agnostic About shell, "Anda berada
                              di" reads ambiguous — this pill is actually a
                              way back to the segment's homepage from here. */}
                          {tNav(variant === "about" ? "kembaliKe" : "andaBerada")}
                        </span>
                        <span
                          className={`flex h-8 items-center gap-1 whitespace-nowrap rounded-full pl-3 pr-2 text-sm font-semibold ${activeSegment
                              ? "bg-blue-500 text-white"
                              : `border ${segmentHover || segmentOpen ? "border-neutral-300 text-neutral-900" : "border-white/25 text-white"}`
                            }`}
                        >
                          {activeSegment ? tNav(`segments.${activeSegment}`) : tNav("pilihSegmen")}
                          <ExpandIcon className="size-4" />
                        </span>
                      </div>

                      {segmentOpen && (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.10),0px_20px_32px_0px_rgba(0,0,0,0.12)]">
                          {SEGMENTS.filter((segment) => segment !== activeSegment).map((segment) => (
                            <button
                              key={segment}
                              onClick={() => {
                                chooseSegment(segment);
                                setSegmentOpen(false);
                                // Choosing a segment here has nowhere to land
                                // on this page — it always means "take me
                                // back to that segment's homepage".
                                if (variant === "about") router.push("/");
                              }}
                              className="group flex w-[148px] items-center gap-2 p-4 text-left text-neutral-900 transition-colors hover:bg-cyan-100 hover:text-blue-500"
                            >
                              <span className="flex-1 text-base font-semibold">
                                {tNav(`segments.${segment}`)}
                              </span>
                              <svg viewBox="0 0 20 20" fill="none" className="size-5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden>
                                <path
                                  d="M9.29272 3.45947C9.68319 3.069 10.3162 3.06911 10.7068 3.45947L16.5408 9.29248C16.9312 9.6829 16.931 10.316 16.5408 10.7065L10.7068 16.5405C10.3162 16.9307 9.68314 16.9309 9.29272 16.5405C8.90231 16.1501 8.90253 15.517 9.29272 15.1265L13.4197 10.9995H4.16675C3.61446 10.9995 3.16675 10.5518 3.16675 9.99951C3.16692 9.44738 3.61457 8.99951 4.16675 8.99951H13.4197L9.29272 4.87354C8.90242 4.48305 8.90242 3.84996 9.29272 3.45947Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <NavbarLink
                      label={tNav("tentangBca")}
                      internalHref="/tentang-bca"
                      active={variant === "about"}
                      viewTransitionName="nav-tentang-bca"
                    />
                    <NavbarLink label={tNav("karir")} href="https://karir.bca.co.id/" />
                    <NavbarLink label={tNav("pengajuan")} href="https://www.bca.co.id/id/Forms/webform-bca" />
                    <NavbarLink label={tNav("promo")} onClick={scrollToPromo} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <SearchButton label={tNav("search")} />
                  <IconLinkButton label={tNav("lokasiBca")} icon={<LocationIcon />} onClick={scrollToLocation} />
                  <IconLinkButton
                    label={tNav("haloBca")}
                    icon={<HelpIcon className="size-6 shrink-0 text-neutral-100 opacity-80" />}
                    onClick={openHaloBca}
                  />

                  <div ref={langRef} className="relative">
                    <button
                      onClick={() => setLangOpen((v) => !v)}
                      onMouseEnter={() => setLangHover(true)}
                      onMouseLeave={() => setLangHover(false)}
                      className={`flex h-10 cursor-pointer items-center gap-0.5 rounded-full border px-2 transition-colors ${langHover || langOpen
                          ? "border-neutral-300 bg-white"
                          : "border-white/25 bg-[rgba(5,13,25,0.1)]"
                        }`}
                    >
                      <img src={LOCALE_META[locale].flag} alt="" className="size-6" />
                      <span
                        className={`flex w-8 items-center justify-center text-center text-base font-bold ${langHover || langOpen ? "text-neutral-900" : "text-white"
                          }`}
                      >
                        {locale.toUpperCase()}
                      </span>
                    </button>

                    {langOpen && (
                      <div className="absolute right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-[0px_11px_11px_0px_rgba(224,224,224,0.14),0px_24px_15px_0px_rgba(224,224,224,0.08),0px_3px_6px_0px_rgba(224,224,224,0.16)]">
                        {otherLocales.map((code) => (
                          <button
                            key={code}
                            onClick={() => {
                              setLangOpen(false);
                              switchLocale(code);
                            }}
                            className="flex w-[148px] items-center gap-2 p-4 text-left transition-colors hover:bg-blue-100"
                          >
                            <img src={LOCALE_META[code].flag} alt="" className="size-6 rounded-full object-cover" />
                            <span className="flex-1 text-base font-semibold text-neutral-900">
                              {tLang(code)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative flex w-full flex-col items-center"
              onMouseEnter={cancelClose}
            >
              <div
                style={{ viewTransitionName: "nav-tab-row" } as CSSProperties}
                className={`flex h-11 w-full items-center justify-center transition-colors duration-200 ${menuOpen
                    ? "border border-neutral-300 bg-white"
                    : scrolled
                      ? "bg-neutral-900/90"
                      : ""
                  }`}
              >
                <div className="flex h-11 w-[1280px] items-center justify-between gap-1">
                  <div className="flex h-11 items-center gap-1">
                    {NAV_TABS.map((tab) => {
                      const isOpen = openMenu === tab.key;
                      return (
                        <div
                          key={tab.key}
                          className={`flex h-11 flex-col items-start transition-colors ${isOpen ? "bg-cyan-100" : ""
                            }`}
                          onMouseEnter={() => {
                            cancelClose();
                            setOpenMenu(tab.key);
                          }}
                        >
                          <button className="flex min-h-0 flex-1 items-center justify-center gap-1 px-4 pt-1">
                            <span
                              className={`whitespace-nowrap text-sm leading-[14px] ${isOpen
                                  ? "font-bold text-blue-500"
                                  : menuOpen
                                    ? "font-semibold text-neutral-800"
                                    : "font-semibold text-white/80"
                                }`}
                            >
                              {tab.label}
                            </span>
                            {tab.chevron && (
                              <img
                                src={
                                  isOpen
                                    ? "/assets/navbar/chevron-down-blue.svg"
                                    : menuOpen
                                      ? "/assets/navbar/chevron-down-dark.svg"
                                      : "/assets/navbar/chevron-down-white.svg"
                                }
                                alt=""
                                className={`size-5 transition-transform duration-200 ${isOpen ? "rotate-180" : menuOpen ? "" : "opacity-80"
                                  }`}
                              />
                            )}
                          </button>
                          <div
                            className={`h-1 w-full rounded-t-xl bg-blue-500 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"
                              }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {panel && panelCategory && (
                <div
                  className={`relative flex w-full justify-center ${panel.mode === "close" ? "pointer-events-none" : ""
                    }`}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  {/* The tab we just left, stacked behind and fading out. */}
                  {outgoingCategory && (
                    <div className="pointer-events-none absolute inset-0 flex justify-center">
                      <MegaMenuPanel category={outgoingCategory} mode="out" />
                    </div>
                  )}
                  {/* `seq` in the key remounts on open/switch so the entrance
                      replays; a close reuses the same key and animates in place. */}
                  <MegaMenuPanel
                    key={`${panel.key}-${panel.seq}`}
                    category={panelCategory}
                    mode={panel.mode}
                  />
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
