/* 慢慢小鎮 Slowtown — 遊戲資料表 */
'use strict';

const COLS = 6;
const MAX_ROWS = 16;
const START_ROWS = 4;
const SEASON_MS = 24 * 3600 * 1000;      // 每個季節 = 現實 24 小時
const STOCK_TICK_MS = 30 * 1000;          // 股市每 30 秒跳動一次
const SAVE_KEY = 'slowtown_save_v1';

const SEASONS = [
  { id: 'spring', name: '春', full: '春日', emoji: '🌸', tint: '#f7e9ea', particle: '🌸', fest: '春日草莓祭', festItems: ['strawberry', 'cake', 'jam', 'bouquet', 'tea'] },
  { id: 'summer', name: '夏', full: '盛夏', emoji: '🌻', tint: '#eef4e2', particle: '✨', fest: '夏夜冰品祭', festItems: ['icecream', 'sunflower', 'popcorn', 'tomato', 'juice'] },
  { id: 'autumn', name: '秋', full: '秋收', emoji: '🍂', tint: '#f6ecdc', particle: '🍂', fest: '秋收南瓜祭', festItems: ['pumpkin', 'pie', 'grape', 'juice', 'bread'] },
  { id: 'winter', name: '冬', full: '冬眠', emoji: '❄️', tint: '#eaf0f4', particle: '❄️', fest: '暖暖冬日祭', festItems: ['milktea', 'honeytea', 'scarf', 'sweater', 'soup'] },
];

/* 可選主角 */
const SPECIES = [
  { id: 'rabbit', emoji: '🐰', name: '兔子' },
  { id: 'bear', emoji: '🐻', name: '小熊' },
  { id: 'cat', emoji: '🐱', name: '貓咪' },
  { id: 'fox', emoji: '🦊', name: '狐狸' },
  { id: 'dog', emoji: '🐶', name: '小狗' },
  { id: 'penguin', emoji: '🐧', name: '企鵝' },
  { id: 'panda', emoji: '🐼', name: '熊貓' },
  { id: 'koala', emoji: '🐨', name: '無尾熊' },
  { id: 'hamster', emoji: '🐹', name: '倉鼠' },
  { id: 'frog', emoji: '🐸', name: '青蛙' },
  { id: 'mouse', emoji: '🐭', name: '小老鼠' },
  { id: 'tiger', emoji: '🐯', name: '小老虎' },
  { id: 'owl', emoji: '🦉', name: '貓頭鷹' },
  { id: 'deer', emoji: '🦌', name: '小鹿' },
  { id: 'hedgehog', emoji: '🦔', name: '刺蝟' },
];
const SCARF_COLORS = ['#d98f6c', '#9db89a', '#8faec2', '#e3b85c', '#e8b4b0', '#b7a3c9', '#7c9c8e', '#c9a27e'];

/* ───────── 物品 ───────── */
// cat: crop 作物 / animal 畜產 / goods 加工品
const ITEMS = {
  // 作物
  wheat:      { name: '小麥',   emoji: '🌾', cat: 'crop', base: 2,   xp: 1 },
  carrot:     { name: '胡蘿蔔', emoji: '🥕', cat: 'crop', base: 4,   xp: 1 },
  corn:       { name: '玉米',   emoji: '🌽', cat: 'crop', base: 6,   xp: 2 },
  strawberry: { name: '草莓',   emoji: '🍓', cat: 'crop', base: 10,  xp: 3 },
  tea:        { name: '茶葉',   emoji: '🍃', cat: 'crop', base: 12,  xp: 3 },
  sunflower:  { name: '向日葵', emoji: '🌻', cat: 'crop', base: 14,  xp: 4 },
  tomato:     { name: '番茄',   emoji: '🍅', cat: 'crop', base: 16,  xp: 4 },
  greens:     { name: '青菜',   emoji: '🥬', cat: 'crop', base: 15,  xp: 4 },
  cotton:     { name: '棉花',   emoji: '☁️', cat: 'crop', base: 18,  xp: 5 },
  potato:     { name: '地瓜',   emoji: '🍠', cat: 'crop', base: 22,  xp: 5 },
  pumpkin:    { name: '南瓜',   emoji: '🎃', cat: 'crop', base: 28,  xp: 7 },
  grape:      { name: '葡萄',   emoji: '🍇', cat: 'crop', base: 32,  xp: 8 },
  // 畜產
  egg:        { name: '雞蛋',   emoji: '🥚', cat: 'animal', base: 9,  xp: 2 },
  milk:       { name: '牛奶',   emoji: '🥛', cat: 'animal', base: 18, xp: 4 },
  honey:      { name: '蜂蜜',   emoji: '🍯', cat: 'animal', base: 30, xp: 6 },
  wool:       { name: '羊毛',   emoji: '🧶', cat: 'animal', base: 30, xp: 6 },
  // 加工品
  flour:      { name: '麵粉',   emoji: '🥣', cat: 'goods', base: 9,   xp: 2 },
  popcorn:    { name: '爆米花', emoji: '🍿', cat: 'goods', base: 17,  xp: 3 },
  cookie:     { name: '手工餅乾', emoji: '🍪', cat: 'goods', base: 26, xp: 5 },
  bread:      { name: '鄉村麵包', emoji: '🍞', cat: 'goods', base: 38, xp: 7 },
  pancake:    { name: '鬆餅',   emoji: '🥞', cat: 'goods', base: 52,  xp: 9 },
  cake:       { name: '草莓蛋糕', emoji: '🍰', cat: 'goods', base: 92, xp: 15 },
  pie:        { name: '南瓜派', emoji: '🥧', cat: 'goods', base: 98,  xp: 16 },
  cheese:     { name: '起司',   emoji: '🧀', cat: 'goods', base: 50,  xp: 8 },
  icecream:   { name: '牛奶冰淇淋', emoji: '🍦', cat: 'goods', base: 62, xp: 10 },
  milktea:    { name: '奶茶',   emoji: '🧋', cat: 'goods', base: 60,  xp: 10 },
  honeytea:   { name: '蜂蜜茶', emoji: '🍵', cat: 'goods', base: 72,  xp: 12 },
  jam:        { name: '草莓果醬', emoji: '🫙', cat: 'goods', base: 76, xp: 12 },
  ketchup:    { name: '番茄醬', emoji: '🥫', cat: 'goods', base: 62,  xp: 10 },
  juice:      { name: '葡萄汁', emoji: '🧃', cat: 'goods', base: 116, xp: 18 },
  bouquet:    { name: '花束',   emoji: '💐', cat: 'goods', base: 56,  xp: 9 },
  cloth:      { name: '棉布',   emoji: '🧵', cat: 'goods', base: 46,  xp: 8 },
  scarf:      { name: '毛線圍巾', emoji: '🧣', cat: 'goods', base: 82, xp: 13 },
  sweater:    { name: '手織毛衣', emoji: '🧥', cat: 'goods', base: 170, xp: 26 },
  sandwich:   { name: '三明治', emoji: '🥪', cat: 'goods', base: 140, xp: 22 },
  pizza:      { name: '窯烤披薩', emoji: '🍕', cat: 'goods', base: 150, xp: 24 },
  soup:       { name: '地瓜濃湯', emoji: '🍲', cat: 'goods', base: 110, xp: 18 },
  salad:      { name: '田園沙拉', emoji: '🥗', cat: 'goods', base: 96, xp: 15 },
};

/* 作物：等級、種子價、成長秒數、產量、偏好季節 */
const CROPS = {
  wheat:      { lvl: 1,  seed: 1,  time: 45,   yield: 2, fav: 'summer' },
  carrot:     { lvl: 1,  seed: 3,  time: 90,   yield: 2, fav: 'spring' },
  corn:       { lvl: 2,  seed: 5,  time: 180,  yield: 2, fav: 'summer' },
  strawberry: { lvl: 3,  seed: 8,  time: 300,  yield: 2, fav: 'spring' },
  tea:        { lvl: 4,  seed: 10, time: 420,  yield: 2, fav: 'spring' },
  sunflower:  { lvl: 5,  seed: 12, time: 480,  yield: 2, fav: 'summer' },
  tomato:     { lvl: 6,  seed: 14, time: 600,  yield: 2, fav: 'summer' },
  greens:     { lvl: 7,  seed: 12, time: 540,  yield: 2, fav: 'winter' },
  cotton:     { lvl: 8,  seed: 16, time: 720,  yield: 2, fav: 'autumn' },
  potato:     { lvl: 9,  seed: 18, time: 900,  yield: 2, fav: 'winter' },
  pumpkin:    { lvl: 10, seed: 22, time: 1200, yield: 2, fav: 'autumn' },
  grape:      { lvl: 12, seed: 26, time: 1500, yield: 2, fav: 'autumn' },
};

/* 配方 */
const RECIPES = {
  egg:      { lvl: 2,  in: { wheat: 2 },                         time: 120 },
  milk:     { lvl: 4,  in: { corn: 2 },                          time: 300 },
  honey:    { lvl: 6,  in: { sunflower: 1 },                     time: 420 },
  wool:     { lvl: 8,  in: { carrot: 3 },                        time: 480 },
  flour:    { lvl: 3,  in: { wheat: 3 },                         time: 60 },
  popcorn:  { lvl: 5,  in: { corn: 2 },                          time: 90 },
  cookie:   { lvl: 4,  in: { flour: 1, egg: 1 },                 time: 120 },
  bread:    { lvl: 4,  in: { flour: 2, egg: 1 },                 time: 180 },
  pancake:  { lvl: 5,  in: { flour: 1, egg: 1, milk: 1 },        time: 240 },
  cake:     { lvl: 7,  in: { flour: 2, egg: 2, strawberry: 2 },  time: 420 },
  pie:      { lvl: 10, in: { flour: 2, egg: 1, pumpkin: 1 },     time: 600 },
  cheese:   { lvl: 5,  in: { milk: 2 },                          time: 300 },
  icecream: { lvl: 6,  in: { milk: 2, strawberry: 1 },           time: 240 },
  milktea:  { lvl: 6,  in: { tea: 2, milk: 1 },                  time: 240 },
  honeytea: { lvl: 7,  in: { tea: 2, honey: 1 },                 time: 300 },
  jam:      { lvl: 7,  in: { strawberry: 3, honey: 1 },          time: 360 },
  ketchup:  { lvl: 7,  in: { tomato: 3 },                        time: 300 },
  juice:    { lvl: 12, in: { grape: 3 },                         time: 400 },
  bouquet:  { lvl: 8,  in: { sunflower: 3 },                     time: 300 },
  cloth:    { lvl: 9,  in: { cotton: 2 },                        time: 360 },
  scarf:    { lvl: 9,  in: { wool: 2 },                          time: 480 },
  sweater:  { lvl: 11, in: { wool: 2, cloth: 1 },                time: 900 },
  sandwich: { lvl: 11, in: { bread: 1, cheese: 1, tomato: 1 },   time: 360 },
  pizza:    { lvl: 12, in: { flour: 2, cheese: 1, ketchup: 1 },  time: 600 },
  salad:    { lvl: 11, in: { greens: 2, tomato: 1, carrot: 2 },  time: 300 },
  soup:     { lvl: 13, in: { potato: 3, milk: 1 },               time: 480 },
};

/* 建築 */
// cat: farm 農業 / animal 畜牧 / factory 工坊 / shop 商店 / deco 裝飾
const BUILDINGS = {
  plot:    { name: '農田',   emoji: '🌱', cat: 'farm',    lvl: 1, cost: 10, desc: '種下種子，等待收成。' },
  coop:    { name: '雞舍',   emoji: '🐔', cat: 'animal',  lvl: 2, cost: 150, pop: 0, max: 3, recipes: ['egg'], roof: '#e3b85c', desc: '餵小麥，咕咕下蛋。' },
  cowbarn: { name: '乳牛小屋', emoji: '🐮', cat: 'animal', lvl: 4, cost: 600, pop: 12, max: 3, recipes: ['milk'], roof: '#8faec2', desc: '餵玉米，產出香濃牛奶。' },
  beehive: { name: '蜂箱',   emoji: '🐝', cat: 'animal',  lvl: 6, cost: 900, pop: 20, max: 3, recipes: ['honey'], roof: '#e3b85c', desc: '向日葵換一罐金黃蜂蜜。' },
  sheepfold:{ name: '綿羊牧場', emoji: '🐑', cat: 'animal', lvl: 8, cost: 1500, pop: 36, max: 3, recipes: ['wool'], roof: '#e8b4b0', desc: '綿羊愛吃胡蘿蔔，長出軟綿羊毛。' },
  mill:    { name: '風車磨坊', emoji: '🌀', cat: 'factory', lvl: 3, cost: 300, pop: 5, max: 1, recipes: ['flour', 'popcorn'], roof: '#c9a27e', desc: '把穀物磨成細細的粉。' },
  bakery:  { name: '熊熊麵包坊', emoji: '🥐', cat: 'factory', lvl: 4, cost: 700, pop: 10, max: 1, recipes: ['cookie', 'bread', 'pancake', 'cake', 'pie'], roof: '#d98f6c', desc: '小鎮清晨最香的地方。' },
  dairy:   { name: '牛奶工坊', emoji: '🧀', cat: 'factory', lvl: 5, cost: 1000, pop: 18, max: 1, recipes: ['cheese', 'icecream'], roof: '#8faec2', desc: '起司、冰淇淋都從這裡來。' },
  teahouse:{ name: '午後茶屋', emoji: '🫖', cat: 'factory', lvl: 6, cost: 1400, pop: 25, max: 1, recipes: ['milktea', 'honeytea'], roof: '#7c9c8e', desc: '慢慢泡一壺茶。' },
  jamhouse:{ name: '果醬小屋', emoji: '🍓', cat: 'factory', lvl: 7, cost: 1800, pop: 32, max: 1, recipes: ['jam', 'ketchup', 'juice'], roof: '#e8b4b0', desc: '把季節裝進玻璃罐。' },
  florist: { name: '花草店',   emoji: '🌷', cat: 'factory', lvl: 8, cost: 2000, pop: 40, max: 1, recipes: ['bouquet'], roof: '#b7a3c9', desc: '包一束送給喜歡的人。' },
  textile: { name: '織布工房', emoji: '🪡', cat: 'factory', lvl: 9, cost: 2600, pop: 50, max: 1, recipes: ['cloth', 'scarf', 'sweater'], roof: '#b7a3c9', desc: '一針一線織出溫度。' },
  bistro:  { name: '森林食堂', emoji: '🍳', cat: 'factory', lvl: 11, cost: 4000, pop: 70, max: 1, recipes: ['sandwich', 'salad', 'pizza', 'soup'], roof: '#d98f6c', desc: '大家最愛的小館子。' },
  shop:    { name: '文青小舖', emoji: '🏪', cat: 'shop',    lvl: 6, cost: 1200, pop: 15, max: 3, roof: '#9db89a', desc: '把商品擺上架，觀光客會自己來買。' },
  home:    { name: '我的小屋', emoji: '🏡', cat: 'special', lvl: 1, cost: 0, max: 1, roof: '#d98f6c', res: 4, desc: '' },
  // 住宅：提供人口，人口夠了才能蓋更大的工坊
  cottage: { name: '小木屋',   emoji: '🏠', cat: 'house', lvl: 1,  cost: 120,  res: 6,  roof: '#e3b85c', wall: '#ecd3a8', desc: '溫暖的小木屋，可以住 6 位居民。' },
  brick:   { name: '紅磚屋',   emoji: '🧱', cat: 'house', lvl: 5,  cost: 650,  res: 15, roof: '#8faec2', wall: '#dba488', desc: '結實的紅磚屋，可以住 15 位居民。' },
  townhouse:{ name: '雙層洋房', emoji: '🏘️', cat: 'house', lvl: 10, cost: 2200, res: 35, roof: '#b7a3c9', wall: '#fff4e2', tall: 1, desc: '有陽台的兩層樓房，可以住 35 位居民。' },
  villa:   { name: '花園別墅', emoji: '🏰', cat: 'house', lvl: 16, cost: 6500, res: 75, roof: '#7c9c8e', wall: '#f6ead8', tall: 1, desc: '附花園的大別墅，可以住 75 位居民。' },
};

/* 裝飾：價格與繁榮度 */
const DECOS = {
  tree:     { name: '小樹林',     emoji: '🌳', lvl: 1,  cost: 40,   pros: 2 },
  pine:     { name: '松樹林',     emoji: '🌲', lvl: 2,  cost: 60,   pros: 3 },
  tulip:    { name: '鬱金香花圃', emoji: '🌷', lvl: 1, cost: 80,   pros: 4 },
  bench:    { name: '木頭長椅', emoji: '🪑', lvl: 3,  cost: 150,  pros: 6 },
  mailbox:  { name: '紅色郵筒', emoji: '📮', lvl: 4,  cost: 180,  pros: 7 },
  lantern:  { name: '紙燈籠',   emoji: '🏮', lvl: 5,  cost: 220,  pros: 8, glow: true },
  tent:     { name: '露營帳篷', emoji: '⛺', lvl: 6,  cost: 320,  pros: 11 },
  rose:     { name: '玫瑰花叢', emoji: '🌹', lvl: 7,  cost: 400,  pros: 13 },
  hut:      { name: '樹屋',     emoji: '🛖', lvl: 8,  cost: 650,  pros: 19 },
  books:    { name: '街角書攤', emoji: '📚', lvl: 9,  cost: 800,  pros: 23 },
  fountain: { name: '石頭噴泉', emoji: '⛲', lvl: 10, cost: 1300, pros: 32 },
  piano:    { name: '街頭鋼琴', emoji: '🎹', lvl: 12, cost: 2000, pros: 45 },
  circus:   { name: '馬戲帳篷', emoji: '🎪', lvl: 14, cost: 3200, pros: 62 },
  ferris:   { name: '小摩天輪', emoji: '🎡', lvl: 16, cost: 5200, pros: 90 },
  castle:   { name: '童話城堡', emoji: '🏰', lvl: 20, cost: 12000, pros: 180 },
};

/* 居民 */
const VILLAGERS = {
  bear:    { name: '熊阿嬤',   emoji: '🐻', sp: 'bear', scarf: '#9db89a', likes: ['bread', 'honey', 'cookie', 'pie'], line: '孩子，肚子餓了就來阿嬤這裡。' },
  bunny:   { name: '兔兔小米', emoji: '🐰', sp: 'rabbit', scarf: '#e8b4b0', likes: ['carrot', 'strawberry', 'salad', 'cake'], line: '今天的胡蘿蔔也好甜喔！' },
  cat:     { name: '拿鐵貓',   emoji: '🐱', sp: 'cat', scarf: '#8faec2', likes: ['milk', 'milktea', 'cheese', 'icecream'], line: '咖啡要慢慢喝，日子也是。' },
  fox:     { name: '狐狸阿凡', emoji: '🦊', sp: 'fox', scarf: '#7c9c8e', likes: ['grape', 'juice', 'pizza', 'sandwich'], line: '市場這種東西啊，有漲就有跌。' },
  penguin: { name: '企鵝波波', emoji: '🐧', sp: 'penguin', scarf: '#d98f6c', likes: ['icecream', 'soup', 'scarf'], line: '存錢就像堆雪人，一點一點就會變大。' },
  owl:     { name: '貓頭鷹教授', emoji: '🦉', sp: 'owl', scarf: '#b7a3c9', likes: ['tea', 'honeytea', 'bouquet', 'cloth'], line: '夜晚是讀詩的好時光。' },
  deer:    { name: '小鹿露露', emoji: '🦌', sp: 'deer', scarf: '#e3b85c', likes: ['greens', 'bouquet', 'jam', 'sunflower'], line: '森林邊的花開了，你看到了嗎？' },
  frog:    { name: '青蛙阿呱', emoji: '🐸', sp: 'frog', scarf: '#e8b4b0', likes: ['corn', 'popcorn', 'ketchup', 'tomato'], line: '呱！下雨天最適合吃爆米花！' },
  hedgehog:{ name: '刺蝟栗栗', emoji: '🦔', sp: 'hedgehog', scarf: '#d98f6c', likes: ['pumpkin', 'potato', 'pie', 'sweater'], line: '我…我想要一件暖暖的毛衣。' },
  panda:   { name: '熊貓圓圓', emoji: '🐼', sp: 'panda', scarf: '#8faec2', likes: ['pancake', 'cake', 'milktea', 'wheat'], line: '吃飽飽，睡好好，就是最棒的一天。' },
};

/* 股市：小鎮上市公司 */
const STOCKS = {
  BEAR: { name: '熊熊烘焙', emoji: '🥐', price: 48,  vol: 0.018, drift: 0.008, yield: 0.006, desc: '小鎮老字號麵包店，穩定配息。', items: ['bread', 'cake', 'cookie', 'pie'] },
  RBT:  { name: '兔兔農產', emoji: '🥕', price: 26,  vol: 0.024, drift: 0.007, yield: 0.005,  desc: '農產品批發商，受天氣影響大。', items: ['carrot', 'strawberry', 'wheat', 'corn'] },
  PGN:  { name: '企鵝冷鏈', emoji: '🧊', price: 82,  vol: 0.014, drift: 0.006, yield: 0.008,  desc: '冰品與乳製品物流，防禦型股票。', items: ['milk', 'icecream', 'cheese'] },
  MEOW: { name: '喵喵咖啡', emoji: '☕', price: 44,  vol: 0.03,  drift: 0.012, yield: 0.003,  desc: '連鎖咖啡廳，成長快但波動大。', items: ['milktea', 'honeytea', 'tea'] },
  SQRL: { name: '松鼠建設', emoji: '🏗️', price: 118, vol: 0.022, drift: 0.010, yield: 0.004, desc: '蓋房子也蓋夢想，跟著小鎮一起長大。', items: [] },
  OWL:  { name: '貓頭鷹出版', emoji: '📖', price: 18, vol: 0.042, drift: 0.006, yield: 0.0,  desc: '獨立出版社，暴漲暴跌的文青概念股。', items: ['bouquet', 'cloth'] },
};

const NEWS = [
  { t: '春雨綿綿，草莓園大豐收！', sym: 'RBT', imp: 0.07, items: { strawberry: 0.85 } },
  { t: '一場冰雹打壞了胡蘿蔔田…', sym: 'RBT', imp: -0.09, items: { carrot: 1.3 } },
  { t: '熊熊烘焙推出季節限定可頌，大排長龍。', sym: 'BEAR', imp: 0.08, items: { bread: 1.15 } },
  { t: '麵粉價格上漲，烘焙業成本吃緊。', sym: 'BEAR', imp: -0.06, items: { flour: 1.25 } },
  { t: '熱浪來襲！冰淇淋需求暴增。', sym: 'PGN', imp: 0.09, items: { icecream: 1.3, milk: 1.1 } },
  { t: '冷凍車故障，企鵝冷鏈暫停配送一天。', sym: 'PGN', imp: -0.07 },
  { t: '喵喵咖啡被旅遊雜誌評為「最想待一下午的店」。', sym: 'MEOW', imp: 0.12, items: { milktea: 1.2 } },
  { t: '新的連鎖茶飲店進駐隔壁鎮，喵喵咖啡受壓。', sym: 'MEOW', imp: -0.1 },
  { t: '小鎮人口成長，松鼠建設接下新社區案。', sym: 'SQRL', imp: 0.08 },
  { t: '颱風延誤工期，松鼠建設股價回檔。', sym: 'SQRL', imp: -0.07 },
  { t: '貓頭鷹出版的新詩集意外爆紅！', sym: 'OWL', imp: 0.2, items: { bouquet: 1.2 } },
  { t: '紙張短缺，貓頭鷹出版延後新書。', sym: 'OWL', imp: -0.16 },
  { t: '遊客湧入小鎮，商店街人潮洶湧。', sym: null, imp: 0.03 },
  { t: '大家都在家冬眠，市場有點冷清。', sym: null, imp: -0.03 },
  { t: '南瓜季開跑，派餅訂單暴增。', sym: 'BEAR', imp: 0.05, items: { pumpkin: 1.25, pie: 1.2 } },
  { t: '蜜蜂們罷工休假一天，蜂蜜供不應求。', sym: null, imp: 0, items: { honey: 1.35 } },
  { t: '手作市集開幕，毛線製品大受歡迎。', sym: null, imp: 0.02, items: { scarf: 1.25, sweater: 1.2, wool: 1.15 } },
  { t: '葡萄園迎來好年份。', sym: 'RBT', imp: 0.04, items: { grape: 0.85, juice: 1.1 } },
];

/* 小鎮日記：解鎖條件與內容（原創） */
const JOURNAL = [
  { id: 'j1', lvl: 1, title: '搬來的第一天',
    text: '行李箱的輪子在石板路上咕嚕咕嚕地響。這裡的風很慢，雲也很慢，連郵差騎腳踏車都慢慢的。我在小屋前種下第一排小麥，心想：好啊，就在這裡，慢慢地過日子吧。' },
  { id: 'j2', lvl: 3, title: '風車轉起來了',
    text: '磨坊的風車開始轉動的那一刻，整個鎮上的鳥都飛起來了。熊阿嬤說，以前這裡也有一座，後來大家搬走了，就停了。現在它又轉了，好像小鎮重新開始呼吸。' },
  { id: 'j3', lvl: 5, title: '麵包的香味',
    text: '清晨五點，烤箱的燈亮著。第一條鄉村麵包出爐時，窗外剛好下起小雨。我把它切開，熱氣跑出來，像一句沒說出口的早安。' },
  { id: 'j4', lvl: 7, title: '狐狸的忠告',
    text: '狐狸阿凡在股市小屋前抽著薄荷糖說：「別看一天的漲跌，要看一整季。」我不太懂，但我記住了。也許種田也是這樣。' },
  { id: 'j5', lvl: 10, title: '第一個觀光客',
    text: '今天有一隻背著相機的松鼠來到小舖，買了一罐果醬，說要帶回去給奶奶。原來，我們的小鎮也會被別人記得。' },
  { id: 'j6', lvl: 13, title: '冬天的毛衣',
    text: '刺蝟栗栗收到毛衣的時候，紅著臉說了好幾次謝謝。他說以前冬天都縮成一團，現在可以出門看雪了。我想，這大概就是工作的意義。' },
  { id: 'j7', lvl: 16, title: '摩天輪上的夜',
    text: '摩天輪升到最高點時，整個小鎮的燈籠都亮了。一格一格的田，一棟一棟的小屋，都是這些日子一點一點蓋起來的。好像也沒有很久，好像又很久了。' },
  { id: 'j8', lvl: 20, title: '寫給未來的信',
    text: '貓頭鷹教授說，每個小鎮都有一本書，只是大部分的書都還沒寫完。我把今天的日記夾進信封，寫上「給明年的自己」。希望那時候，風還是這麼慢。' },
  { id: 'j9', lvl: 25, title: '慢慢來，比較快',
    text: '以前總覺得要趕快長大、趕快賺錢、趕快變得厲害。現在每天看著作物發芽，才知道有些事情急不來。慢慢來，反而走得比較遠。' },
  { id: 'j10', lvl: 30, title: '小鎮的名字',
    text: '新來的小兔子問我：「這裡為什麼叫這個名字？」我想了想，說：「因為我們都在這裡，認真地生活過。」她點點頭，好像懂了，又好像沒懂。沒關係，她會懂的。' },
];

const QUOTES = [
  '今天也辛苦了，泡杯茶休息一下吧。',
  '種子不急，它知道自己什麼時候會發芽。',
  '把日子過得慢一點，就能看見更多風景。',
  '每一片葉子都是陽光寄來的信。',
  '下雨的日子，適合發呆和烤麵包。',
  '喜歡的東西，就要好好地收藏起來。',
  '小小的努力，累積起來就是一座小鎮。',
  '有時候什麼都不做，也是一種前進。',
  '記得抬頭看看雲，它們今天也很努力在飄。',
  '你做的麵包，有人正在期待著。',
  '溫柔是會傳染的，從一杯奶茶開始。',
  '今天的煩惱，就交給明天的風吧。',
  '收成不只是作物，還有那些安靜的時光。',
  '一個人的小鎮，也可以很熱鬧。',
  '慢慢來，比較快。',
  '在對的季節，做對的事。',
  '帳本記錄的是數字，日記記錄的是心情。',
  '儲蓄的意義，是讓未來的自己可以安心一點。',
  '別害怕市場的起伏，它只是在呼吸。',
  '晚安，小鎮。明天見。',
];

/* 新手 + 主線任務 */
const QUESTS = [
  { id: 'q1', text: '種下第一株作物', type: 'stat', key: 'planted', n: 1, r: { coins: 20, xp: 5 } },
  { id: 'q2', text: '收成 6 份作物', type: 'stat', key: 'harvested', n: 6, r: { coins: 30, xp: 8 } },
  { id: 'q3', text: '完成 1 筆居民訂單', type: 'stat', key: 'orders', n: 1, r: { coins: 50, xp: 10 } },
  { id: 'q4', text: '蓋一座雞舍（2 級解鎖）', type: 'own', key: 'coop', n: 1, r: { coins: 60, xp: 10 } },
  { id: 'q5', text: '收集 3 顆雞蛋', type: 'stat', key: 'p_egg', n: 3, r: { coins: 60, xp: 12 } },
  { id: 'q6', text: '在市場賣出 10 件商品', type: 'stat', key: 'sold', n: 10, r: { coins: 80, xp: 12 } },
  { id: 'q6b', text: '蓋一間小木屋，迎接新居民', type: 'own', key: 'cottage', n: 1, r: { coins: 80, xp: 12 } },
  { id: 'q7', text: '蓋一座風車磨坊（3 級解鎖）', type: 'own', key: 'mill', n: 1, r: { coins: 100, xp: 15, clovers: 1 } },
  { id: 'q8', text: '做出 5 份麵粉', type: 'stat', key: 'p_flour', n: 5, r: { coins: 100, xp: 15 } },
  { id: 'q9', text: '擴建一次土地', type: 'stat', key: 'expand', n: 1, r: { coins: 120, xp: 20 } },
  { id: 'q10', text: '蓋熊熊麵包坊並烤 3 條麵包', type: 'stat', key: 'p_bread', n: 3, r: { coins: 150, xp: 25 } },
  { id: 'q11', text: '在企鵝銀行活存 300 金幣', type: 'stat', key: 'deposited', n: 300, r: { coins: 100, xp: 20, clovers: 1 } },
  { id: 'q12', text: '買進第一張股票', type: 'stat', key: 'stockBuys', n: 1, r: { coins: 100, xp: 20 } },
  { id: 'q12b', text: '小鎮人口達到 30 人', type: 'popn', n: 30, r: { coins: 150, xp: 25, clovers: 1 } },
  { id: 'q13', text: '小鎮繁榮度達到 40', type: 'pros', n: 40, r: { coins: 200, xp: 30 } },
  { id: 'q14', text: '開一間文青小舖', type: 'own', key: 'shop', n: 1, r: { coins: 200, xp: 30, clovers: 2 } },
  { id: 'q15', text: '小舖賣出 20 件商品', type: 'stat', key: 'shopSold', n: 20, r: { coins: 300, xp: 40 } },
  { id: 'q16', text: '完成 30 筆訂單', type: 'stat', key: 'orders', n: 30, r: { coins: 400, xp: 50, clovers: 2 } },
  { id: 'q17', text: '完成一次熱氣球商隊委託', type: 'stat', key: 'balloons', n: 1, r: { coins: 500, xp: 60, clovers: 2 } },
  { id: 'q18', text: '把任一工坊升到 2 級', type: 'stat', key: 'upgrades', n: 1, r: { coins: 500, xp: 60 } },
  { id: 'q19', text: '總資產達到 20,000', type: 'net', n: 20000, r: { coins: 800, xp: 80, clovers: 3 } },
  { id: 'q20', text: '和任一居民成為摯友（5 顆心）', type: 'friend', n: 5, r: { coins: 1000, xp: 100, clovers: 3 } },
  { id: 'q21', text: '小鎮繁榮度達到 300', type: 'pros', n: 300, r: { coins: 1500, xp: 150, clovers: 3 } },
  { id: 'q22', text: '總資產達到 200,000', type: 'net', n: 200000, r: { coins: 3000, xp: 300, clovers: 5 } },
  { id: 'q23', text: '集滿全部物品圖鑑', type: 'dex', n: 0, r: { coins: 5000, xp: 500, clovers: 8 } },
  { id: 'q24', text: '總資產達到 1,000,000，成為傳說鎮長', type: 'net', n: 1000000, r: { coins: 10000, xp: 1000, clovers: 10 } },
];

/* 每日任務範本 */
const DAILY_TEMPLATES = [
  { key: 'harvested', text: n => `收成 ${n} 份作物`, base: 20, per: 4 },
  { key: 'produced', text: n => `生產 ${n} 件畜產或加工品`, base: 6, per: 1.2 },
  { key: 'orders', text: n => `完成 ${n} 筆訂單`, base: 3, per: 0.3 },
  { key: 'sold', text: n => `在市場賣出 ${n} 件商品`, base: 10, per: 1.5 },
  { key: 'watered', text: n => `幫作物澆水 ${n} 次`, base: 8, per: 0.8 },
  { key: 'shopSold', text: n => `小舖賣出 ${n} 件商品`, base: 5, per: 1, minLvl: 6 },
];

/* 成就 */
const ACHIEVEMENTS = [
  { id: 'a_h1', name: '小小農夫', desc: '累計收成 100 份', type: 'stat', key: 'harvested', n: 100, clovers: 1 },
  { id: 'a_h2', name: '豐收之手', desc: '累計收成 1,000 份', type: 'stat', key: 'harvested', n: 1000, clovers: 3 },
  { id: 'a_h3', name: '大地之友', desc: '累計收成 10,000 份', type: 'stat', key: 'harvested', n: 10000, clovers: 8 },
  { id: 'a_p1', name: '工坊學徒', desc: '累計生產 100 件', type: 'stat', key: 'produced', n: 100, clovers: 1 },
  { id: 'a_p2', name: '工坊職人', desc: '累計生產 1,000 件', type: 'stat', key: 'produced', n: 1000, clovers: 4 },
  { id: 'a_o1', name: '好鄰居', desc: '完成 10 筆訂單', type: 'stat', key: 'orders', n: 10, clovers: 1 },
  { id: 'a_o2', name: '可靠的店長', desc: '完成 100 筆訂單', type: 'stat', key: 'orders', n: 100, clovers: 3 },
  { id: 'a_o3', name: '小鎮的心臟', desc: '完成 500 筆訂單', type: 'stat', key: 'orders', n: 500, clovers: 8 },
  { id: 'a_l1', name: '十級鎮民', desc: '達到 10 級', type: 'level', n: 10, clovers: 2 },
  { id: 'a_l2', name: '二十級鎮長', desc: '達到 20 級', type: 'level', n: 20, clovers: 4 },
  { id: 'a_l3', name: '三十級傳說', desc: '達到 30 級', type: 'level', n: 30, clovers: 8 },
  { id: 'a_n1', name: '小有積蓄', desc: '總資產 10,000', type: 'net', n: 10000, clovers: 2 },
  { id: 'a_n2', name: '小鎮富翁', desc: '總資產 100,000', type: 'net', n: 100000, clovers: 5 },
  { id: 'a_n3', name: '百萬鎮長', desc: '總資產 1,000,000', type: 'net', n: 1000000, clovers: 10 },
  { id: 'a_s1', name: '投資新手', desc: '股票累計獲利 1,000', type: 'stat', key: 'stockProfit', n: 1000, clovers: 2 },
  { id: 'a_s2', name: '狐狸的徒弟', desc: '股票累計獲利 20,000', type: 'stat', key: 'stockProfit', n: 20000, clovers: 5 },
  { id: 'a_b1', name: '存錢筒', desc: '累計賺取利息 1,000', type: 'stat', key: 'interest', n: 1000, clovers: 2 },
  { id: 'a_r1', name: '可愛的小鎮', desc: '繁榮度 100', type: 'pros', n: 100, clovers: 2 },
  { id: 'a_r2', name: '觀光勝地', desc: '繁榮度 500', type: 'pros', n: 500, clovers: 5 },
  { id: 'a_f1', name: '知心好友', desc: '任一居民 10 顆心', type: 'friend', n: 10, clovers: 5 },
  { id: 'a_d1', name: '連續七天', desc: '連續登入 7 天', type: 'stat', key: 'bestStreak', n: 7, clovers: 3 },
  { id: 'a_d2', name: '日日是好日', desc: '連續登入 30 天', type: 'stat', key: 'bestStreak', n: 30, clovers: 10 },
  { id: 'a_w1', name: '四季輪轉', desc: '經歷 4 個季節', type: 'stat', key: 'seasons', n: 4, clovers: 3 },
  { id: 'a_pp1', name: '熱鬧的小鎮', desc: '人口達到 100 人', type: 'popn', n: 100, clovers: 3 },
  { id: 'a_pp2', name: '小小城市', desc: '人口達到 300 人', type: 'popn', n: 300, clovers: 6 },
  { id: 'a_x1', name: '收藏家', desc: '圖鑑收集 30 種物品', type: 'dexn', n: 30, clovers: 3 },
];

/* 定存方案 */
const DEPOSIT_PLANS = [
  { id: 'd1', name: '一小時小定存', hours: 1, rate: 0.01 },
  { id: 'd8', name: '一覺好眠定存', hours: 8, rate: 0.06 },
  { id: 'd24', name: '一日安心定存', hours: 24, rate: 0.15 },
  { id: 'd72', name: '三日長長久久', hours: 72, rate: 0.4 },
];
const SAVINGS_RATE_HOURLY = 0.0015;   // 活存每小時 0.15%
const LOAN_RATE_HOURLY = 0.005;       // 貸款每小時 0.5%
