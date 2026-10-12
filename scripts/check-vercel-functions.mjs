import { build } from '@vercel/next';
import { mkdir, writeFile } from 'node:fs/promises';

const limit = 12;
// Reuse Vercel's deployment settings when available, but never rebuild or install
// inside this check. The production Next output must already exist.
const settings = JSON.parse(process.env.NEXT_ADAPTER_VERCEL_CONFIG || '{}');
const result = await build({
  files: {},
  entrypoint: 'package.json',
  workPath: process.cwd(),
  config: { ...settings, installCommand: '', buildCommand: 'true' },
  meta: { skipDownload: true },
});

if (!result.output) {
  throw new Error('Expected standard Next output. Run npm run build to use the verified bundling path.');
}

// A single bundled function can be exposed under many HTML/RSC route aliases.
// Count the actual Lambda objects, not route names or Next's “ƒ” markers.
const functions = new Map();
for (const [route, output] of Object.entries(result.output)) {
  if (output.type !== 'Lambda') continue;
  const routes = functions.get(output) ?? [];
  routes.push(route);
  functions.set(output, routes);
}
const report = {
  count: functions.size,
  limit,
  groups: [...functions].map(([output, routes]) => ({ runtime: output.runtime, routes })),
};
await mkdir('.next', { recursive: true });
await writeFile('.next/vercel-functions-report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`Vercel function budget: ${report.count}/${limit}`);
if (report.count > limit) {
  console.error('Vercel Hobby function limit exceeded. Consolidate SSR routes or prerender public pages.');
  for (const group of report.groups) console.error(`- ${group.routes.join(', ')}`);
  process.exitCode = 1;
}
