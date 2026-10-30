/* Photo booth: pull the cord, squeeze in, a few little flashes,
   and a strip whirs out of the slot still wet. */
(() => {
  const C = window.BDAY;
  const { Sound, haptic, burst, toast, rand, pick, reduceMotion } = window.FX;
  const { $, $$, store, restart, centerOf, clamp, onShake, addMemory } = window.APP;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const INK = ART.INK;

  /* ═════════════ formats, paper, looks ═════════════ */
  // aspect = frame width / height, for [tall, wide]
  const FORMATS = {
    classic: { name: "classic", size: ["2×6", "6×2"], n: 4, aspect: [4 / 3, 3 / 4], turn: true },
    trio:    { name: "trio", size: ["2×6", "6×2"], n: 3, aspect: [1, 1], turn: true },
    film:    { name: "35mm", size: ["film", "film"], n: 4, aspect: [4 / 3, 3 / 2], turn: true, film: true },
    grid:    { name: "postcard", size: ["4×5", "4×5"], n: 4, aspect: [4 / 5, 4 / 5], grid: true },
    double:  { name: "two strips", size: ["4×6", "4×6"], n: 4, aspect: [4 / 3, 4 / 3], double: true },
  };
  const PAPERS = {
    cream:  { name: "cream", bg: "#fbf5e2", ink: "#1e5a2b" },
    blush:  { name: "blush", bg: "#f8c9d3", ink: "#8a2b45" },
    mint:   { name: "mint", bg: "#cfe5b4", ink: "#1e5a2b" },
    forest: { name: "forest", bg: "#24502d", ink: "#fbf5e2" },
  };
  const FILM = { bg: "#1d1a16", ink: "#f6a73b" };
  // css = live preview in the viewfinder, px = the same look baked into the print
  const FILTERS = {
    sweet: {
      name: "sweet", css: "saturate(1.18) contrast(1.06) brightness(1.03)",
      px(d, i) {
        const r = d[i], g = d[i + 1], b = d[i + 2], l = 0.3 * r + 0.59 * g + 0.11 * b;
        d[i] = (l + (r - l) * 1.18 - 128) * 1.06 + 134;
        d[i + 1] = (l + (g - l) * 1.18 - 128) * 1.06 + 130;
        d[i + 2] = (l + (b - l) * 1.18 - 128) * 1.06 + 123;
      },
    },
    bw: {
      name: "b&w", css: "grayscale(1) contrast(1.25) brightness(1.05)",
      px(d, i) { d[i] = d[i + 1] = d[i + 2] = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2] - 128) * 1.28 + 134; },
    },
    dreamy: {
      name: "dreamy", css: "contrast(.88) brightness(1.1) saturate(.85) sepia(.18)",
      px(d, i) { d[i] = 34 + d[i] * 0.86; d[i + 1] = 24 + d[i + 1] * 0.84; d[i + 2] = 30 + d[i + 2] * 0.8; },
    },
  };

  const opts = { fmt: "classic", turn: "v", paper: "cream", filter: "sweet", ...store.get("booth", {}) };
  if (!FORMATS[opts.fmt]) opts.fmt = "classic";
  if (!PAPERS[opts.paper]) opts.paper = "cream";
  if (!FILTERS[opts.filter]) opts.filter = "sweet";
  if (opts.turn !== "h") opts.turn = "v";

  /* ═════════════ layout: where every frame sits on the paper ═════════════ */
  const U = 480, PAD = 36, GAP = 22, FOOT = 150, BAND = 74, END = 46, SCALE = 1.5;
  function layout(key = opts.fmt, turn = opts.turn) {
    const f = FORMATS[key];
    const across = !!f.turn && turn === "h";
    const a = f.aspect[across ? 1 : 0];
    const fw = a >= 1 ? U : Math.round(U * a), fh = a >= 1 ? Math.round(U / a) : U;
    const L = { key, f, across, fw, fh, n: f.n, frames: [], foots: [] };
    const run = (x0, y0, dx, dy) => Array.from({ length: f.n }, (_, i) => ({ x: x0 + i * dx, y: y0 + i * dy, w: fw, h: fh, shot: i }));
    if (f.grid) {
      L.frames = Array.from({ length: 4 }, (_, i) => ({ x: PAD + (i % 2) * (fw + GAP), y: PAD + Math.floor(i / 2) * (fh + GAP), w: fw, h: fh, shot: i }));
      L.W = PAD * 2 + fw * 2 + GAP;
      L.H = PAD + fh * 2 + GAP + FOOT;
      L.foots = [{ x: 0, y: L.H - FOOT, w: L.W, h: FOOT }];
    } else if (f.film) {
      const len = END * 2 + f.n * (across ? fw : fh) + (f.n - 1) * GAP;
      if (across) { L.W = len; L.H = BAND * 2 + fh; L.frames = run(END, BAND, fw + GAP, 0); }
      else { L.W = BAND * 2 + fw; L.H = len; L.frames = run(BAND, END, 0, fh + GAP); }
    } else {
      const len = PAD + f.n * (across ? fw : fh) + (f.n - 1) * GAP;
      if (across) { L.W = len + FOOT; L.H = PAD * 2 + fh; L.frames = run(PAD, PAD, fw + GAP, 0); L.foots = [{ x: len, y: 0, w: FOOT, h: L.H, side: true }]; }
      else { L.W = PAD * 2 + fw; L.H = len + FOOT; L.frames = run(PAD, PAD, 0, fh + GAP); L.foots = [{ x: 0, y: len, w: L.W, h: FOOT }]; }
      if (f.double) {
        const w = L.W;
        L.frames = L.frames.concat(L.frames.map((fr) => ({ ...fr, x: fr.x + w })));
        L.foots.push({ ...L.foots[0], x: L.foots[0].x + w });
        L.W = w * 2;
        L.cut = w;
      }
    }
    return L;
  }

  /* ═════════════ elements & state ═════════════ */
  const page = $("#page-booth"), booth = $("#booth"), video = $("#boothVideo"), viewfinder = $("#viewfinder");
  const vfFreeze = $("#vfFreeze"), vfFlash = $("#vfFlash"), vfCount = $("#vfCount"), vfPrompt = $("#vfPrompt");
  const bulbs = $$("#vfBulbs i"), slotsEl = $("#shotSlots"), cord = $("#cord");
  const boothFrog = $("#boothFrog"), frogBubble = $("#boothBubble");
  const boothBtn = $("#boothBtn"), boothLabel = $("#boothLabel"), tray = $("#boothTray"), files = $("#boothFiles");
  const stripOut = $("#stripOut"), strip = $("#strip"), stripHint = $("#stripHint"), actions = $("#stripActions"), snip = $("#snip");
  const setupRow = $("#boothSetup"), scrim = $("#sheetScrim"), ghost = $("#stripGhost"), ghostPaper = $("#ghostPaper");
  const screenFlash = $("#boothFlash");

  let curtain = "closed", noCam = false, openToken = 0, camStream = null, session = null, printing = false;
  let shots = [], stripOpts = null, stamps = [], stripCanvas = null, stripBlob = null, stripURL = null;
  let saved = true, tuckedVersion = null, developing = null, cut = 0, torn = false;
  const cache = new Map();

  $$(".bulbs", booth).forEach((row) => (row.innerHTML = "<i></i>".repeat(9)));

  /* ═════════════ the booth frog ═════════════ */
  let frogTimer;
  function frogSay(text, hop = true) {
    frogBubble.textContent = text;
    frogBubble.classList.add("show");
    if (hop) restart(boothFrog, "hop");
    clearTimeout(frogTimer);
    frogTimer = setTimeout(() => frogBubble.classList.remove("show"), 1700);
  }
  const frogLines = ["i'm the photographer", "say ribbit!", "no frogs were harmed", "get closer, you two", "i've seen cuter (lie)"];
  window.FX.makeDraggable(boothFrog, {
    onTap: () => { frogSay(pick(frogLines)); Sound.ribbit(); haptic(12); },
  });

  /* ═════════════ curtain & camera ═════════════ */
  function getCamera() {
    if (!navigator.mediaDevices?.getUserMedia) return Promise.reject(new Error("no camera"));
    return navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } } });
  }

  async function openCurtain() {
    if (curtain !== "closed") return;
    if (printing) { frogSay("one sec, still printing!"); return; }
    curtain = "opening";
    const token = ++openToken;
    Sound.unlock(); Sound.swish(); haptic(10);
    booth.classList.add("rustle");
    syncButton();
    let stream = null;
    try { stream = await getCamera(); } catch (_) { /* no camera: photos instead */ }
    if (token !== openToken) { stream?.getTracks().forEach((t) => t.stop()); return; }
    if (stream) {
      camStream = stream;
      video.srcObject = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => closeCurtain());
      await video.play().catch(() => {});
      if (token !== openToken) return;
    }
    noCam = !stream;
    booth.classList.remove("rustle");
    booth.classList.toggle("no-cam", noCam);
    booth.classList.add("open");
    curtain = "open";
    Sound.swish(); haptic([8, 30, 8]);
    setTimeout(() => frogSay(noCam ? "no camera? that's ok" : "hi you two!"), 500);
    syncButton();
  }

  function closeCurtain() {
    const was = curtain;
    openToken++;
    stopSession();
    camStream?.getTracks().forEach((t) => t.stop());
    camStream = null;
    video.srcObject = null;
    curtain = "closed";
    noCam = false;
    booth.classList.remove("open", "rustle", "no-cam");
    if (was !== "closed") { Sound.swish(); haptic(8); }
    syncButton();
  }

  function pullCord() {
    if (curtain === "closed") openCurtain();
    else if (curtain === "open" && !session) closeCurtain();
  }

  // the cord stretches as you pull, clicks past the catch, and springs back
  let pullFrom = null, pulled = 0;
  cord.addEventListener("pointerdown", (e) => {
    cord.setPointerCapture(e.pointerId);
    pullFrom = e.clientY;
    pulled = 0;
    cord.classList.add("pulling");
    Sound.unlock();
  });
  cord.addEventListener("pointermove", (e) => {
    if (pullFrom == null) return;
    const d = Math.max(0, e.clientY - pullFrom);
    const was = pulled;
    pulled = d < 50 ? d : 50 + (d - 50) * 0.3;
    cord.style.setProperty("--pull", pulled + "px");
    if (was <= 38 && pulled > 38) { Sound.tick(); haptic(8); }
  });
  const releaseCord = (e) => {
    if (pullFrom == null) return;
    pullFrom = null;
    cord.classList.remove("pulling");
    cord.style.setProperty("--pull", "0px");
    if (e.type === "pointercancel") return;
    if (pulled > 38 || pulled < 6) pullCord();
    else { Sound.boing(); frogSay("pull harder!", false); }
  };
  cord.addEventListener("pointerup", releaseCord);
  cord.addEventListener("pointercancel", releaseCord);
  cord.addEventListener("click", (e) => { if (e.detail === 0) pullCord(); });

  viewfinder.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    if (curtain === "closed") return openCurtain();
    if (curtain !== "open" || noCam || session) return;
    burst(e.clientX, e.clientY, { count: 5, art: ["heart"], spread: 50, rise: 70, size: [14, 22] });
    Sound.pop();
    frogSay(pick(["ok cuties ♡", "scoot closer!", "you two!!", `hi ${C.name.toLowerCase()}!`]));
  });

  document.addEventListener("pagechange", (e) => { if (e.detail !== "booth") closeCurtain(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) closeCurtain(); });

  /* ═════════════ the big button ═════════════ */
  function syncButton() {
    const n = layout().n;
    // with a fresh strip out and the curtain shut, the dock becomes save · send · scrapbook · again
    const result = !!stripCanvas && !printing && !session && curtain === "closed";
    setupRow.hidden = result;
    actions.hidden = !result;
    $$('[data-act="style"]').forEach((b) => (b.disabled = !!session || printing));
    if (session || printing) closeSheet();
    boothBtn.disabled = printing || curtain === "opening";
    boothBtn.classList.toggle("live", !!session);
    boothLabel.textContent =
      printing ? "printing…"
      : session ? `photo ${session.i + 1} of ${n} · stop`
      : curtain === "opening" ? "one sec…"
      : curtain === "open" ? (noCam ? "Pick photos instead" : `Start · ${n} photos ♡`)
      : stripCanvas ? "Another round ♡" : "Step inside ♡";
  }
  boothBtn.addEventListener("click", () => {
    Sound.unlock();
    if (printing) return;
    if (session) { stopSession(); toast("ok, paused ♡"); return; }
    if (curtain === "closed") return openCurtain();
    if (curtain !== "open") return;
    noCam ? files.click() : runSession();
  });

  /* ═════════════ a session: prompt → 3·2·1 → flash, a few times ═════════════ */
  function promptsFor(n) {
    const p = C.boothPrompts?.length ? C.boothPrompts : ["smile!"];
    if (n < p.length) return [...p.slice(0, n - 1), p[p.length - 1]];
    return Array.from({ length: n }, (_, i) => (i === n - 1 ? p[p.length - 1] : p[i % (p.length - 1 || 1)]));
  }
  const showPrompt = (text) => { vfPrompt.textContent = text; restart(vfPrompt, "show"); };
  const hidePrompt = () => vfPrompt.classList.remove("show");
  const lightBulbs = (upTo) => bulbs.forEach((b, j) => b.classList.toggle("lit", j <= upTo));

  async function runSession() {
    const L = layout(), prompts = promptsFor(L.n);
    const s = (session = { i: 0, shots: [], aborted: false });
    buildSlots(L.n);
    booth.classList.add("live");
    tray.classList.add("locked");
    scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    Sound.chime();
    for (let i = 0; i < L.n; i++) {
      s.i = i;
      syncButton();
      slotsEl.children[i]?.classList.add("next");
      showPrompt(prompts[i]);
      await wait(i ? 1100 : 1600);
      for (let k = 3; k >= 1 && !s.aborted; k--) {
        vfCount.textContent = k;
        restart(vfCount, "pop");
        lightBulbs(3 - k);
        Sound.tick(); Sound.thump(0.15 + (3 - k) * 0.12);
        haptic(8 + (3 - k) * 6);
        await wait(i ? 700 : 850);
      }
      if (s.aborted) return;
      await snap(s, i);
      await wait(800);
      if (s.aborted) return;
    }
    finishSession(s);
  }

  async function snap(s, i) {
    vfCount.classList.remove("pop");
    hidePrompt();
    // the whole screen turns into a soft flash, so faces actually get some light
    screenFlash.style.transition = "none";
    screenFlash.style.opacity = reduceMotion ? "0.5" : "0.94";
    await wait(70);
    if (s.aborted || !video.videoWidth) { screenFlash.style.opacity = "0"; return; }
    const shot = grab(video, video.videoWidth, video.videoHeight, true);
    s.shots[i] = shot;
    Sound.shutter();
    haptic([12, 30, 12]);
    restart(vfFlash, "go");
    requestAnimationFrame(() => { screenFlash.style.transition = "opacity .7s ease-out"; screenFlash.style.opacity = "0"; });
    freeze(shot);
    putThumb(i, shot);
    lightBulbs(-1);
    setTimeout(() => frogSay(pick(C.boothCheers?.length ? C.boothCheers : ["cute!!"])), 400);
  }

  function stopSession() {
    if (!session) return;
    session.aborted = true;
    session = null;
    booth.classList.remove("live");
    tray.classList.remove("locked");
    hidePrompt();
    vfCount.classList.remove("pop");
    lightBulbs(-1);
    screenFlash.style.opacity = "0";
    const n = layout().n;
    buildSlots(n, shots.length === n ? shots : []);
    syncButton();
  }

  async function finishSession(s) {
    session = null;
    printing = true; // the button reads "printing…" from here on
    syncButton();
    booth.classList.remove("live");
    showPrompt("that's a wrap! ♡");
    Sound.sparkle();
    await wait(1000);
    hidePrompt();
    closeCurtain();
    frogSay("printing!!");
    if (stripCanvas && !saved) tuck({ quiet: true }); // never lose a strip
    shots = s.shots;
    cache.clear();
    print();
  }

  // the moment after the flash, the photo hangs in the window for a beat
  function freeze(shot) {
    vfFreeze.width = shot.width;
    vfFreeze.height = shot.height;
    vfFreeze.getContext("2d").drawImage(shot, 0, 0);
    restart(vfFreeze, "show");
  }

  function grab(source, sw, sh, mirror) {
    const L = layout();
    const cw = Math.round(L.fw * SCALE), ch = Math.round(L.fh * SCALE);
    const c = document.createElement("canvas");
    c.width = cw; c.height = ch;
    const x = c.getContext("2d");
    const k = Math.max(cw / sw, ch / sh), w = cw / k, h = ch / k;
    if (mirror) { x.translate(cw, 0); x.scale(-1, 1); }
    x.drawImage(source, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, cw, ch);
    return c;
  }

  function buildSlots(n, fill = []) {
    slotsEl.innerHTML = '<span class="shot-slot"></span>'.repeat(n);
    fill.forEach((c, i) => putThumb(i, c, false));
  }
  function putThumb(i, src, fresh = true) {
    const slot = slotsEl.children[i];
    if (!slot) return;
    const t = document.createElement("canvas");
    t.width = 120;
    t.height = Math.round((120 * src.height) / src.width);
    t.getContext("2d").drawImage(src, 0, 0, t.width, t.height);
    if (!fresh) t.style.animation = "none";
    slot.replaceChildren(t);
    slot.classList.remove("next");
    slot.classList.add("filled");
  }

  // no camera? pick photos and the booth still prints them
  // drawn whole onto a canvas first, so odd images (svgs, giant photos) crop cleanly
  const loadImg = (file) => new Promise((res) => {
    const im = new Image(), url = URL.createObjectURL(file);
    im.onload = () => {
      const k = 1600 / Math.max(im.naturalWidth, im.naturalHeight);
      const c = document.createElement("canvas");
      c.width = Math.round(im.naturalWidth * k);
      c.height = Math.round(im.naturalHeight * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c);
    };
    im.onerror = () => { URL.revokeObjectURL(url); res(null); };
    im.src = url;
  });
  $("#pickPhotos").addEventListener("click", (e) => { e.stopPropagation(); files.click(); });
  files.addEventListener("change", async () => {
    const list = [...files.files];
    files.value = "";
    if (!list.length || session || printing) return;
    const L = layout();
    const imgs = (await Promise.all(list.slice(0, L.n).map(loadImg))).filter(Boolean);
    if (!imgs.length) { toast("hmm, couldn't read those photos"); return; }
    const s = (session = { i: 0, shots: [], aborted: false });
    tray.classList.add("locked");
    buildSlots(L.n);
    for (let i = 0; i < L.n; i++) {
      s.i = i;
      syncButton();
      const im = imgs[i % imgs.length];
      s.shots[i] = grab(im, im.width, im.height, false);
      restart(vfFlash, "go");
      Sound.shutter(); haptic(10);
      putThumb(i, s.shots[i]);
      await wait(420);
      if (s.aborted) return;
    }
    if (imgs.length < L.n) toast(`only ${imgs.length}? some get to be in twice ♡`);
    finishSession(s);
  });

  /* ═════════════ printing the strip ═════════════ */
  const fontsReady = document.fonts
    ? Promise.all(["700 60px Caveat", "700 28px Gaegu"].map((f) => document.fonts.load(f))).catch(() => {})
    : Promise.resolve();

  let grainTile;
  function grain() {
    if (grainTile) return grainTile;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d"), d = x.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() < 0.5 ? 0 : 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = Math.random() * 22;
    }
    x.putImageData(d, 0, 0);
    return (grainTile = c);
  }

  function processed(i, filter) {
    const src = shots[i];
    if (!src) return null;
    const key = i + filter;
    if (!cache.has(key)) {
      const c = document.createElement("canvas");
      c.width = src.width; c.height = src.height;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.drawImage(src, 0, 0);
      const img = x.getImageData(0, 0, c.width, c.height), d = img.data, px = FILTERS[filter].px;
      for (let j = 0; j < d.length; j += 4) px(d, j);
      x.putImageData(img, 0, 0);
      cache.set(key, c);
    }
    return cache.get(key);
  }

  // stickers drawn straight from the same paths as the site's art
  const PATHS = {
    heart: new Path2D("M50 86 C20 66 8 48 12 32 C16 16 36 12 50 28 C64 12 84 16 88 32 C92 48 80 66 50 86 Z"),
    shine: new Path2D("M26 34 Q28 26 36 25"),
    sparkle: new Path2D("M50 5 C54 36 64 46 95 50 C64 54 54 64 50 95 C46 64 36 54 5 50 C36 46 46 36 50 5 Z"),
    star: new Path2D("M50 7 L62 35 L93 37 L69 57 L77 89 L50 72 L23 89 L31 57 L7 37 L38 35 Z"),
  };
  function drawArt(x, kind, cx, cy, size, rot, fill) {
    x.save();
    x.translate(cx, cy); x.rotate(rot); x.scale(size / 100, size / 100); x.translate(-50, -50);
    x.lineJoin = x.lineCap = "round";
    x.fillStyle = fill; x.fill(PATHS[kind]);
    x.lineWidth = 6; x.strokeStyle = INK; x.stroke(PATHS[kind]);
    if (kind === "heart") { x.strokeStyle = "rgba(255,255,255,.7)"; x.stroke(PATHS.shine); }
    x.restore();
  }
  const roundRect = (x, a, b, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(a, b, w, h, r) : x.rect(a, b, w, h); };
  const pad2 = (v) => String(v).padStart(2, " ");
  const stampDate = (d = new Date()) => `'${String(d.getFullYear()).slice(2)} ${pad2(d.getMonth() + 1)} ${pad2(d.getDate())}`;
  const longDate = () => new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

  async function render(o = stripOpts) {
    await fontsReady;
    const L = layout(o.fmt, o.turn);
    const paper = L.f.film ? FILM : PAPERS[o.paper];
    const c = document.createElement("canvas");
    c.width = Math.round(L.W * SCALE);
    c.height = Math.round(L.H * SCALE);
    const x = c.getContext("2d");
    x.scale(SCALE, SCALE);
    const tooth = x.createPattern(grain(), "repeat");
    x.fillStyle = paper.bg; x.fillRect(0, 0, L.W, L.H);
    x.fillStyle = tooth; x.fillRect(0, 0, L.W, L.H);
    if (L.f.film) filmEdges(x, L);
    L.frames.forEach((fr) => frame(x, fr, processed(fr.shot, o.filter), L, tooth));
    L.foots.forEach((ft) => footer(x, ft, paper));
    if (L.cut) perforation(x, L, paper);
    stamps.forEach((s) => drawArt(x, s.t, s.x * L.W, s.y * L.H, s.s, s.r, s.fill));
    return c;
  }

  function frame(x, fr, src, L, tooth) {
    x.save();
    x.beginPath(); x.rect(fr.x, fr.y, fr.w, fr.h); x.clip();
    if (src) {
      const k = Math.max(fr.w / src.width, fr.h / src.height), sw = fr.w / k, sh = fr.h / k;
      x.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, fr.x, fr.y, fr.w, fr.h);
    } else {
      x.fillStyle = "#2b2b2b"; x.fillRect(fr.x, fr.y, fr.w, fr.h);
    }
    // a soft vignette and grain, like a real booth print
    const cx = fr.x + fr.w / 2, cy = fr.y + fr.h / 2;
    const g = x.createRadialGradient(cx, cy, Math.min(fr.w, fr.h) * 0.35, cx, cy, Math.hypot(fr.w, fr.h) * 0.55);
    g.addColorStop(0, "rgba(40,20,0,0)");
    g.addColorStop(1, "rgba(40,20,0,.28)");
    x.fillStyle = g; x.fillRect(fr.x, fr.y, fr.w, fr.h);
    x.fillStyle = tooth; x.fillRect(fr.x, fr.y, fr.w, fr.h);
    if (L.f.film) {
      // the orange date stamp old cameras burned into the corner
      x.font = "700 22px ui-monospace, Menlo, Consolas, monospace";
      x.textAlign = "right"; x.textBaseline = "alphabetic";
      x.shadowColor = "rgba(255,110,30,.9)"; x.shadowBlur = 6;
      x.fillStyle = "#ffa149";
      x.fillText(stampDate(), fr.x + fr.w - 16, fr.y + fr.h - 16);
    }
    x.restore();
    x.strokeStyle = "rgba(0,0,0,.14)"; x.lineWidth = 1.5;
    x.strokeRect(fr.x + 0.75, fr.y + 0.75, fr.w - 1.5, fr.h - 1.5);
  }

  function filmEdges(x, L) {
    const along = L.across ? L.W : L.H, cross = L.across ? L.H : L.W;
    x.save();
    if (!L.across) { x.translate(L.W, 0); x.rotate(Math.PI / 2); }
    x.fillStyle = "#efe6cc";
    for (let p = 18; p + 22 < along; p += 40) {
      for (const q of [BAND * 0.3, cross - BAND * 0.3]) { roundRect(x, p, q - 12, 22, 24, 5); x.fill(); }
    }
    x.fillStyle = FILM.ink;
    x.font = "700 19px ui-monospace, Menlo, Consolas, monospace";
    x.textBaseline = "middle";
    const label = `${C.name.toUpperCase()} 400`;
    for (let p = END + 30; p < along - 200; p += 340) x.fillText(label, p, BAND * 0.74);
    L.frames.forEach((fr, i) => {
      const mid = L.across ? fr.x + fr.w / 2 : fr.y + fr.h / 2;
      x.fillText(`▸${i + 1}`, mid - 60, cross - BAND * 0.74);
      x.fillText(`${i + 1}A`, mid + 40, cross - BAND * 0.74);
    });
    x.restore();
  }

  function footer(x, ft, paper) {
    const cap = C.boothCaption || `${C.name} + ${C.from}`;
    const room = (ft.side ? ft.h : ft.w) - 130;
    x.save();
    x.translate(ft.x + ft.w / 2, ft.y + ft.h / 2);
    if (ft.side) x.rotate(-Math.PI / 2);
    x.textAlign = "center"; x.textBaseline = "alphabetic"; x.fillStyle = paper.ink;
    let size = 64;
    do { x.font = `700 ${size}px Caveat, Gaegu, cursive`; } while (x.measureText(cap).width > room && (size -= 4) > 28);
    x.fillText(cap, 0, 4);
    const w = x.measureText(cap).width;
    drawArt(x, "heart", w / 2 + 30, -14, 42, 0.25, "#ef5a7a");
    drawArt(x, "sparkle", -w / 2 - 28, -20, 30, 0, "#f9d64a");
    x.font = "700 27px Gaegu, cursive";
    x.globalAlpha = 0.72;
    x.fillText(longDate().toLowerCase(), 0, 46);
    x.restore();
  }

  function perforation(x, L, paper) {
    x.save();
    x.strokeStyle = paper.ink; x.globalAlpha = 0.4; x.lineWidth = 3; x.lineCap = "round";
    x.setLineDash([1, 11]);
    x.beginPath(); x.moveTo(L.cut, 10); x.lineTo(L.cut, L.H - 10); x.stroke();
    x.restore();
  }

  function setStrip(canvas) {
    stripCanvas = canvas;
    return new Promise((res) => canvas.toBlob((blob) => {
      stripBlob = blob;
      if (stripURL) URL.revokeObjectURL(stripURL);
      stripURL = URL.createObjectURL(blob);
      $$("img", strip).forEach((im) => (im.src = stripURL));
      res();
    }, "image/jpeg", 0.93));
  }

  let renderToken = 0;
  async function rerender() {
    const t = ++renderToken;
    const c = await render();
    if (t === renderToken) await setStrip(c);
  }

  function sizeStrip(L) {
    const avail = Math.min(innerWidth, 460) - 90;
    const maxH = clamp(innerHeight - 300, 220, 560);
    page.style.setProperty("--sw", Math.round(Math.min(avail, (maxH * L.W) / L.H)) + "px");
  }

  async function print() {
    printing = true;
    tray.classList.add("locked");
    booth.classList.add("printing");
    syncButton();
    stripOpts = { ...opts };
    stamps = [];
    untear();
    stopDeveloping();
    const L = layout(stripOpts.fmt, stripOpts.turn);
    sizeStrip(L);
    await setStrip(await render());
    saved = false;
    strip.classList.remove("dry", "can-tear");
    $$("img", strip).forEach((im) => im.classList.add("developing"));
    strip.style.setProperty("--dev", 0);
    stripHint.textContent = "";
    ghost.hidden = true;
    stripOut.hidden = false;
    restart(stripOut, "printing");
    // follow the strip down, keeping a sliver of the slot in view above it
    setTimeout(() => scrollTo({ top: stripOut.getBoundingClientRect().top + scrollY - 44, behavior: reduceMotion ? "auto" : "smooth" }), 250);
    Sound.whirr(2.8);
    await wait(reduceMotion ? 300 : 2850);
    stripOut.classList.remove("printing");
    booth.classList.remove("printing");
    printing = false;
    tray.classList.remove("locked");
    syncButton();
    Sound.pop(); haptic(14);
    develop();
  }

  /* ═════════════ still wet: fan it dry ═════════════ */
  const dryHint = (L) => (L.cut ? "tear along the dots ✂ · tap to leave hearts" : "tap it to leave little hearts ♡");
  function develop() {
    const done = () => {
      stopDeveloping();
      const L = layout(stripOpts.fmt, stripOpts.turn);
      $$("img", strip).forEach((im) => im.classList.remove("developing"));
      strip.classList.add("dry");
      strip.classList.toggle("can-tear", !!L.cut && !torn);
      const [x, y] = centerOf(strip);
      burst(x, y, { count: 10, art: ["sparkle", "heart"], spread: 120, rise: 140 });
      Sound.chime(); haptic([10, 30, 10]);
      stripHint.textContent = dryHint(L);
    };
    if (reduceMotion) return done();
    let dev = 0, last = performance.now();
    stripHint.textContent = "still wet! fan it dry (tap or shake)";
    const run = (developing = { off: onShake(fan), boost: (a) => (dev += a) });
    const step = (t) => {
      if (developing !== run) return;
      dev += Math.max(0, t - last) / 7000;
      last = t;
      strip.style.setProperty("--dev", Math.min(1, dev).toFixed(3));
      if (dev < 1) requestAnimationFrame(step);
      else done();
    };
    requestAnimationFrame(step);
  }
  function stopDeveloping() { developing?.off(); developing = null; }
  function fan() {
    if (!developing) return;
    developing.boost(0.08);
    restart(strip, "fan");
    Sound.paper(); haptic(6);
  }

  /* ═════════════ once dry: tap to leave little hearts ═════════════ */
  const STAMPS = [["heart", "#ef5a7a"], ["heart", "#f7a6b8"], ["sparkle", "#f9d64a"], ["heart", "#ef5a7a"], ["star", "#f9d64a"]];
  strip.addEventListener("click", (e) => {
    if (e.target.closest(".snip")) return;
    if (developing) return fan();
    if (!strip.classList.contains("dry")) return;
    const img = e.target.closest("img") || $("#stripImg");
    const r = img.getBoundingClientRect(), L = layout(stripOpts.fmt, stripOpts.turn);
    if (stamps.length >= 30) { toast("that's a lot of love (it's full ♡)"); return; }
    const [t, fill] = STAMPS[stamps.length % STAMPS.length];
    stamps.push({
      t, fill, r: rand(-0.4, 0.4), s: ((28 * L.W) / r.width) * rand(0.85, 1.2),
      x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1),
    });
    burst(e.clientX, e.clientY, { count: 4, art: [t === "heart" ? () => ART.heart(fill) : t], spread: 34, rise: 44, size: [12, 18] });
    t === "heart" ? Sound.kiss() : Sound.sparkle();
    haptic(8);
    saved = false;
    rerender();
  });

  /* ═════════════ two strips: tear along the dots ═════════════ */
  let snipFrom = null;
  snip.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    snip.setPointerCapture(e.pointerId);
    snipFrom = { y: e.clientY, cut, tick: cut };
    snip.classList.add("dragging");
    Sound.unlock();
  });
  snip.addEventListener("pointermove", (e) => {
    if (!snipFrom || torn) return;
    cut = clamp(snipFrom.cut + (e.clientY - snipFrom.y) / strip.getBoundingClientRect().height, 0, 1);
    strip.style.setProperty("--cut", cut.toFixed(3));
    if (cut - snipFrom.tick > 0.04) {
      snipFrom.tick = cut;
      Sound.noise({ dur: 0.05, freq: rand(2600, 4200), type: "highpass", vol: 0.14 });
      haptic(4);
    }
    if (cut > 0.97) tearApart();
  });
  const snipEnd = () => {
    if (!snipFrom) return;
    snipFrom = null;
    snip.classList.remove("dragging");
    if (!torn && cut > 0.02) stripHint.textContent = "keep going… ✂";
  };
  snip.addEventListener("pointerup", snipEnd);
  snip.addEventListener("pointercancel", snipEnd);
  snip.addEventListener("click", (e) => { e.stopPropagation(); if (e.detail === 0) tearApart(); });

  function tearApart() {
    if (torn) return;
    torn = true;
    snipFrom = null;
    snip.classList.remove("dragging");
    strip.classList.remove("can-tear");
    strip.style.setProperty("--cut", 1);
    ["l", "r"].forEach((side) => {
      const half = document.createElement("div");
      half.className = `strip-half half-${side}`;
      half.innerHTML = `<img src="${stripURL}" alt="${side === "l" ? "Your" : "My"} half of the photo strip"><span class="half-label">${side === "l" ? "for you ♡" : "for me ♡"}</span>`;
      strip.appendChild(half);
    });
    void strip.offsetWidth;
    strip.classList.add("torn");
    stripOut.classList.add("torn");
    Sound.paper(); Sound.pop();
    setTimeout(() => Sound.chime(), 280);
    haptic([10, 30, 20]);
    const r = strip.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.4, { count: 10, art: ["heart"], spread: 90, rise: 120 });
    stripHint.textContent = "now we each have one ♡";
  }
  function untear() {
    torn = false;
    cut = 0;
    strip.style.setProperty("--cut", 0);
    strip.classList.remove("torn");
    stripOut.classList.remove("torn");
    $$(".strip-half", strip).forEach((h) => h.remove());
  }

  /* ═════════════ save · send · scrapbook · again ═════════════ */
  const fileName = () => {
    const d = new Date();
    return `photobooth-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.jpg`;
  };
  const canShareFiles = (() => {
    try { return !!navigator.canShare?.({ files: [new File([""], "a.jpg", { type: "image/jpeg" })] }); } catch { return false; }
  })();
  if (!canShareFiles) $('[data-act="send"]', actions).remove();

  function keep() {
    if (!stripBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(stripBlob);
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    saved = true;
    Sound.chime(); haptic(10);
    toast("saved ♡ (long-press works too)");
  }

  async function send() {
    if (!stripBlob) return;
    const file = new File([stripBlob], fileName(), { type: "image/jpeg" });
    try {
      await navigator.share({ files: [file], title: "our photo strip ♡" });
      saved = true;
      Sound.chime();
    } catch (_) { /* closed the share sheet */ }
  }

  function shrink(c, max) {
    const s = Math.min(1, max / Math.max(c.width, c.height));
    const o = document.createElement("canvas");
    o.width = Math.round(c.width * s);
    o.height = Math.round(c.height * s);
    o.getContext("2d").drawImage(c, 0, 0, o.width, o.height);
    return o.toDataURL("image/jpeg", 0.82);
  }

  function tuck({ quiet = false } = {}) {
    if (!stripCanvas) return;
    if (tuckedVersion === stripCanvas) { if (!quiet) toast("it's already in the scrapbook ♡"); return; }
    tuckedVersion = stripCanvas;
    saved = true;
    const ok = addMemory({
      src: shrink(stripCanvas, 1100), caption: "photo booth ♡", date: longDate(),
      story: "squeezed into a tiny booth together", tape: pick(["green", "yellow", "pink", "blue"]), fit: "contain", added: true,
    });
    if (quiet) { toast("saved the last strip to the scrapbook ♡"); return; }
    flyToScrapbook();
    toast(ok ? "tucked into the scrapbook ♡" : "it's in there for now (too big to remember 🥲)");
  }

  // a tiny copy of the strip flies down into the scrapbook tab
  function flyToScrapbook() {
    const tab = $('.tab[data-tab="scrap"]'), r = strip.getBoundingClientRect(), [tx, ty] = centerOf(tab);
    const ghost = document.createElement("img");
    ghost.src = stripURL;
    ghost.className = "particle";
    ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
    $("#fx").appendChild(ghost);
    Sound.tone({ f: 900, to: 300, dur: 0.6, vol: 0.08 });
    ghost.animate([
      { transform: "none", opacity: 1 },
      { transform: `translate(${tx - r.left - r.width / 2}px, ${ty - r.top - r.height / 2}px) scale(.08) rotate(25deg)`, opacity: 0.7 },
    ], { duration: reduceMotion ? 1 : 750, easing: "cubic-bezier(.5,-0.3,.7,1)" }).onfinish = () => {
      ghost.remove();
      restart(tab, "bump");
      Sound.pop(); haptic(10);
      burst(tx, ty - 10, { count: 6, art: ["heart"], spread: 50, rise: 70, size: [12, 18] });
    };
  }

  function again() {
    Sound.boing();
    scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(openCurtain, 350);
  }

  $(".booth-dock").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    if (b.dataset.act === "style") return openSheet(b);
    const [x, y] = centerOf(b);
    burst(x, y - 20, { count: 4, art: ["sparkle", "heart"], spread: 40, rise: 50, size: [10, 16] });
    ({ keep, send, tuck, again })[b.dataset.act]();
  });

  /* ═════════════ the style sheet ═════════════ */
  function openSheet(from) {
    if (session || printing || tray.classList.contains("open")) return;
    tray.classList.add("open");
    tray.setAttribute("aria-hidden", "false");
    scrim.classList.add("show");
    restart(from, "squish");
    Sound.paper(); haptic(8);
    $(".chip.on", tray)?.scrollIntoView({ block: "nearest", inline: "center" });
  }
  function closeSheet() {
    if (!tray.classList.contains("open")) return;
    tray.classList.remove("open");
    tray.setAttribute("aria-hidden", "true");
    scrim.classList.remove("show");
    Sound.paper();
  }
  $("#sheetDone").addEventListener("click", () => { closeSheet(); Sound.pop(); });
  scrim.addEventListener("click", closeSheet);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
  document.addEventListener("pagechange", closeSheet);

  /* ═════════════ the options tray ═════════════ */
  function mini(key, turn) {
    const L = layout(key, turn), s = 30 / Math.max(L.W, L.H), px = (v) => (v * s).toFixed(1) + "px";
    return `<span class="mini${L.f.film ? " film" : ""}" style="width:${px(L.W)};height:${px(L.H)}">${
      L.frames.map((fr) => `<i style="left:${px(fr.x)};top:${px(fr.y)};width:${px(fr.w)};height:${px(fr.h)}"></i>`).join("")
    }${L.cut ? `<b style="left:${px(L.cut)}"></b>` : ""}</span>`;
  }
  const chip = (opt, val, inner, label = "") =>
    `<button class="chip" data-opt="${opt}" data-val="${val}"${label ? ` aria-label="${label}"` : ""}>${inner}</button>`;

  $("#optFmt").innerHTML = Object.entries(FORMATS).map(([k, F]) =>
    chip("fmt", k, `<span class="mini-box"></span><span>${F.name}<small></small></span>`)).join("");
  $("#optTurn").innerHTML = chip("turn", "v", `<b class="turn-ico">↕</b>tall`) + chip("turn", "h", `<b class="turn-ico">↔</b>wide`);
  $("#optPaper").innerHTML = Object.entries(PAPERS).map(([k, P]) =>
    chip("paper", k, `<span class="swatch" style="background:${P.bg}"></span>${P.name}`, `${P.name} paper`)).join("");
  $("#optFilter").innerHTML = Object.entries(FILTERS).map(([k, F]) => chip("filter", k, F.name)).join("");

  function syncChips() {
    const f = FORMATS[opts.fmt];
    $$(".style-mini").forEach((m) => (m.innerHTML = mini(opts.fmt, opts.turn)));
    $$(".chip", tray).forEach((b) => {
      const { opt, val } = b.dataset;
      const on = opt === "turn" && !f.turn ? val === "v" : opts[opt] === val;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
      b.disabled = (opt === "turn" && !f.turn) || (opt === "paper" && !!f.film);
      if (opt === "fmt") {
        const F = FORMATS[val];
        $(".mini-box", b).innerHTML = mini(val, opts.turn);
        $("small", b).textContent = F.size[F.turn && opts.turn === "h" ? 1 : 0];
      }
    });
  }

  // the dashed outline of the strip you're about to print, at the size it'll come out
  function drawGhost() {
    if (stripCanvas) return;
    const L = layout();
    sizeStrip(L);
    const w = parseFloat(page.style.getPropertyValue("--sw")), k = w / L.W;
    ghostPaper.style.width = w + "px";
    ghostPaper.style.height = Math.round(L.H * k) + "px";
    ghostPaper.innerHTML = L.frames.map((fr) =>
      `<i style="left:${(fr.x * k).toFixed(1)}px;top:${(fr.y * k).toFixed(1)}px;width:${(fr.w * k).toFixed(1)}px;height:${(fr.h * k).toFixed(1)}px"></i>`).join("");
    ghost.classList.toggle("tiny", ghost.clientHeight < 110);
  }
  addEventListener("resize", drawGhost);
  document.addEventListener("pagechange", (e) => { if (e.detail === "booth") requestAnimationFrame(drawGhost); });

  function applyLook() {
    const L = layout();
    page.style.setProperty("--ar", (L.fw / L.fh).toFixed(4));
    page.style.setProperty("--vf-filter", FILTERS[opts.filter].css);
    if (!session) buildSlots(L.n, shots.length === L.n ? shots : []);
    drawGhost();
    syncButton();
  }

  const shapeOf = (o) => o.fmt + (FORMATS[o.fmt].turn ? o.turn : "");
  tray.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b || b.disabled || session || printing) return;
    const { opt, val } = b.dataset;
    restart($$(".style-mini")[setupRow.hidden ? 1 : 0], "squish");
    if (opts[opt] === val) return;
    opts[opt] = val;
    store.set("booth", opts);
    Sound.tick(); haptic(6);
    restart(b, "squish");
    syncChips();
    applyLook();
    if (opt === "fmt" || opt === "turn") restart(viewfinder, "squish");

    // a printed strip can be re-printed in a new style, as long as the photo count fits
    if (!stripCanvas || stripOut.hidden) return;
    if (layout().n !== shots.length) {
      if (opt === "fmt" || opt === "turn") toast("that one needs a fresh round of photos ♡");
      return;
    }
    reprint(shapeOf(opts) !== shapeOf(stripOpts));
  });

  async function reprint(shapeChanged) {
    stripOpts = { ...opts };
    const L = layout(stripOpts.fmt, stripOpts.turn);
    if (shapeChanged) {
      stamps = [];
      untear();
      sizeStrip(L);
      strip.classList.toggle("can-tear", !!L.cut && strip.classList.contains("dry"));
    }
    saved = false;
    await rerender();
    restart(strip, "reprint");
    Sound.paper();
    if (strip.classList.contains("dry")) stripHint.textContent = dryHint(L);
  }

  syncChips();
  applyLook();
})();
