/**
 * PlacesSuggest - Google Places API を使った寄り道提案
 *
 * 駅選択 → 提案ボタン → 3枚カード表示 → Google Maps遷移
 */
import { useState, useEffect } from 'react';
import {
  AVAILABLE_STATIONS,
  AVAILABLE_RADII,
  SLOT_INFO,
  suggestPlaces,
  canReroll,
  markRerolled,
  getRerollMessage,
} from '../../services/placesApi';

export default function PlacesSuggest({ onBack }) {
  const [station, setStation] = useState('yokohama');
  const [radius, setRadius] = useState(800);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 接続ステータス: 'checking' | 'ok' | 'error'
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        if (cancelled) return;
        if (data.env_key_set && data.places_api_reachable) {
          setApiStatus('ok');
        } else {
          setApiStatus('error');
          setApiError(data.error || 'API接続に失敗しました');
        }
      } catch {
        if (cancelled) return;
        setApiStatus('error');
        setApiError('ヘルスチェックに接続できません');
      }
    }
    checkHealth();
    return () => { cancelled = true; };
  }, []);

  // 提案を取得
  const handleSuggest = async (isReroll = false) => {
    // リロール制限チェック
    if (isReroll && !canReroll()) {
      setError(getRerollMessage());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await suggestPlaces(station, radius);
      setResults(data);
      setHasSearched(true);

      if (isReroll) {
        markRerolled();
      }
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Google Mapsを開く
  const openMaps = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="px-6 pb-12">
        <div className="max-w-lg mx-auto pt-12">
          {/* Back */}
          {onBack && (
            <button
              onClick={onBack}
              className="text-[15px] text-[#86868B] mb-8 transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>
          )}

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-[#1D1D1F]">周辺スポット検索</h1>
            <p className="text-[14px] text-[#86868B] mt-2">
              Google Places APIで周辺のスポットを探します
            </p>

            {/* 接続ステータス */}
            <div className="mt-3">
              {apiStatus === 'checking' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#F5F5F7] text-[#86868B]">
                  <span className="w-2 h-2 rounded-full bg-[#86868B] animate-pulse" />
                  API接続を確認中...
                </span>
              )}
              {apiStatus === 'ok' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#E8F5E9] text-[#2E7D32]">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                  Google Places API 接続済み
                </span>
              )}
              {apiStatus === 'error' && (
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFF0F0] text-[#FF3B30]">
                    <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
                    API接続エラー
                  </span>
                  {apiError && (
                    <p className="text-[12px] text-[#FF3B30] mt-2">{apiError}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Station Selection */}
          <div className="mb-6">
            <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-3">
              駅を選択
            </p>
            <div className="flex gap-3">
              {Object.values(AVAILABLE_STATIONS).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStation(s.id)}
                  className="flex-1 py-4 rounded-xl text-[15px] font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: station === s.id ? '#1D1D1F' : '#FFFFFF',
                    color: station === s.id ? '#FFFFFF' : '#1D1D1F',
                    border: station === s.id ? 'none' : '1px solid #E5E5E7',
                    boxShadow: station !== s.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  🚉 {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Radius Selection */}
          <div className="mb-8">
            <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-3">
              検索範囲
            </p>
            <div className="flex gap-3">
              {AVAILABLE_RADII.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRadius(r.value)}
                  className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all duration-300"
                  style={{
                    backgroundColor: radius === r.value ? '#007AFF' : '#FFFFFF',
                    color: radius === r.value ? '#FFFFFF' : '#1D1D1F',
                    border: radius === r.value ? 'none' : '1px solid #E5E5E7',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleSuggest(false)}
            disabled={loading}
            className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: '#1D1D1F' }}
          >
            {loading ? '検索中...' : '提案する'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-[#FFF0F0] rounded-xl">
              <p className="text-[14px] text-[#FF3B30]">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && results.items && results.items.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">
                  {results.station}周辺（{results.totalFound}件中3件）
                </p>
                {/* Reroll Button */}
                <button
                  onClick={() => handleSuggest(true)}
                  disabled={loading || !canReroll()}
                  className="text-[13px] text-[#007AFF] font-medium disabled:text-[#C7C7CC]"
                >
                  🔄 別の候補
                </button>
              </div>

              <div className="space-y-4">
                {results.items.map((item, index) => {
                  const slotInfo = SLOT_INFO[item.slot] || SLOT_INFO.change;
                  return (
                    <div
                      key={item.id || index}
                      className="bg-white rounded-2xl overflow-hidden"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                    >
                      <div className="p-5">
                        {/* Slot Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="px-3 py-1 rounded-full text-[12px] font-semibold text-white"
                            style={{ backgroundColor: slotInfo.color }}
                          >
                            {slotInfo.emoji} {slotInfo.name}
                          </span>
                          <span className="text-[12px] text-[#86868B]">
                            {slotInfo.description}
                          </span>
                        </div>

                        {/* Place Info */}
                        <h3 className="text-[18px] font-bold text-[#1D1D1F] mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[13px] text-[#86868B] mb-1">
                          {item.typeLabel}
                        </p>
                        <p className="text-[13px] text-[#86868B] mb-4">
                          📍 {item.address}
                        </p>

                        {/* Action Button */}
                        <button
                          onClick={() => openMaps(item.mapsUrl)}
                          className="w-full py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                          style={{ backgroundColor: slotInfo.color }}
                        >
                          Google Mapsで開く
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {hasSearched && results && results.items && results.items.length === 0 && (
            <div className="mt-8 p-6 bg-white rounded-2xl text-center">
              <p className="text-[48px] mb-3">🔍</p>
              <p className="text-[16px] font-semibold text-[#1D1D1F] mb-2">
                スポットが見つかりませんでした
              </p>
              <p className="text-[14px] text-[#86868B]">
                検索範囲を広げてみてください
              </p>
            </div>
          )}

          {/* API Info */}
          <div className="mt-8 p-4 bg-[#F5F5F7] rounded-xl">
            <p className="text-[12px] text-[#86868B] text-center">
              Powered by Google Places API (New)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
