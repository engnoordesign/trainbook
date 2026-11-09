#!/usr/bin/env node
/* Local server:  node scripts/serve.js   (PORT=5173 by default)
 * Serves public/ and also the account/sync API at /api/* with the SAME logic the Cloudflare Worker uses
 * (src/account-logic.mjs). Accounts are kept in .data/accounts.json (git-ignored), so you can try
 * "sign in from any device" on your own network without deploying.
 *   SIGNUP_MODE=open|invite|closed   INVITE_CODE=secret   DATA_FILE=path   HOST=0.0.0.0 (let other devices connect) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', 'public');
const PORT = +process.env.PORT || 5173;
const HOST = process.env.HOST || '127.0.0.1';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', '.data', 'accounts.json');
const ENV = { SIGNUP_MODE: process.env.SIGNUP_MODE || 'open', INVITE_CODE: process.env.INVITE_CODE || '' };
const OPS = new Set(['prelogin', 'signup', 'login', 'pull', 'push', 'password', 'recover-open', 'recover', 'recovery', 'delete']);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8'
};

/* ---------- accounts on disk ---------- */
let accounts = {};
try { accounts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { accounts = {}; }
let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true }); fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(accounts)); fs.renameSync(DATA_FILE + '.tmp', DATA_FILE); } catch (e) { console.error('could not save accounts:', e.message); }
  }, 150);
}
const chains = new Map();                                              // one request at a time per account (like a Durable Object)
const serial = (key, fn) => { const p = (chains.get(key) || Promise.resolve()).then(fn); chains.set(key, p.catch(() => { })); return p; };

let logic;
const ready = import(pathToFileURL(path.join(__dirname, '..', 'src', 'account-logic.mjs')).href).then((m) => { logic = m; });

const send = (res, status, data, extra) => {
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }, extra));
  res.end(JSON.stringify(data));
};

async function api(req, res, url) {
  await ready;
  const op = url.pathname.slice(5).replace(/\/+$/, '');
  if (op === 'ping' && req.method === 'GET') return send(res, 200, { ok: true, app: 'trainbook', signup: ENV.SIGNUP_MODE });
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' }, { Allow: 'POST' });
  if (!OPS.has(op)) return send(res, 404, { error: 'unknown_op' });
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return send(res, 403, { error: 'forbidden' });

  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > logic.MAX_BLOB + 20000) return send(res, 413, { error: 'too_large' }); chunks.push(c); }
  let body; try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) { return send(res, 400, { error: 'bad_request' }); }
  if (!body || typeof body !== 'object' || !logic.validUser(body.username)) return send(res, 400, { error: 'bad_request', why: 'username' });

  const key = logic.keyOf(body.username);
  const out = await serial(key, () => logic.handle(op, body, {
    get: async (k) => (k === 'a' && accounts[key] ? JSON.parse(JSON.stringify(accounts[key])) : undefined),
    put: async (k, v) => { if (k === 'a') { accounts[key] = JSON.parse(JSON.stringify(v)); persist(); } },
    wipe: async () => { delete accounts[key]; persist(); }
  }, ENV));
  send(res, out.status, out.json, out.json && out.json.retry ? { 'Retry-After': String(out.json.retry) } : undefined);
}

http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, 'http://x'); } catch (e) { res.writeHead(400).end('bad request'); return; }
  if (url.pathname.startsWith('/api/')) { api(req, res, url).catch((e) => { console.error(e); if (!res.headersSent) send(res, 500, { error: 'server_error' }); }); return; }

  if (url.pathname === '/_gallery') {                // developer aid: every exercise picture on one page (this local server only)
    fs.readFile(path.join(__dirname, 'figure-gallery.html'), (err, buf) => { res.writeHead(err ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).end(err ? 'not found' : buf); });
    return;
  }
  let p;
  try { p = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400).end('bad request'); return; }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}).listen(PORT, HOST, () => console.log('TrainBook running at http://' + (HOST === '0.0.0.0' ? 'localhost' : HOST) + ':' + PORT + '  (accounts: ' + path.relative(process.cwd(), DATA_FILE) + ', signup: ' + ENV.SIGNUP_MODE + ')'));
