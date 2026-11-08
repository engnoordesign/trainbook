#!/usr/bin/env node
/* Tests the service worker logic (public/sw.js) against a mocked Cache Storage + network.
 *   node scripts/sw-test.js [path/to/sw.js]
 * The mock host behaves like Cloudflare (Workers assets / Pages): a request for /index.html is answered with a
 * redirect to /. The mock browser enforces the real rule: a page navigation can NOT be answered with a response
 * that went through a redirect (response.redirected === true) - the browser shows an error page instead. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const file = process.argv[2] || path.join(__dirname, '..', 'public', 'sw.js');
const source = fs.readFileSync(file, 'utf8');
let failed = 0, passed = 0;
const ok = (cond, label) => { if (cond) passed++; else { failed++; console.error('    ✗ ' + label); } };

class Resp {
  constructor(body, init) { init = init || {}; this.body = body; this.status = init.status == null ? 200 : init.status; this.statusText = init.statusText || ''; this.headers = init.headers || {}; this.redirected = !!init.redirected; this.type = init.type || 'basic'; this.ok = this.status >= 200 && this.status < 300; }
  clone() { return new Resp(this.body, { status: this.status, statusText: this.statusText, headers: this.headers, redirected: this.redirected, type: this.type }); }
  blob() { return Promise.resolve(this.body); }
  static error() { const r = new Resp('', { status: 0, type: 'error' }); r.ok = false; return r; }
}
class Req {
  constructor(u, init) { init = init || {}; this.url = new URL(typeof u === 'string' ? u : u.url, 'https://trainbook.example/').href; this.mode = init.mode || 'cors'; this.method = init.method || 'GET'; }
}
const pn = (r) => new URL(typeof r === 'string' ? r : r.url, 'https://trainbook.example/').pathname;

function runWorker(build) {
  const caches = {}, handlers = {}, state = { offline: false, net: 0, skipped: false, claimed: false };
  const open = async (n) => (caches[n] = caches[n] || new Map());
  const sandbox = {
    console, URL, Promise, Request: Req, Response: Resp,
    fetch: async (r) => {
      state.net++;
      if (state.offline) throw new TypeError('Failed to fetch');
      const p = pn(r);
      if (typeof r !== 'string' && r.mode === 'navigate' && p === '/index.html') return new Resp('', { status: 0, type: 'opaqueredirect' });   // browser follows it itself
      if (p === '/index.html') return new Resp('<html>app</html>', { redirected: true });                                                       // Cloudflare: /index.html -> / (followed)
      if (p === '/missing') return new Resp('nope', { status: 404 });
      return new Resp('net:' + p + ':' + build);
    },
    caches: {
      open: async (n) => {
        const m = await open(n);
        return {
          put: async (k, v) => { m.set(pn(k), v); },
          /* the real Cache.add(): fetch, require an OK status, store the response exactly as received (redirect flag included) */
          add: async (k) => { const res = await sandbox.fetch(k); if (!res.ok) throw new TypeError('add failed ' + res.status); m.set(pn(k), res); },
          keys: async () => [...m.keys()]
        };
      },
      keys: async () => Object.keys(caches),
      delete: async (n) => delete caches[n],
      match: async (r) => { for (const n of Object.keys(caches)) { const k = pn(r === './' ? '/' : r); if (caches[n].has(k)) return caches[n].get(k); } return undefined; }
    },
    self: { location: { origin: 'https://trainbook.example' }, addEventListener: (t, f) => { handlers[t] = f; }, skipWaiting: () => { state.skipped = true; }, clients: { claim: async () => { state.claimed = true; } } }
  };
  sandbox.self.self = sandbox.self;
  vm.createContext(sandbox);
  vm.runInContext(source.replace(/^const BUILD = '[^']*'/m, "const BUILD = '" + build + "'").replace(/^const /gm, 'var '), sandbox, { filename: 'sw.js' });
  const fire = async (type, ev) => { let p; handlers[type](Object.assign({ waitUntil: (x) => { p = Promise.all([p, x]); }, respondWith: (x) => { p = Promise.resolve(x); } }, ev)); return p && (await p); };
  return {
    state, caches, handlers,
    install: () => fire('install', {}), activate: () => fire('activate', {}),
    ASSETS: vm.runInContext('ASSETS', sandbox),
    /* what the browser would show: the response, or an error page */
    navigate: async (u) => {
      const req = new Req(u, { mode: 'navigate' }); let res;
      try { res = await fire('fetch', { request: req }); } catch (e) { return { error: String(e.message || e) }; }
      if (!res || res.type === 'error' || res.status === 0 && res.type !== 'opaqueredirect') return { error: 'network error' };
      if (res.redirected) return { error: 'a redirected response was used for a navigation' };                                      // the browser's rule
      return { res };
    },
    request: async (u, init) => { try { return { res: await fire('fetch', { request: new Req(u, init) }) }; } catch (e) { return { error: String(e.message) }; } },
    pending: async () => { await new Promise((r) => setTimeout(r, 20)); },
    handled: (req) => { let h = false; handlers.fetch({ request: req, respondWith: () => { h = true; }, waitUntil: () => { } }); return h; }
  };
}

(async () => {
  console.log('Service worker tests: ' + path.relative(process.cwd(), file));

  /* ---------- stamped build: precache + cache-first ---------- */
  console.log('  stamped build (production)');
  let w = runWorker('v1');
  await w.install();
  const cacheName = Object.keys(w.caches)[0];
  ok(cacheName === 'trainbook-v1' && w.caches[cacheName].size === w.ASSETS.length, 'install precaches every asset (' + w.ASSETS.length + ')');
  ok([...w.caches[cacheName].values()].every((r) => !r.redirected), 'no cached response carries the "redirected" flag (host redirects /index.html)');
  await w.activate();
  w.state.offline = true;
  let n = await w.navigate('/');
  ok(!n.error, 'OFFLINE: opening the app (/) works' + (n.error ? ' -> ' + n.error : ''));
  n = await w.navigate('/index.html');
  ok(!n.error, 'OFFLINE: opening /index.html works' + (n.error ? ' -> ' + n.error : ''));
  n = await w.navigate('/?utm=x');
  ok(!n.error, 'OFFLINE: opening / with a query string works' + (n.error ? ' -> ' + n.error : ''));
  let a = await w.request('/js/app.js?v=1');
  ok(a.res && a.res.body.startsWith('net:/js/app.js'), 'OFFLINE: scripts come from the cache');
  w.state.offline = false; w.state.net = 0;
  n = await w.navigate('/');
  ok(!n.error && w.state.net === 0, 'ONLINE: the app loads from the cache with no network (instant)' + (n.error ? ' -> ' + n.error : ''));
  a = await w.request('/icons/new.png'); await w.pending();
  ok(a.res && w.caches[cacheName].has('/icons/new.png'), 'a file that was not precached is cached after first use');
  await w.request('/missing'); await w.pending();
  ok(!w.caches[cacheName].has('/missing'), 'error responses (404) are never cached');
  ok(!w.handled(new Req('https://example.com/x.js')), 'cross-origin requests are left alone');
  ok(!w.handled(new Req('/api/ping')), 'the account service (/api/*) is never intercepted or cached');
  ok(!w.handled(new Req('/x', { method: 'POST' })), 'non-GET requests are left alone');
  w.state.offline = true;
  a = await w.request('/never-seen.png');
  ok(!!a.error || (a.res && a.res.type === 'error'), 'OFFLINE + never cached = an error (not a crash)');

  /* old versions are removed on activate */
  w = runWorker('v2'); w.caches['trainbook-v1'] = new Map([['/x', 'old']]);
  await w.install(); await w.activate();
  ok(!w.caches['trainbook-v1'] && w.state.claimed, 'a new version deletes the old cache and claims clients');
  w.handlers.message({ data: 'SKIP_WAITING' });
  ok(w.state.skipped, 'the "Update" button (SKIP_WAITING) activates the waiting worker');

  /* ---------- unstamped build: network-first, cache kept fresh ---------- */
  console.log('  unstamped build (a deploy where the build command did not run)');
  w = runWorker('dev');
  await w.install(); await w.activate();
  const dev = Object.keys(w.caches)[0];
  ok([...w.caches[dev].values()].every((r) => !r.redirected), 'cached responses are clean here too');
  n = await w.navigate('/'); ok(!n.error && n.res.body.startsWith('net:'), 'ONLINE: pages come from the network (always fresh)' + (n.error ? ' -> ' + n.error : ''));
  await w.pending();
  ok(w.caches[dev].get('/').body.includes('net:/:dev'), 'ONLINE: the cached copy is refreshed from the network (offline copy never goes stale)');
  w.state.offline = true;
  n = await w.navigate('/'); ok(!n.error, 'OFFLINE: the app still opens from the cache' + (n.error ? ' -> ' + n.error : ''));
  n = await w.navigate('/index.html'); ok(!n.error, 'OFFLINE: /index.html opens too' + (n.error ? ' -> ' + n.error : ''));
  a = await w.request('/css/app.css'); ok(a.res && a.res.body.startsWith('net:/css/app.css'), 'OFFLINE: styles come from the cache');

  console.log(`  passed ${passed}, failed ${failed}`);
  process.exit(failed ? 1 : 0);
})();
