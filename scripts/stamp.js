#!/usr/bin/env node
/* Stamps a content hash into public/sw.js and public/js/app.js so every deploy is a new "version"
 * (the service worker then offers the in-app "update ready" prompt).
 * Runs automatically in the Docker build and as the Cloudflare build command:   node scripts/stamp.js
 * Run it by hand only if you want to test offline mode locally. Use `node scripts/stamp.js --reset` to undo. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PUB = path.join(__dirname, '..', 'public');
const TARGETS = ['sw.js', path.join('js', 'app.js')];
const reset = process.argv.includes('--reset');
const MARK = /^(\s*(?:const|var) BUILD = ')[^']*(';)/m;   // the single "const/var BUILD = '...';" line in each target

function walk(dir, out) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const h = crypto.createHash('sha256');
walk(PUB, []).sort().forEach((p) => {
  const rel = path.relative(PUB, p).replace(/\\/g, '/');
  if (TARGETS.map((t) => t.replace(/\\/g, '/')).includes(rel)) {
    // hash the file with its stamp neutralised so the result is stable
    h.update(rel + fs.readFileSync(p, 'utf8').replace(MARK, "$1$2"));
  } else {
    h.update(rel); h.update(fs.readFileSync(p));
  }
});
const build = reset ? 'dev' : h.digest('hex').slice(0, 10);

for (const t of TARGETS) {
  const file = path.join(PUB, t);
  const src = fs.readFileSync(file, 'utf8');
  if (!MARK.test(src)) { console.error('no BUILD marker in', t); process.exit(1); }
  fs.writeFileSync(file, src.replace(MARK, '$1' + build + '$2'));
}
console.log('TrainBook build stamp:', build);
