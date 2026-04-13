import { connectDB } from '@/lib/mongodb';
import AppItem from '@/lib/models/AppItem';
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
    const app = await AppItem.create(data);
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error('Error creating app:', error);
    return NextResponse.json(
      { error: "Impossible de creer l'application" },
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
    const apps = await AppItem.find().sort({ createdAt: -1 });
    return NextResponse.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      { error: 'Impossible de recuperer les applications' },
      { status: 500 }
    );
  }
}
