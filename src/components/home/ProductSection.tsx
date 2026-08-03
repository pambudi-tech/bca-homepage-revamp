"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  PRODUCT_CATEGORIES,
  SAMPLE_CATEGORY_PHOTOS,
  type Product,
  type ProductCategory,
} from "./product-data";
// FlutedGlassOverlay is paused (not deleted) — laggy on Safari, see the
// commented-out usage below. Bring this import back when it's re-enabled.
// import FlutedGlassOverlay from "./FlutedGlassOverlay";
import { useAutoplayProgress } from "@/lib/useAutoplayProgress";
import { useIsLive } from "@/lib/useIsLive";

/** Layout variants this section supports (only "accordion" is switcher-exposed; see `variant` below). */
const PRODUCT_VARIANTS = ["accordion", "curved"] as const;
type ProductVariant = (typeof PRODUCT_VARIANTS)[number];

const AUTO_ADVANCE_MS = 6000;
const RING_RADIUS = 13;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Blanket scale applied to every glass badge, on top of each category's own
 *  `scale` tweak below. */
const GLASS_ICON_SCALE = 1.1;

/**
 * Glass-badge icon shown on a collapsed accordion card, keyed by category.
 * Every category now has an asset.
 *
 * `offsetX`/`offsetY`/`scale` are one-off nudges per category while the
 * assets are still being fitted by eye — not derived from anything, just
 * tweaked until each badge sits right against its own art. Remove once the
 * badges settle.
 */
const CATEGORY_GLASS_ICONS: Record<
  string,
  {
    src: string;
    offsetX?: number;
    offsetY?: number;
    scale?: number;
    mirrorX?: boolean;
    rotate?: number;
  }
> = {
  Simpanan: {
    src: "/assets/product/simpanan-glass.webp",
    offsetX: -40 + 24 + 64,
    mirrorX: true,
  },
  "Kartu Kredit": {
    src: "/assets/product/kartu-kredit-glass.webp",
    offsetX: 24,
  },
  Pinjaman: {
    src: "/assets/product/pinjaman-glass.webp",
    offsetX: -16 + 32 - 16,
    offsetY: 24 - 8 + 8,
    scale: 1.1 * 1.1,
  },
  "e-Banking": {
    src: "/assets/product/ebanking-glass.webp",
    offsetX: 12 - 4 + 16 + 16,
  },
  Asuransi: {
    src: "/assets/product/asuransi-glass.webp",
    offsetX: -24,
    offsetY: 16,
    scale: 0.9,
  },
  Investasi: { src: "/assets/product/investasi-glass.webp", offsetX: 8 },
  "Wealth Management": {
    src: "/assets/product/investasi-glass.webp",
    offsetX: 8 + 12,
    mirrorX: true,
  },
  Transaksi: {
    src: "/assets/product/transaksi-glass.webp",
    offsetX: 32,
    rotate: 90,
  },
  "Reward BCA": { src: "/assets/product/reward-glass.webp" },
};

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
/** Copies of the opposite end rendered on each side of the mobile carousel's
 *  card list, so swiping past the last (or before the first) card keeps
 *  sliding into more cards. See MobileProductCarousel. */
const MOBILE_LOOP_CLONES = 2;

/**
 * True at the `xl` breakpoint (1280px+), where the desktop layouts render.
 * SSR-safe: starts false so server and first client render agree, then matches
 * after mount. The accordion uses it to know whether it's showing the category
 * cards (desktop) or the product carousel (mobile) — the two drive autoplay
 * differently, and CSS `display:none` alone can't tell the timer which is live.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}

/**
 * `alt` alternates per swap so consecutive swaps land on a different animation
 * name and therefore restart rather than being ignored as unchanged.
 */
function swapStyles(swapping: boolean, dir: number, stagger: number, alt: boolean) {
  // No swap in flight: leave the cards to their entrance/hover choreography.
  if (!swapping) return { incoming: {}, outgoing: {}, copy: {} };
  const suffix = alt ? "a" : "b";
  // Vertical swipe: moving to a later category swipes up (`dir` > 0 — the
  // incoming photo rises in from below, the outgoing one clears the top),
  // moving to an earlier one swipes down (mirrored).
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
        className={`absolute inset-0 size-full object-cover ${hoverZoom
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
  glassIcon,
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
  /** Glass-badge icon shown top-left while the card is collapsed; not every
   *  category has one yet. */
  glassIcon?: {
    src: string;
    offsetX?: number;
    offsetY?: number;
    scale?: number;
    mirrorX?: boolean;
    rotate?: number;
  };
}) {
  const t = useTranslations("common");
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
    cursorRef.current.style.transform = `translate3d(${clientX - rect.left - 56}px, ${clientY - rect.top - 56
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
      className={`group relative h-[420px] shrink-0 overflow-clip rounded-3xl bg-white text-left ${active ? "cursor-none" : "cursor-pointer"
        }`}
      style={{
        // Inactive cards sit at a fixed 128px; the active card grows to
        // fill whatever space is left in the row (so this still works as
        // the category count changes).
        flexGrow: active ? 1 : 0,
        flexBasis: active ? 0 : 128,
        clipPath: entered ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
        transition: `flex-grow 500ms cubic-bezier(0.4,0,0.2,1), flex-basis 500ms cubic-bezier(0.4,0,0.2,1), clip-path 700ms cubic-bezier(0.16,1,0.3,1) ${enterDelayMs}ms`,
      }}
    >
      {/* Inactive cards show a flat gradient fill instead of their photo — the
          image only appears once the card is active. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-blue-500 to-cyan-500 transition-opacity duration-300 ease-out"
        style={{ opacity: active ? 0 : 1 }}
      />

      {/* Glass badge — top-left of the collapsed card, cropped by the card's
          own overflow-clip so 32px of its 200px bleeds off the left edge. */}
      {glassIcon && (
        <img loading="lazy" decoding="async"
          aria-hidden
          src={glassIcon.src}
          alt=""
          className="absolute top-4 size-[200px] max-w-none origin-center object-contain transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            left: -32 + (glassIcon.offsetX ?? 0),
            top: 16 + (glassIcon.offsetY ?? 0),
            // Selecting the card shrinks the badge out as it fades (down to
            // half size); deselecting grows it back in from that half size —
            // one scale drives both, since the CSS transition above already
            // interpolates whichever direction `active` just flipped.
            transform: `rotate(${glassIcon.rotate ?? 0}deg) scaleX(${(glassIcon.mirrorX ? -1 : 1) *
              GLASS_ICON_SCALE *
              (glassIcon.scale ?? 1) *
              (isHovered && !active ? 1.1 : 1) *
              (active ? 0.5 : 1)
              }) scaleY(${GLASS_ICON_SCALE *
              (glassIcon.scale ?? 1) *
              (isHovered && !active ? 1.1 : 1) *
              (active ? 0.5 : 1)
              })`,
            opacity: active ? 0 : 1,
          }}
        />
      )}

      <div
        className="absolute inset-y-0 right-0 w-[566px] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          transform: active ? "translateX(0)" : "translateX(96px)",
          opacity: active ? 1 : 0,
        }}
      >
        {/* Each layer carries the category-swap slide, so it composes with the
            active/inactive shift on the wrapper above and the hover zooms
            inside. The outgoing set sits on top and clears the card, revealing
            the incoming set that is already in place beneath it. */}
        <PhotoLayer product={product} style={swap.incoming} hoverZoom />
        {outgoing && <PhotoLayer product={outgoing} style={swap.outgoing} />}
      </div>

      {active && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-60 transition-[height] duration-300 ease-out group-hover:h-72"
          style={{
            background: "linear-gradient(to top, #005caa 0%, rgba(0,181,240,0) 100%)",
          }}
        />
      )}

      {/* Active content — title + subtitle + CTA panel. Both this and the
          collapsed panel below stay mounted at all times and simply cross-fade:
          becoming active slides this one up into place from just below while
          it fades in from 0 to full opacity; losing active reverses it. */}
      <div
        className="hero-search absolute bottom-2 left-2 flex flex-col items-start overflow-clip rounded-2xl px-5 pb-6 pt-4 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: 280,
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px) saturate(1.25)",
          WebkitBackdropFilter: "blur(16px) saturate(1.25)",
          isolation: "isolate",
          transform: active ? "translateY(0)" : "translateY(20px)",
          opacity: active ? 1 : 0,
          pointerEvents: active ? "auto" : "none",
        }}
      >
        <div className="w-full" style={swap.copy}>
          <p className="w-full text-title text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
            {copy.title}
          </p>
          <div className="grid w-full" style={{ gridTemplateRows: "1fr" }}>
            <div className="overflow-hidden">
              <p className="w-full pt-2 text-base leading-6 text-white/80">
                {copy.subtitle}
              </p>
              <div className="flex items-center gap-0.5 pt-8 text-base font-semibold text-blue-100 md:hidden">
                {t("learnMore")}
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

      {/* Collapsed (default) content — rotated vertical title. Slides down
          and fades out as the card becomes active; fades back in as it
          returns to default. No shared width, background, or swap-animation
          styles with the active panel above — just its own rotated title with
          a plain 16px pad on every side. */}
      <div
        className="absolute bottom-2 left-2 flex overflow-clip rounded-2xl p-4 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          transform: active ? "translateY(20px)" : "translateY(0)",
          opacity: active ? 0 : 1,
          pointerEvents: active ? "none" : "auto",
        }}
      >
        <p
          className="w-max whitespace-nowrap text-title text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "sideways",
            transform: "rotate(180deg)",
          }}
        >
          {copy.title}
        </p>
      </div>

      <div
        className={`absolute bottom-6 right-6 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"
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
        {t("learnMore")}
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
  progressRef,
}: {
  product: Product;
  outgoing: Product | null;
  copy: Product;
  active: boolean;
  onSelect: () => void;
  swap: ReturnType<typeof swapStyles>;
  progressRef: React.Ref<SVGCircleElement> | undefined;
}) {
  const t = useTranslations("common");
  return (
    <button
      onClick={onSelect}
      className="relative shrink-0 snap-center overflow-clip rounded-3xl bg-white text-left transition-[height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ width: 280, height: active ? 360 : 328 }}
    >
      {/* Same idea as the desktop card: the photo frame is wider than the card
          and anchored to its right edge, so the card acts as a window and the
          88px that spill past the left edge get clipped — the photo reads as
          shifted left rather than squeezed. */}
      <div className="absolute inset-y-0 right-0 w-[368px]">
        <PhotoLayer product={product} style={swap.incoming} />
        {outgoing && <PhotoLayer product={outgoing} style={swap.outgoing} />}
      </div>

      {/* Autoplay ring — top-left on mobile so it clears the bottom copy panel. */}
      <div
        className={`absolute left-4 top-4 z-20 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"
          }`}
      >
        <svg viewBox="0 0 32 32" className="size-8 -rotate-90">
          {/* Backing disc: card photos are often light at the top, where a plain
              white ring would otherwise disappear. */}
          <circle cx="16" cy="16" r="16" fill="rgba(0,0,0,0.28)" />
          <circle cx="16" cy="16" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
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
          <p className="w-full text-subtitle text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
            {copy.title}
          </p>
          <div
            className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
          >
            <div className="overflow-hidden">
              <p className="w-full pt-1 text-sm leading-5 text-white/80">{copy.subtitle}</p>
              <div className="flex items-center gap-0.5 pt-6 text-sm font-semibold text-blue-100">
                {t("learnMore")}
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
 * Mobile carousel (< xl) — native scroll-snap, made endless by padding the
 * real cards with `MOBILE_LOOP_CLONES` copies of the opposite end. Swiping
 * past either end therefore keeps sliding into more cards, and once the
 * scroll settles on one of those copies the position is silently hopped onto
 * its twin among the real cards.
 *
 * Every copy of the active product is marked active, not just the real one.
 * Copies sit a whole set apart — far off-screen — so only ever one is
 * visible, and the hop consequently lands on a card that has *already* grown
 * to its active height. That is what keeps the seam between the last and
 * first card indistinguishable from any other swipe: nothing resizes at the
 * moment of the jump, because the incoming card is the same shape as the one
 * it replaces, pixel for pixel.
 *
 * Cards are a fixed width and only ever change height, so the extra active
 * copies can't shift the track's horizontal geometry either.
 */
function MobileProductCarousel({
  products,
  outgoingProducts,
  copyProducts,
  activeIndex,
  onSelect,
  swapping,
  swapDir,
  swapAlt,
  progressRef,
  entered,
  pausedRef,
}: {
  products: Product[];
  outgoingProducts: Product[] | null;
  copyProducts: Product[];
  activeIndex: number;
  onSelect: (index: number) => void;
  swapping: boolean;
  swapDir: number;
  swapAlt: boolean;
  progressRef: React.Ref<SVGCircleElement>;
  entered: boolean;
  pausedRef: React.RefObject<boolean>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const n = products.length;
  // Clamped so a category with fewer products than the clone count still
  // renders a well-formed track.
  const clones = Math.min(MOBILE_LOOP_CLONES, n);

  // Rendered copies, in DOM order: `clones` from the tail, the real set, then
  // `clones` from the head. Slot `clones + i` is therefore the real card for
  // product `i`, which makes `clones` the offset between the two indexes.
  const slots = useMemo(() => {
    if (n === 0) return [];
    return Array.from({ length: n + clones * 2 }, (_, slot) => ({
      real: ((slot - clones) % n + n) % n,
    }));
  }, [n, clones]);
  const realOf = (slot: number) => ((slot - clones) % n + n) % n;

  // Which rendered copy the viewport is sitting on. Only the DOM node owning
  // the progress ring cares, but it also anchors every scroll target below so
  // that wrapping never scrolls the long way back around the track.
  const [activeSlot, setActiveSlot] = useState(clones);
  const activeSlotRef = useRef(clones);
  const moveTo = (slot: number) => {
    activeSlotRef.current = slot;
    setActiveSlot(slot);
  };
  // Latest callback, so the scroll listener below can stay subscribed.
  const onSelectRef = useRef(onSelect);
  // Refreshed after each commit rather than during render: assigning a ref
  // mid-render is not safe if React discards and replays the render.
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  /** The rendered copy of product `real` that sits closest to `from`. */
  const nearestCopy = (real: number, from: number) => {
    let best = clones + real;
    for (const candidate of [best - n, best + n]) {
      if (candidate < 0 || candidate >= slots.length) continue;
      if (Math.abs(candidate - from) < Math.abs(best - from)) best = candidate;
    }
    return best;
  };

  const centreOn = (slot: number, behavior: ScrollBehavior) => {
    const container = scrollRef.current;
    const card = container?.children[slot] as HTMLElement | undefined;
    if (!container || !card) return;
    const left = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
    container.scrollTo({ left: Math.max(0, left), behavior });
  };

  // Park on the first real card the moment a card list mounts or the category
  // swaps it out. Without this the track would start at scroll 0 — sitting on
  // the leading clones rather than the real set.
  useLayoutEffect(() => {
    if (slots.length === 0) return;
    // A category swap resets the index, but it lands in a later render than
    // the new card list, so clamp rather than trusting it here.
    const slot = clones + Math.min(activeIndex, n - 1);
    // Keeps `activeSlot` in sync with the scroll position centreOn() below
    // sets, which itself depends on measured layout (offsetLeft/clientWidth)
    // only available once the DOM has committed.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    moveTo(slot);
    centreOn(slot, "instant");
    // Only re-runs when the rendered card list itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  // Follow index changes that came from outside the carousel — autoplay, or a
  // tap on some other control. Swipe-driven changes are already on-screen, so
  // they no-op here rather than fighting the gesture.
  useEffect(() => {
    if (slots.length === 0 || realOf(activeSlotRef.current) === activeIndex) return;
    const slot = nearestCopy(activeIndex, activeSlotRef.current);
    moveTo(slot);
    centreOn(slot, "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Swiping activates whichever card sits closest to the centre, so the active
  // state follows the gesture instead of only taps; settling on a clone then
  // hops onto its twin.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || n === 0) return;

    let raf = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      raf = 0;
      const centre = container.scrollLeft + container.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      for (let slot = 0; slot < container.children.length; slot++) {
        const card = container.children[slot] as HTMLElement;
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
        if (distance < best) {
          best = distance;
          nearest = slot;
        }
      }
      if (nearest !== activeSlotRef.current) {
        const before = realOf(activeSlotRef.current);
        moveTo(nearest);
        const real = realOf(nearest);
        if (real !== before) onSelectRef.current(real);
      }

      clearTimeout(settle);
      const twin = clones + realOf(nearest);
      if (twin === nearest) return;
      settle = setTimeout(() => {
        const from = container.children[nearest] as HTMLElement | undefined;
        const to = container.children[twin] as HTMLElement | undefined;
        if (!from || !to) return;
        // Scroll-snap would otherwise animate a correction of its own on top
        // of this write, which is what used to show up as a hitch right at
        // the seam. Off for the jump, back on the next frame.
        container.style.scrollSnapType = "none";
        container.scrollLeft += to.offsetLeft - from.offsetLeft;
        moveTo(twin);
        requestAnimationFrame(() => {
          container.style.scrollSnapType = "";
        });
      }, 80);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
    // Deliberately independent of activeIndex/onSelect (both read through a
    // ref): re-subscribing mid-gesture would clear the pending hop above,
    // stranding the carousel on a clone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, clones]);

  return (
    <div
      ref={scrollRef}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
      className={`hide-scrollbar -mx-4 flex h-[360px] snap-x snap-mandatory items-center gap-4 overflow-x-auto px-4 [scrollbar-width:none] transition-opacity duration-700 ease-out xl:hidden ${entered ? "opacity-100" : "opacity-0"
        }`}
      style={{ transitionDelay: entered ? "250ms" : "0ms" }}
    >
      {slots.map(({ real }, slot) => (
        <MobileProductCard
          key={slot}
          product={products[real]}
          outgoing={outgoingProducts?.[real] ?? null}
          copy={copyProducts[real] ?? products[real]}
          active={real === activeIndex}
          onSelect={() => onSelect(real)}
          swap={swapStyles(swapping, swapDir, real * SWAP_STAGGER_MS, swapAlt)}
          // Exactly one node may own the ring — the copy actually on screen.
          progressRef={slot === activeSlot ? progressRef : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Curved-carousel geometry — one entry per slot away from the centre, mirrored
 * for the left side and interpolated for fractional positions while dragging.
 * `x` is the horizontal travel, `r` the rotateY (positive turns the outer edge
 * away, so the row reads as the inside of a cylinder), `s` the scale and `o`
 * the opacity. Slot 3 is the parking spot just past the visible arc.
 */
/**
 * True cylinder geometry for the film-strip carousel.
 * Cards rotate around a central vertical axis.
 */
const CARD_GAP = 32; // Jarak antar kartu (dalam pixel)
const CURVE_ANGLE_STEP = 15; // 360 / 24 = 15 degrees per card to form a perfect circle

// Radius dihitung otomatis berdasarkan gap dan lebar kartu samping (480px)
const CURVE_RADIUS = ((480 + CARD_GAP) / 2) / Math.sin((CURVE_ANGLE_STEP / 2) * (Math.PI / 180));

/** Drag distance that equals one card step. */
const CURVE_STEP_PX = 450;

/** Signed shortest ring distance, in (-len/2, len/2]. */
function wrapHalf(v: number, len: number) {
  let w = v % len;
  if (w > len / 2) w -= len;
  else if (w <= -len / 2) w += len;
  return w;
}

/**
 * Card on the curved track. Same face as the expanded desktop accordion card —
 * full-bleed photo, glass copy panel, follow-cursor "Pelajari" badge — but at a
 * fixed 566x400: the curve's translate/rotate/scale arrives via `style` from
 * the track, and only the centred card shows the subtitle, the blue gradient
 * and the autoplay ring.
 */
function CurvedProductCard({
  product,
  outgoing,
  copy,
  active,
  hidden,
  onSelect,
  progressRef,
  swap,
  style,
}: {
  product: Product;
  outgoing: Product | null;
  copy: Product;
  active: boolean;
  /** Parked past the visible arc — skip it for pointer and tab order. */
  hidden: boolean;
  onSelect: () => void;
  progressRef: React.Ref<SVGCircleElement> | undefined;
  swap: ReturnType<typeof swapStyles>;
  style: React.CSSProperties;
}) {
  const t = useTranslations("common");
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: -1000, y: -1000 });

  const positionCursor = () => {
    if (!cardRef.current || !cursorRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const { x: clientX, y: clientY } = lastMouseRef.current;
    cursorRef.current.style.transform = `translate3d(${clientX - rect.left - 56}px, ${clientY - rect.top - 56
      }px, 0)`;
  };

  const handleCardClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    positionCursor();
    setIsHovered(true);
    onSelect();
  };

  // Same per-frame badge tracking as the accordion card — the card moves under
  // the pointer (curve transitions, scroll), so it re-measures while shown.
  useEffect(() => {
    if (!active || !isHovered) return;

    let frameId = 0;
    const loop = () => {
      positionCursor();
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
  }, [active, isHovered]);

  return (
    <button
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={(e) => (lastMouseRef.current = { x: e.clientX, y: e.clientY })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
      className={`group absolute left-1/2 top-1/2 h-[400px] overflow-clip rounded-3xl bg-white text-left ${active ? "cursor-none" : "cursor-pointer"
        }`}
      style={style}
    >
      <div className="absolute inset-0">
        <PhotoLayer product={product} style={swap.incoming} hoverZoom={active} />
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
          <p className="w-full text-title text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
            {copy.title}
          </p>
          <div
            className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
          >
            <div className="overflow-hidden">
              <p className="w-full pt-2 text-base leading-6 text-white/80">{copy.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-6 right-6 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"
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
        className="fade-overlay pointer-events-none absolute left-0 top-0 z-30 flex size-28 items-center justify-center rounded-full border border-white/25 bg-white/[0.01] text-sm font-semibold text-white shadow-lg backdrop-blur-md"
        data-shown={active && isHovered ? "true" : "false"}
        style={{
          "--fade-ms": "200ms",
          isolation: "isolate",
        } as React.CSSProperties}
      >
        {t("learnMore")}
      </div>
    </button>
  );
}

/**
 * Desktop-only curved track: every product sits on a ring, five cards visible
 * at a time (centre + two shrinking, inward-turned cards per side), looping
 * infinitely. Autoplay is the section's shared cycle — this only maps
 * `activeIndex` onto ring positions; dragging or clicking a side card feeds
 * back through `onSelect`.
 */
function CurvedCarousel({
  products,
  outgoingProducts,
  copyProducts,
  activeIndex,
  categoryKey,
  onSelect,
  progressRef,
  entered,
  swapping,
  swapDir,
  swapAlt,
}: {
  products: Product[];
  outgoingProducts: Product[] | null;
  copyProducts: Product[];
  activeIndex: number;
  /** Identifies which category `products` belongs to — a change here means
   *  the ring should snap straight to `activeIndex` with no rotation, since
   *  the photo swap (not a ring spin) is what should carry the transition. */
  categoryKey: string;
  onSelect: (index: number) => void;
  progressRef: React.RefObject<SVGCircleElement | null>;
  entered: boolean;
  swapping: boolean;
  swapDir: number;
  swapAlt: boolean;
}) {
  const n = products.length;

  // To prevent the carousel from looking like a blocky polygon (e.g., an octagon if n=8),
  // we clone the products to ensure the cylinder always has enough sides to look smooth.
  // We use the global CURVE_ANGLE_STEP to figure out how many cards make a full circle.
  const targetRingLen = Math.round(360 / CURVE_ANGLE_STEP);
  const copies = Math.max(1, Math.round(targetRingLen / Math.max(1, n)));
  const ringLen = n * copies;

  // Use the global constants for the geometry
  const angleStep = CURVE_ANGLE_STEP;
  const radius = CURVE_RADIUS;

  const [ring, setRing] = useState({ activeIndex, n, pos: activeIndex });
  // A category swap replaces the whole product set, so `activeIndex` resetting
  // to 0 shouldn't spin the ring back through every other card — it should
  // land there directly, as if the visible cards were simply refilled.
  const prevCategoryRef = useRef(categoryKey);
  const [snapping, setSnapping] = useState(false);
  // Reads/writes a ref during render on purpose — this is React's documented
  // "adjust state when a prop changes" pattern (see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  // Doing the snap here, in the same render as the category swap, is what
  // keeps the ring from flashing at the old position for one frame the way an
  // effect-based reset would.
  /* eslint-disable react-hooks/refs */
  if (prevCategoryRef.current !== categoryKey) {
    prevCategoryRef.current = categoryKey;
    if (ring.activeIndex !== activeIndex || ring.n !== n || ring.pos !== activeIndex) {
      setRing({ activeIndex, n, pos: activeIndex });
    }
    if (!snapping) setSnapping(true);
  } else if (ring.activeIndex !== activeIndex || ring.n !== n) {
    let pos = activeIndex;
    if (ring.n === n) {
      let d = (activeIndex - ring.activeIndex) % n;
      if (d > n / 2) d -= n;
      else if (d < -n / 2) d += n;
      pos = ring.pos + d;
    }
    setRing({ activeIndex, n, pos });
  }
  /* eslint-enable react-hooks/refs */
  const ringPos = ring.pos;

  // The snap above must land with no transition, then hand transitions back
  // for anything after — one throwaway frame with `transition: none` is what
  // keeps the reflow from being interpolated.
  useEffect(() => {
    if (!snapping) return;
    const id = requestAnimationFrame(() => setSnapping(false));
    return () => cancelAnimationFrame(id);
  }, [snapping]);

  // Drag-to-rotate. Capture starts only after a small threshold so plain
  // clicks still reach the cards; once captured, pointer events retarget to
  // the track and the click never fires — which is exactly the suppression a
  // drag needs.
  const [dragDx, setDragDx] = useState<number | null>(null);
  const pointerRef = useRef<{ id: number; startX: number; captured: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerRef.current = { id: e.pointerId, startX: e.clientX, captured: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.startX;
    if (!p.captured) {
      if (Math.abs(dx) < 6) return;
      p.captured = true;
      e.currentTarget.setPointerCapture(p.id);
    }
    setDragDx(dx);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p || e.pointerId !== p.id) return;
    pointerRef.current = null;
    if (!p.captured) return;
    const dx = e.clientX - p.startX;
    // Clamped inside the half-ring so the accumulated step above always reads
    // the drag's own direction.
    const maxStep = Math.max(1, Math.floor(n / 2));
    const steps = Math.max(-maxStep, Math.min(maxStep, Math.round(-dx / CURVE_STEP_PX)));
    setDragDx(null);
    if (steps) onSelect((((activeIndex + steps) % n) + n) % n);
  };

  const dragFrac = (dragDx ?? 0) / CURVE_STEP_PX;

  return (
    <div
      className={`relative hidden h-[400px] w-full select-none overflow-hidden transition-opacity duration-700 ease-out xl:block ${entered ? "opacity-100" : "opacity-0"
        }`}
      style={{
        // A deeper perspective (farther vanishing point) compresses the
        // 3-D perspective distortion so the arc reads as a smooth cylinder
        // rather than a series of angled planes collapsing toward a point.
        perspective: "400px",
        perspectiveOrigin: "50% 50%",
        transitionDelay: entered ? "250ms" : "0ms",
        cursor: dragDx !== null ? "grabbing" : undefined,
        // Fade the outermost cards into the background at both edges. A mask
        // (not an overlay) so it works over the section's gradient.
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(e) => e.preventDefault()}
    >
      {Array.from({ length: ringLen }, (_, j) => {
        const pIdx = j % n;
        const offset = wrapHalf(j - ringPos, ringLen);
        const p = offset + dragFrac;

        // Cards on the far back of the cylinder are hidden
        const isBackface = Math.abs(p) > ringLen / 4;

        // --- HACK 3D: Adjust angle for active card width ---
        // The active card is 560px, inactive is 480px. Difference is 80px (40px per side).
        // We push inactive cards away by 40px along the arc so the gap remains consistent.
        const pushPx = 40;
        const pushDeg = (pushPx / radius) * (180 / Math.PI);
        // Interpolate push so it doesn't snap abruptly during drag
        const extraAngle = Math.abs(p) >= 1 ? Math.sign(p) * pushDeg : p * pushDeg;

        // Calculate curve position
        const r = p * angleStep + extraAngle;

        // Fade out cards at the edge of the visible arc to blend with the background
        const absP = Math.abs(p);
        let o = 1;
        if (absP > 1.5) {
          o = Math.max(0, 1 - (absP - 1.5));
        }

        const isActive = offset === 0;
        return (
          <CurvedProductCard
            key={j}
            product={products[pIdx]}
            // Indexed by `j` (this slot's stable key), not `pIdx` (the *new*
            // category's index at this slot) — right before the swap, this
            // same DOM node was rendering the outgoing category at `j % oldN`,
            // so that's the photo that has to keep showing until it slides
            // off. Re-deriving it from `pIdx` picked the wrong outgoing photo
            // whenever the two categories don't share the same product count,
            // which read as the old card's photo jumping right before the
            // transition played.
            outgoing={outgoingProducts?.[j % outgoingProducts.length] ?? null}
            copy={copyProducts[pIdx] ?? products[pIdx]}
            active={isActive}
            hidden={isBackface}
            onSelect={() => onSelect(pIdx)}
            progressRef={isActive ? progressRef : undefined}
            swap={swapStyles(swapping, swapDir, Math.min(Math.abs(offset), 2) * SWAP_STAGGER_MS, swapAlt)}
            style={{
              // True cylinder transform
              transform: `translate(-50%, -50%) translateZ(-${radius}px) rotateY(${r}deg) translateZ(${radius}px)`,
              zIndex: 30 - Math.round(Math.abs(p) * 10),
              opacity: isBackface ? 0 : o,
              width: isActive ? 560 : 480,
              transition:
                dragDx !== null || snapping
                  ? "none"
                  : "transform 600ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease, width 600ms cubic-bezier(0.4,0,0.2,1)",
              pointerEvents: isBackface ? "none" : undefined,
            }}
          />
        );
      })}
    </div>
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
  const t = useTranslations("product");
  // The layout switcher is gone from the UI (only "accordion" ships now), but
  // "curved" and CurvedCarousel are kept intact in code below in case it comes back.
  const [variant] = useState<ProductVariant>("accordion");
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
  // Separate node for the mobile carousel's ring — both are driven by the same
  // autoplay cycle, and only one of the two is visible per breakpoint.
  const mobileProgressRef = useRef<SVGCircleElement>(null);
  const progressRefs = useMemo(() => [progressRef, mobileProgressRef], []);
  const sectionRef = useRef<HTMLElement>(null);
  // Parks the autoplay timer while the section is off-screen or the tab is hidden.
  const live = useIsLive(sectionRef);
  const leftGlassRef = useRef<SVGImageElement>(null);
  const rightGlassRef = useRef<SVGImageElement>(null);
  const mobileCloveRef = useRef<HTMLImageElement>(null);
  // Desktop clove pattern, standing in while FlutedGlassOverlay is paused
  // (see the commented-out import above).
  const cloveARef = useRef<HTMLImageElement>(null);
  const cloveBRef = useRef<HTMLImageElement>(null);

  const categoryOf = (key: string) =>
    categories.find((c) => c.key === key) ?? categories[0];

  // Curved carousel and the mobile carousel both show every product in the
  // category — only the desktop accordion is slot-limited, below.
  const productsOf = (cat: ProductCategory) => cat.products;

  const category = categoryOf(activeCategory);
  const products = productsOf(category);
  const outgoingProducts = outgoingCategory ? productsOf(categoryOf(outgoingCategory)) : null;
  const copyProducts = productsOf(categoryOf(copyCategory));
  const swapping = outgoingCategory !== null;

  // The desktop accordion now shows the *categories* themselves — one card per
  // category (Simpanan, Kartu Kredit, …) — rather than the products inside the
  // active one. Each card is shaped like a Product so it can reuse ProductCard's
  // photo / hover / expand treatment. The photo comes straight from Supabase's
  // `image` column; the bundled sample photos are only a fallback for
  // categories that haven't had one set yet.
  const isDesktop = useIsDesktop();
  const categoryCards: Product[] = categories.map((c, i) => ({
    title: c.label,
    subtitle: c.description ?? "",
    image: c.image || SAMPLE_CATEGORY_PHOTOS[i % SAMPLE_CATEGORY_PHOTOS.length],
  }));
  const activeCategoryIndex = Math.max(0, categories.findIndex((c) => c.key === activeCategory));
  // Desktop accordion autoplay steps through categories; desktop curved steps
  // through the active category's products. Mobile always shows the category
  // list now (see MobileProductCarousel below), so it cycles categories too,
  // regardless of which desktop variant is selected.
  const cyclingCategories = !isDesktop || variant === "accordion";

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rectTop = section.getBoundingClientRect().top;
      const centerDist = rectTop + section.offsetHeight / 2 - window.innerHeight / 2;
      if (leftGlassRef.current) {
        leftGlassRef.current.style.transform = `translate3d(0, ${centerDist * 0.35}px, 0)`;
      }
      if (rightGlassRef.current) {
        rightGlassRef.current.style.transform = `translate3d(0, ${centerDist * -0.3}px, 0)`;
      }
      if (mobileCloveRef.current) {
        mobileCloveRef.current.style.transform = `translate3d(0, ${centerDist * -0.1}px, 0) scale(1.2)`;
      }
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

  // Switching from curved (up to 9 cards) back to accordion (3) can leave the
  // active index past the end of the shorter list, which would show no active
  // card at all. Nothing crashes in the meantime — the index simply matches
  // nothing — so an effect is soon enough.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- KNOWN cascading render: clamps `activeIndex` when `products.length` shrinks. Deferred rather than fixed here because changing render timing needs visual verification this repo has no tests for. See plans/008.
    if (activeIndex >= products.length) setActiveIndex(0);
  }, [activeIndex, products.length]);

  useAutoplayProgress({
    activeIndex: cyclingCategories ? activeCategoryIndex : activeIndex,
    count: cyclingCategories ? categories.length : products.length,
    durationMs: AUTO_ADVANCE_MS,
    circumference: RING_CIRCUMFERENCE,
    // Stable array identity: it feeds the hook's effect deps, so a fresh literal
    // each render would restart the timer on every render.
    progressRef: progressRefs,
    pausedRef,
    live,
    onAdvance: () => {
      if (cyclingCategories) {
        const next = (activeCategoryIndex + 1) % categories.length;
        setActiveCategory(categories[next].key);
        setActiveIndex(0);
      } else {
        setActiveIndex((i) => (i + 1) % products.length);
      }
    },
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
    // Every category has enough products to fill the visible arc, so the new
    // category always starts from its first card — CurvedCarousel snaps the
    // ring there instantly (no rotation) the moment the category changes, so
    // this reads as the cards being refilled in place, not a scroll back.
    setActiveIndex(0);
  };

  // The accordion's category cards don't run the photo swap — each card owns its
  // own photo and simply expands/collapses — so selecting one just moves the
  // active category without touching the swap machinery above.
  const selectCategoryCard = (key: string) => {
    if (key === activeCategory) return;
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

  return (
    <section
      ref={sectionRef}
      className="relative isolate bg-gradient-to-b from-blue-100 to-cyan-100 pb-[120px] pt-0 xl:pb-40 xl:pt-0"
    >
      {/* Clove pattern — mobile only, right side. The fluted glass overlay
          below is desktop-only (`hidden xl:block`), so under xl the section
          would otherwise show nothing but the plain gradient. Rides the same
          scroll-parallax as the desktop glass strips (see the effect above). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden xl:hidden">
        <img loading="lazy" decoding="async"
          ref={mobileCloveRef}
          src="/assets/product/bg-clove-b.svg"
          alt=""
          className="absolute -bottom-[176px] -right-28 h-[460px] w-[350px] origin-bottom-right opacity-60 will-change-transform"
        />
      </div>

      {/* Fluted glass vertical strips — PAUSED (not deleted): laggy on Safari
          (SVG feDisplacementMap has weak/no GPU acceleration in WebKit).
          Standing in with the desktop clove pattern that used to render here
          before the glass overlay replaced it, until a lighter-weight
          implementation lands. To restore: uncomment the import above and
          this block, and remove the clove-A/B markup just below. */}
      {/* <FlutedGlassOverlay side="left" fluteWidth={48} strength={90} liquidity={1} blur={0} drip={0.75} imageRef={leftGlassRef} />
      <FlutedGlassOverlay side="right" fluteWidth={48} strength={160} liquidity={1} blur={0} drip={0.75} imageSrc="/assets/gradien-1.png" imageRef={rightGlassRef} /> */}

      {/* Desktop clove pattern — the pre-fluted-glass background, brought back
          while the glass overlay is paused. Same two-layer parallax as it had
          before (see the effect above): cloveA drifts at 0.12x scroll,
          cloveB at 0.2x. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-visible hidden xl:block">
        <div className="absolute left-[calc(50%-937px)] top-[-400px] h-[1614px] w-[1178px] origin-top-left">
          <img loading="lazy" decoding="async"
            ref={cloveARef}
            src="/assets/product/bg-clove-a.svg"
            alt=""
            className="absolute inset-0 size-full opacity-80 will-change-transform"
          />
        </div>
        <div className="absolute left-[calc(50%+667px)] top-[-136px] h-[1668px] w-[1218px] origin-top-left">
          <img loading="lazy" decoding="async"
            ref={cloveBRef}
            src="/assets/product/bg-clove-b.svg"
            alt=""
            className="absolute inset-0 size-full opacity-80 will-change-transform"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 xl:w-[1280px] xl:max-w-none xl:gap-12 xl:px-0">
        {/* Heading — stacked on mobile. On desktop the curved layout stacks it
            too (vertical alignment, centered on the page); the accordion keeps
            the eyebrow-column + h2 side-by-side row. */}
        <div
          className={`flex flex-col transition-all duration-700 ease-out ${variant === "curved"
            ? "xl:items-center xl:gap-5 xl:text-center"
            : "xl:flex-row xl:gap-10"
            } ${entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div
            className={`flex items-center py-4 xl:shrink-0 ${variant === "curved" ? "" : "xl:w-[240px]"
              }`}
          >
            <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">
              {t("eyebrow")}
            </p>
          </div>
          <h2
            className={`text-heading text-blue-700 xl:text-display ${variant === "curved" ? "" : "xl:w-[560px]"
              }`}
          >
            {t("heading")}
          </h2>
        </div>

        <div className={variant === "curved" ? "flex flex-col" : ""}>
          {/* Desktop category row — curved layout only. The accordion now shows
              the categories *as* its cards, so its old left-hand list is gone. */}
          {variant === "curved" && (
            <div
              className={`hidden flex-wrap items-baseline justify-center gap-x-10 gap-y-2 pb-10 text-center text-blue-500 transition-all duration-700 ease-out xl:flex ${entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              style={{ transitionDelay: entered ? "150ms" : "0ms" }}
            >
              {categories.map((cat) => {
                const isActive = cat.key === activeCategory;
                const dim = !isActive && hoverCategory !== cat.key;
                // The row is `flex-wrap`, so changing a label's font-size on
                // activation would reflow the whole row (every other label can
                // shift or re-wrap). Instead every label is laid out at the
                // active (largest) size and shrunk visually with a layout-inert
                // `transform: scale`, scaled from the center so growth doesn't
                // read as a horizontal shift.
                return (
                  <button
                    key={cat.key}
                    onClick={() => selectCategory(cat.key)}
                    onMouseEnter={() => setHoverCategory(cat.key)}
                    onMouseLeave={() => setHoverCategory(null)}
                    className={`origin-center text-left text-display transition-all duration-200 ${isActive ? "font-bold" : "font-semibold"
                      } ${dim ? "opacity-50" : "opacity-100"}`}
                    style={{ transform: `scale(${isActive ? 1 : 0.75})` }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          <div
            className="w-full"
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
          >
            {variant === "curved" ? (
              <CurvedCarousel
                products={products}
                outgoingProducts={outgoingProducts}
                copyProducts={copyProducts}
                activeIndex={activeIndex}
                categoryKey={activeCategory}
                onSelect={setActiveIndex}
                progressRef={progressRef}
                entered={entered}
                swapping={swapping}
                swapDir={swapDir}
                swapAlt={swapAlt}
              />
            ) : (
              /* Desktop accordion — one card per category; the active card
                 expands. Six cards span the full 1280px row. No photo swap: each
                 card owns its own photo and just expands/collapses. */
              <div className="hidden gap-4 xl:flex">
                {categoryCards.map((card, i) => (
                  <ProductCard
                    key={categories[i].key}
                    product={card}
                    outgoing={null}
                    copy={card}
                    active={i === activeCategoryIndex}
                    onSelect={() => selectCategoryCard(categories[i].key)}
                    progressRef={i === activeCategoryIndex ? progressRef : undefined}
                    entered={entered}
                    enterDelayMs={250 + i * 80}
                    swap={swapStyles(false, 1, 0, false)}
                    glassIcon={CATEGORY_GLASS_ICONS[categories[i].key]}
                  />
                ))}
              </div>
            )}

            {/* Mobile carousel — fixed-width cards, active one grows taller and
                reveals its subtitle + CTA. Full-bleeds within the padded column.
                The track height is pinned to the tallest (active) card so the
                CTA below never shifts while cards swap size. Shows the
                *categories* here (not the active category's products) — same
                interactions as before, just listing categories instead. */}
            <MobileProductCarousel
              products={categoryCards}
              outgoingProducts={null}
              copyProducts={categoryCards}
              activeIndex={activeCategoryIndex}
              onSelect={(i) => selectCategoryCard(categories[i].key)}
              swapping={false}
              swapDir={swapDir}
              swapAlt={swapAlt}
              progressRef={mobileProgressRef}
              entered={entered}
              pausedRef={pausedRef}
            />

            {/* Pill progress bar — the mobile carousel loops endlessly, so this
                is the only cue that the category list is actually finite: the
                cyan fill fills up as the active category approaches the last. */}
            <div className="mt-6 flex justify-center xl:hidden">
              <div className="h-2 w-16 overflow-hidden rounded-full bg-blue-300">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-[width] duration-300"
                  style={{ width: `${((activeCategoryIndex + 1) / categories.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hint + CTA below the category cards, on every breakpoint —
            the desktop accordion doesn't otherwise show any CTA (the
            curved-only block below stays hidden for it). */}
        <div
          className={`flex flex-col items-center gap-5 ${entered ? "opacity-100" : "opacity-0"
            }`}
          style={{
            transition: `opacity 700ms ease-out ${entered ? "610ms" : "0ms"}`,
          }}
        >
          <p className="w-[320px] text-center text-base font-semibold text-blue-700 xl:w-auto xl:text-[18px]">
            {t("mobileCtaHint")}
          </p>
          <a
            href="https://www.bca.co.id/id/individu/layanan/goodplan-bca"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
          >
            <span className="text-base font-semibold text-neutral-100">{t("ctaLabel")}</span>
            <span
              aria-hidden
              className="size-5 shrink-0 bg-neutral-100"
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
          </a>
        </div>

        {/* Accordion cards (desktop and mobile) are each already their own
            link, so this hint + CTA is dropped everywhere except the
            curved desktop layout. */}
        <div
          className={`flex-col items-center gap-5 ${variant === "curved" ? "hidden xl:flex" : "hidden"
            } ${entered ? "opacity-100" : "opacity-0"}`}
          style={{
            transition: `opacity 700ms ease-out ${entered ? "610ms" : "0ms"}`,
          }}
        >
          <p className="text-center text-base font-semibold text-blue-700 xl:text-xl">
            {t("ctaHint", { category: category.label })}
          </p>
          <button
            className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active"
          >
            <span className="text-base font-semibold text-neutral-100">{t("ctaLabel")}</span>
            {/* Drawn as a mask so the shape stays one shared asset and the
                color comes from the same token as the label. */}
            <span
              aria-hidden
              className="size-5 shrink-0 bg-neutral-100"
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
    </section>
  );
}