import {GET} from '../../server/state';
import {POST,PATCH} from '../../server/requests';
import {PUT} from '../../server/config';
import {json,sameOrigin} from '../../server/shared';

// Open kiosk access: no login, password, device code, or session cookie.
export default async function handler(req:Request){
 if(!sameOrigin(req))return json({error:'Недопустимый запрос'},403);
 const path=new URL(req.url).pathname;
 // Compatibility for devices with the previous frontend still cached.
 if(path==='/api/session'&&req.method==='GET')return json({authenticated:true,authRequired:false});
 if(path==='/api/state'&&req.method==='GET')return GET();
 if(path==='/api/requests'&&req.method==='POST')return POST(req);
 if(path==='/api/requests'&&req.method==='PATCH')return PATCH(req);
 if(path==='/api/config'&&req.method==='PUT')return PUT(req);
 return json({error:'Маршрут недоступен'},404);
}
export const config={path:'/api/:endpoint'};
