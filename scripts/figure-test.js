#!/usr/bin/env node
/* Geometry checks for the exercise pictures:  node scripts/figure-test.js
 * Every pose must be a real body: finite numbers, nothing below the floor, hands / feet that were meant to touch something actually reach it.
 * (How it LOOKS is checked by eye on http://127.0.0.1:5173/_gallery.) */
const path = require('path');
const F = require(path.join(__dirname, '..', 'public', 'js', 'figure.js'));
const Poses = require(path.join(__dirname, '..', 'public', 'js', 'poses.js'));
const Data = (() => { const g = {}; global.window = g; require(path.join(__dirname, '..', 'public', 'js', 'data.js')); const d = g.Data; delete global.window; return d; })();

let passed = 0, failed = 0;
const ok = (c, label) => { if (c) passed++; else { failed++; console.error('  ✗ ' + label); } };
console.log('Figure tests');

const ids = Object.keys(Data.EX || {});
ok(ids.length >= 60, 'the exercise library has ' + ids.length + ' exercises');
ids.forEach((id) => ok(!!Poses[id], 'a picture exists for ' + id));
Object.keys(Poses).forEach((id) => ok(ids.includes(id), 'picture ' + id + ' belongs to a known exercise'));

const bones = (l) => l.pts.slice(1).map((q, i) => Math.hypot(q[0] - l.pts[i][0], q[1] - l.pts[i][1]));
Object.keys(Poses).forEach((id) => {
  const r = Poses[id];
  ok(r.frames.length >= 1 && r.caps.length === r.frames.length, id + ': one caption per frame');
  ok(r.frames.length === 1 || r.mv.length === r.frames.length, id + ': a motion arrow for every frame');
  (r.mv || []).forEach((j) => ok(F.JOINTS.includes(j), id + ': known joint ' + j));
  r.frames.forEach((pose, i) => {
    const tag = id + ' #' + (i + 1);
    const sk = F.solve(pose), all = [sk.hip, sk.sh, sk.head];
    sk.legs.concat(sk.arms).forEach((l) => l.pts.forEach((q) => all.push(q)));
    ok(all.every((q) => Number.isFinite(q[0]) && Number.isFinite(q[1])), tag + ': finite coordinates');
    ok(all.every((q) => q[1] >= -1), tag + ': nothing below the floor (lowest ' + Math.min.apply(null, all.map((q) => q[1])).toFixed(1) + ')');
    sk.legs.forEach((l) => bones(l).slice(0, 2).forEach((b) => ok(Math.abs(b - 25) < 0.3, tag + ': leg bones keep their length (' + b.toFixed(1) + ')')));
    sk.arms.forEach((l) => bones(l).forEach((b, k) => ok(Math.abs(b - (k ? 17 : 18)) < 0.3, tag + ': arm bones keep their length (' + b.toFixed(1) + ')')));
    ['f1', 'f2', 'h1', 'h2'].forEach((k) => {      // an absolute target must really be reached (otherwise the limb is too short for the pose)
      const t = pose[k]; if (!t || t.r) return;
      const l = (k[0] === 'f' ? sk.legs : sk.arms).filter((x) => x.far === (k[1] === '2'))[0];
      ok(l && Math.hypot(l.pts[2][0] - t[0], l.pts[2][1] - t[1]) < 1.5, tag + ': ' + k + ' reaches its target (off by ' + (l ? Math.hypot(l.pts[2][0] - t[0], l.pts[2][1] - t[1]).toFixed(1) : '?') + ')');
    });
  });
  const vb = F.viewBox(r);
  ok(vb.w >= 100 && vb.w < 260 && vb.top >= 60 && vb.top < 220, id + ': sensible picture window (' + vb.w + ' x ' + vb.top + ')');
  const svg = F.frameSvg(r, 0, vb, { label: id });
  ok(/^<svg/.test(svg) && !/NaN|undefined/.test(svg), id + ': clean SVG');
  if (r.frames.length > 1) { const a = F.blend(r.frames[0], r.frames[1], 0.5); ok(F.solve(a).hip.every(Number.isFinite), id + ': the in-between pose is valid'); }
});
ok(['std', 'wide', 'diamond', 'archer', 'pseudo', 'under', 'widegrip', 'close', 'archerpull', 'neutral', 'twist'].every((k) => /<svg/.test(F.inset(k))), 'all hand-position diagrams draw');

/* the written guides: every exercise and course has text in both languages, and every label they use is translated */
const G = require(path.join(__dirname, '..', 'public', 'js', 'guides.js'));
['guides-1', 'guides-2', 'guides-3', 'guides-courses'].forEach((f) => require(path.join(__dirname, '..', 'public', 'js', f + '.js')));
const dict = (() => { const g = {}; global.window = g; require(path.join(__dirname, '..', 'public', 'js', 'i18n.js')); const d = g.I18N.dict; delete global.window; return d; })();
const has = (k) => ['en', 'ar'].every((l) => dict[l][k] && String(dict[l][k]).trim());
ids.forEach((id) => {
  const g = G.EX[id];
  ok(!!g, 'a written guide exists for ' + id);
  if (!g) return;
  ['en', 'ar'].forEach((l) => {
    const x = g[l];
    ok(x && Array.isArray(x.s) && x.s.length >= 3 && x.s.length <= 5 && x.s.every((s) => typeof s === 'string' && s.length >= 12 && s.length < 260), id + ' ' + l + ': 3-5 sensible steps');
    ok(x && x.t && x.x, id + ' ' + l + ': a tip and a common mistake');
  });
  ok(g.en.s.length === g.ar.s.length, id + ': the same number of steps in both languages');
  ok(g.m.split(' ').every((m) => G.MUSCLES.includes(m) && has('g.m.' + m)), id + ': muscle labels are translated');
  ok(!g.e || (G.GEAR.includes(g.e) && has('g.eq.' + g.e)), id + ': equipment label is translated');
});
Object.keys(G.EX).forEach((id) => ok(ids.includes(id), 'guide ' + id + ' belongs to a known exercise'));
Data.COURSES.forEach((c) => {
  const g = G.COURSE[c.id];
  ok(!!g, 'a course guide exists for ' + c.id);
  if (g) ['en', 'ar'].forEach((l) => ok(g[l] && g[l].how && g[l].how.length > 60 && Array.isArray(g[l].tips) && g[l].tips.length === 2, c.id + ' ' + l + ': how-to text and two tips'));
});
Object.keys(Poses).forEach((id) => {
  Poses[id].caps.forEach((c) => ok(has('g.c.' + c), id + ': caption "' + c + '" is translated'));
  if (Poses[id].inset) ok(has('g.i.' + Poses[id].inset), id + ': hand-position label is translated');
});
['g.open', 'g.seq', 'g.steps', 'g.tip', 'g.mistake', 'g.gear', 'g.gearCourse', 'g.nogear', 'g.play', 'g.stop', 'g.holdNote', 'g.holdIt', 'g.repsIt', 'g.fullGuide', 'g.course', 'g.cg.warm', 'g.cg.prog', 'g.cg.safe'].forEach((k) => ok(has(k), 'string ' + k + ' exists in both languages'));

console.log(`  passed ${passed}, failed ${failed}`);
process.exit(failed ? 1 : 0);
