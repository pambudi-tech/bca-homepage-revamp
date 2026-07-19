"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { KursEntry } from "@/lib/kurs";
import { useLenis } from "@/components/SmoothScroll";
import { useIsLive } from "@/lib/useIsLive";
import SearchRecommendation from "./SearchRecommendation";
import {
  addRecentSearch,
  bcaSearchResultUrl,
  clearRecentSearches,
  getRecentSearches,
  getSearchRecommendations,
  removeRecentSearch,
} from "./search-data";

/* ------------------------------------------------------------------ *
 * Animated search placeholder (compact 14px variant of the desktop one)
 * ------------------------------------------------------------------ */

const PLACEHOLDERS = [
  "Buka rekening BCA",
  "Aktivasi Paylater BCA",
  "Pengajuan Kartu Kredit",
  "Install myBCA",
];
const LINE_H = 48; // matches the h-12 slot height

type SlotState = "active" | "exiting" | "waiting";
type Slot = { text: string; state: SlotState; instant: boolean };

function slotStyle(state: SlotState): CSSProperties {
  if (state === "active") return { transform: "translateY(0px)", opacity: 1 };
  if (state === "exiting") return { transform: `translateY(-${LINE_H}px)`, opacity: 0 };
  return { transform: `translateY(${LINE_H}px)`, opacity: 0 };
}

function SearchPlaceholder({ visible, live }: { visible: boolean; live: boolean }) {
  const [slots, setSlots] = useState<Slot[]>([
    { text: PLACEHOLDERS[0], state: "active", instant: false },
    { text: PLACEHOLDERS[1 % PLACEHOLDERS.length], state: "waiting", instant: false },
  ]);
  const activeSlotRef = useRef(0);
  const nextIndexRef = useRef(2 % PLACEHOLDERS.length);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const activeIdx = activeSlotRef.current;
      const waitingIdx = activeIdx === 0 ? 1 : 0;
      setSlots((prev) => {
        const next = [...prev];
        next[activeIdx] = { ...next[activeIdx], state: "exiting" };
        next[waitingIdx] = { ...next[waitingIdx], state: "active" };
        return next;
      });
      activeSlotRef.current = waitingIdx;
      setTimeout(() => {
        const text = PLACEHOLDERS[nextIndexRef.current % PLACEHOLDERS.length];
        nextIndexRef.current += 1;
        setSlots((prev) => {
          const next = [...prev];
          next[activeIdx] = { text, state: "waiting", instant: true };
          return next;
        });
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            setSlots((prev) => {
              const next = [...prev];
              next[activeIdx] = { ...next[activeIdx], instant: false };
              return next;
            })
          )
        );
      }, 700);
    }, 2500);
    return () => clearInterval(id);
  }, [live]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 left-6 right-14 flex items-center overflow-hidden transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"
        }`}
    >
      <div className="relative h-12 w-full overflow-hidden">
        {slots.map((slot, i) => (
          <span
            key={i}
            className={`absolute inset-0 flex h-12 items-center whitespace-nowrap text-sm font-semibold text-neutral-500 ${slot.instant ? "" : "transition-all duration-700 ease-in-out"
              }`}
            style={slotStyle(slot.state)}
          >
            {slot.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Quick actions
 * ------------------------------------------------------------------ */

type QuickAction = { title: string; subtitle: string; icon: string; scrollTo?: string };

// The rail bleeds 8px past the widget on both sides and pads px-5, so the
// opened login card fills the rail minus 40px. Measured rather than expressed
// as calc(): a `calc(min(...))` end value doesn't interpolate, so the width
// transition would snap instead of animate.
const RAIL_PADDING_X = 40;
const LOGIN_CARD_WIDTH_COLLAPSED = 160;
// Collapsed rail 104px; opened login card is 32 (padding) + 40 (header) +
// 12 (gap) + 100 (login tiles) = 184px, i.e. 80px taller.
const RAIL_H = 104;
const RAIL_H_OPEN = 184;
// Kurs top padding clears the rail and leaves the same 16px gap in both states.
const KURS_PT = 92;
const KURS_PT_OPEN = KURS_PT + (RAIL_H_OPEN - RAIL_H);
// Focusing the search scrolls the widget this far below the viewport top —
// so the dropdown gets the rest of the screen to open into.
const SEARCH_TOP_GAP = 24;

const QUICK_ACTIONS: QuickAction[] = [
  { title: "Masuk ke BCA", subtitle: "myBCA • KlikBCA", icon: "/assets/quick-action/login.svg" },
  {
    title: "Promo Terkini",
    subtitle: "Penawaran Terbaik",
    icon: "/assets/quick-action/discount-shape.svg",
    scrollTo: "#promo",
  },
  {
    title: "Bantuan HaloBCA",
    subtitle: "1500888 · Chat · Email",
    icon: "/assets/quick-action/message-question.svg",
  },
  { title: "Lokasi BCA", subtitle: "Cabang & ATM BCA", icon: "/assets/quick-action/location.svg" },
  { title: "Webform BCA", subtitle: "Pengajuan produk BCA", icon: "/assets/quick-action/document.svg" },
];

/* ------------------------------------------------------------------ *
 * Kurs card (mobile) — mirrors the Figma `usd` node. The title (flag +
 * code) fills but caps at 84px; the value block fills but needs 120px,
 * so on a narrow phone the beli/jual pairs wrap while it stays inline
 * with the title, and everything relaxes onto one row on wider screens.
 * ------------------------------------------------------------------ */

function KursCard({ entry }: { entry: KursEntry }) {
  return (
    <div className="flex w-full max-w-[360px] items-center justify-between gap-2 rounded-xl border border-[#017CBD] bg-black/10 px-5 py-2.5">
      {/* title: fill but caps at 84px, so it yields room first — flag + code
          then wrap (flag on top, code below) once the card gets narrow. */}
      <div className="flex min-w-0 max-w-[84px] flex-1 flex-wrap content-center items-center gap-x-3 gap-y-1">
        <img src={entry.flag} alt={entry.code} className="size-5 shrink-0" />
        <p className="w-12 text-sm font-semibold leading-6 text-white">{entry.code}</p>
      </div>
      {/* value block: fill but holds a 120px min, so the beli/jual pairs stack
          rather than shrinking — the title is what collapses first. */}
      <div className="flex min-w-[120px] flex-1 flex-wrap items-center justify-end gap-2 font-semibold text-blue-300 opacity-90">
        <div className="flex items-center gap-2">
          <span className="w-8 text-xs uppercase leading-[12px] tracking-[1.5px]">Beli</span>
          <span className="w-[72px] text-right text-sm leading-5">{entry.beli}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 text-xs uppercase leading-[12px] tracking-[1.5px]">Jual</span>
          <span className="w-[72px] text-right text-sm leading-5">{entry.jual}</span>
        </div>
      </div>
    </div>
  );
}

export default function MobileHeroWidget({
  kurs,
  onSearchActiveChange,
}: {
  kurs: KursEntry[];
  onSearchActiveChange?: (active: boolean) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [kursIndex, setKursIndex] = useState(0);
  const [kursDir, setKursDir] = useState<"next" | "prev">("next");
  const [autoTick, setAutoTick] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginCardWidth, setLoginCardWidth] = useState(LOGIN_CARD_WIDTH_COLLAPSED);
  // Suppressed while a resize retargets the width: the opened card's contents
  // are laid out at the new width immediately, so animating the box toward it
  // would clip them for the duration of the transition.
  const [animateLoginWidth, setAnimateLoginWidth] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const railWidthRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  // Gates this widget's timers. Above xl the whole thing lives in a
  // `display:none` wrapper, so this stays false and nothing here ticks.
  const live = useIsLive(rootRef);
  const searchBarRef = useRef<HTMLDivElement>(null);
  // Distance from the widget root to the bottom of the search bar. The dropdown
  // is rendered at the root (the search panel is `overflow-clip`) so it can
  // spill over the quick actions and kurs bar.
  const [panelTop, setPanelTop] = useState(0);
  const lenis = useLenis();

  const recommendations = useMemo(() => getSearchRecommendations(searchValue), [searchValue]);

  useEffect(() => {
    onSearchActiveChange?.(searchFocused);
  }, [searchFocused, onSearchActiveChange]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  useEffect(() => {
    if (!searchFocused) return;
    const measure = () => {
      if (!searchBarRef.current || !rootRef.current) return;
      const sb = searchBarRef.current.getBoundingClientRect();
      const root = rootRef.current.getBoundingClientRect();
      setPanelTop(sb.bottom - root.top);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [searchFocused]);

  // Focusing enters "search mode": scroll the widget up so the dropdown has the
  // screen below it, and let HeroArea raise the page-dimming overlay.
  const focusSearch = () => {
    setSearchFocused(true);
    const el = rootRef.current;
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: -SEARCH_TOP_GAP, duration: 0.8 });
    } else {
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top - SEARCH_TOP_GAP,
        behavior: "smooth",
      });
    }
  };

  const selectQuery = (term: string) => setSearchValue(term);
  const removeRecent = (term: string) => setRecent((r) => removeRecentSearch(r, term));
  const clearRecent = () => setRecent(clearRecentSearches());

  const submitSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((r) => addRecentSearch(r, t));
    window.open(bcaSearchResultUrl(t), "_blank", "noopener,noreferrer");
  };

  // The opened card spans the rail, so its width has to follow the viewport.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      // The observer also fires on the open/close height change — ignore those.
      if (width === railWidthRef.current) return;
      const first = railWidthRef.current === 0;
      railWidthRef.current = width;
      setLoginCardWidth(width - RAIL_PADDING_X);
      if (first) return;
      setAnimateLoginWidth(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimateLoginWidth(true)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-advance the currency every 5s; manual navigation resets the timer.
  // Gated on `live`: above xl this whole widget sits in a `display:none`
  // wrapper, so without this the desktop layout would still be paging currencies
  // every 5s for a widget nobody can see.
  useEffect(() => {
    if (!live || kurs.length <= 1) return;
    const id = setInterval(() => {
      setKursDir("next");
      setKursIndex((i) => (i + 1) % kurs.length);
    }, 5000);
    return () => clearInterval(id);
  }, [kurs.length, autoTick, live]);

  const stepKurs = (dir: "next" | "prev") => {
    setKursDir(dir);
    setKursIndex((i) =>
      dir === "next" ? (i + 1) % kurs.length : (i - 1 + kurs.length) % kurs.length
    );
    setAutoTick((t) => t + 1);
  };

  // Opening scrolls the rail back to the start so the (now much wider) login
  // card is fully in view rather than half-scrolled off.
  const toggleLogin = () => {
    const next = !loginOpen;
    setLoginOpen(next);
    if (next) railRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const goToPromo = () => {
    if (lenis) lenis.scrollTo("#promo", { offset: 0, duration: 1 });
    else document.querySelector("#promo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // The search panel (h-140) and the kurs bar are stacked flush; the
    // quick-action rail is absolutely positioned so it straddles the seam,
    // overlapping the panel's empty lower half and the top of the kurs bar.
    <div ref={rootRef} className="relative">
      {/* 1. Search panel — same glass treatment as the desktop hero search:
             `.hero-search` gradient top-border + reactive backdrop blur. */}
      <div
        className="hero-search relative flex h-[140px] items-start justify-center overflow-clip rounded-t-3xl p-4"
        style={{
          backdropFilter: "blur(16px) saturate(1.25)",
          WebkitBackdropFilter: "blur(16px) saturate(1.25)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(5,13,25,0.35) 100%)",
          }}
        />
        <div className="relative flex w-full flex-col items-center gap-3">
          <p className="px-2 text-sm font-semibold text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
            Ada yang bisa kami bantu?
          </p>
          <div
            ref={searchBarRef}
            className="soft-light-border relative h-12 w-full rounded-[50px]"
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
            {/* The input is text-base (16px) on purpose: iOS Safari zooms the
                page in when a focused input's font-size is below 16px. The
                placeholder is a sibling overlay, not a real `placeholder`
                attribute, so it keeps the design's 14px — Safari only measures
                the input itself. Don't "align" the two by dropping the input to
                text-sm; that brings the zoom back. */}
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={focusSearch}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") e.currentTarget.blur();
                if (e.key === "Enter") {
                  submitSearch(searchValue);
                  e.currentTarget.blur();
                }
              }}
              className="relative z-10 h-full w-full bg-transparent pl-6 pr-14 text-base font-semibold text-white focus:outline-none"
            />
            <SearchPlaceholder visible={!searchValue && !searchFocused} live={live} />
            <button
              aria-label="Cari"
              onClick={() => submitSearch(searchValue)}
              className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform active:scale-95"
            >
              <img src="/assets/cycle1/outline-search-1.svg" alt="" className="size-[22px]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Kurs — blue bar directly under the search panel; the top padding
             leaves room for the quick-action cards that overlap it. */}
      <div className="relative overflow-clip rounded-b-3xl bg-gradient-to-b from-cyan-500 to-blue-500 shadow-[inset_0px_-4px_8px_0px_rgba(0,51,94,0.25)]">
        <div
          className="flex items-center gap-4 px-5 pb-5 transition-[padding-top] duration-300 ease-in-out"
          style={{ paddingTop: loginOpen ? KURS_PT_OPEN : KURS_PT }}
        >
          <button
            onClick={() => stepKurs("prev")}
            aria-label="Kurs sebelumnya"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/20 transition-colors active:bg-black/40"
          >
            <img src="/assets/cycle1/chevron-left.svg" alt="" className="size-6" />
          </button>
          <div className="flex min-w-0 flex-1 items-start overflow-hidden">
            <div key={kursIndex} className={`w-full ${kursDir === "next" ? "kurs-in-next" : "kurs-in-prev"}`}>
              <KursCard entry={kurs[kursIndex]} />
            </div>
          </div>
          <button
            onClick={() => stepKurs("next")}
            aria-label="Kurs berikutnya"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/20 transition-colors active:bg-black/40"
          >
            <img src="/assets/cycle1/chevron-right.svg" alt="" className="size-6" />
          </button>
        </div>
      </div>

      {/* 3. Quick actions — separate cards straddling the seam, scroll to reveal
             the rest. `-inset-x-2` bleeds the rail to the screen edges. */}
      <div
        ref={railRef}
        className="hide-scrollbar absolute inset-x-[-8px] top-[112px] z-10 overflow-x-auto overflow-y-clip transition-[height] duration-300 ease-in-out [scrollbar-width:none]"
        style={{ height: loginOpen ? RAIL_H_OPEN : RAIL_H }}
      >
        <div className="flex h-full w-max items-start gap-3 px-6">
          {QUICK_ACTIONS.map((action, index) =>
            index === 0 ? (
              /* "Masuk ke BCA" — expands in place into the login panel. Both
                 states are absolutely stacked at their own fixed width so the
                 text never reflows while the card animates. */
              <div
                key={action.title}
                /* No press-shrink here, unlike the other quick actions: this
                   card expands in place rather than navigating, and the width
                   animation already reads as the response to the tap. */
                className={`relative h-full shrink-0 overflow-hidden rounded-xl border border-neutral-300 duration-300 ease-in-out ${animateLoginWidth
                  ? "transition-[width,background-color]"
                  : "transition-[background-color]"
                  }`}
                style={{
                  width: loginOpen ? loginCardWidth : LOGIN_CARD_WIDTH_COLLAPSED,
                  backgroundColor: loginOpen ? "#e6f3ff" : "#ffffff",
                }}
              >
                <button
                  onClick={toggleLogin}
                  aria-expanded={loginOpen}
                  className={`absolute inset-y-0 left-0 flex w-40 flex-col items-start justify-center gap-2 p-[14px] text-left transition-opacity duration-200 ${loginOpen ? "pointer-events-none opacity-0" : "opacity-100 delay-100"
                    }`}
                >
                  <img src={action.icon} alt="" className="size-6" />
                  <div className="flex flex-col gap-0.5">
                    <p className="whitespace-nowrap text-sm font-bold text-neutral-800">
                      {action.title}
                    </p>
                    <p className="whitespace-nowrap text-xs font-normal text-neutral-700">
                      {action.subtitle}
                    </p>
                  </div>
                </button>

                <div
                  className={`absolute inset-y-0 left-0 flex flex-col gap-3 p-[14px] transition-opacity duration-200 ${loginOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
                    }`}
                  style={{ width: loginCardWidth, height: RAIL_H_OPEN }}
                >
                  {/* The whole header collapses the card — tapping the title
                      again is the same gesture as tapping the X. */}
                  <button
                    onClick={toggleLogin}
                    aria-expanded={loginOpen}
                    aria-label="Tutup Masuk ke BCA"
                    className="flex shrink-0 items-center gap-4"
                  >
                    <img src={action.icon} alt="" className="size-6 shrink-0" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                      <p className="text-sm font-bold text-neutral-800">{action.title}</p>
                      <p className="text-xs font-normal text-neutral-700">{action.subtitle}</p>
                    </div>
                    <img
                      src="/assets/cycle1/outline-close.svg"
                      alt=""
                      className="size-5 shrink-0"
                    />
                  </button>
                  <div className="flex flex-1 items-stretch gap-[9px]">
                    <button className="flex flex-1 flex-col items-start justify-center gap-2 rounded-xl border border-neutral-300 bg-white p-4 transition-[background-color,transform] duration-200 active:scale-95 active:bg-neutral-200">
                      <img
                        src="/assets/quick-action/mybca-logo.svg"
                        alt=""
                        className="size-10 shrink-0"
                      />
                      <p className="whitespace-nowrap text-sm font-semibold text-neutral-800">
                        Login ke myBCA
                      </p>
                    </button>
                    <button className="flex flex-1 flex-col items-start justify-center gap-2 rounded-xl border border-neutral-300 bg-white p-4 transition-[background-color,transform] duration-200 active:scale-95 active:bg-neutral-200">
                      <img
                        src="/assets/quick-action/klikbca-logo.webp"
                        alt=""
                        className="h-10 w-auto shrink-0 object-contain"
                      />
                      <p className="whitespace-nowrap text-sm font-semibold text-neutral-800">
                        Login ke KlikBCA
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                key={action.title}
                onClick={() => {
                  if (loginOpen) setLoginOpen(false);
                  if (action.scrollTo) goToPromo();
                }}
                className="flex h-[104px] w-40 shrink-0 flex-col items-start justify-center gap-2 rounded-xl border border-neutral-300 bg-white p-[14px] text-left transition-[background-color,transform] duration-200 active:scale-95 active:bg-cyan-100"
              >
                <img src={action.icon} alt="" className="size-6" />
                <div className="flex flex-col gap-0.5">
                  <p className="whitespace-nowrap text-sm font-bold text-neutral-800">
                    {action.title}
                  </p>
                  <p className="whitespace-nowrap text-xs font-normal text-neutral-700">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* 3b. Search-mode dim for the widget's own lower half. The page-wide
             overlay in HeroArea passes *under* the widget (it sits at z-40), so
             the kurs bar and quick-action rail would otherwise stay bright while
             everything around them dims. This wash starts at the same y as the
             dropdown, so only the search panel is left untouched. It matches the
             rail's `inset-x-[-8px]` bleed rather than the widget's own width —
             a card scrolled into that 8px overhang has to dim too. */}
      <div
        aria-hidden
        data-shown={searchFocused}
        className="fade-overlay absolute inset-x-[-8px] bottom-0 z-30 rounded-b-3xl bg-black/50 backdrop-blur-[2px]"
        style={{ top: panelTop + 8 }}
      />

      {/* 4. Search recommendation — aligned with the search bar (the panel's
             p-4 inset) and dropped 8px below it. `onMouseDown` preventDefault
             keeps the input focused so tapping an item doesn't close the panel
             before the tap lands. */}
      {searchFocused && (
        <div className="absolute inset-x-4 z-50" style={{ top: panelTop + 8 }}>
          <SearchRecommendation
            compact
            recommendations={recommendations}
            keyword={searchValue}
            recent={recent}
            onSelectQuery={selectQuery}
            onRemoveRecent={removeRecent}
            onClearRecent={clearRecent}
            onMouseDown={(e) => e.preventDefault()}
          />
        </div>
      )}
    </div>
  );
}
