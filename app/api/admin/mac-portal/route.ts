import { connectDB } from '@/lib/mongodb';
import MacPortal from '@/lib/models/MacPortal';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const portal = await MacPortal.create(data);
    return NextResponse.json(portal, { status: 201 });
  } catch (error) {
    console.error('Error creating mac portal:', error);
    return NextResponse.json(
      { error: 'Impossible de creer le portail Mac' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    await connectDB();
    const portals = await MacPortal.find().sort({ createdAt: -1 });
    return NextResponse.json(portals);
  } catch (error) {
    console.error('Error fetching mac portals:', error);
    return NextResponse.json(
      { error: 'Impossible de recuperer les portails Mac' },
      { status: 500 }
    );
  }
}
