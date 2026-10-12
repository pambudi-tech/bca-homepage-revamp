import 'server-only';
import { signatureCards } from '@/components/prioritas/signature-card-data';
import { getPrivilegePromos } from '@/lib/partner-privileges';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { DesignToken, TokenData, TokenSource } from './token-types';
import figmaColors from './figma-colors.json';
import { figmaTypography } from './figma-typography';
import { collectTokenUsages } from './token-usage';

// Read the owning styles at build time instead of maintaining a second palette.
// This page is prerendered for each locale; no browser access to source files.
function declarations(css: string): Record<string, string> {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return Object.fromEntries([...clean.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)]
    .map(match => [match[1], match[2].trim().replace(/\s+/g, ' ')]));
}

function pixels(value: string): number | undefined {
  const match = value.match(/^([\d.]+)(rem|px)$/);
  return match ? Number(match[1]) * (match[2] === 'rem' ? 16 : 1) : undefined;
}

export async function getDesignTokens(): Promise<TokenData> {
  const [projectCss, tailwindCss, desktopSource, usages] = await Promise.all([
    readFile(path.join(process.cwd(), 'src/app/globals.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'node_modules/tailwindcss/theme.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'src/lib/useIsDesktop.ts'), 'utf8'),
    collectTokenUsages(),
  ]);
  const themeBlocks = [...projectCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/@theme(?:\s+inline)?\s*\{([^}]+)\}/g)].map(match => match[1]).join('\n');
  const project = declarations(themeBlocks);
  const stock = declarations(tailwindCss);
  const values = { ...stock, ...project };
  function resolve(value: string, seen = new Set<string>()): string {
    return value.replace(/var\((--[\w-]+)\)/g, (original, name: string) => {
      if (!values[name] || seen.has(name)) return original;
      return resolve(values[name], new Set([...seen, name]));
    });
  }
  const token = (name: string, value: string, source: TokenSource, group: string, utility: string): DesignToken => ({
    name, value, resolved: resolve(value), source, group, utility, pixels: pixels(resolve(value)),
  });
  const byPrefix = (prefix: string, source: TokenSource, group: string, utilityPrefix: string) => Object.entries(source === 'project' ? project : stock)
    .filter(([name, value]) => value !== 'initial' && name.startsWith(prefix) && !name.slice(prefix.length).includes('--'))
    .map(([name, value]) => token(name, value, source, group, `${utilityPrefix}${name.slice(prefix.length)}`));

  const colors = Object.entries(project).filter(([name]) => name.startsWith('--color-')).map(([name, value]) => {
    const suffix = name.slice('--color-'.length);
    const ramp = suffix.match(/^(neutral|blue|cyan|green|yellow|red|pgold|pbrown|bermuda|brown|muddy|orange|purple|tosca|teal)-\d+$/)?.[1];
    const group = ramp ?? (suffix.startsWith('asset-') ? 'assets' : 'unclassified');
    if (value !== 'initial' && group === 'unclassified') throw new Error(`Unclassified color token: ${name}`);
    return token(name, value, 'project', group, `bg-${suffix}`);
  });
  // Root aliases live outside @theme, but still resolve to their actual fill.
  Object.assign(values, declarations(projectCss.match(/:root\s*\{([^}]+)\}/)?.[1] ?? ''));
  for (const color of colors) color.resolved = resolve(color.value);

  const referenceColors: DesignToken[] = [];
  function collectColors(node: unknown, name = '') {
    if (Array.isArray(node)) { node.forEach(item => collectColors(item)); return; }
    if (!node || typeof node !== 'object') return;
    const entry = node as Record<string, unknown>;
    if (entry.$type === 'color' && typeof entry.$value === 'string') {
      const implementation = project[`--color-${name}`];
      referenceColors.push({
        ...token(name, entry.$value, 'figma', name.split('-')[0], implementation ? `bg-${name}` : ''),
        implementationValue: implementation ? resolve(implementation) : undefined,
        implementationName: implementation ? `--color-${name}` : undefined,
        differences: implementation && resolve(implementation).toLowerCase() !== entry.$value.toLowerCase()
          ? [{ field: 'value', reference: entry.$value, current: resolve(implementation) }] : [],
        implementationStatus: !implementation ? 'missing' : resolve(implementation).toLowerCase() === entry.$value.toLowerCase() ? 'match' : 'different',
      });
      return;
    }
    for (const [key, value] of Object.entries(entry)) if (!key.startsWith('$')) collectColors(value, key);
  }
  collectColors(figmaColors);

  const typography = byPrefix('--text-', 'project', 'semantic', 'text-').filter(item => !item.name.startsWith('--text-shadow-')).map(item => ({ ...item,
    lineHeight: resolve(values[`${item.name}--line-height`] ?? 'normal'),
    tracking: resolve(values[`${item.name}--letter-spacing`] ?? 'inherit'),
    weight: resolve(values[`${item.name}--font-weight`] ?? 'inherit'),
    trim: item.name.startsWith('--text-label-'),
  }));
  const figmaColorNames = new Set(referenceColors.map(item => `--color-${item.name}`));
  const canonicalTypeNames = new Set(figmaTypography.map(item => `--${item.utility}`));
  function metrics(item: DesignToken) {
    const ratio = item.lineHeight?.match(/^calc\(([\d.]+)\s*\/\s*([\d.]+)\)$/);
    const leading = ratio ? Number(ratio[1]) / Number(ratio[2]) : Number(item.lineHeight);
    return { fontSize: `${item.pixels}px`, lineHeight: `${Number(((item.pixels ?? 0) * leading).toFixed(2))}px`, tracking: item.tracking ?? 'normal', weight: item.weight ?? '400', trim: String(!!item.trim) };
  }
  function compare(reference: DesignToken, implementation: DesignToken): NonNullable<DesignToken['differences']> {
    const expected = metrics(reference);
    const current = metrics(implementation);
    return (Object.keys(expected) as (keyof typeof expected)[]).flatMap(field => expected[field] === current[field] ? [] : [{ field, reference: expected[field], current: current[field] }]);
  }
  const mergedTypography: DesignToken[] = figmaTypography.map(reference => {
    const implementation = typography.find(item => item.name === `--${reference.utility}`);
    const differences = implementation ? compare(reference, implementation) : [];
    return { ...reference, implementationName: implementation?.name, differences,
      implementationStatus: !implementation ? 'missing' : differences.length ? 'different' : 'match' };
  });
  // Figma is supplemented, never used to prune existing project additions.
  const colorAdditions = colors.filter(item => item.value !== 'initial' && !figmaColorNames.has(item.name));
  const projectTypography: DesignToken[] = typography.filter(item => item.source === 'project' && !canonicalTypeNames.has(item.name))
    .map(item => {
      const aliasName = item.value.match(/^var\((--text-[\w-]+)\)$/)?.[1];
      const reference = figmaTypography.find(style => `--${style.utility}` === aliasName)
        ?? figmaTypography.find(style => compare(style, item).length === 0);
      const differences = reference ? compare(reference, item) : [];
      return { ...item, group: 'extensions', aliasOf: aliasName,
        comparisonName: reference?.name, differences,
        implementationStatus: reference ? differences.length ? 'different' as const : 'match' as const : undefined };
    });
  // Matching project names share the reference card. Keep their CSS aliases
  // available for search/copy while retaining distinct recipes as additions.
  for (const item of projectTypography.filter(item => item.implementationStatus === 'match')) {
    const reference = mergedTypography.find(style => style.name === item.comparisonName);
    if (reference) (reference.aliases ??= []).push(item.name);
  }
  const typeAdditions = projectTypography.filter(item => item.implementationStatus !== 'match');
  const spacingUnit = values['--spacing'];
  const spacing = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64].map(step => ({
    ...token(`spacing-${step}`, `calc(var(--spacing) * ${step})`, 'tailwind', 'spacing', `gap-${step}`), pixels: (pixels(spacingUnit) ?? 4) * step,
  }));
  const radius = [token('rounded-none', '0px', 'tailwind', 'radius', 'rounded-none'), ...byPrefix('--radius-', 'tailwind', 'radius', 'rounded-'), token('rounded-full', 'calc(infinity * 1px)', 'tailwind', 'radius', 'rounded-full')];
  const effects: DesignToken[] = [];
  for (const name of ['glass-panel-prioritas', 'glass-panel-solitaire']) {
    const recipe = projectCss.match(new RegExp(`\\.${name}\\s*\\{([^}]+)\\}`))?.[1];
    if (!recipe) throw new Error(`Missing glass recipe: ${name}`);
    const filter = recipe.match(/(?:^|\n)\s*backdrop-filter:\s*([^;]+);/)?.[1];
    const fill = recipe.match(/background-color:\s*([^;]+);/)?.[1];
    if (!filter || !fill) throw new Error(`Incomplete glass recipe: ${name}`);
    effects.push(token(`.${name}`, `background-color: ${fill}; backdrop-filter: ${filter};`, 'recipe', 'glass', name));
  }
  const breakpoints = byPrefix('--breakpoint-', 'tailwind', 'breakpoints', '').map(item => ({ ...item, utility: `${item.utility}:` }));
  const desktopMin = Number(desktopSource.match(/min-width:\s*(\d+)px/)?.[1]);
  const tabletMin = breakpoints.find(item => item.name === '--breakpoint-md')?.pixels;
  if (!desktopMin || !tabletMin) throw new Error('Missing layout boundaries');
  return {
    sections: { colors: [...referenceColors, ...colorAdditions].filter(item => item.group !== 'assets').map(item => ({ ...item, colorUsages: usages.colors[item.implementationName ?? item.name] ?? [] })), typography: [...mergedTypography, ...typeAdditions].map(item => ({ ...item, typographyUsages: usages.typography[item.implementationName ?? item.name] ?? [] })), spacing, radius, effects, breakpoints, motion: [...byPrefix('--ease-', 'project', 'motion', 'ease-'), ...byPrefix('--ease-', 'tailwind', 'motion', 'ease-')] },
    glassExample: { id: signatureCards[0].id, image: `/assets/prioritas/signature-privilege/${signatureCards[0].image}`, title: getPrivilegePromos('signature').find(promo => promo.id === signatureCards[0].id)!.title },
    spacingUnit, tabletMin, desktopMin,
  };
}
