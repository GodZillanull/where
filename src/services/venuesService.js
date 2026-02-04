/**
 * Venues Service - 美術館・公園・施設（常設スポット）
 *
 * 飲食店(places)とは別に管理
 * - 美術館・博物館・ギャラリー
 * - 公園・庭園
 * - 映画館・劇場
 * - 商業施設
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
} from 'firebase/firestore';

const VENUES_COLLECTION = 'venues';

/**
 * Venue スキーマ
 * {
 *   venueId: string,
 *   name: string,
 *   type: string,              // "museum" / "gallery" / "park" / "theater" / "facility"
 *   subtype: string,           // "art_museum" / "history_museum" / "botanical_garden" etc.
 *
 *   // 場所
 *   areaId: string,
 *   geo: { lat, lng, geohash },
 *   address: string,
 *   access: [{
 *     station: string,
 *     line: string,
 *     walkMinutes: number,
 *     exit: string             // "東口"
 *   }],
 *
 *   // 基本情報
 *   description: string,
 *   highlights: string[],      // 見どころ
 *   imageUrl: string,
 *   officialUrl: string,
 *
 *   // 営業情報
 *   openHours: {
 *     default: { open: "10:00", close: "18:00" },
 *     friday: { open: "10:00", close: "20:00" },  // 金曜夜間
 *     ...
 *   },
 *   closedDays: string[],      // ["月曜", "年末年始"]
 *   closedNotes: string,       // "祝日の場合は翌日休み"
 *
 *   // 料金
 *   pricing: {
 *     type: string,            // "free" / "paid" / "varies"
 *     permanent: {             // 常設展
 *       adult: number,
 *       student: number,
 *       senior: number,
 *       child: number
 *     },
 *     notes: string,           // "企画展は別料金"
 *     freeDay: string          // "毎月第3日曜"
 *   },
 *
 *   // 施設情報
 *   facilities: {
 *     cafe: boolean,
 *     restaurant: boolean,
 *     shop: boolean,
 *     locker: boolean,
 *     wheelchair: boolean,
 *     stroller: boolean,
 *     parking: boolean,
 *     wifi: boolean
 *   },
 *
 *   // 属性
 *   soloFriendly: boolean,
 *   kidsFriendly: boolean,
 *   petFriendly: boolean,
 *   rainOk: boolean,           // 雨の日OK
 *   stayTimeMin: number,       // 目安滞在時間
 *   crowdTimes: {              // 混雑傾向
 *     weekdayPeak: string[],   // ["11:00-13:00"]
 *     weekendPeak: string[]
 *   },
 *   bestSeasons: string[],     // ["春", "秋"]（公園向け）
 *   tags: string[],
 *
 *   // 運用
 *   status: string,            // "active" / "temporary_closed" / "closed"
 *   featured: boolean,
 *   priority: number,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

// 施設タイプ定義
export const VENUE_TYPES = {
  MUSEUM: 'museum',
  GALLERY: 'gallery',
  PARK: 'park',
  THEATER: 'theater',
  FACILITY: 'facility',
};

export const VENUE_SUBTYPES = {
  // Museum
  ART_MUSEUM: 'art_museum',
  HISTORY_MUSEUM: 'history_museum',
  SCIENCE_MUSEUM: 'science_museum',
  SPECIALTY_MUSEUM: 'specialty_museum',

  // Gallery
  COMMERCIAL_GALLERY: 'commercial_gallery',
  PUBLIC_GALLERY: 'public_gallery',

  // Park
  URBAN_PARK: 'urban_park',
  BOTANICAL_GARDEN: 'botanical_garden',
  JAPANESE_GARDEN: 'japanese_garden',
  WATERFRONT: 'waterfront',

  // Theater
  CINEMA: 'cinema',
  LIVE_HOUSE: 'live_house',
  THEATER: 'theater',

  // Facility
  COMMERCIAL: 'commercial',
  LIBRARY: 'library',
  SPORTS: 'sports',
};

// ID生成
const generateVenueId = () => 'ven_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

/**
 * 施設を追加
 */
export const addVenue = async (venueData) => {
  try {
    const venueId = venueData.venueId || generateVenueId();

    const venue = {
      venueId,
      name: venueData.name,
      type: venueData.type,
      subtype: venueData.subtype || null,

      // 場所
      areaId: venueData.areaId,
      geo: venueData.lat && venueData.lng ? {
        lat: venueData.lat,
        lng: venueData.lng,
        geohash: '',
      } : null,
      address: venueData.address || '',
      access: venueData.access || [],

      // 基本情報
      description: venueData.description || '',
      highlights: venueData.highlights || [],
      imageUrl: venueData.imageUrl || '',
      officialUrl: venueData.officialUrl || '',

      // 営業情報
      openHours: venueData.openHours || {
        default: { open: '10:00', close: '18:00' },
      },
      closedDays: venueData.closedDays || [],
      closedNotes: venueData.closedNotes || '',

      // 料金
      pricing: {
        type: venueData.pricingType || 'paid',
        permanent: {
          adult: venueData.priceAdult || 0,
          student: venueData.priceStudent || 0,
          senior: venueData.priceSenior || 0,
          child: venueData.priceChild || 0,
        },
        notes: venueData.pricingNotes || '',
        freeDay: venueData.freeDay || null,
      },

      // 施設情報
      facilities: {
        cafe: venueData.hasCafe || false,
        restaurant: venueData.hasRestaurant || false,
        shop: venueData.hasShop || false,
        locker: venueData.hasLocker || false,
        wheelchair: venueData.wheelchairAccessible || false,
        stroller: venueData.strollerOk || false,
        parking: venueData.hasParking || false,
        wifi: venueData.hasWifi || false,
      },

      // 属性
      soloFriendly: venueData.soloFriendly ?? true,
      kidsFriendly: venueData.kidsFriendly ?? true,
      petFriendly: venueData.petFriendly || false,
      rainOk: venueData.rainOk ?? (venueData.type !== 'park'),
      stayTimeMin: venueData.stayTimeMin || 90,
      crowdTimes: venueData.crowdTimes || {},
      bestSeasons: venueData.bestSeasons || [],
      tags: venueData.tags || [],

      // 運用
      status: 'active',
      featured: venueData.featured || false,
      priority: venueData.priority || 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, VENUES_COLLECTION), venue);
    return { success: true, venueId, docId: docRef.id };
  } catch (error) {
    console.error('Add venue error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 美術館・博物館を取得
 */
export const getMuseums = async (options = {}) => {
  try {
    let q = query(
      collection(db, VENUES_COLLECTION),
      where('type', '==', VENUE_TYPES.MUSEUM),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    let venues = [];

    snapshot.forEach((doc) => {
      venues.push({ ...doc.data(), _docId: doc.id });
    });

    // フィルタ
    if (options.areaId) {
      venues = venues.filter((v) => v.areaId === options.areaId);
    }
    if (options.subtype) {
      venues = venues.filter((v) => v.subtype === options.subtype);
    }
    if (options.freeOnly) {
      venues = venues.filter((v) => v.pricing?.type === 'free');
    }
    if (options.soloFriendly) {
      venues = venues.filter((v) => v.soloFriendly);
    }

    // ソート
    venues.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured ? 1 : -1;
      return (b.priority || 0) - (a.priority || 0);
    });

    return venues;
  } catch (error) {
    console.error('Get museums error:', error);
    return [];
  }
};

/**
 * ギャラリーを取得
 */
export const getGalleries = async (options = {}) => {
  try {
    const q = query(
      collection(db, VENUES_COLLECTION),
      where('type', '==', VENUE_TYPES.GALLERY),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    let venues = [];

    snapshot.forEach((doc) => {
      venues.push({ ...doc.data(), _docId: doc.id });
    });

    if (options.areaId) {
      venues = venues.filter((v) => v.areaId === options.areaId);
    }

    return venues;
  } catch (error) {
    console.error('Get galleries error:', error);
    return [];
  }
};

/**
 * 公園・庭園を取得
 */
export const getParks = async (options = {}) => {
  try {
    const q = query(
      collection(db, VENUES_COLLECTION),
      where('type', '==', VENUE_TYPES.PARK),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    let venues = [];

    snapshot.forEach((doc) => {
      venues.push({ ...doc.data(), _docId: doc.id });
    });

    // フィルタ
    if (options.areaId) {
      venues = venues.filter((v) => v.areaId === options.areaId);
    }
    if (options.subtype) {
      venues = venues.filter((v) => v.subtype === options.subtype);
    }
    if (options.petFriendly) {
      venues = venues.filter((v) => v.petFriendly);
    }
    if (options.season) {
      venues = venues.filter((v) => v.bestSeasons?.includes(options.season));
    }

    return venues;
  } catch (error) {
    console.error('Get parks error:', error);
    return [];
  }
};

/**
 * 雨の日OKの施設を取得
 */
export const getRainyDayVenues = async (areaId = null) => {
  try {
    const q = query(
      collection(db, VENUES_COLLECTION),
      where('rainOk', '==', true),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    let venues = [];

    snapshot.forEach((doc) => {
      venues.push({ ...doc.data(), _docId: doc.id });
    });

    if (areaId) {
      venues = venues.filter((v) => v.areaId === areaId);
    }

    return venues;
  } catch (error) {
    console.error('Get rainy day venues error:', error);
    return [];
  }
};

/**
 * 無料の施設を取得
 */
export const getFreeVenues = async (areaId = null) => {
  try {
    const q = query(
      collection(db, VENUES_COLLECTION),
      where('pricing.type', '==', 'free'),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    let venues = [];

    snapshot.forEach((doc) => {
      venues.push({ ...doc.data(), _docId: doc.id });
    });

    if (areaId) {
      venues = venues.filter((v) => v.areaId === areaId);
    }

    return venues;
  } catch (error) {
    console.error('Get free venues error:', error);
    return [];
  }
};

/**
 * 施設IDで取得
 */
export const getVenueById = async (venueId) => {
  try {
    const q = query(
      collection(db, VENUES_COLLECTION),
      where('venueId', '==', venueId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return { ...snapshot.docs[0].data(), _docId: snapshot.docs[0].id };
  } catch (error) {
    console.error('Get venue error:', error);
    return null;
  }
};

/**
 * エリアの全施設を取得
 */
export const getVenuesByArea = async (areaId, options = {}) => {
  try {
    let q = query(
      collection(db, VENUES_COLLECTION),
      where('areaId', '==', areaId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    let venues = [];

    snapshot.forEach((doc) => {
      venues.push({ ...doc.data(), _docId: doc.id });
    });

    if (options.type) {
      venues = venues.filter((v) => v.type === options.type);
    }

    return venues;
  } catch (error) {
    console.error('Get venues by area error:', error);
    return [];
  }
};

/**
 * 今日営業中の施設を取得
 */
export const getOpenNowVenues = async (areaId = null) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

    const q = query(
      collection(db, VENUES_COLLECTION),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    const venues = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // 営業時間チェック
      const hours = data.openHours?.[dayOfWeek] || data.openHours?.default;
      if (hours) {
        const openTime = hours.open || '00:00';
        const closeTime = hours.close || '23:59';
        if (currentTime >= openTime && currentTime <= closeTime) {
          venues.push({ ...data, _docId: doc.id });
        }
      }
    });

    if (areaId) {
      return venues.filter((v) => v.areaId === areaId);
    }

    return venues;
  } catch (error) {
    console.error('Get open now error:', error);
    return [];
  }
};

/**
 * 施設を更新
 */
export const updateVenue = async (venueId, updates) => {
  try {
    const venue = await getVenueById(venueId);
    if (!venue) {
      return { success: false, error: 'Venue not found' };
    }

    const docRef = doc(db, VENUES_COLLECTION, venue._docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update venue error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * タグで検索
 */
export const getVenuesByTag = async (tag, areaId = null) => {
  try {
    const q = query(
      collection(db, VENUES_COLLECTION),
      where('tags', 'array-contains', tag),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    let venues = [];

    snapshot.forEach((doc) => {
      venues.push({ ...doc.data(), _docId: doc.id });
    });

    if (areaId) {
      venues = venues.filter((v) => v.areaId === areaId);
    }

    return venues;
  } catch (error) {
    console.error('Get venues by tag error:', error);
    return [];
  }
};
