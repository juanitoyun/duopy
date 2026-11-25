'use strict';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.cache==='only-if-cached'&&req.mode!=='same-origin')return;
 if(new URL(req.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{
  const fresh=req.mode==='navigate'||['script','style','worker'].includes(req.destination);const res=await fetch(req,fresh?{cache:'no-cache'}:undefined);if(res.type==='opaque'||res.status===0)return res;
  const h=new Headers(res.headers);h.set('Cross-Origin-Opener-Policy','same-origin');h.set('Cross-Origin-Embedder-Policy','require-corp');h.set('Cross-Origin-Resource-Policy','same-origin');
  return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h});
 })());
});
