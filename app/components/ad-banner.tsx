'use client';

import Script from 'next/script';
import { memo } from 'react';

type AdBannerVariant = 'adsterra-footer';

interface AdBannerProps {
  variant: AdBannerVariant;
  className?: string;
}

/**
 * AdBanner — Bannière Adsterra 728x90 (iframe standard, aucune redirection).
 * React.memo empêche les re-renders de détruire l'iframe injectée par Adsterra.
 */
const AdBanner = memo(function AdBanner({ variant, className = '' }: AdBannerProps) {
  switch (variant) {
    case 'adsterra-footer':
      return (
        <div className={`mb-6 sm:mb-8 w-full flex justify-center overflow-hidden ${className}`}>
          {/* L'iframe Adsterra sera injectée ici par invoke.js */}
          <div
            id="adsterra-banner-728x90"
            style={{
              minHeight: '90px',
              width: '728px',
              maxWidth: '100%',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* ── Adsterra Banner 728x90 ─────────────────────────────────
                Format : iframe standard, aucune redirection.
                atOptions doit être défini AVANT invoke.js. */}
            <Script
              id="adsterra-banner-options"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.atOptions = {
                    'key' : '3c1573cf88699be69e51c3767ebdd818',
                    'format' : 'iframe',
                    'height' : 90,
                    'width' : 728,
                    'params' : {}
                  };
                `,
              }}
            />
            <Script
              id="adsterra-banner-invoke"
              strategy="afterInteractive"
              src="https://www.highperformanceformat.com/3c1573cf88699be69e51c3767ebdd818/invoke.js"
            />
          </div>
        </div>
      );
    default:
      return null;
  }
});

export default AdBanner;
