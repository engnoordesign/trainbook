'use strict';
/* Settings -> "Profile and security": sync status, sign out, switch profile, rename, change password, new recovery key,
   auto-lock, stay signed in, delete profile. The crypto, storage and sync live in auth.js / sync.js; this is only the UI. */
(() => {
  const A = window.Account = {};
  const t = (k, v) => I18N.t(k, v), esc = s => UI.esc(s), ic = (n, s, c) => UI.ic(n, s, c);
  const AUTO = [0, 5, 15, 30, 60];
  let keyText = '', keyTitle = '';

  const ago = ts => {
    if (!ts) return '';
    const s = Math.round((Date.now() - ts) / 1000), rtf = new Intl.RelativeTimeFormat(UI.loc(), { numeric: 'auto' });
    if (s < 45) return rtf.format(0, 'second');
    if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), 'minute');
    if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
    return rtf.format(-Math.round(s / 86400), 'day');
  };

  /* ---------- sync line inside the account card ---------- */
  function syncHtml(p) {
    if (Auth.isSynced(p)) {
      const st = Sync.status.state, kind = st === 'off' ? 'syncing' : st;
      const text = kind === 'synced' ? t('sy.st.synced', { ago: ago((p.sync && p.sync.at) || 0) }) : t('sy.st.' + kind);
      return '<div class="sync-row"><span class="sync-dot st-' + kind + '"></span><span class="sync-tx">' + esc(text) + '</span>' +
        '<button type="button" class="btn sm" data-act="syncNow"' + (kind === 'syncing' ? ' disabled' : '') + '>' + ic('refresh', 15) + esc(t('sy.now')) + '</button></div>' +
        (kind === 'auth' ? '<p class="muted sm">' + esc(t('sy.passwordChanged')) + '</p>' : '') +
        '<p class="muted sm">' + esc(t('sy.globalNote')) + '</p>';
    }
    const info = Sync.infoCached();
    if (info && info.available && info.signup !== 'closed') {
      return '<div class="sync-row"><span class="sync-dot st-off"></span><span class="sync-tx">' + esc(t('sy.deviceOnlyStatus')) + '</span>' +
        '<button type="button" class="btn sm primary" data-act="acctSyncOn">' + ic('globe', 15) + esc(t('sy.turnOn')) + '</button></div>';
    }
    return '<div class="sync-row"><span class="sync-dot st-off"></span><span class="sync-tx">' + esc(info && info.available ? t('sy.deviceOnlyClosed') : t(info ? 'sy.deviceOnlyNoServer' : 'sy.deviceOnlyStatus')) + '</span></div>';
  }

  /* ---------- the section inside the settings sheet ---------- */
  A.settingsHtml = () => {
    const p = Auth.profile(); if (!p) return '';
    const seg = AUTO.map(m => '<button type="button" class="' + (p.autoLock === m ? 'on' : '') + '" data-act="acctAuto" data-v="' + m + '">' + esc(m ? t('au.min', { n: m }) : t('au.off')) + '</button>').join('');
    return '<div class="fld acct"><span>' + ic('user', 16) + esc(t('au.account')) + '</span>' +
      '<div class="acct-card">' + Auth.avatar(p, 48) + '<div class="acct-tx"><b>' + esc(p.name) + '</b><small>' + Auth.at(p.username) + '</small></div></div>' +
      syncHtml(p) +
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
  A.syncNow = () => { Sync.now(); UI.refreshSettings(); };

  /* ---------- dialogs ---------- */
  const form = (title, sub, fields, submitLabel, name, danger) =>
    UI.sheetHead(title, sub) + '<form class="sheet-form" data-submit="' + name + '" novalidate><div class="sheet-b">' + fields +
    '<div class="form-error" role="alert" hidden></div></div><div class="sheet-f"><button type="button" class="btn" data-act="closeSheet">' + esc(t('a.cancel')) + '</button>' +
    '<button type="submit" class="btn ' + (danger ? 'danger' : 'primary') + ' grow">' + esc(submitLabel) + '</button></div></form>';
  const pw = (id, name, label, auto, focus) => '<div class="fld"><label for="' + id + '">' + esc(label) + '</label>' + Auth.pwField(id, name, auto, focus, 'data-act="peek"') + '</div>';

  A.openPassword = () => UI.openSheet(form(t('au.changePass'), Auth.isSynced() ? t('sy.passOnline') : '',
    pw('ac-cur', 'current', t('au.current'), 'current-password', true) + pw('ac-new', 'password', t('au.newPass'), 'new-password') + pw('ac-new2', 'password2', t('au.confirm'), 'new-password'),
    t('a.save'), 'acctPass'), { label: t('au.changePass') });

  A.openKey = () => { keyTitle = t('au.keyTitle'); UI.openSheet(form(t('au.newRecovery'), t('au.newRecoveryDesc'),
    pw('ac-cur', 'current', t('au.current'), 'current-password', true), t('au.makeKey'), 'acctKey'), { label: t('au.newRecovery'), onClose: A.clearKey }); };

  A.openRename = () => {
    const p = Auth.profile(); if (!p) return;
    UI.openSheet(form(t('au.rename'), '', '<div class="fld"><label for="ac-name">' + esc(t('au.nameLabel')) + '</label><input type="text" id="ac-name" name="name" maxlength="40" autocomplete="name" value="' + esc(p.name) + '" autofocus></div>',
      t('a.save'), 'acctRename'), { label: t('au.rename'), cls: 'sm' });
  };

  A.openDelete = () => UI.openSheet(form(t('au.deleteProfile'), '', '<p>' + esc(t('au.deleteMsg')) + '</p>' +
    (Auth.isSynced() ? '<label class="check"><input type="checkbox" name="alsoServer"><span>' + esc(t('sy.alsoServer')) + '</span></label><p class="muted sm">' + esc(t('sy.alsoServerNote')) + '</p>' : '') +
    pw('ac-cur', 'current', t('au.current'), 'current-password', true),
    t('au.deleteProfile'), 'acctDelete', true), { label: t('au.deleteProfile'), cls: 'sm' });

  A.openSyncOn = () => {
    const info = Sync.infoCached() || {};
    keyTitle = t('sy.keyTitleNew');
    UI.openSheet(form(t('sy.turnOnTitle'), t('sy.turnOnSub'),
      '<p>' + esc(t('sy.turnOnDesc')) + '</p>' +
      (info.signup === 'invite' ? '<div class="fld"><label for="ac-inv">' + esc(t('sy.inviteCode')) + '</label><input type="text" id="ac-inv" name="invite" autocomplete="off" autocapitalize="off" spellcheck="false"></div>' : '') +
      pw('ac-cur', 'current', t('au.current'), 'current-password', true),
      t('sy.turnOn'), 'acctSync'), { label: t('sy.turnOnTitle'), onClose: A.clearKey });
  };

  const keyHtml = () => UI.sheetHead(keyTitle || t('au.keyTitle')) + '<div class="sheet-b"><div class="keyscreen flat">' + ic('key', 28) + '<p class="sub">' + esc(t('au.keySub')) + '</p>' +
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
    if (name === 'acctSync') return Auth.work(f, async () => {
      keyText = await Auth.enableSync(d.current.value, d.invite ? d.invite.value.trim() : '');
      UI.setSheet(keyHtml());
    });
    if (name === 'acctRename') return Auth.work(f, async () => {
      Auth.rename(d.name.value); UI.closeSheet(); UI.toast(t('au.renamed'));
    });
    if (name === 'acctDelete') return Auth.work(f, async () => {
      await Auth.removeProfile(d.current.value, !!(d.alsoServer && d.alsoServer.checked)); UI.toast(t('au.deleted'));
    });
  };
  /* the recovery key is only needed while its sheet is open */
  A.clearKey = () => { keyText = ''; };
})();
