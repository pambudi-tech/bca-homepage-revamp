"use client";

import { useEffect, useRef } from "react";
import type * as THREE_NS from "three";
import { SNOWFLAKE_VARIANTS, SPRIG_VARIANTS, drawSnowflakeAtlas, drawSprigAtlas } from "./christmas-art";
import {
  between,
  clamp,
  createDrift,
  createFramePath,
  createGlow,
  createRootedSprites,
  framePathSampler,
  mountDecor,
  mulberry32,
  type DecorContext,
  type DriftBand,
  type Three,
} from "./decor-kit";

/**
 * Christmas dressing for the Promo section — the seasonal stand-in for
 * Confetti. One WebGL canvas carries the whole scene:
 *
 *   • snow — six-fold flakes (not dots) in three depth bands that fall, drift
 *     and tumble at their own rates
 *   • garland — a pine swag that frames the section: down one edge, round the
 *     corner, swagged across the top, and down the other
 *   • lights — warm amber points threaded *between* two layers of foliage, so
 *     the front sprigs half-cover them and they read as woven in rather than
 *     stuck on
 *   • bows — satin ribbon tied at every anchor, tails swinging
 *   • bells — gold, a pair tied into the bottom of each swag so they land in
 *     the gap between every pair of bows
 *   • berries — clusters of red tucked into the needles
 *
 * The canvas, the drifting sprites, the glow points and the run loop all come
 * from decor-kit; what is here is only what makes this scene Christmas.
 */

/* ── snow ─────────────────────────────────────────────────────────────── */

/** One flake per this much section area, so density holds as the section grows. */
const SNOW_AREA_PER_FLAKE = 9200;
const SNOW_COUNT_RANGE: [number, number] = [36, 170];
const SNOW_MARGIN = 70;

/** Behind the garland: the small, crisp layers that carry most of the depth. */
const SNOW_BACK: DriftBand[] = [
  { share: 0.58, size: [7, 13], speed: [15, 25], drift: [10, 26], alpha: 0.62, spin: 0.3 },
  { share: 0.42, size: [14, 23], speed: [24, 38], drift: [16, 38], alpha: 0.8, spin: 0.24 },
];
/** In front of everything: big, faint and quick — reads as out-of-focus foreground. */
const SNOW_FRONT: DriftBand[] = [
  { share: 1, size: [28, 46], speed: [44, 68], drift: [22, 50], alpha: 0.28, spin: 0.18 },
];
/** Share of the flake budget spent on that foreground layer. */
const SNOW_FRONT_SHARE = 0.16;

/* ── the frame the garland follows ────────────────────────────────────── */

/**
 * Every garland measurement below is drawn for a section this wide and scaled
 * from there. Without it a phone gets the desktop garland crammed into a third
 * of the width — needles the size of the headline, one enormous bow. The floor
 * stops it shrinking into a thin green thread on the narrowest screens.
 */
const REFERENCE_WIDTH = 1280;
const SCALE_RANGE: [number, number] = [0.58, 1];

/** How far below the section's top edge the run is pinned, px. */
const GARLAND_TOP = 6;
/**
 * Below this width the side legs are dropped and the top run simply bleeds off
 * both edges. A phone has no spare horizontal room for a frame — the legs
 * would sit on the cards rather than beside them.
 */
const FRAME_MIN_WIDTH = 900;
/** How far in from the section's edge the legs hang, px. */
const FRAME_INSET = 30;
/** Radius of the turn from leg to top run, px. */
const FRAME_CORNER = 78;
/** Leg length, clamped against the section's own height. */
const FRAME_DROP: [number, number] = [150, 240];
/** How far the top run overshoots each edge when there are no legs. */
const GARLAND_OVERHANG = 110;

/** Target width of one swag, px — the count is derived from this, and with it
 *  the number of ties, and with those the number of bows. */
const SWAG_TARGET = 380;
/** Droop at the middle of a swag, px. Held back deliberately: the foliage adds
 *  another ~50px below the branch, and the section's own heading starts below
 *  that, so a deeper swag starts eating the copy. */
const SWAG_SAG: [number, number] = [58, 82];
/** Fullness of the catenary: higher pinches the ends and flattens the bottom. */
const SWAG_TENSION = 2.2;

/** The branch is meant to be *found*, not seen. */
const CORD_RADIUS = 0.6;
const CORD_COLOR = 0x24422c;

/* ── foliage ──────────────────────────────────────────────────────────── */

/** Distance along the branch between sprigs, px. Small — they must overlap
 *  heavily, or the garland reads as a wire with tinsel on it. */
const SPRIG_SPACING = 2.9;
/** How far a sprig's root strays off the branch, px. Sets the garland's bulk. */
const SPRIG_SPREAD = 17;
/** Sprig height on screen, px. */
const SPRIG_SIZE: [number, number] = [30, 52];
/** Portion of sprigs in the dark layer behind the lights. Weighted to the back
 *  so the front layer stays open enough for the lights to shine through it. */
const FOLIAGE_BACK_SHARE = 0.68;

/** Needle greens, back layer then front — the tint each instance multiplies by. */
const FOLIAGE_BACK_TINTS = [0x16402a, 0x1b4a2f, 0x21563a];
const FOLIAGE_FRONT_TINTS = [0x2f7a45, 0x3d8b4d, 0x519f5c, 0x2a6b3e];
/** A few pale sprigs sit on top as a dusting of settled snow. */
const FROST_SHARE = 0.07;
const FROST_TINT = 0xdcecf4;

/* ── lights ───────────────────────────────────────────────────────────── */

/** Distance along the branch between fairy lights, px. Wide enough that the
 *  halos stay separate points — packed tighter they merge into one glowing
 *  rope, which just redraws the branch line in amber. */
const LIGHT_SPACING = 34;
/** How far a light strays off the branch, px — they sit inside the foliage. */
const LIGHT_SPREAD = 15;
/** Warm amber. On this band's blue background it is the complement, so it
 *  reads as light without having to be blindingly bright. */
const LIGHT_COLOR = 0xffb830;
const LIGHT_SIZE: [number, number] = [19, 31];

/* ── berries ──────────────────────────────────────────────────────────── */

/** One cluster per this much branch length, px. */
const BERRY_SPACING = 190;
const BERRY_PER_CLUSTER = 3;
const BERRY_RADIUS: [number, number] = [3.4, 5.2];

/* ── bows ─────────────────────────────────────────────────────────────── */

/** The bow art is drawn ~132 wide, so this is well under 1 — see `bowLoop`. */
const BOW_SCALE = 0.62;
/** How far below the tie the bow's centre sits. The branch runs along the very
 *  top edge of the section, so a bow centred on it would have its loops
 *  guillotined; hung just under, it sits in the foliage where it belongs. */
const BOW_DROP = 30;
/** The ribbon's own red, plus a deeper one for the pieces that sit underneath
 *  — the far tail and the knot — so the bow keeps its layering even where the
 *  lighting alone would not separate them. */
const RIBBON_COLOR = 0xe8452c;
const RIBBON_DEEP = 0xc42a19;

/* ── bells ────────────────────────────────────────────────────────────── */

/** Bows are tied at the junctions between swags, so the bottom of a swag is
 *  exactly the gap between two of them — which is where the bells go. */
const BELL_HEIGHT: [number, number] = [46, 58];
/** Two to a point, the way the reference pairs them. The second is smaller and
 *  set behind, so the pair reads as one ornament rather than as two of the
 *  same thing side by side. */
const BELL_PAIR: { x: number; y: number; size: number; tilt: number; behind: boolean }[] = [
  { x: -0.36, y: 0, size: 1, tilt: -0.11, behind: false },
  { x: 0.4, y: -0.08, size: 0.85, tilt: 0.14, behind: true },
];
/** Struck gold, and the near-black of the cavity behind the mouth. */
const BELL_GOLD = 0xf0bb35;
const BELL_MOUTH = 0x40302a;

/* ── stacking ─────────────────────────────────────────────────────────── */

const Z_SNOW_BACK = -320;
const Z_CORD = -52;
const Z_FOLIAGE_BACK = -40;
const Z_LIGHT = -20;
const Z_FOLIAGE_FRONT = 0;
/** Between the two foliage layers on purpose — berries sit *in* the needles,
 *  so the front layer has to be able to grow over them. */
const Z_BERRY = -28;
/** Just behind the bows: where a bell hangs close to one, the ribbon reads as
 *  the nearer object, which is how the pair is tied in the first place. */
const Z_BELL = 18;
const Z_BOW = 24;
const Z_SNOW_FRONT = 240;

/** Draw order within the transparent pass — this is what weaves the lights in. */
const ORDER_SNOW_BACK = 0;
const ORDER_FOLIAGE_BACK = 1;
const ORDER_LIGHT = 2;
const ORDER_FOLIAGE_FRONT = 3;
const ORDER_SNOW_FRONT = 10;

/* ── bow and bell ─────────────────────────────────────────────────────── */

/**
 * Both ornaments are drawn as flat outlines here and extruded with a bevel
 * where they are built — the same treatment the Lebaran crescent gets. The
 * bevel is what makes them work: it gives every edge a chamfer for the scene's
 * lights to catch, so the form comes from actual shading rather than from
 * painted-on bands, and it holds up as the garland moves.
 *
 * Everything is drawn at the sizes below and scaled per instance, so the
 * proportions hold at any viewport.
 */

/** One loop of the bow, drawn on the right and mirrored for the left: out and
 *  up from the knot, round the top, and back down underneath itself. */
function bowLoop(THREE: Three) {
  const shape = new THREE.Shape();
  shape.moveTo(3, 3);
  shape.bezierCurveTo(16, 30, 34, 40, 50, 36);
  shape.bezierCurveTo(64, 33, 66, 12, 60, 0);
  shape.bezierCurveTo(54, -12, 40, -16, 26, -12);
  shape.bezierCurveTo(14, -9, 6, -3, 3, 3);
  return shape;
}

/** One tail, again drawn right and mirrored: down and out from the knot, into
 *  the V notch that every cut ribbon end has. */
function bowTail(THREE: Three) {
  const shape = new THREE.Shape();
  shape.moveTo(-2, -1);
  shape.bezierCurveTo(8, -18, 24, -40, 44, -74);
  shape.lineTo(30, -54);
  shape.lineTo(18, -78);
  shape.bezierCurveTo(12, -50, 5, -22, -2, -1);
  shape.closePath();
  return shape;
}

/** The knot at the centre of the bow — a small rounded square. */
function bowKnot(THREE: Three) {
  const shape = new THREE.Shape();
  const w = 9;
  const h = 8;
  const r = 3.4;
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);
  return shape;
}

/**
 * The bell only has to read at ~50px on a garland, so what has to be right is
 * the silhouette and the proportion — roughly as wide as it is tall — and the
 * lighting does the rest.
 */

/** A squat arch with a real hole, so the branch shows through it. */
function bellCrown(THREE: Three) {
  const shape = new THREE.Shape();
  shape.moveTo(-14, 2);
  shape.bezierCurveTo(-14, 13, -8, 18, 0, 18);
  shape.bezierCurveTo(8, 18, 14, 13, 14, 2);
  shape.lineTo(7, 2);
  shape.bezierCurveTo(7, 8, 4, 11, 0, 11);
  shape.bezierCurveTo(-4, 11, -7, 8, -7, 2);
  shape.closePath();
  return shape;
}

/** Centre and radii of the mouth, shared by the hole cut in the body and the
 *  dark backing that sits behind it. */
const BELL_MOUTH_ELLIPSE = { y: -70, rx: 54, ry: 11 };

/**
 * The body: a narrow shoulder out of the crown that swells, then flares hard
 * into the skirt, closed off by the front half of the mouth ellipse. That late
 * flare is the whole silhouette — bring it earlier and the shape becomes a
 * cone, later and it becomes a dome.
 *
 * The mouth is a genuine hole in the outline rather than a dark ellipse laid
 * over the front. Extruded, that hole gets its own inner wall, which is what
 * gives the rim real thickness and lets the cavity read as an opening you can
 * see into.
 */
function bellBody(THREE: Three) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 4);
  shape.bezierCurveTo(-13, 4, -22, -12, -26, -30);
  shape.bezierCurveTo(-32, -52, -44, -64, -58, -72);
  // Front half of the mouth ellipse, left lip round to right lip.
  shape.bezierCurveTo(-58, -92, 58, -92, 58, -72);
  shape.bezierCurveTo(44, -64, 32, -52, 26, -30);
  shape.bezierCurveTo(22, -12, 13, 4, 0, 4);

  const { y, rx, ry } = BELL_MOUTH_ELLIPSE;
  const mouth = new THREE.Path();
  mouth.absellipse(0, y, rx, ry, 0, Math.PI * 2, true, 0);
  shape.holes.push(mouth);
  return shape;
}

/** The cavity behind the mouth. A touch larger than the hole so no seam shows
 *  at the edge, and set back inside the shell. */
function bellCavity(THREE: Three) {
  const { y, rx, ry } = BELL_MOUTH_ELLIPSE;
  const shape = new THREE.Shape();
  shape.absellipse(0, y, rx + 3, ry + 3, 0, Math.PI * 2, false, 0);
  return shape;
}

/** Crown top down to the front lip — what every per-instance scale is taken
 *  against. The body is ~116 across, so the bell comes out very close to
 *  square, which is the proportion the reference has. */
const BELL_ART_HEIGHT = 105;

/** Ribbon is thin stock with a soft edge; the bell is a cast shell with a
 *  heavier chamfer. Both are generous on `curveSegments` — these are the
 *  largest curves on screen and faceting on either one is obvious. */
const RIBBON_EXTRUDE = {
  depth: 7,
  bevelEnabled: true,
  bevelThickness: 1.8,
  bevelSize: 1.8,
  bevelSegments: 3,
  steps: 1,
  curveSegments: 26,
} as const;

const BELL_EXTRUDE = {
  depth: 10,
  bevelEnabled: true,
  bevelThickness: 2.6,
  bevelSize: 2.6,
  bevelSegments: 4,
  steps: 1,
  curveSegments: 32,
} as const;

/* ── the garland ──────────────────────────────────────────────────────── */

type Garland = {
  group: THREE_NS.Group;
  update: (time: number, breeze: number) => void;
  dispose: () => void;
};

/**
 * Builds one full garland for the given viewport: the branch, its two layers
 * of foliage with the lights threaded between them, the berries, and the bows.
 * Everything is laid out hanging from y = 0, so the caller only has to park the
 * group on the section's top edge.
 */
function buildGarland(
  THREE: Three,
  width: number,
  height: number,
  sprigMap: THREE_NS.Texture,
): Garland {
  // Seeded per size, so the same viewport always yields the same garland and a
  // resize doesn't reshuffle a scene the user is already looking at.
  const rand = mulberry32(0x1225 + Math.round(width) * 31 + Math.round(height));
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];

  const scale = clamp(width / REFERENCE_WIDTH, SCALE_RANGE[0], SCALE_RANGE[1]);
  const { curve, ties, bleeds } = createFramePath(THREE, {
    width,
    height,
    scale,
    rand,
    top: GARLAND_TOP,
    minWidth: FRAME_MIN_WIDTH,
    inset: FRAME_INSET,
    corner: FRAME_CORNER,
    drop: FRAME_DROP,
    overhang: GARLAND_OVERHANG,
    swagTarget: SWAG_TARGET,
    sag: SWAG_SAG,
    tension: SWAG_TENSION,
  });
  const length = curve.getLength();

  /* --- the branch ----------------------------------------------------- */

  // Unlit and hair-thin. A lit tube catches one specular streak down its whole
  // length, and anything thicker arcs over the needles as a drawn-on wire —
  // both of which put back the bare cord the foliage exists to hide. What is
  // left just fills the gaps between sprigs so the swag never looks severed.
  const cordGeometry = new THREE.TubeGeometry(curve, Math.round(length / 10), CORD_RADIUS, 5, false);
  const cordMaterial = new THREE.MeshBasicMaterial({ color: CORD_COLOR });
  const cord = new THREE.Mesh(cordGeometry, cordMaterial);
  cord.position.z = Z_CORD;
  group.add(cord);
  disposables.push(cordGeometry, cordMaterial);

  /* --- sampling helpers ------------------------------------------------ */

  const offsetAt = framePathSampler(THREE, curve);

  /**
   * A run that ends on screen thins out over its last few percent rather than
   * being guillotined. One that bleeds past the section's edges needs nothing:
   * nobody can see where it stops.
   */
  const taper = (u: number) => (bleeds ? 1 : clamp(Math.min(u, 1 - u) / 0.03, 0.4, 1));

  /* --- foliage --------------------------------------------------------- */

  const sprigTotal = Math.round(length / (SPRIG_SPACING * scale));
  const backCount = Math.round(sprigTotal * FOLIAGE_BACK_SHARE);

  const buildFoliage = (count: number, tints: number[], layer: { z: number; order: number }) => {
    const sprites = createRootedSprites(THREE, {
      count,
      map: sprigMap,
      variants: SPRIG_VARIANTS,
      z: layer.z,
      renderOrder: layer.order,
    });
    const { root, shape, tint, style } = sprites;
    const colour = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Each layer is spread across the whole branch on its own — jittering
      // within the slot is what keeps them from lining up with each other.
      const u = clamp((i + rand()) / count, 0.001, 0.999);
      const side = rand() < 0.5 ? -1 : 1;
      // Roots crowd the branch and thin outward, the way a real garland is
      // packed — which is also what buries the cord running through it.
      const spot = offsetAt(u, side, Math.pow(rand(), 1.4) * SPRIG_SPREAD * scale);
      const thin = taper(u);

      root[i * 2] = spot.x;
      root[i * 2 + 1] = spot.y;

      // Needles radiate off the branch: outward on the outside, inward on the
      // inside, each fanned by up to ~85 degrees.
      const outward = Math.atan2(-spot.nx * side, spot.ny * side);
      shape[i * 4] = between(SPRIG_SIZE, rand()) * scale * thin;
      shape[i * 4 + 1] = outward + (rand() * 2 - 1) * 1.5;
      shape[i * 4 + 2] = rand() * Math.PI * 2;
      shape[i * 4 + 3] = 0.035 + rand() * 0.045;

      const frost = rand() < FROST_SHARE;
      colour.setHex(frost ? FROST_TINT : tints[Math.floor(rand() * tints.length)]);
      tint[i * 3] = colour.r;
      tint[i * 3 + 1] = colour.g;
      tint[i * 3 + 2] = colour.b;

      style[i * 2] = Math.floor(rand() * SPRIG_VARIANTS);
      style[i * 2 + 1] = (frost ? 0.75 : 1) * thin;
    }

    sprites.commit();
    group.add(sprites.mesh);
    disposables.push(sprites);
    return sprites;
  };

  const foliageBack = buildFoliage(backCount, FOLIAGE_BACK_TINTS, {
    z: Z_FOLIAGE_BACK,
    order: ORDER_FOLIAGE_BACK,
  });
  const foliageFront = buildFoliage(sprigTotal - backCount, FOLIAGE_FRONT_TINTS, {
    z: Z_FOLIAGE_FRONT,
    order: ORDER_FOLIAGE_FRONT,
  });

  /* --- lights ---------------------------------------------------------- */

  const lightCount = Math.max(6, Math.round(length / (LIGHT_SPACING * scale)));
  const glow = createGlow(THREE, {
    count: lightCount,
    color: LIGHT_COLOR,
    z: Z_LIGHT,
    renderOrder: ORDER_LIGHT,
    shape: [2.6, 0.5, 7, 0.85],
  });
  group.add(glow.mesh);
  disposables.push(glow);

  type Light = { phase: number; rate: number; base: number; amp: number };
  const lights: Light[] = [];

  for (let i = 0; i < lightCount; i++) {
    const u = clamp((i + 0.5) / lightCount, 0.001, 0.999);
    const spot = offsetAt(u, rand() < 0.5 ? -1 : 1, rand() * LIGHT_SPREAD * scale);
    glow.centre[i * 2] = spot.x;
    glow.centre[i * 2 + 1] = spot.y;
    glow.state[i * 2] = between(LIGHT_SIZE, rand()) * scale * taper(u);

    // Real fairy lights sit steady and breathe; only a few take a deeper,
    // slower pulse. None of them ever go out.
    const slow = rand() < 0.15;
    lights.push({
      phase: rand() * Math.PI * 2,
      rate: slow ? 0.35 + rand() * 0.3 : 0.9 + rand() * 1.1,
      base: slow ? 0.6 : 0.86,
      amp: slow ? 0.4 : 0.14,
    });
  }
  glow.commitCentres();

  /* --- berries --------------------------------------------------------- */

  const clusters = Math.max(2, Math.round(length / (BERRY_SPACING * scale)));
  const berryCount = clusters * BERRY_PER_CLUSTER;
  const berryGeometry = new THREE.SphereGeometry(1, 16, 12);
  const berryMaterial = new THREE.MeshStandardMaterial({
    color: 0xb51226,
    roughness: 0.16,
    metalness: 0.15,
    envMapIntensity: 1.3,
  });
  const berries = new THREE.InstancedMesh(berryGeometry, berryMaterial, berryCount);
  berries.position.z = Z_BERRY;
  berries.frustumCulled = false;
  group.add(berries);
  disposables.push(berryGeometry, berryMaterial, berries);

  const berryMatrix = new THREE.Matrix4();
  const berryScale = new THREE.Vector3();
  const berryPosition = new THREE.Vector3();
  const berryTurn = new THREE.Quaternion();
  for (let c = 0; c < clusters; c++) {
    const u = clamp((c + 0.5) / clusters + (rand() - 0.5) * 0.06, 0.02, 0.98);
    const anchor = offsetAt(u, rand() < 0.5 ? -1 : 1, rand() * LIGHT_SPREAD * scale);
    for (let b = 0; b < BERRY_PER_CLUSTER; b++) {
      berryScale.setScalar(between(BERRY_RADIUS, rand()) * scale);
      berryPosition.set(
        anchor.x + (rand() * 2 - 1) * 6 * scale,
        anchor.y + (rand() * 2 - 1) * 6 * scale,
        (rand() * 2 - 1) * 3,
      );
      berryMatrix.compose(berryPosition, berryTurn, berryScale);
      berries.setMatrixAt(c * BERRY_PER_CLUSTER + b, berryMatrix);
    }
  }
  berries.instanceMatrix.needsUpdate = true;

  /* --- bows ------------------------------------------------------------ */

  const loopGeometry = new THREE.ExtrudeGeometry(bowLoop(THREE), RIBBON_EXTRUDE);
  const tailGeometry = new THREE.ExtrudeGeometry(bowTail(THREE), RIBBON_EXTRUDE);
  const knotGeometry = new THREE.ExtrudeGeometry(bowKnot(THREE), { ...RIBBON_EXTRUDE, depth: 11 });

  // Satin, not plastic: sheen is what puts the soft off-axis bloom on ribbon
  // that a plain roughness value can only approximate.
  const satin = new THREE.MeshPhysicalMaterial({
    color: RIBBON_COLOR,
    roughness: 0.42,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color(0xff8f9f),
    envMapIntensity: 0.9,
  });
  const satinDeep = new THREE.MeshPhysicalMaterial({
    color: RIBBON_DEEP,
    roughness: 0.5,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(0xe07a8a),
    envMapIntensity: 0.8,
  });
  disposables.push(loopGeometry, tailGeometry, knotGeometry, satin, satinDeep);

  type Bow = { tails: THREE_NS.Group; phase: number; rate: number; gain: number };
  const bows: Bow[] = [];

  for (const tie of ties) {
    const bow = new THREE.Group();
    bow.position.copy(tie);
    bow.position.y -= BOW_DROP * scale;
    bow.position.z = Z_BOW;
    bow.rotation.z = (rand() * 2 - 1) * 0.12;
    bow.scale.setScalar(BOW_SCALE * scale * (0.92 + rand() * 0.16));

    for (const side of [1, -1]) {
      // The mirrored half is the same geometry at scale.x = -1; three notices
      // the negative determinant and flips the winding for us.
      const loop = new THREE.Mesh(loopGeometry, satin);
      loop.scale.x = side;
      bow.add(loop);
    }

    const knot = new THREE.Mesh(knotGeometry, satinDeep);
    knot.position.z = 3;
    bow.add(knot);

    // Tails live in their own pivot so they can swing from the knot while the
    // loops stay put — the one part of a bow that actually moves in a breeze.
    // Set back far enough that the extruded loops never intersect them.
    const tails = new THREE.Group();
    tails.position.z = -9;
    for (const side of [1, -1]) {
      const tail = new THREE.Mesh(tailGeometry, side === 1 ? satin : satinDeep);
      tail.scale.x = side;
      tails.add(tail);
    }
    bow.add(tails);

    group.add(bow);
    bows.push({ tails, phase: rand() * Math.PI * 2, rate: 0.7 + rand() * 0.5, gain: 0.06 + rand() * 0.05 });
  }

  /* --- bells ----------------------------------------------------------- */

  // The bows are tied at the ties, so the bottom of each swag is the gap
  // between two of them. Walking the sampled curve for local minima in y finds
  // those bottoms without having to re-derive the swag count the path was
  // built from — and it stays right whether or not the run has legs.
  const BELL_SAMPLES = 500;
  const bellSpots: { x: number; y: number }[] = [];
  {
    const sample = new THREE.Vector3();
    let prevY = Infinity;
    let falling = false;
    let low = { x: 0, y: Infinity, at: -1 };
    for (let i = 0; i <= BELL_SAMPLES; i++) {
      sample.copy(curve.getPointAt(i / BELL_SAMPLES));
      if (sample.y < prevY) {
        falling = true;
        if (sample.y < low.y) low = { x: sample.x, y: sample.y, at: i };
      } else if (falling) {
        // Turned back upward: whatever we were tracking was a swag bottom —
        // unless it was sample 0, which on a framed run is only the foot of the
        // left leg climbing away. Anything past the section's edge is out on a
        // bleeding run's overhang, where nobody can see it.
        if (low.at > 0 && Math.abs(low.x) < width / 2) bellSpots.push(low);
        falling = false;
        low = { x: 0, y: Infinity, at: -1 };
      }
      prevY = sample.y;
    }
  }

  // Extruded and lit, like the crescent in the Lebaran scene. Centring each
  // geometry on z means a bell can be tilted without one of its faces swinging
  // out in front of its neighbour.
  const bellBodyGeometry = new THREE.ExtrudeGeometry(bellBody(THREE), BELL_EXTRUDE);
  bellBodyGeometry.translate(0, 0, -BELL_EXTRUDE.depth / 2);
  const bellCrownGeometry = new THREE.ExtrudeGeometry(bellCrown(THREE), {
    ...BELL_EXTRUDE,
    depth: 6,
    bevelThickness: 1.5,
    bevelSize: 1.5,
  });
  bellCrownGeometry.translate(0, 0, -3);
  const bellCavityGeometry = new THREE.ShapeGeometry(bellCavity(THREE), 32);
  const bellClapperGeometry = new THREE.SphereGeometry(1, 16, 12);

  // Struck rather than plated: high metalness with a low roughness is what
  // gives the shoulder its single bright sweep instead of a flat wash.
  const bellGold = new THREE.MeshStandardMaterial({
    color: BELL_GOLD,
    metalness: 0.92,
    roughness: 0.24,
    envMapIntensity: 1.35,
  });
  // The cavity is the one thing in here that must not catch a highlight — it
  // is a hole, and any sheen on it reads as a disc.
  const bellMouthMaterial = new THREE.MeshBasicMaterial({ color: BELL_MOUTH });
  disposables.push(
    bellBodyGeometry,
    bellCrownGeometry,
    bellCavityGeometry,
    bellClapperGeometry,
    bellGold,
    bellMouthMaterial,
  );

  /** One bell. Kept separate because each point gets a pair of them at
   *  different sizes. */
  const buildBell = (step: number) => {
    const art = new THREE.Group();
    art.scale.setScalar(step);

    const crown = new THREE.Mesh(bellCrownGeometry, bellGold);
    art.add(crown);

    const body = new THREE.Mesh(bellBodyGeometry, bellGold);
    art.add(body);

    // Behind the mouth's inner wall, so it is seen through the opening rather
    // than sitting on the front of it.
    const cavity = new THREE.Mesh(bellCavityGeometry, bellMouthMaterial);
    cavity.position.z = -BELL_EXTRUDE.depth / 2 - 1;
    art.add(cavity);

    const clapper = new THREE.Mesh(bellClapperGeometry, bellGold);
    clapper.scale.set(11, 12, 11);
    clapper.position.set(6, BELL_MOUTH_ELLIPSE.y - 5, -2);
    art.add(clapper);

    return art;
  };

  type Bell = { pivot: THREE_NS.Group; phase: number; rate: number; gain: number };
  const bells: Bell[] = [];

  for (const spot of bellSpots) {
    const size = between(BELL_HEIGHT, rand()) * scale;

    // No cord: the crown sits right on the branch, which is what "attached"
    // means here — a bell tied into the foliage rather than swung under it.
    const pivot = new THREE.Group();
    pivot.position.set(spot.x, spot.y, Z_BELL);

    for (const slot of BELL_PAIR) {
      // The art is drawn crown-at-origin down to BELL_ART_HEIGHT, so this is
      // what turns `size` into the scale every piece of it shares.
      const bell = buildBell((size * slot.size) / BELL_ART_HEIGHT);
      // Far enough apart in z that the two shells never intersect where they
      // overlap — each one is `BELL_EXTRUDE.depth * step` thick.
      bell.position.set(size * slot.x, size * slot.y, slot.behind ? -size * 0.12 : size * 0.12);
      bell.rotation.z = slot.tilt;
      pivot.add(bell);
    }

    group.add(pivot);
    bells.push({
      pivot,
      phase: rand() * Math.PI * 2,
      rate: 0.55 + rand() * 0.45,
      // Tied on, so it only stirs with the branch — nothing like the swing a
      // hung bell would have.
      gain: 0.018 + rand() * 0.014,
    });
  }

  /* --- animation ------------------------------------------------------- */

  const update = (time: number, breeze: number) => {
    foliageBack.setMotion(time, breeze);
    foliageFront.setMotion(time, breeze);

    for (let i = 0; i < lightCount; i++) {
      const light = lights[i];
      glow.state[i * 2 + 1] =
        light.base + light.amp * (0.5 + 0.5 * Math.sin(time * light.rate + light.phase));
    }
    glow.commitState();

    for (const bow of bows) {
      bow.tails.rotation.z =
        breeze * bow.gain + Math.sin(time * bow.rate + bow.phase) * bow.gain * 0.6;
    }

    // Tied to the branch rather than hung off it, so the pair only leans with
    // the gust — it never swings the way a bow's tails do.
    for (const bell of bells) {
      bell.pivot.rotation.z =
        breeze * bell.gain + Math.sin(time * bell.rate + bell.phase) * bell.gain * 0.5;
    }
  };

  update(0, 0);

  return {
    group,
    update,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

/* ── the scene ────────────────────────────────────────────────────────── */

function createChristmasScene({ THREE, scene, renderer, width, height }: DecorContext) {
  const flakes = new THREE.CanvasTexture(drawSnowflakeAtlas());
  flakes.colorSpace = THREE.SRGBColorSpace;
  flakes.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const sprigs = new THREE.CanvasTexture(drawSprigAtlas());
  sprigs.colorSpace = THREE.SRGBColorSpace;
  sprigs.anisotropy = flakes.anisotropy;

  const total = clamp(
    Math.round((width * height) / SNOW_AREA_PER_FLAKE),
    SNOW_COUNT_RANGE[0],
    SNOW_COUNT_RANGE[1],
  );
  const frontCount = Math.max(4, Math.round(total * SNOW_FRONT_SHARE));
  const rand = mulberry32(0x1224);

  // Behind the garland the flakes keep depth testing, so the solid berries and
  // ribbon occlude them; the foreground layer skips it and is drawn last, over
  // everything.
  const shared = { map: flakes, variants: SNOWFLAKE_VARIANTS, margin: SNOW_MARGIN, rand };
  const snowBack = createDrift(THREE, {
    ...shared,
    bands: SNOW_BACK,
    count: total - frontCount,
    z: Z_SNOW_BACK,
    depthTest: true,
    renderOrder: ORDER_SNOW_BACK,
  });
  const snowFront = createDrift(THREE, {
    ...shared,
    bands: SNOW_FRONT,
    count: frontCount,
    z: Z_SNOW_FRONT,
    depthTest: false,
    renderOrder: ORDER_SNOW_FRONT,
  });
  scene.add(snowBack.mesh, snowFront.mesh);

  let garland = buildGarland(THREE, width, height, sprigs);
  scene.add(garland.group);
  let builtAt = { width, height };

  return {
    update: (time: number, breeze: number) => {
      snowBack.setTime(time);
      snowFront.setTime(time);
      garland.update(time, breeze);
    },
    resize: (w: number, h: number) => {
      snowBack.resize(w, h);
      snowFront.resize(w, h);
      // Rebuilding allocates a few hundred instances, so only redo it when the
      // size has actually moved enough to change the layout.
      if (Math.abs(w - builtAt.width) > 8 || Math.abs(h - builtAt.height) > 40) {
        scene.remove(garland.group);
        garland.dispose();
        garland = buildGarland(THREE, w, h, sprigs);
        scene.add(garland.group);
        builtAt = { width: w, height: h };
      }
      garland.group.position.y = h / 2;
    },
    dispose: () => {
      garland.dispose();
      snowBack.dispose();
      snowFront.dispose();
      flakes.dispose();
      sprigs.dispose();
    },
  };
}

export default function ChristmasDecor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return mountDecor(container, createChristmasScene);
  }, []);

  return <div ref={containerRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />;
}
