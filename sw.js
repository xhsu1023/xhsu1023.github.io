const CACHE = 'stockpulse-v1';
const CORE = [
  './stock_tracker.html',
  './us_sector_page.html',
  './manifest.json',
  './manifest-us.json',
  './icons/icon-152.png',
  './icons/icon-167.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const c = res.clone();
          caches.open(CACHE).then(ca => ca.put(e.request, c));
          return res;
        })
        .catch(() => caches.match('./stock_tracker.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(
      hit => hit || fetch(e.request).then(res => {
        const c = res.clone();
        caches.open(CACHE).then(ca => ca.put(e.request, c));
        return res;
      })
    )
  );
});