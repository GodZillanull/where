/**
 * Sessions Service - 寄り道セッション（状態遷移の本体）
 *
 * ユーザーが「今からどこ行く？」を開始した単位
 * リトライ（レスキュー）は session を引き継ぐか、parentSessionId でチェーン
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

const SESSIONS_COLLECTION = 'sessions';

/**
 * Session スキーマ
 * {
 *   sessionId: string,
 *   userId: string,
 *   createdAt: timestamp,
 *   areaId: string,
 *   intent: string,              // "drink" / "cafe" / "food"
 *   constraints: {
 *     maxWalkMin: number,
 *     priceBand: number,
 *     soloOnly: boolean,
 *     etc.
 *   },
 *   state: string,               // "proposed" → "selected" → "arrived" → "success"/"fail" → "rescue"
 *   proposals: [{                // サブコレクション推奨
 *     rank: number,
 *     placeId: string,
 *     snapshotRef: string,       // availability_snapshots参照
 *     reason: string,            // 表示用1行
 *     scoreAtPropose: number
 *   }],
 *   selectedPlaceId: string,     // 任意
 *   result: {
 *     outcome: string,
 *     feedback: string           // 任意
 *   },
 *   parentSessionId: string,     // レスキューチェーン用
 *   rescueCount: number,         // リトライ回数
 *   ticketUsed: string           // 課金チケットID
 * }
 */

// セッション状態の定義
export const SESSION_STATES = {
  PROPOSED: 'proposed',      // 提案表示中
  SELECTED: 'selected',      // 店舗を選択した
  NAVIGATING: 'navigating',  // 移動中
  ARRIVED: 'arrived',        // 到着した
  SUCCESS: 'success',        // 入店成功
  FAIL: 'fail',              // 入店失敗
  RESCUE: 'rescue',          // レスキュー中
  ABANDONED: 'abandoned',    // 離脱
};

// セッションID生成
const generateSessionId = () => {
  return 'ses_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
};

// 匿名ユーザーID取得
const getAnonymousUserId = () => {
  let id = localStorage.getItem('yorumichi_anonymous_id');
  if (!id) {
    id = 'anon_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    localStorage.setItem('yorumichi_anonymous_id', id);
  }
  return id;
};

/**
 * 新しいセッションを開始
 */
export const startSession = async ({
  areaId,
  intent,
  constraints = {},
  userId = null,
  parentSessionId = null,
}) => {
  try {
    const sessionId = generateSessionId();

    const session = {
      sessionId,
      userId: userId || getAnonymousUserId(),
      createdAt: serverTimestamp(),
      areaId,
      intent, // "drink" / "cafe" / "food" / "explore"
      constraints: {
        maxWalkMin: constraints.maxWalkMin || 10,
        priceBand: constraints.priceBand || null,
        soloOnly: constraints.soloOnly || false,
        ...constraints,
      },
      state: SESSION_STATES.PROPOSED,
      proposals: [],
      selectedPlaceId: null,
      result: null,
      parentSessionId,
      rescueCount: parentSessionId ? 1 : 0,
      ticketUsed: null,
    };

    const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), session);

    // ローカルにも保存（オフライン対応）
    localStorage.setItem('yorumichi_current_session', JSON.stringify({
      sessionId,
      docId: docRef.id,
      state: SESSION_STATES.PROPOSED,
    }));

    return { success: true, sessionId, docId: docRef.id };
  } catch (error) {
    console.error('Start session error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * セッションに提案を追加
 */
export const addProposals = async (sessionId, proposals) => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const formattedProposals = proposals.map((p, index) => ({
      rank: index + 1,
      placeId: p.placeId,
      snapshotRef: p.snapshotRef || null,
      reason: p.reason || '',
      scoreAtPropose: p.score || 0.5,
    }));

    const docRef = doc(db, SESSIONS_COLLECTION, session._docId);
    await updateDoc(docRef, {
      proposals: formattedProposals,
    });

    return { success: true };
  } catch (error) {
    console.error('Add proposals error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 店舗を選択
 */
export const selectPlace = async (sessionId, placeId) => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const docRef = doc(db, SESSIONS_COLLECTION, session._docId);
    await updateDoc(docRef, {
      selectedPlaceId: placeId,
      state: SESSION_STATES.SELECTED,
    });

    // ローカル更新
    updateLocalSession({ state: SESSION_STATES.SELECTED, selectedPlaceId: placeId });

    return { success: true };
  } catch (error) {
    console.error('Select place error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 状態を更新
 */
export const updateSessionState = async (sessionId, newState) => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const docRef = doc(db, SESSIONS_COLLECTION, session._docId);
    await updateDoc(docRef, {
      state: newState,
    });

    updateLocalSession({ state: newState });

    return { success: true };
  } catch (error) {
    console.error('Update state error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 到着を記録
 */
export const markArrived = async (sessionId) => {
  return updateSessionState(sessionId, SESSION_STATES.ARRIVED);
};

/**
 * 成功を記録
 */
export const markSuccess = async (sessionId, feedback = null) => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const docRef = doc(db, SESSIONS_COLLECTION, session._docId);
    await updateDoc(docRef, {
      state: SESSION_STATES.SUCCESS,
      result: {
        outcome: 'success',
        feedback,
      },
    });

    clearLocalSession();

    return { success: true };
  } catch (error) {
    console.error('Mark success error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 失敗を記録（満席など）
 */
export const markFail = async (sessionId, reason = null) => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const docRef = doc(db, SESSIONS_COLLECTION, session._docId);
    await updateDoc(docRef, {
      state: SESSION_STATES.FAIL,
      result: {
        outcome: 'fail',
        feedback: reason,
      },
    });

    updateLocalSession({ state: SESSION_STATES.FAIL });

    return { success: true };
  } catch (error) {
    console.error('Mark fail error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * レスキューセッションを開始（失敗→リトライ）
 */
export const startRescueSession = async (parentSessionId, ticketId = null) => {
  try {
    const parentSession = await getSessionById(parentSessionId);
    if (!parentSession) {
      return { success: false, error: 'Parent session not found' };
    }

    // 親セッションをレスキュー状態に
    await updateSessionState(parentSessionId, SESSION_STATES.RESCUE);

    // 新しいセッションを開始（親の条件を引き継ぐ）
    const result = await startSession({
      areaId: parentSession.areaId,
      intent: parentSession.intent,
      constraints: parentSession.constraints,
      userId: parentSession.userId,
      parentSessionId,
    });

    if (result.success && ticketId) {
      // チケット使用を記録
      const docRef = doc(db, SESSIONS_COLLECTION, result.docId);
      await updateDoc(docRef, {
        ticketUsed: ticketId,
        rescueCount: (parentSession.rescueCount || 0) + 1,
      });
    }

    return result;
  } catch (error) {
    console.error('Start rescue error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * セッションIDで取得
 */
export const getSessionById = async (sessionId) => {
  try {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('sessionId', '==', sessionId),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { ...doc.data(), _docId: doc.id };
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * 現在のアクティブセッションを取得
 */
export const getCurrentSession = async () => {
  const local = localStorage.getItem('yorumichi_current_session');
  if (!local) return null;

  try {
    const { sessionId } = JSON.parse(local);
    return getSessionById(sessionId);
  } catch {
    return null;
  }
};

/**
 * ユーザーの過去セッションを取得
 */
export const getUserSessions = async (userId = null, limitCount = 20) => {
  try {
    const uid = userId || getAnonymousUserId();

    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const sessions = [];

    snapshot.forEach((doc) => {
      sessions.push({ ...doc.data(), _docId: doc.id });
    });

    return sessions;
  } catch (error) {
    console.error('Get user sessions error:', error);
    return [];
  }
};

/**
 * 成功率を計算（ユーザー単位）
 */
export const getUserSuccessRate = async (userId = null) => {
  const sessions = await getUserSessions(userId, 100);

  const completed = sessions.filter((s) =>
    [SESSION_STATES.SUCCESS, SESSION_STATES.FAIL].includes(s.state)
  );

  if (completed.length === 0) {
    return { rate: 0.5, sampleSize: 0 };
  }

  const successes = completed.filter((s) => s.state === SESSION_STATES.SUCCESS).length;

  return {
    rate: successes / completed.length,
    sampleSize: completed.length,
    successes,
    failures: completed.length - successes,
  };
};

/**
 * セッションを放棄
 */
export const abandonSession = async (sessionId) => {
  try {
    await updateSessionState(sessionId, SESSION_STATES.ABANDONED);
    clearLocalSession();
    return { success: true };
  } catch (error) {
    console.error('Abandon session error:', error);
    return { success: false, error: error.message };
  }
};

// ローカルセッション更新ヘルパー
const updateLocalSession = (updates) => {
  try {
    const local = JSON.parse(localStorage.getItem('yorumichi_current_session') || '{}');
    localStorage.setItem('yorumichi_current_session', JSON.stringify({ ...local, ...updates }));
  } catch {
    // ignore
  }
};

const clearLocalSession = () => {
  localStorage.removeItem('yorumichi_current_session');
};
