/* UI helpers: escaping, formatting, toast, bottom sheet, confirm. */
(function () {
  'use strict';
  var UI = window.UI = { filter: { today: 'all', course: 'all', ctab: 'course' }, hist: null };
  var t = function (k, v) { return I18N.t(k, v); };

  UI.$ = function (s, r) { return (r || document).querySelector(s); };
  UI.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  UI.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  UI.ic = Icons.ic;
  UI.LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="currentColor"/><rect x="9" y="8" width="14" height="17" rx="2.5" fill="#fff"/><path d="M9 12h-1.5M9 16.5H7.5M9 21H7.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="m12.6 16.6 2.3 2.3 4.6-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ----- locale helpers ----- */
  UI.loc = function () { return I18N.lang === 'ar' ? 'ar-u-nu-latn' : 'en'; };
  UI.fmtDate = function (k, opts) { return new Intl.DateTimeFormat(UI.loc(), opts).format(Store.parse(k)); };
  UI.weekdayName = function (w, style) { return new Intl.DateTimeFormat(UI.loc(), { weekday: style || 'long' }).format(new Date(2023, 0, 1 + w)); };
  UI.weekOrder = function () { var ws = Store.weekStart(), a = []; for (var i = 0; i < 7; i++) a.push((ws + i) % 7); return a; };

  /* ----- exercise helpers ----- */
  UI.nameOf = function (e) { return e.exId ? Data.exName(e.exId, I18N.lang) : (e.title || ''); };
  UI.unitLabel = function (unit) { return unit === 'sec' ? t('u.sec') : t('u.reps'); };
  UI.stepFor = function (unit) { return unit === 'sec' ? 5 : 1; };
  UI.target = function (e) {
    var v = e.reps + ' ' + UI.unitLabel(e.unit);
    return e.sets > 1 ? e.sets + ' × ' + v : v;
  };
  UI.catDot = function (cat) { return '<span class="cdot" style="--cat:var(--c-' + cat + ')"></span>'; };

  /* ----- toast ----- */
  UI.toast = function (msg, opt) {
    opt = opt || {};
    var root = UI.$('#toast-root'); if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = '<span>' + UI.esc(msg) + '</span>' + (opt.label ? '<button class="toast-btn" type="button">' + UI.esc(opt.label) + '</button>' : '');
    root.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('in'); });
    var kill = function () { el.classList.remove('in'); setTimeout(function () { el.remove(); }, 250); };
    if (opt.label) UI.$('.toast-btn', el).addEventListener('click', function () { kill(); if (opt.onClick) opt.onClick(); });
    setTimeout(kill, opt.ms || (opt.label ? 9000 : 2400));
  };

  /* ----- sheet ----- */
  var lastFocus = null, onClose = null, sheetIsOpen = false, sheetKind = '';
  UI.sheetKind = function () { return sheetKind; };
  UI.openSheet = function (html, opts) {
    opts = opts || {};
    var root = UI.$('#sheet-root');
    if (root.firstChild) UI.closeSheet(true);
    lastFocus = document.activeElement; onClose = opts.onClose || null; sheetIsOpen = true; sheetKind = opts.kind || '';
    root.innerHTML = '<div class="backdrop" data-act="closeSheet"></div>' +
      '<div class="sheet ' + (opts.cls || '') + '" role="dialog" aria-modal="true" aria-label="' + UI.esc(opts.label || '') + '" tabindex="-1">' + html + '</div>';
    document.body.classList.add('noscroll');
    var show = function () { if (sheetIsOpen) root.classList.add('open'); };
    requestAnimationFrame(show); setTimeout(show, 60);       // the timer is a fallback for tabs where animation frames are paused
    var sheet = UI.$('.sheet', root);
    var auto = UI.$('[autofocus]', sheet);
    setTimeout(function () { (auto || sheet).focus({ preventScroll: true }); }, 60);
  };
  /* swap the content of the open sheet without animating again */
  UI.setSheet = function (html) {
    var s = UI.$('#sheet-root .sheet'); if (!s) return;
    var sc = s.scrollTop; s.innerHTML = html; s.scrollTop = sc;
  };
  UI.sheetOpen = function () { return sheetIsOpen; };
  UI.closeSheet = function (quiet) {
    var root = UI.$('#sheet-root');
    if (!root.firstChild) return;
    var cb = onClose; onClose = null; sheetIsOpen = false; sheetKind = '';
    root.classList.remove('open');
    var fin = function () { root.innerHTML = ''; };
    if (quiet) fin(); else setTimeout(fin, 220);
    document.body.classList.remove('noscroll');
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { } }
    if (cb) cb();
  };
  UI.sheetHead = function (title, sub) {
    return '<div class="sheet-h"><div><h3>' + UI.esc(title) + '</h3>' + (sub ? '<p class="muted sm">' + UI.esc(sub) + '</p>' : '') + '</div>' +
      '<button class="icon-btn" type="button" data-act="closeSheet" aria-label="' + UI.esc(t('a.close')) + '">' + UI.ic('x', 20) + '</button></div>';
  };

  /* ----- confirm ----- */
  var confirmCb = null;
  UI.confirm = function (o) {
    confirmCb = o.onOk;
    UI.openSheet(UI.sheetHead(o.title) +
      '<div class="sheet-b"><p>' + UI.esc(o.msg || '') + '</p></div>' +
      '<div class="sheet-f"><button class="btn" type="button" data-act="closeSheet">' + UI.esc(t('a.cancel')) + '</button>' +
      '<button class="btn ' + (o.danger ? 'danger' : 'primary') + '" type="button" data-act="confirmOk" autofocus>' + UI.esc(o.ok || t('a.ok')) + '</button></div>',
      { cls: 'sm', label: o.title });
  };
  UI.confirmOk = function () { var cb = confirmCb; confirmCb = null; UI.closeSheet(); if (cb) cb(); };
})();
