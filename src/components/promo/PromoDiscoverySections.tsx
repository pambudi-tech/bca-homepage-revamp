"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Promo } from "@/components/home/promo-data";
import PromoCard from "./PromoCard";

type RailCopy = {
  previous: string;
  next: string;
};

export type PromoDiscoveryCopy = RailCopy & {
  locationEyebrow: string;
  locationLabel: string;
  locationOptions: string[];
  endingSoonTitle: string;
  endingSoonDescription: string;
};

function CarouselControls({
  copy,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: {
  copy: RailCopy;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3.5">
      <button
        type="button"
        aria-label={copy.previous}
        disabled={!canGoBack}
        onClick={onBack}
        className="flex size-12 items-center justify-center rounded-full bg-white transition-opacity disabled:opacity-40"
      >
        <span className="flex size-7 items-center justify-center">
          <img src="/assets/promo-page/controls/rail-arrow.svg" alt="" className="h-[19px] w-[19px] rotate-180" />
        </span>
      </button>
      <button
        type="button"
        aria-label={copy.next}
        disabled={!canGoForward}
        onClick={onForward}
        className="flex size-12 items-center justify-center rounded-full bg-white transition-opacity disabled:opacity-40"
      >
        <span className="flex size-7 items-center justify-center">
          <img src="/assets/promo-page/controls/rail-arrow.svg" alt="" className="h-[19px] w-[19px]" />
        </span>
      </button>
    </div>
  );
}

function usePromoRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanGoBack(rail.scrollLeft > 1);
    setCanGoForward(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateControls();
    const observer = new ResizeObserver(updateControls);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [updateControls]);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    const firstCard = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !firstCard) return;
    rail.scrollBy({ left: direction * (firstCard.offsetWidth + 24), behavior: "smooth" });
  };

  return { railRef, canGoBack, canGoForward, updateControls, move };
}

function PromoRail({
  promos,
  now,
  railRef,
  onScroll,
}: {
  promos: Promo[];
  now: Date;
  railRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}) {
  return (
    <div
      ref={railRef}
      onScroll={onScroll}
      data-lenis-prevent
      className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 pr-4 [scrollbar-width:none] xl:pr-[max(16px,calc((100vw-1280px)/2))]"
    >
      {promos.map((promo) => (
        <div key={promo.id} className="snap-start">
          <PromoCard promo={promo} now={now} reveal={false} />
        </div>
      ))}
    </div>
  );
}

function LocationPromoSection({ promos, now, copy }: { promos: Promo[]; now: Date; copy: PromoDiscoveryCopy }) {
  const rail = usePromoRail();
  const [location, setLocation] = useState(copy.locationLabel);

  return (
    <section className="overflow-hidden bg-blue-100 py-12 xl:py-20" aria-labelledby="location-promo-title">
      <div className="mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <h2 id="location-promo-title" className="text-2xl font-bold leading-9 text-blue-700">
              {copy.locationEyebrow}
            </h2>
            <label className="relative mt-1 flex w-fit max-w-full cursor-pointer items-center gap-2 text-blue-400">
              <span className="truncate text-[32px] font-semibold leading-10 tracking-[-0.02em] xl:text-[40px] xl:leading-12">
                {location}
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center">
                <img src="/assets/promo-page/controls/location-chevron.svg" alt="" className="h-[15px] w-[25px]" />
              </span>
              <select
                aria-label={copy.locationEyebrow}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {copy.locationOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <div className="hidden sm:block">
            <CarouselControls copy={copy} canGoBack={rail.canGoBack} canGoForward={rail.canGoForward} onBack={() => rail.move(-1)} onForward={() => rail.move(1)} />
          </div>
        </div>
      </div>

      <div className="mt-8 pl-4 xl:pl-[max(16px,calc((100vw-1280px)/2))]">
        <PromoRail promos={promos} now={now} railRef={rail.railRef} onScroll={rail.updateControls} />
      </div>
    </section>
  );
}

function EndingSoonPromoSection({ promos, now, copy }: { promos: Promo[]; now: Date; copy: PromoDiscoveryCopy }) {
  const rail = usePromoRail();
  const orderedPromos = useMemo(
    () => [...promos].sort((a, b) => a.endAt.getTime() - b.endAt.getTime()),
    [promos]
  );

  return (
    <section className="overflow-hidden bg-blue-100 py-12 xl:py-20" aria-labelledby="ending-soon-promo-title">
      <div className="mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <h2 id="ending-soon-promo-title" className="text-[28px] font-bold leading-7 tracking-[-0.02em] text-blue-500">
              {copy.endingSoonTitle}
            </h2>
            <p className="mt-6 text-base font-semibold leading-6 text-neutral-700 xl:text-xl xl:leading-[30px]">
              {copy.endingSoonDescription}
            </p>
          </div>
          <div className="hidden sm:block">
            <CarouselControls copy={copy} canGoBack={rail.canGoBack} canGoForward={rail.canGoForward} onBack={() => rail.move(-1)} onForward={() => rail.move(1)} />
          </div>
        </div>
      </div>

      <div className="mt-8 pl-4 xl:pl-[max(16px,calc((100vw-1280px)/2))]">
        <PromoRail promos={orderedPromos} now={now} railRef={rail.railRef} onScroll={rail.updateControls} />
      </div>
    </section>
  );
}

export default function PromoDiscoverySections({ promos, now, copy }: { promos: Promo[]; now: Date; copy: PromoDiscoveryCopy }) {
  return (
    <>
      <LocationPromoSection promos={promos} now={now} copy={copy} />
      <EndingSoonPromoSection promos={promos} now={now} copy={copy} />
    </>
  );
}
