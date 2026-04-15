'use client';

import { useEffect, useRef } from 'react';

type AdBannerVariant = 'adsterra-footer';

interface AdBannerProps {
  variant: AdBannerVariant;
  className?: string;
}

declare global {
  interface Window {
    _atws?: { _a_: { placementId: number; target: string; id: string }[] };
  }
}

export default function AdBanner({ variant, className = '' }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || scriptLoadedRef.current) return;

    // Small delay to ensure container is in the DOM
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      switch (variant) {
        case 'adsterra-footer': {
          // Configure Adsterra social bar placement
          if (typeof window._atws !== 'object') {
            window._atws = { _a_: [] };
          }
          window._atws._a_.push({
            placementId: 3248886,
            target: '_blank',
            id: 'adsterra-home-footer-banner',
          });
          scriptLoadedRef.current = true;
          break;
        }
      }
    }, 100);

    // Retry once after 3 seconds in case of slow hydration
    const retryTimer = setTimeout(() => {
      if (scriptLoadedRef.current) return;
      if (!containerRef.current) return;

      switch (variant) {
        case 'adsterra-footer': {
          if (typeof window._atws !== 'object') {
            window._atws = { _a_: [] };
          }
          window._atws._a_.push({
            placementId: 3248886,
            target: '_blank',
            id: 'adsterra-home-footer-banner',
          });
          scriptLoadedRef.current = true;
          break;
        }
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
    };
  }, [variant]);

  switch (variant) {
    case 'adsterra-footer':
      return (
        <div ref={containerRef} className={`mb-6 sm:mb-8 text-center ${className}`}>
          <div id="adsterra-home-footer-banner" />
        </div>
      );
  }
}
