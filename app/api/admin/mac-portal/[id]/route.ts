import { connectDB } from '@/lib/mongodb';
import MacPortal from '@/lib/models/MacPortal';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();
    const portal = await MacPortal.findByIdAndUpdate(id, data, { new: true });

    if (!portal) {
      return NextResponse.json({ error: 'Portail Mac introuvable' }, { status: 404 });
    }

    return NextResponse.json(portal);
  } catch (error) {
    console.error('Error updating mac portal:', error);
    return NextResponse.json(
      { error: 'Impossible de mettre a jour le portail Mac' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const portal = await MacPortal.findByIdAndDelete(id);

    if (!portal) {
      return NextResponse.json({ error: 'Portail Mac introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mac portal:', error);
    return NextResponse.json(
      { error: 'Impossible de supprimer le portail Mac' },
      { status: 500 }
    );
  }
}
