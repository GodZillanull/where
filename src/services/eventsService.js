/**
 * Events Service - イベント・展示・季節情報
 *
 * 時限性のあるコンテンツを管理
 * - 単発イベント（フェス、マルシェ等）
 * - 展示（美術館の企画展等）
 * - 季節イベント（花見、紅葉等）
 */
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';

/**
 * Event スキーマ
 * {
 *   eventId: string,
 *   title: string,
 *   type: string,              // "exhibition" / "festival" / "market" / "seasonal" / "popup"
 *   category: string,          // "art" / "music" / "food" / "nature" / "culture"
 *
 *   // 日時
 *   startDate: timestamp,
 *   endDate: timestamp,
 *   schedule: {
 *     openTime: string,        // "10:00"
 *     closeTime: string,       // "18:00"
 *     closedDays: number[],    // [1] = 月曜休み
 *     notes: string            // "最終入場17:30"
 *   },
 *
 *   // 場所
 *   venueId: string,           // venues コレクション参照（任意）
 *   venueName: string,         // 表示用
 *   areaId: string,
 *   geo: { lat, lng, geohash },
 *   address: string,
 *   access: string,            // "渋谷駅から徒歩5分"
 *
 *   // 内容
 *   description: string,
 *   highlights: string[],      // 見どころ箇条書き
 *   imageUrl: string,
 *   officialUrl: string,
 *
 *   // 料金・予約
 *   pricing: {
 *     type: string,            // "free" / "paid" / "donation"
 *     adult: number,
 *     student: number,
 *     notes: string            // "前売り割引あり"
 *   },
 *   reservation: {
 *     required: boolean,
 *     url: string,
 *     notes: string
 *   },
 *
 *   // 属性
 *   soloFriendly: boolean,
 *   crowdLevel: number,        // 1-5 予想混雑度
 *   stayTimeMin: number,       // 目安滞在時間
 *   tags: string[],            // ["雨の日OK", "写真映え", "デート向け"]
 *
 *   // 運用
 *   status: string,            // "upcoming" / "active" / "ended" / "cancelled"
 *   featured: boolean,         // おすすめフラグ
 *   priority: number,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

// イベントタイプ定義
export const EVENT_TYPES = {
  EXHIBITION: 'exhibition',   // 展示（美術館、ギャラリー）
  FESTIVAL: 'festival',       // フェス、祭り
  MARKET: 'market',           // マルシェ、蚤の市
  SEASONAL: 'seasonal',       // 季節イベント（花見、紅葉）
  POPUP: 'popup',             // ポップアップ
  WORKSHOP: 'workshop',       // ワークショップ
  PERFORMANCE: 'performance', // ライブ、演劇
};

export const EVENT_CATEGORIES = {
  ART: 'art',
  MUSIC: 'music',
  FOOD: 'food',
  NATURE: 'nature',
  CULTURE: 'culture',
  CRAFT: 'craft',
  KIDS: 'kids',
};

// ID生成
const generateEventId = () => 'evt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

/**
 * イベントを追加
 */
export const addEvent = async (eventData) => {
  try {
    const eventId = eventData.eventId || generateEventId();

    const event = {
      eventId,
      title: eventData.title,
      type: eventData.type,
      category: eventData.category,

      // 日時
      startDate: Timestamp.fromDate(new Date(eventData.startDate)),
      endDate: Timestamp.fromDate(new Date(eventData.endDate)),
      schedule: {
        openTime: eventData.openTime || '10:00',
        closeTime: eventData.closeTime || '18:00',
        closedDays: eventData.closedDays || [],
        notes: eventData.scheduleNotes || '',
      },

      // 場所
      venueId: eventData.venueId || null,
      venueName: eventData.venueName,
      areaId: eventData.areaId,
      geo: eventData.lat && eventData.lng ? {
        lat: eventData.lat,
        lng: eventData.lng,
        geohash: '', // 後で計算
      } : null,
      address: eventData.address || '',
      access: eventData.access || '',

      // 内容
      description: eventData.description || '',
      highlights: eventData.highlights || [],
      imageUrl: eventData.imageUrl || '',
      officialUrl: eventData.officialUrl || '',

      // 料金・予約
      pricing: {
        type: eventData.pricingType || 'paid',
        adult: eventData.priceAdult || 0,
        student: eventData.priceStudent || 0,
        notes: eventData.pricingNotes || '',
      },
      reservation: {
        required: eventData.reservationRequired || false,
        url: eventData.reservationUrl || '',
        notes: eventData.reservationNotes || '',
      },

      // 属性
      soloFriendly: eventData.soloFriendly ?? true,
      crowdLevel: eventData.crowdLevel || 3,
      stayTimeMin: eventData.stayTimeMin || 60,
      tags: eventData.tags || [],

      // 運用
      status: 'upcoming',
      featured: eventData.featured || false,
      priority: eventData.priority || 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // ステータス自動判定
    const now = new Date();
    const start = new Date(eventData.startDate);
    const end = new Date(eventData.endDate);
    if (now >= start && now <= end) {
      event.status = 'active';
    } else if (now > end) {
      event.status = 'ended';
    }

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), event);
    return { success: true, eventId, docId: docRef.id };
  } catch (error) {
    console.error('Add event error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 現在開催中のイベントを取得
 */
export const getActiveEvents = async (options = {}) => {
  try {
    const now = Timestamp.now();

    let q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', 'in', ['active', 'upcoming']),
      where('endDate', '>=', now),
      orderBy('endDate', 'asc')
    );

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    let events = [];

    snapshot.forEach((doc) => {
      events.push({ ...doc.data(), _docId: doc.id });
    });

    // フィルタリング
    if (options.areaId) {
      events = events.filter((e) => e.areaId === options.areaId);
    }
    if (options.type) {
      events = events.filter((e) => e.type === options.type);
    }
    if (options.category) {
      events = events.filter((e) => e.category === options.category);
    }
    if (options.soloFriendly) {
      events = events.filter((e) => e.soloFriendly);
    }
    if (options.freeOnly) {
      events = events.filter((e) => e.pricing?.type === 'free');
    }

    // 優先度とfeaturedでソート
    events.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured ? 1 : -1;
      return (b.priority || 0) - (a.priority || 0);
    });

    return events;
  } catch (error) {
    console.error('Get active events error:', error);
    return [];
  }
};

/**
 * 今週末のイベントを取得
 */
export const getWeekendEvents = async (areaId = null) => {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // 次の土曜日を計算
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + (6 - dayOfWeek));
  saturday.setHours(0, 0, 0, 0);

  // 次の日曜日
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);

  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', 'in', ['active', 'upcoming']),
      where('startDate', '<=', Timestamp.fromDate(sunday)),
      where('endDate', '>=', Timestamp.fromDate(saturday))
    );

    const snapshot = await getDocs(q);
    let events = [];

    snapshot.forEach((doc) => {
      events.push({ ...doc.data(), _docId: doc.id });
    });

    if (areaId) {
      events = events.filter((e) => e.areaId === areaId);
    }

    return events;
  } catch (error) {
    console.error('Get weekend events error:', error);
    return [];
  }
};

/**
 * 終了間近のイベントを取得（FOMO喚起用）
 */
export const getEndingSoonEvents = async (daysThreshold = 7, areaId = null) => {
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(now.getDate() + daysThreshold);

  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'active'),
      where('endDate', '>=', Timestamp.now()),
      where('endDate', '<=', Timestamp.fromDate(threshold)),
      orderBy('endDate', 'asc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    let events = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // 残り日数を計算
      const endDate = data.endDate.toDate();
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      events.push({ ...data, _docId: doc.id, daysLeft });
    });

    if (areaId) {
      events = events.filter((e) => e.areaId === areaId);
    }

    return events;
  } catch (error) {
    console.error('Get ending soon events error:', error);
    return [];
  }
};

/**
 * 展示（美術館系）を取得
 */
export const getExhibitions = async (options = {}) => {
  return getActiveEvents({ ...options, type: EVENT_TYPES.EXHIBITION });
};

/**
 * 季節イベントを取得
 */
export const getSeasonalEvents = async (options = {}) => {
  return getActiveEvents({ ...options, type: EVENT_TYPES.SEASONAL });
};

/**
 * イベントIDで取得
 */
export const getEventById = async (eventId) => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('eventId', '==', eventId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return { ...snapshot.docs[0].data(), _docId: snapshot.docs[0].id };
  } catch (error) {
    console.error('Get event error:', error);
    return null;
  }
};

/**
 * イベントステータスを更新（バッチ処理用）
 */
export const updateEventStatuses = async () => {
  try {
    const now = Timestamp.now();
    let updated = 0;

    // upcoming → active
    const upcomingQ = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'upcoming'),
      where('startDate', '<=', now)
    );
    const upcomingSnap = await getDocs(upcomingQ);
    for (const docSnap of upcomingSnap.docs) {
      await updateDoc(doc(db, EVENTS_COLLECTION, docSnap.id), { status: 'active' });
      updated++;
    }

    // active → ended
    const activeQ = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'active'),
      where('endDate', '<', now)
    );
    const activeSnap = await getDocs(activeQ);
    for (const docSnap of activeSnap.docs) {
      await updateDoc(doc(db, EVENTS_COLLECTION, docSnap.id), { status: 'ended' });
      updated++;
    }

    return { success: true, updated };
  } catch (error) {
    console.error('Update statuses error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * タグで検索
 */
export const getEventsByTag = async (tag) => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('tags', 'array-contains', tag),
      where('status', 'in', ['active', 'upcoming'])
    );

    const snapshot = await getDocs(q);
    const events = [];

    snapshot.forEach((doc) => {
      events.push({ ...doc.data(), _docId: doc.id });
    });

    return events;
  } catch (error) {
    console.error('Get events by tag error:', error);
    return [];
  }
};
