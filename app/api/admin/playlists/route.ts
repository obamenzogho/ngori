import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();
    const playlist = await Playlist.create(data);

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Impossible de creer la playlist' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();
    const playlists = await Playlist.find().sort({ createdAt: -1 });
    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Impossible de recuperer les playlists' },
      { status: 500 }
    );
  }
}
