import { connectDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/lib/models/AnalyticsEvent';
import AnalyticsDaily from '@/lib/models/AnalyticsDaily';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * POST /api/analytics/aggregate
 * Aggregates raw events into daily summaries.
 * Called by Vercel Cron or manually.
 */
export async function POST(request: Request) {
  try {
    const isAuthenticated = await getSession();

    // Allow cron with secret key OR admin session
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isAuthenticated && !isCronAuth) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

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

    // Clean old raw events (keep 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    await AnalyticsEvent.deleteMany({
      timestamp: { $lt: ninetyDaysAgo },
    });

    return NextResponse.json({
      ok: true,
      message: `Aggregated data for ${yesterday.toISOString().slice(0, 10)}`,
    });
  } catch (error) {
    console.error('Error aggregating analytics:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'agrégation" },
      { status: 500 },
    );
  }
}
