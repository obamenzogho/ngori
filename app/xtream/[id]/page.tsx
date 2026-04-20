import { connectDB } from '@/lib/mongodb';
import XtreamCode from '@/lib/models/XtreamCode';
import XtreamDetailClient from '@/app/components/xtream-detail-client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function serializeXtream(xtream: Awaited<ReturnType<typeof XtreamCode.findOne>>) {
  return {
    ...xtream,
    _id: String(xtream._id),
    createdAt:
      xtream.createdAt instanceof Date
        ? xtream.createdAt.toISOString()
        : xtream.createdAt,
    updatedAt:
      xtream.updatedAt instanceof Date
        ? xtream.updatedAt.toISOString()
        : xtream.updatedAt,
    expirationDate:
      xtream.expirationDate instanceof Date
        ? xtream.expirationDate.toISOString()
        : xtream.expirationDate,
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
    const xtream = await XtreamCode.findOne({ _id: id, isActive: true }).lean();
    if (!xtream) return { title: 'Accès Xtream introuvable' };
    return {
      title: `${xtream.title} — Accès Xtream`,
      description:
        xtream.description ||
        `Accès Xtream "${xtream.title}" disponible gratuitement sur Ngori.`,
      openGraph: {
        title: `${xtream.title} | Ngori`,
        description: xtream.description || 'Accès Xtream disponible sur Ngori.',
        type: 'article',
      },
      alternates: {
        canonical: `/xtream/${id}`,
      },
    };
  } catch {
    return { title: 'Xtream' };
  }
}

export default async function XtreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await connectDB();
    const xtream = await XtreamCode.findOne({ _id: id, isActive: true }).lean();

    if (!xtream) {
      notFound();
    }

    const serialized = serializeXtream(xtream);

    return <XtreamDetailClient xtream={serialized} />;
  } catch (error) {
    console.error('Error loading xtream detail:', error);
    notFound();
  }
}
