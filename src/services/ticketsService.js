/**
 * Tickets & Payments Service - 課金を最短で回す
 *
 * チケット制（単発/回数）で実装
 * 重要：sessionIdに「どの課金で救済したか」を必ず紐付ける（LTV分析のため）
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
  Timestamp,
} from 'firebase/firestore';

const TICKETS_COLLECTION = 'tickets';
const PAYMENTS_COLLECTION = 'payments';

/**
 * Ticket スキーマ
 * {
 *   ticketId: string,
 *   userId: string,
 *   type: string,          // "rescue_1" / "rescue_3" / "monthly_5"
 *   remaining: number,     // 残り回数
 *   expiresAt: timestamp,
 *   createdAt: timestamp,
 *   paymentId: string
 * }
 *
 * Payment スキーマ
 * {
 *   paymentId: string,
 *   userId: string,
 *   provider: string,      // "stripe" / "apple" / "google"
 *   amount: number,
 *   currency: string,      // "JPY"
 *   status: string,        // "pending" / "succeeded" / "failed" / "refunded"
 *   createdAt: timestamp
 * }
 */

// チケットタイプ定義
export const TICKET_TYPES = {
  RESCUE_1: {
    id: 'rescue_1',
    name: 'レスキュー1回券',
    count: 1,
    price: 200,
    validDays: 30,
  },
  RESCUE_3: {
    id: 'rescue_3',
    name: 'レスキュー3回券',
    count: 3,
    price: 500,
    validDays: 60,
  },
  MONTHLY_5: {
    id: 'monthly_5',
    name: '月額レスキュー5回',
    count: 5,
    price: 800,
    validDays: 30,
  },
};

// ID生成
const generateTicketId = () => 'tkt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
const generatePaymentId = () => 'pay_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

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
 * 支払いを記録
 */
export const createPayment = async ({
  userId = null,
  provider,
  amount,
  currency = 'JPY',
  externalId = null,
}) => {
  try {
    const paymentId = generatePaymentId();

    const payment = {
      paymentId,
      userId: userId || getAnonymousUserId(),
      provider,
      amount,
      currency,
      externalId, // Stripe等の外部決済ID
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, PAYMENTS_COLLECTION), payment);
    return { success: true, paymentId };
  } catch (error) {
    console.error('Create payment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 支払いステータスを更新
 */
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('paymentId', '==', paymentId),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Payment not found' };
    }

    const docRef = doc(db, PAYMENTS_COLLECTION, snapshot.docs[0].id);
    await updateDoc(docRef, { status });

    return { success: true };
  } catch (error) {
    console.error('Update payment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * チケットを発行
 */
export const issueTicket = async ({
  userId = null,
  ticketType,
  paymentId,
}) => {
  try {
    const ticketConfig = TICKET_TYPES[ticketType];
    if (!ticketConfig) {
      return { success: false, error: 'Invalid ticket type' };
    }

    const ticketId = generateTicketId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ticketConfig.validDays);

    const ticket = {
      ticketId,
      userId: userId || getAnonymousUserId(),
      type: ticketConfig.id,
      remaining: ticketConfig.count,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      paymentId,
    };

    await addDoc(collection(db, TICKETS_COLLECTION), ticket);
    return { success: true, ticketId };
  } catch (error) {
    console.error('Issue ticket error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ユーザーの有効なチケットを取得
 */
export const getValidTickets = async (userId = null) => {
  try {
    const uid = userId || getAnonymousUserId();
    const now = Timestamp.now();

    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('userId', '==', uid),
      where('remaining', '>', 0),
      where('expiresAt', '>', now)
    );

    const snapshot = await getDocs(q);
    const tickets = [];

    snapshot.forEach((doc) => {
      tickets.push({ ...doc.data(), _docId: doc.id });
    });

    return tickets;
  } catch (error) {
    console.error('Get valid tickets error:', error);
    return [];
  }
};

/**
 * チケット残数を取得
 */
export const getRemainingRescues = async (userId = null) => {
  const tickets = await getValidTickets(userId);
  return tickets.reduce((sum, t) => sum + t.remaining, 0);
};

/**
 * チケットを使用
 */
export const useTicket = async (ticketId, sessionId) => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('ticketId', '==', ticketId),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Ticket not found' };
    }

    const ticketDoc = snapshot.docs[0];
    const ticket = ticketDoc.data();

    if (ticket.remaining <= 0) {
      return { success: false, error: 'No remaining uses' };
    }

    const now = Timestamp.now();
    if (ticket.expiresAt.toMillis() < now.toMillis()) {
      return { success: false, error: 'Ticket expired' };
    }

    // チケット使用を記録
    const docRef = doc(db, TICKETS_COLLECTION, ticketDoc.id);
    await updateDoc(docRef, {
      remaining: ticket.remaining - 1,
      lastUsedAt: serverTimestamp(),
      lastUsedSessionId: sessionId,
    });

    return { success: true, remaining: ticket.remaining - 1 };
  } catch (error) {
    console.error('Use ticket error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * レスキューを実行（チケット消費 + セッション紐付け）
 */
export const executeRescue = async (sessionId, userId = null) => {
  try {
    // 有効なチケットを取得
    const tickets = await getValidTickets(userId);

    if (tickets.length === 0) {
      return {
        success: false,
        error: 'no_ticket',
        message: 'レスキューチケットがありません',
      };
    }

    // 最も期限が近いチケットを使用
    tickets.sort((a, b) => a.expiresAt.toMillis() - b.expiresAt.toMillis());
    const ticketToUse = tickets[0];

    // チケットを使用
    const result = await useTicket(ticketToUse.ticketId, sessionId);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      ticketId: ticketToUse.ticketId,
      remaining: result.remaining,
      message: `レスキュー実行（残り${result.remaining}回）`,
    };
  } catch (error) {
    console.error('Execute rescue error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 購入フローを開始（決済→チケット発行）
 */
export const purchaseTicket = async ({
  ticketType,
  provider = 'stripe',
  externalPaymentId = null,
  userId = null,
}) => {
  try {
    const ticketConfig = TICKET_TYPES[ticketType];
    if (!ticketConfig) {
      return { success: false, error: 'Invalid ticket type' };
    }

    // 支払い記録を作成
    const paymentResult = await createPayment({
      userId,
      provider,
      amount: ticketConfig.price,
      externalId: externalPaymentId,
    });

    if (!paymentResult.success) {
      return paymentResult;
    }

    // 支払い成功としてマーク（実際はStripe Webhookで処理）
    await updatePaymentStatus(paymentResult.paymentId, 'succeeded');

    // チケット発行
    const ticketResult = await issueTicket({
      userId,
      ticketType,
      paymentId: paymentResult.paymentId,
    });

    if (!ticketResult.success) {
      // ロールバック（実際は要検討）
      await updatePaymentStatus(paymentResult.paymentId, 'failed');
      return ticketResult;
    }

    return {
      success: true,
      paymentId: paymentResult.paymentId,
      ticketId: ticketResult.ticketId,
      ticketType: ticketConfig,
    };
  } catch (error) {
    console.error('Purchase ticket error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ユーザーの購入履歴を取得
 */
export const getPurchaseHistory = async (userId = null, limitCount = 20) => {
  try {
    const uid = userId || getAnonymousUserId();

    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('userId', '==', uid),
      where('status', '==', 'succeeded'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const payments = [];

    snapshot.forEach((doc) => {
      payments.push(doc.data());
    });

    return payments;
  } catch (error) {
    console.error('Get purchase history error:', error);
    return [];
  }
};

/**
 * LTV計算用：ユーザーの総支払額を取得
 */
export const getUserTotalSpend = async (userId = null) => {
  const history = await getPurchaseHistory(userId, 1000);
  return history.reduce((sum, p) => sum + (p.amount || 0), 0);
};
