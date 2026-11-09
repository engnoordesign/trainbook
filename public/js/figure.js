/* A tiny stick-figure engine for the "how to do it" pictures. Pure functions, no DOM: it turns a pose into SVG text.
 * Works in the browser (window.Figure) and in Node (module.exports) so the geometry can be tested.
 *
 * Units: y points UP, the floor is y = 0, a standing figure is about 108 units tall. The figure faces right (+x).
 * A pose lists a few anchor points; the arms and legs are solved with two-bone IK so every bone keeps its length:
 *   hip:[x,y] | sh:[x,y]   where the body hangs (shoulder or hip)       t: torso lean in degrees from straight up (+ = forward)
 *   h1,h2: hands  f1,f2: ankles   ([x,y] absolute, or {r:[dx,dy]} relative to the shoulder / hip)
 *   eb1,eb2,kb1,kb2: which way elbows / knees bend (+1 / -1)   fa1,fa2: foot angle in degrees (0 = flat, -75 = on the toes)
 *   nk: head tilt   hl: parts to highlight ['arms','legs','torso']   view:'front' for a front view (jacks, side squats). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Figure = factory();
})(this, function () {
  'use strict';

  var L = { torso: 33, neck: 6, head: 7.5, thigh: 25, shin: 25, foot: 9, uarm: 18, farm: 17 };
  var ANK = 2.5, LEG = L.thigh + L.shin, ARM = L.uarm + L.farm;
  var rad = function (d) { return d * Math.PI / 180; };
  var deg = function (r) { return r * 180 / Math.PI; };
  var R1 = function (n) { return Math.round(n * 10) / 10; };

  /* ---------- geometry ---------- */
  /** two-bone IK: the middle joint of a limb from root a to target b (s = which side it bends) and where the end really lands */
  function ik(a, b, l1, l2, s) {
    var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1e-6, reach = l1 + l2 - 1e-4;
    var ux = dx / d, uy = dy / d;
    if (d >= reach) return { mid: [a[0] + ux * l1, a[1] + uy * l1], end: [a[0] + ux * (l1 + l2), a[1] + uy * (l1 + l2)] };
    var dd = Math.max(d, Math.abs(l1 - l2) + 1e-3);
    var x = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    var mid = [a[0] + ux * x - uy * h * s, a[1] + uy * x + ux * h * s];
    return { mid: mid, end: [a[0] + ux * dd, a[1] + uy * dd] };
  }
  var add = function (a, v) { return [a[0] + v[0], a[1] + v[1]]; };
  function target(t, root) { return !t ? null : (t.r ? add(root, t.r) : t); }
  function up(tilt) { return [Math.sin(rad(tilt)), Math.cos(rad(tilt))]; }

  /* ---------- pose -> skeleton ---------- */
  function solve(p) {
    var front = p.view === 'front', sk = { front: front, hl: p.hl || [] };
    var hip = p.hip, tt = p.t || 0, u = up(tt);
    if (!hip) hip = [p.sh[0] - L.torso * u[0], p.sh[1] - L.torso * u[1]];
    var sh = [hip[0] + L.torso * u[0], hip[1] + L.torso * u[1]];
    var e = [Math.cos(rad(tt)), -Math.sin(rad(tt))];                       // across the body (front view)
    var hw = p.hw == null ? 7 : p.hw, sw = p.sw == null ? 11 : p.sw;
    sk.hip = hip; sk.sh = sh;
    var hd = up(tt + (p.nk || 0)); sk.head = [sh[0] + hd[0] * (L.neck + L.head), sh[1] + hd[1] * (L.neck + L.head)]; sk.neck = [sh[0] + hd[0] * 2, sh[1] + hd[1] * 2];
    if (front) { sk.hipL = [hip[0] - e[0] * hw, hip[1] - e[1] * hw]; sk.hipR = [hip[0] + e[0] * hw, hip[1] + e[1] * hw]; sk.shL = [sh[0] - e[0] * sw, sh[1] - e[1] * sw]; sk.shR = [sh[0] + e[0] * sw, sh[1] + e[1] * sw]; }
    sk.legs = []; sk.arms = [];
    [1, 2].forEach(function (i) {
      var f = p['f' + i], h = p['h' + i];
      var hr = front ? (i === 1 ? sk.hipL : sk.hipR) : hip, sr = front ? (i === 1 ? sk.shL : sk.shR) : sh;
      var lk = p['l' + i], ak = p['a' + i];                                   // l1/a1: leg / arm by two angles (0 = right, 90 = up)
      if (f || lk) {
        var mid, end;
        if (lk) { mid = [hr[0] + L.thigh * Math.cos(rad(lk[0])), hr[1] + L.thigh * Math.sin(rad(lk[0]))]; end = [mid[0] + L.shin * Math.cos(rad(lk[1])), mid[1] + L.shin * Math.sin(rad(lk[1]))]; }
        else { var r = ik(hr, target(f, hr), L.thigh, L.shin, p['kb' + i] == null ? 1 : p['kb' + i]); mid = r.mid; end = r.end; }
        var fa = p['fa' + i] == null ? (front ? (i === 1 ? 180 : 0) : 0) : p['fa' + i], fr = rad(fa);
        sk.legs.push({ far: i === 2, pts: [hr, mid, end, [end[0] + Math.cos(fr) * L.foot, end[1] + Math.sin(fr) * L.foot]] });
      }
      if (h || ak) {
        var m2, e2;
        if (ak) { m2 = [sr[0] + L.uarm * Math.cos(rad(ak[0])), sr[1] + L.uarm * Math.sin(rad(ak[0]))]; e2 = [m2[0] + L.farm * Math.cos(rad(ak[1])), m2[1] + L.farm * Math.sin(rad(ak[1]))]; }
        else { var ra = ik(sr, target(h, sr), L.uarm, L.farm, p['eb' + i] == null ? -1 : p['eb' + i]); m2 = ra.mid; e2 = ra.end; }
        sk.arms.push({ far: i === 2, pts: [sr, m2, e2] });
      }
    });
    return sk;
  }

  /** a pose with every target made absolute (so two poses can be blended) */
  function norm(p) {
    var sk = solve(p), q = { view: p.view, hl: p.hl, hw: p.hw, sw: p.sw, nk: p.nk || 0, t: p.t || 0, hip: sk.hip.slice() };
    [1, 2].forEach(function (i) {
      [['f', 'l', 'kb', L.thigh, L.shin, 1], ['h', 'a', 'eb', L.uarm, L.farm, -1]].forEach(function (c) {
        if (!p[c[0] + i] && !p[c[1] + i]) return;
        var limb = (c[0] === 'f' ? sk.legs : sk.arms).filter(function (l) { return l.far === (i === 2); })[0], root = limb.pts[0], end = limb.pts[2];
        q[c[0] + i] = end.slice();
        if (p[c[1] + i]) {                                   // an angle-defined limb: work out which way it bends so it can be blended
          var a = ik(root, end, c[3], c[4], 1).mid, b = ik(root, end, c[3], c[4], -1).mid, m = limb.pts[1];
          q[c[2] + i] = Math.hypot(a[0] - m[0], a[1] - m[1]) <= Math.hypot(b[0] - m[0], b[1] - m[1]) ? 1 : -1;
        } else if (p[c[2] + i] != null) q[c[2] + i] = p[c[2] + i];
      });
      if (p['fa' + i] != null) q['fa' + i] = p['fa' + i];
    });
    return q;
  }
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var lerpV = function (a, b, t) { return a && b ? [lerp(a[0], b[0], t), lerp(a[1], b[1], t)] : (a || b); };
  /** blend between two poses (t 0..1) for the little animation */
  function blend(a, b, t) {
    var A = norm(a), B = norm(b), q = { view: B.view, hl: B.hl, hw: B.hw, sw: B.sw };
    q.hip = lerpV(A.hip, B.hip, t); q.t = lerp(A.t, B.t, t); q.nk = lerp(A.nk, B.nk, t);
    [1, 2].forEach(function (i) {
      ['f', 'h'].forEach(function (k) { var v = lerpV(A[k + i], B[k + i], t); if (v) q[k + i] = v; });
      ['fa', 'eb', 'kb'].forEach(function (k) {
        var x = A[k + i], y = B[k + i];
        if (x != null && y != null) q[k + i] = (k === 'fa') ? lerp(x, y, t) : (t < .5 ? x : y); else if (x != null || y != null) q[k + i] = x != null ? x : y;
      });
    });
    return q;
  }

  /* ---------- props ---------- */
  function propPoints(pr) {
    switch (pr.k) {
      case 'bar': return [[pr.x - 26, pr.y], [pr.x + 26, pr.y], [pr.x - 26, 0], [pr.x + 26, 0]];
      case 'bars': return [[pr.x - 20, pr.y], [pr.x + 20, pr.y], [pr.x, 0]];
      case 'wall': return [[pr.x, 0], [pr.x, 112]];
      case 'box': return [[pr.x - pr.w / 2, 0], [pr.x + pr.w / 2, pr.h]];
      case 'pole': return [[pr.x, 0], [pr.x, 100]];
      default: return [];
    }
  }
  function propSvg(pr, T) {
    var P = function (x, y) { var q = T([x, y]); return R1(q[0]) + ',' + R1(q[1]); };
    switch (pr.k) {
      case 'bar': return '<path class="fg-prop" d="M' + P(pr.x - 24, 0) + 'L' + P(pr.x - 24, pr.y) + 'M' + P(pr.x + 24, 0) + 'L' + P(pr.x + 24, pr.y) + '"/><path class="fg-prop2" d="M' + P(pr.x - 26, pr.y) + 'L' + P(pr.x + 26, pr.y) + '"/>';
      case 'bars': return '<path class="fg-prop" d="M' + P(pr.x - 14, 0) + 'L' + P(pr.x - 14, pr.y - 1) + 'M' + P(pr.x + 14, 0) + 'L' + P(pr.x + 14, pr.y - 1) + '"/><path class="fg-prop2" d="M' + P(pr.x - 20, pr.y) + 'L' + P(pr.x + 20, pr.y) + '"/>';
      case 'wall': return '<path class="fg-wall" d="M' + P(pr.x, 0) + 'L' + P(pr.x, 112) + '"/>';
      case 'pole': return '<path class="fg-prop2" d="M' + P(pr.x, 0) + 'L' + P(pr.x, 100) + '"/>';
      case 'box': return '<path class="fg-box" d="M' + P(pr.x - pr.w / 2, 0) + 'L' + P(pr.x - pr.w / 2, pr.h) + 'L' + P(pr.x + pr.w / 2, pr.h) + 'L' + P(pr.x + pr.w / 2, 0) + '"/>';
      default: return '';
    }
  }

  /* ---------- drawing ---------- */
  function pts(sk) {
    var a = [sk.hip, sk.sh, sk.head];
    sk.legs.concat(sk.arms).forEach(function (l) { l.pts.forEach(function (q) { a.push(q); }); });
    return a;
  }
  /** one window for all the frames of an exercise, so the figure stays the same size from picture to picture */
  function viewBox(rec) {
    var ps = [];
    rec.frames.forEach(function (f) { pts(solve(f)).forEach(function (q) { ps.push(q); }); });
    (rec.props || []).forEach(function (pr) { propPoints(pr).forEach(function (q) { ps.push(q); }); });
    var x0 = 1e9, x1 = -1e9, y1 = -1e9;
    ps.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); });
    var cx = (x0 + x1) / 2, hw = Math.max(76, (x1 - x0) / 2 + 14), top = Math.max(66, y1 + 18);
    return { x: R1(cx - hw), y: -8, w: R1(hw * 2), h: R1(top + 8), minY: -8, top: top };
  }
  var pathOf = function (arr, T) { return 'M' + arr.map(function (q) { var p = T(q); return R1(p[0]) + ',' + R1(p[1]); }).join('L'); };

  function bodySvg(sk, T, cls) {
    var hl = function (part) { return sk.hl.indexOf(part) >= 0 ? ' fg-hl' : ''; }, s = '';
    var legs = sk.legs.slice().sort(function (a, b) { return (b.far ? 1 : 0) - (a.far ? 1 : 0); }), arms = sk.arms.slice().sort(function (a, b) { return (b.far ? 1 : 0) - (a.far ? 1 : 0); });
    legs.filter(function (l) { return l.far; }).forEach(function (l) { s += '<path class="fg-ln fg-far' + hl('legs') + '" d="' + pathOf(l.pts, T) + '"/>'; });
    arms.filter(function (l) { return l.far; }).forEach(function (l) { s += '<path class="fg-ln fg-far' + hl('arms') + '" d="' + pathOf(l.pts, T) + '"/>'; });
    if (sk.front) s += '<path class="fg-ln fg-torso' + hl('torso') + '" d="' + pathOf([sk.hipL, sk.hipR], T) + pathOf([sk.hip, sk.sh], T) + pathOf([sk.shL, sk.shR], T) + '"/>';
    else s += '<path class="fg-ln fg-torso' + hl('torso') + '" d="' + pathOf([sk.hip, sk.sh], T) + '"/>';
    legs.filter(function (l) { return !l.far; }).forEach(function (l) { s += '<path class="fg-ln' + hl('legs') + '" d="' + pathOf(l.pts, T) + '"/>'; });
    arms.filter(function (l) { return !l.far; }).forEach(function (l) { s += '<path class="fg-ln' + hl('arms') + '" d="' + pathOf(l.pts, T) + '"/>'; });
    var h = T(sk.head);
    s += '<circle class="fg-head" cx="' + R1(h[0]) + '" cy="' + R1(h[1]) + '" r="' + (L.head - 1.3) + '"/>';
    return '<g class="' + (cls || '') + '">' + s + '</g>';
  }

  function arrowSvg(a, b, T) {
    var A = T(a), B = T(b), dx = B[0] - A[0], dy = B[1] - A[1], d = Math.sqrt(dx * dx + dy * dy);
    if (d < 7) return '';
    var ux = dx / d, uy = dy / d, hs = 5.5, bx = B[0] - ux * hs, by = B[1] - uy * hs;
    return '<path class="fg-arrow" d="M' + R1(A[0] + ux * 3) + ',' + R1(A[1] + uy * 3) + 'L' + R1(bx) + ',' + R1(by) + '"/><path class="fg-arrowhead" d="M' + R1(B[0]) + ',' + R1(B[1]) + 'L' + R1(bx - uy * 3.6) + ',' + R1(by + ux * 3.6) + 'L' + R1(bx + uy * 3.6) + ',' + R1(by - ux * 3.6) + 'Z"/>';
  }
  var JOINT = { sh: function (s) { return s.sh; }, hip: function (s) { return s.hip; }, head: function (s) { return s.head; },
    hand: function (s) { return (s.arms[0] || { pts: [0, 0, s.sh] }).pts[2]; }, hand2: function (s) { return (s.arms[1] || s.arms[0] || { pts: [0, 0, s.sh] }).pts[2]; },
    foot: function (s) { return (s.legs[0] || { pts: [0, 0, s.hip] }).pts[2]; }, foot2: function (s) { return (s.legs[1] || s.legs[0] || { pts: [0, 0, s.hip] }).pts[2]; },
    knee: function (s) { return (s.legs[0] || { pts: [0, s.hip] }).pts[1]; }, knee2: function (s) { return (s.legs[1] || s.legs[0] || { pts: [0, s.hip] }).pts[1]; },
    elbow: function (s) { return (s.arms[0] || { pts: [0, s.sh] }).pts[1]; } };

  /** the picture of one frame. i = which frame, rec = the exercise, vb = shared window */
  function frameSvg(rec, i, vb, o) {
    o = o || {};
    var T = function (q) { return [q[0] - vb.x, vb.top - q[1]]; };
    var frames = rec.frames, n = frames.length, sk = solve(frames[i]), nxt = solve(frames[(i + 1) % n]);
    var s = '<svg class="fig" viewBox="0 0 ' + vb.w + ' ' + R1(vb.top + 8) + '" role="img" aria-label="' + (o.label || '') + '" focusable="false">';
    s += '<path class="fg-floor" d="M' + R1(0) + ',' + R1(vb.top) + 'L' + vb.w + ',' + R1(vb.top) + '"/>';
    (rec.props || []).forEach(function (pr) { s += propSvg(pr, T); });
    if (n > 1) s += bodySvg(nxt, T, 'fg-ghost');
    s += bodySvg(sk, T, 'fg-main');
    if (n > 1 && (rec.mv || [])[i]) {
      var j = JOINT[rec.mv[i]];
      if (j) s += arrowSvg(j(sk), j(nxt), T);
    }
    return s + '</svg>';
  }
  /** the animated picture: just the figure for pose p (the page redraws this every few milliseconds) */
  function bodyOnly(rec, p, vb) {
    var T = function (q) { return [q[0] - vb.x, vb.top - q[1]]; };
    return bodySvg(solve(p), T, 'fg-main');
  }
  function staticLayer(rec, vb) {
    var T = function (q) { return [q[0] - vb.x, vb.top - q[1]]; }, s = '<path class="fg-floor" d="M0,' + R1(vb.top) + 'L' + vb.w + ',' + R1(vb.top) + '"/>';
    (rec.props || []).forEach(function (pr) { s += propSvg(pr, T); });
    return s;
  }

  /** small top-view / front-view diagrams for hand placement (wide, diamond, archer ... grips) */
  function inset(kind) {
    var hand = function (x, y, rot) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')"><rect class="in-hand" x="-5.5" y="-7" width="11" height="14" rx="4"/><path class="in-tick" d="M0,-7V-12"/></g>'; };
    var s = '<svg class="fig-in" viewBox="0 0 120 72" role="img" focusable="false">';
    var push = { std: [[-20, 22, 0], [20, 22, 0]], wide: [[-42, 22, 0], [42, 22, 0]], diamond: [[-6, 20, 0], [6, 20, 0]], archer: [[-44, 22, 20], [20, 22, 0]], pseudo: [[-22, 54, 180], [22, 54, 180]] };
    var grip = { under: [[-20, 34, 0], [20, 34, 0]], widegrip: [[-44, 34, 0], [44, 34, 0]], close: [[-6, 34, 0], [6, 34, 0]], archerpull: [[-46, 34, 0], [22, 34, 0]], neutral: [[-14, 34, 0], [14, 34, 0]] };
    if (push[kind]) {
      s += '<rect class="in-body" x="22" y="12" width="76" height="12" rx="6"/><circle class="in-head" cx="60" cy="6" r="6"/><path class="in-body" d="M44,26V66M76,26V66" style="opacity:.25"/>';
      push[kind].forEach(function (h) { s += hand(60 + h[0], h[1] + (kind === 'pseudo' ? 0 : 6), h[2]); });
      if (kind === 'archer') s += '<path class="in-line" d="M16,28H52"/>';
      if (kind === 'diamond') s += '<path class="in-line" d="M54,26L60,38L66,26Z"/>';
    } else if (grip[kind]) {
      s += '<path class="in-bar" d="M8,34H112"/>';
      grip[kind].forEach(function (h) { s += hand(60 + h[0], 34, 0).replace('translate(', 'translate(').replace('y="-7"', 'y="-9"'); });
      s += '<rect class="in-body" x="34" y="46" width="52" height="12" rx="6"/><circle class="in-head" cx="60" cy="62" r="6"/>';
      if (kind === 'under') s += '<path class="in-line" d="M30,18A30 10 0 0 1 90,18"/>';
      if (kind === 'archerpull') s += '<path class="in-line" d="M14,46H34"/>';
    }
    if (kind === 'twist') s += '<circle class="in-body" cx="60" cy="36" r="13"/><circle class="in-head" cx="60" cy="36" r="5"/><path class="in-line" d="M34,16A34 34 0 0 0 34,56"/><path class="in-line" d="M86,16A34 34 0 0 1 86,56"/><path class="in-tick" d="M34,56l-1,-7M34,56l7,-2M86,56l1,-7M86,56l-7,-2"/><circle class="in-hand" cx="30" cy="36" r="6"/>';
    return s + '</svg>';
  }

  /** the hip and torso angle for a body folded between a shoulder S and an ankle A (straight legs), e.g. pike and handstand poses */
  function fold(S, A) {
    var a = ik(S, A, L.torso, LEG, 1).mid, b = ik(S, A, L.torso, LEG, -1).mid, hip = a[1] >= b[1] ? a : b;
    return { sh: S, t: R1(deg(Math.atan2(S[0] - hip[0], S[1] - hip[1]))), hip: hip };
  }

  /* ---------- small helper for recipes ---------- */
  /** a body held in a straight line from a contact point to the shoulder (planks, push-ups): shoulder height sy over the ankle/knee a */
  function lineBody(a, sy, reach) {
    var dy = sy - a[1], dx = Math.sqrt(Math.max(0, reach * reach - dy * dy)), s = [a[0] + dx, sy], d = Math.sqrt(dx * dx + dy * dy) || 1;
    return { sh: s, t: R1(deg(Math.atan2(dx / d, dy / d))) };
  }

  return { L: L, ANK: ANK, LEG: LEG, ARM: ARM, ik: ik, solve: solve, norm: norm, blend: blend, viewBox: viewBox, frameSvg: frameSvg, bodyOnly: bodyOnly, staticLayer: staticLayer, lineBody: lineBody, fold: fold, inset: inset, JOINTS: Object.keys(JOINT) };
});
