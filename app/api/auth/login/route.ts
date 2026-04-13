import { connectDB } from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { verifyPassword, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Le mot de passe est requis' },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne();

    if (!admin) {
      return NextResponse.json(
        { error: "L'administrateur n'est pas configure" },
        { status: 500 }
      );
    }

    const isPasswordValid = await verifyPassword(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe invalide' },
        { status: 401 }
      );
    }

    await createSession();

    return NextResponse.json(
      { success: true, message: 'Connexion reussie' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
