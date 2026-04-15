'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { IconShieldOff } from './icons';

/**
 * Detects ad blockers by creating a bait element that ad blockers typically hide.
 * Returns true if an ad blocker is detected.
 */
function detectAdBlock(): Promise<boolean> {
  return new Promise((resolve) => {
    // Strategy 1: Create a bait element that ad blockers hide
    const bait = document.createElement('div');
    bait.id = 'ad-banner';
    bait.className = 'ad-placement ad_banner adbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads ad-text';
    bait.style.cssText = 'position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;';
    bait.innerHTML = '&nbsp;';
    document.body.appendChild(bait);

    // Strategy 2: Create a fake script that ad blockers block
    const fakeScript = document.createElement('script');
    fakeScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    fakeScript.async = true;

    let scriptBlocked = false;
    fakeScript.onerror = () => {
      scriptBlocked = true;
    };

    document.body.appendChild(fakeScript);

    // Check after a short delay
    setTimeout(() => {
      const baitHidden =
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetLeft < 0 ||
        bait.offsetTop < 0 ||
        bait.clientWidth === 0 ||
        bait.clientHeight === 0 ||
        getComputedStyle(bait).display === 'none' ||
        getComputedStyle(bait).visibility === 'hidden' ||
        getComputedStyle(bait).opacity === '0';

      // Clean up
      bait.remove();
      fakeScript.remove();

      resolve(baitHidden || scriptBlocked);
    }, 500);
  });
}

export default function AdBlockDetector() {
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const pathname = usePathname();

  // Don't run on admin pages
  const isAdmin = pathname.startsWith('/admin');

  const check = useCallback(async () => {
    setChecking(true);
    setError(false);
    try {
      const isBlocked = await detectAdBlock();
      setBlocked(isBlocked);
      if (!isBlocked) {
        setError(false);
      }
    } catch {
      setBlocked(true);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    // Run detection after a short delay to allow scripts to load
    const timer = setTimeout(check, 1500);
    return () => clearTimeout(timer);
  }, [isAdmin, check, pathname]);

  const handleRetry = async () => {
    await check();
    if (blocked) {
      setError(true);
    }
  };

  // Don't render anything on admin pages or if no blocker detected
  if (isAdmin || !blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a1a2e]/95 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl animate-fade-in">
        {/* Icon */}
        <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <IconShieldOff size={32} className="text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-center text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
          Bloqueur de publicités détecté
        </h2>

        {/* Message */}
        <p className="text-center text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
          Ngori est un site gratuit financé par la publicité. En bloquant les annonces, vous empêchez le site de continuer à exister et à proposer du contenu gratuitement.
        </p>

        {/* Instructions */}
        <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-4 sm:p-5 mb-6">
          <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3">
            Comment désactiver votre bloqueur :
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#4169E1] text-white text-[10px] font-bold flex items-center justify-center">1</span>
              <span><strong>uBlock Origin :</strong> Cliquez sur l'icône → Désactivez pour ce site</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#4169E1] text-white text-[10px] font-bold flex items-center justify-center">2</span>
              <span><strong>AdBlock Plus :</strong> Cliquez sur l'icône → Désactiver sur ce site</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#4169E1] text-white text-[10px] font-bold flex items-center justify-center">3</span>
              <span><strong>Brave :</strong> Cliquez sur le bouclier → Désactivez les bloqueurs</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#4169E1] text-white text-[10px] font-bold flex items-center justify-center">4</span>
              <span><strong>Chrome/Safari :</strong> Paramètres → Extensions → Désactivez le bloqueur</span>
            </li>
          </ul>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center animate-fade-in">
            Le bloqueur est toujours actif. Veuillez le désactiver puis réessayer.
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleRetry}
          disabled={checking}
          className="w-full rounded-xl bg-[#4169E1] px-6 py-3.5 text-sm sm:text-base font-semibold text-white transition-all hover:bg-[#3457c7] active:scale-[0.98] shadow-md shadow-[#4169E1]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? 'Vérification en cours…' : "J'ai désactivé mon bloqueur"}
        </button>
      </div>
    </div>
  );
}
