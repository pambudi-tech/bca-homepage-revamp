"use client";

import { useEffect, useRef } from "react";

/** Peak rotation at the card's corners, in degrees. */
const MAX_TILT = 14;

/** Shared with the mobile carousel card's own CTA row. */
export function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-5 shrink-0">
      <path
        d="M11.47 4.47a.75.75 0 0 1 1.06 0l4.75 4.75a.75.75 0 0 1 0 1.06l-4.75 4.75a.75.75 0 1 1-1.06-1.06l3.47-3.47H3.25a.75.75 0 0 1 0-1.5h11.69l-3.47-3.47a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * A Soliprio product card that tilts toward the pointer with a sheen tracking
 * it. The handlers only write custom properties — `.soliprio-card` in
 * globals.css owns the actual transform and gradient — so a pointermove never
 * touches layout. The card rect is cached on enter for the same reason.
 *
 * The wrapper chrome (fill, border beam, label row) mirrors the mobile
 * carousel card's own frame in SoliprioMobile.tsx, so the label reads at rest
 * instead of only surfacing on hover.
 */
export default function SoliprioCard({
  src,
  label,
  beam,
  beamDelay = "0s",
  swapsPhoto = false,
}: {
  src: string;
  label: string;
  /** Brightened dominant hue of `src`, resolved server-side. */
  beam: string;
  beamDelay?: string;
  /** Marks this card as owning the band's alternate backdrop. Hovering it
   *  cross-fades the photo — done with `:has()` in CSS rather than lifted
   *  state, so the band stays server-rendered. */
  swapsPhoto?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  // The tilted inner div. Kept separate from `ref` on purpose: the tilt/sheen
  // custom properties have to be written *here*, because `.soliprio-card`
  // declares its own `--rx`/`--ry`/`--mx`/`--my` defaults and a declaration on
  // the element itself beats one inherited from the anchor.
  const cardRef = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);

  // Runs the border beam only while the card is on screen.
  //
  // The beam animates a conic gradient's angle — a *paint* property, pushed
  // through three stacked drop-shadow (blur) passes. Left alone it repaints
  // every frame for the whole life of the page, however far off-screen the
  // section is. Flipping `data-beam-live` lets CSS park it instead.
  //
  // The margin starts it slightly before the card scrolls in, so it is already
  // mid-sweep on arrival rather than visibly kicking off from a frozen angle.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => el.toggleAttribute("data-beam-live", entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    // A coarse pointer has no meaningful hover position, and this card only
    // renders on desktop anyway — guard so a tap can't leave it stuck tilted.
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    const card = cardRef.current;
    if (!el || !card) return;

    // Measured on the first move of a hover rather than on enter: the card can
    // be under the cursor without ever receiving an enter (it drifts with the
    // section's parallax), and a stale null there would silently kill the tilt.
    // Cleared again on leave, so it stays one rect read per hover. Read off the
    // anchor, which never tilts — the inner div's box would already carry the
    // rotation and feed it back in.
    rect.current ??= el.getBoundingClientRect();
    const box = rect.current;

    // 0..1 across the card; 0.5/0.5 is dead centre and stays flat.
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;

    card.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
    card.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
    // Pointer below centre tips the near edge toward the reader, so rotateX
    // takes the inverted axis while rotateY follows the cursor directly.
    card.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    rect.current = null;
    // Tilt only. `--mx`/`--my` deliberately stay where the pointer left: the
    // sheen is still fading out at that moment, so recentring them would slide
    // a visible highlight into the middle of the card on the way out. The next
    // hover repositions them from its own first move, which lands in the same
    // task as the pointerenter — the fade-in never shows a stale spot.
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  return (
    // The tilt transform lives on the inner div, not here: this outer `<a>`
    // has to stay flat because it is what the tilt math measures against.
    <a
      ref={ref}
      href="#"
      aria-label={label}
      {...(swapsPhoto ? { "data-swaps-photo": "" } : {})}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="soliprio-stage relative inline-block shrink-0 cursor-pointer"
    >
      <div
        ref={cardRef}
        className="soliprio-card relative flex flex-col items-center gap-3 rounded-xl bg-gradient-to-b from-white/12 to-white/4 px-2 pt-2 pb-4 backdrop-blur-[4px]"
        style={
          {
            "--beam": beam,
            "--beam-radius": "12px",
            "--beam-delay": beamDelay,
          } as React.CSSProperties
        }
      >
        <div className="relative h-[200px] w-[311.25px] overflow-hidden rounded-lg">
          <img
            loading="lazy"
            decoding="async"
            src={src}
            alt=""
            className="size-full object-cover"
          />
          {/* Masked with the card art's own alpha channel, so the sheen stops
              at the rounded silhouette instead of squaring off over its
              transparent corners. */}
          <span
            aria-hidden
            className="soliprio-glare pointer-events-none absolute inset-0"
            style={{
              maskImage: `url(${src})`,
              WebkitMaskImage: `url(${src})`,
            }}
          />
        </div>

        {/* Border beam now traces the whole wrapper (fill + label row), not
            just the artwork, so it reads as one card rather than ringing the
            photo alone. */}
        <span aria-hidden className="soliprio-beam pointer-events-none" />

        <span className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold leading-5 text-white">
          {label}
          <ArrowRight />
        </span>
      </div>
    </a>
  );
}
