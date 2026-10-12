import type { DesignToken } from './token-types';

// Sizes/leading are transcribed from the owner's Figma screenshots (2026-10-11).
// Display was extended/renamed by the owner: 2XL 36/40, 3XL 40/48, 4XL 48/56.
// Display/Heading/Eyebrow weights were confirmed in chat. Tracking follows
// the project reference, approved alongside the alias alignment in chat.
const styles: DesignToken[] = [];
function add(group: string, sizeName: string, size: number, leading: number, weightName?: string, weight?: number) {
  styles.push({
    name: [group, weightName, sizeName].filter(Boolean).join('/'),
    value: `${size}/${leading}`,
    resolved: `${size}/${leading}`,
    source: 'figma', group: group.toLowerCase(), utility: '', pixels: size,
    lineHeight: `calc(${leading} / ${size})`,
    weight: weight?.toString(), trim: group === 'Label',
  });
}

for (const [name, size, leading] of [
  ['4XL', 48, 56], ['3XL', 40, 48], ['2XL', 36, 40], ['XL', 32, 40], ['L', 28, 32], ['M', 24, 32], ['S', 20, 28],
] as const) add('Display', name, size, leading);
for (const [name, size] of [['L', 16], ['M', 14], ['S', 12]] as const) add('Eyebrow', name, size, size);
for (const [name, size, leading] of [
  ['XL', 32, 40], ['L', 28, 32], ['M', 24, 32], ['S', 20, 28], ['XS', 18, 24],
] as const) add('Heading', name, size, leading);
for (const group of ['Body', 'Label']) {
  for (const [weightName, weight] of [['Bold', 700], ['Semibold', 600], ['Regular', 400]] as const) {
    for (const [name, size, bodyLeading] of [['XL', 18, 26], ['L', 16, 24], ['M', 14, 20], ['S', 12, 18]] as const) {
      // Preserve the visible 12/14 in Label/Semibold/S, rather than silently
      // correcting it to 12/12. Vertical trim is independent of line-height.
      const leading = group === 'Body' ? bodyLeading : weightName === 'Semibold' && name === 'S' ? 14 : size;
      add(group, name, size, leading, weightName, weight);
    }
    if (group === 'Body' && weightName === 'Regular') add(group, 'Article', 16, 28, weightName, weight);
  }
}

export const figmaTypography = styles;

for (const style of styles) {
  if (style.name === 'Display/2XL') style.source = 'project';
  if (style.group === 'display' || style.group === 'eyebrow') style.weight = '600';
  if (style.group === 'heading') style.weight = '700';
  const parts = style.name.toLowerCase().split('/');
  const suffix = style.group === 'body' || style.group === 'label'
    ? `${parts[0]}-${parts[2]}-${parts[1]}` : parts.join('-');
  style.utility = `text-${suffix}`;
  style.tracking = style.group === 'eyebrow' ? '0.15em' : style.group === 'heading' || style.group === 'display' ? '-0.02em' : 'normal';
}
