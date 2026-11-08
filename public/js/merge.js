/* Merging two copies of a profile (this device and the server) after both changed while apart.
 * Goal: never lose a workout you logged on either device.
 *   - exercises you planned: union (a plan item is the same item when it has the same id)
 *   - each day: the same exercise (same plan item) is one entry; the most recently touched copy wins (entry.t);
 *     if both are untouched, "done" beats "partial" beats "missed" beats "not done yet"
 *   - Super Days and skipped items: union
 *   - settings (language, theme, week start, name): this device's choice
 * Known trade-off (same as Ledgerly): a merge only adds, so something you deleted on one device can come back. */
(function (root) {
  'use strict';

  var RANK = { done: 3, partial: 2, missed: 1 };
  var rank = function (s) { return RANK[s] || 0; };
  var union = function (a, b) { var seen = {}, out = []; (a || []).concat(b || []).forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } }); return out; };
  var keyOf = function (e) { return e.planId ? 'p:' + e.planId : 'i:' + e.id; };

  function pick(a, b) {                        // a = this device, b = other. Ties prefer a.
    var ta = a.t || 0, tb = b.t || 0;
    if (tb > ta) return b;
    if (ta > tb) return a;
    return rank(b.status) > rank(a.status) ? b : a;
  }

  function mergeDay(da, db) {
    da = da || { items: [], skip: [] }; db = db || { items: [], skip: [] };
    var skip = union(da.skip, db.skip), byKey = {}, order = [];
    da.items.concat(db.items).forEach(function (e) {
      var k = keyOf(e);
      if (!byKey[k]) { byKey[k] = e; order.push(k); } else byKey[k] = pick(byKey[k], e);
    });
    var items = order.map(function (k) { return byKey[k]; }).filter(function (e) {
      return !(e.planId && skip.indexOf(e.planId) >= 0 && e.status == null);       // removed from that day on one device
    });
    return { items: items, skip: skip };
  }

  /** local = this device's state, remote = the other copy. Returns a new state object (not normalised: Store does that). */
  function merge(local, remote) {
    local = local || {}; remote = remote || {};
    var out = JSON.parse(JSON.stringify(local)), r = JSON.parse(JSON.stringify(remote));

    /* plan */
    var ids = {};
    out.plan = (out.plan || []).slice();
    out.plan.forEach(function (p) { ids[p.id] = 1; });
    (r.plan || []).forEach(function (p) { if (!ids[p.id]) out.plan.push(p); });

    /* course: keep the more recently started one, and drop plan items of a course that lost */
    var ca = local.course, cb = remote.course;
    out.course = ca && cb ? (cb.start > ca.start ? cb : ca) : (ca || cb || null);
    out.plan = out.plan.filter(function (p) { return !p.courseId || (out.course && p.courseId === out.course.id); });

    /* days */
    out.logs = {};
    var dates = union(Object.keys(local.logs || {}), Object.keys(remote.logs || {}));
    dates.forEach(function (d) {
      var m = mergeDay((local.logs || {})[d], (remote.logs || {})[d]);
      if (m.items.length || m.skip.length) out.logs[d] = m;
    });

    out.superDates = union(local.superDates, remote.superDates).sort();
    out.superWeekdays = union(local.superWeekdays, remote.superWeekdays).sort();
    out.lastSeen = [local.lastSeen, remote.lastSeen].filter(Boolean).sort().pop() || null;
    if (!out.name && r.name) out.name = r.name;
    return out;
  }

  var Merge = { merge: merge };
  if (typeof module !== 'undefined' && module.exports) module.exports = Merge; else root.Merge = Merge;
})(typeof window !== 'undefined' ? window : this);
