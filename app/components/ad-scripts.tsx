'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * AdScripts — injecte les scripts publicitaires sur toutes les pages publiques.
 *
 * Formats intégrés :
 *  1. Adsterra Popunder  — ouvre un onglet en arrière-plan au 1er clic (non-intrusif pour la page principale)
 *  2. Adsterra Social Bar — barre flottante non-invasive en bas de page
 *  3. Monetag Service Worker — push notifications via sw.js
 *
 * Pages /admin/* exclues.
 */
export default function AdScripts() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // Enregistrement du Service Worker Monetag (push notifications)
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        // Silently fail — ad block ou browser restreint
      });
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      {/* ── Adsterra Popunder ─────────────────────────────────────────
          Ouvre un nouvel onglet en arrière-plan au 1er clic de l'utilisateur.
          N'affecte PAS la navigation de la page principale. */}
      <Script
        id="adsterra-popunder"
        strategy="afterInteractive"
        src="https://pl29139984.profitablecpmratenetwork.com/f1/46/2a/f1462a426ab63b1de2664d62bd5160c7.js"
      />

      {/* ── Adsterra Social Bar ────────────────────────────────────────
          Barre flottante (sticky bottom), non-invasive, aucune redirection. */}
      <Script
        id="adsterra-social-bar"
        strategy="afterInteractive"
        src="https://pl29139986.profitablecpmratenetwork.com/96/ab/cb/96abcbc0075410d8a7da377e2f9c9d98.js"
      />

      {/* ── Monetag In-Page Push ───────────────────────────────────────
          Notification flottante DANS la page (non-redirect, non-invasive).
          Zone 10894762 — le script crée dynamiquement son propre tag. */}
      <Script
        id="monetag-inpage-push"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10894762',s.src='https://nap5k.com/tag.min.js'})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />
    </>
  );
}
