/* Account service logic. Runs inside a Durable Object (one object per username) on Cloudflare, but it is plain
 * functions over a tiny storage interface, so scripts/server-test.js can test it in Node.
 *
 * What the server stores per account (nothing here can decrypt anything):
 *   - hAuth / hRec: SHA-256 of the login secrets the browser derives from the password / recovery key
 *   - meta:         salt, iterations and the two wrapped data keys (useless without the password or recovery key)
 *   - blob:         the user's data, encrypted in the browser (AES-256-GCM)
 *   - version:      counter used to detect two devices saving at the same time
 * The password, the recovery key and the data key never leave the browser. */

const USER_RE = /^[\p{L}\p{N}][\p{L}\p{N}._-]{2,31}$/u;
const SECRET_RE = /^[A-Za-z0-9_-]{43}$/;        // 32 random-looking bytes, base64url
const SALT_RE = /^[A-Za-z0-9+/=]{16,64}$/;
const SEALED_RE = /^v1\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/;
export const MAX_BLOB = 900000;                  // characters of sealed data per account
const MAX_WRAP = 600;

export const normUser = (s) => String(s == null ? '' : s).normalize('NFKC').trim();
export const keyOf = (s) => normUser(s).toLowerCase();
export const validUser = (s) => USER_RE.test(normUser(s));

const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function sha256(text) { return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text))); }
const hashSecret = async (salt, secret) => b64url(await sha256(salt + ':' + secret));
function same(a, b) {                            // constant-time string compare
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const res = (status, json) => ({ status, json });
const bad = (why) => res(400, { error: 'bad_request', why });

const okMeta = (m, needRec) => !!m && typeof m === 'object' && SALT_RE.test(m.salt) && Number.isInteger(m.iter) && m.iter >= 100000 && m.iter <= 5000000 &&
  typeof m.pwWrap === 'string' && SEALED_RE.test(m.pwWrap) && m.pwWrap.length <= MAX_WRAP &&
  (!needRec || (typeof m.recWrap === 'string' && SEALED_RE.test(m.recWrap) && m.recWrap.length <= MAX_WRAP));
const okBlob = (b) => typeof b === 'string' && b.length <= MAX_BLOB && SEALED_RE.test(b);

/** Wrong-secret throttle: after 5 misses in a row the lock doubles up to a minute. */
async function check(rec, kind, secret, st, now) {
  if (!rec) return res(401, { error: 'bad_credentials' });
  const f = rec.fails || { n: 0, until: 0 };
  if (f.until > now) return res(429, { error: 'locked', retry: Math.ceil((f.until - now) / 1000) });
  const stored = kind === 'rec' ? rec.hRec : rec.hAuth;
  const given = typeof secret === 'string' && SECRET_RE.test(secret) ? await hashSecret(rec.hsalt, secret) : '';
  if (same(stored, given)) {
    if (f.n) { rec.fails = { n: 0, until: 0 }; await st.put('a', rec); }
    return null;
  }
  f.n++; if (f.n >= 5) f.until = now + Math.min(60, Math.pow(2, f.n - 4)) * 1000;
  rec.fails = f; await st.put('a', rec);
  return res(f.until > now ? 429 : 401, f.until > now ? { error: 'locked', retry: Math.ceil((f.until - now) / 1000) } : { error: 'bad_credentials' });
}

const randomSalt = () => b64url(crypto.getRandomValues(new Uint8Array(16)));

/**
 * One request. op: prelogin | signup | login | pull | push | password | recover-open | recover | recovery | delete
 * st: { get(key), put(key, value), wipe() }   env: { SIGNUP_MODE, INVITE_CODE }
 */
export async function handle(op, body, st, env, now = Date.now()) {
  env = env || {};
  body = body && typeof body === 'object' ? body : {};
  const rec = (await st.get('a')) || null;

  switch (op) {
    case 'prelogin':
      return rec ? res(200, { salt: rec.meta.salt, iter: rec.meta.iter }) : res(404, { error: 'no_account' });

    case 'signup': {
      if (rec) return res(409, { error: 'taken' });
      const mode = env.SIGNUP_MODE || 'open';
      if (mode === 'closed') return res(403, { error: 'closed' });
      if (mode === 'invite' && !same(String(body.invite || ''), String(env.INVITE_CODE || '\u0000'))) return res(403, { error: 'invite' });
      if (!validUser(body.username)) return bad('username');
      if (!SECRET_RE.test(body.auth) || !SECRET_RE.test(body.recAuth)) return bad('secrets');
      if (!okMeta(body.meta, true)) return bad('meta');
      if (!okBlob(body.blob)) return bad('blob');
      const hsalt = randomSalt();
      await st.put('a', {
        v: 1, user: keyOf(body.username), hsalt, hAuth: await hashSecret(hsalt, body.auth), hRec: await hashSecret(hsalt, body.recAuth),
        meta: { salt: body.meta.salt, iter: body.meta.iter, pwWrap: body.meta.pwWrap, recWrap: body.meta.recWrap },
        mv: 1, blob: body.blob, version: 1, created: now, updated: now, fails: { n: 0, until: 0 }
      });
      return res(201, { version: 1, mv: 1 });
    }

    case 'login': {
      const e = await check(rec, 'auth', body.auth, st, now); if (e) return e;
      return res(200, { meta: rec.meta, blob: rec.blob, version: rec.version, mv: rec.mv });
    }

    case 'pull': {
      const e = await check(rec, 'auth', body.auth, st, now); if (e) return e;
      if (body.version === rec.version && body.mv === rec.mv) return res(200, { changed: false, version: rec.version, mv: rec.mv });
      return res(200, { changed: true, blob: rec.blob, version: rec.version, meta: rec.meta, mv: rec.mv });
    }

    case 'push': {
      const e = await check(rec, 'auth', body.auth, st, now); if (e) return e;
      if (!okBlob(body.blob)) return bad('blob');
      if (body.version !== rec.version) return res(409, { error: 'conflict', blob: rec.blob, version: rec.version, meta: rec.meta, mv: rec.mv });
      rec.blob = body.blob; rec.version++; rec.updated = now;
      await st.put('a', rec);
      return res(200, { version: rec.version, mv: rec.mv });
    }

    case 'password': {                              // change password (proved with the current one)
      const e = await check(rec, 'auth', body.auth, st, now); if (e) return e;
      if (!SECRET_RE.test(body.newAuth) || !okMeta(body.meta, false)) return bad('password');
      return setPassword(rec, body, st);
    }

    case 'recover-open': {                          // forgot password: the recovery key proves who you are
      const e = await check(rec, 'rec', body.recAuth, st, now); if (e) return e;
      return res(200, { meta: rec.meta, blob: rec.blob, version: rec.version, mv: rec.mv });
    }

    case 'recover': {
      const e = await check(rec, 'rec', body.recAuth, st, now); if (e) return e;
      if (!SECRET_RE.test(body.newAuth) || !okMeta(body.meta, false)) return bad('password');
      return setPassword(rec, body, st);
    }

    case 'recovery': {                              // replace the recovery key (proved with the password)
      const e = await check(rec, 'auth', body.auth, st, now); if (e) return e;
      if (!SECRET_RE.test(body.recAuth) || typeof body.recWrap !== 'string' || !SEALED_RE.test(body.recWrap) || body.recWrap.length > MAX_WRAP) return bad('recovery');
      rec.hRec = await hashSecret(rec.hsalt, body.recAuth); rec.meta.recWrap = body.recWrap; rec.mv++;
      await st.put('a', rec);
      return res(200, { mv: rec.mv });
    }

    case 'delete': {
      const e = await check(rec, 'auth', body.auth, st, now); if (e) return e;
      await st.wipe();
      return res(200, { deleted: true });
    }

    default:
      return res(404, { error: 'unknown_op' });
  }
}

/** New password (after proving the old one, or the recovery key). The recovery key and its wrap are untouched. */
async function setPassword(rec, body, st) {
  rec.hAuth = await hashSecret(rec.hsalt, body.newAuth);
  rec.meta = { salt: body.meta.salt, iter: body.meta.iter, pwWrap: body.meta.pwWrap, recWrap: rec.meta.recWrap };
  rec.mv++; rec.fails = { n: 0, until: 0 };
  await st.put('a', rec);
  return res(200, { mv: rec.mv, version: rec.version });
}
