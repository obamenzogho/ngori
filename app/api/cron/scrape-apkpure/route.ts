import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AppItem from '@/lib/models/AppItem';
import { monetizeLink } from '@/lib/linkvertise';

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

    // google-play-scraper est un module ES — on utilise l'import dynamique
    try {
      const gplayModule = await import('google-play-scraper');
      // Selon la version, le module peut être dans .default ou directement
      const gplay = (gplayModule as any).default ?? gplayModule;

      // Récupère le Top 15 des apps gratuites
      const appsList: any[] = await gplay.list({
        collection: 'topselling_free',
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
            rating: appData.scoreText || (appData.score ? String(appData.score) : undefined),
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
