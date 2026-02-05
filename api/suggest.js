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

// チェーン店キーワード（店名の部分一致で判定）
const CHAIN_KEYWORDS = [
  'サイゼリヤ','マクドナルド','スターバックス','ドトール','コメダ',
  'ガスト','ジョナサン','すき家','吉野家','松屋','バーガーキング',
  'モスバーガー','ケンタッキー','丸亀製麺','はなまるうどん','日高屋',
  '幸楽苑','くら寿司','スシロー','はま寿司','鳥貴族','串カツ田中',
  '牛角','大戸屋','リンガーハット',
];

function isChainStore(name) {
  if (!name) return false;
  return CHAIN_KEYWORDS.some(kw => name.includes(kw));
}

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

// 業種別の営業時間ヒューリスティック（JST, 24h）
// API課金を避けるためcurrentOpeningHoursは使わず推定で除外
const TYPE_HOURS = {
  cafe:                { open: 7,  close: 21 },
  coffee_shop:         { open: 7,  close: 21 },
  bakery:              { open: 7,  close: 19 },
  book_store:          { open: 10, close: 21 },
  restaurant:          { open: 11, close: 23 },
  ramen_restaurant:    { open: 11, close: 23 },
  japanese_restaurant: { open: 11, close: 22 },
  bar:                 { open: 17, close: 2  },  // 深夜営業
  spa:                 { open: 10, close: 23 },
  park:                { open: 0,  close: 24 },  // 終日
  museum:              { open: 9,  close: 17 },
  art_gallery:         { open: 10, close: 18 },
  movie_theater:       { open: 9,  close: 24 },
};

function isLikelyOpen(primaryType, nowHourJST) {
  const hours = TYPE_HOURS[(primaryType || '').toLowerCase()];
  if (!hours) return true; // 不明な業種は除外しない

  if (hours.close > hours.open) {
    // 通常: open <= now < close
    return nowHourJST >= hours.open && nowHourJST < hours.close;
  }
  // 日付跨ぎ（bar等）: open以降 OR close前
  return nowHourJST >= hours.open || nowHourJST < hours.close;
}

function getJSTHour() {
  const now = new Date();
  // UTC+9
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.getUTCHours();
}

// カテゴリ分類
const safeTypes = ['cafe', 'coffee_shop', 'bakery', 'book_store'];
const changeTypes = ['restaurant', 'ramen_restaurant', 'japanese_restaurant', 'bar'];
const adventureTypes = ['spa', 'park', 'museum', 'art_gallery', 'movie_theater'];

function categorizePlace(place) {
  const typeId = (place.primaryType || '').toLowerCase();
  if (safeTypes.some(t => typeId.includes(t))) return 'safe';
  if (adventureTypes.some(t => typeId.includes(t))) return 'adventure';
  return 'change';
}

// スロット割り当て（チェーン除外対応）
function assignSlots(places, excludeChains) {
  if (!places || places.length === 0) return [];

  // 各プレースにチェーンフラグとカテゴリを付与
  const tagged = places.map(p => ({
    ...p,
    _chain: isChainStore(p.displayName?.text),
    _category: categorizePlace(p),
  }));

  const nonChain = tagged.filter(p => !p._chain);
  const chain = tagged.filter(p => p._chain);

  const result = [];
  const usedIds = new Set();

  const pickRandom = (arr) => {
    const available = arr.filter(p => !usedIds.has(p.id));
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
  };

  // 各スロットを埋める
  for (const slot of ['safe', 'change', 'adventure']) {
    let pick = null;

    if (slot === 'safe') {
      // safe: まず非チェーンから、なければチェーンOK
      pick = pickRandom(nonChain.filter(p => p._category === slot))
          || pickRandom(nonChain)
          || pickRandom(chain.filter(p => p._category === slot))
          || pickRandom(chain);
    } else if (excludeChains) {
      // change/adventure: チェーン除外ON → 非チェーン優先、足りなければチェーンで埋める
      pick = pickRandom(nonChain.filter(p => p._category === slot))
          || pickRandom(nonChain)
          || pickRandom(chain.filter(p => p._category === slot))
          || pickRandom(chain);
    } else {
      // チェーン除外OFF → 全体から
      pick = pickRandom(tagged.filter(p => p._category === slot))
          || pickRandom(tagged);
    }

    if (pick) {
      usedIds.add(pick.id);
      result.push({
        slot,
        isChain: pick._chain,
        ...formatPlace(pick),
      });
    }
  }

  return result;
}

// Place データを整形
function formatPlace(place) {
  return {
    id: place.id || '',
    name: place.displayName?.text || '不明',
    typeLabel: place.primaryTypeDisplayName?.text || 'スポット',
    primaryType: place.primaryType || '',
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
    const { station, lat, lng, radius = 800, excludeChains = true } = req.body || {};

    // 座標を決定: lat/lng 直接指定 or 駅ID
    let latitude, longitude;
    let stationName = '指定地点';

    if (lat != null && lng != null) {
      latitude = Number(lat);
      longitude = Number(lng);
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid lat/lng' });
      }
      if (station && STATIONS[station]) {
        stationName = STATIONS[station].name;
      }
    } else if (station && STATIONS[station]) {
      const stationData = STATIONS[station];
      latitude = stationData.lat;
      longitude = stationData.lng;
      stationName = stationData.name;
    } else {
      return res.status(400).json({
        error: 'station ID or lat/lng required',
        validStations: Object.keys(STATIONS)
      });
    }

    const radiusNum = Math.min(Math.max(Number(radius) || 800, 100), 2000);

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
        rankPreference: 'DISTANCE',
        languageCode: 'ja',
        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
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
    const allPlaces = placesData.places || [];

    // 営業時間外を推定除外（JST時刻 + 業種ヒューリスティック、API課金なし）
    const nowHour = getJSTHour();
    const places = allPlaces.filter(p => isLikelyOpen(p.primaryType, nowHour));

    if (places.length === 0) {
      return res.status(200).json({
        items: [],
        message: '現在営業中のスポットが見つかりませんでした'
      });
    }

    // 3件選んでスロット割り当て（チェーン除外考慮）
    const items = assignSlots(places, excludeChains);

    return res.status(200).json({
      items,
      station: stationName,
      radius: radiusNum,
      totalFound: places.length,
      excludeChains,
    });

  } catch (error) {
    console.error('Suggest API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
