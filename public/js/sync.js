'use strict';
/* Sync: keeps a profile's encrypted data on the account service (/api/*, see src/worker.mjs) so you can sign in from any device.
 *   - the app always works offline; changes are saved locally first and pushed when there is a connection
 *   - what is uploaded is the same encrypted blob stored on the device; the server cannot read it
 *   - two devices changing at once: the server refuses the stale save (409), we merge the two copies (merge.js) and retry */
(() => {
  const X = window.Sync = {};
  const t = (k, v) => I18N.t(k, v);
  class NetError extends Error { }
  X.NetError = NetError;
  const P = () => (window.Auth ? Auth.profile() : null);

  /* ---------- talking to the server ---------- */
  async function api(op, body, ms) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), ms || 15000);
    let r;
    try { r = await fetch('/api/' + op, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store', signal: ctrl && ctrl.signal }); }
    catch (e) { throw new NetError('network'); }
    finally { clearTimeout(timer); }
    let json = null;
    try { json = await r.json(); } catch (e) { /* not JSON: there is no API at this address */ }
    if (!json || typeof json !== 'object') throw new NetError('no-api');
    return { status: r.status, json };
  }
  X.api = api;

  /** Is there an account service at this address, and who may sign up? Cached for half a minute. */
  let infoCache = null;
  X.info = async force => {
    if (infoCache && !force && Date.now() - infoCache.at < 30000) return infoCache;
    let v = { available: false, signup: 'open', at: Date.now() };
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null, timer = setTimeout(() => ctrl && ctrl.abort(), 6000);
    try {
      const r = await fetch('/api/ping', { cache: 'no-store', signal: ctrl && ctrl.signal }), j = await r.json();
      if (j && j.ok === true && j.app === 'trainbook') v = { available: true, signup: j.signup || 'open', at: Date.now() };
    } catch (e) { /* no API here */ }
    clearTimeout(timer);
    infoCache = v; return v;
  };
  X.infoCached = () => infoCache;

  const E = (key, code, vars) => new Auth.UserError(t(key, vars), code);
  function mapError(r) {
    if (r.status === 429) return E('sy.errLocked', 'LOCKED', { n: r.json.retry || 30 });
    if (r.status === 401) return E('au.errWrong', 'WRONG');
    if (r.status === 404) return E('sy.errNoAccount', 'NOACCOUNT');
    if (r.status === 409) return E('sy.errTaken', 'TAKEN');
    if (r.status === 403) return E(r.json.error === 'invite' ? 'sy.errInvite' : 'sy.errClosed', 'DENIED');
    if (r.status === 400) return E('sy.errRejected', 'REJECTED');
    return E('au.errGeneric', 'ERR');
  }
  async function need(op, body) {
    try { return await api(op, body); } catch (e) { throw E('sy.errOffline', 'OFFLINE'); }
  }
  const expect = (r, status) => { if (r.status !== status) throw mapError(r); return r.json; };

  X.signup = async body => expect(await need('signup', body), 201);
  /** Sign in with a username + password: -> { auth, meta, blob, version, mv } */
  X.remoteLogin = async ({ username, password }) => {
    const pre = expect(await need('prelogin', { username }), 200);
    const auth = await Vault.deriveAuth(password, pre.salt, pre.iter);
    const j = expect(await need('login', { username, auth }), 200);
    return Object.assign({ auth }, j);
  };
  X.recoverOpen = async (username, recAuth) => expect(await need('recover-open', { username, recAuth }), 200);
  X.recoverSet = async (username, recAuth, newAuth, meta) => expect(await need('recover', { username, recAuth, newAuth, meta }), 200);
  X.changePassword = async (username, auth, newAuth, meta) => expect(await need('password', { username, auth, newAuth, meta }), 200);
  X.setRecovery = async (username, auth, recAuth, recWrap) => expect(await need('recovery', { username, auth, recAuth, recWrap }), 200);
  X.deleteRemote = async (username, auth) => expect(await need('delete', { username, auth }), 200);

  /* ---------- status ---------- */
  let S = null;                                  // { pid, dk, auth, busy, again, timer, poll, writes, applying }
  X.status = { state: 'off', at: 0 };
  const listeners = [];
  X.onStatus = fn => { listeners.push(fn); };
  function setStatus(state, extra) {
    const p = P();
    X.status = Object.assign({ state, at: (p && p.sync && p.sync.at) || 0 }, extra);
    listeners.forEach(f => { try { f(X.status); } catch (e) { /* ignore */ } });
  }
  X.enabled = () => !!(S && P() && P().sync && P().sync.on);

  /* ---------- the background engine ---------- */
  const onOnline = () => X.now();
  const onVisible = () => { if (!document.hidden) X.now(); };

  /** Start syncing the signed-in profile (does nothing for a device-only profile). */
  X.attach = ({ dk, auth }) => {
    X.stop();
    const p = P();
    if (!p || !p.sync || !p.sync.on) { setStatus('off'); return; }
    S = { pid: p.id, dk, auth, busy: false, again: false, timer: null, poll: null, writes: 0, applying: false };
    S.poll = setInterval(() => { if (!document.hidden) X.now(); }, 60000);
    addEventListener('online', onOnline); document.addEventListener('visibilitychange', onVisible);
    setStatus('syncing');
    X.now();
  };
  X.stop = () => {
    if (!S) return;
    clearInterval(S.poll); clearTimeout(S.timer);
    removeEventListener('online', onOnline); document.removeEventListener('visibilitychange', onVisible);
    S = null; setStatus('off');
  };
  /** Sign-out: try to upload pending changes first (short wait), then stop. */
  X.detach = async () => {
    const me = S, p = P();
    if (me && p && p.sync && p.sync.dirty) { try { await Promise.race([push(me), new Promise(r => setTimeout(r, 3500))]); } catch (e) { /* offline: stays local, syncs next time */ } }
    X.stop();
  };
  /** A short fingerprint of the data, so "saved again but identical" is never mistaken for a change. */
  const hash = s => {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  };
  const markClean = json => { const p = P(); if (p && p.sync) { p.sync.h = hash(json); Auth.persistProfiles(); } };

  /** The profile's data was just written to this device (json = the plain data that was encrypted). */
  X.localWritten = json => {
    const p = P();
    if (!S || !p || !p.sync || !p.sync.on || S.applying) return;
    if (p.sync.h && json && hash(json) === p.sync.h) return;          // identical to what the server already has
    S.writes++; p.sync.dirty = true; Auth.persistProfiles();
    clearTimeout(S.timer); S.timer = setTimeout(() => X.now(), 2000);
  };
  /** After a password change the login secret changes with it. */
  X.setAuth = auth => { if (S) S.auth = auth; };
  X.now = async () => {
    if (!S) return;
    if (S.busy) { S.again = true; return; }
    const me = S; me.busy = true;
    try { do { me.again = false; await cycle(me); } while (S === me && me.again); }
    catch (e) { if (S === me) setStatus('error'); }
    finally { me.busy = false; }
  };

  function applyMeta(meta, mv) {                 // the password / recovery key was changed on another device
    const p = P(); if (!p || !meta) return;
    Object.assign(p, { salt: meta.salt, iter: meta.iter, pwWrap: meta.pwWrap, recWrap: meta.recWrap });
    p.sync.mv = mv; Auth.persistProfiles();
  }
  function authFail(me, r) {
    clearTimeout(me.timer);
    if (r.status === 429) { me.timer = setTimeout(() => X.now(), (r.json.retry || 30) * 1000); setStatus('offline'); return; }
    clearInterval(me.poll); setStatus('auth');
    const p = P();
    if (p && p.sync) { p.sync.stale = true; Auth.persistProfiles(); }   // from now on the next sign-in here is checked with the server, so the OLD password stops working on this device too
    UI.toast(t('sy.passwordChanged'), { ms: 12000 });
  }
  function mismatch() {
    setStatus('error', { why: 'mismatch' });
    UI.toast(t('sy.mismatch'), { ms: 12000 });
  }

  /** Bring the server's copy into this device (merging if this device also has unsent changes). */
  async function applyRemote(me, sealed, version) {
    let remote;
    try { remote = JSON.parse(await Vault.open(me.dk, sealed)); } catch (e) { const err = new Error('mismatch'); err.mismatch = true; throw err; }
    await Store.flush();                       // a change made a moment ago must count as "unsent" before we decide whether to merge
    const p = P(), cur = Store.get();
    me.applying = true;
    try {
      if (p.sync.dirty) Store.replace(Merge.merge(cur, remote));
      else {
        ['lang', 'theme', 'weekStart', 'shareUrl'].forEach(k => { remote[k] = cur[k]; });   // those are per device
        Store.replace(remote);
      }
      Store.ensureDays();
      await Store.flush();
    } finally { me.applying = false; }
    p.sync.v = version;
    if (!p.sync.dirty) markClean(JSON.stringify(Store.get())); else Auth.persistProfiles();
    if (window.App) { App.refreshTheme(); App.render(); }
  }

  async function cycle(me) {
    const p = P(); if (!p || S !== me) return;
    setStatus('syncing');
    let r;
    try { r = await api('pull', { username: p.username, auth: me.auth, version: p.sync.v, mv: p.sync.mv }); }
    catch (e) { setStatus('offline'); return; }
    if (S !== me) return;
    if (r.status === 401 || r.status === 429) return authFail(me, r);
    if (r.status !== 200) { setStatus('error'); return; }
    if (r.json.changed) {
      if (r.json.meta) applyMeta(r.json.meta, r.json.mv);
      try { await applyRemote(me, r.json.blob, r.json.version); } catch (e) { if (e.mismatch) return mismatch(); throw e; }
    }
    if (S !== me) return;
    if (p.sync.dirty) { if (!(await push(me))) return; }
    if (S === me && !p.sync.dirty) { p.sync.at = Date.now(); markClean(JSON.stringify(Store.get())); setStatus('synced'); }
  }

  /** Upload this device's data. A refused (stale) save is merged with the server copy and tried again. */
  async function push(me) {
    for (let i = 0; i < 4; i++) {
      const p = P(); if (!p || S !== me) return false;
      const writes = me.writes, json = JSON.stringify(Store.get()), sealed = await Vault.seal(me.dk, json);
      let r;
      try { r = await api('push', { username: p.username, auth: me.auth, version: p.sync.v, blob: sealed }); }
      catch (e) { if (S === me) setStatus('offline'); return false; }
      if (S !== me) return false;
      if (r.status === 200) {
        p.sync.v = r.json.version;
        if (me.writes === writes) { p.sync.dirty = false; markClean(json); }   // nothing changed while the request was in flight
        else Auth.persistProfiles();
        return true;                                               // (a write during the request already scheduled the next push)
      }
      if (r.status === 409) {                                      // another device saved first: merge and retry
        if (r.json.meta) applyMeta(r.json.meta, r.json.mv);
        try { await applyRemote(me, r.json.blob, r.json.version); } catch (e) { if (e.mismatch) { mismatch(); return false; } throw e; }
        continue;
      }
      if (r.status === 401 || r.status === 429) { authFail(me, r); return false; }
      setStatus('error'); return false;
    }
    setStatus('error'); return false;
  }
})();
