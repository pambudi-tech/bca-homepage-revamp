"use client";

import { useEffect, useRef } from "react";
import type { Promo } from "@/components/home/promo-data";
import PromoCard from "./PromoCard";

const CARD_GAP = 16;

/** Shared looping, centre-snapping promo rail used on the homepage and promo page. */
export default function PromoCarousel({
  promos,
  now,
  campaignCover,
  campaignAlt,
  bleed = true,
  compact = false,
}: {
  promos: Promo[];
  now: Date;
  campaignCover?: string;
  campaignAlt?: string;
  /** Keep the default homepage edge bleed, or align to a padded section column. */
  bleed?: boolean;
  /** Match the denser two-column cards used by the Promo discovery grid. */
  compact?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemsCount = promos.length + (campaignCover ? 1 : 0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || itemsCount === 0) return;

    const cardAt = (slot: number) => container.children[slot] as HTMLElement | undefined;
    const start = cardAt(itemsCount);
    if (start) {
      container.scrollLeft = start.offsetLeft - (container.clientWidth - start.offsetWidth) / 2;
    }

    let raf = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      raf = 0;
      const centre = container.scrollLeft + container.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      for (let slot = 0; slot < container.children.length; slot++) {
        const card = cardAt(slot)!;
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
        if (distance < best) {
          best = distance;
          nearest = slot;
        }
      }

      clearTimeout(settle);
      const twin = itemsCount + (nearest % itemsCount);
      if (twin === nearest) return;
      settle = setTimeout(() => {
        const from = cardAt(nearest);
        const to = cardAt(twin);
        if (!from || !to) return;
        container.style.scrollSnapType = "none";
        container.scrollLeft += to.offsetLeft - from.offsetLeft;
        requestAnimationFrame(() => {
          container.style.scrollSnapType = "";
        });
      }, 80);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [itemsCount]);

  if (itemsCount === 0) return null;
  const slots = Array.from({ length: itemsCount * 3 }, (_, index) => index % itemsCount);

  return (
    <div ref={scrollRef} className={`hide-scrollbar -my-6 flex snap-x snap-mandatory items-start overflow-x-auto py-6 [scrollbar-width:none] ${bleed ? "-mx-4 px-4" : "px-8"}`}>
      {slots.map((item, index) => (
        <div key={`${item}-${index}`} className={`snap-center ${compact ? "w-[200px] shrink-0" : ""}`} style={{ marginRight: CARD_GAP }}>
          {campaignCover && item === 0 ? (
            <a href="#semua-promo" aria-label={campaignAlt} className={`block shrink-0 overflow-clip rounded-3xl border border-neutral-300 bg-white ${compact ? "h-[268px] w-full" : "h-[360px] w-[280px] xl:w-[302px]"}`}>
              <img src={campaignCover} alt={campaignAlt ?? ""} className="size-full object-cover" />
            </a>
          ) : (
            <PromoCard promo={promos[item - (campaignCover ? 1 : 0)]} now={now} reveal={false} compact={compact} />
          )}
        </div>
      ))}
    </div>
  );
}
