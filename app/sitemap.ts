import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import XtreamCode from '@/lib/models/XtreamCode';
import MacPortal from '@/lib/models/MacPortal';

const BASE_URL = 'https://ngori-rho.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDB();

    const [playlists, xtreamCodes, macPortals] = await Promise.all([
      Playlist.find({ isActive: true }).select('_id updatedAt').lean(),
      XtreamCode.find({ isActive: true }).select('_id updatedAt').lean(),
      MacPortal.find({ isActive: true }).select('_id updatedAt').lean(),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
    ];

    const playlistRoutes: MetadataRoute.Sitemap = playlists.map((p) => ({
      url: `${BASE_URL}/playlist/${p._id}`,
      lastModified: p.updatedAt instanceof Date ? p.updatedAt : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const xtreamRoutes: MetadataRoute.Sitemap = xtreamCodes.map((x) => ({
      url: `${BASE_URL}/xtream/${x._id}`,
      lastModified: x.updatedAt instanceof Date ? x.updatedAt : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const portalRoutes: MetadataRoute.Sitemap = macPortals.map((m) => ({
      url: `${BASE_URL}/mac-portal/${m._id}`,
      lastModified: m.updatedAt instanceof Date ? m.updatedAt : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...playlistRoutes, ...xtreamRoutes, ...portalRoutes];
  } catch {
    // En cas d'erreur DB, retourner au minimum la page d'accueil
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
    ];
  }
}
