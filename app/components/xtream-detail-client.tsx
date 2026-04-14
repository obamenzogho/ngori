'use client';

import Link from 'next/link';
import { useState } from 'react';

type XtreamDetail = {
  _id: string;
  category?: string;
  createdAt?: string;
  description?: string;
  expirationDate?: string;
  password: string;
  serverUrl: string;
  title: string;
  updatedAt?: string;
  username: string;
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

export default function XtreamDetailClient({ xtream }: { xtream: XtreamDetail }) {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);

  const copyAllDetails = async () => {
    const details = [
      `Titre: ${xtream.title}`,
      `Serveur: ${xtream.serverUrl}`,
      `Utilisateur: ${xtream.username}`,
      `Mot de passe: ${xtream.password}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(details);
      setNotice({ message: 'Les informations Xtream ont ete copiees.', tone: 'success' });
    } catch {
      setNotice({ message: 'Impossible de copier les informations.', tone: 'error' });
    }
  };

  const copyField = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({ message: `${label} copie.`, tone: 'success' });
    } catch {
      setNotice({ message: `Impossible de copier ${label}.`, tone: 'error' });
    }
  };

  const isExpired = xtream.expirationDate
    ? new Date(xtream.expirationDate) < new Date()
    : false;

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

        {/* Xtream card */}
        <article className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Category + Status badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {xtream.category && (
                <span className="inline-block rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-200">
                  {xtream.category}
                </span>
              )}
              {xtream.expirationDate && (
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  isExpired
                    ? 'bg-red-500/15 text-red-200'
                    : 'bg-emerald-500/15 text-emerald-200'
                }`}>
                  {isExpired ? 'Expire' : 'Actif'}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {xtream.title}
            </h2>

            {/* Description */}
            {xtream.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
                {xtream.description}
              </p>
            )}

            {/* Connection details */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Informations de connexion</h3>

              {/* Server URL */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Serveur</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-slate-200 break-all">{xtream.serverUrl}</p>
                  </div>
                  <button
                    onClick={() => void copyField('Serveur', xtream.serverUrl)}
                    className="flex-shrink-0 rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    Copier
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Utilisateur</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-slate-200">{xtream.username}</p>
                  </div>
                  <button
                    onClick={() => void copyField('Utilisateur', xtream.username)}
                    className="flex-shrink-0 rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    Copier
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Mot de passe</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-slate-200">
                      {showPassword ? xtream.password : '••••••••'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    >
                      {showPassword ? 'Cacher' : 'Voir'}
                    </button>
                    <button
                      onClick={() => void copyField('Mot de passe', xtream.password)}
                      className="rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Cree le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{formatDate(xtream.createdAt)}</p>
              </div>
              {xtream.updatedAt && (
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Mis a jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{formatDate(xtream.updatedAt)}</p>
                </div>
              )}
              {xtream.expirationDate && (
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Expiration</p>
                  <p className={`mt-1 text-xs sm:text-sm font-medium ${isExpired ? 'text-red-300' : 'text-emerald-300'}`}>
                    {formatDate(xtream.expirationDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => void copyAllDetails()}
                className="flex-1 rounded-xl bg-green-600 px-6 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-green-700 active:scale-[0.98] shadow-lg shadow-green-600/20"
              >
                Copier toutes les informations
              </button>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-slate-700/60 px-6 py-3 text-center text-sm sm:text-base font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
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
