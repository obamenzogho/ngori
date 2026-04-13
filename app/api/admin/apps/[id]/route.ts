import { connectDB } from '@/lib/mongodb';
import AppItem from '@/lib/models/AppItem';
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
    const app = await AppItem.findByIdAndUpdate(id, data, { new: true });

    if (!app) {
      return NextResponse.json({ error: 'Application introuvable' }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error('Error updating app:', error);
    return NextResponse.json(
      { error: "Impossible de mettre a jour l'application" },
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
    const app = await AppItem.findByIdAndDelete(id);

    if (!app) {
      return NextResponse.json({ error: 'Application introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting app:', error);
    return NextResponse.json(
      { error: "Impossible de supprimer l'application" },
      { status: 500 }
    );
  }
}
