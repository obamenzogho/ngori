'use client';

import { useState, useEffect } from 'react';
import './AdBlockDetector.css';

interface AdBlockModalProps {
  isChecking: boolean;
  onRecheck: () => void;
  checkCount: number;
}

const BROWSERS: Record<
  string,
  { name: string; steps: string[] }
> = {
  chrome: {
    name: 'Chrome / Brave',
    steps: [
      "Cliquez sur l'icône de votre extension (ex: uBlock, AdBlock) dans la barre d'outils",
      'Cliquez sur le bouton On/Off ou "Désactiver sur ce site"',
      'Rechargez la page',
    ],
  },
  firefox: {
    name: 'Firefox',
    steps: [
      "Cliquez sur l'icône du bloqueur dans la barre d'outils",
      'Sélectionnez "Désactiver pour ce site web"',
      'Rechargez la page',
    ],
  },
  safari: {
    name: 'Safari',
    steps: [
      'Allez dans Safari → Préférences → Extensions',
      'Décochez ou désactivez votre bloqueur de publicités',
      'Rechargez la page',
    ],
  },
  default: {
    name: 'Votre navigateur',
    steps: [
      'Ouvrez les extensions ou modules complémentaires de votre navigateur',
      'Trouvez votre bloqueur de publicités et désactivez-le pour ce site',
      'Rechargez la page après désactivation',
    ],
  },
};

function detectBrowser(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('chrome') || ua.includes('chromium')) return 'chrome';
  return 'default';
}

export default function AdBlockModal({
  isChecking,
  onRecheck,
  checkCount,
}: AdBlockModalProps) {
  const [browser, setBrowser] = useState('default');
  const [hasTriedOnce, setHasTriedOnce] = useState(false);

  useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  useEffect(() => {
    if (checkCount > 1 && isChecking) {
      setHasTriedOnce(true);
    }
  }, [checkCount, isChecking]);

  const handleRecheck = () => {
    setHasTriedOnce(true);
    onRecheck();
  };

  const browserInfo = BROWSERS[browser] || BROWSERS.default;

  return (
    <div
      className="adblock-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adblock-title"
      aria-describedby="adblock-description"
    >
      <div className="adblock-modal">
        {/* Icône */}
        <div className="adblock-icon-wrapper" aria-hidden="true">
          🚫
        </div>

        {/* Titre */}
        <h1 className="adblock-title" id="adblock-title">
          Bloqueur de publicités détecté
        </h1>

        {/* Description */}
        <p className="adblock-subtitle" id="adblock-description">
          Notre site est <strong>100% gratuit</strong> grâce aux revenus
          publicitaires. Nous avons détecté un bloqueur de publicités actif sur
          votre navigateur. Merci de le désactiver pour accéder au contenu.
        </p>

        {/* Message d'erreur si ça ne marche pas */}
        {hasTriedOnce && !isChecking && (
          <div className="adblock-error-alert" role="alert">
            ⚠️ Le bloqueur est toujours actif. Assurez-vous de l'avoir bien
            désactivé pour <strong>{window.location.hostname}</strong>, puis
            rechargez la page.
          </div>
        )}

        {/* Étapes */}
        <div className="adblock-steps">
          <p className="adblock-steps-title">
            Comment désactiver sur {browserInfo.name}
          </p>
          <ol className="adblock-steps-list">
            {browserInfo.steps.map((step, index) => (
              <li key={index}>
                <span className="step-number" aria-hidden="true">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Bouton principal */}
        <button
          className={`adblock-btn-primary ${isChecking ? 'checking' : ''}`}
          onClick={handleRecheck}
          disabled={isChecking}
          aria-live="polite"
          aria-busy={isChecking}
        >
          {isChecking ? (
            <>
              <span className="adblock-spinner" aria-hidden="true" />
              Vérification en cours…
            </>
          ) : (
            <>✅ J'ai désactivé mon bloqueur — Vérifier</>
          )}
        </button>

        {/* Bouton rechargement forcé */}
        <button
          className="adblock-btn-reload"
          onClick={() => window.location.reload()}
        >
          Ou rechargez la page manuellement
        </button>

        {/* Footer */}
        <p className="adblock-footer">
          Nous ne diffusons pas de publicités intrusives. Vos données restent
          privées.{' '}
          <a href="/privacy" onClick={(e) => e.stopPropagation()}>
            Politique de confidentialité
          </a>
        </p>
      </div>
    </div>
  );
}
