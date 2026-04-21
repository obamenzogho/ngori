"use client";

import { useState } from 'react';
import { Download, Smartphone, Star, StarHalf, Box, Info, ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Breadcrumbs from './ui/Breadcrumbs';
import { stripHtml } from '@/lib/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { trackClick } from '@/lib/tracker';
import { cn } from '@/lib/utils';

type AppDetail = {
  _id: string;
  name: string;
  description?: string;
  downloadUrl: string;
  icon?: string;
  rating?: string;
  version?: string;
  fileSize?: string;
  category?: string;
  createdAt?: string;
  source?: string;
};

const StarRating = ({ rating }: { rating: string | number }) => {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(numRating)) return null;

  const fullStars = Math.floor(numRating);
  const hasHalfStar = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={16} className="fill-[#FACC15] text-[#FACC15]" />
      ))}
      {hasHalfStar && <StarHalf size={16} className="fill-[#FACC15] text-[#FACC15]" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={16} className="text-foreground-muted" />
      ))}
      <span className="text-sm font-medium text-foreground ml-2">{numRating}</span>
    </div>
  );
};

export default function AppDetailClient({ app }: { app: AppDetail }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cleanDescription = stripHtml(app.description || '');
  const needsExpansion = cleanDescription.length > 300;
  const displayedDescription = isExpanded ? cleanDescription : cleanDescription.slice(0, 300) + (needsExpansion ? '...' : '');

  const handleDownload = () => {
    trackClick('app_download_detail', app.name);
    toast.success('Redirection vers le téléchargement...');
    
    setTimeout(() => {
      window.open(app.downloadUrl, '_blank', 'noopener,noreferrer');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={[{ label: 'Applications', href: '/#apps' }, { label: app.name }]} />

      <div className="space-y-12">
        {/* HEADER SECTION (Style Google Play) */}
        <div className="flex flex-col md:flex-row gap-8 md:items-center">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-surface border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xl shadow-primary/10">
            {app.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <Smartphone size={60} className="text-foreground-muted" />
            )}
          </div>
          
          <div className="flex-grow space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{app.name}</h1>
              <p className="text-primary font-medium">{app.source === 'manual' ? 'Équipe Ngori' : (app.source || 'APK Original')}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <StarRating rating={app.rating || '4.5'} />
              <div className="h-4 w-px bg-white/10" />
              <span className="text-sm text-foreground-secondary">Gratuit</span>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={handleDownload}
                className="linear-btn linear-btn-primary py-3 px-10 text-sm font-bold rounded-full transition-transform active:scale-95"
              >
                Installer
              </button>
            </div>
          </div>
        </div>

        {/* INFO BADGES */}
        <div className="flex overflow-x-auto gap-8 py-6 border-b border-white/5 scrollbar-hide">
          <div className="flex flex-col items-center gap-1 min-w-[80px] text-center">
            <span className="text-xs text-foreground-muted font-medium">Note</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-white">{app.rating || '4.5'}</span>
              <Star size={12} className="fill-white text-white" />
            </div>
          </div>
          <div className="w-px h-10 bg-white/5 self-center" />
          <div className="flex flex-col items-center gap-1 min-w-[80px] text-center">
            <span className="text-xs text-foreground-muted font-medium">Taille</span>
            <span className="font-bold text-white">{app.fileSize && app.fileSize !== 'N/A' ? app.fileSize : '—'}</span>
          </div>
          <div className="w-px h-10 bg-white/5 self-center" />
          <div className="flex flex-col items-center gap-1 min-w-[80px] text-center">
            <span className="text-xs text-foreground-muted font-medium">Catégorie</span>
            <span className="font-bold text-white truncate max-w-[120px]">{app.category || 'App'}</span>
          </div>
          <div className="w-px h-10 bg-white/5 self-center" />
          <div className="flex flex-col items-center gap-1 min-w-[80px] text-center">
            <span className="text-xs text-foreground-muted font-medium">Version</span>
            <span className="font-bold text-white">{app.version || 'Dernière'}</span>
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">À propos de cette application</h3>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/5 rounded-full text-foreground-secondary transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          <div className="relative">
            <p className={cn(
              "text-foreground-secondary leading-relaxed text-base transition-all duration-300",
              !isExpanded && "line-clamp-4 md:line-clamp-none"
            )}>
              {cleanDescription || "Aucune description détaillée disponible pour cette application."}
            </p>
            
            {needsExpansion && !isExpanded && (
              <div className="md:hidden absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>

          {needsExpansion && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary font-bold text-sm hover:underline mt-2 flex items-center gap-1"
            >
              {isExpanded ? "Moins d'infos" : "Lire la suite"}
            </button>
          )}
        </div>

        {/* TECHNICAL DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="linear-card p-6 border-white/5">
            <h4 className="font-bold mb-4 text-white">Informations</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-muted">Version</span>
                <span className="text-white">{app.version || 'Dernière'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-muted">Mis à jour le</span>
                <span className="text-white">{stripHtml(app.createdAt || '').split('T')[0] || 'Récemment'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-foreground-muted">Taille</span>
                <span className="text-white">{app.fileSize || 'Variable'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-foreground-muted">Système</span>
                <span className="text-white">Android</span>
              </div>
            </div>
          </div>

          <div className="linear-card p-6 border-white/5 bg-success/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                <Info size={20} />
              </div>
              <h4 className="font-bold text-white">Sécurité vérifiée</h4>
            </div>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              Cette application a été scannée et vérifiée par l'équipe Ngori. Elle ne contient aucune publicité intrusive ni logiciel malveillant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
