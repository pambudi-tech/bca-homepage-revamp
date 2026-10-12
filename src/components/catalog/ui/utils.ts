import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom text names must be classified as font sizes, otherwise tailwind-merge
// treats them as colors and drops them when a text color is also supplied.
const typographyNames = [
  ...["4xl", "3xl", "2xl", "xl", "l", "m", "s", "compact", "intermediate", "3xl-tight"].map(size => `display-${size}`),
  ...["xl", "l", "m", "s", "xs"].map(size => `heading-${size}`),
  ...["l", "m", "s"].map(size => `eyebrow-${size}`),
  ...["body", "label"].flatMap(role => ["xl", "l", "m", "s"].flatMap(size => ["bold", "semibold", "regular"].map(weight => `${role}-${size}-${weight}`))),
  "body-article-regular", "body-s-compact", "body-xl-relaxed",
  "size-body-s", "size-body-m", "size-body-l", "size-body-xl",
  "size-display-s", "size-display-m", "size-display-4xl",
  "eyebrow", "eyebrow-lg", "eyebrow-xl", "subtitle", "title", "heading", "hero-title-mobile", "display",
];
const merge = extendTailwindMerge({ extend: { classGroups: { "font-size": [{ text: typographyNames }] } } });
export function cn(...inputs: ClassValue[]) { return merge(clsx(inputs)); }
