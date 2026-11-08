/* Stopwatch / countdown / interval engine. Timestamp based (accurate in background, survives reload). */
(function () {
  'use strict';

  var KEY = 'trainbook.timer.v1';
  var T = {
    mode: 'sw',   // visible segment: sw | cd | iv
    mute: false,
    sw: { run: false, start: 0, base: 0, laps: [] },
    cd: { run: false, end: 0, left: 60000, total: 60000, fin: false, lastSec: -1 },
    iv: { run: false, start: 0, base: 0, work: 30, rest: 15, rounds: 8, fin: false, phaseId: -1, lastSec: -1 }
  };
  var loopId = null, onTick = null, onChange = null;

  function now() { return Date.now(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) { } }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (o) {
        ['sw', 'cd', 'iv'].forEach(function (k) { if (o[k]) Object.assign(T[k], o[k]); });
        if (o.mode) T.mode = o.mode;
        T.mute = !!o.mute;
      }
    } catch (e) { }
    /* a countdown that ended while the app was closed */
    if (T.cd.run && T.cd.end - now() <= 0) { T.cd.run = false; T.cd.left = 0; T.cd.fin = true; }
    var info = ivInfo();
    if (T.iv.run && info.phase === 'done') { T.iv.run = false; T.iv.fin = true; }
    if (anyRunning()) ensureLoop();
  }
  function changed() { save(); if (onChange) onChange(); }

  /* ---------- sound / vibration / wake lock ---------- */
  var ac = null;
  function unlock() {
    try {
      if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); }
      if (ac && ac.state === 'suspended') ac.resume();
    } catch (e) { }
  }
  function beep(freq, ms, vol) {
    if (T.mute || !ac) return;
    try {
      var o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime, d = (ms || 150) / 1000;
      o.type = 'sine'; o.frequency.value = freq || 880;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.28, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(ac.destination);
      o.start(t0); o.stop(t0 + d + 0.03);
    } catch (e) { }
  }
  function vib(p) { if (!T.mute && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { } } }
  function alarm() {
    beep(880, 180); setTimeout(function () { beep(880, 180); }, 260); setTimeout(function () { beep(1175, 420); }, 520);
    vib([220, 90, 220, 90, 520]);
  }

  var wl = null, wlBusy = false;
  function setWake(on) {
    if (!('wakeLock' in navigator) || wlBusy) return;
    if (on && !wl) {
      wlBusy = true;
      navigator.wakeLock.request('screen').then(function (l) { wl = l; wl.addEventListener('release', function () { wl = null; }); })
        .catch(function () { }).then(function () { wlBusy = false; });
    } else if (!on && wl) {
      var l = wl; wl = null; l.release().catch(function () { });
    }
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && anyRunning()) { setWake(true); tick(); } });

  /* ---------- stopwatch ---------- */
  function swElapsed() { return T.sw.base + (T.sw.run ? now() - T.sw.start : 0); }
  function swToggle() {
    unlock();
    if (T.sw.run) { T.sw.base = swElapsed(); T.sw.run = false; }
    else { T.sw.start = now(); T.sw.run = true; ensureLoop(); }
    changed();
  }
  function swLap() {
    if (!T.sw.run) return;
    var el = swElapsed(), prev = T.sw.laps.length ? T.sw.laps[0].total : 0;
    T.sw.laps.unshift({ n: T.sw.laps.length + 1, total: el, split: el - prev });
    changed();
  }
  function swReset() { T.sw = { run: false, start: 0, base: 0, laps: [] }; changed(); }

  /* ---------- countdown ---------- */
  function cdLeft() { return T.cd.run ? Math.max(0, T.cd.end - now()) : T.cd.left; }
  function cdSet(ms) { T.cd.run = false; T.cd.total = T.cd.left = Math.max(1000, ms); T.cd.fin = false; T.cd.lastSec = -1; changed(); }
  function cdStart(ms) {
    unlock();
    if (ms) { T.cd.total = T.cd.left = ms; }
    if (T.cd.fin || T.cd.left <= 0) { T.cd.left = T.cd.total; }
    T.cd.fin = false; T.cd.lastSec = -1;
    T.cd.end = now() + T.cd.left; T.cd.run = true;
    ensureLoop(); changed();
  }
  function cdToggle() {
    if (T.cd.run) { T.cd.left = cdLeft(); T.cd.run = false; changed(); }
    else cdStart();
  }
  function cdAdd(ms) {
    var left = Math.max(1000, cdLeft() + ms);
    T.cd.total = Math.max(1000, T.cd.total + ms);
    if (T.cd.run) T.cd.end = now() + left; else T.cd.left = left;
    T.cd.fin = false; changed();
  }
  function cdReset() { T.cd.run = false; T.cd.left = T.cd.total; T.cd.fin = false; T.cd.lastSec = -1; changed(); }

  /* ---------- intervals ---------- */
  function ivElapsed() { return T.iv.base + (T.iv.run ? now() - T.iv.start : 0); }
  function ivTotal() { var v = T.iv; return v.rounds * v.work + (v.rounds - 1) * v.rest; }
  function ivInfo() {
    var v = T.iv, e = ivElapsed() / 1000, total = ivTotal(), cycle = v.work + v.rest;
    if (e >= total) return { phase: 'done', round: v.rounds - 1, left: 0, phaseTotal: 0, totalLeft: 0 };
    var r = Math.floor(e / cycle), w = e - r * cycle;
    if (w < v.work) return { phase: 'work', round: r, left: v.work - w, phaseTotal: v.work, totalLeft: total - e };
    return { phase: 'rest', round: r, left: cycle - w, phaseTotal: v.rest, totalLeft: total - e };
  }
  function ivConfig(field, delta) {
    if (T.iv.run || (T.iv.base && !T.iv.fin)) return;
    var lim = { work: [5, 600, 5], rest: [0, 600, 5], rounds: [1, 50, 1] }[field];
    if (!lim) return;
    T.iv[field] = Math.max(lim[0], Math.min(lim[1], T.iv[field] + delta * lim[2]));
    T.iv.fin = false; changed();
  }
  function ivToggle() {
    unlock();
    if (T.iv.run) { T.iv.base = ivElapsed(); T.iv.run = false; }
    else {
      if (T.iv.fin) { T.iv.base = 0; T.iv.fin = false; }
      T.iv.start = now(); T.iv.run = true; T.iv.phaseId = -1; T.iv.lastSec = -1; ensureLoop();
    }
    changed();
  }
  function ivReset() { var v = T.iv; T.iv = { run: false, start: 0, base: 0, work: v.work, rest: v.rest, rounds: v.rounds, fin: false, phaseId: -1, lastSec: -1 }; changed(); }

  /* ---------- loop ---------- */
  function anyRunning() { return T.sw.run || T.cd.run || T.iv.run; }
  function ensureLoop() { if (!loopId) loopId = setInterval(tick, 100); setWake(true); }
  function tick() {
    var t = now();
    if (T.cd.run) {
      var rem = T.cd.end - t;
      if (rem <= 0) { T.cd.run = false; T.cd.left = 0; T.cd.fin = true; alarm(); changed(); }
      else {
        var s = Math.ceil(rem / 1000);
        if (s <= 3 && s !== T.cd.lastSec) { T.cd.lastSec = s; beep(660, 90); }
      }
    }
    if (T.iv.run) {
      var info = ivInfo();
      if (info.phase === 'done') { T.iv.run = false; T.iv.fin = true; T.iv.base = ivTotal() * 1000; alarm(); changed(); }
      else {
        var pid = info.round * 2 + (info.phase === 'work' ? 0 : 1);
        if (pid !== T.iv.phaseId) {
          T.iv.phaseId = pid; T.iv.lastSec = -1;
          if (info.phase === 'work') { beep(988, 260); vib([160]); } else { beep(523, 260); vib([90, 60, 90]); }
          if (onChange) onChange();
        } else {
          var sl = Math.ceil(info.left);
          if (sl <= 3 && sl !== T.iv.lastSec) { T.iv.lastSec = sl; beep(700, 80); }
        }
      }
    }
    if (!anyRunning()) { clearInterval(loopId); loopId = null; setWake(false); }
    if (onTick) onTick();
  }

  function pill() {
    if (T.cd.run) return { icon: 'train', text: fmt(cdLeft(), false), label: 'cd' };
    if (T.iv.run) { var i = ivInfo(); return { icon: 'bolt', text: fmt(i.left * 1000, false), label: i.phase }; }
    if (T.sw.run) return { icon: 'train', text: fmtUp(swElapsed(), false), label: 'sw' };
    return null;
  }

  /* countdown format (rounds UP so 0.4s left still shows 00:01): mm:ss(.cc) / h:mm:ss */
  function fmt(ms, centi) {
    ms = Math.max(0, ms);
    var tot = centi ? Math.floor(ms / 10) : Math.ceil(ms / 1000) * 100;
    var cs = tot % 100, s = Math.floor(tot / 100), m = Math.floor(s / 60), h = Math.floor(m / 60);
    s = s % 60; m = m % 60;
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    var out = (h ? h + ':' + p(m) : p(m)) + ':' + p(s);
    return centi ? out + '.' + p(cs) : out;
  }
  /* stopwatch format (floors, counts up) */
  function fmtUp(ms, centi) {
    ms = Math.max(0, ms);
    var tot = Math.floor(ms / 10), cs = tot % 100, s = Math.floor(tot / 100), m = Math.floor(s / 60), h = Math.floor(m / 60);
    s = s % 60; m = m % 60;
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    var out = (h ? h + ':' + p(m) : p(m)) + ':' + p(s);
    return centi ? out + '.' + p(cs) : out;
  }

  window.Timer = {
    s: T, load: load, save: save, unlock: unlock, anyRunning: anyRunning, pill: pill,
    setHandlers: function (tk, ch) { onTick = tk; onChange = ch; },
    setMode: function (m) { T.mode = m; save(); },
    toggleMute: function () { T.mute = !T.mute; save(); if (!T.mute) { unlock(); beep(740, 80); } },
    sw: { elapsed: swElapsed, toggle: swToggle, lap: swLap, reset: swReset },
    cd: { left: cdLeft, set: cdSet, start: cdStart, toggle: cdToggle, add: cdAdd, reset: cdReset },
    iv: { elapsed: ivElapsed, total: ivTotal, info: ivInfo, config: ivConfig, toggle: ivToggle, reset: ivReset },
    fmt: fmt, fmtUp: fmtUp, ivCfgLimits: { work: 5, rest: 5, rounds: 1 }
  };
})();
