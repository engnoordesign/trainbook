#!/usr/bin/env node
/* Tests for the offline music helpers (public/js/library.js):  node scripts/library-test.js */
const path = require('path');
const L = require(path.join(__dirname, '..', 'public', 'js', 'library.js'));
let passed = 0, failed = 0;
const ok = (c, label) => { if (c) passed++; else { failed++; console.error('  ✗ ' + label); } };
console.log('Offline music tests');

/* which files are songs */
ok(L.isAudio('a.mp3', 'audio/mpeg') && L.isAudio('a.m4a', 'audio/x-m4a') && L.isAudio('a.flac', 'audio/flac'), 'audio types are accepted');
ok(L.isAudio('Track.MP3', '') && L.isAudio('x.opus', ''), 'a missing type falls back to the file extension');
ok(!L.isAudio('movie.mp4', 'video/mp4') && !L.isAudio('pic.png', 'image/png') && !L.isAudio('notes.txt', 'text/plain') && !L.isAudio('a.pdf', 'application/pdf'), 'videos, pictures and documents are refused');
ok(!L.isAudio('readme', '') && !L.isAudio('', '') && !L.isAudio(null, null), 'nothing is accepted without a clue');
ok(L.isAudio('song.ogg', 'application/ogg'), 'ogg audio reported as application/ogg is accepted');

/* names, sizes, durations */
ok(L.cleanName('01 - Eye_of_the_Tiger.mp3') === 'Eye of the Tiger', 'track numbers and underscores are cleaned');
ok(L.cleanName('C:\\Music\\Gym\\Power.Up.wav') === 'Power.Up', 'folders are dropped, dots inside names are kept');
ok(L.cleanName('05. أغنية الحماس.mp3') === 'أغنية الحماس', 'Arabic names work');
ok(L.cleanName('.mp3') === 'Track' && L.cleanName('') === 'Track', 'empty names get a default');
ok(L.cleanName('x'.repeat(200) + '.mp3').length === 80, 'long names are shortened');
ok(L.fmtDur(0) === '0:00' && L.fmtDur(65) === '1:05' && L.fmtDur(3599) === '59:59' && L.fmtDur(3661) === '1:01:01' && L.fmtDur(NaN) === '0:00', 'durations');
ok(L.fmtSize(500) === '1 KB' && L.fmtSize(2048) === '2 KB' && L.fmtSize(5 * 1048576) === '5 MB' && L.fmtSize(3.5 * 1073741824) === '3.5 GB', 'sizes');

/* search + order */
const tr = [{ name: 'Beast Mode' }, { name: 'Iron Beast 2' }, { name: 'Calm Down' }];
ok(tr.filter((t) => L.matches(t, 'beast')).length === 2 && tr.filter((t) => L.matches(t, 'mode beast')).length === 1 && tr.filter((t) => L.matches(t, '')).length === 3, 'search finds songs by every word');
ok(tr.filter((t) => L.matches(t, 'BEAST')).length === 2, 'search ignores case');
ok([{ name: 'Song 10' }, { name: 'Song 2' }, { name: 'Song 1' }].sort(L.byName).map((t) => t.name).join() === 'Song 1,Song 2,Song 10', 'songs sort by name with numbers in order');

/* the queue */
const ids = ['a', 'b', 'c', 'd'];
let q = L.makeQueue(ids, 'c', false, 'all');
ok(q.pos === 2 && q.ids.join('') === 'abcd', 'play in order starts at the chosen song');
q = L.nextQueue(q, true); ok(ids[q.pos] === 'd', 'next');
q = L.nextQueue(q, true); ok(ids[q.pos] === 'a', 'repeat all wraps around at the end');
ok(L.nextQueue(L.makeQueue(ids, 'd', false, 'off'), true) === null, 'repeat off stops after the last song');
ok(L.nextQueue(L.makeQueue(ids, 'd', false, 'off'), false).pos === 0, 'the Next button still wraps with repeat off');
const one = L.makeQueue(ids, 'b', false, 'one');
ok(L.nextQueue(one, true) === one && L.nextQueue(one, false).pos === 2, 'repeat one replays when a song ends, but Next moves on');
ok(L.prevQueue(L.makeQueue(ids, 'b', false, 'all')).pos === 0 && L.prevQueue(L.makeQueue(ids, 'a', false, 'all')).pos === 3 && L.prevQueue(L.makeQueue(ids, 'a', false, 'off')).pos === 0, 'previous');
ok(L.nextQueue(L.makeQueue([], null, false, 'all'), true) === null && L.prevQueue(L.makeQueue([], null, false, 'all')) === null, 'an empty queue stops');

let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const big = Array.from({ length: 1000 }, (_, i) => 's' + i);
const sh = L.makeQueue(big, 's500', true, 'all', rnd);
ok(sh.ids[0] === 's500' && sh.pos === 0, 'shuffle starts with the song you picked');
ok(new Set(sh.ids).size === 1000 && sh.ids.length === 1000, 'shuffle keeps all 1000 songs exactly once');
ok(sh.ids.join() !== big.join(), 'shuffle really changes the order');
ok(L.makeQueue(ids, 'zzz', false, 'all').pos === 0 && L.makeQueue(ids, null, false, 'all').pos === 0, 'an unknown start song plays from the top');

/* removing a song from the queue */
let d = L.makeQueue(ids, 'c', false, 'all');                  // a b [c] d
d = L.dropFromQueue(d, 'a'); ok(d.ids.join('') === 'bcd' && d.ids[d.pos] === 'c', 'removing an earlier song keeps the current one');
d = L.dropFromQueue(d, 'd'); ok(d.ids.join('') === 'bc' && d.ids[d.pos] === 'c', 'removing a later song keeps the current one');
d = L.dropFromQueue(d, 'c'); ok(d.ids.join('') === 'b' && d.pos === 0, 'removing the current song moves on');
ok(L.dropFromQueue(d, 'zzz') === d, 'removing an unknown song changes nothing');
ok(L.nextRepeat('all') === 'one' && L.nextRepeat('one') === 'off' && L.nextRepeat('off') === 'all', 'repeat cycles all, one, off');

console.log(`  passed ${passed}, failed ${failed}`);
process.exit(failed ? 1 : 0);
