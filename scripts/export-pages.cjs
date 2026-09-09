/* Reproducible static renderer: reads the authoritative app; never edits it. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { normalizeBase } = require('./deployment-config.cjs');
const [sourceArg, outputArg, baseArg = '/', originArg] = process.argv.slice(2);
if (!sourceArg || !outputArg) throw new Error('Usage: node export-pages.cjs <site source> <new output directory> [base path] [site origin]');
const source = path.resolve(sourceArg), output = path.resolve(outputArg);
if (fs.existsSync(output)) throw new Error('Output must be a NEW directory; existing artifacts are preserved.');
const base = normalizeBase(baseArg);
const origin = new URL(originArg || (base === '/' ? 'https://heoagroup.org' : 'https://bayesianstvc.github.io')).origin;
const req = Module.createRequire(path.join(source, 'package.json'));
const ts = req('typescript'), React = req('react'), { renderToStaticMarkup } = req('react-dom/server');
const cache = new Map();
let payload = {}, capture = true, currentRecord = null;
const linkRepairs=[], unresolvedLinks=[], missingMedia=[];
function load(filename) {
  filename = path.resolve(filename);
  if (!path.extname(filename)) filename = ['.tsx', '.ts', '.json', '.js'].map(x => filename + x).find(fs.existsSync) || filename;
  if (cache.has(filename)) return cache.get(filename).exports;
  if (filename.endsWith('.json')) return JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (filename.endsWith('.css')) return {};
  const mod = new Module(filename); mod.filename = filename; mod.paths = Module._nodeModulePaths(source); cache.set(filename, mod);
  mod.require = spec => spec.startsWith('@/') ? load(path.join(source, spec.slice(2))) : spec.startsWith('.') ? load(path.resolve(path.dirname(filename), spec)) : req(spec);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{jsx:ts.JsxEmit.ReactJSX, module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022, esModuleInterop:true}}).outputText, filename);
  for (const [file, key, field] of [['archive-list.tsx','ArchiveList','archive'],['site-search.tsx','SiteSearch','search']]) {
    if (filename.endsWith(path.sep + file)) { const original = mod.exports[key]; mod.exports[key] = props => { if(capture) payload[field] = props.items || props.entries; return original(props); }; mod.exports.__original = original; }
  }
  return mod.exports;
}
const content = load(path.join(source,'lib/content.ts'));
const resolveMedia = load(path.join(source,'lib/media-paths.ts')).resolveMediaPath;
function prefix(value) {
  if (!value.startsWith('/') || value.startsWith('//')) return value;
  return base + resolveMedia(value).slice(1);
}
function rewrite(html) {
  return html.replace(/\bhref=(['"])([^'"]+)\1/g, (_,q,url)=>{
    if(!currentRecord || /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url))return `href=${q}${url}${q}`;
    const oldPath=`/${currentRecord.source}/${currentRecord.kind==='post'?'posts':'pages'}/${currentRecord.sourceId}.html`;
    const target=new URL(url.replaceAll('&amp;','&'),'https://snapshot.invalid'+oldPath);
    const match=target.pathname.match(/^\/(heoa|healthy-cities)\/(posts|pages)\/(\d+)\.html$/);
    let record=match && content.records.find(r=>r.source===match[1]&&r.kind===(match[2]==='posts'?'post':'page')&&r.sourceId===Number(match[3]));
    if(!record&&match)record=content.records.find(r=>r.source===match[1]&&r.sourceId===Number(match[3]));
    if(record){const next='/content/'+record.id+target.hash;linkRepairs.push({from:currentRecord.id,old:url,new:next});return `href=${q}${next}${q}`;}
    unresolvedLinks.push({from:currentRecord.id,old:url});return `href=${q}/recovery/unmatched-source-reference.html${q}`;
  }).replace(/\bsrc=(['"])([^'"]*recovery\/unmatched-source-reference\.html)\1/g,(_,q,url)=>{missingMedia.push({from:currentRecord?.id,old:url});return `src=${q}/pages-static/missing-figure.svg${q}`;})
    .replace(/\bsrc=(['"])https:\/\/mmbiz\.qpic\.cn\/mmbiz_png\/JGibSd3aC3Ngon7PqD1gRdNEQddnzNickOKG7cGAOA197zwutGNJkAMqCA9NLodUIicUCclibOdGeIZ4uNsP62xJrg\/640[^'"]*\1/g,(_,q)=>`src=${q}/pages-static/wechat-7204-icon.png${q}`)
    .replace(/\b(href|src|poster|action)=(['"])(\/[^'"]*)\2/g, (_,attr,q,url)=>`${attr}=${q}${prefix(url)}${q}`)
    .replace(/\bsrcSet=(['"])(.*?)\1/gi, (_,q,set)=>`srcset=${q}${set.split(',').map(v=>v.trim().replace(/^\/\S+/,prefix)).join(', ')}${q}`)
    .replace(/url\((['"]?)(\/[^)'" ]+)\1\)/g,(_,q,u)=>`url(${q}${prefix(u)}${q})`)
    .replace(/media-loading/g,'media-ready');
}
function write(relative, value) { const target=path.join(output,relative); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,value); }
const escape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routeFiles=[];
function scan(dir) {for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(ent.isDirectory() && !ent.name.includes('['))scan(path.join(dir,ent.name));if(ent.name==='page.tsx')routeFiles.push(path.join(dir,ent.name));}}
scan(path.join(source,'app'));
const routes=routeFiles.map(file=>({file,route:'/'+path.relative(path.join(source,'app'),path.dirname(file)).split(path.sep).join('/')}));
for(const record of content.records) routes.push({file:path.join(source,'app/content/[id]/page.tsx'),route:'/content/'+record.id,id:record.id,title:record.title});
const archiveOriginal=load(path.join(source,'components/archive-list.tsx')).__original;
async function main(){
  fs.mkdirSync(output,{recursive:true});
  const publicDir=path.join(source,'sites-public-v24-web-release');
  if (!fs.existsSync(publicDir)) throw new Error('Run npm run build in the source app first (publication media is missing).');
  const cssDir=path.join(source,'dist/client/_next/static/css');
  const css=fs.readdirSync(cssDir).filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(path.join(cssDir,f),'utf8')).join('\n');
  write('pages-static/styles.css',rewrite(css)+'\n[data-reveal]{opacity:1!important;transform:none!important} [hidden]{display:none!important} .media-skeleton{display:none!important}\n');
  fs.copyFileSync(path.join(__dirname,'pages-runtime.js'),path.join(output,'pages-static/runtime.js'));
  fs.copyFileSync(path.join(__dirname,'wechat-7204-icon.png'),path.join(output,'pages-static/wechat-7204-icon.png'));
  const metadata=[];
  for(const item of routes){
    if(item.route==='/think-tank/healthy-cities/about'){write('think-tank/healthy-cities/about/index.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${base}think-tank/healthy-cities/team/"><title>中心成员</title><a href="${base}think-tank/healthy-cities/team/">中心成员</a></html>`);metadata.push({route:item.route,title:'中心成员',redirect:'/think-tank/healthy-cities/team'});continue;}
    payload={}; capture=true;currentRecord=item.id?content.records.find(r=>r.id===item.id):null;
    const page=load(item.file).default;
    const rendered=renderToStaticMarkup(await page(item.id?{params:Promise.resolve({id:item.id})}:{}));
    let body=rewrite(rendered);
    const routePayload=payload;
    if(routePayload.archive){capture=false;routePayload.archive=routePayload.archive.map(entry=>{const html=renderToStaticMarkup(React.createElement(archiveOriginal,{items:[entry]}));const card=html.match(/<article class="archive-card[\s\S]*?<\/article>/)?.[0];if(!card)throw new Error('Archive card not rendered: '+entry.id);return {...entry,html:rewrite(card)};});}
    const title=item.title || body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g,'') || 'HEOA｜健康服务与产业组织研究';
    if(Object.keys(routePayload).length){const dataPath='pages-static/data/'+(item.route==='/'?'home':item.route.slice(1).replaceAll('/','--'))+'.json';write(dataPath,JSON.stringify(routePayload));body+=`<script type="application/json" id="pages-config">${JSON.stringify({base,data:base+dataPath})}</script>`;}
    else body+=`<script type="application/json" id="pages-config">${JSON.stringify({base})}</script>`;
    const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}｜HEOA</title><meta name="description" content="HEOA 健康服务与产业组织研究，健康城市发展研究中心。公开静态网站。"><link rel="icon" href="${base}favicon.svg"><link rel="stylesheet" href="${base}pages-static/styles.css"><link rel="canonical" href="${origin}${base}${item.route.slice(1)}"></head><body>${body}<script defer src="${base}pages-static/runtime.js"></script></body></html>`;
    write(path.join(item.route.slice(1),'index.html'),html);metadata.push({route:item.route,title,bytes:Buffer.byteLength(html)});
    if(metadata.length%50===0)process.stdout.write(`Rendered ${metadata.length}/${routes.length}\n`);
  }
  write('.nojekyll','');
  write('pages-static/missing-figure.svg','<svg xmlns="http://www.w3.org/2000/svg" width="960" height="300" viewBox="0 0 960 300"><rect width="960" height="300" fill="#f4f1ec"/><rect x="1" y="1" width="958" height="298" fill="none" stroke="#ded8d1"/><text x="480" y="140" text-anchor="middle" font-family="Arial,Microsoft YaHei,sans-serif" font-size="24" fill="#6f6864">原始备份中的该幅图像暂缺</text><text x="480" y="182" text-anchor="middle" font-family="Arial,Microsoft YaHei,sans-serif" font-size="17" fill="#6f6864">保留原文与图注，待补充真实图片</text></svg>');
  write('recovery/unmatched-source-reference.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>历史资料引用｜HEOA</title><link rel="stylesheet" href="${base}pages-static/styles.css"><body><main class="article-page"><h1>历史资料引用暂未收录</h1><p>该链接来自原站历史文章，现有离线备份未包含其目标资料。为避免误指向其他内容，保留此说明。</p><p><a href="${base}search/">全站搜索</a> · <a href="${base}research/">学术研究</a> · <a href="${base}">返回首页</a></p></main></body></html>`);
  write('404.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>页面未找到｜HEOA</title><body><h1>页面未找到</h1><p>请从<a href="${base}">首页</a>或<a href="${base}search/">全站搜索</a>查找资料。</p></body></html>`);
  write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${metadata.map(r=>`<url><loc>${origin}${base}${r.route.slice(1)}</loc></url>`).join('')}</urlset>`);
  write('pages-static/export-manifest.json',JSON.stringify({schemaVersion:1,base,origin,contentCount:content.records.length,pageCount:metadata.length,heoaMembers:content.heoaMembers.length,centerMembers:content.healthyMembers.length,routes:metadata},null,2));
  write('pages-static/link-repairs.json',JSON.stringify({repaired:linkRepairs.length,unresolved:unresolvedLinks.length,linkRepairs,unresolvedLinks,missingMedia},null,2));
  const references=new Set(['favicon.svg']);
  const collect=dir=>{for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,ent.name);if(ent.isDirectory())collect(f);else if(/\.(html|json|css)$/.test(f)){let text=fs.readFileSync(f,'utf8');if(f.endsWith('.json'))text=text.replaceAll('\\"','"');for(const m of text.matchAll(new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'((?:media|media-web-v24|portraits-v24|brand|team-v23|assets)/[^\\s"\\\'<>]+)','g'))){references.add(m[1].split(/[?#]/)[0]);}}}};
  collect(output);
  const missing=[];let mediaBytes=0;const assets=[];
  for(const relative of references){const candidates=[relative,decodeURIComponent(relative)];const local=candidates.map(p=>path.join(publicDir,p)).find(fs.existsSync);if(!local){missing.push(relative);continue;}const target=path.join(output,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(local,target);const size=fs.statSync(local).size;mediaBytes+=size;assets.push({path:relative,bytes:size});}
  write('pages-static/asset-audit.json',JSON.stringify({files:assets.length,mediaBytes,missing,largest:assets.sort((a,b)=>b.bytes-a.bytes).slice(0,30)},null,2));
  if(missing.length)throw new Error(`Missing ${missing.length} referenced assets; see asset-audit.json`);
  process.stdout.write(JSON.stringify({output,pages:metadata.length,content:content.records.length})+'\n');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
