import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    await connectDB();

    const { items } = (await request.json()) as {
      items: Record<string, unknown>[];
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnee a importer.' },
        { status: 400 },
      );
    }

    const results: { success: boolean; item?: Record<string, unknown>; error?: string }[] = [];

    for (const item of items) {
      try {
        const created = await Playlist.create(item);
        results.push({ success: true, item: created.toObject() });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur inconnue';
        results.push({ success: false, error: message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      { results, successCount, errorCount },
      { status: errorCount > 0 ? 207 : 201 },
    );
  } catch (error) {
    console.error('Error bulk creating playlists:', error);
    return NextResponse.json(
      { error: "Impossible d'importer les playlists" },
      { status: 500 },
    );
  }
}
