/* Music library + link parser. No audio is bundled: playlists play through the official Spotify / YouTube / SoundCloud
 * players (embedded on request), which handle the licensing. Spotify keeps these editorial playlists up to date, so
 * "trending" really is what is trending. Works in the browser (window.MusicData) and in Node (module.exports).
 * Every playlist id below was checked against Spotify's public oEmbed endpoint (npm run music:check re-checks them). */
(function (root) {
  'use strict';

  /* [spotifyId, category, English name, Arabic name, English description, Arabic description] */
  var L = [
    ['37i9dQZF1DX76Wlfdnj7AP', 'workout', 'Beast Mode', 'وضع الوحش', 'Heavy, fast gym anthems', 'أغانٍ قوية وسريعة للجيم'],
    ['37i9dQZF1DX70RN3TfWWJh', 'workout', 'Workout', 'تمرين', 'Upbeat pop and hip-hop to keep you moving', 'بوب وهيب هوب حماسي يبقيك متحركًا'],
    ['37i9dQZF1DXdxcBWuJkbcy', 'workout', 'Gym Hits', 'أغاني الجيم', 'Big tracks for heavy sets', 'أغانٍ ضخمة للتمارين الثقيلة'],
    ['37i9dQZF1DX32NsLKyzScr', 'workout', 'Power Hour', 'ساعة القوة', 'Non-stop energy for a full hour', 'طاقة متواصلة لساعة كاملة'],
    ['37i9dQZF1DWSJHnPb1f0X3', 'workout', 'Cardio', 'كارديو', 'Steady-tempo tracks for running and cardio', 'إيقاع ثابت للجري والكارديو'],
    ['37i9dQZF1DX4eRPd9frC1m', 'workout', 'Hype', 'حماس', 'Hyped-up hits to get you pumped', 'أغانٍ حماسية ترفع معنوياتك'],
    ['37i9dQZF1DX8CwbNGNKurt', 'workout', 'Throwback Workout', 'تمرين الزمن الجميل', 'Classic hits from the 90s and 2000s', 'أغانٍ كلاسيكية من التسعينات والألفينات'],

    ['37i9dQZF1DXcBWIGoYBM5M', 'trending', "Today's Top Hits", 'أبرز أغاني اليوم', 'The biggest songs right now', 'أكبر الأغاني الآن'],
    ['37i9dQZEVXbMDoHDwVN2tF', 'trending', 'Top 50 - Global', 'أفضل 50 - عالميًا', 'The 50 most-played songs in the world right now', 'أكثر 50 أغنية استماعًا في العالم الآن'],
    ['37i9dQZEVXbLrQBcXqUtaC', 'trending', 'Top 50 - Saudi Arabia', 'أفضل 50 - السعودية', 'The most-played songs in Saudi Arabia', 'الأغاني الأكثر استماعًا في السعودية'],
    ['37i9dQZEVXbLn7RQmT5Xv2', 'trending', 'Top 50 - Egypt', 'أفضل 50 - مصر', 'The most-played songs in Egypt', 'الأغاني الأكثر استماعًا في مصر'],
    ['37i9dQZEVXbLRQDuF5jeBp', 'trending', 'Top 50 - USA', 'أفضل 50 - أمريكا', 'The most-played songs in the USA', 'الأغاني الأكثر استماعًا في أمريكا'],
    ['37i9dQZEVXbLnolsZ8PSNw', 'trending', 'Top 50 - United Kingdom', 'أفضل 50 - المملكة المتحدة', 'The most-played songs in the UK', 'الأغاني الأكثر استماعًا في بريطانيا'],
    ['37i9dQZEVXbIPWwFssbupI', 'trending', 'Top 50 - France', 'أفضل 50 - فرنسا', 'The most-played songs in France', 'الأغاني الأكثر استماعًا في فرنسا'],
    ['37i9dQZEVXbNFJfN1Vw8d9', 'trending', 'Top 50 - Spain', 'أفضل 50 - إسبانيا', 'The most-played songs in Spain', 'الأغاني الأكثر استماعًا في إسبانيا'],
    ['37i9dQZEVXbMXbN3EUUhlg', 'trending', 'Top 50 - Brazil', 'أفضل 50 - البرازيل', 'The most-played songs in Brazil', 'الأغاني الأكثر استماعًا في البرازيل'],
    ['37i9dQZEVXbO3qyFxbkOE1', 'trending', 'Top 50 - Mexico', 'أفضل 50 - المكسيك', 'The most-played songs in Mexico', 'الأغاني الأكثر استماعًا في المكسيك'],
    ['37i9dQZEVXbIVYVBNw9D5K', 'trending', 'Top 50 - Turkey', 'أفضل 50 - تركيا', 'The most-played songs in Turkey', 'الأغاني الأكثر استماعًا في تركيا'],
    ['37i9dQZEVXbLZ52XmnySJg', 'trending', 'Top 50 - India', 'أفضل 50 - الهند', 'The most-played songs in India', 'الأغاني الأكثر استماعًا في الهند'],
    ['37i9dQZEVXbKY7jLzlJ11V', 'trending', 'Top 50 - Nigeria', 'أفضل 50 - نيجيريا', 'The most-played songs in Nigeria', 'الأغاني الأكثر استماعًا في نيجيريا'],
    ['37i9dQZEVXbNxXF4SkHj9F', 'trending', 'Top 50 - South Korea', 'أفضل 50 - كوريا الجنوبية', 'The most-played songs in South Korea', 'الأغاني الأكثر استماعًا في كوريا الجنوبية'],
    ['37i9dQZEVXbKXQ4mDTEBXq', 'trending', 'Top 50 - Japan', 'أفضل 50 - اليابان', 'The most-played songs in Japan', 'الأغاني الأكثر استماعًا في اليابان'],
    ['37i9dQZEVXbJiZcmkrIHGU', 'trending', 'Top 50 - Germany', 'أفضل 50 - ألمانيا', 'The most-played songs in Germany', 'الأغاني الأكثر استماعًا في ألمانيا'],
    ['37i9dQZEVXbIQnj7RRhdSX', 'trending', 'Top 50 - Italy', 'أفضل 50 - إيطاليا', 'The most-played songs in Italy', 'الأغاني الأكثر استماعًا في إيطاليا'],

    ['37i9dQZF1DX0XUsuxWHRQd', 'hiphop', 'RapCaviar', 'راب كافيار', "Today's biggest hip-hop", 'أبرز أغاني الهيب هوب اليوم'],
    ['37i9dQZF1DX76t638V6CA8', 'hiphop', 'Rap Workout', 'تمرين الراب', 'Hard-hitting rap for lifting', 'راب قوي لرفع الأثقال'],
    ['37i9dQZF1DWY4xHQp97fN6', 'hiphop', 'Get Turnt', 'حماس الهيب هوب', 'Loud, turned-up hip-hop', 'هيب هوب عالٍ وحماسي'],
    ['37i9dQZF1DWVA1Gq4XHa6U', 'hiphop', 'Gold School', 'الهيب هوب الكلاسيكي', 'Classic hip-hop favourites', 'أجمل أغاني الهيب هوب الكلاسيكية'],

    ['37i9dQZF1DWXRqgorJj26U', 'rock', 'Rock Classics', 'كلاسيكيات الروك', 'Legendary rock anthems', 'أناشيد روك أسطورية'],
    ['37i9dQZF1DWWOaP4H0w5b0', 'rock', 'Metal Essentials', 'أساسيات الميتال', 'The essential heavy metal tracks', 'أهم أغاني الهيفي ميتال'],
    ['37i9dQZF1DX9qNs32fujYe', 'rock', 'Heavy Metal', 'هيفي ميتال', 'Loud and aggressive for max effort', 'صاخب وعدواني لأقصى جهد'],

    ['37i9dQZF1DX4dyzvuaRJ0n', 'dance', 'mint', 'إلكترونيك (مينت)', 'Fresh electronic and dance music', 'موسيقى إلكترونية ودانس جديدة'],
    ['37i9dQZF1DXaXB8fQg7xif', 'dance', 'Dance Party', 'حفلة رقص', 'Dance-floor energy for cardio', 'طاقة حلبة الرقص للكارديو'],
    ['37i9dQZF1DX6J5NfMJS675', 'dance', 'Techno Bunker', 'تِكنو', 'Driving techno for long sets', 'تِكنو مندفع للتمارين الطويلة'],
    ['37i9dQZF1DXa2PvUpywmrr', 'dance', 'Party Hits', 'أغاني الحفلات', 'Sing-along party tracks', 'أغانٍ حفلات تُغنّى معها'],

    ['37i9dQZF1DX10zKzsJ2jva', 'world', 'Viva Latino', 'فيفا لاتينو', 'Latin hits and reggaeton', 'أغانٍ لاتينية وريغيتون'],
    ['37i9dQZF1DWYkaDif7Ztbp', 'world', 'African Heat', 'الحرارة الأفريقية', 'Afrobeats and amapiano', 'أفروبيتس وأمابيانو'],
    ['37i9dQZF1DX9tPFwDMOaN1', 'world', 'K-Pop ON!', 'كي بوب', 'Korean pop energy', 'طاقة البوب الكوري'],
    ['37i9dQZF1DWYBAUZiPMirH', 'world', 'Arab Mood Booster', 'رفع المزاج العربي', 'Upbeat Arabic songs', 'أغانٍ عربية مبهجة'],

    ['37i9dQZF1DX4sWSpwq3LiO', 'calm', 'Peaceful Piano', 'بيانو هادئ', 'Soft piano for stretching', 'بيانو ناعم للإطالة'],
    ['37i9dQZF1DWWQRwui0ExPn', 'calm', 'lofi beats', 'لو-فاي', 'Chill beats for the cool-down', 'إيقاعات هادئة للتهدئة'],
    ['37i9dQZF1DX3Ogo9pFvBkY', 'calm', 'Ambient Relaxation', 'استرخاء', 'Slow ambient sound to wind down', 'أصوات هادئة بطيئة للاسترخاء'],
    ['37i9dQZF1DX4WYpdgoIcn6', 'calm', 'Chill Hits', 'هدوء', 'Laid-back hits', 'أغانٍ هادئة ومريحة'],
    ['37i9dQZF1DX9h1d4VhVGeh', 'calm', 'Arabic Coffee', 'قهوة عربية', 'Soft Arabic acoustic for cooling down', 'أغانٍ عربية هادئة للتهدئة']
  ];

  var CATS = ['workout', 'trending', 'hiphop', 'rock', 'dance', 'world', 'calm'];
  var LIBRARY = L.map(function (r) {
    return { id: r[0], kind: 'spotify', type: 'playlist', cat: r[1], name: r[2], ar: r[3], d: { en: r[4], ar: r[5] } };
  });
  var byId = {}; LIBRARY.forEach(function (p) { byId[p.id] = p; });

  /* ---------- link parser: Spotify, YouTube, SoundCloud only ---------- */
  var SP = /^[A-Za-z0-9]{22}$/, YT = /^[A-Za-z0-9_-]{11}$/, YL = /^[A-Za-z0-9_-]{10,60}$/;
  var spotify = function (type, id) { return { kind: 'spotify', type: type, id: id }; };

  function parse(input) {
    var s = String(input == null ? '' : input).trim();
    if (!s || s.length > 300) return null;
    var m0 = s.match(/^spotify:(playlist|album|track|artist|episode|show):([A-Za-z0-9]{22})$/);
    if (m0) return spotify(m0[1], m0[2]);
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;                 // "open.spotify.com/..." pasted without https://
    var u; try { u = new URL(s); } catch (e) { return null; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    var host = u.hostname.replace(/^www\./, '').toLowerCase(), path = u.pathname, q = u.searchParams, m;

    if (host === 'open.spotify.com') {
      m = path.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]{22})(?:\/|$)/);
      return m ? spotify(m[1], m[2]) : null;
    }
    if (host === 'youtu.be') {
      var vid = path.slice(1).split('/')[0];
      return YT.test(vid) ? { kind: 'youtube', type: q.get('list') && YL.test(q.get('list')) ? 'playlist' : 'video', id: vid, list: q.get('list') && YL.test(q.get('list')) ? q.get('list') : '' } : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
      var v = q.get('v'), list = q.get('list');
      if (path === '/watch' && v && YT.test(v)) return { kind: 'youtube', type: list && YL.test(list) ? 'playlist' : 'video', id: v, list: list && YL.test(list) ? list : '' };
      if (path === '/playlist' && list && YL.test(list)) return { kind: 'youtube', type: 'playlist', id: '', list: list };
      m = path.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/);
      if (m) return { kind: 'youtube', type: 'video', id: m[1], list: '' };
      if (path === '/embed/videoseries' && list && YL.test(list)) return { kind: 'youtube', type: 'playlist', id: '', list: list };
      return null;
    }
    if (host === 'soundcloud.com' || host === 'm.soundcloud.com') {
      var segs = path.split('/').filter(Boolean);
      if (segs.length >= 2 && segs.every(function (x) { return /^[A-Za-z0-9_.~%-]+$/.test(x); })) return { kind: 'soundcloud', type: segs[1] === 'sets' ? 'playlist' : 'track', id: '', url: 'https://soundcloud.com/' + segs.join('/') };
      return null;
    }
    return null;
  }

  /** Address of the official player for an item (a library entry or a parse() result). dark = ask for the dark Spotify theme. */
  function embedSrc(it, dark) {
    if (!it) return '';
    if (it.kind === 'spotify' && SP.test(it.id)) return 'https://open.spotify.com/embed/' + it.type + '/' + it.id + '?utm_source=generator' + (dark ? '&theme=0' : '');
    if (it.kind === 'youtube') {
      if (it.type === 'playlist' && !it.id && YL.test(it.list)) return 'https://www.youtube-nocookie.com/embed/videoseries?list=' + it.list + '&rel=0';
      if (YT.test(it.id)) return 'https://www.youtube-nocookie.com/embed/' + it.id + '?rel=0&modestbranding=1' + (it.list && YL.test(it.list) ? '&list=' + it.list : '');
    }
    if (it.kind === 'soundcloud' && /^https:\/\/soundcloud\.com\//.test(it.url)) return 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(it.url) + '&color=%234361ee&auto_play=false&hide_related=true&show_comments=false&show_teaser=false';
    return '';
  }

  /** A pick that stays the same all day (so "today's pick" is a nice routine), from the energetic categories. */
  function daily(dateKey) {
    var pool = LIBRARY.filter(function (p) { return p.cat === 'workout' || p.cat === 'hiphop' || p.cat === 'rock' || p.cat === 'dance'; });
    var h = 0; String(dateKey).split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
    return pool[h % pool.length];
  }
  /** A random energetic playlist (never the cool-down ones, never the one given in `not`). rnd = Math.random by default. */
  function random(not, rnd) {
    var pool = LIBRARY.filter(function (p) { return p.cat !== 'calm' && p.id !== not; });
    return pool[Math.floor((rnd || Math.random)() * pool.length)];
  }

  var MusicData = { CATS: CATS, LIBRARY: LIBRARY, byId: function (id) { return byId[id] || null; }, parse: parse, embedSrc: embedSrc, daily: daily, random: random };
  if (typeof module !== 'undefined' && module.exports) module.exports = MusicData; else root.MusicData = MusicData;
})(typeof window !== 'undefined' ? window : this);
