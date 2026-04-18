/**
 * Lightweight analytics tracker — client-side
 * Sends events to /api/analytics/track
 */

const SESSION_KEY = 'ngori_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function track(
  eventType: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  try {
    const payload = {
      eventType,
      page: window.location.pathname,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      ...data,
    };

    // Use sendBeacon for reliability, fallback to fetch
    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch {
    // Silently fail — analytics should never break the app
  }
}

// ─── Public API ───

export const trackPageView = (): void => {
  void track('page_view');
};

export const trackClick = (element: string, label?: string): void => {
  void track('click', { element, label });
};

export const trackDownload = (appName: string): void => {
  void track('download', { appName, element: 'btn_download', label: appName });
};

export const trackSearch = (query: string): void => {
  void track('search', { query });
};

export const trackAdClick = (network: 'monetag' | 'adsterra'): void => {
  void track('ad_click', { element: `ad_${network}`, label: network });
};

export const trackAdImpression = (network: 'monetag' | 'adsterra'): void => {
  void track('ad_impression', { element: `ad_${network}_impression`, label: network });
};

// ─── Scroll depth tracking ───

let maxScrollDepth = 0;
let scrollTracked = false;

function calculateScrollDepth(): number {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 100;
  return Math.round((window.scrollY / docHeight) * 100);
}

export function initScrollTracking(): void {
  if (typeof window === 'undefined') return;

  const handleScroll = () => {
    const depth = calculateScrollDepth();
    if (depth > maxScrollDepth) {
      maxScrollDepth = depth;
    }
  };

  const handleBeforeUnload = () => {
    if (scrollTracked) return;
    scrollTracked = true;

    const payload: Record<string, unknown> = {
      scrollDepth: maxScrollDepth,
    };

    // Estimate time on page
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      payload.timeOnPage = Math.round(performance.now() / 1000);
    }

    void track('scroll_depth', payload);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handleBeforeUnload();
    }
  });
}

export const trackAdBlockDetected = (): void => {
  void track('ad_block_detected', { element: 'adblocker', label: 'detected' });
};

// ─── Compat alias (remplacé par usePathname dans AnalyticsTracker) ───
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  trackPageView();
  initScrollTracking();
}
