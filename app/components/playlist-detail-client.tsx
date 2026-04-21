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
  content: string;
  createdAt?: string;
  description?: string;
  downloads?: number;
  logo?: string;
  title: string;
  updatedAt?: string;
};

// Simple slugify helper
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function PlaylistDetailClient({ playlist }: { playlist: PlaylistDetail }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isURLRevealed, setIsURLRevealed] = useState(false);
  
  // M3U Parser for stats
  const stats = useMemo(() => {
    const lines = playlist.content?.split('\n') || [];
    let channels = 0;
    let movies = 0;
    let series = 0;
    
    lines.forEach(line => {
      if (line.startsWith('#EXTINF:')) {
        const lowerLine = line.toLowerCase();
        // Simple logic to distinguish types based on common tags
        if (lowerLine.includes('s0') && lowerLine.includes('e0') || lowerLine.includes('s1') || lowerLine.includes('s2')) {
          series++;
        } else if (lowerLine.includes('vod') || lowerLine.includes('movie') || lowerLine.includes('film')) {
          movies++;
        } else {
          channels++;
        }
      }
    });
    
    // If we found nothing but have lines, count them as channels as fallback
    if (channels === 0 && movies === 0 && series === 0 && lines.length > 1) {
      channels = lines.filter(l => l.trim() && !l.startsWith('#')).length;
    }

    return { channels, movies, series };
  }, [playlist.content]);

  const isActive = true;

  const handleCopy = async () => {
    if (!isURLRevealed) {
      setIsURLRevealed(true);
      toast.success('Lien révélé !');
      return;
    }
    try {
      await navigator.clipboard.writeText(playlist.content);
      toast.success('Lien M3U copié !');
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const blob = new Blob([playlist.content], { type: 'text/plain' });
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
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-bold">Live TV</span>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Activity size={14} className="text-success" />
                  <span>{stats.channels}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-bold">Films</span>
                <span className="text-foreground font-medium">{stats.movies > 0 ? stats.movies : '0'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-bold">Séries</span>
                <span className="text-foreground font-medium">{stats.series > 0 ? stats.series : '0'}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {!isURLRevealed && (
                <button 
                  onClick={() => setIsURLRevealed(true)}
                  className="w-full flex items-center justify-center gap-2 linear-btn linear-btn-primary py-4 px-6 text-sm font-bold shadow-lg shadow-primary/20"
                >
                  <Activity size={18} />
                  Révéler le lien M3U
                </button>
              )}

              {isURLRevealed && (
                <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button 
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 linear-btn linear-btn-primary py-3 px-6 text-sm"
                  >
                    <Copy size={18} />
                    Copier le lien M3U
                  </button>
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 linear-btn bg-surface border border-border text-foreground hover:bg-background-elevated py-3 px-6 text-sm transition-all"
                  >
                    <Download size={18} />
                    Télécharger M3U
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="linear-card p-6"
          >
            <h3 className="text-lg font-bold mb-4">Aperçu du contenu</h3>
            {isURLRevealed ? (
              <div className="bg-background rounded-xl p-4 border border-border overflow-x-auto animate-in fade-in duration-500">
                <pre className="text-xs font-mono text-foreground-muted whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">
                  {playlist.content}
                </pre>
              </div>
            ) : (
              <div className="bg-background-elevated/50 rounded-xl p-12 border border-border border-dashed flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-foreground-muted">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary font-medium">Contenu masqué par sécurité</p>
                  <p className="text-xs text-foreground-muted mt-1">Cliquez sur &quot;Révéler le lien&quot; pour afficher le contenu M3U.</p>
                </div>
              </div>
            )}
          </motion.div>
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
