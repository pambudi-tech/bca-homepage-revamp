"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import Confetti from "@/components/home/Confetti";
import type { Promo } from "@/components/home/promo-data";
import PromoCard from "./PromoCard";

export type SeasonalPromoCopy = {
  badge: string;
  discount: string;
  emphasis: string;
  partner: string;
  quota: string;
  quotaHint: string;
  previous: string;
  next: string;
};

export default function SeasonalPromoSection({ promos, now, copy }: { promos: Promo[]; now: Date; copy: SeasonalPromoCopy }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: direction * 326, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-800 via-blue-500 to-cyan-500 py-12 xl:h-[440px] xl:py-0" aria-label={copy.badge}>
      <Confetti showBunting={false} />
      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 xl:h-full xl:w-[1280px] xl:max-w-none xl:flex-row xl:items-center xl:gap-10 xl:px-0">
        <div className="relative z-20 flex shrink-0 flex-col items-start text-white xl:w-[302px]">
          <span className="mb-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 px-4 py-1.5 text-sm font-semibold shadow-card">
            {copy.badge}
          </span>
          <p className="text-[34px] font-semibold italic leading-none text-shadow-hero xl:text-[38px]">{copy.discount}</p>
          <p className="-mt-1 text-[64px] font-black italic leading-none text-white text-shadow-hero xl:text-[72px]">{copy.emphasis}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-wide">{copy.partner}</p>
          <p className="mt-5 text-base font-bold">{copy.quota}</p>
          <p className="mt-1 max-w-[260px] text-sm font-medium leading-5 text-blue-100">{copy.quotaHint}</p>
        </div>

        <div className="relative min-w-0 flex-1 xl:self-stretch">
          <div
            ref={carouselRef}
            data-lenis-prevent
            className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 pr-16 xl:absolute xl:inset-y-10 xl:left-0 xl:w-[calc(100%+116px)] xl:pb-0"
            style={{ scrollbarWidth: "none", maskImage: "linear-gradient(to right, #000 0%, #000 90%, transparent 100%)" }}
          >
            {promos.map((promo) => (
              <div key={promo.id} className="snap-start">
                <PromoCard promo={promo} now={now} reveal={false} />
              </div>
            ))}
          </div>

          <button type="button" aria-label={copy.previous} onClick={() => move(-1)} className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900/55 backdrop-blur transition-colors hover:bg-neutral-900/75 xl:flex">
            <img src="/assets/navbar/icon-arrow-white.svg" alt="" className="size-6 rotate-180" />
          </button>
          <button type="button" aria-label={copy.next} onClick={() => move(1)} className="absolute right-0 top-1/2 hidden size-16 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900/55 backdrop-blur transition-colors hover:bg-neutral-900/75 xl:flex">
            <img src="/assets/navbar/icon-arrow-white.svg" alt="" className="size-7" />
          </button>
        </div>
      </div>
    </section>
  );
}
