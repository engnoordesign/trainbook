'use strict';
/* Offline music: songs you add are stored on THIS device (IndexedDB) and played with a normal audio element, so they work with no internet.
 * Nothing is uploaded anywhere. Pure helpers live in library.js. */
(function () {
  const L = window.MusicLib;
  const O = window.Offline = { supported: !!(window.indexedDB && window.Blob && window.Audio && L) };
  const DBNAME = 'trainbook-music', PREF = 'trainbook.offline.v1';
  let dbp = null, tracks = [], ready = false, loadP = null, audio = null, url = '', q = null, base = [], curId = null, tok = 0, errRun = 0, asked = false;
  const mode = (() => { try { const o = JSON.parse(localStorage.getItem(PREF) || 'null') || {}; return { shuffle: !!o.shuffle, repeat: ['all', 'one', 'off'].includes(o.repeat) ? o.repeat : 'all' }; } catch (e) { return { shuffle: false, repeat: 'all' }; } })();
  const saveMode = () => { try { localStorage.setItem(PREF, JSON.stringify(mode)); } catch (e) { /* ignore */ } };
  const listeners = [];
  const emit = type => listeners.forEach(f => { try { f(type); } catch (e) { /* a listener must never break playback */ } });
  O.on = f => { listeners.push(f); };

  /* ---------- storage ---------- */
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DBNAME, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('meta', { keyPath: 'id' }); r.result.createObjectStore('blob'); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => { dbp = null; rej(r.error); };
  }));
  const wrap = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const done = t => new Promise((res, rej) => { t.oncomplete = res; t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  O.load = () => loadP || (loadP = O.supported ? open().then(db => wrap(db.transaction('meta').objectStore('meta').getAll())).then(list => { tracks = list.sort(L.byName); ready = true; return tracks; }).catch(() => { O.supported = false; tracks = []; ready = true; return tracks; }) : Promise.resolve(tracks));
  O.ready = () => ready || !O.supported;
  O.list = () => tracks;
  O.get = id => tracks.find(t => t.id === id) || null;
  O.stats = () => ({ n: tracks.length, size: tracks.reduce((a, t) => a + (t.size || 0), 0) });
  O.usage = async () => { try { const e = await navigator.storage.estimate(); return { used: e.usage || 0, quota: e.quota || 0 }; } catch (e) { return null; } };

  /** how long is this file? null = the browser cannot play it, 0 = unknown */
  const probe = file => new Promise(res => {
    const u = URL.createObjectURL(file), a = new Audio();
    let fin = false;
    const end = v => { if (fin) return; fin = true; clearTimeout(tm); a.removeAttribute('src'); try { a.load(); } catch (e) { /* ignore */ } URL.revokeObjectURL(u); res(v); };
    const tm = setTimeout(() => end(0), 8000);
    a.preload = 'metadata';
    a.onloadedmetadata = () => end(isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => end(null);
    a.src = u;
  });
  async function store(file, dur) {
    const db = await open(), meta = { id: uid(), name: L.cleanName(file.name), file: file.name, size: file.size, type: file.type || '', dur: dur || 0, added: Date.now() };
    const t = db.transaction(['meta', 'blob'], 'readwrite');
    t.objectStore('meta').put(meta); t.objectStore('blob').put(file, meta.id);
    await done(t);
    tracks.push(meta); tracks.sort(L.byName);
  }
  /** add files from a file picker. progress(done, total, result) is called as it goes. */
  O.add = async (files, progress) => {
    const all = Array.prototype.slice.call(files), list = all.filter(f => L.isAudio(f.name, f.type));
    const res = { added: 0, skipped: 0, failed: 0, ignored: all.length - list.length, full: false };
    if (!O.supported || !list.length) return res;
    await O.load();
    if (!asked && navigator.storage && navigator.storage.persist) { asked = true; try { navigator.storage.persist(); } catch (e) { /* ignore */ } }   // ask the browser not to clear the songs when space is low
    const seen = {}; tracks.forEach(t => { seen[t.file + '|' + t.size] = 1; });
    let next = 0, n = 0;
    const worker = async () => {
      while (next < list.length && !res.full) {
        const f = list[next++], key = f.name + '|' + f.size;
        try {
          if (seen[key]) res.skipped++;
          else { seen[key] = 1; const d = await probe(f); if (d === null) res.failed++; else { await store(f, d); res.added++; } }
        } catch (e) { if (e && e.name === 'QuotaExceededError') res.full = true; else res.failed++; }
        n++; if (progress) progress(n, list.length, res);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    emit('list');
    return res;
  };
  O.remove = async id => {
    const db = await open(), t = db.transaction(['meta', 'blob'], 'readwrite');
    t.objectStore('meta').delete(id); t.objectStore('blob').delete(id);
    await done(t);
    tracks = tracks.filter(x => x.id !== id);
    base = base.filter(x => x !== id);
    if (q) q = L.dropFromQueue(q, id);
    if (id === curId) { if (q && q.ids.length) loadCurrent(); else O.stop(); }
    emit('list');
  };
  O.clear = async () => {
    const db = await open(), t = db.transaction(['meta', 'blob'], 'readwrite');
    t.objectStore('meta').clear(); t.objectStore('blob').clear();
    await done(t);
    tracks = []; O.stop(); emit('list');
  };

  /* ---------- player ---------- */
  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio(); audio.preload = 'auto';
    audio.addEventListener('ended', () => advance(true));
    audio.addEventListener('timeupdate', () => emit('time'));
    audio.addEventListener('play', () => { errRun = 0; emit('state'); });
    audio.addEventListener('pause', () => emit('state'));
    audio.addEventListener('error', () => { if (!curId) return; if (++errRun > 5 || !q || q.ids.length < 2) { O.stop(); return; } advance(true); });
    if ('mediaSession' in navigator) {
      const h = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) { /* not supported */ } };
      h('play', () => O.toggle(true)); h('pause', () => O.toggle(false)); h('previoustrack', () => O.prev()); h('nexttrack', () => O.next());
      h('seekto', d => { if (d && d.seekTime != null) O.seek(d.seekTime); });
    }
    return audio;
  }
  async function loadCurrent() {
    const id = q && q.ids[q.pos], my = ++tok;
    if (!id) return O.stop();
    const a = ensureAudio(), meta = O.get(id);
    let blob = null;
    try { const db = await open(); blob = await wrap(db.transaction('blob').objectStore('blob').get(id)); } catch (e) { /* handled below */ }
    if (my !== tok) return;                                      // a newer song was picked meanwhile
    if (!blob) { if (meta) await O.remove(id).catch(() => {}); if (my === tok && q && q.ids.length) loadCurrent(); return; }
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob); curId = id;
    a.src = url; emit('track');
    if ('mediaSession' in navigator && window.MediaMetadata) { try { navigator.mediaSession.metadata = new MediaMetadata({ title: meta ? meta.name : '', artist: 'TrainBook' }); } catch (e) { /* ignore */ } }
    try { await a.play(); } catch (e) { emit('state'); }          // the browser may want a tap first
  }
  function advance(auto) {
    if (!q) return;
    const nq = L.nextQueue(q, auto);
    if (!nq) { audio.pause(); emit('state'); return; }
    if (nq === q) { audio.currentTime = 0; audio.play().catch(() => {}); return; }
    q = nq; loadCurrent();
  }
  /** play a song; ids = the list it comes from (what plays next) */
  O.play = (id, ids) => {
    base = (ids && ids.length ? ids : tracks.map(t => t.id)).slice();
    q = L.makeQueue(base, id, mode.shuffle, mode.repeat);
    return loadCurrent();
  };
  O.playAll = shuffle => {
    if (!tracks.length) return;
    mode.shuffle = !!shuffle; saveMode();
    base = tracks.map(t => t.id);
    q = L.makeQueue(base, shuffle ? base[Math.floor(Math.random() * base.length)] : base[0], mode.shuffle, mode.repeat);
    return loadCurrent();
  };
  O.toggle = on => {
    if (!audio || !curId) return;
    const want = on == null ? audio.paused : !!on;
    if (want) audio.play().catch(() => emit('state')); else audio.pause();
  };
  O.next = () => advance(false);
  O.prev = () => {
    if (!q) return;
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    const pq = L.prevQueue(q); if (pq) { q = pq; loadCurrent(); }
  };
  O.seek = sec => { if (audio && curId && isFinite(sec)) audio.currentTime = Math.max(0, sec); };
  O.setShuffle = on => {
    mode.shuffle = !!on; saveMode();
    if (q && curId) q = L.makeQueue(base, curId, mode.shuffle, mode.repeat);
    emit('state');
  };
  O.cycleRepeat = () => {
    mode.repeat = L.nextRepeat(mode.repeat); saveMode();
    if (q) q = { ids: q.ids, pos: q.pos, shuffle: q.shuffle, repeat: mode.repeat };
    emit('state');
  };
  O.stop = () => {
    tok++; curId = null; q = null; errRun = 0;
    if (audio) { audio.pause(); audio.removeAttribute('src'); try { audio.load(); } catch (e) { /* ignore */ } }
    if (url) { URL.revokeObjectURL(url); url = ''; }
    if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = null; } catch (e) { /* ignore */ } }
    emit('stop');
  };
  O.active = () => !!curId;
  O.state = () => {
    const t = curId ? O.get(curId) : null;
    return { id: curId, track: t, playing: !!audio && !audio.paused && !!curId, time: audio ? audio.currentTime || 0 : 0,
      dur: audio && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (t ? t.dur : 0), shuffle: mode.shuffle, repeat: mode.repeat, index: q ? q.pos + 1 : 0, total: q ? q.ids.length : 0 };
  };
  O.mode = () => ({ shuffle: mode.shuffle, repeat: mode.repeat });
})();
