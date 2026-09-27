"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useIsLive } from "@/lib/useIsLive";
import { Link } from "@/i18n/navigation";

const AUTO_ADVANCE_MS = 6000;

const ASSET_ROOT = "/assets/prioritas/privilege";

type PrivilegeCardCopy = {
  title: string;
  action: string;
  alt: string;
};

export type PrivilegeSectionCopy = {
  eyebrow: string;
  heading: string;
  cards: [PrivilegeCardCopy, PrivilegeCardCopy, PrivilegeCardCopy];
  viewMore: string;
};

function ArrowAction({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="flex items-center gap-0.5 text-left text-base font-semibold leading-6 text-pgold-300 transition-colors hover:text-pgold-100"
    >
      <span className="px-0.5">{children}</span>
      <img src={`${ASSET_ROOT}/arrow-small.svg`} alt="" className="size-5" />
    </button>
  );
}

function PrivilegeCard({
  copy,
  image,
  feature = false,
  active = false,
  onSelect,
  cardRef,
  progress = 0,
}: {
  copy: PrivilegeCardCopy;
  image: string;
  feature?: boolean;
  active?: boolean;
  onSelect?: () => void;
  cardRef?: (node: HTMLElement | null) => void;
  progress?: number;
}) {
  const circumference = 2 * Math.PI * 14;
  return (
    <article
      ref={cardRef}
      onClick={onSelect}
      className={`group relative w-[280px] shrink-0 snap-center overflow-hidden rounded-3xl transition-[height] duration-500 ease-in-out xl:w-auto xl:shrink xl:snap-none ${feature ? "h-[360px] xl:col-span-2" : active ? "h-[360px]" : "h-[328px] xl:h-[400px]"}`}
    >
      <img
        src={image}
        alt={copy.alt}
        className={`absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${feature ? "object-center" : ""}`}
      />
      <div className={`absolute inset-0 ${feature ? "bg-gradient-to-l from-[#170c02]/80 via-[#170c02]/15 to-transparent" : "bg-gradient-to-t from-[#170c02]/80 via-transparent to-transparent"}`} />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-pgold-500/85 via-pgold-500/15 to-transparent transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute left-4 top-4 z-30 xl:hidden">
        <svg viewBox="0 0 32 32" className={`size-8 -rotate-90 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`} aria-hidden>
          <circle cx="16" cy="16" r="16" fill="rgba(0,0,0,0.28)" />
          <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <circle cx="16" cy="16" r="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
        </svg>
      </div>
      <div
        className="glass-panel glass-panel-prioritas absolute inset-x-2 bottom-2 z-20 flex h-[160px] w-auto flex-col items-start justify-between overflow-hidden rounded-2xl px-4 pb-5 pt-4 xl:inset-x-auto xl:bottom-4 xl:left-4 xl:h-[180px] xl:w-[360px] xl:max-w-[calc(100%-2rem)]"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        <h3 className="text-subtitle max-w-full text-white xl:text-heading">
          {copy.title}
        </h3>
        <ArrowAction>{copy.action}</ArrowAction>
      </div>
    </article>
  );
}

export default function PrivilegeSection({ copy }: { copy: PrivilegeSectionCopy }) {
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const pausedRef = useRef(false);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const live = useIsLive(sectionRef);
  const cards = [
    { copy: copy.cards[0], image: `${ASSET_ROOT}/lounge.webp` },
    { copy: copy.cards[1], image: `${ASSET_ROOT}/hospital.webp` },
    { copy: copy.cards[2], image: `${ASSET_ROOT}/event.webp` },
  ];

  const selectMobileCard = (index: number, scroll = false) => {
    setActiveCard(index);
    setProgress(0);
    if (scroll) {
      const rail = railRef.current;
      const card = cardRefs.current[index];
      if (rail && card) {
        rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setProgress((value) => {
        if (value >= 1) {
          selectMobileCard((activeCard + 1) % cards.length, true);
          return 0;
        }
        return value + 100 / AUTO_ADVANCE_MS;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [activeCard, live, cards.length]);

  const handleRailScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const railCenter = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    let closest = activeCard;
    let distance = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const nextDistance = Math.abs(cardCenter - railCenter);
      if (nextDistance < distance) {
        distance = nextDistance;
        closest = index;
      }
    });
    if (closest !== activeCard) {
      setActiveCard(closest);
      setProgress(0);
    }
  };

  return (
    <section ref={sectionRef} id="privilege" className="relative isolate overflow-hidden bg-pbrown-600 py-12 text-white xl:min-h-[1200px] xl:py-20">
      <img
        src={`${ASSET_ROOT}/decoration.svg`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-[535px] -top-[643px] hidden h-[1190px] w-[1309px] rotate-[-41deg] xl:block"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <header className="mb-12 flex flex-col gap-6 xl:mb-14 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">
            {copy.eyebrow}
          </p>
          <h2 className="text-heading max-w-[560px] text-pgold-100 xl:text-display">
            {copy.heading}
          </h2>
        </header>

        <div className="flex flex-col gap-8 xl:block">
          <div
            ref={railRef}
            onScroll={handleRailScroll}
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            onTouchStart={() => (pausedRef.current = true)}
            onTouchEnd={() => (pausedRef.current = false)}
            className="hide-scrollbar -mx-4 flex h-[360px] snap-x snap-mandatory items-center gap-4 overflow-x-auto px-4 [scrollbar-width:none] xl:hidden"
          >
            {cards.map((card, index) => (
              <PrivilegeCard
                key={card.copy.title}
                copy={card.copy}
                image={card.image}
                active={activeCard === index}
                progress={activeCard === index ? progress : 0}
                cardRef={(node) => { cardRefs.current[index] = node; }}
                onSelect={() => selectMobileCard(index, true)}
              />
            ))}
          </div>

          <Link
            href="/prioritas/privilege"
            className="flex h-16 w-full items-center justify-center gap-4 rounded-full border border-pgold-100/25 bg-[linear-gradient(24deg,var(--color-pbrown-500)_0%,var(--color-pgold-500)_71%,var(--color-pgold-400)_86%,var(--color-pgold-500)_100%)] px-6 py-6 text-center text-base font-semibold text-pgold-100 transition-[filter,transform] hover:brightness-110 active:scale-[0.99] xl:hidden"
          >
            <span>{copy.viewMore}</span>
            <img src={`${ASSET_ROOT}/arrow-right.svg`} alt="" className="size-6" />
          </Link>

          <div className="hidden grid-cols-1 gap-8 xl:grid xl:grid-cols-2">
            <PrivilegeCard copy={cards[0].copy} image={cards[0].image} feature />
            <PrivilegeCard copy={cards[1].copy} image={cards[1].image} />
            <PrivilegeCard copy={cards[2].copy} image={cards[2].image} />

            <Link
              href="/prioritas/privilege"
              className="text-subtitle col-span-1 flex h-16 items-center justify-center gap-4 rounded-full border border-pgold-100/25 bg-[linear-gradient(24deg,var(--color-pbrown-500)_0%,var(--color-pgold-500)_71%,var(--color-pgold-400)_86%,var(--color-pgold-500)_100%)] px-6 py-6 text-center text-pgold-100 transition-[filter,transform] hover:brightness-110 active:scale-[0.99] xl:col-span-2"
            >
              <span>{copy.viewMore}</span>
              <img src={`${ASSET_ROOT}/arrow-right.svg`} alt="" className="size-8" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
