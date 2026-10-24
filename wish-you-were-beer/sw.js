const CACHE = 'wywb-v5';
const SHELL = ['./', './index.html', './app.css', './app.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png',
  './fonts/inter-latin-400.woff2', './fonts/inter-latin-600.woff2', './fonts/inter-latin-ext-400.woff2', './fonts/inter-latin-ext-600.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first: the app has no network calls, so the shell is all it needs offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
