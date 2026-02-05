/**
 * Google Places API (via Vercel Serverless Function) クライアント
 *
 * /api/suggest を呼び出して周辺スポットを取得
 */

// 利用可能な駅
export const AVAILABLE_STATIONS = {
  yokohama: { id: 'yokohama', name: '横浜駅', lat: 35.466188, lng: 139.622715 },
  hamamatsu: { id: 'hamamatsu', name: '浜松駅', lat: 34.703897, lng: 137.734121 },
};

// 利用可能な半径
export const AVAILABLE_RADII = [
  { value: 600, label: '600m' },
  { value: 800, label: '800m' },
  { value: 1000, label: '1km' },
];

// スロット情報
export const SLOT_INFO = {
  safe: {
    name: '安牌',
    emoji: '📍',
    color: '#34C759',
    description: '確実に良い、駅から近い',
  },
  change: {
    name: '気分転換',
    emoji: '👟',
    color: '#FF9500',
    description: '少し違う体験',
  },
  adventure: {
    name: '冒険',
    emoji: '🚀',
    color: '#FF3B30',
    description: '新しい発見',
  },
};

/**
 * 周辺スポットを提案
 * @param {string} station - 駅ID (yokohama | hamamatsu)
 * @param {number} radius - 検索半径 (m)
 * @returns {Promise<{items: Array, station: string, radius: number, totalFound: number}>}
 */
export async function suggestPlaces(station, radius = 800, excludeChains = true) {
  const response = await fetch('/api/suggest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ station, radius, excludeChains }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    if (response.status === 429) {
      throw new Error(error.error || 'リクエスト制限に達しました。しばらく待ってからお試しください。');
    }

    throw new Error(error.error || 'スポットの取得に失敗しました');
  }

  return response.json();
}

/**
 * lat/lng 指定で周辺スポットを提案
 * @param {number} lat - 緯度
 * @param {number} lng - 経度
 * @param {number} radius - 検索半径 (m)
 * @returns {Promise<{items: Array}>}
 */
export async function suggestByLocation(lat, lng, radius = 800, excludeChains = true) {
  const response = await fetch('/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, radius, excludeChains }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error(error.error || 'リクエスト制限に達しました');
    }
    throw new Error(error.error || 'スポットの取得に失敗しました');
  }

  return response.json();
}

/**
 * HeartRails Express API で駅名 → 緯度経度を取得
 * (無料・キー不要)
 */
export async function getStationLatLng(stationName) {
  const name = stationName.replace(/駅$/, '');
  const response = await fetch(
    `https://express.heartrails.com/api/json?method=getStations&name=${encodeURIComponent(name)}`
  );
  const data = await response.json();
  const stations = data.response?.station;
  if (!stations || stations.length === 0) return null;
  return { lat: parseFloat(stations[0].y), lng: parseFloat(stations[0].x) };
}

// Places API 結果 → 寄り道スポット形式に変換
const TYPE_DEFAULTS = {
  cafe:       { emoji: '☕', type: 'cafe',      stayTime: 40, budget: '800円', reasons: [
    '知らない街のカフェって、なぜかワクワクする',
    '今日の自分に、一杯のご褒美を',
    'コーヒーの香りで、頭のスイッチを切り替える',
    'ふらっと入るカフェが、意外と当たりだったりする',
  ]},
  coffee_shop:{ emoji: '☕', type: 'cafe',      stayTime: 30, budget: '600円', reasons: [
    '一杯のコーヒーが、今日を少し特別にする',
    '立ち寄るだけで気分転換。それで十分',
    '知らない店のコーヒーは、小さな冒険',
  ]},
  bakery:     { emoji: '🍞', type: 'cafe',      stayTime: 25, budget: '500円', reasons: [
    '焼きたてのパンの匂い。それだけで寄る価値がある',
    '自分へのお土産に、一つだけ選ぶ贅沢',
    'パン屋は裏切らない。間違いなく幸せになれる',
  ]},
  book_store: { emoji: '📚', type: 'bookstore', stayTime: 40, budget: '0円',   reasons: [
    '次に読む一冊、偶然の出会いで見つける',
    '本棚を眺めるだけで、頭が整理される',
    '買わなくてもいい。背表紙を眺めるだけの時間',
  ]},
  restaurant: { emoji: '🍽', type: 'restaurant', stayTime: 50, budget: '1200円', reasons: [
    '知らない店に飛び込む。それだけで今日は冒険',
    'いつもと違う味に出会う日にしよう',
    'メニューを見て決める。それが一番楽しい',
  ]},
  ramen_restaurant:   { emoji: '🍜', type: 'restaurant', stayTime: 30, budget: '1000円', reasons: [
    '一杯で満たされる。シンプルに最高',
    '帰り道のラーメンは、自分への最高のご褒美',
    'サッと食べてサッと出る。寄り道の王道',
  ]},
  japanese_restaurant: { emoji: '🍱', type: 'restaurant', stayTime: 45, budget: '1200円', reasons: [
    'ちゃんとした和食って、心まで整う',
    '丁寧に作られたごはんで、今日の自分を労う',
    '和食は間違いない。静かに味わう贅沢',
  ]},
  bar:        { emoji: '🍻', type: 'bar',       stayTime: 60, budget: '2000円', reasons: [
    'カウンターで一杯。それが最高の寄り道',
    '今日の疲れを、一杯で流す',
    '知らないバーの扉を開ける。大人の冒険',
  ]},
  spa:        { emoji: '♨️', type: 'sento',     stayTime: 60, budget: '800円',  reasons: [
    '湯に浸かれば、今日の疲れが溶けていく',
    '風呂上がりの一杯の牛乳。それが至福',
    '何も考えず、ただ温まる。それだけでいい',
  ]},
  park:       { emoji: '🌳', type: 'park',      stayTime: 30, budget: '0円',   reasons: [
    '何もしない贅沢。ベンチに座るだけでいい',
    '空を見上げる時間、最近とってなくない？',
    '散歩するだけで、頭がクリアになる',
  ]},
  museum:     { emoji: '🏛', type: 'gallery',   stayTime: 60, budget: '1000円', reasons: [
    '知らないアートに出会う。感性のストレッチ',
    'たまには脳に違う刺激を入れてみる',
    '静かな空間で、自分のペースで過ごせる',
  ]},
  art_gallery:{ emoji: '🎨', type: 'gallery',   stayTime: 45, budget: '800円',  reasons: [
    'ふらっとアートを見る。それだけで視野が広がる',
    '好きか嫌いかだけでいい。理屈はいらない',
    '誰かの表現に触れる。それが一番の刺激',
  ]},
  movie_theater: { emoji: '🎬', type: 'cinema', stayTime: 120, budget: '1800円', reasons: [
    '2時間、現実を忘れる贅沢',
    '映画は一人で観るのが一番贅沢',
    '暗闇の中で、物語に没入する時間',
  ]},
};

const DEFAULT_TYPE = { emoji: '📍', type: 'spot', stayTime: 30, budget: '---', reasons: [
  'ちょっと寄り道。それだけで今日が変わる',
  '知らない場所を歩く。それが一番の気分転換',
] };

function pickReason(reasons) {
  if (!reasons || reasons.length === 0) return '';
  return reasons[Math.floor(Math.random() * reasons.length)];
}

/**
 * Places API の結果を寄り道スポット形式に変換
 * @param {Array} items - /api/suggest の items
 * @param {string} stationName - 駅名
 * @returns {Array} 寄り道スポット形式の配列
 */
export function convertToYorimichiSpots(items, stationName) {
  return items.map((item) => {
    const typeKey = item.typeLabel ? Object.keys(TYPE_DEFAULTS).find(
      k => item.typeLabel.toLowerCase().includes(k.replace('_', ' ')) ||
           k.includes(item.typeLabel.toLowerCase())
    ) : null;
    const defaults = TYPE_DEFAULTS[typeKey] || DEFAULT_TYPE;

    return {
      id: `places_${item.id}`,
      name: item.name,
      type: defaults.type,
      emoji: defaults.emoji,
      area: item.address || '',
      station: stationName,
      line: '',
      zure: item.slot, // safe / change / adventure
      effects: ['recovery'],
      stayTime: defaults.stayTime,
      walkFromStation: 5,
      budget: defaults.budget,
      soloFriendly: 3,
      crowdLevel: 2,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: false,
      reason: pickReason(defaults.reasons),
      backup: '',
      highlight: item.typeLabel || 'スポット',
      hours: '',
      mapsUrl: item.mapsUrl || '',
      fromPlacesApi: true, // API経由フラグ
      isChain: item.isChain || false,
    };
  });
}

/**
 * リロール（再提案）- 1日1回制限
 */
const REROLL_KEY = 'yorumichi_last_reroll';

export function canReroll() {
  const last = localStorage.getItem(REROLL_KEY);
  if (!last) return true;

  const lastDate = new Date(parseInt(last, 10));
  const now = new Date();

  // 日付が変わっていればOK
  return lastDate.toDateString() !== now.toDateString();
}

export function markRerolled() {
  localStorage.setItem(REROLL_KEY, Date.now().toString());
}

export function getRerollMessage() {
  if (canReroll()) return null;
  return '今日のリロールは使用済みです（1日1回まで）';
}
