/* 慢慢小鎮 Slowtown — 立體角色與建築（原創 SVG） */
'use strict';

/* 色彩工具：amt > 0 變亮，< 0 變暗 */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* 共用漸層（打光） */
(function injectDefs() {
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = `<svg width="0" height="0" aria-hidden="true"><defs>
    <radialGradient id="gSphere" cx="38%" cy="30%" r="75%">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity=".08"/>
      <stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity=".28"/></radialGradient>
    <radialGradient id="gBody" cx="40%" cy="25%" r="80%">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#3a2410" stop-opacity=".3"/></radialGradient>
    <linearGradient id="gRoof" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#6b4a2a" stop-opacity=".12"/></linearGradient>
    <linearGradient id="gSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3a2410" stop-opacity=".22"/><stop offset="1" stop-color="#3a2410" stop-opacity=".32"/></linearGradient>
  </defs></svg>`;
  (document.body || document.documentElement).appendChild(d);
})();

/* ───────── 小動物 ───────── */
const ANIMAL = {
  rabbit:  { fur: '#f6f0e6', ear: 'long',   earIn: '#f4b3b5', muz: '#ffffff', nose: '#e8848a' },
  bear:    { fur: '#b8814f', ear: 'round',  earIn: '#8a5c36', muz: '#efd5b2', nose: '#3b2a22' },
  cat:     { fur: '#f0b45e', ear: 'pointy', earIn: '#f6b9a3', muz: '#fff3df', nose: '#e8848a', whisk: 1, stripe: '#d98f3e' },
  fox:     { fur: '#ea8b4b', ear: 'pointy', earIn: '#4a3328', muz: '#fff6ea', nose: '#3b2a22', wide: 1 },
  dog:     { fur: '#efd4a6', ear: 'floppy', earIn: '#a9754a', muz: '#fff8ee', nose: '#3b2a22' },
  penguin: { fur: '#4a5a70', ear: 'none',   mask: '#ffffff', beak: '#f0a64a', belly: '#ffffff' },
  panda:   { fur: '#fbfaf6', ear: 'round',  earIn: '#33333a', earC: '#33333a', patch: '#33333a', bodyC: '#33333a', belly: '#fbfaf6', nose: '#33333a' },
  koala:   { fur: '#a9aeb6', ear: 'big',    earIn: '#f3eeec', bigNose: '#3d3a3e' },
  hamster: { fur: '#f2c07f', ear: 'small',  earIn: '#f4b3b5', muz: '#fff8ee', nose: '#e8848a', cheek: 1 },
  frog:    { fur: '#8dc26a', ear: 'none',   frog: 1, belly: '#e9f2c9' },
  mouse:   { fur: '#bdb8b3', ear: 'big',    earIn: '#f4b3b5', muz: '#f5f1ec', nose: '#e8848a', whisk: 1 },
  tiger:   { fur: '#f2a640', ear: 'round',  earIn: '#fff0d8', muz: '#fff6ea', nose: '#e8848a', stripe: '#4a3328' },
  owl:     { fur: '#a07a55', ear: 'tuft',   owl: '#f6ead6', beak: '#e9a53f', belly: '#f1dfc2' },
  deer:    { fur: '#c98d58', ear: 'side',   earIn: '#f1cfae', muz: '#f5e5cf', nose: '#3b2a22', antler: '#8a6040', spots: 1 },
  hedgehog:{ fur: '#f1dcc0', ear: 'small',  earIn: '#e8c4a8', muz: '#fff6ea', nose: '#3b2a22', spikes: '#8a6748', bodyC: '#8a6748', belly: '#f1dcc0' },
};

function animalSVG(id, scarf = '#d98f6c', opt = {}) {
  const P = ANIMAL[id] || ANIMAL.rabbit;
  const fur = P.fur, dk = shade(fur, -0.22), ink = '#33261d';
  const bodyC = P.bodyC || fur;
  const head = !!opt.head;
  let s = '';
  // 影子 + 身體
  if (!head) {
    s += `<ellipse cx="50" cy="114" rx="23" ry="5" fill="rgba(60,40,20,.2)"/>`;
    s += `<ellipse cx="41" cy="108" rx="8" ry="5" fill="${shade(bodyC, -0.25)}"/><ellipse cx="59" cy="108" rx="8" ry="5" fill="${shade(bodyC, -0.25)}"/>`;
    s += `<ellipse cx="50" cy="91" rx="20" ry="18" fill="${bodyC}"/>`;
    if (P.belly) s += `<ellipse cx="50" cy="95" rx="12" ry="12" fill="${P.belly}"/>`;
    s += `<ellipse cx="50" cy="91" rx="20" ry="18" fill="url(#gBody)"/>`;
    s += `<ellipse cx="31" cy="90" rx="6" ry="10" transform="rotate(22 31 90)" fill="${shade(bodyC, -0.08)}"/><ellipse cx="69" cy="90" rx="6" ry="10" transform="rotate(-22 69 90)" fill="${shade(bodyC, -0.08)}"/>`;
    s += `<path d="M31 73 Q50 84 69 73 L70 80 Q50 92 30 80Z" fill="${scarf}"/><path d="M30 77 Q50 88 70 77" stroke="${shade(scarf, 0.3)}" stroke-width="1.5" fill="none" opacity=".7"/>`;
    s += `<path d="M57 80 L66 97 L59 99 L53 82Z" fill="${shade(scarf, -0.1)}"/>`;
  }
  // 耳朵（頭後面）
  const ears = {
    long: `<g><ellipse cx="38" cy="18" rx="7.5" ry="20" transform="rotate(-10 38 18)" fill="${fur}"/><ellipse cx="38" cy="19" rx="3.6" ry="14" transform="rotate(-10 38 19)" fill="${P.earIn}"/>
           <ellipse cx="62" cy="18" rx="7.5" ry="20" transform="rotate(10 62 18)" fill="${shade(fur, -0.05)}"/><ellipse cx="62" cy="19" rx="3.6" ry="14" transform="rotate(10 62 19)" fill="${P.earIn}"/></g>`,
    round: `<circle cx="26" cy="26" r="10" fill="${P.earC || fur}"/><circle cx="26" cy="26" r="5" fill="${P.earIn}"/><circle cx="74" cy="26" r="10" fill="${P.earC || fur}"/><circle cx="74" cy="26" r="5" fill="${P.earIn}"/>`,
    pointy: `<path d="M22 42 L26 8 L46 24Z" fill="${fur}"/><path d="M26 32 L28 14 L39 24Z" fill="${P.earIn}"/><path d="M78 42 L74 8 L54 24Z" fill="${shade(fur, -0.05)}"/><path d="M74 32 L72 14 L61 24Z" fill="${P.earIn}"/>`,
    big: `<circle cx="22" cy="28" r="15" fill="${fur}"/><circle cx="22" cy="28" r="9" fill="${P.earIn}"/><circle cx="78" cy="28" r="15" fill="${shade(fur, -0.05)}"/><circle cx="78" cy="28" r="9" fill="${P.earIn}"/>`,
    small: `<circle cx="30" cy="22" r="7" fill="${fur}"/><circle cx="30" cy="22" r="3.5" fill="${P.earIn}"/><circle cx="70" cy="22" r="7" fill="${fur}"/><circle cx="70" cy="22" r="3.5" fill="${P.earIn}"/>`,
    tuft: `<path d="M24 34 L28 8 L42 22Z" fill="${dk}"/><path d="M76 34 L72 8 L58 22Z" fill="${dk}"/>`,
    side: `<ellipse cx="20" cy="36" rx="12" ry="6" transform="rotate(-25 20 36)" fill="${fur}"/><ellipse cx="21" cy="36" rx="7" ry="3" transform="rotate(-25 21 36)" fill="${P.earIn}"/>
           <ellipse cx="80" cy="36" rx="12" ry="6" transform="rotate(25 80 36)" fill="${fur}"/><ellipse cx="79" cy="36" rx="7" ry="3" transform="rotate(25 79 36)" fill="${P.earIn}"/>`,
    floppy: '', none: '',
  };
  if (P.spikes) {
    let sp = '';
    for (let k = 0; k < 11; k++) {
      const a = Math.PI * (1.05 + k * 0.09), r1 = 28, r2 = 41;
      const x1 = 50 + Math.cos(a - 0.12) * r1, y1 = 46 + Math.sin(a - 0.12) * r1;
      const x2 = 50 + Math.cos(a) * r2, y2 = 46 + Math.sin(a) * r2;
      const x3 = 50 + Math.cos(a + 0.12) * r1, y3 = 46 + Math.sin(a + 0.12) * r1;
      sp += `${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)} `;
    }
    s += `<polygon points="${sp}" fill="${P.spikes}"/><circle cx="50" cy="44" r="33" fill="${P.spikes}"/>`;
  }
  if (P.antler) s += `<path d="M34 22 L28 6 M30 13 L22 10 M66 22 L72 6 M70 13 L78 10" stroke="${P.antler}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  s += ears[P.ear] || '';
  if (P.frog) s += `<circle cx="34" cy="24" r="11" fill="${fur}"/><circle cx="66" cy="24" r="11" fill="${fur}"/>`;
  // 頭
  const hx = P.cheek ? 33 : 30, hy = P.cheek ? 28 : 30;
  s += `<ellipse cx="50" cy="46" rx="${hx}" ry="${hy}" fill="${fur}"/>`;
  if (P.mask) s += `<circle cx="40" cy="47" r="14" fill="${P.mask}"/><circle cx="60" cy="47" r="14" fill="${P.mask}"/><ellipse cx="50" cy="58" rx="18" ry="11" fill="${P.mask}"/>`;
  if (P.owl) s += `<circle cx="38" cy="47" r="12" fill="${P.owl}"/><circle cx="62" cy="47" r="12" fill="${P.owl}"/>`;
  if (P.spots) s += `<circle cx="33" cy="34" r="2" fill="#fff6ea" opacity=".8"/><circle cx="40" cy="27" r="1.6" fill="#fff6ea" opacity=".8"/><circle cx="64" cy="29" r="1.8" fill="#fff6ea" opacity=".8"/>`;
  if (P.stripe) s += `<path d="M44 17 L46 27 L48 17Z M50 16 L50 26 L52 16Z M56 17 L54 27 L52 17Z" fill="${P.stripe}" opacity=".85"/><path d="M21 44 L30 46 L21 49Z M79 44 L70 46 L79 49Z" fill="${P.stripe}" opacity=".85"/>`;
  if (P.cheek) s += `<ellipse cx="29" cy="58" rx="11" ry="9" fill="#fff8ee"/><ellipse cx="71" cy="58" rx="11" ry="9" fill="#fff8ee"/>`;
  if (P.muz) s += `<ellipse cx="50" cy="59" rx="${P.wide ? 17 : 13}" ry="${P.wide ? 10 : 9}" fill="${P.muz}"/>`;
  if (P.patch) s += `<ellipse cx="38" cy="48" rx="7" ry="9" transform="rotate(25 38 48)" fill="${P.patch}"/><ellipse cx="62" cy="48" rx="7" ry="9" transform="rotate(-25 62 48)" fill="${P.patch}"/>`;
  s += `<ellipse cx="50" cy="46" rx="${hx}" ry="${hy}" fill="url(#gSphere)"/>`;
  if (P.ear === 'floppy') s += `<ellipse cx="22" cy="44" rx="8" ry="17" transform="rotate(14 22 44)" fill="${P.earIn}"/><ellipse cx="78" cy="44" rx="8" ry="17" transform="rotate(-14 78 44)" fill="${shade(P.earIn, -0.06)}"/>`;
  // 眼睛
  const eye = (x, y, r = 1) => `<ellipse cx="${x}" cy="${y}" rx="${3.3 * r}" ry="${4.3 * r}" fill="${P.patch ? '#111' : ink}"/><circle cx="${x + 1.2 * r}" cy="${y - 1.6 * r}" r="${1.3 * r}" fill="#fff"/>`;
  if (P.frog) s += `<circle cx="34" cy="23" r="7" fill="#fff"/><circle cx="66" cy="23" r="7" fill="#fff"/>` + eye(35, 24, 1.1) + eye(65, 24, 1.1);
  else if (P.owl) s += eye(38, 47, 1.25) + eye(62, 47, 1.25);
  else s += eye(39, 48) + eye(61, 48);
  if (P.patch) s += `<circle cx="40.2" cy="46.4" r="1.3" fill="#fff"/><circle cx="62.2" cy="46.4" r="1.3" fill="#fff"/>`;
  // 鼻子、嘴
  if (P.beak) s += `<path d="M45 55 L55 55 L50 62Z" fill="${P.beak}"/><path d="M45 55 L55 55 L50 58Z" fill="${shade(P.beak, 0.3)}"/>`;
  else if (P.bigNose) s += `<ellipse cx="50" cy="56" rx="7" ry="8" fill="${P.bigNose}"/><ellipse cx="48" cy="53" rx="2" ry="2.5" fill="#fff" opacity=".35"/>`;
  else if (P.nose) s += `<ellipse cx="50" cy="55" rx="3.6" ry="2.6" fill="${P.nose}"/>`;
  if (P.frog) s += `<path d="M36 56 Q50 66 64 56" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  else if (!P.beak) s += `<path d="M46 59.5 Q48 62.5 50 60 Q52 62.5 54 59.5" stroke="${ink}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  if (P.whisk) s += `<path d="M28 57 L18 55 M28 61 L18 62 M72 57 L82 55 M72 61 L82 62" stroke="${ink}" stroke-width=".9" opacity=".45"/>`;
  // 腮紅
  s += `<ellipse cx="31" cy="58" rx="5.5" ry="3.2" fill="#f2918f" opacity=".5"/><ellipse cx="69" cy="58" rx="5.5" ry="3.2" fill="#f2918f" opacity=".5"/>`;
  const vb = head ? '12 2 76 76' : '0 -8 100 128';
  return `<svg viewBox="${vb}" class="animal" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

/* ───────── 建築 ───────── */
const WALL = '#fff4e2';
function houseSVG(kind, roof = '#d98f6c', opt = {}) {
  const rd = shade(roof, -0.18), rdd = shade(roof, -0.38);
  const barn = kind === 'barn' || kind === 'hive';
  const wall = opt.wall || (kind === 'barn' ? '#c8664f' : kind === 'hive' ? '#f0cf74' : WALL);
  const up = opt.tall ? 16 : 0;
  const wd = shade(wall, -0.16);
  let s = `<ellipse cx="52" cy="95" rx="45" ry="6.5" fill="rgba(50,70,30,.22)"/>`;
  // 牆
  s += `<polygon points="70,52 91,42 91,83 70,93" fill="${wd}"/><polygon points="70,52 91,42 91,83 70,93" fill="url(#gSide)"/>`;
  s += `<rect x="13" y="52" width="57" height="41" fill="${wall}"/><rect x="13" y="52" width="57" height="41" fill="url(#gWall)"/>`;
  if (kind === 'barn') s += `<path d="M13 60 H70 M13 70 H70 M13 80 H70" stroke="${shade(wall, -0.12)}" stroke-width="1"/>`;
  if (kind === 'hive') s += `<path d="M13 62 H70 M13 74 H70 M13 86 H70" stroke="#c99f3e" stroke-width="2"/><path d="M70 62 L91 52 M70 74 L91 64 M70 86 L91 76" stroke="#b08a34" stroke-width="2"/>`;
  s += `<rect x="13" y="87" width="57" height="6" fill="#cdbfa8"/><polygon points="70,87 91,77 91,83 70,93" fill="#b9aa92"/>`;
  if (up) {
    s += `<polygon points="70,${52 - up} 91,${42 - up} 91,42 70,52" fill="${wd}"/><polygon points="70,${52 - up} 91,${42 - up} 91,42 70,52" fill="url(#gSide)"/>`;
    s += `<rect x="13" y="${52 - up}" width="57" height="${up + 1}" fill="${wall}"/><rect x="13" y="${52 - up}" width="57" height="${up + 1}" fill="url(#gWall)"/>`;
    s += `<path d="M13 52 H70" stroke="${shade(wall, -0.2)}" stroke-width="1.5"/>`;
    s += [20, 37, 54].map(x => `<rect x="${x}" y="${40 - up / 2}" width="9" height="9" rx="1" fill="#cfe6f2" class="win" stroke="#fff" stroke-width="1.6"/>`).join('');
  }
  s += `<g transform="translate(0 ${-up})">`;
  // 屋頂
  if (barn) {
    s += `<polygon points="42,22 64,34 74,56 94,46 85,24 62,12" fill="${rd}"/>`;
    s += `<polygon points="9,57 19,35 42,22 64,34 74,57" fill="${roof}"/><polygon points="9,57 19,35 42,22 64,34 74,57" fill="url(#gRoof)"/>`;
    s += `<polyline points="9,57 19,35 42,22 64,34 74,57" fill="none" stroke="${rdd}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<polygon points="30,52 42,40 54,52" fill="${shade(wall, 0.15)}"/>`;
  } else {
    s += `<polygon points="42,20 76,56 96,46 62,10" fill="${rd}"/><polygon points="42,20 76,56 96,46 62,10" fill="url(#gRoof)"/>`;
    s += `<path d="M50 28 L84 52 M58 19 L92 44" stroke="${rdd}" stroke-width="1" opacity=".35"/>`;
    s += `<polygon points="8,57 42,20 76,57" fill="${roof}"/><polygon points="8,57 42,20 76,57" fill="url(#gRoof)"/>`;
    s += `<polyline points="8,57 42,20 76,57" fill="none" stroke="${rdd}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += `<circle cx="42" cy="42" r="5" fill="${shade(wall, -0.05)}" stroke="${rdd}" stroke-width="1.5"/>`;
  }
  // 煙囪
  if (kind === 'home' || kind === 'house') {
    s += `<polygon points="72,22 80,18 80,32 72,36" fill="#b9735a"/><polygon points="68,20 72,22 72,36 68,34" fill="#d08a6e"/><polygon points="68,20 76,16 80,18 72,22" fill="#8f5745"/>`;
    if (kind === 'home') s += `<g class="smoke" fill="#fff" opacity=".75"><circle cx="75" cy="12" r="3.5"/><circle cx="79" cy="6" r="4.5"/><circle cx="84" cy="0" r="5"/></g>`;
  }
  s += `</g>`;
  // 門窗
  if (kind === 'barn') {
    s += `<rect x="29" y="64" width="26" height="29" fill="#fff3e3"/><path d="M29 64 L55 93 M55 64 L29 93" stroke="${shade(wall, -0.1)}" stroke-width="3"/><rect x="29" y="64" width="26" height="29" fill="none" stroke="#fff3e3" stroke-width="2"/>`;
  } else if (kind === 'hive') {
    s += `<rect x="34" y="80" width="16" height="4" rx="2" fill="#6b4a2a"/>`;
  } else if (kind === 'shop') {
    s += `<rect x="18" y="66" width="22" height="18" rx="2" fill="#cfe6f2" class="win" stroke="#fff" stroke-width="2"/>`;
    s += `<rect x="46" y="64" width="16" height="29" rx="2" fill="#9db89a" stroke="#fff" stroke-width="1.5"/><rect x="49" y="67" width="10" height="12" fill="#e6f2ee" class="win"/>`;
    let aw = '';
    for (let k = 0; k < 7; k++) aw += `<path d="M${13 + k * 8.15} 54 h8.15 v6 a4.07 4.07 0 0 1 -8.15 0Z" fill="${k % 2 ? '#fff8ee' : roof}"/>`;
    s += aw + `<polygon points="70,54 91,44 91,50 70,60" fill="${rd}"/>`;
  } else {
    s += `<path d="M34 93 V74 a7 7 0 0 1 14 0 V93Z" fill="#9a6a45"/><path d="M36 93 V74 a5 5 0 0 1 10 0 V93" fill="none" stroke="#7d5536" stroke-width="1"/><circle cx="44" cy="84" r="1.3" fill="#f0d08a"/>`;
    s += `<rect x="17" y="64" width="12" height="12" rx="1.5" fill="#cfe6f2" class="win" stroke="#fff" stroke-width="2"/><path d="M23 64 V76 M17 70 H29" stroke="#fff" stroke-width="1.4"/>`;
    s += `<rect x="54" y="64" width="12" height="12" rx="1.5" fill="#cfe6f2" class="win" stroke="#fff" stroke-width="2"/><path d="M60 64 V76 M54 70 H66" stroke="#fff" stroke-width="1.4"/>`;
    s += `<rect x="15" y="77" width="16" height="3" rx="1" fill="#e8b4b0"/><rect x="52" y="77" width="16" height="3" rx="1" fill="#9db89a"/>`;
  }
  if (kind !== 'hive') s += `<polygon points="76,60 85,56 85,67 76,71" fill="#cfe6f2" class="win" stroke="${shade(wall, -0.25)}" stroke-width="1"/>`;
  // 風車
  if (kind === 'mill') {
    s += `<g class="blades">${[0, 90, 180, 270].map(a => `<g transform="rotate(${a} 42 30)"><rect x="40.5" y="6" width="3" height="24" fill="#8a6040"/><rect x="43.5" y="8" width="7" height="18" fill="#fff8ee" stroke="#c9b597" stroke-width="1"/></g>`).join('')}</g>`;
    s += `<circle cx="42" cy="30" r="3.5" fill="#6b4a2a"/>`;
  }
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" overflow="visible">${s}</svg>`;
}
const BLD_KIND = { home: 'home', coop: 'barn', cowbarn: 'barn', sheepfold: 'barn', beehive: 'hive', mill: 'mill', shop: 'shop' };

/* ───────── 樹 ───────── */
function treeSVG(kind, season) {
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" overflow="visible">${treeInner(kind, season)}</svg>`;
}
function treeInner(kind, season) {
  const leaf = { spring: '#a3cf8a', summer: '#6faa5c', autumn: '#e39a4a', winter: '#9ab39a' }[season] || '#6faa5c';
  let s = `<ellipse cx="50" cy="94" rx="24" ry="5" fill="rgba(50,70,30,.25)"/>`;
  if (kind === 'pine') {
    const c = season === 'autumn' ? '#5f9468' : '#5a9466';
    s += `<rect x="46" y="74" width="8" height="20" rx="2" fill="#8b6142"/>`;
    [[14, 78, 30], [22, 60, 24], [30, 42, 18]].forEach(([y, b, w]) => {
      s += `<polygon points="50,${y} ${50 + w},${b} ${50 - w},${b}" fill="${c}"/><polygon points="50,${y} ${50 + w},${b} 50,${b}" fill="${shade(c, -0.15)}"/>`;
      if (season === 'winter') s += `<polygon points="50,${y} ${50 + w * 0.45},${y + (b - y) * 0.45} ${50 - w * 0.45},${y + (b - y) * 0.45}" fill="#fff"/>`;
    });
  } else {
    s += `<path d="M46 94 L47 62 L53 62 L54 94Z" fill="#8b6142"/><path d="M50 70 L40 60 M50 66 L60 58" stroke="#8b6142" stroke-width="3" stroke-linecap="round"/>`;
    s += `<g><circle cx="34" cy="52" r="17" fill="${shade(leaf, -0.1)}"/><circle cx="66" cy="52" r="17" fill="${shade(leaf, -0.14)}"/><circle cx="50" cy="38" r="25" fill="${leaf}"/>
      <circle cx="50" cy="38" r="25" fill="url(#gSphere)"/><circle cx="34" cy="52" r="17" fill="url(#gSphere)" opacity=".6"/><circle cx="66" cy="52" r="17" fill="url(#gSphere)"/></g>`;
    if (season === 'spring') s += [[38, 30], [58, 26], [46, 46], [66, 44], [30, 52], [54, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#f6c3cf"/>`).join('');
    if (season === 'summer') s += [[40, 34], [60, 42], [32, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#e5604f"/>`).join('');
    if (season === 'winter') s += `<path d="M28 30 Q50 6 72 30 Q60 24 50 26 Q40 24 28 30Z" fill="#fff"/>`;
  }
  return s;
}

/* 一叢一叢的植物 */
function clumpSVG(id, season) {
  const wrap = inner => `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" overflow="visible">${inner}</svg>`;
  const g = (inner, x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})">${inner}</g>`;
  if (id === 'tree' || id === 'pine') {
    // 後面兩棵小的、前面一棵大的，形成小樹林
    const other = id === 'tree' ? 'pine' : 'tree';
    return wrap(
      `<ellipse cx="50" cy="93" rx="46" ry="7" fill="rgba(50,70,30,.22)"/>` +
      g(treeInner(id, season), 2, 26, 0.6) +
      g(treeInner(id === 'tree' ? 'tree' : 'pine', season), 42, 22, 0.62) +
      g(treeInner(id, season), 20, 30, 0.68) +
      g(bushInner('#6f9a5e', season), 62, 64, 0.34) + g(bushInner('#7fa96a', season), 2, 68, 0.3));
  }
  if (id === 'tulip' || id === 'rose') {
    const cols = id === 'tulip' ? ['#f2a1b5', '#e5604f', '#f5d46a', '#fff4f2', '#c59ad6'] : ['#d6455b', '#e8697b', '#c7344a'];
    let s = `<ellipse cx="50" cy="92" rx="44" ry="7" fill="rgba(50,70,30,.22)"/>`;
    if (id === 'tulip') {
      // 木框花圃
      s += `<path d="M8 74 L92 74 L88 92 L12 92Z" fill="#a0774f"/><path d="M8 74 L92 74 L90 80 L10 80Z" fill="#b98d63"/><path d="M12 80 H88" stroke="#7d5a3a" stroke-width="1"/>`;
      s += `<ellipse cx="50" cy="74" rx="42" ry="7" fill="#7a5a3e"/>`;
    }
    const bs = season === 'autumn' ? 'summer' : season;
    s += g(bushInner('#76a560', bs), -2, 34, 0.56) + g(bushInner('#6a9a57', bs), 44, 30, 0.58) + g(bushInner('#82b06a', bs), 20, 40, 0.62);
    // 花朵：三排，由後到前、越前面越大
    const rows = id === 'tulip' ? [[16, 50, 7], [28, 60, 8.5], [40, 70, 10]] : [[18, 46, 7], [30, 58, 8.5], [42, 68, 9.5]];
    let k = 0;
    rows.forEach(([x0, y, r], ri) => {
      const n = 5 - ri;
      for (let j = 0; j < n; j++) {
        const x = x0 + j * ((100 - 2 * x0) / Math.max(1, n - 1)) + (ri % 2 ? 3 : -3);
        const c = cols[(k++ * 7 + ri) % cols.length];
        if (id === 'tulip') {
          s += `<path d="M${x} ${y + r * 1.6} V${y + r * .4}" stroke="#4f8a45" stroke-width="1.6"/>`;
          s += `<path d="M${x - r * .55} ${y - r * .1} Q${x - r * .6} ${y + r * .8} ${x} ${y + r * .8} Q${x + r * .6} ${y + r * .8} ${x + r * .55} ${y - r * .1} L${x + r * .28} ${y + r * .2} L${x} ${y - r * .35} L${x - r * .28} ${y + r * .2}Z" fill="${c}"/>`;
          s += `<path d="M${x - r * .3} ${y + r * .1} Q${x - r * .3} ${y + r * .6} ${x} ${y + r * .65}" stroke="#fff" stroke-width="1" fill="none" opacity=".5"/>`;
        } else {
          s += `<circle cx="${x}" cy="${y}" r="${r * .62}" fill="${c}"/><path d="M${x - r * .3} ${y} a${r * .3} ${r * .3} 0 1 1 ${r * .3} ${r * .3}" stroke="${shade(c, -0.3)}" stroke-width="1.2" fill="none"/><circle cx="${x - r * .2}" cy="${y - r * .25}" r="${r * .15}" fill="#fff" opacity=".45"/>`;
        }
      }
    });
    return wrap(s);
  }
  return '';
}
function bushInner(c, season) {
  if (season === 'autumn') c = shade('#c9883f', 0);
  return `<circle cx="30" cy="60" r="22" fill="${shade(c, -0.12)}"/><circle cx="70" cy="60" r="22" fill="${shade(c, -0.18)}"/><circle cx="50" cy="48" r="28" fill="${c}"/>
    <circle cx="50" cy="48" r="28" fill="url(#gSphere)"/><circle cx="30" cy="60" r="22" fill="url(#gSphere)" opacity=".6"/><circle cx="70" cy="60" r="22" fill="url(#gSphere)" opacity=".6"/>` +
    (season === 'winter' ? `<path d="M26 34 Q50 12 74 34 Q62 28 50 30 Q38 28 26 34Z" fill="#fff"/><path d="M10 54 Q22 42 34 46 Q22 48 10 54Z M66 46 Q78 42 90 54 Q78 48 66 46Z" fill="#fff"/>` : '');
}
