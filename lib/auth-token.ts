const encoder = new TextEncoder();
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const ADMIN_SESSION_COOKIE = 'admin_session';

type SessionPayload = {
  exp: number;
  iat: number;
  sub: 'admin';
};

function getSessionSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

function bytesToBase64(bytes: Uint8Array) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64ToBytes(value: string) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function toBase64Url(value: string) {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;

  if (padding === 0) {
    return normalized;
  }

  return normalized.padEnd(normalized.length + (4 - padding), '=');
}

function encodePayload(payload: SessionPayload) {
  const json = JSON.stringify(payload);

  if (typeof Buffer !== 'undefined') {
    return toBase64Url(Buffer.from(json, 'utf8').toString('base64'));
  }

  return toBase64Url(btoa(json));
}

function decodePayload(value: string) {
  const base64 = fromBase64Url(value);
  const json =
    typeof Buffer !== 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf8')
      : atob(base64);

  return JSON.parse(json) as SessionPayload;
}

async function importSigningKey(secret: string, usage: KeyUsage) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

export async function createSessionToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    exp: issuedAt + SESSION_DURATION_SECONDS,
    iat: issuedAt,
    sub: 'admin',
  };
  const payloadPart = encodePayload(payload);
  const key = await importSigningKey(getSessionSecret(), 'sign');
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadPart));
  const signaturePart = toBase64Url(bytesToBase64(new Uint8Array(signature)));

  return {
    maxAge: SESSION_DURATION_SECONDS,
    token: `${payloadPart}.${signaturePart}`,
  };
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [payloadPart, signaturePart] = token.split('.');

  if (!payloadPart || !signaturePart) {
    return false;
  }

  try {
    const key = await importSigningKey(getSessionSecret(), 'verify');
    const isSignatureValid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64ToBytes(fromBase64Url(signaturePart)),
      encoder.encode(payloadPart)
    );

    if (!isSignatureValid) {
      return false;
    }

    const payload = decodePayload(payloadPart);

    if (payload.sub !== 'admin') {
      return false;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}
