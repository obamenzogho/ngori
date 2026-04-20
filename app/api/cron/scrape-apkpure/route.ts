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

    // 1. Scraping APKPure avec axios et cheerio
    try {
      const response = await axios.get('https://apkpure.com/fr/app-update', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // On parcourt les éléments de la liste des mises à jour récentes
      // APKPure utilise souvent des classes comme "title", "img img-error", etc.
      const appCards = $('.app-info, .title, .box-item').toArray(); 

      for (let i = 0; i < Math.min(appCards.length, 10); i++) {
        const elem = $(appCards[i]);
        
        // Extraction par des selecteurs génériques qu'on retrouve sur le site
        const nameNode = elem.find('.title, a.title, h3, .app-title').first();
        const rawName = nameNode.text().trim();
        if (!rawName) continue;

        const href = nameNode.attr('href') || elem.find('a').first().attr('href') || '';
        if (!href.includes('/')) continue;
        
        // Ex: /fr/whatsapp-messenger/com.whatsapp
        const urlParts = href.split('/');
        const packageId = href.includes('.html') ? null : urlParts[urlParts.length - 1];
        
        // Image logo
        let iconUrl = elem.find('img').first().attr('src') || elem.find('img').first().attr('data-src');
        if (iconUrl && iconUrl.startsWith('/')) iconUrl = `https://apkpure.com${iconUrl}`;

        // Version (souvent dans un span 'version' ou 'update')
        const version = elem.find('.version, .update-version').first().text().trim() || '1.0.0';

        // URL de téléchargement cible
        const downloadUrl = `https://apkpure.com${href}`;

        if (packageId && rawName) {
          // Vérifie si le package existe déjà pour éviter les doublons
          const exists = await AppItem.findOne({ packageId });
          
          if (!exists) {
            const newApp = await AppItem.create({
              name: rawName,
              description: `Application ${rawName} fraîchement récupérée depuis APKPure. (${version}).`,
              icon: iconUrl || 'https://via.placeholder.com/150',
              version: version,
              packageId: packageId,
              downloadUrl: downloadUrl,
              lienMonetise: monetizeLink(downloadUrl),
              source: 'apkpure',
              isActive: true,
            });
            addedApps.push(newApp.name);
          }
        }
      }

      console.log(`[Cron APKPure] Scraping terminé, ${addedApps.length} apps ajoutées.`);
      return NextResponse.json({ success: true, added: addedApps });

    } catch (parseError: any) {
      console.warn('[Cron APKPure] Erreur Axios/Scraping :', parseError.message);
      // Fallback: si APKPure bloque le bot (ce qui est très fréquent),
      // nous ne voulons pas planter l'API. On renvoie un succès partiel.
      return NextResponse.json({ 
        success: false, 
        message: 'Blocage Anti-bot APKPure (Cloudflare) ou erreur réseau.', 
        error: parseError.message 
      }, { status: 200 }); // Status 200 pour le cron job
    }

  } catch (error) {
    console.error('[Cron] Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
