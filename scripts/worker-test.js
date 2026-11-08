#!/usr/bin/env node
/* Tests the Worker's routing layer (src/worker.mjs) with a stand-in for Cloudflare's Durable Object runtime:
 *   node scripts/worker-test.js
 * The "cloudflare:workers" import is swapped for a tiny base class in a temp copy; everything else is the real file. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { pathToFileURL } = require('url');

let passed = 0, failed = 0;
const ok = (cond, label) => { if (cond) passed++; else { failed++; console.error('  ✗ ' + label); } };
const secret = () => crypto.randomBytes(32).toString('base64url');
const sealed = (t) => 'v1.' + Buffer.from('iv' + t).toString('base64') + '.' + Buffer.from('ct' + t).toString('base64');
const meta = () => ({ salt: crypto.randomBytes(16).toString('base64'), iter: 600000, pwWrap: sealed('p'), recWrap: sealed('r') });

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-worker-'));
  const logic = pathToFileURL(path.join(__dirname, '..', 'src', 'account-logic.mjs')).href;
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'worker.mjs'), 'utf8')
    .replace("import { DurableObject } from 'cloudflare:workers';", 'class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }')
    .replace("from './account-logic.mjs'", "from '" + logic + "'");
  if (!src.includes('class DurableObject') || !src.includes(logic)) throw new Error('could not prepare the Worker for testing');
  const file = path.join(dir, 'worker.mjs'); fs.writeFileSync(file, src);
  const mod = await import(pathToFileURL(file).href);
  const worker = mod.default, Account = mod.Account;

  const objects = new Map(), created = [];
  const env = {
    SIGNUP_MODE: 'open',
    ASSETS: { fetch: async (req) => new Response('ASSET ' + new URL(req.url).pathname) },
    ACCOUNT: {
      idFromName: (n) => { created.push(n); return n; },
      get: (id) => ({
        fetch: (url, init) => {
          let o = objects.get(id);
          if (!o) {
            /* like the real thing: reads return COPIES (structured clone), and blockConcurrencyWhile runs one callback at a time */
            const store = new Map(); let chain = Promise.resolve();
            const copy = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
            o = new Account({
              storage: { get: async (k) => copy(store.get(k)), put: async (k, v) => { store.set(k, copy(v)); }, deleteAll: async () => store.clear() },
              blockConcurrencyWhile: (fn) => { const p = chain.then(fn); chain = p.catch(() => { }); return p; }
            }, env);
            objects.set(id, o);
          }
          return o.fetch(new Request(url, init));
        }
      })
    }
  };
  const call = (p, init) => worker.fetch(new Request('https://trainbook.example' + p, init), env);
  const post = (op, body, headers) => call('/api/' + op, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: Object.assign({ 'Content-Type': 'application/json' }, headers) });

  console.log('Worker routing tests');
  let r = await call('/api/ping'); let j = await r.json();
  ok(r.status === 200 && j.ok === true && j.signup === 'open', 'GET /api/ping reports the service and the signup mode');
  ok(r.headers.get('cache-control') === 'no-store' && /json/.test(r.headers.get('content-type')), 'API responses are never cached and are JSON');
  r = await call('/index.html'); ok((await r.text()) === 'ASSET /index.html', 'anything outside /api/ is served from the static assets');
  r = await call('/api/login'); ok(r.status === 405, 'GET on an operation: 405');
  r = await post('nope', { username: 'noor' }); ok(r.status === 404, 'unknown operation: 404');
  r = await post('login', 'this is not json'); ok(r.status === 400, 'invalid JSON: 400');
  r = await post('login', { username: 'a!' }); ok(r.status === 400, 'invalid username never reaches the account store');
  r = await post('login', [1, 2, 3]); ok(r.status === 400, 'a JSON array is not a request');
  r = await post('login', { username: 'noor', auth: secret() }, { Origin: 'https://evil.example' }); ok(r.status === 403, 'a request from another website is refused');
  r = await post('login', { username: 'noor', auth: secret() }, { Origin: 'https://trainbook.example' }); ok(r.status !== 403, 'a request from the app itself is allowed');
  r = await post('push', { username: 'noor', blob: 'x'.repeat(1000000) }); ok(r.status === 413, 'an oversize body is refused (413)');

  /* a full round trip through the Worker */
  const A = secret(), R = secret(), M = meta(), blob = sealed('hello');
  r = await post('signup', { username: 'Noor', auth: A, recAuth: R, meta: M, blob }); ok(r.status === 201, 'signup through the Worker');
  r = await post('signup', { username: 'NOOR', auth: A, recAuth: R, meta: M, blob }); ok(r.status === 409, 'the same name in another case is the same account');
  ok(created.filter((n) => n === 'noor').length >= 2 && !created.includes('Noor'), 'usernames map to one object per lower-cased name');
  r = await post('prelogin', { username: 'noor' }); j = await r.json(); ok(r.status === 200 && j.salt === M.salt, 'prelogin through the Worker');
  r = await post('login', { username: ' noor ', auth: A }); j = await r.json(); ok(r.status === 200 && j.blob === blob, 'login with surrounding spaces still finds the account');
  r = await post('push', { username: 'noor', auth: A, version: 1, blob: sealed('v2') }); j = await r.json(); ok(r.status === 200 && j.version === 2, 'push through the Worker');
  r = await post('push', { username: 'noor', auth: A, version: 1, blob: sealed('v3') }); j = await r.json(); ok(r.status === 409 && j.blob === sealed('v2'), 'a stale push comes back as a conflict carrying the server copy');

  /* lock-out sets Retry-After */
  for (let i = 0; i < 5; i++) r = await post('login', { username: 'noor', auth: secret() });
  ok(r.status === 429 && Number(r.headers.get('retry-after')) >= 1, 'repeated wrong secrets: 429 with a Retry-After header');

  /* simultaneous pushes from two devices: exactly one wins (the other gets a conflict) */
  const B = secret(); await post('signup', { username: 'race', auth: B, recAuth: secret(), meta: meta(), blob: sealed('base') });
  const results = await Promise.all([1, 2, 3, 4, 5].map((i) => post('push', { username: 'race', auth: B, version: 1, blob: sealed('dev' + i) }).then((x) => x.status)));
  ok(results.filter((s) => s === 200).length === 1 && results.filter((s) => s === 409).length === 4, 'five simultaneous pushes of the same version: one wins, four conflict (' + results.join(',') + ')');

  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`  passed ${passed}, failed ${failed}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
