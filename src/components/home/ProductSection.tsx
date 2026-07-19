"use client";

import { useEffect, useRef, useState } from "react";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "./product-data";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useIsLive } from "@/lib/useIsLive";

const AUTO_ADVANCE_MS = 6000;
const RING_RADIUS = 13;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Category swaps animate the card *contents* only — the cards themselves keep
 * their current size/position, so the accordion layout never jumps.
 *
 * The photos swap as two stacked layers: the incoming set is mounted underneath
 * and already in place, and the outgoing set slides off the top of it, picking
 * up a motion blur as it goes. Nothing is ever faded and no gap opens, so the
 * card's own background is never seen. The two layers travel at different
 * speeds — the outgoing clears a full card width while the incoming only drifts
 * in from a fraction of it — which is what gives the swipe its parallax.
 *
 * Both legs are CSS animations rather than transitions: a transition into an
 * off-side start value needs a paint in between to latch it, and
 * requestAnimationFrame is throttled to a standstill whenever the tab isn't
 * painting, which would strand the photos mid-slide.
 */
const SWAP_MS = 640;
/** Per-card offset, so the three cards swipe as a staggered wave. */
const SWAP_STAGGER_MS = 70;
/** Copy is a single block (it drives the panel's height), so it dips out and
 *  back rather than cross-fading; the text itself is swapped at the trough. */
const COPY_SWAP_MS = 200;

/**
 * `alt` alternates per swap so consecutive swaps land on a different animation
 * name and therefore restart rather than being ignored as unchanged.
 */
function swapStyles(swapping: boolean, dir: number, stagger: number, alt: boolean) {
  // No swap in flight: leave the cards to their entrance/hover choreography.
  if (!swapping) return { incoming: {}, outgoing: {}, copy: {} };
  const suffix = alt ? "a" : "b";
  return {
    incoming: {
      "--photo-from": `${dir * 28}%`,
      animation: `product-photo-in-${suffix} ${SWAP_MS}ms cubic-bezier(0.65,0,0.35,1) ${stagger}ms both`,
    } as React.CSSProperties,
    outgoing: {
      "--photo-to": `${-dir * 100}%`,
      animation: `product-photo-out-${suffix} ${SWAP_MS}ms cubic-bezier(0.65,0,0.35,1) ${stagger}ms both`,
    } as React.CSSProperties,
    copy: {
      animation: `product-copy-swap-${suffix} ${SWAP_MS}ms ease-in-out ${stagger}ms both`,
    } as React.CSSProperties,
  };
}

/**
 * One product's photo, full-bleed. `hoverZoom` is the desktop card's slow push
 * in on hover; the mobile card has no hover state to drive it.
 */
function PhotoLayer({
  product,
  style,
  hoverZoom = false,
}: {
  product: Product;
  style: React.CSSProperties;
  hoverZoom?: boolean;
}) {
  return (
    <div className="absolute inset-0" style={style}>
      <img loading="lazy" decoding="async"
        src={product.image}
        alt=""
        className={`absolute inset-0 size-full object-cover ${
          hoverZoom
            ? "scale-100 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            : ""
        }`}
      />
    </div>
  );
}

function ProductCard({
  product,
  outgoing,
  copy,
  active,
  onSelect,
  progressRef,
  entered,
  enterDelayMs,
  swap,
}: {
  product: Product;
  /** The photos being swiped away, drawn over `product` for the swap only. */
  outgoing: Product | null;
  /** Title/subtitle, which lag the photos by half the swap. */
  copy: Product;
  active: boolean;
  onSelect: () => void;
  progressRef: React.Ref<SVGCircleElement> | undefined;
  entered: boolean;
  enterDelayMs: number;
  swap: ReturnType<typeof swapStyles>;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: -1000, y: -1000 });

  // Writes the follow-cursor badge to wherever the pointer currently is,
  // measured against the card's live box.
  const positionCursor = () => {
    if (!cardRef.current || !cursorRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const { x: clientX, y: clientY } = lastMouseRef.current;
    cursorRef.current.style.transform = `translate3d(${clientX - rect.left - 56}px, ${
      clientY - rect.top - 56
    }px, 0)`;
  };

  const handleCardClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    positionCursor();
    // A click means the pointer is over this card, so the badge should be up the
    // moment it becomes active — without waiting for the next mouse move.
    setIsHovered(true);
    onSelect();
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  // The badge has to track two independent movements: the pointer, and the card
  // itself (its flex-basis animates for 500ms on select, and it shifts on
  // scroll) — so a per-frame re-measure is the only thing that stays glued.
  //
  // Crucially this runs *only while the badge is actually on screen*. It used to
  // run unconditionally for every active card, which meant a permanent 60fps
  // loop doing a layout-forcing getBoundingClientRect on every device — mobile
  // included, where these cards are `display:none` and the badge can never show.
  useEffect(() => {
    if (!active || !isHovered) return;

    let frameId = 0;
    const loop = () => {
      positionCursor();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    // Pointer position still has to be tracked at the window level: the badge is
    // offset from the card's origin, so we need coordinates even when the
    // pointer is over a child element.
    const onWindowMouseMove = (e: MouseEvent) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onWindowMouseMove);
    };
  }, [active, isHovered]);

  return (
    <button
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleCardMouseMove}
      onMouseEnter={() => setIsHovered(true)}
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
        {/* Each layer carries the category-swap slide, so it composes with the
            active/inactive shift on the wrapper above and the hover zooms
            inside. The outgoing set sits on top and clears the card, revealing
            the incoming set that is already in place beneath it. */}
        <PhotoLayer product={product} style={swap.incoming} hoverZoom />
        {outgoing && <PhotoLayer product={outgoing} style={swap.outgoing} />}
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
          backdropFilter: "blur(16px) saturate(1.25)",
          WebkitBackdropFilter: "blur(16px) saturate(1.25)",
          isolation: "isolate",
        }}
      >
        <div className="w-full" style={swap.copy}>
        <p className="w-full text-xl font-semibold leading-7 tracking-[-0.4px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
          {copy.title}
        </p>
        <div
          className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <p className="w-full pt-2 text-base leading-6 text-white/80">
              {copy.subtitle}
            </p>
            <div className="flex items-center gap-0.5 pt-8 text-base font-semibold text-blue-100 md:hidden">
              Pelajari
              <img loading="lazy" decoding="async"
                src="/assets/cycle1/pelajari-icon.svg"
                alt=""
                className="size-5 transition-transform group-hover:translate-x-1"
              />
            </div>
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
          />
        </svg>
      </div>

      <div
        ref={cursorRef}
        // `fade-overlay` (not a bare `opacity-0`) is what keeps this cheap: an
        // element parked at opacity 0 is still painted and composited, so the
        // backdrop-filter below was re-blurring a 112px disc every frame, on
        // every card, while invisible. `visibility: hidden` drops it out of
        // paint entirely. See the .fade-overlay note in globals.css.
        className="fade-overlay pointer-events-none absolute left-0 top-0 z-30 flex size-28 items-center justify-center rounded-full border border-white/25 bg-white/[0.01] text-sm font-semibold text-white shadow-lg backdrop-blur-md"
        data-shown={active && isHovered ? "true" : "false"}
        style={{
          "--fade-ms": "200ms",
          isolation: "isolate",
        } as React.CSSProperties}
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
  outgoing,
  copy,
  active,
  onSelect,
  swap,
}: {
  product: Product;
  outgoing: Product | null;
  copy: Product;
  active: boolean;
  onSelect: () => void;
  swap: ReturnType<typeof swapStyles>;
}) {
  return (
    <button
      onClick={onSelect}
      className="relative shrink-0 snap-center overflow-clip rounded-3xl bg-white text-left transition-[height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ width: 280, height: active ? 360 : 328 }}
    >
      <PhotoLayer product={product} style={swap.incoming} />
      {outgoing && <PhotoLayer product={outgoing} style={swap.outgoing} />}

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
        <div className="w-full" style={swap.copy}>
        <p className="w-full text-lg font-semibold leading-[26px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
          {copy.title}
        </p>
        <div
          className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <p className="w-full pt-1 text-sm leading-5 text-white/80">{copy.subtitle}</p>
            <div className="flex items-center gap-0.5 pt-6 text-sm font-semibold text-blue-100">
              Pelajari
              <img loading="lazy" decoding="async" src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5" />
            </div>
          </div>
        </div>
        </div>
      </div>
    </button>
  );
}

/**
 * `categories` and `defaultKey` come from Supabase via `getProductCategories()`
 * on the server; the bundled defaults keep the section working if this is ever
 * rendered without them.
 */
export default function ProductSection({
  categories = PRODUCT_CATEGORIES,
  defaultKey = "Kartu Kredit",
}: {
  categories?: ProductCategory[];
  defaultKey?: string;
} = {}) {
  const [activeCategory, setActiveCategory] = useState(defaultKey);
  // The photos being swiped away. Present only for the length of a swap; the
  // incoming set renders from `activeCategory` underneath from the first frame.
  const [outgoingCategory, setOutgoingCategory] = useState<string | null>(null);
  // The copy lags to the trough of its own dip, so the words change while
  // they're invisible rather than mid-slide.
  const [copyCategory, setCopyCategory] = useState(defaultKey);
  const [swapDir, setSwapDir] = useState(1);
  // Flips every swap so the animations get a fresh name and replay.
  const [swapAlt, setSwapAlt] = useState(false);
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const pausedRef = useRef(false);
  const progressRef = useRef<SVGCircleElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  // Parks the autoplay timer while the section is off-screen or the tab is hidden.
  const live = useIsLive(sectionRef);
  const cloveARef = useRef<HTMLImageElement>(null);
  const cloveBRef = useRef<HTMLImageElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  // Mirrors activeIndex for the scroll listener (which is bound once), and a
  // flag so a swipe-driven index change doesn't bounce back through the
  // centering effect below.
  const activeIndexRef = useRef(0);
  const skipCenterRef = useRef(false);
  activeIndexRef.current = activeIndex;

  const categoryOf = (key: string) =>
    categories.find((c) => c.key === key) ?? categories[0];
  const category = categoryOf(activeCategory);
  const products = category.products;
  const outgoingProducts = outgoingCategory ? categoryOf(outgoingCategory).products : null;
  const copyProducts = categoryOf(copyCategory).products;
  const swapping = outgoingCategory !== null;

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
    // Plays once, like the page-wide ScrollReveal controller — scrolling back
    // over the section keeps the cards where the entrance left them.
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
    live,
    onAdvance: () => setActiveIndex((i) => (i + 1) % products.length),
  });

  // Starts a swap: the old photos are kept around to slide away over the new
  // ones. The direction follows the category list order, so moving down the
  // list swipes left and moving up swipes right.
  const selectCategory = (key: string) => {
    if (key === activeCategory) return;
    const from = categories.findIndex((c) => c.key === activeCategory);
    const to = categories.findIndex((c) => c.key === key);
    setSwapDir(to > from ? 1 : -1);
    setOutgoingCategory(activeCategory);
    setSwapAlt((a) => !a);
    setActiveCategory(key);
    setActiveIndex(0);
  };

  // Retire the outgoing layer once it has cleared, and change the words at the
  // point where the copy's dip bottoms out.
  useEffect(() => {
    if (!swapping) return;
    const copyTimer = setTimeout(() => setCopyCategory(activeCategory), COPY_SWAP_MS);
    const endTimer = setTimeout(
      () => setOutgoingCategory(null),
      SWAP_MS + SWAP_STAGGER_MS * 2
    );
    return () => {
      clearTimeout(copyTimer);
      clearTimeout(endTimer);
    };
  }, [swapping, activeCategory]);

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
      className="relative isolate bg-gradient-to-b from-blue-100 to-cyan-100 pb-20 pt-0 xl:pb-36 xl:pt-8"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-visible">
        <img loading="lazy" decoding="async"
          ref={cloveARef}
          src="/assets/product/bg-clove-a.svg"
          alt=""
          className="absolute left-[calc(50%-937px)] top-[-400px] h-[1614px] w-[1178px] opacity-80 will-change-transform"
        />
        <img loading="lazy" decoding="async"
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
            <p className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-blue-500 xl:text-sm xl:leading-[14px] xl:tracking-[2.1px] xl:text-blue-800">
              Produk &amp; Layanan
            </p>
          </div>
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-blue-700 xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
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
          {categories.map((cat) => {
            const isActive = cat.key === activeCategory;
            return (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={`flex h-12 items-center justify-center rounded-xl border px-[18px] text-sm transition-colors duration-200 ${
                  isActive
                    ? "border-cyan-500 bg-cyan-100 font-bold text-blue-500"
                    : "border-neutral-300 bg-white font-semibold text-neutral-700 active:bg-blue-100"
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
            className={`hidden shrink-0 flex-col items-start gap-8 py-4 text-blue-500 transition-all duration-700 ease-out xl:flex xl:w-[240px] ${
              entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: entered ? "150ms" : "0ms" }}
          >
            {categories.map((cat) => {
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
                  outgoing={outgoingProducts?.[i] ?? null}
                  copy={copyProducts[i]}
                  active={i === activeIndex}
                  onSelect={() => setActiveIndex(i)}
                  progressRef={i === activeIndex ? progressRef : undefined}
                  entered={entered}
                  enterDelayMs={250 + i * 120}
                  swap={swapStyles(swapping, swapDir, i * SWAP_STAGGER_MS, swapAlt)}
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
                  outgoing={outgoingProducts?.[i] ?? null}
                  copy={copyProducts[i]}
                  active={i === activeIndex}
                  onSelect={() => setActiveIndex(i)}
                  swap={swapStyles(swapping, swapDir, i * SWAP_STAGGER_MS, swapAlt)}
                />
              ))}
            </div>

            <button
              className={`mt-6 flex h-10 items-center justify-center gap-1 rounded-full border border-blue-500 px-5 transition-colors duration-200 hover:bg-blue-500/5 xl:mt-10 xl:h-12 xl:px-6 ${
                entered ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transition: `opacity 700ms ease-out ${entered ? "610ms" : "0ms"}, background-color 200ms`,
              }}
            >
              <span className="text-sm font-semibold text-blue-500 xl:text-base">{category.ctaLabel}</span>
              {/* The asset hardcodes a near-white fill, which is right for the
                  "Pelajari" links on photo cards but wrong here — this CTA is
                  blue-on-white. Drawn as a mask so the shape stays one shared
                  asset and the color comes from the same token as the label. */}
              <span
                aria-hidden
                className="size-5 shrink-0 bg-blue-500"
                style={{
                  maskImage: "url(/assets/cycle1/pelajari-icon.svg)",
                  WebkitMaskImage: "url(/assets/cycle1/pelajari-icon.svg)",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}