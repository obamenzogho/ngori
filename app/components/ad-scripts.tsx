'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * AdScripts — injecte les scripts publicitaires sur toutes les pages publiques.
 *
 * Formats intégrés :
 *  1. Click-Intercept Popunder — au 1er clic sur n'importe quel élément interactif,
 *     ouvre l'annonce Adsterra dans un nouvel onglet et bloque l'action réelle.
 *     Tous les clics suivants (sur la même page) passent librement.
 *  2. Adsterra Social Bar — barre flottante non-invasive en bas de page.
 *  3. Monetag In-Page Push — notification flottante dans la page.
 *  4. Monetag Service Worker — push notifications via sw.js.
 *
 * Pages /admin/* exclues.
 */

// URL landing page de la pub Adsterra popunder
const AD_POPUNDER_URL =
  'https://pl29139984.profitablecpmratenetwork.com/f1/46/2a/f1462a426ab63b1de2664d62bd5160c7';

// Éléments interactifs visés (liens, boutons, cartes cliquables, etc.)
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [role="link"], [onclick], label[for]';

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

  // ── Click-Intercept Popunder ─────────────────────────────────────────────
  // Logique : UNE seule pub par chargement de page.
  // - 1er clic : pub ouverte dans un nouvel onglet, action bloquée, flag = true.
  // - Tous les clics suivants : flag = true → on laisse passer librement.
  // Le flag se réinitialise lors d'un changement de route (pathname).
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined') return;

    // Flag : la pub a-t-elle déjà été déclenchée sur cette page ?
    let adAlreadyFired = false;

    const handleClick = (event: MouseEvent) => {
      // Trouver l'élément interactif le plus proche dans la hiérarchie
      const target = (event.target as HTMLElement).closest(
        INTERACTIVE_SELECTOR
      ) as HTMLElement | null;
      if (!target) return;

      // ── Pub déjà déclenchée → laisser passer tous les clics normalement
      if (adAlreadyFired) return;

      // ── 1er clic : ouvrir la pub et bloquer l'action
      event.preventDefault();
      event.stopImmediatePropagation();

      // Tenter d'ouvrir la page pub dans un nouvel onglet
      const adWindow = window.open(AD_POPUNDER_URL, '_blank', 'noopener');

      // Marquer comme déclenché même si le popup est bloqué,
      // pour ne jamais bloquer l'utilisateur indéfiniment.
      adAlreadyFired = true;

      // Sécurité : si le popup est bloqué, l'utilisateur peut quand même continuer
      // (le prochain clic passera normalement grâce au flag).
      void adWindow;
    };

    // Phase capture : on s'exécute AVANT tous les handlers React/Next.js
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  // pathname dans les deps : réinitialise le flag à chaque changement de page
  }, [isAdmin, pathname]);

  if (isAdmin) return null;

  return (
    <>
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
