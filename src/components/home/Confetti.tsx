"use client";

import type { CSSProperties } from "react";

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

export default function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px] overflow-hidden">
      {PIECES.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
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
