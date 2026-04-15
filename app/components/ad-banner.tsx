'use client';

import { useEffect, useRef } from 'react';

type AdBannerVariant = 'header' | 'fluid' | 'adsterra-footer' | 'native-footer';

interface AdBannerProps {
  variant: AdBannerVariant;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    _atws?: { _a_: { placementId: number; target: string; id: string }[] };
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
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
        case 'header': {
          // Configure atOptions for the banner — no screen-width condition
          window.atOptions = {
            key: '3c1573cf88699be69e51c3767ebdd818',
            format: 'iframe',
            height: 90,
            width: 728,
            params: {},
          };
          const script = document.createElement('script');
          script.src = 'https://www.highperformanceformat.com/3c1573cf88699be69e51c3767ebdd818/invoke.js';
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          containerRef.current.appendChild(script);
          scriptLoadedRef.current = true;
          break;
        }

        case 'fluid': {
          // Push AdSense for fluid ads
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch {
            // AdSense push failure
          }
          scriptLoadedRef.current = true;
          break;
        }

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

        case 'native-footer': {
          // Load native banner script
          const script = document.createElement('script');
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          script.src = 'https://pl29139985.profitablecpmratenetwork.com/3b8b394af5e5faeda0898b04416b8c81/invoke.js';
          containerRef.current.appendChild(script);
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
        case 'header': {
          if (containerRef.current.querySelector('script[src*="highperformanceformat"]')) return;
          const script = document.createElement('script');
          script.src = 'https://www.highperformanceformat.com/3c1573cf88699be69e51c3767ebdd818/invoke.js';
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          containerRef.current.appendChild(script);
          break;
        }
        case 'fluid': {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch { /* ignore */ }
          break;
        }
        case 'native-footer': {
          if (containerRef.current.querySelector('script[src*="profitablecpmratenetwork"]')) return;
          const script = document.createElement('script');
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          script.src = 'https://pl29139985.profitablecpmratenetwork.com/3b8b394af5e5faeda0898b04416b8c81/invoke.js';
          containerRef.current.appendChild(script);
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
    case 'header':
      return (
        <div ref={containerRef} className={`w-full flex justify-center ${className}`}>
          <div className="w-full mx-auto px-2 sm:px-4">
            <div id="banner-728x90" className="min-h-[50px] sm:min-h-[90px]" />
          </div>
        </div>
      );

    case 'fluid':
      return (
        <div ref={containerRef} className={`my-6 sm:my-8 ${className}`}>
          <div className="mx-auto max-w-4xl px-2 sm:px-4">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%' }}
              data-ad-client="ca-pub-6216012186493058"
              data-ad-slot="1234567892"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      );

    case 'adsterra-footer':
      return (
        <div ref={containerRef} className={`mb-6 sm:mb-8 text-center ${className}`}>
          <div id="adsterra-home-footer-banner" />
        </div>
      );

    case 'native-footer':
      return (
        <div ref={containerRef} className={`mb-6 sm:mb-8 text-center ${className}`}>
          <div id="container-3b8b394af5e5faeda0898b04416b8c81" />
        </div>
      );
  }
}
