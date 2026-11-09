#!/usr/bin/env node
/* Check that every playlist in the music library still exists and still has the title we show:  npm run music:check
 * (needs internet). Spotify owns and edits these playlists, so now and then one is renamed or removed; this tells you which. */
const path = require('path');
const M = require(path.join(__dirname, '..', 'public', 'js', 'music-data.js'));

const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
const clean = (s) => norm(s).replace(/^(top 50 )?(of )?/, '');

async function check(p) {
  const url = 'https://open.spotify.com/oembed?url=' + encodeURIComponent('https://open.spotify.com/playlist/' + p.id);
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return { p, bad: 'HTTP ' + res.status + ' (removed or private?)' };
    const j = await res.json();
    const title = j.title || '';
    if (clean(title) !== clean(p.name) && !norm(title).includes(norm(p.name)) && !norm(p.name).includes(norm(title))) return { p, bad: 'now called "' + title + '"' };
    return { p };
  } catch (e) { return { p, bad: 'network error: ' + e.message, net: true }; }
}

(async () => {
  console.log('Checking ' + M.LIBRARY.length + ' playlists against Spotify...');
  const out = [];
  for (let i = 0; i < M.LIBRARY.length; i += 6) out.push(...await Promise.all(M.LIBRARY.slice(i, i + 6).map(check)));
  const bad = out.filter((r) => r.bad);
  out.filter((r) => !r.bad).forEach((r) => console.log('  ✓ ' + r.p.name));
  bad.forEach((r) => console.error('  ✗ ' + r.p.name + '  (' + r.p.id + ')  ' + r.bad));
  if (bad.some((r) => r.net) && bad.every((r) => r.net)) { console.error('\nCould not reach Spotify. Check your internet connection.'); process.exit(2); }
  console.log(bad.length ? '\n' + bad.length + ' need attention: fix or remove them in public/js/music-data.js' : '\nAll playlists are fine.');
  process.exit(bad.length ? 1 : 0);
})();
