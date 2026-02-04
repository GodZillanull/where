/**
 * Observations Service - 観測ログ（学習/統計の資産）
 *
 * 設計原則: 観測（Observation）を資産化する
 * - あなたの堀は「曜日×時間×天気×エリア×ジャンルの成功率」
 * - ここが堀。placesより価値がある。
 */
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const OBSERVATIONS_COLLECTION = 'observations';

/**
 * Observation スキーマ
 * {
 *   placeId: string,
 *   userId: string,              // 匿名でも可
 *   occurredAt: timestamp,
 *   timeBucketStart: timestamp,
 *   outcome: string,             // "entered" / "full" / "queue_left" / "closed"
 *   partySize: number,
 *   method: string,              // "walkin" / "call" / "reservation"
 *   geo: { lat, lng },           // 任意、粗く
 *   context: {
 *     dow: number,               // 曜日 0-6
 *     hour: number,              // 時 0-23
 *     weather: string,           // 後で連携
 *     leadTimeMin: number,       // 提案→到着まで
 *     linkedSessionId: string    // 寄り道セッションに紐付け
 *   }
 * }
 */

// 曜日を取得
const getDow = (date = new Date()) => date.getDay();

// 15分刻みのタイムバケット
const getTimeBucket = (date = new Date()) => {
  const d = new Date(date);
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

// 匿名ユーザーID生成（デバイスID的な）
const getAnonymousUserId = () => {
  let id = localStorage.getItem('yorumichi_anonymous_id');
  if (!id) {
    id = 'anon_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    localStorage.setItem('yorumichi_anonymous_id', id);
  }
  return id;
};

/**
 * 観測を記録
 */
export const recordObservation = async ({
  placeId,
  outcome,
  partySize = 1,
  method = 'walkin',
  lat = null,
  lng = null,
  weather = null,
  leadTimeMin = null,
  linkedSessionId = null,
  userId = null,
}) => {
  try {
    const now = new Date();

    const observation = {
      placeId,
      userId: userId || getAnonymousUserId(),
      occurredAt: serverTimestamp(),
      timeBucketStart: Timestamp.fromDate(getTimeBucket(now)),
      outcome, // "entered" / "full" / "queue_left" / "closed"
      partySize,
      method,
      geo: lat && lng ? { lat, lng } : null,
      context: {
        dow: getDow(now),
        hour: now.getHours(),
        weather,
        leadTimeMin,
        linkedSessionId,
      },
    };

    const docRef = await addDoc(collection(db, OBSERVATIONS_COLLECTION), observation);
    return { success: true, observationId: docRef.id };
  } catch (error) {
    console.error('Record observation error:', error);

    // オフラインフォールバック
    try {
      const pending = JSON.parse(localStorage.getItem('yorumichi_pending_observations') || '[]');
      pending.push({ ...arguments[0], _pendingAt: Date.now() });
      localStorage.setItem('yorumichi_pending_observations', JSON.stringify(pending));
      return { success: true, offline: true };
    } catch {
      return { success: false, error: error.message };
    }
  }
};

/**
 * 成功を記録（入店できた）
 */
export const recordSuccess = async (placeId, options = {}) => {
  return recordObservation({
    placeId,
    outcome: 'entered',
    ...options,
  });
};

/**
 * 失敗を記録（満席だった）
 */
export const recordFull = async (placeId, options = {}) => {
  return recordObservation({
    placeId,
    outcome: 'full',
    ...options,
  });
};

/**
 * 離脱を記録（並んでたけど帰った）
 */
export const recordQueueLeft = async (placeId, options = {}) => {
  return recordObservation({
    placeId,
    outcome: 'queue_left',
    ...options,
  });
};

/**
 * 閉店を記録
 */
export const recordClosed = async (placeId, options = {}) => {
  return recordObservation({
    placeId,
    outcome: 'closed',
    ...options,
  });
};

/**
 * 店舗の成功率を計算（堀の本体）
 */
export const getPlaceSuccessRate = async (placeId, filters = {}) => {
  try {
    let q = query(
      collection(db, OBSERVATIONS_COLLECTION),
      where('placeId', '==', placeId),
      orderBy('occurredAt', 'desc'),
      limit(100) // 直近100件
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { rate: 0.5, confidence: 0, sampleSize: 0 }; // データなし
    }

    let observations = [];
    snapshot.forEach((doc) => {
      observations.push(doc.data());
    });

    // フィルタ適用
    if (filters.dow !== undefined) {
      observations = observations.filter((o) => o.context?.dow === filters.dow);
    }
    if (filters.hourMin !== undefined) {
      observations = observations.filter((o) => o.context?.hour >= filters.hourMin);
    }
    if (filters.hourMax !== undefined) {
      observations = observations.filter((o) => o.context?.hour <= filters.hourMax);
    }

    if (observations.length === 0) {
      return { rate: 0.5, confidence: 0, sampleSize: 0 };
    }

    const successes = observations.filter((o) => o.outcome === 'entered').length;
    const rate = successes / observations.length;

    // 信頼度はサンプルサイズに基づく（10件で0.5、50件で0.8、100件で0.95）
    const confidence = Math.min(0.95, observations.length / 100);

    return {
      rate,
      confidence,
      sampleSize: observations.length,
      successes,
      failures: observations.length - successes,
    };
  } catch (error) {
    console.error('Get success rate error:', error);
    return { rate: 0.5, confidence: 0, sampleSize: 0, error: error.message };
  }
};

/**
 * 時間帯別の成功率を計算
 */
export const getHourlySuccessRates = async (placeId, dow = null) => {
  try {
    const q = query(
      collection(db, OBSERVATIONS_COLLECTION),
      where('placeId', '==', placeId),
      limit(500)
    );

    const snapshot = await getDocs(q);

    // 時間帯別に集計
    const hourlyData = {};
    for (let h = 0; h < 24; h++) {
      hourlyData[h] = { total: 0, successes: 0 };
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (dow !== null && data.context?.dow !== dow) return;

      const hour = data.context?.hour;
      if (hour !== undefined) {
        hourlyData[hour].total++;
        if (data.outcome === 'entered') {
          hourlyData[hour].successes++;
        }
      }
    });

    // 成功率を計算
    const rates = {};
    for (let h = 0; h < 24; h++) {
      const d = hourlyData[h];
      rates[h] = {
        rate: d.total > 0 ? d.successes / d.total : 0.5,
        sampleSize: d.total,
      };
    }

    return rates;
  } catch (error) {
    console.error('Get hourly rates error:', error);
    return {};
  }
};

/**
 * 曜日別の成功率を計算
 */
export const getDowSuccessRates = async (placeId) => {
  try {
    const q = query(
      collection(db, OBSERVATIONS_COLLECTION),
      where('placeId', '==', placeId),
      limit(500)
    );

    const snapshot = await getDocs(q);

    // 曜日別に集計
    const dowData = {};
    for (let d = 0; d < 7; d++) {
      dowData[d] = { total: 0, successes: 0 };
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const dow = data.context?.dow;
      if (dow !== undefined) {
        dowData[dow].total++;
        if (data.outcome === 'entered') {
          dowData[dow].successes++;
        }
      }
    });

    // 成功率を計算
    const rates = {};
    const dowNames = ['日', '月', '火', '水', '木', '金', '土'];
    for (let d = 0; d < 7; d++) {
      const data = dowData[d];
      rates[d] = {
        name: dowNames[d],
        rate: data.total > 0 ? data.successes / data.total : 0.5,
        sampleSize: data.total,
      };
    }

    return rates;
  } catch (error) {
    console.error('Get dow rates error:', error);
    return {};
  }
};

/**
 * 最適な訪問時間を推薦
 */
export const getBestTimeToVisit = async (placeId, dow = null) => {
  const hourlyRates = await getHourlySuccessRates(placeId, dow);

  let bestHour = null;
  let bestRate = 0;
  let bestSampleSize = 0;

  Object.entries(hourlyRates).forEach(([hour, data]) => {
    // サンプルサイズが3以上で成功率が高いものを選ぶ
    if (data.sampleSize >= 3 && data.rate > bestRate) {
      bestHour = parseInt(hour);
      bestRate = data.rate;
      bestSampleSize = data.sampleSize;
    }
  });

  if (bestHour === null) {
    return { recommendation: null, message: 'データ不足' };
  }

  return {
    recommendation: bestHour,
    rate: bestRate,
    sampleSize: bestSampleSize,
    message: `${bestHour}時頃が狙い目（成功率${Math.round(bestRate * 100)}%）`,
  };
};

/**
 * オフラインの観測データを同期
 */
export const syncPendingObservations = async () => {
  try {
    const pending = JSON.parse(localStorage.getItem('yorumichi_pending_observations') || '[]');

    if (pending.length === 0) return { synced: 0 };

    let synced = 0;
    const failed = [];

    for (const obs of pending) {
      try {
        const { _pendingAt, ...data } = obs;
        await recordObservation(data);
        synced++;
      } catch {
        failed.push(obs);
      }
    }

    localStorage.setItem('yorumichi_pending_observations', JSON.stringify(failed));
    return { synced, remaining: failed.length };
  } catch (error) {
    console.error('Sync pending observations error:', error);
    return { synced: 0, error: error.message };
  }
};

/**
 * エリア全体の統計を取得
 */
export const getAreaStats = async (placeIds, filters = {}) => {
  const stats = {
    totalObservations: 0,
    successRate: 0,
    byOutcome: { entered: 0, full: 0, queue_left: 0, closed: 0 },
    byDow: {},
    byHour: {},
  };

  // 各店舗の統計を集計
  for (const placeId of placeIds) {
    const placeStats = await getPlaceSuccessRate(placeId, filters);
    stats.totalObservations += placeStats.sampleSize;
  }

  if (stats.totalObservations === 0) {
    return stats;
  }

  // 簡易的な成功率計算
  let totalSuccesses = 0;
  for (const placeId of placeIds) {
    const placeStats = await getPlaceSuccessRate(placeId, filters);
    totalSuccesses += placeStats.successes || 0;
  }
  stats.successRate = totalSuccesses / stats.totalObservations;

  return stats;
};
