import { connectDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/lib/models/AnalyticsEvent';
import { NextResponse } from 'next/server';

// Simple hash function for IP addresses
function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(36)}`;
}

// Country code lookup from IP using a free API
async function getCountryFromIp(ip: string): Promise<string | null> {
  // Skip local/private IPs
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`https://ipapi.co/${ip}/country_code/`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const code = (await response.text()).trim();
      if (code.length === 2) return code;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const data = await request.json();

    // Get IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const rawIp = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
    const ip = hashIp(rawIp);

    // Get country from IP (cached in-memory for 1 hour)
    let country: string | null = data.country || null;
    if (!country && rawIp !== 'unknown') {
      country = await getCountryFromIp(rawIp);
    }

    const event = {
      eventType: data.eventType,
      page: data.page || null,
      element: data.element || null,
      label: data.label || null,
      query: data.query || null,
      appName: data.appName || null,
      device: data.device || null,
      country,
      referrer: data.referrer || null,
      sessionId: data.sessionId || null,
      ip,
      userAgent: data.userAgent || null,
      screenWidth: data.screenWidth || null,
      scrollDepth: data.scrollDepth || null,
      timeOnPage: data.timeOnPage || null,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    };

    await AnalyticsEvent.create(event);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Error tracking event:', error);
    // Still return 201 to not break the client
    return NextResponse.json({ ok: false }, { status: 201 });
  }
}
