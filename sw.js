const CACHE = 'flota-v2';
const PRECACHE = ['/flota-app/', '/flota-app/index.html', '/flota-app/manifest.json', '/flota-app/icon-192.png', '/flota-app/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('google') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return resp;
    }))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Flota', body: 'Nowe powiadomienie' };
  e.waitUntil(self.registration.showNotification(data.title || 'Flota', {
    body: data.body || '',
    icon: '/flota-app/icon-192.png',
    badge: '/flota-app/icon-192.png',
    vibrate: [200, 100, 200]
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/flota-app/'));
});
