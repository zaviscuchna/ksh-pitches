const CACHE = 'hotel-dyje-v2';
const ASSETS = [
  '/hd-9k2xm7.html',
  '/ubytovani-4p8nq.html',
  '/menu-3w9jr.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/pocketbase@0.22.0/dist/pocketbase.umd.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // PocketBase API vždy z netu (live data)
  if (e.request.url.includes('pb.hoteldyje.cz')) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
