'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/tracker';

/**
 * Client component that initializes analytics tracking.
 * Placed in the root layout to track all page views.
 */
export default function AnalyticsTracker() {
  useEffect(() => {
    // Only track on client side and not on admin pages
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/admin')) return;

    initAnalytics();
  }, []);

  return null;
}
