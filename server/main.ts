import {getPool,closeDatabase} from './database';
import {migrate} from './migrate';
import {createApp} from './http';

async function main(){
 await migrate(getPool());
 const server=createApp(process.env.APP_ORIGIN||process.env.RENDER_EXTERNAL_URL);
 server.listen(Number(process.env.PORT||10000),'0.0.0.0',()=>console.log('Dish requests server is ready'));
 let stopping=false;
 const stop=()=>{
  if(stopping)return;stopping=true;
  const timer=setTimeout(()=>process.exit(1),25000);timer.unref();
  server.close(()=>void closeDatabase().then(()=>process.exit(0)));
 };
 process.on('SIGTERM',stop);process.on('SIGINT',stop);
}
main().catch(()=>{console.error('Server startup failed. Check DATABASE_URL and database availability.');process.exit(1)});
