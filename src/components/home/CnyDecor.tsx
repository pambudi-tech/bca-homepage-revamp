"use client";

import { useEffect, useRef } from "react";
import type * as THREE_NS from "three";
import {
  BLOSSOM_VARIANTS,
  CLOUD_VARIANTS,
  PETAL_VARIANTS,
  drawBlossomAtlas,
  drawCloudAtlas,
  drawLanternSkin,
  drawPetalAtlas,
  drawTassel,
} from "./cny-art";
import {
  between,
  breezeAt,
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
 * Lunar New Year dressing for the Promo section.
 *
 * Same skeleton as the Christmas scene on purpose — a garland framing the
 * section, hero ornaments at every tie, small lights woven in, something
 * falling past — with every part swapped for its Lunar New Year counterpart:
 *
 *   • blossom — mei hua clustered along the bough in dense knots with bare
 *     wood between them, never the even spread pine wants
 *   • lanterns — hung at each tie. Each swings on the shared gust and its
 *     tassel swings *late*, reading the gust from a quarter-second ago, which
 *     is what gives the pair weight
 *   • lights — sparse warm gold between the two blossom layers
 *   • coins — pierced gold on a red cord, hung from the bottom of each swag so
 *     each one lands in the gap between two lanterns, turning slowly
 *   • firecrackers — a red string pinned to each section edge, standing in for
 *     the Christmas garland's side legs and framing the band the way the
 *     Lebaran ketupat bunches do. They overhang the edge a little on purpose;
 *     on the narrowest phones only the right one is kept
 *   • petals — falling, and turning edge-on as they fall
 *   • clouds — xiangyun scrolls in thin gold, drifting sideways far behind
 *     everything as texture rather than as objects
 *
 * The section's pale blue stays. Red lanterns and pink blossom against a
 * washed spring sky is the picture this is going for, and it keeps the band
 * recognisably BCA rather than a red rectangle pasted over it.
 */

/* ── scale ────────────────────────────────────────────────────────────── */

/**
 * Every garland measurement below is drawn for a section this wide and scaled
 * from there, so a phone gets a garland in proportion to its viewport rather
 * than a desktop one crammed into a third of the width.
 */
const REFERENCE_WIDTH = 1280;
/** Floor nudged up from the Christmas scene's 0.58 — the blossom and lantern
 *  detail read as fussier at small sizes than pine and ribbon do, so mobile
 *  gets a bit more scale before it clamps. */
const SCALE_RANGE: [number, number] = [0.66, 1];

/* ── petals ───────────────────────────────────────────────────────────── */

/** One petal per this much section area. Sparser than snow: petals are bigger,
 *  and a blizzard of them stops reading as spring. */
const PETAL_AREA_EACH = 16000;
const PETAL_COUNT_RANGE: [number, number] = [22, 110];
const PETAL_MARGIN = 80;

const PETALS_BACK: DriftBand[] = [
  { share: 0.55, size: [10, 17], speed: [17, 28], drift: [22, 46], alpha: 0.85, spin: 0.7 },
  { share: 0.45, size: [16, 26], speed: [26, 42], drift: [28, 58], alpha: 0.95, spin: 0.55 },
];
const PETALS_FRONT: DriftBand[] = [
  { share: 1, size: [30, 50], speed: [44, 68], drift: [34, 66], alpha: 0.34, spin: 0.4 },
];
const PETAL_FRONT_SHARE = 0.15;

/* ── clouds ───────────────────────────────────────────────────────────── */

const CLOUD_COUNT = 7;
const CLOUD_SIZE: [number, number] = [150, 300];
/** Sideways drift, px/s. Slow enough to be felt rather than watched. */
const CLOUD_SPEED: [number, number] = [3, 8];
const CLOUD_ALPHA: [number, number] = [0.09, 0.18];

/* ── the frame the garland follows ────────────────────────────────────── */

const GARLAND_TOP = 6;
/**
 * How far the run overshoots each edge, px. Unlike the Christmas garland this
 * one never turns down into legs — it just carries straight off both sides, so
 * the overhang is what sells it as a run continuing past the section rather
 * than one that stops at the frame.
 */
const GARLAND_OVERHANG = 150;
const FRAME_CORNER = 78;
/** At or below this width there is only room for one firecracker string, on
 *  the right; anything wider keeps the default pair. */
const SINGLE_SIDE_WIDTH = 640;
/** Every lantern hangs off a junction in the run, so this sets how many of
 *  them there are. Wide swags on purpose: at the lantern's current size a
 *  tighter run crowds them into a solid row of red. */
const SWAG_TARGET = 320;
/** Shallower than the Christmas swag: the lanterns hang below every tie, and
 *  they need the room between the garland and the section's headline. */
const SWAG_SAG: [number, number] = [44, 64];
const SWAG_TENSION = 2.2;

/** Plum wood. Unlike the pine garland's cord this one is meant to show through
 *  the gaps — bare branch between knots of flower is the whole mei hua look. */
const BOUGH_RADIUS = 1.7;
const BOUGH_COLOR = 0x4a3325;

/* ── blossom ──────────────────────────────────────────────────────────── */

/** Distance along the bough between clusters, px. Close enough that clusters
 *  run well into one another — the bough should read as heavy with flower,
 *  with wood showing only in the odd gap. */
const CLUSTER_SPACING = 9;
const BLOSSOMS_PER_CLUSTER: [number, number] = [12, 19];
/** How far a flower strays from its cluster's centre, px. Kept tight against
 *  the closer spacing: a wide spread at this density stops reading as knots of
 *  flower and turns back into an even dusting. */
const CLUSTER_SPREAD = 12;
/** How far a cluster's own centre sits off the bough, px. */
const CLUSTER_OFFSET = 19;
const BLOSSOM_SIZE: [number, number] = [15, 30];
/** Portion of flowers behind the lights and coins. */
const BLOSSOM_BACK_SHARE = 0.55;

/* ── lights ───────────────────────────────────────────────────────────── */

/** Sparser than the Christmas string: these are glints among the flowers, not
 *  a lit garland — the lanterns are what carry the light in this scene. */
const LIGHT_SPACING = 62;
const LIGHT_SPREAD = 14;
const LIGHT_COLOR = 0xffc95a;
const LIGHT_SIZE: [number, number] = [15, 25];

/* ── coins ────────────────────────────────────────────────────────────── */

/** One coin per swag, hung from the bough's lowest point so it lands squarely
 *  between two lanterns rather than inside a flower cluster. */
const COIN_RADIUS: [number, number] = [12, 16];
/** Length of the cord from the bough down to the coin, px. Long enough to
 *  clear the flowers so the coin hangs in the open air between lanterns. */
const COIN_HANG: [number, number] = [30, 46];
const COIN_GOLD = 0xd9a83c;

/* ── lanterns ─────────────────────────────────────────────────────────── */

/** Body height and half-width, px, before the viewport scale. */
const LANTERN_HEIGHT = 56;
const LANTERN_RADIUS = 35;
/** Length of the cord from the tie down to the lantern, px. */
const LANTERN_HANG: [number, number] = [10, 22];
/** How much of the gust a lantern takes, rad per unit. */
const LANTERN_SWING = 0.075;
/**
 * How far behind the lantern its tassel reads the gust, seconds. This is the
 * whole trick: the tassel is lighter and trails, so it is still catching up
 * when the lantern has already turned back. Take it out and the pair moves
 * like one rigid prop.
 */
const TASSEL_LAG = 0.28;
/** Tassel swings wider than the body it hangs from. */
const TASSEL_SWING = 1.6;
const LANTERN_GLOW = 0xff7a3a;

/* ── firecrackers ─────────────────────────────────────────────────────── */

/** These stand in for the side legs the Christmas garland has, so they carry
 *  the same sort of vertical weight. */
const CRACKER_DROP: [number, number] = [170, 260];
/** Vertical pitch between crackers, px — at CRACKER_SIZE 1. */
const CRACKER_PITCH = 16;
const CRACKER_RED = 0xd0202c;
/**
 * How far in from the section edge the string's spine sits, px — same
 * treatment the Lebaran ketupat gets. Small on purpose: the crackers swing out
 * ~9.7px either side of the spine, so at this inset the outer ones clear the
 * edge and the string reads as coming from off-screen rather than being parked
 * politely inside the section.
 */
const CRACKER_INSET = 2;
/** Size multiplier on the crackers themselves. The spine keeps its drop; only
 *  the bodies grow, so a bigger cracker means proportionally fewer of them. */
const CRACKER_SIZE = 1.9;

/* ── stacking ─────────────────────────────────────────────────────────── */

const Z_CLOUD = -600;
const Z_PETAL_BACK = -400;
const Z_BOUGH = -60;
const Z_BLOSSOM_BACK = -40;
const Z_LIGHT = -20;
/** In front of the flowers: a coin hangs clear of the bough on its own cord,
 *  so nothing should grow over it. */
const Z_COIN = 16;
const Z_BLOSSOM_FRONT = 0;
const Z_CRACKER = 14;
const Z_LANTERN_GLOW = 18;
const Z_TASSEL = 22;
const Z_LANTERN = 28;
const Z_PETAL_FRONT = 300;

const ORDER_CLOUD = -2;
const ORDER_PETAL_BACK = -1;
const ORDER_BLOSSOM_BACK = 1;
const ORDER_LIGHT = 2;
const ORDER_BLOSSOM_FRONT = 3;
const ORDER_LANTERN_GLOW = 4;
const ORDER_TASSEL = 5;
const ORDER_PETAL_FRONT = 10;

/* ── lantern body ─────────────────────────────────────────────────────── */

/** Profile of a lantern body, bottom upward, moved so its top sits at y = 0. */
function lanternProfile(THREE: Three) {
  const points: [number, number][] = [
    [0, 0],
    [0.38, 0],
    [0.64, 0.035],
    [0.86, 0.13],
    [0.976, 0.29],
    [1, 0.5],
    [0.976, 0.71],
    [0.86, 0.87],
    [0.64, 0.965],
    [0.38, 1],
    [0, 1],
  ];
  return points.map(([r, h]) => new THREE.Vector2(r * LANTERN_RADIUS, (h - 1) * LANTERN_HEIGHT));
}

/* ── the garland ──────────────────────────────────────────────────────── */

type Scene = {
  group: THREE_NS.Group;
  update: (time: number, breeze: number) => void;
  dispose: () => void;
};

type Maps = {
  blossom: THREE_NS.Texture;
  cloud: THREE_NS.Texture;
  skin: THREE_NS.Texture;
  tassel: THREE_NS.Texture;
};

function buildCny(THREE: Three, width: number, height: number, maps: Maps): Scene {
  // Seeded per size, so the same viewport always yields the same garland and a
  // resize doesn't reshuffle a scene the user is already looking at.
  const rand = mulberry32(0x2026 + Math.round(width) * 31 + Math.round(height));
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const scale = clamp(width / REFERENCE_WIDTH, SCALE_RANGE[0], SCALE_RANGE[1]);

  // Always a top run that carries off both edges — never the Christmas
  // garland's turned-down legs. The firecrackers are pinned to the section's
  // own edges and no longer hang off this run's ends, so there is nothing left
  // that needs the run to stop on screen.
  const { curve, ties } = createFramePath(THREE, {
    width,
    height,
    scale,
    rand,
    legs: "bleed",
    top: GARLAND_TOP,
    inset: 0,
    corner: FRAME_CORNER,
    overhang: GARLAND_OVERHANG,
    swagTarget: SWAG_TARGET,
    sag: SWAG_SAG,
    tension: SWAG_TENSION,
  });
  const length = curve.getLength();
  const offsetAt = framePathSampler(THREE, curve);

  // The run always ends past the section's edges, where nobody can see where it
  // stops — so unlike the Christmas garland nothing here has to thin into the
  // ends.

  /* --- the bough ------------------------------------------------------- */

  // Unlit: a lit tube this thin catches one specular streak down its whole
  // length and reads as wire rather than wood.
  const boughGeometry = new THREE.TubeGeometry(curve, Math.round(length / 8), BOUGH_RADIUS * scale, 6, false);
  const boughMaterial = new THREE.MeshBasicMaterial({ color: BOUGH_COLOR });
  const bough = new THREE.Mesh(boughGeometry, boughMaterial);
  bough.position.z = Z_BOUGH;
  group.add(bough);
  disposables.push(boughGeometry, boughMaterial);

  /* --- blossom --------------------------------------------------------- */

  // Cluster centres first, so both layers draw from the same knots. That is
  // what makes the flowers gather into bunches with bare wood showing between
  // them, instead of dusting the bough evenly the way pine needles do.
  const clusterCount = Math.max(3, Math.round(length / (CLUSTER_SPACING * scale)));
  const knots: { x: number; y: number }[] = [];
  for (let i = 0; i < clusterCount; i++) {
    const u = clamp((i + rand() * 0.85) / clusterCount, 0.004, 0.996);
    const spot = offsetAt(u, rand() < 0.5 ? -1 : 1, rand() * CLUSTER_OFFSET * scale);
    knots.push({ x: spot.x, y: spot.y });
  }

  const perKnot = knots.map(() => Math.round(between(BLOSSOMS_PER_CLUSTER, rand())));
  const blossomTotal = perKnot.reduce((sum, n) => sum + n, 0);
  const backTotal = Math.round(blossomTotal * BLOSSOM_BACK_SHARE);

  const blossomBack = createRootedSprites(THREE, {
    count: backTotal,
    map: maps.blossom,
    variants: BLOSSOM_VARIANTS,
    z: Z_BLOSSOM_BACK,
    renderOrder: ORDER_BLOSSOM_BACK,
    flutter: 0.42,
  });
  const blossomFront = createRootedSprites(THREE, {
    count: blossomTotal - backTotal,
    map: maps.blossom,
    variants: BLOSSOM_VARIANTS,
    z: Z_BLOSSOM_FRONT,
    renderOrder: ORDER_BLOSSOM_FRONT,
    flutter: 0.42,
  });

  let backAt = 0;
  let frontAt = 0;
  knots.forEach((knot, k) => {
    for (let i = 0; i < perKnot[k]; i++) {
      const backFull = backAt >= backTotal;
      const frontFull = frontAt >= blossomTotal - backTotal;
      const toBack = !backFull && (frontFull || rand() < BLOSSOM_BACK_SHARE);
      const layer = toBack ? blossomBack : blossomFront;
      const slot = toBack ? backAt++ : frontAt++;

      // Two rolls averaged land near the centre far more often than one does,
      // so a cluster gets a dense heart and a loose edge rather than a disc.
      const spread = CLUSTER_SPREAD * scale;
      layer.root[slot * 2] = knot.x + (rand() + rand() - 1) * spread;
      layer.root[slot * 2 + 1] = knot.y + (rand() + rand() - 1) * spread;

      // A flower faces the viewer, so its angle is pure decoration.
      layer.shape[slot * 4] = between(BLOSSOM_SIZE, rand()) * scale * (toBack ? 0.9 : 1);
      layer.shape[slot * 4 + 1] = rand() * Math.PI * 2;
      layer.shape[slot * 4 + 2] = rand() * Math.PI * 2;
      layer.shape[slot * 4 + 3] = 0.05 + rand() * 0.06;

      // The atlas already carries the pinks; the tint only varies brightness,
      // which is also what separates the two layers in depth.
      const lift = toBack ? 0.8 + rand() * 0.12 : 0.95 + rand() * 0.13;
      layer.tint[slot * 3] = lift;
      layer.tint[slot * 3 + 1] = lift * 0.995;
      layer.tint[slot * 3 + 2] = lift;

      layer.style[slot * 2] = Math.floor(rand() * BLOSSOM_VARIANTS);
      layer.style[slot * 2 + 1] = 1;
    }
  });

  blossomBack.commit();
  blossomFront.commit();
  group.add(blossomBack.mesh, blossomFront.mesh);
  disposables.push(blossomBack, blossomFront);

  /* --- lights ---------------------------------------------------------- */

  const lightCount = Math.max(4, Math.round(length / (LIGHT_SPACING * scale)));
  const lights = createGlow(THREE, {
    count: lightCount,
    color: LIGHT_COLOR,
    z: Z_LIGHT,
    renderOrder: ORDER_LIGHT,
    shape: [2.6, 0.45, 7, 0.8],
  });
  group.add(lights.mesh);
  disposables.push(lights);

  const lightPulse: { phase: number; rate: number }[] = [];
  for (let i = 0; i < lightCount; i++) {
    const u = clamp((i + 0.5) / lightCount, 0.001, 0.999);
    const spot = offsetAt(u, rand() < 0.5 ? -1 : 1, rand() * LIGHT_SPREAD * scale);
    lights.centre[i * 2] = spot.x;
    lights.centre[i * 2 + 1] = spot.y;
    lights.state[i * 2] = between(LIGHT_SIZE, rand()) * scale;
    lightPulse.push({ phase: rand() * Math.PI * 2, rate: 0.7 + rand() * 0.9 });
  }
  lights.commitCentres();

  /* --- coins ----------------------------------------------------------- */

  const coinShape = new THREE.Shape();
  coinShape.absarc(0, 0, 1, 0, Math.PI * 2, false);
  const square = new THREE.Path();
  square.moveTo(-0.3, -0.3);
  square.lineTo(0.3, -0.3);
  square.lineTo(0.3, 0.3);
  square.lineTo(-0.3, 0.3);
  square.closePath();
  coinShape.holes.push(square);

  const coinGeometry = new THREE.ExtrudeGeometry(coinShape, {
    depth: 0.13,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 26,
  });
  coinGeometry.translate(0, 0, -0.065);
  const coinMaterial = new THREE.MeshStandardMaterial({
    color: COIN_GOLD,
    metalness: 0.95,
    roughness: 0.22,
    envMapIntensity: 1.4,
  });
  // Lanterns hang off the ties — the junctions *between* swags — so the bottom
  // of each swag is exactly the gap between two of them. Walking the sampled
  // curve for local minima in y finds those bottoms without having to re-derive
  // the swag count the path was built from.
  const SWAG_SAMPLES = 500;
  const hangPoints: { x: number; y: number }[] = [];
  {
    const sample = new THREE.Vector3();
    let prevY = Infinity;
    let falling = false;
    let low = { x: 0, y: Infinity, at: -1 };
    for (let i = 0; i <= SWAG_SAMPLES; i++) {
      sample.copy(curve.getPointAt(i / SWAG_SAMPLES));
      if (sample.y < prevY) {
        falling = true;
        if (sample.y < low.y) low = { x: sample.x, y: sample.y, at: i };
      } else if (falling) {
        // Turned back upward: whatever we were tracking was a swag bottom.
        // Anything past the section's edge is out on the overhang, where
        // nobody can see it.
        if (low.at > 0 && Math.abs(low.x) < width / 2) hangPoints.push(low);
        falling = false;
        low = { x: 0, y: Infinity, at: -1 };
      }
      prevY = sample.y;
    }
  }

  const coinCount = Math.max(1, hangPoints.length);
  const coins = new THREE.InstancedMesh(coinGeometry, coinMaterial, coinCount);
  coins.position.z = Z_COIN;
  coins.frustumCulled = false;
  group.add(coins);
  disposables.push(coinGeometry, coinMaterial, coins);

  const coinSpots: { x: number; y: number; radius: number; phase: number; rate: number }[] = [];
  const coinCords: number[] = [];
  for (let i = 0; i < coinCount; i++) {
    const spot = hangPoints[i] ?? { x: 0, y: 0 };
    const cord = between(COIN_HANG, rand()) * scale;
    const radius = between(COIN_RADIUS, rand()) * scale;
    coinCords.push(cord);
    coinSpots.push({
      x: spot.x,
      y: spot.y - cord - radius,
      radius,
      phase: rand() * Math.PI * 2,
      rate: 0.22 + rand() * 0.2,
    });
  }

  // Red cords from the bough down to each coin, so it reads as hung between
  // the lanterns rather than as a gold disc floating in mid-air.
  const coinCordGeometry = new THREE.CylinderGeometry(0.65, 0.65, 1, 6);
  coinCordGeometry.translate(0, -0.5, 0);
  const coinCordMaterial = new THREE.MeshBasicMaterial({ color: 0x7d1c20 });
  coinSpots.forEach((coin, i) => {
    const cord = new THREE.Mesh(coinCordGeometry, coinCordMaterial);
    // Hung from the bough and run down to the coin's centre, where the disc
    // itself hides the end of it.
    cord.position.set(coin.x, coin.y + coinCords[i] + coin.radius, Z_COIN - 1);
    cord.scale.y = coinCords[i] + coin.radius;
    group.add(cord);
  });
  disposables.push(coinCordGeometry, coinCordMaterial);

  /* --- lanterns -------------------------------------------------------- */

  const bodyGeometry = new THREE.LatheGeometry(lanternProfile(THREE), 26);
  const capGeometry = new THREE.CylinderGeometry(LANTERN_RADIUS * 0.4, LANTERN_RADIUS * 0.4, 5, 18);
  const hangGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1, 6);
  hangGeometry.translate(0, -0.5, 0);
  const tasselGeometry = new THREE.PlaneGeometry(1, 1);
  tasselGeometry.translate(0, -0.5, 0); // hang from the top edge

  const bodyMaterial = new THREE.MeshStandardMaterial({
    map: maps.skin,
    roughness: 0.46,
    metalness: 0.05,
    // Lit from inside — a lantern is a light source, not a red ball.
    emissive: new THREE.Color(0xff5a24),
    emissiveIntensity: 0.32,
    envMapIntensity: 0.7,
  });
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7a944,
    metalness: 0.9,
    roughness: 0.3,
    envMapIntensity: 1.2,
  });
  const threadMaterial = new THREE.MeshBasicMaterial({ color: 0x7d1c20 });
  const tasselMaterial = new THREE.MeshBasicMaterial({
    map: maps.tassel,
    transparent: true,
    depthWrite: false,
  });
  disposables.push(
    bodyGeometry,
    capGeometry,
    hangGeometry,
    tasselGeometry,
    bodyMaterial,
    goldMaterial,
    threadMaterial,
    tasselMaterial,
  );

  const glow = createGlow(THREE, {
    count: Math.max(1, ties.length),
    color: LANTERN_GLOW,
    z: Z_LANTERN_GLOW,
    renderOrder: ORDER_LANTERN_GLOW,
    // Wider, softer skirt than the fairy lights, and a core that never blows
    // out to white — a paper lantern glows, it does not sparkle.
    shape: [2.2, 0.4, 4, 0.25],
  });
  group.add(glow.mesh);
  disposables.push(glow);

  type Lantern = {
    pivot: THREE_NS.Group;
    tassel: THREE_NS.Group;
    anchor: THREE_NS.Vector3;
    /** Distance from the pivot down to the middle of the body, px. */
    centre: number;
    phase: number;
    rate: number;
  };
  const lanterns: Lantern[] = [];

  // Every lantern is built to one size — they read as a set that way, the same
  // call the Lebaran scene makes for its own hanging pieces.
  ties.forEach((tie, i) => {
    const step = scale;
    const hang = between(LANTERN_HANG, rand()) * scale;

    const pivot = new THREE.Group();
    pivot.position.copy(tie);
    pivot.position.z = Z_LANTERN;

    const thread = new THREE.Mesh(hangGeometry, threadMaterial);
    thread.scale.y = hang;
    pivot.add(thread);

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.setScalar(step);
    body.position.y = -hang - 4 * step;
    pivot.add(body);

    for (const end of [0, 1]) {
      const cap = new THREE.Mesh(capGeometry, goldMaterial);
      cap.scale.setScalar(step);
      cap.position.y = -hang - 4 * step + (end === 0 ? 1.5 : -LANTERN_HEIGHT + 1.5) * step;
      pivot.add(cap);
    }

    const tassel = new THREE.Group();
    tassel.position.y = -hang - 4 * step - LANTERN_HEIGHT * step + 2 * step;
    tassel.position.z = Z_TASSEL - Z_LANTERN;
    const tasselMesh = new THREE.Mesh(tasselGeometry, tasselMaterial);
    tasselMesh.scale.set(26 * step, 46 * step, 1);
    tasselMesh.renderOrder = ORDER_TASSEL;
    tassel.add(tasselMesh);
    pivot.add(tassel);

    group.add(pivot);
    lanterns.push({
      pivot,
      tassel,
      anchor: tie,
      centre: hang + 4 * step + LANTERN_HEIGHT * 0.5 * step,
      phase: rand() * Math.PI * 2,
      rate: 0.3 + rand() * 0.25,
    });

    glow.state[i * 2] = LANTERN_RADIUS * 3.4 * step;
  });

  /* --- firecrackers ---------------------------------------------------- */

  type CrackerString = { pivot: THREE_NS.Group; gain: number; phase: number };
  const crackerStrings: CrackerString[] = [];

  // Pinned to the section's own edges rather than to the garland's ends —
  // the same treatment the Lebaran ketupat bunches get, so the two scenes
  // frame the band identically. Wide sections get one down each side; below
  // the xl breakpoint only the right one survives, since a phone has no room
  // for a string crowding in from both sides.
  {
    const bodyGeo = new THREE.CylinderGeometry(4.2, 4.2, 13, 12);
    const bandGeo = new THREE.CylinderGeometry(4.5, 4.5, 2.4, 12);
    const stringGeo = new THREE.CylinderGeometry(0.7, 0.7, 1, 6);
    stringGeo.translate(0, -0.5, 0);
    const redMaterial = new THREE.MeshStandardMaterial({ color: CRACKER_RED, roughness: 0.55, metalness: 0.05 });
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x6f1418 });
    disposables.push(bodyGeo, bandGeo, stringGeo, redMaterial, stringMaterial);

    const drop = clamp(height * 0.16, CRACKER_DROP[0] * scale, CRACKER_DROP[1] * scale);
    const step = scale * CRACKER_SIZE;
    const rows = Math.max(4, Math.floor(drop / (CRACKER_PITCH * step)));

    const sides = width > SINGLE_SIDE_WIDTH ? [-1, 1] : [1];
    for (const side of sides) {
      const pivot = new THREE.Group();
      pivot.position.set(side * (width / 2 - CRACKER_INSET * step), -GARLAND_TOP * scale, Z_CRACKER);

      const spine = new THREE.Mesh(stringGeo, stringMaterial);
      spine.scale.y = drop;
      pivot.add(spine);

      const bodies = new THREE.InstancedMesh(bodyGeo, redMaterial, rows);
      const bands = new THREE.InstancedMesh(bandGeo, goldMaterial, rows);
      bodies.frustumCulled = false;
      bands.frustumCulled = false;
      pivot.add(bodies, bands);
      disposables.push(bodies, bands);

      const matrix = new THREE.Matrix4();
      const turn = new THREE.Quaternion();
      const axis = new THREE.Vector3(0, 0, 1);
      const spot = new THREE.Vector3();
      const size = new THREE.Vector3(step, step, step);
      for (let i = 0; i < rows; i++) {
        // Alternating sides of the spine, each cocked a little — a real string
        // of crackers never hangs in a tidy column.
        turn.setFromAxisAngle(axis, (rand() * 2 - 1) * 0.3 + (i % 2 === 0 ? 0.22 : -0.22));
        spot.set(
          (i % 2 === 0 ? 1 : -1) * 5.5 * step,
          -12 * step - i * CRACKER_PITCH * step,
          (rand() * 2 - 1) * 2,
        );
        matrix.compose(spot, turn, size);
        bodies.setMatrixAt(i, matrix);
        spot.y += 5.4 * step;
        matrix.compose(spot, turn, size);
        bands.setMatrixAt(i, matrix);
      }
      bodies.instanceMatrix.needsUpdate = true;
      bands.instanceMatrix.needsUpdate = true;

      group.add(pivot);
      crackerStrings.push({ pivot, gain: 0.035 + rand() * 0.025, phase: rand() * Math.PI * 2 });
    }
  }

  /* --- clouds ---------------------------------------------------------- */

  const clouds = createRootedSprites(THREE, {
    count: CLOUD_COUNT,
    map: maps.cloud,
    variants: CLOUD_VARIANTS,
    z: Z_CLOUD,
    renderOrder: ORDER_CLOUD,
  });
  const cloudSpan = width + CLOUD_SIZE[1] * 2 * scale;
  const cloudDrift: { start: number; speed: number; y: number }[] = [];

  for (let i = 0; i < CLOUD_COUNT; i++) {
    cloudDrift.push({
      start: rand() * cloudSpan,
      speed: between(CLOUD_SPEED, rand()) * (rand() < 0.5 ? -1 : 1),
      // Kept to the upper part of the band, where the garland lives.
      y: -height * (0.04 + rand() * 0.34),
    });
    clouds.shape[i * 4] = between(CLOUD_SIZE, rand()) * scale;
    clouds.shape[i * 4 + 1] = (rand() - 0.5) * 0.2;
    clouds.shape[i * 4 + 2] = 0;
    clouds.shape[i * 4 + 3] = 0; // clouds do not answer to the wind down here
    clouds.tint[i * 3] = 1;
    clouds.tint[i * 3 + 1] = 1;
    clouds.tint[i * 3 + 2] = 1;
    clouds.style[i * 2] = Math.floor(rand() * CLOUD_VARIANTS);
    clouds.style[i * 2 + 1] = between(CLOUD_ALPHA, rand());
  }
  clouds.commit();
  group.add(clouds.mesh);
  disposables.push(clouds);

  /* --- animation ------------------------------------------------------- */

  const coinMatrix = new THREE.Matrix4();
  const coinTurn = new THREE.Quaternion();
  const coinAxis = new THREE.Vector3(0, 1, 0);
  const coinPos = new THREE.Vector3();
  const coinSize = new THREE.Vector3();

  const update = (time: number, breeze: number) => {
    blossomBack.setMotion(time, breeze);
    blossomFront.setMotion(time, breeze);

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const drift = cloudDrift[i];
      const x = (((drift.start + drift.speed * time) % cloudSpan) + cloudSpan) % cloudSpan;
      clouds.root[i * 2] = x - cloudSpan / 2;
      clouds.root[i * 2 + 1] = drift.y;
    }
    clouds.commit();

    for (let i = 0; i < lightCount; i++) {
      const pulse = lightPulse[i];
      lights.state[i * 2 + 1] = 0.8 + 0.18 * (0.5 + 0.5 * Math.sin(time * pulse.rate + pulse.phase));
    }
    lights.commitState();

    coinSpots.forEach((coin, i) => {
      coinTurn.setFromAxisAngle(coinAxis, time * coin.rate + coin.phase);
      coinPos.set(coin.x, coin.y, 0);
      coinSize.setScalar(coin.radius);
      coinMatrix.compose(coinPos, coinTurn, coinSize);
      coins.setMatrixAt(i, coinMatrix);
    });
    coins.instanceMatrix.needsUpdate = true;

    // The tassel reads the gust from a moment ago. Because the gust is a pure
    // function of time we can just ask it for the past, and subtracting the
    // body's own angle leaves the local lag.
    const past = breezeAt(time - TASSEL_LAG);

    lanterns.forEach((lantern, i) => {
      const angle = LANTERN_SWING * breeze;
      lantern.pivot.rotation.z = angle;
      lantern.tassel.rotation.z = LANTERN_SWING * TASSEL_SWING * past - angle;

      // Candlelight: a slow, shallow breathe, never a blink.
      glow.state[i * 2 + 1] = 0.72 + 0.2 * (0.5 + 0.5 * Math.sin(time * lantern.rate + lantern.phase));
      // The halo has to follow the body the pivot just swung.
      glow.centre[i * 2] = lantern.anchor.x + Math.sin(angle) * lantern.centre;
      glow.centre[i * 2 + 1] = lantern.anchor.y - Math.cos(angle) * lantern.centre;
    });
    glow.commitCentres();
    glow.commitState();

    for (const string of crackerStrings) {
      string.pivot.rotation.z = string.gain * breeze + Math.sin(time * 0.6 + string.phase) * string.gain * 0.4;
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

function createCnyScene({ THREE, scene, renderer, width, height }: DecorContext) {
  const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const texture = (canvas: HTMLCanvasElement) => {
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = anisotropy;
    return map;
  };

  const petalMap = texture(drawPetalAtlas());
  const maps: Maps = {
    blossom: texture(drawBlossomAtlas()),
    cloud: texture(drawCloudAtlas()),
    skin: texture(drawLanternSkin()),
    tassel: texture(drawTassel()),
  };
  maps.skin.wrapS = THREE.RepeatWrapping;

  const total = clamp(
    Math.round((width * height) / PETAL_AREA_EACH),
    PETAL_COUNT_RANGE[0],
    PETAL_COUNT_RANGE[1],
  );
  const frontCount = Math.max(3, Math.round(total * PETAL_FRONT_SHARE));
  const rand = mulberry32(0x2027);

  // Behind the garland the petals keep depth testing, so the solid lanterns
  // and coins occlude them; the foreground layer skips it and is drawn last,
  // over everything.
  const shared = { map: petalMap, variants: PETAL_VARIANTS, margin: PETAL_MARGIN, flip: true, rand };
  const petalsBack = createDrift(THREE, {
    ...shared,
    bands: PETALS_BACK,
    count: total - frontCount,
    z: Z_PETAL_BACK,
    depthTest: true,
    renderOrder: ORDER_PETAL_BACK,
  });
  const petalsFront = createDrift(THREE, {
    ...shared,
    bands: PETALS_FRONT,
    count: frontCount,
    z: Z_PETAL_FRONT,
    depthTest: false,
    renderOrder: ORDER_PETAL_FRONT,
  });
  scene.add(petalsBack.mesh, petalsFront.mesh);

  let decor = buildCny(THREE, width, height, maps);
  scene.add(decor.group);
  let builtAt = { width, height };

  return {
    update: (time: number, breeze: number) => {
      petalsBack.setTime(time);
      petalsFront.setTime(time);
      decor.update(time, breeze);
    },
    resize: (w: number, h: number) => {
      petalsBack.resize(w, h);
      petalsFront.resize(w, h);
      // Rebuilding allocates a few hundred instances, so only redo it when the
      // size has actually moved enough to change the layout.
      if (Math.abs(w - builtAt.width) > 8 || Math.abs(h - builtAt.height) > 40) {
        scene.remove(decor.group);
        decor.dispose();
        decor = buildCny(THREE, w, h, maps);
        scene.add(decor.group);
        builtAt = { width: w, height: h };
      }
      decor.group.position.y = h / 2;
    },
    dispose: () => {
      decor.dispose();
      petalsBack.dispose();
      petalsFront.dispose();
      petalMap.dispose();
      Object.values(maps).forEach((map) => map.dispose());
    },
  };
}

export default function CnyDecor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return mountDecor(container, createCnyScene);
  }, []);

  return <div ref={containerRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />;
}
