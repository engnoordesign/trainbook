/* TrainBook on Cloudflare: static files + the account/sync API in one Worker.
 *   /api/*  -> this Worker (wrangler.jsonc: assets.run_worker_first), routed to one Durable Object per username
 *   others  -> served straight from the static assets (never reach this code)
 * The Durable Object (SQLite-backed, free plan) keeps each account's encrypted data; see account-logic.mjs. */
import { DurableObject } from 'cloudflare:workers';
import { handle, keyOf, validUser, MAX_BLOB } from './account-logic.mjs';

const OPS = new Set(['prelogin', 'signup', 'login', 'pull', 'push', 'password', 'recover-open', 'recover', 'recovery', 'delete']);
const MAX_BODY = MAX_BLOB + 20000;
const HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (status, data, extra) => new Response(JSON.stringify(data), { status, headers: Object.assign({}, HEADERS, extra) });

export class Account extends DurableObject {
  async fetch(request) {
    const op = new URL(request.url).pathname.slice(1);
    let body;
    try { body = await request.json(); } catch (e) { return json(400, { error: 'bad_request' }); }
    const storage = this.ctx.storage;
    const st = { get: (k) => storage.get(k), put: (k, v) => storage.put(k, v), wipe: () => storage.deleteAll() };
    // one request at a time per account, so "check version, then save" can never interleave with another device
    const out = await this.ctx.blockConcurrencyWhile(() => handle(op, body, st, this.env));
    return json(out.status, out.json, out.json && out.json.retry ? { 'Retry-After': String(out.json.retry) } : undefined);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });

    const op = url.pathname.slice(5).replace(/\/+$/, '');
    if (op === 'ping' && request.method === 'GET') return json(200, { ok: true, app: 'trainbook', signup: env.SIGNUP_MODE || 'open' });
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' });
    if (!OPS.has(op)) return json(404, { error: 'unknown_op' });
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return json(403, { error: 'forbidden' });

    if ((Number(request.headers.get('Content-Length')) || 0) > MAX_BODY) return json(413, { error: 'too_large' });
    const text = await request.text();
    if (text.length > MAX_BODY) return json(413, { error: 'too_large' });
    let body;
    try { body = JSON.parse(text); } catch (e) { return json(400, { error: 'bad_request' }); }
    if (!body || typeof body !== 'object' || !validUser(body.username)) return json(400, { error: 'bad_request', why: 'username' });

    const stub = env.ACCOUNT.get(env.ACCOUNT.idFromName(keyOf(body.username)));
    return stub.fetch('https://account/' + op, { method: 'POST', body: text });
  }
};
