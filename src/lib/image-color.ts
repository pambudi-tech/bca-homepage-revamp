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
