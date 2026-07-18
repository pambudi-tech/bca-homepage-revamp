"use client";

import { useEffect, useRef, useState } from "react";
import { PRODUCT_CATEGORIES, type Product } from "./product-data";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";

const AUTO_ADVANCE_MS = 6000;
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
  progressRef: React.Ref<SVGCircleElement> | undefined;
  entered: boolean;
  enterDelayMs: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: -1000, y: -1000 });

  const updateCursor = () => {
    if (!active || !cardRef.current || !cursorRef.current) {
      setIsHovered(false);
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const { x: clientX, y: clientY } = lastMouseRef.current;

    const isInside =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    setIsHovered((prev) => (prev !== isInside ? isInside : prev));

    if (isInside) {
      const x = clientX - rect.left - 56;
      const y = clientY - rect.top - 56;
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    updateCursor();
    onSelect();
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    if (!active) {
      setIsHovered(false);
      return;
    }

    let frameId: number;
    const loop = () => {
      updateCursor();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    const onWindowMouseMove = (e: MouseEvent) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onWindowMouseMove);
    };
  }, [active]);

  return (
    <button
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleCardMouseMove}
      onMouseEnter={() => active && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative h-[400px] shrink-0 grow-0 overflow-clip rounded-3xl bg-white text-left ${
        active ? "cursor-none" : "cursor-pointer"
      }`}
      style={{
        flexBasis: active ? 566 : 200,
        clipPath: entered ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
        transition: `flex-basis 500ms cubic-bezier(0.4,0,0.2,1), clip-path 700ms cubic-bezier(0.16,1,0.3,1) ${enterDelayMs}ms`,
      }}
    >
      <div
        className="absolute inset-y-0 right-0 w-[566px] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: active ? "translateX(0)" : "translateX(96px)" }}
      >
        {/* Background scene — zooms 1.02x -> 1x on hover */}
        <img
          src={product.imageBg}
          alt=""
          className="absolute inset-0 size-full scale-[1.02] object-cover transition-transform duration-500 ease-out group-hover:scale-100"
        />
        {/* Subject cutout on top — zooms 1x -> 1.02x on hover (inverse of bg) */}
        <img
          src={product.image}
          alt=""
          className="absolute inset-0 size-full scale-100 object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-60 transition-[height] duration-300 ease-out group-hover:h-72"
        style={{
          background: active
            ? "linear-gradient(to top, #005caa 0%, rgba(0,181,240,0) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(18,20,23,0) 100%)",
        }}
      />

      <div
        className="hero-search absolute bottom-2 left-2 flex flex-col items-start overflow-clip rounded-2xl px-5 pb-6 pt-4 transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: active ? 280 : 184,
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
          WebkitBackdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
          isolation: "isolate",
        }}
      >
        <p className="w-full text-xl font-semibold leading-7 tracking-[-0.4px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
          {product.title}
        </p>
        <div
          className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <p className="w-full pt-2 text-base leading-6 text-white/80">
              {product.subtitle}
            </p>
            <div className="flex items-center gap-0.5 pt-8 text-base font-semibold text-[#f4f8fc] md:hidden">
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

      <div
        ref={cursorRef}
        className={`pointer-events-none absolute left-0 top-0 z-30 flex size-28 items-center justify-center rounded-full border border-white/25 bg-white/[0.01] text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-opacity duration-200 ${
          active && isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          isolation: "isolate",
        }}
      >
        Pelajari
      </div>
    </button>
  );
}

/**
 * Mobile card for the horizontally-scrollable carousel (< xl). Unlike the
 * desktop card (which expands its *width* on select), every mobile card is a
 * fixed 280px wide — the active one grows *taller* (328 -> 360) and reveals its
 * subtitle + "Pelajari" CTA. No cursor-follow treatment on touch.
 */
function MobileProductCard({
  product,
  active,
  onSelect,
}: {
  product: Product;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="relative shrink-0 snap-center overflow-clip rounded-3xl bg-white text-left transition-[height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ width: 280, height: active ? 360 : 328 }}
    >
      {/* Background scene + subject cutout (both full-bleed, centered). */}
      <div className="absolute inset-0">
        <img src={product.imageBg} alt="" className="absolute inset-0 size-full object-cover" />
        <img src={product.image} alt="" className="absolute inset-0 size-full object-cover" />
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: active
            ? "linear-gradient(to top, #005caa 0%, rgba(0,33,61,0) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(18,20,23,0) 100%)",
        }}
      />

      <div
        className="hero-search absolute inset-x-2 bottom-2 flex flex-col items-start overflow-clip rounded-2xl px-4 pb-5 pt-4"
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px) saturate(1.2)",
          WebkitBackdropFilter: "blur(10px) saturate(1.2)",
          isolation: "isolate",
        }}
      >
        <p className="w-full text-lg font-semibold leading-[26px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
          {product.title}
        </p>
        <div
          className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <p className="w-full pt-1 text-sm leading-5 text-white/80">{product.subtitle}</p>
            <div className="flex items-center gap-0.5 pt-6 text-sm font-semibold text-[#f4f8fc]">
              Pelajari
              <img src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function ProductSection() {
  const [activeCategory, setActiveCategory] = useState("Kartu Kredit");
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const pausedRef = useRef(false);
  const progressRef = useRef<SVGCircleElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cloveARef = useRef<HTMLImageElement>(null);
  const cloveBRef = useRef<HTMLImageElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  // Mirrors activeIndex for the scroll listener (which is bound once), and a
  // flag so a swipe-driven index change doesn't bounce back through the
  // centering effect below.
  const activeIndexRef = useRef(0);
  const skipCenterRef = useRef(false);
  activeIndexRef.current = activeIndex;

  const category =
    PRODUCT_CATEGORIES.find((c) => c.key === activeCategory) ?? PRODUCT_CATEGORIES[0];
  const products = category.products;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rectTop = section.getBoundingClientRect().top;
      if (cloveARef.current) {
        cloveARef.current.style.transform = `translate3d(-50%, ${rectTop * 0.12}px, 0)`;
      }
      if (cloveBRef.current) {
        cloveBRef.current.style.transform = `translate3d(-50%, ${rectTop * 0.2}px, 0)`;
      }
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

  useAutoplayProgress({
    activeIndex,
    count: products.length,
    durationMs: AUTO_ADVANCE_MS,
    circumference: RING_CIRCUMFERENCE,
    progressRef,
    pausedRef,
    onAdvance: () => setActiveIndex((i) => (i + 1) % products.length),
  });

  const selectCategory = (key: string) => {
    setActiveCategory(key);
    setActiveIndex(0);
  };

  // Keep the active card centered in the mobile carousel whenever it changes
  // (via tap or autoplay). A no-op on desktop, where the container is
  // `display:none` and reports zero width.
  useEffect(() => {
    if (skipCenterRef.current) {
      skipCenterRef.current = false;
      return;
    }
    const container = mobileScrollRef.current;
    if (!container) return;
    const card = container.children[activeIndex] as HTMLElement | undefined;
    if (!card) return;
    const target = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeIndex, activeCategory]);

  // Swiping the mobile carousel activates whichever card sits closest to the
  // centre, so the active state follows the gesture instead of only taps.
  useEffect(() => {
    const container = mobileScrollRef.current;
    if (!container) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const centre = container.scrollLeft + container.clientWidth / 2;
      let nearest = 0;
      let bestDistance = Infinity;
      for (let i = 0; i < container.children.length; i++) {
        const card = container.children[i] as HTMLElement;
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
        if (distance < bestDistance) {
          bestDistance = distance;
          nearest = i;
        }
      }
      if (nearest !== activeIndexRef.current) {
        activeIndexRef.current = nearest;
        skipCenterRef.current = true;
        setActiveIndex(nearest);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate bg-gradient-to-b from-[#f4f8fc] to-[#e6f3ff] pb-36 pt-8"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-visible">
        <img
          ref={cloveARef}
          src="/assets/product/bg-clove-a.svg"
          alt=""
          className="absolute left-[calc(50%-937px)] top-[-400px] h-[1614px] w-[1178px] opacity-80 will-change-transform"
        />
        <img
          ref={cloveBRef}
          src="/assets/product/bg-clove-b.svg"
          alt=""
          className="absolute left-[calc(50%+667px)] top-[-96px] h-[1668px] w-[1218px] opacity-80 will-change-transform"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        {/* Heading — stacked on mobile, eyebrow-column + h2 side by side on desktop. */}
        <div
          className={`flex flex-col transition-all duration-700 ease-out xl:flex-row xl:gap-10 ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center py-4 xl:w-[240px] xl:shrink-0">
            <p className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-[#005caa] xl:text-sm xl:leading-[14px] xl:tracking-[2.1px] xl:text-[#00213d]">
              Produk &amp; Layanan
            </p>
          </div>
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-[#00335e] xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
            Solusi BCA untuk Setiap Tujuan Keuangan Anda
          </h2>
        </div>

        {/* Category chips — mobile only; the desktop uses the vertical text list. */}
        <div
          className={`mt-5 flex flex-wrap gap-2 transition-all duration-700 ease-out xl:hidden ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: entered ? "120ms" : "0ms" }}
        >
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = cat.key === activeCategory;
            return (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={`flex h-12 items-center justify-center rounded-xl border px-[18px] text-sm transition-colors duration-200 ${
                  isActive
                    ? "border-[#00b5f0] bg-[#e6f3ff] font-bold text-[#005caa]"
                    : "border-[#e9ecef] bg-white font-semibold text-[#495057] active:bg-[#f4f8fc]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex xl:mt-16 xl:gap-10">
          {/* Desktop category list. */}
          <div
            className={`hidden shrink-0 flex-col items-start gap-8 py-4 text-[#005caa] transition-all duration-700 ease-out xl:flex xl:w-[240px] ${
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
            className="w-full xl:w-[998px]"
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
          >
            {/* Desktop accordion cards — active card expands its width. */}
            <div className="hidden gap-4 xl:flex">
              {products.map((product, i) => (
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

            {/* Mobile carousel — fixed-width cards, active one grows taller and
                reveals its subtitle + CTA. Full-bleeds within the padded column.
                The track height is pinned to the tallest (active) card so the
                CTA below never shifts while cards swap size. */}
            <div
              ref={mobileScrollRef}
              onTouchStart={() => (pausedRef.current = true)}
              className={`hide-scrollbar -mx-4 flex h-[360px] snap-x snap-mandatory items-center gap-4 overflow-x-auto px-4 [scrollbar-width:none] transition-opacity duration-700 ease-out xl:hidden ${
                entered ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: entered ? "250ms" : "0ms" }}
            >
              {products.map((product, i) => (
                <MobileProductCard
                  key={i}
                  product={product}
                  active={i === activeIndex}
                  onSelect={() => setActiveIndex(i)}
                />
              ))}
            </div>

            <button
              className={`mt-6 flex h-10 items-center justify-center gap-1 rounded-full border border-[#005caa] px-5 transition-colors duration-200 hover:bg-[#005caa]/5 xl:mt-10 xl:h-12 xl:px-6 ${
                entered ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transition: `opacity 700ms ease-out ${entered ? "610ms" : "0ms"}, background-color 200ms`,
              }}
            >
              <span className="text-sm font-semibold text-[#005caa] xl:text-base">{category.ctaLabel}</span>
              <img src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}