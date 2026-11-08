#!/usr/bin/env node
/* Tests for public/js/vault.js (password encryption). Uses Node's built-in WebCrypto:  node scripts/vault-test.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'vault.js'), 'utf8');
const sandbox = { globalThis: null, TextEncoder, TextDecoder, atob, btoa, Uint8Array, String, Error, Promise, console };
sandbox.globalThis = Object.assign(sandbox, { crypto: require('node:crypto').webcrypto });
vm.createContext(sandbox);
const Vault = vm.runInContext(src + '\n;Vault', sandbox);

let pass = 0, failed = 0;
const ok = (cond, label) => { if (cond) { pass++; } else { failed++; console.error('  ✗', label); } };
const rejects = async (fn, label, code) => { try { await fn(); ok(false, label + ' (should have thrown)'); } catch (e) { ok(!code || e.message === code, label + ' (got ' + e.message + ')'); } };
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const SECRET = /^[A-Za-z0-9_-]{43}$/;

(async () => {
  console.log('Vault tests (PBKDF2 ' + Vault.ITER + ' rounds, a few seconds)');

  /* seal / open */
  const key = Vault.random(32), data = JSON.stringify({ plan: [1, 2, 3], note: 'دفتر التمرين 💪' });
  const sealed = await Vault.seal(key, data);
  ok(/^v1\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/.test(sealed), 'sealed format');
  ok((await Vault.open(key, sealed)) === data, 'seal/open round trip incl. Arabic + emoji');
  ok(sealed !== (await Vault.seal(key, data)), 'a fresh random IV every time');
  await rejects(() => Vault.open(Vault.random(32), sealed), 'wrong key rejected', 'BAD_KEY');
  const parts = sealed.split('.'); const tampered = parts[0] + '.' + parts[1] + '.' + (parts[2][0] === 'A' ? 'B' : 'A') + parts[2].slice(1);
  await rejects(() => Vault.open(key, tampered), 'tampered ciphertext rejected', 'BAD_KEY');
  await rejects(() => Vault.open(key, 'garbage'), 'bad format rejected', 'BAD_FORMAT');

  /* account: password + recovery */
  const acct = await Vault.createAccount('correct horse battery');
  ok(acct.dk.length === 32 && acct.recovery.length === 16, 'account key sizes');
  const profile = { salt: acct.salt, iter: acct.iter, pwWrap: acct.pwWrap };
  const u1 = await Vault.unlock('correct horse battery', profile);
  ok(same(u1.dk, acct.dk), 'right password opens the data key');
  await rejects(() => Vault.unlock('wrong password', profile), 'wrong password rejected', 'BAD_KEY');
  await rejects(() => Vault.unlock('correct horse battery ', profile), 'trailing space is a different password', 'BAD_KEY');
  /* the same password typed with different Unicode forms must still work (NFKC normalisation) */
  const uni = await Vault.createAccount('pässwörd-2026');
  ok(same((await Vault.unlock('pässwörd-2026', { salt: uni.salt, iter: uni.iter, pwWrap: uni.pwWrap })).dk, uni.dk), 'Unicode-normalised passwords match');

  const text = Vault.formatRecovery(acct.recovery);
  ok(/^([0-9A-Z]{4}-){6}[0-9A-Z]{2}$/.test(text), 'recovery key looks like ABCD-EFGH-... (' + text + ')');
  ok(same(Vault.parseRecovery(text), acct.recovery), 'recovery key parses back');
  ok(same(Vault.parseRecovery(text.toLowerCase().replace(/-/g, ' ')), acct.recovery), 'recovery key: lower case + spaces accepted');
  ok(Vault.parseRecovery(text.slice(0, -2)) === null, 'short recovery key rejected');
  ok(Vault.parseRecovery('!!!') === null, 'junk recovery key rejected');
  const ur = await Vault.unlockWithRecovery(Vault.parseRecovery(text), acct.recWrap);
  ok(same(ur.dk, acct.dk), 'recovery key opens the same data key');
  await rejects(() => Vault.unlockWithRecovery(Vault.random(16), acct.recWrap), 'wrong recovery key rejected', 'BAD_KEY');

  /* login secrets (what the sync server checks) */
  ok(SECRET.test(acct.auth) && SECRET.test(acct.recAuth), 'login secrets are 43-char base64url');
  ok(acct.auth === u1.auth && acct.recAuth === ur.recAuth, 'the same secrets come back when unlocking later (so any device can sign in)');
  ok(acct.auth !== acct.recAuth, 'password secret and recovery secret differ');
  ok((await Vault.deriveAuth('correct horse battery', acct.salt, acct.iter)) === acct.auth, 'deriveAuth (sign-in from another device) matches');
  ok((await Vault.deriveAuth('wrong password', acct.salt, acct.iter)) !== acct.auth, 'a wrong password derives a different secret');
  ok(!acct.auth.includes('correct') && acct.auth !== Vault.b64url(acct.dk), 'the secret is not the password and not the data key');
  const acct2 = await Vault.createAccount('correct horse battery');
  ok(acct2.auth !== acct.auth, 'same password, different account -> different secret (random salt)');

  /* change password keeps data + recovery working */
  const re = await Vault.rewrap('new password 123', acct.dk);
  const u2 = await Vault.unlock('new password 123', re);
  ok(same(u2.dk, acct.dk), 'new password opens the same data key');
  ok(re.auth === u2.auth && re.auth !== acct.auth, 'password change gives a new login secret');
  await rejects(() => Vault.unlock('correct horse battery', re), 'old password no longer works', 'BAD_KEY');
  ok(re.salt !== acct.salt, 'fresh salt on password change');
  ok(same((await Vault.unlockWithRecovery(Vault.parseRecovery(text), acct.recWrap)).dk, acct.dk), 'recovery key still works after a password change');

  /* new recovery key replaces the old one */
  const nr = await Vault.newRecovery(acct.dk);
  const unr = await Vault.unlockWithRecovery(nr.recovery, nr.recWrap);
  ok(same(unr.dk, acct.dk) && unr.recAuth === nr.recAuth && nr.recAuth !== acct.recAuth, 'new recovery key opens the data key and has its own secret');
  await rejects(() => Vault.unlockWithRecovery(acct.recovery, nr.recWrap), 'old recovery key does not open the new wrap', 'BAD_KEY');

  /* the data is really unreadable without the password: whole profile round trip */
  const blob = await Vault.seal(acct.dk, JSON.stringify({ secret: 'plan' }));
  ok(!blob.includes('plan') && !Buffer.from(blob.split('.')[2], 'base64').toString('latin1').includes('secret'), 'ciphertext does not contain the plaintext');
  ok(JSON.parse(await Vault.open(u2.dk, blob)).secret === 'plan', 'data decrypts after password change');

  /* device key (non-extractable) */
  const dev = await Vault.newDeviceKey();
  const dsealed = await Vault.sealWithKey(dev, 'hello');
  ok((await Vault.openWithKey(dev, dsealed)) === 'hello', 'device key round trip');
  await rejects(async () => Vault.openWithKey(await Vault.newDeviceKey(), dsealed), 'other device key rejected', 'BAD_KEY');
  let extractable = true; try { await sandbox.crypto.subtle.exportKey('raw', dev); } catch (e) { extractable = false; }
  ok(!extractable, 'device key cannot be exported');

  /* strength meter */
  ok(Vault.strength('short') === 0, 'strength: too short = 0');
  ok(Vault.strength('password') <= 1 && Vault.strength('trainbook1') <= 1, 'strength: common words capped');
  ok(Vault.strength('Tr4in-hard-every-d@y') === 4, 'strength: long mixed = 4');
  ok(Vault.strength('كلمة-سر-قوية-2026!') >= 3, 'strength: Arabic password counts');

  console.log(`passed ${pass}, failed ${failed}`);
  process.exit(failed ? 1 : 0);
})();
