import { connectDB } from '@/lib/mongodb';
import AppItem from '@/lib/models/AppItem';
import AppDetailClient from '@/app/components/app-detail-client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function serializeApp(app: any) {
  return {
    ...app,
    _id: String(app._id),
    createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : app.createdAt,
    updatedAt: app.updatedAt instanceof Date ? app.updatedAt.toISOString() : app.updatedAt,
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
    const app = await AppItem.findOne({ _id: id, isActive: true }).lean();
    if (!app) return { title: 'Application introuvable' };
    return {
      title: `Télécharger ${app.name} | Ngori`,
      description: `Téléchargez ${app.name} (${app.version || 'dernière version'}) gratuitement sur Ngori.`,
      openGraph: {
        title: `${app.name} - Ngori`,
        description: `Téléchargez ${app.name} gratuitement.`,
        images: app.icon ? [{ url: app.icon }] : [],
      },
      alternates: {
        canonical: `/app/${id}`,
      },
    };
  } catch {
    return { title: 'Application' };
  }
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await connectDB();
    const app = await AppItem.findOne({ _id: id }).lean();

    if (!app) {
      notFound();
    }

    const serialized = serializeApp(app);

    return <AppDetailClient app={serialized} />;
  } catch (error) {
    console.error('Error loading app detail:', error);
    notFound();
  }
}
