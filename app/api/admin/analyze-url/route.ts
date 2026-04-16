import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

type DetectedType = 'M3U' | 'XTREAM' | 'MAC_PORTAL' | 'UNKNOWN';

interface ExpirationInfo {
  expirationDate: string | null;
  status: string;
  maxConnections: number;
  activeConnections: number;
  isTrial: boolean;
}

interface CategoriesInfo {
  liveCategories: string[];
  vodCategories: string[];
  seriesCategories: string[];
  totalLive: number;
  totalVod: number;
  totalSeries: number;
}

interface AnalyzeResult {
  url: string;
  type: DetectedType;
  title: string;
  description: string;
  expiration: ExpirationInfo;
  categories: CategoriesInfo;
  serverUrl?: string;
  username?: string;
  password?: string;
  macAddress?: string;
  portalUrl?: string;
  error?: string;
}

function detectType(url: string): DetectedType {
  if (
    url.includes('type=m3u') ||
    url.endsWith('.m3u') ||
    url.endsWith('.m3u8')
  ) {
    return 'M3U';
  }
  if (url.includes('username=') && url.includes('password=')) {
    return 'XTREAM';
  }
  if (/([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}/.test(url)) {
    return 'MAC_PORTAL';
  }
  return 'UNKNOWN';
}

function generateTitle(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '').split('.')[0];
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch {
    return 'Sans titre';
  }
}

function generateDescription(
  title: string,
  expiration: ExpirationInfo,
  categories: CategoriesInfo,
): string {
  const expText = expiration.expirationDate
    ? `Valable jusqu'au ${new Date(expiration.expirationDate).toLocaleDateString('fr-FR')}`
    : 'Durée non définie';

  const cats = [
    categories.totalLive > 0 ? `${categories.totalLive} chaînes live` : '',
    categories.totalVod > 0 ? `${categories.totalVod} films` : '',
    categories.totalSeries > 0 ? `${categories.totalSeries} séries` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return `${title} — ${expText}. Contenu disponible : ${cats || 'non vérifié'}.`;
}

async function checkExpiration(url: string): Promise<ExpirationInfo> {
  try {
    const parsed = new URL(url);
    const username = parsed.searchParams.get('username');
    const password = parsed.searchParams.get('password');
    const baseUrl = `${parsed.protocol}//${parsed.host}`;

    if (!username || !password) {
      return {
        expirationDate: null,
        status: 'missing_credentials',
        maxConnections: 0,
        activeConnections: 0,
        isTrial: false,
      };
    }

    const response = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!response.ok) {
      return {
        expirationDate: null,
        status: 'server_error',
        maxConnections: 0,
        activeConnections: 0,
        isTrial: false,
      };
    }

    const data = await response.json();

    if (data.user_info?.auth === 0) {
      return {
        expirationDate: null,
        status: 'invalid_credentials',
        maxConnections: 0,
        activeConnections: 0,
        isTrial: false,
      };
    }

    return {
      expirationDate: data.user_info?.exp_date
        ? new Date(data.user_info.exp_date * 1000).toISOString()
        : null,
      status: data.user_info?.status || 'unknown',
      maxConnections: data.user_info?.max_connections || 1,
      activeConnections: data.user_info?.active_cons || 0,
      isTrial: data.user_info?.is_trial === '1',
    };
  } catch {
    return {
      expirationDate: null,
      status: 'error',
      maxConnections: 0,
      activeConnections: 0,
      isTrial: false,
    };
  }
}

async function fetchCategories(url: string): Promise<CategoriesInfo> {
  try {
    const parsed = new URL(url);
    const username = parsed.searchParams.get('username');
    const password = parsed.searchParams.get('password');
    const baseUrl = `${parsed.protocol}//${parsed.host}`;

    if (!username || !password) {
      return {
        liveCategories: [],
        vodCategories: [],
        seriesCategories: [],
        totalLive: 0,
        totalVod: 0,
        totalSeries: 0,
      };
    }

    const fetchJson = async (action: string) => {
      try {
        const res = await fetch(
          `${baseUrl}/player_api.php?username=${username}&password=${password}&action=${action}`,
          { signal: AbortSignal.timeout(10000) },
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    };

    const [live, vod, series] = await Promise.all([
      fetchJson('get_live_categories'),
      fetchJson('get_vod_categories'),
      fetchJson('get_series_categories'),
    ]);

    return {
      liveCategories: live.map((c: { category_name?: string }) => c.category_name || '').filter(Boolean),
      vodCategories: vod.map((c: { category_name?: string }) => c.category_name || '').filter(Boolean),
      seriesCategories: series.map((c: { category_name?: string }) => c.category_name || '').filter(Boolean),
      totalLive: live.length,
      totalVod: vod.length,
      totalSeries: series.length,
    };
  } catch {
    return {
      liveCategories: [],
      vodCategories: [],
      seriesCategories: [],
      totalLive: 0,
      totalVod: 0,
      totalSeries: 0,
    };
  }
}

export async function POST(request: Request) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { url } = (await request.json()) as { url: string };

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const type = detectType(trimmedUrl);
    const title = generateTitle(trimmedUrl);

    let expiration: ExpirationInfo = {
      expirationDate: null,
      status: 'unknown',
      maxConnections: 0,
      activeConnections: 0,
      isTrial: false,
    };
    let categories: CategoriesInfo = {
      liveCategories: [],
      vodCategories: [],
      seriesCategories: [],
      totalLive: 0,
      totalVod: 0,
      totalSeries: 0,
    };

    let serverUrl: string | undefined;
    let username: string | undefined;
    let password: string | undefined;
    let macAddress: string | undefined;
    let portalUrl: string | undefined;

    if (type === 'M3U' || type === 'XTREAM') {
      try {
        const parsed = new URL(trimmedUrl);
        serverUrl = `${parsed.protocol}//${parsed.host}`;
        username = parsed.searchParams.get('username') || undefined;
        password = parsed.searchParams.get('password') || undefined;
      } catch {
        // URL parsing failed, continue without extraction
      }

      // Check expiration and categories for M3U/Xtream
      ;[expiration, categories] = await Promise.all([
        checkExpiration(trimmedUrl),
        fetchCategories(trimmedUrl),
      ]);
    }

    if (type === 'MAC_PORTAL') {
      try {
        const parsed = new URL(trimmedUrl);
        portalUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/[0-9A-Fa-f:]+$/, '')}`;
        const macMatch = trimmedUrl.match(/([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}/);
        macAddress = macMatch ? macMatch[0].toUpperCase() : undefined;
      } catch {
        // URL parsing failed
      }
    }

    const description = generateDescription(title, expiration, categories);

    const result: AnalyzeResult = {
      url: trimmedUrl,
      type,
      title,
      description,
      expiration,
      categories,
      serverUrl,
      username,
      password,
      macAddress,
      portalUrl,
    };

    if (type === 'UNKNOWN') {
      result.error = 'Format non reconnu';
    } else if (expiration.status === 'invalid_credentials') {
      result.error = 'Identifiants invalides';
    } else if (expiration.status === 'server_error') {
      result.error = 'Serveur inaccessible';
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return NextResponse.json(
      { error: "Impossible d'analyser l'URL" },
      { status: 500 },
    );
  }
}
