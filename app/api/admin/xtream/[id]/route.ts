import { connectDB } from '@/lib/mongodb';
import XtreamCode from '@/lib/models/XtreamCode';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();
    const code = await XtreamCode.findByIdAndUpdate(id, data, { new: true });

    if (!code) {
      return NextResponse.json(
        { error: 'Acces Xtream introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json(code);
  } catch (error) {
    console.error('Error updating xtream code:', error);
    return NextResponse.json(
      { error: "Impossible de mettre a jour l'acces Xtream" },
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
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const code = await XtreamCode.findByIdAndDelete(id);

    if (!code) {
      return NextResponse.json(
        { error: 'Acces Xtream introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting xtream code:', error);
    return NextResponse.json(
      { error: "Impossible de supprimer l'acces Xtream" },
      { status: 500 }
    );
  }
}
