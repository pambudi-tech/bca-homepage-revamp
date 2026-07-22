"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getPromoBadge, getPromoTimestamp, type Promo, type PromoBadgeKey } from "./promo-data";
import Confetti from "./Confetti";
import EventSlider from "./EventSlider";
import LayoutSwitcher from "./LayoutSwitcher";
import { useLayoutVariant } from "@/lib/useLayoutVariant";
// import PercentGlass from "./PercentGlass"; // temporarily hidden

const RIBBON_STYLE: Record<Exclude<PromoBadgeKey, "default">, { from: string; to: string; shadow: string; text: string; border: string }> = {
  popular: { from: "#fe924d", to: "#fe6706", shadow: "#b24906", text: "#ffffff", border: "#b24906" },
  almostEnd: { from: "#ffd31c", to: "#ffba00", shadow: "#b28301", text: "#4c3801", border: "rgba(0,0,0,0.3)" },
};

// Elevated shadow used on hover (Figma "Shadows/Default", scaled up).
const CARD_SHADOW =
  "0 1px 2px 0 rgba(204,204,204,0.14), 0 5px 5px 0 rgba(204,204,204,0.12), 0 10px 6px 0 rgba(204,204,204,0.10), 0 18px 20px -8px rgba(0,92,170,0.18)";

/** Layout variants offered by this section's LayoutSwitcher. */
const PROMO_VARIANTS = ["grid", "strip"] as const;
type PromoVariant = (typeof PROMO_VARIANTS)[number];

function PromoRibbon({ badgeKey, label }: { badgeKey: Exclude<PromoBadgeKey, "default">; label: string }) {
  const style = RIBBON_STYLE[badgeKey];
  return (
    <div className="absolute right-[-8px] top-40 flex items-center">
      {/* folded-corner shadow — absolute + rendered first, so the `relative` main
          ribbon below paints on top of it (shadow tucks BEHIND the ribbon). */}
      <div className="absolute right-0 top-6 flex h-5 w-2 items-center justify-center">
        <div className="rotate-90">
          <div className="h-2 w-5 rounded-t-[40px]" style={{ backgroundColor: style.shadow }} />
        </div>
      </div>
      <div
        className="relative flex h-9 shrink-0 items-center justify-end overflow-clip rounded-bl-3xl rounded-br-[4px] rounded-tr-lg border-b-2 px-6 pb-3.5 pt-3"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${style.from}, ${style.to})`,
          borderColor: style.border,
        }}
      >
        <p className="whitespace-nowrap text-sm font-semibold leading-5" style={{ color: style.text }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function PromoCard({ promo, now, reveal = true }: { promo: Promo; now: Date; reveal?: boolean }) {
  const badge = getPromoBadge(promo, now);
  const timestamp = getPromoTimestamp(promo, now, badge);

  return (
    <a
      href="#"
      {...(reveal ? { "data-reveal": "" } : {})}
      className="group relative block h-[360px] w-[280px] shrink-0 cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1.5 xl:w-[302px]"
    >
      <div className="absolute inset-0 flex flex-col items-start overflow-clip rounded-3xl border border-neutral-300 bg-white transition-colors duration-300 group-hover:border-cyan-500">
        <div className="relative h-40 w-full shrink-0 overflow-clip">
          <img loading="lazy" decoding="async"
            src={promo.cover}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* blue gradient overlay — hidden by default, revealed on hover */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[120px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "linear-gradient(to bottom, rgba(0,181,240,0) 0%, #005caa 100%)" }}
          />
          {/* arrow — appears on hover over the overlay */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute bottom-2 right-4 size-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <path d="M4 12h15M13 6l6 6-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="relative w-full flex-1">
          <div className="absolute left-5 right-5 top-12 flex flex-col items-start gap-2">
            <p className="line-clamp-2 w-full text-base font-semibold leading-6 tracking-normal text-neutral-800 transition-colors duration-300 group-hover:font-bold group-hover:text-blue-500 xl:text-[18px] xl:leading-[1.2]">
              {promo.title}
            </p>
            <p className="w-full text-sm font-semibold leading-5 text-neutral-600 xl:text-base">{promo.brand}</p>
          </div>
          <div className="absolute bottom-5 left-5 flex items-center gap-2">
            <img loading="lazy" decoding="async" src="/assets/promo/icon-clock.svg" alt="" className="size-5 shrink-0" />
            <span className="whitespace-nowrap text-sm font-semibold leading-5 text-neutral-700">{timestamp}</span>
          </div>
        </div>
      </div>

      {/* elevate shadow on hover, applied to a full-size layer under the card so it
          doesn't get clipped by the card's overflow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: CARD_SHADOW }}
      />

      {/* logo — sibling of the card so it overlaps the cover edge without being clipped */}
      <div className="absolute left-5 top-[124px] size-[72px] overflow-clip rounded-xl border border-neutral-300 bg-white shadow-[0_1px_2px_0_rgba(204,204,204,0.14),0_5px_5px_0_rgba(204,204,204,0.12)]">
        <img loading="lazy" decoding="async"
          src={promo.logo}
          alt=""
          className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded object-cover"
        />
      </div>

      {badge.key !== "default" && <PromoRibbon badgeKey={badge.key} label={badge.label!} />}
    </a>
  );
}

function MorePromoCard({ reveal = true }: { reveal?: boolean }) {
  const t = useTranslations("promo");
  return (
    <a
      href="https://promo.bca.co.id/"
      target="_blank"
      rel="noopener noreferrer"
      {...(reveal ? { "data-reveal": "" } : {})}
      className="group relative block h-[360px] w-[280px] shrink-0 overflow-clip rounded-3xl border border-white transition-transform duration-300 ease-out hover:-translate-y-1.5 xl:w-[302px]"
      style={{ backgroundImage: "linear-gradient(180deg, #005caa 0%, #00b5f0 100%)" }}
    >
      <p className="absolute left-6 top-6 w-[157px] text-xl font-semibold leading-7 tracking-[-0.4px] text-white xl:text-2xl xl:leading-[1.3] xl:tracking-[-0.48px]">
        {t("viewMore")}
      </p>
      {/* diagonal (external) arrow */}
      <svg viewBox="0 0 24 24" fill="none" className="absolute right-[19px] top-6 size-8 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <path d="M8 16 16 8M16 8H9M16 8V15" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* decorative category-icon cluster (Figma "image 476"), blended into the
          gradient with Soft Light so it reads as a watermark rather than art */}
      <img loading="lazy" decoding="async"
        src="/assets/promo/showmore-icons.webp"
        alt=""
        aria-hidden
        className="absolute left-6 right-6 top-[126px] h-[202px] object-cover mix-blend-soft-light xl:top-[86px] xl:h-[242px]"
      />
    </a>
  );
}

/** Horizontal gap between the mobile carousel's cards, px. */
const MOBILE_GAP = 16;

/**
 * Mobile-only promo carousel — a centre-snapping swipe row that never runs out
 * of cards. Same trick the product carousel uses: the set is rendered three
 * times and the viewport rides the middle copy, so landing on an outer copy
 * can be answered by hopping to its twin one set away. Every copy is
 * pixel-identical, so the hop is invisible; the row just keeps going in both
 * directions.
 *
 * The hop waits until the gesture has come to rest. Correcting mid-fling is
 * what used to read as a glitch a few cards in — the write would land in the
 * middle of the browser's own momentum and snap animation.
 *
 * Gaps are per-card margin (not flex `gap`, and not padding, which would sit
 * inside the snap area and throw the centring off) so the card's border box —
 * what snapping actually measures — is exactly the card.
 */
function MobilePromoCarousel({ promos, now }: { promos: Promo[]; now: Date }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const n = promos.length;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || n === 0) return;

    const cardAt = (slot: number) => container.children[slot] as HTMLElement | undefined;

    // Park on the middle copy's first card, so there is a whole set of runway
    // in either direction before the first hop is ever needed.
    const start = cardAt(n);
    if (start) {
      container.scrollLeft = start.offsetLeft - (container.clientWidth - start.offsetWidth) / 2;
    }

    let raf = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      raf = 0;
      const centre = container.scrollLeft + container.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      for (let slot = 0; slot < container.children.length; slot++) {
        const card = cardAt(slot)!;
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
        if (distance < best) {
          best = distance;
          nearest = slot;
        }
      }

      clearTimeout(settle);
      const twin = n + (nearest % n);
      if (twin === nearest) return;
      settle = setTimeout(() => {
        const from = cardAt(nearest);
        const to = cardAt(twin);
        if (!from || !to) return;
        // Scroll-snap would animate a correction of its own on top of this
        // write, which is what shows up as a hitch right at the seam. Off for
        // the jump, back on the next frame.
        container.style.scrollSnapType = "none";
        container.scrollLeft += to.offsetLeft - from.offsetLeft;
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
  }, [n]);

  if (n === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="hide-scrollbar -mx-4 flex snap-x snap-mandatory items-start overflow-x-auto px-4 [scrollbar-width:none]"
    >
      {[...promos, ...promos, ...promos].map((promo, i) => (
        <div key={`${promo.id}-${i}`} className="snap-center" style={{ marginRight: MOBILE_GAP }}>
          <PromoCard promo={promo} now={now} reveal={false} />
        </div>
      ))}
    </div>
  );
}

/**
 * Left column of the side-by-side "strip" layout: eyebrow, headline, and the
 * "Lihat 200+" CTA that replaces the grid's MorePromoCard.
 */
function PromoLeftColumn() {
  const t = useTranslations("promo");
  return (
    <div className="flex w-[560px] shrink-0 flex-col items-start gap-6">
      <p className="text-sm font-semibold uppercase leading-[14px] tracking-[2.1px] text-blue-500">
        {t("eyebrow")}
      </p>
      <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.64px] text-blue-700">
        {t("heading")}
      </h2>
      <a
        href="https://promo.bca.co.id/"
        target="_blank"
        rel="noopener noreferrer"
        className="group/cta flex h-12 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-blue-500 px-7 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]"
      >
        <span className="px-0.5 text-base font-semibold leading-5 text-white">
          {t("viewMore")}
        </span>
        <img loading="lazy" decoding="async" src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
      </a>
    </div>
  );
}

/** Steady drift of each film strip, px per second. */
const STRIP_SPEED = 32;
/** Vertical breathing room below every card in a strip, px. */
const STRIP_GAP = 24;
/** Height of the strips' viewing window, px. */
const STRIP_WINDOW = 800;

/**
 * Desktop-only "strip" variant: headline + CTA on the left and two vertical
 * film strips on the right, one drifting up and one drifting down. Each
 * strip holds the promo set twice, so wrapping the
 * shared offset at one set-height loops seamlessly; the down strip renders
 * the set rotated by half so the columns never mirror each other. Hovering
 * anywhere over the strips eases both to a stop.
 */
function FilmStripLayout({ promos, now }: { promos: Promo[]; now: Date }) {
  const upRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const speedRef = useRef(0);
  const offsetRef = useRef(0);

  // Same seven promos in both columns, but the down strip starts half a set
  // later so identical cards don't ride side by side.
  const half = Math.ceil(promos.length / 2);
  const downPromos = [...promos.slice(half), ...promos.slice(0, half)];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      // Ease toward the target speed so hover pause/resume glides.
      const target = pausedRef.current ? 0 : STRIP_SPEED;
      speedRef.current += (target - speedRef.current) * Math.min(dt * 5, 1);
      const up = upRef.current;
      const down = downRef.current;
      if (up && down) {
        // One full set = half the duplicated track; wrapping there is seamless
        // because the second copy is pixel-identical to the first.
        const set = up.scrollHeight / 2;
        if (set > 0) {
          offsetRef.current = (offsetRef.current + speedRef.current * dt) % set;
          up.style.transform = `translateY(${-offsetRef.current}px)`;
          down.style.transform = `translateY(${offsetRef.current - set}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const renderTrack = (list: Promo[], ref: React.RefObject<HTMLDivElement | null>) => (
    <div className="w-[302px]">
      <div ref={ref}>
        {/* The set twice over; fixed per-card padding (not flex gap) keeps the
            repeat period exactly setHeight, so the wrap point never jumps. */}
        {[...list, ...list].map((promo, i) => (
          <div key={`${promo.id}-${i}`} style={{ paddingBottom: STRIP_GAP }}>
            <PromoCard promo={promo} now={now} reveal={false} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    /* No top margin: with the section's xl padding zeroed for this variant,
       the window is meant to kiss the section's top and bottom edges. */
    <div className="hidden items-center gap-10 xl:flex">
      <PromoLeftColumn />

      {/* The strips' window — edges feathered with a mask so cards dissolve
          in and out instead of guillotining at the boundary. */}
      <div
        className="ml-auto flex gap-6 overflow-hidden px-2"
        style={{
          height: STRIP_WINDOW,
          maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        {renderTrack(promos, upRef)}
        {renderTrack(downPromos, downRef)}
      </div>
    </div>
  );
}

export default function PromoSection({ promos, now }: { promos: Promo[]; now: Date }) {
  const t = useTranslations("promo");
  const [variant, selectVariant] = useLayoutVariant<PromoVariant>("promo", "grid", PROMO_VARIANTS);
  // ScrollReveal scans the DOM once on mount, so any variant subtree that
  // (re)mounts after a live switch must not emit `data-reveal` — it would
  // never be observed and would sit at opacity 0 forever.
  const [switched, setSwitched] = useState(false);
  const setVariant = (next: PromoVariant) => {
    setSwitched(true);
    selectVariant(next);
  };

  return (
    <section
      id="promo"
      className={`relative overflow-clip bg-gradient-to-b from-blue-100 to-blue-200 py-12 ${
        // The film strip is meant to run edge to edge, so it drops the desktop
        // padding and lets its 800px window set the section height itself.
        variant === "strip" ? "xl:py-0" : "xl:py-24"
      }`}
    >
      {/* prototype-only: lets the client flip this section's layout live. */}
      <LayoutSwitcher
        label="Layout Promo"
        value={variant}
        onChange={setVariant}
        options={[
          { value: "grid", name: "Grid Flow", description: "Kartu berjajar rapi dan wrap ke baris berikutnya." },
          { value: "strip", name: "Film Strip", description: "Dua kolom kartu berjalan berlawanan arah; hover untuk pause." },
        ]}
      />

      {/* clove pattern — left & right, bleeding off the edges. Same position/size
          as desktop at every breakpoint; mobile just scales it down 0.8x from
          its anchor corner (max-w-none guards against the img preflight's
          max-width:100%, which would otherwise clamp the explicit width). */}
      <img loading="lazy" decoding="async"
        src="/assets/promo/bg-clove-product-1.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-380px] top-36 h-[896px] w-[770px] max-w-none origin-top-left scale-[0.8] opacity-100 sm:scale-100 xl:bottom-[-256px] xl:left-[-256px] xl:top-auto xl:h-[1634px] xl:w-[1344px]"
      />
      <img loading="lazy" decoding="async"
        src="/assets/promo/bg-clove-product-2.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-368px] right-[-380px] h-[896px] w-[770px] max-w-none origin-bottom-right scale-[0.8] opacity-60 sm:scale-100 xl:bottom-[-720px] xl:right-[-720px] xl:h-[1634px] xl:w-[1344px]"
      />
      {/* confetti — top of the section (pure JS + CSS, see Confetti.tsx) */}
      <Confetti />

      <div className="relative z-10 mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        {/* Heading — stacked on mobile, eyebrow column + h2 side by side on
            desktop. The strip variant renders its own headline in its left
            column, so this row bows out at xl there (class change only — the
            nodes stay mounted for ScrollReveal). */}
        <div data-reveal-group className={`relative flex flex-col xl:flex-row xl:gap-10 ${variant !== "grid" ? "xl:hidden" : ""}`}>
          <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
            <p data-reveal className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-blue-500 xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]">
              {t("eyebrow")}
            </p>
          </div>
          <h2 data-reveal="blur-up" className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-blue-700 xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
            {t("heading")}
          </h2>
          {/* 3D percentage glass (three.js) temporarily hidden — see PercentGlass.tsx.
          <PercentGlass /> */}
        </div>

        {/* Event slider — center-mode "peek" carousel, sits above the promo
            cards for every layout variant. */}
        <div data-reveal className="mt-8 xl:mt-10">
          <EventSlider />
        </div>

        {/* Cards, mobile — endlessly looping swipe row (full-bleeding out of the
            padded column), shared by both variants since neither desktop layout
            fits below xl. No "show more" card here: the CTA button below the
            row already carries it. */}
        <div {...(switched ? {} : { "data-reveal": "" })} className="mt-8 xl:hidden">
          <MobilePromoCarousel promos={promos} now={now} />
        </div>

        {/* Cards, desktop — wrapping grid, only for the "grid" variant (the film
            strip renders its own tracks below). Tighter 60ms stagger: eight
            cards at the default 90ms would trickle too long. */}
        <div
          {...(switched ? {} : { "data-reveal-group": "60" })}
          className={`mt-10 hidden items-start content-center gap-6 ${
            variant === "grid" ? "xl:flex xl:flex-wrap" : ""
          }`}
        >
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} now={now} reveal={!switched} />
          ))}
          <MorePromoCard reveal={!switched} />
        </div>

        {variant === "strip" && <FilmStripLayout promos={promos} now={now} />}

        {/* Mobile-only CTA — the desktop surfaces this via the "Show More" card.
            Styled to match the product section's mobile CTA. */}
        <a
          href="https://promo.bca.co.id/"
          target="_blank"
          rel="noopener noreferrer"
          data-reveal
          className="mx-auto mt-9 flex h-12 w-fit items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f] xl:hidden"
        >
          <span className="text-base font-semibold text-neutral-100">
            Lihat 200+ promo lainnya
          </span>
          {/* Drawn as a mask so the shape stays one shared asset and the color
              comes from the same token as the label. */}
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
    </section>
  );
}
