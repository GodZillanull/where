import { useState, useEffect } from 'react';

import { Analytics } from '../../services/analytics';
import { yorimichi } from '../../data/yorimichiData';
import { plans, questions, typeInfo } from '../../data/weekendData';
import { searchStations } from '../../data/stationData';
import { calcUserType, selectWeekendPlans } from '../../domain/weekendPlanner';
import { DEFAULT_YORIMICHI_INPUT, selectYorimichiSpots } from '../../domain/yorimichiPlanner';
import { getStationLatLng, suggestByLocation, convertToYorimichiSpots } from '../../services/placesApi';

// ===== MAIN APP =====
export default function Detour({ onSuggest }) {
  // 共通state
  const [screen, setScreen] = useState('home');
  const [_mode, setMode] = useState(null); // 'weekend' or 'yorimichi'
  const [animate, setAnimate] = useState(false);

  // 週末プラン用state
  const [region, setRegion] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userType, setUserType] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showOthers, setShowOthers] = useState(false); // 「他も見る」の展開状態
  const [showSpotDetails, setShowSpotDetails] = useState(false); // 深津流：詳細展開状態

  // 寄り道用state
  const [yorimichiInput, setYorimichiInput] = useState({ ...DEFAULT_YORIMICHI_INPUT });
  const [yorimichiResults, setYorimichiResults] = useState([]);
  const [selectedYorimichi, setSelectedYorimichi] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [stationSuggestions, setStationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isStationInputFocused, setIsStationInputFocused] = useState(false);

  // 駅名入力時のサジェスト更新
  const handleStationInput = (value) => {
    setYorimichiInput(prev => ({ ...prev, homeStation: value }));
    if (value.length > 0) {
      const suggestions = searchStations(value, 8);
      setStationSuggestions(suggestions);
    } else {
      setStationSuggestions([]);
    }
    setShowSuggestions(true);
  };

  // サジェスト選択
  const selectStation = (station) => {
    setYorimichiInput(prev => ({ ...prev, homeStation: station }));
    setShowSuggestions(false);
    setStationSuggestions([]);
    setIsStationInputFocused(false);
  };

  // 現在地から駅を取得してサジェストを閉じる
  const handleCurrentLocationSelect = () => {
    setShowSuggestions(false);
    setIsStationInputFocused(false);
    getNearestStation();
  };

  // 現在地から最寄り駅を取得（JSONP使用）
  const getNearestStation = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません');
      return;
    }
    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // HeartRails Express API（JSONPで取得）
        const callbackName = 'heartrailsCallback_' + Date.now();
        const script = document.createElement('script');

        window[callbackName] = (data) => {
          if (data.response?.station?.[0]) {
            const station = data.response.station[0];
            setYorimichiInput(prev => ({ ...prev, homeStation: station.name }));
          } else {
            alert('最寄り駅が見つかりませんでした');
          }
          setIsGettingLocation(false);
          delete window[callbackName];
          script.remove();
        };

        script.src = `https://express.heartrails.com/api/json?method=getStations&x=${longitude}&y=${latitude}&callback=${callbackName}`;
        script.onerror = () => {
          alert('最寄り駅の取得に失敗しました');
          setIsGettingLocation(false);
          delete window[callbackName];
          script.remove();
        };
        document.body.appendChild(script);
      },
      (error) => {
        setIsGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          const openSettings = confirm(
            '位置情報の使用が許可されていません。\n\n' +
            '設定アプリを開いて許可しますか？\n\n' +
            '【設定方法】\n' +
            'iOS: 設定 → プライバシー → 位置情報サービス → Safari\n' +
            'Android: 設定 → アプリ → ブラウザ → 権限 → 位置情報'
          );
          if (openSettings) {
            // iOSの設定アプリを開く試み（動作しない場合もある）
            window.location.href = 'app-settings:';
          }
        } else {
          alert('位置情報の取得に失敗しました');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [showYorimichiGo, setShowYorimichiGo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showMehReasons, setShowMehReasons] = useState(false); // 微妙理由選択表示

  // 微妙理由（memo.txt準拠）
  const mehReasons = [
    { id: 'crowded', label: '混んでた', emoji: '👥' },
    { id: 'expensive', label: '高かった', emoji: '💸' },
    { id: 'far', label: '遠かった', emoji: '🚶' },
    { id: 'intimidating', label: '入りづらかった', emoji: '😰' },
    { id: 'mood', label: '気分と違った', emoji: '🤔' },
  ];

  // スポット進行状態: 'ready'(出発前) | 'arrived'(到着) | 'done'(完了)
  const [spotProgress, setSpotProgress] = useState({});

  // スポット進行状態をリセット
  const resetSpotProgress = () => setSpotProgress({});

  // 現在のスポット状態を取得
  const getSpotStatus = (index) => spotProgress[index] || 'ready';

  /* eslint-disable react-hooks/set-state-in-effect */
  // 画面遷移時のアニメーションリセット用
  useEffect(() => {
    setAnimate(true);
  }, [screen, qIdx, selected, showMap, selectedYorimichi, showYorimichiGo, showRating]);

  // 深津流: スポット切り替え時に展開状態をリセット
  useEffect(() => {
    setShowSpotDetails(false);
  }, [showMap]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 計測: plan_view（プラン詳細表示時）
  useEffect(() => {
    if (selected) {
      Analytics.planView(selected.id, selected.title);
    }
  }, [selected]);

  // 計測: plan_view（寄り道詳細表示時）
  useEffect(() => {
    if (selectedYorimichi) {
      Analytics.planView(selectedYorimichi.id, selectedYorimichi.name);
    }
  }, [selectedYorimichi]);

  // ===== 週末プラン用ロジック =====

  const answer = (opt) => {
    const newAns = [...answers, opt];
    setAnswers(newAns);
    setAnimate(false);
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(qIdx + 1);
      } else {
        const type = calcUserType(newAns);
        setUserType(type);
        setResults(selectWeekendPlans(plans, type, region));
        setScreen('result');
      }
    }, 200);
  };

  // ===== 寄り道用ロジック =====
  const submitYorimichi = async () => {
    // まずハードコードデータから検索
    let spots = selectYorimichiSpots(yorimichiInput, yorimichi);

    // 3件未満の場合、Places API で補完
    if (spots.length < 3 && yorimichiInput.homeStation) {
      try {
        const coords = await getStationLatLng(yorimichiInput.homeStation);
        if (coords) {
          const data = await suggestByLocation(coords.lat, coords.lng, 800);
          if (data.items && data.items.length > 0) {
            const apiSpots = convertToYorimichiSpots(data.items, yorimichiInput.homeStation + '駅');
            // ハードコードで足りない zure スロットを API で補完
            const existingZures = new Set(spots.map(s => s.zure));
            for (const apiSpot of apiSpots) {
              if (spots.length >= 3) break;
              if (!existingZures.has(apiSpot.zure)) {
                spots.push(apiSpot);
                existingZures.add(apiSpot.zure);
              }
            }
            // まだ3件未満なら残りも追加
            for (const apiSpot of apiSpots) {
              if (spots.length >= 3) break;
              if (!spots.find(s => s.id === apiSpot.id)) {
                spots.push(apiSpot);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Places API 補完失敗:', err.message);
        // API失敗してもハードコードデータで続行
      }
    }

    setYorimichiResults(spots);
    setScreen('yorimichi-result');
    setAnimate(false);
  };

  // ===== 共通ロジック =====
  const reset = () => {
    setScreen('home');
    setMode(null);
    setRegion(null);
    setQIdx(0);
    setAnswers([]);
    setUserType(null);
    setResults([]);
    setSelected(null);
    setShowMap(false);
    setShowOthers(false);
    setShowSpotDetails(false);
    setYorimichiResults([]);
    setSelectedYorimichi(null);
    setShowYorimichiGo(false);
    setShowRating(false);
    setShowMehReasons(false);
    setYorimichiInput({ ...DEFAULT_YORIMICHI_INPUT });
    resetSpotProgress();
  };

  const openUrl = (url) => window.open(url, '_blank');

  // ========== MAP BOTTOM SHEET (オーバーレイ) ==========
  const renderMapSheet = () => {
    if (!selected || !showMap) return null;

    const plan = selected;
    const currentSpot = showMap.spot;
    const currentIndex = showMap.index;

    // アンカー目的地のマップURL（到達保証）
    const mapUrl = currentSpot.anchor?.mapUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSpot.anchor?.name || currentSpot.label || currentSpot.name)}`;
    const mapQuery = encodeURIComponent(currentSpot.anchor?.name || currentSpot.label || currentSpot.name);

    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        onClick={() => setShowMap(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" />

        {/* Sheet */}
        <div
          className="relative w-full max-w-lg bg-white rounded-t-3xl overflow-hidden transition-transform duration-300 ease-out"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full" />
          </div>

          {/* Spot Switcher */}
          {plan.spots.length > 1 && (
            <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
              {plan.spots.map((spot, i) => {
                const spotLabel = spot.label || spot.name;
                return (
                  <button
                    key={i}
                    onClick={() => setShowMap({ spot, index: i })}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                      i === currentIndex
                        ? 'text-white'
                        : getSpotStatus(i) === 'done'
                          ? 'bg-[#34C759]/20 text-[#34C759]'
                          : 'bg-[#F2F2F7] text-[#1D1D1F]'
                    }`}
                    style={i === currentIndex ? { backgroundColor: plan.color } : {}}
                  >
                    {getSpotStatus(i) === 'done' ? '✓' : i + 1}. {spotLabel.length > 5 ? spotLabel.slice(0, 5) + '…' : spotLabel}
                  </button>
                );
              })}
            </div>
          )}

          {/* Map */}
          <div className="relative bg-[#E5E5EA]" style={{ height: '200px' }}>
            <iframe
              title="map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=15`}
            />
          </div>

          {/* Spot Info */}
          <div className="p-6">
            {/* ヘッダー */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${plan.color}15` }}
              >
                {currentSpot.emoji || (currentIndex + 1)}
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#86868B] mb-1">Step {currentIndex + 1}/{plan.spots.length}</p>
                <h2 className="text-[20px] font-bold text-[#1D1D1F]">{currentSpot.label || currentSpot.name}</h2>
              </div>
            </div>

            {/* 深津流：reason（なぜここか）を最初に見せる */}
            {currentSpot.anchor && (
              <div className="mb-4">
                {/* 店名 + reason */}
                <p className="text-[15px] font-semibold text-[#1D1D1F] mb-2">📍 {currentSpot.anchor.name}</p>
                {currentSpot.anchor.reason && (
                  <p className="text-[14px] text-[#3D3D3D] leading-relaxed mb-3">{currentSpot.anchor.reason}</p>
                )}

                {/* 滞在時間（コンパクトに） */}
                <div className="flex items-center gap-3 text-[13px] text-[#86868B] mb-4">
                  <span>⏱ {currentSpot.time}</span>
                  {currentSpot.skippable && <span className="text-[#FF9500]">スキップ可</span>}
                </div>

                {/* 深津流：詳しく見る（段階的開示） */}
                {!showSpotDetails ? (
                  <button
                    onClick={() => setShowSpotDetails(true)}
                    className="w-full py-2 text-[13px] text-[#007AFF] border border-[#E5E5E7] rounded-lg transition-all active:bg-[#F5F5F7]"
                  >
                    詳しく見る ↓
                  </button>
                ) : (
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-3">
                    {/* 住所 */}
                    <div>
                      <p className="text-[12px] text-[#86868B] mb-1">住所</p>
                      <p className="text-[13px] text-[#1D1D1F]">{currentSpot.anchor.address}</p>
                    </div>

                    {/* フロア・目印 */}
                    {(currentSpot.anchor.floor || currentSpot.anchor.landmark) && (
                      <div className="flex flex-wrap gap-2">
                        {currentSpot.anchor.floor && <span className="text-[12px] bg-white px-2 py-1 rounded text-[#86868B]">{currentSpot.anchor.floor}</span>}
                        {currentSpot.anchor.landmark && <span className="text-[12px] bg-white px-2 py-1 rounded text-[#86868B]">{currentSpot.anchor.landmark}</span>}
                      </div>
                    )}

                    {/* Instagramで見る */}
                    {currentSpot.anchor.instagramUrl && (
                      <button
                        onClick={() => openUrl(currentSpot.anchor.instagramUrl)}
                        className="w-full py-2 text-[13px] text-[#E4405F] bg-white rounded-lg border border-[#E5E5E7] transition-all active:bg-[#FFF0F3]"
                      >
                        📸 Instagramで雰囲気を見る
                      </button>
                    )}

                    {/* コピーボタン */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentSpot.anchor.address);
                          alert('住所をコピーしました');
                        }}
                        className="flex-1 py-2 text-[12px] text-[#86868B] bg-white rounded-lg border border-[#E5E5E7] transition-all active:bg-[#F5F5F7]"
                      >
                        住所コピー
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentSpot.anchor.name);
                          alert('検索ワードをコピーしました');
                        }}
                        className="flex-1 py-2 text-[12px] text-[#86868B] bg-white rounded-lg border border-[#E5E5E7] transition-all active:bg-[#F5F5F7]"
                      >
                        検索ワードコピー
                      </button>
                    </div>

                    {/* 迷ったら */}
                    {currentSpot.lostTip && (
                      <div className="pt-2 border-t border-[#E5E5E7]">
                        <p className="text-[12px] text-[#86868B]">😵 迷ったら: {currentSpot.lostTip}</p>
                      </div>
                    )}

                    {/* 閉じる */}
                    <button
                      onClick={() => setShowSpotDetails(false)}
                      className="w-full py-2 text-[12px] text-[#86868B] transition-all active:opacity-60"
                    >
                      ↑ 閉じる
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 現地ミッション（常時表示だが目立たせない） */}
            {currentSpot.mission && (
              <div className="bg-[#FFF8E7] rounded-xl p-4 mb-4">
                <p className="text-[13px] font-medium text-[#1D1D1F] mb-2">🎯 やること</p>
                <p className="text-[14px] text-[#1D1D1F] leading-relaxed">{currentSpot.mission}</p>
                {currentSpot.todo && currentSpot.todo.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {currentSpot.todo.map((item, i) => (
                      <li key={i} className="text-[13px] text-[#86868B] flex items-start gap-2">
                        <span className="text-[#34C759]">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 旧：迷ったら - 深津流では「詳しく見る」内に移動 */}
            {!currentSpot.anchor && currentSpot.lostTip && (
              <div className="bg-[#F2F2F7] rounded-xl p-3 mb-4">
                <p className="text-[13px] text-[#86868B]">
                  <span className="font-medium">迷ったら:</span> {currentSpot.lostTip}
                </p>
              </div>
            )}

            {/* PlanBチップ - 困った時の救済 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentSpot.backup && (
                <button
                  onClick={() => {
                    openUrl(currentSpot.backup.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSpot.backup.name)}`);
                  }}
                  className="px-3 py-2 rounded-full text-[13px] font-medium bg-[#FFF0F0] text-[#FF3B30] transition-all active:scale-[0.98]"
                >
                  😵 混んでる → {currentSpot.backup.name}
                </button>
              )}
              {currentSpot.skippable && currentIndex < plan.spots.length - 1 && (
                <button
                  onClick={() => {
                    setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                    setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 });
                  }}
                  className="px-3 py-2 rounded-full text-[13px] font-medium bg-[#FFF8E7] text-[#FF9500] transition-all active:scale-[0.98]"
                >
                  ⏭️ スキップして次へ
                </button>
              )}
            </div>

            {/* 状態別CTA */}
            {getSpotStatus(currentIndex) === 'ready' ? (
              /* 出発前: ナビ開始（到達保証） */
              <div className="space-y-3">
                <button
                  onClick={() => {
                    Analytics.openMaps(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                    openUrl(mapUrl);
                    setSpotProgress(prev => ({ ...prev, [currentIndex]: 'arrived' }));
                    setShowSpotDetails(false);
                  }}
                  className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                  style={{ backgroundColor: '#007AFF' }}
                >
                  📍 ナビを開始する
                </button>
                {/* 目的地見つからない報告（Gate 0計測用） */}
                <button
                  onClick={() => {
                    Analytics.cantFindDestination(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                    setShowSpotDetails(true);
                    alert('住所をコピーして、Google Mapsで直接検索してみてください。');
                    navigator.clipboard.writeText(currentSpot.anchor?.address || currentSpot.anchor?.name || '');
                  }}
                  className="w-full py-2 rounded-lg text-[13px] font-medium text-[#FF6B6B] bg-[#FFF0F0] transition-all active:scale-[0.98]"
                >
                  📍 目的地が見つからない
                </button>
              </div>
            ) : getSpotStatus(currentIndex) === 'arrived' ? (
              /* 到着後: 次へ or 完了 */
              <div className="space-y-3">
                {currentIndex < plan.spots.length - 1 ? (
                  <button
                    onClick={() => {
                      Analytics.done(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                      setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                      setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 });
                    }}
                    className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                    style={{ backgroundColor: plan.color }}
                  >
                    ✓ 次へ（{currentIndex + 2}へ）
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      Analytics.done(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                      Analytics.complete(plan.id, plan.title);
                      setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                      setShowMap(false);
                    }}
                    className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                    style={{ backgroundColor: '#34C759' }}
                  >
                    🎉 プラン完了！
                  </button>
                )}
                <button
                  onClick={() => openUrl(mapUrl)}
                  className="w-full py-3 rounded-xl text-[15px] font-medium text-[#007AFF] bg-[#F2F2F7] transition-all duration-200 active:scale-[0.98]"
                >
                  もう一度地図を見る
                </button>
              </div>
            ) : (
              /* 完了済み: 次へ表示 */
              currentIndex < plan.spots.length - 1 && (
                <button
                  onClick={() => setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 })}
                  className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                  style={{ backgroundColor: plan.color }}
                >
                  次へ（{currentIndex + 2}へ）
                </button>
              )
            )}

            {/* 今日は省略 - 罪悪感を軽減 */}
            {getSpotStatus(currentIndex) !== 'done' && currentIndex < plan.spots.length - 1 && (
              <button
                onClick={() => {
                  setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                  setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 });
                }}
                className="w-full mt-3 py-2 text-[14px] text-[#86868B] transition-all active:opacity-60"
              >
                今日は省略して次へ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== HOME ==========
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-[#0A0A0B] p-6">
        <div className="max-w-lg mx-auto pt-16">
          {/* Header */}
          <div className={`text-center mb-12 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-[36px] font-bold tracking-tight text-white mb-3">
              yorumichi
            </h1>
            <p className="text-[15px] text-[#8E8E93]">
              決めて、動く。週末おでかけ提案
            </p>
          </div>

          {/* 深津流: シンプルな2択 */}
          <div className={`space-y-4 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* 寄り道カード */}
            <button
              onClick={() => { setMode('yorimichi'); setScreen('yorimichi-input'); setAnimate(false); }}
              className="w-full text-left p-6 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] bg-[#1C1C1E]"
            >
              <h2 className="text-[20px] font-bold text-white mb-2">帰り道に寄る</h2>
              <p className="text-[14px] text-[#8E8E93] leading-relaxed">
                1時間くらい、どこかに寄って帰る
              </p>
            </button>

            {/* 週末プランカード */}
            <button
              onClick={() => { setMode('weekend'); setScreen('weekend-select'); setAnimate(false); }}
              className="w-full text-left p-6 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] bg-[#1C1C1E]"
            >
              <h2 className="text-[20px] font-bold text-white mb-2">週末の予定を決める</h2>
              <p className="text-[14px] text-[#8E8E93] leading-relaxed">
                5つの質問で、あなたに合うプランを提案
              </p>
            </button>

            {/* Google Places検索（サジェスト） */}
            {onSuggest && (
              <button
                onClick={onSuggest}
                className="w-full text-left p-6 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] bg-[#1C1C1E] border border-[#2C2C2E]"
              >
                <h2 className="text-[20px] font-bold text-white mb-2">周辺スポット検索</h2>
                <p className="text-[14px] text-[#8E8E93] leading-relaxed">
                  Google Placesで今いる場所の近くを探す
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== WEEKEND SELECT (エリア選択) ==========
  if (screen === 'weekend-select') {
    return (
      <div className="min-h-screen bg-[#F2F2F7] p-6">
        <div className="max-w-lg mx-auto pt-8">
          {/* Back */}
          <button
            onClick={() => { setScreen('home'); setAnimate(false); }}
            className="text-[17px] text-[#007AFF] font-medium mb-8 transition-all duration-300 active:opacity-60"
          >
            ← 戻る
          </button>

          {/* 深津流: 1画面1メッセージ */}
          <div className={`mb-10 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-2">
              週末どこいく？
            </h1>
            <p className="text-[15px] text-[#86868B]">
              エリアを選んでください
            </p>
          </div>

          {/* 深津流: シンプルなリスト */}
          <div className={`space-y-3 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* 東京 */}
            <button
              onClick={() => {
                setRegion('tokyo');
                setScreen('quiz');
                setAnimate(false);
              }}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl transition-all active:scale-[0.98] text-left"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div className="text-left">
                <p className="text-[17px] font-semibold text-[#1D1D1F]">東京</p>
                <p className="text-[14px] text-[#86868B]">清澄白河・谷中・高尾山など</p>
              </div>
              <span className="text-[#C7C7CC]">→</span>
            </button>

            {/* 神奈川 */}
            <button
              onClick={() => {
                setRegion('kanagawa');
                setScreen('quiz');
                setAnimate(false);
              }}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl transition-all active:scale-[0.98] text-left"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div className="text-left">
                <p className="text-[17px] font-semibold text-[#1D1D1F]">神奈川</p>
                <p className="text-[14px] text-[#86868B]">横浜・鎌倉・湘南など</p>
              </div>
              <span className="text-[#C7C7CC]">→</span>
            </button>
          </div>

          {/* Footer */}
          <p className={`text-center text-[13px] text-[#86868B] mt-16 transition-all duration-700 delay-200 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            5つの質問に答えるだけ
          </p>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI INPUT ==========
  if (screen === 'yorimichi-input') {
    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        <div className="px-6 pb-12">
          <div className="max-w-lg mx-auto pt-12">
            {/* Back */}
            <button
              onClick={() => { setScreen('home'); setAnimate(false); }}
              className="text-[15px] text-[#86868B] mb-8 transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>

            {/* Header */}
            <div className={`mb-10 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-[28px] font-bold text-[#1D1D1F]">どこに寄る？</h1>
            </div>

            {/* Station Selection */}
            <div className={`mb-6 transition-all duration-700 delay-50 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-3">最寄駅</p>
              {/* 入力欄 + サジェスト */}
              <div className="relative">
                <input
                  type="text"
                  value={yorimichiInput.homeStation}
                  onChange={(e) => handleStationInput(e.target.value)}
                  onFocus={() => {
                    setIsStationInputFocused(true);
                    setShowSuggestions(true);
                    if (yorimichiInput.homeStation.length > 0) {
                      const suggestions = searchStations(yorimichiInput.homeStation, 8);
                      setStationSuggestions(suggestions);
                    }
                  }}
                  onBlur={() => setTimeout(() => {
                    setShowSuggestions(false);
                    setIsStationInputFocused(false);
                  }, 200)}
                  placeholder="駅名を入力"
                  disabled={isGettingLocation}
                  className="w-full px-4 py-3 rounded-xl text-[15px] bg-white border border-[#E5E5E7] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] transition-all duration-300 disabled:bg-[#F5F5F5] disabled:text-[#86868B]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                {/* サジェストリスト */}
                {showSuggestions && isStationInputFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-[#E5E5E7] shadow-lg overflow-hidden max-h-80 overflow-y-auto">
                    {/* 現在地周辺から探す - 常に一番上に表示 */}
                    <button
                      type="button"
                      onMouseDown={handleCurrentLocationSelect}
                      className="w-full px-4 py-3 text-left text-[15px] hover:bg-[#E8F5E9] transition-colors border-b border-[#F0F0F0] flex items-center gap-3"
                    >
                      <span className="text-[18px]">📍</span>
                      <span className="text-[#2E7D32] font-medium">
                        {isGettingLocation ? '現在地を取得中...' : '現在地周辺から探す'}
                      </span>
                    </button>
                    {/* 駅サジェスト */}
                    {stationSuggestions.map((station, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={() => selectStation(station)}
                        className="w-full px-4 py-3 text-left text-[15px] hover:bg-[#F5F5F5] transition-colors border-b border-[#F0F0F0] last:border-b-0"
                      >
                        🚉 {station}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Time Selection */}
            <div className={`mb-8 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-4">使える時間</p>
              <div className="flex gap-3">
                {[
                  { value: 60, label: '60分' },
                  { value: 90, label: '90分' },
                  { value: 120, label: '120分' }
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setYorimichiInput(prev => ({ ...prev, time: t.value }))}
                    className="flex-1 py-4 rounded-xl text-[15px] font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: yorimichiInput.time === t.value ? '#1D1D1F' : '#FFFFFF',
                      color: yorimichiInput.time === t.value ? '#FFFFFF' : '#1D1D1F',
                      border: yorimichiInput.time === t.value ? 'none' : '1px solid #E5E5E7',
                      boxShadow: yorimichiInput.time !== t.value ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zure Level */}
            <div className={`mb-8 transition-all duration-700 delay-150 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-4">どこまで行く？</p>
              <div className="space-y-3">
                {Object.entries(yorimichi.zure).map(([key, z]) => (
                  <button
                    key={key}
                    onClick={() => setYorimichiInput(prev => ({ ...prev, zure: key }))}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 ${
                      yorimichiInput.zure === key
                        ? 'ring-2'
                        : 'bg-white border border-[#E5E5E7]'
                    }`}
                    style={{
                      backgroundColor: yorimichiInput.zure === key ? `${z.color}10` : undefined,
                      boxShadow: yorimichiInput.zure !== key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      '--tw-ring-color': z.color
                    }}
                  >
                    <span className="text-2xl">{z.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className={`text-[16px] font-semibold ${yorimichiInput.zure === key ? 'text-[#1D1D1F]' : 'text-[#1D1D1F]'}`}>
                        {z.name}
                      </p>
                      <p className="text-[13px] text-[#86868B]">{z.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* NG Filters */}
            <div className={`mb-10 transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-4">避けたい</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'ngQueue', label: '行列' },
                  { key: 'ngNoisy', label: 'うるさい' },
                  { key: 'ngCash', label: '現金のみ' }
                ].map((ng) => (
                  <button
                    key={ng.key}
                    onClick={() => setYorimichiInput(prev => ({ ...prev, [ng.key]: !prev[ng.key] }))}
                    className="px-5 py-3 rounded-full text-[14px] font-medium transition-all duration-300"
                    style={{
                      backgroundColor: yorimichiInput[ng.key] ? '#FF3B30' : '#FFFFFF',
                      color: yorimichiInput[ng.key] ? '#FFFFFF' : '#1D1D1F',
                      border: yorimichiInput[ng.key] ? 'none' : '1px solid #E5E5E7',
                      boxShadow: !yorimichiInput[ng.key] ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {ng.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submitYorimichi}
              className={`w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-500 delay-250 ease-out active:scale-[0.98] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ backgroundColor: '#1D1D1F' }}
            >
              探す
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI RESULT (3択) ==========
  if (screen === 'yorimichi-result' && !selectedYorimichi) {
    const mainSpot = yorimichiResults && yorimichiResults.length > 0 ? yorimichiResults[0] : null;
    const otherSpots = yorimichiResults && yorimichiResults.length > 1 ? yorimichiResults.slice(1) : [];
    const mainZure = mainSpot ? yorimichi.zure[mainSpot.zure] : null;

    // 時間帯メッセージ
    const hour = new Date().getHours();
    const timeMessage = hour < 18 ? '今から寄れる' : hour < 21 ? '夜でも楽しめる' : '遅い時間でもOK';

    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        <div className="px-6 pb-24">
          <div className="max-w-lg mx-auto pt-12">

            {/* Back */}
            <button
              onClick={() => { setScreen('yorimichi-input'); setAnimate(false); }}
              className="text-[15px] text-[#86868B] mb-8 transition-all duration-300 active:opacity-60"
            >
              ← 条件を変える
            </button>

            {/* 時間帯メッセージ */}
            <p className={`text-[14px] text-[#86868B] mb-6 transition-all duration-700 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              {timeMessage}
            </p>

            {/* メイン推しスポット（1つ） */}
            {mainSpot && mainZure && (
              <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div
                  className="bg-white rounded-3xl overflow-hidden mb-6"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ backgroundColor: `${mainZure.color}15` }}
                      >
                        {mainSpot.emoji}
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-[12px] font-semibold text-white"
                        style={{ backgroundColor: mainZure.color }}
                      >
                        {mainZure.name}
                      </span>
                    </div>

                    <h2 className="text-[24px] font-bold text-[#1D1D1F] leading-tight mb-3">
                      {mainSpot.name}
                    </h2>

                    <p className="text-[16px] text-[#3D3D3D] leading-relaxed mb-4">
                      {mainSpot.reason}
                    </p>

                    <div className="flex flex-wrap gap-3 text-[14px] text-[#86868B]">
                      <span>📍 {mainSpot.area}</span>
                      <span>🚶 {mainSpot.walkFromStation}分</span>
                      <span>⏱ {mainSpot.stayTime}分</span>
                      <span>💰 {mainSpot.budget}</span>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2">
                    <button
                      onClick={() => { setSelectedYorimichi(mainSpot); setAnimate(false); }}
                      className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                      style={{ backgroundColor: mainZure.color }}
                    >
                      ここに寄る →
                    </button>
                  </div>
                </div>

                {/* 他の選択肢を見る */}
                {otherSpots.length > 0 && (
                  <div className="text-center">
                    {!showOthers ? (
                      <button
                        onClick={() => setShowOthers(true)}
                        className="text-[15px] text-[#86868B] py-3 transition-all duration-300 active:opacity-60"
                      >
                        他の選択肢を見る（{otherSpots.length}）
                      </button>
                    ) : (
                      <div className="space-y-3 mt-2">
                        {otherSpots.map((spot) => {
                          const zureInfo = yorimichi.zure[spot.zure];
                          return (
                            <button
                              key={spot.id}
                              onClick={() => { setSelectedYorimichi(spot); setAnimate(false); }}
                              className="w-full text-left bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out active:scale-[0.98]"
                              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                            >
                              <div className="p-4">
                                <div className="flex items-center gap-4">
                                  <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                    style={{ backgroundColor: `${zureInfo.color}15` }}
                                  >
                                    {spot.emoji}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-1">{spot.name}</h3>
                                    <p className="text-[13px] text-[#86868B]">{spot.area} · {spot.stayTime}分</p>
                                  </div>
                                  <svg className="w-5 h-5 text-[#C7C7CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setShowOthers(false)}
                          className="text-[14px] text-[#86868B] py-2 transition-all duration-300 active:opacity-60"
                        >
                          閉じる
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 別の候補 */}
                <button
                  onClick={async () => {
                    setShowOthers(false);
                    setAnimate(false);
                    await submitYorimichi();
                    setTimeout(() => setAnimate(true), 50);
                  }}
                  className="w-full mt-6 py-3 text-[15px] font-medium text-[#007AFF] transition-all duration-300 active:opacity-60"
                >
                  🔄 別の候補を見る
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI DETAIL (深津流) ==========
  if (selectedYorimichi && !showYorimichiGo) {
    const spot = selectedYorimichi;
    const totalTime = spot.walkFromStation + spot.stayTime;

    // スポットタイプの日本語マッピング
    const typeLabels = { cafe: 'カフェ', bookstore: '書店', sento: '銭湯', gallery: 'ギャラリー' };
    const typeLabel = typeLabels[spot.type] || spot.type;

    // タイプ別カラー（デザインガイドライン準拠）
    const typeColors = {
      cafe: { main: '#8B7355', bg: '#F5F0EB', text: '#5C4A3A' },
      bookstore: { main: '#5D5D5D', bg: '#F0F0F0', text: '#3D3D3D' },
      sento: { main: '#4A90A4', bg: '#EBF4F7', text: '#2D5A6A' },
      gallery: { main: '#1D1D1F', bg: '#F0F0F2', text: '#1D1D1F' }
    };
    const typeColor = typeColors[spot.type] || typeColors.cafe;

    // タイプ別絵文字
    const typeEmojis = { cafe: '☕', bookstore: '📚', sento: '♨️', gallery: '🎨' };
    const typeEmoji = typeEmojis[spot.type] || '📍';

    // 駅名の「駅」重複を防ぐ
    const stationName = spot.station.endsWith('駅') ? spot.station : `${spot.station}駅`;

    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => { setSelectedYorimichi(null); setAnimate(false); }}
              className="text-[15px] text-[#86868B] transition-all active:opacity-60"
            >
              ← 戻る
            </button>
          </div>
        </div>

        {/* 深津流: reasonをヒーローに、タイプカラーで雰囲気を作る */}
        <div className="flex-1 px-6">
          <div className="max-w-lg mx-auto">
            <div className={`transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

              {/* ヒーローカード: タイプカラー背景でreasonを強調 */}
              <div
                className="rounded-3xl p-6 mb-6"
                style={{ backgroundColor: typeColor.bg }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{typeEmoji}</span>
                  <span
                    className="text-[13px] font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: typeColor.main, color: '#FFFFFF' }}
                  >
                    {typeLabel}
                  </span>
                  {spot.fromPlacesApi && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF]">
                      Google Places
                    </span>
                  )}
                </div>

                {spot.reason ? (
                  <p
                    className="text-[17px] leading-relaxed font-medium"
                    style={{ color: typeColor.text }}
                  >
                    「{spot.reason}」
                  </p>
                ) : (
                  <p className="text-[15px] text-[#86868B]">
                    {spot.highlight || spot.area}
                  </p>
                )}
              </div>

              {/* 店名 */}
              <h1 className="text-[22px] font-bold text-[#1D1D1F] leading-tight mb-3">{spot.name}</h1>

              {/* メタ情報 */}
              <p className="text-[14px] text-[#86868B] mb-6">
                {stationName} 徒歩{spot.walkFromStation}分 · {totalTime}分 · {spot.budget}{spot.cashOnly && ' · 現金のみ'}
              </p>

              {/* 補助リンク */}
              <div className="flex gap-4 text-[14px]">
                <button
                  onClick={() => openUrl(`https://www.instagram.com/explore/tags/${encodeURIComponent(spot.name.replace(/[\s.・]/g, ''))}/`)}
                  className="transition-all active:opacity-60"
                  style={{ color: typeColor.main }}
                >
                  写真を見る
                </button>
                <button
                  onClick={() => openUrl(spot.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(spot.name + ' ' + spot.area)}`)}
                  className="transition-all active:opacity-60"
                  style={{ color: typeColor.main }}
                >
                  地図を見る
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 深津流: CTAは下部に固定 */}
        <div className="px-6 pb-8 pt-4">
          <div className="max-w-lg mx-auto space-y-3">
            <button
              onClick={() => { setShowYorimichiGo(true); setAnimate(false); }}
              className="w-full py-4 rounded-2xl text-[16px] font-semibold text-white transition-all active:scale-[0.98]"
              style={{ backgroundColor: typeColor.main }}
            >
              ここに寄る
            </button>
            <button
              onClick={() => openUrl(`https://www.google.com/maps/search/${encodeURIComponent(typeLabel + ' ' + stationName)}`)}
              className="w-full py-3 text-[14px] text-[#86868B] transition-all active:opacity-60"
            >
              近くの別の{typeLabel}を探す
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI GO (Map + Rating) ==========
  if (selectedYorimichi && showYorimichiGo) {
    const spot = selectedYorimichi;
    const mapQuery = encodeURIComponent(`${spot.name} ${spot.area}`);

    // 深津流: 完了画面はシンプルに
    if (showRating) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] p-6 flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center">
            <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h1 className="text-[28px] font-bold text-white mb-2">お疲れさまでした</h1>
              <p className="text-[15px] text-[#8E8E93] mb-8">
                {spot.name}はどうでしたか？
              </p>

              {!showMehReasons ? (
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => {
                      Analytics.rating(spot.id, 'great');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#34C759] text-white transition-all active:scale-[0.98]"
                  >
                    よかった
                  </button>
                  <button
                    onClick={() => {
                      Analytics.rating(spot.id, 'ok');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                  >
                    ふつう
                  </button>
                  <button
                    onClick={() => setShowMehReasons(true)}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#FF6B6B] transition-all active:scale-[0.98]"
                  >
                    いまいち
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <p className="text-[13px] text-[#8E8E93] mb-4">何が合わなかった？</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mehReasons.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => {
                          Analytics.rating(spot.id, 'meh', reason.id);
                          reset();
                        }}
                        className="py-3 px-4 rounded-xl text-[14px] bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowMehReasons(false)}
                    className="mt-4 text-[14px] text-[#636366] transition-all active:opacity-60"
                  >
                    ← 戻る
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0A0A0B]">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0A0A0B]/80 border-b border-[#1C1C1E]">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => { setShowYorimichiGo(false); setAnimate(false); }}
              className="text-[17px] text-[#FF9500] font-medium transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>
            <span className="text-[15px] font-semibold text-white">{spot.name}</span>
            <div className="w-12" />
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Map */}
          <div className={`transition-all duration-500 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative bg-[#1C1C1E]" style={{ height: '300px' }}>
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=16`}
              />
            </div>
          </div>

          {/* Quick Info */}
          <div className="px-6 py-6">
            <div className={`transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {/* Station Info */}
              <div className="p-4 rounded-2xl bg-[#1C1C1E] mb-4">
                <p className="text-[15px] font-semibold text-white">{spot.station}駅</p>
                <p className="text-[13px] text-[#636366]">{spot.line} · 徒歩{spot.walkFromStation}分</p>
              </div>

              {/* Open Map */}
              <button
                onClick={() => openUrl(`https://www.google.com/maps/search/?api=1&query=${mapQuery}`)}
                className="w-full py-4 rounded-2xl text-[17px] font-semibold text-white flex items-center justify-center gap-2 mb-4 transition-all duration-300 active:scale-[0.98]"
                style={{ backgroundColor: '#007AFF' }}
              >
                Google Mapsで開く
              </button>

              {/* Arrived Button */}
              <button
                onClick={() => { setShowRating(true); setAnimate(false); }}
                className="w-full py-4 rounded-2xl text-[17px] font-bold text-white transition-all duration-300 active:scale-[0.98]"
                style={{ backgroundColor: '#FF9500' }}
              >
                行ってきた
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== QUIZ ==========
  if (screen === 'quiz') {
    const q = questions[qIdx];
    const progress = ((qIdx + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#F2F2F7] p-6">
        <div className="max-w-lg mx-auto">
          {/* Back */}
          <button
            onClick={() => {
              setAnimate(false);
              if (qIdx > 0) {
                setAnswers(answers.slice(0, -1));
                setQIdx(qIdx - 1);
              } else {
                setScreen('weekend-select');
              }
            }}
            className="text-[15px] text-[#86868B] mb-4 pt-4 transition-all duration-300 active:opacity-60"
          >
            ← {qIdx > 0 ? '前の質問' : 'エリア選択に戻る'}
          </button>

          {/* Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-medium text-[#86868B]">質問 {qIdx + 1}</span>
              <span className="text-[13px] text-[#86868B]">{qIdx + 1} / {questions.length}</span>
            </div>
            <div className="h-1 bg-[#E5E5EA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007AFF] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 深津流: 質問に集中 */}
          <div className={`transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-[22px] font-bold text-[#1D1D1F] leading-tight mb-8">
              {q.question}
            </h2>

            {/* 深津流: シンプルな選択肢 */}
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(opt)}
                  className="w-full text-left p-4 bg-white rounded-2xl transition-all active:scale-[0.98]"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  <span className="text-[16px] text-[#1D1D1F]">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== RESULT ==========
  if (screen === 'result' && !selected) {
    const _type = userType ? typeInfo[userType] : null;
    const mainPlan = results && results.length > 0 ? results[0] : null;
    const otherPlans = results && results.length > 1 ? results.slice(1) : [];

    // 時間帯に応じたメッセージ
    const hour = new Date().getHours();
    const timeMessage = hour < 12 ? '午前中から楽しめる' : hour < 15 ? '午後からでも間に合う' : '今からでも行ける';

    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        <div className="px-6 pb-24">
          <div className="max-w-lg mx-auto pt-12">

            {/* Back */}
            <button
              onClick={() => {
                setScreen('weekend-select');
                setQIdx(0);
                setAnswers([]);
                setUserType(null);
                setResults([]);
                setAnimate(false);
              }}
              className="text-[15px] text-[#86868B] mb-6 transition-all duration-300 active:opacity-60"
            >
              ← 別のエリアで探す
            </button>

            {/* 時間帯メッセージ */}
            <p className={`text-[14px] text-[#86868B] mb-6 transition-all duration-700 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              {timeMessage}
            </p>

            {/* 深津流: メインプランをシンプルに */}
            {mainPlan && (
              <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div
                  className="bg-white rounded-2xl overflow-hidden mb-6"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  <div className="p-6">
                    <p className="text-[12px] font-medium text-[#86868B] mb-3">おすすめ</p>

                    <h2 className="text-[22px] font-bold text-[#1D1D1F] leading-tight mb-2">
                      {mainPlan.title}
                    </h2>

                    {mainPlan.catchcopy && (
                      <p className="text-[15px] text-[#3D3D3D] leading-relaxed mb-4">
                        {mainPlan.catchcopy}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-[13px] text-[#86868B] mb-5">
                      <span>{mainPlan.area}</span>
                      <span>{mainPlan.duration}</span>
                      <span>{mainPlan.budget}</span>
                    </div>

                    <button
                      onClick={() => { setSelected(mainPlan); setAnimate(false); }}
                      className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all active:scale-[0.98]"
                      style={{ backgroundColor: '#007AFF' }}
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>

                {/* 他の選択肢を見る */}
                {otherPlans.length > 0 && (
                  <div className="text-center">
                    {!showOthers ? (
                      <button
                        onClick={() => setShowOthers(true)}
                        className="text-[15px] text-[#86868B] py-3 transition-all duration-300 active:opacity-60"
                      >
                        他の選択肢を見る（{otherPlans.length}）
                      </button>
                    ) : (
                      <div className={`space-y-3 mt-2 transition-all duration-500 ease-out`}>
                        {otherPlans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => { setSelected(plan); setAnimate(false); }}
                            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl transition-all active:scale-[0.99] text-left"
                            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                          >
                            <div className="text-left">
                              <h3 className="text-[15px] font-semibold text-[#1D1D1F] mb-1">{plan.title}</h3>
                              <p className="text-[13px] text-[#86868B]">{plan.area} · {plan.duration}</p>
                            </div>
                            <span className="text-[#C7C7CC]">→</span>
                          </button>
                        ))}

                        <button
                          onClick={() => setShowOthers(false)}
                          className="text-[14px] text-[#86868B] py-2 transition-all duration-300 active:opacity-60"
                        >
                          閉じる
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Reset */}
          <button
            onClick={reset}
            className="w-full mt-8 py-4 text-[17px] font-medium text-[#007AFF] transition-all duration-300 active:opacity-60"
          >
            もう一度診断する
          </button>
        </div>
      </div>
      </div>
    );
  }

  // ========== DETAIL ==========
  if (selected) {
    const plan = selected;

    // 全スポット完了チェック
    const allSpotsDone = plan.spots.every((_, i) => spotProgress[i] === 'done');

    // 深津流: 完了画面はシンプルに
    if (allSpotsDone && !showMap) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] p-6 flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center">
            <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h1 className="text-[28px] font-bold text-white mb-2">お疲れさまでした</h1>
              <p className="text-[15px] text-[#8E8E93] mb-8">
                {plan.title}を完走しました
              </p>

              <p className="text-[13px] text-[#636366] mb-4">今日のプランはどうでしたか？</p>

              {!showMehReasons ? (
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => {
                      Analytics.rating(plan.id, 'great');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#34C759] text-white transition-all active:scale-[0.98]"
                  >
                    よかった
                  </button>
                  <button
                    onClick={() => {
                      Analytics.rating(plan.id, 'ok');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                  >
                    ふつう
                  </button>
                  <button
                    onClick={() => setShowMehReasons(true)}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#FF6B6B] transition-all active:scale-[0.98]"
                  >
                    いまいち
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <p className="text-[13px] text-[#8E8E93] mb-4">何が合わなかった？</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mehReasons.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => {
                          Analytics.rating(plan.id, 'meh', reason.id);
                          reset();
                        }}
                        className="py-3 px-4 rounded-xl text-[14px] bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowMehReasons(false)}
                    className="mt-4 text-[14px] text-[#636366] transition-all active:opacity-60"
                  >
                    ← 戻る
                  </button>
                </div>
              )}

              {/* 次のアクション */}
              {!showMehReasons && (
                <div className="pt-4 border-t border-[#2C2C2E]">
                  <p className="text-[13px] text-[#636366] mb-3">次の週末は？</p>
                  <button
                    onClick={reset}
                    className="text-[15px] text-[#FF9500] font-medium transition-all duration-300 active:opacity-60"
                  >
                    別のプランを探す →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        {/* Map Bottom Sheet */}
        {renderMapSheet()}

        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#F2F2F7]/90">
          <div className="max-w-lg mx-auto px-6 py-4">
            <button
              onClick={() => { setSelected(null); setAnimate(false); }}
              className="text-[15px] text-[#86868B] transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>
          </div>
        </div>

        <div className="px-6 pb-24">
          <div className="max-w-lg mx-auto">

            {/* 深津流: 勝ち筋を最初に */}
            <div className={`pt-4 pb-8 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-[26px] font-bold text-[#1D1D1F] leading-tight mb-3">{plan.title}</h1>

              {plan.catchcopy && (
                <p className="text-[16px] text-[#3D3D3D] leading-relaxed mb-4">
                  {plan.catchcopy}
                </p>
              )}

              {/* 深津流: 必要最小限のメタ情報 */}
              <div className="flex flex-wrap gap-4 text-[14px] text-[#86868B]">
                <span>{plan.area}</span>
                <span>{plan.duration}</span>
                <span>{plan.budget}</span>
              </div>
            </div>

            {/* Spots - スクショで完走できるように情報充実 */}
            <div className={`mb-8 transition-all duration-700 delay-150 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-5">プランの流れ</p>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {plan.spots.map((spot, i) => (
                  <div key={i}>
                    <div
                      onClick={() => { setShowMap({ spot, index: i }); setAnimate(false); }}
                      className="cursor-pointer transition-all duration-200 active:bg-[#F5F5F7]"
                    >
                      <div className="flex gap-4 p-5">
                        {/* 番号 + 完了状態 */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0"
                          style={{ backgroundColor: getSpotStatus(i) === 'done' ? '#34C759' : plan.color }}
                        >
                          {getSpotStatus(i) === 'done' ? '✓' : i + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3 mb-1">
                            <p className="text-[16px] font-semibold text-[#1D1D1F]">{spot.label || spot.name}</p>
                            <span className="text-[13px] text-[#86868B] flex-shrink-0">{spot.time}</span>
                          </div>
                          {/* ミッション1行 */}
                          {spot.mission && (
                            <p className="text-[14px] text-[#1D1D1F] leading-relaxed mb-2">{spot.mission}</p>
                          )}
                          {/* 目的地（アンカー） */}
                          {spot.anchor && (
                            <div className="flex items-center gap-2 text-[13px] text-[#86868B]">
                              <span>📍 {spot.anchor.name}</span>
                              {spot.anchor.floor && <span className="bg-[#F2F2F7] px-1.5 py-0.5 rounded text-[11px]">{spot.anchor.floor}</span>}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <svg className="w-5 h-5 text-[#C7C7CC] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    {/* 移動時間 */}
                    {i < plan.spots.length - 1 && (
                      <div className="flex items-center gap-2 px-5 py-2 bg-[#F8F8F8] border-t border-b border-[#F0F0F0]">
                        <span className="text-[12px] text-[#86868B]">↓ 施設内移動 or 徒歩5分</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 主CTA - このプランで行く */}
              <button
                onClick={() => {
                  Analytics.startPlan(plan.id, plan.title);
                  setShowMap({ spot: plan.spots[0], index: 0 });
                  setAnimate(false);
                }}
                className="w-full mt-5 py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                style={{ backgroundColor: plan.color }}
              >
                このプランで行く（まずは①へ）
              </button>
            </div>

            {/* Tip - 成功のコツに寄せる */}
            {plan.tip && (
              <div className={`mb-8 p-5 bg-[#FFF8E7] rounded-2xl transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[14px] text-[#1D1D1F] leading-relaxed">
                  <span className="font-medium">💡 成功のコツ:</span> {plan.tip}
                </p>
              </div>
            )}

            {/* もっと知る - アコーディオンで隠す */}
            <details className={`mb-10 transition-all duration-700 delay-250 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <summary className="text-[14px] text-[#86868B] cursor-pointer list-none">
                もっと見る（SNS投稿）
              </summary>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openUrl(`https://www.instagram.com/explore/tags/${plan.hashtag.replace(/\s/g, '')}/`)}
                  className="flex-1 py-3 bg-white rounded-xl text-[14px] font-medium text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  📷 Instagram
                </button>
                <button
                  onClick={() => openUrl(`https://www.tiktok.com/search?q=${encodeURIComponent(plan.hashtag)}`)}
                  className="flex-1 py-3 bg-white rounded-xl text-[14px] font-medium text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  🎵 TikTok
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* 固定CTA - 行動を強く促す */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#F0F0F0] px-6 py-4 z-20">
          <div className="max-w-lg mx-auto flex gap-3">
            <button
              onClick={() => openUrl(`https://www.google.com/maps/search/${encodeURIComponent(plan.title + ' ' + plan.area)}`)}
              className="flex-1 py-4 bg-[#F5F5F7] rounded-xl text-[15px] font-semibold text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
            >
              📍 地図
            </button>
            <button
              onClick={() => {
                const text = `今週末、${plan.title}行かない？ ${plan.emoji}\n\n📍 ${plan.area}\n⏱ ${plan.duration}\n💰 ${plan.budget}`;
                openUrl(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`);
              }}
              className="flex-[2] py-4 rounded-xl text-[15px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
              style={{ backgroundColor: '#06C755' }}
            >
              友達をLINEで誘う
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

