const STORAGE_KEY = 'yorumichi_analytics';

const logEvent = (eventName, params = {}) => {
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...params,
  };

  // コンソールログ（開発用）
  console.log('[Analytics]', event);

  // LocalStorageに蓄積（MVP検証用）
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    logs.push(event);
    // 最新500件のみ保持
    if (logs.length > 500) logs.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Analytics storage failed:', e);
  }

  // TODO: GA4等に差し替え
  // gtag('event', eventName, params);
};

export const Analytics = {
  planView: (planId, planTitle) =>
    logEvent('plan_view', { plan_id: planId, plan_title: planTitle }),

  startPlan: (planId, planTitle) =>
    logEvent('start_plan', { plan_id: planId, plan_title: planTitle }),

  openMaps: (planId, spotIndex, spotName) =>
    logEvent('open_maps', { plan_id: planId, spot_index: spotIndex, spot_name: spotName }),

  cantFindDestination: (planId, spotIndex, spotName) =>
    logEvent('cant_find_destination', { plan_id: planId, spot_index: spotIndex, spot_name: spotName }),

  planBUsed: (planId, spotIndex, reason) =>
    logEvent('planb_used', { plan_id: planId, spot_index: spotIndex, reason }),

  done: (planId, spotIndex, spotName) =>
    logEvent('done', { plan_id: planId, spot_index: spotIndex, spot_name: spotName }),

  complete: (planId, planTitle) =>
    logEvent('complete', { plan_id: planId, plan_title: planTitle }),

  rating: (planId, rating, mehReason = null) =>
    logEvent('rating', { plan_id: planId, rating, meh_reason: mehReason }),
};
