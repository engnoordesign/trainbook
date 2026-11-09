/* How-to texts: back and core. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) factory(require('./guides.js')); else factory(root.Guides);
})(this, function (G) {
  'use strict';
  G.add({
    pullup: { m: 'lats upperback biceps forearms core', e: 'bar',
      en: { s: ['Grab a bar with your palms facing away, hands just wider than your shoulders, and hang with straight arms.', 'Pull yourself up until your chin clears the bar, driving your elbows down toward your ribs.', 'Lower slowly under control to straight arms.'],
        t: 'Start each rep by pulling your shoulder blades down, away from your ears.', x: 'Kicking or swinging, and half reps.' },
      ar: { s: ['أمسك العقلة وراحتاك للأمام بعرض أوسع قليلًا من الكتفين وتدلَّ بذراعين مستقيمتين.', 'اسحب جسمك حتى يتجاوز ذقنك العقلة وادفع المرفقين نحو أضلاعك.', 'انزل ببطء وبتحكم حتى تستقيم الذراعان.'],
        t: 'ابدأ كل تكرار بسحب لوحي الكتف للأسفل بعيدًا عن الأذنين.', x: 'الركل أو التأرجح، وتكرارات ناقصة المدى.' } },

    negpull: { m: 'lats upperback biceps forearms', e: 'bar',
      en: { s: ['Use a chair or jump up to the top position with your chin above the bar.', 'Lower yourself as slowly as you can, taking 3 to 5 seconds.', 'Reach a full hang, reset and repeat.'],
        t: 'Slower is better. The lowering builds the strength to pull.', x: 'Dropping fast.' },
      ar: { s: ['استعن بكرسي أو اقفز إلى الوضع العلوي وذقنك فوق العقلة.', 'انزل بأبطأ ما تستطيع خلال 3 إلى 5 ثوانٍ.', 'ثم تدلَّ تمامًا، استعد وكرّر.'],
        t: 'كلما كان النزول أبطأ كان أفضل، فهو ما يبني قوة السحب.', x: 'السقوط بسرعة.' } },

    invrow: { m: 'lats upperback biceps core', e: 'lowbar',
      en: { s: ['Lie under a low bar or sturdy table and grip it a little wider than your shoulders.', 'Keep your body straight as a plank and pull your chest to the bar.', 'Lower slowly to straight arms.'],
        t: 'Bend your knees to make it easier, raise your feet to make it harder.', x: 'Hips sagging.' },
      ar: { s: ['استلقِ تحت قضيب منخفض أو طاولة ثابتة وأمسكها بعرض أوسع قليلًا من الكتفين.', 'أبقِ جسمك مستقيمًا كالبلانك واسحب صدرك نحو القضيب.', 'انزل ببطء حتى تستقيم الذراعان.'],
        t: 'اثنِ ركبتيك ليسهل التمرين وارفع قدميك ليصعب.', x: 'انهيار الحوض.' } },

    scap: { m: 'upperback lats forearms', e: 'bar',
      en: { s: ['Hang from a bar with straight arms.', 'Without bending your elbows, pull your shoulder blades down and back so your body rises a little.', 'Release slowly to a full hang.'],
        t: 'It is a small movement. Think shoulders away from ears.', x: 'Bending the arms.' },
      ar: { s: ['تدلَّ من العقلة بذراعين مستقيمتين.', 'دون ثني المرفقين اسحب لوحي الكتف للأسفل والخلف فيرتفع جسمك قليلًا.', 'ارجع ببطء إلى التدلي الكامل.'],
        t: 'الحركة صغيرة. فكّر في إبعاد الكتفين عن الأذنين.', x: 'ثني الذراعين.' } },

    deadhang: { m: 'forearms lats shoulders', e: 'bar',
      en: { s: ['Grip a bar with both hands, shoulder width apart.', 'Let your body hang with straight arms and relaxed legs, shoulders slightly active.', 'Hold and breathe. Build up the time over the weeks.'],
        t: 'Keep your shoulders slightly active instead of hanging completely loose.', x: 'Gripping so hard that you tire out early.' },
      ar: { s: ['أمسك العقلة بيديك بعرض الكتفين.', 'دع جسمك يتدلى بذراعين مستقيمتين وساقين مرتخيتين وكتفين نشطين قليلًا.', 'اثبت وتنفّس. زد المدة تدريجيًا عبر الأسابيع.'],
        t: 'أبقِ الكتفين نشطين قليلًا بدل التدلي المرتخي تمامًا.', x: 'القبض بقوة زائدة فتتعب سريعًا.' } },

    superman: { m: 'upperback glutes hamstrings core', e: '',
      en: { s: ['Lie face down with your arms stretched forward and your legs straight.', 'Lift your arms, chest and legs off the floor at the same time.', 'Hold the top for the planned time, then lower slowly.'],
        t: 'Keep your neck long and look at the floor.', x: 'Cranking your neck back.' },
      ar: { s: ['استلقِ على بطنك والذراعان ممدودتان للأمام والساقان مستقيمتان.', 'ارفع ذراعيك وصدرك وساقيك عن الأرض في الوقت نفسه.', 'اثبت في الأعلى للمدة المطلوبة ثم انزل ببطء.'],
        t: 'أبقِ عنقك طويلًا وانظر إلى الأرض.', x: 'ثني العنق للخلف بقوة.' } },

    widepull: { m: 'lats upperback biceps forearms', e: 'bar',
      en: { s: ['Grip a bar with your hands well wider than your shoulders and hang with straight arms.', 'Pull your chest up toward the bar, elbows going out and down.', 'Lower slowly until your arms are straight.'],
        t: 'Think of pulling the bar down to your chest rather than pulling yourself up.', x: 'Chin poking forward instead of chest rising.' },
      ar: { s: ['أمسك العقلة بيدين أوسع كثيرًا من الكتفين وتدلَّ بذراعين مستقيمتين.', 'اسحب صدرك نحو العقلة والمرفقان يتجهان للخارج وللأسفل.', 'انزل ببطء حتى تستقيم الذراعان.'],
        t: 'تخيّل أنك تسحب العقلة نحو صدرك لا أنك ترفع جسمك.', x: 'دفع الذقن للأمام بدل رفع الصدر.' } },

    archerpull: { m: 'lats upperback biceps forearms', e: 'bar',
      en: { s: ['Grip a bar much wider than your shoulders.', 'Pull toward one hand, bending that arm while the other arm stays nearly straight.', 'Lower and switch sides.'],
        t: 'Pull toward the side of the bent arm.', x: 'Not controlling the straight arm.' },
      ar: { s: ['أمسك العقلة بعرض أوسع بكثير من الكتفين.', 'اسحب نحو إحدى اليدين وأثنِ تلك الذراع بينما تبقى الأخرى شبه مستقيمة.', 'انزل ثم بدّل الجهة.'],
        t: 'اسحب نحو جهة الذراع المثنية.', x: 'عدم التحكم في الذراع المستقيمة.' } },

    explpull: { m: 'lats upperback biceps core', e: 'bar',
      en: { s: ['Hang from the bar and pull explosively so your chest comes up to the bar.', 'Aim to rise as high as you can, as fast as you can.', 'Lower under control.'],
        t: 'Pull as fast as possible and lower slowly.', x: 'Kicking with your legs.' },
      ar: { s: ['تدلَّ من العقلة واسحب بقوة انفجارية ليصل صدرك إلى العقلة.', 'حاول الارتفاع أعلى ما تستطيع وبأسرع ما تستطيع.', 'انزل ببطء وبتحكم كامل.'],
        t: 'اسحب بأسرع ما يمكن وانزل ببطء.', x: 'الركل بالساقين.' } },

    muscleup: { m: 'lats chest triceps core forearms', e: 'bar',
      en: { s: ['Hang from the bar, using a false grip (wrists over the bar) if you can.', 'Pull explosively so your chest reaches the bar.', 'Roll your chest over the bar and press up to straight arms on top.', 'Lower slowly back to the hang.'],
        t: 'Practise the transition over the bar with a low bar or a band first.', x: 'Pulling only with the arms and failing at the transition.' },
      ar: { s: ['تدلَّ من العقلة مع قبضة كاذبة (الرسغان فوق العقلة) إن استطعت.', 'اسحب بقوة انفجارية ليصل صدرك إلى العقلة.', 'مرّر صدرك فوق العقلة وادفع للأعلى حتى تستقيم الذراعان.', 'انزل ببطء إلى التدلي.'],
        t: 'تدرّب أولًا على الانتقال فوق العقلة بقضيب منخفض أو حبل مطاطي.', x: 'السحب بالذراعين فقط والفشل عند الانتقال.' } },

    tuckfl: { m: 'lats core upperback forearms', e: 'bar',
      en: { s: ['Hang from a bar and pull your knees in toward your chest.', 'Lean back until your back is horizontal while your arms stay straight.', 'Hold with your back as flat as you can and your shoulders pushing down.'],
        t: 'Round the upper back slightly to start, then flatten it as you get stronger.', x: 'Bending the arms.' },
      ar: { s: ['تدلَّ من العقلة واسحب ركبتيك نحو صدرك.', 'أمِل للخلف حتى يصبح ظهرك أفقيًا بينما تبقى الذراعان مستقيمتين.', 'اثبت وظهرك مسطح قدر الإمكان والكتفان تضغطان للأسفل.'],
        t: 'دوّر أعلى الظهر قليلًا في البداية ثم سطّحه كلما قويت.', x: 'ثني الذراعين.' } },

    advtuckfl: { m: 'lats core upperback forearms', e: 'bar',
      en: { s: ['Hang from a bar and pull into a tuck front lever with your back horizontal.', 'Open your hips so your thighs move away from your chest, but keep your knees bent.', 'Hold with a flat back and straight arms, pushing the bar down.'],
        t: 'Open the tuck a little at a time. Stay flat before you extend further.', x: 'Hips dropping lower than the shoulders.' },
      ar: { s: ['تدلَّ من العقلة وادخل في الرافعة الأمامية المطوية وظهرك أفقي.', 'افتح الوركين فتبتعد فخذاك عن صدرك مع إبقاء الركبتين مثنيتين.', 'اثبت وظهرك مسطح وذراعاك مستقيمتان وأنت تدفع العقلة للأسفل.'],
        t: 'افتح الطيّ قليلًا قليلًا، وحافظ على الظهر المسطح قبل أن تمدّ أكثر.', x: 'نزول الحوض أدنى من الكتفين.' } },

    plank: { m: 'core shoulders glutes', e: '',
      en: { s: ['Rest on your forearms with your elbows under your shoulders and your body straight from head to heels.', 'Squeeze your abs and glutes and push the floor away.', 'Hold, breathing steadily.'],
        t: 'Tuck your tailbone slightly so your abs, not your back, take the load.', x: 'Hips sagging or sticking up.' },
      ar: { s: ['اتكئ على ساعديك والمرفقان تحت الكتفين والجسم مستقيم من الرأس إلى الكعبين.', 'شُدّ البطن والأرداف وادفع الأرض بعيدًا.', 'اثبت وتنفّس بانتظام.'],
        t: 'اقلب الحوض قليلًا للداخل ليتحمل البطن الجهد لا الظهر.', x: 'انهيار الحوض أو ارتفاعه.' } },

    sideplank: { m: 'core hips shoulders', e: '',
      en: { s: ['Lie on your side with your elbow under your shoulder and your legs stacked.', 'Lift your hips until your body is a straight line from head to feet.', 'Hold, then switch sides.'],
        t: 'Stack your hips and shoulders directly above each other.', x: 'Hips dropping toward the floor.' },
      ar: { s: ['استلقِ على جانبك والمرفق تحت الكتف والساقان فوق بعضهما.', 'ارفع حوضك حتى يصبح جسمك خطًا مستقيمًا من الرأس إلى القدمين.', 'اثبت ثم بدّل الجانب.'],
        t: 'اجعل الوركين والكتفين فوق بعضها مباشرة.', x: 'نزول الحوض نحو الأرض.' } },

    hollow: { m: 'core hips quads', e: '',
      en: { s: ['Lie on your back and press your lower back into the floor.', 'Lift your shoulders and straight legs off the floor, arms stretched past your ears.', 'Hold in a shallow banana shape, lower back still pressed down.'],
        t: 'If your back arches, bend your knees or lift your legs a little higher.', x: 'The lower back lifting off the floor.' },
      ar: { s: ['استلقِ على ظهرك واضغط أسفل ظهرك على الأرض.', 'ارفع كتفيك وساقيك المستقيمتين عن الأرض والذراعان ممدودتان بجانب أذنيك.', 'اثبت على شكل موزة خفيفة وأسفل الظهر ملتصق بالأرض.'],
        t: 'إن تقوّس ظهرك فاثنِ ركبتيك أو ارفع ساقيك أكثر قليلًا.', x: 'ارتفاع أسفل الظهر عن الأرض.' } },

    legraise: { m: 'core hips quads', e: '',
      en: { s: ['Lie on your back with your legs straight and your hands under your hips.', 'Raise your legs together until they point to the ceiling.', 'Lower them slowly, stopping just above the floor.'],
        t: 'Press your lower back into the floor the whole time.', x: 'Letting the lower back arch as the legs go down.' },
      ar: { s: ['استلقِ على ظهرك والساقان مستقيمتان واليدان تحت الوركين.', 'ارفع ساقيك معًا حتى تشيرا نحو السقف.', 'أنزلهما ببطء وتوقف قبل الأرض بقليل.'],
        t: 'اضغط أسفل ظهرك على الأرض طوال الوقت.', x: 'تقوّس أسفل الظهر عند نزول الساقين.' } },

    hangknee: { m: 'core hips forearms', e: 'bar',
      en: { s: ['Hang from a bar with straight arms.', 'Pull your knees up toward your chest, curling your pelvis up.', 'Lower slowly without swinging.'],
        t: 'Tilt your pelvis up at the top so it works your abs, not just your legs.', x: 'Swinging to gain speed.' },
      ar: { s: ['تدلَّ من العقلة بذراعين مستقيمتين.', 'ارفع ركبتيك نحو صدرك مع رفع الحوض للأعلى.', 'انزل ببطء دون تأرجح.'],
        t: 'اقلب الحوض للأعلى عند القمة ليعمل البطن لا الساقان فقط.', x: 'التأرجح لكسب الزخم.' } },

    hangleg: { m: 'core hips forearms', e: 'bar',
      en: { s: ['Hang from a bar with straight arms and legs together.', 'Raise your straight legs until they are level with your hips or higher.', 'Lower slowly without swinging.'],
        t: 'Bend your knees slightly if your lower back or hamstrings complain.', x: 'Swinging the legs up with momentum.' },
      ar: { s: ['تدلَّ من العقلة بذراعين مستقيمتين وساقين مضمومتين.', 'ارفع ساقيك المستقيمتين حتى مستوى الوركين أو أعلى.', 'انزل ببطء دون تأرجح.'],
        t: 'اثنِ ركبتيك قليلًا إن شعرت بألم في أسفل الظهر أو الخلفية.', x: 'رفع الساقين بالزخم.' } },

    lsit: { m: 'core hips triceps quads', e: 'lbars',
      en: { s: ['Sit between two sturdy supports (or on the floor) with your hands pressing down beside your hips.', 'Straighten your arms to lift your body, pushing your shoulders down.', 'Hold your legs straight out in front, parallel to the floor.'],
        t: 'Push your shoulders down away from your ears and point your toes.', x: 'Shoulders shrugging up toward the ears.' },
      ar: { s: ['اجلس بين دعامتين ثابتتين (أو على الأرض) واليدان تضغطان بجانب الوركين.', 'مدّ ذراعيك لترفع جسمك وادفع الكتفين للأسفل.', 'أبقِ ساقيك ممدودتين أمامك موازيتين للأرض.'],
        t: 'ادفع الكتفين للأسفل بعيدًا عن الأذنين وشدّ أصابع القدم.', x: 'ارتفاع الكتفين نحو الأذنين.' } },

    tucklsit: { m: 'core hips triceps', e: 'lbars',
      en: { s: ['Sit between two sturdy supports (or on the floor) with your hands pressing down beside your hips.', 'Straighten your arms to lift your body and pull your knees to your chest.', 'Hold, pushing your shoulders down.'],
        t: 'Lean slightly forward to help your hips lift.', x: 'Rounding the shoulders up toward the ears.' },
      ar: { s: ['اجلس بين دعامتين ثابتتين (أو على الأرض) واليدان تضغطان بجانب الوركين.', 'مدّ ذراعيك لترفع جسمك واسحب ركبتيك نحو صدرك.', 'اثبت مع دفع الكتفين للأسفل.'],
        t: 'أمِل جسمك قليلًا للأمام ليساعدك على رفع الوركين.', x: 'رفع الكتفين نحو الأذنين.' } },

    vsit: { m: 'core hips quads triceps', e: 'lbars',
      en: { s: ['Start in an L-sit with your hands pressing down beside your hips.', 'Lean back slightly and lift your straight legs higher than your hips.', 'Hold with your arms locked and your shoulders pushed down.'],
        t: 'Work up to it gradually from the L-sit, a little higher each week.', x: 'Bent knees and bent arms.' },
      ar: { s: ['ابدأ من وضع L-sit واليدان تضغطان بجانب الوركين.', 'أمِل للخلف قليلًا وارفع ساقيك المستقيمتين أعلى من الوركين.', 'اثبت والذراعان مقفلتان والكتفان مدفوعان للأسفل.'],
        t: 'تقدّم تدريجيًا من L-sit، وارفع الساقين أكثر قليلًا كل أسبوع.', x: 'ثني الركبتين والذراعين.' } },

    crunch: { m: 'abs core', e: '',
      en: { s: ['Lie on your back with your knees bent and your feet flat, hands lightly behind your head.', 'Curl your shoulders off the floor by squeezing your abs.', 'Lower slowly without dropping your head.'],
        t: 'Look at the ceiling and keep a fist of space between your chin and chest.', x: 'Pulling on your neck with your hands.' },
      ar: { s: ['استلقِ على ظهرك وركبتاك مثنيتان وقدماك على الأرض واليدان خلف رأسك برفق.', 'ارفع كتفيك عن الأرض بعصر عضلات البطن.', 'انزل ببطء دون إسقاط رأسك.'],
        t: 'انظر إلى السقف وأبقِ مسافة قبضة بين ذقنك وصدرك.', x: 'شدّ العنق باليدين.' } },

    bicycle: { m: 'abs core hips', e: '',
      en: { s: ['Lie on your back with your hands lightly behind your head and your knees lifted.', 'Bring one elbow toward the opposite knee while the other leg stretches out.', 'Switch sides in a smooth pedalling motion.'],
        t: 'Rotate from your ribs and shoulders, not by pulling on your neck.', x: 'Going too fast and only moving the elbows.' },
      ar: { s: ['استلقِ على ظهرك واليدان خلف رأسك برفق والركبتان مرفوعتان.', 'قرّب مرفقًا من الركبة المقابلة بينما تمتد الرجل الأخرى.', 'بدّل الجهتين بحركة سلسة كأنك تدوّر دراجة.'],
        t: 'لُفّ من الأضلاع والكتفين لا بشدّ العنق.', x: 'السرعة الزائدة وتحريك المرفقين فقط.' } },

    climbers: { m: 'core cardio shoulders quads', e: '',
      en: { s: ['Start in a high plank with your hands under your shoulders.', 'Drive one knee toward your chest, then switch legs quickly.', 'Keep your hips low and your back flat while you run in place.'],
        t: 'Keep your shoulders over your hands and your abs tight.', x: 'Hips bouncing up and down.' },
      ar: { s: ['ابدأ بوضع البلانك العالي واليدان تحت الكتفين.', 'اسحب ركبة نحو صدرك ثم بدّل الرجلين بسرعة.', 'أبقِ الحوض منخفضًا والظهر مسطحًا وأنت تركض في مكانك.'],
        t: 'أبقِ الكتفين فوق اليدين والبطن مشدودًا.', x: 'ارتفاع الحوض وانخفاضه.' } },

    vup: { m: 'abs core hips quads', e: '',
      en: { s: ['Lie on your back with your arms stretched overhead and your legs straight.', 'At the same time lift your straight legs and your torso, reaching your hands toward your toes.', 'Lower slowly back to the start.'],
        t: 'Bend your knees a little if it is too hard. That is a tuck-up.', x: 'Throwing your arms to swing up.' },
      ar: { s: ['استلقِ على ظهرك والذراعان ممدودتان فوق رأسك والساقان مستقيمتان.', 'ارفع ساقيك المستقيمتين وجذعك معًا وامدد يديك نحو أصابع قدميك.', 'انزل ببطء إلى الوضع الأول.'],
        t: 'اثنِ ركبتيك قليلًا إن كان صعبًا، وهذا يسمى الطيّ.', x: 'رمي الذراعين لتأرجح الجسم.' } },

    russian: { m: 'abs core hips', e: '',
      en: { s: ['Sit with your knees bent, lean back slightly and lift your feet off the floor if you can.', 'Hold your hands together in front of your chest.', 'Rotate your torso from side to side, tapping the floor beside you.'],
        t: 'Turn your whole upper body, not just your arms.', x: 'Rounding the back.' },
      ar: { s: ['اجلس والركبتان مثنيتان وأمِل للخلف قليلًا وارفع قدميك عن الأرض إن استطعت.', 'ضم يديك معًا أمام صدرك.', 'لُفّ جذعك من جانب إلى آخر والمس الأرض بجانبك.'],
        t: 'لُفّ أعلى جسمك كله لا ذراعيك فقط.', x: 'تقوّس الظهر.' } },

    deadbug: { m: 'core abs hips', e: '',
      en: { s: ['Lie on your back with your arms pointing to the ceiling and your knees bent at 90 degrees above your hips.', 'Slowly lower your opposite arm and leg toward the floor while pressing your lower back down.', 'Return and switch sides.'],
        t: 'Move slowly. If your back arches, do a smaller movement.', x: 'The lower back lifting off the floor.' },
      ar: { s: ['استلقِ على ظهرك وذراعاك نحو السقف وركبتاك مثنيتان بزاوية 90 درجة فوق الوركين.', 'أنزل الذراع والرجل المتقابلتين ببطء نحو الأرض مع ضغط أسفل ظهرك للأسفل.', 'عُد ثم بدّل الجهة.'],
        t: 'تحرّك ببطء، وإن تقوّس ظهرك فاجعل الحركة أصغر.', x: 'ارتفاع أسفل الظهر عن الأرض.' } }
  });
});
