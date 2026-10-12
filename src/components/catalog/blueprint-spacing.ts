import type { BlueprintBox, SpacingRegion } from "./CatalogBlueprint";

/** Measure owned spacing in native CSS pixels, then project it onto the preview. */
export function measureSpacing(node: HTMLElement, bounds: DOMRect, scaleX: number, scaleY: number, scale: number): BlueprintBox["spacing"] {
  const spacing: BlueprintBox["spacing"] = { padding: [], margin: [], gap: [] };
  const descendants = [node, ...node.querySelectorAll<HTMLElement>("*")];
  const padded: HTMLElement[] = [];
  const gapOwners: HTMLElement[] = [];
  const project = (rect: { left: number; top: number; width: number; height: number }, value: number, axis: SpacingRegion["axis"]): SpacingRegion => ({
    left: (rect.left - bounds.left) / scaleX, top: (rect.top - bounds.top) / scaleY,
    width: rect.width / scaleX, height: rect.height / scaleY, value, axis,
  });
  for (const element of descendants) {
    const rect = element.getBoundingClientRect();
    const css = getComputedStyle(element);
    if (!rect.width || !rect.height || css.visibility === "hidden" || css.opacity === "0" || rect.bottom <= bounds.top || rect.top >= bounds.bottom) continue;
    const [pt, pr, pb, pl] = [css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft].map(value => parseFloat(value) || 0);
    // When a wrapper owns no padding, expose the first padded surfaces inside it.
    if ((pt || pr || pb || pl) && !padded.some(parent => parent.contains(element))) {
      padded.push(element);
      if (pt) spacing.padding.push(project({ left: rect.left, top: rect.top, width: rect.width, height: pt * scale }, pt, "vertical"));
      if (pb) spacing.padding.push(project({ left: rect.left, top: rect.bottom - pb * scale, width: rect.width, height: pb * scale }, pb, "vertical"));
      if (pl) spacing.padding.push(project({ left: rect.left, top: rect.top, width: pl * scale, height: rect.height }, pl, "horizontal"));
      if (pr) spacing.padding.push(project({ left: rect.right - pr * scale, top: rect.top, width: pr * scale, height: rect.height }, pr, "horizontal"));
    }
    // Margin is the selected element's CSS margin, never its distance to the preview frame.
    if (element === node) {
      const [mt, mr, mb, ml] = [css.marginTop, css.marginRight, css.marginBottom, css.marginLeft].map(value => parseFloat(value) || 0);
      if (mt > 0) spacing.margin.push(project({ left: rect.left, top: rect.top - mt * scale, width: rect.width, height: mt * scale }, mt, "vertical"));
      if (mb > 0) spacing.margin.push(project({ left: rect.left, top: rect.bottom, width: rect.width, height: mb * scale }, mb, "vertical"));
      if (ml > 0) spacing.margin.push(project({ left: rect.left - ml * scale, top: rect.top, width: ml * scale, height: rect.height }, ml, "horizontal"));
      if (mr > 0) spacing.margin.push(project({ left: rect.right, top: rect.top, width: mr * scale, height: rect.height }, mr, "horizontal"));
    }
    if (!/flex|grid/.test(css.display) || gapOwners.some(parent => parent.contains(element))) continue;
    const children = Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement && !["absolute", "fixed"].includes(getComputedStyle(child).position)).map(child => child.getBoundingClientRect()).filter(child => child.width && child.height).sort((a, b) => Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) ? a.left - b.left : a.top - b.top);
    const columnGap = parseFloat(css.columnGap) || 0;
    const rowGap = parseFloat(css.rowGap) || 0;
    const start = spacing.gap.length;
    for (let index = 1; index < children.length; index++) {
      const previous = children[index - 1], current = children[index];
      if (columnGap && current.left >= previous.right && Math.min(previous.bottom, current.bottom) > Math.max(previous.top, current.top)) {
        const width = Math.min(current.left - previous.right, columnGap * scale);
        spacing.gap.push(project({ left: (previous.right + current.left - width) / 2, top: Math.max(previous.top, current.top), width, height: Math.min(previous.bottom, current.bottom) - Math.max(previous.top, current.top) }, columnGap, "horizontal"));
      } else if (rowGap && current.top >= previous.bottom) {
        const height = Math.min(current.top - previous.bottom, rowGap * scale);
        spacing.gap.push(project({ left: current.left, top: (previous.bottom + current.top - height) / 2, width: current.width, height }, rowGap, "vertical"));
      }
    }
    if (spacing.gap.length > start) gapOwners.push(element);
  }
  return spacing;
}
