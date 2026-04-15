'use client';

import Link from 'next/link';
import { useState } from 'react';

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
      setNotice({ message: 'Le telechargement de la playlist a commence.', tone: 'success' });
    } catch (error) {
      console.error('Erreur de telechargement:', error);
      setNotice({ message: 'Impossible de telecharger cette playlist.', tone: 'error' });
    }
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(playlist.content);
      setNotice({ message: 'Contenu copie dans le presse-papiers.', tone: 'success' });
    } catch {
      setNotice({ message: 'Impossible de copier le contenu.', tone: 'error' });
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

        {/* Playlist card */}
        <article className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur overflow-hidden">
          {/* Banner with logo */}
          {playlist.logo && (
            <div className="w-full h-48 sm:h-64 md:h-80 relative overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={playlist.logo}
                alt={playlist.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
          )}

          <div className={`p-4 sm:p-6 md:p-8 ${playlist.logo ? '-mt-16 relative z-10' : ''}`}>
            {/* Category badge */}
            {playlist.category && (
              <span className="inline-block mb-3 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200">
                {playlist.category}
              </span>
            )}

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {playlist.title}
            </h2>

            {/* Description */}
            {playlist.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
                {playlist.description}
              </p>
            )}

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Cree le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{formatDate(playlist.createdAt)}</p>
              </div>
              {playlist.updatedAt && (
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Mis a jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{formatDate(playlist.updatedAt)}</p>
                </div>
              )}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Telechargements</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{playlist.downloads ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Lignes M3U</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">{contentLines.length}</p>
              </div>
            </div>

            {/* Content preview */}
            {playlist.content && playlist.content.trim() && (
            <div className="mt-6 sm:mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-slate-200">Apercu du contenu M3U</h3>
                <button
                  onClick={() => void copyContent()}
                  className="rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  Copier
                </button>
              </div>
              <div className="rounded-xl bg-slate-950 border border-slate-700/50 p-3 sm:p-4 overflow-x-auto">
                <pre className="text-[10px] sm:text-xs text-slate-400 font-mono whitespace-pre-wrap break-all">
                  {showFullContent ? playlist.content : previewLines.join('\n')}
                </pre>
                {hasMoreContent && (
                  <button
                    onClick={() => setShowFullContent(!showFullContent)}
                    className="mt-3 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
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
                className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-600/20"
              >
                Telecharger la playlist
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
