/* Exercise library + premade courses. All bodyweight - no equipment except a pull-up bar / bars / chair for some. */
(function () {
  'use strict';

  /* Categories. The first four are the ones you asked for; "core" and "full" make the premade plans complete. */
  var CATS = ['chest', 'legs', 'back', 'arms', 'core', 'full'];

  /* id: [category, unit, English, Arabic]   unit: 'reps' | 'sec' */
  var EX = {
    /* chest */
    pushup:     ['chest', 'reps', 'Push-ups', 'تمرين الضغط'],
    kneepush:   ['chest', 'reps', 'Knee push-ups', 'ضغط على الركبتين'],
    incline:    ['chest', 'reps', 'Incline push-ups (hands raised)', 'ضغط مائل (اليدان مرتفعتان)'],
    decline:    ['chest', 'reps', 'Decline push-ups (feet raised)', 'ضغط بقدمين مرتفعتين'],
    wide:       ['chest', 'reps', 'Wide push-ups', 'ضغط واسع'],
    archer:     ['chest', 'reps', 'Archer push-ups', 'ضغط الرامي'],
    pseudo:     ['chest', 'reps', 'Pseudo planche push-ups', 'ضغط البلانش الكاذب'],
    dips:       ['chest', 'reps', 'Parallel bar dips', 'ديبس على المتوازي'],
    planchelean:['chest', 'sec',  'Planche lean', 'ميل البلانش'],
    tuckplanche:['chest', 'sec',  'Tuck planche hold', 'ثبات البلانش المطوي'],
    /* legs */
    squat:      ['legs', 'reps', 'Bodyweight squats', 'سكوات بوزن الجسم'],
    jumpsquat:  ['legs', 'reps', 'Jump squats', 'سكوات بالقفز'],
    lunge:      ['legs', 'reps', 'Lunges (each leg)', 'لانجز (لكل رجل)'],
    bulgarian:  ['legs', 'reps', 'Bulgarian split squats (each leg)', 'سكوات بلغاري (لكل رجل)'],
    cossack:    ['legs', 'reps', 'Cossack squats (each side)', 'سكوات كوساك (لكل جانب)'],
    pistolassist:['legs', 'reps', 'Assisted pistol squats (each leg)', 'بيستول بمساعدة (لكل رجل)'],
    pistol:     ['legs', 'reps', 'Pistol squats (each leg)', 'بيستول سكوات (لكل رجل)'],
    glute:      ['legs', 'reps', 'Glute bridge', 'جسر الأرداف'],
    sglute:     ['legs', 'reps', 'Single-leg glute bridge (each leg)', 'جسر الأرداف بقدم واحدة (لكل رجل)'],
    calf:       ['legs', 'reps', 'Calf raises', 'رفع السمانة'],
    wallsit:    ['legs', 'sec',  'Wall sit', 'جلسة الحائط'],
    stepup:     ['legs', 'reps', 'Chair step-ups (each leg)', 'صعود الكرسي (لكل رجل)'],
    tuckjump:   ['legs', 'reps', 'Tuck jumps', 'قفزات بطي الركبتين'],
    /* back */
    pullup:     ['back', 'reps', 'Pull-ups', 'تمرين العقلة'],
    negpull:    ['back', 'reps', 'Negative pull-ups (slow lowering)', 'عقلة سلبية (نزول بطيء)'],
    invrow:     ['back', 'reps', 'Inverted rows', 'سحب أسترالي'],
    scap:       ['back', 'reps', 'Scapular pulls', 'سحب لوحَي الكتف'],
    deadhang:   ['back', 'sec',  'Dead hang', 'تعلّق على العقلة'],
    superman:   ['back', 'sec',  'Superman hold', 'ثبات السوبرمان'],
    widepull:   ['back', 'reps', 'Wide-grip pull-ups', 'عقلة بقبضة واسعة'],
    archerpull: ['back', 'reps', 'Archer pull-ups', 'عقلة الرامي'],
    explpull:   ['back', 'reps', 'Explosive pull-ups', 'عقلة انفجارية'],
    muscleup:   ['back', 'reps', 'Muscle-ups (attempts)', 'مسل أب (محاولات)'],
    tuckfl:     ['back', 'sec',  'Tuck front lever hold', 'ثبات الرافعة الأمامية (مطوية)'],
    advtuckfl:  ['back', 'sec',  'Advanced tuck front lever hold', 'ثبات الرافعة الأمامية (مطوية متقدمة)'],
    /* arms (incl. shoulders) */
    diamond:    ['arms', 'reps', 'Diamond push-ups', 'ضغط الماس'],
    benchdips:  ['arms', 'reps', 'Chair / bench dips', 'ديبس على الكرسي'],
    chinup:     ['arms', 'reps', 'Chin-ups', 'عقلة بقبضة معكوسة'],
    pike:       ['arms', 'reps', 'Pike push-ups', 'ضغط بايك (شكل V)'],
    hspu:       ['arms', 'reps', 'Wall handstand push-ups', 'ضغط الوقوف على اليدين (حائط)'],
    wallhs:     ['arms', 'sec',  'Wall handstand hold', 'ثبات الوقوف على اليدين (حائط)'],
    freehs:     ['arms', 'sec',  'Free handstand attempts (total hold)', 'محاولات الوقوف الحر (إجمالي الثبات)'],
    wallwalk:   ['arms', 'reps', 'Wall walks', 'المشي على الحائط'],
    frog:       ['arms', 'sec',  'Frog stand', 'وضعية الضفدع'],
    tricepext:  ['arms', 'reps', 'Bodyweight triceps extensions', 'تمديد الترايسبس بوزن الجسم'],
    closeinv:   ['arms', 'reps', 'Underhand inverted rows (biceps)', 'سحب أسترالي بقبضة معكوسة (بايسبس)'],
    /* core */
    plank:      ['core', 'sec',  'Plank', 'بلانك'],
    sideplank:  ['core', 'sec',  'Side plank (each side)', 'بلانك جانبي (لكل جانب)'],
    hollow:     ['core', 'sec',  'Hollow body hold', 'ثبات الجسم المجوّف (Hollow)'],
    legraise:   ['core', 'reps', 'Lying leg raises', 'رفع الساقين (استلقاء)'],
    hangknee:   ['core', 'reps', 'Hanging knee raises', 'رفع الركبتين من التعلق'],
    hangleg:    ['core', 'reps', 'Hanging leg raises', 'رفع الساقين من التعلق'],
    lsit:       ['core', 'sec',  'L-sit hold', 'ثبات L-sit'],
    tucklsit:   ['core', 'sec',  'Tuck L-sit hold', 'ثبات L-sit مطوي'],
    vsit:       ['core', 'sec',  'V-sit hold', 'ثبات V-sit'],
    crunch:     ['core', 'reps', 'Crunches', 'تمرين المعدة (كرانش)'],
    bicycle:    ['core', 'reps', 'Bicycle crunches', 'كرانش الدراجة'],
    climbers:   ['core', 'reps', 'Mountain climbers', 'تسلق الجبل'],
    vup:        ['core', 'reps', 'V-ups', 'رفع الجسم على شكل V'],
    russian:    ['core', 'reps', 'Russian twists', 'الالتفاف الروسي'],
    deadbug:    ['core', 'reps', 'Dead bugs', 'تمرين الحشرة (Dead bug)'],
    /* full body */
    burpee:     ['full', 'reps', 'Burpees', 'بيربي'],
    jacks:      ['full', 'reps', 'Jumping jacks', 'قفز الجاك'],
    highknees:  ['full', 'sec',  'High knees', 'ركض برفع الركبتين'],
    bearcrawl:  ['full', 'sec',  'Bear crawl', 'مشية الدب'],
    inchworm:   ['full', 'reps', 'Inchworms', 'دودة المشي (Inchworm)']
  };

  /*
   * Courses. Each session row: [exerciseId, sets, repsOrSeconds, +perWeek]
   * kind: 'course' | 'monthly' | 'calisthenics'   level: 1 beginner .. 3 advanced
   * Programs are original; "style" names the method/athlete that inspired the approach (not an official program).
   */
  function S(en, ar, rows) { return { name: { en: en, ar: ar }, ex: rows }; }

  var COURSES = [
    /* ---------------- COURSES ---------------- */
    {
      id: 'foundation', kind: 'course', level: 1, weeks: 4,
      name: { en: 'Full-Body Foundations', ar: 'أساسيات الجسم الكامل' },
      desc: { en: 'Three easy full-body sessions a week to build your base: push, pull, legs and core. Perfect if you are new or coming back after a break.',
              ar: 'ثلاث حصص بسيطة أسبوعيًا لكامل الجسم لبناء الأساس: دفع وسحب وأرجل وبطن. مناسبة للمبتدئين أو للعائدين بعد انقطاع.' },
      style: { en: 'r/bodyweightfitness “Recommended Routine” approach', ar: 'منهج «Recommended Routine» لمجتمع r/bodyweightfitness' },
      sessions: [
        S('Full body A', 'كامل الجسم (أ)', [['incline',3,8,1],['squat',3,12,2],['invrow',3,8,1],['plank',3,20,5]]),
        S('Full body B', 'كامل الجسم (ب)', [['pike',3,5,1],['lunge',3,8,1],['scap',3,6,1],['deadbug',3,8,1]]),
        S('Full body C', 'كامل الجسم (ج)', [['incline',3,10,1],['glute',3,12,2],['superman',3,15,3],['sideplank',3,15,5]])
      ]
    },
    {
      id: 'ppl', kind: 'course', level: 2, weeks: 4,
      name: { en: 'Push · Pull · Legs (bodyweight)', ar: 'دفع · سحب · أرجل (بوزن الجسم)' },
      desc: { en: 'The classic 6-day split adapted to bodyweight only. Each muscle group is hit twice a week with growing volume.',
              ar: 'التقسيم الكلاسيكي لستة أيام معدّل ليناسب وزن الجسم فقط. كل مجموعة عضلية تُدرَّب مرتين أسبوعيًا مع زيادة تدريجية في الحجم.' },
      style: { en: 'Classic PPL split, bodyweight version', ar: 'تقسيم PPL الكلاسيكي بنسخة وزن الجسم' },
      sessions: [
        S('Push 1', 'دفع ١', [['pushup',4,12,1],['dips',3,8,1],['pike',3,8,1],['diamond',3,8,1]]),
        S('Pull 1', 'سحب ١', [['pullup',4,5,1],['invrow',3,10,1],['chinup',3,5,1],['hangknee',3,10,1]]),
        S('Legs 1', 'أرجل ١', [['squat',4,20,2],['bulgarian',3,10,1],['glute',3,15,2],['calf',4,20,2]]),
        S('Push 2', 'دفع ٢', [['decline',4,10,1],['wide',3,12,1],['benchdips',3,12,1],['tricepext',3,10,1]]),
        S('Pull 2', 'سحب ٢', [['widepull',4,4,1],['invrow',3,12,1],['superman',3,20,3],['hangleg',3,8,1]]),
        S('Legs 2', 'أرجل ٢', [['jumpsquat',4,12,1],['lunge',3,12,1],['wallsit',3,45,5],['sglute',3,10,1]])
      ]
    },
    {
      id: 'big6', kind: 'course', level: 2, weeks: 4,
      name: { en: 'The Big Six', ar: 'الستة الكبار (Big Six)' },
      desc: { en: 'Six movement patterns that build a complete strong body: push, squat, pull, leg raise, bridge and overhead press. Simple, repeatable, effective.',
              ar: 'ست حركات أساسية تبني جسمًا قويًا متكاملًا: دفع، سكوات، سحب، رفع ساقين، جسر، وضغط للأكتاف. بسيطة ومتكررة وفعّالة.' },
      style: { en: 'Inspired by Convict Conditioning (Paul Wade)', ar: 'مستوحى من Convict Conditioning (بول وايد)' },
      sessions: [
        S('Big Six - heavy', 'الستة الكبار - ثقيل', [['pushup',3,10,2],['squat',3,15,2],['invrow',3,8,1],['legraise',3,10,1],['glute',3,15,2],['pike',3,6,1]]),
        S('Big Six - light', 'الستة الكبار - خفيف', [['incline',2,10,2],['squat',2,12,2],['invrow',2,8,1],['legraise',2,8,1],['glute',2,12,2],['pike',2,5,1]]),
        S('Big Six - medium', 'الستة الكبار - متوسط', [['pushup',3,8,2],['squat',3,12,2],['invrow',3,7,1],['legraise',3,8,1],['glute',3,12,2],['pike',3,5,1]])
      ]
    },
    {
      id: 'corecrusher', kind: 'course', level: 2, weeks: 4,
      name: { en: 'Core Crusher', ar: 'محطّم البطن' },
      desc: { en: 'Four focused core sessions: stability holds, leg raises and rotation work for a strong, defined midsection.',
              ar: 'أربع حصص مركزة للبطن: ثبات، رفع ساقين، وتمارين دوران لعضلات بطن قوية وواضحة.' },
      style: { en: 'Hollow-body and L-sit foundations (gymnastics-style)', ar: 'أساسيات الهولو وL-sit (أسلوب الجمباز)' },
      sessions: [
        S('Core 1', 'بطن ١', [['plank',3,30,5],['legraise',3,12,2],['bicycle',3,20,2],['deadbug',3,10,2]]),
        S('Core 2', 'بطن ٢', [['hollow',3,20,5],['vup',3,10,1],['sideplank',3,20,5],['climbers',3,30,5]]),
        S('Core 3', 'بطن ٣', [['hangknee',3,10,1],['crunch',3,20,2],['russian',3,20,2],['plank',2,45,5]]),
        S('Core 4', 'بطن ٤', [['tucklsit',4,10,2],['hangleg',3,6,1],['hollow',3,25,5],['bicycle',3,24,2]])
      ]
    },
    {
      id: 'legsglutes', kind: 'course', level: 2, weeks: 4,
      name: { en: 'Legs & Glutes, No Weights', ar: 'الأرجل والأرداف بدون أوزان' },
      desc: { en: 'Three leg days that build strength and endurance using only your bodyweight - squats, single-leg work and jumps.',
              ar: 'ثلاثة أيام للأرجل تبني القوة والتحمل بوزن جسمك فقط: سكوات، تمارين رجل واحدة، وقفزات.' },
      style: { en: 'Single-leg strength approach', ar: 'منهج قوة الرجل الواحدة' },
      sessions: [
        S('Legs A', 'أرجل (أ)', [['squat',4,20,2],['lunge',3,12,1],['glute',4,15,2],['calf',4,20,2]]),
        S('Legs B', 'أرجل (ب)', [['bulgarian',3,10,1],['jumpsquat',3,12,1],['sglute',3,10,1],['wallsit',3,40,5]]),
        S('Legs C', 'أرجل (ج)', [['cossack',3,8,1],['stepup',3,12,1],['tuckjump',3,8,1],['calf',4,25,2]])
      ]
    },
    {
      id: 'armspro', kind: 'course', level: 2, weeks: 4,
      name: { en: 'Arms Without Weights', ar: 'الذراعين بدون أوزان' },
      desc: { en: 'Triceps, biceps and shoulders using dips, close-grip pushing and pulling. Needs a chair and a bar (or a sturdy table for rows).',
              ar: 'ترايسبس وبايسبس وأكتاف عبر الديبس والضغط الضيق والسحب. تحتاج كرسيًا وعقلة (أو طاولة ثابتة للسحب).' },
      style: { en: 'Street-workout arm day', ar: 'يوم الذراعين بأسلوب الستريت وورك آوت' },
      sessions: [
        S('Arms 1', 'ذراعين ١', [['diamond',4,8,1],['chinup',4,5,1],['benchdips',3,12,1]]),
        S('Arms 2', 'ذراعين ٢', [['pike',4,8,1],['closeinv',3,10,1],['tricepext',3,10,1]]),
        S('Arms 3', 'ذراعين ٣', [['diamond',3,10,1],['chinup',3,6,1],['benchdips',3,15,1],['pike',3,8,1]])
      ]
    },
    {
      id: 'circuits', kind: 'course', level: 2, weeks: 4,
      name: { en: 'Fat-Burn Circuits', ar: 'دوائر حرق الدهون' },
      desc: { en: 'Four fast, sweaty sessions mixing jumps, pushing and core. Use the interval timer in the Train tab: 40s work / 20s rest.',
              ar: 'أربع حصص سريعة ومُتعِبة تجمع القفز والدفع والبطن. استخدم مؤقت الفواصل في تبويب «تمرين»: ٤٠ ثانية عمل / ٢٠ راحة.' },
      style: { en: 'Inspired by THENX / Chris Heria-style circuits', ar: 'مستوحى من دوائر THENX / كريس هيريا' },
      sessions: [
        S('Circuit 1', 'دائرة ١', [['burpee',4,10,1],['jacks',4,30,5],['climbers',4,30,5],['squat',4,20,2]]),
        S('Circuit 2', 'دائرة ٢', [['pushup',4,12,1],['highknees',4,30,5],['jumpsquat',4,12,1],['bicycle',4,20,2]]),
        S('Circuit 3', 'دائرة ٣', [['bearcrawl',4,30,5],['inchworm',4,8,1],['tuckjump',4,10,1],['plank',3,40,5]]),
        S('Circuit 4', 'دائرة ٤', [['burpee',5,10,1],['pushup',4,15,1],['lunge',4,14,2],['climbers',4,40,5]])
      ]
    },
    {
      id: 'streetvol', kind: 'course', level: 3, weeks: 4,
      name: { en: 'Street Workout Volume', ar: 'حجم تدريب الستريت وورك آوت' },
      desc: { en: 'High-volume pulling, dipping and pushing for experienced athletes. You should already do 8+ pull-ups and 12+ dips.',
              ar: 'حجم عالٍ من السحب والديبس والضغط للرياضيين ذوي الخبرة. يجب أن تؤدي ٨ عقلات و١٢ ديبس على الأقل.' },
      style: { en: 'Inspired by Hannibal For King-style high-volume training', ar: 'مستوحى من تدريب الحجم العالي بأسلوب Hannibal For King' },
      sessions: [
        S('Pull day', 'يوم السحب', [['pullup',5,8,1],['widepull',4,6,1],['invrow',4,12,1],['hangleg',4,10,1]]),
        S('Push day', 'يوم الدفع', [['dips',5,12,1],['pushup',5,20,2],['pike',4,8,1],['archer',3,5,1]]),
        S('Legs + core', 'أرجل + بطن', [['squat',5,30,3],['bulgarian',4,12,1],['jumpsquat',4,15,1],['lsit',4,15,3]]),
        S('Full body', 'كامل الجسم', [['pullup',5,6,1],['dips',5,10,1],['pushup',4,20,2],['hangknee',4,12,1],['burpee',3,10,1]])
      ]
    },

    /* ---------------- MONTHLY PLANS ---------------- */
    {
      id: 'pushup30', kind: 'monthly', level: 1, weeks: 4,
      name: { en: '30-Day Push-Up Builder', ar: 'خطة ٣٠ يومًا لبناء الضغط' },
      desc: { en: 'Four weeks that take you from a few shaky push-ups to strong, clean sets - with variations that build chest, triceps and shoulders.',
              ar: 'أربعة أسابيع تنقلك من بضع عدّات متعثرة إلى مجموعات قوية ونظيفة، مع تنويعات تبني الصدر والترايسبس والأكتاف.' },
      style: { en: 'Progressive push-up ladder', ar: 'سُلَّم تصاعدي لتمارين الضغط' },
      sessions: [
        S('Day 1 - Volume', 'اليوم ١ - حجم', [['pushup',4,6,1],['incline',3,10,2],['plank',3,25,5]]),
        S('Day 2 - Variations', 'اليوم ٢ - تنويعات', [['wide',3,6,1],['diamond',3,5,1],['kneepush',2,12,2]]),
        S('Day 3 - Strength', 'اليوم ٣ - قوة', [['decline',4,5,1],['pushup',4,8,1],['pike',3,5,1]]),
        S('Day 4 - Test', 'اليوم ٤ - اختبار', [['pushup',5,7,1],['archer',3,3,1],['plank',3,30,5]])
      ]
    },
    {
      id: 'pullup30', kind: 'monthly', level: 1, weeks: 4,
      name: { en: 'Zero to First Pull-Up in 30 Days', ar: 'من الصفر إلى أول عقلة في ٣٠ يومًا' },
      desc: { en: 'Negatives, rows, scapular work and hangs build the pulling strength you need. Needs a pull-up bar. By week 4 you attempt real pull-ups.',
              ar: 'العقلات السلبية والسحب الأسترالي وتمارين لوح الكتف والتعلق تبني قوة السحب المطلوبة. تحتاج عقلة. في الأسبوع الرابع تحاول عقلات حقيقية.' },
      style: { en: 'Negative + row progression method', ar: 'منهج التدرج بالعقلات السلبية والسحب' },
      sessions: [
        S('Day 1', 'اليوم ١', [['negpull',5,3,1],['invrow',4,8,1],['deadhang',3,20,5]]),
        S('Day 2', 'اليوم ٢', [['scap',4,8,1],['chinup',3,1,1],['hangknee',3,8,1]]),
        S('Day 3', 'اليوم ٣', [['negpull',4,4,1],['invrow',4,10,1],['superman',3,20,3]]),
        S('Day 4', 'اليوم ٤', [['pullup',5,1,1],['deadhang',3,30,5],['scap',3,10,1]])
      ]
    },
    {
      id: 'abs30', kind: 'monthly', level: 2, weeks: 4,
      name: { en: '30-Day Six-Pack Core Challenge', ar: 'تحدي ٣٠ يومًا لعضلات البطن' },
      desc: { en: 'Five short core sessions a week. Combines holds, leg raises and rotation. Pair it with good nutrition to see definition.',
              ar: 'خمس حصص قصيرة أسبوعيًا للبطن تجمع الثبات ورفع الساقين والدوران. اجمعها مع تغذية جيدة لتظهر العضلات.' },
      style: { en: 'Daily core challenge', ar: 'تحدي البطن اليومي' },
      sessions: [
        S('Day 1', 'اليوم ١', [['crunch',3,20,2],['plank',3,30,5],['legraise',3,10,2]]),
        S('Day 2', 'اليوم ٢', [['bicycle',3,20,2],['hollow',3,20,5],['vup',3,8,1]]),
        S('Day 3', 'اليوم ٣', [['climbers',3,30,5],['deadbug',3,12,1],['sideplank',3,20,5]]),
        S('Day 4', 'اليوم ٤', [['hangknee',3,8,1],['russian',3,20,2],['plank',3,40,5]]),
        S('Day 5', 'اليوم ٥', [['vup',3,10,1],['legraise',3,12,2],['hollow',3,25,5]])
      ]
    },
    {
      id: 'lean30', kind: 'monthly', level: 2, weeks: 4,
      name: { en: '30-Day Lean & Strong', ar: 'خطة ٣٠ يومًا للرشاقة والقوة' },
      desc: { en: 'A full month mixing strength and conditioning, five days a week. Builds muscle and burns fat with nothing but your body.',
              ar: 'شهر كامل يمزج القوة واللياقة، خمسة أيام أسبوعيًا. يبني العضلات ويحرق الدهون بجسمك فقط.' },
      style: { en: 'Strength + conditioning monthly plan', ar: 'خطة شهرية للقوة واللياقة' },
      sessions: [
        S('Day 1', 'اليوم ١', [['burpee',3,10,1],['squat',3,20,2],['pushup',3,10,1],['plank',3,30,5]]),
        S('Day 2', 'اليوم ٢', [['invrow',3,10,1],['lunge',3,12,1],['climbers',3,30,5],['glute',3,15,2]]),
        S('Day 3', 'اليوم ٣', [['jacks',4,40,5],['pushup',3,12,1],['jumpsquat',3,12,1],['bicycle',3,20,2]]),
        S('Day 4', 'اليوم ٤', [['pullup',3,4,1],['dips',3,6,1],['squat',3,25,2],['hollow',3,20,5]]),
        S('Day 5', 'اليوم ٥', [['burpee',4,10,1],['highknees',4,30,5],['pike',3,6,1],['legraise',3,12,1]])
      ]
    },
    {
      id: 'street30', kind: 'monthly', level: 3, weeks: 4,
      name: { en: '30-Day Street Workout Strength', ar: 'خطة ٣٠ يومًا لقوة الستريت وورك آوت' },
      desc: { en: 'Four heavy-bodyweight days built around pull-ups, dips, push-ups and pistol prep. For athletes with a solid base.',
              ar: 'أربعة أيام قوة بوزن الجسم حول العقلة والديبس والضغط وتحضير البيستول. للرياضيين أصحاب القاعدة المتينة.' },
      style: { en: 'Street-workout strength block', ar: 'كتلة قوة بأسلوب الستريت وورك آوت' },
      sessions: [
        S('Day 1 - Pull', 'اليوم ١ - سحب', [['pullup',5,6,1],['dips',5,8,1],['hangleg',4,8,1]]),
        S('Day 2 - Push', 'اليوم ٢ - دفع', [['pushup',5,15,2],['archer',3,4,1],['pike',4,8,1],['lsit',4,12,3]]),
        S('Day 3 - Legs', 'اليوم ٣ - أرجل', [['squat',5,25,3],['pistolassist',3,4,1],['jumpsquat',4,10,1],['calf',4,25,2]]),
        S('Day 4 - Power', 'اليوم ٤ - قوة انفجارية', [['explpull',4,4,1],['dips',4,10,1],['pushup',4,18,2],['hollow',4,25,5]])
      ]
    },
    {
      id: 'squat30', kind: 'monthly', level: 1, weeks: 4,
      name: { en: '30-Day Squat & Lower Body', ar: 'خطة ٣٠ يومًا للسكوات والأرجل' },
      desc: { en: 'Four lower-body days that raise your squat volume week after week and build strong legs and glutes at home.',
              ar: 'أربعة أيام للجزء السفلي تزيد حجم السكوات أسبوعًا بعد أسبوع وتبني أرجلًا وأردافًا قوية في المنزل.' },
      style: { en: 'Progressive squat volume', ar: 'زيادة تدريجية في حجم السكوات' },
      sessions: [
        S('Day 1', 'اليوم ١', [['squat',4,15,3],['glute',3,15,2],['calf',3,15,2]]),
        S('Day 2', 'اليوم ٢', [['lunge',3,8,1],['wallsit',3,30,5],['squat',3,12,2]]),
        S('Day 3', 'اليوم ٣', [['jumpsquat',3,8,1],['stepup',3,10,1],['glute',3,20,2]]),
        S('Day 4', 'اليوم ٤', [['squat',5,20,3],['bulgarian',3,6,1],['calf',4,20,2]])
      ]
    },

    /* ---------------- CALISTHENICS SKILLS ---------------- */
    {
      id: 'handstand', kind: 'calisthenics', level: 2, weeks: 6,
      name: { en: 'Handstand Journey', ar: 'رحلة الوقوف على اليدين' },
      desc: { en: 'Six weeks from wall holds to your first free handstands: shoulder strength, line control, balance practice and pressing.',
              ar: 'ستة أسابيع من الثبات على الحائط إلى أول وقوف حر: قوة الأكتاف، التحكم بالخط، تمرين التوازن والضغط.' },
      style: { en: 'GMB-style handstand progressions', ar: 'تدرجات الوقوف على اليدين بأسلوب GMB' },
      sessions: [
        S('Skill 1 - Wall line', 'مهارة ١ - خط الحائط', [['wallhs',5,20,5],['pike',4,6,1],['wallwalk',3,3,1],['hollow',3,20,5]]),
        S('Strength', 'قوة', [['frog',5,15,5],['plank',3,40,5],['wallwalk',3,4,1],['pike',3,8,1]]),
        S('Skill 2 - Balance', 'مهارة ٢ - التوازن', [['wallhs',5,25,5],['freehs',5,8,3],['hollow',3,25,3]]),
        S('Press', 'ضغط', [['hspu',4,3,1],['wallhs',4,30,5],['frog',4,20,5]])
      ]
    },
    {
      id: 'frontlever', kind: 'calisthenics', level: 3, weeks: 6,
      name: { en: 'Front Lever Path', ar: 'مسار الرافعة الأمامية' },
      desc: { en: 'From tuck to advanced tuck: straight-arm pulling strength, scapular control and core tension. Needs a pull-up bar.',
              ar: 'من الوضعية المطوية إلى المطوية المتقدمة: قوة السحب بذراعين مستقيمتين، التحكم باللوح، وشدّ البطن. تحتاج عقلة.' },
      style: { en: 'Overcoming Gravity-style progressions (Steven Low)', ar: 'تدرجات بأسلوب Overcoming Gravity (ستيفن لو)' },
      sessions: [
        S('Lever 1', 'رافعة ١', [['tuckfl',5,8,2],['scap',3,8,1],['hangleg',4,6,1],['deadhang',3,30,5]]),
        S('Pull strength', 'قوة السحب', [['pullup',4,6,1],['archerpull',3,3,1],['invrow',3,10,1],['hollow',4,25,5]]),
        S('Lever 2', 'رافعة ٢', [['tuckfl',4,10,2],['advtuckfl',3,4,1],['hangleg',3,8,1],['superman',3,25,3]])
      ]
    },
    {
      id: 'planche', kind: 'calisthenics', level: 3, weeks: 6,
      name: { en: 'Planche Progression', ar: 'تدرج البلانش' },
      desc: { en: 'Build the straight-arm pushing strength for the planche: lean holds, tuck planche, pseudo push-ups and wrist-friendly volume.',
              ar: 'ابنِ قوة الدفع بذراعين مستقيمتين للبلانش: ميل البلانش، البلانش المطوي، الضغط الكاذب، وحجم لطيف على المعصمين.' },
      style: { en: 'Frank Medrano-style skill work', ar: 'تدريب المهارات بأسلوب فرانك ميدرانو' },
      sessions: [
        S('Planche 1', 'بلانش ١', [['planchelean',5,15,3],['tuckplanche',5,5,1],['pseudo',4,8,1]]),
        S('Support strength', 'قوة الدعم', [['pike',4,8,1],['dips',4,10,1],['frog',3,20,5],['hollow',3,25,5]]),
        S('Planche 2', 'بلانش ٢', [['planchelean',5,20,3],['tuckplanche',4,6,1],['pseudo',4,10,1],['plank',3,45,5]])
      ]
    },
    {
      id: 'muscleup', kind: 'calisthenics', level: 3, weeks: 6,
      name: { en: 'Muscle-Up Builder', ar: 'بناء المسل أب' },
      desc: { en: 'High pull-ups, fast dips and transition practice. You should already be able to do 8+ strict pull-ups and 10+ dips.',
              ar: 'عقلات عالية وديبس سريع وتمرين الانتقال. يجب أن تؤدي ٨ عقلات صحيحة و١٠ ديبس على الأقل.' },
      style: { en: 'Street-workout skill block', ar: 'كتلة مهارة بأسلوب الستريت وورك آوت' },
      sessions: [
        S('Pull power', 'قوة السحب', [['pullup',5,6,1],['explpull',4,3,1],['dips',4,8,1],['hangleg',3,8,1]]),
        S('Explosive', 'انفجاري', [['explpull',5,3,1],['negpull',3,3,1],['pushup',4,15,2],['hollow',3,25,5]]),
        S('Volume', 'حجم', [['dips',5,10,1],['pullup',5,7,1],['scap',3,10,1],['hangknee',3,10,1]]),
        S('Skill day', 'يوم المهارة', [['muscleup',5,1,0],['explpull',4,4,1],['dips',4,10,1]])
      ]
    },
    {
      id: 'lsit', kind: 'calisthenics', level: 2, weeks: 6,
      name: { en: 'L-Sit to V-Sit', ar: 'من L-sit إلى V-sit' },
      desc: { en: 'Compression, shoulder depression and hip-flexor strength. Start with tuck holds and progress to full L-sit and V-sit work.',
              ar: 'قوة الضغط والكتفين وعضلات الورك. ابدأ بالثبات المطوي وتدرّج إلى L-sit كامل ثم V-sit.' },
      style: { en: 'Gymnastics-style compression training', ar: 'تدريب الانضغاط بأسلوب الجمباز' },
      sessions: [
        S('Tuck L-sit', 'L-sit مطوي', [['tucklsit',5,10,2],['hangknee',3,10,1],['plank',3,30,5]]),
        S('L-sit', 'L-sit', [['lsit',5,8,3],['hollow',3,25,5],['dips',3,8,1]]),
        S('Compression', 'ضغط الورك', [['lsit',4,10,3],['vsit',3,5,2],['hangleg',3,8,1]])
      ]
    },
    {
      id: 'pistol', kind: 'calisthenics', level: 3, weeks: 6,
      name: { en: 'Pistol Squat Mastery', ar: 'إتقان البيستول سكوات' },
      desc: { en: 'Single-leg strength, ankle and hip mobility, and balance. Works up from assisted pistols (holding a post or door frame) to full ones.',
              ar: 'قوة الرجل الواحدة ومرونة الكاحل والورك والتوازن. تتدرّج من البيستول بمساعدة (بالإمساك بعمود أو إطار باب) إلى الكامل.' },
      style: { en: 'Single-leg squat progression', ar: 'تدرج سكوات الرجل الواحدة' },
      sessions: [
        S('Pistol 1', 'بيستول ١', [['pistolassist',4,4,1],['bulgarian',3,8,1],['calf',3,20,2]]),
        S('Strength', 'قوة', [['cossack',3,6,1],['wallsit',3,40,5],['sglute',3,10,1]]),
        S('Pistol 2', 'بيستول ٢', [['pistol',4,1,1],['pistolassist',3,5,1],['stepup',3,10,1]])
      ]
    }
  ];

  var byId = {};
  COURSES.forEach(function (c) { byId[c.id] = c; });

  function exName(id, lang) {
    var e = EX[id];
    return e ? (lang === 'ar' ? e[3] : e[2]) : id;
  }
  function exInfo(id) {
    var e = EX[id];
    return e ? { cat: e[0], unit: e[1] } : null;
  }
  /* match free text against library names (both languages) */
  function findByName(txt) {
    var q = String(txt || '').trim().toLowerCase();
    if (!q) return null;
    for (var id in EX) {
      if (EX[id][2].toLowerCase() === q || EX[id][3].toLowerCase() === q) return id;
    }
    return null;
  }
  /* weekdays offsets 0..6 (relative to week start) for n sessions, evenly spread */
  function defaultOffsets(n) {
    var map = { 1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };
    return map[Math.min(7, Math.max(1, n))];
  }

  window.Data = {
    CATS: CATS, EX: EX, COURSES: COURSES,
    course: function (id) { return byId[id] || null; },
    exName: exName, exInfo: exInfo, findByName: findByName, defaultOffsets: defaultOffsets
  };
})();
