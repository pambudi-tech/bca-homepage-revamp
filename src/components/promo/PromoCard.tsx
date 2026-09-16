"use client";

import { useTranslations } from "next-intl";
import {
  getPromoBadge,
  getPromoTimestamp,
  type Promo,
  type PromoBadgeKey,
} from "@/components/home/promo-data";

const RIBBON_STYLE: Record<
  Exclude<PromoBadgeKey, "default">,
  { from: string; to: string; shadow: string; shadowDark: string; text: string; border: string }
> = {
  popular: { from: "#fe924d", to: "#fe6706", shadow: "#b24906", shadowDark: "#762e00", text: "#ffffff", border: "#b24906" },
  almostEnd: { from: "#ffd31c", to: "#ffba00", shadow: "#b28301", shadowDark: "#745501", text: "#4c3801", border: "rgba(0,0,0,0.3)" },
};

const CARD_SHADOW =
  "0 1px 2px 0 rgba(204,204,204,0.14), 0 5px 5px 0 rgba(204,204,204,0.12), 0 10px 6px 0 rgba(204,204,204,0.10), 0 18px 20px -8px rgba(0,92,170,0.18)";

function PromoRibbon({ badgeKey, label }: { badgeKey: Exclude<PromoBadgeKey, "default">; label: string }) {
  const style = RIBBON_STYLE[badgeKey];

  return (
    <div className="absolute right-[-8px] top-40 flex items-center">
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

export default function PromoCard({ promo, now, reveal = true }: { promo: Promo; now: Date; reveal?: boolean }) {
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
          <img loading="lazy" decoding="async" src={promo.cover} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-b from-transparent to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <svg viewBox="0 0 24 24" fill="none" className="absolute bottom-2 right-4 size-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: CARD_SHADOW }} />

      <div className="absolute left-5 top-[124px] size-[72px] overflow-clip rounded-xl border border-neutral-300 bg-white shadow-card">
        <img loading="lazy" decoding="async" src={promo.logo} alt="" className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded object-cover" />
      </div>

      {badge.key !== "default" && <PromoRibbon badgeKey={badge.key} label={t(`badge.${badge.key}`)} />}
    </a>
  );
}
