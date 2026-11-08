'use strict';
/* Settings -> "Profile and security": sign out, switch profile, rename, change password, new recovery key,
   auto-lock, stay signed in, delete profile. The crypto and storage live in auth.js; this is only the UI. */
(() => {
  const A = window.Account = {};
  const t = (k, v) => I18N.t(k, v), esc = s => UI.esc(s), ic = (n, s, c) => UI.ic(n, s, c);
  const AUTO = [0, 5, 15, 30, 60];
  let keyText = '';

  /* ---------- the section inside the settings sheet ---------- */
  A.settingsHtml = () => {
    const p = Auth.profile(); if (!p) return '';
    const seg = AUTO.map(m => '<button type="button" class="' + (p.autoLock === m ? 'on' : '') + '" data-act="acctAuto" data-v="' + m + '">' + esc(m ? t('au.min', { n: m }) : t('au.off')) + '</button>').join('');
    return '<div class="fld acct"><span>' + ic('user', 16) + esc(t('au.account')) + '</span>' +
      '<div class="acct-card">' + Auth.avatar(p, 48) + '<div class="acct-tx"><b>' + esc(p.name) + '</b><small>' + Auth.at(p.username) + '</small></div></div>' +
      '<div class="row-btns">' +
        '<button type="button" class="btn" data-act="acctLock">' + ic('logout', 18) + esc(t('au.signOut')) + '</button>' +
        '<button type="button" class="btn" data-act="acctSwitch">' + ic('users', 18) + esc(t('au.switch')) + '</button></div>' +
      '<div class="row-btns">' +
        '<button type="button" class="btn" data-act="acctRename">' + ic('pencil', 16) + esc(t('au.rename')) + '</button>' +
        '<button type="button" class="btn" data-act="acctPass">' + ic('lock', 16) + esc(t('au.changePass')) + '</button>' +
        '<button type="button" class="btn" data-act="acctKey">' + ic('key', 16) + esc(t('au.newRecovery')) + '</button></div>' +
      '<div class="fld"><span>' + esc(t('au.autoLock')) + '</span><div class="seg sm' + (p.remember ? ' dim' : '') + '">' + seg + '</div>' +
        (p.remember ? '<p class="muted sm">' + esc(t('au.autoLockNote')) + '</p>' : '') + '</div>' +
      (Auth.canRemember() ? '<button type="button" class="switch-row" role="switch" aria-checked="' + !!p.remember + '" data-act="acctStay"><span>' + esc(t('au.stay')) + '</span><i class="sw' + (p.remember ? ' on' : '') + '"></i></button>' +
        '<p class="muted sm">' + esc(t('au.stayDesc')) + '</p>' : '') +
      '</div>';
  };
  A.dangerHtml = () => Auth.profile()
    ? '<div class="fld"><span>' + ic('trash', 16) + esc(t('set.danger')) + '</span><div class="row-btns"><button type="button" class="btn danger-ghost" data-act="acctDelete">' + esc(t('au.deleteProfile')) + '</button></div></div>' : '';

  /* ---------- simple actions ---------- */
  A.lock = () => { UI.closeSheet(true); Auth.lock(); };
  A.switchProfile = () => { UI.closeSheet(true); Auth.switchProfile(); };
  A.setAuto = m => { Auth.setAutoLock(+m); UI.refreshSettings(); };
  A.toggleStay = async () => {
    const p = Auth.profile(); if (!p) return;
    try { if (p.remember) Auth.forget(p); else await Auth.remember(); } catch (e) { UI.toast(t('au.errRemember')); }
    UI.refreshSettings();
  };

  /* ---------- dialogs ---------- */
  const form = (title, sub, fields, submitLabel, name, danger) =>
    UI.sheetHead(title, sub) + '<form class="sheet-form" data-submit="' + name + '" novalidate><div class="sheet-b">' + fields +
    '<div class="form-error" role="alert" hidden></div></div><div class="sheet-f"><button type="button" class="btn" data-act="closeSheet">' + esc(t('a.cancel')) + '</button>' +
    '<button type="submit" class="btn ' + (danger ? 'danger' : 'primary') + ' grow">' + esc(submitLabel) + '</button></div></form>';
  const pw = (id, name, label, auto, focus) => '<div class="fld"><label for="' + id + '">' + esc(label) + '</label>' + Auth.pwField(id, name, auto, focus, 'data-act="peek"') + '</div>';

  A.openPassword = () => UI.openSheet(form(t('au.changePass'), '',
    pw('ac-cur', 'current', t('au.current'), 'current-password', true) + pw('ac-new', 'password', t('au.newPass'), 'new-password') + pw('ac-new2', 'password2', t('au.confirm'), 'new-password'),
    t('a.save'), 'acctPass'), { label: t('au.changePass') });

  A.openKey = () => UI.openSheet(form(t('au.newRecovery'), t('au.newRecoveryDesc'),
    pw('ac-cur', 'current', t('au.current'), 'current-password', true), t('au.makeKey'), 'acctKey'), { label: t('au.newRecovery'), onClose: A.clearKey });

  A.openRename = () => {
    const p = Auth.profile(); if (!p) return;
    UI.openSheet(form(t('au.rename'), '', '<div class="fld"><label for="ac-name">' + esc(t('au.nameLabel')) + '</label><input type="text" id="ac-name" name="name" maxlength="40" autocomplete="name" value="' + esc(p.name) + '" autofocus></div>',
      t('a.save'), 'acctRename'), { label: t('au.rename'), cls: 'sm' });
  };

  A.openDelete = () => UI.openSheet(form(t('au.deleteProfile'), '', '<p>' + esc(t('au.deleteMsg')) + '</p>' + pw('ac-cur', 'current', t('au.current'), 'current-password', true),
    t('au.deleteProfile'), 'acctDelete', true), { label: t('au.deleteProfile'), cls: 'sm' });

  const keyHtml = () => UI.sheetHead(t('au.keyTitle')) + '<div class="sheet-b"><div class="keyscreen flat">' + ic('key', 28) + '<p class="sub">' + esc(t('au.keySub')) + '</p>' +
    '<div class="keybox" id="ac-key" dir="ltr">' + esc(keyText) + '</div>' +
    '<div class="key-actions"><button type="button" class="btn" data-act="acctCopyKey">' + ic('copy', 16) + esc(t('au.copy')) + '</button><button type="button" class="btn" data-act="acctSaveKey">' + ic('download', 16) + esc(t('au.saveFile')) + '</button></div>' +
    '<p class="muted sm">' + esc(t('au.oldKeyDead')) + '</p></div></div>' +
    '<div class="sheet-f"><button type="button" class="btn primary grow" data-act="closeSheet">' + esc(t('a.done')) + '</button></div>';
  A.copyKey = () => Auth.copyKey(keyText, document.getElementById('ac-key'));
  A.saveKey = () => { const p = Auth.profile(); if (p) Auth.saveKeyFile(p.username, keyText); };

  /* ---------- form submits ---------- */
  A.submit = (name, f) => {
    const d = f.elements, bad = Auth.UserError;
    if (name === 'acctPass') return Auth.work(f, async () => {
      if (d.password.value !== d.password2.value) throw new bad(t('au.errMismatch'));
      await Auth.changePassword(d.current.value, d.password.value);
      UI.closeSheet(); UI.toast(t('au.passChanged'));
    });
    if (name === 'acctKey') return Auth.work(f, async () => {
      keyText = await Auth.newRecoveryKey(d.current.value);
      UI.setSheet(keyHtml());
    });
    if (name === 'acctRename') return Auth.work(f, async () => {
      Auth.rename(d.name.value); UI.closeSheet(); UI.toast(t('au.renamed'));
    });
    if (name === 'acctDelete') return Auth.work(f, async () => {
      await Auth.removeProfile(d.current.value); UI.toast(t('au.deleted'));
    });
  };
  /* the recovery key is only needed while its sheet is open */
  A.clearKey = () => { keyText = ''; };
})();
