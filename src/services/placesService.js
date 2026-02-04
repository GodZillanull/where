/**
 * Places Service - 店舗マスタデータ（ほぼ更新しない静的データ）
 *
 * 設計原則: Place（店）とAvailability（空席）を分離
 * - 店情報は静的、空席は動的。混ぜると更新地獄。
 */
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';

const PLACES_COLLECTION = 'places';

/**
 * Place スキーマ
 * {
 *   placeId: string,          // 自前UUID
 *   name: string,
 *   areaId: string,           // yokohama_station / shibuya
 *   geo: {
 *     lat: number,
 *     lng: number,
 *     geohash: string
 *   },
 *   categories: string[],     // ["izakaya","cafe","bar"]
 *   soloFriendly: boolean,
 *   priceBand: number,        // 1-4
 *   tags: string[],           // ["quiet","counter","fast_turnover"]
 *   openHours: object,        // 週スケジュール
 *   sourceRefs: object,       // Google/TableCheck/Tabelog等の紐付け
 *   status: string,           // active/paused/closed
 *   curation: {
 *     priority: number,       // 手動優先度
 *     notesInternal: string,  // 運用メモ
 *     riskFlags: string[]     // ["always_full","reservation_only"]
 *   },
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

// UUID生成
const generatePlaceId = () => {
  return 'pl_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
};

// Geohash生成（geofire-commonがない場合のシンプル実装）
const simpleGeohash = (lat, lng, precision = 9) => {
  // 簡易実装：本番ではgeofire-commonを使う
  const latStr = ((lat + 90) * 10000).toString(36).slice(0, precision / 2);
  const lngStr = ((lng + 180) * 10000).toString(36).slice(0, precision / 2);
  return latStr + lngStr;
};

/**
 * 店舗を追加
 */
export const addPlace = async (placeData) => {
  try {
    const placeId = placeData.placeId || generatePlaceId();

    const place = {
      placeId,
      name: placeData.name,
      areaId: placeData.areaId,
      geo: {
        lat: placeData.lat,
        lng: placeData.lng,
        geohash: simpleGeohash(placeData.lat, placeData.lng),
      },
      categories: placeData.categories || [],
      soloFriendly: placeData.soloFriendly ?? true,
      priceBand: placeData.priceBand || 2,
      tags: placeData.tags || [],
      openHours: placeData.openHours || {},
      sourceRefs: placeData.sourceRefs || {},
      status: 'active',
      curation: {
        priority: placeData.priority || 50,
        notesInternal: placeData.notesInternal || '',
        riskFlags: placeData.riskFlags || [],
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, PLACES_COLLECTION), place);
    return { success: true, placeId, docId: docRef.id };
  } catch (error) {
    console.error('Add place error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * placeIdで店舗を取得
 */
export const getPlaceById = async (placeId) => {
  try {
    const q = query(
      collection(db, PLACES_COLLECTION),
      where('placeId', '==', placeId),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { ...doc.data(), _docId: doc.id };
  } catch (error) {
    console.error('Get place error:', error);
    return null;
  }
};

/**
 * エリアで店舗を取得
 */
export const getPlacesByArea = async (areaId, options = {}) => {
  try {
    let q = query(
      collection(db, PLACES_COLLECTION),
      where('areaId', '==', areaId),
      where('status', '==', 'active')
    );

    if (options.soloFriendly) {
      q = query(q, where('soloFriendly', '==', true));
    }

    if (options.maxPriceBand) {
      q = query(q, where('priceBand', '<=', options.maxPriceBand));
    }

    const snapshot = await getDocs(q);
    const places = [];

    snapshot.forEach((doc) => {
      places.push({ ...doc.data(), _docId: doc.id });
    });

    // priority でソート
    places.sort((a, b) => (b.curation?.priority || 0) - (a.curation?.priority || 0));

    return places;
  } catch (error) {
    console.error('Get places by area error:', error);
    return [];
  }
};

/**
 * カテゴリで店舗を取得
 */
export const getPlacesByCategory = async (category, areaId = null) => {
  try {
    let q = query(
      collection(db, PLACES_COLLECTION),
      where('categories', 'array-contains', category),
      where('status', '==', 'active')
    );

    if (areaId) {
      q = query(q, where('areaId', '==', areaId));
    }

    const snapshot = await getDocs(q);
    const places = [];

    snapshot.forEach((doc) => {
      places.push({ ...doc.data(), _docId: doc.id });
    });

    return places;
  } catch (error) {
    console.error('Get places by category error:', error);
    return [];
  }
};

/**
 * 店舗情報を更新（運用用、頻繁に使わない）
 */
export const updatePlace = async (placeId, updates) => {
  try {
    const place = await getPlaceById(placeId);
    if (!place) {
      return { success: false, error: 'Place not found' };
    }

    const docRef = doc(db, PLACES_COLLECTION, place._docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update place error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 店舗のステータスを変更
 */
export const updatePlaceStatus = async (placeId, status) => {
  return updatePlace(placeId, { status });
};

/**
 * キュレーション情報を更新
 */
export const updatePlaceCuration = async (placeId, curation) => {
  const place = await getPlaceById(placeId);
  if (!place) return { success: false, error: 'Place not found' };

  return updatePlace(placeId, {
    curation: { ...place.curation, ...curation },
  });
};

/**
 * リスクフラグを追加
 */
export const addRiskFlag = async (placeId, flag) => {
  const place = await getPlaceById(placeId);
  if (!place) return { success: false, error: 'Place not found' };

  const flags = place.curation?.riskFlags || [];
  if (!flags.includes(flag)) {
    flags.push(flag);
    return updatePlaceCuration(placeId, { riskFlags: flags });
  }
  return { success: true };
};

/**
 * 全店舗を取得（管理用）
 */
export const getAllPlaces = async (includeInactive = false) => {
  try {
    let q;
    if (includeInactive) {
      q = query(collection(db, PLACES_COLLECTION));
    } else {
      q = query(
        collection(db, PLACES_COLLECTION),
        where('status', '==', 'active')
      );
    }

    const snapshot = await getDocs(q);
    const places = [];

    snapshot.forEach((doc) => {
      places.push({ ...doc.data(), _docId: doc.id });
    });

    return places;
  } catch (error) {
    console.error('Get all places error:', error);
    return [];
  }
};
