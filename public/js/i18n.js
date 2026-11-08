/* English + Arabic (RTL) strings. */
(function () {
  'use strict';

  var en = {
    'a.close': 'Close', 'a.cancel': 'Cancel', 'a.ok': 'OK', 'a.decrease': 'Decrease', 'a.increase': 'Increase',
    'a.remove': 'Remove', 'a.addExercise': 'Add exercise', 'a.details': 'Details', 'a.edit': 'Edit',
    'a.prev': 'Previous month', 'a.next': 'Next month', 'a.delete': 'Delete', 'a.save': 'Save', 'a.add': 'Add', 'a.done': 'Done',

    'nav.today': 'Today', 'nav.course': 'My Course', 'nav.train': 'Train', 'nav.courses': 'Courses', 'nav.history': 'History',

    'u.sec': 'sec', 'u.secShort': 's', 'u.minShort': 'm', 'u.reps': 'reps', 'u.sets': 'sets',

    'cat.title': 'Category', 'cat.all': 'All', 'cat.chest': 'Chest', 'cat.legs': 'Legs', 'cat.back': 'Back',
    'cat.arms': 'Arms', 'cat.core': 'Core', 'cat.full': 'Full body',

    'st.done': 'Done', 'st.missed': 'Missed', 'st.partial': 'Partial',
    'got.sets': 'Sets completed', 'got.reps': 'Completed',

    'today.title': "Today's training", 'today.superTitle': 'Super Training Day!',
    'today.rest': 'Rest day', 'today.restSub': 'Nothing scheduled today.',
    'today.allDone': 'All done - great work!', 'today.allDoneSub': 'Rest up and refuel.',
    'today.progress': '{done} of {n} done', 'today.partialN': '{n} partial',
    'today.emptyHint': 'Add an exercise or start a premade course and it will show up here every day.',
    'today.browse': 'Browse courses',

    'super.badge': 'Super Day', 'super.title': 'Super Training Day',
    'super.sub': 'Turn the whole app red on your biggest day',
    'super.desc': 'On a Super Day the whole app turns red to fire you up. Pick the days you want to give everything.',
    'super.makeToday': 'Make today a Super Day', 'super.viaWeekday': 'Today is already a Super Day because of your weekly setting.',
    'super.repeat': 'Repeat every week on', 'super.pick': 'Or pick a specific date', 'super.upcoming': 'Upcoming Super Days',
    'super.every': 'Every', 'super.dates': '{n} upcoming', 'super.none': 'Not set - tap to choose',

    'mc.title': 'My Course', 'mc.week': 'My week', 'mc.today': 'Today', 'mc.rest': 'Rest',

    'c.title': 'Premade Courses', 'c.active': 'Active', 'c.completed': 'Completed',
    'c.finishedSub': 'You finished this course. Restart it or choose a new one.',
    'c.weekOf': 'Week {n} of {total}', 'c.daysLeft': '{n} days left', 'c.restart': 'Restart', 'c.stop': 'Stop course',
    'c.none': 'No active course', 'c.noneSub': 'Pick a premade course and it fills your week automatically.', 'c.browse': 'Browse courses',
    'c.weeks': '{n} weeks', 'c.perWeek': '{n} days / week',
    'c.disclaimer': 'Programs are original and inspired by the methods or athletes named. They are not official programs and are not endorsed by anyone named. Train within your limits.',
    'c.progNote': 'Reps and hold times increase a little every week automatically.',
    'c.pickDays': 'Pick {n} training days', 'c.start': 'Start this course',
    'c.tooMany': 'You can only pick {n} days. Tap a selected day to remove it.',
    'c.started': 'Course started - find it in My Course',
    'c.replaceTitle': 'Replace your current course?',
    'c.replaceMsg': 'Your current course exercises will be removed from My Course. Your history is kept and your own exercises stay.',
    'c.stopTitle': 'Stop this course?', 'c.stopMsg': 'Its exercises will be removed from My Course. History is kept.', 'c.stopped': 'Course stopped',
    'ck.course': 'Courses', 'ck.monthly': 'Monthly', 'ck.calisthenics': 'Calisthenics',
    'ck.courseDesc': 'Focused programs by goal or body part.',
    'ck.monthlyDesc': '30-day plans that get harder every week.',
    'ck.calisthenicsDesc': 'Skill programs: handstand, planche, front lever, muscle-up and more.',
    'lv.1': 'Beginner', 'lv.2': 'Intermediate', 'lv.3': 'Advanced',

    'hs.rest': 'Rest', 'hs.done': 'Done', 'hs.partial': 'Partial', 'hs.missed': 'Missed', 'hs.pending': 'In progress',
    'hs.streak': 'Day streak', 'hs.doneDays': 'Perfect days', 'hs.completion': 'Last 30 days',
    'hs.noPlan': 'Rest day - nothing planned.', 'hs.noData': 'No exercises were scheduled this day.',

    'tm.stopwatch': 'Stopwatch', 'tm.timer': 'Timer', 'tm.intervals': 'Intervals', 'tm.sound': 'Sound', 'tm.reset': 'Reset',
    'tm.lap': 'Lap', 'tm.pause': 'Pause', 'tm.start': 'Start', 'tm.lapN': 'Lap {n}', 'tm.presetHint': 'Tap a time to start instantly',
    'tm.timesUp': "Time's up!", 'tm.running': 'Running', 'tm.paused': 'Ready', 'tm.round': 'Round {n} / {total}',
    'tm.totalTime': 'Total time', 'tm.ph.ready': 'Get ready', 'tm.ph.work': 'WORK', 'tm.ph.rest': 'REST', 'tm.ph.done': 'Done!',
    'tm.work': 'Work', 'tm.rest': 'Rest', 'tm.rounds': 'Rounds', 'tm.checklist': "Today's checklist",
    'tm.noItems': 'Nothing planned today. Add an exercise to check it off here.',

    'f.addTitle': 'Add exercise', 'f.editTitle': 'Edit exercise', 'f.addSub': 'Add it to today or repeat it every week',
    'f.planSub': 'Repeats every week on the days you pick', 'f.name': 'Exercise name', 'f.namePh': 'e.g. Push-ups',
    'f.countBy': 'Count by', 'f.byReps': 'Repetitions', 'f.bySec': 'Seconds', 'f.reps': 'Repetitions', 'f.seconds': 'Seconds',
    'f.sets': 'Sets', 'f.when': 'When', 'f.todayOnly': 'Today only', 'f.repeat': 'Repeat weekly', 'f.days': 'Days',
    'f.pickDay': 'Pick at least one day', 'f.saved': 'Saved', 'f.deleteTitle': 'Delete this exercise?',
    'f.deleteMsg': 'It will be removed from your weekly plan. Past history stays.', 'f.deleted': 'Deleted',

    'set.title': 'Settings', 'set.language': 'Language', 'set.theme': 'Appearance', 'set.auto': 'Auto', 'set.light': 'Light',
    'set.dark': 'Dark', 'set.weekStart': 'Week starts on', 'set.install': 'Install app',
    'set.installed': "Installed - you're using the app version.",
    'set.installDesc': 'Install TrainBook for one-tap access and offline use.', 'set.installBtn': 'Install',
    'set.installIOS': 'On iPhone / iPad: tap Share, then “Add to Home Screen”.',
    'set.installOther': 'Use your browser menu: “Install app” or “Add to Home screen”.',
    'set.backup': 'Backup', 'set.backupDesc': 'Your data is stored encrypted on this device only. Export a file to keep it safe or move it to another device. Exported files are not encrypted, so keep them private.',
    'set.export': 'Export', 'set.import': 'Import', 'set.update': 'Updates', 'set.checkUpdate': 'Check for updates',
    'set.danger': 'Danger zone',
    'set.local': 'Data stays on your device', 'set.installedToast': 'App installed', 'set.imported': 'Backup restored',
    'set.importFail': "That file isn't a valid backup",

    'upd.ready': 'A new version is ready', 'upd.reload': 'Update', 'upd.na': 'Updates work when the app is served over the web',
    'upd.downloading': 'Downloading the update...', 'upd.latest': "You're on the latest version",

    'rm.title': 'Remove from today?', 'rm.msg': "This exercise will be removed from today's list only.",

    'qr.open': 'Get the app on your phone', 'qr.openDesc': 'Scan a QR code to open TrainBook on your phone and install it.',
    'qr.show': 'Show QR code', 'qr.title': 'Install on your phone', 'qr.sub': 'Scan, open, install',
    'qr.scan': 'Scan this code with your phone camera', 'qr.link': 'App address',
    'qr.localWarn': "This address only works on this computer. Open the hosted version (or use this PC's network address, like http://192.168.1.20:8080) to get a code that works on your phone.",
    'qr.httpNote': 'Signing in needs encryption, which browsers only allow on https:// addresses, and phones only offer “Install app” there too. Use your https:// address (Cloudflare gives you one).',
    'qr.invalid': 'Enter a valid web address starting with http:// or https://',
    'qr.how': 'How to install',
    'qr.stepAndroid': 'Android (Chrome): open the link, then menu ⋮ → “Install app”.',
    'qr.stepIOS': 'iPhone / iPad (Safari): open the link, tap Share → “Add to Home Screen”.',
    'qr.copy': 'Copy link', 'qr.copied': 'Link copied', 'qr.save': 'Save QR image', 'qr.saved': 'QR image saved', 'qr.share': 'Share',
    'qr.shareText': 'TrainBook - bodyweight training notebook',

    'au.pickTitle': 'Who is training?', 'au.pickSub': 'Choose a profile to unlock it. Each profile has its own password and its own data.',
    'au.add': 'Add profile', 'au.signedIn': 'Signed in', 'au.password': 'Password', 'au.unlock': 'Unlock',
    'au.forgot': 'Forgot password?', 'au.switch': 'Switch profile', 'au.keepSigned': 'Keep me signed in on this device',
    'au.createTitleFirst': 'Create your profile', 'au.createTitle': 'Add a profile',
    'au.createSub': 'Your profile has its own password. Everything is encrypted in this browser.',
    'au.createSubMore': 'A new profile starts empty and has its own password.',
    'au.adopt': 'Keep the training data already on this device in this profile (plan: {n}, days logged: {d}).',
    'au.name': 'Your name', 'au.username': 'Username', 'au.confirm': 'Confirm password',
    'au.noOne': 'Nobody can read your data without the password. You will get a recovery key on the next screen.',
    'au.createBtn': 'Create profile', 'au.back': 'Back',
    'au.s0': 'At least 8 characters', 'au.s1': 'Weak', 'au.s2': 'Fair', 'au.s3': 'Good', 'au.s4': 'Strong',
    'au.keyTitle': 'Save your recovery key',
    'au.keySub': 'If you forget your password, this key is the only way back into your data. Write it down or save it somewhere safe. It is shown only once.',
    'au.copy': 'Copy', 'au.saveFile': 'Save as file', 'au.copied': 'Copied.', 'au.selectCopy': 'Select the key and copy it.',
    'au.savedKey': 'I have saved my recovery key', 'au.continue': 'Continue',
    'au.resetTitle': 'Reset your password', 'au.resetSub': 'Enter the recovery key you saved when you created {user}, then choose a new password.',
    'au.recKey': 'Recovery key', 'au.newPass': 'New password', 'au.resetBtn': 'Reset password',
    'au.noCrypto': 'Encryption is not available here',
    'au.noCryptoSub': 'Your browser only turns on encryption for secure pages. Open TrainBook from an https:// address or from http://localhost.',
    'au.peek': 'Show or hide the password', 'au.working': 'Working…',
    'au.errPassLen': 'Use at least 8 characters for the password.',
    'au.errUser': 'Usernames are 3 to 32 letters, numbers, dots, dashes or underscores.',
    'au.errUserTaken': 'That username is already used on this device.', 'au.errWrong': 'Wrong password.',
    'au.errMismatch': 'The two passwords do not match.', 'au.errWait': 'Too many tries. Wait {n} seconds.',
    'au.errData': "This profile's data could not be read.",
    'au.errRecFmt': 'A recovery key has 26 letters and numbers. Check it and try again.',
    'au.errRecMatch': 'That recovery key does not match this profile.', 'au.errCurrent': 'The current password is wrong.',
    'au.errGeneric': 'Something went wrong. Please try again.',
    'au.errRemember': 'This browser could not keep you signed in. You will be asked for the password next time.',
    'au.account': 'Profile and security', 'au.signOut': 'Sign out', 'au.rename': 'Rename', 'au.nameLabel': 'Display name',
    'au.changePass': 'Change password', 'au.current': 'Current password', 'au.passChanged': 'Password changed', 'au.renamed': 'Name saved',
    'au.newRecovery': 'New recovery key', 'au.newRecoveryDesc': 'Enter your password to create a new recovery key. The old one stops working.',
    'au.makeKey': 'Create key', 'au.oldKeyDead': 'Your previous recovery key no longer works.',
    'au.autoLock': 'Auto-lock', 'au.off': 'Off', 'au.min': '{n} min', 'au.autoLockNote': 'Auto-lock is paused while “Stay signed in” is on.',
    'au.stay': 'Stay signed in on this device',
    'au.stayDesc': 'Opens straight to your data without a password. Anyone who can open TrainBook on this device can see it, so leave it off on shared computers.',
    'au.deleteProfile': 'Delete this profile', 'au.deleteMsg': 'This permanently deletes this profile and all its data from this device. Enter the password to confirm.',
    'au.deleted': 'Profile deleted'
  };

  var ar = {
    'a.close': 'إغلاق', 'a.cancel': 'إلغاء', 'a.ok': 'موافق', 'a.decrease': 'إنقاص', 'a.increase': 'زيادة',
    'a.remove': 'إزالة', 'a.addExercise': 'إضافة تمرين', 'a.details': 'التفاصيل', 'a.edit': 'تعديل',
    'a.prev': 'الشهر السابق', 'a.next': 'الشهر التالي', 'a.delete': 'حذف', 'a.save': 'حفظ', 'a.add': 'إضافة', 'a.done': 'تم',

    'nav.today': 'اليوم', 'nav.course': 'كورسي', 'nav.train': 'تمرين', 'nav.courses': 'الكورسات', 'nav.history': 'السجل',

    'u.sec': 'ثانية', 'u.secShort': 'ث', 'u.minShort': 'د', 'u.reps': 'تكرار', 'u.sets': 'مجموعات',

    'cat.title': 'التصنيف', 'cat.all': 'الكل', 'cat.chest': 'الصدر', 'cat.legs': 'الأرجل', 'cat.back': 'الظهر',
    'cat.arms': 'الذراعين', 'cat.core': 'البطن', 'cat.full': 'الجسم كامل',

    'st.done': 'تم', 'st.missed': 'فاتني', 'st.partial': 'جزئيًا',
    'got.sets': 'المجموعات المنجزة', 'got.reps': 'المنجز',

    'today.title': 'تمارين اليوم', 'today.superTitle': 'يوم التدريب الخارق!',
    'today.rest': 'يوم راحة', 'today.restSub': 'لا توجد تمارين مجدولة اليوم.',
    'today.allDone': 'أنجزت كل شيء — عمل رائع!', 'today.allDoneSub': 'استرح وتغذَّ جيدًا.',
    'today.progress': '{done} من {n} مكتمل', 'today.partialN': '{n} جزئي',
    'today.emptyHint': 'أضف تمرينًا أو ابدأ كورسًا جاهزًا وسيظهر هنا كل يوم.',
    'today.browse': 'تصفّح الكورسات',

    'super.badge': 'يوم خارق', 'super.title': 'يوم التدريب الخارق',
    'super.sub': 'حوّل التطبيق كله إلى الأحمر في يومك الأقوى',
    'super.desc': 'في اليوم الخارق يتحول التطبيق بالكامل إلى اللون الأحمر ليشعل حماسك. اختر الأيام التي تريد أن تعطي فيها كل شيء.',
    'super.makeToday': 'اجعل اليوم يومًا خارقًا', 'super.viaWeekday': 'اليوم خارق بالفعل بسبب إعدادك الأسبوعي.',
    'super.repeat': 'كرّره كل أسبوع في', 'super.pick': 'أو اختر تاريخًا محددًا', 'super.upcoming': 'الأيام الخارقة القادمة',
    'super.every': 'كل', 'super.dates': '{n} قادمة', 'super.none': 'غير محدد — اضغط للاختيار',

    'mc.title': 'كورسي', 'mc.week': 'أسبوعي', 'mc.today': 'اليوم', 'mc.rest': 'راحة',

    'c.title': 'الكورسات الجاهزة', 'c.active': 'نشط', 'c.completed': 'مكتمل',
    'c.finishedSub': 'أنهيت هذا الكورس. أعد تشغيله أو اختر كورسًا جديدًا.',
    'c.weekOf': 'الأسبوع {n} من {total}', 'c.daysLeft': 'باقي {n} يوم', 'c.restart': 'إعادة البدء', 'c.stop': 'إيقاف الكورس',
    'c.none': 'لا يوجد كورس نشط', 'c.noneSub': 'اختر كورسًا جاهزًا وسيملأ أسبوعك تلقائيًا.', 'c.browse': 'تصفّح الكورسات',
    'c.weeks': '{n} أسابيع', 'c.perWeek': '{n} أيام أسبوعيًا',
    'c.disclaimer': 'البرامج أصلية ومستوحاة من الأساليب أو الرياضيين المذكورين، وليست برامج رسمية ولا يتبناها أحد ممن ذُكروا. تدرّب ضمن قدراتك.',
    'c.progNote': 'تزداد التكرارات وأزمنة الثبات قليلًا كل أسبوع تلقائيًا.',
    'c.pickDays': 'اختر {n} أيام تدريب', 'c.start': 'ابدأ هذا الكورس',
    'c.tooMany': 'يمكنك اختيار {n} أيام فقط. اضغط على يوم محدد لإزالته.',
    'c.started': 'بدأ الكورس — ستجده في «كورسي»',
    'c.replaceTitle': 'استبدال الكورس الحالي؟',
    'c.replaceMsg': 'ستُحذف تمارين الكورس الحالي من «كورسي». يبقى سجلك وتمارينك الخاصة كما هي.',
    'c.stopTitle': 'إيقاف الكورس؟', 'c.stopMsg': 'ستُحذف تمارينه من «كورسي». يبقى سجلك محفوظًا.', 'c.stopped': 'تم إيقاف الكورس',
    'ck.course': 'كورسات', 'ck.monthly': 'خطط شهرية', 'ck.calisthenics': 'كاليسثنكس',
    'ck.courseDesc': 'برامج مركّزة حسب الهدف أو العضلة.',
    'ck.monthlyDesc': 'خطط ٣٠ يومًا تزداد صعوبة كل أسبوع.',
    'ck.calisthenicsDesc': 'برامج المهارات: الوقوف على اليدين، البلانش، الرافعة الأمامية، المسل أب وغيرها.',
    'lv.1': 'مبتدئ', 'lv.2': 'متوسط', 'lv.3': 'متقدم',

    'hs.rest': 'راحة', 'hs.done': 'تم', 'hs.partial': 'جزئي', 'hs.missed': 'فاتني', 'hs.pending': 'قيد التنفيذ',
    'hs.streak': 'أيام متتالية', 'hs.doneDays': 'أيام مكتملة', 'hs.completion': 'آخر ٣٠ يومًا',
    'hs.noPlan': 'يوم راحة — لا شيء مخطط.', 'hs.noData': 'لم تكن هناك تمارين في هذا اليوم.',

    'tm.stopwatch': 'ساعة إيقاف', 'tm.timer': 'مؤقت', 'tm.intervals': 'فواصل', 'tm.sound': 'الصوت', 'tm.reset': 'إعادة ضبط',
    'tm.lap': 'لفة', 'tm.pause': 'إيقاف مؤقت', 'tm.start': 'ابدأ', 'tm.lapN': 'لفة {n}', 'tm.presetHint': 'اضغط على وقت لتبدأ فورًا',
    'tm.timesUp': 'انتهى الوقت!', 'tm.running': 'يعمل', 'tm.paused': 'جاهز', 'tm.round': 'الجولة {n} / {total}',
    'tm.totalTime': 'الزمن الكلي', 'tm.ph.ready': 'استعد', 'tm.ph.work': 'تمرّن', 'tm.ph.rest': 'راحة', 'tm.ph.done': 'انتهى!',
    'tm.work': 'عمل', 'tm.rest': 'راحة', 'tm.rounds': 'الجولات', 'tm.checklist': 'قائمة اليوم',
    'tm.noItems': 'لا توجد تمارين اليوم. أضف تمرينًا لتشطبه من هنا.',

    'f.addTitle': 'إضافة تمرين', 'f.editTitle': 'تعديل التمرين', 'f.addSub': 'أضفه لليوم أو كرّره كل أسبوع',
    'f.planSub': 'يتكرر كل أسبوع في الأيام التي تختارها', 'f.name': 'اسم التمرين', 'f.namePh': 'مثال: تمرين الضغط',
    'f.countBy': 'العدّ بـ', 'f.byReps': 'تكرارات', 'f.bySec': 'ثوانٍ', 'f.reps': 'التكرارات', 'f.seconds': 'الثواني',
    'f.sets': 'المجموعات', 'f.when': 'متى', 'f.todayOnly': 'اليوم فقط', 'f.repeat': 'كل أسبوع', 'f.days': 'الأيام',
    'f.pickDay': 'اختر يومًا واحدًا على الأقل', 'f.saved': 'تم الحفظ', 'f.deleteTitle': 'حذف هذا التمرين؟',
    'f.deleteMsg': 'سيُحذف من خطتك الأسبوعية. يبقى سجلك السابق كما هو.', 'f.deleted': 'تم الحذف',

    'set.title': 'الإعدادات', 'set.language': 'اللغة', 'set.theme': 'المظهر', 'set.auto': 'تلقائي', 'set.light': 'فاتح',
    'set.dark': 'داكن', 'set.weekStart': 'بداية الأسبوع', 'set.install': 'تثبيت التطبيق',
    'set.installed': 'التطبيق مثبّت — تستخدم نسخة التطبيق.',
    'set.installDesc': 'ثبّت التطبيق للوصول بنقرة واحدة والعمل بدون إنترنت.', 'set.installBtn': 'تثبيت',
    'set.installIOS': 'على الآيفون / الآيباد: اضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية».',
    'set.installOther': 'من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».',
    'set.backup': 'النسخ الاحتياطي', 'set.backupDesc': 'بياناتك محفوظة مشفّرة على هذا الجهاز فقط. صدّر ملفًا لحفظها أو لنقلها إلى جهاز آخر. الملفات المُصدَّرة غير مشفّرة، لذا أبقِها خاصة.',
    'set.export': 'تصدير', 'set.import': 'استيراد', 'set.update': 'التحديثات', 'set.checkUpdate': 'التحقق من التحديثات',
    'set.danger': 'منطقة الخطر',
    'set.local': 'البيانات تبقى على جهازك', 'set.installedToast': 'تم تثبيت التطبيق', 'set.imported': 'تم استرجاع النسخة الاحتياطية',
    'set.importFail': 'هذا الملف ليس نسخة احتياطية صالحة',

    'upd.ready': 'يتوفر إصدار جديد', 'upd.reload': 'تحديث', 'upd.na': 'التحديثات تعمل عند تشغيل التطبيق عبر الويب',
    'upd.downloading': 'جارٍ تنزيل التحديث...', 'upd.latest': 'أنت على آخر إصدار',

    'rm.title': 'إزالة من اليوم؟', 'rm.msg': 'سيُزال هذا التمرين من قائمة اليوم فقط.',

    'qr.open': 'حمّل التطبيق على هاتفك', 'qr.openDesc': 'امسح رمز QR لفتح دفتر التمرين على هاتفك وتثبيته.',
    'qr.show': 'عرض رمز QR', 'qr.title': 'ثبّته على هاتفك', 'qr.sub': 'امسح، افتح، ثبّت',
    'qr.scan': 'امسح هذا الرمز بكاميرا هاتفك', 'qr.link': 'عنوان التطبيق',
    'qr.localWarn': 'هذا العنوان يعمل على هذا الحاسوب فقط. افتح النسخة المستضافة (أو استخدم عنوان الشبكة لهذا الجهاز مثل http://192.168.1.20:8080) لتحصل على رمز يعمل على هاتفك.',
    'qr.httpNote': 'يحتاج تسجيل الدخول إلى التشفير الذي لا تسمح به المتصفحات إلا على عناوين https://، والهواتف لا تعرض «تثبيت التطبيق» إلا هناك أيضًا. استخدم عنوان https:// (توفّره Cloudflare).',
    'qr.invalid': 'أدخل عنوان ويب صالحًا يبدأ بـ http:// أو https://',
    'qr.how': 'طريقة التثبيت',
    'qr.stepAndroid': 'أندرويد (كروم): افتح الرابط ثم القائمة ⋮ ← «تثبيت التطبيق».',
    'qr.stepIOS': 'آيفون / آيباد (سفاري): افتح الرابط ثم «مشاركة» ← «إضافة إلى الشاشة الرئيسية».',
    'qr.copy': 'نسخ الرابط', 'qr.copied': 'تم نسخ الرابط', 'qr.save': 'حفظ صورة الرمز', 'qr.saved': 'تم حفظ صورة الرمز', 'qr.share': 'مشاركة',
    'qr.shareText': 'دفتر التمرين - دفتر تمارين وزن الجسم',

    'au.pickTitle': 'من يتدرّب الآن؟', 'au.pickSub': 'اختر ملفًا لفتحه. لكل ملف كلمة مرور وبيانات خاصة به.',
    'au.add': 'إضافة ملف', 'au.signedIn': 'مسجّل الدخول', 'au.password': 'كلمة المرور', 'au.unlock': 'فتح',
    'au.forgot': 'نسيت كلمة المرور؟', 'au.switch': 'تبديل الملف', 'au.keepSigned': 'أبقني مسجّل الدخول على هذا الجهاز',
    'au.createTitleFirst': 'أنشئ ملفك', 'au.createTitle': 'إضافة ملف',
    'au.createSub': 'لملفك كلمة مرور خاصة. كل شيء مُشفّر في هذا المتصفح.',
    'au.createSubMore': 'يبدأ الملف الجديد فارغًا وله كلمة مرور خاصة.',
    'au.adopt': 'احتفظ ببيانات التمرين الموجودة على هذا الجهاز في هذا الملف (الخطة: {n}، الأيام المسجّلة: {d}).',
    'au.name': 'اسمك', 'au.username': 'اسم المستخدم', 'au.confirm': 'تأكيد كلمة المرور',
    'au.noOne': 'لا يمكن لأحد قراءة بياناتك بدون كلمة المرور. ستحصل على مفتاح استرداد في الشاشة التالية.',
    'au.createBtn': 'إنشاء الملف', 'au.back': 'رجوع',
    'au.s0': '٨ أحرف على الأقل', 'au.s1': 'ضعيفة', 'au.s2': 'مقبولة', 'au.s3': 'جيدة', 'au.s4': 'قوية',
    'au.keyTitle': 'احفظ مفتاح الاسترداد',
    'au.keySub': 'إذا نسيت كلمة المرور فهذا المفتاح هو الطريق الوحيد لاستعادة بياناتك. دوّنه أو احفظه في مكان آمن. يظهر مرة واحدة فقط.',
    'au.copy': 'نسخ', 'au.saveFile': 'حفظ كملف', 'au.copied': 'تم النسخ.', 'au.selectCopy': 'حدّد المفتاح وانسخه.',
    'au.savedKey': 'لقد حفظت مفتاح الاسترداد', 'au.continue': 'متابعة',
    'au.resetTitle': 'إعادة تعيين كلمة المرور', 'au.resetSub': 'أدخل مفتاح الاسترداد الذي حفظته عند إنشاء {user}، ثم اختر كلمة مرور جديدة.',
    'au.recKey': 'مفتاح الاسترداد', 'au.newPass': 'كلمة المرور الجديدة', 'au.resetBtn': 'إعادة التعيين',
    'au.noCrypto': 'التشفير غير متاح هنا',
    'au.noCryptoSub': 'يفعّل المتصفح التشفير للصفحات الآمنة فقط. افتح دفتر التمرين من عنوان https:// أو من http://localhost.',
    'au.peek': 'إظهار أو إخفاء كلمة المرور', 'au.working': 'جارٍ العمل…',
    'au.errPassLen': 'استخدم ٨ أحرف على الأقل لكلمة المرور.',
    'au.errUser': 'اسم المستخدم من ٣ إلى ٣٢ حرفًا أو رقمًا أو نقطة أو شرطة.',
    'au.errUserTaken': 'اسم المستخدم مستخدم بالفعل على هذا الجهاز.', 'au.errWrong': 'كلمة المرور خاطئة.',
    'au.errMismatch': 'كلمتا المرور غير متطابقتين.', 'au.errWait': 'محاولات كثيرة. انتظر {n} ثانية.',
    'au.errData': 'تعذّرت قراءة بيانات هذا الملف.',
    'au.errRecFmt': 'مفتاح الاسترداد من ٢٦ حرفًا ورقمًا. تحقق منه وحاول مجددًا.',
    'au.errRecMatch': 'مفتاح الاسترداد هذا لا يطابق هذا الملف.', 'au.errCurrent': 'كلمة المرور الحالية خاطئة.',
    'au.errGeneric': 'حدث خطأ ما. حاول مجددًا.',
    'au.errRemember': 'تعذّر على هذا المتصفح إبقاءك مسجّل الدخول. ستُطلب كلمة المرور في المرة القادمة.',
    'au.account': 'الملف والأمان', 'au.signOut': 'تسجيل الخروج', 'au.rename': 'تغيير الاسم', 'au.nameLabel': 'الاسم المعروض',
    'au.changePass': 'تغيير كلمة المرور', 'au.current': 'كلمة المرور الحالية', 'au.passChanged': 'تم تغيير كلمة المرور', 'au.renamed': 'تم حفظ الاسم',
    'au.newRecovery': 'مفتاح استرداد جديد', 'au.newRecoveryDesc': 'أدخل كلمة المرور لإنشاء مفتاح استرداد جديد. المفتاح القديم يتوقف عن العمل.',
    'au.makeKey': 'إنشاء المفتاح', 'au.oldKeyDead': 'مفتاح الاسترداد السابق لم يعد يعمل.',
    'au.autoLock': 'القفل التلقائي', 'au.off': 'إيقاف', 'au.min': '{n} د', 'au.autoLockNote': 'القفل التلقائي متوقف أثناء تفعيل «البقاء مسجّلًا».',
    'au.stay': 'البقاء مسجّلًا على هذا الجهاز',
    'au.stayDesc': 'يفتح بياناتك مباشرة بدون كلمة مرور. أي شخص يستطيع فتح دفتر التمرين على هذا الجهاز يمكنه رؤيتها، لذا أبقه معطّلًا على الأجهزة المشتركة.',
    'au.deleteProfile': 'حذف هذا الملف', 'au.deleteMsg': 'سيحذف هذا الملف وكل بياناته نهائيًا من هذا الجهاز. أدخل كلمة المرور للتأكيد.',
    'au.deleted': 'تم حذف الملف'
  };

  var dict = { en: en, ar: ar };
  var I = window.I18N = { lang: 'en', dict: dict };

  I.t = function (key, vars) {
    var s = (dict[I.lang] && dict[I.lang][key]);
    if (s == null) s = dict.en[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    return s;
  };
  I.detect = function () {
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return String(l).toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
  };
  I.setLang = function (l) {
    I.lang = l === 'ar' ? 'ar' : 'en';
    var r = document.documentElement;
    r.lang = I.lang; r.dir = I.lang === 'ar' ? 'rtl' : 'ltr';
  };
})();
