"use client";

import { useState } from "react";
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
import PromoCarousel from "@/components/promo/PromoCarousel";
// import PercentGlass from "./PercentGlass"; // temporarily hidden

/**
 * Seasonal dressing for the band behind the cards. "confetti" is the
 * year-round default; the rest are holiday scenes that swap the animation
 * wholesale rather than recolouring the confetti, so each occasion gets motion
 * that actually belongs to it.
 */
const PROMO_THEMES = ["none", "confetti", "christmas", "cny", "lebaran"] as const;
type PromoTheme = (typeof PROMO_THEMES)[number];

function MorePromoCard({ reveal = true }: { reveal?: boolean }) {
  const t = useTranslations("promo");

  return (
    <Link
      href="/promo"
      {...(reveal ? { "data-reveal": "" } : {})}
      className="group relative block h-[360px] w-[302px] shrink-0 overflow-clip rounded-3xl border border-white transition-transform duration-300 ease-out hover:-translate-y-1.5"
      style={{ backgroundImage: "linear-gradient(180deg, #005caa 0%, #00b5f0 100%)" }}
    >
      <p className="absolute left-6 top-6 w-[157px] text-2xl leading-[1.3] tracking-[-0.48px] text-white">
        {t("viewMore")}
      </p>
      <svg viewBox="0 0 24 24" fill="none" className="absolute right-[19px] top-6 size-8 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <path d="M8 16 16 8M16 8H9M16 8V15" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <img
        loading="lazy"
        decoding="async"
        src="/assets/promo/showmore-icons.webp"
        alt=""
        aria-hidden
        className="absolute left-6 right-6 top-[86px] h-[242px] object-cover mix-blend-soft-light"
      />
    </Link>
  );
}

export default function PromoSection({ promos, now }: { promos: Promo[]; now: Date }) {
  const t = useTranslations("promo");
  const [theme, setTheme] = useLayoutVariant<PromoTheme>("promo-theme", "none", PROMO_THEMES);
  const [switched] = useState(false);
  const visiblePromos = promos.slice(0, 7);

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
          { value: "none", name: "Mati", description: "Tanpa ornamen tematik." },
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
      {theme !== "none" && (
        <>
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
        </>
      )}
      {/* seasonal dressing — confetti by default (pure JS + CSS), or a WebGL
          holiday scene. Both sit behind the content at z-0. */}
      {theme === "christmas" ? (
        <ChristmasDecor />
      ) : theme === "cny" ? (
        <CnyDecor />
      ) : theme === "lebaran" ? (
        <LebaranDecor />
      ) : theme === "confetti" ? (
        <Confetti />
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 xl:w-[1280px] xl:max-w-none xl:gap-20 xl:px-0">
        {/* Promo comes first: heading plus the existing eight-card composition
            (seven CMS promos and the view-more card on desktop). */}
        <div className="flex flex-col gap-10">
          <div className="relative flex flex-col xl:gap-3">
            <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
              <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">
                {t("eyebrow")}
              </p>
            </div>
            <div className="flex items-center gap-3 xl:block">
              <h2 className="w-full text-heading text-blue-700 xl:w-[560px] xl:text-display">
                {t("heading")}
              </h2>
              <Link
                href="/promo"
                aria-label={t("viewMore")}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-200 xl:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                  <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Cards, mobile — endlessly looping swipe row (full-bleeding out of the
              padded column), shared by both variants since neither desktop layout
              fits below xl. No "show more" card here: the CTA button below the
              row already carries it. */}
          <div className="xl:hidden">
            <PromoCarousel promos={visiblePromos} now={now} />
          </div>

          {/* Cards, desktop — wrapping grid. Tighter 60ms stagger: eight
              cards at the default 90ms would trickle too long. */}
          <div
            {...(switched ? {} : { "data-reveal-group": "60" })}
            className="hidden items-start content-center gap-6 xl:flex xl:flex-wrap"
          >
            {visiblePromos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} now={now} reveal={!switched} />
            ))}
            <MorePromoCard reveal={!switched} />
          </div>
        </div>

        {/* Event is a separate block and intentionally contains only its
            heading and the database-independent banner carousel. */}
        <div className="flex flex-col gap-10">
          <div className="relative flex flex-col xl:gap-3">
            <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
              <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">
                {t("eventEyebrow")}
              </p>
            </div>
            <h2 className="w-[320px] text-heading text-blue-700 xl:w-[560px] xl:text-display">
              {t("eventHeading")}
            </h2>
          </div>
          <div>
            <EventSlider />
          </div>
        </div>
      </div>
    </section>
  );
}
