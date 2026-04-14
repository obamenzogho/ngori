'use client';

import Link from 'next/link';
import { useState } from 'react';

type MacPortalDetail = {
  _id: string;
  category?: string;
  createdAt?: string;
  description?: string;
  logo?: string;
  macAddress?: string;
  macIdentifier?: string;
  portalUrl: string;
  title: string;
  updatedAt?: string;
};

function formatDate(value?: string) {
  if (!value) return 'Date inconnue';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';

  const months = [
    'janv.', 'fevr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.',
  ];

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} a ${hours}:${minutes} UTC`;
}

export default function MacPortalDetailClient({ portal }: { portal: MacPortalDetail }) {
  const [notice, setNotice] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);

  const copyField = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({ message: `${label} copie.`, tone: 'success' });
    } catch {
      setNotice({ message: `Impossible de copier ${label}.`, tone: 'error' });
    }
  };

  const copyAllDetails = async () => {
    const details = [
      `Titre: ${portal.title}`,
      `URL du portail: ${portal.portalUrl}`,
      portal.macAddress ? `Adresse MAC: ${portal.macAddress}` : '',
      portal.macIdentifier ? `Identifiant: ${portal.macIdentifier}` : '',
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(details);
      setNotice({ message: 'Les informations du portail ont ete copiees.', tone: 'success' });
    } catch {
      setNotice({ message: 'Impossible de copier les informations.', tone: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Retour
            </Link>
            <div className="flex-shrink-0">
              <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-xl sm:text-2xl font-bold text-transparent select-none">
                Ngori
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Notice */}
        {notice && (
          <div
            className={`mb-4 sm:mb-6 rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
              notice.tone === 'success'
                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100'
                : 'border-red-500/60 bg-red-500/10 text-red-100'
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Portal card */}
        <article className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur overflow-hidden">
          {/* Banner with logo */}
          {portal.logo && (
            <div className="w-full h-48 sm:h-64 md:h-80 relative overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portal.logo}
                alt={portal.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
          )}

          <div className={`p-4 sm:p-6 md:p-8 ${portal.logo ? '-mt-16 relative z-10' : ''}`}>
            {/* Category badge */}
            {portal.category && (
              <span className="inline-block mb-3 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200">
                {portal.category}
              </span>
            )}

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {portal.title}
            </h2>

            {/* Description */}
            {portal.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
                {portal.description}
              </p>
            )}

            {/* Connection details */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Informations du portail</h3>

              {/* Portal URL */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">URL du portail</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-slate-200 break-all">{portal.portalUrl}</p>
                  </div>
                  <button
                    onClick={() => void copyField('URL du portail', portal.portalUrl)}
                    className="flex-shrink-0 rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    Copier
                  </button>
                </div>
              </div>

              {/* MAC Address */}
              {portal.macAddress && (
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Adresse MAC</p>
                      <p className="mt-1 text-xs sm:text-sm font-mono text-cyan-300">{portal.macAddress}</p>
                    </div>
                    <button
                      onClick={() => void copyField('Adresse MAC', portal.macAddress!)}
                      className="flex-shrink-0 rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              )}

              {/* MAC Identifier */}
              {portal.macIdentifier && (
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Identifiant</p>
                      <p className="mt-1 text-xs sm:text-sm font-mono text-cyan-300">{portal.macIdentifier}</p>
                    </div>
                    <button
                      onClick={() => void copyField('Identifiant', portal.macIdentifier!)}
                      className="flex-shrink-0 rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Cree le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{formatDate(portal.createdAt)}</p>
              </div>
              {portal.updatedAt && (
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Mis a jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{formatDate(portal.updatedAt)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={portal.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-orange-600 px-6 py-3 text-center text-sm sm:text-base font-semibold text-white transition hover:bg-orange-700 active:scale-[0.98] shadow-lg shadow-orange-600/20"
              >
                Ouvrir le portail
              </a>
              <button
                onClick={() => void copyAllDetails()}
                className="flex-1 rounded-xl bg-slate-700/60 px-6 py-3 text-sm sm:text-base font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Copier les informations
              </button>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-slate-800 px-6 py-3 text-center text-sm sm:text-base font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Retour a l accueil
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-10 md:mt-16 border-t border-slate-700 bg-slate-900/95">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-xs sm:text-sm text-slate-400">
            <p>&copy; 2026 Ngori - Partager et decouvrir du contenu</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
