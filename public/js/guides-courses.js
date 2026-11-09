/* How to follow each premade course (English + Arabic). The equipment list is worked out from the exercises in the course. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) factory(require('./guides.js')); else factory(root.Guides);
})(this, function (G) {
  'use strict';
  G.addCourses({
    foundation: {
      en: { how: 'Three easy full-body sessions a week with a rest day between them, for example Monday, Wednesday and Friday. In each session do the exercises in order, finishing all the sets of one before moving to the next, and rest 60 to 90 seconds between sets. The numbers grow a little every week, so just follow the plan for the day.',
        tips: ['Stop each set one or two reps before you would fail. Good form comes first.', 'If a move feels too hard, use an easier version (knees, a higher surface) and move up when it feels smooth.'] },
      ar: { how: 'ثلاث حصص بسيطة لكامل الجسم أسبوعيًا مع يوم راحة بينها، مثل الاثنين والأربعاء والجمعة. في كل حصة نفّذ التمارين بالترتيب وأنهِ كل مجموعات التمرين قبل الانتقال للتالي، مع راحة من 60 إلى 90 ثانية بين المجموعات. تزداد الأعداد قليلًا كل أسبوع، فاتبع خطة اليوم فقط.',
        tips: ['توقف في كل مجموعة قبل الفشل بتكرار أو اثنين. الأداء الصحيح أولًا.', 'إن بدا تمرين صعبًا جدًا فاستخدم نسخة أسهل (الركبتان، سطح أعلى) وارتقِ حين تصبح الحركة سلسة.'] } },

    ppl: {
      en: { how: 'A six-day split: push days (chest, shoulders, triceps), pull days (back, biceps) and leg days, then repeat. The seventh day is rest. Warm up for 5 minutes, then do the exercises in order with 60 to 90 seconds of rest between sets.',
        tips: ['If you only have one bar, treat the pull days as the priority. They are the hardest to replace.', 'Listen to your joints: swap in an easier version if your wrists or elbows ache.'] },
      ar: { how: 'تقسيم لستة أيام: أيام دفع (صدر وكتف وترايسبس) وأيام سحب (ظهر وبايسبس) وأيام أرجل، ثم يتكرر. اليوم السابع راحة. سخّن 5 دقائق ثم نفّذ التمارين بالترتيب مع راحة 60 إلى 90 ثانية بين المجموعات.',
        tips: ['إن كانت لديك عقلة واحدة فاجعل أيام السحب أولوية، فهي الأصعب في التعويض.', 'أنصت لمفاصلك: اختر نسخة أسهل إن شعرت بألم في الرسغين أو المرفقين.'] } },

    big6: {
      en: { how: 'Three sessions a week built on a few key movement patterns: a push, a pull, a squat, a leg raise and a bridge. The same moves get harder through more reps rather than new exercises, so you can focus on doing each one well.',
        tips: ['Quality over speed: lower slowly and use the full range.', 'Use your rest days for walking or gentle stretching.'] },
      ar: { how: 'ثلاث حصص أسبوعيًا مبنية على عدة أنماط حركة أساسية: دفع وسحب وسكوات ورفع ساقين وجسر. تزداد الصعوبة بزيادة التكرارات لا بتمارين جديدة، فتركّز على أداء كل حركة جيدًا.',
        tips: ['الجودة قبل السرعة: انزل ببطء واستخدم المدى الكامل.', 'استغل أيام الراحة في المشي أو الإطالة الخفيفة.'] } },

    corecrusher: {
      en: { how: 'Four short core sessions a week mixing floor work, planks and hanging moves. Rest 30 to 45 seconds between sets. For the holds, try to add a few seconds every week.',
        tips: ['Breathe out on the effort and in on the way back.', 'Keep your lower back flat on the floor during leg moves. A smaller range with control beats a big range that arches the back.'] },
      ar: { how: 'أربع حصص قصيرة للبطن أسبوعيًا تجمع بين تمارين الأرض والبلانك والتدلي. استرح من 30 إلى 45 ثانية بين المجموعات. في التمارين الثابتة حاول زيادة بضع ثوانٍ كل أسبوع.',
        tips: ['ازفر عند الجهد واشهق عند العودة.', 'أبقِ أسفل ظهرك ملتصقًا بالأرض في تمارين الساقين. مدى أصغر مع تحكم أفضل من مدى كبير يقوّس الظهر.'] } },

    legsglutes: {
      en: { how: 'Three leg sessions a week mixing squats, lunges, bridges, calf work and jumps. Rest about 60 seconds between sets and leave a day between sessions so your legs can recover.',
        tips: ['Push through your whole foot with your heels down.', 'If your knees complain, make the range smaller and slow down.'] },
      ar: { how: 'ثلاث حصص للأرجل أسبوعيًا تجمع بين السكوات واللانجز والجسر والسمانة والقفز. استرح نحو 60 ثانية بين المجموعات واترك يومًا بين الحصص لتتعافى ساقاك.',
        tips: ['ادفع بكامل القدم وكعباك على الأرض.', 'إن شعرت بألم في الركبتين فصغّر المدى وأبطئ الحركة.'] } },

    armspro: {
      en: { how: 'Three sessions a week for your arms and shoulders: triceps, biceps and shoulders without weights. You will need a bar or a sturdy low bar for the chin-ups and the rows. Rest 60 to 90 seconds between sets.',
        tips: ['Keep your elbows close to your body on pushing moves.', 'Avoid training arms on consecutive days.'] },
      ar: { how: 'ثلاث حصص أسبوعيًا للذراعين والكتفين: ترايسبس وبايسبس وكتف بدون أوزان. تحتاج عقلة أو قضيبًا منخفضًا ثابتًا لتمارين العقلة والسحب. استرح 60 إلى 90 ثانية بين المجموعات.',
        tips: ['أبقِ المرفقين قريبين من جسمك في حركات الدفع.', 'تجنّب تدريب الذراعين في أيام متتالية.'] } },

    circuits: {
      en: { how: 'Four circuit sessions a week. Go through the exercises in order as one round, rest briefly after the round, then repeat. Keep the pace up but the form clean.',
        tips: ['Start slowly and speed up once you are warm.', 'Use the interval timer on the Train page for your work and rest times.'] },
      ar: { how: 'أربع حصص دائرية أسبوعيًا. أدِّ التمارين بالترتيب كجولة واحدة، ثم استرح قليلًا وكرّر. حافظ على سرعة جيدة مع أداء نظيف.',
        tips: ['ابدأ ببطء وزد السرعة بعد أن يسخن جسمك.', 'استخدم مؤقت الفواصل في صفحة التمرين لأوقات العمل والراحة.'] } },

    streetvol: {
      en: { how: 'A four-day volume block for people who already do pull-ups and dips. It mixes bar work, dips, push-ups and legs with more reps each week. Rest about 90 seconds on the harder sets.',
        tips: ['Use the Train page timer for your rest periods.', 'Take a full rest day after two hard days in a row.'] },
      ar: { how: 'أسبوع من أربعة أيام لحجم التمرين لمن يؤدي العقلة والديبس بالفعل. يجمع بين العقلة والمتوازي والضغط والأرجل مع تكرارات أكثر كل أسبوع. استرح نحو 90 ثانية في المجموعات الصعبة.',
        tips: ['استخدم مؤقت صفحة التمرين لفترات الراحة.', 'خذ يوم راحة كاملًا بعد يومين شاقين متتاليين.'] } },

    pushup30: {
      en: { how: 'Four short sessions a week that build your push-up step by step, from easier variations to the full push-up and beyond. Rest 60 to 90 seconds between sets.',
        tips: ['Test yourself once a week: how many clean push-ups can you do?', 'Move on to the harder variation only when the current one feels smooth.'] },
      ar: { how: 'أربع حصص قصيرة أسبوعيًا تبني تمرين الضغط خطوة بخطوة، من النسخ الأسهل إلى الضغط الكامل وما بعده. استرح 60 إلى 90 ثانية بين المجموعات.',
        tips: ['اختبر نفسك مرة أسبوعيًا: كم ضغطة نظيفة تستطيع؟', 'انتقل إلى النسخة الأصعب فقط حين تصبح الحالية سلسة.'] } },

    pullup30: {
      en: { how: 'Four sessions a week that take you from hanging to your first pull-up using slow negatives, rows and hangs. You need a pull-up bar, and a sturdy low bar or table for the rows. Rest about 90 seconds between sets.',
        tips: ['Slow lowering is the secret. Count 3 to 5 seconds.', 'Rest a full day between sessions. Tendons adapt slowly.'] },
      ar: { how: 'أربع حصص أسبوعيًا تنقلك من التدلي إلى أول عقلة لك باستخدام النزول البطيء والسحب والتدلي. تحتاج عقلة، وقضيبًا منخفضًا ثابتًا أو طاولة لتمارين السحب. استرح نحو 90 ثانية بين المجموعات.',
        tips: ['النزول البطيء هو السر. عُدّ من 3 إلى 5 ثوانٍ.', 'خذ يوم راحة كاملًا بين الحصص، فالأوتار تتكيّف ببطء.'] } },

    abs30: {
      en: { how: 'Five short core sessions a week mixing crunch variations, planks, leg raises and hanging work. Rest 30 to 45 seconds between sets.',
        tips: ['Visible abs come from food and sleep as well as training.', 'Keep your lower back pressed down in leg moves.'] },
      ar: { how: 'خمس حصص قصيرة للبطن أسبوعيًا تجمع بين أنواع الكرانش والبلانك ورفع الساقين والتدلي. استرح من 30 إلى 45 ثانية بين المجموعات.',
        tips: ['ظهور عضلات البطن يأتي من الغذاء والنوم كما يأتي من التمرين.', 'أبقِ أسفل ظهرك ملتصقًا بالأرض في تمارين الساقين.'] } },

    lean30: {
      en: { how: 'Five mixed sessions a week combining cardio bursts with strength moves for the whole body. Keep rests short (30 to 45 seconds) to keep your heart rate up.',
        tips: ['Pair it with daily walking and good sleep.', 'Choose an easier version and keep going rather than stopping mid-session.'] },
      ar: { how: 'خمس حصص متنوعة أسبوعيًا تجمع بين دفعات الكارديو وتمارين القوة لكامل الجسم. اجعل الراحة قصيرة (30 إلى 45 ثانية) ليبقى نبضك مرتفعًا.',
        tips: ['اقرنها بالمشي اليومي ونوم جيد.', 'اختر نسخة أسهل وواصل بدل التوقف في منتصف الحصة.'] } },

    street30: {
      en: { how: 'Four strength sessions a week for people who can already do some pull-ups and dips. The main moves use fewer reps with long rests (about 2 minutes).',
        tips: ['Put form first on heavy sets and leave a rep or two in reserve.', 'Warm up your wrists and shoulders for 5 minutes.'] },
      ar: { how: 'أربع حصص قوة أسبوعيًا لمن يستطيع أداء بعض العقلات والديبس. تستخدم الحركات الرئيسية تكرارات أقل مع راحة طويلة (نحو دقيقتين).',
        tips: ['ضع الأداء الصحيح أولًا في المجموعات الثقيلة واترك تكرارًا أو اثنين احتياطًا.', 'سخّن الرسغين والكتفين 5 دقائق.'] } },

    squat30: {
      en: { how: 'Four lower-body sessions a week that build from squats and lunges to jumps and single-leg work. Leave a day between sessions if your legs are very sore.',
        tips: ['Eat enough protein to recover well.', 'Walk on your days off.'] },
      ar: { how: 'أربع حصص للجزء السفلي أسبوعيًا تتدرج من السكوات واللانجز إلى القفز والعمل على رجل واحدة. اترك يومًا بين الحصص إن كانت ساقاك مؤلمتين جدًا.',
        tips: ['تناول بروتينًا كافيًا لتتعافى جيدًا.', 'امشِ في أيام الراحة.'] } },

    handstand: {
      en: { how: 'Four sessions a week for six weeks. Wall holds and wall walks teach you the shape, the hollow hold and plank build the strength, and free handstand attempts arrive in the last weeks. Warm up your wrists first.',
        tips: ['Spend most of your time on quality wall holds.', 'Short practice often beats one long session.'] },
      ar: { how: 'أربع حصص أسبوعيًا لمدة ستة أسابيع. الثبات على الحائط والمشي على الحائط يعلّمانك الشكل، والهولو والبلانك يبنيان القوة، وتأتي محاولات الوقوف الحر في الأسابيع الأخيرة. سخّن الرسغين أولًا.',
        tips: ['اقضِ معظم وقتك في ثبات جيد على الحائط.', 'تمرين قصير متكرر أفضل من حصة طويلة واحدة.'] } },

    frontlever: {
      en: { how: 'Three sessions a week over six weeks. Pulling strength (pull-ups and rows), shoulder control (scapular pulls and hangs) and core work (hollow holds and leg raises) feed into the tuck and advanced tuck holds. You need a pull-up bar.',
        tips: ['Keep your arms straight on the holds.', 'End a hold when your form breaks, not when you are exhausted.'] },
      ar: { how: 'ثلاث حصص أسبوعيًا على مدى ستة أسابيع. قوة السحب (العقلة والسحب) والتحكم بالكتف (سحب لوحي الكتف والتدلي) وتمارين البطن (الهولو ورفع الساقين) تغذي ثبات الرافعة المطوية والمطوية المتقدمة. تحتاج عقلة.',
        tips: ['أبقِ ذراعيك مستقيمتين في التمارين الثابتة.', 'أنهِ الثبات حين يختلّ الأداء لا حين تنهار من التعب.'] } },

    planche: {
      en: { how: 'Three sessions a week over six weeks. Lean holds and pseudo planche push-ups strengthen your shoulders and wrists, and tuck holds come as your lean improves. Warm up your wrists thoroughly.',
        tips: ['Wrist prep matters: rock gently on your hands before you start.', 'Take extra rest days if your wrists ache.'] },
      ar: { how: 'ثلاث حصص أسبوعيًا على مدى ستة أسابيع. ثبات الميل وضغط البلانش الكاذب يقويان الكتفين والرسغين، ويأتي ثبات الطيّ مع تحسّن الميل. سخّن الرسغين جيدًا.',
        tips: ['تسخين الرسغين مهم: تمايل برفق على يديك قبل البدء.', 'خذ أيام راحة إضافية إن شعرت بألم في الرسغين.'] } },

    muscleup: {
      en: { how: 'Four sessions a week over six weeks. Pull-ups and explosive pulls build the pulling strength, dips and push-ups build the pushing strength, and the final muscle-up attempts put them together. You need a pull-up bar.',
        tips: ['Your explosive pull should reach your chest, not just your chin.', 'Practise the transition with a low bar or a band.'] },
      ar: { how: 'أربع حصص أسبوعيًا على مدى ستة أسابيع. العقلة والسحب الانفجاري يبنيان قوة السحب، والديبس والضغط يبنيان قوة الدفع، وتجمعهما محاولات المسل أب الأخيرة. تحتاج عقلة.',
        tips: ['يجب أن يصل سحبك الانفجاري إلى صدرك لا إلى ذقنك فقط.', 'تدرّب على الانتقال بقضيب منخفض أو حبل مطاطي.'] } },

    lsit: {
      en: { how: 'Three sessions a week over six weeks. Tuck L-sits lead into full L-sits and then V-sit work, while dips and hanging core raises build the shoulder and core strength.',
        tips: ['Keep your shoulders pushed down away from your ears.', 'Many short sets beat one long set to failure.'] },
      ar: { how: 'ثلاث حصص أسبوعيًا على مدى ستة أسابيع. تقودك L-sit المطوية إلى L-sit الكاملة ثم إلى V-sit، بينما يبني الديبس ورفع الساقين من التدلي قوة الكتف والبطن.',
        tips: ['أبقِ كتفيك مدفوعين للأسفل بعيدًا عن الأذنين.', 'مجموعات قصيرة كثيرة أفضل من مجموعة طويلة حتى الفشل.'] } },

    pistol: {
      en: { how: 'Three sessions a week over six weeks. Assisted pistols, bulgarian split squats and single-leg bridges build the strength and balance for the full single-leg squat.',
        tips: ['Hold a door frame or a pole while you learn the depth.', 'Warm up your ankles and hips first.'] },
      ar: { how: 'ثلاث حصص أسبوعيًا على مدى ستة أسابيع. البيستول بمساعدة والسكوات البلغاري وجسر الأرداف بقدم واحدة تبني القوة والتوازن اللازمين للسكوات الكامل على رجل واحدة.',
        tips: ['أمسك إطار باب أو عمودًا أثناء تعلّم العمق.', 'سخّن الكاحلين والوركين أولًا.'] } }
  });
});
