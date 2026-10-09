"use client";

export type BlueprintMode = "size" | "padding" | "inset";
export type BlueprintBox = {
  left: number; top: number; width: number; height: number;
  nativeWidth: number; nativeHeight: number;
  kind: "component" | "image" | "panel" | "text" | "control";
  padding: { top: number; right: number; bottom: number; left: number };
  parent: { left: number; top: number; width: number; height: number };
  scale: number;
};
const number = (value: number) => String(Math.round(value * 10) / 10);

export default function CatalogBlueprint({ box, mode }: { box: BlueprintBox; mode: BlueprintMode }) {
  const { left: x, top: y, width: w, height: h } = box;
  const badge = (cx: number, cy: number, value: number, key: string) => {
    const label = number(value);
    const width = label.length * 7 + 14;
    return <g key={key}><rect x={cx - width / 2} y={cy - 10} width={width} height={20} rx={4} className="fill-red-500" /><text x={cx} y={cy} dominantBaseline="central" textAnchor="middle" className="fill-neutral-100 text-xs font-semibold">{label}</text></g>;
  };
  const horizontal = (x1: number, x2: number, cy: number, value: number, key: string) => <g key={key}><path d={`M ${x1} ${cy - 4} v 8 M ${x1} ${cy} H ${x2} M ${x2} ${cy - 4} v 8`} fill="none" stroke="currentColor" />{badge((x1 + x2) / 2, cy - 16, value, `${key}-label`)}</g>;
  const vertical = (y1: number, y2: number, cx: number, value: number, key: string) => <g key={key}><path d={`M ${cx - 4} ${y1} h 8 M ${cx} ${y1} V ${y2} M ${cx - 4} ${y2} h 8`} fill="none" stroke="currentColor" />{badge(cx - 20, (y1 + y2) / 2, value, `${key}-label`)}</g>;
  const padding = box.padding;
  const parent = box.parent;
  const paddingTop = Math.min(h, padding.top * box.scale);
  const paddingBottom = Math.min(h, padding.bottom * box.scale);
  const paddingLeft = Math.min(w, padding.left * box.scale);
  const paddingRight = Math.min(w, padding.right * box.scale);
  return <svg aria-hidden className="pointer-events-none absolute inset-0 z-50 h-full w-full overflow-visible font-sans text-red-500">
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="currentColor" strokeDasharray="2 2" />
    {mode === "size" ? <>{horizontal(x, x + w, y - 10, box.nativeWidth, "width")}{vertical(y, y + h, x - 10, box.nativeHeight, "height")}</> : null}
    {mode === "padding" ? <>
      <g className="fill-red-500/15"><rect x={x} y={y} width={w} height={paddingTop} /><rect x={x} y={y + h - paddingBottom} width={w} height={paddingBottom} /><rect x={x} y={y + paddingTop} width={paddingLeft} height={Math.max(0, h - paddingTop - paddingBottom)} /><rect x={x + w - paddingRight} y={y + paddingTop} width={paddingRight} height={Math.max(0, h - paddingTop - paddingBottom)} /></g>
      <rect x={x + paddingLeft} y={y + paddingTop} width={Math.max(0, w - paddingLeft - paddingRight)} height={Math.max(0, h - paddingTop - paddingBottom)} fill="none" stroke="currentColor" strokeDasharray="4 4" />
      {badge(x + w / 2, y - 16, padding.top, "top")}{badge(x + w / 2, y + h + 16, padding.bottom, "bottom")}{badge(x - 22, y + h / 2, padding.left, "left")}{badge(x + w + 22, y + h / 2, padding.right, "right")}
    </> : null}
    {mode === "inset" ? <>
      <rect x={parent.left} y={parent.top} width={parent.width} height={parent.height} fill="none" stroke="currentColor" strokeOpacity={0.4} strokeDasharray="4 4" />
      {horizontal(parent.left, x, y + h / 2, (x - parent.left) / box.scale, "left-inset")}
      {horizontal(x + w, parent.left + parent.width, y + h / 2, (parent.left + parent.width - x - w) / box.scale, "right-inset")}
      {vertical(parent.top, y, x + w / 2, (y - parent.top) / box.scale, "top-inset")}
      {vertical(y + h, parent.top + parent.height, x + w / 2, (parent.top + parent.height - y - h) / box.scale, "bottom-inset")}
    </> : null}
  </svg>;
}
