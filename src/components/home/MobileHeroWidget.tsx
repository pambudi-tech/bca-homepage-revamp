"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { KursEntry } from "@/lib/kurs";
import { useLenis } from "@/components/SmoothScroll";

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

function SearchPlaceholder({ visible }: { visible: boolean }) {
  const [slots, setSlots] = useState<Slot[]>([
    { text: PLACEHOLDERS[0], state: "active", instant: false },
    { text: PLACEHOLDERS[1 % PLACEHOLDERS.length], state: "waiting", instant: false },
  ]);
  const activeSlotRef = useRef(0);
  const nextIndexRef = useRef(2 % PLACEHOLDERS.length);

  useEffect(() => {
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
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 left-6 right-14 flex items-center overflow-hidden transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative h-12 w-full overflow-hidden">
        {slots.map((slot, i) => (
          <span
            key={i}
            className={`absolute inset-0 flex h-12 items-center whitespace-nowrap text-sm font-semibold text-[#cfcfcf] ${
              slot.instant ? "" : "transition-all duration-700 ease-in-out"
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

const QUICK_ACTIONS: QuickAction[] = [
  { title: "Masuk ke BCA", subtitle: "myBCA • KlikBCA", icon: "/assets/quick-action/login.svg" },
  {
    title: "Promo Terkini",
    subtitle: "Penawaran Terbaik",
    icon: "/assets/quick-action/discount-shape.svg",
    scrollTo: "#promo",
  },
  { title: "Webform BCA", subtitle: "Pengajuan produk BCA", icon: "/assets/quick-action/document.svg" },
  { title: "Lokasi BCA", subtitle: "Cabang & ATM BCA", icon: "/assets/quick-action/location.svg" },
  {
    title: "Bantuan HaloBCA",
    subtitle: "1500888 · Chat · Email",
    icon: "/assets/quick-action/message-question.svg",
  },
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
        <p className="w-12 text-base font-semibold leading-6 text-white">{entry.code}</p>
      </div>
      {/* value block: fill but holds a 120px min, so the beli/jual pairs stack
          rather than shrinking — the title is what collapses first. */}
      <div className="flex min-w-[120px] flex-1 flex-wrap items-center justify-end gap-2 font-semibold text-[#d1eaff] opacity-90">
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] uppercase leading-[10px] tracking-[1.5px]">Beli</span>
          <span className="w-[72px] text-right text-sm leading-5">{entry.beli}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] uppercase leading-[10px] tracking-[1.5px]">Jual</span>
          <span className="w-[72px] text-right text-sm leading-5">{entry.jual}</span>
        </div>
      </div>
    </div>
  );
}

export default function MobileHeroWidget({ kurs }: { kurs: KursEntry[] }) {
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [kursIndex, setKursIndex] = useState(0);
  const [kursDir, setKursDir] = useState<"next" | "prev">("next");
  const [autoTick, setAutoTick] = useState(0);
  const lenis = useLenis();

  // Auto-advance the currency every 5s; manual navigation resets the timer.
  useEffect(() => {
    if (kurs.length <= 1) return;
    const id = setInterval(() => {
      setKursDir("next");
      setKursIndex((i) => (i + 1) % kurs.length);
    }, 5000);
    return () => clearInterval(id);
  }, [kurs.length, autoTick]);

  const stepKurs = (dir: "next" | "prev") => {
    setKursDir(dir);
    setKursIndex((i) =>
      dir === "next" ? (i + 1) % kurs.length : (i - 1 + kurs.length) % kurs.length
    );
    setAutoTick((t) => t + 1);
  };

  const goToPromo = () => {
    if (lenis) lenis.scrollTo("#promo", { offset: 0, duration: 1 });
    else document.querySelector("#promo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // The search panel (h-140) and the kurs bar are stacked flush; the
    // quick-action rail is absolutely positioned so it straddles the seam,
    // overlapping the panel's empty lower half and the top of the kurs bar.
    <div className="relative">
      {/* 1. Search panel — same glass treatment as the desktop hero search:
             `.hero-search` gradient top-border + reactive backdrop blur. */}
      <div
        className="hero-search relative flex h-[140px] items-start justify-center overflow-clip rounded-t-3xl p-4"
        style={{
          backdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
          WebkitBackdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
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
            className="soft-light-border relative h-12 w-full rounded-[50px]"
            style={
              {
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px) saturate(1.25) contrast(1.02)",
                WebkitBackdropFilter: "blur(12px) saturate(1.25) contrast(1.02)",
                "--slb-thickness": "1px",
                "--slb-gradient": "rgba(255,255,255,0.15)",
              } as CSSProperties
            }
          >
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") e.currentTarget.blur();
              }}
              className="relative z-10 h-full w-full bg-transparent pl-6 pr-14 text-sm font-semibold text-white focus:outline-none"
            />
            <SearchPlaceholder visible={!searchValue && !searchFocused} />
            <button
              aria-label="Cari"
              className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform active:scale-95"
            >
              <img src="/assets/cycle1/outline-search-1.svg" alt="" className="size-[22px]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Kurs — blue bar directly under the search panel; the top padding
             leaves room for the quick-action cards that overlap it. */}
      <div className="relative overflow-clip rounded-b-3xl bg-gradient-to-b from-[#00b5f0] to-[#005caa] shadow-[inset_0px_-4px_8px_0px_rgba(0,51,94,0.25)]">
        <div className="flex items-center gap-4 px-5 pb-5 pt-[92px]">
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
      <div className="hide-scrollbar absolute inset-x-[-8px] top-[112px] z-10 h-[104px] overflow-x-auto overflow-y-clip [scrollbar-width:none]">
        <div className="flex h-full w-max items-center gap-3 px-5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.title}
              onClick={action.scrollTo ? goToPromo : undefined}
              className="flex w-40 shrink-0 flex-col items-start justify-center gap-2 rounded-xl border border-[#e9ecef] bg-white p-4 text-left transition-colors active:bg-[#e6f3ff]"
            >
              <img src={action.icon} alt="" className="size-6" />
              <div className="flex flex-col gap-0.5">
                <p className="whitespace-nowrap text-sm font-bold text-[#26292c]">{action.title}</p>
                <p className="whitespace-nowrap text-xs font-normal text-[#495057]">
                  {action.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
