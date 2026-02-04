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
export async function suggestPlaces(station, radius = 800) {
  const response = await fetch('/api/suggest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ station, radius }),
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
