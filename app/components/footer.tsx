'use client';

import AdBanner from './ad-banner';
import AdBlockDetector from './ad-block-detector';
import AdScripts from './ad-scripts';

export default function Footer() {
  return (
    <>
      {/* Ad scripts — only loaded on public pages (Footer is not used on admin) */}
      <AdScripts />

      {/* Ad block detector — covers entire page if blocker detected */}
      <AdBlockDetector />

      <footer className="mt-auto border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Ad slots */}
          <AdBanner variant="adsterra-footer" />
          <AdBanner variant="native-footer" />

          {/* Footer content */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md bg-[#4169E1] flex items-center justify-center">
                <span className="text-white font-bold text-xs">N</span>
              </div>
              <span className="font-semibold text-[#1a1a2e]">Ngori</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Ngori — Partager et découvrir du contenu
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Propulsé par la plateforme Ngori
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
