"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getPromoBadge, getPromoTimestamp, type Promo, type PromoBadgeKey } from "./promo-data";
import Confetti from "./Confetti";
import ChristmasDecor from "./ChristmasDecor";
import CnyDecor from "./CnyDecor";
import EventSlider from "./EventSlider";
import LayoutSwitcher from "./LayoutSwitcher";
import { useLayoutVariant } from "@/lib/useLayoutVariant";
// import PercentGlass from "./PercentGlass"; // temporarily hidden

const RIBBON_STYLE: Record<
  Exclude<PromoBadgeKey, "default">,
  { from: string; to: string; shadow: string; shadowDark: string; text: string; border: string }
> = {
  popular: { from: "#fe924d", to: "#fe6706", shadow: "#b24906", shadowDark: "#762e00", text: "#ffffff", border: "#b24906" },
  almostEnd: { from: "#ffd31c", to: "#ffba00", shadow: "#b28301", shadowDark: "#745501", text: "#4c3801", border: "rgba(0,0,0,0.3)" },
};

// Elevated shadow used on hover (Figma "Shadows/Default", scaled up).
const CARD_SHADOW =
  "0 1px 2px 0 rgba(204,204,204,0.14), 0 5px 5px 0 rgba(204,204,204,0.12), 0 10px 6px 0 rgba(204,204,204,0.10), 0 18px 20px -8px rgba(0,92,170,0.18)";

/**
 * Seasonal dressing for the band behind the cards. "confetti" is the
 * year-round default; the rest are holiday scenes that swap the animation
 * wholesale rather than recolouring the confetti, so each occasion gets motion
 * that actually belongs to it.
 */
const PROMO_THEMES = ["confetti", "christmas", "cny"] as const;
type PromoTheme = (typeof PROMO_THEMES)[number];

function PromoRibbon({ badgeKey, label }: { badgeKey: Exclude<PromoBadgeKey, "default">; label: string }) {
  const style = RIBBON_STYLE[badgeKey];
  return (
    <div className="absolute right-[-8px] top-40 flex items-center">
      {/* curled paper-fold tail — three stacked layers, absolute + rendered
          first so the `relative` main ribbon below paints on top of it (the
          fold tucks BEHIND the ribbon). Layer 1 is an S-curve that continues
          the ribbon's own gradient tone around the fold; layers 2 and 3 are
          rounded humps that darken progressively underneath it, giving the
          tail its curled depth instead of a single pinched corner. */}
      <div className="absolute right-0 top-[22px] flex h-[22px] w-2 items-center justify-center">
        <div className="rotate-90">
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 8C0 3.58172 3.58172 0 8 0L17.1111 0C19.8112 0 22 2.18883 22 4.88889V8L0 8Z" fill={style.to} />
          </svg>
        </div>
      </div>
      <div className="absolute right-0 top-[34px] flex h-[10px] w-2 items-center justify-center">
        <div className="rotate-90">
          <div className="h-2 w-[10px] rounded-t-[40px]" style={{ backgroundColor: style.shadow }} />
        </div>
      </div>
      <div className="absolute right-[2px] top-9 flex h-2 w-1.5 items-center justify-center">
        <div className="rotate-90">
          <div className="h-1.5 w-2 rounded-t-[40px]" style={{ backgroundColor: style.shadowDark }} />
        </div>
      </div>
      <div
        className="relative flex h-9 shrink-0 items-center justify-end overflow-clip rounded-bl-3xl rounded-tr-lg border-b-2 py-3 pl-4 pr-6"
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
  const t = useTranslations("promo");
  const badge = getPromoBadge(promo, now);
  const ts = getPromoTimestamp(promo, now, badge);
  const timestamp = t(`timestamp.${ts.kind}`, {
    hours: ts.kind === "hoursLeft" ? ts.hours : 0,
    date: ts.kind === "until" ? ts.date : "",
  });

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

      {badge.key !== "default" && <PromoRibbon badgeKey={badge.key} label={t(`badge.${badge.key}`)} />}
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
      {theme === "christmas" ? <ChristmasDecor /> : theme === "cny" ? <CnyDecor /> : <Confetti />}

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 xl:w-[1280px] xl:max-w-none xl:gap-10 xl:px-0">
        {/* Heading — stacked on mobile, eyebrow column + h2 side by side on
            desktop. */}
        <div data-reveal-group className="relative flex flex-col xl:flex-row xl:gap-10">
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
          <a
            href="https://promo.bca.co.id/"
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
            className="mx-auto mt-9 flex h-12 w-fit items-center justify-center gap-1 rounded-full bg-blue-500 px-6 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f] xl:hidden"
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
          </a>
        </div>
      </div>
    </section>
  );
}
