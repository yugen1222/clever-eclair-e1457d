import {createServer,type IncomingMessage} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import handler from './api';

const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
export function createApp(origin?:string){
 const root=resolve('dist');
 return createServer(async(req,res)=>{
  try{
   const url=new URL(req.url||'/',origin||`http://${req.headers.host}`);
   res.setHeader('X-Content-Type-Options','nosniff');
   if(url.pathname==='/health'){
    res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"ok":true}');return;
   }
   if(url.pathname.startsWith('/api/')){
    const headers=new Headers();
    for(const [name,value]of Object.entries(req.headers))if(value)headers.set(name,Array.isArray(value)?value.join(', '):value);
    let body:Buffer|undefined;
    if(!['GET','HEAD'].includes(req.method||'GET')){
     const chunks:Buffer[]=[];let size=0;
     for await(const chunk of req){size+=chunk.length;if(size>262144){res.writeHead(413);res.end();return}chunks.push(chunk)}
     body=Buffer.concat(chunks);
    }
    const response=await handler(new Request(url,{method:req.method,headers,...(body?{body:new Uint8Array(body)}:{})}));
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
   }
   if(!['GET','HEAD'].includes(req.method||'')){res.writeHead(405);res.end();return}
   const path=decodeURIComponent(url.pathname);
   const file=resolve(root,'.'+(path==='/'?'/index.html':path));
   if(!file.startsWith(root+sep)){res.writeHead(404);res.end();return}
   try{
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':extname(file)==='.html'?'no-store':'no-cache'});
    res.end(req.method==='HEAD'?undefined:data);
   }catch{res.writeHead(404);res.end()}
  }catch{
   res.writeHead(500,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"error":"Сервис временно недоступен"}');
  }
 });
}
