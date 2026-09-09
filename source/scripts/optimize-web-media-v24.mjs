import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

// Deterministic, local-only optimisation. Keep every source file unchanged.
// Usage: node scripts/optimize-web-media-v24.mjs [sourceSite] [outputSite]
const source = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, '..'));
const output = path.resolve(process.argv[3] ?? source);
const require = createRequire(path.join(source, 'package.json'));
const sharp = require('sharp');
const reportDir = path.resolve(output, '..');
const manifest = JSON.parse(await fs.readFile(path.join(source, 'sites-media-display-manifest.json'), 'utf8'));
const paths = {};
const assets = [];
const originals = [];
const canonical = new Map();
const retainedDisplayPaths = [];
const readable = value => { try { return decodeURI(value); } catch { return value; } };
let displayBeforeBytes = 0;
let displayAfterBytes = 0;
let rasterCount = 0;
let duplicateCount = 0;
let animatedFiles = 0;
await fs.mkdir(path.join(output, 'content'), { recursive: true });
await fs.mkdir(path.join(output, 'sites-media-web-v24'), { recursive: true });

for (const item of manifest.assets) {
  const sourceFile = path.join(source, 'sites-media-display-web', item.path.replace('/media/', ''));
  const bytes = await fs.readFile(sourceFile);
  if (bytes.length !== item.bytes) throw new Error(`Manifest mismatch: ${item.path}`);
  displayBeforeBytes += bytes.length;
  if (item.originalBytes) originals.push({ path: item.originalPath, label: readable(item.original), bytes: item.originalBytes, displayedPath: item.path, displayedBytes: item.bytes });
  const raster = /\.(webp|png|jpe?g|gif|avif)$/i.test(item.path);
  let replacement;
  if (raster) {
    rasterCount++;
    const dimensions = await sharp(bytes, { animated: true }).metadata();
    if (item.width && dimensions.width !== item.width) throw new Error(`Width mismatch: ${item.path}`);
    if ((dimensions.pages ?? 1) > 1) animatedFiles++;
    const digest = createHash('sha256').update(bytes).digest('hex');
    replacement = canonical.get(digest);
    if (!replacement) canonical.set(digest, item.path);
  }
  if (replacement) {
    paths[item.path] = replacement;
    duplicateCount++;
    assets.push({ originalPath: item.path, path: replacement, beforeBytes: bytes.length, afterBytes: 0, width: item.width, height: item.height, action: 'byte-identical-deduplication' });
  } else {
    retainedDisplayPaths.push(item.path);
    displayAfterBytes += bytes.length;
  }
}

// These logos and the QR carry fine lines and text: lossless encoding after
// conservative web dimensions, at least 2x their rendered size.
// Portrait derivatives are handled by the dedicated portrait workflow.
for (const name of ['brand/heoa-logo.png', 'brand/healthy-cities-logo.png', 'brand/bstvc-official.png', 'brand/heoa-wechat.png', 'assets/heoa-logo-source.png', 'assets/heoa-hero-source.png']) {
  const sourceFile = path.join(source, 'public', name);
  const input = await fs.readFile(sourceFile);
  const metadata = await sharp(input).metadata();
  const lossless = !name.includes('hero-source');
  // The full-size HEOA mark actually compresses smaller than a resample.
  const maxWidth = ({ 'brand/heoa-logo.png': 2888, 'brand/healthy-cities-logo.png': 768, 'brand/bstvc-official.png': 320, 'brand/heoa-wechat.png': 1600, 'assets/heoa-logo-source.png': 1429 })[name] ?? 1920;
  const pipeline = sharp(input).rotate();
  pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  const result = await pipeline.webp(lossless ? { lossless: true, effort: 6 } : { quality: 84, effort: 6 }).toBuffer({ resolveWithObject: true });
  const nextName = name.replace(/\.[^.]+$/, '-web-v24.webp');
  const targetPath = `/media-web-v24/${nextName}`;
  const changed = result.data.length < input.length;
  if (changed) {
    const targetFile = path.join(output, 'sites-media-web-v24', nextName);
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, result.data);
    paths[`/${name}`] = targetPath;
    if (lossless) {
      // WebP may normalise invisible RGB below fully transparent pixels.
      // Compare rendered pixels against both black and white backgrounds.
      for (const background of ['#ffffff', '#000000']) {
        const [rawBefore, rawAfter] = await Promise.all([
          sharp(input).rotate().resize({ width: maxWidth, withoutEnlargement: true }).flatten({ background }).raw().toBuffer(),
          sharp(result.data).flatten({ background }).raw().toBuffer(),
        ]);
        if (!rawBefore.equals(rawAfter)) throw new Error(`Lossless visible pixel equality failed: ${name}`);
      }
    }
  }
  assets.push({ originalPath: `/${name}`, path: changed ? targetPath : `/${name}`, beforeBytes: input.length, afterBytes: changed ? result.data.length : input.length, beforeWidth: metadata.width, beforeHeight: metadata.height, width: result.info.width, height: result.info.height, action: changed ? (lossless ? 'lossless-webp-after-web-size-resample' : 'photo-webp-quality-84-max1920') : 'retained-smaller-original', currentPageReferenced: !name.startsWith('assets/') });
}

const brandAssets = assets.filter(a => a.action !== 'byte-identical-deduplication');
const currentBrands = brandAssets.filter(a => a.currentPageReferenced);
const sum = (items, key) => items.reduce((n, a) => n + a[key], 0);
const data = {
  version: 24,
  policy: 'Existing article WebP pixels untouched; byte-identical image duplicates share one canonical URL. Brand/QR lossless WebP. Unused hero has a standalone WebP derivative. Portraits handled separately.',
  paths,
  retainedDisplayPaths,
  assets,
  stats: {
    displayFiles: manifest.assets.length,
    rasterCount,
    duplicateCount,
    animatedFiles,
    retainedDisplayFiles: retainedDisplayPaths.length,
    displayBeforeBytes,
    displayAfterBytes,
    displaySavedBytes: displayBeforeBytes - displayAfterBytes,
    referencedBrandBeforeBytes: sum(currentBrands, 'beforeBytes'),
    referencedBrandAfterBytes: sum(currentBrands, 'afterBytes'),
    referencedBrandSavedBytes: sum(currentBrands, 'beforeBytes') - sum(currentBrands, 'afterBytes'),
  },
};
await fs.writeFile(path.join(output, 'content', 'web-media-v24.json'), JSON.stringify(data, null, 2) + '\n');
const largestOriginals = originals.filter(a => /\.(png|jpe?g|gif|webp|avif)$/i.test(a.path)).sort((a, b) => b.bytes - a.bytes).slice(0, 30);
for (const item of largestOriginals) {
  const file = path.join(source, 'sites-media-hq', item.path.replace('/media/', ''));
  try { const m = await sharp(file).metadata(); Object.assign(item, { width: m.width, height: m.height }); } catch { /* Original archive may be outside a deployment checkout. */ }
}
await fs.writeFile(path.join(reportDir, 'largest-images.json'), JSON.stringify({ largestOriginals, largestCurrentDisplay: manifest.assets.filter(a => a.width).sort((a, b) => b.bytes - a.bytes).slice(0, 30), brandAssets }, null, 2));
console.log(JSON.stringify(data.stats, null, 2));
console.log(JSON.stringify(brandAssets, null, 2));
