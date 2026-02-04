// Firestore分析データサービス
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

// コレクション名
const ANALYTICS_COLLECTION = 'analytics';
const RATINGS_COLLECTION = 'ratings';

// 分析イベントを保存
export const logAnalyticsEvent = async (eventName, params = {}) => {
  try {
    const event = {
      event: eventName,
      params,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    await addDoc(collection(db, ANALYTICS_COLLECTION), event);
    return true;
  } catch (error) {
    console.error('Analytics log error:', error);
    // エラー時はlocalStorageにフォールバック
    fallbackToLocalStorage(eventName, params);
    return false;
  }
};

// 評価を保存
export const saveRating = async (spotId, spotName, rating, mehReason = null) => {
  try {
    const ratingData = {
      spotId,
      spotName,
      rating, // 'good' | 'meh'
      mehReason,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, RATINGS_COLLECTION), ratingData);
    return true;
  } catch (error) {
    console.error('Rating save error:', error);
    return false;
  }
};

// スポットの評価統計を取得
export const getSpotRatings = async (spotId) => {
  try {
    const q = query(
      collection(db, RATINGS_COLLECTION),
      where('spotId', '==', spotId)
    );
    const snapshot = await getDocs(q);

    let goodCount = 0;
    let mehCount = 0;
    const mehReasons = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rating === 'good') {
        goodCount++;
      } else if (data.rating === 'meh') {
        mehCount++;
        if (data.mehReason) {
          mehReasons[data.mehReason] = (mehReasons[data.mehReason] || 0) + 1;
        }
      }
    });

    return {
      goodCount,
      mehCount,
      totalCount: goodCount + mehCount,
      mehReasons,
    };
  } catch (error) {
    console.error('Get ratings error:', error);
    return null;
  }
};

// 最近の分析イベントを取得
export const getRecentAnalytics = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, ANALYTICS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return events;
  } catch (error) {
    console.error('Get analytics error:', error);
    return [];
  }
};

// LocalStorageへのフォールバック（オフライン対応）
const fallbackToLocalStorage = (eventName, params) => {
  try {
    const logs = JSON.parse(localStorage.getItem('yorumichi_analytics_offline') || '[]');
    logs.push({
      event: eventName,
      params,
      timestamp: new Date().toISOString(),
    });
    // 最新500件のみ保持
    if (logs.length > 500) logs.shift();
    localStorage.setItem('yorumichi_analytics_offline', JSON.stringify(logs));
  } catch (e) {
    console.warn('LocalStorage fallback failed:', e);
  }
};

// オフラインデータをFirestoreに同期
export const syncOfflineData = async () => {
  try {
    const offlineLogs = JSON.parse(localStorage.getItem('yorumichi_analytics_offline') || '[]');
    if (offlineLogs.length === 0) return;

    for (const log of offlineLogs) {
      await addDoc(collection(db, ANALYTICS_COLLECTION), {
        ...log,
        syncedAt: serverTimestamp(),
      });
    }

    // 同期完了後にクリア
    localStorage.removeItem('yorumichi_analytics_offline');
    console.log(`Synced ${offlineLogs.length} offline events`);
  } catch (error) {
    console.error('Sync offline data error:', error);
  }
};
