"use client";

import { useEffect, useRef, useState } from "react";
import { PRODUCT_CATEGORIES, type Product } from "./product-data";

const AUTO_ADVANCE_MS = 6000;
const TICK_MS = 50;
const RING_RADIUS = 13;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProductCard({
  product,
  active,
  onSelect,
  progressRef,
  entered,
  enterDelayMs,
}: {
  product: Product;
  active: boolean;
  onSelect: () => void;
  progressRef: React.Ref<SVGCircleElement>;
  entered: boolean;
  enterDelayMs: number;
}) {
  return (
    <button
      onClick={onSelect}
      className="group relative h-[400px] shrink-0 grow-0 overflow-clip rounded-3xl bg-white text-left"
      style={{
        flexBasis: active ? 566 : 200,
        // First-view entrance: the card "grows" into view left-to-right via a
        // clip-path wipe, staggered per card. Runs once; afterward only
        // flex-basis (expand/collapse) keeps transitioning.
        clipPath: entered ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
        transition: `flex-basis 500ms cubic-bezier(0.4,0,0.2,1), clip-path 700ms cubic-bezier(0.16,1,0.3,1) ${enterDelayMs}ms`,
      }}
    >
      {/* fixed-size photo — translateX (GPU) shifts it right when collapsed so the
          subject stays framed; the img scales on hover independently. */}
      <div
        className="absolute inset-y-0 right-0 w-[566px] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: active ? "translateX(0)" : "translateX(96px)" }}
      >
        <img
          src={product.image}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* overlay gradient (CSS, not an image) — blue when active, dark when collapsed */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-60 transition-[height] duration-300 ease-out group-hover:h-72"
        style={{
          background: active
            ? "linear-gradient(to top, #005caa 0%, rgba(0,181,240,0) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(18,20,23,0) 100%)",
        }}
      />

      {/* glass content box — width animates via px (not layout-thrashing auto) */}
      <div
        className="absolute bottom-2 left-2 flex flex-col items-start overflow-clip rounded-2xl border border-white/75 bg-black/30 px-5 pb-6 pt-4 backdrop-blur-[10px] transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: active ? 280 : 184 }}
      >
        <p className="w-full text-xl font-semibold leading-7 tracking-[-0.4px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
          {product.title}
        </p>
        {/* subtitle + CTA reveal — grid-rows 0fr↔1fr animates height smoothly */}
        <div
          className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <p className="w-full pt-2 text-base leading-6 text-white/80">
              {product.subtitle}
            </p>
            <div className="flex items-center gap-0.5 pt-8 text-base font-semibold text-[#f4f8fc]">
              Pelajari
              <img
                src="/assets/cycle1/pelajari-icon.svg"
                alt=""
                className="size-5 transition-transform group-hover:translate-x-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* auto-advance timer ring (active card only) */}
      <div
        className={`absolute bottom-6 right-6 transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg viewBox="0 0 32 32" className="size-8 -rotate-90">
          <circle cx="16" cy="16" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <circle
            ref={progressRef}
            cx="16"
            cy="16"
            r={RING_RADIUS}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE}
            style={{ transition: "stroke-dashoffset 50ms linear" }}
          />
        </svg>
      </div>
    </button>
  );
}

export default function ProductSection() {
  const [activeCategory, setActiveCategory] = useState("Kartu Kredit");
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const progressRef = useRef<SVGCircleElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const category =
    PRODUCT_CATEGORIES.find((c) => c.key === activeCategory) ?? PRODUCT_CATEGORIES[0];
  const products = category.products;

  // First-view entrance: reveal once when the section scrolls into view, then stop watching.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance the expanded card, timer ring written straight to the SVG via a ref.
  useEffect(() => {
    elapsedRef.current = 0;
    if (progressRef.current) {
      progressRef.current.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
    }
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      elapsedRef.current += TICK_MS;
      const pct = Math.min(1, elapsedRef.current / AUTO_ADVANCE_MS);
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - pct));
      }
      if (pct >= 1) {
        setActiveIndex((i) => (i + 1) % products.length);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [activeIndex, products.length]);

  const selectCategory = (key: string) => {
    setActiveCategory(key);
    setActiveIndex(0);
  };

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-b from-[#f4f8fc] to-[#e6f3ff] pb-40 pt-8">
      {/* bg pattern — decorative, bleeds upward into the area above the section */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-visible">
        <img
          src="/assets/product/bg-clove-a.svg"
          alt=""
          className="absolute left-[calc(50%-937px)] top-[-400px] h-[1614px] w-[1178px] -translate-x-1/2 opacity-80"
        />
        <img
          src="/assets/product/bg-clove-b.svg"
          alt=""
          className="absolute left-[calc(50%+667px)] top-[-96px] h-[1668px] w-[1218px] -translate-x-1/2 opacity-80"
        />
      </div>

      <div className="relative z-10 mx-auto w-[1280px]">
        {/* title — fades up first */}
        <div
          className={`flex gap-10 transition-all duration-700 ease-out ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex w-[240px] shrink-0 items-center py-4">
            <p className="text-sm font-semibold uppercase leading-[14px] tracking-[2.1px] text-[#00213d]">
              Produk &amp; Layanan
            </p>
          </div>
          <h2 className="w-[560px] text-[32px] font-semibold leading-10 tracking-[-0.64px] text-[#00335e]">
            Solusi BCA untuk Setiap Tujuan Keuangan Anda
          </h2>
        </div>

        {/* switcher + showcase */}
        <div className="mt-16 flex gap-10">
          <div
            className={`flex w-[240px] shrink-0 flex-col items-start gap-8 py-4 text-[#005caa] transition-all duration-700 ease-out ${
              entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: entered ? "150ms" : "0ms" }}
          >
            {PRODUCT_CATEGORIES.map((cat) => {
              const isActive = cat.key === activeCategory;
              const dim = !isActive && hoverCategory !== cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => selectCategory(cat.key)}
                  onMouseEnter={() => setHoverCategory(cat.key)}
                  onMouseLeave={() => setHoverCategory(null)}
                  className={`text-left tracking-[-0.48px] transition-all duration-200 ${
                    isActive
                      ? "text-[32px] font-bold leading-10 tracking-[-0.64px]"
                      : "text-2xl font-semibold leading-8"
                  } ${dim ? "opacity-50" : "opacity-100"}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div
            className="w-[998px]"
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
          >
            <div className="flex gap-4">
              {products.map((product, i) => (
                // Keyed by position (not title) so the cards persist across category
                // switches — that lets flex-basis animate the expand/collapse while the
                // content swaps, instead of remounting into the final state instantly.
                <ProductCard
                  key={i}
                  product={product}
                  active={i === activeIndex}
                  onSelect={() => setActiveIndex(i)}
                  progressRef={i === activeIndex ? progressRef : undefined}
                  entered={entered}
                  enterDelayMs={250 + i * 120}
                />
              ))}
            </div>

            <button
              className={`mt-10 flex h-12 items-center justify-center gap-1 rounded-full border border-[#005caa] px-6 transition-colors duration-200 hover:bg-[#005caa]/5 ${
                entered ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transition: `opacity 700ms ease-out ${entered ? "610ms" : "0ms"}, background-color 200ms`,
              }}
            >
              <span className="text-base font-semibold text-[#005caa]">{category.ctaLabel}</span>
              <img src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
