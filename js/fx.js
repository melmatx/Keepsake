/* Little effects toolkit: synthesized sounds, haptics, confetti,
   particle bursts, draggable stickers, toasts. No assets needed. */
(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ─────────────── Sound (WebAudio, all synthesized) ─────────────── */
  const Sound = {
    ctx: null,
    master: null,
    muted: localStorage.getItem("jc-muted") === "1",

    unlock() {
      if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.6;
      this.master.connect(this.ctx.destination);
    },
    setMuted(m) {
      this.muted = m;
      localStorage.setItem("jc-muted", m ? "1" : "0");
      if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.6, this.ctx.currentTime, 0.05);
    },
    ok() { return this.ctx && !this.muted; },

    tone({ f = 440, to = null, dur = 0.15, type = "sine", vol = 0.3, delay = 0, attack = 0.005 } = {}) {
      if (!this.ok()) return;
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.master);
      o.start(t); o.stop(t + dur + 0.05);
    },
    noiseBuf() {
      if (this._nb) return this._nb;
      const len = this.ctx.sampleRate * 1.5;
      const b = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return (this._nb = b);
    },
    noise({ dur = 0.2, freq = 1200, q = 0.8, type = "lowpass", vol = 0.3, delay = 0 } = {}) {
      if (!this.ok()) return;
      const t = this.ctx.currentTime + delay;
      const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf();
      const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(this.master);
      s.start(t, rand(0, 1)); s.stop(t + dur + 0.05);
    },

    pop() { this.tone({ f: rand(520, 680), to: 160, dur: 0.09, vol: 0.35 }); },
    tick() { this.tone({ f: rand(1200, 1500), dur: 0.04, type: "triangle", vol: 0.15 }); },
    boing() { this.tone({ f: 180, to: 520, dur: 0.18, type: "sine", vol: 0.25 }); this.tone({ f: 520, to: 300, dur: 0.15, delay: 0.16, vol: 0.18 }); },
    sparkle() {
      [0, 0.06, 0.12].forEach((d) => this.tone({ f: rand(1800, 2900), dur: 0.22, type: "sine", vol: 0.12, delay: d }));
    },
    chime() {
      [1046.5, 1318.5, 1568, 2093].forEach((f, i) => this.tone({ f, dur: 0.5, type: "triangle", vol: 0.18, delay: i * 0.07 }));
    },
    poof() { this.noise({ dur: 0.35, freq: 700, vol: 0.4 }); this.tone({ f: 220, to: 90, dur: 0.2, vol: 0.12 }); },
    paper() { this.noise({ dur: 0.12, freq: 3000, type: "highpass", vol: 0.18 }); },
    thump(v = 0.5) { this.tone({ f: 95, to: 40, dur: 0.16, vol: v }); this.tone({ f: 85, to: 40, dur: 0.14, vol: v * 0.7, delay: 0.17 }); },
    kiss() {
      this.noise({ dur: 0.05, freq: 2500, type: "bandpass", q: 2, vol: 0.4 });
      this.tone({ f: 700, to: 1500, dur: 0.12, type: "sine", vol: 0.25, delay: 0.03 });
    },
    ribbit() {
      if (!this.ok()) return;
      [0, 0.17].forEach((d) => {
        const t = this.ctx.currentTime + d;
        const o = this.ctx.createOscillator(); o.type = "sawtooth";
        o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(115, t + 0.13);
        const lfo = this.ctx.createOscillator(); lfo.frequency.value = 38;
        const lg = this.ctx.createGain(); lg.gain.value = 0.5;
        const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900;
        lfo.connect(lg).connect(g.gain);
        o.connect(f).connect(g).connect(this.master);
        o.start(t); lfo.start(t); o.stop(t + 0.16); lfo.stop(t + 0.16);
      });
    },
    meow() {
      if (!this.ok()) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(480, t);
      o.frequency.linearRampToValueAtTime(820, t + 0.18);
      o.frequency.linearRampToValueAtTime(420, t + 0.55);
      const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 3;
      f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(1800, t + 0.2); f.frequency.linearRampToValueAtTime(800, t + 0.55);
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(f).connect(g).connect(this.master); o.start(t); o.stop(t + 0.65);
    },

    shutter() {
      this.noise({ dur: 0.035, freq: 3500, type: "highpass", vol: 0.4 });
      this.noise({ dur: 0.05, freq: 1600, type: "bandpass", q: 1.4, vol: 0.32, delay: 0.075 });
      this.tone({ f: 180, to: 90, dur: 0.06, vol: 0.18, delay: 0.075 });
    },
    swish() {
      this.noise({ dur: 0.5, freq: 1800, type: "bandpass", q: 0.5, vol: 0.2 });
      this.noise({ dur: 0.35, freq: 900, type: "bandpass", q: 0.6, vol: 0.12, delay: 0.12 });
    },
    // the little motor that feeds a photo strip out of the slot
    whirr(dur = 2.6) {
      if (!this.ok()) return;
      for (let t = 0; t < dur; t += 0.1) this.noise({ dur: 0.07, freq: rand(450, 650), type: "bandpass", q: 4, vol: 0.12, delay: t });
      this.tone({ f: 120, to: 105, dur, type: "triangle", vol: 0.04, attack: 0.1 });
    },

    // continuous "blowing" wind, intensity 0..1
    blowStart() {
      if (!this.ok() || this._blow) return;
      const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf(); s.loop = true;
      const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 600; f.Q.value = 0.6;
      const g = this.ctx.createGain(); g.gain.value = 0.0001;
      s.connect(f).connect(g).connect(this.master); s.start();
      this._blow = { s, f, g };
    },
    blowLevel(v) {
      if (!this._blow) return;
      const t = this.ctx.currentTime;
      this._blow.g.gain.setTargetAtTime(0.02 + v * 0.35, t, 0.05);
      this._blow.f.frequency.setTargetAtTime(400 + v * 900, t, 0.08);
    },
    blowStop() {
      if (!this._blow) return;
      const { s, g } = this._blow; this._blow = null;
      g.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.06);
      setTimeout(() => s.stop(), 300);
    },

    // public-domain melody, played like a little music box
    happyBirthday() {
      if (!this.ok()) return;
      const N = { G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784 };
      const song = [
        ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
        ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
        ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
        ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
      ];
      const beat = 0.36;
      let t = 0.1;
      song.forEach(([n, len]) => {
        const f = N[n];
        this.tone({ f: f * 2, dur: 1.1, type: "sine", vol: 0.16, delay: t, attack: 0.003 });
        this.tone({ f: f * 4, dur: 0.4, type: "sine", vol: 0.04, delay: t, attack: 0.003 });
        this.tone({ f, dur: 0.8, type: "triangle", vol: 0.07, delay: t, attack: 0.003 });
        t += len * beat;
      });
    },
  };

  /* ─────────────── Haptics ─────────────── */
  // Android: Vibration API. iOS 18+: toggling a native switch fires a tiny tap.
  let hapticLabel = null;
  const haptic = (pattern = 10) => {
    if (navigator.vibrate) { navigator.vibrate(pattern); return; }
    hapticLabel ||= document.querySelector(".haptic-switch");
    try { hapticLabel && hapticLabel.click(); } catch (_) {}
  };

  /* ─────────────── Particle bursts (DOM) ─────────────── */
  const fxLayer = () => document.getElementById("fx");

  function burst(x, y, { count = 8, art = ["heart"], spread = 70, rise = 90, size = [18, 30], dur = [700, 1200], gravity = false } = {}) {
    if (reduceMotion) count = Math.min(count, 3);
    const layer = fxLayer();
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "particle";
      const a = pick(art);
      el.innerHTML = typeof a === "function" ? a() : ART[a] ? ART[a]() : a;
      const s = rand(size[0], size[1]);
      el.style.width = el.style.height = s + "px";
      el.style.left = x - s / 2 + "px";
      el.style.top = y - s / 2 + "px";
      layer.appendChild(el);
      const ang = rand(0, Math.PI * 2);
      const dx = Math.cos(ang) * rand(spread * 0.4, spread);
      const dy = gravity ? rand(-rise, -rise * 0.4) : -rand(rise * 0.5, rise) + Math.sin(ang) * spread * 0.3;
      const rot = rand(-50, 50);
      const d = rand(dur[0], dur[1]);
      const frames = gravity
        ? [
            { transform: "translate(0,0) scale(.3) rotate(0deg)", opacity: 1 },
            { transform: `translate(${dx * 0.6}px, ${dy}px) scale(1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.4 },
            { transform: `translate(${dx}px, ${dy + rise * 1.6}px) scale(.8) rotate(${rot}deg)`, opacity: 0 },
          ]
        : [
            { transform: "translate(0,0) scale(.2) rotate(0deg)", opacity: 0 },
            { transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1.1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.25 },
            { transform: `translate(${dx}px, ${dy}px) scale(.7) rotate(${rot}deg)`, opacity: 0 },
          ];
      el.animate(frames, { duration: d, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }).onfinish = () => el.remove();
    }
  }

  // a little hand-drawn doodle where you tap the paper
  function doodleAt(x, y) {
    burst(x, y, {
      count: 3,
      art: [() => ART.sparkle(pick(["#f9d64a", "#fff", "#f7a6b8"])), () => ART.heart(pick(["#ef5a7a", "#f7a6b8"]))],
      spread: 36, rise: 46, size: [12, 20], dur: [600, 900],
    });
  }

  /* ─────────────── Confetti (canvas) ─────────────── */
  const Confetti = (() => {
    let canvas, ctx, pieces = [], running = false, dpr = 1;
    const colors = ["#ef5a7a", "#f9d64a", "#5fb3e8", "#f6a73b", "#6cbf4a", "#f7a6b8", "#fbf5e2", "#b98ce8"];
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    };
    const init = () => {
      canvas = document.getElementById("confetti");
      ctx = canvas.getContext("2d");
      resize(); addEventListener("resize", resize);
    };
    function fire({ x = innerWidth / 2, y = innerHeight * 0.4, count = 140, spread = 1, hearts = true } = {}) {
      if (!canvas) init();
      if (reduceMotion) count = Math.round(count / 4);
      for (let i = 0; i < count; i++) {
        const a = rand(-Math.PI, 0) * spread + (spread < 1 ? -Math.PI / 2 * (1 - spread) : 0);
        const v = rand(6, 15);
        pieces.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(2, 5),
          w: rand(6, 11), h: rand(10, 16), r: rand(0, 6.28), vr: rand(-0.25, 0.25),
          flip: rand(0, 6.28), vf: rand(0.08, 0.2),
          c: pick(colors), heart: hearts && Math.random() < 0.18, life: 0,
        });
      }
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
    function rain(count = 90) {
      if (!canvas) init();
      for (let i = 0; i < count; i++) {
        pieces.push({
          x: rand(0, innerWidth), y: rand(-innerHeight * 0.6, -10), vx: rand(-1, 1), vy: rand(1, 3),
          w: rand(6, 11), h: rand(10, 16), r: rand(0, 6.28), vr: rand(-0.2, 0.2),
          flip: rand(0, 6.28), vf: rand(0.08, 0.2), c: pick(colors), heart: Math.random() < 0.3, life: 0,
        });
      }
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
    function heartPath(c, s) {
      c.beginPath();
      c.moveTo(0, s * 0.35);
      c.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.45, -s * 0.85, 0, -s * 0.35);
      c.bezierCurveTo(s * 0.45, -s * 0.85, s * 0.9, -s * 0.2, 0, s * 0.35);
      c.fill();
    }
    function tick() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pieces = pieces.filter((p) => p.y < innerHeight + 40 && p.life < 600);
      for (const p of pieces) {
        p.life++;
        p.vy += 0.22; p.vx *= 0.985; p.vy *= 0.985;
        p.vy = Math.min(p.vy, 4.2);
        p.x += p.vx + Math.sin(p.flip) * 0.8; p.y += p.vy;
        p.r += p.vr; p.flip += p.vf;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.heart) { heartPath(ctx, p.w * 1.3); }
        else {
          ctx.scale(1, Math.cos(p.flip));
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 2) : ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.fill();
        }
        ctx.restore();
      }
      if (pieces.length) requestAnimationFrame(tick);
      else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    return { fire, rain };
  })();

  /* ─────────────── Draggable stickers ─────────────── */
  // Drag to move, quick tap still fires onTap. Position kept in CSS vars.
  function makeDraggable(el, { onTap, onDrop, bounds } = {}) {
    let sx, sy, ox, oy, moved = false, id = null;
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", (e) => {
      if (id !== null) return;
      id = e.pointerId; el.setPointerCapture(id);
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.getPropertyValue("--dx")) || 0;
      oy = parseFloat(el.style.getPropertyValue("--dy")) || 0;
      moved = false;
      el.classList.add("is-grabbed");
    });
    el.addEventListener("pointermove", (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 6) { moved = true; el.classList.add("is-dragging"); Sound.tick(); haptic(5); }
      if (moved) {
        let nx = ox + dx, ny = oy + dy;
        if (bounds) [nx, ny] = bounds(nx, ny, el);
        el.style.setProperty("--dx", nx + "px");
        el.style.setProperty("--dy", ny + "px");
        el.style.setProperty("--tilt", Math.max(-14, Math.min(14, e.movementX * 1.5)) + "deg");
      }
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      el.classList.remove("is-grabbed", "is-dragging");
      el.style.setProperty("--tilt", "0deg");
      if (moved) { Sound.pop(); onDrop && onDrop(el, e); }
      else if (e.type === "pointerup") onTap && onTap(el, e);
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    // keyboard "click" (detail 0) still counts as a tap
    el.addEventListener("click", (e) => { if (e.detail === 0 && onTap) onTap(el, e); });
  }

  /* ─────────────── Toast ─────────────── */
  let toastTimer;
  function toast(msg, ms = 2400) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), ms);
  }

  window.FX = { Sound, haptic, burst, doodleAt, Confetti, makeDraggable, toast, rand, pick, reduceMotion };
})();
