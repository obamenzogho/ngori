'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initScrollTracking, trackPageView } from '@/lib/tracker';

/**
 * AnalyticsTracker — suit chaque changement de route (App Router)
 * et démarre le tracking de scroll/session.
 * Les pages admin sont exclues.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const initializedRef = useRef(false);

  // Tracking de la route courante à chaque navigation
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    // Initialisation au premier rendu
    if (!initializedRef.current) {
      initializedRef.current = true;
      initScrollTracking();
    }

    // Tracker la page vue pour chaque changement de route
    trackPageView();
  }, [pathname]);

  return null;
}
