/** Deterministic zero-dependency source composition. This is a build step, never loaded by the browser. */
import vm from 'node:vm';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),args=process.argv.slice(2),check=args.includes('--check'),outAt=args.indexOf('--out');
const manifest=JSON.parse(await fs.readFile(path.join(root,'src/style-manifest.json'),'utf8'));
if(manifest.version!==1||!Array.isArray(manifest.styles))throw Error('Unknown source manifest');
let output=await fs.readFile(path.join(root,manifest.entry),'utf8');
for (const fragment of manifest.scripts || []) {
  if (!/^__GLOSS_[A-Z_]+__$/.test(fragment.token) || output.split(fragment.token).length !== 2) throw Error('Missing or duplicated script marker '+fragment.token);
  const file=path.resolve(root,fragment.file),allowed=path.join(root,'src')+path.sep;
  if (!file.startsWith(allowed) || !file.endsWith('.js')) throw Error('Script fragment outside source');
  const source=await fs.readFile(file,'utf8');
  output=output.replace(fragment.token,()=>source.trimEnd());
}
const encode=css=>'`'+css.replaceAll('\\','\\\\').replaceAll('`','\\`').replaceAll('${','\\${')+'`';
for(const style of manifest.styles){if(!/^__GLOSS_STYLE_[A-Z_]+__$/.test(style.token))throw Error('Invalid style marker');if(output.split(style.token).length!==2)throw Error('Missing or duplicated marker '+style.token);const file=path.resolve(root,style.file),allowed=path.join(root,'src/styles')+path.sep;if(!file.startsWith(allowed))throw Error('Style file outside source styles');const css=await fs.readFile(file,'utf8');output=output.replace(style.token,()=>encode(css));}
if(/__GLOSS_STYLE_[A-Z_]+__/.test(output))throw Error('Unresolved source marker');
const target=path.resolve(root,outAt>=0?args[outAt+1]:manifest.output);if(target===path.join(root,manifest.entry))throw Error('Refusing to overwrite source template');
new vm.Script(output,{filename:target});
if(check){const existing=await fs.readFile(target,'utf8');if(existing!==output)throw Error('Build artifact differs from current source: '+path.relative(root,target));console.log('Build artifact matches source exactly.');}
else{await fs.mkdir(path.dirname(target),{recursive:true});const temporary=target+'.build-next';await fs.writeFile(temporary,output);await fs.rename(temporary,target);console.log('Built '+path.relative(root,target)+' ('+Buffer.byteLength(output)+' bytes).');}
