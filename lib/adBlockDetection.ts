/**
 * Utilitaires de détection de bloqueurs de publicités
 * Implémentation robuste "Enterprise-grade"
 */

export const detectAdBlock = async (): Promise<boolean> => {
  // En environnement SSR, on ne peut pas détecter
  if (typeof window === 'undefined') return false;

  const runDetection = async (): Promise<boolean> => {
    // 1. Détection Réseau (Network-level blocking, e.g. Pi-hole, UBlock Origin strict)
    // On requête un script publicitaire très connu.
    // L'option no-cors permet d'éviter les erreurs CORS légitimes. Un bloqueur fera échouer la requête (TypeError).
    const networkCheck = new Promise<boolean>((resolve) => {
      fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      })
        .then(() => resolve(false))
        .catch(() => resolve(true)); // Requête interceptée / bloquée
    });

    // 2. Détection DOM (DOM-level blocking, e.g. AdBlock Plus, UBlock cosmétique)
    // On injecte un élément 'appât' avec des classes ultra ciblées.
    const domCheck = new Promise<boolean>((resolve) => {
      requestAnimationFrame(() => {
        const bait = document.createElement('div');
        // Classes listées dans EasyList
        bait.className = 'adsbox ad-placement doubleclick ad-banner bottomAd pub_300x250';
        bait.setAttribute('aria-hidden', 'true');
        bait.style.position = 'absolute';
        bait.style.top = '-9999px';
        bait.style.left = '-9999px';
        bait.style.width = '10px';
        bait.style.height = '10px';
        
        document.body.appendChild(bait);
        
        // Délai court pour laisser l'extension injecter ses régles CSS (display: none!important)
        setTimeout(() => {
          if (!document.body.contains(bait)) {
             resolve(true); // Élément supprimé paritairement par l'extension
             return;
          }
          
          const styles = window.getComputedStyle(bait);
          const isBlocked = 
            styles.display === 'none' || 
            styles.visibility === 'hidden' || 
            bait.offsetHeight === 0 || 
            bait.offsetWidth === 0;
            
          bait.remove();
          resolve(isBlocked);
        }, 150);
      });
    });

    // Timeout de sécurité au cas où l'un des contrôles s'éternise
    const timeoutCheck = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000));
    
    // Résolution parallèle
    const [isNetworkBlocked, isDomBlocked] = await Promise.all([
      Promise.race([networkCheck, timeoutCheck]),
      Promise.race([domCheck, timeoutCheck])
    ]);
    
    console.log('[AdBlock Detection]', { isNetworkBlocked, isDomBlocked });
    
    // Il suffit d'une seule détection solide (réseau OU dom) pour affirmer la présence d'un bloqueur
    return isNetworkBlocked || isDomBlocked;
  };

  try {
    return await runDetection();
  } catch {
    return false; // Par défaut, on présume qu'il n'y a pas de bloqueur en cas d'imprévu
  }
};
