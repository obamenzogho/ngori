import HomePageClient, {
  type ContentResponse,
  type MacPortalItem,
  type PlaylistItem,
  type PublicAppItem,
  type XtreamItem,
} from '@/app/components/home-page-client';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import { connectDB } from '@/lib/mongodb';
import AppItem from '@/lib/models/AppItem';
import MacPortal from '@/lib/models/MacPortal';
import Playlist from '@/lib/models/Playlist';
import XtreamCode from '@/lib/models/XtreamCode';

// Force dynamic rendering — always fetch fresh data from the database
// so that admin deletions are reflected immediately on the home page.
export const dynamic = 'force-dynamic';

function serializeItems<T extends { _id: unknown; createdAt?: unknown; updatedAt?: unknown }>(
  items: T[]
) {
  return items.map((item) => {
    const serialized = {
      ...item,
      _id: String(item._id),
    } as T & {
      _id: string;
      createdAt?: string;
      updatedAt?: string;
    };

    if (item.createdAt instanceof Date) {
      serialized.createdAt = item.createdAt.toISOString();
    } else if (typeof item.createdAt === 'string') {
      serialized.createdAt = item.createdAt;
    }

    if (item.updatedAt instanceof Date) {
      serialized.updatedAt = item.updatedAt.toISOString();
    } else if (typeof item.updatedAt === 'string') {
      serialized.updatedAt = item.updatedAt;
    }

    return serialized;
  });
}

async function getHomeContent() {
  try {
    await connectDB();

    const [playlists, xtreamCodes, macPortals, appItems] = await Promise.all([
      Playlist.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      XtreamCode.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      MacPortal.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      AppItem.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
    ]);

    const content: ContentResponse = {
      playlists: serializeItems(playlists) as PlaylistItem[],
      xtreamCodes: serializeItems(xtreamCodes) as XtreamItem[],
      macPortals: serializeItems(macPortals) as MacPortalItem[],
      appItems: serializeItems(appItems) as PublicAppItem[],
    };

    return {
      content,
      error: null,
    };
  } catch (error) {
    console.error('Home content error:', error);

    return {
      content: {
        playlists: [],
        xtreamCodes: [],
        macPortals: [],
        appItems: [],
      } satisfies ContentResponse,
      error: 'Impossible de charger le contenu pour le moment.',
    };
  }
}

export default async function HomePage() {
  const { content, error } = await getHomeContent();

  return (
    <>
      <AnimatedBackground />
      <HomePageClient initialContent={content} loadError={error} />
    </>
  );
}
