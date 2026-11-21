/* 慢慢小鎮 Slowtown — 介面 */
'use strict';

const UI = {};
const $ = s => document.querySelector(s);
const V = {
  tab: 'town',
  sub: { barn: 'inv', orders: 'orders', finance: 'bank', diary: 'journal' },
  moveMode: false, moveFrom: null,
  sheetFn: null,
  seedBatch: false, buildCat: 'farm',
  shelfPick: null,
  amt: { bank: '', loan: '', fix: '' },
  stockQty: 1,
  intro: { species: 'rabbit', color: SCARF_COLORS[0], name: '', town: '' },
  modalQ: [], modalYes: null,
};

/* ───────── 工具 ───────── */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Math.round(n).toLocaleString('zh-TW');
const fmtC = n => {
  n = Math.round(n);
  if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '億';
  if (Math.abs(n) >= 1e5) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + '萬';
  return n.toLocaleString('zh-TW');
};
const fmtT = ms => {
  if (ms <= 0) return '完成';
  const s = Math.ceil(ms / 1000);
  if (s < 60) return s + '秒';
  const m = Math.floor(s / 60);
  if (m < 60) return m + '分' + String(s % 60).padStart(2, '0') + '秒';
  const h = Math.floor(m / 60);
  if (h < 24) return h + '時' + String(m % 60).padStart(2, '0') + '分';
  return Math.floor(h / 24) + '天' + (h % 24) + '時';
};
const pct = (v, d = 1) => (v >= 0 ? '+' : '') + (v * 100).toFixed(d) + '%';
const it = id => ITEMS[id];
const ie = id => ITEMS[id].emoji;
const heartsStr = n => '❤️'.repeat(Math.min(n, 5)) + (n > 5 ? `+${n - 5}` : '') + (n === 0 ? '<span class="tiny">♡</span>' : '');
const sp = () => SPECIES.find(s => s.id === S.player.species) || SPECIES[0];
const need = (id, q) => `<span class="chip ${G.has(id, q) ? 'ok' : 'no'}">${ie(id)} ${Math.min(S.inv[id] || 0, 999)}/${q}</span>`;
const cd = end => `<span data-cd="${end}"></span>`;
const pg = (a, b) => `<i data-pg="${a},${b}"></i>`;

function spark(arr, w = 90, h = 30, color) {
  if (!arr || arr.length < 2) return '';
  const mn = Math.min(...arr), mx = Math.max(...arr), r = mx - mn || 1;
  const pts = arr.map((v, i) => `${(i / (arr.length - 1) * w).toFixed(1)},${(h - 2 - (v - mn) / r * (h - 4)).toFixed(1)}`).join(' ');
  const c = color || (arr[arr.length - 1] >= arr[0] ? 'var(--green)' : 'var(--red)');
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function areaChart(arr, w = 320, h = 120, color = 'var(--terra)') {
  if (!arr || arr.length < 2) return '<div class="empty">資料累積中…</div>';
  const mn = Math.min(...arr), mx = Math.max(...arr), r = mx - mn || 1;
  const xy = arr.map((v, i) => [i / (arr.length - 1) * w, h - 8 - (v - mn) / r * (h - 20)]);
  const line = xy.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block">
    <polygon points="0,${h} ${line} ${w},${h}" fill="${color}" opacity=".13"/>
    <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
  </svg><div class="between tiny"><span>低 ${fmt(mn)}</span><span>高 ${fmt(mx)}</span></div>`;
}
function setHTML(el, html) {
  if (!el) return;
  if (el._h === html) return;
  const a = document.activeElement;
  if (a && el.contains(a) && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return;
  el._h = html; el.innerHTML = html;
}

/* ───────── 音效 / 震動 ───────── */
let actx = null;
UI.sfx = function (type = 'pop') {
  if (!S || !S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    const f = { pop: [520, 780], coin: [880, 1320], up: [440, 990], bad: [220, 160], water: [700, 400] }[type] || [500, 700];
    o.type = type === 'bad' ? 'square' : 'sine';
    o.frequency.setValueAtTime(f[0], actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f[1], actx.currentTime + 0.12);
    g.gain.setValueAtTime(0.08, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.22);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.25);
  } catch (e) { /* ignore */ }
  if (S.settings.vibe && navigator.vibrate) navigator.vibrate(type === 'bad' ? [20, 30, 20] : 8);
};

/* ───────── 提示 / 特效 ───────── */
UI.toast = function (msg) {
  const box = $('#toasts');
  const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = msg;
  box.appendChild(d);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => d.remove(), 3100);
};
let lastTap = { x: innerWidth / 2, y: innerHeight / 2 };
document.addEventListener('pointerdown', e => { lastTap = { x: e.clientX, y: e.clientY }; }, true);
UI.float = function (text, x = lastTap.x, y = lastTap.y) {
  const d = document.createElement('div'); d.className = 'float'; d.innerHTML = text;
  d.style.left = x + 'px'; d.style.top = y + 'px';
  $('#fx').appendChild(d); setTimeout(() => d.remove(), 1200);
};
UI.confetti = function (set = ['🎉', '✨', '🌸', '⭐', '🍀']) {
  for (let k = 0; k < 26; k++) {
    const d = document.createElement('div'); d.className = 'confetti';
    d.textContent = pick(set); d.style.left = Math.random() * 100 + 'vw';
    d.style.animationDelay = Math.random() * 0.6 + 's'; d.style.fontSize = rand(14, 26) + 'px';
    $('#fx').appendChild(d); setTimeout(() => d.remove(), 3200);
  }
};
const FAIL = {
  coins: '金幣不夠喔 🪙', pop: '人口不足，先蓋住宅讓居民搬進來 🏠', lvl: '等級還不夠，再努力一下！', max: '已經達到數量上限了', full: '倉庫滿了！先賣掉一些或擴建倉庫 📦',
  mat: '材料不足', slots: '排程已滿，先等等或升級', clovers: '四葉草不夠 🍀', cap: '超過額度上限', busy: '還在使用中，先清空再操作',
  home: '這是你的家，不能拆喔', min: '最少 100 金幣', notready: '還沒成熟～',
};
function fail(r) { if (r === true || (r && typeof r === 'object')) return false; UI.sfx('bad'); UI.toast(FAIL[r] || '沒辦法這麼做'); return true; }

/* ───────── Modal ───────── */
UI.modal = function (html) { V.modalQ.push(html); if (V.modalQ.length === 1) showModal(); };
function showModal() {
  const m = $('#modal');
  if (!V.modalQ.length) { m.classList.add('hidden'); return; }
  m.querySelector('.modal-card').innerHTML = V.modalQ[0];
  m.classList.remove('hidden');
}
UI.closeModal = function () { V.modalQ.shift(); showModal(); };
UI.confirm = function (text, yes, okLabel = '確定') {
  V.modalYes = yes;
  UI.modal(`<span class="bigic">🤔</span><h2>${text}</h2><div class="btns"><button class="btn ghost" data-act="closeModal">取消</button><button class="btn terra" data-act="modalYes">${okLabel}</button></div>`);
};
UI.levelUp = function (lvl) {
  const un = unlocksAt(lvl);
  UI.sfx('up'); UI.confetti();
  UI.modal(`<span class="bigic"><span class="face xl">${animalSVG(S.player.species, S.player.color)}</span></span><h2>升到 ${lvl} 級了！</h2>
    <div class="muted">獲得 🪙${30 * lvl} 與 🍀1</div>
    ${un.length ? `<div class="mt12 muted">新解鎖</div><div class="unlock-list">${un.map(u => `<span class="chip">${u}</span>`).join('')}</div>` : ''}
    ${JOURNAL.find(j => j.lvl === lvl) ? '<div class="mt12 tiny">📔 日記新增了一頁</div>' : ''}
    <div class="btns"><button class="btn" data-act="closeModal">太好了</button></div>`);
};
function unlocksAt(l) {
  const out = [];
  for (const [id, c] of Object.entries(CROPS)) if (c.lvl === l) out.push(`${ie(id)} ${it(id).name}種子`);
  for (const [id, b] of Object.entries(BUILDINGS)) if (b.lvl === l && id !== 'plot' && id !== 'home') out.push(`${b.emoji} ${b.name}`);
  for (const [id, r] of Object.entries(RECIPES)) if (r.lvl === l && !CROPS[id] && it(id).cat === 'goods') out.push(`${ie(id)} ${it(id).name}`);
  for (const d of Object.values(DECOS)) if (d.lvl === l) out.push(`${d.emoji} ${d.name}`);
  const feat = { 4: '🏦 企鵝銀行', 5: '📈 狐狸證券', 7: '🎈 熱氣球商隊', 8: '⬆️ 建築升級' };
  if (feat[l]) out.push(feat[l]);
  return out;
}

/* ───────── Sheet ───────── */
UI.openSheet = function (fn) {
  V.sheetFn = fn;
  const s = $('#sheet'); s.classList.remove('hidden');
  const b = s.querySelector('.sheet-body'); b._h = null; b.scrollTop = 0;
  setHTML(b, fn());
};
UI.closeSheet = function () {
  if (V.onSheetClose) { const f = V.onSheetClose; V.onSheetClose = null; try { f(); } catch (e) { /* ignore */ } }
  V.sheetFn = null; V.shelfPick = null;
  $('#sheet').classList.add('hidden');
};
function head(ic, title, sub = '') {
  return `<div class="sheet-head"><div class="ic">${ic}</div><div class="grow"><h2>${title}</h2>${sub ? `<div class="muted">${sub}</div>` : ''}</div><button class="x" data-act="closeSheet">✕</button></div>`;
}

/* ───────── HUD / 導覽 ───────── */
function renderHUD() {
  const si = G.seasonInfo();
  const need = G.xpNeed(S.level);
  return `<div class="avatar" style="background:${shade(S.player.color, 0.55)}" data-act="home">${animalSVG(S.player.species, S.player.color, { head: true })}<span class="lv">${S.level}</span></div>
  <div class="hud-mid"><div class="hud-name">${esc(S.player.name)} <small>· ${esc(S.player.town)}</small></div>
  <div class="xpbar"><i style="width:${S.xp / need * 100}%"></i></div></div>
  <div class="hud-pills"><span class="pill">🪙 ${fmtC(S.coins)}</span><span class="pill">🍀 ${S.clovers}</span>
  <span class="pill season" data-act="seasonInfo">${si.s.emoji} ${si.s.name}</span></div>`;
}
function badges() {
  let town = 0;
  S.tiles.forEach(t => { if (t && t.t === 'plot' && G.cropReady(t)) town++; else if (t && t.q && G.readyCount(t)) town++; });
  let ord = S.orders.filter(o => o.req && G.canFill(o)).length;
  if (G.questDone()) ord++;
  if (S.daily) ord += S.daily.tasks.filter(t => !t.done && G.dailyProg(t) >= t.n).length;
  const fin = S.bank.deps.filter(d => now() >= d.end).length;
  const dia = JOURNAL.filter(j => S.level >= j.lvl && !S.jSeen[j.id]).length;
  return { town, orders: ord, finance: fin, diary: dia };
}
function renderNav() {
  const b = badges();
  const tabs = [['town', '🏡', '小鎮'], ['barn', '📦', '倉庫'], ['orders', '📋', '訂單'], ['finance', '🏦', '金融'], ['diary', '📔', '日記']];
  return tabs.map(([id, ic, nm]) => `<button class="${V.tab === id ? 'on' : ''}" data-act="tab" data-t="${id}"><span class="ic">${ic}</span>${nm}${b[id] ? `<span class="dot">${b[id]}</span>` : ''}</button>`).join('');
}
function subtabs(tab, list) {
  return `<div class="tabs">${list.map(([id, nm, dot]) => `<button class="${V.sub[tab] === id ? 'on' : ''}" data-act="sub" data-t="${tab}" data-s="${id}">${nm}${dot ? `<span class="dot">${dot}</span>` : ''}</button>`).join('')}</div>`;
}

/* ───────── 小鎮 ───────── */
const QUEST_HINT = {
  q1: '點一塊空的農田，選小麥種下去。', q2: '作物閃閃發亮時，點它就能收成。也可以按「全部收成」。',
  q3: '到「訂單」頁，把居民想要的東西交給他們。', q4: '點空草地 → 畜牧 → 雞舍。', q5: '點雞舍，用小麥餵雞。',
  q6: '到「倉庫 → 市場」賣東西。', q7: '點空草地 → 工坊 → 風車磨坊。', q8: '點磨坊製作麵粉。', q9: '捲到地圖最下面，點「擴建土地」。',
  q10: '4 級可以蓋麵包坊，麵包需要麵粉和雞蛋。', q11: '到「金融 → 銀行」把錢存進活存。', q12: '到「金融 → 股市」挑一家喜歡的公司。',
  q13: '蓋建築和擺裝飾都會提升繁榮度。', q14: '6 級後在「商店」分類可以蓋文青小舖。', q15: '把商品上架到小舖，觀光客會自動來買。',
};
function questMini() {
  const q = G.curQuest();
  if (!q) return '';
  const v = G.condValue(q), n = G.condTarget(q), done = v >= n;
  return `<div class="quest-mini"><span class="qic">${done ? '🎁' : '🧭'}</span>
    <div class="grow"><div style="font-size:13px;font-weight:700">${q.text}</div>
    <div class="tiny">${done ? '完成了！領取獎勵吧' : (QUEST_HINT[q.id] || (q.type === 'net' ? `目前達成 ${Math.floor(v / n * 100)}%` : `${fmt(Math.min(v, n))} / ${fmt(n)}`))}</div>
    <div class="bar mustard"><i style="width:${Math.floor(Math.min(1, v / n) * 100)}%"></i></div></div>
    ${done ? `<button class="btn terra sm" data-act="claimQuest">領取</button>` : `<span class="tiny">🪙${q.r.coins}${q.r.clovers ? ' 🍀' + q.r.clovers : ''}</span>`}</div>`;
}
const face = (spId, color, cls = '') => `<span class="face ${cls}">${animalSVG(spId, color, { head: true })}</span>`;
const pface = (cls = '') => face(S.player.species, S.player.color, cls);
const vface = (npc, cls = '') => face(VILLAGERS[npc].sp, VILLAGERS[npc].scarf, cls);
function objHTML(t) {
  if (t.t === 'deco') {
    const d = DECOS[t.id];
    if (['tree', 'pine', 'tulip', 'rose'].includes(t.id)) return `<div class="obj tree">${clumpSVG(t.id, G.seasonInfo().s.id)}</div>`;
    return `<div class="obj emo"><span class="gshadow"></span><span class="deco${d.glow ? ' glow' : ''}">${d.emoji}</span></div>`;
  }
  const b = BUILDINGS[t.id];
  const kind = BLD_KIND[t.id] || 'house';
  return `<div class="obj bld${b.tall ? ' tall' : ''}">${houseSVG(kind, b.roof || '#d98f6c', { wall: b.wall, tall: b.tall })}</div>`;
}
function tileHTML(i) {
  const t = S.tiles[i];
  const row = Math.floor(i / COLS), col = i % COLS;
  const sel = V.moveMode && V.moveFrom === i ? ' sel' : '';
  const cls = `tile${(row + col) % 2 ? ' alt' : ''}${sel}`;
  const z = `style="z-index:${row * 10 + 10}"`;
  if (!t) return `<div class="${cls} empty-t" ${z} data-act="tile" data-i="${i}"><span class="plus">＋</span></div>`;
  if (t.t === 'plot') {
    if (t.crop) {
      const ready = G.cropReady(t), p = G.cropProg(t);
      const st = ready ? 2 : p < 0.45 ? 0 : 1;
      const e = st === 0 ? '🌱' : ie(t.crop);
      return `<div class="${cls}" ${z} data-act="tile" data-i="${i}"><div class="plot${t.w ? ' wet' : ''}"></div>
        <div class="crops s${st}"><span>${e}</span><span>${e}</span><span>${e}</span></div>
        ${ready ? '<span class="ready-spark">✨</span>' : `<div class="prog">${pg(t.at, t.at + t.dur)}</div>`}${t.w && !ready ? '<span class="drop">💧</span>' : ''}</div>`;
    }
    return `<div class="${cls}" ${z} data-act="tile" data-i="${i}"><div class="plot"></div></div>`;
  }
  if (t.t === 'deco') return `<div class="${cls}" ${z} data-act="tile" data-i="${i}">${objHTML(t)}</div>`;
  const b = BUILDINGS[t.id];
  let badge = '', prog = '';
  if (t.q) {
    const r = G.readyCount(t);
    if (r) badge = `<span class="badge ok">${r}</span>`;
    else if (!t.q.length) badge = `<span class="badge idle">zz</span>`;
    else { const x = t.q[0]; prog = `<div class="bld-prog">${pg(x.start, x.end)}</div>`; }
  } else if (t.shelf) {
    if (t.cash >= 1) badge = `<span class="badge coin">🪙</span>`;
    else if (!t.shelf.some(s => s)) badge = `<span class="badge idle">空</span>`;
  }
  const sign = t.id === 'home' || b.cat === 'house' ? '' : `<span class="sign">${b.emoji}</span>`;
  return `<div class="${cls}" ${z} data-act="tile" data-i="${i}">${objHTML(t)}${sign}
    <div class="bld-label${t.id === 'home' ? ' home' : ''}">${t.id === 'home' ? esc(S.player.name) + '的家' : b.name}${t.lvl > 1 ? ' ★' + t.lvl : ''}</div>${badge}${prog}</div>`;
}
function townHead() {
  const si = G.seasonInfo();
  let readyCrops = 0, readyB = 0, emptyPlots = 0;
  S.tiles.forEach(t => {
    if (!t) return;
    if (t.t === 'plot') { if (G.cropReady(t)) readyCrops++; else if (!t.crop) emptyPlots++; }
    if (t.q) readyB += G.readyCount(t);
  });
  const seed = S.lastSeed && S.level >= CROPS[S.lastSeed].lvl ? S.lastSeed : 'wheat';
  return `
  <div class="fest-banner"><span style="font-size:20px">${si.s.emoji}</span><div class="grow"><b>${si.s.fest}</b> <span class="tiny">第 ${si.year} 年 · 還有 ${cd(si.endsAt)}</span>
    <div class="tiny">${si.s.festItems.map(ie).join(' ')} 訂單 +30%、售價 +20%</div></div></div>
  ${questMini()}
  <div class="toolbar">
    <button class="btn ${readyCrops ? 'terra' : 'ghost'} sm" data-act="harvestAll">🧺 全部收成${readyCrops ? ` (${readyCrops})` : ''}</button>
    <button class="btn ${emptyPlots ? '' : 'ghost'} sm" data-act="plantAll" data-id="${seed}">${ie(seed)} 全部播種${emptyPlots ? ` (${emptyPlots})` : ''}</button>
    <button class="btn ${readyB ? 'mustard' : 'ghost'} sm" data-act="collectAll">📦 收集工坊${readyB ? ` (${readyB})` : ''}</button>
    <button class="btn ${V.moveMode ? 'blue' : 'ghost'} sm" data-act="moveMode">${V.moveMode ? '✓ 完成移動' : '✋ 移動'}</button>
  </div>
  <div class="town-stats"><span>👥 人口 <b>${G.population()}</b></span><span>✿ 繁榮 <b>${G.prosperity()}</b></span><span>🏪 客人每 ${Math.round(G.shopInterval() / 1000)} 秒</span></div>
  ${V.moveMode ? `<div class="tiny mb8 center">${V.moveFrom === null ? '點選要移動的建築或裝飾' : '點選一塊空地放下'}</div>` : ''}`;
}
function townMap() {
  const cells = [];
  for (let i = 0; i < S.rows * COLS; i++) cells.push(tileHTML(i));
  return cells.join('');
}
function townFoot() {
  const qi = Math.floor((now() / 86400000)) % QUOTES.length;
  return `${S.rows < MAX_ROWS ? `<div class="expand-card"><div style="font-size:22px">🚧</div><div><b>擴建土地</b>（多 6 格）</div>
    <div class="tiny">需要 Lv.${G.expandLvl()} · 🪙${fmt(G.expandCost())}</div>
    <button class="btn sm mt8 ${S.level < G.expandLvl() ? 'off' : ''}" data-act="expand">擴建</button></div>` : '<div class="expand-card">🎉 土地已全部開墾</div>'}
  <div class="quote mt12">「${QUOTES[qi]}」</div>`;
}
function renderTownInto(view) {
  if (view.dataset.mode !== 'town') {
    view.innerHTML = `<div id="t-head"></div><div class="mapwrap" id="t-wrap"><div class="map" id="t-map"></div><div class="actors" id="t-actors"></div><div class="night-layer"></div></div><div class="cliff"></div><div id="t-foot"></div>`;
    view.dataset.mode = 'town'; view._h = null;
  }
  setHTML($('#t-head'), townHead());
  const m = $('#t-map'), before = m._h;
  setHTML(m, townMap());
  setHTML($('#t-foot'), townFoot());
  Actors.sync(before !== m._h);
}

/* ───────── 會走路的居民 ───────── */
const Actors = {
  list: [], last: 0,
  tileEl(i) { return document.querySelector(`#t-map .tile[data-i="${i}"]`); },
  make(a) {
    const el = document.createElement('div');
    el.className = 'actor' + (a.npc ? ' npc' : ' me');
    if (a.npc) { el.dataset.act = 'chat'; el.dataset.v = a.npc; }
    el.innerHTML = `<div class="bubble"></div><div class="body">${animalSVG(a.sp, a.color)}</div>`;
    a.el = el; return el;
  },
  freeTiles() {
    const out = [];
    for (let i = 0; i < S.rows * COLS; i++) if (!S.tiles[i] || (S.tiles[i].t === 'plot' && !S.tiles[i].crop)) out.push(i);
    return out;
  },
  sync(mapChanged) {
    const box = $('#t-actors'); if (!box) return;
    if (!this.list.length || !box.children.length) {
      box.innerHTML = '';
      const homeI = S.tiles.findIndex(t => t && t.id === 'home');
      const start = (homeI >= 0 ? homeI : 0) + COLS;
      this.list = [{ id: 'me', sp: S.player.species, color: S.player.color, i: Math.min(start, S.rows * COLS - 1) }];
      const n = Math.min(3, 1 + Math.floor(S.level / 4));
      const ids = Object.keys(VILLAGERS).sort(() => Math.random() - 0.5).slice(0, n);
      const free = this.freeTiles();
      ids.forEach(v => this.list.push({ id: v, npc: v, sp: VILLAGERS[v].sp, color: VILLAGERS[v].scarf, i: free.length ? pick(free) : 0 }));
      this.list.forEach(a => box.appendChild(this.make(a)));
      this.list.forEach(a => this.place(a, a.i, false));
      return;
    }
    const me = this.list[0];
    if (me.sp !== S.player.species || me.color !== S.player.color) {
      me.sp = S.player.species; me.color = S.player.color; me.el.querySelector('.body').innerHTML = animalSVG(me.sp, me.color);
    }
    if (mapChanged) this.list.forEach(a => this.place(a, Math.min(a.i, S.rows * COLS - 1), false));
  },
  place(a, i, walk = true) {
    const t = this.tileEl(i); if (!t) return;
    const w = t.offsetWidth * 0.42, h = w * 1.28;
    const x = t.offsetLeft + t.offsetWidth * (a.npc ? 0.66 : 0.34) - w / 2;
    const y = t.offsetTop + t.offsetHeight * 1.02 - h;
    const row = Math.floor(i / COLS);
    const dist = Math.hypot(x - (a.x || x), y - (a.y || y));
    const dur = walk ? Math.min(2.6, 0.25 + dist / 90) : 0;
    if (a.x !== undefined && x < a.x - 2) a.el.classList.add('flip'); else if (a.x !== undefined && x > a.x + 2) a.el.classList.remove('flip');
    a.el.style.width = w + 'px'; a.el.style.height = h + 'px';
    a.el.style.transition = `transform ${dur}s linear`;
    a.el.style.transform = `translate(${x}px, ${y}px)`;
    a.el.style.zIndex = row * 10 + 15;
    a.x = x; a.y = y; a.i = i;
    if (walk && dur > 0) { a.el.classList.add('walk'); clearTimeout(a.tm); a.tm = setTimeout(() => a.el.classList.remove('walk'), dur * 1000); }
  },
  walkMe(i) { const me = this.list[0]; if (me && me.el) this.place(me, i, true); },
  say(a, text, ms = 2600) {
    const b = a.el.querySelector('.bubble'); b.innerHTML = text; a.el.classList.add('talk');
    clearTimeout(a.st); a.st = setTimeout(() => a.el.classList.remove('talk'), ms);
  },
  tick() {
    if (V.tab !== 'town' || !this.list.length || document.hidden) return;
    const free = this.freeTiles();
    this.list.forEach(a => {
      if (!a.npc || Math.random() > 0.22 || !free.length) return;
      const r = Math.random();
      if (r < 0.75) this.place(a, pick(free), true);
      else this.say(a, pick(['♪', '💭', '☕', '🌸', '✨', '…zZ', '😊', ie(pick(VILLAGERS[a.npc].likes))]));
    });
  },
  reset() { this.list = []; },
};
window.addEventListener('resize', () => { if (V.tab === 'town') Actors.list.forEach(a => Actors.place(a, a.i, false)); });

/* 地圖點擊 */
function tapTile(i) {
  if (V.moveMode) {
    const t = S.tiles[i];
    if (V.moveFrom === null) {
      if (!t) return;
      if (t.t === 'plot' && t.crop) { UI.toast('種著作物的田不能移動'); return; }
      V.moveFrom = i; UI.sfx('pop');
    } else if (!t) { G.move(V.moveFrom, i); V.moveFrom = null; UI.sfx('pop'); }
    else V.moveFrom = i === V.moveFrom ? null : i;
    return refresh();
  }
  const t = S.tiles[i];
  Actors.walkMe(i);
  if (!t) return UI.openSheet(() => buildSheet(i));
  if (t.t === 'plot') {
    if (!t.crop) return UI.openSheet(() => seedSheet(i));
    if (G.cropReady(t)) {
      const r = G.harvest(i);
      if (fail(r)) return;
      UI.sfx('pop'); UI.float(`+${r.n} ${ie(r.id)}`);
      return refresh();
    }
    if (!t.w) { G.water(i); UI.sfx('water'); UI.float('💧 澆水'); return refresh(); }
    return UI.openSheet(() => cropSheet(i));
  }
  if (t.t === 'deco') return UI.openSheet(() => decoSheet(i));
  if (t.id === 'home') return UI.openSheet(homeSheet);
  if (BUILDINGS[t.id].cat === 'house') return UI.openSheet(() => houseSheet(i));
  if (t.id === 'shop') {
    const c = G.collectCash(i);
    if (c) { UI.sfx('coin'); UI.float(`+${c} 🪙`); }
    return UI.openSheet(() => shopSheet(i));
  }
  if (t.q && G.readyCount(t)) {
    const r = G.collect(i);
    if (r.full) UI.toast(FAIL.full);
    if (r.n) { UI.sfx('pop'); UI.float(Object.entries(r.got).map(([k, v]) => `+${v}${ie(k)}`).join(' ')); return refresh(); }
  }
  UI.openSheet(() => bldSheet(i));
}

/* 種子 */
function seedSheet(i) {
  const s = G.seasonInfo().s;
  const empty = S.tiles.filter(t => t && t.t === 'plot' && !t.crop).length;
  return head('🌱', '選擇種子', `${s.emoji} ${s.full}：當季作物成長快 25%${s.id === 'winter' ? '，其他作物慢 20%' : ''}`) +
    `<div class="tabs"><button class="${!V.seedBatch ? 'on' : ''}" data-act="seedBatch" data-v="0">只種這格</button><button class="${V.seedBatch ? 'on' : ''}" data-act="seedBatch" data-v="1">種滿所有空田（${empty}）</button></div>
    <div class="grid3">${Object.entries(CROPS).map(([id, c]) => {
      const lock = S.level < c.lvl;
      return `<div class="opt${lock ? ' lock' : ''}" data-act="plant" data-i="${i}" data-id="${id}">
        ${c.fav === s.id ? '<span class="tag fest" style="position:absolute;top:6px;left:6px">當季</span>' : ''}
        <span class="e">${ie(id)}</span><div class="n">${it(id).name}</div>
        <div class="s">${lock ? `Lv.${c.lvl} 解鎖` : `🪙${c.seed} · ${fmtT(G.cropDur(id))}`}</div>
        <div class="s">收成 ${c.yield} 個 · 每個 ${G.sellPrice(id)}</div></div>`;
    }).join('')}</div>`;
}
function cropSheet(i) {
  const t = S.tiles[i]; if (!t || !t.crop) { setTimeout(UI.closeSheet); return ''; }
  const end = t.at + t.dur, ready = G.cropReady(t);
  return head(ie(t.crop), it(t.crop).name, ready ? '已經成熟了！' : `成熟倒數 ${cd(end)}`) +
    `<div class="bar mustard"><i data-pg="${t.at},${end}"></i></div>
    <div class="muted mt8">${t.w ? '💧 已經澆過水（加速 20%、有機會多收成 1 個）' : '點作物可以澆水，加速 20%'}</div>
    <div class="row mt12">
      ${ready ? `<button class="btn terra grow" data-act="harvestOne" data-i="${i}">收成</button>` :
      `<button class="btn mustard grow" data-act="rushCrop" data-i="${i}">🍀 ${G.rushCost(end - now())} 立即成熟</button>`}
      <button class="btn ghost" data-act="removeCrop" data-i="${i}">剷除</button>
    </div>`;
}

/* 建造 */
function buildSheet(i) {
  const cats = [['farm', '🌱 農田'], ['house', '🏠 住宅'], ['animal', '🐔 畜牧'], ['factory', '🏭 工坊'], ['shop', '🏪 商店'], ['deco', '🌷 裝飾']];
  let body = '';
  if (V.buildCat === 'deco') {
    body = Object.entries(DECOS).map(([id, d]) => {
      const lock = S.level < d.lvl;
      const pic = ['tree', 'pine', 'tulip', 'rose'].includes(id) ? `<span class="pic">${clumpSVG(id, G.seasonInfo().s.id)}</span>` : `<span class="e">${d.emoji}</span>`;
      return `<div class="opt${lock ? ' lock' : ''}" data-act="build" data-i="${i}" data-id="${id}">${pic}<div class="n">${d.name}</div>
        <div class="s">${lock ? `Lv.${d.lvl} 解鎖` : `🪙${fmt(d.cost)}`}</div><div class="s">繁榮 +${d.pros}</div></div>`;
    }).join('');
  } else {
    body = Object.entries(BUILDINGS).filter(([, b]) => b.cat === V.buildCat).map(([id, b]) => {
      const lock = S.level < b.lvl, cnt = G.count(id), mx = b.max && cnt >= b.max, popLack = b.pop && G.population() < b.pop;
      const pic = id === 'plot' ? `<span class="e">${b.emoji}</span>` : `<span class="pic">${houseSVG(BLD_KIND[id] || 'house', b.roof || '#d98f6c', { wall: b.wall, tall: b.tall })}<i>${b.cat === 'house' ? '' : b.emoji}</i></span>`;
      return `<div class="opt${lock || mx ? ' lock' : ''}" data-act="build" data-i="${i}" data-id="${id}">${pic}<div class="n">${b.name}</div>
        <div class="s">${lock ? `Lv.${b.lvl} 解鎖` : mx ? '已達上限' : `🪙${fmt(G.bldCost(id))}`}</div>
        ${b.res ? `<div class="s">👥 +${b.res} 人</div>` : b.pop ? `<div class="s ${popLack ? 'down' : ''}">需要人口 ${b.pop}</div>` : ''}
        <div class="s">${b.max ? `${cnt}/${b.max} 座` : id === 'plot' ? `已有 ${G.plotCount()} 塊` : ''}</div>
        <div class="tiny mt8">${b.desc}</div></div>`;
    }).join('');
  }
  return head('🔨', '要蓋什麼呢？', `目前人口 👥${G.population()} · 蓋住宅可以增加人口`) +
    `<div class="tabs">${cats.map(([id, nm]) => `<button class="${V.buildCat === id ? 'on' : ''}" data-act="buildCat" data-c="${id}">${nm}</button>`).join('')}</div>
    <div class="grid3">${body}</div>`;
}

/* 生產建築 */
function bldSheet(i) {
  const t = S.tiles[i]; if (!t) { setTimeout(UI.closeSheet); return ''; }
  const b = BUILDINGS[t.id], slots = G.slots(t);
  const ready = G.readyCount(t);
  let q = '';
  for (let k = 0; k < slots; k++) {
    const x = t.q[k];
    if (!x) { q += `<div class="qslot emptys">＋</div>`; continue; }
    const done = x.end <= now();
    q += `<div class="qslot${done ? ' done' : ''}"><span>${ie(x.r)}</span><span class="t">${done ? '✓ 完成' : x.start > now() ? '排隊中' : cd(x.end)}</span></div>`;
  }
  const lastEnd = t.q.length ? t.q[t.q.length - 1].end : 0;
  const recipes = b.recipes.map(r => {
    const R = RECIPES[r], lock = S.level < R.lvl;
    const ins = Object.entries(R.in).map(([k, n]) => need(k, n)).join('');
    const can = !lock && G.canMake(r) && t.q.length < slots;
    const missRaw = !lock && !G.canMake(r) && Object.entries(R.in).every(([k, n]) => G.has(k, n) || G.canBuy(k));
    return `<div class="recipe${lock ? ' lock' : ''}"><div class="out">${ie(r)}</div><div class="info">
      <div class="nm">${it(r).name} ${G.isFest(r) ? '<span class="tag fest">祭典</span>' : ''}</div>
      <div class="tiny">${lock ? `Lv.${R.lvl} 解鎖` : `⏱ ${fmtT(R.time * 1000 * G.speed(t))} · 售價 ${G.sellPrice(r)} · 庫存 ${S.inv[r] || 0}`}</div>
      <div class="ins">${ins}</div></div>
      ${lock ? '' : can ? `<button class="btn sm" data-act="make" data-i="${i}" data-r="${r}">製作</button>` :
        missRaw ? `<button class="btn ghost xs" data-act="buyMissing" data-r="${r}">🛒 補料</button>` : `<button class="btn sm off">製作</button>`}
    </div>`;
  }).join('');
  return head(`<span class="mini-house">${houseSVG(BLD_KIND[t.id] || 'house', b.roof || '#d98f6c', { wall: b.wall })}</span>`, `${b.name} <span class="tag sage">Lv.${t.lvl}</span>`, b.desc) +
    `<div class="card tight"><div class="between mb8"><b style="font-size:13px">生產排程 ${t.q.length}/${slots}</b>
      ${ready ? `<button class="btn terra sm" data-act="collect" data-i="${i}">收成 ${ready} 件</button>` :
      t.q.length ? `<button class="btn mustard xs" data-act="rushBld" data-i="${i}">🍀${G.rushCost(lastEnd - now())} 全部完成</button>` : ''}</div>
      <div class="queue">${q}</div></div>
    ${recipes}
    ${bldFooter(i)}`;
}
function bldFooter(i) {
  const t = S.tiles[i];
  const canUp = t.t === 'bld' && t.id !== 'home' && t.lvl < 3;
  const upLvl = t.lvl === 1 ? 8 : 15;
  return `<div class="card tight mt12">
    ${canUp ? `<div class="between"><div><b style="font-size:13px">升級到 Lv.${t.lvl + 1}</b><div class="tiny">${t.shelf ? '多一個貨架' : BUILDINGS[t.id].res ? `居民 +${BUILDINGS[t.id].res} 人` : '排程 +1、速度 +15%'} · 需要 Lv.${upLvl}</div></div>
      <button class="btn blue sm ${S.level < upLvl ? 'off' : ''}" data-act="upgrade" data-i="${i}">🪙${fmt(G.upCost(t))}</button></div>` : t.lvl >= 3 ? '<div class="tiny center">★ 已經是最高等級</div>' : ''}
    <div class="row mt8"><button class="btn ghost sm grow" data-act="startMove" data-i="${i}">✋ 移動</button>
    <button class="btn ghost sm grow" data-act="demolish" data-i="${i}">拆除（退 🪙${G.refund(i)}）</button></div></div>`;
}

/* 住宅 */
function houseSheet(i) {
  const t = S.tiles[i]; if (!t) { setTimeout(UI.closeSheet); return ''; }
  const b = BUILDINGS[t.id];
  const who = Object.keys(VILLAGERS).slice((i * 3) % 7, (i * 3) % 7 + 3);
  return head(`<span class="mini-house">${houseSVG('house', b.roof, { wall: b.wall, tall: b.tall })}</span>`, `${b.name} <span class="tag sage">Lv.${t.lvl}</span>`, b.desc) +
    `<div class="card tight between"><div><div class="tiny">住在這裡的居民</div><div class="bignum sm">👥 ${b.res * t.lvl} 人</div></div>
    <div class="row">${who.map(v => vface(v, 'md')).join('')}</div></div>
    <div class="tiny">小鎮總人口 ${G.population()} 人。人口越多，可以蓋的工坊越大，小舖的客人也越多。</div>
    ${bldFooter(i)}`;
}

/* 小舖 */
function shopSheet(i) {
  const t = S.tiles[i]; if (!t) { setTimeout(UI.closeSheet); return ''; }
  if (V.shelfPick !== null) {
    const items = Object.keys(S.inv).filter(id => S.inv[id] > 0);
    return head('🧺', '選擇要上架的商品', '一次最多上架 20 個，售價 = 基本價 × 1.3') +
      (items.length ? `<div class="grid4">${items.map(id => `<div class="item-cell" data-act="shelfPut" data-i="${i}" data-id="${id}"><span class="q">${S.inv[id]}</span><span class="e">${ie(id)}</span><div class="n">${it(id).name}</div><div class="tiny">🪙${G.shopPrice(id)}</div></div>`).join('')}</div>`
        : '<div class="empty"><span class="big">📦</span>倉庫空空的</div>') +
      `<button class="btn ghost block mt12" data-act="shelfCancel">返回</button>`;
  }
  const shelves = t.shelf.map((s, k) => s ? `<div class="list-row"><span class="e">${ie(s.id)}</span><div class="grow"><b>${it(s.id).name}</b> × ${s.n}<div class="tiny">每個 🪙${G.shopPrice(s.id)}</div></div>
      <button class="btn ghost xs" data-act="unstock" data-i="${i}" data-k="${k}">下架</button></div>`
    : `<div class="list-row"><span class="e" style="opacity:.35">🪹</span><div class="grow tiny">空貨架</div><button class="btn xs" data-act="shelfPick" data-k="${k}">＋ 上架</button></div>`).join('');
  return head(`<span class="mini-house">${houseSVG('shop', '#9db89a')}</span>`, `文青小舖 <span class="tag sage">Lv.${t.lvl}</span>`, `繁榮度 ✿${G.prosperity()} → 每 ${Math.round(G.shopInterval() / 1000)} 秒一位客人`) +
    `<div class="card tight between"><div><div class="tiny">收銀機</div><div class="bignum sm">🪙 ${fmt(Math.floor(t.cash))}</div></div>
     <button class="btn mustard ${t.cash < 1 ? 'off' : ''}" data-act="cash" data-i="${i}">收款</button></div>
    <div class="card tight"><h3>貨架</h3>${shelves}</div>
    <div class="tiny center">💡 離線時小舖也會繼續營業，多擺裝飾可以吸引更多客人</div>
    ${bldFooter(i)}`;
}
function decoSheet(i) {
  const t = S.tiles[i]; const d = DECOS[t.id];
  return head(d.emoji, d.name, `繁榮度 +${d.pros}`) +
    `<div class="muted">裝飾會讓小鎮更熱鬧，吸引更多觀光客到小舖消費。</div>
    <div class="row mt12"><button class="btn ghost grow" data-act="startMove" data-i="${i}">✋ 移動</button>
    <button class="btn ghost grow" data-act="demolish" data-i="${i}">收起來（退 🪙${G.refund(i)}）</button></div>`;
}
function homeSheet() {
  const days = Math.floor((now() - S.created) / 86400000) + 1;
  return head(pface('lg'), esc(S.player.name), `${esc(S.player.town)} 的鎮長 · 來到小鎮第 ${days} 天`) +
    `<div class="grid2">
      <div class="card tight center"><div class="tiny">等級</div><div class="bignum sm">${S.level}</div></div>
      <div class="card tight center"><div class="tiny">總資產</div><div class="bignum sm"><span data-live="net"></span></div></div>
      <div class="card tight center"><div class="tiny">繁榮度</div><div class="bignum sm">✿ ${G.prosperity()}</div></div>
      <div class="card tight center"><div class="tiny">連續登入</div><div class="bignum sm">${S.login.streak} 天</div></div>
      <div class="card tight center"><div class="tiny">人口</div><div class="bignum sm">👥 ${G.population()}</div></div>
      <div class="card tight center"><div class="tiny">好友</div><div class="bignum sm">❤️ ${Object.keys(VILLAGERS).filter(v => G.hearts(v) >= 3).length}</div></div>
    </div>
    <button class="btn ghost block" data-act="editProfile">✏️ 換個造型 / 改名字</button>`;
}
function editSheet() {
  const p = V.edit;
  return head('✏️', '編輯角色') +
    `<div class="center">${`<span class="face xl">${animalSVG(p.species, p.color)}</span>`}</div><div class="species">${SPECIES.map(s => `<div class="opt${p.species === s.id ? ' sel' : ''}" data-act="editSp" data-id="${s.id}">${face(s.id, p.color, 'md')}<div class="s">${s.name}</div></div>`).join('')}</div>
    <div class="colors mt12">${SCARF_COLORS.map(c => `<button class="${p.color === c ? 'on' : ''}" style="background:${c}" data-act="editColor" data-c="${c}"></button>`).join('')}</div>
    <div class="field"><label>名字</label><input id="ed-name" maxlength="10" value="${esc(p.name)}"></div>
    <div class="field"><label>小鎮名稱</label><input id="ed-town" maxlength="10" value="${esc(p.town)}"></div>
    <button class="btn terra block mt12" data-act="saveProfile">儲存</button>`;
}

/* ───────── 倉庫 / 市場 ───────── */
function renderBarn() {
  const st = subtabs('barn', [['inv', '📦 倉庫'], ['market', '🛒 市場']]);
  if (V.sub.barn === 'market') return st + renderMarket();
  const used = G.invCount(), cap = G.invCap();
  const groups = [['crop', '🌾 作物'], ['animal', '🥚 畜產'], ['goods', '🍞 加工品']];
  let body = '';
  for (const [c, nm] of groups) {
    const ids = Object.keys(S.inv).filter(id => it(id).cat === c);
    if (!ids.length) continue;
    body += `<div class="card"><h3>${nm}</h3><div class="grid4">${ids.map(id => `<div class="item-cell" data-act="item" data-id="${id}"><span class="q">${S.inv[id]}</span><span class="e">${ie(id)}</span><div class="n">${it(id).name}</div></div>`).join('')}</div></div>`;
  }
  return st + `<div class="card"><div class="between"><div><b>倉庫容量</b> <span class="muted">${used} / ${cap}</span></div>
    <button class="btn blue sm" data-act="upInv">擴建 +40 · 🪙${fmt(G.invUpCost())}</button></div>
    <div class="bar ${used / cap > .85 ? 'terra' : ''} mt8"><i style="width:${Math.min(1, used / cap) * 100}%"></i></div>
    <div class="tiny mt8">庫存價值約 🪙${fmt(G.invValue())}</div></div>` +
    (body || '<div class="empty"><span class="big">🧺</span>倉庫空空的，去田裡看看吧</div>');
}
function itemSheet(id) {
  const I = it(id), have = S.inv[id] || 0, m = G.mult(id);
  const usedIn = Object.entries(RECIPES).filter(([, r]) => r.in[id]).map(([k]) => k);
  const madeBy = RECIPE_BLD[id] ? BUILDINGS[RECIPE_BLD[id]] : null;
  const likers = Object.values(VILLAGERS).filter(v => v.likes.includes(id));
  return head(I.emoji, I.name, `庫存 ${have} · 基本價 ${I.base}`) +
    `<div class="card tight between"><div><div class="tiny">市場收購價</div><div class="bignum sm">🪙 ${G.sellPrice(id)} <span style="font-size:13px" class="${m >= 1 ? 'up' : 'down'}">${m > 1.005 ? '▲' : m < 0.995 ? '▼' : ''}${Math.abs(m - 1) > 0.005 ? pct(m - 1, 0) : ''}</span></div>
      ${G.isFest(id) ? '<span class="tag fest">季節祭典 +20%</span>' : ''}</div>
      ${G.canBuy(id) ? `<div style="text-align:right"><div class="tiny">市場售價</div><b>🪙 ${G.buyPrice(id)}</b></div>` : ''}</div>
    ${have ? `<div class="tiny mb8">賣出</div><div class="row wrap">
      <button class="btn sm" data-act="sell" data-id="${id}" data-n="1">賣 1 個</button>
      ${have >= 10 ? `<button class="btn sm" data-act="sell" data-id="${id}" data-n="10">賣 10 個</button>` : ''}
      ${have > 1 ? `<button class="btn sm" data-act="sell" data-id="${id}" data-n="${Math.ceil(have / 2)}">賣一半</button>` : ''}
      <button class="btn terra sm" data-act="sell" data-id="${id}" data-n="${have}">全部賣出</button></div>
      <div class="tiny mt8">💡 一次賣太多價格會下跌，過一段時間會慢慢回升</div>` : ''}
    ${G.canBuy(id) ? `<div class="tiny mb8 mt12">購買</div><div class="row wrap">${[1, 5, 10].map(n => `<button class="btn ghost sm" data-act="buy" data-id="${id}" data-n="${n}">買 ${n}（🪙${G.buyPrice(id) * n}）</button>`).join('')}</div>` : ''}
    <div class="card tight mt12">
      ${madeBy ? `<div class="list-row"><span class="e">${madeBy.emoji}</span><div class="grow tiny">在「${madeBy.name}」生產</div></div>` : CROPS[id] ? `<div class="list-row"><span class="e">🌱</span><div class="grow tiny">在農田種植 · Lv.${CROPS[id].lvl}</div></div>` : ''}
      ${usedIn.length ? `<div class="list-row"><span class="e">🧪</span><div class="grow"><div class="tiny">可以做成</div><div class="row wrap mt8">${usedIn.map(k => `<span class="chip">${ie(k)} ${it(k).name}</span>`).join('')}</div></div></div>` : ''}
      ${likers.length ? `<div class="list-row"><span class="e">💕</span><div class="grow tiny">${likers.map(v => v.emoji + v.name).join('、')} 很喜歡</div></div>` : ''}
    </div>`;
}
function renderMarket() {
  const evs = Object.entries(S.market.ev);
  const have = Object.keys(S.inv).sort((a, b) => it(a).base - it(b).base);
  const buyable = Object.keys(ITEMS).filter(G.canBuy);
  return `<div class="card"><h3>🦊 市場快訊</h3>${evs.length ? evs.map(([id, e]) => `<div class="news">${ie(id)} ${it(id).name} 行情 <b class="${e.m >= 1 ? 'up' : 'down'}">${e.m >= 1 ? '看漲' : '看跌'} ${pct(e.m - 1, 0)}</b> · 剩 ${cd(e.until)}</div>`).join('') : '<div class="muted">目前市場平穩，沒有特別消息。</div>'}
    <div class="tiny mt8">${G.seasonInfo().s.fest}：${G.seasonInfo().s.festItems.map(ie).join(' ')} 售價 +20%</div></div>
    <div class="card"><h3>💰 賣出商品</h3>${have.length ? have.map(id => {
      const m = G.mult(id);
      return `<div class="list-row"><span class="e">${ie(id)}</span><div class="grow"><b style="font-size:13px">${it(id).name}</b> <span class="tiny">×${S.inv[id]}</span>
        <div class="tiny">每個 🪙${G.sellPrice(id)} <span class="${m >= 1 ? 'up' : 'down'}">${Math.abs(m - 1) > 0.005 ? (m > 1 ? '▲' : '▼') + pct(m - 1, 0) : ''}</span>${G.isFest(id) ? ' <span class="tag fest">祭典</span>' : ''}</div></div>
        <button class="btn ghost xs" data-act="sell" data-id="${id}" data-n="1">1</button>
        <button class="btn xs" data-act="sell" data-id="${id}" data-n="${S.inv[id]}">全部</button></div>`;
    }).join('') : '<div class="muted">沒有可以賣的東西</div>'}</div>
    <div class="card"><h3>🧺 購買原料</h3><div class="tiny mb8">缺料的時候可以在這裡買，但價格比較貴喔</div>
    ${buyable.map(id => `<div class="list-row"><span class="e">${ie(id)}</span><div class="grow"><b style="font-size:13px">${it(id).name}</b><div class="tiny">每個 🪙${G.buyPrice(id)} · 庫存 ${S.inv[id] || 0}</div></div>
      <button class="btn ghost xs" data-act="buy" data-id="${id}" data-n="1">買 1</button><button class="btn ghost xs" data-act="buy" data-id="${id}" data-n="5">買 5</button></div>`).join('')}</div>`;
}

/* ───────── 訂單 / 任務 ───────── */
function renderOrders() {
  const b = badges();
  const qd = (G.questDone() ? 1 : 0) + (S.daily ? S.daily.tasks.filter(t => !t.done && G.dailyProg(t) >= t.n).length : 0);
  const st = subtabs('orders', [['orders', '📋 居民訂單', S.orders.filter(o => o.req && G.canFill(o)).length], ['quests', '🧭 任務', qd], ['balloon', '🎈 熱氣球']]);
  if (V.sub.orders === 'quests') return st + renderQuests();
  if (V.sub.orders === 'balloon') return st + renderBalloon();
  return st + `<div class="grid2 orders-grid">${S.orders.map((o, k) => {
    if (!o.req) return `<div class="order wait"><span style="font-size:24px">✉️</span><div class="tiny">新訂單 ${cd(o.wait)}</div></div>`;
    const v = VILLAGERS[o.npc], can = G.canFill(o);
    return `<div class="order${can ? ' ready' : ''}"><button class="x" data-act="discard" data-k="${k}">✕</button>
      <div class="who">${vface(o.npc, 'md')}<div>${v.name}<div class="hearts">${heartsStr(G.hearts(o.npc))}</div></div></div>
      <div class="reqs">${o.req.map(([id, q]) => need(id, q)).join('')}</div>
      <div class="rw">🪙${fmt(o.coins)} · ⭐${o.xp} ${o.fest ? '<span class="tag fest">祭典</span>' : ''}</div>
      <button class="btn ${can ? 'terra' : 'ghost off'} sm" data-act="fill" data-k="${k}">交貨</button></div>`;
  }).join('')}</div>
  <div class="tiny center mt12">💡 交出居民喜歡的東西，友情會增加更多。不想做的訂單可以按 ✕ 換一張。</div>`;
}
function renderQuests() {
  const q = G.curQuest();
  let main = '<div class="card"><h3>🧭 主線任務</h3><div class="muted">所有主線任務都完成了！你是真正的傳說鎮長 👑</div></div>';
  if (q) {
    const v = G.condValue(q), n = G.condTarget(q);
    main = `<div class="card"><h3>🧭 主線任務 <span class="sp"></span><span class="tiny">${S.quest + 1}/${QUESTS.length}</span></h3>
      <b>${q.text}</b><div class="tiny mt8">${QUEST_HINT[q.id] || ''}</div>
      <div class="between mt8"><div class="grow"><div class="bar mustard"><i style="width:${Math.floor(Math.min(1, v / n) * 100)}%"></i></div><div class="tiny">${q.type === 'net' ? Math.floor(v / n * 100) + '%' : fmt(Math.min(v, n)) + ' / ' + fmt(n)}</div></div></div>
      <div class="between mt8"><span class="muted">獎勵 🪙${q.r.coins} ⭐${q.r.xp}${q.r.clovers ? ' 🍀' + q.r.clovers : ''}</span>
      <button class="btn terra sm ${v >= n ? '' : 'off'}" data-act="claimQuest">領取</button></div></div>`;
  }
  const D = S.daily;
  const daily = `<div class="card"><h3>☀️ 今日任務 <span class="sp"></span><span class="tiny">每天 0 點更新</span></h3>
    ${D.tasks.map((t, k) => {
      const p = G.dailyProg(t), tpl = DAILY_TEMPLATES.find(x => x.key === t.key);
      return `<div class="list-row"><span class="e">${t.done ? '✅' : '🌼'}</span><div class="grow"><div style="font-size:13px">${tpl.text(t.n)}</div>
        <div class="bar"><i style="width:${p / t.n * 100}%"></i></div><div class="tiny">${p}/${t.n} · 🪙${t.r.coins}${t.r.clovers ? ' 🍀' + t.r.clovers : ''}</div></div>
        ${t.done ? '<span class="tiny">已領取</span>' : `<button class="btn sm ${p >= t.n ? '' : 'off'}" data-act="claimDaily" data-k="${k}">領取</button>`}</div>`;
    }).join('')}
    <div class="between mt8"><span class="muted">🎁 全部完成額外獎勵：🍀2 + 🪙${100 + S.level * 20}</span>
    ${D.bonus ? '<span class="tiny">已領取</span>' : `<button class="btn mustard sm ${D.tasks.every(t => t.done) ? '' : 'off'}" data-act="claimBonus">領取</button>`}</div></div>`;
  const cur = ((S.login.streak - 1) % 7) + 1;
  const cal = `<div class="card"><h3>📅 連續登入 ${S.login.streak} 天</h3><div class="cal">${[1, 2, 3, 4, 5, 6, 7].map(d =>
    `<div class="${d < cur || (d === cur && S.login.claimed) ? 'got' : ''} ${d === cur ? 'today' : ''}"><b>${d === 7 ? '🎁' : d === 4 ? '🍀' : '🪙'}</b>第${d}天</div>`).join('')}</div>
    ${!S.login.claimed ? `<button class="btn terra block mt12" data-act="claimLogin">領取今日登入禮</button>` : '<div class="tiny center mt8">明天也要來看看小鎮喔</div>'}</div>`;
  return main + daily + cal;
}
function renderBalloon() {
  if (S.level < 7) return lockCard('🎈', '熱氣球商隊', 7, '遠方的商隊每隔幾個小時會乘著熱氣球來訪，帶來大筆訂單，報酬豐厚，還會送四葉草。');
  const b = S.balloon;
  if (!b.req) return `<div class="card center"><div style="font-size:60px">☁️🎈☁️</div><h3 style="justify-content:center">商隊正在路上</h3><div class="muted">下一班熱氣球 ${cd(b.next)} 後抵達</div>${b.missed ? '<div class="tiny mt8">上一班商隊等不到貨，先離開了…</div>' : ''}</div>`;
  return `<div class="card"><div class="center" style="font-size:56px;animation:bob 3s infinite">🎈</div>
    <h3 style="justify-content:center">遠方商隊委託</h3><div class="center muted">離開倒數 ${cd(b.until)}</div>
    ${b.req.map((r, k) => `<div class="list-row"><span class="e">${ie(r.id)}</span><div class="grow"><b style="font-size:13px">${it(r.id).name}</b>
      <div class="bar mustard"><i style="width:${r.d / r.q * 100}%"></i></div><div class="tiny">已交 ${r.d}/${r.q} · 庫存 ${S.inv[r.id] || 0}</div></div>
      ${r.d >= r.q ? '✅' : `<button class="btn sm ${(S.inv[r.id] || 0) > 0 ? '' : 'off'}" data-act="balloonGive" data-k="${k}">交貨</button>`}</div>`).join('')}
    <div class="center mt12"><b>報酬：🪙${fmt(b.coins)} · ⭐${b.xp} · 🍀${b.clovers}</b></div>
    <div class="tiny center mt8">可以分批交貨，全部交齊就能領取報酬</div></div>`;
}
function lockCard(ic, title, lvl, desc) {
  return `<div class="card center"><div style="font-size:56px">${ic}</div><h3 style="justify-content:center">${title}</h3>
    <div class="muted">${desc}</div><div class="mt12"><span class="tag">🔒 Lv.${lvl} 解鎖</span></div></div>`;
}

/* ───────── 金融 ───────── */
function renderFinance() {
  const fin = S.bank.deps.filter(d => now() >= d.end).length;
  const st = subtabs('finance', [['bank', '🐧 企鵝銀行', fin], ['stock', '🦊 狐狸證券'], ['assets', '📊 資產']]);
  if (V.sub.finance === 'stock') return st + renderStocks();
  if (V.sub.finance === 'assets') return st + renderAssets();
  return st + renderBank();
}
function amtInput(key, ph) {
  return `<input class="amt" type="number" inputmode="numeric" min="0" placeholder="${ph}" value="${V.amt[key]}" data-amt="${key}">`;
}
function quickAmt(key, base) {
  return `<div class="row wrap mt8">${[['100', 100], ['1千', 1000], ['1萬', 10000]].map(([l, v]) => `<button class="btn ghost xs" data-act="amtAdd" data-k="${key}" data-v="${v}">+${l}</button>`).join('')}
    <button class="btn ghost xs" data-act="amtSet" data-k="${key}" data-v="${Math.floor(base / 2)}">一半</button>
    <button class="btn ghost xs" data-act="amtSet" data-k="${key}" data-v="${Math.floor(base)}">全部</button>
    <button class="btn ghost xs" data-act="amtSet" data-k="${key}" data-v="">清除</button></div>`;
}
function renderBank() {
  if (S.level < 4) return lockCard('🐧', '企鵝銀行', 4, '把金幣存起來，就算離線也會慢慢生利息。還有定存方案與小額貸款。');
  G.bankAccrue();
  const B = S.bank;
  return `<div class="card"><h3>🐧 活期存款 <span class="sp"></span><span class="tiny">每小時 +${(SAVINGS_RATE_HOURLY * 100).toFixed(2)}%</span></h3>
    <div class="bignum">🪙 <span data-live="sav"></span></div><div class="tiny">隨存隨領，利息每秒複利累積 · 存款上限 ${fmt(G.savCap())}</div>
    <div class="mt12">${amtInput('bank', '輸入金額')}</div>${quickAmt('bank', S.coins)}
    <div class="row mt12"><button class="btn grow" data-act="deposit">存入</button><button class="btn ghost grow" data-act="withdraw">提領</button></div>
    <div class="tiny mt8">企鵝波波：「${VILLAGERS.penguin.line}」</div></div>

    <div class="card"><h3>📜 定期存款 <span class="sp"></span><span class="tiny">最多同時 4 筆</span></h3>
    <div>${amtInput('fix', '定存金額（最少 100）')}</div>${quickAmt('fix', S.coins)}
    ${DEPOSIT_PLANS.map(p => `<div class="list-row"><span class="e">${p.hours >= 24 ? '🗓️' : '⏳'}</span><div class="grow"><b style="font-size:13px">${p.name}</b>
      <div class="tiny">${p.hours} 小時 · 到期 +${(p.rate * 100).toFixed(1)}%${V.amt.fix ? ` → 🪙${fmt(Math.floor(+V.amt.fix * (1 + p.rate)))}` : ''}</div></div>
      <button class="btn blue xs" data-act="fixDep" data-p="${p.id}">申辦</button></div>`).join('')}
    ${B.deps.length ? `<div class="tiny mt12 mb8">我的定存</div>` + B.deps.map((d, k) => {
      const done = now() >= d.end;
      return `<div class="list-row"><span class="e">${done ? '💰' : '🔒'}</span><div class="grow"><b style="font-size:13px">🪙${fmt(d.amt)} → ${fmt(Math.floor(d.amt * (1 + d.rate)))}</b>
        <div class="bar mustard"><i data-pg="${d.start},${d.end}"></i></div><div class="tiny">${done ? '已到期' : '到期倒數 ' + cd(d.end)}</div></div>
        ${done ? `<button class="btn terra xs" data-act="claimDep" data-k="${k}">領取</button>` : `<button class="btn ghost xs" data-act="breakDep" data-k="${k}">解約</button>`}</div>`;
    }).join('') : ''}</div>

    <div class="card"><h3>🤝 小額貸款 <span class="sp"></span><span class="tiny">每小時 ${(LOAN_RATE_HOURLY * 100).toFixed(1)}%</span></h3>
    <div class="between"><div><div class="tiny">目前欠款</div><div class="bignum sm ${B.loan > 0 ? 'down' : ''}">🪙 ${fmt(Math.ceil(B.loan))}</div></div>
    <div style="text-align:right"><div class="tiny">可借額度</div><b>🪙 ${fmt(Math.max(0, G.loanCap() - B.loan))}</b></div></div>
    <div class="mt12">${amtInput('loan', '金額')}</div>${quickAmt('loan', B.loan > 0 ? Math.min(S.coins, Math.ceil(B.loan)) : G.loanCap() - B.loan)}
    <div class="row mt12"><button class="btn terra grow" data-act="borrow">借款</button><button class="btn ghost grow" data-act="repay">還款</button></div>
    <div class="tiny mt8">💡 借錢蓋工坊能更快賺錢，但利息會一直累積，記得早點還喔。</div></div>`;
}
function renderStocks() {
  if (S.level < 5) return lockCard('🦊', '狐狸證券', 5, '小鎮六家上市公司的股票會隨時間與新聞漲跌，持有還能領股利。低買高賣，成為投資高手！');
  const st = S.st;
  const hv = G.stockValue();
  const cost = Object.values(st.hold).reduce((a, h) => a + h.q * h.c, 0);
  const rows = Object.entries(STOCKS).map(([k, s]) => {
    const p = st.p[k], ch = p / st.h[k][0] - 1, h = st.hold[k];
    return `<div class="stock-row" data-act="stock" data-k="${k}"><span class="e">${s.emoji}</span>
      <div class="grow"><b style="font-size:14px">${s.name}</b> <span class="tiny">${k}</span>
      <div class="tiny">${h ? `持有 ${h.q} 股 · <span class="${p >= h.c ? 'up' : 'down'}">${pct(p / h.c - 1)}</span>` : s.yield ? `股利 ${(s.yield * 100).toFixed(1)}%/日` : '不配息'}</div></div>
      ${spark(st.h[k].slice(-60), 70, 28)}
      <div class="px"><b>${p.toFixed(2)}</b><span class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '▲' : '▼'}${pct(ch)}</span></div></div>`;
  }).join('');
  return `<div class="card"><div class="between"><div><div class="tiny">股票市值</div><div class="bignum sm">🪙 ${fmt(hv)}</div>
    <div class="tiny ${hv >= cost ? 'up' : 'down'}">${cost ? `未實現損益 ${hv - cost >= 0 ? '+' : ''}${fmt(hv - cost)}` : '還沒有持股'}</div></div>
    <div style="text-align:right"><div class="tiny">漲跌為近 1 小時 · 下次報價</div><b>${cd(st.last + STOCK_TICK_MS)}</b><div class="tiny">累計股利 🪙${fmt(S.stats.dividends || 0)}</div></div></div></div>
    ${rows}
    <div class="card"><h3>📰 小鎮財經新聞</h3>${st.news.length ? st.news.slice(0, 6).map(n => `<div class="news">${n.t} ${n.sym ? `<b class="${n.imp >= 0 ? 'up' : 'down'}">${n.sym} ${pct(n.imp, 0)}</b>` : ''}<div class="tiny">${new Date(n.at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>`).join('') : '<div class="muted">目前沒有新聞</div>'}</div>
    <div class="tiny center">狐狸阿凡：「${VILLAGERS.fox.line}」<br>買賣手續費 0.3% · 報價每 30 秒更新，離線時也會持續變動</div>`;
}
function stockSheet(k) {
  const s = STOCKS[k], st = S.st, p = st.p[k], h = st.hold[k];
  const q = Math.max(1, V.stockQty | 0);
  const maxBuy = Math.floor(S.coins / (p * 1.003));
  const ch = p / st.h[k][0] - 1;
  const hist = st.h[k];
  return head(s.emoji, `${s.name} <span class="tiny">${k}</span>`, s.desc) +
    `<div class="between"><div class="bignum">${p.toFixed(2)}</div><div class="${ch >= 0 ? 'up' : 'down'}"><b>${ch >= 0 ? '▲' : '▼'} ${pct(ch)}</b><div class="tiny">近 1 小時</div></div></div>
    <div class="card tight mt8">${areaChart(hist, 320, 110, ch >= 0 ? 'var(--green)' : 'var(--red)')}<div class="tiny center">最近 ${hist.length} 次報價（每 30 秒一次）</div></div>
    <div class="grid2">
      <div class="card tight"><div class="tiny">持有股數</div><b>${h ? h.q : 0}</b></div>
      <div class="card tight"><div class="tiny">平均成本</div><b>${h ? h.c.toFixed(2) : '-'}</b></div>
      <div class="card tight"><div class="tiny">市值</div><b>🪙${fmt(h ? h.q * p : 0)}</b></div>
      <div class="card tight"><div class="tiny">損益</div><b class="${h && p >= h.c ? 'up' : 'down'}">${h ? (p >= h.c ? '+' : '') + fmt(h.q * (p - h.c)) : '-'}</b></div>
    </div>
    <div class="card tight"><div class="between"><span class="tiny">交易股數</span>
      <div class="stepper"><button class="btn ghost xs" data-act="sq" data-v="-10">-10</button><button class="btn ghost xs" data-act="sq" data-v="-1">-</button>
      <input type="number" inputmode="numeric" value="${q}" data-sq="1"><button class="btn ghost xs" data-act="sq" data-v="1">+</button><button class="btn ghost xs" data-act="sq" data-v="10">+10</button></div></div>
      <div class="row wrap mt8"><button class="btn ghost xs" data-act="sqSet" data-v="${Math.max(1, Math.floor(maxBuy / 4))}">¼ 資金</button><button class="btn ghost xs" data-act="sqSet" data-v="${Math.max(1, Math.floor(maxBuy / 2))}">½ 資金</button>
      <button class="btn ghost xs" data-act="sqSet" data-v="${Math.max(1, maxBuy)}">最多可買 ${maxBuy}</button>${h ? `<button class="btn ghost xs" data-act="sqSet" data-v="${h.q}">全部持股 ${h.q}</button>` : ''}</div>
      <div class="tiny mt8">買進約 🪙${fmt(Math.ceil(p * q * 1.003))} · 賣出約 🪙${fmt(Math.floor(p * q * 0.997))}</div>
      <div class="row mt12"><button class="btn terra grow" data-act="buyStock" data-k="${k}">買進</button><button class="btn blue grow ${h ? '' : 'off'}" data-act="sellStock" data-k="${k}">賣出</button></div></div>
    <div class="tiny">${s.yield ? `💰 每日股利約 ${(s.yield * 100).toFixed(1)}%，持有就會自動入帳` : '這家公司不配發股利'} · 相關商品：${s.items.map(ie).join(' ') || '—'}</div>`;
}
function renderAssets() {
  G.bankAccrue();
  const parts = [
    ['現金', S.coins, 'var(--mustard)'], ['活存', S.bank.sav, 'var(--blue)'], ['定存', G.depTotal(), 'var(--lilac)'],
    ['股票', G.stockValue(), 'var(--terra)'], ['庫存', G.invValue(), 'var(--sage)'],
  ];
  const tot = parts.reduce((a, p) => a + p[1], 0) || 1;
  const net = G.netWorth();
  const hist = S.nh.map(x => x.v).concat([net]);
  return `<div class="card"><div class="tiny">總資產（扣除貸款）</div><div class="bignum">🪙 <span data-live="net"></span></div>
    <div class="alloc">${parts.map(p => `<i style="width:${(p[1] / tot * 100).toFixed(0)}%;background:${p[2]}"></i>`).join('')}</div>
    <div class="legend">${parts.map(p => `<span style="--c:${p[2]}">${p[0]} ${fmtC(p[1])}</span>`).join('')}${S.bank.loan > 0 ? `<span style="--c:var(--red)">貸款 -${fmtC(S.bank.loan)}</span>` : ''}</div></div>
    <div class="card"><h3>📈 資產成長 <span class="sp"></span><span class="tiny">每小時記錄</span></h3>${areaChart(hist, 320, 120)}</div>
    <div class="card"><h3>🧾 經營紀錄</h3>
    ${[['累計收入', S.stats.earned], ['利息收入', S.stats.interest], ['股利收入', S.stats.dividends], ['股票實現損益', S.stats.stockProfit], ['小舖售出', S.stats.shopSold, '件'], ['市場售出', S.stats.sold, '件'], ['完成訂單', S.stats.orders, '筆'], ['累計收成', S.stats.harvested, '份'], ['累計生產', S.stats.produced, '件']]
      .map(([n, v, u]) => `<div class="between news"><span>${n}</span><b>${u ? '' : '🪙'}${fmt(v || 0)}${u || ''}</b></div>`).join('')}</div>`;
}

/* ───────── 日記 ───────── */
function renderDiary() {
  const nj = JOURNAL.filter(j => S.level >= j.lvl && !S.jSeen[j.id]).length;
  const st = subtabs('diary', [['journal', '📔 日記', nj], ['folks', '🐾 居民'], ['ach', '🏆 成就'], ['dex', '📖 圖鑑'], ['set', '⚙️ 設定']]);
  const s = V.sub.diary;
  if (s === 'folks') return st + renderFolks();
  if (s === 'ach') return st + renderAch();
  if (s === 'dex') return st + renderDex();
  if (s === 'set') return st + renderSettings();
  JOURNAL.forEach(j => { if (S.level >= j.lvl) S.jSeen[j.id] = 1; });
  const si = G.seasonInfo();
  return st + `<div class="card"><h3>${si.s.emoji} 第 ${si.year} 年 · ${si.s.full}</h3><div class="muted">小鎮的一個季節等於現實的一天。每個季節都有當季作物（成長快 25%）與專屬祭典。下一季 ${cd(si.endsAt)} 後到來。</div>
    <div class="row mt8">${SEASONS.map((x, k) => `<span class="chip ${k === si.idx ? 'ok' : ''}">${x.emoji} ${x.name}</span>`).join('')}</div></div>` +
    JOURNAL.map(j => S.level >= j.lvl ? `<div class="journal"><h4>${j.title}</h4><p>${j.text}</p></div>` : `<div class="journal locked">🔒 Lv.${j.lvl} 時會寫下新的一頁…</div>`).join('');
}
function renderFolks() {
  return `<div class="tiny mb8">完成居民的訂單可以增加友情，每多一顆心就會收到一封信和 🍀。</div>` +
    Object.entries(VILLAGERS).map(([id, v]) => {
      const h = G.hearts(id);
      return `<div class="card tight row" data-act="letter" data-id="${id}">${vface(id, 'lg')}<div class="grow">
        <b>${v.name}</b> <span class="hearts">${heartsStr(h)}</span>
        <div class="bar terra"><i style="width:${G.heartProg(id) * 100}%"></i></div>
        <div class="tiny">喜歡：${v.likes.map(ie).join(' ')}</div></div><span class="tiny">${h ? '💌' : ''}</span></div>`;
    }).join('');
}
function letterHTML(id) {
  const v = VILLAGERS[id], h = G.hearts(id), like = it(pick(v.likes)).name, n = esc(S.player.name);
  const lines = [
    `你好，我是${v.name}。剛搬來的你，好像還有點不習慣吧？有什麼需要都可以來找我喔。`,
    `謝謝你上次送來的東西！我一直都很喜歡${like}，被你記住真的好開心。`,
    `今天散步經過你的田，作物長得好漂亮。你一定很用心在照顧它們吧。`,
    `${v.line} ……這句話是我最喜歡的，也想送給你。`,
    `我們已經是好朋友了吧？以後有好吃的${like}，記得也分我一點喔！`,
    `有時候覺得，這個小鎮因為有你，變得更溫暖了。`,
    `下次一起去山丘上看星星好嗎？我會帶熱可可。`,
    `我把你送的東西都好好收著。每次看到，心裡就軟軟的。`,
    `不管小鎮變得多大，希望我們都能像現在這樣。`,
    `寫了好多封信給你，但最想說的其實只有一句：謝謝你，一直都在。`,
  ];
  if (!h) return `<div class="letter"><span class="stamp">${vface(id, 'sm')}</span>${v.name}還在觀察你呢……多幫忙完成他的訂單吧！<br><br>「${v.line}」</div>`;
  return lines.slice(0, h).reverse().map((l, k) => `<div class="letter mb8"><span class="stamp">${vface(id, 'sm')}</span>親愛的 ${n}：<br>${l}<br><div style="text-align:right">—— ${v.name} ${k === 0 ? '<span class="tag new">最新</span>' : ''}</div></div>`).join('');
}
function renderAch() {
  const got = ACHIEVEMENTS.filter(a => S.ach[a.id]).length;
  return `<div class="card"><div class="between"><b>已解鎖 ${got} / ${ACHIEVEMENTS.length}</b><span class="tiny">完成成就可獲得 🍀</span></div><div class="bar mustard mt8"><i style="width:${got / ACHIEVEMENTS.length * 100}%"></i></div></div>` +
    ACHIEVEMENTS.map(a => {
      const v = G.condValue(a), done = !!S.ach[a.id];
      return `<div class="card tight row" style="${done ? '' : 'opacity:.75'}"><span style="font-size:28px">${done ? '🏆' : '🎖️'}</span><div class="grow"><b style="font-size:14px">${a.name}</b><div class="tiny">${a.desc}</div>
        ${done ? '' : `<div class="bar mt8"><i style="width:${Math.floor(Math.min(1, v / a.n) * 100)}%"></i></div>`}</div><span class="tiny">${done ? '✓' : '🍀' + a.clovers}</span></div>`;
    }).join('');
}
function renderDex() {
  const all = Object.keys(ITEMS), got = all.filter(id => S.dex[id]).length;
  return `<div class="card"><div class="between"><b>圖鑑 ${got} / ${all.length}</b><span class="tiny">集滿有特別獎勵</span></div><div class="bar mt8"><i style="width:${got / all.length * 100}%"></i></div></div>
    ${[['crop', '作物'], ['animal', '畜產'], ['goods', '加工品']].map(([c, nm]) => `<div class="card"><h3>${nm}</h3><div class="grid4">${all.filter(id => it(id).cat === c).map(id => S.dex[id]
      ? `<div class="item-cell" data-act="item" data-id="${id}"><span class="e">${ie(id)}</span><div class="n">${it(id).name}</div></div>`
      : `<div class="item-cell unk"><span class="e">${ie(id)}</span><div class="n">Lv.${G.itemLevel(id)}</div></div>`).join('')}</div></div>`).join('')}`;
}
function renderSettings() {
  return `<div class="card"><h3>🔊 偏好</h3>
    <div class="between news"><span>音效</span><button class="btn ${S.settings.sound ? '' : 'ghost'} sm" data-act="toggle" data-k="sound">${S.settings.sound ? '開' : '關'}</button></div>
    <div class="between news"><span>震動回饋</span><button class="btn ${S.settings.vibe ? '' : 'ghost'} sm" data-act="toggle" data-k="vibe">${S.settings.vibe ? '開' : '關'}</button></div></div>
    <div class="card"><h3>💾 存檔</h3><div class="muted">遊戲會自動存在這台裝置的瀏覽器裡。想換手機或備份時，可以匯出存檔代碼。</div>
    <div class="row mt12"><button class="btn mustard grow" data-act="qrShow">📱 顯示 QR Code</button><button class="btn mustard grow" data-act="qrScan">📷 掃描 QR Code</button></div>
    <div class="tiny mt8">換手機最快的方法：舊手機按「顯示 QR Code」，新手機按「掃描 QR Code」對著螢幕掃就好。</div>
    <div class="row mt12"><button class="btn blue grow" data-act="exportSave">匯出存檔</button><button class="btn ghost grow" data-act="importSave">匯入存檔</button></div></div>
    <div class="card"><h3>📱 加到主畫面</h3><div class="muted" style="line-height:1.7">
      <b>iPhone / iPad：</b>用 Safari 開啟 → 點「分享」→「加入主畫面」。<br>
      <b>Android：</b>用 Chrome 開啟 → 右上角「⋮」→「安裝應用程式」或「加到主畫面」。<br>
      加入後就能像 App 一樣全螢幕玩，離線也可以開啟。</div></div>
    <div class="card"><h3>🌿 玩法小提醒</h3><div class="muted" style="line-height:1.8">
      ・作物、工坊、小舖、利息、股市在離線時都會繼續運作。<br>
      ・一個季節＝現實一天，當季作物長得快，祭典商品更值錢。<br>
      ・訂單是穩定收入，小舖是被動收入，銀行和股市讓錢滾錢。<br>
      ・擺裝飾提升繁榮度 → 小舖客人變多。<br>
      ・每天記得領登入禮、做每日任務，慢慢來就好。</div></div>
    <div class="card"><h3>⚠️ 重新開始</h3><div class="muted">刪除這台裝置上的存檔，從頭開始。</div><button class="btn red sm mt8" data-act="reset">刪除存檔</button></div>
    <div class="tiny center">慢慢小鎮 Slowtown v1.0 · 用心慢慢做的小遊戲</div>`;
}

/* ───────── 開場 ───────── */
function renderIntro() {
  const p = V.intro;
  return `<div class="intro"><div class="scene">${treeSVG('tree', 'spring')}${houseSVG('home', '#d98f6c')}${animalSVG('rabbit', '#e8b4b0')}${animalSVG('bear', '#9db89a')}${treeSVG('pine', 'spring')}</div><h1>慢慢小鎮</h1><div class="sub">SLOWTOWN · 慢慢來，比較快</div>
    <div class="card"><h3>選一隻小動物當主角</h3><div class="species">${SPECIES.map(s => `<div class="opt${p.species === s.id ? ' sel' : ''}" data-act="introSp" data-id="${s.id}">${face(s.id, p.color, 'md')}<div class="s">${s.name}</div></div>`).join('')}</div>
    <h3 class="mt12">圍巾顏色</h3><div class="colors">${SCARF_COLORS.map(c => `<button class="${p.color === c ? 'on' : ''}" style="background:${c}" data-act="introColor" data-c="${c}"></button>`).join('')}</div>
    <div class="center mt12"><span class="face xl">${animalSVG(p.species, p.color)}</span></div>
    <div class="field"><label>你的名字</label><input id="in-name" maxlength="10" placeholder="例如：小米" value="${esc(p.name)}"></div>
    <div class="field"><label>小鎮的名字</label><input id="in-town" maxlength="10" placeholder="例如：午後鎮" value="${esc(p.town)}"></div>
    <button class="btn terra block mt12" style="padding:13px;font-size:16px" data-act="startGame">搬進小鎮 →</button></div>
    <div class="tiny mt12">從別台裝置搬過來？<a href="#" data-act="qrScan" style="color:var(--terra)">📷 掃描 QR Code</a> 或 <a href="#" data-act="importSave" style="color:var(--terra)">匯入存檔</a></div></div>`;
}

/* ───────── 粒子 ───────── */
function setParticles() {
  const s = G.seasonInfo().s;
  const box = $('#particles');
  if (box.dataset.s === s.id) return;
  box.dataset.s = s.id; box.innerHTML = '';
  const n = s.id === 'summer' ? 6 : 10;
  for (let k = 0; k < n; k++) {
    const d = document.createElement('span');
    d.textContent = s.particle;
    d.style.left = Math.random() * 100 + 'vw';
    d.style.animationDuration = rand(12, 22) + 's';
    d.style.animationDelay = -rand(0, 20) + 's';
    d.style.fontSize = rand(10, 18) + 'px';
    box.appendChild(d);
  }
  document.body.className = document.body.className.replace(/season-\w+/g, '').trim() + ' season-' + s.id;
}

/* ───────── 渲染 ───────── */
function viewHTML() {
  switch (V.tab) {
    case 'barn': return renderBarn();
    case 'orders': return renderOrders();
    case 'finance': return renderFinance();
    case 'diary': return renderDiary();
    default: return '';
  }
}
function refresh() {
  if (!S) return;
  setHTML($('#hud'), renderHUD());
  setHTML($('#nav'), renderNav());
  const view = $('#view');
  if (V.tab === 'town') renderTownInto(view);
  else { if (view.dataset.mode === 'town') { view.dataset.mode = ''; view._h = null; Actors.reset(); } setHTML(view, viewHTML()); }
  if (V.sheetFn) setHTML($('#sheet .sheet-body'), V.sheetFn());
  document.body.classList.toggle('night', G.isNight());
  document.body.classList.toggle('move-mode', V.moveMode);
  tickTimers();
}
function tickTimers() {
  const t = now();
  document.querySelectorAll('[data-cd]').forEach(el => { el.textContent = fmtT(+el.dataset.cd - t); });
  const live = { sav: () => fmt(S.bank.sav * Math.pow(1 + SAVINGS_RATE_HOURLY, (t - S.bank.savAt) / 3600000)), net: () => fmt(G.netWorth()) };
  document.querySelectorAll('[data-live]').forEach(el => { el.textContent = live[el.dataset.live](); });
  document.querySelectorAll('[data-pg]').forEach(el => {
    const [a, b] = el.dataset.pg.split(',').map(Number);
    el.style.width = clamp((t - a) / (b - a), 0, 1) * 100 + '%';
  });
}
UI.refresh = refresh;

/* ───────── 動作 ───────── */
const ACT = {
  closeSheet: () => UI.closeSheet(),
  closeModal: () => UI.closeModal(),
  modalYes: () => { const f = V.modalYes; V.modalYes = null; UI.closeModal(); f && f(); refresh(); },
  tab: d => { V.tab = d.t; V.moveMode = false; V.moveFrom = null; $('#view').scrollTop = 0; },
  sub: d => { V.sub[d.t] = d.s; },
  tile: d => tapTile(+d.i),
  home: () => UI.openSheet(homeSheet),
  seasonInfo: () => { V.tab = 'diary'; V.sub.diary = 'journal'; },
  claimQuest: () => { const q = G.claimQuest(); if (q) { UI.sfx('coin'); UI.confetti(['🎁', '✨', '🪙']); UI.toast(`🎁 任務完成：獲得 🪙${q.r.coins}${q.r.clovers ? ' 🍀' + q.r.clovers : ''}`); } },
  harvestAll: () => {
    const r = G.harvestAll();
    const s = Object.entries(r.got).map(([k, v]) => `+${v}${ie(k)}`).join(' ');
    if (s) { UI.sfx('pop'); UI.float(s); } else if (!r.full) UI.toast('還沒有成熟的作物');
    if (r.full) UI.toast(FAIL.full);
  },
  plantAll: d => {
    const r = G.plantAll(d.id);
    if (r.n) { UI.sfx('pop'); UI.float(`🌱×${r.n}`); } else if (!r.fail) UI.toast('沒有空的農田了');
    if (r.fail) fail(r.fail);
  },
  collectAll: () => {
    const r = G.collectAll();
    const s = Object.entries(r.got).map(([k, v]) => `+${v}${ie(k)}`).join(' ');
    if (s) { UI.sfx('pop'); UI.float(s); } else if (!r.full) UI.toast('工坊還在努力中');
    if (r.full) UI.toast(FAIL.full);
  },
  moveMode: () => { V.moveMode = !V.moveMode; V.moveFrom = null; },
  startMove: d => { UI.closeSheet(); V.tab = 'town'; V.moveMode = true; V.moveFrom = +d.i; UI.toast('點一塊空地放下'); },
  expand: () => { const r = G.expand(); if (!fail(r)) { UI.sfx('up'); UI.confetti(['🌱', '🌿', '✨']); UI.toast('🚧 土地擴建完成！多了 6 格空地'); } },
  seedBatch: d => { V.seedBatch = d.v === '1'; },
  plant: d => {
    if (V.seedBatch) { const r = G.plantAll(d.id); if (r.n) { UI.sfx('pop'); UI.toast(`種下了 ${r.n} 塊${it(d.id).name}`); } if (r.fail) fail(r.fail); UI.closeSheet(); return; }
    const r = G.plant(+d.i, d.id); if (!fail(r)) { UI.sfx('pop'); UI.closeSheet(); }
  },
  harvestOne: d => { const r = G.harvest(+d.i); if (!fail(r)) { UI.sfx('pop'); UI.float(`+${r.n} ${ie(r.id)}`); UI.closeSheet(); } },
  rushCrop: d => { const r = G.rushCrop(+d.i); if (!fail(r)) { UI.sfx('up'); UI.closeSheet(); } },
  removeCrop: d => UI.confirm('要剷除這株作物嗎？', () => { const t = S.tiles[+d.i]; delete t.crop; delete t.at; delete t.dur; delete t.w; UI.closeSheet(); }),
  buildCat: d => { V.buildCat = d.c; },
  build: d => {
    const r = G.build(+d.i, d.id);
    if (!fail(r)) { UI.sfx('up'); UI.closeSheet(); const nm = DECOS[d.id] ? DECOS[d.id].name : BUILDINGS[d.id].name; UI.float(`🔨 ${nm}`); }
  },
  make: d => { const r = G.enqueue(+d.i, d.r); if (!fail(r)) { UI.sfx('pop'); UI.float(`${ie(d.r)} 開工！`); } },
  buyMissing: d => {
    const R = RECIPES[d.r]; let spent = 0;
    for (const [k, n] of Object.entries(R.in)) {
      const lack = n - (S.inv[k] || 0);
      if (lack > 0) { const cost = G.buyPrice(k) * lack; const r = G.buy(k, lack); if (fail(r)) return; spent += cost; }
    }
    UI.sfx('coin'); UI.toast(`🛒 已補齊材料，花了 🪙${spent}`);
  },
  collect: d => { const r = G.collect(+d.i); if (r.full) UI.toast(FAIL.full); if (r.n) { UI.sfx('pop'); UI.float(Object.entries(r.got).map(([k, v]) => `+${v}${ie(k)}`).join(' ')); } },
  rushBld: d => { const r = G.rushBld(+d.i); if (!fail(r)) UI.sfx('up'); },
  upgrade: d => { const r = G.upgrade(+d.i); if (!fail(r)) { UI.sfx('up'); UI.confetti(['⭐', '✨']); UI.toast('⬆️ 升級完成！'); } },
  demolish: d => UI.confirm('確定要拆除嗎？', () => { const r = G.demolish(+d.i); if (!fail(r)) { UI.closeSheet(); UI.toast('已經拆除了'); } }),
  shelfPick: d => { V.shelfPick = +d.k; },
  shelfCancel: () => { V.shelfPick = null; },
  shelfPut: d => { const r = G.stockShelf(+d.i, V.shelfPick, d.id, 20); V.shelfPick = null; if (!fail(r)) UI.sfx('pop'); },
  unstock: d => { const r = G.unstock(+d.i, +d.k); if (r !== true) fail(r); },
  cash: d => { const c = G.collectCash(+d.i); if (c) { UI.sfx('coin'); UI.float(`+${c} 🪙`); } },
  editProfile: () => { V.edit = Object.assign({}, S.player); UI.openSheet(editSheet); },
  editSp: d => { V.edit.species = d.id; V.edit.name = $('#ed-name').value; V.edit.town = $('#ed-town').value; },
  editColor: d => { V.edit.color = d.c; V.edit.name = $('#ed-name').value; V.edit.town = $('#ed-town').value; },
  saveProfile: () => {
    V.edit.name = $('#ed-name').value.trim() || S.player.name; V.edit.town = $('#ed-town').value.trim() || S.player.town;
    S.player = V.edit; UI.closeSheet(); UI.toast('✨ 造型更新了');
  },
  item: d => UI.openSheet(() => itemSheet(d.id)),
  sell: d => { const got = G.sell(d.id, +d.n); if (got) { UI.sfx('coin'); UI.float(`+${got} 🪙`); if (!S.inv[d.id] && V.sheetFn) UI.closeSheet(); } },
  buy: d => { const r = G.buy(d.id, +d.n); if (!fail(r)) { UI.sfx('coin'); UI.float(`+${d.n} ${ie(d.id)}`); } },
  upInv: () => { const r = G.upgradeInv(); if (!fail(r)) { UI.sfx('up'); UI.toast(`📦 倉庫擴建到 ${G.invCap()} 格`); } },
  fill: d => {
    const r = G.fill(+d.k); if (!r) return fail('mat');
    UI.sfx('coin'); UI.float(`+${r.o.coins} 🪙`);
    if (r.heart) {
      const v = VILLAGERS[r.o.npc];
      UI.confetti(['❤️', '💕', '✨']);
      UI.modal(`<span class="bigic">${vface(r.o.npc, 'xl')}</span><h2>和${v.name}更親近了</h2><div class="hearts" style="font-size:16px">${heartsStr(r.heart)}</div>
        <div class="muted mt8">收到一封信和 🍀1</div><div class="mt12" style="text-align:left">${letterHTML(r.o.npc).split('</div>')[0]}</div></div>
        <div class="btns"><button class="btn" data-act="closeModal">收下</button></div>`);
    }
  },
  discard: d => UI.confirm('要拒絕這張訂單嗎？', () => G.discard(+d.k), '拒絕'),
  claimDaily: d => { if (G.claimDaily(+d.k)) { UI.sfx('coin'); UI.float('🎁'); } },
  claimBonus: () => { if (G.claimDailyBonus()) { UI.sfx('up'); UI.confetti(); UI.toast('🌟 今日任務全部完成！'); } },
  claimLogin: () => { const r = G.claimLogin(); if (r) { UI.sfx('coin'); UI.toast(`📅 第 ${r.day} 天登入禮：🪙${r.coins}${r.clovers ? ' 🍀' + r.clovers : ''}`); } },
  balloonGive: d => {
    const r = G.balloonGive(+d.k); if (!r) return fail('mat');
    if (r.done) { UI.sfx('up'); UI.confetti(['🎈', '✨', '🪙']); UI.modal(`<span class="bigic">🎈</span><h2>商隊委託完成！</h2><div class="muted">獲得 🪙${fmt(r.coins)} 與 🍀${r.clovers}</div><div class="btns"><button class="btn" data-act="closeModal">好耶</button></div>`); }
    else { UI.sfx('pop'); UI.float(`交出 ${r.n} 個`); }
  },
  amtAdd: d => { V.amt[d.k] = String((+V.amt[d.k] || 0) + +d.v); },
  amtSet: d => { V.amt[d.k] = d.v === '' ? '' : String(Math.max(0, +d.v)); },
  deposit: () => { const r = G.deposit(+V.amt.bank || 0); if (!fail(r)) { UI.sfx('coin'); UI.toast(`🐧 存入 🪙${fmt(+V.amt.bank)}`); V.amt.bank = ''; } },
  withdraw: () => { const a = +V.amt.bank || 0; if (G.withdraw(a)) { UI.sfx('coin'); UI.toast('🐧 提領完成'); V.amt.bank = ''; } else UI.toast('請輸入提領金額'); },
  fixDep: d => { const r = G.fixDeposit(d.p, +V.amt.fix || 0); if (!fail(r)) { UI.sfx('coin'); UI.toast('📜 定存申辦完成'); V.amt.fix = ''; } },
  claimDep: d => { const b = G.claimDeposit(+d.k); if (b) { UI.sfx('coin'); UI.float(`+${fmt(b)} 🪙`); } },
  breakDep: d => UI.confirm('提前解約只能拿回本金，確定嗎？', () => G.claimDeposit(+d.k), '解約'),
  borrow: () => { const r = G.borrow(+V.amt.loan || 0); if (r === false) return UI.toast('請輸入金額'); if (!fail(r)) { UI.sfx('coin'); UI.toast('🤝 借款入帳'); V.amt.loan = ''; } },
  repay: () => { const r = G.repay(+V.amt.loan || S.bank.loan); if (!fail(r)) { UI.sfx('coin'); UI.toast('🤝 還款完成'); V.amt.loan = ''; } },
  stock: d => { V.stockQty = 1; UI.openSheet(() => stockSheet(d.k)); },
  sq: d => { V.stockQty = Math.max(1, (V.stockQty | 0) + +d.v); },
  sqSet: d => { V.stockQty = Math.max(1, +d.v); },
  buyStock: d => { const r = G.buyStock(d.k, V.stockQty); if (!fail(r)) { UI.sfx('coin'); UI.toast(`📈 買進 ${STOCKS[d.k].name} ${V.stockQty} 股`); } },
  sellStock: d => { const r = G.sellStock(d.k, V.stockQty); if (r) { UI.sfx('coin'); UI.toast(`💰 賣出得 🪙${fmt(r.got)}（${r.profit >= 0 ? '賺' : '賠'} ${fmt(Math.abs(r.profit))}）`); } },
  chat: d => {
    const a = Actors.list.find(x => x.npc === d.v); if (!a) return;
    const v = VILLAGERS[d.v], h = G.hearts(d.v);
    Actors.say(a, h >= 3 ? `${v.line}` : pick([v.line, `喜歡${it(pick(v.likes)).name}${ie(pick(v.likes))}`, '你好呀～']), 3200);
    UI.sfx('pop');
  },
  letter: d => UI.openSheet(() => head(vface(d.id, 'lg'), VILLAGERS[d.id].name + '的信', `友情 ${heartsStr(G.hearts(d.id))}`) + letterHTML(d.id)),
  toggle: d => { S.settings[d.k] = !S.settings[d.k]; },
  exportSave: async () => {
    V.exportCode = await G.exportSave();
    UI.openSheet(() => head('💾', '匯出存檔', '把存檔帶到另一台手機或平板') +
      `<div class="card tight"><div class="between"><b>存檔代碼</b><span class="tiny">共 ${V.exportCode.length.toLocaleString()} 字（已壓縮）</span></div>
        <div class="tiny mt8">不用自己選取，按下面的按鈕就好</div>
        <button class="btn mustard block mt12" data-act="qrShow">📱 顯示 QR Code（給另一台掃）</button>
        <button class="btn terra block mt8" data-act="copyCode">📋 一鍵複製代碼</button>
        ${navigator.share ? `<button class="btn blue block mt8" data-act="shareSave">📤 傳到 LINE／訊息／AirDrop</button>` : ''}
        <button class="btn ghost block mt8" data-act="downloadSave">💾 存成檔案</button></div>
      <div class="card tight"><b style="font-size:13px">怎麼搬到新裝置？</b><div class="tiny mt8" style="line-height:1.8">
        ① 按「一鍵複製」或「傳到 LINE」，把代碼傳給自己<br>② 在新裝置打開遊戲 → 日記 → 設定 → 匯入存檔<br>③ 按「從剪貼簿貼上」或「選擇存檔檔案」就完成了</div></div>
      <details class="tiny"><summary>顯示代碼文字</summary><textarea readonly style="width:100%;height:110px;border-radius:12px;border:1.5px solid var(--line2);padding:8px;font-size:10px;background:var(--card);margin-top:6px">${V.exportCode}</textarea></details>`);
  },
  qrShow: (d, el, e) => { e && e.preventDefault(); qrShow(); },
  qrScan: (d, el, e) => { e && e.preventDefault(); qrScan(); },
  copyCode: async () => {
    const ok = await copyText(V.exportCode);
    UI.toast(ok ? '✓ 已複製！到新裝置貼上就可以了' : '這個瀏覽器不讓我自動複製，請改用「存成檔案」或展開代碼手動複製');
  },
  shareSave: async () => {
    const name = `慢慢小鎮存檔-${new Date().toISOString().slice(0, 10)}.txt`;
    try {
      const file = new File([V.exportCode], name, { type: 'text/plain' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: '慢慢小鎮存檔' });
      else await navigator.share({ title: '慢慢小鎮存檔', text: V.exportCode });
    } catch (e) { if (e && e.name !== 'AbortError') UI.toast('分享沒有成功，請改用一鍵複製'); }
  },
  downloadSave: () => {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([V.exportCode], { type: 'text/plain' }));
      a.download = `慢慢小鎮存檔-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      UI.toast('💾 已存檔（iPhone 會在「檔案」App 的下載項目）');
    } catch (e) { UI.toast('沒辦法存檔，請改用一鍵複製'); }
  },
  importSave: (d, el, e) => {
    e && e.preventDefault();
    UI.openSheet(() => head('📥', '匯入存檔', '會覆蓋這台裝置目前的進度') +
      `<button class="btn mustard block" data-act="qrScan">📷 掃描 QR Code</button>
      <button class="btn terra block mt8" data-act="pasteImport">📋 從剪貼簿貼上並匯入</button>
      <label class="btn blue block mt8" style="position:relative;overflow:hidden">📂 選擇存檔檔案<input id="imp-file" type="file" accept=".txt,.json,text/plain" style="position:absolute;inset:0;opacity:0"></label>
      <details class="tiny mt12"><summary>或手動貼上代碼</summary>
      <textarea id="imp" style="width:100%;height:110px;border-radius:12px;border:1.5px solid var(--line2);padding:8px;font-size:12px;background:var(--card);margin-top:6px"></textarea>
      <button class="btn ghost block mt8" data-act="doImport">匯入</button></details>`);
  },
  pasteImport: async () => {
    try { const t = await navigator.clipboard.readText(); await runImport(t); }
    catch (e) { UI.toast('讀不到剪貼簿，請展開「手動貼上代碼」，長按貼上'); }
  },
  doImport: async () => { await runImport($('#imp').value); },
  reset: () => UI.confirm('真的要刪除存檔嗎？所有進度都會消失！', () => UI.confirm('最後確認：刪除後無法復原', () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S = null; location.reload(); }, '刪除'), '刪除'),
  introSp: d => { V.intro.species = d.id; syncIntro(); },
  introColor: d => { V.intro.color = d.c; syncIntro(); },
  startGame: () => {
    syncIntro();
    const p = V.intro;
    G.newGame({ species: p.species, color: p.color, name: p.name.trim() || '小米', town: p.town.trim() || '午後鎮' });
    UI.modal(`<span class="bigic"><span class="face xl">${animalSVG(S.player.species, S.player.color)}</span></span><h2>歡迎來到${esc(S.player.town)}！</h2>
      <div class="muted" style="line-height:1.8">這裡有一間小屋、幾塊田和一點點積蓄。<br>種田、開工坊、做生意、存錢投資，<br>把這裡慢慢變成你喜歡的樣子吧。</div>
      <div class="tiny mt12">💡 小麥快熟了，點點看閃亮的作物 ✨</div>
      <div class="btns"><button class="btn terra" data-act="closeModal">開始生活</button></div>`);
    boot();
  },
};
/* ───────── QR Code 同步 ───────── */
const _scripts = {};
function loadScript(src) {
  return _scripts[src] || (_scripts[src] = new Promise((ok, no) => {
    const el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = () => { delete _scripts[src]; no(new Error('load ' + src)); };
    document.head.appendChild(el);
  }));
}
const QR_CHUNK = 280;
async function qrShow() {
  try { await loadScript('js/vendor/qrcode.js'); } catch (e) { return UI.toast('QR 元件載入失敗，請連上網路再試一次'); }
  const code = await G.exportSave();
  const id = Math.random().toString(36).slice(2, 6);
  const n = Math.ceil(code.length / QR_CHUNK);
  const svgs = [];
  for (let i = 0; i < n; i++) {
    const q = qrcode(0, 'M');
    q.addData(`SLQ1|${id}|${i}|${n}|${code.slice(i * QR_CHUNK, (i + 1) * QR_CHUNK)}`);
    q.make();
    svgs.push(q.createSvgTag({ cellSize: 4, margin: 3, scalable: true }));
  }
  let k = 0, paused = false, speed = 1100;
  const html = head('📱', '用 QR Code 同步', `共 ${n} 張，會自動輪播`) +
    `<div class="qrbox" id="qr-img"></div>
    <div class="qrdots" id="qr-dots">${svgs.map((_, i) => `<i data-k="${i}"></i>`).join('')}</div>
    <div class="row mt8"><button class="btn ghost sm grow" id="qr-pause">⏸ 暫停</button><button class="btn ghost sm grow" id="qr-speed">🐢 慢一點</button></div>
    <div class="card tight mt12"><div class="tiny" style="line-height:1.8">① 在新的手機或平板打開慢慢小鎮<br>② 日記 → 設定 → 📷 掃描 QR Code（第一次開啟時在開場畫面下方）<br>③ 鏡頭對準這個畫面，等全部 ${n} 張都收到就完成了<br>💡 把這台螢幕調亮一點會比較好掃</div></div>`;
  UI.openSheet(() => html);
  const draw = () => {
    const box = $('#qr-img'); if (!box) return;
    box.innerHTML = svgs[k];
    document.querySelectorAll('#qr-dots i').forEach((d, i) => d.classList.toggle('on', i === k));
  };
  draw();
  const tick = () => { if (!paused) { k = (k + 1) % n; draw(); } V.qrTimer = setTimeout(tick, speed); };
  if (n > 1) V.qrTimer = setTimeout(tick, speed);
  $('#qr-pause').onclick = () => { paused = !paused; $('#qr-pause').textContent = paused ? '▶ 繼續' : '⏸ 暫停'; };
  $('#qr-speed').onclick = () => { speed = speed > 1500 ? 1100 : 2200; $('#qr-speed').textContent = speed > 1500 ? '🐇 快一點' : '🐢 慢一點'; };
  $('#qr-dots').onclick = e => { const i = e.target.dataset && e.target.dataset.k; if (i !== undefined) { k = +i; paused = true; $('#qr-pause').textContent = '▶ 繼續'; draw(); } };
  let lock = null;
  try { if (navigator.wakeLock) lock = await navigator.wakeLock.request('screen'); } catch (e) { /* 不支援就算了 */ }
  V.onSheetClose = () => { clearTimeout(V.qrTimer); if (lock) lock.release().catch(() => {}); };
}
async function qrScan() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return UI.toast('這個瀏覽器不能使用相機，請用匯入存檔代碼的方式');
  const useNative = 'BarcodeDetector' in window;
  let detector = null;
  if (useNative) { try { detector = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { detector = null; } }
  if (!detector) { try { await loadScript('js/vendor/jsQR.js'); } catch (e) { return UI.toast('掃描元件載入失敗，請連上網路再試一次'); } }
  const html = head('📷', '掃描 QR Code', '對準另一台裝置上的 QR Code') +
    `<div class="scanbox"><video id="qr-video" playsinline muted autoplay></video><div class="scanframe"></div></div>
    <div class="center mt8"><b id="qr-status">正在開啟相機…</b></div>
    <div class="qrdots" id="qr-got"></div>
    <div class="tiny center mt8">QR Code 會自動輪播，拿穩等它全部收到就好</div>`;
  UI.openSheet(() => html);
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
  catch (e) { $('#qr-status').textContent = '沒辦法開啟相機，請允許相機權限'; return; }
  const video = $('#qr-video');
  if (!video) { stream.getTracks().forEach(t => t.stop()); return; }
  video.srcObject = stream; try { await video.play(); } catch (e) { /* iOS 會自動播放 */ }
  $('#qr-status').textContent = '對準 QR Code…';
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
  let parts = {}, cur = null, total = 0, done = false, raf = 0, last = 0;
  const stop = () => { done = true; cancelAnimationFrame(raf); stream.getTracks().forEach(t => t.stop()); };
  V.onSheetClose = stop;
  const show = () => {
    $('#qr-got').innerHTML = Array.from({ length: total }, (_, i) => `<i class="${parts[i] !== undefined ? 'on' : ''}"></i>`).join('');
    $('#qr-status').textContent = `已收到 ${Object.keys(parts).length} / ${total}`;
  };
  const finish = async code => {
    stop(); UI.sfx('up'); $('#qr-status').textContent = '✓ 全部收到了！';
    const go = async () => { V.onSheetClose = null; await runImport(code); };
    if (S) { UI.closeSheet(); UI.confirm('要用掃到的存檔覆蓋這台的進度嗎？', go, '覆蓋'); }
    else go();
  };
  const handle = text => {
    if (!text || done) return;
    if (/^ST[12]\./.test(text)) return finish(text);
    const m = /^SLQ1\|(\w+)\|(\d+)\|(\d+)\|(.*)$/s.exec(text);
    if (!m) return;
    const [, id, i, n, chunk] = m;
    if (id !== cur) { cur = id; parts = {}; total = +n; }
    if (parts[+i] === undefined) { parts[+i] = chunk; UI.sfx('pop'); show(); }
    if (Object.keys(parts).length === total) finish(Array.from({ length: total }, (_, k) => parts[k]).join(''));
  };
  const loop = async t => {
    if (done) return;
    raf = requestAnimationFrame(loop);
    if (t - last < 120 || video.readyState < 2) return;
    last = t;
    try {
      if (detector) {
        const codes = await detector.detect(video);
        codes.forEach(c => handle(c.rawValue));
      } else {
        const w = 640, h = Math.round(video.videoHeight / video.videoWidth * w) || 480;
        canvas.width = w; canvas.height = h;
        ctx.drawImage(video, 0, 0, w, h);
        const r = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
        if (r) handle(r.data);
      }
    } catch (e) { /* 這一格掃不到就算了 */ }
  };
  raf = requestAnimationFrame(loop);
}
UI.qrHandleForTest = null;

async function copyText(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (e) { /* 改用舊方法 */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.readOnly = true; ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}
async function runImport(code) {
  if (!code || code.trim().length < 20) return UI.toast('沒有找到存檔代碼');
  try { await G.importSave(code); UI.closeSheet(); Actors.reset(); $('#view').dataset.mode = ''; UI.toast('✓ 存檔匯入成功，歡迎回來！'); boot(); }
  catch (e) { UI.toast('代碼好像不完整，請重新複製一次'); }
}
document.addEventListener('change', e => {
  if (e.target.id !== 'imp-file' || !e.target.files[0]) return;
  const r = new FileReader();
  r.onload = () => runImport(r.result);
  r.readAsText(e.target.files[0]);
});
function syncIntro() {
  const n = $('#in-name'), t = $('#in-town');
  if (n) V.intro.name = n.value; if (t) V.intro.town = t.value;
  if (!S) { $('#view').innerHTML = renderIntro(); }
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const f = ACT[el.dataset.act];
  if (!f) return;
  f(el.dataset, el, e);
  if (S) { refresh(); G.save(); }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.amt) { V.amt[el.dataset.amt] = el.value; }
  if (el.dataset.sq) { V.stockQty = Math.max(1, parseInt(el.value) || 1); }
});
document.addEventListener('change', () => { if (S) refresh(); });
document.addEventListener('focusout', () => { setTimeout(() => { if (S) refresh(); }, 50); });

/* ───────── 啟動 ───────── */
let loopId = null;
function loop() {
  if (!S) return;
  const r = G.update();
  if (r.daily === 'new') showLogin();
  if (r.season) {
    UI.confetti([r.season.s.particle, '✨']);
    UI.modal(`<span class="bigic">${r.season.s.emoji}</span><h2>${r.season.s.full}來了</h2><div class="muted">第 ${r.season.year} 年 · ${r.season.s.fest}開始！<br>${r.season.s.festItems.map(ie).join(' ')} 訂單獎勵 +30%、售價 +20%</div><div class="btns"><button class="btn" data-act="closeModal">好的</button></div>`);
    setParticles();
  }
  Actors.tick();
  (r.ach || []).forEach(a => { UI.sfx('up'); UI.toast(`🏆 成就解鎖「${a.name}」獲得 🍀${a.clovers}`); });
  refresh();
}
function showLogin() {
  if (S.login.claimed) return;
  const r = G.loginReward();
  UI.modal(`<span class="bigic" data-login>📅</span><h2>早安，${esc(S.player.name)}</h2>
    <div class="muted">連續登入第 ${S.login.streak} 天</div>
    <div class="bignum mt8">🪙 ${r.coins}${r.clovers ? ` · 🍀 ${r.clovers}` : ''}</div>
    <div class="quote mt12">「${QUOTES[Math.floor(now() / 86400000) % QUOTES.length]}」</div>
    <div class="btns"><button class="btn terra" data-act="claimLoginModal">領取</button></div>`);
}
ACT.claimLoginModal = () => { ACT.claimLogin(); UI.closeModal(); };

function welcomeBack(before) {
  const away = now() - (S.lastSeen || now());
  if (away < 5 * 60000) return;
  const ds = k => (S.stats[k] || 0) - (before[k] || 0);
  let crops = 0, goods = 0, cash = 0;
  S.tiles.forEach(t => {
    if (!t) return;
    if (t.t === 'plot' && G.cropReady(t)) crops++;
    if (t.q) goods += G.readyCount(t);
    if (t.shelf) cash += Math.floor(t.cash);
  });
  const lines = [];
  if (crops) lines.push(`🌾 ${crops} 塊田已經成熟`);
  if (goods) lines.push(`📦 工坊做好了 ${goods} 件商品`);
  if (ds('shopSold')) lines.push(`🏪 小舖賣出 ${ds('shopSold')} 件，收銀機有 🪙${fmt(cash)}`);
  if (ds('interest') >= 1) lines.push(`🐧 存款生了 🪙${fmt(ds('interest'))} 利息`);
  if (ds('dividends') >= 1) lines.push(`🦊 收到股利 🪙${fmt(ds('dividends'))}`);
  if (!lines.length) return;
  UI.modal(`<span class="bigic"><span class="face xl">${animalSVG(S.player.species, S.player.color)}</span></span><h2>歡迎回來！</h2><div class="muted">你離開了 ${fmtT(away)}，小鎮一直在慢慢運轉：</div>
    <div class="card tight mt12" style="text-align:left;line-height:2;font-size:13px">${lines.join('<br>')}</div>
    <div class="btns"><button class="btn" data-act="closeModal">去看看</button></div>`);
}

function boot() {
  $('#hud').style.display = ''; $('#nav').style.display = '';
  const before = Object.assign({}, S.stats);
  G.bankAccrue();
  const r = G.update();
  setParticles();
  welcomeBack(before);
  if (r.daily === 'new' || !S.login.claimed) showLogin();
  refresh();
  clearInterval(loopId);
  loopId = setInterval(loop, 1000);
}
function init() {
  if (G.load()) boot();
  else {
    $('#hud').style.display = 'none'; $('#nav').style.display = 'none';
    $('#view').innerHTML = renderIntro();
  }
}
setInterval(() => { if (S && !document.hidden) { S.lastSeen = now(); G.save(); } }, 5000);
document.addEventListener('visibilitychange', () => {
  if (!S) return;
  if (document.hidden) { S.lastSeen = now(); G.save(); }
  else { const before = Object.assign({}, S.stats); G.bankAccrue(); G.update(); welcomeBack(before); refresh(); }
});
window.addEventListener('pagehide', () => { if (S) { S.lastSeen = now(); G.save(); } });
init();
