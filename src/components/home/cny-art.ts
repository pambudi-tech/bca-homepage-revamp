/**
 * Canvas art for the Lunar New Year promo dressing.
 *
 * Same arrangement as christmas-art: plain 2D canvas in here, three.js in the
 * scene file. Two of these atlases carry their own colour rather than being
 * tinted per instance — a blossom is pink petals *and* a gold stamen at once,
 * and no single instance tint can say both, so the variety is baked into the
 * cells instead and instances only vary in brightness.
 */

const TAU = Math.PI * 2;

/* ── blossoms ─────────────────────────────────────────────────────────── */

type BlossomTone = {
  /** Centre of a petal. */
  petal: string;
  /** Its outer edge — plum petals deepen away from the middle. */
  petalDeep: string;
  /** Petal outline, and the dot at the very centre. */
  edge: string;
};

const BLOSSOM_TONES: BlossomTone[] = [
  { petal: "#fffbfc", petalDeep: "#ffdae5", edge: "#eda6bf" },
  { petal: "#ffe0ea", petalDeep: "#ffa9c5", edge: "#e2769c" },
  { petal: "#ffb6cf", petalDeep: "#f4789f", edge: "#cc4c78" },
];

const STAMEN_GOLD = "#e0ae35";
const STAMEN_TIP = "#fff3c4";

/** Three tones x three stages of opening, laid out as a 3x3 atlas. */
export const BLOSSOM_VARIANTS = 9;

/**
 * One open flower. Petals are drawn as five overlapping discs, each with its
 * own outline — the seams where they cross are what separate the petals, so
 * the shape reads as a flower rather than a blob at fifteen pixels across.
 */
function drawBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tone: BlossomTone,
  petals: number,
  openness: number,
) {
  ctx.lineWidth = Math.max(1, r * 0.045);
  ctx.strokeStyle = tone.edge;

  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * TAU - Math.PI / 2;
    const px = cx + Math.cos(a) * r * 0.5 * openness;
    const py = cy + Math.sin(a) * r * 0.5 * openness;
    const size = r * 0.47;

    const fill = ctx.createRadialGradient(px, py, size * 0.1, px, py, size);
    fill.addColorStop(0, tone.petal);
    fill.addColorStop(1, tone.petalDeep);
    ctx.fillStyle = fill;

    ctx.beginPath();
    ctx.arc(px, py, size, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  // Stamens: a spray of fine filaments with a pollen dot on each tip.
  ctx.strokeStyle = STAMEN_GOLD;
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  ctx.lineCap = "round";
  const filaments = 9;
  ctx.beginPath();
  for (let i = 0; i < filaments; i++) {
    const a = (i / filaments) * TAU + 0.24;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r * 0.33, cy + Math.sin(a) * r * 0.33);
  }
  ctx.stroke();

  ctx.fillStyle = STAMEN_TIP;
  for (let i = 0; i < filaments; i++) {
    const a = (i / filaments) * TAU + 0.24;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.35, cy + Math.sin(a) * r * 0.35, r * 0.055, 0, TAU);
    ctx.fill();
  }

  ctx.fillStyle = tone.edge;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.1, 0, TAU);
  ctx.fill();
}

/** A closed bud — two or three overlapping discs in the tone's deepest pink. */
function drawBud(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, tone: BlossomTone) {
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.strokeStyle = tone.edge;

  const lobes: [number, number, number][] = [
    [-0.16, 0.08, 0.34],
    [0.15, 0.05, 0.32],
    [0, -0.14, 0.36],
  ];
  for (const [dx, dy, size] of lobes) {
    const px = cx + dx * r;
    const py = cy + dy * r;
    const fill = ctx.createRadialGradient(px, py, size * r * 0.1, px, py, size * r);
    fill.addColorStop(0, tone.petalDeep);
    fill.addColorStop(1, tone.edge);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(px, py, size * r, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}

export function drawBlossomAtlas(cell = 200): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cell * 3;
  canvas.height = cell * 3;
  const ctx = canvas.getContext("2d")!;

  BLOSSOM_TONES.forEach((tone, toneIndex) => {
    for (let form = 0; form < 3; form++) {
      const index = toneIndex * 3 + form;
      const cx = (index % 3) * cell + cell / 2;
      const cy = Math.floor(index / 3) * cell + cell / 2;

      if (form === 0) drawBloom(ctx, cx, cy, cell * 0.34, tone, 5, 1);
      else if (form === 1) drawBloom(ctx, cx, cy, cell * 0.28, tone, 5, 0.72);
      else drawBud(ctx, cx, cy, cell * 0.3, tone);
    }
  });

  return canvas;
}

/* ── falling petals ───────────────────────────────────────────────────── */

const PETAL_TONES: [string, string, string][] = [
  ["#fffdfe", "#ffdbe6", "#f0aec4"],
  ["#fff0f5", "#ffc2d7", "#e88ead"],
  ["#ffdde8", "#ffa8c4", "#dd6f96"],
  ["#fff6fa", "#ffcfe0", "#e79dba"],
];

export const PETAL_VARIANTS = 4;

export function drawPetalAtlas(cell = 128): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cell * 2;
  canvas.height = cell * 2;
  const ctx = canvas.getContext("2d")!;

  PETAL_TONES.forEach(([light, mid, edge], i) => {
    const cx = (i % 2) * cell + cell / 2;
    const cy = Math.floor(i / 2) * cell + cell / 2;
    const w = cell * 0.28;
    const h = cell * 0.36;
    // Every other petal leans, so a drifting field never looks stamped.
    const lean = i % 2 === 0 ? 1 : 0.82;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(w * lean, h * 0.45, w, -h * 0.35, w * 0.34, -h);
    // The notch at the wide end — the one detail that says petal and not seed.
    ctx.lineTo(0, -h * 0.66);
    ctx.lineTo(-w * 0.34, -h);
    ctx.bezierCurveTo(-w, -h * 0.35, -w * lean, h * 0.45, 0, h);
    ctx.closePath();

    const fill = ctx.createLinearGradient(0, h, 0, -h);
    fill.addColorStop(0, mid);
    fill.addColorStop(0.55, light);
    fill.addColorStop(1, mid);
    ctx.fillStyle = fill;
    // A deeper rim, for the same reason the snowflakes get a blue one: pale
    // pink on a near-white blue band has nothing to read against otherwise.
    ctx.strokeStyle = edge;
    ctx.lineWidth = cell * 0.014;
    ctx.shadowColor = edge;
    ctx.shadowBlur = cell * 0.05;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // A single crease down the middle gives the flat shape some turn.
    ctx.beginPath();
    ctx.moveTo(0, h * 0.82);
    ctx.quadraticCurveTo(w * 0.1, 0, 0, -h * 0.7);
    ctx.strokeStyle = edge;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = cell * 0.01;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  });

  return canvas;
}

/* ── auspicious clouds ────────────────────────────────────────────────── */

export const CLOUD_VARIANTS = 4;

/**
 * A xiangyun scroll, drawn as an outline rather than a solid: a curl at one
 * end, a run of scallops along the top, and a tail sweeping out below. It sits
 * far behind everything at low opacity, so it needs to read as a motif at a
 * glance and never compete for attention.
 */
function drawXiangyun(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, bumps: number) {
  ctx.lineWidth = r * 0.085;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // The scallops.
  ctx.beginPath();
  for (let i = 0; i < bumps; i++) {
    const t = bumps === 1 ? 0.5 : i / (bumps - 1);
    const x = cx + (t - 0.5) * r * 1.5;
    const y = cy - Math.sin(t * Math.PI) * r * 0.14;
    ctx.arc(x, y, r * (0.44 - Math.abs(t - 0.45) * 0.2), Math.PI * 1.04, Math.PI * 1.99);
  }
  ctx.stroke();

  // The curl the whole motif hangs off.
  ctx.beginPath();
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = Math.PI * 0.9 + t * Math.PI * 2.5;
    const rad = r * 0.36 * (1 - t * 0.8);
    const x = cx - r * 0.88 + Math.cos(a) * rad;
    const y = cy + r * 0.2 + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // The tail underneath.
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.48, cy + r * 0.44);
  ctx.quadraticCurveTo(cx + r * 0.16, cy + r * 0.66, cx + r * 0.9, cy + r * 0.26);
  ctx.stroke();
}

export function drawCloudAtlas(cell = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cell * 2;
  canvas.height = cell * 2;
  const ctx = canvas.getContext("2d")!;

  ctx.strokeStyle = "#d9ad4e";
  const shapes = [3, 2, 4, 3];
  shapes.forEach((bumps, i) => {
    const cx = (i % 2) * cell + cell / 2;
    const cy = Math.floor(i / 2) * cell + cell / 2;
    ctx.save();
    ctx.translate(cx, cy);
    if (i % 2 === 1) ctx.scale(-1, 1); // mirrored copies, for free variety
    drawXiangyun(ctx, 0, 0, cell * 0.3, bumps);
    ctx.restore();
  });

  return canvas;
}

/* ── lantern skin ─────────────────────────────────────────────────────── */

/**
 * Wraps the lantern body. A lathe's U runs the whole way round, so vertical
 * bands in this image become the lantern's ribs — cheaper and steadier than
 * modelling them, and they slide correctly as the lantern swings.
 */
export function drawLanternSkin(width = 256, height = 128): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#d0202c";
  ctx.fillRect(0, 0, width, height);

  // Lit from within, so the middle of the body glows warmer than its ends.
  const belly = ctx.createLinearGradient(0, 0, 0, height);
  belly.addColorStop(0, "rgba(96,10,20,0.55)");
  belly.addColorStop(0.5, "rgba(255,78,85,0.32)");
  belly.addColorStop(1, "rgba(96,10,20,0.55)");
  ctx.fillStyle = belly;
  ctx.fillRect(0, 0, width, height);

  const ribs = 10;
  for (let i = 0; i < ribs; i++) {
    const x = (i / ribs) * width;
    const seam = ctx.createLinearGradient(x - width * 0.02, 0, x + width * 0.02, 0);
    seam.addColorStop(0, "rgba(126,20,24,0)");
    seam.addColorStop(0.5, "rgba(126,20,24,0.75)");
    seam.addColorStop(1, "rgba(126,20,24,0)");
    ctx.fillStyle = seam;
    ctx.fillRect(x - width * 0.02, 0, width * 0.04, height);

    ctx.fillStyle = "rgba(240,198,110,0.75)";
    ctx.fillRect(x - width * 0.003, 0, width * 0.006, height);
  }

  return canvas;
}

/* ── tassel ───────────────────────────────────────────────────────────── */

/**
 * The tassel under a lantern, as a sprite. It is a flat, fibrous thing seen
 * head-on, so geometry would buy nothing that a drawn one does not already
 * give — and this way the strands can splay and taper for free.
 */
export function drawTassel(width = 128, height = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const cx = width / 2;
  const knotY = height * 0.16;

  // Cord from the lantern down to the knot.
  ctx.strokeStyle = "#c9962f";
  ctx.lineWidth = width * 0.045;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, knotY);
  ctx.stroke();

  // Strands, splaying a little and tapering to a point.
  const strands = 11;
  ctx.lineCap = "round";
  for (let i = 0; i < strands; i++) {
    const t = i / (strands - 1) - 0.5;
    const endX = cx + t * width * 0.62;
    const endY = height * (0.93 - Math.abs(t) * 0.16);

    const fibre = ctx.createLinearGradient(cx, knotY, endX, endY);
    fibre.addColorStop(0, "#f0cf7a");
    fibre.addColorStop(0.55, "#dcae43");
    fibre.addColorStop(1, "#b8862a");
    ctx.strokeStyle = fibre;
    ctx.lineWidth = width * (0.055 - Math.abs(t) * 0.018);

    ctx.beginPath();
    ctx.moveTo(cx, knotY);
    ctx.quadraticCurveTo(cx + t * width * 0.2, height * 0.55, endX, endY);
    ctx.stroke();
  }

  // The knot last, so it sits over the tops of the strands.
  const knot = ctx.createRadialGradient(cx - width * 0.05, knotY - width * 0.05, 1, cx, knotY, width * 0.19);
  knot.addColorStop(0, "#ffeeb4");
  knot.addColorStop(0.6, "#e2b448");
  knot.addColorStop(1, "#a9781f");
  ctx.fillStyle = knot;
  ctx.beginPath();
  ctx.ellipse(cx, knotY, width * 0.19, width * 0.16, 0, 0, TAU);
  ctx.fill();

  return canvas;
}
