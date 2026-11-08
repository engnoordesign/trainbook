'use strict';
/* Vault: password-based encryption with the browser's WebCrypto. No third-party code.

   Envelope design (the same idea password managers use):
     data key (DK)     random 256-bit AES-GCM key. It encrypts the profile's data. It never changes.
     password wrap     DK encrypted with a key derived from the password (PBKDF2-SHA256, 600k rounds, then HKDF).
     recovery wrap     DK encrypted with a key derived from a random recovery key shown once at sign-up.
   Changing the password only re-wraps DK, so nothing has to be re-encrypted and the recovery key keeps working.
   Sealed values look like  "v1.<iv>.<ciphertext>"  (base64). */
const Vault = (() => {
  const V = { ITER: 600000 };
  const enc = new TextEncoder(), dec = new TextDecoder();
  const subtle = () => { const c = globalThis.crypto; if (!c || !c.subtle) throw new Error('NO_CRYPTO'); return c.subtle; };
  V.available = () => !!(globalThis.crypto && globalThis.crypto.subtle);

  /* ---------- encoding ---------- */
  const b64 = bytes => { const a = new Uint8Array(bytes); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  V.b64 = b64; V.unb64 = unb64;
  V.random = n => globalThis.crypto.getRandomValues(new Uint8Array(n));

  /* ---------- primitives ---------- */
  async function pbkdf2(password, salt, iter) {
    const key = await subtle().importKey('raw', enc.encode(String(password).normalize('NFKC')), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await subtle().deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256));
  }
  async function hkdf(secret, info) {
    const key = await subtle().importKey('raw', secret, 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await subtle().deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: enc.encode('trainbook-v1'), info: enc.encode(info) }, key, 256));
  }
  const aes = raw => subtle().importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);

  /** Encrypt text or bytes. */
  V.seal = async (keyBytes, data) => {
    const iv = V.random(12);
    const ct = await subtle().encrypt({ name: 'AES-GCM', iv }, await aes(keyBytes), typeof data === 'string' ? enc.encode(data) : data);
    return `v1.${b64(iv)}.${b64(ct)}`;
  };
  /** Decrypt. Throws BAD_KEY for a wrong key or tampered data. */
  V.open = async (keyBytes, sealed, asBytes = false) => {
    const [v, iv, ct] = String(sealed).split('.');
    if (v !== 'v1' || !iv || !ct) throw new Error('BAD_FORMAT');
    try {
      const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(iv) }, await aes(keyBytes), unb64(ct));
      return asBytes ? new Uint8Array(pt) : dec.decode(pt);
    } catch (e) { throw new Error('BAD_KEY'); }
  };

  /* ---------- password and recovery key ---------- */
  V.fromPassword = async (password, salt, iter) => hkdf(await pbkdf2(password, salt, iter || V.ITER), 'kek');
  V.fromRecovery = bytes => hkdf(bytes, 'rec-kek');

  const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: no I, L, O, U
  const toB32 = bytes => { let acc = 0, bits = 0, out = ''; for (const b of bytes) { acc = ((acc << 8) | b) & 0xFFFFFF; bits += 8; while (bits >= 5) { out += B32[(acc >>> (bits - 5)) & 31]; bits -= 5; } } if (bits) out += B32[(acc << (5 - bits)) & 31]; return out; };
  const fromB32 = s => { let acc = 0, bits = 0; const out = []; for (const ch of s) { const v = B32.indexOf(ch); if (v < 0) return null; acc = ((acc << 5) | v) & 0xFFFFFF; bits += 5; if (bits >= 8) { out.push((acc >>> (bits - 8)) & 255); bits -= 8; } } return Uint8Array.from(out); };
  /** 16 random bytes as "ABCD-EFGH-IJKL-MNPQ-RSTV-WX". */
  V.formatRecovery = bytes => toB32(bytes).match(/.{1,4}/g).join('-');
  /** Accepts any case, spaces or dashes; forgives O/I/L typos. Returns bytes or null. */
  V.parseRecovery = text => {
    const s = String(text || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
    if (s.length !== 26) return null;
    const b = fromB32(s);
    return b && b.length === 16 ? b : null;
  };

  /** Everything needed for a brand-new account. */
  V.createAccount = async password => {
    const salt = V.random(16), dk = V.random(32), rec = V.random(16);
    const kek = await V.fromPassword(password, salt, V.ITER), rkek = await V.fromRecovery(rec);
    return { dk, recovery: rec, salt: b64(salt), iter: V.ITER, pwWrap: await V.seal(kek, dk), recWrap: await V.seal(rkek, dk) };
  };
  /** Password -> data key. p = { salt, iter, pwWrap }. Throws BAD_KEY for a wrong password. */
  V.unlock = async (password, p) => V.open(await V.fromPassword(password, unb64(p.salt), p.iter), p.pwWrap, true);
  V.unlockWithRecovery = async (recoveryBytes, recWrap) => V.open(await V.fromRecovery(recoveryBytes), recWrap, true);
  /** New password for the same data key: fresh salt and a new wrap. */
  V.rewrap = async (newPassword, dk) => {
    const salt = V.random(16), kek = await V.fromPassword(newPassword, salt, V.ITER);
    return { salt: b64(salt), iter: V.ITER, pwWrap: await V.seal(kek, dk) };
  };
  /** A fresh recovery key for the same data key. */
  V.newRecovery = async dk => {
    const rec = V.random(16);
    return { recovery: rec, recWrap: await V.seal(await V.fromRecovery(rec), dk) };
  };

  /* ---------- device key: lets a trusted device reopen a profile without typing the password ---------- */
  /** A key the browser keeps but can never reveal (non-extractable), so it cannot be copied out of storage. */
  V.newDeviceKey = () => subtle().generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  V.sealWithKey = async (key, text) => {
    const iv = V.random(12), ct = await subtle().encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
    return `v1.${b64(iv)}.${b64(ct)}`;
  };
  V.openWithKey = async (key, sealed) => {
    const [v, iv, ct] = String(sealed).split('.');
    if (v !== 'v1' || !iv || !ct) throw new Error('BAD_FORMAT');
    try { return dec.decode(await subtle().decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct))); } catch (e) { throw new Error('BAD_KEY'); }
  };

  /** Rough 0 to 4 guide for the sign-up form. Not a security boundary. */
  V.strength = password => {
    const p = String(password || '');
    if (p.length < 8) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[a-z؀-ۿ]/.test(p) && /[A-Z0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p) || (/\d/.test(p) && /[A-Za-z؀-ۿ]/.test(p) && p.length >= 10)) s++;
    if (/^(.)\1+$/.test(p) || /^(password|12345678|qwertyui|trainbook|11111111)/i.test(p)) s = Math.min(s, 1);
    return Math.min(4, s);
  };

  return V;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Vault;
