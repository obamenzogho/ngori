import { useState, useEffect, useCallback, useRef } from 'react';
import { detectAdBlock } from '@/lib/adBlockDetection';

const STORAGE_KEY = 'adblock_check_timestamp';
const RECHECK_INTERVAL = 30 * 1000; // Re-vérifier toutes les 30 secondes
const INITIAL_DELAY = 1500; // Délai avant première vérification (ms)

export function useAdBlockDetector() {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [checkCount, setCheckCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const runDetection = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const detected = await detectAdBlock();

      if (!isMountedRef.current) return;

      setIsAdBlockDetected(detected);
      setIsChecking(false);
      setCheckCount((prev) => prev + 1);

      // Stocker le timestamp de la dernière vérification
      sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  }, []);

  // Vérification initiale avec délai
  useEffect(() => {
    isMountedRef.current = true;

    const initialTimer = setTimeout(() => {
      runDetection();
    }, INITIAL_DELAY);

    // Re-vérification périodique (l'utilisateur pourrait activer son blocker après)
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        runDetection();
      }
    }, RECHECK_INTERVAL);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runDetection]);

  // Forcer une nouvelle vérification (appelé après que l'utilisateur dit avoir désactivé son blocker)
  const recheckNow = useCallback(() => {
    setIsChecking(true);
    setTimeout(() => {
      runDetection();
    }, 1000);
  }, [runDetection]);

  return {
    isAdBlockDetected,
    isChecking,
    checkCount,
    recheckNow,
  };
}
