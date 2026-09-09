import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import deployment from './deployment-config.cjs';
const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '../pages'));
const {base,origin,url:siteUrl}=deployment.readDeployment(root);
if(process.env.PAGES_BASE_URL && process.env.PAGES_BASE_URL.replace(/\/+$/,'')!==siteUrl.replace(/\/+$/,''))throw new Error(`Publication URL mismatch: exported ${siteUrl}, GitHub Pages ${process.env.PAGES_BASE_URL}`);
const all=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else all.push(f);}}
walk(root);
const missing=[], outsideBase=[], checked=new Set();
function check(raw,from){
  raw=raw.replaceAll('&amp;','&');
  if(!raw||/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw))return;
  const relative=path.relative(root,from).split(path.sep).join('/');
  const url=new URL(raw,siteUrl+relative);
  if(!url.pathname.startsWith(base)){outsideBase.push({from:relative,url:raw});return;}
  let key=url.pathname.slice(base.length);
  if(checked.has(key))return;checked.add(key);
  let candidates=[path.join(root,key)];try{candidates.push(path.join(root,decodeURIComponent(key)));}catch{}
  if(!candidates.some(f=>fs.existsSync(f)&&(fs.statSync(f).isFile()||fs.existsSync(path.join(f,'index.html')))))missing.push({from:relative,url:raw});
}
for(const f of all){
  if(!/\.(html|css|json)$/.test(f))continue;
  let text=fs.readFileSync(f,'utf8');
  if(f.endsWith('.html')){
    const embedded=text.match(/<script type="application\/json" id="pages-config">(.*?)<\/script>/)?.[1];
    if(embedded){const config=JSON.parse(embedded);if(config.base!==base)outsideBase.push({from:path.relative(root,f),url:'config.base='+config.base});if(config.data)check(config.data,f);}
    const canonical=text.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if(canonical&&!canonical.startsWith(siteUrl))outsideBase.push({from:path.relative(root,f),url:canonical});
  }
  if(f.endsWith('.json'))text=text.replaceAll('\\"','"');
  for(const m of text.matchAll(/\b(?:href|src|poster|action)=["']([^"']+)["']/g))check(m[1],f);
  for(const m of text.matchAll(/\bsrcset=["']([^"']+)["']/gi))for(const part of m[1].split(','))check(part.trim().split(/\s+/)[0],f);
  for(const m of text.matchAll(/url\(["']?([^\s)'" ]+)["']?\)/g))check(m[1],f);
}
const media=all.filter(f=>/\.(webp|png|jpg|jpeg|svg|pdf|docx|bin|pd)$/.test(f));
const hashes=new Map();let duplicateBytes=0;
for(const f of media){const data=fs.readFileSync(f),hash=crypto.createHash('sha256').update(data).digest('hex');if(hashes.has(hash))duplicateBytes+=data.length;else hashes.set(hash,f);}
const report={base,origin,files:all.length,htmlPages:all.filter(f=>f.endsWith('.html')).length,totalBytes:all.reduce((n,f)=>n+fs.statSync(f).size,0),mediaFiles:media.length,mediaBytes:media.reduce((n,f)=>n+fs.statSync(f).size,0),duplicateMediaBytes:duplicateBytes,checkedLocalUrls:checked.size,missing,outsideBase};
console.log(JSON.stringify(report,null,2));
if(missing.length||outsideBase.length)process.exitCode=1;
