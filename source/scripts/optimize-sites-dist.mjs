import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

throw new Error('Disabled since V22: this legacy 320px/quality25 pipeline destroys image quality. Publish the byte-preserved sites-media-hq tree instead.');

const [sourceDist, targetDist] = process.argv.slice(2).map((value) =>
  value ? path.resolve(value) : value,
);

if (!sourceDist || !targetDist) {
  throw new Error("Usage: node optimize-sites-dist.mjs SOURCE_DIST TARGET_DIST");
}

try {
  await fs.access(targetDist);
  throw new Error(`Target already exists: ${targetDist}`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const files = [];
async function walk(root) {
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) files.push(full);
  }
}

await walk(sourceDist);

const rasterPattern = /\.(?:png|jpe?g|webp)$/i;
const isOptimizableRaster = (file) => {
  const relative = path.relative(sourceDist, file);
  return (
    rasterPattern.test(file) &&
    (relative.startsWith(`client${path.sep}media${path.sep}`) ||
      relative.startsWith(`client${path.sep}brand${path.sep}`))
  );
};
const rasterFiles = files.filter(isOptimizableRaster);
const otherFiles = files.filter((file) => !isOptimizableRaster(file));
const skipped = [];
let sourceBytes = 0;
let targetBytes = 0;

async function ensureParent(file) {
  await fs.mkdir(path.dirname(file), { recursive: true });
}

for (const source of otherFiles) {
  const relative = path.relative(sourceDist, source);
  const target = path.join(targetDist, relative);
  try {
    await ensureParent(target);
    await fs.copyFile(source, target);
    const stat = await fs.stat(source);
    sourceBytes += stat.size;
    targetBytes += stat.size;
  } catch {
    skipped.push(source);
  }
}

const queue = [...rasterFiles];
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const source = queue.pop();
    const relative = path.relative(sourceDist, source);
    const target = path.join(targetDist, `${relative}.webp`);
    try {
      await ensureParent(target);
      const sourceStat = await fs.stat(source);
      await sharp(source)
        .resize({
          width: 320,
          height: 320,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 25, alphaQuality: 50, effort: 4 })
        .toFile(target);
      const targetStat = await fs.stat(target);
      sourceBytes += sourceStat.size;
      targetBytes += targetStat.size;
    } catch {
      skipped.push(source);
    }
  }
});

await Promise.all(workers);

const retainedRasterUrls = new Set();
for (const source of skipped.filter((file) => rasterPattern.test(file))) {
  const relative = path.relative(sourceDist, source);
  const target = path.join(targetDist, relative);
  await ensureParent(target);
  await fs.copyFile(source, target);
  if (relative.startsWith(`client${path.sep}`)) {
    retainedRasterUrls.add(
      `/${relative.slice(`client${path.sep}`.length).split(path.sep).join("/")}`,
    );
  }
}

const textExtensions = new Set([".js", ".json", ".html", ".css", ".map", ".txt"]);
const targetFiles = [];
async function walkTarget(root) {
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) await walkTarget(full);
    else if (entry.isFile()) targetFiles.push(full);
  }
}

await walkTarget(targetDist);
let rewrittenFiles = 0;
let rewrittenReferences = 0;
for (const file of targetFiles) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const before = await fs.readFile(file, "utf8");
  let count = 0;
  const after = before.replace(
    /(\/(?:media|brand)\/[^"'\\)\s<>,`]+\.(?:png|jpe?g|webp))\b/gi,
    (match) => {
      const normalizedMatch = match.replaceAll("%25", "%");
      if (
        retainedRasterUrls.has(match) ||
        retainedRasterUrls.has(normalizedMatch)
      ) {
        return match;
      }
      count += 1;
      return `${match}.webp`;
    },
  );
  if (count) {
    await fs.writeFile(file, after);
    rewrittenFiles += 1;
    rewrittenReferences += count;
  }
}

console.log(
  JSON.stringify(
    {
      sourceFiles: files.length,
      convertedRasterFiles:
        rasterFiles.length - skipped.filter((file) => rasterPattern.test(file)).length,
      copiedOtherFiles:
        otherFiles.length - skipped.filter((file) => !rasterPattern.test(file)).length,
      skippedFiles: skipped.length,
      skipped,
      sourceBytes,
      targetBytes,
      savedBytes: sourceBytes - targetBytes,
      rewrittenFiles,
      rewrittenReferences,
      targetDist,
    },
    null,
    2,
  ),
);
