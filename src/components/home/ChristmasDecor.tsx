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

const BOW_SCALE = 1.05;
/** How far below the tie the bow's centre sits. The branch runs along the very
 *  top edge of the section, so a bow centred on it would have its loops
 *  guillotined; hung just under, it sits in the foliage where it belongs. */
const BOW_DROP = 30;
const RIBBON_COLOR = 0xc8102e;

/* ── stacking ─────────────────────────────────────────────────────────── */

const Z_SNOW_BACK = -320;
const Z_CORD = -52;
const Z_FOLIAGE_BACK = -40;
const Z_LIGHT = -20;
const Z_FOLIAGE_FRONT = 0;
/** Between the two foliage layers on purpose — berries sit *in* the needles,
 *  so the front layer has to be able to grow over them. */
const Z_BERRY = -28;
const Z_BOW = 24;
const Z_SNOW_FRONT = 240;

/** Draw order within the transparent pass — this is what weaves the lights in. */
const ORDER_SNOW_BACK = 0;
const ORDER_FOLIAGE_BACK = 1;
const ORDER_LIGHT = 2;
const ORDER_FOLIAGE_FRONT = 3;
const ORDER_SNOW_FRONT = 10;

/* ── ribbon shapes ────────────────────────────────────────────────────── */

/**
 * Half a bow, drawn once and mirrored: a loop that sweeps up and back to the
 * knot, and a tail with the notched end ribbon always has. Both are extruded
 * with a bevel so the edges catch light — a flat silhouette is what makes a
 * CG bow look like a sticker.
 */
function ribbonLoop(THREE: Three) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 2);
  shape.bezierCurveTo(-8, 20, -26, 25, -33, 14);
  shape.bezierCurveTo(-40, 4, -30, -9, -16, -7);
  shape.bezierCurveTo(-9, -6, -4, -3, 0, 2);
  return shape;
}

function ribbonTail(THREE: Three) {
  const shape = new THREE.Shape();
  shape.moveTo(-3, -1);
  shape.bezierCurveTo(-10, -15, -17, -30, -15, -45);
  shape.lineTo(-7.5, -36);
  shape.lineTo(-1, -48);
  shape.bezierCurveTo(-0.5, -31, 2, -15, 4, -1);
  shape.closePath();
  return shape;
}

function ribbonKnot(THREE: Three) {
  const shape = new THREE.Shape();
  shape.absellipse(0, 1, 7, 6, 0, Math.PI * 2, false, 0);
  return shape;
}

const RIBBON_EXTRUDE = {
  depth: 5,
  bevelEnabled: true,
  bevelThickness: 1.1,
  bevelSize: 1.1,
  bevelSegments: 3,
  steps: 1,
  curveSegments: 14,
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

  const loopGeometry = new THREE.ExtrudeGeometry(ribbonLoop(THREE), RIBBON_EXTRUDE);
  const tailGeometry = new THREE.ExtrudeGeometry(ribbonTail(THREE), RIBBON_EXTRUDE);
  const knotGeometry = new THREE.ExtrudeGeometry(ribbonKnot(THREE), { ...RIBBON_EXTRUDE, depth: 8 });

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
    color: 0x8f0a20,
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
    tails.position.z = -8;
    for (const side of [1, -1]) {
      const tail = new THREE.Mesh(tailGeometry, side === 1 ? satin : satinDeep);
      tail.scale.x = side;
      tails.add(tail);
    }
    bow.add(tails);

    group.add(bow);
    bows.push({ tails, phase: rand() * Math.PI * 2, rate: 0.7 + rand() * 0.5, gain: 0.06 + rand() * 0.05 });
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
