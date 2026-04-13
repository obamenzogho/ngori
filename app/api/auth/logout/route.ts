import { deleteSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await deleteSession();
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
