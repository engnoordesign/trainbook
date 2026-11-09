/* How-to texts: legs and full body. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) factory(require('./guides.js')); else factory(root.Guides);
})(this, function (G) {
  'use strict';
  G.add({
    squat: { m: 'quads glutes hamstrings core', e: '',
      en: { s: ['Stand with your feet a little wider than your hips, toes slightly out, arms in front of you.', 'Sit your hips back and down as if sitting into a chair, until your thighs are at least parallel to the floor.', 'Press through your whole foot to stand up tall.'],
        t: 'Keep your chest up and your heels on the floor.', x: 'Knees caving inward.' },
      ar: { s: ['قف وقدماك أوسع قليلًا من الوركين وأصابع القدمين مائلة للخارج قليلًا والذراعان أمامك.', 'ادفع الورك للخلف وللأسفل كأنك تجلس على كرسي حتى يصبح الفخذان موازيين للأرض على الأقل.', 'ادفع بكامل القدم لتقف منتصبًا.'],
        t: 'أبقِ صدرك مرفوعًا وكعبيك على الأرض.', x: 'انهيار الركبتين إلى الداخل.' } },

    jumpsquat: { m: 'quads glutes calves cardio', e: '',
      en: { s: ['Squat down, swinging your arms back.', 'Drive up explosively and jump as high as you can, swinging your arms up.', 'Land softly on the balls of your feet and go straight into the next squat.'],
        t: 'Land quietly, with soft knees and hips.', x: 'Landing with stiff, straight legs.' },
      ar: { s: ['انزل في وضع السكوات مع تأرجح الذراعين للخلف.', 'انطلق للأعلى بقوة واقفز أعلى ما تستطيع مع رفع الذراعين.', 'اهبط بخفة على مقدمة القدمين وادخل مباشرة في السكوات التالي.'],
        t: 'اهبط بهدوء والركبتان والورك مرنة.', x: 'الهبوط بساقين مشدودتين متصلبتين.' } },

    lunge: { m: 'quads glutes hamstrings core', e: '',
      en: { s: ['Stand tall and step one foot forward about one long stride.', 'Lower your back knee toward the floor until both knees are at about 90 degrees.', 'Push through your front heel to stand, then repeat on the other side.'],
        t: 'Keep your torso upright and your front knee over your ankle.', x: 'Letting the front knee cave inward or shoot far past the toes.' },
      ar: { s: ['قف منتصبًا وخذ خطوة طويلة للأمام بقدم واحدة.', 'أنزل الركبة الخلفية نحو الأرض حتى تصبح الركبتان بزاوية 90 درجة تقريبًا.', 'ادفع بكعب القدم الأمامية لتقف، ثم كرّر على الجهة الأخرى.'],
        t: 'أبقِ جذعك منتصبًا والركبة الأمامية فوق الكاحل.', x: 'انهيار الركبة الأمامية للداخل أو تجاوزها أصابع القدم كثيرًا.' } },

    bulgarian: { m: 'quads glutes hamstrings core', e: 'chair',
      en: { s: ['Stand about one stride in front of a chair and rest the top of your back foot on it.', 'Lower straight down until your front thigh is parallel to the floor.', 'Drive through your front heel to stand. Finish all your reps, then switch legs.'],
        t: 'Step further away from the chair to feel your glutes more.', x: 'Pushing off the back foot.' },
      ar: { s: ['قف على بعد خطوة من كرسي وضع ظهر قدمك الخلفية عليه.', 'انزل للأسفل مباشرة حتى يصبح فخذك الأمامي موازيًا للأرض.', 'ادفع بكعب القدم الأمامية لتقف. أكمل التكرارات ثم بدّل الرجل.'],
        t: 'ابتعد عن الكرسي قليلًا لتشعر بالأرداف أكثر.', x: 'الدفع بالقدم الخلفية.' } },

    cossack: { m: 'quads glutes hips hamstrings', e: '',
      en: { s: ['Stand with a very wide stance, toes slightly out.', 'Shift your weight onto one leg and sit deep into it while the other leg stays straight with the toes up.', 'Push back to the middle and switch sides.'],
        t: 'Keep the heel down on the bent leg and your chest tall.', x: 'Lifting the heel of the working leg.' },
      ar: { s: ['قف بقدمين متباعدتين جدًا وأصابع القدمين مائلة للخارج قليلًا.', 'انقل وزنك إلى رجل واحدة واجلس عميقًا عليها بينما تبقى الأخرى مستقيمة وأصابعها للأعلى.', 'ادفع للعودة إلى المنتصف ثم بدّل الجهة.'],
        t: 'أبقِ كعب الرجل المثنية على الأرض وصدرك مرفوعًا.', x: 'رفع كعب الرجل العاملة.' } },

    pistolassist: { m: 'quads glutes hamstrings core', e: 'pole',
      en: { s: ['Hold a sturdy pole or door frame and stand on one leg with the other leg out in front.', 'Sit down slowly on the standing leg as deep as you can, using your hands only for balance.', 'Push through the heel to stand. Pull less with your hands as you get stronger.'],
        t: 'Keep your standing heel flat on the floor.', x: 'Pulling yourself up with your arms.' },
      ar: { s: ['أمسك عمودًا ثابتًا أو إطار باب وقف على رجل واحدة والأخرى ممدودة للأمام.', 'اجلس ببطء على الرجل الواقفة بأعمق ما تستطيع، واستخدم يديك للتوازن فقط.', 'ادفع بالكعب لتقف. اسحب بيديك أقل كلما قويت.'],
        t: 'أبقِ كعب الرجل الواقفة ملتصقًا بالأرض.', x: 'رفع الجسم بقوة الذراعين.' } },

    pistol: { m: 'quads glutes hamstrings core', e: '',
      en: { s: ['Stand on one leg with the other leg straight out in front and your arms forward.', 'Sit back and down slowly, keeping your free leg off the floor, as deep as you can control.', 'Drive up through your heel to stand.'],
        t: 'Go to the lowest point you can control, then go a little lower each week.', x: 'Collapsing at the bottom and falling backward.' },
      ar: { s: ['قف على رجل واحدة والأخرى ممدودة للأمام والذراعان أمامك.', 'اجلس للخلف وللأسفل ببطء مع إبقاء الرجل الحرة عن الأرض، بأعمق ما تتحكم فيه.', 'ادفع بالكعب لتقف.'],
        t: 'انزل إلى أدنى نقطة تتحكم فيها ثم أنزل أكثر قليلًا كل أسبوع.', x: 'الانهيار في الأسفل والسقوط للخلف.' } },

    glute: { m: 'glutes hamstrings core', e: '',
      en: { s: ['Lie on your back with your knees bent, feet flat and hip width apart.', 'Press through your heels and lift your hips until your body is a straight line from knees to shoulders.', 'Squeeze your glutes at the top for a second, then lower.'],
        t: 'Tuck your ribs down so the work stays in your glutes, not your lower back.', x: 'Arching the lower back at the top.' },
      ar: { s: ['استلقِ على ظهرك وركبتاك مثنيتان والقدمان على الأرض بعرض الوركين.', 'ادفع بكعبيك وارفع حوضك حتى يصبح جسمك خطًا مستقيمًا من الركبتين إلى الكتفين.', 'اعصر الأرداف في الأعلى لثانية ثم انزل.'],
        t: 'اخفض أضلاعك ليبقى الجهد في الأرداف لا في أسفل الظهر.', x: 'تقوّس أسفل الظهر في القمة.' } },

    sglute: { m: 'glutes hamstrings core', e: '',
      en: { s: ['Lie on your back with one foot flat on the floor and the other leg held straight up or hugged to your chest.', 'Press through the heel on the floor and lift your hips until they are level.', 'Lower under control. Do all your reps on one leg, then switch.'],
        t: 'Keep your hips level. Do not let one side drop.', x: 'Twisting the hips toward the lifted leg.' },
      ar: { s: ['استلقِ على ظهرك وقدم واحدة مسطحة على الأرض والرجل الأخرى مرفوعة مستقيمة أو مضمومة إلى صدرك.', 'ادفع بكعب القدم التي على الأرض وارفع حوضك حتى يصبح مستويًا.', 'انزل بتحكم. أكمل كل التكرارات على رجل ثم بدّل.'],
        t: 'أبقِ الحوض مستويًا ولا تدع أحد الجانبين يسقط.', x: 'لفّ الحوض نحو الرجل المرفوعة.' } },

    calf: { m: 'calves', e: '',
      en: { s: ['Stand tall with your feet hip width apart. Hold a wall for balance if you like.', 'Rise as high as you can onto the balls of your feet.', 'Pause for a second at the top and lower slowly.'],
        t: 'Stand on the edge of a step to get a bigger stretch at the bottom.', x: 'Bouncing instead of pausing at the top.' },
      ar: { s: ['قف منتصبًا وقدماك بعرض الوركين، ويمكنك الإمساك بحائط للتوازن.', 'ارتفع إلى أعلى ما تستطيع على مقدمة القدمين.', 'اثبت ثانية في الأعلى ثم انزل ببطء.'],
        t: 'قف على حافة درجة للحصول على مط أكبر في الأسفل.', x: 'الارتداد بدل التوقف في الأعلى.' } },

    wallsit: { m: 'quads glutes calves', e: 'wall',
      en: { s: ['Lean your back against a wall and slide down until your knees form a right angle.', 'Keep your feet flat, your knees over your ankles and your hands off your thighs.', 'Hold, breathing steadily.'],
        t: 'Press your lower back lightly into the wall.', x: 'Sitting too high, or letting the knees travel past the toes.' },
      ar: { s: ['أسند ظهرك إلى الحائط وانزل حتى تصبح ركبتاك بزاوية قائمة.', 'أبقِ قدميك مسطحتين والركبتين فوق الكاحلين واليدين بعيدتين عن الفخذين.', 'اثبت وتنفّس بانتظام.'],
        t: 'اضغط أسفل ظهرك برفق على الحائط.', x: 'الجلوس مرتفعًا جدًا أو تجاوز الركبتين أصابع القدم.' } },

    stepup: { m: 'quads glutes hamstrings', e: 'chair',
      en: { s: ['Place one whole foot on a sturdy chair or step.', 'Press through that foot and stand tall on the chair, lifting the other knee.', 'Step back down with control. Finish your reps on one side, then switch.'],
        t: 'Use the leg on the chair. Do not push off the leg on the floor.', x: 'Leaning forward and pushing with the back foot.' },
      ar: { s: ['ضع قدمًا واحدة كاملة على كرسي ثابت أو درجة.', 'ادفع بهذه القدم وقف منتصبًا على الكرسي مع رفع الركبة الأخرى.', 'انزل بتحكم. أكمل التكرارات على جهة ثم بدّل.'],
        t: 'اعمل بالرجل التي على الكرسي ولا تدفع بالرجل التي على الأرض.', x: 'الميل للأمام والدفع بالقدم الخلفية.' } },

    tuckjump: { m: 'quads glutes calves cardio', e: '',
      en: { s: ['Stand with your feet hip width apart and bend slightly.', 'Jump explosively and pull both knees up toward your chest.', 'Land softly on the balls of your feet with bent knees, then reset.'],
        t: 'Jump height matters more than speed.', x: 'Landing stiffly with locked knees.' },
      ar: { s: ['قف وقدماك بعرض الوركين وانحنِ قليلًا.', 'اقفز بقوة واسحب الركبتين معًا نحو صدرك.', 'اهبط بخفة على مقدمة القدمين وركبتاك مثنيتان، ثم استعد.'],
        t: 'ارتفاع القفزة أهم من سرعتها.', x: 'الهبوط بتصلّب وركبتان مقفلتان.' } },

    burpee: { m: 'cardio chest quads core shoulders', e: '',
      en: { s: ['From standing, squat down and place your hands on the floor.', 'Jump or step your feet back into a plank, and lower your chest to the floor if you want the push-up.', 'Jump your feet back to your hands, then explode up into a jump with your arms overhead.'],
        t: 'Find a steady rhythm and breathe out as you jump.', x: 'Sagging hips in the plank.' },
      ar: { s: ['من الوقوف انزل إلى القرفصاء وضع يديك على الأرض.', 'اقفز أو ارجع بقدميك إلى وضع البلانك، وأنزل صدرك للأرض إن أردت إضافة الضغط.', 'اقفز بقدميك إلى يديك ثم انطلق للأعلى بقفزة وذراعاك فوق رأسك.'],
        t: 'اعثر على إيقاع ثابت وازفر عند القفز.', x: 'انهيار الحوض في وضع البلانك.' } },

    jacks: { m: 'cardio shoulders calves', e: '',
      en: { s: ['Stand with your feet together and your arms at your sides.', 'Jump your feet out wide while swinging your arms overhead.', 'Jump back to the start. Keep a light, bouncy rhythm.'],
        t: 'Land softly on the balls of your feet.', x: 'Locking the knees on landing.' },
      ar: { s: ['قف وقدماك معًا والذراعان بجانبك.', 'اقفز بقدميك للخارج مع رفع الذراعين فوق رأسك.', 'اقفز عائدًا إلى الوضع الأول بإيقاع خفيف.'],
        t: 'اهبط بخفة على مقدمة القدمين.', x: 'قفل الركبتين عند الهبوط.' } },

    highknees: { m: 'cardio quads hips core', e: '',
      en: { s: ['Stand tall and run in place, driving each knee up to about hip height.', 'Pump your arms opposite to your legs.', 'Stay on the balls of your feet and keep your torso upright.'],
        t: 'Take quick, light steps and keep your chest up.', x: 'Leaning back.' },
      ar: { s: ['قف منتصبًا واركض في مكانك وارفع كل ركبة إلى مستوى الورك تقريبًا.', 'حرّك ذراعيك عكس رجليك.', 'ابقَ على مقدمة القدمين وجذعك منتصب.'],
        t: 'خطوات سريعة وخفيفة وصدر مرفوع.', x: 'الميل إلى الخلف.' } },

    bearcrawl: { m: 'shoulders core quads cardio', e: '',
      en: { s: ['Get on all fours, then lift your knees a hand-width off the floor.', 'Move your opposite hand and foot forward together, keeping your back flat.', 'Keep your hips low and steady. Crawl forward, then backward.'],
        t: 'Look at the floor just ahead to keep your neck relaxed.', x: 'Hips rising and swaying side to side.' },
      ar: { s: ['اركع على أربع ثم ارفع ركبتيك عن الأرض بمقدار عرض كف.', 'حرّك اليد والقدم المتقابلتين للأمام معًا مع إبقاء ظهرك مسطحًا.', 'أبقِ الحوض منخفضًا وثابتًا. ازحف للأمام ثم للخلف.'],
        t: 'انظر إلى الأرض أمامك قليلًا ليبقى عنقك مرتاحًا.', x: 'ارتفاع الحوض وتمايله.' } },

    inchworm: { m: 'hamstrings core shoulders chest', e: '',
      en: { s: ['Stand tall, then fold forward and place your hands on the floor (bend your knees if you need to).', 'Walk your hands forward until you reach a straight plank position.', 'Walk your feet toward your hands in small steps and stand up.'],
        t: 'Keep your legs as straight as you can for a good hamstring stretch.', x: 'Letting the hips sag in the plank.' },
      ar: { s: ['قف منتصبًا ثم انحنِ للأمام وضع يديك على الأرض (اثنِ ركبتيك إن احتجت).', 'امشِ بيديك للأمام حتى تصل إلى وضع البلانك المستقيم.', 'امشِ بقدميك نحو يديك بخطوات صغيرة ثم قف.'],
        t: 'أبقِ ساقيك مستقيمتين قدر الإمكان لتحصل على مط جيد للخلفية.', x: 'انهيار الحوض في وضع البلانك.' } }
  });
});
