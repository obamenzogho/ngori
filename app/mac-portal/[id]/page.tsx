import { connectDB } from '@/lib/mongodb';
import MacPortal from '@/lib/models/MacPortal';
import MacPortalDetailClient from '@/app/components/mac-portal-detail-client';
import { notFound } from 'next/navigation';

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
