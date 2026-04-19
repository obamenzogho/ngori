'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * AdScripts — injecte les scripts publicitaires sur toutes les pages publiques.
 *
 * Formats intégrés :
 *  1. Adsterra Popunder — script natif qui intercepte le 1er clic et affiche
 *     une vraie publicité dans un nouvel onglet. Les clics suivants sont libres.
 *  2. Adsterra Social Bar — barre flottante non-invasive en bas de page.
 *  3. Monetag In-Page Push — notification flottante dans la page.
 *  4. Monetag Service Worker — push notifications via sw.js.
 *  5. ExoClick — script publicitaire Magsrv.
 *
 * Pages /admin/* exclues.
 */

export default function AdScripts() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // ── Service Worker Monetag (push notifications) ─────────────────────────
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => { /* Silently fail */ });
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      {/* ── Adsterra Popunder ──────────────────────────────────────────
          Script natif Adsterra : intercepte le 1er clic utilisateur,
          ouvre la VRAIE page publicitaire dans un nouvel onglet,
          puis laisse tous les clics suivants passer normalement.
          NE PAS remplacer par window.open() — ce script gère tout seul
          la logique popunder et possède sa propre landing page d'annonce. */}
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
          Zone 10894762 — intégré avec l'attribut data-zone correct. */}
      <Script
        id="monetag-inpage-push"
        strategy="afterInteractive"
        src="https://nap5k.com/tag.min.js"
        data-zone="10894762"
      />

      {/* ── ExoClick Ad Provider ───────────────────────────────────── */}
      <Script
        id="exoclick-ad-provider"
        strategy="afterInteractive"
        src="https://a.magsrv.com/ad-provider.js"
      />
      <ins className="eas6a97888e10" data-zoneid="5905216"></ins>
      <Script
        id="exoclick-ad-serve"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(AdProvider = window.AdProvider || []).push({"serve": {}});`,
        }}
      />
    </>
  );
}
