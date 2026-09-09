const fs = require('node:fs');
const path = require('node:path');

function normalizeBase(value = '/') {
  const parts = String(value).replace(/^\/+|\/+$/g, '');
  if (parts && !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(parts)) throw new Error('Invalid site base path');
  return parts ? '/' + parts + '/' : '/';
}

function readDeployment(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'pages-static/export-manifest.json'), 'utf8'));
  const base = normalizeBase(manifest.base);
  const origin = manifest.origin || 'https://bayesianstvc.github.io';
  return { base, origin, url: origin + base, manifest };
}

module.exports = { normalizeBase, readDeployment };
