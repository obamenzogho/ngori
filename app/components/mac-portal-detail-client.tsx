'use client';

import Link from 'next/link';
import { useState } from 'react';

import Footer from './footer';
import { formatDate } from './format-date';
import { IconArrowLeft, IconCopy, IconExternalLink } from './icons';

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

export default function MacPortalDetailClient({ portal }: { portal: MacPortalDetail }) {
  const [notice, setNotice] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);

  const copyField = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({ message: `${label} copié.`, tone: 'success' });
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
      setNotice({ message: 'Les informations du portail ont été copiées.', tone: 'success' });
    } catch {
      setNotice({ message: 'Impossible de copier les informations.', tone: 'error' });
    }
  };

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
              <IconArrowLeft size={18} />
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

        {/* Portal card */}
        <article className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden animate-fade-in">
          {/* Banner with logo */}
          {portal.logo && (
            <div className="w-full h-48 sm:h-64 md:h-80 relative overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portal.logo}
                alt={portal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>
          )}

          <div className={`p-5 sm:p-6 md:p-8 ${portal.logo ? '-mt-16 relative z-10' : ''}`}>
            {/* Category badge */}
            {portal.category && (
              <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-700 mb-3">
                {portal.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] leading-tight">
              {portal.title}
            </h1>

            {/* Description */}
            {portal.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
                {portal.description}
              </p>
            )}

            {/* Connection details */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#1a1a2e] uppercase tracking-wider">Informations du portail</h3>

              {/* Portal URL */}
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">URL du portail</p>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-[#1a1a2e] break-all">{portal.portalUrl}</p>
                  </div>
                  <button
                    onClick={() => void copyField('URL du portail', portal.portalUrl)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
                  >
                    <IconCopy size={12} />
                    Copier
                  </button>
                </div>
              </div>

              {/* MAC Address */}
              {portal.macAddress && (
                <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Adresse MAC</p>
                      <p className="mt-1 text-xs sm:text-sm font-mono text-[#4169E1]">{portal.macAddress}</p>
                    </div>
                    <button
                      onClick={() => void copyField('Adresse MAC', portal.macAddress!)}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
                    >
                      <IconCopy size={12} />
                      Copier
                    </button>
                  </div>
                </div>
              )}

              {/* MAC Identifier */}
              {portal.macIdentifier && (
                <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Identifiant</p>
                      <p className="mt-1 text-xs sm:text-sm font-mono text-[#4169E1]">{portal.macIdentifier}</p>
                    </div>
                    <button
                      onClick={() => void copyField('Identifiant', portal.macIdentifier!)}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
                    >
                      <IconCopy size={12} />
                      Copier
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Créé le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{formatDate(portal.createdAt)}</p>
              </div>
              {portal.updatedAt && (
                <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Mis à jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{formatDate(portal.updatedAt)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={portal.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#4169E1] px-6 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-[#3457c7] active:scale-[0.98] shadow-md shadow-[#4169E1]/20"
              >
                <IconExternalLink size={16} />
                Ouvrir le portail
              </a>
              <button
                onClick={() => void copyAllDetails()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm sm:text-base font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-[#1a1a2e]"
              >
                <IconCopy size={16} />
                Copier les informations
              </button>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm sm:text-base font-semibold text-slate-600 border border-slate-200 transition hover:bg-slate-50 hover:text-[#1a1a2e]"
              >
                <IconArrowLeft size={16} />
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
