"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { KursEntry } from "@/lib/kurs";
import { useIsLive } from "@/lib/useIsLive";
import { LOGIN_DESTINATIONS } from "./hero-variant";

const LOGIN_CARDS = LOGIN_DESTINATIONS.slice(0, 2);
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
      { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
    const startedAt = performance.now();
    let frame = 0;
    const count = (now: number) => {
      const progress = Math.min((now - startedAt) / 650, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = RATE_FORMATTER.format(
        previousValue + (nextValue - previousValue) * eased
      );
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

export default function HeroCompactWidget({ kurs }: { kurs: KursEntry[] }) {
  const t = useTranslations("hero");
  const [activeRate, setActiveRate] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useIsLive(rootRef);
  const entry = kurs[activeRate];

  useEffect(() => {
    if (!live || kurs.length < 2) return;
    const timer = window.setTimeout(() => {
      setActiveRate((current) => (current + 1) % kurs.length);
    }, 5_000);
    return () => window.clearTimeout(timer);
  }, [activeRate, kurs.length, live]);

  const moveRate = (direction: 1 | -1) => {
    if (!kurs.length) return;
    setActiveRate((current) => (current + direction + kurs.length) % kurs.length);
  };

  return (
    <div ref={rootRef} className="hide-scrollbar -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:w-auto xl:gap-4 xl:overflow-visible xl:px-0">
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
                <strong className="text-sm leading-5 xl:text-base xl:leading-6"><AnimatedRate value={entry.beli} /></strong>
              </div>
              <div>
                <span className="block text-xs font-semibold leading-[18px] text-white/60 xl:text-sm xl:leading-5">{t("jual")}</span>
                <strong className="text-sm leading-5 xl:text-base xl:leading-6"><AnimatedRate value={entry.jual} /></strong>
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
