"use client";

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { useLenis } from "@/components/SmoothScroll";

// 3D glass "%" that replaces the static /assets/promo/percentage-glass.webp in
// the Promo section. The percent symbol is built procedurally (two extruded
// rings + a diagonal bar, merged into one beveled solid) and shaded as glass
// (MeshPhysicalMaterial transmission + a RoomEnvironment reflection map). It
// auto-spins, and spins faster while the user scrolls — we read the smoothed
// scroll velocity straight off the shared Lenis instance.
//
// three.js is imported *inside* the effect so it stays fully client-only and
// code-split out of the initial bundle; this file is the only client entry
// point, so PromoSection can stay a Server Component.

// Tuning constants.
const BASE_SPIN = 0.35; // rad/s, idle auto-rotation
const SCROLL_SPIN_SCALE = 0.05; // |lenis.velocity| -> extra rad/s
const MAX_SCROLL_SPIN = 7; // clamp so a fast flick can't blur it out
const SPIN_SMOOTH = 9; // higher = boost reacts/decays faster

export default function PercentGlass() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false); // first WebGL frame painted -> fade the PNG out

  // Keep the latest Lenis instance in a ref so the once-only setup effect can
  // read live scroll velocity without re-running when the context populates.
  const lenis = useLenis();
  const lenisRef = useRef<Lenis | null>(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced-motion — keep the static PNG, skip WebGL entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import(
        "three/examples/jsm/environments/RoomEnvironment.js"
      );
      const { mergeGeometries } = await import(
        "three/examples/jsm/utils/BufferGeometryUtils.js"
      );
      if (disposed) return;

      // --- renderer (transparent, so it composites over the section) ---
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        return; // no WebGL -> leave the PNG fallback in place
      }

      const width = container.clientWidth || 320;
      const height = container.clientHeight || 320;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0, 5);

      // --- environment map for glass reflections (neutral studio) ---
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new RoomEnvironment();
      const envMap = pmrem.fromScene(envScene, 0.04).texture;
      scene.environment = envMap;
      pmrem.dispose();

      // --- geometry: build the "%" out of two rings + a diagonal bar ---
      const ringShape = (cx: number, cy: number, outer: number, inner: number) => {
        const shape = new THREE.Shape();
        shape.absarc(cx, cy, outer, 0, Math.PI * 2, false);
        const hole = new THREE.Path();
        hole.absarc(cx, cy, inner, 0, Math.PI * 2, true);
        shape.holes.push(hole);
        return shape;
      };

      const extrude = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4, steps: 1, curveSegments: 64 } as const;

      const ringA = new THREE.ExtrudeGeometry(ringShape(-0.62, 0.62, 0.42, 0.19), extrude);
      const ringB = new THREE.ExtrudeGeometry(ringShape(0.62, -0.62, 0.42, 0.19), extrude);

      // Diagonal bar: build a vertical rounded rectangle, then rotate it 45° to "/".
      const barShape = new THREE.Shape();
      const bw = 0.17; // half width
      const bl = 0.98; // half length
      barShape.moveTo(-bw, -bl);
      barShape.lineTo(bw, -bl);
      barShape.lineTo(bw, bl);
      barShape.lineTo(-bw, bl);
      barShape.lineTo(-bw, -bl);
      const bar = new THREE.ExtrudeGeometry(barShape, extrude);
      bar.rotateZ(-Math.PI / 4);

      const geometry = mergeGeometries([ringA, ringB, bar], false);
      ringA.dispose();
      ringB.dispose();
      bar.dispose();
      geometry.computeVertexNormals();
      geometry.center();

      // --- glass material: white sparkle from env, royal-blue body from
      // attenuation. attenuationColor is kept vivid/high-green (not indigo) so
      // it reads as royal blue rather than picking up a purple cast. ---
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x3c78ff),
        metalness: 0,
        roughness: 0.05,
        transmission: 1,
        ior: 1.45,
        thickness: 1.6,
        attenuationColor: new THREE.Color(0x1a66e6),
        attenuationDistance: 1.3,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.5,
        specularIntensity: 1,
      });

      const group = new THREE.Group();
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      group.rotation.x = 0.16; // slight tilt so the extruded depth reads
      scene.add(group);

      // A white key light gives the clearcoat a moving specular streak.
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-3, 4, 5);
      scene.add(key);

      // --- run loop, gated on visibility for perf ---
      const clock = new THREE.Clock();
      let boost = 0;
      let raf = 0;
      let running = false;
      let inView = true;

      const frame = () => {
        if (!running) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.05);
        const v = lenisRef.current ? Math.abs(lenisRef.current.velocity) : 0;
        const target = Math.min(v * SCROLL_SPIN_SCALE, MAX_SCROLL_SPIN);
        boost += (target - boost) * Math.min(dt * SPIN_SMOOTH, 1);
        group.rotation.y += (BASE_SPIN + boost) * dt;
        renderer.render(scene, camera);
        if (!ready && !disposed) setReady(true);
      };

      const start = () => {
        if (running) return;
        running = true;
        clock.start();
        frame();
      };
      const stop = () => {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      };
      const sync = () => {
        if (inView && !document.hidden) start();
        else stop();
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          sync();
        },
        { threshold: 0 }
      );
      io.observe(container);
      document.addEventListener("visibilitychange", sync);

      const ro = new ResizeObserver(() => {
        const w = container.clientWidth || width;
        const h = container.clientHeight || height;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      ro.observe(container);

      sync();

      cleanup = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", sync);
        renderer.domElement.remove();
        geometry.dispose();
        material.dispose();
        envMap.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute right-[8px] top-[-102px] h-[320px] w-[320px]"
    >
      {/* Static fallback: reduced-motion / no-WebGL / until the first frame. */}
      <img
        src="/assets/promo/percentage-glass.webp"
        alt=""
        className="absolute left-1/2 top-1/2 h-[260px] w-auto -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      />
    </div>
  );
}
