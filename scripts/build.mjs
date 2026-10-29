import {build} from 'esbuild';
import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{force:true,recursive:true});await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,format:'esm',jsx:'automatic',outdir:'dist/assets',entryNames:'app',minify:true,target:['es2022'],define:{'process.env.NODE_ENV':'"production"'}});
await copyFile('index.html','dist/index.html');await copyFile('favicon.svg','dist/favicon.svg');
console.log('Frontend built in dist/. API functions are built by Netlify.');
