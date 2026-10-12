/** Full-resolution web exports; retain pre-optimization sources outside public. */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inventory = JSON.parse(fs.readFileSync('src/components/asset-bank/asset-manifest.json', 'utf8'));
const assets = inventory
  .filter(asset => asset.format === 'WEBP');
const backupRoot = '.cache/asset-bank-originals';
const report = [];
const preview = input => sharp(input).toColourspace('srgb').flatten({ background: '#808080' })
  .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
  .greyscale().raw().toBuffer({ resolveWithObject: true });

// Mean local SSIM on 8px windows at a typical inspection size, plus full-size
// dimensions and exact alpha checks below. This measures visual similarity,
// not pixel equality; high-quality WebP is deliberately perceptual compression.
function similarity(a, b) {
  const { width, height } = a.info;
  let total = 0, windows = 0;
  for (let y = 0; y < height; y += 8) for (let x = 0; x < width; x += 8) {
    let n = 0, sa = 0, sb = 0, aa = 0, bb = 0, ab = 0;
    for (let yy = y; yy < Math.min(y + 8, height); yy++) for (let xx = x; xx < Math.min(x + 8, width); xx++) {
      const i = yy * width + xx, av = a.data[i], bv = b.data[i];
      n++; sa += av; sb += bv; aa += av * av; bb += bv * bv; ab += av * bv;
    }
    const ma = sa / n, mb = sb / n;
    total += ((2 * ma * mb + 6.5025) * (2 * (ab / n - ma * mb) + 58.5225))
      / ((ma * ma + mb * mb + 6.5025) * (aa / n - ma * ma + bb / n - mb * mb + 58.5225));
    windows++;
  }
  return total / windows;
}

for (const asset of assets) {
  const file = 'public' + asset.path;
  const backup = path.join(backupRoot, asset.path);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  const original = fs.readFileSync(backup);
  const metadata = await sharp(original).metadata();
  const reference = await preview(original);
  let selected = original, score = 1, quality = 'original';
  const lossless = await sharp(original).keepMetadata().webp({ lossless: true, effort: 6 }).toBuffer();
  if (lossless.length < selected.length) { selected = lossless; quality = 'lossless'; }
  // Do not spend quality to save a handful of bytes in already-small assets.
  if (selected.length > 80 * 1024) {
    for (const q of [92, 94, 96, 98]) {
      const candidate = await sharp(original).keepMetadata().webp({ quality: q, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer();
      const candidateScore = similarity(reference, await preview(candidate));
      if (candidateScore >= 0.985) {
        if (candidate.length < selected.length) { selected = candidate; score = candidateScore; quality = q; }
        break;
      }
    }
    if (selected.length > 1024 * 1024) {
      for (const q of [90, 88]) {
        const candidate = await sharp(original).keepMetadata().webp({ quality: q, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer();
        const candidateScore = similarity(reference, await preview(candidate));
        if (candidateScore >= 0.985 && candidate.length < selected.length) { selected = candidate; score = candidateScore; quality = q; }
        if (selected.length <= 1024 * 1024) break;
      }
    }
  }
  const resultMeta = await sharp(selected).metadata();
  if (resultMeta.width !== metadata.width || resultMeta.height !== metadata.height) throw Error(`Resolution changed: ${file}`);
  if (metadata.icc && !metadata.icc.equals(resultMeta.icc)) throw Error(`Profile changed: ${file}`);
  if (metadata.hasAlpha) {
    const originalAlpha = await sharp(original).extractChannel('alpha').raw().toBuffer();
    const resultAlpha = await sharp(selected).extractChannel('alpha').raw().toBuffer();
    if (!originalAlpha.equals(resultAlpha)) throw Error(`Transparency changed: ${file}`);
  }
  fs.writeFileSync(file, selected);
  report.push({ path: asset.path, before: original.length, after: selected.length, quality, ssim: score, width: metadata.width, height: metadata.height });
  console.log(`${asset.path}: ${original.length} → ${selected.length}, quality ${quality}, SSIM ${score.toFixed(4)}`);
}
// Figma SVG exports can hide large PNGs inside data URLs. Keep their vector
// geometry and embedded bitmap resolution; losslessly optimize PNG compression.
// Embedded PNG stays PNG for consistent SVG support across renderers.
for (const asset of inventory.filter(x => x.format === 'SVG' && x.bytes > 100000)) {
  const file = 'public' + asset.path, backup = path.join(backupRoot, asset.path);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  const original = fs.readFileSync(backup, 'utf8');
  let selected = original;
  for (const match of original.matchAll(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g)) {
    const bitmap = Buffer.from(match[1], 'base64');
    const optimized = await sharp(bitmap).png({ compressionLevel: 9, effort: 10, palette: false }).toBuffer();
    const decode = x => sharp(x).ensureAlpha().raw().toBuffer();
    const a = await decode(bitmap), b = await decode(optimized);
    if (!a.equals(b)) throw Error(`Embedded bitmap changed: ${file}`);
    const replacement = 'data:image/png;base64,' + optimized.toString('base64');
    if (replacement.length < match[0].length) selected = selected.replace(match[0], replacement);
  }
  if (selected !== original) {
    const render = x => sharp(Buffer.from(x)).ensureAlpha().raw().toBuffer();
    if (!(await render(original)).equals(await render(selected))) throw Error(`SVG rendering changed: ${file}`);
    fs.writeFileSync(file, selected);
    report.push({ path: asset.path, before: Buffer.byteLength(original), after: Buffer.byteLength(selected), quality: 'lossless embedded PNG', ssim: 1, width: asset.width, height: asset.height });
  }
}
const stats = { count: report.length, before: report.reduce((s, x) => s + x.before, 0), after: report.reduce((s, x) => s + x.after, 0), files: report };
fs.writeFileSync(path.join(backupRoot, 'optimization-report.json'), JSON.stringify(stats, null, 2) + '\n');
console.log(JSON.stringify({ count: stats.count, before: stats.before, after: stats.after, above1MiB: report.filter(x => x.after > 1024 * 1024).map(x => x.path) }));
