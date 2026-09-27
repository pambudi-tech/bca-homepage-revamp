"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KursEntry } from "@/lib/kurs";
import KursCarouselControls from "@/components/prioritas/KursCarouselControls";
import KursRefreshButton from "@/components/prioritas/KursRefreshButton";

type Copy = {
  buy: string;
  sell: string;
  updatedAt: string;
  refresh: string;
  previous: string;
  next: string;
};

const RATE_FORMATTER = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseRate(value: string) {
  return Number(value.replaceAll(".", "").replace(",", "."));
}

function AnimatedRate({ value }: { value: string }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const previousValueRef = useRef(parseRate(value));

  useLayoutEffect(() => {
    const element = elementRef.current;
    const nextValue = parseRate(value);
    if (!element || !Number.isFinite(nextValue)) return;

    const previousValue = previousValueRef.current;
    previousValueRef.current = nextValue;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || previousValue === nextValue) {
      element.textContent = value;
      return;
    }

    element.textContent = RATE_FORMATTER.format(previousValue);
    const rise = element.animate(
      [
        { opacity: 0.55, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    const startedAt = performance.now();
    let frame = 0;
    const count = (now: number) => {
      const progress = Math.min((now - startedAt) / 650, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = RATE_FORMATTER.format(previousValue + (nextValue - previousValue) * eased);
      if (progress < 1) frame = requestAnimationFrame(count);
      else element.textContent = value;
    };
    frame = requestAnimationFrame(count);

    return () => {
      cancelAnimationFrame(frame);
      rise.cancel();
    };
  }, [value]);

  return <span ref={elementRef}>{value}</span>;
}

export default function KursRatesCarousel({ rates, copy }: { rates: KursEntry[]; copy: Copy }) {
  const [offset, setOffset] = useState(0);

  const move = useCallback((step: number) => {
    if (rates.length <= 1) return;
    setOffset((current) => ((current + step) % rates.length + rates.length) % rates.length);
  }, [rates.length]);

  useEffect(() => {
    if (rates.length <= 1) return;
    const timer = window.setTimeout(() => move(1), 5000);
    return () => window.clearTimeout(timer);
  }, [move, offset, rates.length]);

  const visibleRates = Array.from({ length: Math.min(3, rates.length) }, (_, index) => rates[(offset + index) % rates.length]);

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-xl">
      <div className="overflow-hidden rounded-xl border border-pbrown-200/25 bg-pbrown-100/10">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {visibleRates.map((rate, index) => (
            <article key={index} className={`flex flex-row items-center gap-8 px-4 py-4 xl:flex-col xl:items-stretch xl:gap-8 xl:px-8 xl:py-6 ${index < visibleRates.length - 1 ? "border-b border-pbrown-200/25 md:border-b-0 md:border-r" : ""}`}>
              <div className="flex items-center gap-3 xl:gap-5">
                <img src={rate.flag} alt={rate.code} className="size-10" />
                <h4 className="text-lg font-semibold leading-[26px] text-pgold-200 xl:text-[28px] xl:leading-8 xl:tracking-[-0.56px]">{rate.code}</h4>
              </div>
              <div className="flex flex-1 items-center justify-between gap-4">
                <div className="flex w-[88px] shrink-0 flex-col gap-1">
                  <p className="text-sm font-semibold leading-5 text-pbrown-200 xl:text-lg xl:leading-[26px]">{copy.buy}</p>
                <p className="text-base font-semibold leading-6 text-pgold-200 xl:text-xl xl:leading-7 xl:tracking-[-0.4px]"><AnimatedRate value={rate.beli} /></p>
                </div>
                <div className="flex w-[88px] shrink-0 flex-col gap-1">
                  <p className="text-sm font-semibold leading-5 text-pbrown-200 xl:text-lg xl:leading-[26px]">{copy.sell}</p>
                <p className="text-base font-semibold leading-6 text-pgold-200 xl:text-xl xl:leading-7 xl:tracking-[-0.4px]"><AnimatedRate value={rate.jual} /></p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-left text-xs leading-4 text-pbrown-200 xl:text-base xl:leading-6">
          {copy.updatedAt}
          <KursRefreshButton label={copy.refresh} />
        </p>
        <KursCarouselControls previousLabel={copy.previous} nextLabel={copy.next} onPrevious={() => move(-3)} onNext={() => move(3)} />
      </div>
    </div>
  );
}
