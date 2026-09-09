import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '..');
const task = path.resolve(project, '..');
const backup = path.join(task, '01-原站备份');
const offline = path.join(project, 'offline-site');

const decode = (value = '') => value
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;|&#8220;|&#8221;/g, '"')
  .replace(/&#8216;|&#8217;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#8211;/g, '–')
  .replace(/&#8212;/g, '—')
  .replace(/&#8230;/g, '…');

const strip = (value = '') => decode(value)
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const bodyFromOffline = (site, type, id) => {
  const file = path.join(offline, 'content', site, type, `${id}.html`);
  if (!fs.existsSync(file)) return '';
  const html = fs.readFileSync(file, 'utf8');
  const startMarker = '<div class="article-content">';
  const start = html.indexOf(startMarker);
  const end = html.lastIndexOf('</div></main>');
  if (start < 0 || end < 0) return '';
  return html
    .slice(start + startMarker.length, end)
    .replaceAll(`../../../assets/${site}/`, `/media/${site}/`)
    .replace(/(\/media\/(?:heoa|healthy-cities)\/[^"'\s?#,]+)\.(?=["'\s?#,])/g, '$1.bin')
    .replaceAll(`&amp;`, '&');
};

const mediaById = (site) => {
  const media = JSON.parse(fs.readFileSync(path.join(backup, site, 'data', 'media.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(backup, site, 'asset-manifest.json'), 'utf8'));
  const fileByUrl = new Map();
  for (const item of manifest) {
    if (item.url && item.file) fileByUrl.set(item.url, item.file);
    if (item.resolved_url && item.file) fileByUrl.set(item.resolved_url, item.file);
  }
  return new Map(media.map((item) => [item.id, fileByUrl.get(item.source_url) || null]));
};

const normalizeFile = (file) => file?.endsWith('.') ? `${file}bin` : file;
const assetId = (site, file) => file ? `${site}:${normalizeFile(file)}` : null;
const firstBodyAsset = (site, html) => {
  const match = html.match(new RegExp(`/media/${site}/([^"'?#]+)`));
  return match ? assetId(site, match[1]) : null;
};

const categories = {
  heoa: { research: 132600, news: 132599 },
  'healthy-cities': { research: 132605, news: 132604 },
};

const records = [];
for (const site of ['heoa', 'healthy-cities']) {
  const featured = mediaById(site);
  for (const type of ['posts', 'pages']) {
    const items = JSON.parse(fs.readFileSync(path.join(backup, site, 'data', `${type}.json`), 'utf8'));
    for (const item of items) {
      const bodyHtml = bodyFromOffline(site, type, item.id);
      const cats = item.categories || [];
      let section = type === 'pages' ? 'page' : 'news';
      if (cats.includes(categories[site].research)) section = 'research';
      else if (cats.includes(categories[site].news)) section = 'news';
      const featuredFile = featured.get(item.featured_media);
      records.push({
        id: `${site}-${type.slice(0, -1)}-${item.id}`,
        source: site,
        sourceLabel: site === 'heoa' ? 'HEOA' : '健康城市发展研究中心',
        sourceId: item.id,
        kind: type.slice(0, -1),
        section,
        slug: decodeURIComponent(item.slug || String(item.id)),
        title: strip(item.title?.rendered || ''),
        date: String(item.date || '').slice(0, 10),
        modified: String(item.modified || '').slice(0, 10),
        excerpt: strip(item.excerpt?.rendered || item.content?.rendered || '').slice(0, 220),
        bodyHtml,
        featuredAssetId: assetId(site, featuredFile) || firstBodyAsset(site, bodyHtml),
        legacyUrl: item.link || '',
      });
    }
  }
}

records.sort((a, b) => b.date.localeCompare(a.date) || b.sourceId - a.sourceId);

const assetRegistry = {};
for (const site of ['heoa', 'healthy-cities']) {
  const directory = path.join(project, 'public', 'media', site);
  for (const file of fs.readdirSync(directory)) {
    if (file.endsWith('.')) continue;
    const id = assetId(site, file);
    assetRegistry[id] = { assetId: id, source: site, file, path: `/media/${site}/${file}` };
  }
}

const heoaMemberPage = records.find((item) => item.source === 'heoa' && item.kind === 'page' && item.slug === 'members');
const healthyMemberSlugs = ['chenchu', 'zoukun', 'linxiaojun', 'wangxiuli', 'zhangyumeng', 'songchao', 'zhaoli', 'liuzhenmi', 'panjie'];
const healthyMembers = healthyMemberSlugs.map((slug) => records.find((item) => item.source === 'healthy-cities' && item.kind === 'page' && item.slug === slug)).filter(Boolean);

const output = {
  generatedAt: new Date().toISOString(),
  counts: {
    total: records.length,
    heoaPosts: records.filter((r) => r.source === 'heoa' && r.kind === 'post').length,
    heoaPages: records.filter((r) => r.source === 'heoa' && r.kind === 'page').length,
    healthyPosts: records.filter((r) => r.source === 'healthy-cities' && r.kind === 'post').length,
    healthyPages: records.filter((r) => r.source === 'healthy-cities' && r.kind === 'page').length,
    assets: Object.keys(assetRegistry).length,
  },
  records,
  teams: {
    heoaLegacyPageId: heoaMemberPage?.id || null,
    healthyMemberIds: healthyMembers.map((item) => item.id),
  },
  assets: assetRegistry,
};

fs.writeFileSync(path.join(project, 'content', 'site-content.json'), JSON.stringify(output));
console.log(JSON.stringify(output.counts));
