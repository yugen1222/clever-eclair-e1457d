import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {Prepared} from '../server/database';
import handler from '../netlify/functions/api.mts';
import {defaults,zoneDishes,upgradeConfig} from '../src/model';

test('Catalogue uses separate service and bar sets, and upgrades old settings',()=>{
 assert.equal(defaults.dishes.length,20);assert.equal(zoneDishes(defaults,'Бар').length,10);assert.equal(zoneDishes(defaults,'Зона A').length,10);
 assert.ok(zoneDishes(defaults,'Бар').some(d=>d.name==='Чашки для эспрессо'));
 assert.ok(!zoneDishes(defaults,'Магазин').some(d=>d.name==='Чашки для эспрессо'));
 const c=upgradeConfig({...defaults,catalogVersion:undefined,runners:['Тест'],critical:9});
 assert.deepEqual(c.runners,['Тест']);assert.equal(c.critical,9);assert.equal(c.catalogVersion,2);
});
test('Open device access works with no configured code and no cookies',async()=>{
 delete process.env.SITE_ACCESS_CODE;
 const r=await handler(new Request('https://example.test/api/session'));
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{authenticated:true,authRequired:false});
 const cross=await handler(new Request('https://example.test/api/config',{method:'PUT',headers:{Origin:'https://other.test','Content-Type':'application/json'},body:'{}'}));
 assert.equal(cross.status,403);
 const unknown=await handler(new Request('https://example.test/api/unknown'));assert.equal(unknown.status,404);
});
test('Postgres adapter preserves idempotency, shared state and optimistic locking',async()=>{
 const pg=new PGlite();try{
 await pg.exec(await readFile('netlify/database/migrations/0001_dish_requests.sql','utf8'));
 const prepare=(sql:string)=>new Prepared(sql,async(q,v)=>(await pg.query(q,v)).rows);
 const insert=prepare('INSERT OR IGNORE INTO requests (id,floor,zone,items,status,runner,urgent,comment,created,updated,version,events) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
 const values=['test-request',1,'Магазин','[]','new','',0,'',Date.now(),Date.now(),1,'[]'];
 assert.equal((await insert.bind(...values).run()).meta.changes,1);
 assert.equal((await insert.bind(...values).run()).meta.changes,0);
 const update=prepare('UPDATE requests SET status=?,runner=?,updated=?,version=version+1,events=? WHERE id=? AND version=?');
 assert.equal((await update.bind('assigned','Раннер 1',Date.now(),'[]','test-request',1).run()).meta.changes,1);
 assert.equal((await update.bind('cancelled','',Date.now(),'[]','test-request',1).run()).meta.changes,0);
 const rows=await prepare('SELECT * FROM requests WHERE id = ?').bind('test-request').all();
 assert.equal(rows.results.length,1);assert.equal(rows.results[0].status,'assigned');assert.equal(rows.results[0].version,2);
 await prepare('INSERT INTO settings (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind('config',JSON.stringify(defaults)).run();
 const saved=await prepare('SELECT value FROM settings WHERE id = ?').bind('config').first<{value:string}>();
 assert.equal(JSON.parse(saved!.value).dishes.length,20);
 }finally{await pg.close()}
});
