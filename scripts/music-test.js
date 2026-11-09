#!/usr/bin/env node
/* Offline tests for public/js/music-data.js (library integrity + the link parser):  node scripts/music-test.js
 * The playlists themselves are checked against Spotify separately (needs internet):  npm run music:check */
const path = require('path');
const M = require(path.join(__dirname, '..', 'public', 'js', 'music-data.js'));

let passed = 0, failed = 0;
const ok = (cond, label) => { if (cond) passed++; else { failed++; console.error('  ✗ ' + label); } };
console.log('Music tests');

/* library */
const ids = M.LIBRARY.map((p) => p.id);
ok(M.LIBRARY.length >= 40, 'a big library (' + M.LIBRARY.length + ' playlists)');
ok(new Set(ids).size === ids.length, 'no duplicate playlists');
ok(M.LIBRARY.every((p) => /^[A-Za-z0-9]{22}$/.test(p.id)), 'every id is a valid 22-character Spotify id');
ok(M.LIBRARY.every((p) => p.name && p.ar && p.d.en && p.d.ar), 'every playlist has English + Arabic names and descriptions');
ok(M.CATS.every((c) => M.LIBRARY.some((p) => p.cat === c)), 'every category has playlists');
ok(M.LIBRARY.every((p) => M.CATS.includes(p.cat)), 'every playlist is in a known category');
ok(M.LIBRARY.filter((p) => p.cat === 'trending').length >= 10, 'plenty of trending charts (international)');
ok(['Egypt', 'Saudi Arabia', 'Global', 'Brazil', 'South Korea', 'Nigeria'].every((n) => M.LIBRARY.some((p) => p.name.includes(n))), 'charts include Arabic-speaking and world countries');
ok(M.LIBRARY.every((p) => M.embedSrc(p, true).startsWith('https://open.spotify.com/embed/playlist/' + p.id)), 'every playlist has an official embed address');

/* parser: accepted */
const sp = (u) => M.parse(u);
let r = sp('https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP?si=abc123');
ok(r && r.kind === 'spotify' && r.type === 'playlist' && r.id === '37i9dQZF1DX76Wlfdnj7AP', 'Spotify playlist link (with tracking parameter)');
r = sp('open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'); ok(r && r.type === 'track', 'Spotify link pasted without https://');
r = sp('https://open.spotify.com/intl-ar/album/4uLU6hMCjMI75M1A2tKUQC'); ok(r && r.type === 'album', 'Spotify link with a language prefix');
r = sp('spotify:playlist:37i9dQZF1DX76Wlfdnj7AP'); ok(r && r.type === 'playlist', 'Spotify URI');
r = sp('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); ok(r && r.kind === 'youtube' && r.type === 'video' && r.id === 'dQw4w9WgXcQ', 'YouTube video');
r = sp('https://youtu.be/dQw4w9WgXcQ?t=10'); ok(r && r.id === 'dQw4w9WgXcQ', 'youtu.be short link');
r = sp('https://www.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI'); ok(r && r.type === 'playlist' && r.list === 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', 'YouTube playlist');
r = sp('https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=RDAMVMdQw4w9WgXcQ'); ok(r && r.type === 'playlist' && r.id === 'dQw4w9WgXcQ', 'YouTube Music link with a mix');
r = sp('https://soundcloud.com/some-artist/some-track'); ok(r && r.kind === 'soundcloud' && r.type === 'track', 'SoundCloud track');
r = sp('https://soundcloud.com/some-artist/sets/workout-mix'); ok(r && r.type === 'playlist', 'SoundCloud set');

/* parser: refused (anything else must never become an iframe) */
for (const bad of ['', '   ', 'hello world', 'javascript:alert(1)', 'data:text/html,<script>1</script>', 'https://evil.example/embed/x', 'https://open.spotify.com.evil.com/playlist/37i9dQZF1DX76Wlfdnj7AP',
  'https://evil.com/?u=https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP', 'https://open.spotify.com/playlist/short', 'https://open.spotify.com/user/someone', 'https://www.youtube.com/watch?v=<script>',
  'https://youtube.com.evil.net/watch?v=dQw4w9WgXcQ', 'https://soundcloud.com/onlyonepart', 'https://soundcloud.com/a/b"onload="x', 'ftp://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP', 'x'.repeat(400)]) {
  ok(sp(bad) === null, 'refused: ' + JSON.stringify(bad.slice(0, 50)));
}

/* embed addresses */
ok(M.embedSrc(sp('https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP'), false) === 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator', 'Spotify embed (light)');
ok(M.embedSrc(sp('https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP'), true).endsWith('&theme=0'), 'Spotify embed (dark theme)');
ok(M.embedSrc(sp('https://youtu.be/dQw4w9WgXcQ')).startsWith('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'), 'YouTube embeds use the no-cookie domain');
ok(M.embedSrc(sp('https://www.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')).includes('videoseries?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI'), 'YouTube playlist embed');
ok(M.embedSrc(sp('https://soundcloud.com/a/b')).startsWith('https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fa%2Fb'), 'SoundCloud widget embed');
ok(M.embedSrc({ kind: 'spotify', type: 'playlist', id: '"><script>' }) === '' && M.embedSrc(null) === '' && M.embedSrc({ kind: 'other' }) === '', 'nothing is embedded for invalid items');

/* daily + random */
ok(M.daily('2026-11-09').id === M.daily('2026-11-09').id, "today's pick is stable all day");
ok(new Set(Array.from({ length: 40 }, (_, i) => M.daily('2026-11-' + String(i + 1).padStart(2, '0')).id)).size > 4, "...and varies from day to day");
ok(M.daily('2026-11-09').cat !== 'calm' && M.daily('2026-11-09').cat !== 'trending', "today's pick is an energetic playlist");
let calm = false, same = false;
for (let i = 0; i < 300; i++) { const p = M.random('37i9dQZF1DX76Wlfdnj7AP'); if (p.cat === 'calm') calm = true; if (p.id === '37i9dQZF1DX76Wlfdnj7AP') same = true; }
ok(!calm, 'Surprise me never picks a cool-down playlist');
ok(!same, 'Surprise me never repeats the one that is playing');
ok(M.random('', () => 0).id === M.LIBRARY.find((p) => p.cat !== 'calm').id && M.random('', () => 0.999999).cat !== 'calm', 'random respects the random source (edges)');

console.log(`  passed ${passed}, failed ${failed}`);
process.exit(failed ? 1 : 0);
