import fs from "node:fs/promises";
import path from "node:path";

throw new Error('Disabled since V22: production must use the same assetId resolver as local preview; do not rewrite originals to legacy thumbnails.');

const dist = path.resolve(process.argv[2] || "dist");
const client = path.join(dist, "client");
const projectRoot = path.resolve(import.meta.dirname, "..");
const mediaMap = JSON.parse(
  await fs.readFile(path.join(projectRoot, "sites-media-map.json"), "utf8"),
);
const textExtensions = new Set([".js", ".json", ".html", ".css", ".map", ".txt"]);

const files = [];
async function walk(root) {
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) files.push(full);
  }
}

await walk(dist);
let rewrittenFiles = 0;
let rewrittenReferences = 0;

for (const file of files) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const before = await fs.readFile(file, "utf8");
  let after = before;
  let changed = 0;

  for (const [original, safe] of Object.entries(mediaMap)) {
    const variants = new Set([
      original,
      original.replaceAll("%", "%25"),
      original.replaceAll("@", "%40"),
    ]);
    for (const variant of variants) {
      if (!after.includes(variant)) continue;
      after = after.split(variant).join(safe);
      changed += 1;
    }
  }

  if (changed) {
    await fs.writeFile(file, after);
    rewrittenFiles += 1;
    rewrittenReferences += changed;
  }
}

console.log(
  JSON.stringify({ rewrittenFiles, rewrittenReferences }, null, 2),
);
