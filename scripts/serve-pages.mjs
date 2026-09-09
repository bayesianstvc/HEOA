import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import deployment from './deployment-config.cjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../pages');
const {base}=deployment.readDeployment(root);
const port = Number(process.env.PORT || process.argv[2] || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer((req,res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad URL'); return; }
  if (base !== '/' && (url === '/' || url === base.slice(0,-1))) { res.writeHead(302,{Location:base}).end(); return; }
  if (base === '/' && (url === '/HEOA' || url.startsWith('/HEOA/'))) { res.writeHead(302,{Location:(url.slice(5)||'/')+new URL(req.url,'http://localhost').search}).end(); return; }
  if (!url.startsWith(base)) { res.writeHead(404).end('Not found'); return; }
  let file = path.resolve(root, './' + url.slice(base.length));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const size = fs.statSync(file).size;
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':size});
    if(req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('页面不存在'); }
}).listen(port,'127.0.0.1',()=>console.log(`HEOA 本地预览：http://127.0.0.1:${port}${base}\n按 Ctrl+C 停止。`));
