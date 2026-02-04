/**
 * Vercel Serverless Function: /api/health
 * Google Places API キーの疎通確認用
 *
 * 最小限のリクエストで接続を確認する
 * - FieldMask 最小（places.id のみ）
 * - maxResultCount: 1
 * - 課金への影響を最小化
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const checks = {
    timestamp: new Date().toISOString(),
    env_key_set: false,
    places_api_reachable: false,
    places_api_status: null,
    error: null,
  };

  // 1. 環境変数チェック
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    checks.error = 'GOOGLE_MAPS_API_KEY is not set in Vercel Environment Variables';
    return res.status(500).json(checks);
  }
  checks.env_key_set = true;

  // 2. Places API 疎通チェック（最小リクエスト）
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({
        includedTypes: ['cafe'],
        maxResultCount: 1,
        languageCode: 'ja',
        locationRestriction: {
          circle: {
            center: { latitude: 35.466188, longitude: 139.622715 }, // 横浜駅
            radius: 100,
          },
        },
      }),
    });

    checks.places_api_status = response.status;

    if (response.ok) {
      checks.places_api_reachable = true;
      const data = await response.json();
      checks.places_returned = (data.places || []).length;
    } else {
      const errorText = await response.text();
      let parsed;
      try { parsed = JSON.parse(errorText); } catch { parsed = errorText; }
      checks.error = parsed;
    }
  } catch (err) {
    checks.error = `Network error: ${err.message}`;
  }

  const allOk = checks.env_key_set && checks.places_api_reachable;
  return res.status(allOk ? 200 : 502).json(checks);
}
