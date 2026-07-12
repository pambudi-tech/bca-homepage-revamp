"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { KursEntry } from "@/lib/kurs";

const PLACEHOLDERS = [
  "Buka rekening BCA",
  "Aktivasi Paylater BCA",
  "Pengajuan Kartu Kredit",
  "Install myBCA",
];

const PLACEHOLDER_LINE_HEIGHT = 48;

type SlotState = "active" | "exiting" | "waiting";
type Slot = { text: string; state: SlotState; instant: boolean };

const softLightBorderVars = (thickness: string, gradient: string): CSSProperties =>
  ({
    "--slb-thickness": thickness,
    "--slb-gradient": gradient,
  }) as CSSProperties;

function slotStyle(state: SlotState): CSSProperties {
  if (state === "active") return { transform: "translateY(0px)", opacity: 1 };
  if (state === "exiting")
    return { transform: `translateY(-${PLACEHOLDER_LINE_HEIGHT}px)`, opacity: 0 };
  return { transform: `translateY(${PLACEHOLDER_LINE_HEIGHT}px)`, opacity: 0 }; // waiting (below, ready to enter)
}

function SearchPlaceholderCarousel({ visible }: { visible: boolean }) {
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
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSlots((prev) => {
              const next = [...prev];
              next[activeIdx] = { ...next[activeIdx], instant: false };
              return next;
            });
          });
        });
      }, 700);
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
      <div className="relative h-12 w-full overflow-hidden">
        {slots.map((slot, i) => (
          <span
            key={i}
            className={`absolute inset-0 flex h-12 items-center whitespace-nowrap text-lg font-semibold text-[#cfcfcf] ${
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
  const [loginOpen, setLoginOpen] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [order, setOrder] = useState<number[]>(() => kurs.map((_, i) => i));
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const cardStepRef = useRef(0);
  const offsetRef = useRef(0);
  const tickerPausedRef = useRef(false);
  const tickerHoveringRef = useRef(false);
  const tickerVisibleRef = useRef(true);

  useEffect(() => {
    setOrder(kurs.map((_, i) => i));
  }, [kurs]);

  // Pause the ticker animation loop while the widget is scrolled off-screen —
  // no point compositing an invisible marquee every frame.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        tickerVisibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "100px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      if (!tickerPausedRef.current && tickerVisibleRef.current && cardStepRef.current > 0) {
        // One full set = every card once. The track renders the set multiple times,
        // so wrapping the offset back by one set width is visually seamless — no
        // React re-order per card (that async reorder was the glitch source).
        const period = kurs.length * cardStepRef.current;
        offsetRef.current += 0.6;
        if (offsetRef.current >= period) {
          offsetRef.current -= period;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [kurs.length]);

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
    <div ref={rootRef} className="relative mx-auto h-[288px] w-[1280px]">
      {/* search + quick action */}
      <div className="absolute top-0 h-[184px] w-full">
        <div
          className="hero-search relative z-0 flex h-36 w-full items-start justify-center overflow-clip rounded-t-3xl p-5"
          style={{
            // Reactive glass fill: samples the live banner behind it (works across stacking
            // contexts), blurs it, then lightly boosts saturation/contrast so the fill picks
            // up whatever banner colors the content team ships.
            backdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
            WebkitBackdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
          }}
        >
          {/* Depth gradient (normal compositing) for text readability — light sheen at
              top, darker toward the quick-actions below. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(5,13,25,0.35) 100%)",
            }}
          />
          <div className="relative flex flex-1 items-center justify-center gap-6">
            <div className="flex items-center justify-center px-2">
              <p className="whitespace-nowrap text-xl font-semibold text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
                Ada yang bisa kami bantu?
              </p>
            </div>
            <div
              className="soft-light-border relative flex flex-1 items-center gap-2 rounded-[50px] p-2"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px) saturate(1.25) contrast(1.02)",
                WebkitBackdropFilter: "blur(12px) saturate(1.25) contrast(1.02)",
                ...softLightBorderVars("1px", "rgba(255,255,255,0.15)"),
              }}
            >
              <div className="relative flex h-12 min-w-0 flex-1 items-center">
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
          <div
            className="grid w-full items-stretch overflow-clip rounded-3xl bg-white transition-[grid-template-columns] duration-300 ease-in-out"
            style={{
              gridTemplateColumns: loginOpen
                ? "248px minmax(0,1fr) 104px 104px 104px 104px"
                : "1fr 0px 1fr 1fr 1fr 1fr",
            }}
          >
            {QUICK_ACTIONS.map((action, index) => {
              const isLogin = index === 0;
              const collapsed = loginOpen && !isLogin;
              return (
                <button
                  key={action.title}
                  onClick={() => {
                    if (isLogin) {
                      setLoginOpen((v) => !v);
                    } else if (loginOpen) {
                      setLoginOpen(false);
                    }
                  }}
                  className={`flex h-20 min-w-0 items-center justify-start gap-4 overflow-hidden px-4 py-5 transition-colors duration-300 ease-in-out ${
                    isLogin && loginOpen ? "bg-[#e6f3ff]" : "hover:bg-[#e6f3ff]"
                  } ${index === 0 ? "rounded-l-3xl" : ""} ${
                    index === QUICK_ACTIONS.length - 1 ? "rounded-r-3xl" : ""
                  }`}
                  style={{
                    gridColumn: index === 0 ? 1 : index + 2,
                    gridRow: 1,
                    outline: "1px solid #e9ecef",
                    outlineOffset: "-0.5px",
                  }}
                >
                  <div
                    className="flex items-center gap-4 transition-transform duration-300 ease-in-out"
                    style={{ transform: collapsed ? "translateX(16px)" : "translateX(0px)" }}
                  >
                    <img src={action.icon} alt="" className="size-10 shrink-0" />
                    <div
                      className={`flex min-w-0 flex-col items-start gap-1 overflow-hidden text-left whitespace-nowrap transition-[opacity,transform] duration-200 ease-in-out ${
                        collapsed ? "translate-x-3 opacity-0" : "translate-x-0 opacity-100"
                      }`}
                    >
                      <p
                        className={`text-base font-bold ${
                          isLogin && loginOpen ? "text-[#00213d]" : "text-[#26292c]"
                        }`}
                      >
                        {action.title}
                      </p>
                      <p
                        className={`text-sm font-normal ${
                          isLogin && loginOpen ? "text-[#00213d]" : "text-[#495057]"
                        }`}
                      >
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            <div
              className={`flex h-20 min-w-0 items-center gap-3 overflow-hidden px-3 transition-[clip-path,opacity] duration-300 ease-in-out ${
                loginOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
              }`}
              style={{
                gridColumn: 2,
                gridRow: 1,
                clipPath: loginOpen ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              }}
            >
              <button className="flex h-16 flex-1 shrink-0 items-center justify-center gap-4 rounded-xl border border-[#e9ecef] bg-white px-4 transition-colors hover:bg-[#f7f9fa]">
                <img src="/assets/quick-action/mybca-logo.svg" alt="" className="size-12 shrink-0" />
                <span className="text-md font-semibold whitespace-nowrap text-[#26292c]">
                  Login ke myBCA
                </span>
              </button>
              <button className="flex h-16 flex-1 shrink-0 items-center justify-center gap-4 rounded-xl border border-[#e9ecef] bg-white px-4 transition-colors hover:bg-[#f7f9fa]">
                <img
                  src="/assets/quick-action/klikbca-logo.png"
                  alt=""
                  className="h-11 w-auto shrink-0 object-contain"
                />
                <span className="text-md font-semibold whitespace-nowrap text-[#26292c]">
                  Login ke KlikBCA
                </span>
              </button>
              <button
                onClick={() => setLoginOpen(false)}
                aria-label="Tutup"
                className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
              >
                <img src="/assets/cycle1/outline-close.svg" alt="" className="size-6" />
              </button>
            </div>
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
            {[...order, ...order, ...order].map((idx, i) => {
              const entry = kurs[idx];
              return (
                <div
                  key={`${entry.code}-${i}`}
                  ref={i === 0 ? firstCardRef : undefined}
                  className="flex h-14 shrink-0 items-center gap-4 rounded-xl border border-[#017CBD] bg-black/10 p-4"
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