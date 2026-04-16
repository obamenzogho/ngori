'use client';

import Link from 'next/link';
import { useState } from 'react';

import Footer from './footer';
import { formatDate } from './format-date';
import { IconArrowLeft, IconCopy, IconEye, IconEyeOff } from './icons';

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
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#8B8B9E] transition hover:bg-white/[0.04] hover:text-[#E8E8ED]"
            >
              <IconArrowLeft size={16} />
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#5E6AD2] flex items-center justify-center">
                <span className="text-white font-bold text-[9px]">N</span>
              </div>
              <span className="font-semibold text-sm text-[#E8E8ED]">Ngori</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Notice */}
        {notice && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium animate-fade-in ${
              notice.tone === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Xtream card */}
        <article className="rounded-xl border border-white/[0.06] bg-[#111118] overflow-hidden animate-fade-in">
          <div className="p-5 sm:p-6 md:p-8">
            {/* Category + Status badges */}
            {(xtream.category || xtream.expirationDate) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {xtream.category && (
                  <span className="inline-flex rounded-md bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                    {xtream.category}
                  </span>
                )}
                {xtream.expirationDate && (
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                    isExpired
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {isExpired ? 'Expiré' : 'Actif'}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E8E8ED] leading-tight">
              {xtream.title}
            </h1>

            {/* Description */}
            {xtream.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[#8B8B9E] leading-relaxed">
                {xtream.description}
              </p>
            )}

            {/* Connection details */}
            <div className="mt-6 space-y-3">
              <h3 className="text-[11px] font-medium text-[#5C5C72] uppercase tracking-wider">Informations de connexion</h3>

              {/* Server URL */}
              <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Serveur</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-[#E8E8ED] break-all">{xtream.serverUrl}</p>
                  </div>
                  <button
                    onClick={() => void copyField('Serveur', xtream.serverUrl)}
                    className="flex-shrink-0 inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-[#8B8B9E] transition hover:bg-white/[0.08] hover:text-[#E8E8ED]"
                  >
                    <IconCopy size={13} />
                    Copier
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Utilisateur</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-[#E8E8ED]">{xtream.username}</p>
                  </div>
                  <button
                    onClick={() => void copyField('Utilisateur', xtream.username)}
                    className="flex-shrink-0 inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-[#8B8B9E] transition hover:bg-white/[0.08] hover:text-[#E8E8ED]"
                  >
                    <IconCopy size={13} />
                    Copier
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Mot de passe</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-[#E8E8ED]">
                      {showPassword ? xtream.password : '••••••••'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-[#8B8B9E] transition hover:bg-white/[0.08] hover:text-[#E8E8ED]"
                    >
                      {showPassword ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                      {showPassword ? 'Cacher' : 'Voir'}
                    </button>
                    <button
                      onClick={() => void copyField('Mot de passe', xtream.password)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-[#8B8B9E] transition hover:bg-white/[0.08] hover:text-[#E8E8ED]"
                    >
                      <IconCopy size={13} />
                      Copier
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Créé le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#E8E8ED]">{formatDate(xtream.createdAt)}</p>
              </div>
              {xtream.updatedAt && (
                <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Mis à jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#E8E8ED]">{formatDate(xtream.updatedAt)}</p>
                </div>
              )}
              {xtream.expirationDate && (
                <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Expiration</p>
                  <p className={`mt-1 text-xs sm:text-sm font-medium ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatDate(xtream.expirationDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => void copyAllDetails()}
                className="inline-flex items-center justify-center gap-2 flex-1 rounded-lg bg-[#5E6AD2] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#7C6BF7] active:scale-[0.98]"
              >
                <IconCopy size={16} />
                Copier toutes les informations
              </button>
              <Link
                href="/"
                className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-6 py-3 text-center text-sm font-medium text-[#8B8B9E] transition hover:bg-white/[0.08] hover:text-[#E8E8ED]"
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
