import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Playlist from '@/lib/models/Playlist';
import XtreamCode from '@/lib/models/XtreamCode';
import MacPortal from '@/lib/models/MacPortal';
import AppItem from '@/lib/models/AppItem';

const BASE_URL = 'https://ngori-rho.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDB();

    const [playlists, xtreamCodes, macPortals, apps] = await Promise.all([
      Playlist.find({ isActive: true }).select('_id updatedAt').lean(),
      XtreamCode.find({ isActive: true }).select('_id updatedAt').lean(),
      MacPortal.find({ isActive: true }).select('_id updatedAt').lean(),
      AppItem.find({ isActive: true }).select('_id updatedAt').lean(),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
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

    const appRoutes: MetadataRoute.Sitemap = apps.map((a) => ({
      url: `${BASE_URL}/app/${a._id}`,
      lastModified: a.updatedAt instanceof Date ? a.updatedAt : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...playlistRoutes, ...xtreamRoutes, ...portalRoutes, ...appRoutes];
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
