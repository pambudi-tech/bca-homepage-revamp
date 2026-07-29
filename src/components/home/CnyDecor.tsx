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
 *   • coins — pierced gold tucked into the flowers, turning slowly
 *   • firecrackers — a red string off each end of the run, standing in for
 *     the Christmas garland's side legs. Only wide enough sections get them —
 *     below that the run behaves exactly like the Christmas one at the same
 *     width and just bleeds off both edges, so mobile has no dangling parts
 *     from either scene
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
 * Below this the run drops its ends and bleeds off both edges instead —
 * matching the width at which the Christmas garland's own legs disappear, so
 * the two scenes agree on when a phone stops getting dangling parts.
 */
const FRAME_MIN_WIDTH = 900;
/** Where the run stops, in from each edge — this is also where the firecracker
 *  strings hang, so it has to stay comfortably on screen. */
const FRAME_INSET = 34;
const FRAME_CORNER = 78;
/** Tighter than the Christmas swag. There are no legs here, so every lantern
 *  hangs off a junction in the top run, and the run needs enough junctions to
 *  carry four or five of them. */
const SWAG_TARGET = 260;
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
 *  run into one another — the bough should read as heavy with flower, with
 *  wood showing only in the odd gap. */
const CLUSTER_SPACING = 21;
const BLOSSOMS_PER_CLUSTER: [number, number] = [7, 13];
/** How far a flower strays from its cluster's centre, px. */
const CLUSTER_SPREAD = 25;
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

const COIN_SPACING = 210;
const COIN_RADIUS: [number, number] = [7, 10.5];
const COIN_GOLD = 0xd9a83c;

/* ── lanterns ─────────────────────────────────────────────────────────── */

/** Body height and half-width, px, before the per-lantern size step. */
const LANTERN_HEIGHT = 34;
const LANTERN_RADIUS = 21;
/** Big and small alternate, so a row of them has a rhythm. */
const LANTERN_STEPS = [1, 0.76];
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
/** Vertical pitch between crackers, px. */
const CRACKER_PITCH = 16;
const CRACKER_RED = 0xd0202c;

/* ── stacking ─────────────────────────────────────────────────────────── */

const Z_CLOUD = -600;
const Z_PETAL_BACK = -400;
const Z_BOUGH = -60;
const Z_BLOSSOM_BACK = -40;
const Z_LIGHT = -20;
/** Between the two blossom layers on purpose — coins sit *in* the flowers, so
 *  the front layer has to be able to grow over them. */
const Z_COIN = -28;
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

  // Wide enough sections stop the run at the inset and hang a firecracker
  // string off each end; narrow ones bleed the run off both edges instead, the
  // same call the Christmas garland makes at this width — so a phone gets one
  // plain top run and nothing dangling from either scene.
  const { curve, ties, ends, bleeds } = createFramePath(THREE, {
    width,
    height,
    scale,
    rand,
    legs: width >= FRAME_MIN_WIDTH ? "none" : "bleed",
    top: GARLAND_TOP,
    inset: FRAME_INSET,
    corner: FRAME_CORNER,
    swagTarget: SWAG_TARGET,
    sag: SWAG_SAG,
    tension: SWAG_TENSION,
  });
  const length = curve.getLength();
  const offsetAt = framePathSampler(THREE, curve);

  /** Where both ends sit on screen the flower thins into them rather than
   *  being cut off square. A bleeding run already ends past the section's
   *  edges, where nobody can see it. */
  const taper = (u: number) => (bleeds ? 1 : clamp(Math.min(u, 1 - u) / 0.03, 0.35, 1));

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
  const knots: { x: number; y: number; thin: number }[] = [];
  for (let i = 0; i < clusterCount; i++) {
    const u = clamp((i + rand() * 0.85) / clusterCount, 0.004, 0.996);
    const spot = offsetAt(u, rand() < 0.5 ? -1 : 1, rand() * CLUSTER_OFFSET * scale);
    knots.push({ x: spot.x, y: spot.y, thin: taper(u) });
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
      layer.shape[slot * 4] = between(BLOSSOM_SIZE, rand()) * scale * knot.thin * (toBack ? 0.9 : 1);
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
      layer.style[slot * 2 + 1] = knot.thin;
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
    lights.state[i * 2] = between(LIGHT_SIZE, rand()) * scale * taper(u);
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
  const coinCount = Math.max(3, Math.round(length / (COIN_SPACING * scale)));
  const coins = new THREE.InstancedMesh(coinGeometry, coinMaterial, coinCount);
  coins.position.z = Z_COIN;
  coins.frustumCulled = false;
  group.add(coins);
  disposables.push(coinGeometry, coinMaterial, coins);

  const coinSpots: { x: number; y: number; radius: number; phase: number; rate: number }[] = [];
  for (let i = 0; i < coinCount; i++) {
    // Pinned to a flower cluster rather than to the bough, so a coin always
    // looks tucked into something.
    const knot = knots[Math.floor(rand() * knots.length)];
    coinSpots.push({
      x: knot.x + (rand() * 2 - 1) * CLUSTER_SPREAD * scale,
      y: knot.y + (rand() * 2 - 1) * CLUSTER_SPREAD * scale,
      radius: between(COIN_RADIUS, rand()) * scale * knot.thin,
      phase: rand() * Math.PI * 2,
      rate: 0.22 + rand() * 0.2,
    });
  }

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

  ties.forEach((tie, i) => {
    const step = LANTERN_STEPS[i % LANTERN_STEPS.length] * scale;
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

  // One off each end of the run, standing in for the side legs the Christmas
  // version turns down — but only where the run actually has ends on screen
  // to hang them from. A bleeding run has none, and needs nothing here.
  if (!bleeds) {
    const bodyGeo = new THREE.CylinderGeometry(4.2, 4.2, 13, 12);
    const bandGeo = new THREE.CylinderGeometry(4.5, 4.5, 2.4, 12);
    const stringGeo = new THREE.CylinderGeometry(0.7, 0.7, 1, 6);
    stringGeo.translate(0, -0.5, 0);
    const redMaterial = new THREE.MeshStandardMaterial({ color: CRACKER_RED, roughness: 0.55, metalness: 0.05 });
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x6f1418 });
    disposables.push(bodyGeo, bandGeo, stringGeo, redMaterial, stringMaterial);

    const drop = clamp(height * 0.16, CRACKER_DROP[0] * scale, CRACKER_DROP[1] * scale);
    const rows = Math.max(5, Math.floor(drop / (CRACKER_PITCH * scale)));

    for (const end of ends) {
      const pivot = new THREE.Group();
      pivot.position.set(end.x, end.y + 6 * scale, Z_CRACKER);

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
      const size = new THREE.Vector3(scale, scale, scale);
      for (let i = 0; i < rows; i++) {
        // Alternating sides of the spine, each cocked a little — a real string
        // of crackers never hangs in a tidy column.
        turn.setFromAxisAngle(axis, (rand() * 2 - 1) * 0.3 + (i % 2 === 0 ? 0.22 : -0.22));
        spot.set(
          (i % 2 === 0 ? 1 : -1) * 5.5 * scale,
          -12 * scale - i * CRACKER_PITCH * scale,
          (rand() * 2 - 1) * 2,
        );
        matrix.compose(spot, turn, size);
        bodies.setMatrixAt(i, matrix);
        spot.y += 5.4 * scale;
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
