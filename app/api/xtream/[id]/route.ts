import { connectDB } from '@/lib/mongodb';
import XtreamCode from '@/lib/models/XtreamCode';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const xtream = await XtreamCode.findOne({ _id: id, isActive: true }).lean();

    if (!xtream) {
      return NextResponse.json(
        { error: 'Xtream Code non trouve' },
        { status: 404 }
      );
    }

    const serialized = {
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

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching xtream code:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du Xtream Code' },
      { status: 500 }
    );
  }
}
