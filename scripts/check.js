#!/usr/bin/env node
/* Sanity checks:  node scripts/check.js
 *  1. every exercise id used by a premade course exists in the library
 *  2. every translation key used in the code exists in BOTH languages (and both languages have the same keys)
 *  3. every JS file parses */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PUB = path.join(__dirname, '..', 'public');
let errors = 0;
const fail = (m) => { errors++; console.error('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

function load(file) {
  const sandbox = { window: {}, document: { documentElement: {} }, navigator: {} };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(PUB, 'js', file), 'utf8'), sandbox, { filename: file });
  return sandbox;
}

/* 1. courses */
console.log('Courses');
const Data = load('data.js').Data;
const cats = new Set(Data.CATS);
let rows = 0;
Data.COURSES.forEach((c) => {
  ['en', 'ar'].forEach((l) => { if (!c.name[l] || !c.desc[l] || !c.style[l]) fail(c.id + ': missing ' + l + ' text'); });
  if (![1, 2, 3].includes(c.level)) fail(c.id + ': bad level');
  if (!['course', 'monthly', 'calisthenics'].includes(c.kind)) fail(c.id + ': bad kind');
  if (c.sessions.length < 1 || c.sessions.length > 7) fail(c.id + ': sessions must be 1..7');
  c.sessions.forEach((s, i) => {
    if (!s.name.en || !s.name.ar) fail(c.id + ' session ' + (i + 1) + ': missing name');
    s.ex.forEach((r) => { rows++; if (!Data.EX[r[0]]) fail(c.id + ': unknown exercise "' + r[0] + '"'); });
  });
});
Object.entries(Data.EX).forEach(([id, e]) => {
  if (!cats.has(e[0])) fail('exercise ' + id + ': bad category ' + e[0]);
  if (!['reps', 'sec'].includes(e[1])) fail('exercise ' + id + ': bad unit');
  if (!e[2] || !e[3]) fail('exercise ' + id + ': missing name');
});
if (!errors) ok(Data.COURSES.length + ' courses, ' + Object.keys(Data.EX).length + ' exercises, ' + rows + ' course rows');

/* 2. translations */
console.log('Translations');
const dict = load('i18n.js').I18N.dict;
const enK = Object.keys(dict.en), arK = Object.keys(dict.ar);
enK.filter((k) => !(k in dict.ar)).forEach((k) => fail('missing in Arabic: ' + k));
arK.filter((k) => !(k in dict.en)).forEach((k) => fail('missing in English: ' + k));
const used = new Set();
let allSrc = '';
fs.readdirSync(path.join(PUB, 'js')).filter((f) => f.endsWith('.js') && f !== 'i18n.js').forEach((f) => {
  const src = fs.readFileSync(path.join(PUB, 'js', f), 'utf8');
  allSrc += src;
  for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) if (!m[1].endsWith('.')) used.add(m[1]);   // dynamic prefixes like t('cat.' + id) are listed below
});
enK.forEach((k) => { if (allSrc.includes("'" + k + "'")) used.add(k); });   // keys referenced as plain strings (e.g. page titles)
/* dynamic keys: t('hs.' + x), t('cat.' + x), t('lv.' + x), t('st.' + x), t('ck.' + x + 'Desc'), t('nav.' + x), t('tm.ph.' + x) */
['hs.rest', 'hs.done', 'hs.partial', 'hs.missed', 'hs.pending', 'st.done', 'st.missed', 'st.partial', 'lv.1', 'lv.2', 'lv.3',
  'ck.course', 'ck.monthly', 'ck.calisthenics', 'ck.courseDesc', 'ck.monthlyDesc', 'ck.calisthenicsDesc',
  'nav.today', 'nav.course', 'nav.train', 'nav.courses', 'nav.history', 'tm.ph.ready', 'tm.ph.work', 'tm.ph.rest', 'tm.ph.done']
  .concat(Data.CATS.map((c) => 'cat.' + c)).forEach((k) => used.add(k));
[...used].sort().forEach((k) => { if (!(k in dict.en)) fail('used but not defined: ' + k); });
if (!errors) ok(enK.length + ' keys in each language, ' + used.size + ' keys referenced');
const unused = enK.filter((k) => !used.has(k));
if (unused.length) console.log('  · unused keys (harmless): ' + unused.join(', '));

/* 3. offline file list: every file the service worker precaches must exist (one missing file makes the whole install fail) */
console.log('Offline precache list');
const swSrc = fs.readFileSync(path.join(PUB, 'sw.js'), 'utf8');
const listMatch = swSrc.match(/const ASSETS = \[([\s\S]*?)\];/);
if (!listMatch) fail('could not find ASSETS in sw.js');
else {
  const files = [...listMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  files.forEach((f) => { if (f !== './' && !fs.existsSync(path.join(PUB, f))) fail('sw.js precaches a missing file: ' + f); });
  const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
  [...html.matchAll(/src="(js\/[^"]+)"/g)].map((m) => m[1]).forEach((s) => { if (!files.includes(s)) fail('index.html loads ' + s + ' but sw.js does not precache it (offline would break)'); });
  if (!errors) ok(files.length + ' precached files exist and cover every script in index.html');
}

/* 4. syntax */
console.log('Syntax');
fs.readdirSync(path.join(PUB, 'js')).concat(['../sw.js']).filter((f) => f.endsWith('.js')).forEach((f) => {
  try { new vm.Script(fs.readFileSync(path.join(PUB, 'js', f), 'utf8'), { filename: f }); } catch (e) { fail(f + ': ' + e.message); }
});
if (!errors) ok('all scripts parse');

console.log(errors ? '\n' + errors + ' problem(s)' : '\nAll checks passed');
process.exit(errors ? 1 : 0);
