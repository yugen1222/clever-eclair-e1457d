import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {once} from 'node:events';
import {createApp} from '../server/http';
import {useQueryForTests} from '../server/database';
import {defaults} from '../src/model';

test('Render HTTP server shares requests across devices, validates versions and archives sent requests',async()=>{
 const pg=new PGlite();
 await pg.exec(await readFile('migrations/0001_dish_requests.sql','utf8'));
 useQueryForTests(async(sql,values)=>(await pg.query(sql,values)).rows);
 const server=createApp();server.listen(0,'127.0.0.1');await once(server,'listening');
 const address=server.address() as {port:number};const base=`http://127.0.0.1:${address.port}`;
 const call=(path:string,method='GET',value?:unknown,origin=base)=>fetch(base+path,{method,headers:{Origin:origin,'Content-Type':'application/json'},...(value?{body:JSON.stringify(value)}:{})});
 try{
  assert.equal((await call('/health')).status,200);
  assert.equal((await call('/api/session')).status,200);
  const state=await (await call('/api/state')).json();assert.equal(state.orders.length,0);
  const dish=defaults.dishes.find(d=>d.scope==='service')!;
  const request={id:'render-http-request-001',floor:3,zone:'Зона A',items:[{id:dish.id,qty:15}]};
  assert.equal((await call('/api/requests','POST',request)).status,200);
  assert.equal((await call('/api/requests','POST',request)).status,200);
  let data=await (await call('/api/state')).json();assert.equal(data.orders.length,1);assert.equal(data.orders[0].items[0].qty,15);
  assert.equal((await call('/api/requests','POST',{...request,id:'render-floor2-test',floor:2})).status,400);
  assert.equal((await call('/api/config','PUT',defaults,'https://foreign.test')).status,403);
  assert.equal((await call('/api/requests','PATCH',{id:request.id,version:1,status:'assigned'})).status,200);
  assert.equal((await call('/api/requests','PATCH',{id:request.id,version:1,status:'delivered'})).status,409);
  assert.equal((await call('/api/requests','PATCH',{id:request.id,version:2,status:'delivered'})).status,200);
  data=await (await call('/api/state')).json();assert.equal(data.orders[0].status,'delivered');assert.equal(data.orders[0].runner,'');
  assert.equal((await call('/api/config','PUT',{...defaults,warning:4,critical:7})).status,200);
  data=await (await call('/api/state')).json();assert.equal(data.config.warning,4);
  const shop={id:'render-shop-request-001',floor:1,zone:'Магазин',items:[{id:'spoon',qty:5}]};
  assert.equal((await call('/api/requests','POST',shop)).status,400);
  assert.equal((await call('/api/requests','POST',{...shop,items:[{id:'plate-main',qty:5},{id:'plate-dessert',qty:10}]})).status,200);
  data=await (await call('/api/state')).json();
  assert.deepEqual(data.orders.find((o:any)=>o.id===shop.id).items.map((i:any)=>i.id),['plate-main','plate-dessert']);
  assert.equal((await call('/api/missing')).status,404);
 }finally{
  await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  useQueryForTests();await pg.close();
 }
});
