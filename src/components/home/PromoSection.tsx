"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Promo } from "./promo-data";
import EventSlider from "./EventSlider";
import { Link } from "@/i18n/navigation";
import PromoCard from "@/components/promo/PromoCard";
import PromoCarousel from "@/components/promo/PromoCarousel";
// import PercentGlass from "./PercentGlass"; // temporarily hidden

function MorePromoCard({ reveal = true, variant = "default" }: { reveal?: boolean; variant?: "default" | "prioritas" }) {
  const t = useTranslations("promo");

  return (
    <Link
      href="/promo"
      {...(reveal ? { "data-reveal": "" } : {})}
      className={`group relative block h-[360px] w-[302px] shrink-0 overflow-clip rounded-3xl border transition-transform duration-300 ease-out hover:-translate-y-1.5 ${variant === "prioritas" ? "border-pgold-300" : "border-white"}`}
      style={{ backgroundImage: variant === "prioritas" ? "linear-gradient(180deg, var(--color-pbrown-800) 0%, var(--color-pgold-600) 100%)" : "linear-gradient(180deg, #005caa 0%, #00b5f0 100%)" }}
    >
      <p className={`absolute left-6 top-6 w-[157px] text-2xl leading-[1.3] tracking-[-0.48px] ${variant === "prioritas" ? "text-pgold-100" : "text-white"}`}>
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

export default function PromoSection({ promos, now, variant = "default" }: { promos: Promo[]; now: Date; variant?: "default" | "prioritas" }) {
  const t = useTranslations("promo");
  const [switched] = useState(false);
  const visiblePromos = promos.slice(0, 7);

  return (
    <section
      id={variant === "prioritas" ? "event-promo" : "promo"}
      className={`relative overflow-clip pb-12 pt-20 xl:pb-24 xl:pt-36 ${variant === "prioritas" ? "bg-pgold-100" : "bg-gradient-to-b from-blue-100 to-blue-200"}`}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 xl:w-[1280px] xl:max-w-none xl:gap-20 xl:px-0">
        {/* Promo comes first: heading plus the existing eight-card composition
            (seven CMS promos and the view-more card on desktop). */}
        <div className="flex flex-col gap-10">
          <div className="relative flex flex-col xl:gap-3">
            <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
                <p className={`text-eyebrow uppercase xl:text-eyebrow-lg ${variant === "prioritas" ? "text-pbrown-700" : "text-blue-500"}`}>
                {t("eyebrow")}
              </p>
            </div>
            <div className="flex items-center gap-3 xl:block">
              <h2 className={`w-full text-heading xl:w-[560px] xl:text-display ${variant === "prioritas" ? "text-pbrown-800" : "text-blue-700"}`}>
                {t("heading")}
              </h2>
              <Link
                href="/promo"
                aria-label={t("viewMore")}
                className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors xl:hidden ${variant === "prioritas" ? "text-pbrown-700 hover:bg-pgold-200" : "text-blue-500 hover:bg-blue-200"}`}
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
            <PromoCarousel promos={visiblePromos} now={now} variant={variant} />
          </div>

          {/* Cards, desktop — wrapping grid. Tighter 60ms stagger: eight
              cards at the default 90ms would trickle too long. */}
          <div
            {...(switched ? {} : { "data-reveal-group": "60" })}
            className="hidden items-start content-center gap-6 xl:flex xl:flex-wrap"
          >
            {visiblePromos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} now={now} reveal={!switched} variant={variant} />
            ))}
            <MorePromoCard reveal={!switched} variant={variant} />
          </div>
        </div>

        {/* Event is a separate block and intentionally contains only its
            heading and the database-independent banner carousel. */}
        <div className="flex flex-col gap-10">
          <div className="relative flex flex-col xl:gap-3">
            <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
              <p className={`text-eyebrow uppercase xl:text-eyebrow-lg ${variant === "prioritas" ? "text-pbrown-700" : "text-blue-500"}`}>
                {t("eventEyebrow")}
              </p>
            </div>
            <h2 className={`w-[320px] text-heading xl:w-[560px] xl:text-display ${variant === "prioritas" ? "text-pbrown-800" : "text-blue-700"}`}>
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
