"use client";

import { useTranslations } from "next-intl";
import {
  getPromoBadge,
  getPromoTimestamp,
  type Promo,
} from "@/components/home/promo-data";
import PromoRibbon from "@/components/PromoRibbon";
import { Link } from "@/i18n/navigation";

const CARD_SHADOW =
  "0 1px 2px 0 rgba(204,204,204,0.14), 0 5px 5px 0 rgba(204,204,204,0.12), 0 10px 6px 0 rgba(204,204,204,0.10), 0 18px 20px -8px rgba(0,92,170,0.18)";

export default function PromoCard({
  promo,
  now,
  reveal = true,
  compact = false,
}: {
  promo: Promo;
  now: Date;
  reveal?: boolean;
  /** A denser card for the Promo discovery grid. The default stays unchanged for shared rails. */
  compact?: boolean;
}) {
  const t = useTranslations("promo");
  const badge = getPromoBadge(promo, now);
  const ts = getPromoTimestamp(promo, now, badge);
  const timestamp = t(`timestamp.${ts.kind}`, {
    hours: ts.kind === "hoursLeft" ? ts.hours : 0,
    date: ts.kind === "until" ? ts.date : "",
  });

  return (
    <Link
      href={`/promo/${promo.id}`}
      {...(reveal ? { "data-reveal": "" } : {})}
      className={`group relative block shrink-0 cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1.5 ${compact ? "h-[268px] w-full min-w-0" : "h-[360px] w-[280px] xl:w-[302px]"}`}
    >
      <div className="absolute inset-0 flex flex-col items-start overflow-clip rounded-3xl border border-neutral-300 bg-white transition-colors duration-300 group-hover:border-cyan-500">
        <div className={`relative w-full shrink-0 overflow-clip ${compact ? "h-24" : "h-40"}`}>
          <img loading="lazy" decoding="async" src={promo.cover} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-b from-transparent to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <svg viewBox="0 0 24 24" fill="none" className="absolute bottom-2 right-4 size-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <path d="M4 12h15M13 6l6 6-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="relative w-full flex-1">
          <div className={`absolute flex flex-col items-start ${compact ? "left-3 right-3 top-9 gap-1.5" : "left-5 right-5 top-12 gap-2"}`}>
            <p className={`line-clamp-2 w-full font-semibold tracking-normal text-neutral-800 transition-colors duration-300 group-hover:font-bold group-hover:text-blue-500 ${compact ? "text-sm leading-5" : "text-base leading-6 xl:text-[18px] xl:leading-[1.2]"}`}>
              {promo.title}
            </p>
            <p className={`line-clamp-2 w-full font-semibold text-neutral-600 ${compact ? "text-xs leading-4" : "text-sm leading-5 xl:text-base"}`}>{promo.brand}</p>
          </div>
          <div className={`absolute flex items-center gap-1.5 ${compact ? "bottom-3 left-3" : "bottom-5 left-5 gap-2"}`}>
            <img loading="lazy" decoding="async" src="/assets/promo/icon-clock.svg" alt="" className={`${compact ? "size-4" : "size-5"} shrink-0`} />
            <span className={`whitespace-nowrap font-semibold text-neutral-700 ${compact ? "text-[11px] leading-4" : "text-sm leading-5"}`}>{timestamp}</span>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: CARD_SHADOW }} />

      <div className={`absolute overflow-clip rounded-xl border border-neutral-300 bg-white shadow-card ${compact ? "left-3 top-[72px] size-12" : "left-5 top-[124px] size-[72px]"}`}>
        <img loading="lazy" decoding="async" src={promo.logo} alt="" className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded object-cover ${compact ? "size-9" : "size-14"}`} />
      </div>

      {badge.key !== "default" && <PromoRibbon badgeKey={badge.key} label={t(`badge.${badge.key}`)} />}
    </Link>
  );
}
