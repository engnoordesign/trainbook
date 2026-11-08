/* State + persistence (localStorage). Everything stays on the device. */
(function () {
  'use strict';

  var KEY = 'trainbook.v1';
  var MAX_BACKFILL = 120;

  function def() {
    return {
      v: 1,
      lang: null,          // 'ar' | 'en'  (null = detect)
      theme: 'auto',       // 'auto' | 'light' | 'dark'
      weekStart: null,     // 0 Sun .. 6 Sat  (null = by language)
      plan: [],            // my routine: recurring exercises
      logs: {},            // 'YYYY-MM-DD' -> { items:[entry], skip:[planId] }
      course: null,        // active premade course {id,start,weeks,days}
      superDates: [],      // specific super days
      superWeekdays: [],   // recurring super weekdays
      shareUrl: '',        // custom address for the "get the app" QR code ('' = this page's address)
      lastSeen: null
    };
  }

  var S = def();
  var saveT = null;

  /* ---------- dates (local time, 'YYYY-MM-DD') ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(k, n) { var d = parse(k); d.setDate(d.getDate() + n); return key(d); }
  function diffDays(a, b) {
    var x = parse(a), y = parse(b);
    return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 864e5);
  }
  function wd(k) { return parse(k).getDay(); }
  function todayKey() { return key(new Date()); }
  function uid() { return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- persistence ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o === 'object') S = Object.assign(def(), o);
      }
    } catch (e) { /* private mode etc. -> memory only */ }
    normalise();
  }
  /* Validate everything that comes from storage / an imported file, so odd data can never break the UI or inject markup. */
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function idOk(s) { return typeof s === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(s); }
  function num(v, min, max, d) { v = +v; return isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : d; }
  function exOk(id) { return typeof id === 'string' && Data.EX[id] ? id : null; }
  function catOk(c) { return Data.CATS.indexOf(c) >= 0 ? c : 'full'; }
  function wdList(a) { return (Array.isArray(a) ? a : []).map(Number).filter(function (d) { return d >= 0 && d <= 6 && d % 1 === 0; }); }
  function cleanEntry(e) {
    return {
      id: e.id, planId: idOk(e.planId) ? e.planId : null, exId: exOk(e.exId), title: String(e.title || '').slice(0, 60), cat: catOk(e.cat),
      sets: num(e.sets, 1, 20, 1), reps: num(e.reps, 1, 999, 10), unit: e.unit === 'sec' ? 'sec' : 'reps',
      status: ['done', 'missed', 'partial'].indexOf(e.status) >= 0 ? e.status : null, got: e.got == null ? null : num(e.got, 0, 999, 0), locked: !!e.locked
    };
  }
  function normalise() {
    S.plan = (Array.isArray(S.plan) ? S.plan : []).filter(function (p) { return p && idOk(p.id); }).map(function (p) {
      return {
        id: p.id, exId: exOk(p.exId), title: String(p.title || '').slice(0, 60), cat: catOk(p.cat), sets: num(p.sets, 1, 20, 1), reps: num(p.reps, 1, 999, 10),
        unit: p.unit === 'sec' ? 'sec' : 'reps', days: wdList(p.days).sort(), from: DATE_RE.test(p.from) ? p.from : todayKey(),
        courseId: Data.course(p.courseId) ? p.courseId : null, prog: num(p.prog, 0, 50, 0), sess: p.sess == null ? null : num(p.sess, 0, 30, 0)
      };
    });
    var logs = {};
    Object.keys(S.logs && typeof S.logs === 'object' ? S.logs : {}).forEach(function (k) {
      var d = S.logs[k];
      if (!DATE_RE.test(k) || !d || !Array.isArray(d.items)) return;
      logs[k] = { items: d.items.filter(function (e) { return e && idOk(e.id); }).map(cleanEntry), skip: (Array.isArray(d.skip) ? d.skip : []).filter(idOk) };
    });
    S.logs = logs;
    S.superDates = (Array.isArray(S.superDates) ? S.superDates : []).filter(function (k) { return DATE_RE.test(k); }).sort();
    S.superWeekdays = wdList(S.superWeekdays).sort();
    var c = S.course;
    S.course = c && Data.course(c.id) && DATE_RE.test(c.start) ? { id: c.id, start: c.start, weeks: num(c.weeks, 1, 12, 4), days: wdList(c.days) } : null;
    S.lang = S.lang === 'ar' || S.lang === 'en' ? S.lang : null;
    S.theme = ['auto', 'light', 'dark'].indexOf(S.theme) >= 0 ? S.theme : 'auto';
    S.weekStart = S.weekStart == null ? null : num(S.weekStart, 0, 6, null);
    S.lastSeen = DATE_RE.test(S.lastSeen) ? S.lastSeen : null;
    S.shareUrl = typeof S.shareUrl === 'string' && /^https?:\/\/[^\s<>"']{3,300}$/i.test(S.shareUrl) ? S.shareUrl : '';
  }
  function flush() { clearTimeout(saveT); saveT = null; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function save() { clearTimeout(saveT); saveT = setTimeout(flush, 120); }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });

  /* ---------- settings ---------- */
  function weekStart() {
    if (S.weekStart != null) return S.weekStart;
    return S.lang === 'ar' ? 6 : 1;
  }

  /* ---------- course progression ---------- */
  function weekIdx(p, k) {
    var c = S.course;
    if (!c || !p.courseId || p.courseId !== c.id) return 0;
    return clamp(Math.floor(diffDays(c.start, k) / 7), 0, c.weeks - 1);
  }
  function effReps(p, k) { return Math.max(1, (p.reps || 1) + (p.prog || 0) * weekIdx(p, k)); }

  function courseState() {
    var c = S.course; if (!c) return null;
    var data = Data.course(c.id); if (!data) return null;
    var elapsed = diffDays(c.start, todayKey());
    var week = clamp(Math.floor(elapsed / 7) + 1, 1, c.weeks);
    var finished = elapsed >= c.weeks * 7;
    return { course: data, week: week, weeks: c.weeks, finished: finished, daysLeft: Math.max(0, c.weeks * 7 - elapsed), start: c.start };
  }

  /* ---------- plan -> day entries ---------- */
  function fieldsFromPlan(p, k) {
    return { exId: p.exId || null, title: p.title || '', cat: p.cat, sets: p.sets || 1, reps: effReps(p, k), unit: p.unit || 'reps' };
  }
  function entryFromPlan(p, k) {
    return Object.assign({ id: uid(), planId: p.id, status: null, got: null, locked: false }, fieldsFromPlan(p, k));
  }
  function sched(k) {
    var w = wd(k);
    return S.plan.filter(function (p) { return p.days.indexOf(w) >= 0 && p.from <= k; });
  }
  function getDay(k) { return S.logs[k] || null; }

  function syncToday() {
    var k = todayKey(), sc = sched(k);
    var day = S.logs[k] || (S.logs[k] = { items: [], skip: [] });
    day.skip = day.skip || [];
    sc.forEach(function (p) {
      if (day.skip.indexOf(p.id) >= 0) return;
      var e = day.items.filter(function (i) { return i.planId === p.id; })[0];
      if (!e) day.items.push(entryFromPlan(p, k));
      else if (e.status == null && !e.locked) Object.assign(e, fieldsFromPlan(p, k));
    });
    day.items = day.items.filter(function (e) {
      return e.planId == null || e.status != null || sc.some(function (p) { return p.id === e.planId; });
    });
    if (!day.items.length) delete S.logs[k];
  }

  function createPastDay(k) {
    var items = sched(k).map(function (p) { return entryFromPlan(p, k); });
    if (items.length) S.logs[k] = { items: items, skip: [] };
  }

  /* Call on every app open / day change: creates the days you missed (so they show as missed), refreshes today */
  function ensureDays() {
    var t = todayKey();
    if (S.lastSeen && S.lastSeen < t) {
      var gap = Math.min(diffDays(S.lastSeen, t) - 1, MAX_BACKFILL);
      for (var i = gap; i >= 1; i--) {
        var k = addDays(t, -i);
        if (!S.logs[k]) createPastDay(k);
      }
    }
    S.lastSeen = t;
    syncToday();
    save();
  }

  /* ---------- plan CRUD ---------- */
  function addPlan(o) {
    var p = {
      id: uid(), exId: o.exId || null, title: o.title || '', cat: o.cat, sets: o.sets || 1,
      reps: o.reps || 10, unit: o.unit || 'reps', days: (o.days || []).slice().sort(),
      from: o.from || todayKey(), courseId: o.courseId || null, prog: o.prog || 0, sess: o.sess == null ? null : o.sess
    };
    S.plan.push(p); syncToday(); save(); return p;
  }
  function getPlan(id) { return S.plan.filter(function (p) { return p.id === id; })[0] || null; }
  function updatePlan(id, patch) {
    var p = getPlan(id); if (!p) return;
    Object.assign(p, patch);
    var day = S.logs[todayKey()];
    if (day) day.items.forEach(function (e) { if (e.planId === id && e.status == null) e.locked = false; });
    syncToday(); save();
  }
  function bumpPlan(id, delta) {
    var p = getPlan(id); if (!p) return null;
    p.reps = clamp((p.reps || 1) + delta, 1, 999);
    var day = S.logs[todayKey()];
    if (day) day.items.forEach(function (e) { if (e.planId === id && e.status == null) e.locked = false; });
    syncToday(); save();
    return effReps(p, todayKey());
  }
  function deletePlan(id) {
    S.plan = S.plan.filter(function (p) { return p.id !== id; });
    syncToday(); save();
  }

  /* ---------- day entries ---------- */
  function findEntry(k, id) {
    var d = S.logs[k]; if (!d) return null;
    return d.items.filter(function (e) { return e.id === id; })[0] || null;
  }
  function gotMax(e) { return e.sets > 1 ? e.sets : e.reps; }
  function gotDefault(e) { return e.sets > 1 ? Math.max(1, e.sets - 1) : Math.max(1, Math.round(e.reps / 2)); }

  function setStatus(k, id, st) {
    var e = findEntry(k, id); if (!e) return;
    e.status = e.status === st ? null : st;
    if (e.status === 'partial' && (e.got == null || e.got > gotMax(e))) e.got = gotDefault(e);
    save();
  }
  function bumpEntry(k, id, field, delta) {
    var e = findEntry(k, id); if (!e) return null;
    if (field === 'reps') {
      e.reps = clamp(e.reps + delta, 1, 999); e.locked = true;
      if (e.got != null) e.got = clamp(e.got, 0, gotMax(e));
    } else if (field === 'got') {
      e.got = clamp((e.got == null ? gotDefault(e) : e.got) + delta, 0, gotMax(e));
    }
    save();
    return e;
  }
  function addToday(o) {
    var k = todayKey();
    var day = S.logs[k] || (S.logs[k] = { items: [], skip: [] });
    var e = {
      id: uid(), planId: null, exId: o.exId || null, title: o.title || '', cat: o.cat, sets: o.sets || 1,
      reps: o.reps || 10, unit: o.unit || 'reps', status: null, got: null, locked: true
    };
    day.items.push(e); save(); return e;
  }
  function removeEntry(k, id) {
    var d = S.logs[k]; if (!d) return;
    var e = findEntry(k, id); if (!e) return;
    if (e.planId) { d.skip = d.skip || []; if (d.skip.indexOf(e.planId) < 0) d.skip.push(e.planId); }
    d.items = d.items.filter(function (x) { return x.id !== id; });
    if (!d.items.length) delete S.logs[k];
    save();
  }

  /* ---------- course ---------- */
  function stopCourse() {
    S.plan = S.plan.filter(function (p) { return !p.courseId; });
    S.course = null;
    syncToday(); save();
  }
  /* dayList: weekdays (0..6) chosen for each session, in session order */
  function startCourse(course, dayList) {
    S.plan = S.plan.filter(function (p) { return !p.courseId; });
    var start = todayKey();
    S.course = { id: course.id, start: start, weeks: course.weeks, days: dayList.slice() };
    course.sessions.forEach(function (s, i) {
      s.ex.forEach(function (r) {
        var info = Data.exInfo(r[0]);
        S.plan.push({
          id: uid(), exId: r[0], title: '', cat: info.cat, sets: r[1], reps: r[2], unit: info.unit,
          days: [dayList[i]], from: start, courseId: course.id, prog: r[3], sess: i
        });
      });
    });
    syncToday(); save();
  }

  /* ---------- super day ---------- */
  function isSuper(k) { return S.superDates.indexOf(k) >= 0 || S.superWeekdays.indexOf(wd(k)) >= 0; }
  function toggleSuperDate(k) {
    var i = S.superDates.indexOf(k);
    if (i >= 0) S.superDates.splice(i, 1); else S.superDates.push(k);
    S.superDates.sort(); save();
  }
  function toggleSuperWeekday(w) {
    var i = S.superWeekdays.indexOf(w);
    if (i >= 0) S.superWeekdays.splice(i, 1); else S.superWeekdays.push(w);
    S.superWeekdays.sort(); save();
  }

  /* ---------- stats ---------- */
  function dayState(k) {
    var d = S.logs[k], t = todayKey();
    var r = { state: 'rest', n: 0, done: 0, partial: 0, missed: 0, pending: 0 };
    if (!d || !d.items.length) return r;
    d.items.forEach(function (e) {
      if (e.status === 'done') r.done++;
      else if (e.status === 'partial') r.partial++;
      else if (e.status === 'missed') r.missed++;
      else r.pending++;
    });
    r.n = d.items.length;
    if (k < t && r.pending) { r.missed += r.pending; r.pending = 0; }
    if (r.done === r.n) r.state = 'done';
    else if (r.done + r.partial > 0) r.state = 'partial';
    else if (k < t || r.missed === r.n) r.state = 'missed';
    else r.state = 'pending';
    return r;
  }
  function firstLogKey() {
    var ks = Object.keys(S.logs).sort();
    return ks.length ? ks[0] : null;
  }
  function streak() {
    var t = todayKey(), first = firstLogKey(), n = 0;
    if (!first) return 0;
    var s = dayState(t).state;
    if (s === 'done' || s === 'partial') n++;
    for (var i = 1; i < 800; i++) {
      var k = addDays(t, -i);
      if (k < first) break;
      s = dayState(k).state;
      if (s === 'rest') continue;
      if (s === 'done' || s === 'partial') n++; else break;
    }
    return n;
  }
  function rangeStats(fromK, toK) {
    var r = { done: 0, partial: 0, missed: 0 };
    for (var k = fromK; k <= toK; k = addDays(k, 1)) {
      var s = dayState(k).state;
      if (s === 'done' || s === 'partial' || s === 'missed') r[s]++;
    }
    var tot = r.done + r.partial + r.missed;
    r.pct = tot ? Math.round(((r.done + r.partial * 0.5) / tot) * 100) : 0;
    r.total = tot;
    return r;
  }
  function totals() {
    var r = { done: 0, partial: 0, missed: 0 };
    Object.keys(S.logs).forEach(function (k) {
      var s = dayState(k).state;
      if (r[s] != null) r[s]++;
    });
    return r;
  }

  /* ---------- backup ---------- */
  function exportJSON() { return JSON.stringify({ app: 'trainbook', exported: new Date().toISOString(), data: S }, null, 1); }
  function importJSON(txt) {
    var o = JSON.parse(txt);
    var d = o && o.app === 'trainbook' ? o.data : o;
    if (!d || typeof d !== 'object' || !Array.isArray(d.plan) || typeof d.logs !== 'object') throw new Error('bad file');
    S = Object.assign(def(), d); normalise(); ensureDays(); flush();
  }
  function reset() { S = def(); flush(); }

  window.Store = {
    get: function () { return S; }, load: load, save: save, flush: flush, reset: reset,
    key: key, parse: parse, addDays: addDays, diffDays: diffDays, wd: wd, todayKey: todayKey,
    weekStart: weekStart, setPref: function (k, v) { S[k] = v; save(); },
    weekIdx: weekIdx, effReps: effReps, courseState: courseState,
    ensureDays: ensureDays, getDay: getDay, getPlan: getPlan, sched: sched,
    addPlan: addPlan, updatePlan: updatePlan, bumpPlan: bumpPlan, deletePlan: deletePlan,
    findEntry: findEntry, setStatus: setStatus, bumpEntry: bumpEntry, gotMax: gotMax,
    addToday: addToday, removeEntry: removeEntry,
    startCourse: startCourse, stopCourse: stopCourse,
    isSuper: isSuper, toggleSuperDate: toggleSuperDate, toggleSuperWeekday: toggleSuperWeekday,
    dayState: dayState, streak: streak, rangeStats: rangeStats, totals: totals,
    exportJSON: exportJSON, importJSON: importJSON
  };
})();
