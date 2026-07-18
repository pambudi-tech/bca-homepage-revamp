"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { MEGAMENU } from "./megamenu-data";
import { useLenis } from "@/components/SmoothScroll";

const SEGMENTS = ["Individu", "Bisnis", "Solitaire", "Prioritas"];

const MENU_ITEMS = [
  ...MEGAMENU.map((c) => ({ key: c.key, label: c.label, expandable: true })),
  { key: "Promo", label: "Promo", expandable: false },
];

/* ------------------------------ icons ------------------------------ */

const iconBase = "shrink-0";
function ChevronRight({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
function ChevronLeft({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}
function ExpandAll({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="m8 9 4-4 4 4" />
      <path d="m8 15 4 4 4-4" />
    </svg>
  );
}
function CloseIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/* ------------------------------ views ------------------------------ */

type View = { type: "main" } | { type: "segment" } | { type: "detail"; key: string };
type Dir = "fwd" | "back";
const viewKey = (v: View) => (v.type === "detail" ? `detail:${v.key}` : v.type);

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [segment, setSegment] = useState("Individu");
  const [view, setView] = useState<View>({ type: "main" });
  const [enterDir, setEnterDir] = useState<Dir | null>(null);
  const [exiting, setExiting] = useState<{ view: View; dir: Dir } | null>(null);
  const lenis = useLenis();

  // Reset to the root view each time the menu opens, and lock page scroll while
  // it's open (the menu keeps its own internal scroll via `data-lenis-prevent`).
  useEffect(() => {
    if (open) {
      setView({ type: "main" });
      setEnterDir(null);
      setExiting(null);
      lenis?.stop();
    } else {
      lenis?.start();
    }
    // Belt and braces: if this ever unmounts while open, scroll must not stay
    // locked for the rest of the session.
    return () => {
      lenis?.start();
    };
  }, [open, lenis]);

  const navigate = (to: View, dir: Dir) => {
    setExiting({ view, dir });
    setEnterDir(dir);
    setView(to);
  };

  const renderView = (v: View) => {
    if (v.type === "segment") return <SegmentView segment={segment} onPick={(s) => { setSegment(s); navigate({ type: "main" }, "back"); }} onBack={() => navigate({ type: "main" }, "back")} />;
    if (v.type === "detail") {
      const cat = MEGAMENU.find((c) => c.key === v.key);
      if (!cat) return null;
      return <DetailView cat={cat} onBack={() => navigate({ type: "main" }, "back")} onLeaf={onClose} />;
    }
    return (
      <MainView
        onOpenDetail={(key) => navigate({ type: "detail", key }, "fwd")}
        onLeaf={onClose}
      />
    );
  };

  const enterAnim = enterDir === "fwd" ? "menu-enter-fwd" : enterDir === "back" ? "menu-enter-back" : "";

  // `fade-overlay` rather than a bare `opacity-0`: this panel is a full-viewport
  // backdrop-filter that stays mounted for the whole session, and while it was
  // merely transparent the compositor still evaluated that blur every frame —
  // on a closed menu, for the entire visit. `visibility: hidden` takes it out of
  // the paint step without giving up either fade.
  return (
    <div
      data-shown={open}
      className="fade-overlay fixed inset-0 z-[60] flex justify-center xl:hidden"
      style={
        {
          "--fade-ms": "500ms",
          background: "linear-gradient(to bottom, rgba(0,92,170,0.5) 0%, #005caa 15%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        } as CSSProperties
      }
      aria-hidden={!open}
    >
      <div className="flex h-full w-full max-w-[440px] flex-col">
        {/* Menu nav bar */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <img src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-8 w-[102px]" />
          <div className="flex items-center gap-2">
            {/* The segment picker is its own view, so the pill is hidden while it's open. */}
            {view.type !== "segment" && (
              <button
                onClick={() => navigate({ type: "segment" }, "fwd")}
                className="flex h-10 w-[148px] items-center justify-between rounded-full bg-blue-100 px-4 transition-transform active:scale-[0.98]"
              >
                <span className="text-sm font-semibold text-blue-500">{segment}</span>
                <ExpandAll className="size-4 text-blue-500" />
              </button>
            )}
            <button onClick={onClose} aria-label="Tutup menu" className="flex size-10 items-center justify-center text-white transition-transform active:scale-95">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Animated stage */}
        <div className="relative flex-1 overflow-hidden">
          {exiting && (
            <div
              key={viewKey(exiting.view)}
              className={`absolute inset-0 ${exiting.dir === "fwd" ? "menu-exit-fwd" : "menu-exit-back"}`}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setExiting(null);
              }}
            >
              <ViewScroller>{renderView(exiting.view)}</ViewScroller>
            </div>
          )}
          <div key={viewKey(view)} className={`absolute inset-0 ${enterAnim}`}>
            <ViewScroller>{renderView(view)}</ViewScroller>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="hide-scrollbar h-full overflow-y-auto px-4 pb-6 [scrollbar-width:none]" data-lenis-prevent>
      <div className="flex min-h-full flex-col">{children}</div>
    </div>
  );
}

/* ------------------------------ Main view ------------------------------ */

function MainView({
  onOpenDetail,
  onLeaf,
}: {
  onOpenDetail: (key: string) => void;
  onLeaf: () => void;
}) {
  return (
    <>
      <div className="mt-6 flex items-center gap-3">
        <button
          aria-label="Cari"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(186,213,255,0.25)] transition-colors active:bg-white/10"
        >
          <img src="/assets/cycle1/outline-search.svg" alt="" className="size-6" />
        </button>
        <button
          onClick={onLeaf}
          className="flex h-10 flex-1 items-center justify-center rounded-full border border-[rgba(186,213,255,0.25)] px-5 text-sm font-semibold text-white transition-colors active:bg-white/10"
        >
          Tentang BCA
        </button>
        <button
          onClick={onLeaf}
          className="flex h-10 flex-1 items-center justify-center rounded-full border border-[rgba(186,213,255,0.25)] px-5 text-sm font-semibold text-white transition-colors active:bg-white/10"
        >
          Karir
        </button>
      </div>

      <nav className="mt-6 flex flex-col">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => (item.expandable ? onOpenDetail(item.key) : onLeaf())}
            className="flex items-center justify-between px-1 py-5 text-left transition-opacity active:opacity-60"
          >
            <span className="text-base font-semibold leading-6 text-white">{item.label}</span>
            {item.expandable && <ChevronRight className="size-6 text-white/90" />}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex h-16 items-center justify-between pl-1">
        <span className="text-base font-semibold leading-6 text-white">Bahasa</span>
        <button className="flex items-center gap-0.5 rounded-full border border-[rgba(186,213,255,0.25)] p-2 transition-colors active:bg-white/10">
          <img src="/assets/cycle1/flag-id.svg" alt="" className="size-6" />
          <span className="flex w-8 items-center justify-center px-0.5 text-base font-bold text-white">
            ID
          </span>
        </button>
      </div>
    </>
  );
}

/* ------------------------------ Segment view ------------------------------ */

function SegmentView({
  segment,
  onPick,
  onBack,
}: {
  segment: string;
  onPick: (s: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="mt-6 flex h-10 items-center px-1">
        <button onClick={onBack} className="flex items-center gap-3 text-white transition-opacity active:opacity-60">
          <ChevronLeft className="size-6" />
          <span className="text-lg font-semibold leading-[26px]">Kembali</span>
        </button>
      </div>

      <p className="mt-14 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
        Pilih Segmen Anda
      </p>

      <div className="mt-12 flex flex-col items-center gap-8">
        {SEGMENTS.map((s) => {
          const selected = s === segment;
          return (
            <button
              key={s}
              onClick={() => onPick(s)}
              className={`flex h-16 items-center justify-center text-2xl font-semibold leading-8 text-white transition-transform active:scale-95 ${selected ? "rounded-full border border-white px-10" : "opacity-90"
                }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------ Detail view ------------------------------ */

function DetailView({
  cat,
  onBack,
  onLeaf,
}: {
  cat: (typeof MEGAMENU)[number];
  onBack: () => void;
  onLeaf: () => void;
}) {
  return (
    <>
      <div className="mt-6 flex h-10 items-center px-1">
        <button onClick={onBack} className="flex items-center gap-3 text-white transition-opacity active:opacity-60">
          <ChevronLeft className="size-6" />
          <span className="text-lg font-semibold leading-[26px]">{cat.label}</span>
        </button>
      </div>

      <nav className="mt-6 flex flex-col">
        {cat.products.map((product) => (
          <button
            key={product}
            onClick={onLeaf}
            className="flex items-center justify-between px-1 py-5 text-left transition-opacity active:opacity-60"
          >
            <span className="text-base font-semibold leading-6 text-white">{product}</span>
            <ChevronRight className="size-5 text-white/90" />
          </button>
        ))}
      </nav>
    </>
  );
}
