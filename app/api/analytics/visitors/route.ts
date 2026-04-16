import { connectDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/lib/models/AnalyticsEvent';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

type Period = 'today' | '7d' | '30d' | '12m' | 'year';
type GroupBy = 'hour' | 'day' | 'month';

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

function getGroupByFormat(groupBy: GroupBy): string {
  switch (groupBy) {
    case 'hour':
      return '%Y-%m-%d %H:00';
    case 'day':
      return '%Y-%m-%d';
    case 'month':
      return '%Y-%m';
  }
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
    const groupBy = (searchParams.get('groupBy') || 'day') as GroupBy;

    const { start, end } = getDateRange(period);
    const dateFormat = getGroupByFormat(groupBy);

    // Visitors over time
    const visitorsOverTime = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' },
          },
          visitors: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          date: '$_id',
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Page views over time
    const pageViewsOverTime = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' },
          },
          pageViews: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Clicks over time
    const clicksOverTime = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'click',
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      period,
      groupBy,
      visitorsOverTime: visitorsOverTime.map((v) => ({
        date: v.date,
        visitors: v.visitors,
        uniqueVisitors: v.uniqueVisitors,
      })),
      pageViewsOverTime: pageViewsOverTime.map((v) => ({
        date: v._id,
        pageViews: v.pageViews,
      })),
      clicksOverTime: clicksOverTime.map((v) => ({
        date: v._id,
        clicks: v.clicks,
      })),
    });
  } catch (error) {
    console.error('Error fetching visitors analytics:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les donnees' },
      { status: 500 },
    );
  }
}
