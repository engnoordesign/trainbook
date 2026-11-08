#!/usr/bin/env node
/* Tests for the account service logic (src/account-logic.mjs) with an in-memory store:  node scripts/server-test.js */
const path = require('path');
const { pathToFileURL } = require('url');

let passed = 0, failed = 0;
const ok = (cond, label) => { if (cond) passed++; else { failed++; console.error('  ✗ ' + label); } };

const b64url = (n) => Buffer.from(require('crypto').randomBytes(n)).toString('base64url');
const secret = () => b64url(32);                                     // 43 chars, like the browser's derived login secrets
const sealed = (tag) => 'v1.' + Buffer.from('iv-' + tag).toString('base64') + '.' + Buffer.from('ct-' + tag).toString('base64');
const meta = () => ({ salt: Buffer.from(require('crypto').randomBytes(16)).toString('base64'), iter: 600000, pwWrap: sealed('pw' + Math.random()), recWrap: sealed('rec' + Math.random()) });

function store() {                                                    // what a Durable Object's storage looks like to the logic
  const m = new Map();
  return { get: async (k) => (m.has(k) ? JSON.parse(JSON.stringify(m.get(k))) : undefined), put: async (k, v) => { m.set(k, JSON.parse(JSON.stringify(v))); }, wipe: async () => m.clear(), dump: () => JSON.stringify([...m]) };
}

(async () => {
  const L = await import(pathToFileURL(path.join(__dirname, '..', 'src', 'account-logic.mjs')).href);
  const { handle, keyOf, validUser, MAX_BLOB } = L;
  console.log('Account service tests');

  /* usernames */
  ok(keyOf('Noor') === keyOf(' noor ') && keyOf('ＮＯＯＲ') === 'noor', 'usernames are case-, space- and width-insensitive');
  ok(validUser('noor') && validUser('نور_2026') && !validUser('a!') && !validUser('ab') && !validUser('x'.repeat(33)) && !validUser('-bad'), 'username rules');

  /* signup */
  const st = store(), A = secret(), R = secret(), M = meta(), blob1 = sealed('data1');
  let r = await handle('signup', { username: 'noor', auth: A, recAuth: R, meta: M, blob: blob1 }, st, {});
  ok(r.status === 201 && r.json.version === 1, 'signup creates the account (version 1)');
  r = await handle('signup', { username: 'noor', auth: A, recAuth: R, meta: M, blob: blob1 }, st, {});
  ok(r.status === 409 && r.json.error === 'taken', 'a second signup with the same name is refused');
  const raw = st.dump();
  ok(!raw.includes(A) && !raw.includes(R), 'the server never stores the login secrets themselves (only salted hashes)');
  ok(!raw.includes('hunter2'), 'no password anywhere');

  /* validation */
  const fresh = () => ({ username: 'sara', auth: secret(), recAuth: secret(), meta: meta(), blob: sealed('s') });
  for (const [label, mut] of [
    ['bad username', (b) => { b.username = 'a!'; }], ['short secret', (b) => { b.auth = 'abc'; }], ['non-base64url secret', (b) => { b.recAuth = '!'.repeat(43); }],
    ['weak iterations', (b) => { b.meta.iter = 1000; }], ['missing recovery wrap', (b) => { delete b.meta.recWrap; }], ['blob not sealed', (b) => { b.blob = 'plaintext {"a":1}'; }],
    ['blob too large', (b) => { b.blob = 'v1.AAAA.' + 'A'.repeat(MAX_BLOB); }], ['wrong types', (b) => { b.meta = 'x'; }]
  ]) { const b = fresh(); mut(b); const x = await handle('signup', b, store(), {}); ok(x.status === 400, 'signup rejects: ' + label + ' (got ' + x.status + ')'); }

  /* signup modes */
  let x = await handle('signup', fresh(), store(), { SIGNUP_MODE: 'closed' }); ok(x.status === 403 && x.json.error === 'closed', 'closed mode refuses new accounts');
  x = await handle('signup', fresh(), store(), { SIGNUP_MODE: 'invite', INVITE_CODE: 'sesame' }); ok(x.status === 403 && x.json.error === 'invite', 'invite mode: no code refused');
  x = await handle('signup', Object.assign(fresh(), { invite: 'wrong' }), store(), { SIGNUP_MODE: 'invite', INVITE_CODE: 'sesame' }); ok(x.status === 403, 'invite mode: wrong code refused');
  x = await handle('signup', Object.assign(fresh(), { invite: 'sesame' }), store(), { SIGNUP_MODE: 'invite', INVITE_CODE: 'sesame' }); ok(x.status === 201, 'invite mode: right code accepted');
  x = await handle('signup', Object.assign(fresh(), { invite: '' }), store(), { SIGNUP_MODE: 'invite' }); ok(x.status === 403, 'invite mode with no INVITE_CODE configured never lets anyone in');

  /* prelogin + login */
  r = await handle('prelogin', { username: 'noor' }, st, {}); ok(r.status === 200 && r.json.salt === M.salt && r.json.iter === 600000, 'prelogin returns salt + iterations');
  r = await handle('prelogin', { username: 'ghost' }, store(), {}); ok(r.status === 404, 'prelogin for an unknown user: 404');
  r = await handle('login', { username: 'noor', auth: A }, st, {}); ok(r.status === 200 && r.json.blob === blob1 && r.json.meta.pwWrap === M.pwWrap && r.json.version === 1, 'login with the right secret returns the encrypted data + wraps');
  r = await handle('login', { username: 'noor', auth: secret() }, st, {}); ok(r.status === 401 && r.json.error === 'bad_credentials' && !r.json.blob, 'wrong secret: 401 and no data');
  r = await handle('login', { username: 'noor', auth: R }, st, {}); ok(r.status === 401, 'the recovery secret cannot be used as a password');
  r = await handle('login', { username: 'noor', auth: 'short' }, st, {}); ok(r.status === 401, 'malformed secret: 401');
  const unknown = await handle('login', { username: 'ghost', auth: A }, store(), {}); ok(unknown.status === 401 && unknown.json.error === 'bad_credentials', 'unknown user looks the same as a wrong password at login');

  /* throttle */
  const ts = store(); await handle('signup', Object.assign(fresh(), { username: 'tina', auth: A, recAuth: R, meta: M, blob: blob1 }), ts, {});
  const t0 = 1_000_000;
  for (let i = 0; i < 4; i++) { r = await handle('login', { username: 'tina', auth: secret() }, ts, {}, t0 + i); ok(r.status === 401, 'miss ' + (i + 1) + ' is a plain 401'); }
  r = await handle('login', { username: 'tina', auth: secret() }, ts, {}, t0 + 5); ok(r.status === 429 && r.json.retry >= 1, '5th miss locks the account (429 + retry)');
  r = await handle('login', { username: 'tina', auth: A }, ts, {}, t0 + 100); ok(r.status === 429, 'even the right secret waits while locked');
  r = await handle('login', { username: 'tina', auth: A }, ts, {}, t0 + 5 + 5000); ok(r.status === 200, 'after the wait the right secret works again');
  r = await handle('login', { username: 'tina', auth: secret() }, ts, {}, t0 + 6000); ok(r.status === 401, 'and the miss counter was reset by the success');

  /* pull + push (versions, conflicts) */
  r = await handle('pull', { username: 'noor', auth: A, version: 1, mv: 1 }, st, {}); ok(r.status === 200 && r.json.changed === false, 'pull: nothing new');
  r = await handle('pull', { username: 'noor', auth: secret(), version: 1, mv: 1 }, st, {}); ok(r.status === 401, 'pull needs the secret');
  const blob2 = sealed('data2');
  r = await handle('push', { username: 'noor', auth: A, version: 1, blob: blob2 }, st, {}); ok(r.status === 200 && r.json.version === 2, 'push with the current version succeeds (version 2)');
  r = await handle('push', { username: 'noor', auth: A, version: 1, blob: sealed('stale') }, st, {});
  ok(r.status === 409 && r.json.error === 'conflict' && r.json.blob === blob2 && r.json.version === 2, 'push with a stale version is a conflict that returns the server copy to merge');
  r = await handle('pull', { username: 'noor', auth: A, version: 1, mv: 1 }, st, {}); ok(r.json.changed === true && r.json.blob === blob2 && r.json.version === 2, 'pull from an older version returns the new data');
  r = await handle('push', { username: 'noor', auth: secret(), version: 2, blob: sealed('x') }, st, {}); ok(r.status === 401, 'push needs the secret');
  r = await handle('push', { username: 'noor', auth: A, version: 2, blob: 'not sealed' }, st, {}); ok(r.status === 400, 'push rejects data that is not an encrypted blob');
  r = await handle('push', { username: 'noor', auth: A, version: 2, blob: 'v1.AAAA.' + 'A'.repeat(MAX_BLOB) }, st, {}); ok(r.status === 400, 'push rejects oversize data');

  /* change password */
  const A2 = secret(), M2 = Object.assign(meta(), {}); delete M2.recWrap;
  r = await handle('password', { username: 'noor', auth: secret(), newAuth: A2, meta: M2 }, st, {}); ok(r.status === 401, 'changing the password needs the current one');
  r = await handle('password', { username: 'noor', auth: A, newAuth: 'bad', meta: M2 }, st, {}); ok(r.status === 400, 'changing the password validates the new secret');
  r = await handle('password', { username: 'noor', auth: A, newAuth: A2, meta: M2 }, st, {}); ok(r.status === 200 && r.json.mv === 2, 'password change succeeds (meta version 2)');
  r = await handle('login', { username: 'noor', auth: A }, st, {}); ok(r.status === 401, 'the old password stops working');
  r = await handle('login', { username: 'noor', auth: A2 }, st, {}); ok(r.status === 200 && r.json.meta.pwWrap === M2.pwWrap && r.json.meta.recWrap === M.recWrap && r.json.blob === blob2, 'the new password works; data and recovery wrap are intact');
  r = await handle('pull', { username: 'noor', auth: A2, version: 2, mv: 1 }, st, {}); ok(r.json.changed === true && r.json.meta.pwWrap === M2.pwWrap, 'another device learns about the new password on its next pull');

  /* forgot password (recovery key) */
  r = await handle('recover-open', { username: 'noor', recAuth: secret() }, st, {}); ok(r.status === 401, 'recovery with a wrong key: 401');
  r = await handle('recover-open', { username: 'noor', recAuth: A2 }, st, {}); ok(r.status === 401, 'the password is not a recovery key');
  r = await handle('recover-open', { username: 'noor', recAuth: R }, st, {}); ok(r.status === 200 && r.json.meta.recWrap === M.recWrap && r.json.blob === blob2, 'recovery key opens the account (returns wraps + data)');
  const A3 = secret(), M3 = meta(); delete M3.recWrap;
  r = await handle('recover', { username: 'noor', recAuth: R, newAuth: A3, meta: M3 }, st, {}); ok(r.status === 200, 'recovery sets a new password');
  r = await handle('login', { username: 'noor', auth: A2 }, st, {}); ok(r.status === 401, 'the password forgotten/replaced no longer works');
  r = await handle('login', { username: 'noor', auth: A3 }, st, {}); ok(r.status === 200 && r.json.blob === blob2, 'the new password works and the data is untouched');
  r = await handle('recover-open', { username: 'noor', recAuth: R }, st, {}); ok(r.status === 200, 'the recovery key still works after a recovery');

  /* new recovery key */
  const R2 = secret(), recWrap2 = sealed('newrec');
  r = await handle('recovery', { username: 'noor', auth: secret(), recAuth: R2, recWrap: recWrap2 }, st, {}); ok(r.status === 401, 'a new recovery key needs the password');
  r = await handle('recovery', { username: 'noor', auth: A3, recAuth: R2, recWrap: recWrap2 }, st, {}); ok(r.status === 200, 'new recovery key accepted');
  r = await handle('recover-open', { username: 'noor', recAuth: R }, st, {}); ok(r.status === 401, 'the OLD recovery key is dead');
  r = await handle('recover-open', { username: 'noor', recAuth: R2 }, st, {}); ok(r.status === 200 && r.json.meta.recWrap === recWrap2, 'the NEW recovery key works');

  /* delete */
  r = await handle('delete', { username: 'noor', auth: A }, st, {}); ok(r.status === 401, 'delete needs the current password');
  r = await handle('login', { username: 'noor', auth: A3 }, st, {}); ok(r.status === 200, '...and the failed delete left the data alone');
  r = await handle('delete', { username: 'noor', auth: A3 }, st, {}); ok(r.status === 200, 'delete with the password succeeds');
  r = await handle('login', { username: 'noor', auth: A3 }, st, {}); ok(r.status === 401, 'deleted: login fails');
  r = await handle('prelogin', { username: 'noor' }, st, {}); ok(r.status === 404, 'deleted: the account is gone');
  const againBlob = sealed('again');
  r = await handle('signup', { username: 'noor', auth: secret(), recAuth: secret(), meta: meta(), blob: againBlob }, st, {}); ok(r.status === 201, 'deleted: the username is free again');
  ok(st.dump().includes(againBlob) && !st.dump().includes(blob2) && !st.dump().includes(recWrap2), 'deleted: none of the old data survives, only the new account');

  r = await handle('nonsense', { username: 'noor' }, st, {}); ok(r.status === 404, 'unknown operation: 404');
  r = await handle('login', null, st, {}); ok(r.status === 401, 'empty body does not crash');

  console.log(`  passed ${passed}, failed ${failed}`);
  process.exit(failed ? 1 : 0);
})();
