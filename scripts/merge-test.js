#!/usr/bin/env node
/* Tests for public/js/merge.js (combining two devices' copies of a profile):  node scripts/merge-test.js */
const path = require('path');
const Merge = require(path.join(__dirname, '..', 'public', 'js', 'merge.js'));

let passed = 0, failed = 0;
const ok = (cond, label) => { if (cond) passed++; else { failed++; console.error('  ✗ ' + label); } };

const e = (id, o) => Object.assign({ id, planId: null, exId: 'pushup', title: '', cat: 'chest', sets: 1, reps: 10, unit: 'reps', status: null, got: null, locked: false, t: 0 }, o);
const day = (...items) => ({ items, skip: [] });
const plan = (id, o) => Object.assign({ id, exId: 'squat', title: '', cat: 'legs', sets: 3, reps: 10, unit: 'reps', days: [1], from: '2026-11-01', courseId: null, prog: 0, sess: null }, o);
const base = () => ({ v: 1, lang: 'en', theme: 'dark', weekStart: 1, name: 'Noor', plan: [], logs: {}, course: null, superDates: [], superWeekdays: [], lastSeen: '2026-11-08' });

console.log('Merge tests');

/* nothing lost: logging on two devices while apart */
let a = base(), b = base();
a.logs['2026-11-08'] = day(e('a1', { planId: 'p1', status: 'done', t: 2000 }));
b.logs['2026-11-07'] = day(e('b1', { planId: 'p9', status: 'done', t: 1500 }));
let m = Merge.merge(a, b);
ok(m.logs['2026-11-08'].items.length === 1 && m.logs['2026-11-07'].items.length === 1, 'workouts logged on different days on two devices are both kept');

/* the same exercise on the same day: newest touch wins */
a = base(); b = base();
a.logs['2026-11-08'] = day(e('a1', { planId: 'p1', status: 'done', t: 1000 }));
b.logs['2026-11-08'] = day(e('b1', { planId: 'p1', status: 'missed', t: 3000 }));
m = Merge.merge(a, b);
ok(m.logs['2026-11-08'].items.length === 1 && m.logs['2026-11-08'].items[0].status === 'missed', 'same plan item on the same day (different entry ids): one entry, the most recent change wins');
a.logs['2026-11-08'].items[0].t = 5000;
m = Merge.merge(a, b);
ok(m.logs['2026-11-08'].items[0].status === 'done', '...and it works the other way round');

/* untouched copies (t = 0): done beats partial beats missed beats nothing */
for (const [x, y, want] of [[null, 'done', 'done'], ['missed', 'partial', 'partial'], ['partial', 'done', 'done'], ['done', 'missed', 'done'], ['done', null, 'done']]) {
  a = base(); b = base();
  a.logs['2026-11-08'] = day(e('a1', { planId: 'p1', status: x }));
  b.logs['2026-11-08'] = day(e('b1', { planId: 'p1', status: y }));
  m = Merge.merge(a, b);
  ok(m.logs['2026-11-08'].items[0].status === want, 'tie-break: ' + x + ' vs ' + y + ' -> ' + want);
}

/* both devices created the day from the same plan: no duplicates */
a = base(); b = base();
a.logs['2026-11-08'] = day(e('x1', { planId: 'p1' }), e('x2', { planId: 'p2' }));
b.logs['2026-11-08'] = day(e('y1', { planId: 'p1' }), e('y2', { planId: 'p2' }), e('y3', { planId: 'p3', t: 10 }));
m = Merge.merge(a, b);
ok(m.logs['2026-11-08'].items.length === 3, 'a day auto-created on both devices does not double up (3 plan items, not 5)');

/* one-off exercises (no plan id) are matched by their own id */
a = base(); b = base();
a.logs['2026-11-08'] = day(e('same', { status: 'done', t: 5 }), e('onlyA', { t: 5 }));
b.logs['2026-11-08'] = day(e('same', { status: 'done', t: 5 }), e('onlyB', { t: 6 }));
m = Merge.merge(a, b);
ok(m.logs['2026-11-08'].items.length === 3, 'one-off exercises: shared one counted once, each device\'s own kept');

/* removed on one device (skip) */
a = base(); b = base();
a.logs['2026-11-08'] = { items: [], skip: ['p1'] };
b.logs['2026-11-08'] = day(e('y1', { planId: 'p1' }), e('y2', { planId: 'p2' }));
m = Merge.merge(a, b);
ok(m.logs['2026-11-08'].items.length === 1 && m.logs['2026-11-08'].items[0].planId === 'p2' && m.logs['2026-11-08'].skip.includes('p1'), 'an untouched exercise removed from a day on one device stays removed');
b.logs['2026-11-08'].items[0].status = 'done';
m = Merge.merge(a, b);
ok(m.logs['2026-11-08'].items.some((x) => x.planId === 'p1' && x.status === 'done'), 'but a workout already logged is never thrown away');

/* plan */
a = base(); b = base();
a.plan = [plan('p1'), plan('p2', { reps: 99 })]; b.plan = [plan('p2', { reps: 5 }), plan('p3')];
m = Merge.merge(a, b);
ok(m.plan.map((p) => p.id).sort().join() === 'p1,p2,p3', 'plan items from both devices are combined');
ok(m.plan.find((p) => p.id === 'p2').reps === 99, 'a plan item on both: this device\'s version');

/* course */
a = base(); b = base();
a.course = { id: 'ppl', start: '2026-10-01', weeks: 4, days: [1] }; b.course = { id: 'big6', start: '2026-11-03', weeks: 4, days: [1] };
a.plan = [plan('c1', { courseId: 'ppl' })]; b.plan = [plan('c2', { courseId: 'big6' }), plan('own')];
m = Merge.merge(a, b);
ok(m.course.id === 'big6' && m.plan.map((p) => p.id).sort().join() === 'c2,own', 'the more recently started course wins, and the losing course\'s exercises are dropped');
a.course = null; a.plan = [];
m = Merge.merge(a, b);
ok(m.course && m.course.id === 'big6', 'a course started on the other device is kept');

/* other fields */
a = base(); b = base(); a.superDates = ['2026-11-10']; b.superDates = ['2026-11-12']; a.superWeekdays = [5]; b.superWeekdays = [5, 0]; b.lastSeen = '2026-11-09'; b.lang = 'ar'; b.theme = 'light'; a.name = '';
m = Merge.merge(a, b);
ok(m.superDates.join() === '2026-11-10,2026-11-12' && m.superWeekdays.join() === '0,5', 'Super Days are combined');
ok(m.lang === 'en' && m.theme === 'dark' && m.lastSeen === '2026-11-09', 'settings stay as on this device; last-seen takes the later date');
ok(m.name === 'Noor', 'a missing name is filled from the other copy');

/* purity + idempotence */
a = base(); b = base();
a.logs['2026-11-08'] = day(e('a1', { planId: 'p1', status: 'done', t: 9 })); b.logs['2026-11-08'] = day(e('b1', { planId: 'p1', status: 'missed', t: 3 }));
const aJson = JSON.stringify(a), bJson = JSON.stringify(b);
m = Merge.merge(a, b);
ok(JSON.stringify(a) === aJson && JSON.stringify(b) === bJson, 'merging does not modify either input');
const m2 = Merge.merge(m, b), m3 = Merge.merge(m, m);
ok(JSON.stringify(m2) === JSON.stringify(m) && JSON.stringify(m3) === JSON.stringify(m), 'merging again changes nothing (idempotent)');
const ab = Merge.merge(a, b), ba = Merge.merge(b, a);
ok(ab.logs['2026-11-08'].items[0].status === ba.logs['2026-11-08'].items[0].status, 'both devices end with the same result whichever merges first');
ok(Merge.merge(null, base()).plan.length === 0 && Merge.merge(base(), undefined).plan.length === 0, 'empty / missing copies do not crash');

console.log(`  passed ${passed}, failed ${failed}`);
process.exit(failed ? 1 : 0);
