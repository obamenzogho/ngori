import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { monetizeLink } from '@/lib/linkvertise';

// google-play-scraper est souvent problématique à importer en ESM/Next.js
const gplayModule = require('google-play-scraper');
const gplay = gplayModule.default || gplayModule;

export async function POST(request: Request) {
  try {
    const isAuthenticated = await getSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { packageId } = await request.json();
    if (!packageId) {
      return NextResponse.json({ error: 'Package ID manquant' }, { status: 400 });
    }

    // Récupère les détails de l'app sur le Play Store français
    const appData = await gplay.app({ appId: packageId, lang: 'fr', country: 'fr' });

    // Construit un lien vers une recherche APK pure en guise de fallback de "téléchargement apk"
    // car le Play Store ne donne pas de lien APK direct.
    // L'utilisateur pourra modifier ce lien de téléchargement s'il veut un APK direct.
    const apkSearchUrl = `https://apkpure.com/fr/search?q=${encodeURIComponent(packageId)}`;

    // Formate les données pour qu'elles correspondent à notre formulaire admin
    const formattedApp = {
      name: appData.title,
      description: appData.summary || appData.description?.substring(0, 150) + '...',
      icon: appData.icon,
      rating: appData.scoreText || (appData.score !== undefined ? String(appData.score) : 'N/A'),
      version: appData.version || '1.0.0',
      fileSize: appData.size || 'Inconnue',
      category: appData.genre || 'Applications',
      packageId: packageId,
      downloadUrl: apkSearchUrl,
      lienMonetise: monetizeLink(apkSearchUrl),
      source: 'google_play',
    };

    return NextResponse.json(formattedApp, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération Play Store :', error);
    return NextResponse.json(
      { error: "Impossible de récupérer les informations depuis le Play Store. Le Package ID est-il correct ?" },
      { status: 500 }
    );
  }
}
