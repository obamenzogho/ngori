/**
 * Génère un lien Linkvertise monétisé pour une URL donnée.
 *
 * @param originalUrl - L'URL de destination finale que l'utilisateur veut atteindre.
 * @returns Le lien monétisé Linkvertise.
 */
export function monetizeLink(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  
  // Utilise le User ID fourni ou le fallback par défaut
  const userId = process.env.LINKVERTISE_USER_ID || '5212891';
  
  try {
    const encoded = encodeURIComponent(originalUrl);
    return `https://linkvertise.com/${userId}/link?o=${encoded}`;
  } catch (error) {
    console.error('Erreur lors de la monétisation du lien :', error);
    return originalUrl; // Fallback au lien original en cas d'erreur
  }
}
