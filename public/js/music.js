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
  function headHtml() {
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
    el.className = 'mdock' + (expanded ? ' exp' : '') + (k === 'youtube' ? ' yt' : '') + (k === 'soundcloud' ? ' sc' : '');
    el.innerHTML = '<div class="mdock-h">' + headHtml() + '</div><div class="mdock-b">' +
      (navigator.onLine === false
        ? '<p class="mdock-off">' + esc(t('mu.offline')) + '</p>'
        : '<iframe src="' + esc(cur.src) + '" title="' + esc(cur.title) + '" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>') + '</div>';
    sizeVars(); setTimeout(sizeVars, 150); setTimeout(sizeVars, 600);
  }
  /** after a language change: only the header text is redrawn (the song keeps playing) */
  M.refreshHead = () => { if (!cur) return; const h = $('#music .mdock-h'); if (h) h.innerHTML = headHtml(); };
  M.current = () => cur;

  M.play = (item, title, sub) => {
    const src = D.embedSrc(item, document.documentElement.dataset.theme === 'dark');
    if (!src) return false;
    cur = { item, title, sub, src }; expanded = false; render();
    return true;
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
  M.close = () => { cur = null; expanded = false; render(); };
  window.addEventListener('online', () => { if (cur) render(); });
  window.addEventListener('offline', () => { if (cur) render(); });
  if (window.ResizeObserver) { const ro = new ResizeObserver(sizeVars); document.addEventListener('DOMContentLoaded', () => { const el = dockEl(); if (el) ro.observe(el); }); }

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
