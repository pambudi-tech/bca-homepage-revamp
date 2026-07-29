/**
 * Canvas art for the Christmas promo dressing.
 *
 * Kept out of ChristmasDecor.tsx so the drawing stays plain 2D canvas with no
 * three.js in sight — these helpers just hand back a <canvas>, which the scene
 * wraps in a texture. Generating the flakes here (rather than shipping a PNG)
 * keeps them crisp at any density and costs one paint on mount.
 */

/**
 * One arm of a snowflake. Everything is a fraction of the arm's length, so a
 * spec draws identically at any radius.
 */
type FlakeSpec = {
  /** Side branches: how far along the arm, how long, how far off-axis (rad). */
  branches: { at: number; len: number; spread: number }[];
  /** Small diamond "plates" threaded onto the arm. */
  plates: { at: number; size: number }[];
  /** Hexagonal hub at the centre; 0 leaves the middle open. */
  hub: number;
};

/**
 * Four flakes with visibly different silhouettes — a dendrite, a plated
 * stellar, a stubby star and a fern. Four is enough that a drifting field
 * never reads as one shape repeated, and it fits a 2x2 atlas exactly.
 */
const FLAKES: FlakeSpec[] = [
  {
    branches: [
      { at: 0.3, len: 0.32, spread: 0.62 },
      { at: 0.54, len: 0.26, spread: 0.62 },
      { at: 0.76, len: 0.19, spread: 0.62 },
      { at: 0.95, len: 0.13, spread: 0.75 },
    ],
    plates: [],
    hub: 0.1,
  },
  {
    branches: [
      { at: 0.42, len: 0.3, spread: 0.68 },
      { at: 0.74, len: 0.22, spread: 0.68 },
    ],
    plates: [
      { at: 0.58, size: 0.11 },
      { at: 0.95, size: 0.08 },
    ],
    hub: 0.14,
  },
  {
    branches: [{ at: 0.66, len: 0.24, spread: 0.85 }],
    plates: [{ at: 0.92, size: 0.13 }],
    hub: 0.2,
  },
  {
    branches: [
      { at: 0.24, len: 0.28, spread: 0.55 },
      { at: 0.44, len: 0.26, spread: 0.55 },
      { at: 0.64, len: 0.22, spread: 0.55 },
      { at: 0.84, len: 0.17, spread: 0.55 },
    ],
    plates: [],
    hub: 0.07,
  },
];

/** How many cells the atlas carries — the shader picks one per flake. */
export const SNOWFLAKE_VARIANTS = FLAKES.length;

/** Draws one six-fold flake centred on (cx, cy) with the current stroke style. */
function strokeFlake(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  spec: FlakeSpec,
  lineWidth: number,
) {
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let arm = 0; arm < 6; arm++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((arm * Math.PI) / 3);

    // Spine plus its symmetric pairs of branches, all in one path so the
    // round joins meet cleanly.
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    for (const b of spec.branches) {
      const y = -r * b.at;
      const dx = Math.sin(b.spread) * r * b.len;
      const dy = Math.cos(b.spread) * r * b.len;
      ctx.moveTo(0, y);
      ctx.lineTo(dx, y - dy);
      ctx.moveTo(0, y);
      ctx.lineTo(-dx, y - dy);
    }
    ctx.stroke();

    for (const p of spec.plates) {
      const y = -r * p.at;
      const s = r * p.size;
      ctx.beginPath();
      ctx.moveTo(0, y - s);
      ctx.lineTo(s * 0.72, y);
      ctx.lineTo(0, y + s);
      ctx.lineTo(-s * 0.72, y);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  if (spec.hub > 0) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      const x = cx + Math.cos(a) * r * spec.hub;
      const y = cy + Math.sin(a) * r * spec.hub;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

/**
 * A 2x2 atlas of the four flakes.
 *
 * Each flake is drawn twice: a wide cold-blue pass first, then a crisp white
 * one on top. The promo band's background is near-white blue, so pure white
 * line art would all but vanish — the blue bloom is what gives it an edge to
 * read against. Art is inset to a third of the cell so mipmap filtering at
 * small sizes can never smear a neighbouring cell into it.
 */
export function drawSnowflakeAtlas(cell = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cell * 2;
  canvas.height = cell * 2;
  const ctx = canvas.getContext("2d")!;
  const r = cell * 0.33;

  FLAKES.forEach((spec, i) => {
    const cx = (i % 2) * cell + cell / 2;
    const cy = Math.floor(i / 2) * cell + cell / 2;

    ctx.strokeStyle = "rgba(126,196,244,0.9)";
    ctx.shadowColor = "rgba(16,104,180,0.8)";
    ctx.shadowBlur = cell * 0.05;
    strokeFlake(ctx, cx, cy, r, spec, cell * 0.024);

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#ffffff";
    strokeFlake(ctx, cx, cy, r, spec, cell * 0.016);
  });

  return canvas;
}

/**
 * One sprig of pine: a stem with needles fanning off it. Written as fractions
 * of the sprig's height so a spec draws the same at any size.
 */
type SprigSpec = {
  /** Sideways bend of the stem at the tip, as a fraction of height. */
  bend: number;
  /** Pairs of needles along the stem. */
  pairs: number;
  /** Needle length at the base, as a fraction of height. */
  reach: number;
  /** How far off vertical the needles sit, radians. */
  spread: number;
};

const SPRIGS: SprigSpec[] = [
  { bend: -0.2, pairs: 12, reach: 0.34, spread: 0.98 },
  { bend: -0.06, pairs: 15, reach: 0.29, spread: 0.86 },
  { bend: 0.1, pairs: 10, reach: 0.38, spread: 1.06 },
  { bend: 0.22, pairs: 14, reach: 0.31, spread: 0.92 },
];

/** How many sprig cells the atlas carries. */
export const SPRIG_VARIANTS = SPRIGS.length;

/**
 * Draws one sprig standing on (cx, base) and reaching `h` upward. Greyscale on
 * purpose: the scene tints each instance its own green, so what the texture
 * carries is the *shading* — needle edges darker, spines brighter — not colour.
 */
function strokeSprig(ctx: CanvasRenderingContext2D, cx: number, base: number, h: number, spec: SprigSpec) {
  // A stem that leans as it rises, so a field of sprigs never looks combed.
  const stemAt = (t: number) => ({ x: cx + spec.bend * h * t * t, y: base - h * t });

  ctx.lineCap = "round";

  // Two passes per element: a wide dim one that becomes the needle's shaded
  // edge once tinted, then a narrow bright one down its middle.
  const passes = [
    { width: 1, alpha: 0.62, level: 150 },
    { width: 0.46, alpha: 0.95, level: 255 },
  ];

  for (const pass of passes) {
    ctx.strokeStyle = `rgba(${pass.level},${pass.level},${pass.level},${pass.alpha})`;

    ctx.lineWidth = h * 0.036 * pass.width;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const p = stemAt(i / 16);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    ctx.lineWidth = h * 0.026 * pass.width;
    ctx.beginPath();
    for (let i = 0; i < spec.pairs; i++) {
      // Jitter is a plain hash of the index — deterministic, and enough to
      // stop the needles reading as a comb.
      const jitter = (n: number) => (Math.sin((i + 1) * n) * 43758.5453) % 1;
      const t = 0.05 + (i / spec.pairs) * 0.93;
      const p = stemAt(t);
      // Needles shorten toward the tip, the way a real sprig tapers.
      const len = h * spec.reach * (1 - t * 0.72) * (0.82 + Math.abs(jitter(12.9898)) * 0.36);

      for (const side of [-1, 1]) {
        const angle = spec.spread + jitter(side * 78.233) * 0.3;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.sin(angle) * len * side, p.y - Math.cos(angle) * len);
      }
    }
    ctx.stroke();
  }
}

/**
 * A 2x2 atlas of pine sprigs, each standing on the bottom edge of its cell —
 * the scene rotates instances about that point, so the pivot has to be where
 * the sprig would actually join the branch.
 */
export function drawSprigAtlas(cell = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cell * 2;
  canvas.height = cell * 2;
  const ctx = canvas.getContext("2d")!;

  SPRIGS.forEach((spec, i) => {
    const cx = (i % 2) * cell + cell / 2;
    const base = (Math.floor(i / 2) + 1) * cell - cell * 0.04;
    strokeSprig(ctx, cx, base, cell * 0.88, spec);
  });

  return canvas;
}

// The reflection sky the ribbon and berries use now lives in decor-kit, next
// to the canvas that sets it up — every seasonal scene wants the same one.
