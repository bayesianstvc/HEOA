import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(project, 'content', 'site-content.json'), 'utf8'));
const missing = [];
let mediaRefs = 0;
let oldMediaRefs = 0;
for (const item of data.records) {
  const refs = [...item.bodyHtml.matchAll(/\/media\/(heoa|healthy-cities)\/([^\s"'?#,]+)/g)];
  mediaRefs += refs.length;
  for (const [, site, file] of refs) {
    if (!fs.existsSync(path.join(project, 'public', 'media', site, file))) missing.push(`${item.id}:${site}/${file}`);
  }
  oldMediaRefs += (item.bodyHtml.match(/https?:\/\/(?:i\d\.)?wp\.com\/(?:heoagroup|instituteforhealthycities)\.com\/wp-content/gi) || []).length;
}
const result = {records:data.records.length,assets:Object.keys(data.assets).length,mediaRefs,missing:missing.length,missingSample:missing.slice(0,12),oldMediaRefs};
console.log(JSON.stringify(result));
if (data.records.length !== 299 || Object.keys(data.assets).length !== 3616 || missing.length) process.exit(1);
