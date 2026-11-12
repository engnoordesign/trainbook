/* Pure helpers for the offline music library (no DOM, no storage): file filtering, names, formatting, search and the play queue.
 * Works in the browser (window.MusicLib) and in Node (module.exports) so it can be tested. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.MusicLib = factory();
})(this, function () {
  'use strict';
  var EXT = /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|weba)$/i;

  /** is this file a song we can try to play? (the browser's type first, the file name as a fallback) */
  function isAudio(name, type) {
    if (type) { if (/^audio\//i.test(type)) return true; if (/^(video|image|text|application)\//i.test(type) && !/^application\/ogg$/i.test(type)) return false; }
    return EXT.test(String(name || ''));
  }
  /** "01 - Eye_of_the_Tiger.mp3" -> "Eye of the Tiger" */
  function cleanName(file) {
    var s = String(file || '').replace(/^.*[\\/]/, '').replace(EXT, '');
    s = s.replace(/[_]+/g, ' ').replace(/^\s*\d{1,3}\s*[-.)_]\s*/, '').replace(/\s{2,}/g, ' ').trim();
    return (s || 'Track').slice(0, 80);
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(+sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') + m : m) + ':' + (s < 10 ? '0' : '') + s;
  }
  function fmtSize(b) {
    b = +b || 0;
    if (b < 1024 * 1024) return Math.max(1, Math.round(b / 1024)) + ' KB';
    if (b < 1024 * 1024 * 1024) return (b / 1048576 < 10 ? Math.round(b / 104857.6) / 10 : Math.round(b / 1048576)) + ' MB';
    return Math.round(b / 107374182.4) / 10 + ' GB';
  }
  /** every word of the search must appear in the name (case-insensitive) */
  function matches(track, query) {
    var q = String(query || '').toLowerCase().split(/\s+/).filter(Boolean), n = String(track.name || '').toLowerCase();
    return q.every(function (w) { return n.indexOf(w) >= 0; });
  }
  function byName(a, b) { return String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: 'base' }); }

  /* ---------- the play queue ---------- */
  /** a queue is { ids:[...], pos:number, shuffle:bool, repeat:'off'|'all'|'one' } and never changes in place */
  function makeQueue(ids, startId, shuffle, repeat, rnd) {
    rnd = rnd || Math.random;
    var list = ids.slice();
    if (shuffle) {
      for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = list[i]; list[i] = list[j]; list[j] = t; }
      var k = list.indexOf(startId);
      if (k > 0) { list.splice(k, 1); list.unshift(startId); }
    }
    var pos = startId == null ? 0 : list.indexOf(startId);
    return { ids: list, pos: pos < 0 ? 0 : pos, shuffle: !!shuffle, repeat: repeat || 'all' };
  }
  /** the queue after a song ends (auto = true) or after the Next button; null means "stop" */
  function nextQueue(q, auto) {
    if (!q.ids.length) return null;
    if (auto && q.repeat === 'one') return q;
    var p = q.pos + 1;
    if (p >= q.ids.length) { if (q.repeat === 'off' && auto) return null; p = 0; }
    return { ids: q.ids, pos: p, shuffle: q.shuffle, repeat: q.repeat };
  }
  function prevQueue(q) {
    if (!q.ids.length) return null;
    var p = q.pos - 1; if (p < 0) p = q.repeat === 'off' ? 0 : q.ids.length - 1;
    return { ids: q.ids, pos: p, shuffle: q.shuffle, repeat: q.repeat };
  }
  /** a song was removed: keep the queue pointing at the same song where possible */
  function dropFromQueue(q, id) {
    var i = q.ids.indexOf(id); if (i < 0) return q;
    var ids = q.ids.slice(); ids.splice(i, 1);
    return { ids: ids, pos: Math.min(i < q.pos ? q.pos - 1 : q.pos, Math.max(0, ids.length - 1)), shuffle: q.shuffle, repeat: q.repeat };
  }
  var REPEAT = ['all', 'one', 'off'];
  function nextRepeat(r) { return REPEAT[(REPEAT.indexOf(r) + 1) % REPEAT.length]; }

  return { isAudio: isAudio, cleanName: cleanName, fmtDur: fmtDur, fmtSize: fmtSize, matches: matches, byName: byName, makeQueue: makeQueue, nextQueue: nextQueue, prevQueue: prevQueue, dropFromQueue: dropFromQueue, nextRepeat: nextRepeat };
});
