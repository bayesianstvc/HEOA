import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../pages');
const port = Number(process.env.PORT || process.argv[2] || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer((req,res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad URL'); return; }
  if (url === '/' || url === '/HEOA') { res.writeHead(302,{Location:'/HEOA/'}).end(); return; }
  if (!url.startsWith('/HEOA/')) { res.writeHead(404).end('Not found'); return; }
  let file = path.resolve(root, '.' + url.slice('/HEOA'.length));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const size = fs.statSync(file).size;
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':size});
    if(req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('页面不存在'); }
}).listen(port,'127.0.0.1',()=>console.log(`HEOA 本地预览：http://127.0.0.1:${port}/HEOA/\n按 Ctrl+C 停止。`));
