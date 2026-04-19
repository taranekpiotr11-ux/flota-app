const CACHE = 'flota-v2';
const BASE = '/flota-app/';
const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(
        PRECACHE.map(url =>
          c.add(url).catch(err => console.warn('[SW] precache miss:', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Google / GAS – zawsze sieć, fallback do cache
  if (url.hostname.includes('google') || url.hostname.includes('googleapis')) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Nawigacja (PWA standalone launch) – sieć, fallback do index.html z cache
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match(BASE + 'index.html').then(r => r || caches.match(BASE)))
