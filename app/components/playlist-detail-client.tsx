'use client';

import Link from 'next/link';
import { useState } from 'react';

import Footer from './footer';
import { formatDate } from './format-date';
import { IconArrowLeft, IconCopy, IconDownload } from './icons';

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

        {/* Playlist card */}
        <article className="rounded-xl border border-white/[0.06] bg-[#111118] overflow-hidden animate-fade-in">
          {/* Banner with logo */}
          {playlist.logo && (
            <div className="w-full h-48 sm:h-64 md:h-80 relative overflow-hidden bg-[#1A1A24]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={playlist.logo}
                alt={playlist.title}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />
            </div>
          )}

          <div className={`p-5 sm:p-6 md:p-8 ${playlist.logo ? '-mt-16 relative z-10' : ''}`}>
            {/* Category badge */}
            {playlist.category && (
              <span className="inline-flex rounded-md bg-[#5E6AD2]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#8B93E6] mb-3">
                {playlist.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E8E8ED] leading-tight">
              {playlist.title}
            </h1>

            {/* Description */}
            {playlist.description && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[#8B8B9E] leading-relaxed">
                {playlist.description}
              </p>
            )}

            {/* Metadata grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Créé le</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#E8E8ED]">{formatDate(playlist.createdAt)}</p>
              </div>
              {playlist.updatedAt && (
                <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Mis à jour</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#E8E8ED]">{formatDate(playlist.updatedAt)}</p>
                </div>
              )}
              <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Téléchargements</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#E8E8ED]">{playlist.downloads ?? 0}</p>
              </div>
              <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5C5C72] font-medium">Lignes M3U</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#E8E8ED]">{contentLines.length}</p>
              </div>
            </div>

            {/* Content preview */}
            {playlist.content && playlist.content.trim() && (
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[#E8E8ED]">Aperçu du contenu M3U</h3>
                  <button
                    onClick={() => void copyContent()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-[#8B8B9E] transition hover:bg-white/[0.08] hover:text-[#E8E8ED]"
                  >
                    <IconCopy size={13} />
                    Copier
                  </button>
                </div>
                <div className="rounded-lg bg-[#0A0A0F] border border-white/[0.06] p-3 sm:p-4 overflow-x-auto">
                  <pre className="text-[10px] sm:text-xs text-[#8B8B9E] font-mono whitespace-pre-wrap break-all">
                    {showFullContent ? playlist.content : previewLines.join('\n')}
                  </pre>
                  {hasMoreContent && (
                    <button
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="mt-3 text-xs font-medium text-[#5E6AD2] hover:text-[#7C6BF7] transition"
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
                className="inline-flex items-center justify-center gap-2 flex-1 rounded-lg bg-[#5E6AD2] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#7C6BF7] active:scale-[0.98]"
              >
                <IconDownload size={16} />
                Télécharger la playlist
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
