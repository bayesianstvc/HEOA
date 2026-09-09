import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'sites-media-display-manifest.json'), 'utf8'));
const map = JSON.parse(await fs.readFile(path.join(root, 'sites-media-display-map.json'), 'utf8'));
const catalog = JSON.parse(await fs.readFile(path.join(root, 'content/site-content.json'), 'utf8'));
const web = JSON.parse(await fs.readFile(path.join(root, 'content/web-media-v24.json'), 'utf8'));
const portraits = JSON.parse(await fs.readFile(path.join(root, 'content/portrait-media-v24.json'), 'utf8'));
const build = process.argv[2] && path.resolve(process.argv[2]);
let images = 0;
for (const item of manifest.assets) {
  assert.equal(map[item.original], item.path);
  assert.equal(map[item.previousPath], item.path);
  assert.ok(item.path.includes('-v22-display.'), `Unversioned media: ${item.path}`);
  const source = await fs.readFile(path.join(root, 'sites-media-display-web', item.path.replace('/media/', '')));
  assert.equal(source.length, item.bytes, `Source size changed: ${item.path}`);
  if (item.width) images++;
  if (build) {
    const published = await fs.readFile(path.join(build, web.paths[item.path] ?? item.path));
    assert.ok(published.equals(source), `Build altered original bytes: ${item.path}`);
  }
}
for (const asset of Object.values(catalog.assets)) {
  assert.ok(map[asset.path], `Missing assetId resolution: ${asset.assetId}`);
}
// Representative small and large originals guard against a future 320px cap.
for (const [suffix, minimum] of [['asset-02406-v22-display.webp', 1100], ['asset-02425-v22-display.webp', 1200], ['asset-03588-v22-display.webp', 1000]]) {
  const item = manifest.assets.find(a => a.path.endsWith(suffix));
  assert.ok(item && item.width >= minimum, `Resolution regression: ${suffix}`);
}
if (build) {
  for (const item of portraits.records) {
    const published = await fs.readFile(path.join(build, item.path));
    assert.equal(published.length, item.bytes, `Portrait size changed: ${item.name}`);
    assert.ok(published.equals(await fs.readFile(path.join(root, 'public', item.path))), `Portrait bytes changed: ${item.name}`);
    assert.ok(item.width <= 640 && item.height <= 640, `Oversized portrait: ${item.name}`);
  }
  for (const output of Object.values(web.paths).filter(p => p.startsWith('/media-web-v24/'))) {
    const published = await fs.readFile(path.join(build, output));
    const original = await fs.readFile(path.join(root, 'sites-media-web-v24', output.replace('/media-web-v24/', '')));
    assert.ok(published.equals(original), `Optimized brand bytes changed: ${output}`);
  }
}
console.log(JSON.stringify({ qualityGate: 'passed', assets: manifest.assets.length, rasterImages: images, buildBytesUnchanged: Boolean(build), logicalAssetIds: Object.keys(catalog.assets).length, portraits: portraits.records.length, deduplicatedFiles: manifest.assets.length - web.retainedDisplayPaths.length }));
