import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2),at=args.indexOf('--out'),target=path.resolve(at<0?path.join(root,'outputs/github-ready/Gloss'):args[at+1]||'');
if(target===root||root.startsWith(target+path.sep))throw Error('Refuse to export over the source project');
if(fs.existsSync(target))throw Error('Export directory already exists; choose another --out to preserve the previous version');
const checked=spawnSync(process.execPath,['scripts/check.mjs'],{cwd:root,stdio:'inherit'});if(checked.status!==0)throw Error('Source checks failed; export cancelled');
function inspectPackage() {
 const args=['pack','--dry-run','--json','--ignore-scripts'];
 const options={cwd:root,encoding:'utf8'};
 const npmCli=process.env.npm_execpath;
 if(npmCli&&path.isAbsolute(npmCli)&&path.basename(npmCli).toLowerCase()==='npm-cli.js') {
  return spawnSync(process.execPath,[npmCli,...args],options);
 }
 if(process.platform==='win32') {
  return spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm.cmd pack --dry-run --json --ignore-scripts'],options);
 }
 return spawnSync('npm',args,options);
}
const pack=inspectPackage();if(pack.status!==0)throw Error(pack.stderr||pack.error?.message||'Cannot read package file list');
const runtime=JSON.parse(pack.stdout)[0].files.map(item=>item.path),names=new Set(runtime),trees=['src','scripts','tests','docs'];
function addTree(relative){for(const item of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){const name=path.posix.join(relative,item.name);if(item.isSymbolicLink())throw Error('Refuse symlink '+name);if(item.isDirectory())addTree(name);else if(/\.(?:mjs|js|css|json|md|cmd|command)$/.test(name))names.add(name)}}
for(const tree of trees)addTree(tree);for(const name of ['README.md','CONTRIBUTING.md','.gitignore'])names.add(name);
function checkExportFile(name,input,data){
 if(path.isAbsolute(name)||name.split(/[\\/]/).includes('..'))throw Error('Unsafe export path '+name);
 if(/(?:^|\/)(?:work|outputs|node_modules|__pycache__|\.git|\.env(?:\..*)?)(?:\/|$)|\.(?:pdf|png|jpe?g|db|sqlite3?|log|tgz|zip|pyc)$/i.test(name))throw Error('Private or generated export path '+name);
 if(!fs.lstatSync(input).isFile())throw Error('Refuse non-file export '+name);
 if(!/\.(?:js|mjs|css|json|ya?ml|md|txt|py|svg|cmd|command)$/i.test(name))return;
 const value=data.toString('utf8');
 if(/\/Users\/[^/\s]+\/|\/var\/folders\//.test(value)||/[A-Z]:\\Users\\/i.test(value))throw Error('Review local absolute path in '+name);
 if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{25,}\b|\bsk-[A-Za-z0-9]{30,}\b/.test(value))throw Error('Review credential-shaped literal in '+name);
}
const snapshot=[...names].sort().map(name=>{const input=path.join(root,name);if(!fs.lstatSync(input).isFile())throw Error('Refuse non-file export '+name);const data=fs.readFileSync(input);checkExportFile(name,input,data);return{name,input,data}});
fs.mkdirSync(target,{recursive:true});const manifest=[];
for(const {name,input,data} of snapshot){const output=path.join(target,name);if(!fs.lstatSync(input).isFile()||!fs.readFileSync(input).equals(data))throw Error('Source changed during export; preserve this attempt and choose another target: '+name);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,data);manifest.push({file:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')})}
fs.writeFileSync(path.join(path.dirname(target),path.basename(target)+'.manifest.json'),JSON.stringify({generatedAt:new Date().toISOString(),files:manifest,published:false},null,2)+'\n');
console.log(JSON.stringify({directory:target,files:manifest.length,bytes:manifest.reduce((sum,item)=>sum+item.bytes,0),published:false},null,2));
