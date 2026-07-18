"use client";

import { useEffect, useRef, useState } from "react";
import { MEGAMENU } from "./megamenu-data";
import MegaMenuPanel, { type MegaMenuMode } from "./MegaMenuPanel";
import MobileNav from "./MobileNav";

const SEGMENTS = ["Individu", "Bisnis", "Solitaire", "Prioritas"];

/* How long the panel stays mounted after the pointer leaves, and how long the
   outgoing panel lingers when switching tabs. Both mirror globals.css. */
const MEGAMENU_CLOSE_MS = 440;
const MEGAMENU_SWITCH_MS = 160;

const LANGUAGES = [
  { code: "en", label: "English", flag: "/assets/navbar/flag-en.png" },
  { code: "zh", label: "简体中文", flag: "/assets/navbar/flag-zh.png" },
];

const NAV_TABS = [
  ...MEGAMENU.map((menu) => ({
    key: menu.key,
    label: menu.label,
    width: menu.width,
    chevron: menu.chevron ?? true,
  })),
  { key: "Promo", label: "Promo", width: undefined, chevron: false },
];

function LinkLabel({ label, hover }: { label: string; hover: boolean }) {
  return (
    <span className="flex items-center justify-center px-1">
      <span className="relative inline-flex">
        <span aria-hidden className="invisible whitespace-nowrap text-sm font-bold">
          {label}
        </span>
        <span
          className={`absolute inset-0 whitespace-nowrap text-sm font-semibold text-white opacity-80 transition-opacity duration-300 ${hover ? "opacity-0" : "opacity-100"
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

function NavbarLink({ label }: { label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`flex h-10 items-center justify-center gap-0.5 rounded-full border px-4 backdrop-blur-[4px] transition-colors duration-300 ${hover
          ? "border-white/20 bg-[rgba(18,20,23,0.5)]"
          : "border-white/25 bg-[rgba(5,13,25,0.1)]"
        }`}
    >
      <LinkLabel label={label} hover={hover} />
      <span
        className={`grid overflow-hidden transition-[grid-template-columns] duration-300 ${hover ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
          }`}
      >
        <span className="overflow-hidden">
          <img src="/assets/navbar/arrow-right.svg" alt="" className="size-5" />
        </span>
      </span>
    </button>
  );
}

function SearchButton() {
  const [hover, setHover] = useState(false);
  return (
    <button
      aria-label="Cari"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`flex h-10 items-center justify-start gap-0.5 rounded-full border backdrop-blur-[4px] transition-all duration-300 ${hover
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
          <LinkLabel label="Cari" hover={hover} />
        </span>
      </span>
    </button>
  );
}

export default function Navbar() {
  const [activeSegment, setActiveSegment] = useState("Individu");
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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);

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
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
  const solid = scrolled || menuOpen;
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
        <div
          className={`pre-nav fixed left-0 right-0 top-0 z-30 flex flex-col items-start transition-transform duration-300 ${shouldHide ? "-translate-y-full" : "translate-y-0"
            }`}
          onMouseLeave={scheduleClose}
        >
          <div
            className={`relative flex w-full flex-col items-start transition-shadow duration-200 ${solid ? "shadow-lg" : ""
              }`}
          >
            <div
              className={`relative z-10 flex w-full items-center justify-center px-10 py-4 transition-colors duration-200 ${solid ? "bg-[rgba(18,20,23,0.95)] backdrop-blur-md" : ""
                }`}
              onMouseEnter={closeNow}
            >
              <div className="flex w-full max-w-[1280px] items-center justify-between">
                <div className="flex items-center gap-5">
                  <img src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-9 w-[114.75px]" />
                  <div className="flex items-start gap-1 rounded-full border border-white/15 bg-[rgba(5,13,25,0.2)] p-1 backdrop-blur-[40px]">
                    {SEGMENTS.map((segment) => (
                      <button
                        key={segment}
                        onClick={() => setActiveSegment(segment)}
                        className={`flex h-8 w-24 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors duration-200 ${segment === activeSegment
                            ? "bg-blue-500"
                            : "opacity-80 hover:bg-white/10"
                          }`}
                      >
                        {segment}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <SearchButton />
                  <NavbarLink label="Tentang BCA" />
                  <NavbarLink label="Karir" />

                  <div ref={langRef} className="relative">
                    <button
                      onClick={() => setLangOpen((v) => !v)}
                      onMouseEnter={() => setLangHover(true)}
                      onMouseLeave={() => setLangHover(false)}
                      className={`flex cursor-pointer items-center gap-0.5 rounded-full border p-2 backdrop-blur-[4px] transition-colors ${langHover || langOpen
                          ? "border-neutral-300 bg-white"
                          : "border-white/25 bg-[rgba(5,13,25,0.1)]"
                        }`}
                    >
                      <img src="/assets/cycle1/flag-id.svg" alt="" className="size-6" />
                      <span
                        className={`flex w-8 items-center justify-center text-center text-base font-bold ${langHover || langOpen ? "text-neutral-900" : "text-white"
                          }`}
                      >
                        ID
                      </span>
                    </button>

                    {langOpen && (
                      <div className="absolute right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-[0px_11px_11px_0px_rgba(224,224,224,0.14),0px_24px_15px_0px_rgba(224,224,224,0.08),0px_3px_6px_0px_rgba(224,224,224,0.16)]">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLangOpen(false)}
                            className="flex w-[148px] items-center gap-2 p-4 text-left transition-colors hover:bg-blue-100"
                          >
                            <img src={lang.flag} alt="" className="size-6 rounded-full object-cover" />
                            <span className="flex-1 text-base font-semibold text-neutral-900">
                              {lang.label}
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
                className={`flex h-11 w-full items-center justify-center transition-colors duration-200 ${menuOpen
                    ? "border border-neutral-300 bg-white"
                    : scrolled
                      ? "bg-neutral-900/75 backdrop-blur-md"
                      : ""
                  }`}
              >
                <div className="flex h-11 w-[1280px] items-center gap-1">
                  {NAV_TABS.map((tab) => {
                    const isOpen = openMenu === tab.key;
                    return (
                      <div
                        key={tab.key}
                        className={`flex h-11 flex-col items-start transition-colors ${isOpen ? "bg-cyan-100" : ""
                          }`}
                        style={tab.width ? { width: tab.width } : undefined}
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
        </div>
      </div>
    </>
  );
}
