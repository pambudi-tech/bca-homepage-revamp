"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useScrollLock } from "@/components/SmoothScroll";
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

/**
 * Full-screen search launched from the navbar's magnifier (desktop only — the
 * mobile bar has no search button; phones search from the hero widget).
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
 * `SearchRecommendation` the hero and mobile widgets render.
 */
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

  const [searchValue, setSearchValue] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
      // Anything outside the column — the dimmed page around it — dismisses.
      onMouseDown={(e) => {
        if (!contentRef.current?.contains(e.target as Node)) onClose();
      }}
      className="fade-overlay fixed inset-0 z-[80] hidden justify-center overflow-hidden bg-black/60 backdrop-blur-[4px] xl:flex"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={tSearch("close")}
        className="absolute right-8 top-8 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
      >
        <img src="/assets/cycle1/outline-close.svg" alt="" className="size-6" />
      </button>

      <div
        ref={contentRef}
        className={`flex w-full max-w-[960px] flex-col px-10 pt-[104px] transition-[opacity,transform] duration-300 ease-out ${open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
      >
        <p className="mb-4 text-center text-lg font-semibold text-white text-shadow-hero">
          {t("searchPrompt")}
        </p>

        {/* The hero's glass pill, unchanged — see HeroWidget's search bar. */}
        <div
          className="soft-light-border relative flex items-center gap-2 rounded-[50px] p-2"
          style={
            {
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px) saturate(1.25)",
              WebkitBackdropFilter: "blur(12px) saturate(1.25)",
              "--slb-thickness": "1px",
              "--slb-gradient": "rgba(255,255,255,0.15)",
            } as CSSProperties
          }
        >
          <div className="relative flex h-10 min-w-0 flex-1 items-center">
            <input
              ref={inputRef}
              type="text"
              aria-label={tNav("search")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch(searchValue);
              }}
              className="relative z-10 h-7 w-full bg-transparent px-6 text-base font-semibold text-white focus:outline-none"
            />
            {/* Unlike the hero's, this carousel keeps rolling while the field is
                focused — the overlay opens focused, so gating it on blur would
                mean it never shows at all. */}
            <SearchPlaceholderCarousel
              placeholders={placeholders}
              visible={!searchValue}
              live={open}
            />
          </div>
          <button
            type="button"
            aria-label={tNav("search")}
            onClick={() => submitSearch(searchValue)}
            className="relative z-10 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white transition-transform hover:scale-105"
          >
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
            // 104px of top padding + the prompt line + the bar + the 8px gap,
            // plus breathing room under the panel: the fixed layout above makes
            // this constant, so there is nothing to measure.
            maxHeight={panelMaxHeight(240)}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
