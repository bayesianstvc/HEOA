import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const requiredFiles = [
  'app/page.tsx',
  'app/news/page.tsx',
  'app/research/page.tsx',
  'app/team/page.tsx',
  'app/think-tank/healthy-cities/page.tsx',
  'components/media-image.tsx',
  'components/archive-list.tsx',
  'lib/api-contract.ts',
  'lib/api-client.ts',
  'docs/api-contract-v21.md',
];
const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) throw new Error(`缺少冻结文件：${missing.join(', ')}`);

const scanFiles = [
  'app/globals.css', 'app/page.tsx', 'app/think-tank/healthy-cities/page.tsx',
  'components/archive-list.tsx', 'components/content-views.tsx', 'components/member-card.tsx',
  'components/site-shell.tsx', 'components/hero-carousel.tsx', 'lib/content.ts',
];
for (const file of scanFiles) {
  const value = await readFile(file, 'utf8');
  if (/^(<<<<<<<|=======|>>>>>>>)\s*$/m.test(value)) throw new Error(`仍存在合并标记：${file}`);
}

const directory = JSON.parse(await readFile('content/member-directory.json', 'utf8'));
const expectedHome = ['healthy-cities-page-27875', 'heoa-member-5544', 'heoa-member-4683', 'heoa-member-5991', 'healthy-cities-page-27947'];
const expectedCenter = ['healthy-cities-page-27875', 'healthy-cities-page-27998', 'healthy-cities-page-27984', 'healthy-cities-page-28011', 'healthy-cities-page-27967'];
if (JSON.stringify(directory.homeFeaturedIds) !== JSON.stringify(expectedHome)) throw new Error('HEOA 首页成员顺序不符合 V21 约定');
if (JSON.stringify(directory.centerFeaturedIds) !== JSON.stringify(expectedCenter)) throw new Error('中心首页成员顺序不符合 V21 约定');

const api = await readFile('lib/api-contract.ts', 'utf8');
for (const key of ['page', 'pageSize', 'q', 'year', 'category', 'centerId', 'status']) {
  if (!api.includes(`'${key}'`)) throw new Error(`API 查询参数缺失：${key}`);
}
for (const path of ['/api/content', '/api/members', '/api/media']) {
  if (!api.includes(path)) throw new Error(`API 路径缺失：${path}`);
}

console.log(`V21 验证通过：${requiredFiles.length} 个关键文件、无合并标记、成员顺序和 API 契约均符合冻结基线。`);
