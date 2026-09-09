// Lossless publication optimization: only byte-identical media are consolidated.
// Input is never changed. Run into a new directory, then run audit-pages.mjs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import deployment from './deployment-config.cjs';
const [inputArg,outputArg]=process.argv.slice(2);
if(!inputArg||!outputArg)throw new Error('Usage: node optimize-pages.mjs <input directory> <NEW output directory>');
const input=path.resolve(inputArg),output=path.resolve(outputArg);
const {base}=deployment.readDeployment(input);
if(fs.existsSync(output))throw new Error('Output must be new; existing files are preserved.');
let files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else files.push(path.relative(input,f).split(path.sep).join('/'));}}
walk(input);files.sort();
const canonical=new Map(),mapping=new Map();let saved=0;
for(const relative of files){if(!/\.(webp|png|jpg|jpeg|svg|pdf|docx|bin|pd)$/.test(relative))continue;
  const data=fs.readFileSync(path.join(input,relative));
  const hash=path.extname(relative)+':'+crypto.createHash('sha256').update(data).digest('hex');
  if(canonical.has(hash)){mapping.set(relative,canonical.get(hash));saved+=data.length;}else canonical.set(hash,relative);
}
for(const relative of files){if(mapping.has(relative))continue;const src=path.join(input,relative),dest=path.join(output,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(/\.(html|css|js|json|xml)$/.test(relative)){let text=fs.readFileSync(src,'utf8');for(const [from,to]of mapping)text=text.replaceAll(base+from,base+to);fs.writeFileSync(dest,text);}else fs.copyFileSync(src,dest);
}
// Verify every retained image is an exact copy, not a re-encoded derivative.
const images=files.filter(f=>/\.(webp|png|jpg|jpeg|svg)$/.test(f)&&!mapping.has(f));
for(const relative of images){if(!fs.readFileSync(path.join(input,relative)).equals(fs.readFileSync(path.join(output,relative))))throw new Error('Image changed: '+relative);}
const report={method:'byte-identical consolidation; no image re-encoding',inputFiles:files.length,removedDuplicateFiles:mapping.size,savedBytes:saved,verifiedUnchangedImages:images.length,mapping:Object.fromEntries(mapping)};
fs.mkdirSync(path.join(output,'pages-static'),{recursive:true});
fs.writeFileSync(path.join(output,'pages-static/optimization-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
