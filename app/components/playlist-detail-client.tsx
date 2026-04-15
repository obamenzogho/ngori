'use client';

import Link from 'next/link';
import { useState } from 'react';

import Footer from './footer';
import { formatDate } from './format-date';

type PlaylistDetail = {
  _id: string;
  category?: string;
  content: string;
  createdAt?: string;
  description?: string;
  downloads?: number;
  logo?: string;
  title: string;
  updatedAt?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PlaylistDetailClient({ playlist }: { playlist: PlaylistDetail }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);

  const contentLines = playlist.content?.split('\n') || [];
  const previewLines = contentLines.slice(0, 15);
  const hasMoreContent = contentLines.length > 15;

  const downloadPlaylist = () => {
    try {
      const fileName = `${slugify(playlist.title || 'playlist') || 'playlist'}.m3u`;
      const blob = new Blob([playlist.content], { type: 'audio/x-mpegurl;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice({ message: 'Le téléchargement de la playlist a commencé.', tone: 'success' });
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      setNotice({ message: 'Impossible de télécharger cette playlist.', tone: 'error' });
    }
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(playlist.content);
      setNotice({ message: 'Contenu copié dans le presse-papiers.', tone: 'success' });
    } catch {
      setNotice({ message: 'Impossible de copier le contenu.', tone: 'error' });
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

        {/* Playlist card */}
        <article className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden animate-fade-in">
          {/* Banner with logo */}
          {playlist.logo && (
            <div className="w-full h-48 sm:h-64 md:h-80 relative overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={playlist.logo}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>
          )}

          <div className={`p-5 sm:p-6 md:p-8 ${playlist.logo ? '-mt-16 relative z-10' : ''}`}>
            {/* Category badge */}
            {playlist.category && (
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 mb-3">
                {playlist.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] leading-tight">
              {playlist.title}
            </h1>

            {/* Description */}
            {playlist.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
                {playlist.description}
              </p>
            )}

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Créé le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{formatDate(playlist.createdAt)}</p>
              </div>
              {playlist.updatedAt && (
                <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Mis à jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{formatDate(playlist.updatedAt)}</p>
                </div>
              )}
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Téléchargements</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{playlist.downloads ?? 0}</p>
              </div>
              <div className="rounded-xl bg-[#F5F7FF] border border-slate-200/60 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">Lignes M3U</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#1a1a2e]">{contentLines.length}</p>
              </div>
            </div>

            {/* Content preview */}
            {playlist.content && playlist.content.trim() && (
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-[#1a1a2e]">Aperçu du contenu M3U</h3>
                  <button
                    onClick={() => void copyContent()}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-[#1a1a2e]"
                  >
                    Copier
                  </button>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-200/60 p-3 sm:p-4 overflow-x-auto">
                  <pre className="text-[10px] sm:text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
                    {showFullContent ? playlist.content : previewLines.join('\n')}
                  </pre>
                  {hasMoreContent && (
                    <button
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="mt-3 text-xs font-medium text-[#4169E1] hover:text-[#3457c7] transition"
                    >
                      {showFullContent
                        ? 'Afficher moins'
                        : `Afficher tout (${contentLines.length} lignes)`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadPlaylist}
                className="flex-1 rounded-xl bg-[#4169E1] px-6 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-[#3457c7] active:scale-[0.98] shadow-md shadow-[#4169E1]/20"
              >
                Télécharger la playlist
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
