import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import PlaylistDetailClient from '@/app/components/playlist-detail-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function serializePlaylist(playlist: Awaited<ReturnType<typeof Playlist.findOne>>) {
  return {
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
}

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await connectDB();
    const playlist = await Playlist.findOne({ _id: id, isActive: true }).lean();

    if (!playlist) {
      notFound();
    }

    const serialized = serializePlaylist(playlist);

    return <PlaylistDetailClient playlist={serialized} />;
  } catch (error) {
    console.error('Error loading playlist detail:', error);
    notFound();
  }
}
