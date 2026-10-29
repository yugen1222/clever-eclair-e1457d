import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './app.css';
function Gate(){const[checked,setChecked]=useState(false),[allowed,setAllowed]=useState(false),[code,setCode]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[serverReady,setServerReady]=useState(true);
async function check(){try{const r=await fetch('/api/session',{cache:'no-store'});const b=await r.json();setAllowed(r.ok&&b.authenticated);setServerReady(r.status!==503);if(r.status!==401&&!r.ok)setError(b.error||'Сервер недоступен')}catch{setError('Не удалось подключиться. Обновите страницу.');setServerReady(false)}finally{setChecked(true)}}
useEffect(()=>{check()},[]);
if(allowed)return <App/>;
return <div className="device-login"><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});const b=await r.json();if(!r.ok)throw new Error(b.error);setAllowed(true);setCode('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}><div className="eyebrow">SAFIA · СЕРГЕЛИ</div><h1>{checked?'Подключить моноблок':'Подключаемся…'}</h1><p>Введите общий код устройства, заданный для этого сайта.</p>{error&&<div className="error-banner" role="alert">{error}</div>}{serverReady&&checked&&<><label className="field-label">Код устройства<input autoFocus type="password" autoComplete="off" minLength={6} maxLength={200} required value={code} onChange={e=>setCode(e.target.value)}/></label><button className="primary wide" disabled={busy}>{busy?'Подключаем…':'Войти'}</button><small>Код нужно ввести отдельно на каждом моноблоке. Вход сохраняется на 7 дней.</small></>}</form></div>}
createRoot(document.getElementById('root')!).render(<Gate/>);
