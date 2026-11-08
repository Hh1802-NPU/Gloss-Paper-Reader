import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
const own=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(process.env.GLOSS_SOURCE_ROOT||path.join(own,'..'))
function run(command,args,options={}){const result=spawnSync(command,args,{cwd:root,encoding:'utf8',...options});if(result.status!==0){process.stderr.write(result.stdout||'');process.stderr.write(result.stderr||'');throw Error(command+' failed with '+result.status)}return result.stdout}
function inspectPackage() {
 const args=['pack','--dry-run','--json','--ignore-scripts']
 const npmCli=process.env.npm_execpath
 if(npmCli&&path.isAbsolute(npmCli)&&path.basename(npmCli).toLowerCase()==='npm-cli.js') {
  return run(process.execPath,[npmCli,...args])
 }
 if(process.platform==='win32') {
  return run(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm.cmd pack --dry-run --json --ignore-scripts'])
 }
 return run('npm',args)
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const name=path.join(dir,entry.name);return entry.isDirectory()?walk(name):[name]})}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'))
if(fs.existsSync(path.join(root,'src/style-manifest.json')))run(process.execPath,['scripts/build.mjs','--check'])
const runtime=['index.js','client.js','setup.mjs',...walk(path.join(root,'vendor')).filter(file=>/\.js$/.test(file)).map(file=>path.relative(root,file))]
const tracked=[...runtime,'package.json',...walk(path.join(root,'locale')).filter(file=>file.endsWith('.json')).map(file=>path.relative(root,file))],digest=file=>createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),frozen=new Map(tracked.map(file=>[file,digest(file)]))
for(const file of runtime)run(process.execPath,['--check',file])
for(const file of walk(path.join(root,'locale')).filter(file=>file.endsWith('.json')))JSON.parse(fs.readFileSync(file,'utf8'))
const tests=walk(path.join(own,'..','tests')).filter(file=>file.endsWith('.test.mjs'))
run(process.execPath,['--test',...tests],{env:{...process.env,GLOSS_SOURCE_ROOT:root},stdio:'inherit'})
let pack=null
if(!process.argv.includes('--no-pack')){
 const packed=JSON.parse(inspectPackage())[0]
 const required=['setup.mjs','requirements.txt']
 const missing=required.filter(name=>!packed.files.some(file=>file.path===name))
 if(missing.length)throw Error('Required setup files missing from npm package: '+missing.join(', '))
 const denied=packed.files.filter(file=>/(?:^|\/)(?:work|outputs|node_modules|\.git|\.env(?:\..*)?)(?:\/|$)|\.(?:pdf|sqlite3?|db|log|zip|tgz|png|jpe?g)$/i.test(file.path))
 if(denied.length)throw Error('Private or generated files in npm package: '+denied.map(file=>file.path).join(', '))
 const hits=[]
 for(const file of packed.files.filter(file=>/\.(?:js|mjs|css|json|ya?ml|md|txt|py|svg)$/i.test(file.path))){const value=fs.readFileSync(path.join(root,file.path),'utf8');if(/\/Users\/[^/\s]+\/|\/var\/folders\//.test(value)||/[A-Z]:\\Users\\/i.test(value))hits.push(file.path+': local absolute path');if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{25,}\b|\bsk-[A-Za-z0-9]{30,}\b/.test(value))hits.push(file.path+': credential-shaped literal')}
 if(hits.length)throw Error('Review packaged text: '+hits.join(', '))
 pack={files:packed.entryCount,bytes:packed.size,unpackedBytes:packed.unpackedSize}
}
for(const[file,before]of frozen)if(digest(file)!==before)throw Error('Source changed during checks; rerun a frozen source: '+file)
console.log(JSON.stringify({ok:true,syntaxFiles:runtime.length,testFiles:tests.length,packageName:pkg.name,pack,limits:['Offline contract checks do not prove browser/native interaction, model content quality, or user visual acceptance.','Credential scanning checks common literal shapes, not all possible confidential information.']},null,2))
