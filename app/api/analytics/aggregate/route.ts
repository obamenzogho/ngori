import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { aggregateAnalytics, cleanupExpiredData } from '@/lib/cron';

/**
 * POST /api/analytics/aggregate
 * Aggregates raw events into daily summaries.
 * Called manually from admin dashboard.
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

    // Call shared logic
    const aggResult = await aggregateAnalytics();
    
    // Also perform cleanup if called manually (original behavior)
    await cleanupExpiredData(90);

    return NextResponse.json({
      ok: true,
      message: `Aggregated data successfully`,
      details: aggResult
    });
  } catch (error) {
    console.error('Error aggregating analytics:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'agrégation" },
      { status: 500 },
    );
  }
}
