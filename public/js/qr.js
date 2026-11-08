/* Minimal QR Code generator: byte mode, error correction level M, versions 1-10 (up to 213 bytes - plenty for a web address).
 * No dependencies. Follows ISO/IEC 18004. Works in the browser (window.QR) and in Node (module.exports). */
(function (root) {
  'use strict';

  /* level M, indexed by version 1..10 */
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  var NUM_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  var MAX_VERSION = 10;

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) { var n = Math.floor(ver / 7) + 2; r -= (25 * n - 10) * n - 55; if (ver >= 7) r -= 36; }
    return r;
  }
  function dataCodewords(ver) { return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver]; }

  function utf8(text) {
    if (typeof TextEncoder !== 'undefined') return Array.prototype.slice.call(new TextEncoder().encode(text));
    var s = unescape(encodeURIComponent(text)), out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  /* ---- Reed-Solomon over GF(256), polynomial 0x11D ---- */
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z;
  }
  function rsDivisor(deg) {
    var res = [], i, j, root = 1;
    for (i = 0; i < deg - 1; i++) res.push(0);
    res.push(1);
    for (i = 0; i < deg; i++) {
      for (j = 0; j < res.length; j++) { res[j] = gfMul(res[j], root); if (j + 1 < res.length) res[j] ^= res[j + 1]; }
      root = gfMul(root, 2);
    }
    return res;
  }
  function rsRemainder(data, div) {
    var res = div.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ res.shift(); res.push(0);
      div.forEach(function (c, i) { res[i] ^= gfMul(c, f); });
    });
    return res;
  }

  function encode(text) {
    var bytes = utf8(String(text)), ver, bits = [];
    for (ver = 1; ver <= MAX_VERSION; ver++) {
      if (4 + (ver < 10 ? 8 : 16) + 8 * bytes.length <= dataCodewords(ver) * 8) break;
    }
    if (ver > MAX_VERSION) return null;

    var put = function (val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    var cap = dataCodewords(ver) * 8;
    put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = [], i, j;
    for (i = 0; i < bits.length; i += 8) { var v = 0; for (j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; data.push(v); }

    /* split into blocks, add error correction, interleave */
    var nb = NUM_BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver], raw = Math.floor(rawModules(ver) / 8);
    var shortBlocks = nb - raw % nb, shortLen = Math.floor(raw / nb), blocks = [], div = rsDivisor(eccLen), k = 0;
    for (i = 0; i < nb; i++) {
      var dat = data.slice(k, k + shortLen - eccLen + (i < shortBlocks ? 0 : 1)); k += dat.length;
      var ecc = rsRemainder(dat, div);
      if (i < shortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) {
      for (j = 0; j < nb; j++) if (i !== shortLen - eccLen || j >= shortBlocks) all.push(blocks[j][i]);
    }

    /* ---- draw the matrix ---- */
    var size = ver * 4 + 17, mod = [], fn = [], y, x;
    for (y = 0; y < size; y++) { mod.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    var setFn = function (px, py, dark) { mod[py][px] = dark; fn[py][px] = true; };
    var finder = function (cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, d !== 2 && d !== 4);
      }
    };
    var align = function (cx, cy) {
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    };
    var formatBits = function (mask) {            /* level M = 0b00 */
      var d = (0 << 3) | mask, rem = d, n;
      for (n = 0; n < 10; n++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var b = ((d << 10) | rem) ^ 0x5412, bit = function (n2) { return ((b >>> n2) & 1) !== 0; };
      for (n = 0; n <= 5; n++) setFn(8, n, bit(n));
      setFn(8, 7, bit(6)); setFn(8, 8, bit(7)); setFn(7, 8, bit(8));
      for (n = 9; n < 15; n++) setFn(14 - n, 8, bit(n));
      for (n = 0; n < 8; n++) setFn(size - 1 - n, 8, bit(n));
      for (n = 8; n < 15; n++) setFn(8, size - 15 + n, bit(n));
      setFn(8, size - 8, true);
    };
    for (i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    if (ver > 1) {
      var na = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2, pos = [6];
      for (var p = size - 7; pos.length < na; p -= step) pos.splice(1, 0, p);
      for (i = 0; i < na; i++) for (j = 0; j < na; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
        align(pos[i], pos[j]);
      }
    }
    formatBits(0);
    if (ver >= 7) {
      var vr = ver;
      for (i = 0; i < 12; i++) vr = (vr << 1) ^ ((vr >>> 11) * 0x1F25);
      var vb = (ver << 12) | vr;
      for (i = 0; i < 18; i++) {
        var dark = ((vb >>> i) & 1) !== 0, a = size - 11 + i % 3, b2 = Math.floor(i / 3);
        setFn(a, b2, dark); setFn(b2, a, dark);
      }
    }

    /* data bits in the zig-zag order */
    var bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (j = 0; j < 2; j++) {
        x = right - j;
        y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (!fn[y][x] && bi < all.length * 8) { mod[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; }
      }
    }

    /* choose the mask with the lowest penalty */
    var applyMask = function (m) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
        var inv;
        switch (m) {
          case 0: inv = (xx + yy) % 2 === 0; break;
          case 1: inv = yy % 2 === 0; break;
          case 2: inv = xx % 3 === 0; break;
          case 3: inv = (xx + yy) % 3 === 0; break;
          case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
          case 5: inv = xx * yy % 2 + xx * yy % 3 === 0; break;
          case 6: inv = (xx * yy % 2 + xx * yy % 3) % 2 === 0; break;
          default: inv = ((xx + yy) % 2 + xx * yy % 3) % 2 === 0;
        }
        if (!fn[yy][xx] && inv) mod[yy][xx] = !mod[yy][xx];
      }
    };
    var penalty = function () {
      var pen = 0, r, c, run, lines = [];
      for (r = 0; r < size; r++) {            /* rows, then columns, as 0/1 strings */
        var row = '', col = '';
        for (c = 0; c < size; c++) { row += mod[r][c] ? '1' : '0'; col += mod[c][r] ? '1' : '0'; }
        lines.push(row, col);
      }
      lines.forEach(function (s) {
        run = 1;
        for (var n = 1; n <= s.length; n++) {
          if (n < s.length && s[n] === s[n - 1]) run++;
          else { if (run >= 5) pen += 3 + (run - 5); run = 1; }
        }
        for (var q = 0; q + 11 <= s.length; q++) { var w = s.substr(q, 11); if (w === '10111010000' || w === '00001011101') pen += 40; }
      });
      var dark2 = 0;
      for (r = 0; r < size; r++) for (c = 0; c < size; c++) {
        if (mod[r][c]) dark2++;
        if (r + 1 < size && c + 1 < size && mod[r][c] === mod[r][c + 1] && mod[r][c] === mod[r + 1][c] && mod[r][c] === mod[r + 1][c + 1]) pen += 3;
      }
      var total = size * size;
      pen += (Math.ceil(Math.abs(dark2 * 20 - total * 10) / total) - 1) * 10;
      return pen;
    };
    var best = 0, bestPen = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m); formatBits(m);
      var pn = penalty();
      if (pn < bestPen) { bestPen = pn; best = m; }
      applyMask(m);                          /* XOR again = undo */
    }
    applyMask(best); formatBits(best);
    return { size: size, version: ver, modules: mod };
  }

  /* SVG string (horizontal runs merged so there are no hairline seams) */
  function svg(text, opt) {
    opt = opt || {};
    var q = encode(text); if (!q) return '';
    var m = opt.margin == null ? 4 : opt.margin, n = q.size + 2 * m, d = '';
    for (var y = 0; y < q.size; y++) {
      var x = 0;
      while (x < q.size) {
        if (!q.modules[y][x]) { x++; continue; }
        var s = x; while (x < q.size && q.modules[y][x]) x++;
        d += 'M' + (s + m) + ',' + (y + m) + 'h' + (x - s) + 'v1h-' + (x - s) + 'z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" role="img">' +
      '<rect width="' + n + '" height="' + n + '" fill="' + (opt.light || '#ffffff') + '"/><path d="' + d + '" fill="' + (opt.dark || '#111111') + '"/></svg>';
  }

  /* draw onto a <canvas> (browser only); returns false if the text is too long */
  function draw(canvas, text, scale, margin) {
    var q = encode(text); if (!q) return false;
    var m = margin == null ? 4 : margin, sc = scale || 8, n = q.size + 2 * m, ctx = canvas.getContext('2d');
    canvas.width = canvas.height = n * sc;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111111';
    for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) if (q.modules[y][x]) ctx.fillRect((x + m) * sc, (y + m) * sc, sc, sc);
    return true;
  }

  var QR = { encode: encode, svg: svg, draw: draw, maxBytes: dataCodewords(MAX_VERSION) - 3 };
  if (typeof module !== 'undefined' && module.exports) module.exports = QR; else root.QR = QR;
})(typeof window !== 'undefined' ? window : this);
