import { db } from './database';
import { defaults,upgradeConfig,type Config } from '../src/model';
export {db};
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store'}})}
export async function config():Promise<Config>{const r=await db().prepare('SELECT value FROM settings WHERE id = ?').bind('config').first<{value:string}>();return r?upgradeConfig(JSON.parse(r.value)):defaults}
export function order(r:any){return {...r,floor:Number(r.floor),urgent:Number(r.urgent),created:Number(r.created),updated:Number(r.updated),version:Number(r.version),items:JSON.parse(r.items),events:JSON.parse(r.events)}}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin}
