import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const isReleaseBuild = process.env.npm_lifecycle_event === 'build';
const target = path.join(projectRoot, isReleaseBuild ? 'sites-public-v24-web-release' : 'sites-public-v24-web-dev');
const source = path.join(projectRoot, 'public');
const web = JSON.parse(await fs.readFile(path.join(projectRoot, 'content/web-media-v24.json'), 'utf8'));
const portraits = JSON.parse(await fs.readFile(path.join(projectRoot, 'content/portrait-media-v24.json'), 'utf8'));
// Keep the previous generated tree recoverable, without publishing stale files.
try {
  await fs.access(target);
  const archive = path.join(projectRoot, '.media-stage-history');
  await fs.mkdir(archive, { recursive: true });
  await fs.rename(target, path.join(archive, `${path.basename(target)}-${Date.now()}`));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await fs.mkdir(target, { recursive: true });
async function copyPublic(directory, relative = '') {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const local = path.posix.join(relative, entry.name);
    if (!relative && (entry.name === 'media' || (isReleaseBuild && entry.name === 'preview'))) continue;
    if (entry.isDirectory()) await copyPublic(path.join(directory, entry.name), local);
    else {
      // Historical URLs resolve through route handlers to their small WebP.
      if (web.paths[`/${local}`] || portraits.paths[`/${local}`]) continue;
      await fs.mkdir(path.dirname(path.join(target, local)), { recursive: true });
      await fs.copyFile(path.join(directory, entry.name), path.join(target, local));
    }
  }
}
await copyPublic(source);
for (const url of web.retainedDisplayPaths) {
  const relative = url.replace(/^\/media\//, '');
  await fs.mkdir(path.dirname(path.join(target, 'media', relative)), { recursive: true });
  await fs.copyFile(path.join(projectRoot, 'sites-media-display-web', relative), path.join(target, 'media', relative));
}
await fs.cp(path.join(projectRoot, 'sites-media-web-v24'), path.join(target, 'media-web-v24'), { recursive: true });
console.log(`Prepared ${web.retainedDisplayPaths.length} canonical media files and ${portraits.records.length} web portraits; originals are preserved in source.`);
