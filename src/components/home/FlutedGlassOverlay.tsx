"use client";

import { useEffect, useMemo, useState } from "react";

const STRIP_W = 480;
const STRIP_H = 1600;

// Anchored to the page's horizontal centre at a fixed pixel offset (design
// viewport 1440px, so the strip sits flush with the edge there), the same
// technique the other section backgrounds use — `left/right: 0` would instead
// track the *viewport* edge, so the strip would drift relative to the centred
// content every time the window is resized.
const DESIGN_VIEWPORT_W = 1440;
// Pushes each strip further out from that centred position (left strip left,
// right strip right) so more of it clears the content column.
const OUTWARD_SHIFT = 240;
const EDGE_OFFSET = DESIGN_VIEWPORT_W / 2 + OUTWARD_SHIFT;

interface FlutedGlassOverlayProps {
  fluteWidth?: number;
  strength?: number;
  blur?: number;
  liquidity?: number;
  drip?: number;
  side: "left" | "right";
  imageSrc?: string;
  className?: string;
  imageRef?: React.RefObject<SVGImageElement | null>;
}

type Maps = { mapUrl: string; highlightUrl: string; shadowUrl: string };

function buildLiquidMaps(
  avgW: number,
  liquidity: number,
  drip: number,
): Maps {
  const widths: number[] = [];
  let total = 0;
  while (total < STRIP_W) {
    widths.push(avgW); // No variance
    total += avgW;
  }

  const map = document.createElement("canvas");
  map.width = STRIP_W;
  map.height = 1;
  const mctx = map.getContext("2d");
  
  const hi = document.createElement("canvas");
  hi.width = STRIP_W;
  hi.height = 1;
  const hctx = hi.getContext("2d");
  
  const sh = document.createElement("canvas");
  sh.width = STRIP_W;
  sh.height = 1;
  const sctx = sh.getContext("2d");
  
  if (!mctx || !hctx || !sctx) return { mapUrl: "", highlightUrl: "", shadowUrl: "" };

  let x0 = 0;
  // Use a pseudo-random seed logic for flute bias to match original behavior
  let seed = 42;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (const w of widths) {
    const fluteBias = (rand() - 0.5) * 0.5;
    for (let i = 0; i < w && x0 + i < STRIP_W; i++) {
      const t = i / w;

      const eased = t - (Math.sin(2 * Math.PI * t) / (2 * Math.PI)) * liquidity;
      const r = Math.round(Math.min(1, Math.max(0, eased)) * 255);

      const edge = 1 - Math.min(t, 1 - t) * 2;
      const spike = Math.pow(edge, 8) * drip;
      const g = Math.round(
        Math.min(255, Math.max(0, 128 + (spike + fluteBias * drip * 0.4) * 127))
      );

      mctx.fillStyle = `rgb(${r},${g},0)`;
      mctx.fillRect(x0 + i, 0, 1, 1);
    }

    const hgrad = hctx.createLinearGradient(x0, 0, x0 + w, 0);
    hgrad.addColorStop(0, "rgba(255,255,255,0)");
    hgrad.addColorStop(0.1, "rgba(255,255,255,0.02)");
    hgrad.addColorStop(0.38, "rgba(255,255,255,0.20)");
    hgrad.addColorStop(0.55, "rgba(255,255,255,0.10)");
    hgrad.addColorStop(1, "rgba(255,255,255,0)");
    hctx.fillStyle = hgrad;
    hctx.fillRect(x0, 0, w, 1);

    const sgrad = sctx.createLinearGradient(x0, 0, x0 + w, 0);
    sgrad.addColorStop(0, "rgba(10,15,25,0.35)");
    sgrad.addColorStop(0.1, "rgba(10,15,25,0)");
    sgrad.addColorStop(0.9, "rgba(10,15,25,0.10)");
    sgrad.addColorStop(1, "rgba(10,15,25,0.35)");
    sctx.fillStyle = sgrad;
    sctx.fillRect(x0, 0, w, 1);

    x0 += w;
  }

  return { mapUrl: map.toDataURL(), highlightUrl: hi.toDataURL(), shadowUrl: sh.toDataURL() };
}

export default function FlutedGlassOverlay({
  fluteWidth = 32,
  strength = 90,
  blur = 0.5,
  liquidity = 0.7,
  drip = 0.75,
  side,
  imageSrc = "/assets/gradien.png",
  className = "",
  imageRef,
}: FlutedGlassOverlayProps) {
  const [maps, setMaps] = useState<Maps>({ mapUrl: "", highlightUrl: "", shadowUrl: "" });
  const filterId = `fluted-strip-${side}`;

  useEffect(() => {
    setMaps(buildLiquidMaps(fluteWidth, liquidity, drip));
  }, [fluteWidth, liquidity, drip]);

  const pad = useMemo(() => strength / 2 + 4, [strength]);

  // Pulls the source image further toward the section's centre (away from the
  // strip's own edge) so the displacement map still has image to distort near
  // the seam, instead of running out and repeating the edge pixel.
  const xOffset = side === "left" ? -160 : 160;

  const imgWidth = STRIP_W + pad * 2 + Math.abs(xOffset) * 2;
  const imgHeight = STRIP_H + pad * 2;
  const imgX = -pad - Math.abs(xOffset) + xOffset;
  const imgY = -pad;

  const maskDir =
    side === "left"
      ? "linear-gradient(to right, black 50%, transparent 100%)"
      : "linear-gradient(to left, black 50%, transparent 100%)";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -top-[200px] -bottom-[200px] z-[1] hidden overflow-hidden xl:block ${className}`}
      style={{
        width: STRIP_W,
        [side]: `calc(50% - ${EDGE_OFFSET}px)`,
        maskImage: maskDir,
        WebkitMaskImage: maskDir,
      }}
    >
      <svg
        viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="100%"
            height="100%"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            {maps.mapUrl && (
              <feImage
                href={maps.mapUrl}
                x="0"
                y="0"
                width={STRIP_W}
                height={STRIP_H}
                preserveAspectRatio="none"
                result="map"
              />
            )}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={strength}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>

        <image
          ref={imageRef}
          href={imageSrc}
          x={imgX}
          y={imgY}
          width={imgWidth}
          height={imgHeight}
          preserveAspectRatio="xMidYMid slice"
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}
