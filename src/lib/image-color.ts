import { cache } from "react";
import path from "node:path";
import sharp from "sharp";

type RGB = [number, number, number];

/** Average RGB of a /public asset, sampled by shrinking it to 1x1. */
export const getAverageColor = cache(async (publicPath: string): Promise<RGB> => {
  const absolute = path.join(process.cwd(), "public", publicPath);
  const { data } = await sharp(absolute)
    .resize(1, 1, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return [data[0], data[1], data[2]];
});

export function rgbToCss([r, g, b]: RGB, alpha = 1): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Hue in degrees, plus the saturation and lightness that produced it. */
function rgbToHsl(r: number, g: number, b: number) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s, l };
}

/** Ignore near-grey and near-black/white pixels — they carry no usable hue. */
const MIN_SATURATION = 0.18;
const MIN_LIGHTNESS = 0.1;
const MAX_LIGHTNESS = 0.92;
/** Hue histogram resolution, in degrees. */
const HUE_BUCKET = 15;

/**
 * The hue that dominates an asset's *colourful* pixels, or null if it has
 * none. Deliberately not `getAverageColor`: averaging a card that is mostly
 * dark with a few saturated accents collapses to a muddy grey (both Soliprio
 * cards average out under 15% saturation), which is useless as a light
 * source. Bucketing hues and weighting each pixel by how vivid it is recovers
 * what the eye actually reads as the card's colour.
 */
export const getDominantHue = cache(
  async (publicPath: string): Promise<number | null> => {
    const absolute = path.join(process.cwd(), "public", publicPath);
    const { data, info } = await sharp(absolute)
      .resize(64, 64, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const weights = new Map<number, number>();
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i + 3] < 200) continue;
      const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
      if (s < MIN_SATURATION || l < MIN_LIGHTNESS || l > MAX_LIGHTNESS) continue;
      const bucket = (Math.round(h / HUE_BUCKET) * HUE_BUCKET) % 360;
      // Mid-lightness pixels describe the hue best; the weight fades toward
      // both ends so a blown-out highlight can't outvote the body colour.
      weights.set(bucket, (weights.get(bucket) ?? 0) + s * (1 - Math.abs(l - 0.5)));
    }

    let best: number | null = null;
    let bestWeight = 0;
    for (const [hue, weight] of weights) {
      if (weight > bestWeight) {
        bestWeight = weight;
        best = hue;
      }
    }
    return best;
  }
);

/**
 * A card's dominant hue, pushed to the brightness a light source needs. The
 * saturation and lightness are fixed rather than sampled: the beam has to read
 * as emitted light, so only the hue should carry over from the artwork.
 */
export async function getBeamColor(publicPath: string): Promise<string> {
  const hue = await getDominantHue(publicPath);
  return hue === null ? "hsl(0 0% 88%)" : `hsl(${hue} 85% 68%)`;
}
