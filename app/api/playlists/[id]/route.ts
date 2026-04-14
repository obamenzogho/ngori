import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const playlist = await Playlist.findOne({ _id: id, isActive: true }).lean();

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist non trouvee' },
        { status: 404 }
      );
    }

    const serialized = {
      ...playlist,
      _id: String(playlist._id),
      createdAt:
        playlist.createdAt instanceof Date
          ? playlist.createdAt.toISOString()
          : playlist.createdAt,
      updatedAt:
        playlist.updatedAt instanceof Date
          ? playlist.updatedAt.toISOString()
          : playlist.updatedAt,
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la playlist' },
      { status: 500 }
    );
  }
}