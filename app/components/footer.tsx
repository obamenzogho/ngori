'use client';

import AdBanner from './ad-banner';
import AdScripts from './ad-scripts';

export default function Footer() {
  return (
    <>
      <AdScripts />

      <footer className="mt-auto border-t border-white/[0.06] bg-[#0A0A0F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <AdBanner variant="adsterra-footer" />

          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Ngori" className="h-6 w-auto" />
            </div>
            <p className="text-xs text-[#5C5C72]">
              &copy; {new Date().getFullYear()} Ngori — Partager et découvrir du contenu
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
