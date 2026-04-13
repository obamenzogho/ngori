import { connectDB } from '@/lib/mongodb';
import XtreamCode from '@/lib/models/XtreamCode';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();
    const xtreamCode = await XtreamCode.create(data);

    return NextResponse.json(xtreamCode, { status: 201 });
  } catch (error) {
    console.error('Error creating xtream code:', error);
    return NextResponse.json(
      { error: "Impossible de creer l'acces Xtream" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }

    await connectDB();
    const codes = await XtreamCode.find().sort({ createdAt: -1 });
    return NextResponse.json(codes);
  } catch (error) {
    console.error('Error fetching xtream codes:', error);
    return NextResponse.json(
      { error: "Impossible de recuperer les acces Xtream" },
      { status: 500 }
    );
  }
}
