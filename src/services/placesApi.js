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
  cafe:       { emoji: '☕', type: 'cafe',      stayTime: 40, budget: '800円', reason: '' },
  coffee_shop:{ emoji: '☕', type: 'cafe',      stayTime: 30, budget: '600円', reason: '' },
  bakery:     { emoji: '🍞', type: 'cafe',      stayTime: 25, budget: '500円', reason: '' },
  book_store: { emoji: '📚', type: 'bookstore', stayTime: 40, budget: '0円',   reason: '' },
  restaurant: { emoji: '🍽', type: 'restaurant', stayTime: 50, budget: '1200円', reason: '' },
  ramen_restaurant:   { emoji: '🍜', type: 'restaurant', stayTime: 30, budget: '1000円', reason: '' },
  japanese_restaurant: { emoji: '🍱', type: 'restaurant', stayTime: 45, budget: '1200円', reason: '' },
  bar:        { emoji: '🍻', type: 'bar',       stayTime: 60, budget: '2000円', reason: '' },
  spa:        { emoji: '♨️', type: 'sento',     stayTime: 60, budget: '800円',  reason: '' },
  park:       { emoji: '🌳', type: 'park',      stayTime: 30, budget: '0円',   reason: '' },
  museum:     { emoji: '🏛', type: 'gallery',   stayTime: 60, budget: '1000円', reason: '' },
  art_gallery:{ emoji: '🎨', type: 'gallery',   stayTime: 45, budget: '800円',  reason: '' },
  movie_theater: { emoji: '🎬', type: 'cinema', stayTime: 120, budget: '1800円', reason: '' },
};

const DEFAULT_TYPE = { emoji: '📍', type: 'spot', stayTime: 30, budget: '---', reason: '' };

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
      reason: defaults.reason, // 空。後でyorimichiData.jsに手動で入れる
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
