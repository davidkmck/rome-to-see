const CACHE_NAME = 'rome-2-c-v7';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './landmarks.js',
  './manifest.json',
  './icon.png'
];

// Install: Cache all assets
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force new Service Worker to activate immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: Delete old caches & take control immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
