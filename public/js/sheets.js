/* Sheets (modals): exercise form, Super Day, settings, course details. */
(function () {
  'use strict';
  var UI = window.UI;
  var t = function (k, v) { return I18N.t(k, v); };
  var esc = UI.esc, ic = UI.ic, $ = UI.$, $$ = UI.$$;

  /* =============== exercise form =============== */
  var form = null;
  UI.formState = function () { return form; };

  function formHtml() {
    var f = form, isEdit = f.mode === 'edit';
    var lang = I18N.lang;
    var opts = Object.keys(Data.EX).map(function (id) { return '<option value="' + esc(Data.exName(id, lang)) + '"></option>'; }).join('');
    var h = UI.sheetHead(isEdit ? t('f.editTitle') : t('f.addTitle'), f.mode === 'today' ? t('f.addSub') : (f.mode === 'plan' ? t('f.planSub') : '')) +
      '<div class="sheet-b">' +
      '<label class="fld"><span>' + esc(t('f.name')) + '</span><input id="f-title" type="text" list="exlist" maxlength="60" autocomplete="off" enterkeyhint="done" placeholder="' + esc(t('f.namePh')) + '" value="' + esc(f.title) + '"' + (isEdit ? '' : ' autofocus') + '></label>' +
      '<datalist id="exlist">' + opts + '</datalist>' +
      '<div class="fld"><span>' + esc(t('cat.title')) + '</span><div class="chips wrap">' + Data.CATS.map(function (c) {
        return '<button type="button" class="chip" data-act="fCat" data-v="' + c + '">' + UI.catDot(c) + esc(t('cat.' + c)) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="fld"><span>' + esc(t('f.countBy')) + '</span><div class="seg sm"><button type="button" data-act="fUnit" data-v="reps">' + esc(t('f.byReps')) + '</button><button type="button" data-act="fUnit" data-v="sec">' + esc(t('f.bySec')) + '</button></div></div>' +
      '<div class="row2">' +
        '<div class="fld"><span id="f-reps-label">' + esc(t('f.reps')) + '</span>' + UI.stepper({ scope: 'form', field: 'reps', step: 1, val: f.reps, unit: UI.unitLabel(f.unit) }) + '</div>' +
        '<div class="fld"><span>' + esc(t('f.sets')) + '</span>' + UI.stepper({ scope: 'form', field: 'sets', step: 1, val: f.sets, unit: t('u.sets') }) + '</div>' +
      '</div>';
    if (f.mode === 'today') {
      h += '<div class="fld"><span>' + esc(t('f.when')) + '</span><div class="seg sm"><button type="button" data-act="fScope" data-v="today">' + esc(t('f.todayOnly')) + '</button><button type="button" data-act="fScope" data-v="week">' + esc(t('f.repeat')) + '</button></div></div>';
    }
    h += '<div class="fld" id="f-days"><span>' + esc(t('f.days')) + '</span><div class="chips wrap">' + UI.weekOrder().map(function (w) {
      return '<button type="button" class="chip day" data-act="fDay" data-v="' + w + '">' + esc(UI.weekdayName(w, 'short')) + '</button>';
    }).join('') + '</div></div></div>' +
      '<div class="sheet-f">' + (isEdit ? '<button type="button" class="btn danger-ghost" data-act="fDelete">' + ic('trash', 16) + esc(t('a.delete')) + '</button>' : '') +
      '<button type="button" class="btn primary grow" data-act="fSave">' + ic('check', 18) + esc(t('a.save')) + '</button></div>';
    return h;
  }

  UI.syncForm = function () {
    if (!form) return;
    $$('[data-act=fCat]').forEach(function (b) { b.classList.toggle('on', b.dataset.v === form.cat); });
    $$('[data-act=fUnit]').forEach(function (b) { b.classList.toggle('on', b.dataset.v === form.unit); });
    $$('[data-act=fScope]').forEach(function (b) { b.classList.toggle('on', b.dataset.v === form.scope); });
    $$('[data-act=fDay]').forEach(function (b) { b.classList.toggle('on', form.days.indexOf(+b.dataset.v) >= 0); });
    var days = $('#f-days'); if (days) days.hidden = form.scope === 'today';
    var rv = $('[data-val=reps][data-scope=form]'); if (rv) { rv.textContent = form.reps; if (rv.nextElementSibling) rv.nextElementSibling.textContent = UI.unitLabel(form.unit); }
    var sv = $('[data-val=sets][data-scope=form]'); if (sv) sv.textContent = form.sets;
    var lb = $('#f-reps-label'); if (lb) lb.textContent = form.unit === 'sec' ? t('f.seconds') : t('f.reps');
  };

  /* mode: 'today' | 'plan' | 'edit' */
  UI.openExercise = function (o) {
    if (o.mode === 'edit') {
      var p = Store.getPlan(o.id); if (!p) return;
      form = { mode: 'edit', id: p.id, title: UI.nameOf(p), cat: p.cat, unit: p.unit, reps: Store.effReps(p, Store.todayKey()), sets: p.sets, days: p.days.slice(), scope: 'week', touched: true };
    } else {
      form = { mode: o.mode, id: null, title: '', cat: 'chest', unit: 'reps', reps: 10, sets: 1, days: [o.wd != null ? o.wd : new Date().getDay()], scope: o.mode === 'today' ? 'today' : 'week', touched: false };
    }
    UI.openSheet(formHtml(), { label: t('f.addTitle'), onClose: function () { form = null; } });
    UI.syncForm();
  };

  UI.formInput = function (val) {
    if (!form) return;
    form.title = val;
    var id = Data.findByName(val);
    if (id) {
      var info = Data.exInfo(id);
      form.cat = info.cat;
      if (form.unit !== info.unit) { form.unit = info.unit; if (!form.touched) form.reps = info.unit === 'sec' ? 30 : 10; }
      UI.syncForm();
    }
  };
  UI.formAct = function (act, v) {
    if (!form) return;
    if (act === 'fCat') form.cat = v;
    else if (act === 'fUnit') { if (form.unit !== v) { form.unit = v; if (!form.touched) form.reps = v === 'sec' ? 30 : 10; } }
    else if (act === 'fScope') form.scope = v;
    else if (act === 'fDay') { var d = +v, i = form.days.indexOf(d); if (i >= 0) form.days.splice(i, 1); else form.days.push(d); }
    UI.syncForm();
  };
  UI.formSave = function () {
    var f = form; if (!f) return;
    var inp = $('#f-title'), title = (inp.value || '').trim();
    if (!title) { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); inp.focus(); return; }
    var ex = Data.findByName(title);
    var fields = { exId: ex || null, title: ex ? '' : title, cat: f.cat, unit: f.unit, reps: f.reps, sets: f.sets };
    var weekly = !(f.mode === 'today' && f.scope === 'today');
    if (weekly && !f.days.length) { UI.toast(t('f.pickDay')); return; }
    if (!weekly) Store.addToday(fields);
    else if (f.mode === 'edit') {
      var p = Store.getPlan(f.id);
      fields.reps = Math.max(1, f.reps - (p.prog || 0) * Store.weekIdx(p, Store.todayKey()));
      fields.days = f.days.slice().sort();
      Store.updatePlan(f.id, fields);
    } else { fields.days = f.days.slice().sort(); Store.addPlan(fields); }
    UI.closeSheet();
    UI.toast(t('f.saved'));
    App.render();
  };
  UI.formDelete = function () {
    var f = form; if (!f || !f.id) return;
    var id = f.id;
    UI.confirm({ title: t('f.deleteTitle'), msg: t('f.deleteMsg'), ok: t('a.delete'), danger: true, onOk: function () { Store.deletePlan(id); App.render(); UI.toast(t('f.deleted')); } });
  };

  /* =============== Super Day =============== */
  function superHtml() {
    var S = Store.get(), k = Store.todayKey(), onToday = S.superDates.indexOf(k) >= 0;
    var viaWd = S.superWeekdays.indexOf(Store.wd(k)) >= 0;
    var up = S.superDates.filter(function (d) { return d >= k; });
    var h = UI.sheetHead(t('super.title'), t('super.sub')) + '<div class="sheet-b">' +
      '<p class="muted">' + esc(t('super.desc')) + '</p>' +
      '<button type="button" class="switch-row" role="switch" aria-checked="' + onToday + '" data-act="superToday"><span>' + esc(t('super.makeToday')) + '</span><i class="sw' + (onToday ? ' on' : '') + '"></i></button>' +
      (viaWd && !onToday ? '<p class="muted sm">' + esc(t('super.viaWeekday')) + '</p>' : '') +
      '<div class="fld"><span>' + esc(t('super.repeat')) + '</span><div class="chips wrap">' + UI.weekOrder().map(function (w) {
        return '<button type="button" class="chip day' + (S.superWeekdays.indexOf(w) >= 0 ? ' on super' : '') + '" data-act="superWd" data-v="' + w + '">' + esc(UI.weekdayName(w, 'short')) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="fld"><span>' + esc(t('super.pick')) + '</span><div class="row"><input id="sup-date" type="date" min="' + k + '" value="' + k + '"><button type="button" class="btn" data-act="superAdd">' + ic('plus', 16) + esc(t('a.add')) + '</button></div></div>';
    if (up.length) {
      h += '<div class="fld"><span>' + esc(t('super.upcoming')) + '</span><div class="chips wrap">' + up.map(function (d) {
        return '<button type="button" class="chip on super" data-act="superDel" data-k="' + d + '">' + esc(UI.fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })) + ic('x', 14) + '</button>';
      }).join('') + '</div></div>';
    }
    return h + '</div><div class="sheet-f"><button type="button" class="btn primary grow" data-act="closeSheet">' + esc(t('a.done')) + '</button></div>';
  }
  UI.openSuper = function () { UI.openSheet(superHtml(), { label: t('super.title') }); };
  UI.superAct = function (act, v) {
    if (act === 'superToday') Store.toggleSuperDate(Store.todayKey());
    else if (act === 'superWd') Store.toggleSuperWeekday(+v);
    else if (act === 'superDel') Store.toggleSuperDate(v);
    else if (act === 'superAdd') {
      var d = ($('#sup-date') || {}).value;
      if (!d) return;
      if (Store.get().superDates.indexOf(d) < 0) Store.toggleSuperDate(d);
    }
    UI.setSheet(superHtml());
    App.refreshTheme(); App.render();
  };

  /* =============== settings =============== */
  function settingsHtml() {
    var S = Store.get(), lang = I18N.lang, ws = Store.weekStart();
    var seg = function (act, cur, items) {
      return '<div class="seg sm">' + items.map(function (x) { return '<button type="button" class="' + (String(cur) === String(x[0]) ? 'on' : '') + '" data-act="' + act + '" data-v="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>';
    };
    var h = UI.sheetHead(t('set.title')) + '<div class="sheet-b">' +
      '<div class="fld"><span>' + ic('globe', 16) + esc(t('set.language')) + '</span>' + seg('setLang', lang, [['ar', 'العربية'], ['en', 'English']]) + '</div>' +
      '<div class="fld"><span>' + ic('sun', 16) + esc(t('set.theme')) + '</span>' + seg('setTheme', S.theme, [['auto', t('set.auto')], ['light', t('set.light')], ['dark', t('set.dark')]]) + '</div>' +
      '<div class="fld"><span>' + ic('calendar', 16) + esc(t('set.weekStart')) + '</span>' + seg('setWeek', ws, [[6, UI.weekdayName(6)], [0, UI.weekdayName(0)], [1, UI.weekdayName(1)]]) + '</div>' +
      '<div class="fld"><span>' + ic('phone', 16) + esc(t('set.install')) + '</span>';
    if (App.isStandalone()) h += '<p class="muted sm">' + esc(t('set.installed')) + '</p>';
    else if (App.canInstall()) h += '<p class="muted sm">' + esc(t('set.installDesc')) + '</p><button type="button" class="btn primary" data-act="install">' + ic('download', 18) + esc(t('set.installBtn')) + '</button>';
    else if (App.isIOS()) h += '<p class="muted sm">' + esc(t('set.installIOS')) + '</p>';
    else h += '<p class="muted sm">' + esc(t('set.installOther')) + '</p>';
    h += '</div>' +
      '<div class="fld"><span>' + ic('download', 16) + esc(t('set.backup')) + '</span><p class="muted sm">' + esc(t('set.backupDesc')) + '</p><div class="row-btns">' +
        '<button type="button" class="btn" data-act="export">' + ic('download', 18) + esc(t('set.export')) + '</button>' +
        '<label class="btn">' + ic('upload', 18) + esc(t('set.import')) + '<input id="imp-file" type="file" accept="application/json,.json" hidden></label></div></div>' +
      '<div class="fld"><span>' + ic('refresh', 16) + esc(t('set.update')) + '</span><div class="row-btns"><button type="button" class="btn" data-act="checkUpdate">' + esc(t('set.checkUpdate')) + '</button></div></div>' +
      '<div class="fld"><span>' + ic('trash', 16) + esc(t('set.danger')) + '</span><div class="row-btns"><button type="button" class="btn danger-ghost" data-act="resetAll">' + esc(t('set.reset')) + '</button></div></div>' +
      '<p class="muted sm center about">TrainBook v' + esc(App.VERSION) + ' (' + esc(App.BUILD) + ') · ' + esc(t('set.local')) + '</p></div>';
    return h;
  }
  UI.openSettings = function () { UI.openSheet(settingsHtml(), { label: t('set.title') }); };
  UI.refreshSettings = function () { if (UI.sheetOpen()) UI.setSheet(settingsHtml()); };

  /* =============== course details =============== */
  var pick = null;
  function sortedPick() {
    var order = UI.weekOrder();
    return pick.days.slice().sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
  }
  function rowTxt(r, unit) {
    var u = unit === 'sec' ? t('u.secShort') : '';
    var a = r[2], b = r[2] + r[3] * (pick.course.weeks - 1);
    return (r[1] > 1 ? r[1] + ' × ' : '') + a + u + (b !== a ? ' → ' + b + u : '');
  }
  function courseHtml() {
    var c = pick.course, lang = I18N.lang, n = c.sessions.length, sel = sortedPick(), S = Store.get();
    var ok = sel.length === n, active = S.course && S.course.id === c.id;
    var h = UI.sheetHead(c.name[lang]) + '<div class="sheet-b">' +
      '<div class="facts big"><span>' + esc(t('c.weeks', { n: c.weeks })) + '</span><span>' + esc(t('c.perWeek', { n: n })) + '</span><span class="lvl">' + UI.levelBars(c.level) + esc(t('lv.' + c.level)) + '</span></div>' +
      '<p>' + esc(c.desc[lang]) + '</p><p class="muted sm style">' + ic('star', 14) + esc(c.style[lang]) + '</p>' +
      '<p class="muted sm">' + esc(t('c.progNote')) + '</p>' +
      '<div class="fld"><span>' + esc(t('c.pickDays', { n: n })) + ' <b class="pickcount' + (ok ? ' ok' : '') + '">' + sel.length + '/' + n + '</b></span><div class="chips wrap">' + UI.weekOrder().map(function (w) {
        return '<button type="button" class="chip day' + (pick.days.indexOf(w) >= 0 ? ' on' : '') + '" data-act="cDay" data-v="' + w + '">' + esc(UI.weekdayName(w, 'short')) + '</button>';
      }).join('') + '</div></div><div class="sess-list">';
    c.sessions.forEach(function (s, i) {
      h += '<div class="sess"><div class="sess-h"><b>' + esc(s.name[lang]) + '</b>' + (ok ? '<span class="wdbadge">' + esc(UI.weekdayName(sel[i], 'long')) + '</span>' : '') + '</div>' +
        s.ex.map(function (r) {
          var info = Data.exInfo(r[0]);
          return '<div class="sess-r" style="--cat:var(--c-' + info.cat + ')"><span class="cbar"></span><span class="nm">' + esc(Data.exName(r[0], lang)) + '</span><span class="vl" dir="ltr">' + esc(rowTxt(r, info.unit)) + '</span></div>';
        }).join('') + '</div>';
    });
    h += '</div></div><div class="sheet-f"><button type="button" class="btn primary grow" data-act="cStart"' + (ok ? '' : ' disabled') + '>' + ic('play', 18) + esc(active ? t('c.restart') : t('c.start')) + '</button></div>';
    return h;
  }
  UI.openCourse = function (id) {
    var c = Data.course(id); if (!c) return;
    var S = Store.get(), ws = Store.weekStart(), days;
    if (S.course && S.course.id === id && S.course.days && S.course.days.length === c.sessions.length) days = S.course.days.slice();
    else days = Data.defaultOffsets(c.sessions.length).map(function (o) { return (ws + o) % 7; });
    pick = { course: c, days: days };
    UI.openSheet(courseHtml(), { cls: 'tall', label: c.name[I18N.lang], onClose: function () { pick = null; } });
  };
  UI.courseAct = function (act, v) {
    if (!pick) return;
    if (act === 'cDay') {
      var d = +v, i = pick.days.indexOf(d);
      if (i >= 0) pick.days.splice(i, 1); else if (pick.days.length < pick.course.sessions.length) pick.days.push(d);
      else { UI.toast(t('c.tooMany', { n: pick.course.sessions.length })); return; }
      UI.setSheet(courseHtml());
    } else if (act === 'cStart') {
      var c = pick.course, days = sortedPick();
      var go = function () {
        Store.startCourse(c, days);
        UI.closeSheet(true);
        UI.toast(t('c.started'));
        App.go('course');
      };
      if (Store.get().course) {
        UI.confirm({ title: t('c.replaceTitle'), msg: t('c.replaceMsg'), ok: t('c.start'), onOk: go });
      } else go();
    }
  };
})();
