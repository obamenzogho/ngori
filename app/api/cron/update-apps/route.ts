import { NextRequest, NextResponse } from 'next/server';
import { updateAppsVersions } from '@/lib/cron';

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
    const result = await updateAppsVersions();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Apps versions check completed',
      details: result,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[CRON ERROR] Apps update failed:', error);
    return NextResponse.json(
      { error: 'CRON failed' },
      { status: 500 }
    );
  }
}
