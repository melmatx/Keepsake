/* Hand-drawn SVG art. Every sticker is a tiny function returning markup,
   so pieces can be reused, animated, and recolored from CSS/JS. */
(() => {
  const INK = "#1e5a2b";
  const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;

  const ART = {
    frog: (opts = {}) => `
<svg viewBox="0 0 120 112" class="art art-frog" aria-hidden="true">
  ${opts.crown === false ? "" : `<path class="frog-crown" d="M45 16 L48 3 L56 11 L60 1 L64 11 L72 3 L75 16 Z" fill="#f9d64a" ${S} stroke-width="3.5"/>`}
  <g ${S}>
    <path d="M26 80 C18 104 42 109 60 109 C78 109 102 104 94 80 Z" fill="#8ccf5e"/>
    <circle cx="36" cy="33" r="17" fill="#8ccf5e"/>
    <circle cx="84" cy="33" r="17" fill="#8ccf5e"/>
    <ellipse cx="60" cy="60" rx="47" ry="31" fill="#8ccf5e"/>
  </g>
  <circle cx="36" cy="33" r="15" fill="#8ccf5e"/>
  <circle cx="84" cy="33" r="15" fill="#8ccf5e"/>
  <ellipse cx="60" cy="60" rx="45" ry="29" fill="#8ccf5e"/>
  <ellipse cx="60" cy="94" rx="19" ry="11" fill="#c6ea9c"/>
  <g class="frog-eyes">
    <circle cx="36" cy="32" r="10" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <circle cx="84" cy="32" r="10" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <circle class="pupil" cx="37" cy="33" r="5.5" fill="${INK}"/>
    <circle class="pupil" cx="85" cy="33" r="5.5" fill="${INK}"/>
    <circle cx="39" cy="31" r="1.8" fill="#fff"/>
    <circle cx="87" cy="31" r="1.8" fill="#fff"/>
  </g>
  <g class="frog-lids" fill="#8ccf5e" stroke="${INK}" stroke-width="3">
    <path d="M25 32 Q36 44 47 32 Q36 20 25 32 Z"/>
    <path d="M73 32 Q84 44 95 32 Q84 20 73 32 Z"/>
  </g>
  <ellipse cx="28" cy="64" rx="7" ry="4.5" fill="#f7a6b8"/>
  <ellipse cx="92" cy="64" rx="7" ry="4.5" fill="#f7a6b8"/>
  <path class="frog-mouth" d="M47 61 Q60 73 73 61" fill="none" ${S} stroke-width="3.5"/>
  ${opts.heart ? `<g transform="translate(45 74) scale(.3)">${heartPath("#ef5a7a")}</g>
  <path d="M38 88 Q44 80 50 84 M82 88 Q76 80 70 84" fill="none" ${S} stroke-width="3.5"/>` : `
  <path d="M40 98 Q46 92 52 98 M68 98 Q74 92 80 98" fill="none" ${S} stroke-width="3"/>`}
</svg>`,

    lemon: () => `
<svg viewBox="0 0 100 100" class="art art-lemon" aria-hidden="true">
  <g ${S}>
    <path class="lemon-body" d="M10 58 C8 52 12 48 16 47 C20 30 40 20 60 23 C76 25 88 36 88 50 C93 52 94 58 89 61 C84 80 62 90 42 86 C26 83 16 74 14 66 C10 64 9 61 10 58 Z" fill="#f9d94a"/>
    <path d="M60 24 C62 10 78 4 92 9 C86 22 72 28 60 24 Z" fill="#6cbf4a"/>
    <path d="M67 19 L84 11" fill="none" stroke-width="2.5"/>
  </g>
  <circle cx="40" cy="55" r="3.6" fill="${INK}"/>
  <circle cx="62" cy="53" r="3.6" fill="${INK}"/>
  <path d="M45 63 Q51 69 57 62" fill="none" ${S} stroke-width="3"/>
  <ellipse cx="33" cy="63" rx="5" ry="3" fill="#f7a6b8"/>
  <ellipse cx="69" cy="61" rx="5" ry="3" fill="#f7a6b8"/>
  <path d="M28 40 Q32 34 38 32" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
</svg>`,

    heart: (fill = "#ef5a7a") => `
<svg viewBox="0 0 100 100" class="art art-heart" aria-hidden="true">${heartPath(fill)}</svg>`,

    star: () => `
<svg viewBox="0 0 100 100" class="art art-star" aria-hidden="true">
  <path d="M50 7 L62 35 L93 37 L69 57 L77 89 L50 72 L23 89 L31 57 L7 37 L38 35 Z" fill="#f9d64a" ${S}/>
  <circle cx="42" cy="50" r="3.4" fill="${INK}"/><circle cx="58" cy="50" r="3.4" fill="${INK}"/>
  <path d="M44 58 Q50 64 56 58" fill="none" ${S} stroke-width="3"/>
  <ellipse cx="36" cy="57" rx="4" ry="2.5" fill="#f7a6b8"/><ellipse cx="64" cy="57" rx="4" ry="2.5" fill="#f7a6b8"/>
</svg>`,

    cherry: () => `
<svg viewBox="0 0 100 100" class="art art-cherry" aria-hidden="true">
  <g ${S}>
    <path d="M33 56 C36 36 46 22 58 12 M67 58 C66 40 62 26 58 12" fill="none"/>
    <path d="M58 13 C66 4 82 6 88 14 C78 22 66 22 58 13 Z" fill="#6cbf4a" stroke-width="3"/>
    <circle cx="31" cy="70" r="17" fill="#e8455a"/>
    <circle cx="68" cy="72" r="17" fill="#e8455a"/>
  </g>
  <path d="M23 64 Q25 59 30 58 M60 66 Q62 61 67 60" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
</svg>`,

    sparkle: (fill = "#f9d64a") => `
<svg viewBox="0 0 100 100" class="art art-sparkle" aria-hidden="true">
  <path d="M50 5 C54 36 64 46 95 50 C64 54 54 64 50 95 C46 64 36 54 5 50 C36 46 46 36 50 5 Z" fill="${fill}" ${S}/>
</svg>`,

    sun: () => `
<svg viewBox="0 0 100 100" class="art art-sun" aria-hidden="true">
  <g class="sun-rays" fill="#f6a73b" ${S} stroke-width="3">
    ${Array.from({ length: 10 }, (_, i) => `<path transform="rotate(${i * 36} 50 50)" d="M44 20 L50 4 L56 20 Z"/>`).join("")}
  </g>
  <circle cx="50" cy="50" r="27" fill="#f9d64a" ${S}/>
  <path d="M38 47 Q42 43 46 47 M54 47 Q58 43 62 47" fill="none" ${S} stroke-width="3"/>
  <path d="M42 56 Q50 64 58 56" fill="none" ${S} stroke-width="3"/>
  <ellipse cx="35" cy="56" rx="4.5" ry="2.8" fill="#f7a6b8"/><ellipse cx="65" cy="56" rx="4.5" ry="2.8" fill="#f7a6b8"/>
</svg>`,

    cat: () => `
<svg viewBox="0 0 100 92" class="art art-cat" aria-hidden="true">
  <g ${S}>
    <path d="M18 44 L20 10 L42 28 Q50 26 58 28 L80 10 L82 44 C88 66 74 86 50 86 C26 86 12 66 18 44 Z" fill="#f2a65a"/>
    <path d="M24 20 L26 34 L35 28 Z M76 20 L74 34 L65 28 Z" fill="#f7a6b8" stroke-width="2.5"/>
    <path d="M30 70 C30 58 40 54 50 58 C60 54 70 58 70 70 C66 80 34 80 30 70 Z" fill="#fff6e8" stroke-width="3"/>
    <path d="M44 30 L46 40 M50 29 L50 40 M56 30 L54 40" fill="none" stroke-width="3"/>
  </g>
  <path d="M32 52 Q37 47 42 52 M58 52 Q63 47 68 52" fill="none" ${S} stroke-width="3"/>
  <path d="M47 61 L53 61 L50 65 Z" fill="#ef5a7a" stroke="${INK}" stroke-width="2"/>
  <path d="M44 68 Q47 71 50 67 Q53 71 56 68" fill="none" ${S} stroke-width="2.5"/>
  <path d="M28 62 L12 60 M28 66 L13 69 M72 62 L88 60 M72 66 L87 69" fill="none" ${S} stroke-width="2"/>
  <ellipse cx="30" cy="60" rx="4" ry="2.5" fill="#f7a6b8"/><ellipse cx="70" cy="60" rx="4" ry="2.5" fill="#f7a6b8"/>
</svg>`,

    lips: (fill = "#e0405e") => `
<svg viewBox="0 0 100 70" class="art art-lips" aria-hidden="true">
  <g ${S}>
    <path d="M8 34 C20 16 36 12 50 22 C64 12 80 16 92 34 C70 38 30 38 8 34 Z" fill="${fill}"/>
    <path d="M8 34 C30 40 70 40 92 34 C82 56 66 64 50 64 C34 64 18 56 8 34 Z" fill="${fill}"/>
  </g>
  <path d="M26 46 Q32 52 40 52" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>
</svg>`,

    // a lipstick print (no outline) for stamping on photos
    kissMark: () => `
<svg viewBox="0 0 100 70" class="art art-kissmark" aria-hidden="true">
  <path d="M8 34 C20 16 36 12 50 22 C64 12 80 16 92 34 C70 38 30 38 8 34 Z" fill="#d6284e"/>
  <path d="M8 36 C30 42 70 42 92 36 C82 56 66 64 50 64 C34 64 18 56 8 36 Z" fill="#d6284e"/>
  <path d="M20 30 L24 26 M34 24 L36 20 M64 24 L62 20 M78 30 L74 26 M28 50 L30 54 M50 58 L50 62 M70 50 L68 54" stroke="#ff8aa5" stroke-width="2" stroke-linecap="round" opacity=".55"/>
</svg>`,

    smallHeartOutline: () => `
<svg viewBox="0 0 100 100" class="art" aria-hidden="true">
  <path d="M50 84 C22 64 10 48 14 32 C18 18 36 14 50 30 C64 14 82 18 86 32 C90 48 78 64 50 84 Z" fill="none" ${S} stroke-width="7"/>
</svg>`,

    // hand-drawn icons for the tab bar & buttons
    iconCake: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 40 L40 40 L40 26 Q40 22 36 22 L12 22 Q8 22 8 26 Z" fill="currentColor" fill-opacity=".18"/>
  <path d="M8 30 Q12 34 16 30 Q20 34 24 30 Q28 34 32 30 Q36 34 40 30"/>
  <path d="M16 22 L16 14 M24 22 L24 12 M32 22 L32 14"/>
  <path d="M16 9 Q14 6 16 4 Q18 6 16 9 Z M24 7 Q22 4 24 2 Q26 4 24 7 Z M32 9 Q30 6 32 4 Q34 6 32 9 Z" fill="currentColor"/>
</g></svg>`,
    iconPhoto: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="7" y="8" width="34" height="32" rx="5" fill="currentColor" fill-opacity=".18"/>
  <path d="M8 34 L18 23 L26 31 L31 26 L40 35"/>
  <circle cx="31" cy="17" r="3.5"/>
</g></svg>`,
    iconNote: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="9" y="7" width="30" height="35" rx="5" fill="currentColor" fill-opacity=".18"/>
  <path d="M16 4 L16 10 M24 4 L24 10 M32 4 L32 10"/>
  <path d="M16 19 L32 19 M16 26 L32 26 M16 33 L26 33"/>
</g></svg>`,
    iconWind: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round">
  <path class="w1" d="M5 18 L30 18 Q37 18 37 12 Q37 7 32 7 Q28 7 28 11"/>
  <path class="w2" d="M5 26 L38 26 Q44 26 44 32 Q44 38 38 38 Q34 38 34 34"/>
  <path class="w3" d="M5 34 L22 34"/>
</g></svg>`,
    iconSound: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 19 L16 19 L26 10 L26 38 L16 29 L8 29 Z" fill="currentColor" fill-opacity=".2"/>
  <path class="wave" d="M32 18 Q36 24 32 30 M37 13 Q44 24 37 35"/>
  <path class="mute-x" d="M33 18 L43 30 M43 18 L33 30"/>
</g></svg>`,
    iconBooth: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 17 Q7 13 11 13 L16 13 L19 8 L29 8 L32 13 L37 13 Q41 13 41 17 L41 35 Q41 39 37 39 L11 39 Q7 39 7 35 Z" fill="currentColor" fill-opacity=".18"/>
  <circle cx="24" cy="26" r="7.5"/>
  <path d="M34.5 19 L35 19"/>
</g></svg>`,
    iconDownload: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M24 7 L24 30 M15 22 L24 31 L33 22"/>
  <path d="M9 33 L9 38 Q9 41 12 41 L36 41 Q39 41 39 38 L39 33"/>
</g></svg>`,
    iconSend: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 23 L42 7 L32 41 L23 28 Z" fill="currentColor" fill-opacity=".18"/>
  <path d="M23 28 L42 7"/>
</g></svg>`,
    iconAgain: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M38 25 A14 14 0 1 1 33 13"/>
  <path d="M35 5 L34 14 L25 13"/>
</g></svg>`,
    iconToss: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 15 L36 15 L33 41 Q33 43 31 43 L17 43 Q15 43 15 41 Z" fill="currentColor" fill-opacity=".18"/>
  <path d="M8 15 L40 15 M19 15 L20 9 L28 9 L29 15 M21 22 L22 36 M27 22 L26 36"/>
</g></svg>`,
    iconMic: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <rect x="17" y="5" width="14" height="25" rx="7" fill="currentColor" fill-opacity=".18"/>
  <path d="M10 22 Q10 37 24 37 Q38 37 38 22 M24 37 L24 43 M17 43 L31 43"/>
</g></svg>`,
    iconBack: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><path d="M29 10 L15 24 L29 38" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    iconPlus: () => `
<svg viewBox="0 0 48 48" class="icon" aria-hidden="true"><path d="M24 12 L24 36 M12 24 L36 24" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>`,
  };

  function heartPath(fill) {
    return `<path d="M50 86 C20 66 8 48 12 32 C16 16 36 12 50 28 C64 12 84 16 88 32 C92 48 80 66 50 86 Z" fill="${fill}" ${S}/>
    <path d="M26 34 Q28 26 36 25" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
  }

  /* ── The cake ── built in code so the candle count is configurable ── */
  ART.cake = (candles = 5) => {
    const drip = (x1, x2, top, depth, n, fill) => {
      const w = (x2 - x1) / n;
      let d = `M${x1} ${top + depth} L${x1} ${top + 10} Q${x1} ${top} ${x1 + 10} ${top} L${x2 - 10} ${top} Q${x2} ${top} ${x2} ${top + 10} L${x2} ${top + depth}`;
      for (let i = n; i > 0; i--) {
        const xa = x1 + i * w, xb = x1 + (i - 1) * w;
        const dd = depth + [12, 5, 16, 7, 10][i % 5];
        d += ` C${xa - w * 0.05} ${top + dd + 6} ${xb + w * 0.05} ${top + dd + 6} ${xb} ${top + depth}`;
      }
      return `<path d="${d} Z" fill="${fill}" ${S} stroke-width="3.5"/>`;
    };

    // deterministic sprinkles
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const colors = ["#ef5a7a", "#f9d64a", "#5fb3e8", "#f6a73b", "#6cbf4a", "#b98ce8"];
    const sprinkles = (x1, x2, y1, y2, n) =>
      Array.from({ length: n }, () => {
        const x = x1 + rnd() * (x2 - x1), y = y1 + rnd() * (y2 - y1);
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="7" height="2.6" rx="1.3" fill="${colors[Math.floor(rnd() * colors.length)]}" transform="rotate(${Math.floor(rnd() * 180)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      }).join("");

    const scallops = (x1, x2, y, r, fill) => {
      let out = "";
      for (let x = x1 + r; x <= x2 - r + 1; x += r * 1.8) out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${S} stroke-width="3"/>`;
      return out;
    };

    const hearts = (x1, x2, y, n) =>
      Array.from({ length: n }, (_, i) => {
        const x = x1 + (i + 0.5) * ((x2 - x1) / n);
        const yy = y + (i % 2 ? 4 : -2);
        return `<g transform="translate(${x - 9} ${yy - 9}) scale(.18)">${heartPath("#ef5a7a")}</g>`;
      }).join("");

    // candles
    const left = 118, right = 242;
    const xs = candles === 1 ? [180] : Array.from({ length: candles }, (_, i) => left + i * ((right - left) / (candles - 1)));
    const candleSvg = xs.map((x, i) => `
      <g class="candle" data-i="${i}">
        <rect x="${x - 7}" y="34" width="14" height="50" rx="4" fill="#fbf5e2" ${S} stroke-width="3"/>
        <rect x="${x - 5.5}" y="35.5" width="11" height="47" rx="3" fill="url(#stripes)"/>
        <path d="M${x} 34 L${x} 27" ${S} stroke-width="2.5"/>
        <g class="smoke-anchor" transform="translate(${x} 22)"></g>
        <g transform="translate(${x} 28)">
          <g class="flame-lean">
            <g class="flame" style="--d:${(i * 0.13).toFixed(2)}s">
              <circle class="glow" cx="0" cy="-12" r="22" fill="url(#glow)"/>
              <path d="M0 -30 C8 -18 11 -9 11 -3 C11 5 6 9 0 9 C-6 9 -11 5 -11 -3 C-11 -9 -8 -18 0 -30 Z" fill="#ffd23f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
              <path d="M0 -14 C4 -8 5 -4 5 -1 C5 3 3 5 0 5 C-3 5 -5 3 -5 -1 C-5 -4 -4 -8 0 -14 Z" fill="#f6893b"/>
            </g>
          </g>
          <circle class="flame-hit" cx="0" cy="-8" r="22" fill="transparent"/>
        </g>
      </g>`).join("");

    return `
<svg viewBox="0 0 360 340" class="cake-svg" role="img" aria-label="A three tier birthday cake with ${candles} candles">
  <defs>
    <pattern id="stripes" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <rect width="4.5" height="9" fill="#6cbf4a"/>
    </pattern>
    <radialGradient id="glow"><stop offset="0" stop-color="#fff3a0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></radialGradient>
  </defs>

  <!-- plate -->
  <ellipse cx="180" cy="306" rx="172" ry="26" fill="#fbf5e2" ${S}/>
  <ellipse cx="180" cy="300" rx="150" ry="16" fill="none" stroke="#e7dcbc" stroke-width="3"/>

  <!-- bottom tier -->
  <rect x="34" y="206" width="292" height="92" rx="18" fill="#fbf3dc" ${S}/>
  ${sprinkles(48, 312, 232, 290, 34)}
  ${drip(34, 326, 202, 14, 9, "#fffaf0")}
  ${scallops(34, 326, 296, 10, "#6cbf4a")}
  <text x="180" y="268" text-anchor="middle" class="cake-text">Make a wish ♡</text>

  <!-- middle tier -->
  <rect x="64" y="138" width="232" height="74" rx="16" fill="#8fd06a" ${S}/>
  <path d="M68 186 Q90 178 112 186 T156 186 T200 186 T244 186 T292 186" fill="none" stroke="#fffaf0" stroke-width="4" stroke-linecap="round" opacity=".9"/>
  ${drip(64, 296, 134, 12, 7, "#fffaf0")}
  ${sprinkles(70, 290, 138, 150, 10)}
  ${hearts(68, 292, 176, 6)}
  ${scallops(64, 296, 210, 8, "#6cbf4a")}

  <!-- top tier -->
  <rect x="98" y="80" width="164" height="62" rx="14" fill="#fbf3dc" ${S}/>
  <rect x="98" y="114" width="164" height="12" fill="#8fd06a" stroke="${INK}" stroke-width="3"/>
  ${drip(98, 262, 78, 10, 5, "#fffaf0")}
  ${sprinkles(108, 252, 80, 92, 9)}
  ${scallops(98, 262, 140, 7, "#6cbf4a")}

  <g class="candles">${candleSvg}</g>
</svg>`;
  };

  /* ── Gift box for the intro ── */
  ART.gift = () => `
<svg viewBox="0 0 220 220" class="gift-svg" aria-hidden="true">
  <g class="gift-body" ${S}>
    <rect x="30" y="92" width="160" height="112" rx="10" fill="#8fd06a"/>
    <rect x="96" y="92" width="28" height="112" fill="#ef5a7a"/>
    <circle cx="62" cy="130" r="5" fill="#fbf5e2" stroke="none"/><circle cx="160" cy="170" r="5" fill="#fbf5e2" stroke="none"/>
    <circle cx="70" cy="180" r="4" fill="#f9d64a" stroke="none"/><circle cx="150" cy="120" r="4" fill="#f9d64a" stroke="none"/>
  </g>
  <g class="gift-lid" ${S}>
    <rect x="20" y="66" width="180" height="34" rx="9" fill="#a6dc80"/>
    <rect x="94" y="66" width="32" height="34" fill="#ef5a7a"/>
    <path d="M110 66 C90 30 52 34 60 54 C66 68 96 66 110 66 Z" fill="#f7a6b8"/>
    <path d="M110 66 C130 30 168 34 160 54 C154 68 124 66 110 66 Z" fill="#f7a6b8"/>
    <circle cx="110" cy="63" r="9" fill="#ef5a7a"/>
  </g>
</svg>`;

  /* ── Daisy for "loves me / loves me not" ── */
  ART.daisy = (petals = 13) => {
    const ps = Array.from({ length: petals }, (_, i) => {
      const a = (360 / petals) * i;
      return `<g class="petal-wrap" transform="rotate(${a.toFixed(1)} 60 56)"><path class="petal" data-i="${i}" d="M60 54 C52 44 52 22 60 14 C68 22 68 44 60 54 Z" fill="#fff" ${S} stroke-width="3"/></g>`;
    }).join("");
    return `
<svg viewBox="0 0 120 210" class="daisy-svg" aria-hidden="true">
  <path d="M60 62 C56 110 66 150 58 206" fill="none" stroke="#3f9a45" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 140 C40 128 30 132 24 142 C36 150 50 148 60 140 Z" fill="#6cbf4a" ${S} stroke-width="3"/>
  <path d="M61 118 C78 104 90 108 96 116 C86 126 72 126 61 118 Z" fill="#6cbf4a" ${S} stroke-width="3"/>
  <g class="petals">${ps}</g>
  <circle class="daisy-center" cx="60" cy="56" r="13" fill="#f9d64a" ${S} stroke-width="3.5"/>
  <circle cx="56" cy="53" r="2" fill="${INK}"/><circle cx="64" cy="53" r="2" fill="${INK}"/>
  <path d="M56 59 Q60 63 64 59" fill="none" ${S} stroke-width="2"/>
</svg>`;
  };

  ART.underline = (color = "#2e8b3e") => `
<svg viewBox="0 0 300 20" preserveAspectRatio="none" class="scribble-line" aria-hidden="true">
  <path d="M4 12 C60 4 120 16 180 9 C220 5 260 8 296 10" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" pathLength="1"/>
</svg>`;

  ART.INK = INK;
  window.ART = ART;
})();
