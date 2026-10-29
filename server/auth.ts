import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
export const COOKIE='safia_device';
export function accessCode(){return process.env.SITE_ACCESS_CODE?.trim()||''}
function sign(value:string,code:string){return createHmac('sha256',code).update(value).digest('hex')}
export function validCode(input:string,code:string){return timingSafeEqual(createHash('sha256').update(input).digest(),createHash('sha256').update(code).digest())}
export function createToken(code:string,now=Date.now()){const expiry=String(now+7*24*60*60*1000);return expiry+'.'+sign(expiry,code)}
export function validateToken(token:string,code:string,now=Date.now()){const [expiry,signature]=token.split('.');if(!/^\d{13}$/.test(expiry||'')||!Number.isFinite(Number(expiry))||Number(expiry)<=now||! /^[a-f0-9]{64}$/.test(signature||''))return false;return timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(sign(expiry,code),'hex'))}
export function authorized(req:Request,code:string){const cookie=req.headers.get('cookie')||'';const value=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';return validateToken(value,code)}
