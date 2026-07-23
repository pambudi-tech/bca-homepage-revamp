"use client";

import { useEffect, useRef, useState } from "react";
import SoliprioPhoto from "./SoliprioPhoto";
import { ArrowRight } from "./SoliprioCard";
import { Glow, Logos } from "./soliprio-parts";

/**
 * Vertical drift for the mobile backdrop, in px each way. Much tighter than
 * the desktop band's 32, because the mobile crop has almost no slack to hide
 * the movement in: the photo sits at y -32..296 inside a 580px band.
 *
 * The top edge is not the limit (it stays above the band until +32). The
 * bottom one is: it is only hidden because the vignette sits over it, and the
 * vignette is weakest at the band's far corners. At rest the corner is 96.4%
 * covered; drifting 12 up leaves 94.3%, while 20 would drop it to 92.4% and
 * roughly double how much of that edge shows. 12 keeps it near the resting
 * design while still reading as parallax.
 */
const DRIFT = 12;

/**
 * Border-beam color per card — Solitaire is BCA's private-banking tier (blue),
 * Prioritas the wealth tier above it (gold). Fixed, unlike the desktop cards'
 * `getBeamColor`-sampled hue: the mobile carousel has no per-card artwork
 * sample piped in, and these two are brand-specific enough to hardcode.
 */
const BEAM_COLORS: Record<string, string> = {
  solitaire: "#3B82F6",
  prioritas: "#D4AF37",
};

export type SoliprioMobileCard = {
  key: string;
  src: string;
  label: string;
};

export default function SoliprioMobile({
  title,
  cards,
  /** Card whose photo replaces the default backdrop when it is centred. */
  swapKey,
}: {
  title: string;
  cards: readonly SoliprioMobileCard[];
  swapKey: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState(cards[0]?.key ?? "");

  // Which card the carousel has settled on, read off scroll position rather
  // than a snap event — `scrollsnapchange` is still too new to rely on, and
  // nearest-to-centre also updates *during* the swipe, so the backdrop
  // cross-fades with the gesture instead of jumping when it ends.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frameId = 0;
    const measure = () => {
      frameId = 0;
      const centre = rail.scrollLeft + rail.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      Array.from(rail.children).forEach((child, i) => {
        const el = child as HTMLElement;
        const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centre);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      });
      // Only ever a state write when the answer actually changed, so a swipe
      // costs one render per card crossed rather than one per scroll event.
      setActiveKey((current) => cards[nearest]?.key ?? current);
    };

    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(measure);
    };

    measure();
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      rail.removeEventListener("scroll", onScroll);
    };
  }, [cards]);

  return (
    <div
      data-reveal-group
      className="relative h-[580px] overflow-clip bg-[#0f0f0f] xl:hidden"
    >
      {/* Design places a 740x328 photo at x=-276. Covering a full-width,
          328px-tall band reproduces exactly that scale (the source's 2.256
          aspect makes 328px tall == 740px wide), and `64%` puts the same
          slice of the family in frame at any phone width — offset a further
          56px left (`calc(64% - 56px)`) on top of that anchor, rather than
          moving the frame itself, so the crop shifts without uncovering an
          edge of the box it sits in. */}
      <SoliprioPhoto
        className="absolute inset-x-0 top-[-32px] h-[328px]"
        imgClassName="absolute inset-0 size-full object-cover object-[calc(64%_-_56px)_center]"
        drift={DRIFT}
        swapShown={activeKey === swapKey}
      />

      <Glow
        radius={360}
        sigma={40}
        className="left-1/2 top-[500px] -translate-x-1/2 -translate-y-1/2"
      />

      {/* Same arcs, turned a quarter-turn so they sweep down the band. */}
      <div className="pointer-events-none absolute left-1/2 top-[-118px] flex h-[1174px] w-[480px] -translate-x-1/2 items-center justify-center">
        <img
          loading="lazy"
          decoding="async"
          src="/assets/soliprio/soliprio-pattern.svg"
          alt=""
          aria-hidden
          className="h-[480px] w-[1174px] max-w-none rotate-90"
        />
      </div>

      <div
        data-reveal
        className="absolute left-1/2 top-[174px] flex w-[320px] -translate-x-1/2 flex-col items-center gap-4"
      >
        <Logos variant="mobile" />
        <p className="text-center text-2xl leading-[1.2] tracking-[-0.48px] text-white">
          {title}
        </p>
      </div>

      {/* Full-bleed rail rather than a child of the 320px column: the design
          shows the neighbouring card peeking past the text block's edge, so
          the row has to be able to scroll outside it.

          Masked (not clipped) at both edges — same idiom as the desktop
          coverflow's fade in ProductSection — so a card peeking in from off
          the section dissolves into the dark background instead of being
          guillotined by the band's overflow-clip. `mask-image` paints
          relative to the rail's own box by default, not its scrolled content,
          so the fade stays pinned to the two physical edges through a swipe
          rather than travelling with the cards. */}
      <div
        ref={railRef}
        data-reveal
        // `items-start`, not the flex default `stretch`: the rail is a
        // row-direction flex container, so without this every card would be
        // force-stretched to match its *tallest* sibling on the cross axis —
        // silently cancelling the collapsed card's own height and leaving
        // exactly the dead space underneath it this was meant to remove.
        // `overscroll-none` is the actual bounce fix, and it is a touch-only
        // bug: with just two cards the rail's scroll range is barely wider
        // than the viewport, so nearly every swipe ends at a scroll edge —
        // where iOS applies its elastic rubber-band and chains the leftover
        // momentum onto the page. Desktop DevTools' mobile emulation drives
        // the scroller with wheel/drag events and never rubber-bands, which
        // is why this only ever reproduced on a real phone. ProductSection's
        // carousel never showed it because its clone-padded loop means the
        // scroller has no reachable end to bounce against.
        //
        // `overflow-y-hidden` is spelled out because `overflow-x: auto` alone
        // computes `overflow-y` to `auto` as well, quietly making the rail a
        // *vertical* scroller too — enough that an off-axis thumb swipe drags
        // it a few px down and springs back. Visually identical either way
        // (an `auto` y-axis already clips here), it just removes the axis.
        className="hide-scrollbar absolute inset-x-0 top-[344px] flex snap-x snap-mandatory items-start gap-6 overflow-x-auto overflow-y-hidden overscroll-none px-[calc(50%-99px)] [scrollbar-width:none]"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
        }}
      >
        {cards.map((card) => {
          const isActive = card.key === activeKey;
          return (
            <a
              key={card.key}
              href="#"
              aria-label={card.label}
              // Inactive card: the tap only centres it (a real tap on a phone
              // is already how you'd bring a card into focus, same as
              // ProductSection's carousel), the link itself waits for a
              // second, deliberate tap once it's the one in focus. Active
              // card: default navigation goes through untouched.
              onClick={(e) => {
                if (isActive) return;
                e.preventDefault();
                const rail = railRef.current;
                const el = e.currentTarget;
                rail?.scrollTo({
                  left: el.offsetLeft + el.offsetWidth / 2 - rail.clientWidth / 2,
                  behavior: "smooth",
                });
              }}
              // Same border beam as the desktop cards (`.soliprio-beam` in
              // globals.css), just re-lit here on whichever card is active
              // instead of on hover — there's no pointer to hover with on
              // mobile. Per-card brand color (see BEAM_COLORS) rather than
              // each card's own dominant hue: the mobile card carries no
              // `beam`/`beamRadius` props to source that from.
              {...(isActive ? { "data-beam-live": "" } : {})}
              style={{
                scrollSnapStop: "always",
                "--beam": BEAM_COLORS[card.key] ?? "var(--color-cyan-500)",
                "--beam-radius": "12px",
              } as React.CSSProperties}
              // Snap target, and deliberately the *untransformed* box: the
              // scale-on-active lives on the child div below, because the
              // snap spec folds an element's transform into its snap area —
              // scaling the snapped box itself would keep moving the target
              // the browser is snapping to mid-animation.
              className="w-[220px] shrink-0 snap-center"
            >
              <div
                style={{ transform: isActive ? "scale(1)" : "scale(0.9)" }}
                className={`relative flex flex-col items-center rounded-xl bg-gradient-to-b from-white/12 to-white/4 px-1 pt-1 backdrop-blur-[4px] transition-[transform,padding-bottom] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isActive ? "pb-3" : "pb-1"
                }`}
              >
                <span aria-hidden className="soliprio-beam soliprio-beam--mobile pointer-events-none" />
                <img
                  loading="lazy"
                  decoding="async"
                  src={card.src}
                  alt=""
                  className="aspect-[19/12] w-full object-cover"
                />
                {/* Same collapse as ProductSection's mobile subtitle: a 0fr/1fr
                    grid row, not `height`/`display`, so the transition can
                    animate to an intrinsic height without knowing it up front,
                    and the card visibly grows/shrinks around it rather than the
                    label just appearing. The 8px gap to the image lives on the
                    span's own `pt-2` instead of the parent's flex `gap` — a
                    flex gap stays reserved even for a zero-height row, which
                    would leave a dangling gap on the collapsed card.

                    `pb-3`/`pb-1` above collapses in step with this row (not
                    left fixed): the row alone hitting 0fr still leaves behind
                    whatever bottom padding the chrome itself reserves, so the
                    inactive card would keep a dead strip under the image
                    instead of actually hugging it. `pb-1` still gives the
                    image a matching 4px on both edges rather than sitting
                    flush. */}
                <div
                  className="grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    gridTemplateRows: isActive ? "1fr" : "0fr",
                    opacity: isActive ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <span className="flex items-center justify-center gap-1 whitespace-nowrap pt-2 text-sm font-semibold leading-5 text-white">
                      {card.label}
                      <ArrowRight />
                    </span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
