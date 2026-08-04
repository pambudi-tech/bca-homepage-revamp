"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// Pure JS + CSS confetti for the top of the Promo section (replaces the old
// static /assets/promo/confetti.png). Pieces are generated once from a seeded
// PRNG so the server and client produce identical markup — no hydration
// mismatch, and the confetti is painted on the very first frame. All motion is
// CSS: confetti-fall / confetti-sway / confetti-spin (see globals.css). Each
// piece uses a negative animation-delay so the band is already full on load.

// Confetti palette — BCA blues plus festive accents, matching the artwork.
const COLORS = ["#00b5f0", "#1a7fd6", "#ffba00", "#ffd31c", "#fe6706", "#13b5a3", "#e0313c", "#9531a5"];

// mulberry32 — tiny deterministic PRNG so both renders agree.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Piece = {
  id: number;
  isRibbon: boolean;
  color: string;
  left: number;
  w: number;
  h: number;
  scale: number;
  fall: number;
  dur: number;
  delay: number;
  swayDur: number;
  sway: number;
  spinDur: number;
  sx: string;
  sy: string;
  sz: string;
};

type BuntingFlag = {
  id: number;
  left: number;
  top: number;
  color: string;
  turn: number;
};

const rand = mulberry32(20260714);

const PIECES: Piece[] = Array.from({ length: 66 }, (_, id) => {
  const dur = 4.5 + rand() * 4; // 4.5–8.5s
  return {
    id,
    isRibbon: rand() < 0.24,
    color: COLORS[Math.floor(rand() * COLORS.length)],
    left: rand() * 100,
    w: 5 + Math.round(rand() * 6), // 5–11px
    h: 8 + Math.round(rand() * 8), // 8–16px
    scale: 0.7 + rand() * 0.6, // ribbons: 0.7–1.3×
    fall: 360 + Math.round(rand() * 180), // 360–540px
    dur,
    delay: -(rand() * dur), // negative → mid-flight on first paint
    swayDur: 1.6 + rand() * 1.8, // 1.6–3.4s
    sway: 12 + Math.round(rand() * 30), // 12–42px
    spinDur: 1.1 + rand() * 2.2, // 1.1–3.3s
    sx: (rand() * 2 - 1).toFixed(2),
    sy: (rand() * 2 - 1).toFixed(2),
    sz: (rand() * 0.8 - 0.4).toFixed(2),
  };
});

/** Fixed celebration bunting that shares the confetti palette. */
function createBunting(count: number, top: number, sag: number, swags: number): BuntingFlag[] {
  return Array.from({ length: count }, (_, id) => {
    const progress = (id + 0.5) / count;
    const withinSwag = (progress * swags) % 1;
    return {
      id,
      left: progress * 100,
      // Match the shallow individual swag beneath this flag, rather than one
      // oversized arc across the entire promo band.
      top: top + sag * 4 * withinSwag * (1 - withinSwag),
      color: COLORS[(id * 5 + 1) % COLORS.length],
      // Follow the string's tangent: clockwise on the falling side of a swag,
      // level at its low point, then back up with the return slope.
      turn: (1 - 2 * withinSwag) * 12,
    };
  });
}

const DESKTOP_BUNTING = createBunting(18, 0, 40, 3);
const MOBILE_BUNTING = createBunting(12, 0, 30, 2);
const SMALL_BUNTING = createBunting(8, 0, 30, 1);

function Bunting({
  flags,
  swags,
  mobile = false,
  visibilityClass,
}: {
  flags: BuntingFlag[];
  swags: number;
  mobile?: boolean;
  visibilityClass: string;
}) {
  const top = 0;
  const sag = mobile ? 30 : 40;
  const height = mobile ? 58 : 86;
  const flagWidth = mobile ? 27 : 36;
  const flagHeight = mobile ? 21 : 28;
  const stringPath = Array.from({ length: swags }, (_, i) => {
    const start = (i / swags) * 100;
    const end = ((i + 1) / swags) * 100;
    return `${i === 0 ? `M${start} ${top}` : ""} Q${(start + end) / 2} ${top + sag * 2} ${end} ${top}`;
  }).join("");

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 ${mobile ? "h-[58px]" : "h-[86px]"} ${visibilityClass}`}>
      <svg aria-hidden viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d={stringPath} fill="none" stroke={COLORS[1]} strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
      </svg>
      {flags.map((flag) => (
        <svg
          key={flag.id}
          aria-hidden
          width={flagWidth}
          height={flagHeight}
          viewBox={`0 0 ${flagWidth} ${flagHeight}`}
          className="absolute"
          style={
            {
              left: `${flag.left}%`,
              top: `${flag.top}px`,
              transform: `translateX(-50%) rotate(${flag.turn}deg)`,
            } as CSSProperties
          }
        >
          <path d={`M0 0H${flagWidth}L${flagWidth / 2} ${flagHeight}Z`} fill={flag.color} />
        </svg>
      ))}
    </div>
  );
}

export default function Confetti() {
  const ref = useRef<HTMLDivElement>(null);

  // Runs the pieces only while the band is on screen. 66 pieces x 3 nested
  // infinite animations is 198 of them, each pinned to its own compositor
  // layer by `will-change` — left alone they run for the whole life of the
  // page even though this band sits well below the fold. Flipping
  // `data-confetti-live` lets CSS park them instead (see globals.css).
  //
  // The margin starts them slightly before the band scrolls in, so the pieces
  // are already in flight on arrival rather than visibly unfreezing.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => el.toggleAttribute("data-confetti-live", entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px] overflow-hidden">
      <Bunting flags={SMALL_BUNTING} swags={1} mobile visibilityClass="hidden max-[640px]:block" />
      <Bunting flags={MOBILE_BUNTING} swags={2} mobile visibilityClass="hidden min-[641px]:block xl:hidden" />
      <Bunting flags={DESKTOP_BUNTING} swags={3} visibilityClass="hidden xl:block" />
      {PIECES.map((p) => (
        <span
          key={p.id}
          // The full 66 pieces are tuned for the desktop-width band; on a
          // phone the same count lands in a much narrower strip and reads as
          // crowded, so every third piece drops out below the desktop
          // breakpoint (id % 3 keeps them spread through the set, not just
          // trimmed off one end).
          className={`confetti-piece ${p.id % 3 === 0 ? "max-xl:hidden" : ""}`}
          style={
            {
              left: `${p.left}%`,
              "--confetti-fall": `${p.fall}px`,
              "--confetti-dur": `${p.dur}s`,
              "--confetti-delay": `${p.delay}s`,
            } as CSSProperties
          }
        >
          <span
            className="confetti-sway"
            style={{ "--confetti-sway": `${p.sway}px`, "--confetti-sway-dur": `${p.swayDur}s` } as CSSProperties}
          >
            <span
              className="confetti-spin"
              style={{ "--confetti-spin-dur": `${p.spinDur}s`, "--sx": p.sx, "--sy": p.sy, "--sz": p.sz } as CSSProperties}
            >
              {p.isRibbon ? (
                <svg
                  width={12 * p.scale}
                  height={24 * p.scale}
                  viewBox="0 0 12 24"
                  fill="none"
                  className="block"
                >
                  <path d="M6 1C1 4.5 11 8 6 12C1 16 11 19.5 6 23" stroke={p.color} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <span className="block rounded-[1px]" style={{ width: p.w, height: p.h, backgroundColor: p.color }} />
              )}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
