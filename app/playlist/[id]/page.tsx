import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import PlaylistDetailClient from '@/app/components/playlist-detail-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function serializePlaylist(playlist: any) {
  const content = playlist.content || '';
  const lines = content.split('\n');
  
  let channels = 0;
  let movies = 0;
  let series = 0;
  
  lines.forEach((line: string) => {
    if (line.startsWith('#EXTINF:')) {
      const lower = line.toLowerCase();
      if (lower.includes('s0') && lower.includes('e0') || lower.includes('s1') || lower.includes('s2')) {
        series++;
      } else if (lower.includes('vod') || lower.includes('movie') || lower.includes('film')) {
        movies++;
      } else {
        channels++;
      }
    }
  });

  // Fallback
  if (channels === 0 && movies === 0 && series === 0 && lines.length > 1) {
    channels = lines.filter((l: string) => l.trim() && !l.startsWith('#')).length;
  }

  return {
    _id: String(playlist._id),
    title: playlist.title,
    description: playlist.description,
    category: playlist.category,
    logo: playlist.logo,
    isActive: playlist.isActive,
    createdAt: playlist.createdAt instanceof Date ? playlist.createdAt.toISOString() : playlist.createdAt,
    updatedAt: playlist.updatedAt instanceof Date ? playlist.updatedAt.toISOString() : playlist.updatedAt,
    stats: { channels, movies, series }
    // Note: content is NOT sent here to keep it hidden from initial DOM
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

    return <PlaylistDetailClient playlist={serialized as any} />;
  } catch (error) {
    console.error('Error loading playlist detail:', error);
    notFound();
  }
}
