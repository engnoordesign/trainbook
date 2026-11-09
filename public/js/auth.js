'use strict';
/* Profiles + lock screen.
   Several people can share one device, each behind their own username and password. A profile's data is encrypted
   in the browser with a key that only its password (or its recovery key) can open, so a locked profile is just
   ciphertext, even in the browser's developer tools. Keys live in memory (and this tab's sessionStorage) only while a
   profile is unlocked.

   Accounts are global when the site has an account service (the Cloudflare Worker, or `node scripts/serve.js`): the
   encrypted data is also kept on the server, so you can sign in from any device with your username and password
   ("Sign in from another device"). The server never sees the password, the keys or the data in the clear - see vault.js.
   Without a server (plain static hosting) profiles simply stay on the device. */
(() => {
  const X = window.Auth = {};
  const K = { PROFILES: 'trainbook.profiles.v1', DATA: 'trainbook.data.', REMEMBER: 'trainbook.rem.', SESSION: 'trainbook.session', DEV: 'trainbook.dev' };
  const PALETTE = ['#4361ee', '#0ca678', '#f76707', '#d6336c', '#7048e8', '#1098ad', '#e8590c', '#2f9e44'];
  const USER_RE = /^[\p{L}\p{N}][\p{L}\p{N}._-]{2,31}$/u;
  const AUTOLOCK = [0, 5, 15, 30, 60];
  const t = (k, v) => I18N.t(k, v), esc = s => UI.esc(s), ic = (n, s, c) => UI.ic(n, s, c);
  const $ = s => document.querySelector(s);
  class UserError extends Error { constructor(msg, code) { super(msg); this.code = code; } }
  X.UserError = UserError;

  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, del: k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } } };
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const idOk = s => typeof s === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(s);
  const uid = () => 'p' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const normUser = s => String(s || '').normalize('NFKC').trim();
  const at = u => '<bdi dir="ltr">@' + esc(u) + '</bdi>';
  const needPassword = pw => { if (String(pw || '').length < 8) throw new UserError(t('au.errPassLen')); };
  const nat = v => { v = Math.round(+v); return isFinite(v) && v > 0 ? v : 0; };

  /* cur = the open profile, dk = its data key, sec = its login secret for the account service (both only in memory) */
  let profiles = [], last = null, cur = null, dk = null, sec = null, prefs = {};

  /* ---------- device preferences (language / theme before anyone signs in) ---------- */
  function readDev() {
    let d = null;
    try { d = JSON.parse(ls.get(K.DEV) || 'null'); } catch (e) { d = null; }
    if (!d) { try { const o = JSON.parse(ls.get('trainbook.v1') || 'null') || {}; d = { lang: o.lang, theme: o.theme }; } catch (e) { d = {}; } }
    return d || {};
  }
  X.deviceLang = () => { const l = readDev().lang; return l === 'ar' || l === 'en' ? l : I18N.detect(); };
  X.deviceTheme = () => { const th = readDev().theme; return th === 'light' || th === 'dark' ? th : 'auto'; };
  X.setDevice = o => { const d = Object.assign({}, readDev(), o); try { localStorage.setItem(K.DEV, JSON.stringify({ lang: d.lang, theme: d.theme })); } catch (e) { /* ignore */ } };

  /* ---------- profile list ---------- */
  const cleanProfile = p => {
    if (!p || !idOk(p.id) || typeof p.username !== 'string' || typeof p.salt !== 'string' || typeof p.pwWrap !== 'string' || typeof p.recWrap !== 'string') return null;
    const it = Math.round(+p.iter);
    return {
      id: p.id, username: p.username.slice(0, 32), name: String(p.name || p.username).slice(0, 40),
      color: /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : PALETTE[0], salt: p.salt.slice(0, 64),
      iter: isFinite(it) ? Math.max(100000, Math.min(5000000, it)) : 600000, pwWrap: p.pwWrap, recWrap: p.recWrap,
      createdAt: +p.createdAt || 0, autoLock: AUTOLOCK.indexOf(+p.autoLock) >= 0 ? +p.autoLock : 15, remember: !!p.remember,
      sync: p.sync && p.sync.on ? { on: true, v: nat(p.sync.v), mv: nat(p.sync.mv), dirty: !!p.sync.dirty, at: +p.sync.at || 0, h: /^[a-z0-9]{1,16}$/.test(p.sync.h) ? p.sync.h : '', stale: !!p.sync.stale } : null
    };
  };
  const loadList = () => {
    try { const j = JSON.parse(ls.get(K.PROFILES) || '{}'); profiles = (Array.isArray(j.list) ? j.list : []).map(cleanProfile).filter(Boolean); last = idOk(j.last) ? j.last : null; }
    catch (e) { profiles = []; last = null; }
  };
  const saveList = () => {
    try { localStorage.setItem(K.PROFILES, JSON.stringify({ v: 1, list: profiles, last })); } catch (e) { if (Store.onStorageError) Store.onStorageError(e); }
  };
  const byId = id => profiles.find(p => p.id === id);
  X.list = () => profiles.slice();
  X.profile = () => cur;
  X.persistProfiles = saveList;
  X.isSynced = p => !!((p || cur) && (p || cur).sync && (p || cur).sync.on);
  X.at = at;

  /* ---------- unlocked session ---------- */
  const writeSession = () => ss.set(K.SESSION, JSON.stringify({ pid: cur.id, dk: Vault.b64(dk), auth: sec }));
  const readSession = () => { try { return JSON.parse(ss.get(K.SESSION)); } catch (e) { return null; } };
  const saverFor = (p, key) => async json => {
    const sealed = await Vault.seal(key, json);
    localStorage.setItem(K.DATA + p.id, sealed);
    Sync.localWritten(json);
  };

  async function enter(p, key, secret, opts = {}) {
    const sealed = ls.get(K.DATA + p.id);
    let state = null;
    if (sealed) { try { state = JSON.parse(await Vault.open(key, sealed)); } catch (e) { throw new UserError(t('au.errData')); } }
    cur = p; dk = key; sec = secret || null;
    Store.attach(state, saverFor(p, key));
    const S = Store.get();
    if (prefs.lang) S.lang = prefs.lang;               // a language or theme picked on the lock screen carries over
    if (prefs.theme) S.theme = prefs.theme;
    if (!S.lang) S.lang = X.deviceLang();
    if (!S.name) S.name = p.name;
    prefs = {};
    last = p.id; saveList(); writeSession();
    if (opts.remember) { try { await X.remember(); } catch (e) { UI.toast(t('au.errRemember'), { ms: 9000 }); } }
    if (!sealed) await Store.flush();                  // a brand-new profile has its encrypted copy before the app opens
    hide(); touch(); startIdle();
    App.afterUnlock();
    Sync.attach({ dk: key, auth: secret });            // global accounts: bring in changes from other devices, send ours
  }

  /** Signed in on another device after changing the password there: the server accepts the new one, so adopt it here. */
  async function passwordChangedElsewhere(p, password) {
    try {
      const j = await Sync.remoteLogin({ username: p.username, password });
      const u = await Vault.unlock(password, j.meta);
      Object.assign(p, { salt: j.meta.salt, iter: j.meta.iter, pwWrap: j.meta.pwWrap, recWrap: j.meta.recWrap }); p.sync.mv = j.mv; p.sync.stale = false; saveList();
      return u;
    } catch (e) { return null; }
  }
  X.login = async (p, password, remember) => {
    let u;
    if (p.sync && p.sync.stale) {
      /* the password was changed on another device: this device must check with the server, so the old password no longer works here */
      try {
        const j = await Sync.remoteLogin({ username: p.username, password });
        u = await Vault.unlock(password, j.meta);
        Object.assign(p, { salt: j.meta.salt, iter: j.meta.iter, pwWrap: j.meta.pwWrap, recWrap: j.meta.recWrap }); p.sync.mv = j.mv; p.sync.stale = false; saveList();
      } catch (e) {
        if (e && e.code === 'NOACCOUNT') { p.sync.stale = false; saveList(); }       // the account is gone from the server: the data on this device stays usable
        else if (e instanceof UserError) throw e;
        else throw new UserError(t('au.errWrong'), 'WRONG');
      }
    }
    if (!u) {
      try { u = await Vault.unlock(password, p); }
      catch (e) {
        u = X.isSynced(p) ? await passwordChangedElsewhere(p, password) : null;
        if (!u) throw new UserError(t('au.errWrong'), 'WRONG');
      }
    }
    await enter(p, u.dk, u.auth, { remember });
  };

  /** Create a profile. When the site has an account service the account is created there too (so the name is global). */
  X.create = async ({ name, username, password, adopt, deviceOnly, invite }) => {
    username = normUser(username); name = String(name || '').trim().slice(0, 40) || username;
    if (!USER_RE.test(username)) throw new UserError(t('au.errUser'));
    if (profiles.some(p => p.username.toLowerCase() === username.toLowerCase())) throw new UserError(t('au.errUserTaken'));
    needPassword(password);
    const info = deviceOnly ? { available: false } : await Sync.info(true);
    const global = !!(info.available && info.signup !== 'closed');
    const acct = await Vault.createAccount(password);
    const legacy = adopt ? Store.readLegacy() : null;
    const first = Object.assign({ v: 1 }, legacy || {}); if (!first.name) first.name = name;
    const sealed = await Vault.seal(acct.dk, JSON.stringify(first));
    const p = { id: uid(), username, name, color: PALETTE[profiles.length % PALETTE.length], salt: acct.salt, iter: acct.iter, pwWrap: acct.pwWrap, recWrap: acct.recWrap, createdAt: Date.now(), autoLock: 15, remember: false, sync: null };
    if (global) {                                      // the server decides if the name is free, before anything is stored here
      await Sync.signup({ username, auth: acct.auth, recAuth: acct.recAuth, meta: { salt: acct.salt, iter: acct.iter, pwWrap: acct.pwWrap, recWrap: acct.recWrap }, blob: sealed, invite: invite || undefined });
      p.sync = { on: true, v: 1, mv: 1, dirty: false, at: Date.now() };
    }
    localStorage.setItem(K.DATA + p.id, sealed);
    profiles.push(p); saveList();
    return { p, dk: acct.dk, auth: acct.auth, text: Vault.formatRecovery(acct.recovery), adopted: !!legacy, synced: global };
  };

  /** Put an account that lives on the server onto this device (new device, or the password changed elsewhere). */
  async function installRemote({ username, meta, blob, version, mv }, key) {
    let state;
    try { state = JSON.parse(await Vault.open(key, blob)); } catch (e) { throw new UserError(t('au.errData')); }
    let p = profiles.find(x => x.username.toLowerCase() === username.toLowerCase());
    if (p && !X.isSynced(p)) throw new UserError(t('sy.errLocalClash'));
    const dirty = !!(p && p.sync.dirty);               // unsent changes on this device are kept; the engine merges them with the server copy
    if (!p) {
      p = { id: uid(), username, name: String(state.name || username).slice(0, 40), color: PALETTE[profiles.length % PALETTE.length], createdAt: Date.now(), autoLock: 15, remember: false };
      profiles.push(p);
    }
    Object.assign(p, { salt: meta.salt, iter: meta.iter, pwWrap: meta.pwWrap, recWrap: meta.recWrap });
    p.sync = { on: true, v: dirty ? p.sync.v : version, mv, dirty, at: Date.now(), h: dirty ? p.sync.h : '', stale: false };
    if (!dirty) localStorage.setItem(K.DATA + p.id, blob);   // already sealed with the account's data key
    saveList();
    return p;
  }
  /** "Sign in from another device": username + password -> the account's data is downloaded and opened here. */
  X.remoteSignIn = async ({ username, password, remember }) => {
    username = normUser(username);
    if (!USER_RE.test(username)) throw new UserError(t('au.errUser'));
    const j = await Sync.remoteLogin({ username, password });
    let u; try { u = await Vault.unlock(password, j.meta); } catch (e) { throw new UserError(t('au.errData')); }
    const p = await installRemote({ username, meta: j.meta, blob: j.blob, version: j.version, mv: j.mv }, u.dk);
    await enter(p, u.dk, u.auth, { remember });
  };
  /** Forgot the password and not signed in anywhere: the recovery key sets a new one on the server. */
  X.remoteRecover = async ({ username, recovery, newPassword, remember }) => {
    username = normUser(username);
    if (!USER_RE.test(username)) throw new UserError(t('au.errUser'));
    const bytes = Vault.parseRecovery(recovery);
    if (!bytes) throw new UserError(t('au.errRecFmt'));
    needPassword(newPassword);
    const rc = await Vault.fromRecovery(bytes);
    let o;
    try { o = await Sync.recoverOpen(username, rc.auth); } catch (e) { throw e.code === 'WRONG' ? new UserError(t('au.errRecMatch')) : e; }
    let u; try { u = await Vault.unlockWithRecovery(bytes, o.meta.recWrap); } catch (e) { throw new UserError(t('au.errRecMatch')); }
    const re = await Vault.rewrap(newPassword, u.dk), meta = { salt: re.salt, iter: re.iter, pwWrap: re.pwWrap };
    const r = await Sync.recoverSet(username, rc.auth, re.auth, meta);
    const p = await installRemote({ username, meta: Object.assign({}, meta, { recWrap: o.meta.recWrap }), blob: o.blob, version: o.version, mv: r.mv }, u.dk);
    await enter(p, u.dk, re.auth, { remember });
  };

  /** Forgot password on a profile that is on this device. For a global account the server must agree, so it goes there. */
  X.recover = async (p, recoveryText, newPassword) => {
    if (X.isSynced(p)) return X.remoteRecover({ username: p.username, recovery: recoveryText, newPassword });
    const bytes = Vault.parseRecovery(recoveryText);
    if (!bytes) throw new UserError(t('au.errRecFmt'));
    needPassword(newPassword);
    let u;
    try { u = await Vault.unlockWithRecovery(bytes, p.recWrap); } catch (e) { throw new UserError(t('au.errRecMatch')); }
    const re = await Vault.rewrap(newPassword, u.dk);
    Object.assign(p, { salt: re.salt, iter: re.iter, pwWrap: re.pwWrap }); saveList();
    await enter(p, u.dk, re.auth);
  };

  /* ---------- account settings (signed-in) ---------- */
  const confirmCurrent = async password => { try { return await Vault.unlock(password, cur); } catch (e) { throw new UserError(t('au.errCurrent')); } };
  X.changePassword = async (current, next) => {
    needPassword(next);
    const cu = await confirmCurrent(current);
    const re = await Vault.rewrap(next, dk), meta = { salt: re.salt, iter: re.iter, pwWrap: re.pwWrap };
    if (X.isSynced()) cur.sync.mv = (await Sync.changePassword(cur.username, cu.auth, re.auth, meta)).mv;   // server first, so both always agree
    Object.assign(cur, meta); sec = re.auth; saveList(); writeSession(); Sync.setAuth(re.auth);
    if (cur.remember) { try { await X.remember(); } catch (e) { X.forget(cur); } }
  };
  /** Returns the new recovery key text. The old key stops working. */
  X.newRecoveryKey = async password => {
    const cu = await confirmCurrent(password);
    const r = await Vault.newRecovery(dk);
    if (X.isSynced()) cur.sync.mv = (await Sync.setRecovery(cur.username, cu.auth, r.recAuth, r.recWrap)).mv;
    cur.recWrap = r.recWrap; saveList();
    return Vault.formatRecovery(r.recovery);
  };
  /** Put a device-only profile on the server so it can be used from any device. A NEW recovery key is made (and returned). */
  X.enableSync = async (password, invite) => {
    const info = await Sync.info(true);
    if (!info.available) throw new UserError(t('sy.errNoServer'));
    if (info.signup === 'closed') throw new UserError(t('sy.errClosed'));
    const cu = await confirmCurrent(password);
    const nr = await Vault.newRecovery(dk);
    const sealed = await Vault.seal(dk, JSON.stringify(Store.get()));
    await Sync.signup({ username: cur.username, auth: cu.auth, recAuth: nr.recAuth, meta: { salt: cur.salt, iter: cur.iter, pwWrap: cur.pwWrap, recWrap: nr.recWrap }, blob: sealed, invite: invite || undefined });
    cur.recWrap = nr.recWrap; cur.sync = { on: true, v: 1, mv: 1, dirty: false, at: Date.now() };
    sec = cu.auth; saveList(); writeSession();
    Sync.attach({ dk, auth: sec });
    return Vault.formatRecovery(nr.recovery);
  };
  X.rename = name => { cur.name = String(name || '').trim().slice(0, 40) || cur.username; Store.get().name = cur.name; Store.save(); saveList(); };
  X.setAutoLock = minutes => { if (AUTOLOCK.indexOf(+minutes) >= 0) { cur.autoLock = +minutes; saveList(); } };
  /** alsoServer: also delete the account from the server (other devices lose it). Otherwise only this device forgets it. */
  X.removeProfile = async (password, alsoServer) => {
    const cu = await confirmCurrent(password);
    const p = cur;
    if (alsoServer && X.isSynced(p)) {
      Sync.stop();
      try { await Sync.deleteRemote(p.username, cu.auth); } catch (e) { Sync.attach({ dk, auth: sec }); throw e; }
    }
    await doLock(true);
    ls.del(K.DATA + p.id); ls.del(K.REMEMBER + p.id);
    profiles = profiles.filter(x => x.id !== p.id); if (last === p.id) last = null; saveList();
    showStart();
  };

  /* ---------- stay signed in on this device ----------
     The data key (and login secret) are sealed with a device key kept in IndexedDB as a non-extractable CryptoKey, so the
     saved sign-in cannot be lifted out of storage and used elsewhere. Opt-in per profile; removed by signing out. */
  const idb = {
    db: () => new Promise((res, rej) => { const r = indexedDB.open('trainbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('keys'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }),
    get: async k => { const db = await idb.db(); return new Promise((res, rej) => { const q = db.transaction('keys', 'readonly').objectStore('keys').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); },
    put: async (k, v) => { const db = await idb.db(); return new Promise((res, rej) => { const tx = db.transaction('keys', 'readwrite'); tx.objectStore('keys').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
  };
  const deviceKey = async create => { let k = await idb.get('device'); if (!k && create) { k = await Vault.newDeviceKey(); await idb.put('device', k); } return k; };
  X.canRemember = () => !!(window.indexedDB && Vault.available());
  X.remember = async () => {
    const key = await deviceKey(true);
    localStorage.setItem(K.REMEMBER + cur.id, await Vault.sealWithKey(key, JSON.stringify({ dk: Vault.b64(dk), auth: sec })));
    cur.remember = true; saveList();
  };
  X.forget = p => {
    p = p || cur; if (!p) return;
    ls.del(K.REMEMBER + p.id);
    if (p.remember) { p.remember = false; saveList(); }
  };
  X.resume = async p => {
    const sealed = ls.get(K.REMEMBER + p.id), key = sealed && await deviceKey(false);
    if (!sealed || !key) throw new Error('NO_REMEMBER');
    const o = JSON.parse(await Vault.openWithKey(key, sealed));
    await enter(p, Vault.unb64(o.dk), o.auth || null);
  };

  /* ---------- lock, idle ---------- */
  let lastActive = Date.now(), idleTimer = null;
  const touch = () => { lastActive = Date.now(); };
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, touch, { passive: true, capture: true }));
  const startIdle = () => {
    clearInterval(idleTimer);
    idleTimer = setInterval(() => {
      if (!cur) return;
      if (window.Timer && Timer.anyRunning()) touch();     // a workout timer counts as activity
      const m = cur.autoLock;
      if (m > 0 && !cur.remember && Date.now() - lastActive > m * 60000) X.lock();
    }, 10000);
  };
  /** Close the profile and wipe it from the page. forget = also drop the saved "stay signed in". */
  async function doLock(forget) {
    if (!cur) return;
    if (forget) X.forget(cur);
    try { await Store.flush(); } catch (e) { /* surfaced by onStorageError */ }
    try { await Sync.detach(); } catch (e) { /* offline: it syncs next time */ }
    clearInterval(idleTimer); ss.del(K.SESSION);
    cur = dk = sec = null;
    Store.detach();
    UI.closeSheet(true);
    if (window.Music) Music.close();
    ['view', 'top', 'nav', 'pill', 'toast-root'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });   // nothing personal stays in the page
    UI.hist = null; UI.filter.today = UI.filter.course = 'all';
    App.refreshTheme();
  }
  /** Sign out: the password is needed again. */
  X.lock = async () => { if (!cur) return; await doLock(true); showStart(); };
  /** Switch profile: the saved sign-in (if any) is kept. */
  X.switchProfile = async () => { if (!cur) return; await doLock(false); show('pick'); };

  /* another tab changed this profile's data: pick up its version so the two never overwrite each other */
  window.addEventListener('storage', async e => {
    if (!cur) return;
    if (e.key === K.PROFILES) { loadList(); const np = byId(cur.id); if (!np) X.lock(); else cur = np; return; }
    if (e.key === K.DATA + cur.id && e.newValue) {
      try { Store.replace(JSON.parse(await Vault.open(dk, e.newValue))); App.render(); } catch (err) { /* ignore */ }
    }
  });

  /* ---------- start ---------- */
  X.start = async () => {
    if (!Vault.available()) return show('nocrypto');
    loadList();
    const s = readSession(), p = s && byId(s.pid);
    if (p) { try { await enter(p, Vault.unb64(s.dk), s.auth || null); return; } catch (e) { ss.del(K.SESSION); } }
    const lp = byId(last);                              // a profile this device was told to keep signed in
    if (lp && lp.remember) { try { await X.resume(lp); return; } catch (e) { X.forget(lp); } }
    showStart();
  };
  function showStart() {
    if (!profiles.length) show('create');
    else if (profiles.length === 1) show('login', { p: profiles[0] });
    else show('pick');
  }

  /* ---------- helpers shared with the settings sheets ---------- */
  X.download = (name, text) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };
  X.saveKeyFile = (username, text) => X.download('trainbook-recovery-key-' + username + '.txt',
    'TrainBook recovery key for @' + username + '\r\n\r\n' + text + '\r\n\r\nKeep this file private. Anyone with it and your username can reset your password.\r\n');
  X.copyKey = async (text, el) => {
    try { await navigator.clipboard.writeText(text); UI.toast(t('au.copied')); }
    catch (e) { if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } UI.toast(t('au.selectCopy')); }
  };
  const formError = (form, msg) => { const el = form.querySelector('.form-error'); if (el) { el.textContent = msg; el.hidden = !msg; } };
  let busy = false;
  /** Run an async form action with a busy state and tidy error messages. */
  X.work = async (form, fn) => {
    if (busy) return; busy = true;
    const btn = form.querySelector('button[type=submit]'), label = btn && btn.innerHTML;
    if (btn) { btn.disabled = true; btn.innerHTML = '<span>' + esc(t('au.working')) + '</span>'; }
    formError(form, '');
    try { await fn(); }
    catch (e) {
      if (!(e instanceof UserError)) console.error(e);
      formError(form, e instanceof UserError ? e.message : t('au.errGeneric'));
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    } finally { busy = false; }
  };
  X.pwField = (id, name, auto, focus, act) => '<div class="pw"><input type="password" id="' + id + '" name="' + name + '" autocomplete="' + auto + '"' + (focus ? ' autofocus' : '') + ' required>' +
    '<button type="button" class="icon-btn xs" ' + (act || 'data-au="peek"') + ' data-for="' + id + '" aria-label="' + esc(t('au.peek')) + '">' + ic('eye', 16) + '</button></div>';
  X.peek = id => { const i = document.getElementById(id); if (i) { i.type = i.type === 'password' ? 'text' : 'password'; i.focus(); } };
  X.avatar = (p, size) => '<span class="avatar" style="--c:' + esc(p.color) + ';--s:' + (size || 56) + 'px">' + esc((Array.from(String(p.name).trim())[0] || '?').toUpperCase()) + '</span>';
  X.strengthLabels = () => [t('au.s0'), t('au.s1'), t('au.s2'), t('au.s3'), t('au.s4')];

  /* ---------- lock screen ---------- */
  let ui = { view: 'pick', ctx: {} };
  const dark = () => document.documentElement.dataset.theme === 'dark';
  const links = (...l) => '<div class="auth-links">' + l.join('') + '</div>';
  const link = (act, label, extra) => '<button type="button" class="link" data-au="' + act + '"' + (extra || '') + '>' + esc(label) + '</button>';
  const err = () => '<div class="form-error" role="alert" hidden></div>';
  const stay = () => X.canRemember() ? '<label class="check stay"><input type="checkbox" name="remember" checked><span>' + esc(t('au.keepSigned')) + '</span></label>' : '';
  const field = (id, name, label, extra) => '<div class="fld"><label for="' + id + '">' + esc(label) + '</label><input type="text" id="' + id + '" name="' + name + '" ' + (extra || '') + '></div>';
  const userField = (autofocus) => field('au-user', 'username', t('au.username'), 'autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="32" required' + (autofocus ? ' autofocus' : ''));

  const views = {
    nocrypto: () => '<div class="keyscreen">' + ic('lock', 28) + '<h1>' + esc(t('au.noCrypto')) + '</h1><p class="sub">' + esc(t('au.noCryptoSub')) + '</p></div>',

    pick: () => '<h1>' + esc(t('au.pickTitle')) + '</h1><p class="sub">' + esc(t('au.pickSub')) + '</p><div class="profile-grid">' +
      profiles.map(p => '<button type="button" class="ptile" data-au="select" data-id="' + p.id + '">' + X.avatar(p, 60) + '<b>' + esc(p.name) + '</b><small>' + at(p.username) + '</small>' +
        (p.remember ? '<span class="pill-sm">' + esc(t('au.signedIn')) + '</span>' : '') + (p.sync ? '<span class="pill-sm info">' + esc(t('sy.synced')) + '</span>' : '') + '</button>').join('') +
      '<button type="button" class="ptile add" data-au="new"><span class="avatar plus" style="--s:60px">' + ic('plus', 24) + '</span><b>' + esc(t('au.add')) + '</b></button></div>' +
      links(link('remote', t('sy.signInOther'))),

    login: () => {
      const p = ui.ctx.p;
      return '<form id="auf" data-au-submit="login" novalidate>' + X.avatar(p, 76) + '<h1>' + esc(p.name) + '</h1><p class="sub">' + at(p.username) + '</p>' +
        '<input type="text" name="username" value="' + esc(p.username) + '" autocomplete="username" readonly tabindex="-1" class="sr-only" aria-hidden="true">' +
        '<div class="fld"><label for="au-pass">' + esc(t('au.password')) + '</label>' + X.pwField('au-pass', 'password', 'current-password', true) + '</div>' + err() + stay() +
        '<button class="btn primary wide" type="submit">' + ic('lock', 16) + '<span>' + esc(t('au.unlock')) + '</span></button>' +
        links(link('forgot', t('au.forgot'), ' data-id="' + p.id + '"'), link('pick', profiles.length > 1 ? t('au.switch') : t('au.add'), profiles.length > 1 ? '' : ' data-new="1"'), link('remote', t('sy.signInOther'))) + '</form>';
    },

    create: () => {
      const first = !profiles.length, legacy = Store.readLegacy(), info = ui.info;
      const canSync = !!(info && info.available && info.signup !== 'closed');
      const note = !info ? '' : !info.available ? t('sy.noteLocal') : info.signup === 'closed' ? t('sy.noteClosed') : t('sy.noteGlobal');
      return '<form id="auf" data-au-submit="create" novalidate><h1>' + esc(first ? t('au.createTitleFirst') : t('au.createTitle')) + '</h1>' +
        '<p class="sub">' + esc(first ? t('au.createSub') : t('au.createSubMore')) + '</p>' +
        (note ? '<div class="notice ' + (canSync ? 'ok' : 'warn') + '">' + ic(canSync ? 'check' : 'info', 16) + '<span>' + esc(note) + '</span></div>' : '') +
        (legacy ? '<div class="notice ok">' + ic('check', 16) + '<label class="check"><input type="checkbox" name="adopt" checked><span>' +
          esc(t('au.adopt', { n: legacy.plan.length, d: Object.keys(legacy.logs).length })) + '</span></label></div>' : '') +
        '<div class="row2"><div class="fld"><label for="au-name">' + esc(t('au.name')) + '</label><input type="text" id="au-name" name="name" autocomplete="name" maxlength="40"></div>' +
        '<div class="fld"><label for="au-user">' + esc(t('au.username')) + '</label><input type="text" id="au-user" name="username" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="32" required></div></div>' +
        '<div class="fld"><label for="au-pass">' + esc(t('au.password')) + '</label><div class="pw"><input type="password" id="au-pass" name="password" autocomplete="new-password" data-au-input="strength" required>' +
        '<button type="button" class="icon-btn xs" data-au="peek" data-for="au-pass" aria-label="' + esc(t('au.peek')) + '">' + ic('eye', 16) + '</button></div>' +
        '<div class="strength" id="au-str" data-s="0"><i></i><i></i><i></i><i></i><span>' + esc(t('au.s0')) + '</span></div></div>' +
        '<div class="fld"><label for="au-pass2">' + esc(t('au.confirm')) + '</label>' + X.pwField('au-pass2', 'password2', 'new-password') + '</div>' +
        (info && info.available && info.signup === 'invite' ? field('au-invite', 'invite', t('sy.inviteCode'), 'autocomplete="off" autocapitalize="off" spellcheck="false"') : '') +
        '<p class="muted sm">' + esc(t('au.noOne')) + '</p>' + err() + stay() +
        (canSync ? '<label class="check"><input type="checkbox" name="deviceOnly"><span>' + esc(t('sy.deviceOnly')) + '</span></label>' : '') +
        '<button class="btn primary wide" type="submit">' + esc(t('au.createBtn')) + '</button>' +
        links(profiles.length ? link('back', t('au.back')) : '', link('remote', t('sy.haveAccount'))) + '</form>';
    },

    key: () => '<div class="keyscreen">' + ic('key', 28) + '<h1>' + esc(t('au.keyTitle')) + '</h1><p class="sub">' + esc(t('au.keySub')) + '</p>' +
      '<div class="keybox" id="au-key" dir="ltr">' + esc(ui.ctx.text) + '</div>' +
      '<div class="key-actions"><button type="button" class="btn" data-au="copykey">' + ic('copy', 16) + esc(t('au.copy')) + '</button><button type="button" class="btn" data-au="savekey">' + ic('download', 16) + esc(t('au.saveFile')) + '</button></div>' +
      '<label class="check"><input type="checkbox" id="au-saved"><span>' + esc(t('au.savedKey')) + '</span></label>' +
      '<button type="button" class="btn primary wide" id="au-continue" data-au="continue" disabled>' + esc(t('au.continue')) + '</button></div>',

    forgot: () => {
      const p = ui.ctx.p;
      return '<form id="auf" data-au-submit="reset" novalidate>' + X.avatar(p, 60) + '<h1>' + esc(t('au.resetTitle')) + '</h1>' +
        '<p class="sub">' + esc(t('au.resetSub', { user: '\u0001' })).split('\u0001').join(at(p.username)) + '</p>' +
        '<div class="fld"><label for="au-rec">' + esc(t('au.recKey')) + '</label><input type="text" id="au-rec" name="recovery" class="keyinput" dir="ltr" autocomplete="off" spellcheck="false" placeholder="ABCD-EFGH-IJKL-MNPQ-RSTV-WX" autofocus required></div>' +
        '<div class="fld"><label for="au-pass">' + esc(t('au.newPass')) + '</label>' + X.pwField('au-pass', 'password', 'new-password') + '</div>' +
        '<div class="fld"><label for="au-pass2">' + esc(t('au.confirm')) + '</label>' + X.pwField('au-pass2', 'password2', 'new-password') + '</div>' + err() +
        '<button class="btn primary wide" type="submit">' + esc(t('au.resetBtn')) + '</button>' + links(link('select', t('au.back'), ' data-id="' + p.id + '"')) + '</form>';
    },

    /* sign in with an account that is not on this device yet */
    remote: () => '<form id="auf" data-au-submit="remote" novalidate>' + ic('globe', 28) + '<h1>' + esc(t('sy.signInOther')) + '</h1><p class="sub">' + esc(t('sy.signInOtherSub')) + '</p>' +
      userField(true) + '<div class="fld"><label for="au-pass">' + esc(t('au.password')) + '</label>' + X.pwField('au-pass', 'password', 'current-password') + '</div>' + err() + stay() +
      '<button class="btn primary wide" type="submit">' + ic('globe', 16) + '<span>' + esc(t('sy.signIn')) + '</span></button>' +
      links(link('remoteForgot', t('au.forgot')), profiles.length ? link('back', t('au.back')) : link('new', t('sy.createInstead'))) + '</form>',

    remoteForgot: () => '<form id="auf" data-au-submit="remoteReset" novalidate>' + ic('key', 28) + '<h1>' + esc(t('au.resetTitle')) + '</h1><p class="sub">' + esc(t('sy.resetRemoteSub')) + '</p>' +
      userField(true) +
      '<div class="fld"><label for="au-rec">' + esc(t('au.recKey')) + '</label><input type="text" id="au-rec" name="recovery" class="keyinput" dir="ltr" autocomplete="off" spellcheck="false" placeholder="ABCD-EFGH-IJKL-MNPQ-RSTV-WX" required></div>' +
      '<div class="fld"><label for="au-pass">' + esc(t('au.newPass')) + '</label>' + X.pwField('au-pass', 'password', 'new-password') + '</div>' +
      '<div class="fld"><label for="au-pass2">' + esc(t('au.confirm')) + '</label>' + X.pwField('au-pass2', 'password2', 'new-password') + '</div>' + err() + stay() +
      '<button class="btn primary wide" type="submit">' + esc(t('au.resetBtn')) + '</button>' + links(link('remote', t('au.back'))) + '</form>'
  };

  function draw() {
    const el = $('#auth'), keep = {};
    el.querySelectorAll('input[name]').forEach(f => { keep[f.name] = f.type === 'checkbox' ? f.checked : f.value; });
    el.hidden = false; document.body.classList.add('locked'); $('#app').hidden = true; document.title = 'TrainBook';
    el.innerHTML = '<div class="auth-scroll"><div class="auth-card"><div class="auth-brand"><span class="logo">' + UI.LOGO + '</span><b>TrainBook</b></div>' + views[ui.view]() + '</div>' +
      '<div class="auth-foot"><button type="button" class="btn ghost sm" data-au="lang">' + (I18N.lang === 'ar' ? 'English' : 'العربية') + '</button>' +
      '<button type="button" class="icon-btn" data-au="theme" aria-label="' + esc(dark() ? t('set.light') : t('set.dark')) + '">' + ic(dark() ? 'sun' : 'moon', 18) + '</button></div></div>';
    el.querySelectorAll('input[name]').forEach(f => { if (f.name in keep && f.type !== 'password') { if (f.type === 'checkbox') f.checked = keep[f.name]; else f.value = keep[f.name]; } });
    const first = el.querySelector('[autofocus]') || el.querySelector('input:not([type=checkbox]):not([type=hidden]):not([readonly])');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
  }
  function show(view, ctx) {
    ui = { view, ctx: ctx || {}, info: ui && ui.info }; busy = false; draw();
    if (view === 'create') Sync.info().then(i => { if (ui.view === 'create' && (!ui.info || ui.info.at !== i.at)) { ui.info = i; draw(); } });
  }
  function hide() { const el = $('#auth'); el.hidden = true; el.innerHTML = ''; document.body.classList.remove('locked'); $('#app').hidden = false; }

  /* wrong-password throttle: after 5 misses the wait doubles up to a minute (the server also throttles global accounts) */
  const fails = {};
  const waitLeft = p => Math.max(0, Math.ceil((((fails[p.id] || {}).until || 0) - Date.now()) / 1000));

  const AU = {
    select: async el => {
      const p = byId(el.dataset.id); if (!p) return;
      if (p.remember) { try { await X.resume(p); return; } catch (e) { X.forget(p); } }      // one tap for a profile kept signed in
      show('login', { p });
    },
    back: () => showStart(),
    pick: el => (el.dataset.new ? show('create') : show('pick')),
    new: () => show('create'),
    forgot: el => { const p = byId(el.dataset.id); if (p) show('forgot', { p }); },
    remote: () => show('remote'),
    remoteForgot: () => show('remoteForgot'),
    peek: el => X.peek(el.dataset.for),
    lang: () => {
      const lang = I18N.lang === 'ar' ? 'en' : 'ar';
      X.setDevice({ lang }); prefs.lang = lang; I18N.setLang(lang); draw();
    },
    theme: () => {
      const th = dark() ? 'light' : 'dark';
      X.setDevice({ theme: th }); prefs.theme = th; App.refreshTheme(); draw();
    },
    copykey: () => X.copyKey(ui.ctx.text, $('#au-key')),
    savekey: () => X.saveKeyFile(ui.ctx.p.username, ui.ctx.text),
    continue: async el => {
      el.disabled = true;
      const r = ui.ctx;
      try { await enter(r.p, r.dk, r.auth, { remember: r.remember }); if (r.adopted) Store.dropLegacy(); }
      catch (e) { el.disabled = false; UI.toast(e instanceof UserError ? e.message : t('au.errGeneric'), { ms: 6000 }); }
    }
  };
  const AUS = {
    login: form => X.work(form, async () => {
      const p = ui.ctx.p, wait = waitLeft(p);
      if (wait) throw new UserError(t('au.errWait', { n: wait }));
      try { await X.login(p, form.elements.password.value, !!(form.elements.remember && form.elements.remember.checked)); delete fails[p.id]; }
      catch (e) {
        if (e.code === 'WRONG') { const f = fails[p.id] = fails[p.id] || { n: 0 }; f.n++; if (f.n >= 5) f.until = Date.now() + Math.min(60, Math.pow(2, f.n - 4)) * 1000; }
        throw e;
      }
    }),
    create: form => X.work(form, async () => {
      const d = form.elements;
      if (d.password.value !== d.password2.value) throw new UserError(t('au.errMismatch'));
      const r = await X.create({ name: d.name.value, username: d.username.value, password: d.password.value, adopt: d.adopt ? d.adopt.checked : false,
        deviceOnly: !!(d.deviceOnly && d.deviceOnly.checked), invite: d.invite ? d.invite.value.trim() : '' });
      show('key', Object.assign(r, { remember: !!(d.remember && d.remember.checked) }));
    }),
    reset: form => X.work(form, async () => {
      const d = form.elements;
      if (d.password.value !== d.password2.value) throw new UserError(t('au.errMismatch'));
      await X.recover(ui.ctx.p, d.recovery.value, d.password.value);
    }),
    remote: form => X.work(form, async () => {
      const d = form.elements;
      await X.remoteSignIn({ username: d.username.value, password: d.password.value, remember: !!(d.remember && d.remember.checked) });
    }),
    remoteReset: form => X.work(form, async () => {
      const d = form.elements;
      if (d.password.value !== d.password2.value) throw new UserError(t('au.errMismatch'));
      await X.remoteRecover({ username: d.username.value, recovery: d.recovery.value, newPassword: d.password.value, remember: !!(d.remember && d.remember.checked) });
    })
  };

  document.addEventListener('click', e => { const b = e.target.closest('#auth [data-au]'); if (b && AU[b.dataset.au]) AU[b.dataset.au](b); });
  document.addEventListener('submit', e => { const f = e.target.closest('#auth form[data-au-submit]'); if (f) { e.preventDefault(); AUS[f.dataset.auSubmit](f); } });
  document.addEventListener('input', e => {
    if (e.target.dataset && e.target.dataset.auInput === 'strength') {
      const s = Vault.strength(e.target.value), bar = $('#au-str');
      if (bar) { bar.dataset.s = s; bar.lastElementChild.textContent = X.strengthLabels()[s]; }
    }
  });
  document.addEventListener('change', e => { if (e.target.id === 'au-saved') { const b = $('#au-continue'); if (b) b.disabled = !e.target.checked; } });
})();
