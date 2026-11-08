/* Page renderers. Each returns an HTML string. */
(function () {
  'use strict';
  var UI = window.UI, V = UI.views = {};
  var t = function (k, v) { return I18N.t(k, v); };
  var esc = UI.esc, ic = UI.ic;

  /* ---------- shared bits ---------- */
  function stepper(o) {
    var a = ' data-scope="' + o.scope + '" data-id="' + (o.id || '') + '" data-k="' + (o.k || '') + '" data-field="' + o.field + '"';
    return '<div class="stepper ' + (o.cls || '') + '">' +
      '<button type="button" class="step" data-step="' + (-o.step) + '"' + a + ' aria-label="' + esc(t('a.decrease')) + '">' + ic('minus', 18) + '</button>' +
      '<div class="sval"><b data-val="' + o.field + '" data-scope="' + o.scope + '" data-for="' + (o.id || '') + '">' + o.val + '</b>' + (o.unit ? '<small>' + esc(o.unit) + '</small>' : '') + '</div>' +
      '<button type="button" class="step" data-step="' + o.step + '"' + a + ' aria-label="' + esc(t('a.increase')) + '">' + ic('plus', 18) + '</button></div>';
  }
  UI.stepper = stepper;

  function catChips(list, cur, act) {
    var cats = Data.CATS.filter(function (c) { return list.some(function (x) { return x.cat === c; }); });
    if (cats.length < 2) return '';
    return '<div class="chips scroll" role="group" aria-label="' + esc(t('cat.title')) + '">' +
      ['all'].concat(cats).map(function (c) {
        return '<button type="button" class="chip' + (cur === c ? ' on' : '') + '" data-act="' + act + '" data-v="' + c + '">' +
          (c === 'all' ? esc(t('cat.all')) : UI.catDot(c) + esc(t('cat.' + c))) + '</button>';
      }).join('') + '</div>';
  }

  function stateBadge(state) {
    return '<span class="badge b-' + state + '">' + esc(t('hs.' + state)) + '</span>';
  }

  /* ---------- task card (Today + History detail) ---------- */
  UI.taskCard = function (e, k) {
    var st = e.status || '';
    var stBtn = function (s, icon) {
      return '<button type="button" class="stbtn s-' + s + (st === s ? ' on' : '') + '" data-act="status" data-st="' + s + '" data-id="' + e.id + '" data-k="' + k + '" aria-pressed="' + (st === s) + '">' +
        ic(icon, 18) + '<span>' + esc(t('st.' + s)) + '</span></button>';
    };
    var got = '';
    if (st === 'partial') {
      var bySets = e.sets > 1, max = Store.gotMax(e);
      got = '<div class="got"><span>' + esc(bySets ? t('got.sets') : t('got.reps')) + '</span>' +
        stepper({ scope: 'got', id: e.id, k: k, field: 'got', step: 1, val: e.got == null ? 0 : e.got, unit: '/ ' + max, cls: 'sm' }) + '</div>';
    }
    return '<article class="task' + (st ? ' st-' + st : '') + '" style="--cat:var(--c-' + e.cat + ')" data-eid="' + e.id + '">' +
      '<div class="task-top">' +
        '<div class="task-info"><h4 class="task-title">' + esc(UI.nameOf(e)) + '</h4>' +
        '<div class="task-meta">' + UI.catDot(e.cat) + '<span>' + esc(t('cat.' + e.cat)) + '</span>' +
        (e.sets > 1 ? '<span class="dotsep">•</span><span>' + e.sets + ' ' + esc(t('u.sets')) + '</span>' : '') + '</div></div>' +
        '<button type="button" class="icon-btn xs ghost" data-act="rmEntry" data-id="' + e.id + '" data-k="' + k + '" aria-label="' + esc(t('a.remove')) + '">' + ic('trash', 16) + '</button>' +
      '</div>' +
      '<div class="task-mid">' + stepper({ scope: 'entry', id: e.id, k: k, field: 'reps', step: UI.stepFor(e.unit), val: e.reps, unit: UI.unitLabel(e.unit) }) + '</div>' +
      '<div class="status" role="group">' + stBtn('done', 'check') + stBtn('missed', 'x') + stBtn('partial', 'partial') + '</div>' + got +
      '</article>';
  };

  /* ================= TODAY ================= */
  V.today = function () {
    var k = Store.todayKey(), day = Store.getDay(k), items = day ? day.items : [];
    var sup = Store.isSuper(k), n = items.length;
    var c = { done: 0, partial: 0, missed: 0 };
    items.forEach(function (e) { if (c[e.status] != null) c[e.status]++; });
    var title, sub;
    if (!n) { title = t('today.rest'); sub = t('today.restSub'); }
    else if (c.done === n) { title = t('today.allDone'); sub = t('today.allDoneSub'); }
    else { title = sup ? t('today.superTitle') : t('today.title'); sub = t('today.progress', { done: c.done, n: n }) + (c.partial ? ' · ' + t('today.partialN', { n: c.partial }) : ''); }

    var h = '<section class="hero' + (sup ? ' hero-super' : '') + '">' +
      '<div class="hero-top"><span class="hero-date">' + esc(UI.fmtDate(k, { weekday: 'long', day: 'numeric', month: 'long' })) + '</span>' +
      (sup ? '<span class="badge-super">' + ic('flame', 14) + esc(t('super.badge')) + '</span>' : '') + '</div>' +
      '<h2>' + esc(title) + '</h2><p class="hero-sub">' + esc(sub) + '</p>' +
      (n ? '<div class="segbar" aria-hidden="true">' + items.map(function (e) { return '<i class="sb-' + (e.status || 'none') + '"></i>'; }).join('') + '</div>' : '') +
      '</section>';

    if (!n) {
      h += '<section class="empty card"><div class="empty-ic">' + ic('today', 34) + '</div><p>' + esc(t('today.emptyHint')) + '</p>' +
        '<div class="row-btns center"><button class="btn primary" type="button" data-act="addToday">' + ic('plus', 18) + esc(t('a.addExercise')) + '</button>' +
        '<button class="btn" type="button" data-go="courses">' + ic('courses', 18) + esc(t('today.browse')) + '</button></div></section>';
      return h;
    }

    var f = UI.filter.today;
    if (f !== 'all' && !items.some(function (e) { return e.cat === f; })) f = UI.filter.today = 'all';
    h += catChips(items, f, 'filterToday');
    Data.CATS.forEach(function (cat) {
      if (f !== 'all' && f !== cat) return;
      var list = items.filter(function (e) { return e.cat === cat; });
      if (!list.length) return;
      var dn = list.filter(function (e) { return e.status === 'done'; }).length;
      h += '<section class="group"><h3 class="group-h">' + UI.catDot(cat) + '<span>' + esc(t('cat.' + cat)) + '</span><span class="count">' + dn + '/' + list.length + '</span></h3>' +
        list.map(function (e) { return UI.taskCard(e, k); }).join('') + '</section>';
    });
    h += '<button type="button" class="fab" data-act="addToday" aria-label="' + esc(t('a.addExercise')) + '">' + ic('plus', 26) + '</button>';
    return h;
  };

  /* ================= MY COURSE ================= */
  function superSummary() {
    var s = Store.get(), parts = [];
    if (s.superWeekdays.length) {
      var order = UI.weekOrder();
      parts.push(t('super.every') + ' ' + order.filter(function (w) { return s.superWeekdays.indexOf(w) >= 0; }).map(function (w) { return UI.weekdayName(w, 'short'); }).join(I18N.lang === 'ar' ? '، ' : ', '));
    }
    var up = s.superDates.filter(function (d) { return d >= Store.todayKey(); });
    if (up.length) parts.push(t('super.dates', { n: up.length }));
    return parts.length ? parts.join(' · ') : t('super.none');
  }

  V.course = function () {
    var S = Store.get(), cs = Store.courseState(), plan = S.plan, h = '';

    if (cs) {
      var totalDays = cs.weeks * 7, elapsed = Math.min(totalDays, totalDays - cs.daysLeft);
      h += '<section class="card course-card">' +
        '<div class="cc-row"><span class="tag k-' + cs.course.kind + '">' + esc(cs.finished ? t('c.completed') : t('c.active')) + '</span></div>' +
        '<h3>' + esc(cs.course.name[I18N.lang]) + '</h3>' +
        '<p class="muted">' + esc(cs.finished ? t('c.finishedSub') : t('c.weekOf', { n: cs.week, total: cs.weeks }) + ' · ' + t('c.daysLeft', { n: cs.daysLeft })) + '</p>' +
        '<div class="bar"><i style="width:' + Math.round((elapsed / totalDays) * 100) + '%"></i></div>' +
        '<div class="row-btns">' +
          '<button class="btn" type="button" data-act="openCourse" data-id="' + cs.course.id + '">' + esc(t('a.details')) + '</button>' +
          (cs.finished ? '<button class="btn primary" type="button" data-act="restartCourse" data-id="' + cs.course.id + '">' + esc(t('c.restart')) + '</button>' : '') +
          '<button class="btn danger-ghost" type="button" data-act="stopCourse">' + esc(t('c.stop')) + '</button>' +
        '</div></section>';
    } else {
      h += '<section class="card course-card soft"><div class="cc-row"><span class="tag">' + esc(t('c.none')) + '</span></div>' +
        '<p class="muted">' + esc(t('c.noneSub')) + '</p>' +
        '<div class="row-btns"><button class="btn primary" type="button" data-go="courses">' + ic('courses', 18) + esc(t('c.browse')) + '</button></div></section>';
    }

    h += '<button type="button" class="card super-card' + (S.superWeekdays.length || S.superDates.length ? ' set' : '') + '" data-act="openSuper">' +
      '<span class="super-ic">' + ic('flame', 22) + '</span><span class="super-tx"><b>' + esc(t('super.title')) + '</b><small>' + esc(superSummary()) + '</small></span>' +
      '<span class="flip dim">' + ic('chev', 18) + '</span></button>';

    var f = UI.filter.course;
    if (f !== 'all' && !plan.some(function (p) { return p.cat === f; })) f = UI.filter.course = 'all';
    h += '<div class="sec-title"><h3>' + esc(t('mc.week')) + '</h3></div>' + catChips(plan, f, 'filterCourse');

    var tw = new Date().getDay();
    UI.weekOrder().forEach(function (w) {
      var rows = plan.filter(function (p) { return p.days.indexOf(w) >= 0 && (f === 'all' || p.cat === f); });
      h += '<section class="day-sec' + (w === tw ? ' is-today' : '') + '"><div class="day-h"><h4>' + esc(UI.weekdayName(w)) +
        (w === tw ? ' <span class="today-pill">' + esc(t('mc.today')) + '</span>' : '') + '</h4>' +
        '<button type="button" class="icon-btn xs" data-act="addPlanDay" data-wd="' + w + '" aria-label="' + esc(t('a.addExercise')) + '">' + ic('plus', 18) + '</button></div>';
      if (!rows.length) h += '<p class="rest-line">' + esc(t('mc.rest')) + '</p>';
      rows.forEach(function (p) {
        var eff = Store.effReps(p, Store.todayKey());
        var sess = '';
        if (p.courseId && p.sess != null) { var cd = Data.course(p.courseId); if (cd && cd.sessions[p.sess]) sess = ' · ' + cd.sessions[p.sess].name[I18N.lang]; }
        h += '<div class="prow" style="--cat:var(--c-' + p.cat + ')"><span class="cbar"></span>' +
          '<div class="prow-main"><div class="prow-title">' + esc(UI.nameOf(p)) + '</div>' +
          '<div class="prow-sub">' + esc(t('cat.' + p.cat)) + (p.sets > 1 ? ' · ' + p.sets + ' ' + esc(t('u.sets')) : '') + esc(sess) + '</div></div>' +
          stepper({ scope: 'plan', id: p.id, field: 'reps', step: UI.stepFor(p.unit), val: eff, unit: UI.unitLabel(p.unit), cls: 'sm' }) +
          '<button type="button" class="icon-btn xs" data-act="editPlan" data-id="' + p.id + '" aria-label="' + esc(t('a.edit')) + '">' + ic('pencil', 16) + '</button></div>';
      });
      h += '</section>';
    });
    h += '<button type="button" class="fab" data-act="addPlan" aria-label="' + esc(t('a.addExercise')) + '">' + ic('plus', 26) + '</button>';
    return h;
  };

  /* ================= COURSES (premade) ================= */
  var KIND_ICON = { course: 'target', monthly: 'calendar', calisthenics: 'star' };
  UI.levelBars = function (lv) {
    var s = '<span class="lv" title="' + esc(t('lv.' + lv)) + '">';
    for (var i = 1; i <= 3; i++) s += '<i class="' + (i <= lv ? 'on' : '') + '"></i>';
    return s + '</span>';
  };

  V.courses = function () {
    var tab = UI.filter.ctab, S = Store.get();
    var tabs = ['course', 'monthly', 'calisthenics'];
    var h = '<div class="seg" role="tablist">' + tabs.map(function (k) {
      return '<button type="button" role="tab" class="' + (tab === k ? 'on' : '') + '" aria-selected="' + (tab === k) + '" data-act="ctab" data-v="' + k + '">' + esc(t('ck.' + k)) + '</button>';
    }).join('') + '</div>';
    h += '<p class="muted sm tabdesc">' + esc(t('ck.' + tab + 'Desc')) + '</p>';
    h += '<div class="cgrid">' + Data.COURSES.filter(function (c) { return c.kind === tab; }).map(function (c) {
      var active = S.course && S.course.id === c.id;
      return '<button type="button" class="ccard k-' + c.kind + '" data-act="openCourse" data-id="' + c.id + '">' +
        '<div class="ccard-art">' + ic(KIND_ICON[c.kind], 96, 'art-big') + ic(KIND_ICON[c.kind], 22) + '<span class="art-lbl">' + esc(t('ck.' + c.kind)) + '</span>' + (active ? '<span class="tag on-art">' + esc(t('c.active')) + '</span>' : '') + '</div>' +
        '<div class="ccard-b"><h3>' + esc(c.name[I18N.lang]) + '</h3><p class="muted sm">' + esc(c.style[I18N.lang]) + '</p>' +
        '<div class="facts"><span>' + esc(t('c.weeks', { n: c.weeks })) + '</span><span>' + esc(t('c.perWeek', { n: c.sessions.length })) + '</span><span class="lvl">' + UI.levelBars(c.level) + esc(t('lv.' + c.level)) + '</span></div></div></button>';
    }).join('') + '</div>';
    h += '<p class="note">' + ic('info', 16) + '<span>' + esc(t('c.disclaimer')) + '</span></p>';
    return h;
  };

  /* ================= HISTORY ================= */
  V.history = function () {
    var today = Store.todayKey();
    if (!UI.hist) { var d = new Date(); UI.hist = { y: d.getFullYear(), m: d.getMonth(), sel: today }; }
    var H = UI.hist, loc = UI.loc();
    var tot = Store.totals(), st30 = Store.rangeStats(Store.addDays(today, -29), today);
    var h = '<div class="tiles">' +
      tile('flame', Store.streak(), t('hs.streak')) +
      tile('check', tot.done, t('hs.doneDays')) +
      tile('target', st30.pct + '%', t('hs.completion')) + '</div>';

    var monthName = new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(new Date(H.y, H.m, 1));
    h += '<section class="card cal"><div class="cal-h"><button type="button" class="icon-btn" data-act="monthPrev" aria-label="' + esc(t('a.prev')) + '"><span class="flip rev">' + ic('chev', 20) + '</span></button>' +
      '<h3>' + esc(monthName) + '</h3><button type="button" class="icon-btn" data-act="monthNext" aria-label="' + esc(t('a.next')) + '"><span class="flip">' + ic('chev', 20) + '</span></button></div>';
    h += '<div class="cal-grid cal-wd">' + UI.weekOrder().map(function (w) { return '<span>' + esc(UI.weekdayName(w, 'narrow')) + '</span>'; }).join('') + '</div>';
    var ws = Store.weekStart(), first = new Date(H.y, H.m, 1), offset = (first.getDay() - ws + 7) % 7, dim = new Date(H.y, H.m + 1, 0).getDate();
    h += '<div class="cal-grid">';
    for (var i = 0; i < offset; i++) h += '<span class="cal-pad"></span>';
    for (var dd = 1; dd <= dim; dd++) {
      var k = Store.key(new Date(H.y, H.m, dd)), ds = Store.dayState(k), fut = k > today;
      var cls = 'cal-cell' + (fut ? ' fut' : ' st-' + ds.state) + (k === today ? ' today' : '') + (k === H.sel ? ' sel' : '');
      h += '<button type="button" class="' + cls + '" data-act="pickDay" data-k="' + k + '" aria-label="' + esc(UI.fmtDate(k, { day: 'numeric', month: 'long' }) + (fut ? '' : ' - ' + t('hs.' + ds.state))) + '">' +
        '<span>' + dd + '</span>' + (Store.isSuper(k) ? '<i class="sdot">' + ic('flame', 10) + '</i>' : '') + '</button>';
    }
    h += '</div><div class="legend">' + ['done', 'partial', 'missed', 'rest'].map(function (s) { return '<span><i class="lg lg-' + s + '"></i>' + esc(t('hs.' + s)) + '</span>'; }).join('') + '</div></section>';

    /* selected day */
    var k2 = H.sel, ds2 = Store.dayState(k2), day = Store.getDay(k2), fut2 = k2 > today;
    h += '<section class="sel-day"><div class="sel-h"><div><h3>' + esc(UI.fmtDate(k2, { weekday: 'long', day: 'numeric', month: 'long' })) + '</h3>' +
      (fut2 ? '' : stateBadge(ds2.state)) + '</div>' +
      '<button type="button" class="chip' + (Store.isSuper(k2) ? ' on super' : '') + '" data-act="toggleSuperDate" data-k="' + k2 + '">' + ic('flame', 15) + esc(t('super.badge')) + '</button></div>';
    if (fut2) {
      var pl = Store.sched(k2);
      h += pl.length ? '<div class="plan-list">' + pl.map(function (p) {
        return '<div class="prow ro" style="--cat:var(--c-' + p.cat + ')"><span class="cbar"></span><div class="prow-main"><div class="prow-title">' + esc(UI.nameOf(p)) + '</div><div class="prow-sub">' + esc(t('cat.' + p.cat)) + '</div></div><span class="muted">' + esc(UI.target({ sets: p.sets, reps: Store.effReps(p, k2), unit: p.unit })) + '</span></div>';
      }).join('') + '</div>' : '<p class="rest-line">' + esc(t('hs.noPlan')) + '</p>';
    } else if (!day || !day.items.length) {
      h += '<p class="rest-line">' + esc(t('hs.noData')) + '</p>';
    } else {
      h += day.items.map(function (e) { return UI.taskCard(e, k2); }).join('');
    }
    h += '</section>';
    return h;
  };
  function tile(icon, val, label) {
    return '<div class="tile"><span class="tile-ic">' + ic(icon, 18) + '</span><b>' + esc(val) + '</b><small>' + esc(label) + '</small></div>';
  }

  /* ================= TRAIN (timer / stopwatch / checklist) ================= */
  var CIRC = 553;
  var PRESETS = [15, 30, 45, 60, 90, 120, 180, 300];
  UI.presetLabel = function (s) { return s < 60 ? s + t('u.secShort') : (s % 60 ? Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60) : Math.floor(s / 60) + t('u.minShort')); };

  function swTime(ms) {
    var s = Timer.fmtUp(ms, true), i = s.lastIndexOf('.');
    return s.slice(0, i) + '<small>' + s.slice(i) + '</small>';
  }
  function ivView() {
    var v = Timer.s.iv;
    if (v.fin) return { phase: 'done', left: 0, round: v.rounds - 1, total: 1 };
    if (!v.run && !v.base) return { phase: 'ready', left: v.work, round: 0, total: v.work };
    var i = Timer.iv.info();
    return { phase: i.phase, left: i.left, round: i.round, total: i.phaseTotal || 1 };
  }
  UI.tickTrain = function () {
    var el = UI.$('#clk'); if (!el) return;
    var m = Timer.s.mode;
    if (m === 'sw') { el.innerHTML = swTime(Timer.sw.elapsed()); return; }
    var ring = UI.$('#ring');
    if (m === 'cd') {
      var left = Timer.cd.left(), tot = Timer.s.cd.total;
      el.textContent = Timer.fmt(left);
      if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - (tot ? left / tot : 0)));
      var sub = UI.$('#clk-sub'); if (sub) sub.textContent = Timer.s.cd.fin ? t('tm.timesUp') : (Timer.s.cd.run ? t('tm.running') : t('tm.paused'));
    } else if (m === 'iv') {
      var vw = ivView();
      el.textContent = Timer.fmt(vw.left * 1000);
      if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - (vw.phase === 'done' ? 0 : vw.left / vw.total)));
      var rd = UI.$('#iv-round'); if (rd) rd.textContent = t('tm.round', { n: Math.min(vw.round + 1, Timer.s.iv.rounds), total: Timer.s.iv.rounds });
    }
  };
  UI.ivTotalText = function () {
    var tot = Timer.iv.total(), m = Math.floor(tot / 60), s = tot % 60;
    return t('tm.totalTime') + ' ' + m + ':' + (s < 10 ? '0' : '') + s;
  };

  V.train = function () {
    var T = Timer.s, m = T.mode, k = Store.todayKey();
    var h = '<div class="seg" role="tablist">' + [['sw', 'tm.stopwatch'], ['cd', 'tm.timer'], ['iv', 'tm.intervals']].map(function (x) {
      return '<button type="button" role="tab" class="' + (m === x[0] ? 'on' : '') + '" aria-selected="' + (m === x[0]) + '" data-act="tmode" data-v="' + x[0] + '">' + esc(t(x[1])) + '</button>';
    }).join('') + '</div>';

    var head = function (title) {
      return '<div class="clock-h"><h3>' + esc(title) + '</h3><div>' +
        '<button type="button" class="icon-btn xs" data-act="tmute" aria-label="' + esc(t('tm.sound')) + '" aria-pressed="' + (!T.mute) + '">' + ic(T.mute ? 'mute' : 'volume', 18) + '</button>' +
        '<button type="button" class="icon-btn xs" data-act="treset" aria-label="' + esc(t('tm.reset')) + '">' + ic('reset', 18) + '</button></div></div>';
    };
    var ringSvg = function (cls) {
      return '<svg class="ring ' + (cls || '') + '" viewBox="0 0 200 200" aria-hidden="true"><circle class="ring-bg" cx="100" cy="100" r="88"/><circle id="ring" class="ring-fg" cx="100" cy="100" r="88" stroke-dasharray="' + CIRC + '" stroke-dashoffset="0"/></svg>';
    };

    if (m === 'sw') {
      var sw = T.sw;
      h += '<section class="card clock">' + head(t('tm.stopwatch')) +
        '<div class="clock-time big" id="clk" dir="ltr">' + swTime(Timer.sw.elapsed()) + '</div>' +
        '<div class="clock-ctl">' +
          '<button type="button" class="rbtn" data-act="swLap"' + (sw.run ? '' : ' disabled') + '>' + ic('flag', 22) + '<span>' + esc(t('tm.lap')) + '</span></button>' +
          '<button type="button" class="bigbtn ' + (sw.run ? 'pause' : 'go') + '" data-act="swToggle" aria-label="' + esc(sw.run ? t('tm.pause') : t('tm.start')) + '">' + ic(sw.run ? 'pause' : 'play', 34) + '</button>' +
          '<span class="rbtn ghost-sp"></span>' +
        '</div>';
      if (sw.laps.length) {
        h += '<ol class="laps">' + sw.laps.map(function (l) {
          return '<li><span class="muted">' + esc(t('tm.lapN', { n: l.n })) + '</span><b dir="ltr">' + Timer.fmtUp(l.split, true) + '</b><span class="muted" dir="ltr">' + Timer.fmtUp(l.total, true) + '</span></li>';
        }).join('') + '</ol>';
      }
      h += '</section>';
    } else if (m === 'cd') {
      var cd = T.cd;
      h += '<section class="card clock' + (cd.fin ? ' fin' : '') + '">' + head(t('tm.timer')) +
        '<div class="ring-wrap">' + ringSvg('') + '<div class="ring-in"><div class="clock-time" id="clk" dir="ltr">' + Timer.fmt(Timer.cd.left()) + '</div><div class="muted" id="clk-sub">' +
        esc(cd.fin ? t('tm.timesUp') : (cd.run ? t('tm.running') : t('tm.paused'))) + '</div></div></div>' +
        '<div class="clock-ctl">' +
          '<button type="button" class="rbtn" data-act="cdAdd" data-ms="-15000"><b>−15</b><span>' + esc(t('u.secShort')) + '</span></button>' +
          '<button type="button" class="bigbtn ' + (cd.run ? 'pause' : 'go') + '" data-act="cdToggle" aria-label="' + esc(cd.run ? t('tm.pause') : t('tm.start')) + '">' + ic(cd.run ? 'pause' : 'play', 34) + '</button>' +
          '<button type="button" class="rbtn" data-act="cdAdd" data-ms="15000"><b>+15</b><span>' + esc(t('u.secShort')) + '</span></button>' +
        '</div>' +
        '<p class="muted sm center">' + esc(t('tm.presetHint')) + '</p>' +
        '<div class="chips wrap center">' + PRESETS.map(function (s) { return '<button type="button" class="chip" data-act="cdPreset" data-ms="' + (s * 1000) + '">' + esc(UI.presetLabel(s)) + '</button>'; }).join('') + '</div></section>';
    } else {
      var v = T.iv, vw = ivView(), locked = v.run || (v.base > 0 && !v.fin);
      h += '<section class="card clock ph-' + vw.phase + '">' + head(t('tm.intervals')) +
        '<div class="phase" id="iv-phase">' + esc(t('tm.ph.' + vw.phase)) + '</div>' +
        '<div class="ring-wrap">' + ringSvg('') + '<div class="ring-in"><div class="clock-time" id="clk" dir="ltr">' + Timer.fmt(vw.left * 1000) + '</div><div class="muted" id="iv-round">' +
        esc(t('tm.round', { n: Math.min(vw.round + 1, v.rounds), total: v.rounds })) + '</div></div></div>' +
        '<div class="clock-ctl"><span class="rbtn ghost-sp"></span>' +
          '<button type="button" class="bigbtn ' + (v.run ? 'pause' : 'go') + '" data-act="ivToggle" aria-label="' + esc(v.run ? t('tm.pause') : t('tm.start')) + '">' + ic(v.run ? 'pause' : 'play', 34) + '</button>' +
          '<span class="rbtn ghost-sp"></span></div>' +
        '<div class="iv-cfg' + (locked ? ' locked' : '') + '">' +
          '<div><span>' + esc(t('tm.work')) + '</span>' + stepper({ scope: 'iv', field: 'work', step: 1, val: v.work, unit: t('u.secShort'), cls: 'sm' }) + '</div>' +
          '<div><span>' + esc(t('tm.rest')) + '</span>' + stepper({ scope: 'iv', field: 'rest', step: 1, val: v.rest, unit: t('u.secShort'), cls: 'sm' }) + '</div>' +
          '<div><span>' + esc(t('tm.rounds')) + '</span>' + stepper({ scope: 'iv', field: 'rounds', step: 1, val: v.rounds, unit: '', cls: 'sm' }) + '</div>' +
        '</div><p class="muted sm center" id="iv-total">' + esc(UI.ivTotalText()) + '</p></section>';
    }

    /* checklist */
    var day = Store.getDay(k), items = day ? day.items : [];
    var done = items.filter(function (e) { return e.status === 'done'; }).length;
    h += '<section class="card checklist"><div class="clock-h"><h3>' + esc(t('tm.checklist')) + '</h3><span class="count">' + done + '/' + items.length + '</span></div>';
    if (!items.length) h += '<p class="rest-line">' + esc(t('tm.noItems')) + '</p>';
    else h += '<ul class="chk-list">' + items.map(function (e) {
      var st = e.status || '';
      return '<li class="chk-row' + (st ? ' st-' + st : '') + '" style="--cat:var(--c-' + e.cat + ')"><button type="button" class="chk" role="checkbox" aria-checked="' + (st === 'done') + '" data-act="chk" data-id="' + e.id + '" data-k="' + k + '" aria-label="' + esc(UI.nameOf(e)) + '">' +
        (st === 'done' ? ic('check', 18) : st === 'partial' ? ic('partial', 16) : st === 'missed' ? ic('x', 16) : '') + '</button>' +
        '<span class="chk-name">' + esc(UI.nameOf(e)) + '</span><span class="muted sm">' + esc(UI.target(e)) + '</span></li>';
    }).join('') + '</ul>';
    h += '<button type="button" class="btn block" data-act="addToday">' + ic('plus', 18) + esc(t('a.addExercise')) + '</button></section>';
    return h;
  };
})();
