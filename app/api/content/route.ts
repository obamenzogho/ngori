import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import XtreamCode from '@/lib/models/XtreamCode';
import MacPortal from '@/lib/models/MacPortal';
import AppItem from '@/lib/models/AppItem';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const [playlists, xtreamCodes, macPortals, appItems] = await Promise.all([
      Playlist.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      XtreamCode.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      MacPortal.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      AppItem.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      playlists,
      xtreamCodes,
      macPortals,
      appItems,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
