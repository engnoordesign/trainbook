/* "How to do it" texts for every exercise and every premade course (English + Arabic).
 *   Guides.EX[id]     = { m: 'muscle keys', e: 'equipment key or ""', en: { s:[steps], t:'tip', x:'common mistake' }, ar: {...} }
 *   Guides.COURSE[id] = { e: 'equipment keys', en: { how, tips:[..] }, ar: {...} }
 * The data lives in guides-*.js files, which add themselves with Guides.add(...) / Guides.addCourses(...). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Guides = factory();
})(this, function () {
  'use strict';
  var G = { EX: {}, COURSE: {} };
  G.add = function (o) { for (var k in o) G.EX[k] = o[k]; };
  G.addCourses = function (o) { for (var k in o) G.COURSE[k] = o[k]; };
  G.has = function (id) { return !!G.EX[id]; };
  /** the guide in one language, with the shared fields */
  G.get = function (id, lang) {
    var g = G.EX[id]; if (!g) return null;
    var l = g[lang === 'ar' ? 'ar' : 'en'];
    return { muscles: g.m ? g.m.split(' ') : [], equipment: g.e || '', steps: l.s, tip: l.t, mistake: l.x };
  };
  G.getCourse = function (id, lang) {
    var g = G.COURSE[id]; if (!g) return null;
    var l = g[lang === 'ar' ? 'ar' : 'en'];
    return { equipment: g.e ? g.e.split(' ') : [], how: l.how, tips: l.tips };
  };
  G.MUSCLES = ['chest', 'shoulders', 'triceps', 'biceps', 'lats', 'upperback', 'core', 'abs', 'glutes', 'quads', 'hamstrings', 'calves', 'forearms', 'hips', 'cardio'];
  G.GEAR = ['bar', 'chair', 'wall', 'bars', 'pole', 'lbars', 'lowbar'];
  return G;
});
