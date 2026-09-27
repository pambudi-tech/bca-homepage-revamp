"use client";

import { useTranslations } from "next-intl";
import {
  getPromoBadge,
  getPromoTimestamp,
  type Promo,
} from "@/components/home/promo-data";
import PromoRibbon from "@/components/PromoRibbon";
import PrioritasEventDateTile from "@/components/prioritas/PrioritasEventDateTile";
import { Link } from "@/i18n/navigation";

export default function PromoCard({
  promo,
  now,
  reveal = true,
  compact = false,
  variant = "default",
  fill = false,
  promoPage = false,
  detail = false,
  eventDate,
  detailHref,
  partnerPrivilege = false,
}: {
  promo: Promo;
  now: Date;
  reveal?: boolean;
  /** A denser card for the Promo discovery grid. The default stays unchanged for shared rails. */
  compact?: boolean;
  variant?: "default" | "prioritas";
  fill?: boolean;
  promoPage?: boolean;
  detail?: boolean;
  eventDate?: {
    primary?: string;
    secondary?: string;
    dateParts?: Array<{ primary: string; secondary: string }>;
    expired?: boolean;
    expiredLabel?: string;
  };
  detailHref?: string;
  partnerPrivilege?: boolean;
}) {
  const t = useTranslations("promo");
  const privilegeT = useTranslations("signaturePrivilege");
  const badge = getPromoBadge(promo, now);
  const ts = getPromoTimestamp(promo, now, badge);
  const timestamp = t(`timestamp.${ts.kind}`, {
    hours: ts.kind === "hoursLeft" ? ts.hours : 0,
    date: ts.kind === "until" ? ts.date : "",
  });
  const prioritasCompact = variant === "prioritas" && compact;
  const detailTone = variant === "prioritas" && detail;
  const brandFallback = promo.brand.split(/\s+/).slice(0, 2).join(" ");
  const darkLogoBackground = "partnerLogoBackground" in promo && promo.partnerLogoBackground === "dark";

  return (
    <Link
      href={detailHref ?? `/promo/${promo.id}`}
      scroll={detailHref ? false : undefined}
      {...(reveal ? { "data-reveal": "" } : {})}
      className={`group relative block shrink-0 cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1.5 ${prioritasCompact ? "h-[180px] w-full min-w-0" : compact ? "h-[268px] w-full min-w-0" : fill ? "h-[360px] w-full" : "h-[360px] w-[280px] xl:w-[302px]"}`}
    >
      <div className={`absolute inset-0 flex flex-col items-start overflow-clip rounded-3xl border transition-colors duration-300 ${detailTone ? "border-neutral-300 bg-neutral-100 group-hover:border-pgold-600" : variant === "prioritas" ? "border-pbrown-500 bg-pbrown-500 group-hover:border-pgold-500" : "border-neutral-300 bg-white group-hover:border-cyan-500"}`}>
        <div className={`relative w-full shrink-0 overflow-clip ${prioritasCompact ? "h-20" : compact ? "h-24" : "h-40"}`}>
          {promo.cover ? <img loading="lazy" decoding="async" src={promo.cover} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" /> : <div aria-hidden className="absolute inset-0 bg-pgold-200" />}
          {eventDate ? <PrioritasEventDateTile date={eventDate} /> : null}
          <div aria-hidden className={`absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-b from-transparent ${variant === "prioritas" ? "to-pgold-500" : "to-blue-500"} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
          <svg viewBox="0 0 24 24" fill="none" className="absolute bottom-2 right-4 size-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <path d="M4 12h15M13 6l6 6-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="relative w-full flex-1">
          <div className={`absolute flex flex-col items-start ${prioritasCompact ? "left-3 right-3 top-7 gap-1" : compact ? "left-3 right-3 top-9 gap-1.5" : "left-5 right-5 top-12 gap-2"}`}>
            <p className={`line-clamp-2 w-full font-semibold tracking-normal transition-colors duration-300 group-hover:font-bold ${detailTone ? "text-neutral-800 group-hover:text-pgold-600" : variant === "prioritas" ? "text-pgold-100 group-hover:text-white" : "text-neutral-800 group-hover:text-blue-500"} ${prioritasCompact ? "text-sm leading-5" : compact ? "text-sm leading-5" : "text-base leading-6 xl:text-[18px] xl:leading-[1.2]"}`}>
              {promo.title}
            </p>
            <p className={`line-clamp-2 w-full font-semibold ${detailTone ? "text-neutral-600" : variant === "prioritas" ? "text-pbrown-100" : "text-neutral-600"} ${promoPage ? compact ? "text-xs leading-4" : "text-sm leading-5 xl:text-base" : "text-sm leading-5"}`}>{promo.brand}</p>
          </div>
          <div className={`absolute flex items-center gap-1.5 ${prioritasCompact ? "bottom-3 left-3" : compact ? "bottom-3 left-3" : "bottom-5 left-5 gap-2"}`}>
            {(variant !== "prioritas" || promoPage) && <img loading="lazy" decoding="async" src="/assets/promo/icon-clock.svg" alt="" className={`${compact ? "size-4" : "size-5"} shrink-0`} />}
            <span className={`whitespace-nowrap font-semibold ${promoPage ? "text-neutral-700" : detailTone ? "text-pgold-600" : variant === "prioritas" ? "text-pgold-300" : "text-neutral-700"} ${promoPage ? "text-sm leading-5" : detailTone ? "text-sm leading-5 xl:text-base xl:leading-6" : compact ? "text-[11px] leading-4" : "text-sm leading-5"}`}>
              {variant === "prioritas" && !promoPage ? privilegeT("more") : timestamp}
            </span>
            {detailTone && !promoPage ? <img src="/assets/prioritas/detail/molton-brown/arrow-right.svg" alt="" aria-hidden="true" className="size-5 shrink-0" /> : variant === "prioritas" && !promoPage ? <img src="/assets/prioritas/privilege/arrow-small.svg" alt="" aria-hidden="true" className="size-5 shrink-0" /> : null}
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: "var(--shadow-card)" }} />

      <div className={`absolute overflow-clip rounded-xl border border-neutral-300 shadow-card ${darkLogoBackground ? "bg-pbrown-500" : "bg-white"} ${prioritasCompact ? "left-3 top-[56px] size-12" : compact ? "left-3 top-[72px] size-12" : "left-5 top-[124px] size-[72px]"}`}>
        {promo.logo ? <img loading="lazy" decoding="async" src={promo.logo} alt="" className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded object-contain ${compact ? "size-9" : "size-14"}`} /> : <span aria-hidden className="absolute inset-1 flex items-center justify-center text-center text-xs font-semibold leading-tight text-pbrown-700"><span className="line-clamp-3 break-words">{brandFallback}</span></span>}
      </div>

      {!partnerPrivilege && !eventDate && badge.key !== "default" && <PromoRibbon badgeKey={badge.key} label={t(`badge.${badge.key}`)} />}
    </Link>
  );
}
