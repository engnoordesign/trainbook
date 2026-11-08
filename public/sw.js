/* TrainBook service worker.
 * The BUILD constant below is stamped automatically by scripts/stamp.js (Docker build / Cloudflare build command).
 *  - "dev" (unstamped)  -> network first (nice while developing)
 *  - any other value    -> everything is precached under a versioned cache = full offline support,
 *                          and a new build shows the in-app "update ready" prompt.
 */
const BUILD = 'dev';
const CACHE = 'trainbook-' + BUILD;
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'favicon.svg',
  'css/app.css',
  'js/icons.js', 'js/i18n.js', 'js/data.js', 'js/store.js', 'js/timer.js', 'js/ui-core.js', 'js/views.js', 'js/sheets.js', 'js/app.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(ASSETS.map((u) => c.add(new Request(u, { cache: 'reload' })))))
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('trainbook-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (BUILD === 'dev') {
    e.respondWith(fetch(req).catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      });
    })
  );
});
