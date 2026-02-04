/**
 * Yorumichi Services - Firebase Backend
 *
 * 設計原則:
 * 1. Place（店）とAvailability（空席）を分離
 * 2. 空席は確率スコア（信頼度付き）で扱う
 * 3. 観測（Observation）を資産化する
 */

export { db } from './firebase';

// ========================================
// Places - 店舗マスタ（静的データ）
// ========================================
export {
  addPlace,
  getPlaceById,
  getPlacesByArea,
  getPlacesByCategory,
  getAllPlaces,
  updatePlace,
  updatePlaceStatus,
  updatePlaceCuration,
  addRiskFlag,
} from './placesService';

// ========================================
// Availability - 空席シグナル（動的データ、TTL前提）
// ========================================
export {
  recordAvailability,
  getLatestAvailability,
  getBatchAvailability,
  getAreaAvailabilitySummary,
  reportManualAvailability,
  reportUserAvailability,
  cleanupExpiredSnapshots,
  sortPlacesByAvailability,
} from './availabilityService';

// ========================================
// Observations - 観測ログ（学習資産）
// ここが堀。placesより価値がある。
// ========================================
export {
  recordObservation,
  recordSuccess,
  recordFull,
  recordQueueLeft,
  recordClosed,
  getPlaceSuccessRate,
  getHourlySuccessRates,
  getDowSuccessRates,
  getBestTimeToVisit,
  syncPendingObservations,
  getAreaStats,
} from './observationsService';

// ========================================
// Sessions - 寄り道セッション（状態遷移）
// ========================================
export {
  SESSION_STATES,
  startSession,
  addProposals,
  selectPlace,
  updateSessionState,
  markArrived,
  markSuccess,
  markFail,
  startRescueSession,
  getSessionById,
  getCurrentSession,
  getUserSessions,
  getUserSuccessRate,
  abandonSession,
} from './sessionsService';

// ========================================
// Tickets & Payments - 課金
// ========================================
export {
  TICKET_TYPES,
  createPayment,
  updatePaymentStatus,
  issueTicket,
  getValidTickets,
  getRemainingRescues,
  useTicket,
  executeRescue,
  purchaseTicket,
  getPurchaseHistory,
  getUserTotalSpend,
} from './ticketsService';

// ========================================
// Legacy Analytics（後方互換）
// ========================================
export {
  logAnalyticsEvent,
  saveRating,
  getSpotRatings,
  getRecentAnalytics,
  syncOfflineData,
} from './analyticsFirestore';
