"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { KursEntry } from "@/lib/kurs";

const PLACEHOLDERS = [
  "Buka rekening BCA",
  "Aktivasi Paylater BCA",
  "Pengajuan Kartu Kredit",
  "Install myBCA",
];

const PLACEHOLDER_LINE_HEIGHT = 28;

const softLightBorderVars = (thickness: string, gradient: string): CSSProperties =>
  ({
    "--slb-thickness": thickness,
    "--slb-gradient": gradient,
  }) as CSSProperties;

function SearchPlaceholderCarousel({ visible }: { visible: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex items-center overflow-hidden px-6 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-7 overflow-hidden">
        <div
          className="flex flex-col transition-transform duration-700 ease-in-out"
          style={{ transform: `translateY(-${index * PLACEHOLDER_LINE_HEIGHT}px)` }}
        >
          {PLACEHOLDERS.map((text) => (
            <span
              key={text}
              className="flex h-7 items-center whitespace-nowrap text-lg font-semibold text-[#cfcfcf]"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { title: "Masuk ke BCA", subtitle: "myBCA • KlikBCA", icon: "/assets/quick-action/login.svg" },
  { title: "Promo Terkini", subtitle: "Penawaran Terbaik", icon: "/assets/quick-action/discount-shape.svg" },
  { title: "Webform BCA", subtitle: "Pengajuan produk", icon: "/assets/quick-action/document.svg" },
  { title: "Lokasi BCA", subtitle: "Cabang & ATM BCA", icon: "/assets/quick-action/location.svg" },
  { title: "HaloBCA", subtitle: "1500888, Chat, Email", icon: "/assets/quick-action/message-question.svg" },
];

export default function HeroWidget({ kurs }: { kurs: KursEntry[] }) {
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [order, setOrder] = useState<number[]>(() => kurs.map((_, i) => i));
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const cardStepRef = useRef(0);
  const offsetRef = useRef(0);
  const tickerPausedRef = useRef(false);
  const tickerHoveringRef = useRef(false);

  useEffect(() => {
    setOrder(kurs.map((_, i) => i));
  }, [kurs]);

  useEffect(() => {
    tickerPausedRef.current = tickerPaused;
  }, [tickerPaused]);

  useEffect(() => {
    const measure = () => {
      if (firstCardRef.current) {
        cardStepRef.current = firstCardRef.current.offsetWidth + 16; // 16 = gap-4
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [order]);

  useEffect(() => {
    let raf: number;
    const step = () => {
      if (!tickerPausedRef.current && cardStepRef.current > 0) {
        offsetRef.current += 0.6;
        if (offsetRef.current >= cardStepRef.current) {
          offsetRef.current -= cardStepRef.current;
          setOrder((o) => [...o.slice(1), o[0]]);
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    setTickerPaused(true);
    offsetRef.current = 0;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(0px)`;
    }
    if (dir === 1) {
      setOrder((o) => [...o.slice(1), o[0]]);
    } else {
      setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
    }
    window.setTimeout(() => {
      if (!tickerHoveringRef.current) setTickerPaused(false);
    }, 600);
  };

  return (
    <div className="relative mx-auto h-[288px] w-[1280px]">
      {/* search + quick action */}
      <div className="absolute top-0 h-[184px] w-full">
        <div
          className="soft-light-border relative z-0 flex h-36 w-full items-start justify-center overflow-clip rounded-t-3xl p-5 backdrop-blur-sm"
          style={{
            background: "linear-gradient(to bottom, rgba(217,217,217,0.35) 0%, rgba(18,20,23,0.35) 100%)",
            ...softLightBorderVars(
              "2px",
              "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)"
            ),
          }}
        >
          <div className="relative flex flex-1 items-center justify-center gap-6">
            <div className="flex items-center justify-center px-2">
              <p className="whitespace-nowrap text-xl font-semibold text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
                Ada yang bisa kami bantu?
              </p>
            </div>
            <div
              className="soft-light-border relative flex flex-1 items-center gap-2 rounded-[50px] p-2 backdrop-blur-md"
              style={{
                background: "rgba(18,20,23,0.5)",
                ...softLightBorderVars("1px", "#ffffff"),
              }}
            >
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="relative z-10 h-7 w-full bg-transparent px-6 text-lg font-semibold text-white focus:outline-none"
                />
                <SearchPlaceholderCarousel visible={!searchValue && !searchFocused} />
              </div>
              <button
                aria-label="Cari"
                className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-white transition-transform hover:scale-105"
              >
                <img src="/assets/cycle1/outline-search-1.svg" alt="" className="size-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-[104px] z-20 flex w-full flex-col items-start px-5">
          <div className="flex w-full items-center justify-center overflow-clip rounded-3xl border border-[#e9ecef] bg-white">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.title}
                className="flex h-20 flex-1 items-center gap-4 border border-[#e9ecef] px-4 py-5 backdrop-blur-[6px] transition-colors duration-150 hover:bg-[#e6f3ff]"
              >
                <img src={action.icon} alt="" className="size-10 shrink-0" />
                <div className="flex flex-col items-start gap-1 text-left whitespace-nowrap">
                  <p className="text-base font-bold text-[#26292c]">{action.title}</p>
                  <p className="text-sm font-normal text-[#495057]">{action.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* kurs */}
      <div
        className="absolute bottom-0 z-10 h-36 w-full overflow-clip rounded-b-3xl"
        onMouseEnter={() => {
          tickerHoveringRef.current = true;
          setTickerPaused(true);
        }}
        onMouseLeave={() => {
          tickerHoveringRef.current = false;
          setTickerPaused(false);
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-b-3xl bg-gradient-to-b from-[#00b5f0] to-[#005caa]"
        />
        <div className="absolute bottom-6 left-8 flex h-14 flex-col items-start justify-center gap-2">
          <p className="text-lg font-semibold text-white underline [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
            Kurs Hari Ini
          </p>
        </div>

        <div
          className="absolute bottom-6 left-[249px] right-5 h-14 overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
          }}
        >
          <div
            ref={trackRef}
            className="flex h-14 gap-4"
            style={{ transform: "translateX(0px)" }}
          >
            {[...order, ...order].map((idx, i) => {
              const entry = kurs[idx];
              return (
                <div
                  key={`${entry.code}-${i}`}
                  ref={i === 0 ? firstCardRef : undefined}
                  className="flex h-14 shrink-0 items-center gap-4 rounded-xl border border-[#017CBD] bg-black/10 p-4 backdrop-blur-[8px]"
                >
                  <div className="flex items-center gap-3">
                    <img src={entry.flag} alt={entry.code} className="size-6" />
                    <p className="w-12 text-lg font-semibold text-white">{entry.code}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-0.5 font-semibold text-[#d1eaff] opacity-90">
                      <span className="flex w-12 pt-[2px]">
                        <span className="text-sm uppercase tracking-[2.1px]">Beli</span>
                      </span>
                      <span className="w-24 text-right text-lg">{entry.beli}</span>
                    </div>
                    <div className="h-5 w-px bg-white/40" />
                    <div className="flex items-center gap-0.5 font-semibold text-[#d1eaff] opacity-90">
                      <span className="flex w-12 pt-[2px]">
                        <span className="text-sm uppercase tracking-[2.1px]">Jual</span>
                      </span>
                      <span className="w-24 text-right text-lg">{entry.jual}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Kurs sebelumnya"
          className="absolute bottom-8 right-[1047px] flex size-10 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/40"
        >
          <img src="/assets/cycle1/chevron-left.svg" alt="" className="size-6" />
        </button>
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Kurs berikutnya"
          className="absolute bottom-8 right-5 flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors hover:bg-black/40"
        >
          <img src="/assets/cycle1/chevron-right.svg" alt="" className="size-6" />
        </button>
      </div>
    </div>
  );
}