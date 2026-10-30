(() => {
  const C = window.BDAY;
  const { Sound, haptic, burst, doodleAt, Confetti, makeDraggable, toast, rand, pick, reduceMotion } = window.FX;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SVGNS = "http://www.w3.org/2000/svg";
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem("jc-" + k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("jc-" + k, JSON.stringify(v)); return true; } catch { return false; } },
  };

  /* ═════════════ fill in the handmade bits ═════════════ */
  $$("[data-art]").forEach((el) => { const f = ART[el.dataset.art]; if (f) el.innerHTML = f(); });
  $$("[data-art-frog-heart]").forEach((el) => (el.innerHTML = ART.frog({ heart: true, crown: false })));
  $$("[data-art-frog-plain]").forEach((el) => (el.innerHTML = ART.frog({ crown: false })));
  $$("[data-name]").forEach((el) => (el.textContent = C.name));
  $$("[data-from]").forEach((el) => (el.textContent = C.from));
  $$("[data-scribble]").forEach((el) => (el.textContent = C.cakeScribbles[+el.dataset.scribble] || ""));
  $("[data-sticky-front]").textContent = C.stickyFront;
  $("[data-sticky-back]").textContent = C.stickyBack;
  document.title = `Happy Birthday, ${C.name} ♡`;

  // scattered confetti on every page, drifting with device tilt
  const confettiColors = ["#ef5a7a", "#f9d64a", "#5fb3e8", "#f6a73b", "#3f9a45", "#f7a6b8", "#b98ce8"];
  $$(".decor-confetti").forEach((box) => {
    for (let i = 0; i < 16; i++) {
      const piece = document.createElement("i");
      const edge = Math.random() < 0.8;
      const x = edge ? (Math.random() < 0.5 ? rand(1, 10) : rand(88, 97)) : rand(10, 90);
      piece.style.left = x + "%";
      piece.style.top = rand(2, 96) + "%";
      piece.style.background = pick(confettiColors);
      piece.style.setProperty("--rot", rand(-70, 70) + "deg");
      piece.style.setProperty("--z", rand(4, 18).toFixed(1));
      if (Math.random() < 0.3) { piece.style.width = "12px"; piece.style.height = "12px"; piece.style.borderRadius = "50%"; }
      box.appendChild(piece);
    }
  });

  /* ═════════════ sound toggle ═════════════ */
  const muteBtn = $("#muteBtn");
  const syncMute = () => muteBtn.classList.toggle("is-muted", Sound.muted);
  syncMute();
  muteBtn.addEventListener("click", () => {
    Sound.unlock();
    Sound.setMuted(!Sound.muted);
    syncMute();
    if (!Sound.muted) Sound.chime();
    toast(Sound.muted ? "shh… sound off" : "sound on ♪");
  });

  /* ═════════════ tilt parallax ═════════════ */
  let tiltRaf = null, tx = 0, ty = 0;
  const applyTilt = () => {
    tiltRaf = null;
    document.documentElement.style.setProperty("--tx", tx.toFixed(3));
    document.documentElement.style.setProperty("--ty", ty.toFixed(3));
  };
  const setTilt = (x, y) => { tx = clamp(x, -1, 1); ty = clamp(y, -1, 1); tiltRaf ||= requestAnimationFrame(applyTilt); };
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    setTilt(e.gamma / 25, (e.beta - 45) / 25);
  });
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") setTilt((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
  });

  // shake detection (used to "shake it like a polaroid")
  let lastShake = 0;
  const shakeListeners = new Set();
  addEventListener("devicemotion", (e) => {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a) return;
    const mag = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    if (mag > 32 && Date.now() - lastShake > 120) { lastShake = Date.now(); shakeListeners.forEach((f) => f()); }
  });

  async function askMotionPermission() {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) await DeviceOrientationEvent.requestPermission();
      if (typeof DeviceMotionEvent !== "undefined" && DeviceMotionEvent.requestPermission) await DeviceMotionEvent.requestPermission();
    } catch (_) { /* fine, it's just a bonus */ }
  }

  /* ═════════════ frogs watch your finger ═════════════ */
  addEventListener("pointermove", (e) => {
    $$(".page.is-active .art-frog, .detail.open .art-frog").forEach((svg) => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.3);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(3.2, d / 40);
      svg.querySelectorAll(".pupil").forEach((p) => p.setAttribute("transform", `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`));
    });
  }, { passive: true });

  /* ═════════════ INTRO ═════════════ */
  const intro = $("#intro"), gift = $("#gift"), introHint = $("#introHint");
  gift.innerHTML = ART.gift();
  const hints = ["tap the present", "again!", "one more!!"];
  let giftTaps = 0;
  gift.addEventListener("click", () => {
    Sound.unlock();
    if (giftTaps === 0) askMotionPermission();
    giftTaps++;
    const [x, y] = centerOf(gift);
    if (giftTaps < 3) {
      gift.classList.remove("shake-1", "shake-2");
      void gift.offsetWidth;
      gift.classList.add("shake-" + giftTaps);
      introHint.textContent = hints[giftTaps];
      restart(introHint, "squish");
      Sound.boing();
      haptic(15 * giftTaps);
      burst(x, y - 40, { count: 4 + giftTaps * 2, art: ["sparkle", "heart"], spread: 110, rise: 120, size: [16, 26] });
    } else {
      gift.classList.add("open");
      introHint.textContent = "🎉";
      Sound.chime();
      Sound.pop();
      haptic([20, 40, 30]);
      Confetti.fire({ x, y, count: 170 });
      setTimeout(enterApp, 650);
    }
  });

  function enterApp() {
    intro.classList.add("gone");
    const app = $("#app");
    app.classList.add("ready");
    app.removeAttribute("aria-hidden");
    showPage("cake", { quiet: true });
    setTimeout(() => flashWishLabel("tap a flame or hold below ↓", 3200), 1400);
    setTimeout(() => intro.remove(), 900);
  }

  /* ═════════════ TABS ═════════════ */
  const tabBlob = $("#tabBlob");
  const order = ["cake", "scrap", "booth", "notes"];
  let currentPage = null;
  function showPage(name, { quiet = false } = {}) {
    if (name === currentPage) return;
    currentPage = name;
    $$(".page").forEach((p) => p.classList.toggle("is-active", p.dataset.page === name));
    $$(".tab").forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      on ? t.setAttribute("aria-current", "page") : t.removeAttribute("aria-current");
    });
    tabBlob.style.setProperty("--i", order.indexOf(name));
    restart(tabBlob, "squish-x");
    window.scrollTo(0, 0);
    if (!quiet) { Sound.paper(); Sound.tick(); haptic(8); }
    if (name === "scrap") developAll();
    if (name !== "cake") stopMic();
    document.dispatchEvent(new CustomEvent("pagechange", { detail: name }));
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showPage(t.dataset.tab)));

  // docks get a soft paper backdrop only while they're pinned over content
  $$(".dock").forEach((dock) => {
    const sentinel = Object.assign(document.createElement("span"), { className: "dock-sentinel" });
    dock.after(sentinel);
    new IntersectionObserver(([e]) => dock.classList.toggle("stuck", !e.isIntersecting && e.boundingClientRect.top > 0),
      { rootMargin: "0px 0px -100px 0px" }).observe(sentinel);
  });

  /* ═════════════ tap the paper anywhere → doodle ═════════════ */
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, .polaroid, .placed, .topping, input, .detail-polaroid, .tabbar, .letter, .sticker-tray, .intro, .cake-svg, .booth, .strip-out, .dock, .sheet, .sheet-scrim")) return;
    doodleAt(e.clientX, e.clientY);
    Sound.tone({ f: rand(1500, 2200), dur: 0.08, vol: 0.06 });
  });

  /* ═════════════ CAKE ═════════════ */
  const cakeWrap = $("#cakeWrap"), cakeEl = $("#cake"), toppingsEl = $("#toppings");
  const blowBtn = $("#blowBtn"), blowLabel = $("#blowLabel"), micBtn = $("#micBtn"), micLabel = $("#micLabel"), wishLabel = $("#wishLabel");
  cakeEl.innerHTML = ART.cake(C.candles);
  const candles = $$(".candle", cakeEl);
  let cakeDone = false, wishing = false;

  let wishTimer;
  function flashWishLabel(text, ms = 2200) {
    wishLabel.textContent = text;
    wishLabel.classList.add("show");
    clearTimeout(wishTimer);
    if (ms) wishTimer = setTimeout(() => wishLabel.classList.remove("show"), ms);
  }

  const litCandles = () => candles.filter((c) => !c.classList.contains("out"));

  function puffSmoke(candle) {
    const anchor = candle.querySelector(".smoke-anchor");
    [0, 180, 380].forEach((delay, i) => {
      setTimeout(() => {
        const p = document.createElementNS(SVGNS, "path");
        const s = i % 2 ? -1 : 1;
        p.setAttribute("d", `M0 0 C${-6 * s} -8 ${6 * s} -14 0 -22 C${-6 * s} -30 ${6 * s} -36 0 -44`);
        p.setAttribute("class", "smoke");
        anchor.appendChild(p);
        setTimeout(() => p.remove(), 1700);
      }, delay);
    });
  }

  function extinguish(candle) {
    if (candle.classList.contains("out") || wishing) return;
    candle.classList.remove("relit");
    candle.classList.add("out");
    Sound.poof();
    haptic(14);
    puffSmoke(candle);
    const out = candles.length - litCandles().length;
    blowBtn.style.setProperty("--p", out / candles.length);
    if (!litCandles().length) wishMoment();
  }

  candles.forEach((c) => {
    c.querySelector(".flame-hit").addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (cakeDone) return;
      extinguish(c);
      const [x, y] = [e.clientX, e.clientY];
      burst(x, y, { count: 3, art: [() => ART.sparkle("#fff")], spread: 30, rise: 40, size: [10, 16] });
    });
  });

  function wishMoment() {
    wishing = true;
    stopBlow(true);
    stopMic();
    const overlay = $("#wishOverlay");
    setTimeout(() => { overlay.classList.add("show"); Sound.sparkle(); }, 500);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      overlay.classList.remove("show");
      wishing = false;
      cakeDone = true;
      blowBtn.classList.add("done");
      blowBtn.style.setProperty("--p", 0);
      blowLabel.textContent = "Relight the candles";
      flashWishLabel("wish locked in ✨ (no telling!)", 0);
      setTimeout(() => {
        Confetti.fire({ x: innerWidth / 2, y: innerHeight * 0.45, count: 180 });
        setTimeout(() => Confetti.rain(80), 500);
        Sound.happyBirthday();
        haptic([30, 60, 30, 60, 80]);
      }, 350);
    };
    overlay.onclick = finish;
    setTimeout(finish, 3600);
  }

  function relight() {
    cakeDone = false;
    blowBtn.classList.remove("done");
    blowLabel.textContent = "Hold to blow candles";
    wishLabel.classList.remove("show");
    candles.forEach((c, i) => setTimeout(() => {
      c.classList.remove("out");
      c.classList.add("relit");
      Sound.tone({ f: 600 + i * 120, dur: 0.12, type: "triangle", vol: 0.15 });
    }, i * 140));
    haptic(10);
  }

  // blowing: one loop shared by the hold button and the microphone
  const blow = { target: 0, level: 0, power: 0, raf: null, last: 0, hold: false };
  function blowLoop(t) {
    const dt = Math.min(0.05, (t - (blow.last || t)) / 1000);
    blow.last = t;
    if (mic.on) blow.target = Math.max(blow.hold ? 1 : 0, mic.read());
    blow.level += (blow.target - blow.level) * (blow.target > blow.level ? 0.18 : 0.1);
    cakeWrap.style.setProperty("--lean", (blow.level * 34).toFixed(1));
    cakeWrap.classList.toggle("is-blowing", blow.level > 0.15);
    Sound.blowLevel(blow.level);
    if (blow.level > 0.35 && !wishing && !cakeDone) {
      blow.power += blow.level * dt;
      if (blow.power > 0.45) {
        blow.power = 0;
        const lit = litCandles();
        if (lit.length) extinguish(pick(lit));
      }
    }
    if (blow.level > 0.01 || blow.target > 0 || mic.on) blow.raf = requestAnimationFrame(blowLoop);
    else { blow.raf = null; blow.last = 0; cakeWrap.style.setProperty("--lean", 0); Sound.blowStop(); }
  }
  const kickBlow = () => { if (!blow.raf) blow.raf = requestAnimationFrame(blowLoop); };

  function startBlow() {
    if (cakeDone || wishing) return;
    Sound.unlock();
    blow.hold = true;
    blow.target = 1;
    blowBtn.classList.add("pressing");
    Sound.blowStart();
    haptic(10);
    kickBlow();
  }
  function stopBlow(force) {
    if (!blow.hold && !force) return;
    blow.hold = false;
    blow.target = 0;
    blowBtn.classList.remove("pressing");
  }

  blowBtn.addEventListener("pointerdown", (e) => {
    blowBtn.setPointerCapture(e.pointerId);
    blow.pressedWhileDone = cakeDone;
    if (cakeDone) return;
    startBlow();
  });
  blowBtn.addEventListener("pointerup", () => { if (blow.pressedWhileDone && cakeDone) relight(); stopBlow(); });
  blowBtn.addEventListener("pointercancel", () => stopBlow());
  blowBtn.addEventListener("contextmenu", (e) => e.preventDefault());
  blowBtn.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); cakeDone ? relight() : startBlow(); } });
  blowBtn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") stopBlow(); });

  // real blowing into the microphone
  const mic = {
    on: false, stream: null, analyser: null, buf: null,
    read() {
      if (!this.analyser) return 0;
      this.analyser.getFloatTimeDomainData(this.buf);
      let sum = 0;
      for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
      const rms = Math.sqrt(sum / this.buf.length);
      return clamp((rms - 0.05) / 0.16, 0, 1);
    },
  };
  async function startMic() {
    Sound.unlock();
    if (!navigator.mediaDevices?.getUserMedia || !Sound.ctx) { toast("no mic here, just hold the button 💨"); return; }
    try {
      mic.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const src = Sound.ctx.createMediaStreamSource(mic.stream);
      mic.analyser = Sound.ctx.createAnalyser();
      mic.analyser.fftSize = 1024;
      mic.buf = new Float32Array(mic.analyser.fftSize);
      src.connect(mic.analyser);
      mic.on = true;
      micLabel.textContent = "listening";
      micBtn.classList.add("listening");
      flashWishLabel("blow on your phone! 🌬️", 2800);
      Sound.blowStart();
      kickBlow();
    } catch (_) {
      toast("no mic? that's ok, just hold the button 💨");
    }
  }
  function stopMic() {
    if (!mic.on) return;
    mic.on = false;
    mic.stream?.getTracks().forEach((t) => t.stop());
    mic.stream = mic.analyser = null;
    micLabel.textContent = "mic";
    micBtn.classList.remove("listening");
  }
  micBtn.addEventListener("click", () => {
    if (cakeDone) { toast("relight the candles first 🕯️"); return; }
    mic.on ? stopMic() : startMic();
  });

  // toppings
  const spots = [
    [112, 248, 90, 108], [82, 278, 150, 168], [82, 278, 192, 200], [56, 304, 216, 236], [60, 300, 278, 286],
  ];
  function addTopping(type, fromBtn) {
    const [x1, x2, y1, y2] = pick(spots);
    const x = rand(x1, x2), y = rand(y1, y2);
    const t = document.createElement("div");
    t.className = "topping";
    t.style.left = (x / 360) * 100 + "%";
    t.style.top = (y / 340) * 100 + "%";
    t.style.setProperty("--rr", rand(-25, 25).toFixed(0) + "deg");
    t.innerHTML = `<span>${ART[type]()}</span>`;
    toppingsEl.appendChild(t);
    while (toppingsEl.children.length > 30) toppingsEl.firstElementChild.remove();
    Sound.tone({ f: 1400, to: 500, dur: 0.4, type: "sine", vol: 0.08 });
    setTimeout(() => { Sound.pop(); haptic(8); restart(cakeWrap, "squish"); }, 430);
    t.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      t.classList.add("bye");
      Sound.pop();
      setTimeout(() => t.remove(), 360);
    });
    if (fromBtn) {
      const [bx, by] = centerOf(fromBtn);
      burst(bx, by - 20, { count: 3, art: ["sparkle"], spread: 40, rise: 50, size: [10, 16] });
    }
  }
  $$("[data-topper]").forEach((b) => b.addEventListener("click", () => {
    addTopping(b.dataset.topper, b);
    if (toppingsEl.children.length === 8) setTimeout(() => toast("what a masterpiece 🎂"), 600);
  }));

  // frog
  const frog = $("#frog"), frogBubble = $("#frogBubble");
  let frogPokes = 0, bubbleTimer;
  makeDraggable(frog, {
    onTap: () => {
      const line = C.frogLines[frogPokes % C.frogLines.length];
      frogPokes++;
      restart(frog, "hop");
      Sound.ribbit();
      haptic(15);
      frogBubble.textContent = line;
      frogBubble.classList.add("show");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => frogBubble.classList.remove("show"), 1700);
      if (frogPokes === 12) {
        const [x, y] = centerOf(frog);
        burst(x, y, { count: 12, art: ["heart"], spread: 90, rise: 120 });
        toast("you found the frog prince 👑");
      }
    },
  });

  // lemon
  const lemon = $("#lemon");
  const lemonLines = ["you're the zest 🍋", "main squeeze 🍋", "life gave me you 🍋", "sour? never. sweet? always."];
  let lemonI = 0;
  makeDraggable(lemon, {
    onTap: () => {
      restart(lemon, "squeeze");
      Sound.tone({ f: 300, to: 900, dur: 0.15, type: "triangle", vol: 0.2 });
      haptic(12);
      const [x, y] = centerOf(lemon);
      burst(x, y, {
        count: 7, gravity: true, spread: 70, rise: 80, size: [8, 13],
        art: [() => `<svg viewBox="0 0 10 10" class="art"><circle cx="5" cy="5" r="4.5" fill="#f9d94a" stroke="#1e5a2b" stroke-width="1.2"/></svg>`],
      });
      toast(lemonLines[lemonI++ % lemonLines.length]);
    },
  });

  // sticky note flip
  $("#sticky").addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("flipped");
    Sound.paper();
    haptic(8);
  });

  // smiley winks
  const smiley = $("#smiley");
  smiley.addEventListener("click", () => {
    smiley.textContent = ";)";
    smiley.classList.add("wink");
    Sound.tick();
    const [x, y] = centerOf(smiley);
    burst(x, y, { count: 4, art: ["heart"], spread: 40, rise: 60, size: [12, 18] });
    setTimeout(() => { smiley.textContent = ":)"; smiley.classList.remove("wink"); }, 900);
  });

  // title card wiggles
  $(".title-card").addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    restart(e.currentTarget, "wiggle");
    Sound.sparkle();
  });

  /* ═════════════ SCRAPBOOK ═════════════ */
  const polaroidsEl = $("#polaroids"), board = $("#board"), placedEl = $("#placedStickers"), photoInput = $("#photoInput");
  const userPhotos = store.get("photos", []);
  const allMemories = () => [...C.memories, ...userPhotos];
  const rots = [-4, 3, 2, -3, -2, 4];
  const tapeRots = [-5, 4, -2, 6, -6, 3];
  let developed = false;

  function renderPolaroids() {
    const mems = allMemories();
    polaroidsEl.innerHTML =
      mems.map((m, i) => `
        <button class="polaroid pop-in" data-i="${i}" style="--r:${rots[i % rots.length]}deg;--d:${(0.1 + i * 0.08).toFixed(2)}s" aria-label="Open memory: ${esc(m.caption)}">
          <span class="tape tape-${esc(m.tape || "green")}" style="--tr:${tapeRots[i % tapeRots.length]}deg"></span>
          <span class="ph"><img src="${esc(m.src)}" alt="${esc(m.caption)}"${m.fit === "contain" ? ' class="contain"' : ""} loading="lazy" decoding="async"></span>
          <span class="cap">${esc(m.caption)} ♡</span>
        </button>`).join("") +
      `<button class="polaroid add-card pop-in" style="--r:2deg;--d:${(0.1 + mems.length * 0.08).toFixed(2)}s" id="addPhoto">
        <span class="tape tape-blue" style="--tr:3deg"></span>
        <span class="add-inner"><span class="plus">${ART.iconPlus()}</span>Add a photo</span>
      </button>`;
    $$(".polaroid[data-i]", polaroidsEl).forEach((p) => p.addEventListener("click", () => openDetail(+p.dataset.i, p)));
    $("#addPhoto").addEventListener("click", () => { Sound.pop(); photoInput.click(); });
  }
  renderPolaroids();

  function develop(img, { duration = 1600, delay = 0, interactive = false } = {}) {
    img.classList.add("developing");
    img.style.setProperty("--dev", 0);
    let dev = 0, last = 0, started = false;
    const card = img.closest(".polaroid");
    let hint, boost = () => {};
    if (interactive) {
      hint = document.createElement("span");
      hint.className = "shake-hint";
      hint.textContent = "shake it! (or tap)";
      img.parentElement.appendChild(hint);
      boost = () => { dev += 0.08; restart(card, "wobble"); Sound.tick(); haptic(6); };
      card.addEventListener("pointerdown", boost);
      shakeListeners.add(boost);
    }
    const step = (t) => {
      if (!started) { started = true; last = t; }
      dev += (t - last) / duration; last = t;
      img.style.setProperty("--dev", Math.min(1, dev).toFixed(3));
      if (dev < 1) requestAnimationFrame(step);
      else {
        img.classList.remove("developing");
        if (interactive) {
          hint.remove();
          card.removeEventListener("pointerdown", boost);
          shakeListeners.delete(boost);
          Sound.chime();
          const [x, y] = centerOf(card);
          burst(x, y, { count: 8, art: ["sparkle", "heart"], spread: 80, rise: 100 });
        }
      }
    };
    setTimeout(() => requestAnimationFrame(step), delay);
  }
  function developAll() {
    if (developed || reduceMotion) return;
    developed = true;
    $$(".polaroid .ph img", polaroidsEl).forEach((img, i) => develop(img, { duration: 1800, delay: 350 + i * 220 }));
  }

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    photoInput.value = "";
    if (!file) return;
    try {
      const src = await downscale(file, 900);
      const entry = { src, caption: "a new memory", date: new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }), story: "tap here to write something ♡", tape: pick(["green", "yellow", "pink", "blue"]), added: true };
      userPhotos.push(entry);
      if (!store.set("photos", userPhotos)) toast("it's here for now, but too big to remember 🥲");
      renderPolaroids();
      const img = $(`.polaroid[data-i="${allMemories().length - 1}"] .ph img`, polaroidsEl);
      img.closest(".polaroid").classList.remove("pop-in");
      img.closest(".polaroid").scrollIntoView({ behavior: "smooth", block: "center" });
      develop(img, { duration: 9000, interactive: true });
      Sound.tone({ f: 2400, dur: 0.05, vol: 0.2 }); Sound.noise({ dur: 0.5, freq: 900, vol: 0.15, delay: 0.05 });
    } catch (_) {
      toast("hmm, couldn't read that photo");
    }
  });

  function downscale(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // stickers you can slap anywhere on the scrapbook
  const placed = store.get("stickers", []);
  const stickerSounds = { frog: () => Sound.ribbit(), heart: () => Sound.kiss(), sparkle: () => Sound.sparkle(), sun: () => Sound.chime(), lemon: () => Sound.boing() };
  function spawnPlaced(s, fresh) {
    const el = document.createElement("div");
    el.className = "placed draggable";
    el.style.left = s.x + "%";
    el.style.top = s.y + "px";
    el.style.setProperty("--r", s.r + "deg");
    el.innerHTML = `<span>${s.t === "frog" ? ART.frog() : ART[s.t]()}</span>`;
    if (!fresh) el.firstElementChild.style.animation = "none";
    placedEl.appendChild(el);
    let lastTap = 0;
    makeDraggable(el, {
      onTap: () => {
        const now = Date.now();
        if (now - lastTap < 320) {
          el.classList.add("peel");
          Sound.paper();
          haptic(10);
          placed.splice(placed.indexOf(s), 1);
          store.set("stickers", placed);
          setTimeout(() => el.remove(), 450);
          return;
        }
        lastTap = now;
        restart(el.firstElementChild, "wiggle");
        (stickerSounds[s.t] || Sound.pop).call(Sound);
      },
      onDrop: () => {
        const br = board.getBoundingClientRect();
        const [cx, cy] = centerOf(el);
        s.x = clamp(((cx - br.left) / br.width) * 100, 2, 98);
        s.y = Math.max(0, cy - br.top);
        el.style.left = s.x + "%";
        el.style.top = s.y + "px";
        el.style.setProperty("--dx", "0px");
        el.style.setProperty("--dy", "0px");
        store.set("stickers", placed);
      },
    });
    return el;
  }
  placed.forEach((s) => spawnPlaced(s, false));

  $$("[data-sticker]").forEach((b) => b.addEventListener("click", () => {
    const br = board.getBoundingClientRect();
    const s = { t: b.dataset.sticker, x: rand(14, 86), y: Math.max(20, innerHeight * 0.42 - br.top + rand(-70, 70)), r: Math.round(rand(-20, 20)) };
    placed.push(s);
    store.set("stickers", placed);
    spawnPlaced(s, true);
    Sound.pop();
    setTimeout(() => (stickerSounds[s.t] || (() => {}))(), 180);
    haptic(12);
    if (placed.length === 1) setTimeout(() => toast("drag it anywhere ✨"), 500);
  }));

  /* ═════════════ DETAIL VIEW ═════════════ */
  const detail = $("#detail"), detailPolaroid = $("#detailPolaroid"), detailPhoto = $("#detailPhoto"), detailImg = $("#detailImg");
  const detailCaption = $("#detailCaption"), detailStory = $("#detailStory"), kissLayer = $("#kissLayer");
  let cur = 0;
  const kisses = store.get("kisses", {});

  function fillDetail(i) {
    const mems = allMemories();
    cur = (i + mems.length) % mems.length;
    const m = mems[cur];
    detailImg.src = m.src;
    detailImg.alt = m.caption;
    detailImg.classList.toggle("contain", m.fit === "contain");
    detailCaption.textContent = m.caption;
    detailStory.textContent = [m.date, m.story].filter(Boolean).join(". ");
    $("#detailCount").textContent = `${cur + 1} / ${mems.length}`;
    $("#detailTape").className = `tape tape-${m.tape || "green"} tape-top`;
    const editable = !!m.added;
    [detailCaption, detailStory].forEach((el) => {
      try { el.contentEditable = editable ? "plaintext-only" : "false"; } catch { el.contentEditable = editable ? "true" : "false"; }
      el.style.userSelect = editable ? "text" : "";
    });
    kissLayer.innerHTML = "";
    (kisses[cur] || []).forEach((k) => stampKiss(k, false));
    tossBtn.hidden = !editable;
    disarmToss();
  }

  // save edits to photos he added himself
  [detailCaption, detailStory].forEach((el) => el.addEventListener("blur", () => {
    const m = allMemories()[cur];
    if (!m?.added) return;
    if (el === detailCaption) m.caption = el.textContent.trim() || "a new memory";
    else { m.story = el.textContent.replace(m.date + ". ", "").trim(); }
    store.set("photos", userPhotos);
    renderPolaroids();
  }));

  const vtOK = () => document.startViewTransition && !reduceMotion;
  function openDetail(i, fromCard) {
    Sound.paper();
    Sound.tone({ f: 900, to: 1300, dur: 0.12, vol: 0.1 });
    haptic(8);
    const go = () => {
      fillDetail(i);
      detail.hidden = false;
      detail.classList.add("open");
      detail.scrollTop = 0;
      document.body.style.overflow = "hidden";
    };
    history.pushState({ detail: true }, "");
    if (vtOK() && fromCard) {
      const ph = fromCard.querySelector(".ph");
      ph.style.viewTransitionName = "memory";
      const vt = document.startViewTransition(() => {
        ph.style.viewTransitionName = "";
        detailPhoto.style.viewTransitionName = "memory";
        go();
      });
      vt.finished.finally(() => (detailPhoto.style.viewTransitionName = ""));
    } else {
      go();
      restart(detailPolaroid, "swipe-in");
    }
  }
  function closeDetail() {
    if (detail.hidden) return;
    Sound.paper();
    const target = $(`.polaroid[data-i="${cur}"] .ph`, polaroidsEl);
    const go = hideDetail;
    if (vtOK() && target) {
      detailPhoto.style.viewTransitionName = "memory";
      const vt = document.startViewTransition(() => {
        detailPhoto.style.viewTransitionName = "";
        target.style.viewTransitionName = "memory";
        go();
      });
      vt.finished.finally(() => (target.style.viewTransitionName = ""));
    } else go();
  }
  function hideDetail() {
    detail.hidden = true;
    detail.classList.remove("open");
    document.body.style.overflow = "";
    $("#catPeek").classList.remove("show");
  }
  $("#backBtn").addEventListener("click", () => history.back());
  addEventListener("popstate", closeDetail);

  // let go of photos he added himself (two taps, so it never happens by accident)
  const tossBtn = $("#tossBtn"), tossLabel = $("#tossLabel");
  let tossArmed = false, tossTimer;
  function disarmToss() {
    clearTimeout(tossTimer);
    tossArmed = false;
    tossBtn.classList.remove("armed");
    tossLabel.textContent = "toss this one";
  }
  tossBtn.addEventListener("click", () => {
    if (!tossArmed) {
      tossArmed = true;
      tossBtn.classList.add("armed");
      tossLabel.textContent = "sure? tap again";
      restart(tossBtn, "shake");
      Sound.tick();
      haptic(10);
      tossTimer = setTimeout(disarmToss, 3000);
      return;
    }
    disarmToss();
    tossMemory(cur);
  });

  function tossMemory(i) {
    const u = userPhotos.indexOf(allMemories()[i]);
    if (u < 0) return;
    tossBtn.hidden = true;
    Sound.paper();
    setTimeout(() => Sound.paper(), 130);
    Sound.tone({ f: 500, to: 120, dur: 0.35, vol: 0.1, delay: 0.3 });
    haptic([10, 20, 10, 20, 30]);
    detailPolaroid.classList.add("crumple");
    setTimeout(() => {
      userPhotos.splice(u, 1);
      store.set("photos", userPhotos);
      // kisses are stored by position, so everything after this one moves up a spot
      const moved = {};
      Object.keys(kisses).forEach((k) => {
        if (+k < i) moved[k] = kisses[k];
        else if (+k > i) moved[+k - 1] = kisses[k];
        delete kisses[k];
      });
      Object.assign(kisses, moved);
      store.set("kisses", kisses);
      detailPolaroid.classList.remove("crumple");
      hideDetail();
      history.back();
      renderPolaroids();
      toast("tossed (gone for good)");
    }, reduceMotion ? 50 : 720);
  }

  // swipe between memories + double tap for a heart
  let sx = 0, sy = 0, st = 0, lastTapAt = 0;
  detailPolaroid.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; st = Date.now(); });
  detailPolaroid.addEventListener("pointerup", (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) { swipeTo(dx < 0 ? 1 : -1); return; }
    if (Math.hypot(dx, dy) < 10 && Date.now() - st < 300) {
      const now = Date.now();
      if (now - lastTapAt < 320) {
        lastTapAt = 0;
        bigHeart(e.clientX, e.clientY);
      } else lastTapAt = now;
    }
  });
  function swipeTo(dir) {
    if (allMemories().length < 2) return;
    detailPolaroid.classList.add(dir > 0 ? "swipe-out-l" : "swipe-out-r");
    Sound.paper();
    haptic(8);
    setTimeout(() => {
      detailPolaroid.classList.remove("swipe-out-l", "swipe-out-r");
      fillDetail(cur + dir);
      restart(detailPolaroid, "swipe-in");
    }, 240);
  }
  function bigHeart(x, y) {
    const el = document.createElement("div");
    el.className = "particle";
    el.style.cssText = `left:${x - 50}px;top:${y - 50}px;width:100px;height:100px;`;
    el.innerHTML = ART.heart();
    $("#fx").appendChild(el);
    el.animate([
      { transform: "scale(0) rotate(-20deg)", opacity: 1 },
      { transform: "scale(1.25) rotate(8deg)", opacity: 1, offset: 0.35 },
      { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.6 },
      { transform: "scale(1.1) translateY(-40px)", opacity: 0 },
    ], { duration: 900, easing: "ease-out" }).onfinish = () => el.remove();
    burst(x, y, { count: 6, art: ["heart"], spread: 80, rise: 90, size: [14, 22] });
    Sound.pop(); Sound.kiss();
    haptic([10, 30, 10]);
  }

  // reactions
  function stampKiss(k, fresh) {
    const el = document.createElement("span");
    el.className = "kiss-mark";
    el.style.left = k.x + "%";
    el.style.top = k.y + "%";
    el.style.setProperty("--kr", k.r + "deg");
    el.style.transform = `rotate(${k.r}deg)`;
    if (!fresh) el.style.animation = "none";
    el.innerHTML = ART.kissMark();
    kissLayer.appendChild(el);
  }
  const catLines = ["mrrp! happy birthday", "meow (means hbd)", "*purrs at you*", "i'm here for the cake"];
  let catTimer;
  const reactions = {
    heart(btn) {
      const [x, y] = centerOf(btn);
      burst(x, y - 20, { count: 12, art: [() => ART.heart(), () => ART.heart("#f7a6b8")], spread: 90, rise: 260, size: [18, 32], dur: [1100, 1700] });
      [0, 0.08, 0.16].forEach((d) => Sound.tone({ f: 700 + d * 2000, to: 1200, dur: 0.1, vol: 0.15, delay: d }));
      haptic(12);
    },
    star() {
      const r = detailPolaroid.getBoundingClientRect();
      for (let i = 0; i < 9; i++) {
        const side = i % 4;
        const x = side === 0 ? r.left : side === 1 ? r.right : rand(r.left, r.right);
        const y = side === 2 ? r.top : side === 3 ? r.bottom : rand(r.top, r.bottom);
        setTimeout(() => burst(x, y, { count: 1, art: ["sparkle", "star"], spread: 20, rise: 30, size: [20, 34], dur: [900, 1300] }), i * 60);
      }
      Sound.sparkle(); setTimeout(() => Sound.sparkle(), 200);
      haptic(10);
    },
    kiss() {
      const k = { x: rand(18, 82), y: rand(18, 82), r: Math.round(rand(-30, 30)) };
      (kisses[cur] ||= []).push(k);
      if (kisses[cur].length > 8) { kisses[cur].shift(); kissLayer.firstElementChild?.remove(); }
      store.set("kisses", kisses);
      stampKiss(k, true);
      Sound.kiss();
      haptic(15);
    },
    cat() {
      const cat = $("#catPeek");
      $(".cat-bubble", cat).textContent = pick(catLines);
      cat.classList.add("show");
      setTimeout(() => Sound.meow(), 280);
      clearTimeout(catTimer);
      catTimer = setTimeout(() => cat.classList.remove("show"), 2400);
    },
  };
  $$("[data-react]").forEach((b) => b.addEventListener("click", () => reactions[b.dataset.react](b)));

  /* ═════════════ NOTES ═════════════ */
  const envelope = $("#envelope"), letter = $("#letter"), letterBody = $("#letterBody"), letterSign = $("#letterSign");
  let opened = false;
  envelope.addEventListener("pointerdown", () => { if (!opened) envelope.classList.add("peek"); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => envelope.addEventListener(ev, () => envelope.classList.remove("peek")));
  envelope.addEventListener("click", openEnvelope);

  function openEnvelope() {
    if (opened) return;
    opened = true;
    Sound.unlock();
    $("#envSeal").classList.add("gone");
    envelope.classList.remove("peek");
    envelope.classList.add("open");
    Sound.pop();
    setTimeout(() => Sound.paper(), 200);
    setTimeout(() => Sound.chime(), 700);
    haptic([10, 40, 10]);
    const [x, y] = centerOf(envelope);
    setTimeout(() => burst(x, y - 60, { count: 8, art: ["heart", "sparkle"], spread: 100, rise: 110 }), 650);
    setTimeout(() => {
      letter.classList.add("open");
      setTimeout(() => letter.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      setTimeout(writeLetter, 800);
    }, 1000);
  }

  let skipWriting = false;
  letter.addEventListener("click", () => (skipWriting = true));

  function writeLetter() {
    const chars = [];
    const loves = [];
    C.letter.forEach((line) => {
      const p = document.createElement("p");
      line.split(/(\*[^*]+\*)/).filter(Boolean).forEach((seg) => {
        const isLove = seg.startsWith("*") && seg.endsWith("*");
        const host = isLove ? Object.assign(document.createElement("span"), { className: "love" }) : p;
        const text = isLove ? seg.slice(1, -1) : seg;
        text.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { host.appendChild(document.createTextNode(" ")); return; }
          const word = document.createElement("span");
          word.className = "word";
          [...w].forEach((ch) => {
            const c = document.createElement("span");
            c.className = "ch";
            c.textContent = ch;
            word.appendChild(c);
            chars.push(c);
          });
          host.appendChild(word);
        });
        if (isLove) { p.appendChild(host); loves.push({ el: host, at: chars.length }); }
      });
      letterBody.appendChild(p);
      chars.push(null); // tiny pause between lines
    });

    let i = 0;
    const next = () => {
      if (skipWriting) {
        chars.forEach((c) => c && c.classList.add("on"));
        loves.forEach((l) => l.el.classList.add("drawn"));
        return finish();
      }
      if (i >= chars.length) return finish();
      const c = chars[i++];
      if (c) {
        c.classList.add("on");
        if (i % 3 === 0) Sound.noise({ dur: 0.03, freq: 4200, type: "highpass", vol: 0.035 });
      }
      loves.forEach((l) => { if (l.at === i) setTimeout(() => { l.el.classList.add("drawn"); Sound.sparkle(); }, 200); });
      const ch = c?.textContent;
      setTimeout(next, !c ? 320 : /[.,!?]/.test(ch) ? 130 : 24);
    };
    next();
  }
  function finish() {
    letterSign.textContent = `— ${C.from} ♡`;
    setTimeout(() => {
      letterSign.classList.add("show");
      const [x, y] = centerOf(letterSign);
      burst(x, y, { count: 6, art: ["heart"], spread: 60, rise: 80 });
      Sound.chime();
    }, 400);
  }

  // hold to send a hug
  const hugBtn = $("#hugBtn"), hugProgress = $("#hugProgress"), hugLabel = $("#hugLabel"), hugCount = $("#hugCount"), hugOverlay = $("#hugOverlay");
  const HUG_MS = 2200;
  let hugs = store.get("hugs", 0), hugStart = 0, hugRaf = null, nextBeat = 0, labelTimer;
  const syncHugs = () => (hugCount.textContent = hugs ? `hugs sent: ${hugs}` : "");
  syncHugs();
  const setHug = (p) => { hugBtn.style.setProperty("--p", p); hugProgress.style.strokeDashoffset = `${100 - p * 100}px`; hugProgress.style.opacity = p > 0.01 ? 1 : 0; };

  function hugLoop(t) {
    const p = Math.min(1, (t - hugStart) / HUG_MS);
    setHug(p);
    if (t >= nextBeat) {
      Sound.thump(0.25 + p * 0.4);
      haptic(Math.round(12 + p * 25));
      nextBeat = t + (650 - p * 380);
    }
    hugLabel.textContent = p < 0.45 ? "keep holding…" : p < 0.8 ? "squeeeeze…" : "almost…";
    if (p >= 1) return hugDone();
    hugRaf = requestAnimationFrame(hugLoop);
  }
  hugBtn.addEventListener("pointerdown", (e) => {
    hugBtn.setPointerCapture(e.pointerId);
    Sound.unlock();
    clearTimeout(labelTimer);
    hugProgress.style.transition = "none";
    hugBtn.classList.add("holding");
    hugStart = performance.now();
    nextBeat = 0;
    hugRaf = requestAnimationFrame(hugLoop);
  });
  const hugRelease = () => {
    if (!hugRaf) return;
    cancelAnimationFrame(hugRaf);
    hugRaf = null;
    hugBtn.classList.remove("holding");
    hugProgress.style.transition = "stroke-dashoffset .5s cubic-bezier(.34,1.56,.64,1)";
    setHug(0);
    hugLabel.textContent = "don't let go yet!";
    restart(hugBtn, "shake");
    Sound.tone({ f: 400, to: 250, dur: 0.15, vol: 0.12 });
    labelTimer = setTimeout(() => (hugLabel.textContent = "Hold to send a hug"), 1600);
  };
  hugBtn.addEventListener("pointerup", hugRelease);
  hugBtn.addEventListener("pointercancel", hugRelease);
  hugBtn.addEventListener("contextmenu", (e) => e.preventDefault());

  function hugDone() {
    cancelAnimationFrame(hugRaf);
    hugRaf = null;
    hugBtn.classList.remove("holding");
    hugs++;
    store.set("hugs", hugs);
    syncHugs();
    Sound.chime();
    Sound.thump(0.6);
    haptic([30, 50, 30, 50, 80]);
    const [x, y] = centerOf(hugBtn);
    burst(x, y, { count: 16, art: [() => ART.heart(), () => ART.heart("#f7a6b8")], spread: 140, rise: 180 });
    setTimeout(() => {
      hugOverlay.classList.add("show");
      Confetti.fire({ x: innerWidth / 2, y: innerHeight * 0.5, count: 90 });
    }, 250);
    const close = () => {
      hugOverlay.classList.remove("show");
      hugProgress.style.transition = "stroke-dashoffset .6s ease";
      setHug(0);
      hugLabel.textContent = "Hold to send another";
    };
    hugOverlay.onclick = close;
    setTimeout(close, 3200);
  }

  // loves me, loves me not (it always lands on "loves me")
  const daisy = $("#daisy"), daisyLabel = $("#daisyLabel");
  const PETALS = 13;
  let plucked = 0;
  function buildDaisy(regrow) {
    daisy.innerHTML = ART.daisy(PETALS);
    plucked = 0;
    daisy.classList.toggle("regrow", !!regrow);
    $$(".petal", daisy).forEach((p) => p.addEventListener("pointerdown", (e) => { e.stopPropagation(); pluck(p); }));
    $(".daisy-center", daisy).addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (plucked >= PETALS) {
        buildDaisy(true);
        daisyLabel.classList.remove("big");
        daisyLabel.textContent = "pluck a petal…";
        Sound.boing();
      } else {
        restart(daisy, "happy");
        Sound.tick();
      }
    });
  }
  function pluck(p) {
    if (p.classList.contains("gone")) return;
    const r = p.getBoundingClientRect();
    p.classList.add("gone");
    plucked++;
    Sound.tone({ f: rand(800, 1100), to: 400, dur: 0.12, vol: 0.12 });
    haptic(6);
    const el = document.createElement("div");
    el.className = "particle";
    el.style.cssText = `left:${r.left + r.width / 2 - 9}px;top:${r.top + r.height / 2 - 18}px;width:18px;height:36px;`;
    el.innerHTML = `<svg viewBox="0 0 16 40" class="art"><path d="M8 38 C1 30 1 8 8 2 C15 8 15 30 8 38 Z" fill="#fff" stroke="#1e5a2b" stroke-width="2.5"/></svg>`;
    $("#fx").appendChild(el);
    const drift = rand(-80, 80);
    el.animate([
      { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
      { transform: `translate(${drift * 0.5}px, 60px) rotate(${rand(-120, 120)}deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${drift}px, 220px) rotate(${rand(-300, 300)}deg)`, opacity: 0 },
    ], { duration: 1500, easing: "cubic-bezier(.3,.1,.6,1)", fill: "forwards" }).onfinish = () => el.remove();

    if (plucked >= PETALS) {
      daisyLabel.textContent = "LOVES ME!! (obviously)";
      daisyLabel.classList.add("big");
      restart(daisy, "happy");
      const [x, y] = centerOf(daisy);
      burst(x, y - 60, { count: 14, art: ["heart"], spread: 120, rise: 150 });
      Sound.chime();
      haptic([20, 40, 20]);
      setTimeout(() => toast("tap the middle to grow a new one 🌼"), 1600);
    } else {
      daisyLabel.textContent = plucked % 2 ? "loves me ♡" : "loves me not…";
      restart(daisyLabel, "squish");
    }
  }
  buildDaisy(false);

  // footer
  const madeLines = ["this took me forever and i'd do it again", "happy birthday, you ♡", "go eat some cake!", "ok now come get your real present"];
  let madeI = 0;
  $("#madeBtn").addEventListener("click", (e) => {
    toast(madeLines[madeI++ % madeLines.length]);
    const [x, y] = centerOf(e.currentTarget);
    burst(x, y, { count: 6, art: ["heart", "sparkle"], spread: 70, rise: 90 });
    Sound.sparkle();
  });

  // little "you're here" heart on the corner frog in notes
  $(".frog-heart").addEventListener("click", (e) => {
    Sound.ribbit();
    const [x, y] = centerOf(e.currentTarget);
    burst(x, y, { count: 5, art: ["heart"], spread: 50, rise: 80 });
  });

  /* ═════════════ shared with booth.js ═════════════ */
  window.APP = {
    $, $$, store, restart, centerOf, clamp,
    onShake(f) { shakeListeners.add(f); return () => shakeListeners.delete(f); },
    addMemory(entry) {
      userPhotos.push(entry);
      const ok = store.set("photos", userPhotos);
      renderPolaroids();
      return ok;
    },
  };
})();
