# TrainBook · دفتر التمرين

A simple **bodyweight training notebook** you can open every day to see what to train, tick it off, and look back at your history.
Works in **Arabic (RTL) and English**, on **phones, tablets and desktops**, in **light and dark** mode, offline, and installs like an app.

> No framework, no build step, no database. Plain HTML/CSS/JS plus one small Cloudflare Worker for accounts. Your data is **encrypted in the browser** before it is stored or synced.

## What's inside

| Page | What it does |
|---|---|
| **Today** | Your exercises for today, grouped by category (Chest · Legs · Back · Arms · Core · Full body). Each one has a **+ / −** repetition counter and three buttons: **Done · Missed · Partial** (partial lets you record how much you did). |
| **My Course** | Your weekly plan. Add/edit exercises (title, category, reps or seconds, sets, days of the week). Shows the premade course you are following, with its week-by-week progress. |
| **Train** | A quick-start **stopwatch** (laps, plus an optional "beep at" time), **timer** (tap 15s…5m, or type **any time up to 99:59:59** and save your own presets), **interval timer** (type any work / rest / rounds) with beeps + vibration, screen kept awake, today's **checklist**, and a **Music** tab (below). A floating pill shows a running timer on other pages. |
| **Music** | Inside Train → Music: ~44 playlists (workout, trending charts from many countries incl. Egypt and Saudi Arabia, hip-hop, rock and metal, dance and EDM, Arabic and world, warm-up and cool-down), a **Surprise me** button, a pick for today, and a box for your own Spotify / YouTube / SoundCloud links. The mini-player stays on screen while you switch pages. |
| **How to do it** | Tap the **?** next to any exercise (Today, My Course, the checklist, and inside a course) for a picture of the movement in numbered steps with a motion arrow, a short **animation**, step-by-step text, a tip and a common mistake, the muscles it works, and the equipment. Every premade course also has a **How to follow this course** section. All 66 exercises and 20 courses, in English and Arabic. |
| **Courses** | **20 premade programs**, all bodyweight: 8 courses, 6 monthly plans, 6 calisthenics skill programs (handstand, front lever, planche, muscle-up, L-sit, pistol squat). Pick your training days, press start, and reps/hold-times grow automatically every week. |
| **History** | Streak, perfect days, 30-day completion, and a month calendar (done / partial / missed / rest). Tap any day to see it, or fix a day you forgot to log. |

**Super Training Day** 🔥 – tap the flame (top bar) to choose a day (today, a date, or every Friday…). On that day the **whole app turns red**.

## Profiles and passwords

Like Ledgerly: each person has their own **username and password**, and the account is **global**, so you can sign in from any device.

- **Global accounts.** Create an account on one device, then on any other choose **Sign in from another device** (username + password) and your plan, history and settings are downloaded and unlocked there. Usernames are unique across the whole site. Changes sync automatically (a couple of seconds after each change, when you return to the app, and every minute).
- **Works offline.** Everything is saved on the device first and uploaded when there is a connection. If two devices changed things while apart, they are **merged**: nothing you logged is lost, and for the very same exercise the most recent change wins.
- **The server can't read your data.** Everything is encrypted in the browser with AES-256-GCM; the key is protected by your password (PBKDF2-SHA256, 600,000 rounds). The server stores only the encrypted blob plus a salted hash of a login secret derived from your password. It never sees your password, your keys or your exercises.
- **Recovery key.** Creating an account shows a one-time recovery key. If you forget the password, the key (on any device) sets a new one without losing data. Lose both and the data is gone, so save it. *Settings → New recovery key* replaces it (the old one stops working).
- **Changing the password** also changes it on the server; other devices notice on their next sync and ask for the new password.
- **Sign-in options.** *Keep me signed in on this device* (sealed with a non-exportable device key), idle **auto-lock** (Off / 5 / 15 / 30 / 60 min; paused while a workout timer runs), **Sign out**, **Switch profile**, rename, delete (optionally also from the server). Five wrong passwords in a row lock the account for a growing wait (enforced on the server too).
- **Device-only profiles.** If the site has no account service (e.g. the Docker image) or you tick *Keep this profile on this device only*, the profile stays local. *Settings → Turn on sync* makes it global later (this creates a new recovery key).
- **Your existing data is kept.** If this browser already had TrainBook data from before profiles existed, the first profile offers to adopt it.
- Encryption needs a secure page: `https://` (Cloudflare gives you one) or `http://localhost`. Exported backups are **not** encrypted, so keep them private.

Also: **QR code to install on a phone**, backup/restore as a JSON file (Settings), automatic *missed* days when you skip the app, week start (Sat/Sun/Mon), install prompt, in-app "update ready" prompt.

## Run it locally

```bash
node scripts/serve.js        # or: npm start      -> http://localhost:5173
```

This serves the app **and the same account/sync API as the Cloudflare Worker** (accounts are kept in `.data/accounts.json`, git-ignored), so you can try signing in from two devices on your own network: `HOST=0.0.0.0 node scripts/serve.js`. Options: `SIGNUP_MODE=open|invite|closed`, `INVITE_CODE=...`, `DATA_FILE=...`. (Other devices need `https://` for encryption unless they use `localhost`.)

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

The image is a tiny **nginx (non-root, port 8080)**. The build also runs all the tests and stamps a build id, so every image is a new app version and installed copies show *"A new version is ready · Update"*. **It serves the app only: there is no account service in this image**, so profiles stay on the device (use `node scripts/serve.js` or Cloudflare for global accounts).

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

TrainBook deploys as **one Worker** (`wrangler.jsonc`): the static files from `public/` plus the account/sync API at `/api/*` (`src/worker.mjs`). Each account lives in its own **Durable Object** (SQLite-backed, available on the free plan: 100,000 requests/day, 5 GB). Static files never touch the Worker, so they stay fast and free. Nothing to create by hand: the Durable Object class and its migration are declared in `wrangler.jsonc` and applied by the deploy.

> It must be a **Worker**, not a Pages project: Pages can't host Durable Objects.

**Option A – connect your Git repo (auto-deploy on every push, recommended)**

1. Push this folder to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** (Workers Builds) → pick the repo, name the Worker `trainbook`.
3. Deploy command `npx wrangler deploy` (the default). The build step in `wrangler.jsonc` stamps a build id for you.

**Option B – from your terminal**

```bash
npx wrangler login
npx wrangler deploy        # stamps a build id, uploads ./public and the Worker
```

Every deploy changes the build id, so people who installed the app get the *update ready* prompt next time they open it.

**Who may create accounts** – `vars.SIGNUP_MODE` in `wrangler.jsonc`:

- `"open"` (default): anyone who finds the site can create an account.
- `"invite"`: new accounts need a code. Set it once with `npx wrangler secret put INVITE_CODE`, change `SIGNUP_MODE` to `"invite"` and redeploy; give the code to the people you want.
- `"closed"`: nobody new (existing accounts keep working).

Signing in, syncing and deleting are unaffected by the mode. You can look at your accounts' usage under *Workers & Pages → trainbook → Metrics* (and Durable Objects).

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
  js/auth.js            profiles, lock screen, global sign-in, encrypted storage, idle lock, stay-signed-in
  js/sync.js            talks to /api/*: push / pull / conflicts / background sync
  js/merge.js           merging two devices' copies of a profile (nothing logged is lost)
  js/account.js         Settings -> Profile and security (dialogs)
  js/store.js           state, history logic, course progression (saved through auth.js, encrypted)
  js/timer.js           stopwatch / timer / interval engine (any time you like)
  js/music-data.js      the music library (verified Spotify playlists) + the safe link parser
  js/music.js           the mini-player dock and the Music tab
  js/figure.js          stick-figure engine (two-bone IK) that draws the exercise pictures
  js/poses.js           the key poses of all 66 exercises (frames, arrows, props)
  js/guides*.js         the how-to texts (66 exercises + 20 courses, English + Arabic)
  js/guide.js           the "how to do it" sheet, animation and course guide
  js/views.js sheets.js ui-core.js app.js    pages, dialogs, helpers, controller
src/                    the Cloudflare Worker: worker.mjs (routing + Durable Object), account-logic.mjs (the rules)
scripts/                serve.js · check.js · stamp.js · make-icons.js · update.ps1/.sh · *-test.js
Dockerfile  nginx.conf  docker-compose.yml  wrangler.jsonc
```

Handy commands: `npm test` (encryption; the account service rules: signup, login, throttling, conflicts, recovery, deletion; Worker routing incl. simultaneous saves; merging; the music library and link parser; the exercise pictures and written guides; the offline/service-worker tests which model Cloudflare redirecting `/index.html`), `npm run check` (validates courses + translations + offline list), `npm run music:check` (needs internet: checks every Spotify playlist still exists and has the title we show), `npm run icons` (regenerates PNG icons), `npm run build` (stamps the build id). To look at every exercise picture on one page, run `node scripts/serve.js` and open `http://127.0.0.1:5173/_gallery`.

To add an exercise picture: add its poses to `public/js/poses.js` (angles and anchor points, see the comment at the top), its text to a `guides-*.js` file, then run `node scripts/figure-test.js`.

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
- **Data lives (encrypted) in the browser's local storage on each device**, and for global accounts also (encrypted) on the server. Clearing a browser's site data only removes that device's copy; a global account comes back when you sign in again. Device-only profiles are gone for good, so export a backup now and then (*Settings → Export*).
- A merge only adds, so something you deleted on one device can come back after it syncs with another that still had it.
- **Music** plays through the official Spotify, YouTube and SoundCloud players, so no audio is stored in the app and nothing from those services loads until you pick something. Spotify only plays full songs if you are signed in to Spotify in that browser; otherwise you hear 30-second previews. The playlists belong to Spotify (they update themselves, and now and then one is renamed or removed: `npm run music:check` tells you). Your own saved links stay on that device. The player needs internet.
- The exercise pictures are drawn by the app itself (no image files), so they are tiny, work offline and follow light / dark and the red Super Day theme. They are general guidance, not medical advice: stop if something hurts.
- Installable PWA features (service worker, install prompt) need **http(s)** (or localhost). Over `file://` the app still works.
- iPhone/iPad: Safari → Share → **Add to Home Screen** (iOS has no install button).

## بالعربية باختصار

**دفتر التمرين** تطبيق بسيط لتمارين وزن الجسم: صفحة لتمارين اليوم (تكرارات بزر + / − وثلاثة أزرار: تم · فاتني · جزئيًا)، وصفحة «كورسي» لخطتك الأسبوعية، وصفحة «تمرين» فيها ساعة إيقاف ومؤقت ومؤقت فواصل وقائمة مهام، وصفحة «الكورسات» فيها ٢٠ برنامجًا جاهزًا (كورسات، خطط شهرية، كاليسثنكس)، وصفحة «السجل» لأيام الإنجاز والفوات.
**الحسابات العالمية:** كل شخص يُنشئ حسابًا باسم مستخدم وكلمة مرور، ويمكنه **تسجيل الدخول من أي جهاز** (خيار «تسجيل الدخول من جهاز آخر») فتُنزَّل بياناته وتُفتح بكلمة مروره. تُشفَّر البيانات داخل المتصفح (AES-256) والخادم لا يستطيع قراءتها، ويظهر **مفتاح استرداد** مرة واحدة، مع قفل تلقائي وخيار «أبقني مسجّل الدخول». تعمل بدون إنترنت وتتزامن لاحقًا، وعند تعديل جهازين معًا تُدمج التغييرات دون فقدان أي تمرين. تحتاج `https://`. (صورة دوكر لا تحوي خدمة الحسابات، فتبقى الملفات على الجهاز.)
**جديد:** اضغط علامة **؟** بجانب أي تمرين لترى **رسمًا للحركة بالخطوات وعرضًا متحركًا** مع شرح الأداء ونصيحة وخطأ شائع والعضلات والأدوات المطلوبة، ولكل كورس قسم «كيف تتبع هذا الكورس». المؤقت وساعة الإيقاف يقبلان **أي وقت تريده** مع حفظ أوقاتك المفضلة، وفي صفحة «تمرين» تبويب **موسيقى** فيه نحو ٤٤ قائمة تشغيل (تمرين، الأكثر رواجًا في دول كثيرة، هيب هوب، روك، إلكترونيك، عربي وعالمي) وزر «فاجئني» ومشغّل صغير يبقى ظاهرًا أثناء التنقل بين الصفحات.
يدعم العربية (من اليمين لليسار) والإنجليزية، والوضع الفاتح والداكن، ويعمل على كل الأجهزة وبدون إنترنت، ويُثبَّت كتطبيق. **اليوم الخارق**: اضغط أيقونة النار واختر يومًا ليتحول التطبيق كله إلى الأحمر.

- تشغيل محلي: `node scripts/serve.js`
- دوكر: `docker compose up -d --build` ثم افتح `http://localhost:8080` — وللتحديث لاحقًا: `.\scripts\update.ps1`
- كلاودفلير (استضافة مجانية): اربط المستودع من لوحة Cloudflare (Workers Builds) واترك أمر النشر `npx wrangler deploy`، أو نفّذ `npx wrangler login` ثم `npx wrangler deploy`. يجب أن يكون Worker وليس Pages حتى تعمل الحسابات. للتحكم بمن يُنشئ حسابات: `SIGNUP_MODE` في `wrangler.jsonc` (`open` / `invite` / `closed`).
