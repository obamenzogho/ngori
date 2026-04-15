'use client';

import { usePathname } from 'next/navigation';

/**
 * Injects global ad scripts (Adsterra core, Monetag) only on public pages.
 * Admin pages (/admin/*) are excluded to prevent ads from showing in the dashboard.
 */
export default function AdScripts() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <>
      {/* Adsterra Core */}
      <script
        async
        src="https://cdn.adsterra.com/core.min.js"
        data-api-key="c7a6e431481df2441d81515a7587c294"
        crossOrigin="anonymous"
      />
      {/* Monetag */}
      <script src="https://quge5.com/88/tag.min.js" data-zone="229945" async data-cfasync="false" />
    </>
  );
}
