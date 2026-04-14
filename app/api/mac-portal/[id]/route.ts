import { connectDB } from '@/lib/mongodb';
import MacPortal from '@/lib/models/MacPortal';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const portal = await MacPortal.findOne({ _id: id, isActive: true }).lean();

    if (!portal) {
      return NextResponse.json(
        { error: 'Portail Mac non trouve' },
        { status: 404 }
      );
    }

    const serialized = {
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

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching mac portal:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du portail Mac' },
      { status: 500 }
    );
  }
}
