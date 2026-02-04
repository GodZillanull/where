// Firestoreスポットデータサービス
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
  serverTimestamp,
} from 'firebase/firestore';
import { yorimichi } from '../data/yorimichiData';

// コレクション名
const SPOTS_COLLECTION = 'spots';

// ローカルデータをFirestoreに同期（初期データ投入用）
export const syncLocalSpotsToFirestore = async () => {
  try {
    const localSpots = yorimichi.spots;
    let syncedCount = 0;

    for (const spot of localSpots) {
      // 既存チェック
      const q = query(
        collection(db, SPOTS_COLLECTION),
        where('id', '==', spot.id)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collection(db, SPOTS_COLLECTION), {
          ...spot,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        syncedCount++;
      }
    }

    console.log(`Synced ${syncedCount} spots to Firestore`);
    return syncedCount;
  } catch (error) {
    console.error('Sync spots error:', error);
    return 0;
  }
};

// 全スポットを取得（Firestoreから、失敗時はローカルフォールバック）
export const getAllSpots = async () => {
  try {
    const snapshot = await getDocs(collection(db, SPOTS_COLLECTION));

    if (snapshot.empty) {
      // Firestoreにデータがない場合はローカルデータを返す
      console.log('No spots in Firestore, using local data');
      return yorimichi.spots;
    }

    const spots = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      spots.push({ ...data, _docId: doc.id });
    });

    return spots;
  } catch (error) {
    console.error('Get spots error:', error);
    // エラー時はローカルデータにフォールバック
    return yorimichi.spots;
  }
};

// 特定エリアのスポットを取得
export const getSpotsByHomeStation = async (homeStation) => {
  try {
    const q = query(
      collection(db, SPOTS_COLLECTION),
      where('homeStation', '==', homeStation)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // フォールバック
      return yorimichi.spots.filter((s) => s.homeStation === homeStation);
    }

    const spots = [];
    snapshot.forEach((doc) => {
      spots.push({ ...doc.data(), _docId: doc.id });
    });

    return spots;
  } catch (error) {
    console.error('Get spots by home station error:', error);
    return yorimichi.spots.filter((s) => s.homeStation === homeStation);
  }
};

// タイプ別にスポットを取得
export const getSpotsByType = async (type) => {
  try {
    const q = query(
      collection(db, SPOTS_COLLECTION),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return yorimichi.spots.filter((s) => s.type === type);
    }

    const spots = [];
    snapshot.forEach((doc) => {
      spots.push({ ...doc.data(), _docId: doc.id });
    });

    return spots;
  } catch (error) {
    console.error('Get spots by type error:', error);
    return yorimichi.spots.filter((s) => s.type === type);
  }
};

// ズレレベル別にスポットを取得
export const getSpotsByZure = async (zure) => {
  try {
    const q = query(
      collection(db, SPOTS_COLLECTION),
      where('zure', '==', zure)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return yorimichi.spots.filter((s) => s.zure === zure);
    }

    const spots = [];
    snapshot.forEach((doc) => {
      spots.push({ ...doc.data(), _docId: doc.id });
    });

    return spots;
  } catch (error) {
    console.error('Get spots by zure error:', error);
    return yorimichi.spots.filter((s) => s.zure === zure);
  }
};

// スポットを追加
export const addSpot = async (spotData) => {
  try {
    const newSpot = {
      ...spotData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, SPOTS_COLLECTION), newSpot);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Add spot error:', error);
    return { success: false, error: error.message };
  }
};

// スポットを更新
export const updateSpot = async (docId, updates) => {
  try {
    const spotRef = doc(db, SPOTS_COLLECTION, docId);
    await updateDoc(spotRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Update spot error:', error);
    return { success: false, error: error.message };
  }
};

// スポットを削除
export const deleteSpot = async (docId) => {
  try {
    const spotRef = doc(db, SPOTS_COLLECTION, docId);
    await deleteDoc(spotRef);
    return { success: true };
  } catch (error) {
    console.error('Delete spot error:', error);
    return { success: false, error: error.message };
  }
};

// IDでスポットを取得
export const getSpotById = async (spotId) => {
  try {
    const q = query(
      collection(db, SPOTS_COLLECTION),
      where('id', '==', spotId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // フォールバック
      return yorimichi.spots.find((s) => s.id === spotId) || null;
    }

    const doc = snapshot.docs[0];
    return { ...doc.data(), _docId: doc.id };
  } catch (error) {
    console.error('Get spot by id error:', error);
    return yorimichi.spots.find((s) => s.id === spotId) || null;
  }
};

// 複合フィルタでスポットを取得
export const getFilteredSpots = async (filters = {}) => {
  try {
    let spots = await getAllSpots();

    // フィルタリング
    if (filters.homeStation) {
      spots = spots.filter((s) => s.homeStation === filters.homeStation);
    }
    if (filters.type) {
      spots = spots.filter((s) => s.type === filters.type);
    }
    if (filters.zure) {
      spots = spots.filter((s) => s.zure === filters.zure);
    }
    if (filters.maxTime) {
      spots = spots.filter(
        (s) => s.walkFromStation + s.stayTime <= filters.maxTime
      );
    }
    if (filters.maxCrowdLevel) {
      spots = spots.filter((s) => s.crowdLevel <= filters.maxCrowdLevel);
    }
    if (filters.maxNoiseLevel) {
      spots = spots.filter((s) => s.noiseLevel <= filters.maxNoiseLevel);
    }
    if (filters.noCashOnly) {
      spots = spots.filter((s) => !s.cashOnly);
    }

    return spots;
  } catch (error) {
    console.error('Get filtered spots error:', error);
    return [];
  }
};
