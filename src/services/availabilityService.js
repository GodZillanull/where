/**
 * Availability Snapshots Service - 空席シグナル（動的データ、TTL前提）
 *
 * 設計原則: 空席は「真偽」じゃなく確率スコア（信頼度付き）で扱う
 * - P0は推定でいい。重要なのは「推定が外れた時の復旧導線」
 */
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const AVAILABILITY_COLLECTION = 'availability_snapshots';

/**
 * AvailabilitySnapshot スキーマ
 * {
 *   placeId: string,
 *   timeBucketStart: timestamp,    // 15分刻み
 *   status: string,                // "likely_open" / "unknown" / "likely_full"
 *   score: number,                 // 0.0-1.0：入れる確率
 *   confidence: number,            // 0.0-1.0：根拠の強さ
 *   signalType: string,            // "manual_call" / "walkin_observed" / "provider_api" / "user_report"
 *   signalSource: string,          // "operator" / "tablecheck" / "user"
 *   observedAt: timestamp,
 *   expiresAt: timestamp,          // TTL用
 *   meta: {
 *     waitMinEstimate: number,     // 任意
 *     note: string                 // 任意
 *   }
 * }
 */

// 15分刻みのタイムバケットを計算
const getTimeBucket = (date = new Date()) => {
  const d = new Date(date);
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

// デフォルトTTL（1時間後）
const getDefaultExpiry = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d;
};

/**
 * 空席シグナルを記録
 */
export const recordAvailability = async ({
  placeId,
  status,
  score,
  confidence,
  signalType,
  signalSource,
  waitMinEstimate = null,
  note = null,
  ttlMinutes = 60,
}) => {
  try {
    const now = new Date();
    const timeBucketStart = getTimeBucket(now);
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    const snapshot = {
      placeId,
      timeBucketStart: Timestamp.fromDate(timeBucketStart),
      status, // "likely_open" / "unknown" / "likely_full"
      score: Math.max(0, Math.min(1, score)),
      confidence: Math.max(0, Math.min(1, confidence)),
      signalType,
      signalSource,
      observedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      meta: {
        waitMinEstimate,
        note,
      },
    };

    const docRef = await addDoc(collection(db, AVAILABILITY_COLLECTION), snapshot);
    return { success: true, snapshotId: docRef.id };
  } catch (error) {
    console.error('Record availability error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 特定店舗の最新空席情報を取得
 */
export const getLatestAvailability = async (placeId) => {
  try {
    const now = Timestamp.now();

    const q = query(
      collection(db, AVAILABILITY_COLLECTION),
      where('placeId', '==', placeId),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'desc'),
      orderBy('observedAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // 有効なシグナルなし → unknown を返す
      return {
        placeId,
        status: 'unknown',
        score: 0.5,
        confidence: 0,
        signalType: 'none',
        signalSource: 'default',
        isStale: true,
      };
    }

    const doc = snapshot.docs[0];
    return { ...doc.data(), _snapshotId: doc.id, isStale: false };
  } catch (error) {
    console.error('Get availability error:', error);
    // エラー時もunknownを返す（UXを止めない）
    return {
      placeId,
      status: 'unknown',
      score: 0.5,
      confidence: 0,
      signalType: 'error',
      signalSource: 'fallback',
      isStale: true,
    };
  }
};

/**
 * 複数店舗の空席情報を一括取得
 */
export const getBatchAvailability = async (placeIds) => {
  try {
    const results = {};

    // 並列で取得
    await Promise.all(
      placeIds.map(async (placeId) => {
        results[placeId] = await getLatestAvailability(placeId);
      })
    );

    return results;
  } catch (error) {
    console.error('Batch availability error:', error);
    // フォールバック
    const results = {};
    placeIds.forEach((id) => {
      results[id] = {
        placeId: id,
        status: 'unknown',
        score: 0.5,
        confidence: 0,
        isStale: true,
      };
    });
    return results;
  }
};

/**
 * エリア内の空席状況サマリーを取得
 */
export const getAreaAvailabilitySummary = async (placeIds) => {
  const availability = await getBatchAvailability(placeIds);

  let likelyOpen = 0;
  let unknown = 0;
  let likelyFull = 0;

  Object.values(availability).forEach((a) => {
    if (a.status === 'likely_open') likelyOpen++;
    else if (a.status === 'likely_full') likelyFull++;
    else unknown++;
  });

  return {
    total: placeIds.length,
    likelyOpen,
    unknown,
    likelyFull,
    openRate: placeIds.length > 0 ? likelyOpen / placeIds.length : 0,
  };
};

/**
 * 手動で空席情報を報告（運用者向け）
 */
export const reportManualAvailability = async (placeId, status, note = '') => {
  // statusから score を推定
  const scoreMap = {
    likely_open: 0.8,
    unknown: 0.5,
    likely_full: 0.2,
  };

  return recordAvailability({
    placeId,
    status,
    score: scoreMap[status] || 0.5,
    confidence: 0.9, // 手動報告は信頼度高い
    signalType: 'manual_call',
    signalSource: 'operator',
    note,
    ttlMinutes: 30, // 手動は30分で期限切れ
  });
};

/**
 * ユーザーからの空席報告
 */
export const reportUserAvailability = async (placeId, wasAbleToEnter, waitMinutes = null) => {
  const status = wasAbleToEnter ? 'likely_open' : 'likely_full';
  const score = wasAbleToEnter ? 0.7 : 0.3;

  return recordAvailability({
    placeId,
    status,
    score,
    confidence: 0.6, // ユーザー報告は中程度の信頼度
    signalType: 'user_report',
    signalSource: 'user',
    waitMinEstimate: waitMinutes,
    ttlMinutes: 45, // ユーザー報告は45分で期限切れ
  });
};

/**
 * 期限切れのスナップショットを削除（Cloud Functions推奨）
 */
export const cleanupExpiredSnapshots = async () => {
  try {
    const now = Timestamp.now();

    const q = query(
      collection(db, AVAILABILITY_COLLECTION),
      where('expiresAt', '<', now),
      limit(100) // バッチ削除
    );

    const snapshot = await getDocs(q);
    let deletedCount = 0;

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, AVAILABILITY_COLLECTION, docSnap.id));
      deletedCount++;
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error('Cleanup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * スコアに基づいて店舗をソート（提案用）
 */
export const sortPlacesByAvailability = async (places) => {
  const placeIds = places.map((p) => p.placeId);
  const availability = await getBatchAvailability(placeIds);

  return places
    .map((place) => ({
      ...place,
      availability: availability[place.placeId],
    }))
    .sort((a, b) => {
      // スコア × 信頼度 で重み付けソート
      const aWeight = a.availability.score * (0.5 + a.availability.confidence * 0.5);
      const bWeight = b.availability.score * (0.5 + b.availability.confidence * 0.5);
      return bWeight - aWeight;
    });
};
