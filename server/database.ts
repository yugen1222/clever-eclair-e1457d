// This adapter lets both hosting variants use the same validated request handlers.
// Each mutation remains one parameterized PostgreSQL statement.
import pg from 'pg';
export type Query = (sql:string,values:unknown[])=>Promise<any[]>;
export function postgresSQL(sql:string){let n=0;const ignore=/^INSERT OR IGNORE/i.test(sql);let out=sql.replace(/^INSERT OR IGNORE/i,'INSERT').replace(/\?/g,()=>'$'+(++n));if(ignore)out+=' ON CONFLICT (id) DO NOTHING';if(/^(INSERT|UPDATE|DELETE)\b/i.test(out))out+=' RETURNING id';return out}
export class Prepared {
 constructor(private statement:string,private query:Query,private values:unknown[]=[]){}
 bind(...values:unknown[]){return new Prepared(this.statement,this.query,values)}
 async first<T=any>():Promise<T|null>{return (await this.query(postgresSQL(this.statement),this.values))[0]||null}
 async all(){return {results:await this.query(postgresSQL(this.statement),this.values)}}
 async run(){const rows=await this.query(postgresSQL(this.statement),this.values);return {meta:{changes:rows.length}}}
}
let pool:pg.Pool|undefined;
let queryOverride:Query|undefined;
export function getPool(){
 if(!pool){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
  pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000,idleTimeoutMillis:30000});
  pool.on('error',()=>console.error('Database connection was interrupted'));
 }
 return pool;
}
export function useQueryForTests(query?:Query){queryOverride=query}
export function db(){const query:Query=async(sql,values)=>queryOverride?queryOverride(sql,values):(await getPool().query(sql,values)).rows;return {prepare:(sql:string)=>new Prepared(sql,query)}}
export async function closeDatabase(){if(pool){await pool.end();pool=undefined}}
