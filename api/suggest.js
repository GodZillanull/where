/**
 * Vercel Serverless Function: /api/suggest
 * Google Places API (New) searchNearby を使用して寄り道スポットを提案
 *
 * 課金地雷回避:
 * - searchNearby 1回/提案のみ
 * - Place Details は使わない
 * - FieldMask は最小限に固定
 */

// 駅座標データ（ハードコード）
const STATIONS = {
  yokohama: { name: '横浜駅', lat: 35.466188, lng: 139.622715 },
  hamamatsu: { name: '浜松駅', lat: 34.703897, lng: 137.734121 },
};

// レート制限用インメモリストア（Serverless のため再起動でリセット）
const rateLimitStore = new Map();

// レート制限チェック
function checkRateLimit(ip) {
  const now = Date.now();
  const minute = 60 * 1000;
  const day = 24 * 60 * 60 * 1000;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { requests: [], dailyCount: 0, dailyReset: now + day });
  }

  const record = rateLimitStore.get(ip);

  // 日次リセット
  if (now > record.dailyReset) {
    record.dailyCount = 0;
    record.dailyReset = now + day;
  }

  // 1分以内のリクエストをフィルタ
  record.requests = record.requests.filter(t => now - t < minute);

  // 制限チェック: 10 req/min, 100 req/day
  if (record.requests.length >= 10) {
    return { allowed: false, reason: 'Too many requests per minute (max 10/min)' };
  }
  if (record.dailyCount >= 100) {
    return { allowed: false, reason: 'Daily limit exceeded (max 100/day)' };
  }

  // リクエスト記録
  record.requests.push(now);
  record.dailyCount++;

  return { allowed: true };
}

// スロット割り当て（カテゴリベースで safe/change/adventure に分類）
function assignSlots(places) {
  if (!places || places.length === 0) return [];

  // カテゴリ分類
  const safeTypes = ['cafe', 'coffee_shop', 'bakery', 'book_store'];
  const changeTypes = ['restaurant', 'ramen_restaurant', 'japanese_restaurant', 'bar'];
  const adventureTypes = ['spa', 'park', 'museum', 'art_gallery', 'movie_theater'];

  const categorized = {
    safe: [],
    change: [],
    adventure: [],
  };

  for (const place of places) {
    const typeId = place.primaryType || '';
    const typeLower = typeId.toLowerCase();

    if (safeTypes.some(t => typeLower.includes(t))) {
      categorized.safe.push(place);
    } else if (adventureTypes.some(t => typeLower.includes(t))) {
      categorized.adventure.push(place);
    } else {
      categorized.change.push(place);
    }
  }

  // 各スロットから1件ずつ選択（ランダム）
  const result = [];

  const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  // safe
  let safePick = pickRandom(categorized.safe) || pickRandom(places);
  if (safePick) {
    result.push({ slot: 'safe', ...formatPlace(safePick) });
    places = places.filter(p => p.id !== safePick.id);
  }

  // change
  let changePick = pickRandom(categorized.change) || pickRandom(places);
  if (changePick) {
    result.push({ slot: 'change', ...formatPlace(changePick) });
    places = places.filter(p => p.id !== changePick.id);
  }

  // adventure
  let adventurePick = pickRandom(categorized.adventure) || pickRandom(places);
  if (adventurePick) {
    result.push({ slot: 'adventure', ...formatPlace(adventurePick) });
  }

  return result;
}

// Place データを整形
function formatPlace(place) {
  return {
    id: place.id || '',
    name: place.displayName?.text || '不明',
    typeLabel: place.primaryTypeDisplayName?.text || 'スポット',
    address: place.shortFormattedAddress || '',
    mapsUrl: place.googleMapsUri || '',
  };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // レート制限
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: rateCheck.reason });
  }

  try {
    const { station, radius = 800 } = req.body || {};

    // バリデーション
    if (!station || !STATIONS[station]) {
      return res.status(400).json({
        error: 'Invalid station',
        validStations: Object.keys(STATIONS)
      });
    }

    const radiusNum = Math.min(Math.max(Number(radius) || 800, 100), 2000);
    const stationData = STATIONS[station];

    // Google Places API キー
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Google Places API (New) searchNearby 呼び出し
    const placesResponse = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.googleMapsUri,places.primaryType,places.primaryTypeDisplayName,places.shortFormattedAddress',
      },
      body: JSON.stringify({
        includedTypes: ['restaurant', 'cafe', 'bar', 'spa', 'park', 'museum', 'book_store'],
        maxResultCount: 20,
        rankPreference: 'POPULARITY',
        languageCode: 'ja',
        locationRestriction: {
          circle: {
            center: {
              latitude: stationData.lat,
              longitude: stationData.lng,
            },
            radius: radiusNum,
          },
        },
      }),
    });

    if (!placesResponse.ok) {
      const errorText = await placesResponse.text();
      console.error('Places API error:', placesResponse.status, errorText);
      return res.status(502).json({
        error: 'Places API request failed',
        details: placesResponse.status
      });
    }

    const placesData = await placesResponse.json();
    const places = placesData.places || [];

    if (places.length === 0) {
      return res.status(200).json({
        items: [],
        message: '周辺にスポットが見つかりませんでした'
      });
    }

    // 3件選んでスロット割り当て
    const items = assignSlots(places);

    return res.status(200).json({
      items,
      station: stationData.name,
      radius: radiusNum,
      totalFound: places.length,
    });

  } catch (error) {
    console.error('Suggest API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
