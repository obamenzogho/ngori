import { connectDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/lib/models/AnalyticsEvent';
import AnalyticsDaily from '@/lib/models/AnalyticsDaily';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

type Period = 'today' | '7d' | '30d' | '12m' | 'year';

function getDateRange(period: Period): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case '12m':
      start.setMonth(start.getMonth() - 12);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}

function getPreviousRange(period: Period): { start: Date; end: Date } {
  const current = getDateRange(period);
  const diff = current.end.getTime() - current.start.getTime();
  return {
    start: new Date(current.start.getTime() - diff),
    end: new Date(current.start.getTime() - 1),
  };
}

export async function GET(request: Request) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '7d') as Period;

    const { start, end } = getDateRange(period);
    const prevRange = getPreviousRange(period);

    // Current period metrics
    const [
      currentVisitors,
      currentUniqueVisitors,
      currentPageViews,
      currentClicks,
      currentDownloads,
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({
        eventType: 'page_view',
        timestamp: { $gte: start, $lte: end },
      }),
      AnalyticsEvent.distinct('sessionId', {
        eventType: 'page_view',
        timestamp: { $gte: start, $lte: end },
      }).then((s) => s.length),
      AnalyticsEvent.countDocuments({
        eventType: 'page_view',
        timestamp: { $gte: start, $lte: end },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'click',
        timestamp: { $gte: start, $lte: end },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'download',
        timestamp: { $gte: start, $lte: end },
      }),
    ]);

    // Previous period metrics for comparison
    const [
      prevVisitors,
      prevUniqueVisitors,
      prevPageViews,
      prevClicks,
      prevDownloads,
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({
        eventType: 'page_view',
        timestamp: { $gte: prevRange.start, $lte: prevRange.end },
      }),
      AnalyticsEvent.distinct('sessionId', {
        eventType: 'page_view',
        timestamp: { $gte: prevRange.start, $lte: prevRange.end },
      }).then((s) => s.length),
      AnalyticsEvent.countDocuments({
        eventType: 'page_view',
        timestamp: { $gte: prevRange.start, $lte: prevRange.end },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'click',
        timestamp: { $gte: prevRange.start, $lte: prevRange.end },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'download',
        timestamp: { $gte: prevRange.start, $lte: prevRange.end },
      }),
    ]);

    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Top pages
    const topPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: start, $lte: end },
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
    const topClicks = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'click',
          timestamp: { $gte: start, $lte: end },
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
    const deviceBreakdown = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 },
        },
      },
    ]);

    // Country breakdown
    const countryBreakdown = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'page_view',
          country: { $ne: null },
          timestamp: { $gte: start, $lte: end },
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
    const topSearches = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'search',
          query: { $nin: [null, ''] },
          timestamp: { $gte: start, $lte: end },
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
    const [adImpressions, adClicks, adBlockDetections] = await Promise.all([
      AnalyticsEvent.countDocuments({
        eventType: 'ad_impression',
        timestamp: { $gte: start, $lte: end },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'ad_click',
        timestamp: { $gte: start, $lte: end },
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'ad_block_detected',
        timestamp: { $gte: start, $lte: end },
      }),
    ]);

    const totalSessions = await AnalyticsEvent.distinct('sessionId', {
      eventType: 'page_view',
      timestamp: { $gte: start, $lte: end },
    }).then((s) => s.length);

    return NextResponse.json({
      period,
      kpis: {
        visitors: { value: currentVisitors, change: calcChange(currentVisitors, prevVisitors) },
        uniqueVisitors: { value: currentUniqueVisitors, change: calcChange(currentUniqueVisitors, prevUniqueVisitors) },
        pageViews: { value: currentPageViews, change: calcChange(currentPageViews, prevPageViews) },
        clicks: { value: currentClicks, change: calcChange(currentClicks, prevClicks) },
        downloads: { value: currentDownloads, change: calcChange(currentDownloads, prevDownloads) },
      },
      topPages: topPages.map((p) => ({
        page: p._id || '/',
        views: p.views,
        avgTimeOnPage: Math.round(p.avgTimeOnPage || 0),
      })),
      topClicks: topClicks.map((c) => ({
        element: c._id.element,
        label: c._id.label,
        clicks: c.clicks,
        percentage: currentClicks > 0 ? Math.round((c.clicks / currentClicks) * 100) : 0,
      })),
      deviceBreakdown: deviceBreakdown.reduce(
        (acc, d) => {
          acc[d._id || 'unknown'] = d.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      countryBreakdown: countryBreakdown.map((c) => ({
        country: c._id,
        visitors: c.visitors,
        percentage: currentVisitors > 0 ? Math.round((c.visitors / currentVisitors) * 100) : 0,
      })),
      topSearches: topSearches.map((s) => ({
        query: s._id,
        count: s.count,
      })),
      adPerformance: {
        impressions: adImpressions,
        clicks: adClicks,
        blockRate: totalSessions > 0 ? Math.round((adBlockDetections / totalSessions) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les statistiques' },
      { status: 500 },
    );
  }
}
