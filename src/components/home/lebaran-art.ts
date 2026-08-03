/**
 * Canvas art for the Lebaran / Ramadan promo dressing.
 *
 * Same arrangement as the other seasonal art files: plain 2D canvas here,
 * three.js in the scene. Everything is drawn shaded rather than flat — the
 * three scenes beside this one are shaded too, and the faceting on the lantern
 * and the bevel on the crescent only read if there is light to catch.
 */

const TAU = Math.PI * 2;

/* ── lantern skin ─────────────────────────────────────────────────────── */

/** Facets around the lantern body — you see about half of them head-on. */
export const LANTERN_FACETS = 6;

/**
 * The pointed arch a lantern window takes. Two curves meeting at a corner
 * rather than one smooth cap: the corner is the whole point, and a rounded top
 * reads as a porthole instead of an arch.
 */
function archPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const halfW = w / 2;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy + h * 0.5);
  ctx.lineTo(cx - halfW, cy - h * 0.1);
  ctx.quadraticCurveTo(cx - halfW, cy - h * 0.42, cx, cy - h * 0.5);
  ctx.quadraticCurveTo(cx + halfW, cy - h * 0.42, cx + halfW, cy - h * 0.1);
  ctx.lineTo(cx + halfW, cy + h * 0.5);
  ctx.closePath();
}

/**
 * Wraps the lantern body. A cylinder's U runs the whole way round, so each
 * band here becomes one facet, and the collars at top and bottom are painted
 * in rather than modelled — two fewer meshes for the same silhouette.
 *
 * Returns the colour map and a matching emissive mask. The mask is what keeps
 * the glass glowing while the brass frame around it stays metal: an emissive
 * colour applied to the whole body would light the frame up too.
 */
export function drawLanternSkin(facetPx = 72, height = 128) {
  const width = facetPx * LANTERN_FACETS;

  const colour = document.createElement("canvas");
  colour.width = width;
  colour.height = height;
  const cc = colour.getContext("2d")!;

  const glow = document.createElement("canvas");
  glow.width = width;
  glow.height = height;
  const gc = glow.getContext("2d")!;

  // Everything outside a window is dark on the mask, so only the glass lights.
  gc.fillStyle = "#000000";
  gc.fillRect(0, 0, width, height);

  const collar = height * 0.15;
  const windowTop = collar;
  const windowSpan = height - collar * 2;

  for (let f = 0; f < LANTERN_FACETS; f++) {
    const x0 = f * facetPx;

    // The facet itself: bright down the middle, falling off to the seams. This
    // is what gives the body its edges before any lighting touches it.
    const face = cc.createLinearGradient(x0, 0, x0 + facetPx, 0);
    face.addColorStop(0, "#9c7226");
    face.addColorStop(0.18, "#c89a37");
    face.addColorStop(0.5, "#f2d68d");
    face.addColorStop(0.82, "#c89a37");
    face.addColorStop(1, "#9c7226");
    cc.fillStyle = face;
    cc.fillRect(x0, 0, facetPx, height);

    const cx = x0 + facetPx / 2;
    const cy = windowTop + windowSpan / 2;
    const w = facetPx * 0.54;
    const h = windowSpan * 0.88;

    // Glass: hottest at the middle, cooling toward the frame.
    archPath(cc, cx, cy, w, h);
    const pane = cc.createRadialGradient(cx, cy, 0, cx, cy, w * 0.9);
    pane.addColorStop(0, "#fffdf4");
    pane.addColorStop(0.45, "#fff4d0");
    pane.addColorStop(1, "#f0bf5c");
    cc.fillStyle = pane;
    cc.fill();

    // A thin dark reveal around the pane, so the frame reads as holding it.
    archPath(cc, cx, cy, w, h);
    cc.strokeStyle = "rgba(120,86,26,0.6)";
    cc.lineWidth = facetPx * 0.035;
    cc.stroke();

    archPath(gc, cx, cy, w, h);
    const lit = gc.createRadialGradient(cx, cy, 0, cx, cy, w * 0.9);
    lit.addColorStop(0, "#ffffff");
    lit.addColorStop(0.5, "#e8e0c4");
    lit.addColorStop(1, "#6b5f38");
    gc.fillStyle = lit;
    gc.fill();
  }

  // Collars, painted across every facet at once so they read as one band.
  for (const top of [0, height - collar]) {
    const band = cc.createLinearGradient(0, top, 0, top + collar);
    band.addColorStop(0, "#a87f2b");
    band.addColorStop(0.4, "#e6c574");
    band.addColorStop(1, "#8c6a22");
    cc.fillStyle = band;
    cc.fillRect(0, top, width, collar);
  }

  return { colour, glow };
}

/* ── ketupat weave ────────────────────────────────────────────────────── */

/**
 * The plaited skin of a ketupat, wrapped onto its box faces.
 *
 * Drawn axis-aligned: the geometry is turned a quarter-turn to stand on a
 * point, so these cells come out running parallel to the diamond's edges,
 * which is how one is actually plaited.
 *
 * Four cells a side, not seven. At the size these hang on screen a finer weave
 * turns to mush; four with a hard rule between them still reads as plaiting.
 */
export function drawKetupatWeave(size = 256, cells = 4): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const pitch = size / cells;
  const light = ["#8ccc33", "#6cba28"];
  const dark = ["#5aa71f", "#4d9b1e"];

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const alternate = (row + col) % 2 === 0;
      const pair = alternate ? light : dark;
      const x = col * pitch;
      const y = row * pitch;

      // A diagonal ramp across each cell — the strip it stands for is a curved
      // blade of leaf, not a flat tile.
      const shade = ctx.createLinearGradient(x, y, x + pitch, y + pitch);
      shade.addColorStop(0, pair[0]);
      shade.addColorStop(1, pair[1]);
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, pitch, pitch);
    }
  }

  ctx.strokeStyle = "#2e6b12";
  ctx.lineWidth = size * 0.016;
  for (let i = 0; i <= cells; i++) {
    const at = i * pitch;
    ctx.beginPath();
    ctx.moveTo(at, 0);
    ctx.lineTo(at, size);
    ctx.moveTo(0, at);
    ctx.lineTo(size, at);
    ctx.stroke();
  }

  return canvas;
}

/* ── janur tails ──────────────────────────────────────────────────────── */

/**
 * The palm strips left hanging where a ketupat is tied off. Drawn as a sprite
 * rather than modelled: they are flat ribbons seen head-on, so geometry would
 * buy nothing that a drawing does not already give, and this way they can
 * splay and taper for free.
 */
export function drawJanurTails(width = 192, height = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const cx = width / 2;
  const strips: [number, number, number][] = [
    // lean, length, width
    [-0.62, 0.9, 0.09],
    [-0.24, 0.72, 0.075],
    [0.2, 0.95, 0.085],
    [0.58, 0.66, 0.07],
  ];

  for (const [lean, len, thick] of strips) {
    const endX = cx + lean * width * 0.42;
    const endY = height * len;
    const half = width * thick;

    ctx.beginPath();
    ctx.moveTo(cx - half * 0.5, 0);
    ctx.quadraticCurveTo(cx + lean * width * 0.1, height * len * 0.55, endX - half * 0.5, endY);
    // The split tip every janur strip is finished with.
    ctx.lineTo(endX, endY - height * 0.06);
    ctx.lineTo(endX + half * 0.5, endY);
    ctx.quadraticCurveTo(cx + lean * width * 0.1 + half, height * len * 0.55, cx + half * 0.5, 0);
    ctx.closePath();

    const fill = ctx.createLinearGradient(cx, 0, endX, endY);
    fill.addColorStop(0, "#9ad63f");
    fill.addColorStop(0.5, "#6cba28");
    fill.addColorStop(1, "#4d9b1e");
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = "#2e6b12";
    ctx.lineWidth = width * 0.008;
    ctx.stroke();
  }

  return canvas;
}

/* ── drifting stars ───────────────────────────────────────────────────── */

export const STAR_VARIANTS = 4;

/**
 * A star with each arm split down the middle into a lit half and a shaded one.
 *
 * That single seam is what keeps a twelve-pixel star reading as a struck metal
 * object rather than as a yellow dot — the same reason the reference art
 * bevels its stars instead of filling them flat.
 */
function drawFacetedStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  points: number,
  waist: number,
) {
  const at = (index: number) => {
    const a = (index / (points * 2)) * TAU - Math.PI / 2;
    const radius = index % 2 === 0 ? r : r * waist;
    return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius] as const;
  };

  for (let i = 0; i < points * 2; i++) {
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    // Alternating halves catch and lose the light around the star.
    ctx.fillStyle = i % 2 === 0 ? "#fff3cf" : "#d9a83c";
    ctx.fill();
  }
}

export function drawStarAtlas(cell = 128): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cell * 2;
  canvas.height = cell * 2;
  const ctx = canvas.getContext("2d")!;

  // A warm bloom on every shape, so a star still reads once the tint has
  // multiplied it down against the band's pale blue.
  ctx.shadowColor = "rgba(217,168,60,0.8)";
  ctx.shadowBlur = cell * 0.06;

  const shapes: [number, number, number][] = [
    // points, waist, radius as a fraction of the cell
    [5, 0.42, 0.33],
    [4, 0.2, 0.34],
    [5, 0.46, 0.24],
    [4, 0.5, 0.17],
  ];

  shapes.forEach(([points, waist, radius], i) => {
    const cx = (i % 2) * cell + cell / 2;
    const cy = Math.floor(i / 2) * cell + cell / 2;
    drawFacetedStar(ctx, cx, cy, cell * radius, points, waist);
  });

  return canvas;
}


