import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();
    const playlist = await Playlist.findByIdAndUpdate(id, data, { new: true });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { error: 'Impossible de mettre a jour la playlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const playlist = await Playlist.findByIdAndDelete(id);

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Impossible de supprimer la playlist' },
      { status: 500 }
    );
  }
}
