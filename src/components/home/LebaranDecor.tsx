"use client";

import { useEffect, useRef } from "react";
import type * as THREE_NS from "three";
import {
  LANTERN_FACETS,
  STAR_VARIANTS,
  drawJanurTails,
  drawKetupatWeave,
  drawLanternSkin,
  drawStarAtlas,
} from "./lebaran-art";
import {
  breezeAt,
  clamp,
  createDrift,
  createFramePath,
  createGlow,
  mountDecor,
  mulberry32,
  type DecorContext,
  type DriftBand,
  type Three,
} from "./decor-kit";

/**
 * Lebaran / Ramadan dressing for the Promo section.
 *
 * This one leaves the garland template the other seasons share. A Ramadan
 * installation is not a garland — it is things hung from a ceiling on threads,
 * with the ketupat gathered off to the sides:
 *
 *   • two beaded chains across the top, each with its own arc count so they
 *     cross. Purely decorative; nothing hangs from them
 *   • a handful of threads straight down from the top edge, ending in a
 *     lantern or a slowly turning crescent
 *   • a bunch of ketupat tucked into each top corner — tied at one knot, not
 *     hung on a thread of its own
 *   • stars floating almost still behind, falling slowly in front
 *
 * Everything is kept inside the section's top padding, clear of the headline.
 * That band is only ~138px on desktop and ~80px below it, so depth is staged
 * by where each object's *bottom* lands rather than by thread length — a tall
 * lantern and a small crescent get different threads to finish in the same
 * window.
 *
 * And every thread swings on its own clock. A pendulum's period goes with the
 * square root of its length, so the long ones sway slow and wide while the
 * short ones tick quickly, all driven by the one shared gust. It is the reason
 * a row of hanging things looks alive rather than nodded in time.
 */

/* ── scale ────────────────────────────────────────────────────────────── */

const REFERENCE_WIDTH = 1280;
const SCALE_RANGE: [number, number] = [0.66, 1];
/** Below this the installation thins out — a phone cannot carry five of these. */
const WIDE_ENOUGH = 900;

/**
 * The section's own top padding, which is the whole budget this scene has to
 * work in. Mirrors `pt-20 xl:pt-36` on the section; the few px taken off keep
 * the lowest object from kissing the eyebrow.
 */
const SAFE_BAND = { wide: 144 - 6, narrow: 80 - 6 };
const XL_BREAKPOINT = 1280;

/* ── stars ────────────────────────────────────────────────────────────── */

const STAR_AREA_EACH = 18000;
const STAR_COUNT_RANGE: [number, number] = [20, 95];
const STAR_MARGIN = 80;

/** Behind: barely moving. These stand in for the reference's scattered stars,
 *  which are composition rather than weather. */
const STARS_BACK: DriftBand[] = [
  { share: 0.62, size: [24, 40], speed: [3, 7], drift: [10, 24], alpha: 0.75, spin: 0.9 },
  { share: 0.38, size: [36, 56], speed: [5, 10], drift: [14, 30], alpha: 0.88, spin: 0.7 },
];
/** In front: a slow fall, for a little ambient drift over the whole band. */
const STARS_FRONT: DriftBand[] = [
  { share: 1, size: [56, 84], speed: [26, 44], drift: [26, 54], alpha: 0.35, spin: 0.6 },
];
const STAR_FRONT_SHARE = 0.16;
/** Near-white through to gold. The atlas is already warm, so these only shift
 *  the temperature rather than supplying the colour. */
const STAR_TINTS = [0xfff6df, 0xffe6ac, 0xffd97a, 0xfff0c8];

/* ── beaded chains ────────────────────────────────────────────────────── */

/** Two runs with different arc counts, which is what makes them cross. */
const CHAINS = [
  { top: 6, sag: [40, 52] as [number, number], swagTarget: 430 },
  { top: 22, sag: [66, 82] as [number, number], swagTarget: 310 },
];
const CHAIN_OVERHANG = 120;
const BEAD_SPACING = 8;
const BEAD_RADIUS = 1.9;
/** The chains only bob with the gust — a catenary cannot sway as a rigid body,
 *  and rebuilding the curve every frame to ripple it is not worth the cost. */
const CHAIN_BOB = 1.8;

/* ── hanging things ───────────────────────────────────────────────────── */

/** How far in from the section edge the outermost thread sits, px. Wide enough
 *  to leave the corner ketupat their own room. */
const HANG_INSET = 130;
/** Where an object's bottom lands, as a fraction of the safe band. */
const HANG_BOTTOM: [number, number] = [0.76, 1];
/** No thread ever gets shorter than this, or the object looks stuck to the edge. */
const HANG_MIN_THREAD = 12;

const THREAD_RADIUS = 0.55;
const THREAD_COLOR = 0xc9a445;

/* ── pendulums ────────────────────────────────────────────────────────── */

/**
 * Natural frequency is `PENDULUM_K / sqrt(length)`, tuned so a 100px thread
 * comes out at about a four-second period.
 */
const PENDULUM_K = 15.7;
/** Seconds of lag per px of thread — longer hangs answer the gust late. */
const PENDULUM_LAG = 0.0016;
/**
 * Swing angle at a 160px thread; longer threads take proportionally less of
 * it. The tip still travels further on a long thread, just not linearly so —
 * which is how a real one behaves.
 */
const PENDULUM_SWING = 0.05;

/* ── lantern ──────────────────────────────────────────────────────────── */

// Every lantern is built to one size. They read as a set that way, which is
// how the reference has them; depth comes from where each one hangs, not from
// making some of them smaller.
const LANTERN_RADIUS = 20;
const LANTERN_BODY = 40;
const LANTERN_DOME = 20;
const LANTERN_BULLET = 22;
const LANTERN_RING = 4.8;
/** Ring, dome, body and bullet stacked — what the layout has to fit. */
const LANTERN_TOTAL = LANTERN_RING * 2 + LANTERN_DOME + LANTERN_BODY + LANTERN_BULLET;
const LANTERN_GLOW = 0xffb35a;

/* ── crescent ─────────────────────────────────────────────────────────── */

const CRESCENT_SIZE = 36;
const CRESCENT_TOTAL = CRESCENT_SIZE * 2;
/** Outer radius, inner radius and how far the bite is offset, in unit space. */
const CRESCENT_CUT = { outer: 1, inner: 0.9, offset: 0.42 };
/** Turns a full circle in roughly ten to eighteen seconds. */
const CRESCENT_SPIN: [number, number] = [0.35, 0.62];

/* ── corner ketupat ───────────────────────────────────────────────────── */

/** Scale on the unit body. Standing a cube on its point puts the corners about
 *  0.71 out, so the diamond lands near 1.4x this across. */
const KETUPAT_SIZE = 50;
/**
 * How far in from the section edge the bunch sits, px. Tucked near the edge
 * so it frames the corner nicely.
 */
const KETUPAT_INSET = 12;
/** Leaned inward a touch, so it reads as tucked into the corner. */
const KETUPAT_LEAN = 0.12;
/**
 * How far the bunch hangs below the top edge, px — and it hangs on its own
 * janur, gathered down to the knot, rather than on a chain.
 */
const KETUPAT_HANG = 50;
/**
 * Seven ketupat tied off at the knot, sitting at visibly distinct heights and angles.
 */
const KETUPAT_CLUSTER: [number, number, number, number][] = [
  [-14, -10, 1.0, 0.35],
  [16, -38, 0.95, -0.3],
  [-10, -68, 0.9, 0.45],
  [14, -100, 0.86, -0.25],
  [-16, -134, 0.82, 0.4],
  [10, -170, 0.78, -0.35],
  [-6, -206, 0.74, 0.5],
];
/** Full height of the bunch at scale 1, janur top to the tip of the tails. */
const KETUPAT_TOTAL = 380;

/* ── stacking ─────────────────────────────────────────────────────────── */

const Z_STAR_BACK = -400;
const Z_CHAIN = -120;
const Z_GLOW = -16;
const Z_HANG = 0;
const Z_STAR_FRONT = 300;

const ORDER_STAR_BACK = -1;
const ORDER_GLOW = 2;
const ORDER_STAR_FRONT = 10;

/* ── geometry ─────────────────────────────────────────────────────────── */

/**
 * A crescent, traced as two arcs rather than a disc with a hole punched in it:
 * the bite overlaps the outer edge, and a Shape hole has to sit entirely
 * inside its parent. Finding where the two circles meet gives both horns their
 * points for free.
 */
function crescentShape(THREE: Three) {
  const { outer, inner, offset } = CRESCENT_CUT;
  const ix = (offset * offset + outer * outer - inner * inner) / (2 * offset);
  const iy = Math.sqrt(outer * outer - ix * ix);
  const a = Math.atan2(iy, ix);
  const b = Math.atan2(iy, ix - offset);

  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, a, Math.PI * 2 - a, false);
  shape.absarc(offset, 0, inner, Math.PI * 2 - b, b, true);
  return { shape, hornAngle: a };
}

/** Dome and bullet caps, lathed over the same facet count as the body so the
 *  edges run unbroken from top to bottom the way a real fanous is built. */
function lanternCaps(THREE: Three) {
  const dome = [
    [1, -1],
    [0.97, -0.79],
    [0.88, -0.57],
    [0.72, -0.37],
    [0.51, -0.19],
    [0.26, -0.06],
    [0, 0],
  ].map(([r, h]) => new THREE.Vector2(r * LANTERN_RADIUS, h * LANTERN_DOME));

  const bullet = [
    [0, -1],
    [0.19, -0.91],
    [0.36, -0.74],
    [0.53, -0.53],
    [0.66, -0.29],
    [0.74, -0.11],
    [0.77, 0],
  ].map(([r, h]) => new THREE.Vector2(r * LANTERN_RADIUS * 1.3, h * LANTERN_BULLET));

  return { dome, bullet };
}

/**
 * A ketupat: a cube plumped toward a sphere, then stood on one point. The
 * plumping is what stops it reading as a hard box — a real one is packed with
 * rice and bulges at every face.
 */
function ketupatGeometry(THREE: Three) {
  const geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  const position = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    v.multiplyScalar(1 + (0.72 / v.length() - 1) * 0.26);
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  geometry.rotateZ(Math.PI / 4);
  return geometry;
}

/* ── composition ──────────────────────────────────────────────────────── */

type Hang = {
  x: number;
  kind: "lantern" | "crescent" | "small-lantern";
  bottom: number;
  scaleFactor?: number;
  opacity?: number;
};

/**
 * Places the threads across the run.
 *
 * Primary hero lanterns and crescents are spaced across the run. Secondary
 * smaller, subtle lanterns are interleaved between each pair to create depth.
 */
function layoutHangs(width: number, scale: number, safeBottom: number, rand: () => number): Hang[] {
  const count = width >= WIDE_ENOUGH ? 5 : 3;
  const span = width - HANG_INSET * scale * 2;
  const step = span / (count - 1);
  const mainHangs: Hang[] = [];

  for (let i = 0; i < count; i++) {
    const pinned = i === 0 || i === count - 1;
    const x = -span / 2 + step * i + (pinned ? 0 : (rand() * 2 - 1) * step * 0.22);
    mainHangs.push({
      x,
      kind: i % 2 === 0 ? "lantern" : "crescent",
      bottom: safeBottom * (HANG_BOTTOM[0] + rand() * (HANG_BOTTOM[1] - HANG_BOTTOM[0])),
      scaleFactor: 1.0,
      opacity: 1.0,
    });
  }

  const hangs: Hang[] = [];
  for (let i = 0; i < mainHangs.length; i++) {
    hangs.push(mainHangs[i]);
    if (i < mainHangs.length - 1) {
      const midX = (mainHangs[i].x + mainHangs[i + 1].x) / 2 + (rand() * 2 - 1) * 14 * scale;
      hangs.push({
        x: midX,
        kind: "small-lantern",
        bottom: safeBottom * (0.52 + rand() * 0.2),
        scaleFactor: 0.52,
        opacity: 0.55,
      });
    }
  }

  return hangs;
}

/* ── the scene ────────────────────────────────────────────────────────── */

type Scene = {
  group: THREE_NS.Group;
  update: (time: number, breeze: number) => void;
  dispose: () => void;
};

type Maps = {
  skin: THREE_NS.Texture;
  skinGlow: THREE_NS.Texture;
  weave: THREE_NS.Texture;
  tails: THREE_NS.Texture;
};

function buildLebaran(THREE: Three, width: number, height: number, maps: Maps): Scene {
  // Seeded per size, so the same viewport always yields the same installation
  // and a resize doesn't reshuffle a scene the user is already looking at.
  const rand = mulberry32(0x1446 + Math.round(width) * 31 + Math.round(height));
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const scale = clamp(width / REFERENCE_WIDTH, SCALE_RANGE[0], SCALE_RANGE[1]);
  const safeBottom = width >= XL_BREAKPOINT ? SAFE_BAND.wide : SAFE_BAND.narrow;

  /* --- shared materials ------------------------------------------------ */

  const brass = new THREE.MeshStandardMaterial({
    color: 0xd9a83c,
    metalness: 0.88,
    roughness: 0.28,
    envMapIntensity: 1.25,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    map: maps.skin,
    emissiveMap: maps.skinGlow,
    emissive: new THREE.Color(0xffd9a0),
    emissiveIntensity: 0.95,
    metalness: 0.4,
    roughness: 0.4,
    envMapIntensity: 0.7,
  });
  const weaveMaterial = new THREE.MeshStandardMaterial({
    map: maps.weave,
    roughness: 0.68,
    metalness: 0.05,
    envMapIntensity: 0.55,
  });
  const knotMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d9b1e,
    roughness: 0.62,
    metalness: 0.05,
  });
  const tailsMaterial = new THREE.MeshBasicMaterial({
    map: maps.tails,
    transparent: true,
    depthWrite: false,
    // The hanger reuses this sprite mirrored on Y, which reverses its winding.
    side: THREE.DoubleSide,
  });
  const threadMaterial = new THREE.MeshBasicMaterial({ color: THREAD_COLOR });

  // Subtle / secondary material for the small intermediate lanterns
  const smallBrass = new THREE.MeshStandardMaterial({
    color: 0xd9a83c,
    metalness: 0.85,
    roughness: 0.35,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    envMapIntensity: 0.8,
  });
  const smallGlassMaterial = new THREE.MeshStandardMaterial({
    map: maps.skin,
    emissiveMap: maps.skinGlow,
    emissive: new THREE.Color(0xffd9a0),
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.45,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    envMapIntensity: 0.5,
  });
  const smallThreadMaterial = new THREE.MeshBasicMaterial({
    color: THREAD_COLOR,
    transparent: true,
    opacity: 0.4,
  });

  disposables.push(
    brass,
    glassMaterial,
    weaveMaterial,
    knotMaterial,
    tailsMaterial,
    threadMaterial,
    smallBrass,
    smallGlassMaterial,
    smallThreadMaterial,
  );

  /* --- shared geometry -------------------------------------------------- */

  const caps = lanternCaps(THREE);
  const crescent = crescentShape(THREE);
  const geo = {
    thread: new THREE.CylinderGeometry(THREAD_RADIUS, THREAD_RADIUS, 1, 5),
    ring: new THREE.TorusGeometry(LANTERN_RING, 0.85, 6, 16),
    dome: new THREE.LatheGeometry(caps.dome, LANTERN_FACETS),
    body: new THREE.CylinderGeometry(LANTERN_RADIUS, LANTERN_RADIUS, LANTERN_BODY, LANTERN_FACETS, 1, true),
    bullet: new THREE.LatheGeometry(caps.bullet, LANTERN_FACETS),
    crescent: new THREE.ExtrudeGeometry(crescent.shape, {
      depth: 0.17,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.07,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 30,
    }),
    ketupat: ketupatGeometry(THREE),
    knot: new THREE.SphereGeometry(1, 10, 8),
    tails: new THREE.PlaneGeometry(1, 1),
    bead: new THREE.SphereGeometry(1, 8, 6),
  };
  geo.thread.translate(0, -0.5, 0);
  geo.tails.translate(0, -0.5, 0);

  // Bring the crescent's upper horn to the top and drop it so that horn sits
  // on the origin — that is where its ring, and so its thread, belongs. It has
  // to happen before the scale, or the translate would be in unit space.
  geo.crescent.rotateZ(Math.PI / 2 - crescent.hornAngle);
  geo.crescent.translate(0, -CRESCENT_CUT.outer, 0);
  geo.crescent.scale(CRESCENT_SIZE, CRESCENT_SIZE, CRESCENT_SIZE);

  Object.values(geo).forEach((g) => disposables.push(g));

  /* --- the beaded chains ------------------------------------------------ */

  const chainCurves = CHAINS.map((chain) =>
    createFramePath(THREE, {
      width,
      height,
      scale,
      rand,
      legs: "bleed",
      top: chain.top,
      inset: 0,
      corner: 0,
      overhang: CHAIN_OVERHANG,
      swagTarget: chain.swagTarget,
      sag: chain.sag,
      tension: 2.1,
    }).curve,
  );

  const beadCounts = chainCurves.map((curve) =>
    Math.max(8, Math.round(curve.getLength() / (BEAD_SPACING * scale))),
  );
  const beadTotal = beadCounts.reduce((sum, n) => sum + n, 0);
  const beads = new THREE.InstancedMesh(geo.bead, brass, beadTotal);
  beads.position.z = Z_CHAIN;
  beads.frustumCulled = false;
  group.add(beads);
  disposables.push(beads);

  {
    const matrix = new THREE.Matrix4();
    const turn = new THREE.Quaternion();
    const size = new THREE.Vector3().setScalar(BEAD_RADIUS * scale);
    let slot = 0;
    chainCurves.forEach((curve, c) => {
      for (let i = 0; i < beadCounts[c]; i++) {
        matrix.compose(curve.getPointAt(i / (beadCounts[c] - 1)), turn, size);
        beads.setMatrixAt(slot++, matrix);
      }
    });
    beads.instanceMatrix.needsUpdate = true;
  }

  /* --- the hanging things ----------------------------------------------- */

  const hangs = layoutHangs(width, scale, safeBottom, rand);
  const lanternCount = hangs.filter((hang) => hang.kind === "lantern" || hang.kind === "small-lantern").length;

  const glow = createGlow(THREE, {
    count: Math.max(1, lanternCount),
    color: LANTERN_GLOW,
    z: Z_GLOW,
    renderOrder: ORDER_GLOW,
    // A soft skirt about twice the body across, with a core that never blows
    // out to white — enough to read as lit, not enough to fog the copy.
    shape: [2.4, 0.42, 5, 0.35],
  });
  group.add(glow.mesh);
  disposables.push(glow);

  type Hung = {
    pivot: THREE_NS.Group;
    /** Set for a crescent: it turns on its thread instead of just swinging. */
    spinner: THREE_NS.Object3D | null;
    spin: number;
    omega: number;
    lag: number;
    swing: number;
    own: number;
    phase: number;
    /** Index into the glow layer, or -1 for anything unlit. */
    lit: number;
    /** Distance from the pivot down to the middle of the lit body, px. */
    centre: number;
    isSmall: boolean;
  };
  const hung: Hung[] = [];
  let litSlot = 0;

  hangs.forEach((hang, index) => {
    const sFactor = hang.scaleFactor ?? 1.0;
    const step = scale * sFactor;
    const isSmall = hang.kind === "small-lantern";
    const gold = isSmall ? smallBrass : brass;
    const glass = isSmall ? smallGlassMaterial : glassMaterial;
    const tMat = isSmall ? smallThreadMaterial : threadMaterial;

    const body = (hang.kind === "crescent" ? CRESCENT_TOTAL : LANTERN_TOTAL) * step;
    // Thread length falls out of where the bottom should land.
    const length = Math.max(HANG_MIN_THREAD * scale, hang.bottom - body);

    const pivot = new THREE.Group();
    // A hair of separation per thread, so wherever two overlap they stack in a
    // fixed order instead of z-fighting. Secondary small lanterns sit slightly behind.
    pivot.position.set(hang.x, 0, isSmall ? Z_HANG - 22 : Z_HANG - index * 0.5);

    const thread = new THREE.Mesh(geo.thread, tMat);
    thread.scale.y = length;
    pivot.add(thread);

    let spinner: THREE_NS.Object3D | null = null;
    let lit = -1;
    let centre = length;

    if (hang.kind === "lantern" || hang.kind === "small-lantern") {
      const top = -length;
      const ring = new THREE.Mesh(geo.ring, gold);
      ring.scale.setScalar(step);
      ring.position.y = top - LANTERN_RING * step;
      pivot.add(ring);

      const dome = new THREE.Mesh(geo.dome, gold);
      dome.scale.setScalar(step);
      dome.position.y = top - LANTERN_RING * 2 * step;
      pivot.add(dome);

      const bodyTop = top - (LANTERN_RING * 2 + LANTERN_DOME) * step;
      const shell = new THREE.Mesh(geo.body, glass);
      shell.scale.setScalar(step);
      shell.position.y = bodyTop - (LANTERN_BODY / 2) * step;
      pivot.add(shell);

      const bullet = new THREE.Mesh(geo.bullet, gold);
      bullet.scale.setScalar(step);
      bullet.position.y = bodyTop - LANTERN_BODY * step;
      pivot.add(bullet);

      lit = litSlot++;
      centre = length + (LANTERN_RING * 2 + LANTERN_DOME + LANTERN_BODY / 2) * step;
      glow.state[lit * 2] = LANTERN_RADIUS * 4.4 * step;
    } else {
      const moon = new THREE.Mesh(geo.crescent, gold);
      moon.scale.setScalar(step);
      moon.position.y = -length;
      pivot.add(moon);

      const ring = new THREE.Mesh(geo.ring, gold);
      ring.scale.setScalar(step * 0.7);
      ring.position.y = -length + LANTERN_RING * 0.7 * step;
      pivot.add(ring);

      // A crescent turns right round on its thread rather than rocking. Twice
      // a turn it comes edge-on and thins to a bright line, which is the whole
      // reason it is extruded and bevelled instead of drawn flat.
      spinner = moon;
    }

    group.add(pivot);
    hung.push({
      pivot,
      spinner,
      spin: CRESCENT_SPIN[0] + rand() * (CRESCENT_SPIN[1] - CRESCENT_SPIN[0]),
      omega: PENDULUM_K / Math.sqrt(length),
      lag: length * PENDULUM_LAG,
      swing: PENDULUM_SWING / Math.sqrt(length / 160),
      own: 0.012 + rand() * 0.012,
      phase: rand() * Math.PI * 2,
      lit,
      centre,
      isSmall,
    });
  });

  /* --- the corner ketupat ----------------------------------------------- */

  type Corner = { pivot: THREE_NS.Group; rest: number; gain: number; phase: number };
  const corners: Corner[] = [];

  // The bunch is taller than a lantern, and the band it has to live in shrinks
  // to ~74px below the xl breakpoint — so it is scaled to the band rather than
  // to the viewport, and clipped by neither.
  const clusterStep = scale;

  for (const side of [-1, 1]) {
    const step = clusterStep;
    const pivot = new THREE.Group();
    pivot.position.set(side * (width / 2 - KETUPAT_INSET * step), 0 * step, Z_HANG + 8);
    const rest = -side * KETUPAT_LEAN;
    pivot.rotation.z = rest;

    const hangDrop = KETUPAT_HANG * step;

    // The janur it was woven from, gathered down into the knot — enlarged for prominence
    const hanger = new THREE.Mesh(geo.tails, tailsMaterial);
    hanger.scale.set(80 * step, -75 * step, 1);
    hanger.position.set(0, -hangDrop, -10);
    pivot.add(hanger);

    const knot = new THREE.Mesh(geo.knot, knotMaterial);
    knot.scale.set(10 * step, 7 * step, 7.5 * step);
    knot.position.y = -hangDrop - 4 * step;
    pivot.add(knot);

    // Seven ketupat, tied off at the knot and sitting at distinct heights and angles
    const cluster = KETUPAT_CLUSTER;
    cluster.forEach(([dx, dy, size, yaw], k) => {
      const bodyMesh = new THREE.Mesh(geo.ketupat, weaveMaterial);
      bodyMesh.scale.setScalar(KETUPAT_SIZE * size * step);
      bodyMesh.position.set(dx * step, -hangDrop + dy * step, k % 2 === 0 ? 0 : -8);
      bodyMesh.rotation.y = yaw;
      pivot.add(bodyMesh);
    });

    const tails = new THREE.Mesh(geo.tails, tailsMaterial);
    tails.scale.set(68 * step, 72 * step, 1);
    tails.position.set(0, -hangDrop - 225 * step, -12);
    pivot.add(tails);

    group.add(pivot);
    corners.push({ pivot, rest, gain: 0.03 + rand() * 0.016, phase: rand() * Math.PI * 2 });
  }

  /* --- animation -------------------------------------------------------- */

  const chainBase = beads.position.y;

  const update = (time: number, breeze: number) => {
    beads.position.y = chainBase + breeze * CHAIN_BOB * scale;

    for (const item of hung) {
      // Each thread answers the same gust, but late by its own length and at
      // its own natural rate — that mismatch is what stops the row nodding in
      // unison.
      const angle =
        item.swing * breezeAt(time - item.lag) +
        item.own * Math.sin(time * item.omega + item.phase);
      item.pivot.rotation.z = angle;

      if (item.spinner) item.spinner.rotation.y = time * item.spin + item.phase;

      if (item.lit >= 0) {
        // Candlelight: a slow, shallow breathe, never a blink.
        const baseLit = item.isSmall ? 0.38 : 0.74;
        const gainLit = item.isSmall ? 0.12 : 0.2;
        glow.state[item.lit * 2 + 1] =
          baseLit + gainLit * (0.5 + 0.5 * Math.sin(time * item.omega * 0.4 + item.phase));
        // The halo has to follow the body the thread just swung.
        glow.centre[item.lit * 2] = item.pivot.position.x + Math.sin(angle) * item.centre;
        glow.centre[item.lit * 2 + 1] = -Math.cos(angle) * item.centre;
      }
    }
    glow.commitCentres();
    glow.commitState();

    // The corner bunches hang on a short gather of janur, so they stir a
    // little rather than swinging the way the long threads do.
    for (const corner of corners) {
      corner.pivot.rotation.z =
        corner.rest + corner.gain * breeze + corner.gain * 0.4 * Math.sin(time * 0.7 + corner.phase);
    }
  };

  update(0, 0);

  return {
    group,
    update,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function createLebaranScene({ THREE, scene, renderer, width, height }: DecorContext) {
  const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const texture = (canvas: HTMLCanvasElement) => {
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = anisotropy;
    return map;
  };

  const skin = drawLanternSkin();
  const starMap = texture(drawStarAtlas());
  const maps: Maps = {
    skin: texture(skin.colour),
    skinGlow: texture(skin.glow),
    weave: texture(drawKetupatWeave()),
    tails: texture(drawJanurTails()),
  };
  maps.skin.wrapS = THREE.RepeatWrapping;
  maps.skinGlow.wrapS = THREE.RepeatWrapping;

  const total = clamp(
    Math.round((width * height) / STAR_AREA_EACH),
    STAR_COUNT_RANGE[0],
    STAR_COUNT_RANGE[1],
  );
  const frontCount = Math.max(3, Math.round(total * STAR_FRONT_SHARE));
  const rand = mulberry32(0x1447);

  // `flip` is what makes these read as struck metal rather than as snow: each
  // one squashes to nothing as it turns edge-on, so the field glints.
  const shared = {
    map: starMap,
    variants: STAR_VARIANTS,
    margin: STAR_MARGIN,
    flip: true,
    tints: STAR_TINTS,
    rand,
  };
  const starsBack = createDrift(THREE, {
    ...shared,
    bands: STARS_BACK,
    count: total - frontCount,
    z: Z_STAR_BACK,
    depthTest: true,
    renderOrder: ORDER_STAR_BACK,
  });
  const starsFront = createDrift(THREE, {
    ...shared,
    bands: STARS_FRONT,
    count: frontCount,
    z: Z_STAR_FRONT,
    depthTest: false,
    renderOrder: ORDER_STAR_FRONT,
  });
  scene.add(starsBack.mesh, starsFront.mesh);

  let decor = buildLebaran(THREE, width, height, maps);
  scene.add(decor.group);
  let builtAt = { width, height };

  return {
    update: (time: number, breeze: number) => {
      starsBack.setTime(time);
      starsFront.setTime(time);
      decor.update(time, breeze);
    },
    resize: (w: number, h: number) => {
      starsBack.resize(w, h);
      starsFront.resize(w, h);
      // Rebuilding allocates a run of instances, so only redo it when the size
      // has actually moved enough to change the layout.
      if (Math.abs(w - builtAt.width) > 8 || Math.abs(h - builtAt.height) > 40) {
        scene.remove(decor.group);
        decor.dispose();
        decor = buildLebaran(THREE, w, h, maps);
        scene.add(decor.group);
        builtAt = { width: w, height: h };
      }
      decor.group.position.y = h / 2;
    },
    dispose: () => {
      decor.dispose();
      starsBack.dispose();
      starsFront.dispose();
      starMap.dispose();
      Object.values(maps).forEach((map) => map.dispose());
    },
  };
}

export default function LebaranDecor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return mountDecor(container, createLebaranScene);
  }, []);

  return <div ref={containerRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />;
}
