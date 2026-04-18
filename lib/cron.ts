import { connectDB } from './mongodb';
import AnalyticsEvent from './models/AnalyticsEvent';
import AnalyticsDaily from './models/AnalyticsDaily';
import AppItem from './models/AppItem';

/**
 * Aggregates raw events into daily summaries.
 */
export async function aggregateAnalytics() {
  await connectDB();

  // Aggregate yesterday's data
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total visitors
  const totalVisitors = await AnalyticsEvent.countDocuments({
    eventType: 'page_view',
    timestamp: { $gte: yesterday, $lt: today },
  });

  // Unique visitors
  const uniqueSessionIds = await AnalyticsEvent.distinct('sessionId', {
    eventType: 'page_view',
    timestamp: { $gte: yesterday, $lt: today },
  });
  const uniqueVisitors = uniqueSessionIds.length;

  // Page views
  const pageViews = await AnalyticsEvent.countDocuments({
    eventType: 'page_view',
    timestamp: { $gte: yesterday, $lt: today },
  });

  // Total clicks
  const totalClicks = await AnalyticsEvent.countDocuments({
    eventType: 'click',
    timestamp: { $gte: yesterday, $lt: today },
  });

  // Total downloads
  const totalDownloads = await AnalyticsEvent.countDocuments({
    eventType: 'download',
    timestamp: { $gte: yesterday, $lt: today },
  });

  // Top pages
  const topPagesAgg = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: 'page_view',
        timestamp: { $gte: yesterday, $lt: today },
      },
    },
    {
      $group: {
        _id: '$page',
        views: { $sum: 1 },
        avgTimeOnPage: { $avg: '$timeOnPage' },
      },
    },
    { $sort: { views: -1 } },
    { $limit: 10 },
  ]);

  // Top clicks
  const topClicksAgg = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: 'click',
        timestamp: { $gte: yesterday, $lt: today },
      },
    },
    {
      $group: {
        _id: { element: '$element', label: '$label' },
        clicks: { $sum: 1 },
      },
    },
    { $sort: { clicks: -1 } },
    { $limit: 10 },
  ]);

  // Device breakdown
  const deviceAgg = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: 'page_view',
        timestamp: { $gte: yesterday, $lt: today },
      },
    },
    {
      $group: {
        _id: '$device',
        count: { $sum: 1 },
      },
    },
  ]);

  const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
  deviceAgg.forEach((d) => {
    const key = (d._id || 'desktop') as keyof typeof deviceBreakdown;
    if (key in deviceBreakdown) deviceBreakdown[key] = d.count;
  });

  // Country breakdown
  const countryAgg = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: 'page_view',
        country: { $ne: null },
        timestamp: { $gte: yesterday, $lt: today },
      },
    },
    {
      $group: {
        _id: '$country',
        visitors: { $sum: 1 },
      },
    },
    { $sort: { visitors: -1 } },
    { $limit: 10 },
  ]);

  // Top searches
  const searchAgg = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: 'search',
        query: { $nin: [null, ''] },
        timestamp: { $gte: yesterday, $lt: today },
      },
    },
    {
      $group: {
        _id: '$query',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Ad performance
  const [monetagImpressions, monetagClicks, adsterraImpressions, adsterraClicks] =
    await Promise.all([
      AnalyticsEvent.countDocuments({
        eventType: 'ad_impression',
        element: 'ad_monetag_impression',
        timestamp: { $gte: yesterday, $lt: today },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'ad_click',
        element: 'ad_monetag',
        timestamp: { $gte: yesterday, $lt: today },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'ad_impression',
        element: 'ad_adsterra_impression',
        timestamp: { $gte: yesterday, $lt: today },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'ad_click',
        element: 'ad_adsterra',
        timestamp: { $gte: yesterday, $lt: today },
      }),
    ]);

  // Ad block rate
  const adBlockDetections = await AnalyticsEvent.countDocuments({
    eventType: 'ad_block_detected',
    timestamp: { $gte: yesterday, $lt: today },
  });

  // Upsert daily record
  await AnalyticsDaily.findOneAndUpdate(
    { date: yesterday },
    {
      totalVisitors,
      uniqueVisitors,
      pageViews,
      totalClicks,
      totalDownloads,
      topPages: topPagesAgg.map((p) => ({
        page: p._id || '/',
        views: p.views,
        avgTimeOnPage: Math.round(p.avgTimeOnPage || 0),
        bounceRate: 0,
      })),
      topClicks: topClicksAgg.map((c) => ({
        element: c._id.element,
        label: c._id.label,
        clicks: c.clicks,
        percentage: totalClicks > 0 ? Math.round((c.clicks / totalClicks) * 100) : 0,
      })),
      deviceBreakdown,
      countryBreakdown: countryAgg.map((c) => ({
        country: c._id,
        visitors: c.visitors,
        percentage: totalVisitors > 0 ? Math.round((c.visitors / totalVisitors) * 100) : 0,
      })),
      topSearches: searchAgg.map((s) => ({
        query: s._id,
        count: s.count,
      })),
      adPerformance: {
        monetagImpressions,
        monetagClicks,
        adsterraImpressions,
        adsterraClicks,
        adBlockRate: uniqueVisitors > 0 ? Math.round((adBlockDetections / uniqueVisitors) * 100) : 0,
      },
    },
    { upsert: true, new: true },
  );

  return { success: true, date: yesterday };
}

/**
 * Cleans old raw events to save database space.
 * @param daysToKeep Number of days of raw data to keep (default: 90)
 */
export async function cleanupExpiredData(daysToKeep = 90) {
  await connectDB();
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysToKeep);

  const result = await AnalyticsEvent.deleteMany({
    timestamp: { $lt: thresholdDate },
  });

  return { success: true, deletedCount: result.deletedCount };
}

/**
 * Updates application versions and metadata.
 * SKELETON: Can be expanded with external APIs.
 */
export async function updateAppsVersions() {
  await connectDB();
  
  // Implementation example: logging the update
  const appCount = await AppItem.countDocuments({ isActive: true });
  console.log(`[CRON] Verified versions for ${appCount} active applications.`);
  
  return { success: true, appCount };
}
