"use client";

import { useEffect, useRef, useState } from "react";

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
 */
export default function SoliprioCard({
  src,
  label,
  beam,
  beamRadius,
  beamDelay = "0s",
  swapsPhoto = false,
}: {
  src: string;
  label: string;
  /** Brightened dominant hue of `src`, resolved server-side. */
  beam: string;
  /** The artwork's own corner radius at display size, so the ring sits on
   *  the card's edge instead of cutting across its rounded corners. */
  beamRadius: string;
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
  const cursorRef = useRef<HTMLSpanElement>(null);
  const lastMouseRef = useRef({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  // Writes the follow-cursor pill to wherever the pointer currently is.
  //
  // Measured against the outer <a>, which deliberately carries no transform of
  // its own, so its rect is the card's flat layout box. That makes the result
  // a *local* coordinate inside the tilted element the pill lives in — the
  // browser then puts it through the same rotation as the artwork, so the pill
  // lies on the card's surface and tilts with it rather than floating flat on
  // top. Measuring the tilted element instead would feed the rotation in twice.
  //
  // Centring is left to the `translate` CSS property (the `-translate-x/y-1/2`
  // utilities below) rather than a pixel offset baked in here — a pill's width
  // varies with its label, unlike ProductSection's fixed-diameter circle, so a
  // percentage centre is the only one correct for both cards.
  const positionCursor = () => {
    if (!ref.current || !cursorRef.current) return;
    const box = ref.current.getBoundingClientRect();
    const { x, y } = lastMouseRef.current;
    cursorRef.current.style.transform = `translate3d(${x - box.left}px, ${y - box.top}px, 0)`;
  };

  // Per-frame, not per-move: the card's box shifts under a *stationary* cursor
  // whenever the page scrolls, and only a live re-measure keeps the pill glued
  // through that (mirrors ProductSection's identical follow-cursor badge).
  useEffect(() => {
    if (!isHovered) return;
    let frameId = 0;
    const loop = () => {
      positionCursor();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered]);

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

  const handleEnter = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse") return;
    lastMouseRef.current = { x: event.clientX, y: event.clientY };
    // Positioned immediately rather than waiting for the raf loop's first
    // tick, so the pill doesn't visibly start its fade-in from a stale spot.
    positionCursor();
    setIsHovered(true);
  };

  const handleMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    // A coarse pointer has no meaningful hover position, and this card only
    // renders on desktop anyway — guard so a tap can't leave it stuck tilted.
    if (event.pointerType !== "mouse") return;
    lastMouseRef.current = { x: event.clientX, y: event.clientY };
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
    setIsHovered(false);
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
    // has to stay flat because it is what `positionCursor` measures against.
    <a
      ref={ref}
      href="#"
      aria-label={label}
      {...(swapsPhoto ? { "data-swaps-photo": "" } : {})}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`soliprio-stage relative block h-[200px] w-[311.25px] shrink-0 ${
        isHovered ? "cursor-none" : "cursor-pointer"
      }`}
    >
      <div
        ref={cardRef}
        className="soliprio-card relative size-full"
        style={
          {
            "--beam": beam,
            "--beam-radius": beamRadius,
            "--beam-delay": beamDelay,
          } as React.CSSProperties
        }
      >
        <img
          loading="lazy"
          decoding="async"
          src={src}
          alt=""
          className="size-full object-cover"
        />
        <span
          aria-hidden
          className="soliprio-glare pointer-events-none absolute inset-0"
          style={{
            maskImage: `url(${src})`,
            WebkitMaskImage: `url(${src})`,
          }}
        />
        <span aria-hidden className="soliprio-beam pointer-events-none" />

        {/* Follow-cursor pill — same fill/border/blur recipe as
            ProductSection's circular badge (border-white/25, bg-white/[0.01],
            backdrop-blur-md, the `fade-overlay` show/hide so an invisible
            instance isn't repainted every frame), just a pill instead of a
            disc and sized to spec.

            Sits *inside* the tilted element on purpose, so it rotates with the
            artwork and reads as a label lying on the card's surface. The
            default `transform-style: flat` is what makes that work — the pill
            is rendered into its parent's plane rather than standing up in 3D
            beside it. */}
        <span
          ref={cursorRef}
          aria-hidden
          className="fade-overlay pointer-events-none absolute left-0 top-0 z-30 flex h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-white/25 bg-white/[0.01] px-6 text-base font-semibold text-white shadow-lg backdrop-blur-md"
          data-shown={isHovered ? "true" : "false"}
          style={{ "--fade-ms": "200ms", isolation: "isolate" } as React.CSSProperties}
        >
          {label}
          <ArrowRight />
        </span>
      </div>
    </a>
  );
}
