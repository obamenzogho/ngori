/**
 * Utilitaires de détection de bloqueurs de publicités
 * Utilise plusieurs méthodes combinées pour maximiser la fiabilité
 */

// URLs typiquement bloquées par les adblockers
const AD_URLS = [
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  'https://static.doubleclick.net/instream/ad_status.js',
  'https://ads.pubmatic.com/AdServer/js/pwt/157406/3230/pwt.js',
];

/**
 * Méthode 1 : Tester si un élément appât est caché par l'adblocker
 */
export const detectByBaitElement = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const bait = document.createElement('div');

    // Attributs et classes typiquement bloqués
    bait.setAttribute(
      'class',
      'ad-banner ads adsbox ad-placement doubleclick ad-container',
    );
    bait.setAttribute('id', 'ad-banner-bait');
    bait.setAttribute('data-ad-unit', 'banner');
    bait.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    `;

    document.body.appendChild(bait);

    // Attendre que l'adblocker ait le temps d'agir
    requestAnimationFrame(() => {
      setTimeout(() => {
        const isBlocked =
          bait.offsetHeight === 0 ||
          bait.offsetWidth === 0 ||
          bait.style.display === 'none' ||
          bait.style.visibility === 'hidden' ||
          bait.style.opacity === '0' ||
          !document.body.contains(bait) ||
          window.getComputedStyle(bait).display === 'none' ||
          window.getComputedStyle(bait).visibility === 'hidden';

        // Nettoyage
        if (document.body.contains(bait)) {
          document.body.removeChild(bait);
        }

        resolve(isBlocked);
      }, 150);
    });
  });
};

/**
 * Méthode 2 : Fetch vers des URLs publicitaires connues
 */
export const detectByNetworkRequest = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const url = AD_URLS[Math.floor(Math.random() * AD_URLS.length)];
    const timeout = setTimeout(() => resolve(true), 3000);

    fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    })
      .then(() => {
        clearTimeout(timeout);
        resolve(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        resolve(true);
      });
  });
};

/**
 * Méthode 3 : Injecter un script depuis un domaine publicitaire
 */
export const detectByScriptInjection = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let detected = false;
    const timeout = setTimeout(() => {
      if (!detected) resolve(true);
    }, 2000);

    try {
      const script = document.createElement('script');
      script.src = 'https://static.ads-twitter.com/uwt.js';
      script.onload = () => {
        detected = true;
        clearTimeout(timeout);
        resolve(false);
      };
      script.onerror = () => {
        detected = true;
        clearTimeout(timeout);
        resolve(true);
      };
      document.head.appendChild(script);

      // Nettoyage du script après détection
      setTimeout(() => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      }, 3000);
    } catch {
      clearTimeout(timeout);
      resolve(true);
    }
  });
};

/**
 * Algorithme principal combinant toutes les méthodes
 * Retourne true si un adblocker est détecté
 */
export const detectAdBlock = async (): Promise<boolean> => {
  try {
    const results = await Promise.allSettled([
      detectByBaitElement(),
      detectByNetworkRequest(),
      detectByScriptInjection(),
    ]);

    const detections = results.map((r) =>
      r.status === 'fulfilled' ? r.value : true,
    );

    // Majorité simple : si 2 méthodes sur 3 détectent un blocker
    const detectionCount = detections.filter(Boolean).length;
    return detectionCount >= 2;
  } catch {
    return false; // En cas d'erreur, on ne bloque pas l'utilisateur
  }
};
