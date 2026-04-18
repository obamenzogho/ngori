import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredData } from '@/lib/cron';

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
    const result = await cleanupExpiredData(90); // Keep 90 days as per original logic
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cleanup of expired data completed',
      details: result,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[CRON ERROR] Cleanup failed:', error);
    return NextResponse.json(
      { error: 'CRON failed' },
      { status: 500 }
    );
  }
}
