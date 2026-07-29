import type * as THREE_NS from "three";

/**
 * Shared machinery for the Promo section's seasonal WebGL scenes.
 *
 * Every holiday scene turns out to want the same five things: a canvas whose
 * world units are CSS pixels, a field of drifting sprites, soft glowing points,
 * one shared gust of wind, and a lifecycle that only burns frames while the
 * section is actually on screen. That is all this file is. What each holiday
 * *draws* lives in its own module — this one has no opinion about pine needles
 * or lanterns.
 */

export type Three = typeof THREE_NS;

/* ── numbers ──────────────────────────────────────────────────────────── */

/** mulberry32 — the same tiny PRNG Confetti uses, so a scene is reproducible. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = ([lo, hi]: [number, number], u: number) => lo + (hi - lo) * u;
export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * One gust, shared by everything in a scene. Two detuned sines rather than one,
 * so the wind never settles into an obvious rhythm — and every prop reading
 * from the same number is what makes a garland move as one object instead of a
 * row of independently wobbling parts.
 */
export const breezeAt = (time: number) => 0.6 * Math.sin(time * 0.42) + 0.4 * Math.sin(time * 0.77 + 1.3);

/* ── sprite plumbing ──────────────────────────────────────────────────── */

/**
 * Picks a cell out of a square sprite atlas. Shared by every sprite shader
 * here, so the atlas convention only has to be got right once: cells run left
 * to right, top to bottom, in a grid that is `cols` on a side.
 */
export const ATLAS_UV = /* glsl */ `
  vec2 atlasUv(vec2 uv, float cell, float cols) {
    return (uv + vec2(mod(cell, cols), floor(cell / cols))) / cols;
  }
`;

/** Cells per side for an atlas holding `variants` sprites. */
export const atlasCols = (variants: number) => Math.ceil(Math.sqrt(variants));

/** A unit quad, instanced. The building block for every sprite layer below. */
export function spriteGeometry(THREE: Three, count: number) {
  const quad = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = quad.index;
  geometry.setAttribute("position", quad.attributes.position);
  geometry.setAttribute("uv", quad.attributes.uv);
  geometry.instanceCount = count;
  return geometry;
}

/* ── drifting sprites: snow, petals, embers ───────────────────────────── */

export type DriftBand = {
  /** Portion of the layer's sprites this band takes. */
  share: number;
  /** Width on screen, px. */
  size: [number, number];
  /** Fall rate, px/s. */
  speed: [number, number];
  /** Half-width of the horizontal sway, px. */
  drift: [number, number];
  alpha: number;
  /** Peak tumble rate, rad/s. */
  spin: number;
};

const DRIFT_VERTEX = /* glsl */ `
  attribute vec2 aOrigin;
  attribute vec4 aParam;   // fall px/s, drift px, drift rad/s, tumble rad/s
  attribute vec3 aStyle;   // size px, alpha, atlas cell
  attribute vec3 aTint;
  uniform vec2 uSize;
  uniform float uTime;
  uniform float uMargin;
  uniform float uCols;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vAlpha;

  const float TAU = 6.2831853;
  ${ATLAS_UV}

  void main() {
    // Wrapping the fall through one span is what makes the field endless: a
    // sprite leaving the bottom margin re-enters at the top one.
    float span = uSize.y + uMargin * 2.0;
    float fall = mod(aOrigin.y * span + uTime * aParam.x, span);

    vec2 centre = vec2(
      (aOrigin.x - 0.5) * uSize.x + sin(uTime * aParam.z + aOrigin.y * TAU) * aParam.y,
      uSize.y * 0.5 + uMargin - fall
    );

    vec2 corner = position.xy * aStyle.x;
    #ifdef DRIFT_FLIP
      // A petal turning edge-on. Squashing across the sprite's own axis before
      // it is rotated is what separates a petal fluttering through the air
      // from a disc spinning in place; at the extremes it mirrors, which is
      // exactly what the far face doing round would look like.
      corner.x *= cos(uTime * aParam.w * 1.7 + aOrigin.y * TAU);
    #endif

    float a = uTime * aParam.w + aOrigin.x * TAU;
    float s = sin(a), c = cos(a);
    corner = vec2(corner.x * c - corner.y * s, corner.x * s + corner.y * c);

    vUv = atlasUv(uv, aStyle.z, uCols);
    vTint = aTint;
    vAlpha = aStyle.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(centre + corner, 0.0, 1.0);
  }
`;

const DRIFT_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vAlpha;

  void main() {
    vec4 texel = texture2D(uMap, vUv);
    if (texel.a < 0.004) discard;
    // An atlas either carries its own colour and takes white here, or carries
    // greyscale shapes and lets the palette come from the tint.
    gl_FragColor = vec4(texel.rgb * vTint, texel.a * vAlpha);
    #include <colorspace_fragment>
  }
`;

export type DriftOptions = {
  bands: DriftBand[];
  count: number;
  map: THREE_NS.Texture;
  variants: number;
  /** How far outside the canvas sprites wrap, so none pops in or out. */
  margin: number;
  z: number;
  renderOrder: number;
  /**
   * Back layers keep depth testing so the scene's solid props occlude them;
   * a foreground layer turns it off and is drawn last, over everything.
   */
  depthTest: boolean;
  /** Squash sprites across their axis as they turn — petals, not snow. */
  flip?: boolean;
  /**
   * Colours to deal out, for an atlas of greyscale shapes. Leave it off and
   * every sprite is drawn at the atlas's own colour.
   */
  tints?: number[];
  rand: () => number;
};

export function createDrift(THREE: Three, options: DriftOptions) {
  const { bands, count, rand } = options;
  const geometry = spriteGeometry(THREE, count);

  const origin = new Float32Array(count * 2);
  const param = new Float32Array(count * 4);
  const style = new Float32Array(count * 3);
  const tint = new Float32Array(count * 3).fill(1);
  const colour = new THREE.Color();

  const total = bands.reduce((sum, band) => sum + band.share, 0);
  let i = 0;
  bands.forEach((band, index) => {
    // The last band mops up the rounding remainder so every slot is filled.
    const n = index === bands.length - 1 ? count - i : Math.round((band.share / total) * count);
    for (let k = 0; k < n && i < count; k++, i++) {
      origin[i * 2] = rand();
      origin[i * 2 + 1] = rand();
      param[i * 4] = between(band.speed, rand());
      param[i * 4 + 1] = between(band.drift, rand());
      param[i * 4 + 2] = 0.28 + rand() * 0.55;
      param[i * 4 + 3] = (rand() * 2 - 1) * band.spin;
      style[i * 3] = between(band.size, rand());
      style[i * 3 + 1] = band.alpha * (0.75 + rand() * 0.4);
      style[i * 3 + 2] = Math.floor(rand() * options.variants);

      if (options.tints) {
        colour.setHex(options.tints[Math.floor(rand() * options.tints.length)]);
        tint[i * 3] = colour.r;
        tint[i * 3 + 1] = colour.g;
        tint[i * 3 + 2] = colour.b;
      }
    }
  });

  geometry.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origin, 2));
  geometry.setAttribute("aParam", new THREE.InstancedBufferAttribute(param, 4));
  geometry.setAttribute("aStyle", new THREE.InstancedBufferAttribute(style, 3));
  geometry.setAttribute("aTint", new THREE.InstancedBufferAttribute(tint, 3));

  const material = new THREE.ShaderMaterial({
    vertexShader: DRIFT_VERTEX,
    fragmentShader: DRIFT_FRAGMENT,
    defines: options.flip ? { DRIFT_FLIP: "" } : {},
    uniforms: {
      uMap: { value: options.map },
      uSize: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMargin: { value: options.margin },
      uCols: { value: atlasCols(options.variants) },
    },
    transparent: true,
    depthWrite: false,
    depthTest: options.depthTest,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = options.z;
  mesh.renderOrder = options.renderOrder;
  // The quad's own bounds say nothing about where the instances end up.
  mesh.frustumCulled = false;

  return {
    mesh,
    resize: (w: number, h: number) => material.uniforms.uSize.value.set(w, h),
    setTime: (t: number) => (material.uniforms.uTime.value = t),
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

/* ── rooted sprites: needles, blossoms, drifting motifs ───────────────── */

const ROOTED_VERTEX = /* glsl */ `
  attribute vec2 aRoot;
  attribute vec4 aShape;   // size px, rest angle, sway phase, sway gain
  attribute vec3 aTint;
  attribute vec2 aStyle;   // atlas cell, alpha
  uniform float uTime;
  uniform float uBreeze;
  uniform float uFlutter;
  uniform float uCols;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vAlpha;

  ${ATLAS_UV}

  void main() {
    // A sprite pivots where it joins the branch, not around its middle — so
    // the quad is lifted half a unit before it is scaled and turned.
    float angle = aShape.y + (uBreeze + sin(uTime * uFlutter + aShape.z) * 0.5) * aShape.w;
    float s = sin(angle), c = cos(angle);
    vec2 blade = vec2(position.x, position.y + 0.5) * aShape.x;

    vUv = atlasUv(uv, aStyle.x, uCols);
    vTint = aTint;
    vAlpha = aStyle.y;
    gl_Position = projectionMatrix * modelViewMatrix
      * vec4(aRoot + vec2(blade.x * c - blade.y * s, blade.x * s + blade.y * c), 0.0, 1.0);
  }
`;

const ROOTED_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vAlpha;

  void main() {
    vec4 texel = texture2D(uMap, vUv);
    if (texel.a < 0.01) discard;
    // An atlas either carries greyscale shading and lets the tint supply the
    // hue, or carries its own colour and takes the tint as brightness. Both
    // are the same multiply.
    gl_FragColor = vec4(texel.rgb * vTint, texel.a * vAlpha);
    #include <colorspace_fragment>
  }
`;

export type RootedSpriteOptions = {
  count: number;
  map: THREE_NS.Texture;
  variants: number;
  z: number;
  renderOrder: number;
  /** Rate of the idle flutter layered under the shared gust, rad/s. */
  flutter?: number;
};

/**
 * Sprites pinned to points in the scene, each turned to its own angle and
 * swaying on the shared gust. The caller fills the four arrays and commits —
 * they are laid out per instance as root(2), shape(4), tint(3), style(2).
 */
export function createRootedSprites(THREE: Three, options: RootedSpriteOptions) {
  const { count } = options;
  const geometry = spriteGeometry(THREE, count);

  const root = new Float32Array(count * 2);
  const shape = new Float32Array(count * 4);
  const tint = new Float32Array(count * 3);
  const style = new Float32Array(count * 2);

  const attributes = [
    new THREE.InstancedBufferAttribute(root, 2),
    new THREE.InstancedBufferAttribute(shape, 4),
    new THREE.InstancedBufferAttribute(tint, 3),
    new THREE.InstancedBufferAttribute(style, 2),
  ];
  geometry.setAttribute("aRoot", attributes[0]);
  geometry.setAttribute("aShape", attributes[1]);
  geometry.setAttribute("aTint", attributes[2]);
  geometry.setAttribute("aStyle", attributes[3]);

  const material = new THREE.ShaderMaterial({
    vertexShader: ROOTED_VERTEX,
    fragmentShader: ROOTED_FRAGMENT,
    uniforms: {
      uMap: { value: options.map },
      uTime: { value: 0 },
      uBreeze: { value: 0 },
      uFlutter: { value: options.flutter ?? 0.55 },
      uCols: { value: atlasCols(options.variants) },
    },
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = options.z;
  mesh.renderOrder = options.renderOrder;
  mesh.frustumCulled = false;

  return {
    mesh,
    root,
    shape,
    tint,
    style,
    commit: () => attributes.forEach((attribute) => (attribute.needsUpdate = true)),
    setMotion: (time: number, breeze: number) => {
      material.uniforms.uTime.value = time;
      material.uniforms.uBreeze.value = breeze;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

/* ── glowing points: fairy lights, lantern light ──────────────────────── */

// Halos are drawn as ordinary alpha-blended discs rather than additive ones.
// The promo band's background is near-white, where "add light" is invisible;
// tinting the backdrop with the light's own colour is what actually reads as
// glow against it.
const GLOW_VERTEX = /* glsl */ `
  attribute vec2 aCentre;
  attribute vec2 aState;   // diameter px, brightness 0-1
  varying vec2 vUv;
  varying float vLit;

  void main() {
    vUv = uv;
    vLit = aState.y;
    gl_Position = projectionMatrix * modelViewMatrix
      * vec4(aCentre + position.xy * aState.x, 0.0, 1.0);
  }
`;

const GLOW_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec4 uShape;   // halo power, halo gain, core power, core whiteness
  varying vec2 vUv;
  varying float vLit;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float falloff = clamp(1.0 - d, 0.0, 1.0);
    // A long coloured skirt, then a tight core hot enough to read as a source.
    float halo = pow(falloff, uShape.x) * uShape.y;
    float core = pow(falloff, uShape.z);
    float a = (halo + core) * vLit;
    if (a < 0.003) discard;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), core * uShape.w), a);
    #include <colorspace_fragment>
  }
`;

export type GlowOptions = {
  count: number;
  color: number;
  z: number;
  renderOrder: number;
  /** Halo power / halo gain / core power / core whiteness. */
  shape?: [number, number, number, number];
};

/**
 * A field of soft points. The caller owns the two arrays: `centre` is normally
 * written once at build time, `state` every frame — hence the separate commits,
 * so a twinkle does not re-upload positions that never move.
 */
export function createGlow(THREE: Three, options: GlowOptions) {
  const { count } = options;
  const geometry = spriteGeometry(THREE, count);

  const centre = new Float32Array(count * 2);
  const state = new Float32Array(count * 2);
  const centreAttr = new THREE.InstancedBufferAttribute(centre, 2);
  const stateAttr = new THREE.InstancedBufferAttribute(state, 2);
  centreAttr.setUsage(THREE.DynamicDrawUsage);
  stateAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("aCentre", centreAttr);
  geometry.setAttribute("aState", stateAttr);

  const material = new THREE.ShaderMaterial({
    vertexShader: GLOW_VERTEX,
    fragmentShader: GLOW_FRAGMENT,
    uniforms: {
      uColor: { value: new THREE.Color(options.color) },
      uShape: { value: new THREE.Vector4(...(options.shape ?? [2.6, 0.5, 7, 0.85])) },
    },
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = options.z;
  mesh.renderOrder = options.renderOrder;
  mesh.frustumCulled = false;

  return {
    mesh,
    centre,
    state,
    commitCentres: () => (centreAttr.needsUpdate = true),
    commitState: () => (stateAttr.needsUpdate = true),
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

/* ── the path a garland hangs along ───────────────────────────────────── */

export type FramePathOptions = {
  width: number;
  height: number;
  /** Viewport-relative scale; see the note on each seasonal scene. */
  scale: number;
  rand: () => number;
  /** How far below the section's top edge the run is pinned, px. */
  top: number;
  /**
   * "auto" frames the section with a leg down each edge where there is room.
   * "none" keeps the run to the top and stops it at the inset, leaving both
   * ends on screen for a scene that wants to hang something off them.
   * "bleed" keeps it to the top and runs it off both edges, so it has no ends
   * to design at all.
   */
  legs?: "auto" | "none" | "bleed";
  /**
   * Below this width the side legs are dropped and the top run simply bleeds
   * off both edges. A phone has no spare horizontal room for a frame — the
   * legs would sit on the cards rather than beside them.
   */
  minWidth?: number;
  /** How far in from the section's edge the run stops, px. */
  inset: number;
  /** Radius of the turn from leg to top run, px. */
  corner: number;
  /** Leg length, clamped against the section's own height. */
  drop?: [number, number];
  /** How far the top run overshoots each edge when it has no legs to end in. */
  overhang?: number;
  /** Target width of one swag — the count, and so the tie count, follows. */
  swagTarget: number;
  /** Droop at the middle of a swag, px. */
  sag: [number, number];
  /** Fullness of the catenary: higher pinches the ends and flattens the bottom. */
  tension: number;
};

/**
 * Lays out the path a garland follows. Wide viewports get the full frame — a
 * leg down each edge, a turned corner, and swags across the top; narrow ones
 * get the top run alone, bleeding off both sides.
 *
 * Returns the curve plus the points where the garland is "tied": each corner
 * and every junction between swags. That is where a scene hangs whatever its
 * hero ornament is — a bow, a lantern.
 *
 * Everything is laid out hanging from y = 0, so the caller only has to park
 * the group on the section's top edge.
 */
export function createFramePath(THREE: Three, options: FramePathOptions) {
  const { width, height, scale, rand } = options;
  const topY = -options.top;
  const mode = options.legs ?? "auto";
  const framed = mode === "auto" && width >= (options.minWidth ?? 900);
  /**
   * Whether the run disappears past the section's edges — either because it
   * asked to, or because legs were wanted and there was no room for them. A
   * "none" run stops at the inset instead, so whatever hangs off its ends
   * stays on screen.
   */
  const bleeds = mode === "bleed" || (mode === "auto" && !framed);
  const corner = options.corner * scale;
  const points: THREE_NS.Vector3[] = [];
  const ties: THREE_NS.Vector3[] = [];
  const push = (x: number, y: number) => points.push(new THREE.Vector3(x, y, 0));

  // A true catenary rather than a sine — the difference is exactly the
  // flat-bottomed, steep-shouldered droop that makes a garland look hung
  // rather than drawn.
  const coshK = Math.cosh(options.tension);
  const catenary = (t: number) =>
    (coshK - Math.cosh((t * 2 - 1) * options.tension)) / (coshK - 1);

  const dropRange = options.drop ?? [150, 240];
  const leg = framed ? clamp(height * 0.2, dropRange[0] * scale, dropRange[1] * scale) : 0;
  const legX = bleeds
    ? -width / 2 - (options.overhang ?? 110) * scale
    : -width / 2 + options.inset;
  const runFrom = framed ? legX + corner : legX;
  const runTo = -runFrom;
  const legTop = topY - corner;

  if (framed) {
    // Leg, bottom upward. The slight outward belly keeps it from reading as a
    // ruled line — a hung garland never falls perfectly straight.
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      push(legX - Math.sin(t * Math.PI) * 4, -leg + (leg + legTop) * t);
    }
    // Corner, from straight-up round to along-the-top.
    for (let i = 1; i <= 10; i++) {
      const a = Math.PI - (Math.PI / 2) * (i / 10);
      push(legX + corner + Math.cos(a) * corner, legTop + Math.sin(a) * corner);
      if (i === 5) ties.push(points[points.length - 1].clone());
    }
  }

  const span = runTo - runFrom;
  const swags = Math.max(2, Math.round(span / (options.swagTarget * scale)));
  const step = span / swags;
  // Anchors sit at slightly different heights so the run never looks stamped —
  // except the two that meet the corners, which have to land exactly on them.
  const anchors = Array.from({ length: swags + 1 }, (_, i) =>
    framed && (i === 0 || i === swags) ? topY : topY - rand() * 10,
  );

  const SAMPLES = 22;
  for (let s = 0; s < swags; s++) {
    const sag = between(options.sag, rand()) * scale;
    for (let j = framed || s > 0 ? 1 : 0; j <= SAMPLES; j++) {
      const t = j / SAMPLES;
      const y = anchors[s] + (anchors[s + 1] - anchors[s]) * t - sag * catenary(t);
      push(runFrom + step * (s + t), y);
    }
    if (s < swags - 1) ties.push(points[points.length - 1].clone());
  }

  if (framed) {
    for (let i = 1; i <= 10; i++) {
      const a = (Math.PI / 2) * (1 - i / 10);
      push(runTo + Math.cos(a) * corner, legTop + Math.sin(a) * corner);
      if (i === 5) ties.push(points[points.length - 1].clone());
    }
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      push(-legX + Math.sin(t * Math.PI) * 4, legTop - (leg + legTop) * t);
    }
  }

  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.5);
  // The default 200 divisions is far too coarse for a path this long — the
  // arc-length table would bunch sprites on the swags and starve the legs.
  curve.arcLengthDivisions = 1200;

  return {
    curve,
    ties,
    framed,
    bleeds,
    ends: [points[0].clone(), points[points.length - 1].clone()],
  };
}

/**
 * Position and outward normal at `u` along a garland path, with a signed
 * sideways offset applied. Allocates its own scratch vectors, so it is meant
 * to be built once per garland and called during the build, not per frame.
 */
export function framePathSampler(THREE: Three, curve: THREE_NS.Curve<THREE_NS.Vector3>) {
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector2();

  return (u: number, side: number, distance: number) => {
    point.copy(curve.getPointAt(u));
    tangent.copy(curve.getTangentAt(u));
    // Rotating the tangent a quarter turn gives the side of the path gravity
    // is pulling away from.
    normal.set(tangent.y, -tangent.x).normalize();
    return {
      x: point.x + normal.x * side * distance,
      y: point.y + normal.y * side * distance,
      nx: normal.x,
      ny: normal.y,
    };
  };
}

/* ── environment ──────────────────────────────────────────────────────── */

/**
 * A 2:1 equirectangular sky used as the reflection map for whatever solid
 * props a scene has: bright overhead, cooling into the promo band's blue at
 * the horizon, with a warm band low down. Tiny on purpose — it only ever feeds
 * PMREM, which blurs it to a gradient anyway.
 */
export function drawSkyEnvironment(width = 128): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width / 2;
  const ctx = canvas.getContext("2d")!;

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#ffffff");
  sky.addColorStop(0.34, "#e8f5ff");
  sky.addColorStop(0.62, "#bcdcf4");
  sky.addColorStop(0.82, "#ffe6c4");
  sky.addColorStop(1, "#8fa9bd");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // A soft key "window", so there is one bright spot to reflect as a highlight
  // rather than an even wash.
  const key = ctx.createRadialGradient(
    canvas.width * 0.28,
    canvas.height * 0.24,
    0,
    canvas.width * 0.28,
    canvas.height * 0.24,
    canvas.width * 0.26,
  );
  key.addColorStop(0, "rgba(255,255,255,1)");
  key.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

/* ── the canvas and its lifecycle ─────────────────────────────────────── */

export type DecorContext = {
  THREE: Three;
  scene: THREE_NS.Scene;
  renderer: THREE_NS.WebGLRenderer;
  width: number;
  height: number;
};

export type DecorLayers = {
  /** Every frame, with elapsed seconds and the shared gust. */
  update: (time: number, breeze: number) => void;
  /** Whenever the canvas changes size; the layer decides what to rebuild. */
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

/**
 * Mounts a decor canvas into `container` and runs it.
 *
 * The camera is orthographic with one world unit pinned to one CSS pixel, so
 * a scene's constants are just "px on screen" and its layout survives any
 * viewport without a scale factor to reason about. Depth is meant to be faked
 * the way the eye reads it — size, tint, overlap — with real z used only to
 * stack layers.
 *
 * Returns a synchronous teardown, safe to call before three.js has even
 * finished loading.
 */
export function mountDecor(
  container: HTMLElement,
  create: (ctx: DecorContext) => DecorLayers,
): () => void {
  let disposed = false;
  let cleanup: (() => void) | undefined;

  (async () => {
    const THREE = await import("three");
    if (disposed) return;

    let renderer: THREE_NS.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL — the section simply goes undecorated
    }

    let width = container.clientWidth || 1280;
    let height = container.clientHeight || 720;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 3000);
    camera.position.z = 1000;

    // Reflections off a procedural sky rather than an asset — it only ever
    // feeds PMREM, which blurs it to a gradient.
    const sky = new THREE.CanvasTexture(drawSkyEnvironment());
    sky.mapping = THREE.EquirectangularReflectionMapping;
    sky.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromEquirectangular(sky).texture;
    scene.environment = environment;
    pmrem.dispose();
    sky.dispose();

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-0.6, 1, 1.2);
    const warm = new THREE.DirectionalLight(0xffd6a0, 0.8);
    warm.position.set(0.9, -0.4, 0.8);
    scene.add(key, warm, new THREE.AmbientLight(0xdfeeff, 0.9));

    const layers = create({ THREE, scene, renderer, width, height });

    const layout = () => {
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      layers.resize(width, height);
    };
    layout();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    let inView = false;

    const draw = (time: number) => {
      layers.update(time, breezeAt(time));
      renderer.render(scene, camera);
    };

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      elapsed += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(elapsed);
    };

    const start = () => {
      if (running) return;
      // Reduced motion still gets the scene, just held on a single frame — the
      // decoration is the point, the movement is the garnish.
      if (reduced.matches) {
        draw(6);
        return;
      }
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (inView && !document.hidden) start();
      else stop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    const resize = new ResizeObserver(() => {
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      if (w === width && h === height) return;
      width = w;
      height = h;
      layout();
      if (!running) draw(elapsed || 6);
    });
    resize.observe(container);

    cleanup = () => {
      stop();
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      canvas.remove();
      layers.dispose();
      environment.dispose();
      renderer.dispose();
    };
  })();

  return () => {
    disposed = true;
    cleanup?.();
  };
}
