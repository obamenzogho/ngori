import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AppItem from '@/lib/models/AppItem';
import { monetizeLink } from '@/lib/linkvertise';

// google-play-scraper est souvent problématique à importer en ESM/Next.js
// On utilise require pour une compatibilité maximale en environnement Node.js
const gplayModule = require('google-play-scraper');
const gplay = gplayModule.default || gplayModule;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    // Vérification de sécurité CRON
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'ngori_cron_secret_2026_xK9mP3';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const addedApps: string[] = [];

    try {
      // Récupère le Top 15 des apps gratuites
      // On utilise 'TOP_FREE' en dur car gplay.collection peut être instable selon l'import
      const appsList: any[] = await gplay.list({
        collection: 'TOP_FREE',
        num: 15,
        lang: 'fr',
        country: 'fr',
      });

      for (const appData of appsList) {
        if (!appData.appId) continue;

        const packageId: string = appData.appId;

        // Vérifie si l'app existe déjà
        const exists = await AppItem.findOne({ packageId });

        if (!exists) {
          const downloadUrl = `https://apkpure.com/fr/search?q=${encodeURIComponent(packageId)}`;

          const newApp = await AppItem.create({
            name: appData.title,
            description: appData.summary || `Application ${appData.title} importée automatiquement.`,
            icon: appData.icon || '',
            version: appData.version || 'Dernière',
            rating: appData.scoreText || (appData.score !== undefined ? String(appData.score) : 'N/A'),
            packageId,
            downloadUrl,
            lienMonetise: monetizeLink(downloadUrl),
            source: 'google_play',
            isActive: true,
          });
          addedApps.push(newApp.name);
        }
      }

      console.log(`[Cron Apps] Importation terminée, ${addedApps.length} apps ajoutées.`);
      return NextResponse.json({ success: true, added: addedApps });

    } catch (apiError: any) {
      console.error('[Cron Apps] Erreur Scraper :', apiError.message);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de la récupération des données.',
        error: apiError.message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[Cron] Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
