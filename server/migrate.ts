import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import type {Pool,PoolClient} from 'pg';

export async function migrate(pool:Pick<Pool,'connect'>){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  // Serializes old and new processes during a rolling deployment.
  await client.query('SELECT pg_advisory_xact_lock(718293641)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  for(const file of (await readdir('migrations')).filter(f=>f.endsWith('.sql')).sort()){
   const existing=await client.query('SELECT id FROM schema_migrations WHERE id=$1',[file]);
   if(existing.rows.length)continue;
   await client.query(await readFile(join('migrations',file),'utf8'));
   await client.query('INSERT INTO schema_migrations (id) VALUES ($1)',[file]);
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error}
 finally{client.release()}
}
