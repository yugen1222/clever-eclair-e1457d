import {GET} from '../../server/state';
import {POST,PATCH} from '../../server/requests';
import {PUT} from '../../server/config';
import {json,sameOrigin} from '../../server/shared';
import {accessCode,validCode,createToken,authorized,COOKIE} from '../../server/auth';
export default async function handler(req:Request){
 const code=accessCode();
 if(code.length<6)return json({error:'Задайте SITE_ACCESS_CODE (от 6 символов) в настройках Netlify и выполните повторный deploy.'},503);
 if(!sameOrigin(req))return json({error:'Недопустимый запрос'},403);
 const path=new URL(req.url).pathname;
 if(path==='/api/session'){
  if(req.method==='GET')return json({authenticated:authorized(req,code)},authorized(req,code)?200:401);
  if(req.method==='POST'){
   let input:any;try{input=await req.json()}catch{return json({error:'Некорректный запрос'},400)}
   if(typeof input?.code!=='string'||input.code.length>200||!validCode(input.code.trim(),code))return json({error:'Неверный код устройства'},401);
   const secure=new URL(req.url).protocol==='https:'?'; Secure':'';
   return Response.json({authenticated:true},{headers:{'Cache-Control':'no-store','Set-Cookie':COOKIE+'='+createToken(code)+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800'+secure}});
  }
 }
 if(!authorized(req,code))return json({error:'Войдите с кодом устройства'},401);
 if(path==='/api/state'&&req.method==='GET')return GET();
 if(path==='/api/requests'&&req.method==='POST')return POST(req);
 if(path==='/api/requests'&&req.method==='PATCH')return PATCH(req);
 if(path==='/api/config'&&req.method==='PUT')return PUT(req);
 return json({error:'Маршрут недоступен'},404);
}
export const config={path:'/api/:endpoint'};
