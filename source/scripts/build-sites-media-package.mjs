import fs from "node:fs/promises";
import path from "node:path";

const [sourceRoot, outputRoot, mapFile] = process.argv.slice(2).map((value) =>
  value ? path.resolve(value) : value,
);

if (!sourceRoot || !outputRoot || !mapFile) {
  throw new Error(
    "Usage: node build-sites-media-package.mjs SOURCE OUTPUT MAP_FILE",
  );
}

for (const target of [outputRoot, mapFile]) {
  try {
    await fs.access(target);
    throw new Error(`Target already exists: ${target}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const files = [];
async function walk(root) {
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) files.push(full);
  }
}

await walk(sourceRoot);
files.sort((a, b) => a.localeCompare(b, "en"));

const map = {};
const skipped = [];
let written = 0;
let bytes = 0;

for (const source of files) {
  const relative = path.relative(sourceRoot, source);
  const [collection, ...nameParts] = relative.split(path.sep);
  const deployedName = nameParts.join("/");
  const rasterOptimized = deployedName.match(
    /^(.*\.(?:png|jpe?g|webp))\.webp$/i,
  );
  const originalName = rasterOptimized ? rasterOptimized[1] : deployedName;
  const extension = path.extname(deployedName).toLowerCase();
  const safeExtension = /^[.][a-z0-9]{1,8}$/.test(extension)
    ? extension
    : ".bin";
  const safeName = `asset-${String(written + 1).padStart(5, "0")}${safeExtension}`;
  const target = path.join(outputRoot, collection, safeName);

  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
    const stat = await fs.stat(source);
    bytes += stat.size;
    written += 1;
    map[`/media/${collection}/${originalName}`] =
      `/media/${collection}/${safeName}`;
  } catch {
    skipped.push(source);
  }
}

await fs.writeFile(mapFile, `${JSON.stringify(map, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      sourceFiles: files.length,
      written,
      mappingEntries: Object.keys(map).length,
      skippedFiles: skipped.length,
      skipped,
      bytes,
      outputRoot,
      mapFile,
    },
    null,
    2,
  ),
);
