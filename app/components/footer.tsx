"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background-elevated mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* BRAND */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png?v=3" alt="Ngori" className="h-10 w-auto transition-transform group-hover:scale-105" />
              <span className="text-xl font-bold text-foreground">Ngori</span>
            </Link>
            <p className="text-sm text-foreground-secondary">
              Accédez aux meilleures playlists M3U, connexions Xtream, 
              portails Mac et applications mobiles, centralisés en un seul endroit.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground mb-2">Liens Rapides</h3>
            <Link href="/#m3u" className="text-sm text-foreground-secondary hover:text-primary transition-colors">Playlists M3U</Link>
            <Link href="/#xtream" className="text-sm text-foreground-secondary hover:text-primary transition-colors">Xtream Codes</Link>
            <Link href="/#mac-portal" className="text-sm text-foreground-secondary hover:text-primary transition-colors">Portails Mac</Link>
            <Link href="/#apps" className="text-sm text-foreground-secondary hover:text-primary transition-colors">Applications</Link>
          </div>

          {/* LEGAL */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground mb-2">Légal & Contact</h3>
            <Link href="/about" className="text-sm text-foreground-secondary hover:text-primary transition-colors">À propos</Link>
            <Link href="/contact" className="text-sm text-foreground-secondary hover:text-primary transition-colors">Contactez-nous</Link>
            <Link href="/terms" className="text-sm text-foreground-secondary hover:text-primary transition-colors">CGU</Link>
            <Link href="/privacy" className="text-sm text-foreground-secondary hover:text-primary transition-colors">Politique de confidentialité</Link>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground-muted">
            © {new Date().getFullYear()} Ngori. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
