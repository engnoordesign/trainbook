/* App controller: routing, actions, theme, PWA. */
(function () {
  'use strict';
  var UI = window.UI, V = UI.views, $ = UI.$, $$ = UI.$$, esc = UI.esc, ic = UI.ic;
  var t = function (k, v) { return I18N.t(k, v); };
  var ROUTES = ['today', 'course', 'train', 'courses', 'history'];
  var NAV_ICON = { today: 'today', course: 'course', train: 'train', courses: 'courses', history: 'history' };
  var TITLE = { today: 'nav.today', course: 'mc.title', train: 'nav.train', courses: 'c.title', history: 'nav.history' };

  var BUILD = 'dev'; /* stamped by scripts/stamp.js */
  var App = window.App = { VERSION: '1.0.0', BUILD: BUILD };
  var lastDay = null, quietFlag = false, deferredInstall = null, swReg = null, updating = false, pillCache = null;

  /* ---------- routing ---------- */
  function route() {
    var r = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return ROUTES.indexOf(r) >= 0 ? r : 'today';
  }
  App.route = route;
  App.go = function (r) {
    if (route() === r && location.hash === '#/' + r) { App.render(); window.scrollTo(0, 0); }
    else location.hash = '#/' + r;
  };
  App.quiet = function (fn) { quietFlag = true; try { fn(); } finally { quietFlag = false; } };

  /* ---------- theme ---------- */
  var COLORS = { light: '#f4f5f8', dark: '#0e1116', superLight: '#fff1f1', superDark: '#150b0c' };
  App.refreshTheme = function () {
    var signedIn = !!Auth.profile(), th = signedIn ? Store.get().theme : Auth.deviceTheme();
    if (th === 'auto') th = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var sup = signedIn && Store.isSuper(Store.todayKey());
    var root = document.documentElement;
    root.dataset.theme = th; root.dataset.super = sup ? '1' : '0';
    var m = $('meta[name=theme-color]');
    if (m) m.setAttribute('content', sup ? (th === 'dark' ? COLORS.superDark : COLORS.superLight) : COLORS[th]);
  };
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () { App.refreshTheme(); });
  }

  /* ---------- chrome (top bar, nav, pill) ---------- */
  var LOGO = UI.LOGO;

  function renderTop(r) {
    var sup = Store.isSuper(Store.todayKey());
    $('#top').innerHTML = '<div class="top-l"><span class="logo">' + LOGO + '</span><h1>' + esc(t(TITLE[r])) + '</h1></div><div class="top-r">' +
      '<button type="button" class="icon-btn hide-sm" data-act="openQR" aria-label="' + esc(t('qr.open')) + '" title="' + esc(t('qr.open')) + '">' + ic('qr', 20) + '</button>' +
      (App.canInstall() ? '<button type="button" class="icon-btn" data-act="install" aria-label="' + esc(t('set.installBtn')) + '">' + ic('download', 20) + '</button>' : '') +
      '<button type="button" class="icon-btn flame' + (sup ? ' on' : '') + '" data-act="openSuper" aria-label="' + esc(t('super.title')) + '">' + ic('flame', 20) + '</button>' +
      '<button type="button" class="icon-btn" data-act="openSettings" aria-label="' + esc(t('set.title')) + '">' + ic('sliders', 20) + '</button></div>';
  }
  function renderNav(r) {
    $('#nav').innerHTML = '<div class="nav-brand"><span class="logo">' + LOGO + '</span><b>TrainBook</b></div><nav aria-label="Main">' +
      ROUTES.map(function (x) {
        return '<a href="#/' + x + '" class="nav-i' + (x === r ? ' on' : '') + '"' + (x === r ? ' aria-current="page"' : '') + '>' + ic(NAV_ICON[x], 22) + '<span>' + esc(t('nav.' + x)) + '</span></a>';
      }).join('') + '</nav>';
  }
  function renderPill() {
    var el = $('#pill'), p = Auth.profile() && route() !== 'train' ? Timer.pill() : null;
    var sig = p ? p.icon + '|' + p.text + '|' + p.label : '';
    if (sig === pillCache) return;
    pillCache = sig;
    el.innerHTML = p ? '<a href="#/train" class="pill ' + p.label + '">' + ic(p.icon, 16) + '<b dir="ltr">' + esc(p.text) + '</b></a>' : '';
  }

  /* ---------- render ---------- */
  App.render = function () {
    if (!Auth.profile()) return;                 // locked: nothing personal is drawn
    var r = route();
    $('#view').innerHTML = V[r]();
    $('#view').dataset.route = r;
    renderTop(r); renderNav(r); renderPill();
    document.title = t(TITLE[r]) + ' · TrainBook';
    if (r === 'train') UI.tickTrain();
  };

  /* ---------- language ---------- */
  App.setLang = function (l) {
    I18N.setLang(l); Store.setPref('lang', l); Auth.setDevice({ lang: l });
    App.render(); UI.refreshSettings();
    if (window.Music) Music.refreshHead();
  };

  /* ---------- steppers ---------- */
  function setVal(scope, field, id, val) {
    $$('[data-val="' + field + '"][data-scope="' + scope + '"][data-for="' + id + '"]').forEach(function (n) {
      if (n.tagName === 'INPUT') n.value = val; else n.textContent = val;
    });
  }
  function doStep(b) {
    var scope = b.dataset.scope, field = b.dataset.field, id = b.dataset.id, k = b.dataset.k, d = +b.dataset.step, e;
    if (scope === 'entry') { e = Store.bumpEntry(k, id, 'reps', d); if (e) setVal('entry', 'reps', id, e.reps); }
    else if (scope === 'got') { e = Store.bumpEntry(k, id, 'got', d); if (e) setVal('got', 'got', id, e.got); }
    else if (scope === 'plan') { var v = Store.bumpPlan(id, d); if (v != null) setVal('plan', 'reps', id, v); }
    else if (scope === 'form') {
      var f = UI.formState(); if (!f) return;
      var sgn = d < 0 ? -1 : 1;
      if (field === 'reps') { f.reps = Math.max(1, Math.min(999, f.reps + sgn * UI.stepFor(f.unit))); f.touched = true; }
      else f.sets = Math.max(1, Math.min(20, f.sets + sgn));
      UI.syncForm();
    } else if (scope === 'iv') {
      App.quiet(function () { Timer.iv.config(field, d < 0 ? -1 : 1); });
      setVal('iv', field, '', Timer.s.iv[field]);
      var tt = $('#iv-total'); if (tt) tt.textContent = UI.ivTotalText();
      UI.tickTrain();
    }
  }
  var hold = null, holdFired = false;
  function stopHold() { if (hold) { clearTimeout(hold.t); clearInterval(hold.i); hold = null; } }
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('[data-step]');
    if (!b || b.disabled) return;
    holdFired = false; stopHold();
    hold = { b: b };
    hold.t = setTimeout(function () { holdFired = true; doStep(b); hold.i = setInterval(function () { doStep(b); }, 85); }, 450);
  });
  ['pointerup', 'pointercancel', 'contextmenu', 'blur'].forEach(function (ev) { window.addEventListener(ev, stopHold, true); });

  /* ---------- install / update ---------- */
  App.canInstall = function () { return !!deferredInstall && !App.isStandalone(); };
  App.isStandalone = function () { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; };
  App.isIOS = function () { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); };
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; renderTop(route()); UI.refreshSettings(); });
  window.addEventListener('appinstalled', function () { deferredInstall = null; renderTop(route()); UI.refreshSettings(); UI.toast(t('set.installedToast')); });
  function install() {
    if (!deferredInstall) return;
    var p = deferredInstall; deferredInstall = null;
    p.prompt(); (p.userChoice || Promise.resolve()).then(function () { renderTop(route()); UI.refreshSettings(); });
  }
  function promptUpdate(worker) {
    UI.toast(t('upd.ready'), { label: t('upd.reload'), ms: 30000, onClick: function () { updating = true; worker.postMessage('SKIP_WAITING'); } });
  }
  function registerSW() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    /* While developing on this computer there is no offline cache (it only causes stale pages), and any leftover worker is removed.
       On a real address the worker always runs: a stamped build precaches everything, an unstamped one is network-first but still opens offline. */
    if (BUILD === 'dev' && /^(localhost|127\.\d+\.\d+\.\d+|\[::1\])$/.test(location.hostname)) {
      navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () { });
      return;
    }
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      swReg = reg;
      if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var nw = reg.installing; if (!nw) return;
        nw.addEventListener('statechange', function () { if (nw.state === 'installed' && navigator.serviceWorker.controller) promptUpdate(nw); });
      });
    }).catch(function () { });
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (updating) location.reload(); });
  }
  function checkUpdate() {
    if (!swReg) { UI.toast(t('upd.na')); return; }
    swReg.update().catch(function () { }).then(function () {
      setTimeout(function () {
        if (swReg.waiting) promptUpdate(swReg.waiting);
        else if (swReg.installing) UI.toast(t('upd.downloading'));
        else UI.toast(t('upd.latest'));
      }, 1200);
    });
  }

  /* ---------- backup ---------- */
  function exportData() {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([Store.exportJSON()], { type: 'application/json' }));
    a.download = 'trainbook-backup-' + Store.todayKey() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }
  function importData(file) {
    var rd = new FileReader();
    rd.onload = function () {
      try {
        Store.importJSON(String(rd.result));
        var lg = Store.get().lang || Auth.deviceLang(); Store.get().lang = lg;
        I18N.setLang(lg); Auth.setDevice({ lang: lg });
        UI.closeSheet(); App.refreshTheme(); App.render(); UI.toast(t('set.imported'));
      } catch (err) { UI.toast(t('set.importFail')); }
    };
    rd.readAsText(file);
  }

  /* ---------- action table ---------- */
  var A = {
    status: function (d) { Store.setStatus(d.k, d.id, d.st); App.render(); },
    rmEntry: function (d) {
      UI.confirm({ title: t('rm.title'), msg: t('rm.msg'), ok: t('a.remove'), danger: true, onOk: function () { Store.removeEntry(d.k, d.id); App.render(); } });
    },
    filterToday: function (d) { UI.filter.today = d.v; App.render(); },
    filterCourse: function (d) { UI.filter.course = d.v; App.render(); },
    ctab: function (d) { UI.filter.ctab = d.v; App.render(); },
    addToday: function () { UI.openExercise({ mode: 'today' }); },
    addPlan: function () { UI.openExercise({ mode: 'plan' }); },
    addPlanDay: function (d) { UI.openExercise({ mode: 'plan', wd: +d.wd }); },
    editPlan: function (d) { UI.openExercise({ mode: 'edit', id: d.id }); },
    openCourse: function (d) { UI.openCourse(d.id); },
    restartCourse: function (d) { UI.openCourse(d.id); },
    stopCourse: function () {
      UI.confirm({ title: t('c.stopTitle'), msg: t('c.stopMsg'), ok: t('c.stop'), danger: true, onOk: function () { Store.stopCourse(); App.render(); UI.toast(t('c.stopped')); } });
    },
    openSuper: function () { UI.openSuper(); },
    toggleSuperDate: function (d) { Store.toggleSuperDate(d.k); App.refreshTheme(); App.render(); },
    pickDay: function (d) { UI.hist.sel = d.k; App.render(); },
    monthPrev: function () { var h = UI.hist; h.m--; if (h.m < 0) { h.m = 11; h.y--; } App.render(); },
    monthNext: function () { var h = UI.hist; h.m++; if (h.m > 11) { h.m = 0; h.y++; } App.render(); },
    openSettings: function () { UI.openSettings(); Sync.info().then(function () { UI.refreshSettings(); }); },
    syncNow: function () { Account.syncNow(); },
    acctSyncOn: function () { Account.openSyncOn(); },
    openQR: function () { UI.openQR(); },
    qrCopy: function () { UI.qrAct('qrCopy'); },
    qrSave: function () { UI.qrAct('qrSave'); },
    qrShare: function () { UI.qrAct('qrShare'); },
    setLang: function (d) { App.setLang(d.v); },
    setTheme: function (d) { Store.setPref('theme', d.v); Auth.setDevice({ theme: d.v }); App.refreshTheme(); UI.refreshSettings(); },
    setWeek: function (d) { Store.setPref('weekStart', +d.v); App.render(); UI.refreshSettings(); },
    install: install,
    export: exportData,
    checkUpdate: checkUpdate,
    /* profile and security */
    acctLock: function () { Account.lock(); },
    acctSwitch: function () { Account.switchProfile(); },
    acctAuto: function (d) { Account.setAuto(d.v); },
    acctStay: function () { Account.toggleStay(); },
    acctRename: function () { Account.openRename(); },
    acctPass: function () { Account.openPassword(); },
    acctKey: function () { Account.openKey(); },
    acctDelete: function () { Account.openDelete(); },
    acctCopyKey: function () { Account.copyKey(); },
    acctSaveKey: function () { Account.saveKey(); },
    peek: function (d) { Auth.peek(d.for); },
    chk: function (d) { Store.setStatus(d.k, d.id, 'done'); App.render(); },
    closeSheet: function () { UI.closeSheet(); },
    confirmOk: function () { UI.confirmOk(); },
    fCat: function (d) { UI.formAct('fCat', d.v); },
    fUnit: function (d) { UI.formAct('fUnit', d.v); },
    fScope: function (d) { UI.formAct('fScope', d.v); },
    fDay: function (d) { UI.formAct('fDay', d.v); },
    fSave: function () { UI.formSave(); },
    fDelete: function () { UI.formDelete(); },
    superToday: function () { UI.superAct('superToday'); },
    superWd: function (d) { UI.superAct('superWd', d.v); },
    superAdd: function () { UI.superAct('superAdd'); },
    superDel: function (d) { UI.superAct('superDel', d.k); },
    guide: function (d) { UI.openGuide(d.ex); },
    guidePlay: function () { UI.guidePlay(); },
    cGuide: function () { UI.courseAct('cGuide'); },
    cEx: function (d) { UI.courseAct('cEx', d.v); },
    cDay: function (d) { UI.courseAct('cDay', d.v); },
    cStart: function () { UI.courseAct('cStart'); },
    /* timers */
    tmode: function (d) { UI.filter.tmusic = false; Timer.setMode(d.v); App.render(); },
    tmusic: function () { UI.filter.tmusic = true; App.render(); },
    mcat: function (d) { UI.filter.music = d.v; App.render(); },
    musicPlay: function (d) { var p = MusicData.byId(d.id); if (p && Music.playLib(p)) App.render(); },
    musicShuffle: function () { Music.shuffle(); if (UI.filter.tmusic) App.render(); },
    musicDaily: function () { var p = MusicData.daily(Store.todayKey()); if (Music.playLib(p)) { UI.toast(t('mu.playing', { n: I18N.lang === 'ar' ? p.ar : p.name })); App.render(); } },
    musicExpand: function () { Music.expand(); },
    musicClose: function () { Music.close(); if (UI.filter.tmusic) App.render(); },
    musicPlayUrl: function () {
      var u = $('#music-url'), n = $('#music-name');
      if (u && Music.playUrl(u.value, n && n.value)) UI.toast(t('mu.playing', { n: Music.current().title }));
    },
    musicSave: function () {
      var u = $('#music-url'), n = $('#music-name');
      if (u && Music.saveUrl(u.value, n && n.value)) { UI.toast(t('mu.saved')); App.render(); }
    },
    offAdd: function () { var i = $('#ol-files'); if (i) i.click(); },
    offFolder: function () { var i = $('#ol-folder'); if (i) i.click(); },
    offPlayAll: function () { Music.playAllLocal(false); },
    offShuffleAll: function () { Music.playAllLocal(true); },
    offPlay: function (d) { Music.playFromList(d.id); },
    offDel: function (d) { Offline.remove(d.id).then(function () { UI.toast(t('ol.removed')); Music.refreshList(); }); },
    offClear: function () {
      UI.confirm({ title: t('ol.clearTitle'), msg: t('ol.clearMsg', { n: Offline.list().length }), ok: t('a.remove'), danger: true,
        onOk: function () { Offline.clear().then(function () { UI.toast(t('ol.removed')); App.render(); }); } });
    },
    offMore: function () { Music.more(); },
    offToggle: function () { Offline.toggle(); },
    offPrev: function () { Offline.prev(); },
    offNext: function () { Offline.next(); },
    offShuf: function () { Offline.setShuffle(!Offline.mode().shuffle); },
    offRep: function () { Offline.cycleRepeat(); },
    musicMine: function (d) { var m = Music.mine()[+d.i]; if (m) { Music.playUrl(m.u, m.t); App.render(); } },
    musicRemoveMine: function (d) { Music.removeMine(d.i); App.render(); },
    swToggle: function () { Timer.sw.toggle(); },
    swLap: function () { Timer.sw.lap(); },
    cdToggle: function () { Timer.cd.toggle(); },
    cdPreset: function (d) { Timer.cd.start(+d.ms); },
    cdAdd: function (d) { Timer.cd.add(+d.ms); },
    cdSetCustom: function () { var s = UI.readHMS('cdt'); if (!s) { UI.toast(t('tm.errRange')); return; } Timer.cd.set(s * 1000); },
    cdStartCustom: function () { var s = UI.readHMS('cdt'); if (!s) { UI.toast(t('tm.errRange')); return; } Timer.cd.start(s * 1000); },
    cdSavePreset: function () {
      var s = UI.readHMS('cdt'); if (!s) { UI.toast(t('tm.errRange')); return; }
      if (Timer.presets.add(s)) {
        if (!Timer.s.cd.run) Timer.cd.set(s * 1000);            // keep the time you typed on screen (a running timer is left alone)
        UI.toast(t('tm.presetSaved', { t: UI.presetLabel(s) }));
      } else UI.toast(t('tm.presetExists'));
    },
    presetDel: function (d) { Timer.presets.del(+d.s); },
    swTargetSet: function () { var s = UI.readHMS('swt'); if (!s) { UI.toast(t('tm.errRange')); return; } Timer.sw.target(s * 1000); },
    swTargetClear: function () { Timer.sw.target(0); },
    ivToggle: function () { Timer.iv.toggle(); },
    tmute: function () { Timer.toggleMute(); App.render(); },
    treset: function () { var m = Timer.s.mode; (m === 'sw' ? Timer.sw : m === 'cd' ? Timer.cd : Timer.iv).reset(); }
  };

  document.addEventListener('click', function (e) {
    var st = e.target.closest('[data-step]');
    if (st) { if (holdFired) { holdFired = false; return; } doStep(st); return; }
    var go = e.target.closest('[data-go]');
    if (go) { UI.closeSheet(true); App.go(go.dataset.go); return; }
    var a = e.target.closest('[data-act]');
    if (a && A[a.dataset.act]) { if (a.disabled) return; A[a.dataset.act](a.dataset); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'f-title') UI.formInput(e.target.value);
    else if (e.target.id === 'qr-url') UI.qrInput(e.target.value);
    else if (e.target.id === 'ol-search') Music.search(e.target.value);
    else if (e.target.id === 'mp-seek') { var st = Offline.state(); if (st.dur) Offline.seek(e.target.value / 1000 * st.dur); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.id === 'imp-file' && el.files[0]) importData(el.files[0]);
    else if (el.id === 'ol-files' || el.id === 'ol-folder') Music.addFiles(el);
    else if (el.classList && el.classList.contains('sin') && el.dataset.scope === 'iv') {       // a value typed into the interval settings
      App.quiet(function () { Timer.iv.set(el.dataset.field, el.value); });
      setVal('iv', el.dataset.field, '', Timer.s.iv[el.dataset.field]);
      var tt = $('#iv-total'); if (tt) tt.textContent = UI.ivTotalText();
      UI.tickTrain();
    }
  });
  /* forms inside dialogs (the lock screen handles its own forms in auth.js) */
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('form[data-submit]');
    if (!f) return;
    e.preventDefault();
    Account.submit(f.dataset.submit, f);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && UI.sheetOpen()) UI.closeSheet();
    if (e.key === 'Enter' && e.target.id === 'f-title') { e.preventDefault(); UI.formSave(); }
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.hms) {              // Enter in a time field = go
      e.preventDefault();
      if (e.target.dataset.hms === 'cdt') A.cdStartCustom(); else if (e.target.dataset.hms === 'swt') A.swTargetSet();
    }
  });
  window.addEventListener('hashchange', function () { UI.closeSheet(true); window.scrollTo(0, 0); App.render(); });

  /* ---------- day rollover ---------- */
  function checkDay() {
    if (!Auth.profile()) return;
    var d = Store.todayKey();
    if (d !== lastDay) { lastDay = d; Store.ensureDays(); App.refreshTheme(); if (!UI.sheetOpen()) App.render(); }
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkDay(); });
  setInterval(checkDay, 30000);

  /* ---------- boot ---------- */
  /* Called by auth.js right after a profile is unlocked (the data is loaded and decrypted by then). */
  App.afterUnlock = function () {
    var S = Store.get();
    I18N.setLang(S.lang || Auth.deviceLang());
    Auth.setDevice({ lang: I18N.lang, theme: S.theme });
    Store.ensureDays(); lastDay = Store.todayKey();
    App.refreshTheme();
    if (!/^#\/(today|course|train|courses|history)$/.test(location.hash)) history.replaceState(null, '', '#/today');
    window.scrollTo(0, 0);
    App.render();
    document.documentElement.classList.add('ready');
  };

  function boot() {
    I18N.setLang(Auth.deviceLang());
    Store.onStorageError = function () { UI.toast(t('au.errGeneric'), { ms: 8000 }); };
    Sync.onStatus(function () { UI.refreshSettings(); });       // keeps the "synced / offline" line in Settings live
    Timer.load();
    Timer.setHandlers(function () { if (route() === 'train') UI.tickTrain(); renderPill(); }, function () { if (!quietFlag) { App.render(); } });
    App.refreshTheme();
    registerSW();
    Auth.start();                                  // shows the lock screen, or resumes a signed-in session -> App.afterUnlock()
  }
  boot();
})();
