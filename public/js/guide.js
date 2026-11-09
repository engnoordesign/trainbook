/* "How to do it": the guide sheet (pictures of the movement, a little animation, steps, tips) and the course guide. */
(function () {
  'use strict';
  var UI = window.UI;
  var t = function (k, v) { return I18N.t(k, v); }, esc = UI.esc, ic = UI.ic;
  var cur = null, anim = null;

  UI.hasGuide = function (id) { return !!id && Guides.has(id) && !!Poses[id]; };
  /** the little "?" button next to an exercise name. o = { act, v } lets the course sheet open the guide inline instead */
  UI.guideBtn = function (id, o) {
    if (!UI.hasGuide(id)) return '';
    o = o || {};
    return '<button type="button" class="gbtn" data-act="' + (o.act || 'guide') + '" data-ex="' + id + '"' + (o.v ? ' data-v="' + esc(o.v) + '"' : '') +
      ' aria-label="' + esc(t('g.open')) + '" title="' + esc(t('g.open')) + '">' + ic('help', 15) + '</button>';
  };

  /* ---------- pieces ---------- */
  function sequenceHtml(id) {
    var r = Poses[id], vb = Figure.viewBox(r), name = Data.exName(id, I18N.lang);
    var h = '<div class="figs">' + r.frames.map(function (f, i) {
      return '<figure class="fig-f">' + Figure.frameSvg(r, i, vb, { label: esc(name + ' ' + (i + 1)) }) +
        '<figcaption><span class="fig-n">' + (i + 1) + '</span>' + esc(t('g.c.' + r.caps[i])) + '</figcaption></figure>';
    }).join('') + '</div>';
    if (r.inset) h += '<div class="g-inset">' + Figure.inset(r.inset) + '<span>' + esc(t('g.i.' + r.inset)) + '</span></div>';
    return h;
  }
  function textHtml(id) {
    var g = Guides.get(id, I18N.lang), h = '';
    h += '<div class="g-meta">' + g.muscles.map(function (m) { return '<span class="mchip">' + esc(t('g.m.' + m)) + '</span>'; }).join('') + '</div>';
    h += '<p class="g-gear">' + ic(g.equipment ? 'target' : 'check', 15) + '<span>' + esc(g.equipment ? t('g.gear') + ': ' + t('g.eq.' + g.equipment) : t('g.nogear')) + '</span></p>';
    h += '<h4 class="g-h">' + esc(t('g.steps')) + '</h4><ol class="g-steps">' + g.steps.map(function (s) { return '<li><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>';
    if (g.tip) h += '<div class="g-note tip">' + ic('star', 16) + '<div><b>' + esc(t('g.tip')) + '</b>' + esc(g.tip) + '</div></div>';
    if (g.mistake) h += '<div class="g-note warn">' + ic('info', 16) + '<div><b>' + esc(t('g.mistake')) + '</b>' + esc(g.mistake) + '</div></div>';
    return h;
  }
  function heroHtml() {
    var r = cur.rec, vb = cur.vb, multi = r.frames.length > 1;
    return '<div class="g-hero"><svg class="fig" id="g-anim" viewBox="0 0 ' + vb.w + ' ' + (vb.top + 8) + '" role="img" aria-label="' + esc(Data.exName(cur.id, I18N.lang)) + '" focusable="false">' +
      '<g>' + Figure.staticLayer(r, vb) + '</g><g id="g-body">' + Figure.bodyOnly(r, r.frames[0], vb) + '</g></svg>' +
      (multi ? '<button type="button" class="btn sm primary" id="g-play" data-act="guidePlay">' + ic('play', 14) + esc(t('g.play')) + '</button>' : '<p class="muted sm">' + esc(t('g.holdNote')) + '</p>') + '</div>';
  }

  /* ---------- the sheet ---------- */
  function stopAnim() { if (anim) { cancelAnimationFrame(anim.raf); anim = null; } }
  UI.openGuide = function (id) {
    if (!UI.hasGuide(id)) return;
    stopAnim();
    cur = { id: id, rec: Poses[id], vb: Figure.viewBox(Poses[id]) };
    var info = Data.exInfo(id), name = Data.exName(id, I18N.lang);
    UI.openSheet(UI.sheetHead(name, t('cat.' + info.cat) + ' · ' + (info.unit === 'sec' ? t('g.holdIt') : t('g.repsIt'))) +
      '<div class="sheet-b guide">' + heroHtml() + '<h4 class="g-h">' + esc(t('g.seq')) + '</h4>' + sequenceHtml(id) + textHtml(id) + '</div>',
      { label: name, kind: 'guide', onClose: stopAnim });
  };
  function setPlayBtn(on) { var b = UI.$('#g-play'); if (b) b.innerHTML = ic(on ? 'pause' : 'play', 14) + esc(t(on ? 'g.stop' : 'g.play')); }
  var ease = function (u) { return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; };
  UI.guidePlay = function () {
    if (!cur || !UI.$('#g-body')) return;
    if (anim) { stopAnim(); setPlayBtn(false); return; }
    var fr = cur.rec.frames, n = fr.length, SEG = 1500, HOLD = 520, t0 = performance.now();
    anim = { raf: 0 };
    var step = function (now) {
      var body = UI.$('#g-body');
      if (!anim || !body) { anim = null; return; }
      var tt = (now - t0) % (SEG * n), i = Math.floor(tt / SEG), l = tt - i * SEG, u = l < HOLD ? 0 : ease((l - HOLD) / (SEG - HOLD));
      body.innerHTML = Figure.bodyOnly(cur.rec, Figure.blend(fr[i], fr[(i + 1) % n], u), cur.vb);
      anim.raf = requestAnimationFrame(step);
    };
    anim.raf = requestAnimationFrame(step); setPlayBtn(true);
  };

  /* ---------- inside the course sheet ---------- */
  UI.exInline = function (id) {
    if (!UI.hasGuide(id)) return '';
    return '<div class="g-inline">' + sequenceHtml(id) + textHtml(id) + '<div class="row-btns center"><button type="button" class="btn sm" data-act="guide" data-ex="' + id + '">' + ic('play', 14) + esc(t('g.fullGuide')) + '</button></div></div>';
  };
  UI.courseGuideHtml = function (c) {
    var g = Guides.getCourse(c.id, I18N.lang); if (!g) return '';
    var gear = {};
    c.sessions.forEach(function (s) { s.ex.forEach(function (r) { var e = Guides.EX[r[0]]; if (e && e.e) gear[e.e] = 1; }); });
    var list = Guides.GEAR.filter(function (k) { return gear[k]; });
    var h = '<div class="g-course"><p>' + esc(g.how) + '</p>';
    h += '<p class="g-gear">' + ic(list.length ? 'target' : 'check', 15) + '<span>' + esc(list.length ? t('g.gearCourse') + ': ' + list.map(function (k) { return t('g.eq.' + k); }).join(' · ') : t('g.nogear')) + '</span></p>';
    h += '<ul class="g-bul"><li>' + esc(t('g.cg.warm')) + '</li><li>' + esc(t('g.cg.prog')) + '</li>' + g.tips.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '<li>' + esc(t('g.cg.safe')) + '</li></ul></div>';
    return h;
  };
})();
