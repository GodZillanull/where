// サービスエクスポート
export { db } from './firebase';

// 分析サービス
export {
  logAnalyticsEvent,
  saveRating,
  getSpotRatings,
  getRecentAnalytics,
  syncOfflineData,
} from './analyticsFirestore';

// スポットデータサービス
export {
  getAllSpots,
  getSpotById,
  getSpotsByHomeStation,
  getSpotsByType,
  getSpotsByZure,
  getFilteredSpots,
  addSpot,
  updateSpot,
  deleteSpot,
  syncLocalSpotsToFirestore,
} from './spotsFirestore';
