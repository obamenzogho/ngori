'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Injects global ad scripts (AdSense, Adsterra core, Monetag) only on public pages.
 * Admin pages (/admin/*) are excluded to prevent ads from showing in the dashboard.
 */
export default function AdScripts() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin || typeof window === 'undefined') return;

    // Push AdSense once
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not available
    }
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      {/* Google AdSense */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6216012186493058"
      />
      {/* Adsterra Core */}
      <script
        async
        src="https://cdn.adsterra.com/core.min.js"
        data-api-key="c7a6e431481df2441d81515a7587c294"
        crossOrigin="anonymous"
      />
      {/* Adsterra Native Banner */}
      <script src="https://pl29139984.profitablecpmratenetwork.com/f1/46/2a/f1462a426ab63b1de2664d62bd5160c7.js" />
      {/* Monetag */}
      <script src="https://quge5.com/88/tag.min.js" data-zone="229945" async data-cfasync="false" />
    </>
  );
}
