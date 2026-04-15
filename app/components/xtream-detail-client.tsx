'use client';

import Link from 'next/link';
import { useState } from 'react';

import Footer from './footer';
import { formatDate } from './format-date';

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
      setNotice({ message: 'Les informations Xtream ont été copiées.', tone: 'success' });
    } catch {
      setNotice({ message: 'Impossible de copier les informations.', tone: 'error' });
    }
  };

  const copyField = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({ message: `${label} copié.`, tone: 'success' });
    } catch {
      setNotice({ message: `Impossible de copier ${label}.`, tone: 'error' });
    }
  };

  const isExpired = xtream.expirationDate
    ? new Date(xtream.expirationDate) < new Date()
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FF]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1a1a2e]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[#4169E1] flex items-center justify-center">
                <span className="text-white font-bold text-xs">N</span>
              </div>
              <span className="font-bold text-[#1a1a2e]">Ngori</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Notice */}
        {notice && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in ${
              notice.tone === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Xtream card */}
        <article className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 sm:p-6 md:p-8">
            {/* Category + Status badges */}
            {(xtream.category || xtream.expirationDate) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {xtream.category && (
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    {xtream.category}
                  </span>
                )}
                {xtream.expirationDate && (
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    isExpired
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {isExpired ? 'Expiré' : 'Actif'}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] leading-tight">
              {xtream.title}
            </h1>

            {/* Description */}
            {xtream.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
                {xtream.description}
              </p>
            )}

            {/* Connection details */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#1a1a2e] uppercase tracking-wider">Informations de connexion</h3>

              {/* Server URL */}
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Serveur</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-[#1a1a2e] break-all">{xtream.serverUrl}</p>
                  </div>
                  <button
                    onClick={() => void copyField('Serveur', xtream.serverUrl)}
                    className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
                  >
                    Copier
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Utilisateur</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-[#1a1a2e]">{xtream.username}</p>
                  </div>
                  <button
                    onClick={() => void copyField('Utilisateur', xtream.username)}
                    className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
                  >
                    Copier
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Mot de passe</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-[#1a1a2e]">
                      {showPassword ? xtream.password : '••••••••'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
                    >
                      {showPassword ? 'Cacher' : 'Voir'}
                    </button>
                    <button
                      onClick={() => void copyField('Mot de passe', xtream.password)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Créé le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{formatDate(xtream.createdAt)}</p>
              </div>
              {xtream.updatedAt && (
                <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Mis à jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{formatDate(xtream.updatedAt)}</p>
                </div>
              )}
              {xtream.expirationDate && (
                <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Expiration</p>
                  <p className={`mt-1 text-xs sm:text-sm font-medium ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatDate(xtream.expirationDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => void copyAllDetails()}
                className="flex-1 rounded-xl bg-[#4169E1] px-6 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-[#3457c7] active:scale-[0.98] shadow-md shadow-[#4169E1]/20"
              >
                Copier toutes les informations
              </button>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-slate-100 px-6 py-3 text-center text-sm sm:text-base font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-[#1a1a2e]"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
