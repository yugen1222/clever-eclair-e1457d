import {GET} from './state';
import {POST,PATCH} from './requests';
import {PUT} from './config';
import {json,sameOrigin} from './shared';

export default async function handler(req:Request){
 if(!sameOrigin(req))return json({error:'Недопустимый запрос'},403);
 const path=new URL(req.url).pathname;
 if(path==='/api/session'&&req.method==='GET')return json({authenticated:true,authRequired:false});
 if(path==='/api/state'&&req.method==='GET')return GET();
 if(path==='/api/requests'&&req.method==='POST')return POST(req);
 if(path==='/api/requests'&&req.method==='PATCH')return PATCH(req);
 if(path==='/api/config'&&req.method==='PUT')return PUT(req);
 return json({error:'Маршрут недоступен'},404);
}
