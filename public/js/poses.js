/* Movement pictures for every exercise: a few key poses (frames) per exercise, drawn by figure.js.
 *   Poses[exId] = { frames:[pose...], caps:['start',...], mv:['sh',...], props:[...], inset:'wide'?, hold:true? }
 * caps are keys of the "g.c.*" strings; mv names the joint whose path the arrow shows (see Figure.JOINTS).
 * Angles: 0 = right, 90 = up, 180 = left, -90 = down.  Run  node scripts/figure-test.js  to check the geometry. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./figure.js')); else root.Poses = factory(root.Figure);
})(this, function (F) {
  'use strict';
  var ANK = F.ANK, ARM = F.ARM, LEG = F.LEG, R = {};
  var P = function (a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; };
  var rec = function (frames, caps, mv, extra) { var o = { frames: frames, caps: caps, mv: mv || [] }; for (var k in extra) o[k] = extra[k]; return o; };
  var sq = Math.sqrt;

  /* standing, arms hanging, feet flat */
  var ST = { hip: [0, ANK + LEG], t: 0, f1: [0, ANK], h1: { r: [3, -33] }, eb1: -1, kb1: 1 };
  /* lying on the back, head to the right, feet to the left (hip on the floor) */
  var LIE = { hip: [0, 5], t: 90, nk: -12, fa1: 100, fa2: 100 };

  /* ===== push-ups and planks: the body is one straight line from the toes (or knees) to the shoulder ===== */
  function pushLike(o) {
    var toes = !o.kneel, a = o.a || (toes ? [0, 9] : [0, 4]), reach = toes ? 83 : 58, hy = o.hy == null ? 2 : o.hy, lean = o.lean || 0;
    var syUp = hy + sq(ARM * ARM - lean * lean), su = F.lineBody(a, syUp, reach), hand = [su.sh[0] - lean + (o.hx || 0), hy];
    var make = function (sy) {
      var b = F.lineBody(a, sy, reach), p = { sh: b.sh, t: b.t, h1: hand, eb1: -1, nk: o.nk == null ? 8 : o.nk, hl: o.hl || ['arms', 'torso'] };
      if (toes) { p.f1 = a; p.fa1 = -75; } else { p.f1 = [a[0] - 24, a[1] + 8]; p.fa1 = -20; p.kb1 = 1; }
      return p;
    };
    return { hand: hand, up: make(syUp), at: make };
  }
  function push(o, extra) {
    var s = pushLike(o), dn = s.at((o.hy == null ? 2 : o.hy) + (o.dn == null ? 12 : o.dn));
    return rec([s.up, dn], ['start', 'lower'], ['sh', 'sh'], extra);
  }
  R.pushup = push({}, {});
  R.kneepush = push({ kneel: true, dn: 11 }, {});
  R.incline = (function () { var o = { hy: 40, dn: 13 }; return push(o, { props: [{ k: 'box', x: pushLike(o).hand[0], w: 34, h: 38 }] }); })();
  R.decline = push({ a: [0, 45], hx: -3, dn: 14 }, { props: [{ k: 'box', x: 4, w: 30, h: 36 }] });
  R.wide = push({}, { inset: 'wide' });
  R.diamond = push({}, { inset: 'diamond' });
  R.archer = push({}, { inset: 'archer' });
  R.pseudo = push({ lean: 22, dn: 11 }, { inset: 'pseudo' });
  R.planchelean = rec([pushLike({}).up, pushLike({ lean: 26 }).up], ['start', 'lean'], ['sh', 'sh'], { hold: true });
  R.tuckplanche = (function () {
    var a = P({ hl: ['arms', 'torso'] }, { sh: [16, 34], t: 82, h1: [0, 2], eb1: -1, nk: 4, l1: [38, 215], fa1: -60 });
    return rec([pushLike({ lean: 26 }).up, a], ['lean', 'tuck'], ['sh', 'sh'], { hold: true });
  })();
  R.plank = (function () {          // forearm plank
    var a = [0, 9], b = F.lineBody(a, 22, 83);
    return rec([{ sh: b.sh, t: b.t, f1: a, fa1: -75, h1: [b.sh[0] + 17, 3], eb1: -1, nk: 6, hl: ['torso', 'arms'] }], ['hold'], [], { hold: true });
  })();
  R.dips = (function () {
    var top = { sh: [0, 97], t: 12, h1: [0, 62], eb1: -1, l1: [-100, -110], fa1: 0, hl: ['arms', 'torso'], nk: 4 };
    var bot = { sh: [3, 79], t: 24, h1: [0, 62], eb1: -1, l1: [-105, -125], fa1: 0, hl: ['arms', 'torso'], nk: 4 };
    return rec([top, bot], ['start', 'lower'], ['sh', 'sh'], { props: [{ k: 'bars', x: 0, y: 62 }] });
  })();
  R.benchdips = (function () {
    var top = { sh: [8, 76], t: -8, h1: [2, 40], eb1: -1, f1: [40, ANK], kb1: 1, hl: ['arms'], nk: 4 };
    var bot = { sh: [10, 60], t: -2, h1: [2, 40], eb1: -1, f1: [40, ANK], kb1: 1, hl: ['arms'], nk: 4 };
    return rec([top, bot], ['start', 'lower'], ['sh', 'sh'], { props: [{ k: 'box', x: -8, w: 24, h: 38 }] });
  })();
  R.tricepext = (function () {
    var o = { hy: 40 }, a = [0, 9], u = pushLike(o).up, b = F.lineBody(a, 62, 83);
    var dn = { sh: b.sh, t: b.t, f1: a, fa1: -75, h1: [b.sh[0] + 17, 41], eb1: -1, nk: 6, hl: ['arms'] };
    return rec([u, dn], ['start', 'lower'], ['sh', 'sh'], { props: [{ k: 'box', x: pushLike(o).hand[0] + 6, w: 40, h: 38 }] });
  })();

  /* ===== legs ===== */
  var SQ = { hip: [-20, 29], t: 42, f1: [0, ANK], kb1: 1, h1: { r: [30, 3] }, eb1: -1, hl: ['legs'] };
  R.squat = rec([P(ST, { hl: ['legs'], h1: { r: [30, 3] } }), SQ], ['start', 'bottom'], ['hip', 'hip'], {});
  R.jumpsquat = rec([SQ, { hip: [0, 74], t: 0, f1: [0, 24], fa1: -60, kb1: 1, h1: { r: [8, 32] }, eb1: -1, hl: ['legs'] }], ['bottom', 'jump'], ['hip', 'hip'], {});
  R.lunge = (function () {
    var lg = { hip: [0, 27.5], t: 0, f1: [25, ANK], kb1: 1, f2: [-34, 9], fa2: -70, kb2: 1, h1: { r: [3, -33] }, hl: ['legs'] };
    return rec([P(ST, { hl: ['legs'] }), lg], ['start', 'bottom'], ['hip', 'hip'], {});
  })();
  R.bulgarian = (function () {
    var a = { hip: [0, 46], t: 0, f1: [20, ANK], kb1: 1, f2: [-33, 41], fa2: -150, kb2: 1, h1: { r: [3, -33] }, hl: ['legs'] };
    var b = P(a, { hip: [0, 29] });
    return rec([a, b], ['start', 'bottom'], ['hip', 'hip'], { props: [{ k: 'box', x: -38, w: 26, h: 38 }] });
  })();
  R.cossack = (function () {
    var hl = ['legs'];
    var a = { view: 'front', hip: [0, 48], t: 0, hw: 7, sw: 12, f1: [-26, ANK], f2: [26, ANK], kb1: -1, kb2: 1, a1: [-100, -100], a2: [-80, -80], hl: hl };
    var b = { view: 'front', hip: [-22, 30], t: 0, hw: 7, sw: 12, f1: [-40, ANK], f2: [25, ANK], fa2: 90, kb1: -1, kb2: 1, a1: [-30, 20], a2: [-30, 20], hl: hl };
    return rec([a, b], ['start', 'bottom'], ['hip', 'hip'], {});
  })();
  R.pistolassist = (function () {
    var bot = { hip: [-16, 22], t: 40, f1: [0, ANK], kb1: 1, f2: { r: [50, 4] }, fa2: 90, h1: [6, 60], eb1: -1, hl: ['legs'] };
    var top = { hip: [0, ANK + LEG], t: 0, f1: [0, ANK], f2: { r: [50, 2] }, fa2: 90, h1: [6, 60], eb1: -1, hl: ['legs'] };
    return rec([top, bot], ['start', 'bottom'], ['hip', 'hip'], { props: [{ k: 'pole', x: 6 }] });
  })();
  R.pistol = (function () {
    var bot = { hip: [-16, 22], t: 40, f1: [0, ANK], kb1: 1, f2: { r: [50, 4] }, fa2: 90, h1: { r: [32, 6] }, eb1: -1, hl: ['legs'] };
    var top = { hip: [0, ANK + LEG], t: 0, f1: [0, ANK], f2: { r: [50, 2] }, fa2: 90, h1: { r: [32, 6] }, eb1: -1, hl: ['legs'] };
    return rec([top, bot], ['start', 'bottom'], ['hip', 'hip'], {});
  })();
  R.glute = (function () {
    var dn = P(LIE, { l1: [135, -126], fa1: 0, hl: ['legs'], a1: [180, 180] });
    var up = P(LIE, { hip: [0, 27], t: 132, nk: -40, l1: [152, -105], fa1: 0, hl: ['legs', 'torso'], a1: [180, 180] });
    return rec([dn, up], ['start', 'lift'], ['hip', 'hip'], {});
  })();
  R.sglute = (function () {
    var up = P(LIE, { hip: [0, 27], t: 132, nk: -40, l1: [152, -105], fa1: 0, l2: [128, 128], hl: ['legs', 'torso'], a1: [180, 180] });
    return rec([P(R.glute.frames[1], {}), up], ['lift', 'extend'], ['foot2', 'foot2'], {});
  })();
  R.calf = (function () {
    var a = P(ST, { hl: ['legs'] }), b = P(ST, { hip: [0, ANK + LEG + 6.5], f1: [0, 9], fa1: -70, hl: ['legs'] });
    return rec([a, b], ['start', 'up'], ['hip', 'hip'], {});
  })();
  R.wallsit = rec([{ hip: [0, ANK + 25], t: 0, f1: [25, ANK], kb1: 1, h1: { r: [22, -14] }, eb1: -1, hl: ['legs'] }], ['hold'], [], { hold: true, props: [{ k: 'wall', x: -9 }] });
  R.stepup = (function () {
    var a = { hip: [3, 50], t: 0, f2: [0, ANK], f1: [24, 25 + ANK], kb1: 1, h1: { r: [10, -28] }, eb1: -1, hl: ['legs'] };
    var b = { hip: [24, 25 + ANK + LEG], t: 0, f1: [24, 25 + ANK], l2: [15, -80], h1: { r: [-12, -30] }, eb1: -1, hl: ['legs'] };
    return rec([a, b], ['start', 'up'], ['hip', 'hip'], { props: [{ k: 'box', x: 24, w: 32, h: 25 }] });
  })();
  R.tuckjump = (function () {
    var crouch = P(SQ, { h1: { r: [20, -8] } });
    var air = { hip: [0, 78], t: 0, l1: [55, -110], l2: [60, -105], fa1: -50, fa2: -50, h1: { r: [26, -6] }, eb1: -1, hl: ['legs'] };
    return rec([crouch, air], ['crouch', 'tuck'], ['hip', 'hip'], {});
  })();

  /* ===== back: hanging and pulling (bar at y = 120) ===== */
  var BAR = 120, HANDS = [14, BAR], HSY = BAR - 32;   // hands a little in front of the shoulders, like a real hang
  var HG = { h1: HANDS, eb1: -1, l1: [-75, -105], fa1: -30, nk: -12, hl: ['arms', 'torso'] };
  var hang = P(HG, { sh: [0, HSY], t: 0 });
  var pullTop = P(HG, { sh: [-6, BAR - 3], t: 8, nk: 8, l1: [-65, -115] });
  var BARP = [{ k: 'bar', x: 14, y: BAR }];
  R.deadhang = rec([hang], ['hang'], [], { hold: true, props: BARP });
  R.pullup = rec([hang, pullTop], ['start', 'pull'], ['sh', 'sh'], { props: BARP });
  R.chinup = rec([hang, pullTop], ['start', 'pull'], ['sh', 'sh'], { props: BARP, inset: 'under' });
  R.widepull = rec([hang, pullTop], ['start', 'pull'], ['sh', 'sh'], { props: BARP, inset: 'widegrip' });
  R.archerpull = rec([hang, pullTop], ['start', 'pull'], ['sh', 'sh'], { props: BARP, inset: 'archerpull' });
  R.explpull = rec([hang, P(pullTop, { sh: [-8, BAR + 7], t: 12 })], ['start', 'pullFast'], ['sh', 'sh'], { props: BARP });
  R.negpull = rec([pullTop, P(HG, { sh: [-2, BAR - 20], t: 4 }), hang], ['top', 'lower', 'hang'], ['sh', 'sh', 'sh'], { props: BARP });
  R.scap = rec([P(hang, { sh: [0, HSY + 1] }), P(hang, { sh: [0, HSY + 8] })], ['relax', 'squeeze'], ['sh', 'sh'], { props: BARP });
  R.muscleup = (function () {
    var tr = { sh: [3, BAR + 11], t: 22, h1: HANDS, eb1: -1, l1: [-70, -105], fa1: -30, nk: 10, hl: ['arms', 'torso'] };
    var top = { sh: [8, BAR + 32], t: 8, h1: HANDS, eb1: -1, l1: [-80, -100], fa1: -30, nk: 4, hl: ['arms', 'torso'] };
    return rec([hang, pullTop, tr, top], ['start', 'pull', 'over', 'top'], ['sh', 'sh', 'sh', 'sh'], { props: BARP });
  })();
  R.invrow = (function () {
    var bar = 62, a = [-80, ANK], mk = function (sy) { var b = F.lineBody(a, sy, 83); return { sh: b.sh, t: b.t, f1: a, fa1: 80, h1: [0, bar], eb1: 1, nk: -10, hl: ['arms', 'torso'] }; };
    return rec([mk(bar - ARM + 1), mk(bar - 14)], ['start', 'pull'], ['sh', 'sh'], { props: [{ k: 'bar', x: 0, y: bar }] });
  })();
  R.closeinv = P(R.invrow, { inset: 'under' });
  R.superman = (function () {
    var rest = { hip: [0, 5], t: 90, nk: 8, l1: [180, 180], l2: [180, 180], fa1: 180, fa2: 180, a1: [15, 15], hl: ['torso'] };
    var up = { hip: [0, 5], t: 78, nk: 14, l1: [160, 160], l2: [160, 160], fa1: 160, fa2: 160, a1: [32, 32], hl: ['torso', 'arms', 'legs'] };
    return rec([P(rest, { a1: [3, 3] }), up], ['start', 'lift'], ['hand', 'hand'], {});
  })();
  function frontLever(thigh, shin) {
    var S = [0, 70];
    return { sh: S, t: 90, h1: [0, 105], eb1: -1, nk: -10, l1: [thigh, shin], fa1: -70, hl: ['torso', 'arms'] };
  }
  var flHang = P(HG, { sh: [0, 70], t: 0, h1: [0, 105], l1: [-45, -135], fa1: -10 }), FLBAR = [{ k: 'bar', x: 0, y: 105 }];
  R.tuckfl = rec([flHang, frontLever(55, 225)], ['hang', 'lever'], ['hip', 'hip'], { hold: true, props: FLBAR });
  R.advtuckfl = rec([flHang, frontLever(28, 200)], ['hang', 'lever'], ['hip', 'hip'], { hold: true, props: FLBAR });

  /* ===== arms / shoulders (handstands) ===== */
  function pike(sy, sx) {
    var S = [sx, sy], A = [-40, ANK], f = F.fold(S, A);
    return { sh: S, t: f.t, f1: A, kb1: 1, h1: [0, 2], eb1: -1, nk: -20, hl: ['arms', 'torso'] };
  }
  R.pike = rec([pike(37, 0), pike(17, 7)], ['start', 'lower'], ['sh', 'sh'], {});
  function handstand(sy, sx, lean) {
    return { sh: [sx, sy], t: 180 - (lean || 0), h1: [0, 2], eb1: -1, l1: [90 - (lean || 0) * 1.3, 90 - (lean || 0) * 1.3], fa1: 60, nk: -4, hl: ['arms', 'torso'] };
  }
  R.hspu = rec([handstand(37, 0, 8), handstand(22, 3, 8)], ['top', 'lower'], ['sh', 'sh'], { props: [{ k: 'wall', x: 17 }] });
  R.wallhs = rec([handstand(37, 0, 8)], ['hold'], [], { hold: true, props: [{ k: 'wall', x: 17 }] });
  R.freehs = rec([{ sh: [0, 37], t: 160, h1: [0, 2], eb1: -1, l1: [72, 72], l2: [118, 100], fa1: 60, nk: -4, hl: ['arms', 'torso'] }, handstand(37, 0, 0)], ['kick', 'balance'], ['foot', 'foot'], {});
  R.wallwalk = (function () {
    var mk = function (ay) {
      var b = F.lineBody([0, ay], 37, 83);
      return { sh: b.sh, t: b.t, f1: [0, ay], fa1: 180, h1: [b.sh[0], 2], eb1: -1, nk: 6, hl: ['arms', 'torso'] };
    };
    return rec([mk(9), mk(48), mk(88)], ['start', 'walk', 'top'], ['foot', 'foot', 'foot'], { props: [{ k: 'wall', x: -5 }] });
  })();
  R.frog = rec([{ sh: [9, 34], t: 72, h1: [0, 2], eb1: -1, nk: -8, l1: [10, 170], fa1: -60, hl: ['arms', 'torso'] }], ['hold'], [], { hold: true });

  /* ===== core ===== */
  R.sideplank = (function () {
    var a = { view: 'front', hip: [0, 24], t: 0, hw: 6, sw: 11, f1: [-6, ANK], f2: [-4, ANK], kb1: 1, kb2: 1, hl: ['torso'] };
    var S = { view: 'front', sh: [26, 40], hip: undefined, t: 62, hw: 6, sw: 11, f1: [-30, 6], f2: [-27, 6], a1: [-90, -90], a2: [75, 75], hl: ['torso'] };
    var pose = { view: 'front', sh: [28, 44], t: 66, hw: 5, sw: 10, l1: [-155, -155], l2: [-155, -155], a1: [-90, -90], a2: [80, 80], fa1: 0, fa2: 0, hl: ['torso'] };
    return rec([pose], ['hold'], [], { hold: true });
  })();
  R.hollow = rec([P(LIE, { t: 78, nk: 0, l1: [157, 157], l2: [157, 157], a1: [12, 12], hl: ['torso', 'legs'] })], ['hold'], [], { hold: true });
  R.legraise = rec([P(LIE, { l1: [165, 165], a1: [180, 180], hl: ['legs'] }), P(LIE, { l1: [90, 90], a1: [180, 180], hl: ['legs'] })], ['start', 'raise'], ['foot', 'foot'], {});
  R.hangknee = (function () {
    var h = P(HG, { sh: [0, HSY], t: 0, hl: ['torso', 'legs'] });
    return rec([h, P(h, { l1: [65, -95] })], ['start', 'raise'], ['knee', 'knee'], { props: BARP });
  })();
  R.hangleg = (function () {
    var h = P(HG, { sh: [0, HSY], t: 0, hl: ['torso', 'legs'] });
    return rec([h, P(h, { l1: [4, 4], fa1: 90 })], ['start', 'raise'], ['foot', 'foot'], { props: BARP });
  })();
  function lsitBase(extra) { return P({ sh: [0, 50], t: 0, h1: [0, 15], eb1: -1, nk: 0, hl: ['torso', 'legs'] }, extra); }
  var LBOX = [{ k: 'box', x: 0, w: 12, h: 15 }];
  R.lsit = rec([lsitBase({ l1: [0, 0], fa1: 80 })], ['hold'], [], { hold: true, props: LBOX });
  R.tucklsit = rec([lsitBase({ l1: [42, -78], fa1: -60 })], ['hold'], [], { hold: true, props: LBOX });
  R.vsit = rec([lsitBase({ sh: [-9, 48.5], t: -16, l1: [48, 48], fa1: 100 })], ['hold'], [], { hold: true, props: LBOX });
  R.crunch = (function () {
    var dn = P(LIE, { l1: [135, -126], fa1: 0, h1: { r: [8, 7] }, eb1: 1, hl: ['torso'] });
    return rec([dn, P(dn, { t: 58, nk: -10 })], ['start', 'lift'], ['sh', 'sh'], {});
  })();
  R.bicycle = (function () {
    var a = P(LIE, { t: 62, nk: -4, l1: [62, 205], fa1: -60, l2: [168, 168], h1: { r: [8, 7] }, eb1: 1, hl: ['torso', 'legs'] });
    var b = P(LIE, { t: 62, nk: -4, l2: [62, 205], fa2: -60, l1: [168, 168], h1: { r: [8, 7] }, eb1: 1, hl: ['torso', 'legs'] });
    return rec([a, b], ['start', 'switch'], ['knee', 'knee2'], {});
  })();
  R.climbers = (function () {
    var up = pushLike({}).up, hl = ['arms', 'torso', 'legs'];
    var a = P(up, { l2: [6, -100], fa2: -20, hl: hl });
    var b = { sh: up.sh, t: up.t, h1: up.h1, eb1: -1, nk: 8, hl: hl, l1: [6, -100], fa1: -20, f2: up.f1, fa2: -75 };
    return rec([a, b], ['start', 'switch'], ['knee2', 'knee'], {});
  })();
  R.vup = (function () {
    var dn = P(LIE, { l1: [180, 180], a1: [10, 10], hl: ['torso'] });
    var v = { hip: [0, 6], t: -38, nk: -4, l1: [128, 128], fa1: 90, h1: [-30, 44], eb1: 1, hl: ['torso', 'legs'] };
    return rec([dn, v], ['start', 'up'], ['sh', 'sh'], {});
  })();
  R.russian = (function () {
    var s = { hip: [0, 8], t: -28, nk: 0, l1: [38, -30], fa1: 0, h1: { r: [32, -2] }, eb1: -1, hl: ['torso'] };
    return rec([s], ['twist'], [], { hold: true, inset: 'twist' });
  })();
  R.deadbug = (function () {
    var tab = P(LIE, { l1: [90, 180], l2: [90, 180], a1: [90, 90], a2: [90, 90], hl: ['torso', 'legs'] });
    var ext = P(LIE, { l1: [90, 180], l2: [180, 180], a1: [90, 90], a2: [5, 5], hl: ['torso', 'legs'] });
    return rec([tab, ext], ['start', 'extend'], ['foot2', 'foot2'], {});
  })();

  /* ===== full body ===== */
  R.burpee = (function () {
    var squat = { hip: [-12, 28], t: 80, f1: [0, ANK], kb1: 1, h1: [24, 2], eb1: -1, hl: ['arms', 'legs'] };
    var plank = pushLike({}).up;
    var jump = { hip: [0, 74], t: 0, f1: [0, 24], fa1: -60, h1: { r: [6, 33] }, eb1: -1, hl: ['legs', 'arms'] };
    return rec([P(ST, { hl: ['legs'] }), squat, plank, jump], ['stand', 'crouch', 'plank', 'jump'], ['hip', 'hip', 'hip', 'hip'], {});
  })();
  R.jacks = (function () {
    var a = { view: 'front', hip: [0, 52.5], t: 0, hw: 6, sw: 12, f1: [-5, ANK], f2: [5, ANK], a1: [-98, -98], a2: [-82, -82], hl: ['arms', 'legs'] };
    var b = { view: 'front', hip: [0, 46], t: 0, hw: 6, sw: 12, l1: [-122, -122], l2: [-58, -58], a1: [130, 130], a2: [50, 50], hl: ['arms', 'legs'] };
    return rec([a, b], ['start', 'jump'], ['hand', 'hand2'], {});
  })();
  R.highknees = (function () {
    var a = { hip: [0, ANK + LEG], t: 4, f2: [0, ANK], l1: [8, -98], fa1: -20, a1: [-125, -20], a2: [-55, 35], hl: ['legs'] };
    var b = { hip: [0, ANK + LEG], t: 4, f1: [0, ANK], l2: [8, -98], fa2: -20, a2: [-125, -20], a1: [-55, 35], hl: ['legs'] };
    return rec([a, b], ['start', 'switch'], ['knee', 'knee2'], {});
  })();
  R.bearcrawl = (function () {
    var base = { sh: [0, 36.5], t: 84, eb1: -1, eb2: -1, nk: -6, hl: ['arms', 'legs'] };
    var a = P(base, { h1: [0, 2], h2: [28, 26], l1: [-40, -160], fa1: -75, l2: [-10, -100], fa2: -25 });
    var b = P(base, { h1: [28, 26], h2: [0, 2], l1: [-10, -100], fa1: -25, l2: [-40, -160], fa2: -75 });
    return rec([a, b], ['start', 'switch'], ['hand2', 'hand'], {});
  })();
  R.inchworm = (function () {
    var fold = { hip: [0, 52], t: 172, f1: [0, ANK], kb1: 1, h1: [14, 2], eb1: -1, nk: -10, hl: ['arms', 'torso'] };
    var mid = (function () { var b = F.lineBody([0, 20], 44, 83); return { sh: b.sh, t: b.t, f1: [0, 20], fa1: -75, h1: [b.sh[0] - 8, 2], eb1: -1, nk: 6, hl: ['arms', 'torso'] }; })();
    return rec([fold, pushLike({}).up], ['start', 'walk'], ['hand', 'hand'], {});
  })();

  return R;
});
