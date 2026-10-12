/** Migrate only the curated inventory, retaining old URLs and detail hashes. */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inventoryPath = 'src/components/asset-bank/asset-manifest.json';
const redirectsPath = 'src/components/asset-bank/asset-redirects.json';
const assets = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
  .filter(asset => /^(PNG|JPE?G)$/.test(asset.format));
const migration = Object.fromEntries(assets.map(asset => [asset.path, asset.path.replace(/\.(png|jpe?g)$/i, '.webp')]));
const report = [];
for (const asset of assets) {
  const from = 'public' + asset.path;
  const to = 'public' + migration[asset.path];
  if (fs.existsSync(to)) throw new Error(`Refusing to overwrite existing artwork: ${to}`);
  await sharp(from).keepMetadata().webp({ lossless: true, effort: 6 }).toFile(to);
  // Verify decoded colour and alpha, rather than trusting the encoder option.
  const decode = file => sharp(file).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const original = await decode(from);
  const converted = await decode(to);
  if (original.info.width !== converted.info.width || original.info.height !== converted.info.height || original.data.length !== converted.data.length) {
    throw new Error(`Dimensions changed: ${from}`);
  }
  for (let pixel = 0; pixel < original.data.length; pixel += 4) {
    if (original.data[pixel + 3] !== converted.data[pixel + 3]) throw new Error(`Alpha changed: ${from}`);
    // WebP may discard RGB underneath fully transparent pixels; it is invisible.
    if (original.data[pixel + 3] > 0) {
      for (let channel = 0; channel < 3; channel++) {
        if (original.data[pixel + channel] !== converted.data[pixel + channel]) throw new Error(`Visible pixels changed: ${from}`);
      }
    }
  }
  const beforeMetadata = await sharp(from).metadata();
  const afterMetadata = await sharp(to).metadata();
  if (beforeMetadata.icc && !beforeMetadata.icc.equals(afterMetadata.icc)) throw new Error(`Colour profile changed: ${from}`);
  report.push({ from: asset.path, to: migration[asset.path], before: fs.statSync(from).size, after: fs.statSync(to).size, width: original.info.width, height: original.info.height });
  console.log(`Verified lossless: ${asset.path}`);
}

const walk = directory => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const generated = new Set([inventoryPath, redirectsPath, 'src/components/asset-bank/asset-aliases.json']);
const files = [...walk('src'), 'scripts/build-asset-bank.mjs']
  .filter(file => /\.(tsx?|css|json|mjs)$/.test(file) && !generated.has(file));
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of Object.entries(migration)) after = after.replaceAll(from, to);
  // Resolve constant roots used by Banking Privilege's template paths.
  for (const [, variable, root] of before.matchAll(/const\s+(\w+)\s*=\s*["'](\/assets\/[^"']+)["']/g)) {
    for (const [from, to] of Object.entries(migration)) {
      if (from.startsWith(root + '/')) {
        after = after.replaceAll('${' + variable + '}' + from.slice(root.length), '${' + variable + '}' + to.slice(root.length));
      }
    }
  }
  if (after !== before) fs.writeFileSync(file, after);
}
const redirects = { ...JSON.parse(fs.readFileSync(redirectsPath, 'utf8')), ...migration };
// Flatten existing duplicate routes to the new files, avoiding redirect chains.
for (const from of Object.keys(redirects)) {
  const visited = new Set([from]);
  let target = redirects[from];
  while (redirects[target]) {
    if (visited.has(target)) throw new Error(`Redirect cycle: ${from}`);
    visited.add(target);
    target = redirects[target];
  }
  redirects[from] = target;
}
fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2) + '\n');
const stats = { count: report.length, before: report.reduce((sum, item) => sum + item.before, 0), after: report.reduce((sum, item) => sum + item.after, 0), files: report };
fs.writeFileSync('/tmp/asset-bank-webp-report.json', JSON.stringify(stats, null, 2) + '\n');
console.log(`Converted ${stats.count} assets: ${stats.before} → ${stats.after} bytes. Originals retained; run npm run assets:refresh next.`);
