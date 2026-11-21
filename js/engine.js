/* 慢慢小鎮 Slowtown — 遊戲邏輯 */
'use strict';

let S = null;               // 遊戲存檔狀態
const G = {};               // 引擎函式命名空間
const now = () => Date.now();
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const todayKey = (t = now()) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/* recipe → 生產建築 */
const RECIPE_BLD = {};
for (const [bid, b] of Object.entries(BUILDINGS)) (b.recipes || []).forEach(r => { RECIPE_BLD[r] = bid; });

G.itemLevel = id => CROPS[id] ? CROPS[id].lvl : (RECIPES[id] ? RECIPES[id].lvl : 1);

/* ───────── 建立 / 存讀檔 ───────── */
G.newGame = function (player) {
  const t = now();
  S = {
    v: 1, created: t, player, coins: 200, clovers: 5, xp: 0, level: 1,
    rows: START_ROWS, tiles: new Array(COLS * MAX_ROWS).fill(null),
    inv: { wheat: 6, carrot: 2 }, invLvl: 0, dex: { wheat: 1, carrot: 1 },
    lastSeed: 'wheat',
    orders: [], market: { m: {}, ev: {}, last: t },
    bank: { sav: 0, savAt: t, deps: [], loan: 0, loanAt: t },
    st: null, stats: {}, friend: {}, quest: 0, ach: {}, jSeen: {},
    daily: null, login: { last: null, streak: 0 }, balloon: { next: t },
    nh: [], seasonIdx: 0, settings: { sound: true, vibe: true }, tut: 0,
  };
  // 初始小鎮
  S.tiles[0] = { t: 'bld', id: 'home', lvl: 1 };
  [7, 8, 13, 14].forEach((i, k) => { S.tiles[i] = { t: 'plot', crop: 'wheat', at: t - k * 15000, dur: 45000 }; });
  S.tiles[9] = { t: 'plot' }; S.tiles[15] = { t: 'plot' };
  S.tiles[5] = { t: 'deco', id: 'tree' };
  S.tiles[18] = { t: 'deco', id: 'tulip' };
  G.initStocks();
  for (let k = 0; k < 6; k++) S.orders.push(k < 3 ? G.genOrder() : { wait: t + k * 20000 });
  G.checkDaily(true);
  G.recordNet(true);
  G.save();
};

G.save = function () {
  if (!S) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { console.warn('save failed', e); }
};
G.load = function () {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    S = JSON.parse(raw);
    G.migrate();
    return true;
  } catch (e) { console.warn(e); return false; }
};
G.migrate = function () {
  S.stats = S.stats || {}; S.friend = S.friend || {}; S.ach = S.ach || {}; S.jSeen = S.jSeen || {};
  S.settings = Object.assign({ sound: true, vibe: true }, S.settings || {});
  S.market = S.market || { m: {}, ev: {}, last: now() };
  S.balloon = S.balloon || { next: now() };
  if (!S.st) G.initStocks();
  S.st.h = S.st.h || {}; S.st.open = S.st.open || {}; S.st.news = S.st.news || []; S.st.hold = S.st.hold || {};
  for (const k of Object.keys(STOCKS)) {
    if (!S.st.p[k]) { S.st.p[k] = STOCKS[k].price; S.st.f[k] = STOCKS[k].price; }
    if (!S.st.h[k] || S.st.h[k].length < 2) { const p = S.st.p[k]; S.st.h[k] = Array.from({ length: 40 }, (_, i) => +(p * (1 + Math.sin(i / 4) * 0.01)).toFixed(2)); S.st.h[k].push(+p.toFixed(2)); }
    if (!S.st.open[k]) S.st.open[k] = S.st.p[k];
  }
  S.nh = S.nh || [];
  while (S.tiles.length < COLS * MAX_ROWS) S.tiles.push(null);
};
/* 存檔代碼：去掉可重建的資料 → 壓縮 → base64url，約為原本的 1/10 */
const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = str => { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const bin = atob(str); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
async function pipeBytes(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}
G.slimSave = function () {
  const o = JSON.parse(JSON.stringify(S));
  o.st.h = {}; o.st.news = (o.st.news || []).slice(0, 3); o.nh = (o.nh || []).slice(-24);
  return JSON.stringify(o);
};
G.exportSave = async function () {
  const bytes = new TextEncoder().encode(G.slimSave());
  if (typeof CompressionStream !== 'undefined') {
    try { return 'ST2.' + b64u(await pipeBytes(bytes, new CompressionStream('deflate-raw'))); } catch (e) { /* 改用不壓縮 */ }
  }
  return 'ST1.' + b64u(bytes);
};
G.importSave = async function (code) {
  code = String(code).replace(/\s+/g, '');
  let json;
  if (code.startsWith('ST2.')) {
    if (typeof DecompressionStream === 'undefined') throw new Error('這個瀏覽器太舊，無法讀取壓縮存檔');
    json = new TextDecoder().decode(await pipeBytes(unb64u(code.slice(4)), new DecompressionStream('deflate-raw')));
  } else if (code.startsWith('ST1.')) json = new TextDecoder().decode(unb64u(code.slice(4)));
  else json = decodeURIComponent(escape(atob(code)));      // 舊版長代碼
  const obj = JSON.parse(json);
  if (!obj || !obj.player || !obj.tiles) throw new Error('bad save');
  S = obj; G.migrate(); G.save();
};

/* ───────── 統計 / 等級 ───────── */
G.stat = (k, n = 1) => { S.stats[k] = (S.stats[k] || 0) + n; };
G.xpNeed = lvl => Math.round(20 + 16 * Math.pow(lvl - 1, 1.5));
G.addXP = function (n) {
  S.xp += Math.round(n);
  let up = false;
  while (S.xp >= G.xpNeed(S.level)) { S.xp -= G.xpNeed(S.level); S.level++; up = true; G.onLevelUp(); }
  return up;
};
G.onLevelUp = function () {
  S.clovers += 1;
  S.coins += 30 * S.level;
  UI && UI.levelUp && UI.levelUp(S.level);
};
G.addCoins = function (n) { S.coins += Math.round(n); if (n > 0) G.stat('earned', Math.round(n)); };

/* ───────── 季節 ───────── */
G.seasonInfo = function (t = now()) {
  const el = t - S.created;
  const n = Math.floor(el / SEASON_MS);
  return { idx: n % 4, s: SEASONS[n % 4], year: Math.floor(n / 4) + 1, endsAt: S.created + (n + 1) * SEASON_MS, count: n };
};
G.isFest = id => G.seasonInfo().s.festItems.includes(id);
G.isNight = () => { const h = new Date().getHours(); return h >= 18 || h < 6; };

/* ───────── 倉庫 ───────── */
G.invCount = () => Object.values(S.inv).reduce((a, b) => a + b, 0);
G.invCap = () => 80 + S.invLvl * 40;
G.invUpCost = () => Math.round(200 * Math.pow(S.invLvl + 1, 1.6));
G.has = (id, n = 1) => (S.inv[id] || 0) >= n;
G.give = function (id, n) {
  S.inv[id] = (S.inv[id] || 0) + n;
  if (!S.dex[id]) { S.dex[id] = 1; UI && UI.toast && UI.toast(`📖 圖鑑新增：${ITEMS[id].emoji} ${ITEMS[id].name}`); }
};
G.take = function (id, n) { S.inv[id] -= n; if (S.inv[id] <= 0) delete S.inv[id]; };
G.space = () => G.invCap() - G.invCount();
G.upgradeInv = function () {
  const c = G.invUpCost();
  if (S.coins < c) return 'coins';
  S.coins -= c; S.invLvl++; return true;
};

/* ───────── 地圖 ───────── */
G.count = id => S.tiles.filter(t => t && t.t === 'bld' && t.id === id).length;
G.plotCount = () => S.tiles.filter(t => t && t.t === 'plot').length;
G.plotCost = () => 10 + G.plotCount() * 6;
G.bldCost = id => {
  if (id === 'plot') return G.plotCost();
  const b = BUILDINGS[id];
  return Math.round(b.cost * (1 + G.count(id) * 0.6));
};
G.expandCost = () => Math.round(300 * Math.pow(1.55, S.rows - START_ROWS));
G.expandLvl = () => 2 + (S.rows - START_ROWS) * 2;
G.expand = function () {
  if (S.rows >= MAX_ROWS) return 'max';
  if (S.level < G.expandLvl()) return 'lvl';
  const c = G.expandCost();
  if (S.coins < c) return 'coins';
  S.coins -= c; S.rows++; G.stat('expand'); G.addXP(10 + S.rows * 2);
  return true;
};

G.population = () => S.tiles.reduce((a, t) => a + (t && t.t === 'bld' && BUILDINGS[t.id].res ? BUILDINGS[t.id].res * (t.lvl || 1) : 0), 0);
G.build = function (i, id) {
  if (S.tiles[i]) return 'occupied';
  if (id === 'plot') {
    const c = G.plotCost(); if (S.coins < c) return 'coins';
    S.coins -= c; S.tiles[i] = { t: 'plot' }; return true;
  }
  if (DECOS[id]) {
    const d = DECOS[id];
    if (S.level < d.lvl) return 'lvl';
    if (S.coins < d.cost) return 'coins';
    S.coins -= d.cost; S.tiles[i] = { t: 'deco', id }; G.addXP(Math.ceil(d.pros / 2)); return true;
  }
  const b = BUILDINGS[id];
  if (S.level < b.lvl) return 'lvl';
  if (b.max && G.count(id) >= b.max) return 'max';
  if (b.pop && G.population() < b.pop) return 'pop';
  const c = G.bldCost(id);
  if (S.coins < c) return 'coins';
  S.coins -= c;
  S.tiles[i] = id === 'shop' ? { t: 'bld', id, lvl: 1, shelf: [null, null, null], cash: 0, last: now(), ptr: 0 }
             : b.cat === 'house' ? { t: 'bld', id, lvl: 1 }
             : { t: 'bld', id, lvl: 1, q: [] };
  G.addXP(Math.round(b.cost / 20));
  return true;
};
G.move = function (from, to) {
  if (from === to || S.tiles[to] || !S.tiles[from]) return false;
  S.tiles[to] = S.tiles[from]; S.tiles[from] = null; return true;
};
G.refund = function (i) {
  const t = S.tiles[i]; if (!t) return 0;
  if (t.t === 'deco') return Math.floor(DECOS[t.id].cost * 0.5);
  if (t.t === 'plot') return 5;
  if (t.id === 'home') return 0;
  return Math.floor(BUILDINGS[t.id].cost * 0.4);
};
G.demolish = function (i) {
  const t = S.tiles[i]; if (!t) return false;
  if (t.t === 'bld' && t.id === 'home') return 'home';
  if (t.t === 'plot' && t.crop) return 'busy';
  if (t.t === 'bld' && t.q && t.q.length) return 'busy';
  if (t.t === 'bld' && t.id === 'shop') {
    if (t.shelf.some(s => s)) return 'busy';
    G.addCoins(t.cash);
  }
  G.addCoins(G.refund(i)); S.tiles[i] = null; return true;
};

/* ───────── 種田 ───────── */
G.cropDur = function (id) {
  const c = CROPS[id], s = G.seasonInfo().s.id;
  let m = 1;
  if (c.fav === s) m = 0.75; else if (s === 'winter') m = 1.2;
  return Math.round(c.time * 1000 * m);
};
G.plant = function (i, id) {
  const t = S.tiles[i];
  if (!t || t.t !== 'plot' || t.crop) return 'bad';
  const c = CROPS[id];
  if (S.level < c.lvl) return 'lvl';
  if (S.coins < c.seed) return 'coins';
  S.coins -= c.seed;
  t.crop = id; t.at = now(); t.dur = G.cropDur(id); t.w = 0;
  S.lastSeed = id; G.stat('planted');
  return true;
};
G.cropReady = t => t && t.crop && now() >= t.at + t.dur;
G.cropProg = t => clamp((now() - t.at) / t.dur, 0, 1);
G.water = function (i) {
  const t = S.tiles[i];
  if (!t || !t.crop || t.w || G.cropReady(t)) return false;
  const rem = t.at + t.dur - now();
  t.dur -= Math.round(rem * 0.2); t.w = 1;
  G.stat('watered'); G.addXP(0.5);
  return true;
};
G.harvest = function (i) {
  const t = S.tiles[i];
  if (!G.cropReady(t)) return 'notready';
  const c = CROPS[t.crop];
  const y = c.yield + (t.w && Math.random() < 0.25 ? 1 : 0);
  if (G.space() < y) return 'full';
  const id = t.crop;
  G.give(id, y); G.addXP(ITEMS[id].xp * y);
  G.stat('harvested', y);
  delete t.crop; delete t.at; delete t.dur; delete t.w;
  return { id, n: y };
};
G.harvestAll = function () {
  let got = {}, full = false;
  S.tiles.forEach((t, i) => {
    if (t && t.t === 'plot' && G.cropReady(t)) {
      const r = G.harvest(i);
      if (r === 'full') full = true; else if (r && r.id) got[r.id] = (got[r.id] || 0) + r.n;
    }
  });
  return { got, full };
};
G.plantAll = function (id) {
  let n = 0, fail = null;
  for (let i = 0; i < S.rows * COLS; i++) {
    const t = S.tiles[i];
    if (t && t.t === 'plot' && !t.crop) {
      const r = G.plant(i, id);
      if (r === true) n++; else { fail = r; break; }
    }
  }
  return { n, fail };
};

/* ───────── 生產 ───────── */
G.slots = t => (BUILDINGS[t.id].cat === 'shop' ? [3, 4, 5] : [2, 3, 4])[t.lvl - 1];
G.speed = t => [1, 0.85, 0.7][t.lvl - 1];
G.upCost = t => Math.round(BUILDINGS[t.id].cost * 1.5 * t.lvl);
G.upgrade = function (i) {
  const t = S.tiles[i];
  if (!t || t.t !== 'bld' || t.id === 'home') return 'bad';
  if (t.lvl >= 3) return 'max';
  const need = t.lvl === 1 ? 8 : 15;
  if (S.level < need) return 'lvl';
  const c = G.upCost(t);
  if (S.coins < c) return 'coins';
  S.coins -= c; t.lvl++;
  if (t.shelf) t.shelf.push(null);
  G.stat('upgrades'); G.addXP(c / 25);
  return true;
};
G.canMake = function (r) {
  return Object.entries(RECIPES[r].in).every(([k, n]) => G.has(k, n));
};
G.enqueue = function (i, r) {
  const t = S.tiles[i];
  if (!t || !t.q) return 'bad';
  if (S.level < RECIPES[r].lvl) return 'lvl';
  if (t.q.length >= G.slots(t)) return 'slots';
  if (!G.canMake(r)) return 'mat';
  Object.entries(RECIPES[r].in).forEach(([k, n]) => G.take(k, n));
  const last = t.q.length ? t.q[t.q.length - 1].end : 0;
  const dur = Math.round(RECIPES[r].time * 1000 * G.speed(t));
  const start = Math.max(now(), last);
  t.q.push({ r, start, end: start + dur });
  return true;
};
G.readyCount = t => t.q ? t.q.filter(x => x.end <= now()).length : 0;
G.collect = function (i) {
  const t = S.tiles[i];
  if (!t || !t.q) return { n: 0 };
  let n = 0, full = false, got = {};
  while (t.q.length && t.q[0].end <= now()) {
    if (G.space() < 1) { full = true; break; }
    const x = t.q.shift();
    G.give(x.r, 1); G.addXP(ITEMS[x.r].xp); G.stat('produced'); G.stat('p_' + x.r);
    got[x.r] = (got[x.r] || 0) + 1; n++;
  }
  return { n, full, got };
};
G.collectAll = function () {
  let got = {}, full = false;
  S.tiles.forEach((t, i) => {
    if (t && t.t === 'bld' && t.q && G.readyCount(t)) {
      const r = G.collect(i); if (r.full) full = true;
      Object.entries(r.got).forEach(([k, v]) => { got[k] = (got[k] || 0) + v; });
    }
  });
  return { got, full };
};
G.rushCost = ms => Math.max(1, Math.ceil(ms / 600000));
G.rushCrop = function (i) {
  const t = S.tiles[i]; if (!t || !t.crop || G.cropReady(t)) return false;
  const c = G.rushCost(t.at + t.dur - now());
  if (S.clovers < c) return 'clovers';
  S.clovers -= c; t.dur = now() - t.at; return true;
};
G.rushBld = function (i) {
  const t = S.tiles[i]; if (!t || !t.q || !t.q.length) return false;
  const last = t.q[t.q.length - 1].end;
  const c = G.rushCost(last - now());
  if (S.clovers < c) return 'clovers';
  S.clovers -= c; t.q.forEach(x => { x.end = Math.min(x.end, now()); }); return true;
};

/* ───────── 繁榮度 / 小舖 ───────── */
G.prosperity = function () {
  let p = 0;
  S.tiles.forEach(t => {
    if (!t) return;
    if (t.t === 'deco') p += DECOS[t.id].pros;
    else if (t.t === 'bld') p += (t.id === 'shop' ? 8 : t.id === 'home' ? 5 : 4) * (t.lvl || 1);
  });
  return p;
};
G.shopInterval = () => Math.round(75000 / (1 + G.prosperity() / 120 + G.population() / 200));
G.shopPrice = id => Math.max(1, Math.round(ITEMS[id].base * 1.3 * (G.isFest(id) ? 1.2 : 1)));
G.shopTick = function () {
  const iv = G.shopInterval(), tnow = now();
  S.tiles.forEach(t => {
    if (!t || t.id !== 'shop') return;
    let guard = 0;
    while (t.last + iv <= tnow && guard++ < 3000) {
      t.last += iv;
      const filled = t.shelf.map((s, k) => s ? k : -1).filter(k => k >= 0);
      if (!filled.length) { t.last = tnow; break; }
      const k = filled[(t.ptr = (t.ptr + 1) % filled.length)] ?? filled[0];
      const s = t.shelf[k];
      t.cash += G.shopPrice(s.id); s.n--; G.stat('shopSold');
      if (s.n <= 0) t.shelf[k] = null;
    }
  });
};
G.stockShelf = function (i, k, id, n) {
  const t = S.tiles[i];
  if (!t || !t.shelf || t.shelf[k]) return 'bad';
  n = Math.min(n, S.inv[id] || 0, 20);
  if (n <= 0) return 'mat';
  if (!t.shelf.some(s => s)) t.last = now();
  G.take(id, n); t.shelf[k] = { id, n }; return true;
};
G.unstock = function (i, k) {
  const t = S.tiles[i]; const s = t.shelf[k]; if (!s) return;
  if (G.space() < s.n) return 'full';
  G.give(s.id, s.n); t.shelf[k] = null; return true;
};
G.collectCash = function (i) {
  const t = S.tiles[i]; const c = Math.floor(t.cash);
  if (c <= 0) return 0;
  G.addCoins(c); t.cash -= c; G.addXP(c / 40); return c;
};

/* ───────── 市場 ───────── */
G.marketTick = function () {
  const m = S.market, t = now();
  const mins = (t - m.last) / 60000;
  if (mins < 0.2) return;
  m.last = t;
  for (const [k, e] of Object.entries(m.ev)) if (e.until < t) delete m.ev[k];
  for (const id of Object.keys(m.m)) {
    const target = m.ev[id] ? m.ev[id].m : 1;
    const cur = m.m[id];
    m.m[id] = target + (cur - target) * Math.pow(0.96, mins);
    if (Math.abs(m.m[id] - 1) < 0.005 && !m.ev[id]) delete m.m[id];
  }
  for (const [id, e] of Object.entries(m.ev)) if (m.m[id] === undefined) m.m[id] = 1 + (e.m - 1) * 0.3;
};
G.mult = id => S.market.m[id] ?? 1;
G.sellPrice = id => Math.max(1, Math.round(ITEMS[id].base * G.mult(id) * (G.isFest(id) ? 1.2 : 1)));
G.buyPrice = id => Math.max(2, Math.ceil(ITEMS[id].base * 1.8 * Math.max(1, G.mult(id))));
G.canBuy = id => (ITEMS[id].cat === 'crop' || ITEMS[id].cat === 'animal') && S.level >= G.itemLevel(id);
G.sell = function (id, n) {
  n = Math.min(n, S.inv[id] || 0);
  if (n <= 0) return 0;
  let total = 0;
  for (let k = 0; k < n; k++) {
    total += G.sellPrice(id);
    S.market.m[id] = Math.max(0.55, G.mult(id) - 0.006);
  }
  G.take(id, n); G.addCoins(total); G.stat('sold', n);
  return total;
};
G.buy = function (id, n) {
  const p = G.buyPrice(id) * n;
  if (S.coins < p) return 'coins';
  if (G.space() < n) return 'full';
  S.coins -= p; G.give(id, n);
  S.market.m[id] = Math.min(1.6, G.mult(id) + 0.004 * n);
  return true;
};

/* ───────── 訂單 ───────── */
G.producible = function () {
  const out = [];
  for (const id of Object.keys(ITEMS)) {
    if (S.level < G.itemLevel(id)) continue;
    if (CROPS[id]) { out.push(id); continue; }
    const b = RECIPE_BLD[id];
    if (b && G.count(b) > 0) out.push(id);
  }
  return out;
};
G.qtyFor = id => {
  const base = ITEMS[id].base;
  if (base <= 4) return randi(4, 10);
  if (base <= 12) return randi(3, 7);
  if (base <= 30) return randi(2, 5);
  if (base <= 80) return randi(1, 3);
  return randi(1, 2);
};
G.genOrder = function () {
  const pool = G.producible();
  const npcId = pick(Object.keys(VILLAGERS));
  const v = VILLAGERS[npcId];
  const likes = v.likes.filter(x => pool.includes(x));
  const kinds = 1 + (Math.random() < 0.55 ? 1 : 0) + (S.level >= 6 && Math.random() < 0.3 ? 1 : 0);
  const req = [];
  const used = new Set();
  // 偏向較新解鎖的物品
  const weighted = pool.slice().sort((a, b) => G.itemLevel(b) - G.itemLevel(a));
  for (let k = 0; k < kinds; k++) {
    let id;
    if (k === 0 && likes.length && Math.random() < 0.6) id = pick(likes);
    else id = Math.random() < 0.55 ? weighted[Math.floor(Math.random() * Math.min(6, weighted.length))] : pick(pool);
    if (used.has(id)) continue;
    used.add(id); req.push([id, G.qtyFor(id)]);
  }
  const val = req.reduce((a, [id, q]) => a + ITEMS[id].base * q, 0);
  const fest = req.some(([id]) => G.isFest(id));
  const coins = Math.round(val * rand(1.3, 1.65) * (fest ? 1.3 : 1) + 5);
  const xp = Math.round(req.reduce((a, [id, q]) => a + ITEMS[id].xp * q, 0) * 1.3 + 3);
  return { npc: npcId, req, coins, xp, fest };
};
G.orderTick = function () {
  S.orders.forEach((o, k) => { if (o.wait && o.wait <= now()) S.orders[k] = G.genOrder(); });
};
G.canFill = o => o.req && o.req.every(([id, q]) => G.has(id, q));
G.fill = function (k) {
  const o = S.orders[k];
  if (!o || !G.canFill(o)) return false;
  o.req.forEach(([id, q]) => G.take(id, q));
  G.addCoins(o.coins); G.addXP(o.xp); G.stat('orders');
  const likes = VILLAGERS[o.npc].likes;
  const pts = 1 + (o.req.some(([id]) => likes.includes(id)) ? 1 : 0);
  const before = G.hearts(o.npc);
  S.friend[o.npc] = (S.friend[o.npc] || 0) + pts;
  const after = G.hearts(o.npc);
  S.orders[k] = { wait: now() + 15000 };
  if (after > before) { S.clovers += 1; return { o, heart: after }; }
  return { o };
};
G.discard = function (k) { S.orders[k] = { wait: now() + 90000 }; };
G.hearts = npc => Math.min(10, Math.floor(Math.sqrt((S.friend[npc] || 0) / 2)));
G.heartProg = npc => {
  const h = G.hearts(npc); if (h >= 10) return 1;
  const a = 2 * h * h, b = 2 * (h + 1) * (h + 1);
  return ((S.friend[npc] || 0) - a) / (b - a);
};

/* ───────── 熱氣球商隊 ───────── */
G.balloonTick = function () {
  const b = S.balloon;
  if (S.level < 7) return;
  if (b.req && b.until < now()) { S.balloon = { next: now() + 3600000, missed: true }; return; }
  if (!b.req && b.next <= now()) {
    const pool = G.producible().filter(id => ITEMS[id].base >= 6);
    const req = [];
    const set = new Set();
    while (req.length < 3 && set.size < pool.length) {
      const id = pick(pool); if (set.has(id)) continue; set.add(id);
      req.push({ id, q: Math.max(2, G.qtyFor(id) * 3), d: 0 });
    }
    const val = req.reduce((a, r) => a + ITEMS[r.id].base * r.q, 0);
    S.balloon = { req, coins: Math.round(val * 2.1), xp: Math.round(val / 3), clovers: 2 + (Math.random() < 0.3 ? 1 : 0), until: now() + 8 * 3600000 };
  }
};
G.balloonGive = function (k) {
  const b = S.balloon; const r = b.req && b.req[k]; if (!r) return false;
  const n = Math.min(r.q - r.d, S.inv[r.id] || 0);
  if (n <= 0) return false;
  G.take(r.id, n); r.d += n;
  if (b.req.every(x => x.d >= x.q)) {
    G.addCoins(b.coins); G.addXP(b.xp); S.clovers += b.clovers; G.stat('balloons');
    const res = { done: true, coins: b.coins, clovers: b.clovers };
    S.balloon = { next: now() + 2 * 3600000 };
    return res;
  }
  return { n };
};

/* ───────── 銀行 ───────── */
G.bankAccrue = function () {
  const b = S.bank, t = now();
  const hs = (t - b.savAt) / 3600000;
  if (b.sav > 0 && hs > 0) {
    const ns = b.sav * Math.pow(1 + SAVINGS_RATE_HOURLY, hs);
    G.stat('interest', ns - b.sav); b.sav = ns;
  }
  b.savAt = t;
  const hl = (t - b.loanAt) / 3600000;
  if (b.loan > 0 && hl > 0) b.loan = b.loan * Math.pow(1 + LOAN_RATE_HOURLY, hl);
  b.loanAt = t;
};
G.savCap = () => 3000 + S.level * S.level * 600;
G.loanCap = () => 500 + S.level * 900;
G.deposit = function (amt) {
  G.bankAccrue(); amt = Math.floor(amt);
  if (amt <= 0 || S.coins < amt) return 'coins';
  if (S.bank.sav + amt > G.savCap()) return 'cap';
  S.coins -= amt; S.bank.sav += amt; G.stat('deposited', amt); return true;
};
G.withdraw = function (amt) {
  G.bankAccrue(); amt = Math.floor(Math.min(amt, S.bank.sav));
  if (amt <= 0) return false;
  S.bank.sav -= amt; S.coins += amt; return true;
};
G.depTotal = () => S.bank.deps.reduce((a, d) => a + d.amt, 0);
G.fixDeposit = function (pid, amt) {
  const p = DEPOSIT_PLANS.find(x => x.id === pid);
  amt = Math.floor(amt);
  if (amt < 100) return 'min';
  if (S.coins < amt) return 'coins';
  if (S.bank.deps.length >= 4) return 'slots';
  if (G.depTotal() + amt > G.savCap()) return 'cap';
  S.coins -= amt;
  S.bank.deps.push({ pid, amt, rate: p.rate, start: now(), end: now() + p.hours * 3600000 });
  G.stat('deposited', amt);
  return true;
};
G.claimDeposit = function (k) {
  const d = S.bank.deps[k]; if (!d) return false;
  let back;
  if (now() >= d.end) { back = Math.floor(d.amt * (1 + d.rate)); G.stat('interest', back - d.amt); }
  else back = d.amt;   // 提前解約只拿回本金
  S.coins += back; S.bank.deps.splice(k, 1); return back;
};
G.borrow = function (amt) {
  G.bankAccrue(); amt = Math.floor(amt);
  if (amt <= 0) return false;
  if (S.bank.loan + amt > G.loanCap()) return 'cap';
  S.bank.loan += amt; S.coins += amt; return true;
};
G.repay = function (amt) {
  G.bankAccrue();
  amt = Math.min(Math.ceil(amt), Math.ceil(S.bank.loan));
  if (amt <= 0 || S.coins < amt) return 'coins';
  S.coins -= amt; S.bank.loan -= amt; if (S.bank.loan < 0.5) S.bank.loan = 0; return true;
};

/* ───────── 股市 ───────── */
function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
G.initStocks = function () {
  const st = { p: {}, f: {}, h: {}, hold: {}, last: now(), news: [], div: 0, open: {} };
  for (const [k, s] of Object.entries(STOCKS)) {
    st.p[k] = s.price; st.f[k] = s.price; st.h[k] = []; st.open[k] = s.price;
    let p = s.price;
    for (let n = 0; n < 60; n++) { p *= Math.exp(s.vol * gauss() * 0.8); st.h[k].push(+p.toFixed(2)); }
    st.p[k] = p; st.open[k] = st.h[k][0];
  }
  S.st = st;
};
G.stockTickOnce = function (live) {
  const st = S.st;
  for (const [k, s] of Object.entries(STOCKS)) {
    const p = st.p[k];
    const rev = 0.015 * Math.log(st.f[k] / p);
    const r = s.vol * gauss() + rev;
    st.p[k] = Math.max(1, p * Math.exp(r));
    st.f[k] *= Math.exp(s.drift / 2880);
    st.h[k].push(+st.p[k].toFixed(2));
    if (st.h[k].length > 120) st.h[k].shift();
    const hold = st.hold[k];
    if (hold && hold.q > 0 && s.yield) st.div += hold.q * st.p[k] * s.yield / 2880;
  }
  if (Math.random() < 0.005) {
    const n = pick(NEWS);
    if (n.sym) st.p[n.sym] *= (1 + n.imp); else for (const k of Object.keys(STOCKS)) st.p[k] *= (1 + n.imp);
    if (n.items) for (const [id, m] of Object.entries(n.items)) S.market.ev[id] = { m, until: now() + 40 * 60000 };
    st.news.unshift({ t: n.t, at: now(), sym: n.sym, imp: n.imp });
    if (st.news.length > 20) st.news.pop();
    if (live && UI && UI.toast) UI.toast(`📰 ${n.t}`);
  }
  if (st.div >= 1) { const d = Math.floor(st.div); st.div -= d; G.addCoins(d); G.stat('dividends', d); }
};
G.stockTick = function () {
  const st = S.st;
  let n = Math.floor((now() - st.last) / STOCK_TICK_MS);
  if (n <= 0) return 0;
  st.last += n * STOCK_TICK_MS;
  const live = n <= 2;
  n = Math.min(n, 2880);
  for (let k = 0; k < n; k++) G.stockTickOnce(live);
  // 每日開盤價（用於顯示漲跌）
  const dk = todayKey();
  if (st.openDay !== dk) { st.openDay = dk; for (const k of Object.keys(STOCKS)) st.open[k] = st.p[k]; }
  return n;
};
G.price = k => S.st.p[k];
G.buyStock = function (k, q) {
  q = Math.floor(q); if (q <= 0) return false;
  const cost = Math.ceil(G.price(k) * q * 1.003);
  if (S.coins < cost) return 'coins';
  S.coins -= cost;
  const h = S.st.hold[k] || (S.st.hold[k] = { q: 0, c: 0 });
  h.c = (h.c * h.q + cost) / (h.q + q); h.q += q;
  G.stat('stockBuys');
  return true;
};
G.sellStock = function (k, q) {
  const h = S.st.hold[k]; if (!h || h.q <= 0) return false;
  q = Math.min(Math.floor(q), h.q); if (q <= 0) return false;
  const got = Math.floor(G.price(k) * q * 0.997);
  const profit = got - h.c * q;
  h.q -= q; if (h.q === 0) delete S.st.hold[k];
  S.coins += got; G.stat('stockProfit', profit); if (profit > 0) G.stat('earned', Math.round(profit));
  return { got, profit };
};
G.stockValue = () => Object.entries(S.st.hold).reduce((a, [k, h]) => a + h.q * G.price(k), 0);

/* ───────── 資產 ───────── */
G.invValue = () => Object.entries(S.inv).reduce((a, [id, n]) => a + ITEMS[id].base * n, 0);
G.netWorth = () => Math.round(S.coins + S.bank.sav + G.depTotal() + G.stockValue() + G.invValue() - S.bank.loan);
G.recordNet = function (force) {
  const last = S.nh[S.nh.length - 1];
  if (force || !last || now() - last.t >= 3600000) {
    S.nh.push({ t: now(), v: G.netWorth() });
    if (S.nh.length > 240) S.nh.shift();
  }
};

/* ───────── 每日 / 登入 ───────── */
G.checkDaily = function (silent) {
  const dk = todayKey();
  if (S.daily && S.daily.day === dk) return null;
  const keys = DAILY_TEMPLATES.filter(t => !t.minLvl || S.level >= t.minLvl);
  const chosen = [];
  while (chosen.length < 3) { const t = pick(keys); if (!chosen.includes(t)) chosen.push(t); }
  S.daily = {
    day: dk,
    tasks: chosen.map(t => {
      const n = Math.round(t.base + t.per * S.level);
      return { key: t.key, n, from: S.stats[t.key] || 0, done: false, r: { coins: 40 + S.level * 15, clovers: 0 } };
    }),
    bonus: false,
  };
  S.daily.tasks[2].r.clovers = 1;
  // 登入
  const L = S.login;
  const y = new Date(); y.setDate(y.getDate() - 1);
  L.streak = (L.last === todayKey(y.getTime())) ? L.streak + 1 : 1;
  L.last = dk; L.claimed = false;
  S.stats.bestStreak = Math.max(S.stats.bestStreak || 0, L.streak);
  return silent ? null : 'new';
};
G.dailyProg = t => clamp((S.stats[t.key] || 0) - t.from, 0, t.n);
G.claimDaily = function (k) {
  const t = S.daily.tasks[k];
  if (t.done || G.dailyProg(t) < t.n) return false;
  t.done = true; G.addCoins(t.r.coins); S.clovers += t.r.clovers; G.addXP(10 + S.level * 2);
  return true;
};
G.claimDailyBonus = function () {
  if (S.daily.bonus || !S.daily.tasks.every(t => t.done)) return false;
  S.daily.bonus = true; S.clovers += 2; G.addCoins(100 + S.level * 20); return true;
};
G.loginReward = () => { const d = ((S.login.streak - 1) % 7) + 1; return { coins: 40 * d + S.level * 10, clovers: d === 7 ? 3 : (d === 4 ? 1 : 0), day: d }; };
G.claimLogin = function () {
  if (S.login.claimed) return false;
  const r = G.loginReward(); S.login.claimed = true; G.addCoins(r.coins); S.clovers += r.clovers; return r;
};

/* ───────── 任務 / 成就 ───────── */
G.maxHearts = () => Math.max(0, ...Object.keys(VILLAGERS).map(G.hearts));
G.condValue = function (c) {
  switch (c.type) {
    case 'stat': return S.stats[c.key] || 0;
    case 'own': return G.count(c.key);
    case 'pros': return G.prosperity();
    case 'net': return G.netWorth();
    case 'friend': return G.maxHearts();
    case 'level': return S.level;
    case 'popn': return G.population();
    case 'dex': return Object.keys(S.dex).length;
    case 'dexn': return Object.keys(S.dex).length;
  }
  return 0;
};
G.condTarget = c => c.type === 'dex' ? Object.keys(ITEMS).length : c.n;
G.curQuest = () => QUESTS[S.quest] || null;
G.questDone = () => { const q = G.curQuest(); return q && G.condValue(q) >= G.condTarget(q); };
G.claimQuest = function () {
  const q = G.curQuest(); if (!q || !G.questDone()) return false;
  G.addCoins(q.r.coins || 0); S.clovers += q.r.clovers || 0; G.addXP(q.r.xp || 0);
  S.quest++; return q;
};
G.checkAch = function () {
  const got = [];
  for (const a of ACHIEVEMENTS) {
    if (S.ach[a.id]) continue;
    if (G.condValue(a) >= a.n) { S.ach[a.id] = now(); S.clovers += a.clovers; got.push(a); }
  }
  return got;
};
G.checkSeason = function () {
  const si = G.seasonInfo();
  if (S.seasonIdx !== si.count) {
    const changed = S.seasonIdx !== undefined && si.count > S.seasonIdx;
    if (changed) G.stat('seasons', si.count - S.seasonIdx);
    S.seasonIdx = si.count;
    return changed ? si : null;
  }
  return null;
};

/* ───────── 主更新 ───────── */
G.update = function () {
  const r = {};
  G.marketTick();
  r.stockTicks = G.stockTick();
  G.shopTick();
  G.orderTick();
  G.balloonTick();
  G.recordNet();
  r.daily = G.checkDaily();
  r.season = G.checkSeason();
  r.ach = G.checkAch();
  return r;
};
