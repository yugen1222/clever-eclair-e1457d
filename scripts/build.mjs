import {build} from 'esbuild';
import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{force:true,recursive:true});await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,format:'esm',jsx:'automatic',outdir:'dist/assets',entryNames:'app',minify:true,target:['es2022'],define:{'process.env.NODE_ENV':'"production"'}});
await copyFile('index.html','dist/index.html');await copyFile('favicon.svg','dist/favicon.svg');
await rm('dist-server',{force:true,recursive:true});
await build({entryPoints:['server/main.ts'],bundle:true,platform:'node',format:'esm',target:'node22',packages:'external',outfile:'dist-server/server.mjs'});
console.log('Frontend and Node.js server built.');
