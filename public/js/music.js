'use strict';
/* Music: a mini-player that stays on screen while you move between pages, plus the library inside Train -> Music.
 * The audio is played by the official Spotify / YouTube / SoundCloud embeds (nothing loads until you pick something). */
(() => {
  const M = window.Music = {};
  const D = window.MusicData;
  const t = (k, v) => I18N.t(k, v), esc = s => UI.esc(s), ic = (n, s, c) => UI.ic(n, s, c);
  const $ = s => document.querySelector(s);
  const KEY = 'trainbook.music.v1';
  const ICON = { workout: 'bolt', trending: 'star', hiphop: 'music', rock: 'flame', dance: 'music', world: 'globe', calm: 'moon' };
  let cur = null, expanded = false;                // cur = { item, title, sub, src }

  /* ---------- your own saved links (kept on this device) ---------- */
  const clean = m => {
    if (!m || typeof m.u !== 'string' || !D.parse(m.u)) return null;
    return { t: String(m.t || '').slice(0, 60), u: m.u.slice(0, 300) };
  };
  const read = () => {
    try { const o = JSON.parse(localStorage.getItem(KEY) || 'null') || {}; return (Array.isArray(o.mine) ? o.mine : []).map(clean).filter(Boolean).slice(0, 12); }
    catch (e) { return []; }
  };
  const write = list => { try { localStorage.setItem(KEY, JSON.stringify({ mine: list })); } catch (e) { /* ignore */ } };
  M.mine = read;
  const nameOf = p => (I18N.lang === 'ar' ? p.ar : p.name);
  const descOf = p => p.d[I18N.lang === 'ar' ? 'ar' : 'en'];
  const srcName = k => ({ spotify: 'Spotify', youtube: 'YouTube', soundcloud: 'SoundCloud' }[k] || k);

  /* ---------- the player dock ---------- */
  const dockEl = () => $('#music');
  function sizeVars() {                             // keep the + button, the timer pill and the page clear of the player
    const el = dockEl(), h = cur && el && !el.hidden ? el.offsetHeight + 10 : 0;
    document.body.style.setProperty('--dock-h', h + 'px');
  }
  const OL = () => window.Offline, LIB = () => window.MusicLib;
  const isLocal = () => !!cur && cur.item.kind === 'local';
  let silent = false;
  const stopLocal = () => { if (OL() && OL().active()) { silent = true; try { OL().stop(); } finally { silent = false; } } };

  function localHead() {
    const s = OL().state(), name = s.track ? s.track.name : cur.title;
    return '<span class="mdock-ic">' + ic('phone', 18) + '</span>' +
      '<div class="mdock-t"><b>' + esc(name) + '</b><small>' + esc(s.total ? t('ol.nowN', { n: s.index, total: s.total }) : t('ol.local')) + '</small></div>' +
      '<button type="button" class="icon-btn xs" data-act="musicClose" aria-label="' + esc(t('mu.close')) + '" title="' + esc(t('mu.close')) + '">' + ic('x', 17) + '</button>';
  }
  function localBody() {
    const s = OL().state(), ML = LIB(), pos = s.dur ? Math.round(s.time / s.dur * 1000) : 0;
    const b = (act, icon, label, on, cls) => '<button type="button" class="' + (cls || 'icon-btn') + (on ? ' on' : '') + '" data-act="' + act + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"' + (on != null ? ' aria-pressed="' + !!on + '"' : '') + '>' + ic(icon, cls ? 26 : 20) + '</button>';
    return '<div class="mp-seek" dir="ltr"><span id="mp-cur">' + ML.fmtDur(s.time) + '</span><input type="range" id="mp-seek" min="0" max="1000" value="' + pos + '" aria-label="' + esc(t('ol.seek')) + '"><span id="mp-dur">' + ML.fmtDur(s.dur) + '</span></div>' +
      '<div class="mp-ctl" dir="ltr">' + b('offShuf', 'shuffle', t('ol.shuffle'), s.shuffle) + b('offPrev', 'prev', t('ol.prev')) +
      b('offToggle', s.playing ? 'pause' : 'play', s.playing ? t('ol.pause') : t('ol.play'), null, 'bigplay') + b('offNext', 'next', t('ol.next')) +
      '<button type="button" class="icon-btn rep' + (s.repeat !== 'off' ? ' on' : '') + '" data-act="offRep" aria-label="' + esc(t('ol.repeat.' + s.repeat)) + '" title="' + esc(t('ol.repeat.' + s.repeat)) + '">' + ic('repeat', 20) + (s.repeat === 'one' ? '<i>1</i>' : '') + '</button></div>';
  }
  function localTime() {
    const s = OL().state(), ML = LIB(), c = $('#mp-cur'), d = $('#mp-dur'), r = $('#mp-seek');
    if (c) c.textContent = ML.fmtDur(s.time);
    if (d) d.textContent = ML.fmtDur(s.dur);
    if (r && document.activeElement !== r) r.value = s.dur ? Math.round(s.time / s.dur * 1000) : 0;
  }
  function headHtml() {
    if (isLocal()) return localHead();
    const title = cur.lib ? nameOf(cur.lib) : cur.title, sub = cur.lib ? descOf(cur.lib) : cur.sub;     // library names follow the app language
    return '<span class="mdock-ic">' + ic('music', 18) + '</span>' +
      '<div class="mdock-t"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div>' +
      '<button type="button" class="icon-btn xs" data-act="musicShuffle" aria-label="' + esc(t('mu.surprise')) + '" title="' + esc(t('mu.surprise')) + '">' + ic('shuffle', 17) + '</button>' +
      '<button type="button" class="icon-btn xs" data-act="musicExpand" aria-label="' + esc(expanded ? t('mu.collapse') : t('mu.expand')) + '" title="' + esc(expanded ? t('mu.collapse') : t('mu.expand')) + '">' + ic(expanded ? 'down' : 'up', 17) + '</button>' +
      '<button type="button" class="icon-btn xs" data-act="musicClose" aria-label="' + esc(t('mu.close')) + '" title="' + esc(t('mu.close')) + '">' + ic('x', 17) + '</button>';
  }
  function render() {
    const el = dockEl(); if (!el) return;
    if (!cur) { el.hidden = true; el.innerHTML = ''; el.className = 'mdock'; sizeVars(); return; }
    const k = cur.item.kind;
    el.hidden = false;
    el.className = 'mdock' + (expanded ? ' exp' : '') + (k === 'youtube' ? ' yt' : '') + (k === 'soundcloud' ? ' sc' : '') + (k === 'local' ? ' loc' : '');
    if (k === 'local') { el.innerHTML = '<div class="mdock-h">' + headHtml() + '</div><div class="mdock-b">' + localBody() + '</div>'; sizeVars(); setTimeout(sizeVars, 150); return; }
    el.innerHTML = '<div class="mdock-h">' + headHtml() + '</div><div class="mdock-b">' +
      (navigator.onLine === false
        ? '<p class="mdock-off">' + esc(t('mu.offline')) + '</p>'
        : '<iframe src="' + esc(cur.src) + '" title="' + esc(cur.title) + '" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>') + '</div>';
    sizeVars(); setTimeout(sizeVars, 150); setTimeout(sizeVars, 600);
  }
  /** after a language change: only the header text is redrawn (the song keeps playing) */
  M.refreshHead = () => { if (!cur) return; if (isLocal()) { render(); return; } const h = $('#music .mdock-h'); if (h) h.innerHTML = headHtml(); };
  M.current = () => cur;

  M.play = (item, title, sub) => {
    const src = D.embedSrc(item, document.documentElement.dataset.theme === 'dark');
    if (!src) return false;
    stopLocal();
    cur = { item, title, sub, src }; expanded = false; render();
    return true;
  };
  /** play one of your offline songs; ids = the list it was picked from (what plays next) */
  M.playLocal = (id, ids) => {
    const tk = OL().get(id); if (!tk) return false;
    cur = { item: { kind: 'local', id: 'local' }, title: tk.name, sub: '' }; expanded = false;
    OL().play(id, ids); render();
    return true;
  };
  M.playAllLocal = shuffle => {
    if (!OL().list().length) return;
    cur = { item: { kind: 'local', id: 'local' }, title: '', sub: '' }; expanded = false;
    OL().playAll(shuffle); render();
  };
  M.playLib = p => { const ok = M.play(p, nameOf(p), descOf(p)); if (ok) { cur.lib = p; M.refreshHead(); } return ok; };
  M.playUrl = (url, name) => {
    const it = D.parse(url);
    if (!it) { UI.toast(t('mu.errLink')); return false; }
    const label = String(name || '').trim().slice(0, 60) || t('mu.defaultName', { src: srcName(it.kind) });
    return M.play(it, label, srcName(it.kind));
  };
  M.saveUrl = (url, name) => {
    const it = D.parse(url);
    if (!it) { UI.toast(t('mu.errLink')); return false; }
    const list = read(), u = String(url).trim().slice(0, 300);
    if (!list.some(x => x.u === u)) { list.unshift({ t: String(name || '').trim().slice(0, 60) || t('mu.defaultName', { src: srcName(it.kind) }), u }); write(list.slice(0, 12)); }
    return true;
  };
  M.removeMine = i => { const list = read(); list.splice(+i, 1); write(list); };
  M.shuffle = () => { const p = D.random(cur && cur.item.id); M.playLib(p); UI.toast(t('mu.playing', { n: nameOf(p) })); };
  M.expand = () => {
    if (!cur) return;
    expanded = !expanded;
    const el = dockEl(); el.classList.toggle('exp', expanded); M.refreshHead(); sizeVars(); setTimeout(sizeVars, 200);
  };
  M.close = () => { stopLocal(); cur = null; expanded = false; render(); };
  window.addEventListener('online', () => { if (cur && !isLocal()) render(); });
  window.addEventListener('offline', () => { if (cur && !isLocal()) render(); });
  if (OL()) OL().on(type => {
    if (silent || !isLocal()) { if (type === 'list') M.refreshList(); return; }
    if (type === 'time') { localTime(); return; }
    if (type === 'stop') { cur = null; render(); M.refreshList(); return; }
    render(); M.refreshList();                                   // a new song or play / pause: redraw the controls and the highlighted row
  });
  if (window.ResizeObserver) { const ro = new ResizeObserver(sizeVars); document.addEventListener('DOMContentLoaded', () => { const el = dockEl(); if (el) ro.observe(el); }); }

  /* ---------- your offline songs (stored on this device) ---------- */
  const ltr = x => '\u2066' + x + '\u2069';                        // keep "422 KB" in reading order inside Arabic sentences
  const sizeLine = () => { const s = OL().stats(); return s.n ? t('ol.count', { n: s.n, size: ltr(LIB().fmtSize(s.size)) }) : ''; };
  function visibleSongs() { const q = UI.filter.mq || '', all = OL().list(); return q ? all.filter(x => LIB().matches(x, q)) : all; }
  function offListHtml() {
    const all = OL().list(), f = visibleSongs(), lim = UI.filter.mshow || 60, st = OL().state(), ML = LIB();
    if (!all.length) return '<p class="muted sm center ol-empty">' + esc(t('ol.empty')) + '</p>';
    if (!f.length) return '<p class="muted sm center ol-empty">' + esc(t('ol.noMatch')) + '</p>';
    return '<ul class="ml-list">' + f.slice(0, lim).map(x => {
      const on = st.id === x.id;
      return '<li class="ml-row' + (on ? ' on' : '') + '"><button type="button" class="ml-play" data-act="offPlay" data-id="' + esc(x.id) + '">' + ic(on && st.playing ? 'volume' : 'play', 14) +
        '<span><b>' + esc(x.name) + '</b><small dir="ltr">' + (x.dur ? ML.fmtDur(x.dur) + ' · ' : '') + ML.fmtSize(x.size) + '</small></span></button>' +
        '<button type="button" class="icon-btn xs" data-act="offDel" data-id="' + esc(x.id) + '" aria-label="' + esc(t('ol.remove')) + '" title="' + esc(t('ol.remove')) + '">' + ic('trash', 16) + '</button></li>';
    }).join('') + '</ul>' + (f.length > lim ? '<button type="button" class="btn sm block" data-act="offMore">' + esc(t('ol.more', { n: f.length - lim })) + '</button>' : '');
  }
  /** redraw just the song list and the count (so a search box keeps its focus and the page does not jump) */
  M.refreshList = () => {
    const l = $('#ol-list'); if (l) l.innerHTML = offListHtml();
    const c = $('#ol-count'); if (c) c.textContent = sizeLine();
  };
  M.search = v => { UI.filter.mq = String(v || ''); UI.filter.mshow = 60; M.refreshList(); };
  M.more = () => { UI.filter.mshow = (UI.filter.mshow || 60) + 100; M.refreshList(); };
  M.playFromList = id => M.playLocal(id, visibleSongs().map(x => x.id));
  async function fillUsage() {
    const el = $('#ol-use'); if (!el || !OL().supported) return;
    const u = await OL().usage(); if (!u || !u.quota || !$('#ol-use')) return;
    $('#ol-use').textContent = t('ol.storage', { used: ltr(LIB().fmtSize(u.used)), total: ltr(LIB().fmtSize(u.quota)) });
  }
  M.addFiles = async input => {
    const files = Array.prototype.slice.call(input.files || []); input.value = '';
    if (!files.length) return;
    const bar = $('#ol-prog');
    const show = (n, tot) => { const b = $('#ol-prog'); if (b) { b.hidden = false; b.innerHTML = '<div class="bar"><i style="width:' + Math.round(n / tot * 100) + '%"></i></div><small>' + esc(t('ol.adding', { done: n, total: tot })) + '</small>'; } };
    if (bar) show(0, files.length);
    const r = await OL().add(files, show);
    const parts = [];
    if (r.added) parts.push(t('ol.added', { n: r.added }));
    if (r.skipped) parts.push(t('ol.skipped', { n: r.skipped }));
    if (r.failed + r.ignored) parts.push(t('ol.failed', { n: r.failed + r.ignored }));
    if (r.full) parts.push(t('ol.full'));
    UI.toast(parts.join(' · ') || t('ol.failed', { n: files.length }), { ms: 4500 });
    if (UI.filter.tmusic && App.route() === 'train') App.render();
  };
  function offlineCard() {
    if (!OL() || !LIB()) return '';
    let h = '<section class="card ol-card"><div class="mh-top"><span class="mh-ic ol">' + ic('phone', 24) + '</span><div><h3>' + esc(t('ol.title')) + '</h3><p class="muted sm">' + esc(t('ol.sub')) + '</p></div></div>';
    if (!OL().supported) return h + '<p class="muted sm">' + esc(t('ol.noSupport')) + '</p></section>';
    if (!OL().ready()) { OL().load().then(() => { if (UI.filter.tmusic && App.route() === 'train') App.render(); }); return h + '<p class="muted sm center">…</p></section>'; }
    const n = OL().list().length, dirOk = 'webkitdirectory' in document.createElement('input') && !(window.matchMedia && matchMedia('(pointer: coarse)').matches);
    h += '<p class="ol-stats muted sm"><span id="ol-count">' + esc(sizeLine()) + '</span> <span id="ol-use"></span></p>' +
      '<div class="row-btns"><button type="button" class="btn primary" data-act="offAdd">' + ic('plus', 16) + esc(t('ol.add')) + '</button>' +
      (dirOk ? '<button type="button" class="btn" data-act="offFolder">' + ic('folder', 16) + esc(t('ol.folder')) + '</button>' : '') + '</div>' +
      '<input type="file" id="ol-files" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.opus,.flac" multiple hidden>' +
      (dirOk ? '<input type="file" id="ol-folder" webkitdirectory multiple hidden>' : '') +
      '<div id="ol-prog" class="ol-prog" hidden></div>';
    if (n) {
      h += '<div class="row-btns"><button type="button" class="btn sm" data-act="offPlayAll">' + ic('play', 14) + esc(t('ol.playAll')) + '</button>' +
        '<button type="button" class="btn sm" data-act="offShuffleAll">' + ic('shuffle', 14) + esc(t('ol.shuffleAll')) + '</button></div>';
      if (n > 5) h += '<div class="fld"><input type="search" id="ol-search" autocomplete="off" placeholder="' + esc(t('ol.search')) + '" value="' + esc(UI.filter.mq || '') + '" aria-label="' + esc(t('ol.search')) + '"></div>';
    }
    h += '<div id="ol-list">' + offListHtml() + '</div>';
    if (n) h += '<div class="row-btns"><button type="button" class="btn sm danger-ghost" data-act="offClear">' + ic('trash', 14) + esc(t('ol.clear')) + '</button></div>';
    h += '<p class="muted sm ol-rights">' + ic('info', 14) + '<span>' + esc(t('ol.rights')) + '</span></p>' +
      '<h4 class="sm-h">' + esc(t('ol.where')) + '</h4><p class="muted sm">' + esc(t('ol.whereHint')) + '</p><div class="row-btns tight">' +
      [['Pixabay Music', 'https://pixabay.com/music/'], ['Jamendo', 'https://www.jamendo.com/'], ['Free Music Archive', 'https://freemusicarchive.org/'], ['Incompetech', 'https://incompetech.com/music/royalty-free/']].map(l => '<a class="btn sm" target="_blank" rel="noopener noreferrer" href="' + l[1] + '">' + l[0] + '</a>').join('') + '</div></section>';
    setTimeout(fillUsage, 0);
    return h;
  }

  /* ---------- the library screen (Train -> Music) ---------- */
  function tile(p) {
    const on = cur && cur.item.id === p.id;
    return '<button type="button" class="mtile c-' + p.cat + (on ? ' on' : '') + '" data-act="musicPlay" data-id="' + p.id + '">' +
      '<span class="mt-art">' + ic(on ? 'volume' : ICON[p.cat] || 'music', 20) + '</span>' +
      '<span class="mt-tx"><b>' + esc(nameOf(p)) + '</b><small>' + esc(descOf(p)) + '</small></span></button>';
  }
  UI.musicView = () => {
    const f = UI.filter.music || 'all', today = D.daily(Store.todayKey()), mine = read();
    let h = '<section class="card music-hero"><div class="mh-top"><span class="mh-ic">' + ic('music', 26) + '</span><div><h3>' + esc(t('mu.title')) + '</h3><p class="muted sm">' + esc(t('mu.sub')) + '</p></div></div>' +
      '<div class="row-btns">' +
        '<button type="button" class="btn primary" data-act="musicShuffle">' + ic('shuffle', 18) + esc(t('mu.surprise')) + '</button>' +
        '<button type="button" class="btn" data-act="musicDaily">' + ic('star', 18) + esc(t('mu.today')) + ': ' + esc(nameOf(today)) + '</button></div></section>';
    h += offlineCard();

    h += '<div class="chips scroll">' + ['all'].concat(D.CATS).map(c => '<button type="button" class="chip' + (f === c ? ' on' : '') + '" data-act="mcat" data-v="' + c + '">' + esc(t('mu.cat.' + c)) + '</button>').join('') + '</div>';
    (f === 'all' ? D.CATS : [f]).forEach(c => {
      const list = D.LIBRARY.filter(p => p.cat === c); if (!list.length) return;
      h += '<section class="mgroup">' + (f === 'all' ? '<h4>' + esc(t('mu.cat.' + c)) + '</h4>' : '') + '<div class="mgrid">' + list.map(tile).join('') + '</div></section>';
    });

    h += '<section class="card"><h3>' + ic('link', 18) + esc(t('mu.own')) + '</h3><p class="muted sm">' + esc(t('mu.ownHint')) + '</p>' +
      '<div class="fld"><label for="music-url">' + esc(t('mu.url')) + '</label><input type="url" id="music-url" dir="ltr" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://open.spotify.com/playlist/…"></div>' +
      '<div class="fld"><label for="music-name">' + esc(t('mu.name')) + '</label><input type="text" id="music-name" maxlength="60" autocomplete="off"></div>' +
      '<div class="row-btns"><button type="button" class="btn primary" data-act="musicPlayUrl">' + ic('play', 16) + esc(t('mu.play')) + '</button>' +
      '<button type="button" class="btn" data-act="musicSave">' + ic('plus', 16) + esc(t('mu.saveBtn')) + '</button></div>';
    if (mine.length) {
      h += '<h4 class="sm-h">' + esc(t('mu.saves')) + '</h4><ul class="msaved">' + mine.map((m, i) => {
        const it = D.parse(m.u);
        return '<li><button type="button" class="ms-play" data-act="musicMine" data-i="' + i + '">' + ic('play', 14) + '<span><b>' + esc(m.t) + '</b><small>' + esc(it ? srcName(it.kind) : '') + '</small></span></button>' +
          '<button type="button" class="icon-btn xs" data-act="musicRemoveMine" data-i="' + i + '" aria-label="' + esc(t('mu.remove')) + '">' + ic('trash', 16) + '</button></li>';
      }).join('') + '</ul>';
    }
    h += '</section>';

    const q = encodeURIComponent('workout motivation');
    h += '<section class="card"><h3>' + ic('globe', 18) + esc(t('mu.openApps')) + '</h3><div class="row-btns">' +
      '<a class="btn sm" target="_blank" rel="noopener noreferrer" href="https://open.spotify.com/search/' + q + '">Spotify</a>' +
      '<a class="btn sm" target="_blank" rel="noopener noreferrer" href="https://music.youtube.com/search?q=' + q + '">YouTube Music</a>' +
      '<a class="btn sm" target="_blank" rel="noopener noreferrer" href="https://music.apple.com/search?term=' + q + '">Apple Music</a></div></section>';
    h += '<p class="note">' + ic('info', 16) + '<span>' + esc(t('mu.spotifyHint')) + ' ' + esc(t('mu.privacy')) + '</span></p>';
    return h;
  };
})();
