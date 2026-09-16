"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Promo } from "./promo-data";
import Confetti from "./Confetti";
import ChristmasDecor from "./ChristmasDecor";
import CnyDecor from "./CnyDecor";
import LebaranDecor from "./LebaranDecor";
import EventSlider from "./EventSlider";
import LayoutSwitcher from "./LayoutSwitcher";
import { useLayoutVariant } from "@/lib/useLayoutVariant";
import { Link } from "@/i18n/navigation";
import PromoCard from "@/components/promo/PromoCard";
// import PercentGlass from "./PercentGlass"; // temporarily hidden

/**
 * Seasonal dressing for the band behind the cards. "confetti" is the
 * year-round default; the rest are holiday scenes that swap the animation
 * wholesale rather than recolouring the confetti, so each occasion gets motion
 * that actually belongs to it.
 */
const PROMO_THEMES = ["confetti", "christmas", "cny", "lebaran"] as const;
type PromoTheme = (typeof PROMO_THEMES)[number];

function MorePromoCard({ reveal = true }: { reveal?: boolean }) {
  const t = useTranslations("promo");
  return (
    <Link
      href="/promo"
      {...(reveal ? { "data-reveal": "" } : {})}
      className="group relative block h-[360px] w-[280px] shrink-0 overflow-clip rounded-3xl border border-white transition-transform duration-300 ease-out hover:-translate-y-1.5 xl:w-[302px]"
      style={{ backgroundImage: "linear-gradient(180deg, #005caa 0%, #00b5f0 100%)" }}
    >
      <p className="absolute left-6 top-6 w-[157px] text-title text-white xl:text-2xl xl:leading-[1.3] xl:tracking-[-0.48px]">
        {t("viewMore")}
      </p>
      {/* Diagonal arrow carries the established "view all" card treatment. */}
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
    </Link>
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

export default function PromoSection({ promos, now }: { promos: Promo[]; now: Date }) {
  const t = useTranslations("promo");
  const [theme, setTheme] = useLayoutVariant<PromoTheme>("promo-theme", "confetti", PROMO_THEMES);
  const [switched] = useState(false);

  return (
    <section
      id="promo"
      className="relative overflow-clip bg-gradient-to-b from-blue-100 to-blue-200 pb-12 pt-20 xl:pb-24 xl:pt-36"
    >
      {/* prototype-only: flips the seasonal animation behind the cards. */}
      <LayoutSwitcher
        label="Tema Promo"
        value={theme}
        onChange={setTheme}
        visibilityClassName="block"
        icon={
          /* snowflake icon */
          <svg viewBox="0 0 20 20" fill="none" className="size-[18px]">
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2.5v15M3.5 6.25l13 7.5M16.5 6.25l-13 7.5" />
              <path d="M8 4.4 10 6.2l2-1.8M8 15.6l2-1.8 2 1.8" />
            </g>
          </svg>
        }
        options={[
          { value: "confetti", name: "Confetti", description: "Animasi default sepanjang tahun." },
          { value: "christmas", name: "Natal", description: "Salju, garland cemara berlampu hangat, dan pita merah (WebGL)." },
          { value: "cny", name: "Imlek", description: "Kelopak mei hua, ranting berbunga, lampion, dan petasan (WebGL)." },
          { value: "lebaran", name: "Lebaran", description: "Rumbai janur, ketupat dan lentera, bintang emas, dan bulan sabit (WebGL)." },
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
      {/* seasonal dressing — confetti by default (pure JS + CSS), or a WebGL
          holiday scene. Both sit behind the content at z-0. */}
      {theme === "christmas" ? (
        <ChristmasDecor />
      ) : theme === "cny" ? (
        <CnyDecor />
      ) : theme === "lebaran" ? (
        <LebaranDecor />
      ) : (
        <Confetti />
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 xl:w-[1280px] xl:max-w-none xl:gap-10 xl:px-0">
        {/* Heading — stacked on mobile, eyebrow column + h2 side by side on
            desktop. */}
        <div data-reveal-group className="relative flex flex-col xl:flex-row xl:gap-10">
          <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
            <p data-reveal className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">
              {t("eyebrow")}
            </p>
          </div>
          <h2 data-reveal="blur-up" className="text-heading text-blue-700 w-[320px] xl:w-[560px] xl:text-display">
            {t("heading")}
          </h2>
          {/* 3D percentage glass (three.js) temporarily hidden — see PercentGlass.tsx.
          <PercentGlass /> */}
        </div>

        {/* Event slider — center-mode "peek" carousel, sits above the promo
            cards for every layout variant. */}
        <div data-reveal>
          <EventSlider />
        </div>

        {/* Promo list/grid — mobile carousel and desktop grid are alternates
            (only one is ever visible per breakpoint), plus the mobile-only CTA
            that closes out the row. */}
        <div>
          {/* Cards, mobile — endlessly looping swipe row (full-bleeding out of the
              padded column), shared by both variants since neither desktop layout
              fits below xl. No "show more" card here: the CTA button below the
              row already carries it. */}
          <div {...(switched ? {} : { "data-reveal": "" })} className="xl:hidden">
            <MobilePromoCarousel promos={promos} now={now} />
          </div>

          {/* Cards, desktop — wrapping grid. Tighter 60ms stagger: eight
              cards at the default 90ms would trickle too long. */}
          <div
            {...(switched ? {} : { "data-reveal-group": "60" })}
            className="hidden items-start content-center gap-6 xl:flex xl:flex-wrap"
          >
            {promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} now={now} reveal={!switched} />
            ))}
            <MorePromoCard reveal={!switched} />
          </div>

          {/* Mobile-only CTA — the desktop surfaces this via the "Show More" card.
              Styled to match the product section's mobile CTA. */}
          <Link
            href="/promo"
            data-reveal
            className="btn-base btn-primary mx-auto mt-9 w-fit xl:hidden"
          >
            <span className="text-base font-semibold text-neutral-100">
              {t("viewMore")}
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
          </Link>
        </div>
      </div>
    </section>
  );
}
