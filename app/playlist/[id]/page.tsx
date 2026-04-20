import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import PlaylistDetailClient from '@/app/components/playlist-detail-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    await connectDB();
    const playlist = await Playlist.findOne({ _id: id, isActive: true }).lean();
    if (!playlist) return { title: 'Playlist introuvable' };
    if (!playlist) return { title: 'Playlist introuvable', alternates: { canonical: `/playlist/${id}` } };
    return {
      title: `${playlist.title} — Playlist M3U`,
      description:
        playlist.description ||
        `Téléchargez la playlist M3U "${playlist.title}" gratuitement sur Ngori.`,
      openGraph: {
        title: `${playlist.title} | Ngori`,
        description:
          playlist.description || `Playlist M3U disponible sur Ngori.`,
        type: 'article',
      },
      alternates: {
        canonical: `/playlist/${id}`,
      },
    };
  } catch {
    return { title: 'Playlist' };
  }
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
