
const CACHE = 'oulipo-cache-v2.4.1-embedded-inline-noworker';
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./script.js','./manifest.json'])));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE&&caches.delete(k)))));
});
self.addEventListener('fetch', ()=>{});
