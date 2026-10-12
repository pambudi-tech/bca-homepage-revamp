"use client";

export type BlueprintMode = "size" | "padding" | "margin" | "gap";
export type SpacingRegion = { left: number; top: number; width: number; height: number; value: number; axis: "horizontal" | "vertical" };
export type BlueprintBox = {
  left: number; top: number; width: number; height: number;
  nativeWidth: number; nativeHeight: number;
  label: string;
  composition?: string;
  aspectRatio?: string;
  kind: "component" | "image" | "panel" | "text" | "control";
  padding: { top: number; right: number; bottom: number; left: number };
  parent: { left: number; top: number; width: number; height: number };
  sizing: { width: "fixed" | "dynamic" | "content"; height: "fixed" | "dynamic" | "content" };
  scale: number;
  spacing: { padding: SpacingRegion[]; margin: SpacingRegion[]; gap: SpacingRegion[] };
};
const number = (value: number) => String(Math.round(value));

export default function CatalogBlueprint({ box, mode, outlineOnly = false }: { box: BlueprintBox; mode: BlueprintMode; outlineOnly?: boolean }) {
  const { left: x, top: y, width: w, height: h } = box;
  const badge = (cx: number, cy: number, value: number, key: string) => {
    const label = number(value);
    const width = label.length * 7 + 14;
    return <g key={key}><rect x={cx - width / 2} y={cy - 10} width={width} height={20} rx={4} className="fill-red-500" /><text x={cx} y={cy} dominantBaseline="central" textAnchor="middle" className="fill-neutral-100 text-size-body-m font-semibold">{label}</text></g>;
  };
  const horizontal = (x1: number, x2: number, cy: number, value: number, key: string) => <g key={key}><path d={`M ${x1} ${cy - 4} v 8 M ${x1} ${cy} H ${x2} M ${x2} ${cy - 4} v 8`} fill="none" stroke="currentColor" />{badge((x1 + x2) / 2, cy - 16, value, `${key}-label`)}</g>;
  const vertical = (y1: number, y2: number, cx: number, value: number, key: string) => <g key={key}><path d={`M ${cx - 4} ${y1} h 8 M ${cx} ${y1} V ${y2} M ${cx - 4} ${y2} h 8`} fill="none" stroke="currentColor" />{badge(cx - 20, (y1 + y2) / 2, value, `${key}-label`)}</g>;
  return <svg aria-hidden className="pointer-events-none absolute inset-0 z-50 h-full w-full overflow-visible font-sans text-red-500">
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="currentColor" strokeDasharray="2 2" />
    {!outlineOnly && mode === "size" ? <>{horizontal(x, x + w, y - 10, box.nativeWidth, "width")}{vertical(y, y + h, x - 10, box.nativeHeight, "height")}</> : null}
    {mode !== "size" ? box.spacing[mode].map((region, index) => <g key={index}>
      <rect x={region.left} y={region.top} width={region.width} height={region.height} className="fill-red-500/15" />
      {region.axis === "horizontal" ? horizontal(region.left, region.left + region.width, region.top + region.height / 2, region.value, `spacing-${index}`) : vertical(region.top, region.top + region.height, region.left + region.width / 2, region.value, `spacing-${index}`)}
    </g>) : null}
  </svg>;
}
