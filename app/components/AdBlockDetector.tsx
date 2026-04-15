'use client';

import { useEffect, useRef } from 'react';
import { useAdBlockDetector } from '@/hooks/useAdBlockDetector';
import AdBlockModal from './AdBlockModal';
import FakeAd from './FakeAd';

interface AdBlockDetectorProps {
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Composant principal de détection
 * Wrappez votre application avec ce composant
 *
 * Usage :
 * <AdBlockDetector>
 *   <App />
 * </AdBlockDetector>
 */
export default function AdBlockDetector({
  children,
  disabled = false,
}: AdBlockDetectorProps) {
  const { isAdBlockDetected, isChecking, checkCount, recheckNow } =
    useAdBlockDetector();
  const bodyScrollRef = useRef<string | null>(null);

  // Bloquer le scroll du body quand la modal est visible
  useEffect(() => {
    if (isAdBlockDetected && !disabled) {
      bodyScrollRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = bodyScrollRef.current || '';
    }

    return () => {
      document.body.style.overflow = bodyScrollRef.current || '';
    };
  }, [isAdBlockDetected, disabled]);

  // Si désactivé, on rend juste les enfants
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Élément appât invisible */}
      <FakeAd />

      {/* Contenu de l'application */}
      {children}

      {/* Modal bloquante si adblocker détecté */}
      {isAdBlockDetected && (
        <AdBlockModal
          isChecking={isChecking}
          onRecheck={recheckNow}
          checkCount={checkCount}
        />
      )}
    </>
  );
}
