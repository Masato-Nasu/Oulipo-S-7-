
/* service-worker v1.1.3-pwa2 */
const CACHE = 'dict-shift-cache-v1.1.3-pwa2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    try {
      const net = await fetch(event.request);
      if (new URL(event.request.url).origin === location.origin) {
        cache.put(event.request, net.clone());
      }
      return net;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
