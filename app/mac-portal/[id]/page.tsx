import { connectDB } from '@/lib/mongodb';
import MacPortal from '@/lib/models/MacPortal';
import MacPortalDetailClient from '@/app/components/mac-portal-detail-client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function serializePortal(portal: Awaited<ReturnType<typeof MacPortal.findOne>>) {
  return {
    ...portal,
    _id: String(portal._id),
    createdAt:
      portal.createdAt instanceof Date
        ? portal.createdAt.toISOString()
        : portal.createdAt,
    updatedAt:
      portal.updatedAt instanceof Date
        ? portal.updatedAt.toISOString()
        : portal.updatedAt,
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
    const portal = await MacPortal.findOne({ _id: id, isActive: true }).lean();
    if (!portal) return { title: 'Portail Mac introuvable' };
    return {
      title: `${portal.title} — Portail Mac`,
      description:
        portal.description ||
        `Portail Mac "${portal.title}" disponible gratuitement sur Ngori.`,
      openGraph: {
        title: `${portal.title} | Ngori`,
        description: portal.description || 'Portail Mac disponible sur Ngori.',
        type: 'article',
      },
      alternates: {
        canonical: `/mac-portal/${id}`,
      },
    };
  } catch {
    return { title: 'Mac Portal' };
  }
}

export default async function MacPortalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await connectDB();
    const portal = await MacPortal.findOne({ _id: id, isActive: true }).lean();

    if (!portal) {
      notFound();
    }

    const serialized = serializePortal(portal);

    return <MacPortalDetailClient portal={serialized} />;
  } catch (error) {
    console.error('Error loading mac portal detail:', error);
    notFound();
  }
}
