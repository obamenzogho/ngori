import { NextRequest, NextResponse } from 'next/server';
import { aggregateAnalytics } from '@/lib/cron';

export async function GET(request: NextRequest) {
  // Vérification du token secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await aggregateAnalytics();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analytics aggregation completed',
      details: result,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[CRON ERROR] Analytics aggregation failed:', error);
    return NextResponse.json(
      { error: 'CRON failed' },
      { status: 500 }
    );
  }
}
