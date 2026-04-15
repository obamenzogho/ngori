'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { IconShieldOff } from './icons';

/**
 * Detects ad blockers using two complementary checks that target only
 * Adsterra and Monetag — the two ad networks still in use:
 *
 * 1. **Bait element** — a hidden div with class names that ad blockers
 *    typically target (adsbox, ad-banner). If the blocker hides or
 *    removes it, a blocker is likely active.
 *
 * 2. **Adsterra script presence** — checks whether the Adsterra core
 *    script injected by `<AdScripts />` actually loaded. If the
 *    `<script src="cdn.adsterra.com">` tag is missing from the DOM or
 *    the `_atws` global was never initialised, the script was blocked.
 *
 * A 1.5 s initial delay gives the real Adsterra/Monetag scripts time to
 * load, and a 300 ms secondary delay lets the blocker act on the bait.
 * Returns true only if an ad blocker is genuinely active.
 */
function detectAdBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    // Wait for real Adsterra/Monetag scripts to load first
    setTimeout(() => {
      // ── Check 1: Bait element ──
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox ad-banner';
      testAd.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
      `;
      document.body.appendChild(testAd);

      setTimeout(() => {
        const baitBlocked =
          testAd.offsetHeight === 0 ||
          testAd.offsetWidth === 0 ||
          testAd.style.display === 'none' ||
          testAd.style.visibility === 'hidden' ||
          !document.body.contains(testAd);

        // Clean up bait
        if (document.body.contains(testAd)) {
          document.body.removeChild(testAd);
        }

        // ── Check 2: Adsterra script presence ──
        // Look for the Adsterra core script tag that <AdScripts /> injects.
        // If it's missing from the DOM, the blocker stripped it out.
        const adsterraScript = document.querySelector(
          'script[src*="cdn.adsterra.com"]',
        );
        const adsterraScriptBlocked = !adsterraScript;

        // ── Check 3: Monetag script presence ──
        const monetagScript = document.querySelector(
          'script[src*="quge5.com"]',
        );
        const monetagScriptBlocked = !monetagScript;

        // A blocker is detected if:
        // - The bait element was hidden/removed, OR
        // - Both Adsterra AND Monetag script tags are missing (stripped by blocker)
        const isBlocked =
          baitBlocked || (adsterraScriptBlocked && monetagScriptBlocked);

        resolve(isBlocked);
      }, 300);
    }, 1500);
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
      const isBlocked = await detectAdBlocker();
      setBlocked(isBlocked);
      if (!isBlocked) {
        setError(false);
      }
    } catch {
      // On error, don't assume blocker — safer default
      setBlocked(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    // detectAdBlocker already has a 1500ms internal delay,
    // so we call it directly without an additional setTimeout
    void check();
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
