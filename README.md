# TrainBook · دفتر التمرين

A simple **bodyweight training notebook** you can open every day to see what to train, tick it off, and look back at your history.
Works in **Arabic (RTL) and English**, on **phones, tablets and desktops**, in **light and dark** mode, offline, and installs like an app.

> No framework, no build step, no database, no account. Plain HTML/CSS/JS. Your data stays on your device.

## What's inside

| Page | What it does |
|---|---|
| **Today** | Your exercises for today, grouped by category (Chest · Legs · Back · Arms · Core · Full body). Each one has a **+ / −** repetition counter and three buttons: **Done · Missed · Partial** (partial lets you record how much you did). |
| **My Course** | Your weekly plan. Add/edit exercises (title, category, reps or seconds, sets, days of the week). Shows the premade course you are following, with its week-by-week progress. |
| **Train** | A quick-start **stopwatch** (laps), **timer** (tap 15s…5m to start instantly), **interval timer** (work / rest / rounds) with beeps + vibration, screen kept awake, and today's **checklist**. A floating pill shows a running timer on other pages. |
| **Courses** | **20 premade programs**, all bodyweight: 8 courses, 6 monthly plans, 6 calisthenics skill programs (handstand, front lever, planche, muscle-up, L-sit, pistol squat). Pick your training days, press start, and reps/hold-times grow automatically every week. |
| **History** | Streak, perfect days, 30-day completion, and a month calendar (done / partial / missed / rest). Tap any day to see it, or fix a day you forgot to log. |

**Super Training Day** 🔥 – tap the flame (top bar) to choose a day (today, a date, or every Friday…). On that day the **whole app turns red**.

## Profiles and passwords

Like Ledgerly's local profiles: several people (or several plans) can share one device, each with their own **username and password**.

- **Encrypted at rest.** A profile's data is encrypted in the browser with AES-256-GCM. The key is protected by your password (PBKDF2-SHA256, 600,000 rounds). A locked profile is unreadable ciphertext, even in the browser's developer tools. Nothing is sent anywhere.
- **Recovery key.** Creating a profile shows a one-time recovery key. If you forget the password, the key sets a new one without losing data. Lose both and the data is gone, so save it. *Settings → New recovery key* replaces it (the old one stops working).
- **Sign-in options.** *Keep me signed in on this device* (the key is sealed with a non-exportable device key), idle **auto-lock** (Off / 5 / 15 / 30 / 60 min; paused while a workout timer runs), **Sign out**, **Switch profile**, change password, rename, delete profile. Five wrong passwords in a row add a growing wait.
- **Your existing data is kept.** If this browser already had TrainBook data from before profiles existed, the first profile offers to adopt it.
- **Per device.** Profiles live in each browser. There is no server, so you can't sign in from another device with the same account; use *Settings → Export / Import* to move data. Exported files are **not** encrypted, so keep them private.
- Encryption needs a secure page: `https://` (Cloudflare gives you one) or `http://localhost`.

Also: **QR code to install on a phone**, backup/restore as a JSON file (Settings), automatic *missed* days when you skip the app, week start (Sat/Sun/Mon), install prompt, in-app "update ready" prompt.

## Run it locally

```bash
node scripts/serve.js        # or: npm start      -> http://localhost:5173
```

Opening `public/index.html` straight from disk is fine for a quick look (installing the app and offline mode need http/https, i.e. the commands here, Docker or Cloudflare).

On your phone: open the hosted/served URL → browser menu → **Install app / Add to Home Screen**.

## Get it on a phone with a QR code

On a computer, click the **QR icon** in the top bar (or **Settings → Get the app on your phone**), scan the code with your phone camera, open the link, then **Install app** (Android) or **Share → Add to Home Screen** (iPhone).

- The code points at the address of the page you are on, so on your Cloudflare site it is automatically your public URL.
- On `localhost` it warns you (a phone can't reach your PC's `localhost`). Edit the address field to your PC's network address, e.g. `http://192.168.1.20:8080`, and the code updates live (it is remembered).
- **Save QR image** downloads a PNG you can print or share. **Copy link** and **Share** are there too.
- The generator is `public/js/qr.js`: a small dependency-free encoder (byte mode, error-correction M, up to 213 characters).

## Docker (easy updates)

```bash
docker compose up -d --build        # builds and starts on http://localhost:8080
```

The image is a tiny **nginx (non-root, port 8080)**. The build also runs the sanity checks and stamps a build id, so every image is a new app version and installed copies show *"A new version is ready · Update"*.

**Update later** (pulls new code if this folder is a git clone, rebuilds, restarts):

```powershell
.\scripts\update.ps1        # Windows
```
```bash
sh scripts/update.sh        # Linux / macOS / Git Bash
```

Plain Docker, without compose:

```bash
docker build -t trainbook .
docker run -d --name trainbook -p 8080:8080 --restart unless-stopped trainbook
```

## Free hosting on Cloudflare

TrainBook is static files, so Cloudflare hosts it directly (no container needed there).

**Option A – connect your Git repo (auto-deploy on every push, recommended)**

1. Push this folder to a GitHub/GitLab repository.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build settings: **Framework preset** `None` · **Build command** `node scripts/stamp.js` · **Build output directory** `public`.
4. Save & deploy. You get a `https://<name>.pages.dev` URL (add your own domain later if you like).

**Option B – from your terminal**

```bash
npx wrangler login
npx wrangler deploy        # uses wrangler.jsonc: stamps a build id, uploads ./public
```

Every deploy changes the build id, so people who installed the app get the *update ready* prompt next time they open it.

> Running the Docker container on your own server/PC and want a public URL without hosting? `cloudflared tunnel --url http://localhost:8080` gives a temporary one.

## Project layout

```
public/                 everything that gets served (this is the whole app)
  index.html  manifest.webmanifest  sw.js  _headers  favicon.svg  icons/
  css/app.css           themes: light, dark, super-day red (CSS variables)
  js/data.js            exercise library + the 20 premade courses  <- edit here to add courses
  js/i18n.js            English + Arabic strings
  js/qr.js              QR code generator (used by the "get the app on your phone" sheet)
  js/vault.js           password-based encryption (WebCrypto): data key, password wrap, recovery key
  js/auth.js            profiles, lock screen, encrypted storage, idle lock, stay-signed-in
  js/account.js         Settings -> Profile and security (dialogs)
  js/store.js           state, history logic, course progression (saved through auth.js, encrypted)
  js/timer.js           stopwatch / timer / interval engine
  js/views.js sheets.js ui-core.js app.js    pages, dialogs, helpers, controller
scripts/                serve.js · check.js · stamp.js · make-icons.js · update.ps1/.sh
Dockerfile  nginx.conf  docker-compose.yml  wrangler.jsonc
```

Handy commands: `npm test` (encryption tests: wrong password, tampering, recovery, password change), `npm run check` (validates courses + translations + offline list), `npm run icons` (regenerates PNG icons), `npm run build` (stamps the build id).

### Add your own premade course

In `public/js/data.js`, append to `COURSES`. Each session row is `[exerciseId, sets, repsOrSeconds, +perWeek]`:

```js
{ id: 'mine', kind: 'course', level: 2, weeks: 4,
  name:  { en: 'My Plan', ar: 'خطتي' },
  desc:  { en: '…', ar: '…' },
  style: { en: 'Inspired by …', ar: 'مستوحى من …' },
  sessions: [ S('Day A', 'يوم أ', [['pushup', 3, 10, 1], ['squat', 3, 15, 2]]) ] }
```

Then run `npm run check`.

## Good to know

- **Programs are original**, written in the *style/method* of the people named ("Inspired by …"). They are **not official programs** from those athletes and are not endorsed by them. Train within your limits; stop if something hurts.
- **Data lives (encrypted) in the browser's local storage** on each device. There is no cloud sync between devices – use *Settings → Export / Import* to move or back up your data. Clearing the browser's site data erases it, so export a backup now and then.
- Installable PWA features (service worker, install prompt) need **http(s)** (or localhost). Over `file://` the app still works.
- iPhone/iPad: Safari → Share → **Add to Home Screen** (iOS has no install button).

## بالعربية باختصار

**دفتر التمرين** تطبيق بسيط لتمارين وزن الجسم: صفحة لتمارين اليوم (تكرارات بزر + / − وثلاثة أزرار: تم · فاتني · جزئيًا)، وصفحة «كورسي» لخطتك الأسبوعية، وصفحة «تمرين» فيها ساعة إيقاف ومؤقت ومؤقت فواصل وقائمة مهام، وصفحة «الكورسات» فيها ٢٠ برنامجًا جاهزًا (كورسات، خطط شهرية، كاليسثنكس)، وصفحة «السجل» لأيام الإنجاز والفوات.
**الملفات وكلمات المرور:** كل شخص يُنشئ ملفًا باسم مستخدم وكلمة مرور، وتُشفَّر بياناته داخل المتصفح (AES-256)، مع **مفتاح استرداد** يظهر مرة واحدة، وقفل تلقائي، وخيار «أبقني مسجّل الدخول». الملفات محلية على كل جهاز (لا يوجد خادم، فلا تسجيل دخول من جهاز آخر)، وتحتاج `https://`.
يدعم العربية (من اليمين لليسار) والإنجليزية، والوضع الفاتح والداكن، ويعمل على كل الأجهزة وبدون إنترنت، ويُثبَّت كتطبيق. **اليوم الخارق**: اضغط أيقونة النار واختر يومًا ليتحول التطبيق كله إلى الأحمر.

- تشغيل محلي: `node scripts/serve.js`
- دوكر: `docker compose up -d --build` ثم افتح `http://localhost:8080` — وللتحديث لاحقًا: `.\scripts\update.ps1`
- كلاودفلير (استضافة مجانية): اربط المستودع من لوحة Cloudflare بأمر البناء `node scripts/stamp.js` ومجلد الإخراج `public`، أو نفّذ `npx wrangler login` ثم `npx wrangler deploy`.
