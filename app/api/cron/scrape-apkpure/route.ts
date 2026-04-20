import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AppItem from '@/lib/models/AppItem';
import { monetizeLink } from '@/lib/linkvertise';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 secondes max pour le scraping

export async function GET(request: Request) {
  try {
    // Vérification de sécurité CRON
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'ngori_cron_secret_2026_xK9mP3';

    if (authHeader !== `Bearer ${cronSecret}`) {
      // Sécurité désactivée localement si on veut tester directement l'endpoint, ou on require le header.
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const addedApps = [];

    // Puisque APKPure utilise un pare-feu Cloudflare (Anti-bot) sévère qui bloque Axios/Fetch en serveur,
    // Nous utilisons la méthode 100% fiable : Lister les nouveautés via google-play-scraper
    // et recréer les liens de téléchargement APKPure.
    try {
      const gplay = require('google-play-scraper');
      
      // On tire les 15 applications populaires/nouvelles aléatoirement ou selon une catégorie
      const appsList = await gplay.list({
        collection: gplay.collection.TOP_FREE,
        num: 15,
        lang: 'fr',
        country: 'fr'
      });

      for (const appData of appsList) {
        if (!appData.appId) continue;
        
        const packageId = appData.appId;
        
        // Vérifie si l'app existe déjà
        const exists = await AppItem.findOne({ packageId });
        
        if (!exists) {
          // On peut utiliser la "search" URL ou construire une URL directe (difficile sans le titre exact côté APKPure)
          const downloadUrl = `https://apkpure.com/fr/search?q=${encodeURIComponent(packageId)}`;
          
          const newApp = await AppItem.create({
            name: appData.title,
            description: appData.summary || `Application ${appData.title} importée automatiquement.`,
            icon: appData.icon || 'https://via.placeholder.com/150',
            version: 'Dernière', // gplay.list ne donne souvent pas la version exacte, on met 'Dernière'
            rating: appData.scoreText || 'N/A',
            packageId: packageId,
            downloadUrl: downloadUrl,
            lienMonetise: monetizeLink(downloadUrl),
            source: 'google_play', // ou apkpure
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
        error: apiError.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[Cron] Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
