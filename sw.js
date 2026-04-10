const CACHE = 'flota-v1';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

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
  // Don't cache Google Apps Script requests
  if (url.hostname.includes('google') || url.hostname.includes('googleapis')) {
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

// Push notifications support
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Flota', body: 'Nowe powiadomienie' };
  e.waitUntil(self.registration.showNotification(data.title || 'Flota', {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
// Dodaj NA SAMYM POCZĄTKU sw.js (przed obecnym kodem):
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSy...",              // ← te same wartości co w index.html
  authDomain: "flota-app-492109.firebaseapp.com",
  projectId: "flota-app-492109",
  messagingSenderId: "126238696647",
  appId: "1:126238696647:web:..."
});

const messagingFCM = firebase.messaging();

// Powiadomienia gdy aplikacja jest W TLE (to obsługuje Firebase automatycznie)
messagingFCM.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  });
});

// ↓ RESZTA Twojego obecnego kodu sw.js zostaje bez zmian ↓
