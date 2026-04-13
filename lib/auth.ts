import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
} from '@/lib/auth-token';

export { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth-token';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession() {
  const cookieStore = await cookies();
  const session = await createSessionToken();

  cookieStore.set(ADMIN_SESSION_COOKIE, session.token, {
    httpOnly: true,
    maxAge: session.maxAge,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifySessionToken(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
