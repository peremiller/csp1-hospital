const CONFIG = {"app":"csp1-hospital","version":"20261111hospform0000","assets":["about.html","assets/css/bootstrap-grid.css","assets/css/bootstrap-grid.min.css","assets/css/bootstrap-reboot.css","assets/css/bootstrap-reboot.min.css","assets/css/bootstrap.css","assets/css/bootstrap.min.css","assets/css/site.css","assets/css/style.css","assets/img/IndexBaby.mp4","assets/img/apple-touch-icon.png","assets/img/cross.ico","assets/img/favicon-16.png","assets/img/favicon-32.png","assets/img/favicon.svg","assets/img/feat1.jpg","assets/img/feat2.jpg","assets/img/feat3.jpg","assets/img/headerimage.jpg","assets/img/homecar1.jpg","assets/img/homecar2.jpeg","assets/img/homecar2.jpg","assets/img/homecar2.jpg.jpg","assets/img/homecar3.jpeg","assets/img/homecar3.jpg","assets/img/homecar4.jpg","assets/img/homecar5.jpeg","assets/img/homecar5.jpg","assets/img/homecar6.jpg","assets/img/icon.ico","assets/img/landing.jpeg","assets/img/logo.ico","assets/img/logo.jpg","assets/img/logo.png","assets/js/MyNameIsClass.js","assets/js/Namespace.js","assets/js/Namespace.min.js","assets/js/SayHiClass.js","assets/js/asp.jquery.js","assets/js/bootstrap.bundle.js","assets/js/bootstrap.bundle.min.js","assets/js/bootstrap.js","assets/js/bootstrap.min.js","assets/js/classes.js","assets/js/sandbox.js","assets/js/site.js","assets/js/util.js","assets/js/util.pack.js","assets/js/util2.js","assets/js/util2.pack.js","contact.html","gallery.html","home.html","index.html","manifest.webmanifest","offline-client.js","offline-vendor/00633b031b7bb8d71597.ttf","offline-vendor/1c362fdb15e3810b6858.ttf","offline-vendor/1e6087c3a14b13b4ae47.ttf","offline-vendor/6f49e1b28bce7339f484.ttf","offline-vendor/72025d9b68a7dd0b68eb.ttf","offline-vendor/79347ed53aa14e8b77ee.ttf","offline-vendor/87e867b52640b3b397a9.ttf","offline-vendor/8bb5d7badc0189c17647.ttf","offline-vendor/959364b06f81af7e1c72.ttf","offline-vendor/a699af1dea30b799318e.ttf","offline-vendor/d87b4b88f78d982c6ca2.css","offline-vendor/db7c5771335b7af9ea09.ttf","offline-vendor/e45972c7e9f24dc39084.ttf","offline-vendor/licenses/fraunces-OFL.txt","offline-vendor/licenses/inter-OFL.txt","offline-vendor/sources.json"],"pages":["about.html","contact.html","gallery.html","home.html","index.html"],"spa":false};
const BASE = new URL('./', self.location.href);
const PREFIX = 'pages-offline-' + CONFIG.app + '-';
const CACHE = PREFIX + CONFIG.version;
const files = new Map(CONFIG.assets.map(asset => {const url=new URL(asset,BASE);return [url.pathname,url.href];}));
const pages = new Map(CONFIG.pages.map(page => {
  const url=new URL(page,BASE);return [url.pathname,url.href];
}));
pages.set(BASE.pathname, new URL('index.html',BASE).href);
for (const page of CONFIG.pages) if(page.endsWith('/index.html')) pages.set(new URL(page.slice(0,-10),BASE).pathname,new URL(page,BASE).href);
async function complete(cache) {
  const keys = new Set((await cache.keys()).map(request => request.url));
  const saved = [...files.values()].filter(url => keys.has(url)).length;
  return {ready:saved===files.size,saved,total:files.size,version:CONFIG.version};
}
async function saveAll() {
  const cache=await caches.open(CACHE);
  for(let start=0;start<CONFIG.assets.length;start+=8) {
    await Promise.all(CONFIG.assets.slice(start,start+8).map(async asset => {
      const url=new URL(asset,BASE).href;
      if(await cache.match(url))return;
      const response=await fetch(new Request(url,{cache:'reload',credentials:'omit',redirect:'error'}));
      if(!response.ok||response.redirected||response.type==='opaque'||/private|no-store/i.test(response.headers.get('cache-control')||''))throw new Error('Public file unavailable: '+asset);
      const type=response.headers.get('content-type')||'';
      if(!asset.endsWith('.html')&&type.includes('text/html'))throw new Error('Unexpected document: '+asset);
      await cache.put(url,response);
    }));
  }
  if(!(await complete(cache)).ready)throw new Error('Incomplete app bundle');
}
self.addEventListener('install',event=>event.waitUntil((async()=>{await saveAll();await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const older=(await caches.keys()).filter(name=>name.startsWith(PREFIX)&&name!==CACHE);
  for(const name of older.slice(0,-1))await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname)||request.headers.has('authorization'))return;
  const ranged=request.headers.has('range');
  if(ranged&&!/\.(mp4|webm|mp3|wav|ogg|m4a|pdf)$/i.test(url.pathname))return;
  const relative=url.pathname.slice(BASE.pathname.length);
  if(/^(api|auth|login|logout|account\/api|uploads)(\/|$)/.test(relative))return;
  let asset=files.get(url.pathname);
  if(request.mode==='navigate')asset=pages.get(url.pathname)||(CONFIG.spa&&!/\.[a-z0-9]+$/i.test(relative)?new URL('index.html',BASE).href:null);
  if(!asset)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE),saved=await cache.match(asset);
    if(saved&&ranged){
      const bytes=await saved.arrayBuffer(),size=bytes.byteLength;
      const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range'));
      let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):size-1;
      if(match&&!match[1]&&match[2]){start=Math.max(0,size-Number(match[2]));end=size-1;}
      if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
      end=Math.min(end,size-1);
      const headers=new Headers(saved.headers);headers.delete('Content-Encoding');headers.delete('Transfer-Encoding');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
      return new Response(bytes.slice(start,end+1),{status:206,headers});
    }
    if(saved)return saved;
    try{return await fetch(request);}catch{return new Response('This file is not available offline yet. Reconnect to finish automatic saving.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING'){self.skipWaiting();return;}
  if(!event.ports?.[0]||!['OFFLINE_STATUS','PREPARE_OFFLINE'].includes(event.data?.type))return;
  event.waitUntil((async()=>{
    try{if(event.data.type==='PREPARE_OFFLINE')await saveAll();event.ports[0].postMessage(await complete(await caches.open(CACHE)));}
    catch(error){event.ports[0].postMessage({ready:false,error:error.message});}
  })());
});
