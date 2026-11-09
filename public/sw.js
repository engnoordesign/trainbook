/* TrainBook service worker.
 * The BUILD constant below is stamped automatically by scripts/stamp.js (Docker build / Cloudflare build command).
 *  - stamped build   -> everything is precached under a versioned cache and served cache-first = instant loads and
 *                       full offline support; a new build shows the in-app "update ready" prompt.
 *  - "dev" (unstamped, e.g. a deploy where the build command did not run)
 *                    -> network first, and every response is saved, so it is always fresh online and still opens offline.
 *
 * Why responses are "cleaned" before they are cached: hosts such as Cloudflare answer /index.html with a redirect to /.
 * A response that went through a redirect (response.redirected) can NOT be used to answer a page navigation - the browser
 * shows an error page instead. Re-wrapping it drops the flag. */
const BUILD = 'dev';
const CACHE = 'trainbook-' + BUILD;
const STAMPED = BUILD !== 'dev';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'favicon.svg',
  'css/app.css',
  'js/icons.js', 'js/i18n.js', 'js/data.js', 'js/qr.js', 'js/vault.js', 'js/store.js', 'js/timer.js', 'js/ui-core.js', 'js/music-data.js', 'js/views.js', 'js/music.js', 'js/sheets.js', 'js/figure.js', 'js/poses.js', 'js/guides.js', 'js/guides-1.js', 'js/guides-2.js', 'js/guides-3.js', 'js/guides-courses.js', 'js/guide.js', 'js/merge.js', 'js/sync.js', 'js/auth.js', 'js/account.js', 'js/app.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'
];

/** A copy of the response that never carries the "redirected" flag. */
function clean(res) {
  if (!res.redirected) return Promise.resolve(res);
  return res.blob().then((body) => new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers }));
}
/** Save a response (pass a clone). Only successful same-origin responses are kept. */
function store(req, res) {
  if (!res.ok || res.type !== 'basic') return Promise.resolve();
  return caches.open(CACHE).then((c) => clean(res).then((r) => c.put(req, r)));
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(ASSETS.map((u) =>
      fetch(new Request(u, { cache: 'reload' })).then((res) => {
        if (!res.ok) throw new Error('precache failed: ' + u + ' (' + res.status + ')');
        return clean(res).then((r) => c.put(u, r));
      })
    )))
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
  if (url.pathname.startsWith('/api/')) return;          // the account service: always live, never cached

  const nav = req.mode === 'navigate';
  /* the saved copy; for a page load the app shell is the fallback (hash routes all share one page) */
  const cached = () => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (nav ? caches.match('./') : undefined));
  const network = () => fetch(req).then((res) => { e.waitUntil(store(req, res.clone())); return res; });

  e.respondWith(STAMPED
    ? cached().then((hit) => hit || network())
    : network().catch(() => cached().then((hit) => hit || Response.error())));
});
