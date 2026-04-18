'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ngori_notif_v2';
const DISMISS_DELAY_MS = 8000;

// Pour réinitialiser lors des tests : localStorage.removeItem('ngori_notif_v2')

type NotifStatus = 'granted' | 'skipped';

function getStoredStatus(): NotifStatus | null {
  try {
    return localStorage.getItem(STORAGE_KEY) as NotifStatus | null;
  } catch {
    return null;
  }
}

function saveStatus(status: NotifStatus) {
  try {
    localStorage.setItem(STORAGE_KEY, status);
  } catch {}
}

export default function NotificationGate() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(DISMISS_DELAY_MS / 1000));
  // 'default' | 'denied' | 'granted'
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>('default');

  const registerSW = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch { /* Silently ignore */ }
  }, []);

  // Étape 1 : montage côté client uniquement
  useEffect(() => {
    setMounted(true);
  }, []);

  // Étape 2 : une fois monté, décider si la modale doit s'afficher
  useEffect(() => {
    if (!mounted) return;
    if (!('Notification' in window)) return; // Navigateur sans support

    const perm = Notification.permission;
    setBrowserPerm(perm);

    // Déjà accordé → enregistrer SW sans modale
    if (perm === 'granted') {
      saveStatus('granted');
      registerSW();
      return;
    }

    // Déjà répondu (skipped) dans ce navigateur → ne plus afficher
    const stored = getStoredStatus();
    if (stored === 'granted') {
      registerSW();
      return;
    }
    if (stored === 'skipped') return;

    // Cas normal (default) OU bloqué (denied → on montre la modale avec instructions)
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [mounted, registerSW]);

  // Compte à rebours pour "Non merci"
  useEffect(() => {
    if (!visible || canDismiss) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanDismiss(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, canDismiss]);

  const handleAllow = useCallback(async () => {
    if (!('Notification' in window)) return;
    // Si déjà bloqué dans le navigateur, on ne peut pas forcer — on ferme juste
    if (Notification.permission === 'denied') {
      saveStatus('skipped');
      setVisible(false);
      return;
    }
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setBrowserPerm(result);
      if (result === 'granted') {
        saveStatus('granted');
        await registerSW();
      } else {
        saveStatus('skipped');
      }
    } catch { /* ignore */ } finally {
      setRequesting(false);
      setVisible(false);
    }
  }, [registerSW]);

  const handleDismiss = useCallback(() => {
    if (!canDismiss) return;
    saveStatus('skipped');
    setVisible(false);
  }, [canDismiss]);

  if (!mounted || !visible) return null;

  const isBrowserDenied = browserPerm === 'denied';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(3, 0, 20, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-gate-title"
    >
      <style>{`
        @keyframes ngFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes ngSlideUp {
          from { opacity:0; transform:translateY(28px) scale(0.95) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        @keyframes ngPulse {
          0%   { transform:scale(1);   opacity:0.6 }
          100% { transform:scale(1.7); opacity:0   }
        }
        @keyframes ngSpin { to { transform:rotate(360deg) } }
        #ng-overlay { animation: ngFadeIn 0.35s ease; }
        #ng-card    { animation: ngSlideUp 0.4s cubic-bezier(0.16,1,0.3,1); }
        .ng-allow {
          width:100%; padding:14px 20px; border-radius:12px; border:none;
          font-size:15px; font-weight:600; cursor:pointer;
          background:linear-gradient(135deg,#8A2BE2,#5E17EB);
          color:#fff; box-shadow:0 4px 24px rgba(138,43,226,0.45);
          transition:all 0.2s ease;
        }
        .ng-allow:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 32px rgba(138,43,226,0.6); }
        .ng-allow:disabled { opacity:0.65; cursor:not-allowed; }
        .ng-dismiss {
          background:none; border:none; font-size:12px;
          padding:8px 16px; border-radius:8px; cursor:pointer;
          transition:color 0.2s;
        }
        .ng-dismiss:disabled { opacity:0.35; cursor:not-allowed; }
        .ng-dismiss:not(:disabled) { cursor:pointer; }
        .ng-spinner {
          display:inline-block; width:16px; height:16px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
          animation:ngSpin 0.8s linear infinite;
        }
      `}</style>

      <div id="ng-overlay" style={{ position:'absolute', inset:0 }} />

      <div id="ng-card" style={{
        position: 'relative',
        background: 'rgba(18, 6, 45, 0.98)',
        border: '1px solid rgba(138,43,226,0.35)',
        borderRadius: '20px',
        padding: '40px 32px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(138,43,226,0.12)',
        textAlign: 'center',
        zIndex: 1,
      }}>
        {/* Icône */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:'24px' }}>
          <div style={{
            position:'absolute', inset:'-10px', borderRadius:'50%',
            border:'2px solid rgba(138,43,226,0.5)',
            animation:'ngPulse 2s ease-out infinite',
          }} />
          <div style={{
            width:'72px', height:'72px', borderRadius:'50%', fontSize:'32px',
            background:'linear-gradient(135deg,rgba(138,43,226,0.25),rgba(94,23,235,0.15))',
            border:'1px solid rgba(138,43,226,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>🔔</div>
        </div>

        {/* Titre */}
        <h2 id="notif-gate-title" style={{ color:'#F8F8FF', fontSize:'20px', fontWeight:'700', marginBottom:'12px', lineHeight:'1.3' }}>
          {isBrowserDenied ? 'Notifications bloquées' : 'Restez informé des nouveaux contenus'}
        </h2>

        {/* Description */}
        {isBrowserDenied ? (
          <div style={{
            background:'rgba(255,100,0,0.1)', border:'1px solid rgba(255,140,0,0.25)',
            borderRadius:'12px', padding:'14px', marginBottom:'24px',
            color:'#FFC080', fontSize:'13px', lineHeight:'1.6',
          }}>
            Vous avez bloqué les notifications manuellement. <br />
            Cliquez sur le <strong>cadenas 🔒</strong> dans la barre d'adresse → <strong>Paramètres du site</strong> → et autorisez les notifications, puis rechargez la page.
          </div>
        ) : (
          <>
            <p style={{ color:'#9BA1B6', fontSize:'14px', lineHeight:'1.6', marginBottom:'8px' }}>
              Soyez le <strong style={{ color:'#C09BFF' }}>premier averti</strong> dès qu'une nouvelle playlist M3U, un accès Xtream ou un portail Mac est ajouté.
            </p>
            <p style={{ color:'#5C5C72', fontSize:'12px', marginBottom:'28px' }}>
              Aucun spam — désactivable à tout moment depuis votre navigateur.
            </p>
          </>
        )}

        {/* Bouton principal */}
        <button
          className="ng-allow"
          onClick={handleAllow}
          disabled={requesting}
          aria-busy={requesting}
        >
          {requesting
            ? <><span className="ng-spinner" style={{ marginRight:'8px' }} />Vérification…</>
            : isBrowserDenied ? '✅ J\'ai réactivé — Fermer' : '🔔 Activer les notifications'}
        </button>

        {/* Bouton Non merci (retardé) */}
        <div style={{ marginTop:'14px' }}>
          <button
            className="ng-dismiss"
            onClick={handleDismiss}
            disabled={!canDismiss}
            style={{ color: canDismiss ? '#646A82' : '#2E2E45' }}
          >
            {canDismiss
              ? 'Non merci, continuer sans notifications'
              : `Continuer sans notifications (${countdown}s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
