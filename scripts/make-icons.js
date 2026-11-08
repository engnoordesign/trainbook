#!/usr/bin/env node
/* Generates the PNG app icons (no dependencies): node scripts/make-icons.js
 * Same artwork as public/favicon.svg, rasterised with 4x4 supersampling and written with Node's zlib. */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const A = [0x43, 0x61, 0xee], B = [0x67, 0x41, 0xd9], WHITE = [255, 255, 255];

function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const dx = Math.abs(px - cx) - hw + r, dy = Math.abs(py - cy) - hh + r;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
}
function distSeg(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

/* returns [r,g,b,a] for a point in 0..1 space. roundedBg: transparent corners (any), else full-bleed */
function sample(u, v, roundedBg) {
  let col = null, a = 0;
  const inBg = roundedBg ? sdRoundRect(u, v, .5, .5, .5, .5, .22) <= 0 : true;
  if (!inBg) return [0, 0, 0, 0];
  const t = (u + v) / 2;
  col = [0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t); a = 1;
  /* notebook */
  if (sdRoundRect(u, v, .5, .5, .21, .28, .06) <= 0) col = WHITE;
  /* binder tabs */
  for (const cy of [.33, .5, .67]) if (sdRoundRect(u, v, .26, cy, .05, .02, .02) <= 0) col = WHITE;
  /* check mark */
  const w = .0275;
  if (distSeg(u, v, .40, .50, .47, .575) <= w || distSeg(u, v, .47, .575, .61, .41) <= w) col = A;
  return [col[0], col[1], col[2], a];
}

function render(size, roundedBg) {
  const ss = 4, buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
      const s = sample((x + (sx + .5) / ss) / size, (y + (sy + .5) / ss) / size, roundedBg);
      r += s[0] * s[3]; g += s[1] * s[3]; b += s[2] * s[3]; a += s[3];
    }
    const n = ss * ss, o = (y * size + x) * 4;
    buf[o] = a ? Math.round(r / a) : 0; buf[o + 1] = a ? Math.round(g / a) : 0; buf[o + 2] = a ? Math.round(b / a) : 0; buf[o + 3] = Math.round((a / n) * 255);
  }
  return buf;
}

const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const jobs = [
  ['icon-192.png', 192, true],
  ['icon-512.png', 512, true],
  ['maskable-512.png', 512, false],   // full-bleed, content inside the safe zone
  ['apple-touch-icon.png', 180, false] // iOS rounds the corners itself
];
for (const [name, size, rounded] of jobs) {
  fs.writeFileSync(path.join(OUT, name), png(size, render(size, rounded)));
  console.log('wrote', name, size + 'x' + size);
}
