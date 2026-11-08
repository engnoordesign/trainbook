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
    'set.backup': 'Backup', 'set.backupDesc': 'Your data is stored only on this device. Export a file to keep it safe or move it to another device.',
    'set.export': 'Export', 'set.import': 'Import', 'set.update': 'Updates', 'set.checkUpdate': 'Check for updates',
    'set.danger': 'Danger zone', 'set.reset': 'Erase all data',
    'set.resetMsg': 'This permanently deletes your plan and history from this device. Export a backup first if you want to keep it.',
    'set.local': 'Data stays on your device', 'set.installedToast': 'App installed', 'set.imported': 'Backup restored',
    'set.importFail': "That file isn't a valid backup",

    'upd.ready': 'A new version is ready', 'upd.reload': 'Update', 'upd.na': 'Updates work when the app is served over the web',
    'upd.downloading': 'Downloading the update...', 'upd.latest': "You're on the latest version",

    'rm.title': 'Remove from today?', 'rm.msg': "This exercise will be removed from today's list only."
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
    'set.backup': 'النسخ الاحتياطي', 'set.backupDesc': 'بياناتك محفوظة على هذا الجهاز فقط. صدّر ملفًا لحفظها أو لنقلها إلى جهاز آخر.',
    'set.export': 'تصدير', 'set.import': 'استيراد', 'set.update': 'التحديثات', 'set.checkUpdate': 'التحقق من التحديثات',
    'set.danger': 'منطقة الخطر', 'set.reset': 'مسح كل البيانات',
    'set.resetMsg': 'سيحذف هذا خطتك وسجلك نهائيًا من هذا الجهاز. صدّر نسخة احتياطية أولًا إن أردت الاحتفاظ بها.',
    'set.local': 'البيانات تبقى على جهازك', 'set.installedToast': 'تم تثبيت التطبيق', 'set.imported': 'تم استرجاع النسخة الاحتياطية',
    'set.importFail': 'هذا الملف ليس نسخة احتياطية صالحة',

    'upd.ready': 'يتوفر إصدار جديد', 'upd.reload': 'تحديث', 'upd.na': 'التحديثات تعمل عند تشغيل التطبيق عبر الويب',
    'upd.downloading': 'جارٍ تنزيل التحديث...', 'upd.latest': 'أنت على آخر إصدار',

    'rm.title': 'إزالة من اليوم؟', 'rm.msg': 'سيُزال هذا التمرين من قائمة اليوم فقط.'
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
