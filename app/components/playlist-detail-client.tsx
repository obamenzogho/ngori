"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Copy, Download, Calendar, Activity, CheckCircle2, XCircle, ArrowLeft, Music } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Breadcrumbs from './ui/Breadcrumbs';
import { formatRelativeDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type PlaylistDetail = {
  _id: string;
  category?: string;
  content?: string; // Opt-in content
  createdAt?: string;
  description?: string;
  downloads?: number;
  logo?: string;
  title: string;
  updatedAt?: string;
  stats: {
    channels: number;
    movies: number;
    series: number;
  };
};

// Simple slugify helper
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function PlaylistDetailClient({ playlist }: { playlist: PlaylistDetail }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedContent, setRevealedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const handleReveal = async () => {
    if (revealedContent) return;
    setIsRevealing(true);
    try {
      const res = await fetch(`/api/playlist/reveal/${playlist._id}`);
      const data = await res.json();
      if (data.url) {
        setRevealedContent(data.url);
      } else {
        toast.error('Erreur lors de la récupération du lien');
      }
    } catch (err) {
      toast.error('Erreur réseau');
    } finally {
      setIsRevealing(false);
    }
  };

  const handleCopy = () => {
    if (!revealedContent) return;
    navigator.clipboard.writeText(revealedContent);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!revealedContent) return;
    setIsDownloading(true);
    try {
      const blob = new Blob([revealedContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slugify(playlist.title)}.m3u`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Téléchargement démarré');
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsDownloading(false);
    }
  };

  const isActive = true;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={[{ label: 'Playlists M3U', href: '/#m3u' }, { label: playlist.title }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="linear-card p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {playlist.category && (
                <span className="linear-badge bg-primary/10 text-primary border-primary/20">
                  {playlist.category}
                </span>
              )}
              <span className={cn(
                "linear-badge flex items-center gap-1.5",
                isActive ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
              )}>
                {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {isActive ? 'Actif' : 'Expiré'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{playlist.title}</h1>
            <p className="text-foreground-secondary text-lg leading-relaxed mb-8">
              {playlist.description || "Accédez à cette playlist M3U mise à jour régulièrement pour vos besoins en streaming."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-bold">Ajouté le</span>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar size={14} className="text-primary" />
                  <span>{formatRelativeDate(playlist.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-bold">Chaînes Live</span>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Activity size={14} className="text-success" />
                  <span>{playlist.stats.channels}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-bold">Films</span>
                <span className="text-foreground font-medium text-sm md:text-base">{playlist.stats.movies > 0 ? playlist.stats.movies : 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-bold">Séries</span>
                <span className="text-foreground font-medium text-sm md:text-base">{playlist.stats.series > 0 ? playlist.stats.series : 'N/A'}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-bold text-foreground">Lien de la playlist</h3>
              
              {revealedContent ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 p-4 bg-background-elevated rounded-xl border border-border group">
                    <span className="flex-1 text-xs md:text-sm font-mono text-foreground-secondary break-all line-clamp-2 md:line-clamp-none">
                      {revealedContent}
                    </span>
                    <button 
                      onClick={handleCopy}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
                      title="Copier le lien"
                    >
                      {copied ? '✓' : <Copy size={18} />}
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex-1 flex items-center justify-center gap-2 linear-btn linear-btn-primary py-3 text-sm font-bold"
                    >
                      <Download size={18} />
                      Télécharger .m3u
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-background-elevated rounded-xl border border-border border-dashed">
                  <span className="text-sm font-mono text-foreground-muted italic">••••••••••••••••••••••••••••••</span>
                  <button 
                    onClick={handleReveal}
                    disabled={isRevealing}
                    className="linear-btn linear-btn-primary px-6 py-2 text-xs font-bold"
                  >
                    {isRevealing ? 'Chargement...' : 'Révéler le lien'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {revealedContent && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="linear-card p-6"
            >
              <h3 className="text-lg font-bold mb-4">Aperçu du contenu</h3>
              <div className="bg-background rounded-xl p-4 border border-border overflow-x-auto">
                <pre className="text-xs font-mono text-foreground-muted whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">
                  {revealedContent}
                </pre>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Visual/Logo */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="linear-card p-4 aspect-square flex items-center justify-center overflow-hidden bg-background-elevated"
          >
            {playlist.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playlist.logo} alt={playlist.title} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-foreground-muted">
                <Music size={80} strokeWidth={1} />
                <span className="text-sm font-medium">Pas de logo</span>
              </div>
            )}
          </motion.div>

          <div className="linear-card p-6">
            <h4 className="font-bold mb-4">Instructions</h4>
            <ul className="space-y-3 text-sm text-foreground-secondary">
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>Utilisez VLC ou IPTV Smarters pour lire ce fichier.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>La playlist est mise à jour automatiquement.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
