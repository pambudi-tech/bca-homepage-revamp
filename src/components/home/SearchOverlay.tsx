"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useScrollLock } from "@/components/SmoothScroll";
import { useIsDesktop } from "@/lib/useIsDesktop";
import SearchPlaceholderCarousel from "./SearchPlaceholderCarousel";
import SearchRecommendation, { panelMaxHeight } from "./SearchRecommendation";
import {
  addRecentSearch,
  bcaSearchResultUrl,
  clearRecentSearches,
  getRecentSearches,
  getSearchRecommendations,
  removeRecentSearch,
} from "./search-data";

/** `outline-close.svg` hardcodes its fill to BCA blue (for the white-card
 *  close buttons in HeroWidget/MobileHeroWidget's login panel) — no good on
 *  this overlay's dark scrim. Inline with `currentColor`, same path as
 *  MobileMenu's own close glyph, so `text-white` actually has something to
 *  paint. */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/**
 * Full-screen search launched from the navbar's magnifier, on both desktop
 * and mobile (the mobile bar's search button sits next to the location
 * button — see MobileNav).
 *
 * Unlike the hero's search, the recommendation panel here is open from the
 * first frame: the overlay exists *because* you asked to search, so there is
 * no "idle bar" state to earn it. That's also why the column sits near the top
 * of the viewport rather than centered — bar plus panel read as one block
 * dropping in from the top, and centering the bar would push the panel off
 * screen.
 *
 * Everything inside is reused rather than re-styled: the bar is the hero's
 * glass pill (rolling placeholder included) and the dropdown is the same
 * `SearchRecommendation` the hero and mobile widgets render — in its `compact`
 * form below `xl`, so the overlay's dropdown reads identically to the one the
 * mobile hero widget opens.
 */

/**
 * Everything stacked above the dropdown inside the column — 104px of top
 * padding, the prompt line, the search bar, the gap under it — plus breathing
 * room below the panel. The desktop layout is fixed, so there is nothing to
 * measure.
 */
const PANEL_TOP_OFFSET = 240;
export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("hero");
  const tNav = useTranslations("nav");
  const tSearch = useTranslations("search");
  const placeholders = t.raw("placeholders") as string[];
  // Which of the dropdown's two layouts to render. CSS can't decide this one:
  // `compact` is a prop that restructures the panel, not a set of classes.
  const isDesktop = useIsDesktop();

  const [searchValue, setSearchValue] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recommendations = useMemo(() => getSearchRecommendations(searchValue), [searchValue]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portals need a client-only mount gate
    setMounted(true);
  }, []);

  useScrollLock(open);

  // Each opening starts clean: empty field (so the panel shows recent +
  // popular), a fresh read of the stored recents, and the caret in the input.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, unavailable during server render
    setSearchValue("");
    setRecent(getRecentSearches());
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Hand focus back to the navbar's search button on close — same treatment as
  // MobileMenu, and for the same reason: otherwise focus falls to <body> and a
  // keyboard user restarts from the top of the page.
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      return;
    }
    const activeEl = document.activeElement;
    const stillInsideOverlay = portalRef.current?.contains(activeEl) ?? false;
    if (restoreFocusRef.current && (activeEl === document.body || stillInsideOverlay)) {
      restoreFocusRef.current.focus();
      restoreFocusRef.current = null;
    }
  }, [open]);

  // Focus trap: the overlay is portaled to <body>, so every other body child is
  // the page behind it. `inert` takes them out of the tab order and the
  // accessibility tree while the overlay is up, without touching their styles.
  useEffect(() => {
    if (!open) return;
    const root = portalRef.current;
    if (!root) return;
    const siblings = [...document.body.children].filter(
      (el) => el !== root && !el.hasAttribute("inert")
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));
    return () => siblings.forEach((el) => el.removeAttribute("inert"));
  }, [open]);

  const selectQuery = (term: string) => setSearchValue(term);
  const removeRecent = (term: string) => setRecent((r) => removeRecentSearch(r, term));
  const clearRecent = () => setRecent(clearRecentSearches());

  // A committed search leaves for BCA's real result page, so the overlay has
  // nothing left to show — close it behind the new tab.
  const submitSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((r) => addRecentSearch(r, trimmed));
    window.open(bcaSearchResultUrl(trimmed), "_blank", "noopener,noreferrer");
    onClose();
  };

  if (!mounted) return null;

  // z-80 below: `<main>` is `position: static`, so the page's floating chrome
  // (BackToTop z-50, the cookie banner z-60, HaloBCA's button z-70) all
  // compete at the root stacking level. The scrim has to clear the highest of
  // them or they punch straight through it. See `.hero-search-open` in
  // globals.css for the hero search's equivalent.
  return createPortal(
    <div
      ref={portalRef}
      data-shown={open}
      role="dialog"
      aria-modal="true"
      aria-label={tNav("search")}
      aria-hidden={!open}
      onMouseDown={(e) => {
        if (!isDesktop) return;
        const t = e.target as Node;
        if (
          !contentRef.current?.contains(t) &&
          !closeRef.current?.contains(t)
        )
          onClose();
      }}
      className="fade-overlay fixed inset-0 z-[80] flex justify-center overflow-hidden bg-neutral-100 xl:bg-black/60 xl:backdrop-blur-[4px]"
      style={{ "--fade-ms": "300ms" } as CSSProperties}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={tSearch("close")}
        className="absolute right-8 top-8 z-10 hidden size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 xl:flex"
      >
        <CloseIcon className="size-6" />
      </button>

      {!isDesktop ? (
        <div ref={contentRef} className="flex h-full w-full max-w-[440px] flex-col bg-neutral-100">
          <header className="flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center gap-2 px-4 pt-[env(safe-area-inset-top)]">
            <button type="button" onClick={onClose} aria-label={tSearch("close")} className="flex size-6 shrink-0 items-center justify-center">
              <img src="/assets/navbar/chevron-right-blue.svg" alt="" className="size-6 rotate-90" />
            </button>
            <div className="relative h-10 min-w-0 flex-1 overflow-hidden rounded-full border border-cyan-500 bg-neutral-200 backdrop-blur-[28px]">
              <img src="/assets/cycle1/outline-search-1.svg" alt="" className="absolute left-3 top-2 size-6" />
              <input
                ref={inputRef}
                type="text"
                aria-label={tNav("search")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch(searchValue);
                }}
                className="relative z-10 h-full w-full bg-transparent pl-11 pr-3 text-base text-neutral-800 focus:outline-none"
              />
              <SearchPlaceholderCarousel placeholders={placeholders} visible={!searchValue} live={open} lineHeight={40} className="inset-y-0 left-11 right-3 text-sm" />
            </div>
          </header>
          <div className="min-h-0 flex-1">
            <SearchRecommendation
              recommendations={recommendations}
              keyword={searchValue}
              recent={recent}
              onSelectQuery={selectQuery}
              onRemoveRecent={removeRecent}
              onClearRecent={clearRecent}
              onMouseDown={(e) => e.preventDefault()}
              compact
              screen
            />
          </div>
        </div>
      ) : (
        <div ref={contentRef} className="flex w-full max-w-[960px] flex-col px-10 pt-[104px]">
          <p className="mb-4 text-center text-lg font-semibold text-white text-shadow-hero">{t("searchPrompt")}</p>
          <div
            className="soft-light-border relative h-14 w-full rounded-[50px]"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px) saturate(1.25)",
              WebkitBackdropFilter: "blur(12px) saturate(1.25)",
              "--slb-thickness": "1px",
              "--slb-gradient": "rgba(255,255,255,0.15)",
            } as CSSProperties}
          >
            <input
              ref={inputRef}
              type="text"
              aria-label={tNav("search")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch(searchValue);
              }}
              className="relative z-10 h-full w-full bg-transparent pl-8 pr-[72px] text-base font-semibold text-white focus:outline-none"
            />
            <SearchPlaceholderCarousel placeholders={placeholders} visible={!searchValue} live={open} className="inset-y-0 left-8 right-[72px] text-base" />
            <button type="button" aria-label={tNav("search")} onClick={() => submitSearch(searchValue)} className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform hover:scale-105">
              <img src="/assets/cycle1/outline-search-1.svg" alt="" className="size-6" />
            </button>
          </div>
          <div className="mt-2">
          <SearchRecommendation
            recommendations={recommendations}
            keyword={searchValue}
            recent={recent}
            onSelectQuery={selectQuery}
            onRemoveRecent={removeRecent}
            onClearRecent={clearRecent}
            // Keeps the caret in the field while clicking a chip or a recent term.
            onMouseDown={(e) => e.preventDefault()}
            // Below xl this is the mobile hero widget's dropdown, unchanged —
            // same compact layout, same 70dvh ceiling from the card itself, so
            // no height override here.
            maxHeight={panelMaxHeight(PANEL_TOP_OFFSET)}
          />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
