"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { KursEntry } from "@/lib/kurs";
import { LOGIN_DESTINATIONS } from "./hero-variant";

const LOGIN_CARDS = LOGIN_DESTINATIONS.slice(0, 2);

export default function HeroCompactWidget({ kurs }: { kurs: KursEntry[] }) {
  const t = useTranslations("hero");
  const [activeRate, setActiveRate] = useState(0);
  const entry = kurs[activeRate];

  const moveRate = (direction: 1 | -1) => {
    if (!kurs.length) return;
    setActiveRate((current) => (current + direction + kurs.length) % kurs.length);
  };

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] xl:gap-4 xl:overflow-visible xl:px-0">
      {LOGIN_CARDS.map((destination) => (
        <a
          key={destination.label}
          href={destination.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-36 shrink-0 flex-col justify-between rounded-2xl bg-black/60 p-4 text-white backdrop-blur-md transition-colors hover:bg-black/70 xl:h-40 xl:w-[164px] xl:p-5"
        >
          <img src={destination.icon} alt="" className="size-10 object-contain object-left brightness-0 invert" />
          <span className="flex flex-col gap-1">
            <strong className="text-sm leading-5 xl:text-base xl:leading-6">{destination.label}</strong>
            <span className="text-xs leading-[18px] text-neutral-300">
              {t("loginCard", { service: destination.label })}
            </span>
          </span>
        </a>
      ))}

      {entry ? (
        <div className="flex h-36 min-w-[360px] shrink-0 flex-col justify-between rounded-2xl bg-black/60 p-4 text-white backdrop-blur-md xl:h-40 xl:min-w-0 xl:w-[420px] xl:p-5">
          <div className="flex items-center justify-between">
            <strong className="text-sm leading-5 xl:text-base xl:leading-6">{t("kursERate")}</strong>
            <a href="https://www.bca.co.id/id/informasi/kurs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-semibold hover:underline">
              {t("viewAll")}
              <img src="/assets/quick-action/arrow-right.svg" alt="" className="size-5 brightness-0 invert" />
            </a>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <img src={entry.flag} alt={entry.code} className="size-8 xl:size-10" />
              <div>
                <span className="block text-xs font-semibold leading-[18px] text-white/60 xl:text-sm xl:leading-5">{t("beli")}</span>
                <strong className="text-sm leading-5 xl:text-base xl:leading-6">{entry.beli}</strong>
              </div>
              <div>
                <span className="block text-xs font-semibold leading-[18px] text-white/60 xl:text-sm xl:leading-5">{t("jual")}</span>
                <strong className="text-sm leading-5 xl:text-base xl:leading-6">{entry.jual}</strong>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => moveRate(-1)} aria-label={t("kursPrev")} className="flex size-8 items-center justify-center rounded-full bg-white/30 transition-colors hover:bg-white/40">
                <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-5" />
              </button>
              <button onClick={() => moveRate(1)} aria-label={t("kursNext")} className="flex size-8 items-center justify-center rounded-full bg-white/30 transition-colors hover:bg-white/40">
                <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5" />
              </button>
            </div>
          </div>

          <span className="text-xs leading-[18px] text-neutral-300">{t("kursDisclaimer")}</span>
        </div>
      ) : null}
    </div>
  );
}
