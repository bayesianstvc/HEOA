import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
process.chdir(projectRoot);
process.env.WRANGLER_WRITE_LOGS = 'false';
process.env.WRANGLER_LOG_PATH = path.join(projectRoot, '.wrangler', 'logs');
process.env.MINIFLARE_REGISTRY_PATH = path.join(projectRoot, '.wrangler', 'registry');

process.argv = [process.argv[0], 'vinext', 'dev', '--port', process.env.PORT || '3024', '--hostname', '127.0.0.1'];
await import('../node_modules/vinext/dist/cli.js');
